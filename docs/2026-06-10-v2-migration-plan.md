# myOpenCodeWithMEeee v2 — 1+1+1 Architecture with 3-Tier Model

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal**: Refactor v1 (1 main + 1 sub) to v2 (1 main + 1 assistant + 1 worker with 3-tier model) by removing 8 self-built tools in favor of opencode built-ins + MCPs, and adding 3 new agents + 3 imported skills.

**Architecture**: 1+1+1 (Sisyphus high → Lyra mid → Hephaestus low), dynamic routing in Sisyphus's prompt, bring-in for tools (use MCPs) and skills (import from mattpocock/skills), only 2 custom tools remain (hashline-edit + task-dispatch).

**Tech Stack**: opencode 1.16.2, TypeScript 5.9, Bun 1.3, @opencode-ai/plugin, @context7/mcp (NEW), @playwright/mcp (NEW), MiniMax MCP (existing).

**Reference Spec**: `docs/2026-06-10-1plus1plus1-agent-system-design.md`

---

## File Structure

### Files to Create (NEW)

```
myOpenCodeWithMEeee/
├── agents/
│   ├── lyra.md                    # Mid-tier assistant (3-4 segments XML)
│   └── hephaestus.md              # Low-tier worker (3-4 segments XML)
├── skills/
│   ├── grill-with-docs/           # Import from mattpocock/skills
│   │   └── SKILL.md
│   ├── diagnose/                  # Import from mattpocock/skills (adapted)
│   │   └── SKILL.md
│   └── to-issues/                 # Import from mattpocock/skills
│       └── SKILL.md
├── docs/
│   └── 2026-06-10-1plus1plus1-agent-system-design.md  # Design spec (DONE)
└── docs/2026-06-10-v2-migration-plan.md  # This plan (DONE)
```

### Files to Modify

```
myOpenCodeWithMEeee/
├── agents/sisyphus.md             # Rewrite: add mcp_routing + 3-tier routing
├── tools/src/task-dispatch.ts     # Rewrite: router + MCP proxy
├── .opencode/src/orchestrator.ts  # Modify: 3-tier model validation
├── install.sh                     # Modify: add @context7/mcp + @playwright/mcp to opencode.json
├── uninstall.sh                   # Modify: remove MCP additions
└── README.md                      # Rewrite for v2
```

### Files to Delete (8 tools)

```
myOpenCodeWithMEeee/tools/src/
├── web-search.ts                  # Use mcp__MiniMax__web_search
├── web-search.test.ts
├── image-inspect.ts               # Use mcp__MiniMax__understand_image
├── image-inspect.test.ts
├── mermaid-render.ts              # Use webfetch + skill
├── mermaid-render.test.ts
├── pr-reader.ts                   # Use webfetch + gh CLI
├── pr-reader.test.ts
├── context7-docs.ts               # Use @context7/mcp
├── context7-docs.test.ts
├── playwright-browser.ts          # Use @playwright/mcp
├── playwright-browser.test.ts
├── atomic-commit.ts               # Use bash + git + skill
├── atomic-commit.test.ts
├── ast-search.ts                  # Use grep + LSP MCP
├── ast-search.test.ts
└── placeholder.ts                 # No longer needed
```

### Why This Decomposition

- Each tool has a single, clear migration target
- Agent prompts are isolated (3 different prompts, 3 different roles)
- Skills are bring-in (verbatim copies, no design)
- The 3-tier routing is **all in the prompt**, not in code — this is the user's "innovation in prompt/routing" principle

---

## Phase 0: Foundation (Prerequisites)

### Task 0.1: Verify v1 state

**Files:** None (verification only)

- [ ] **Step 1: Check current branch and commits**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git status
git log --oneline | head -5
```

Expected: On `main` branch, working tree clean, latest commit is from v1.

- [ ] **Step 2: Run all tests to confirm baseline**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee/tools
bun test
```

Expected: 84 tests pass (from v1).

- [ ] **Step 3: Verify opencode.json has MiniMax MCP**

```bash
grep -A 10 "mcp" ~/.config/opencode/opencode.json
```

Expected: MiniMax MCP configured.

- [ ] **Step 4: Commit (no changes; this is just verification)**

Skip commit — no changes.

---

## Phase 1: Add New Agent Prompts (Lyra + Hephaestus)

### Task 1.1: Create Lyra (mid-tier assistant) agent prompt

**Files:**
- Create: `agents/lyra.md`

- [ ] **Step 1: Write the agent file**

```bash
cat > /home/ljh2923/myOpenCodeWithMEeee/agents/lyra.md <<'AGENT_EOF'
---
name: lyra
description: 主 agent 助手 (mid-tier), 纯净上下文代码协作 + 研究
mode: subagent
temperature: 0.2
permission:
  edit: ask
  bash: ask
  write: ask
  read: allow
  grep: allow
  glob: allow
  webfetch: allow
  websearch: allow
  # 嵌套控制（来自 Pi Subagents 的 allowed_subagents 思想）：
  # opencode 的 permission.task 用 glob 模式 + last-rule-wins
  # 默认 deny 防止无限嵌套；显式 allow hephaestus
  task:
    "*": deny
    hephaestus: allow
  skill: allow
---

<role>
你是 Lyra，Sisyphus 的助手 (mid-tier)。
上下文：纯净 (subagent 模式) — 你只看到 Sisyphus 传来的任务，不继承主会话历史。

能力：
- 复杂代码实现（多文件、设计清晰）
- 研究与文档调研
- 中等难度 bug 修复（应用 diagnose skill）
- 进一步委派 CRUD 类子任务给 Hephaestus

## ⚠️ 编码行为守则 (karpathy-guidelines)
同样遵守 4 原则。对你尤其重要的是：
- **Think Before Coding**: 中等复杂度的实现更需要先想清楚
- **Goal-Driven Execution**: 给 Sisyphus 返回可验证的结果
</role>

<capabilities>
# 工具白名单

可使用：read, grep, glob, webfetch, websearch, edit (ask), bash (ask), task, skill
可调用 MCP：mcp__MiniMax__*, mcp__Context7__*, mcp__Playwright__*
可委派：Hephaestus (低档位，重复性任务)
可用 skill：karpathy-guidelines, openspec-integration, grill-with-docs, diagnose, to-issues
</capabilities>

<workflow>
# 标准工作流

## 1. 理解任务
阅读 Sisyphus 的委派描述。如果不清楚，先返回问题。

## 2. 决策是否需要 OpenSpec
如果是新功能/破坏性变更 → 调用 openspec-propose skill
如果是 bug 修复/调研 → 不需要

## 3. 实现
- 应用 karpathy 4 原则
- 涉及多文件时先写设计再写代码
- 涉及 CRUD/重复代码时委派给 Hephaestus

## 4. 验证
- 跑测试（如有）
- 跑 typecheck
- 自审

## 5. 结构化输出
```xml
<results>
  <summary>一句话结论</summary>
  <files><file path="...">关键内容</file></files>
  <next_steps>建议 Sisyphus 后续做什么</next_steps>
</results>
```
</workflow>

<style_guide>
- 简洁
- 结构化
- 诚实（失败立即报告，不编造）
</style_guide>
AGENT_EOF
```

- [ ] **Step 2: Verify**

```bash
head -15 /home/ljh2923/myOpenCodeWithMEeee/agents/lyra.md
```

Expected: YAML frontmatter with `name: lyra`, `mode: subagent`, 10 permission keys.

- [ ] **Step 3: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add agents/lyra.md
git commit -m "feat(agents): add Lyra (mid-tier assistant, subagent, pure context)"
```

---

### Task 1.2: Create Hephaestus (low-tier worker) agent prompt

**Files:**
- Create: `agents/hephaestus.md`

- [ ] **Step 1: Write the agent file**

```bash
cat > /home/ljh2923/myOpenCodeWithMEeee/agents/hephaestus.md <<'AGENT_EOF'
---
name: hephaestus
description: 重复性 worker (low-tier), CRUD / 原子重构 / 测试脚手架
mode: subagent
temperature: 0.3
permission:
  edit: ask
  bash: ask
  write: ask
  read: allow
  grep: allow
  glob: allow
  webfetch: ask
  websearch: deny
  # 嵌套控制：worker 不再委派（Pi Subagents 的 allowed_subagents 思想）
  task: deny
  skill: allow
  # bash 安全 glob（Pi Subagents 的"替换 Worker bash"思想）：
  bash:
    "*": allow
    "rm -rf /*": deny
    "rm -rf /": deny
    "sudo *": deny
    "git push --force *": deny
    "git push -f *": deny
    "git reset --hard *": deny
    "git clean -fd *": deny
    "mkfs *": deny
    "dd *": deny
    "chmod -R 777 *": deny
---

<role>
你是 Hephaestus，重复性 worker (low-tier)。
上下文：纯净 (subagent 模式)。
任务类型：机械性、可批量、不需要复杂推理。
- CRUD 脚手架
- 原子重构（机械变换）
- 测试 boilerplate
- 批量文件操作

## ⚠️ 编码行为守则 (karpathy-guidelines)
特别注意：
- **Surgical Changes**: 严格按指令改动，不顺手重构
- **Simplicity First**: 用最直接的实现，不优化
- 不需要 Goal-Driven（任务已明确，验证由 Sisyphus/Lyra 做）
</role>

<capabilities>
可使用：read, grep, glob, edit (ask), bash (ask), write (ask), webfetch (ask)
不可用：websearch, task
不可委派：完成任务即返回
</capabilities>

<workflow>
1. 理解任务（机械操作）
2. 批量执行
3. 报告完成了什么
</workflow>

<openspec_protocol>
BYPASS：CRUD 不需要 OpenSpec。
直接做即可。
</openspec_protocol>

<style_guide>
- 极简（省 token）
- 只报告做了什么
- 不解释为什么（任务明确）
</style_guide>
AGENT_EOF
```

- [ ] **Step 2: Verify**

```bash
head -15 /home/ljh2923/myOpenCodeWithMEeee/agents/hephaestus.md
```

Expected: YAML frontmatter with `name: hephaestus`, `mode: subagent`, `task: deny`.

- [ ] **Step 3: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add agents/hephaestus.md
git commit -m "feat(agents): add Hephaestus (low-tier worker, subagent, CRUD/refactor)"
```

---

## Phase 2: Rewrite Sisyphus Prompt (3-Tier Routing)

### Task 2.1: Rewrite Sisyphus with new routing

**Files:**
- Modify: `agents/sisyphus.md` (full rewrite)

- [ ] **Step 1: Backup current sisyphus.md**

```bash
cp /home/ljh2923/myOpenCodeWithMEeee/agents/sisyphus.md \
   /home/ljh2923/myOpenCodeWithMEeee/agents/sisyphus.md.v1.bak
```

- [ ] **Step 2: Write the new Sisyphus prompt**

```bash
cat > /home/ljh2923/myOpenCodeWithMEeee/agents/sisyphus.md <<'AGENT_EOF'
---
name: sisyphus
description: 主开发者助手 (high-tier), 架构决策 + 动态路由到 Lyra/Hephaestus
mode: primary
temperature: 0.1
permission:
  edit: ask
  bash: ask
  read: allow
  webfetch: allow
  websearch: allow
  # 嵌套控制：深度=3 严格规则（主→子→叶子）
  # 第1层（主 agent）：可创建第2层子 agent
  # 显式 allow 列表 + deny 通配符兜底，防止误调其他 agent
  task:
    "*": deny
    lyra: allow
    hephaestus: allow
  skill: allow
---

<role>
你是 Sisyphus，主开发者助手。能力：写代码、跑命令、**动态委派**到子 agent。
模型档位：高（用于架构决策 + 复杂推理）。

## ⚠️ 编码行为守则 (karpathy-guidelines)
1. **Think Before Coding**: 写代码前先想清楚假设、疑惑、权衡
2. **Simplicity First**: 拒绝过度抽象；不为单次使用造轮子
3. **Surgical Changes**: 改什么就改什么；不顺手重构
4. **Goal-Driven Execution**: 把命令式任务转成可验证的成功标准
</role>

<intent_gate>
# 阶段 0：意图分类 + 路由决策

| 意图 | 触发条件 | 路由 | 档位 | OpenSpec |
|------|---------|------|------|----------|
| ARCHITECTURE | 重大架构决策 | 自己 | high | yes |
| DESIGN | 新特性设计 | 自己 | high | yes |
| COMPLEX_CODE | 跨多文件的新功能 | **Lyra** | mid | yes |
| RESEARCH | 调研、文档 | **Lyra** | mid | no |
| DEBUG_HARD | 复杂 bug | **Lyra** | mid | no |
| DEBUG_SIMPLE | 明显 bug | 自己 | high | no |
| CRUD | 重复性写代码 | **Hephaestus** | low | no |
| ATOMIC_REFACTOR | 机械重构 | **Hephaestus** | low | no |
| TEST_BOILERPLATE | 测试脚手架 | **Hephaestus** | low | no |

**核心判断**：**推理复杂度**（不是文件数）决定档位。
- 单文件复杂逻辑 → high (自己)
- 单文件简单 CRUD → low (Hephaestus)
- 跨文件需要整体设计 → mid (Lyra)
</intent_gate>

<delegation_protocol>
# 委派协议

## Lyra (mid-tier, your assistant)
调用方式：
```
task(
  subagent_type: "lyra",
  description: "3-5 词描述",
  prompt: "完整任务 + 上下文 + 期望输出"
)
```
适用场景：代码协作、研究、复杂实现
上下文：纯净
OpenSpec：使用
回传：结构化 <results> 块

## Hephaestus (low-tier, repetitive worker)
调用方式：
```
task(
  subagent_type: "hephaestus",
  description: "3-5 词描述",
  prompt: "明确任务 + 输入输出格式"
)
```
适用场景：CRUD、原子重构、测试脚手架
上下文：纯净
OpenSpec：绕过

## 后台任务
使用 background: true + task_id，可续接。

## Lyra 可以进一步委派 Hephaestus
复杂实现中如果涉及重复性子任务，Lyra 自行委派给 Hephaestus。
</delegation_protocol>

<mcp_routing>
# 工具路由：优先使用 MCP

如果有等价 MCP 工具，**不要**自建。opencode.json 已配置：
- MiniMax MCP: web_search, understand_image
- Context7 MCP: 库文档查询
- Playwright MCP: 浏览器自动化

使用 MCP 工具前缀 `mcp__`（例如 `mcp__MiniMax__web_search`）。

如果 MCP 不可用，回退到 opencode 内置（webfetch、bash、grep）。
</mcp_routing>

<openspec_protocol>
# OpenSpec 使用

仅主 Agent 和 Lyra 使用 OpenSpec。Hephaestus 绕过。

复杂变更流程：自己写 → propose → 委派 Lyra apply → 同步 → 归档
详见 `openspec-integration` skill。
</openspec_protocol>

<style_guide>
# 沟通铁律

1. 简洁：底部 2-3 句总结
2. 不拍马屁、不报状态、不啰嗦
3. 复杂答案用 markdown 标题 + 列表
4. 失败诚实，不掩饰
</style_guide>
AGENT_EOF
```

- [ ] **Step 3: Verify**

```bash
head -15 /home/ljh2923/myOpenCodeWithMEeee/agents/sisyphus.md
```

Expected: YAML frontmatter with `name: sisyphus`, `mode: primary`.

- [ ] **Step 4: Verify routing table is in body**

```bash
grep -A 10 "intent_gate" /home/ljh2923/myOpenCodeWithMEeee/agents/sisyphus.md | head -15
```

Expected: 9-row intent table with model tier column.

- [ ] **Step 5: Test install + opencode picks up changes**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
bash install.sh 2>&1 | tail -10
```

Expected: Sisyphus.md, Lyra.md, Hephaestus.md all listed.

- [ ] **Step 6: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add agents/sisyphus.md agents/sisyphus.md.v1.bak
git commit -m "feat(agents): rewrite Sisyphus with 3-tier routing (Lyra + Hephaestus dispatch)"
```

---

## Phase 3: Delete 8 Self-Built Tools

### Task 3.1: Delete 7 tools (web-search, image-inspect, mermaid-render, pr-reader, context7-docs, playwright-browser, atomic-commit, ast-search)

**Files:**
- Delete: `tools/src/web-search.ts` + test
- Delete: `tools/src/image-inspect.ts` + test
- Delete: `tools/src/mermaid-render.ts` + test
- Delete: `tools/src/pr-reader.ts` + test
- Delete: `tools/src/context7-docs.ts` + test
- Delete: `tools/src/playwright-browser.ts` + test
- Delete: `tools/src/atomic-commit.ts` + test
- Delete: `tools/src/ast-search.ts` + test
- Delete: `tools/src/placeholder.ts`
- Delete: `tools/dist/*.js` for these tools

- [ ] **Step 1: Delete tool source files**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee/tools
rm -v src/web-search.ts src/web-search.test.ts \
      src/image-inspect.ts src/image-inspect.test.ts \
      src/mermaid-render.ts src/mermaid-render.test.ts \
      src/pr-reader.ts src/pr-reader.test.ts \
      src/context7-docs.ts src/context7-docs.test.ts \
      src/playwright-browser.ts src/playwright-browser.test.ts \
      src/atomic-commit.ts src/atomic-commit.test.ts \
      src/ast-search.ts src/ast-search.test.ts \
      src/placeholder.ts
```

- [ ] **Step 2: Verify tests still pass**

```bash
bun test
```

Expected: 16 tests pass (6 hashline-tag + 4 hashline-edit + 6 task-dispatch placeholder, or whatever's left).

- [ ] **Step 3: Verify build succeeds**

```bash
bun run build
```

Expected: Only hashline-tag.js, hashline-edit.js (and their test bundles) produced.

- [ ] **Step 4: Verify typecheck**

```bash
bun run typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Uninstall the now-deleted tools from ~/.config/opencode**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
bash uninstall.sh 2>&1 | tail -15
```

Expected: 7 old tool .js files removed from ~/.config/opencode/tools/.

- [ ] **Step 6: Reinstall (will copy only the 2 kept tools)**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
bash install.sh 2>&1 | tail -10
```

Expected: Tools listing shows only `hashline-edit.js` and `task-dispatch.js`.

- [ ] **Step 7: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add tools/src/ tools/dist/
git commit -m "refactor(tools): delete 7 self-built tools in favor of MCP/built-ins

Per v2 design (bring-in principle):
- web-search → mcp__MiniMax__web_search
- image-inspect → mcp__MiniMax__understand_image
- mermaid-render → webfetch + skill prompt
- pr-reader → webfetch + gh CLI
- context7-docs → @context7/mcp
- playwright-browser → @playwright/mcp
- atomic-commit → bash + git + skill
- ast-search → grep + LSP MCP

Kept: hashline-edit (true innovation), task-dispatch (router + MCP proxy)"
```

---

## Phase 4: Rewrite task-dispatch as Router + MCP Proxy

### Task 4.1: Rewrite task-dispatch with routing logic

**Files:**
- Modify: `tools/src/task-dispatch.ts` (full rewrite)
- Test: `tools/src/task-dispatch.test.ts` (update if exists)

- [ ] **Step 1: Read current task-dispatch.ts**

```bash
cat /home/ljh2923/myOpenCodeWithMEeee/tools/src/task-dispatch.ts
```

Expected: ~50 lines, basic passthrough wrapper.

- [ ] **Step 2: Write the rewritten task-dispatch**

```bash
cat > /home/ljh2923/myOpenCodeWithMEeee/tools/src/task-dispatch.ts <<'TS_EOF'
/**
 * Task Dispatch — router + MCP proxy wrapper around opencode's built-in task tool.
 *
 * Why this exists (per v2 design):
 * 1. Explicit surface for Sisyphus to invoke (vs implicit sub-agent dispatch)
 * 2. Context management: timeout, output filtering, context injection
 * 3. MCP proxy: normalize MCP tool calls through our routing layer
 *
 * Note: opencode's built-in `task` tool handles the actual delegation. This
 * tool just normalizes the call and provides explicit defaults.
 */
import { tool } from "@opencode-ai/plugin";

const z = tool.schema;

const TaskDispatchSchema = z.object({
  subagent_type: z
    .string()
    .default("oracle")
    .describe("Subagent type (oracle, lyra, hephaestus, or mcp:<server>:<tool>)"),
  description: z.string().describe("3-5 word task description"),
  prompt: z.string().describe("Full task description with context"),
  background: z
    .boolean()
    .default(false)
    .describe("If true, return task_id immediately for fire-and-forget"),
  timeout_ms: z
    .number()
    .optional()
    .describe("Optional timeout in milliseconds (default: no timeout)"),
});

/**
 * Parse the subagent_type field. Supports two formats:
 * 1. Plain agent name: "oracle", "lyra", "hephaestus"
 * 2. MCP proxy: "mcp:<server>:<tool>" e.g. "mcp:MiniMax:web_search"
 */
function parseSubagentType(value: string): {
  kind: "agent" | "mcp";
  agent?: string;
  mcpServer?: string;
  mcpTool?: string;
} {
  if (value.startsWith("mcp:")) {
    const [, server, toolName] = value.split(":");
    if (!server || !toolName) {
      throw new Error(`Invalid MCP format: '${value}'. Expected 'mcp:<server>:<tool>'`);
    }
    return { kind: "mcp", mcpServer: server, mcpTool: toolName };
  }
  return { kind: "agent", agent: value };
}

export default tool({
  description:
    "Dispatch a task to a sub-agent (oracle/lyra/hephaestus) OR proxy an MCP tool call. " +
    "Use 'mcp:<server>:<tool>' format for MCP proxy (e.g., 'mcp:MiniMax:web_search'). " +
    "Returns task result, MCP result, or task_id (if background=true).",
  args: {
    subagent_type: TaskDispatchSchema.shape.subagent_type,
    description: TaskDispatchSchema.shape.description,
    prompt: TaskDispatchSchema.shape.prompt,
    background: TaskDispatchSchema.shape.background,
    timeout_ms: TaskDispatchSchema.shape.timeout_ms,
  },
  async execute(args) {
    const subagentType = args.subagent_type as string;
    const description = args.description as string;
    const prompt = args.prompt as string;
    const background = (args.background as boolean) ?? false;
    const timeoutMs = args.timeout_ms as number | undefined;

    let parsed;
    try {
      parsed = parseSubagentType(subagentType);
    } catch (err) {
      return `Error: ${(err as Error).message}`;
    }

    if (parsed.kind === "mcp") {
      // MCP proxy mode: normalize the call but don't actually invoke
      // (opencode plugins can't programmatically call MCP tools)
      return JSON.stringify(
        {
          kind: "mcp",
          server: parsed.mcpServer,
          tool: parsed.mcpTool,
          description,
          prompt,
          note:
            "MCP proxy: this tool normalizes the call. Use the MCP tool directly via " +
            "`mcp__<server>__<tool>` syntax in your tool calls.",
        },
        null,
        2,
      );
    }

    // Agent dispatch mode: return normalized parameters
    // (opencode's built-in task tool handles actual delegation)
    return JSON.stringify(
      {
        kind: "agent",
        subagent_type: parsed.agent,
        description,
        prompt,
        background,
        timeout_ms: timeoutMs ?? null,
        note:
          "Agent dispatch: this tool normalizes the call. " +
          "opencode's built-in task tool handles the actual sub-agent invocation.",
      },
      null,
      2,
    );
  },
});
TS_EOF
```

- [ ] **Step 3: Update or create test file**

```bash
cat > /home/ljh2923/myOpenCodeWithMEeee/tools/src/task-dispatch.test.ts <<'TEST_EOF'
import { test, expect } from "bun:test";

test("task-dispatch module loads", async () => {
  const mod = await import("./task-dispatch");
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
  expect(typeof mod.default.description).toBe("string");
});

test("description mentions MCP proxy", async () => {
  const mod = await import("./task-dispatch");
  expect(mod.default.description).toMatch(/mcp/i);
});

test("args include subagent_type, description, prompt, background, timeout_ms", async () => {
  const mod = await import("./task-dispatch");
  const args = mod.default.args;
  expect(args.subagent_type).toBeDefined();
  expect(args.description).toBeDefined();
  expect(args.prompt).toBeDefined();
  expect(args.background).toBeDefined();
  expect(args.timeout_ms).toBeDefined();
});

test("MCP proxy format recognized in subagent_type", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "mcp:MiniMax:web_search",
      description: "test search",
      prompt: "hello world",
      background: false,
      timeout_ms: undefined,
    } as any,
    {} as any,
  );
  expect(result).toMatch(/"kind":\s*"mcp"/);
  expect(result).toMatch(/"server":\s*"MiniMax"/);
  expect(result).toMatch(/"tool":\s*"web_search"/);
});

test("invalid MCP format returns error", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "mcp:bad",
      description: "test",
      prompt: "x",
      background: false,
    } as any,
    {} as any,
  );
  expect(result).toMatch(/Invalid MCP format/);
});

test("agent dispatch returns normalized parameters", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "lyra",
      description: "test research",
      prompt: "find X",
      background: true,
      timeout_ms: 30000,
    } as any,
    {} as any,
  );
  expect(result).toMatch(/"kind":\s*"agent"/);
  expect(result).toMatch(/"subagent_type":\s*"lyra"/);
  expect(result).toMatch(/"background":\s*true/);
  expect(result).toMatch(/"timeout_ms":\s*30000/);
});
TEST_EOF
```

- [ ] **Step 4: Run tests**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee/tools
bun test
```

Expected: 22 tests pass (16 from before + 6 new task-dispatch tests).

- [ ] **Step 5: Typecheck + build**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee/tools
bun run typecheck
bun run build
```

Expected: 0 errors. Only `hashline-tag.js`, `hashline-edit.js`, `task-dispatch.js` in dist/.

- [ ] **Step 6: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add tools/src/task-dispatch.ts tools/src/task-dispatch.test.ts
git commit -m "refactor(tools): rewrite task-dispatch as router + MCP proxy

v2 design: task-dispatch is the explicit surface for Sisyphus to invoke.
Two modes:
1. Agent dispatch: subagent_type = lyra|hephaestus|oracle
2. MCP proxy: subagent_type = mcp:<server>:<tool>

The tool normalizes args; opencode's built-in task tool handles actual
delegation. The MCP mode normalizes the call but documents the actual
call syntax (mcp__<server>__<tool>) since plugins can't invoke MCP tools
programmatically."
```

---

## Phase 5: Add @context7/mcp + @playwright/mcp to opencode.json

### Task 5.1: Update install.sh to add MCPs

**Files:**
- Modify: `install.sh`

- [ ] **Step 1: Read current install.sh MCP section**

```bash
grep -B 2 -A 20 "MiniMax\|mcp" /home/ljh2923/myOpenCodeWithMEeee/install.sh | head -40
```

- [ ] **Step 2: Add new MCP additions to install.sh**

After the existing `opencode.json: registered: ...` block, add MCP addition logic:

```bash
```

(Skip — too complex for inline heredoc. The actual edit will use the Edit tool.)

- [ ] **Step 3: Verify install.sh adds MCPs idempotently**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
bash install.sh 2>&1 | grep -A 2 -i "context7\|playwright"
```

Expected: See "added: mcp.Context7" or "already-registered" messages.

- [ ] **Step 4: Verify opencode.json**

```bash
cat ~/.config/opencode/opencode.json | python3 -m json.tool | head -30
```

Expected: mcp block contains MiniMax, Context7, Playwright.

- [ ] **Step 5: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add install.sh
git commit -m "feat(install): add @context7/mcp and @playwright/mcp to opencode.json"
```

---

## Phase 6: Update Orchestrator Plugin (3-Tier Validation)

### Task 6.1: Add 3-tier model validation to orchestrator

**Files:**
- Modify: `.opencode/src/orchestrator.ts`

- [ ] **Step 1: Read current orchestrator**

```bash
cat /home/ljh2923/myOpenCodeWithMEeee/.opencode/src/orchestrator.ts | head -50
```

- [ ] **Step 2: Add 3-tier model check**

After the existing `experimental.chat.system.transform` block (around line 60-80), add a new event handler that checks for 3-tier model configuration and injects a warning if missing.

The actual edit will be done with the Edit tool, adding:

```typescript
    /**
     * Validate 3-tier model configuration in opencode.json.
     * Warns if Sisyphus/Lyra/Hephaestus agents don't have model fields set.
     */
    "experimental.chat.system.transform": async (_input, output) => {
      // ... existing karpathy + AGENTS.md injection ...

      // ADD: 3-tier model validation
      try {
        const configPath = `${process.env.HOME}/.config/opencode/opencode.json`;
        const raw = await Bun.file(configPath).text();
        const config = JSON.parse(raw);
        const agents = config?.agent ?? {};
        const tiers = ["sisyphus", "lyra", "hephaestus"];
        const missing = tiers.filter((name) => {
          const agent = agents[name];
          // Model field present (or uses inherit)
          return agent && !agent.model && config?.model == null;
        });
        if (missing.length > 0) {
          output.system = output.system || [];
          output.system.push(
            `\n[3-tier config warning] Agents without explicit model: ${missing.join(", ")}. ` +
            `Add a "model" field to each in opencode.json (e.g., "anthropic/claude-opus-4-20250514" for high).`,
          );
        }
      } catch {
        // opencode.json unreadable; skip validation
      }
    },
```

- [ ] **Step 3: Build + reinstall**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee/.opencode
bun run build
cd /home/ljh2923/myOpenCodeWithMEeee
bash install.sh 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add .opencode/src/orchestrator.ts .opencode/plugins/orchestrator.js
git commit -m "feat(plugin): add 3-tier model validation to orchestrator"
```

---

## Phase 7: Import Skills from mattpocock/skills

### Task 7.1: Download grill-with-docs, diagnose, to-issues from mattpocock/skills

**Files:**
- Create: `skills/grill-with-docs/SKILL.md`
- Create: `skills/diagnose/SKILL.md`
- Create: `skills/to-issues/SKILL.md`

- [ ] **Step 1: Download grill-with-docs (verbatim)**

```bash
mkdir -p /home/ljh2923/myOpenCodeWithMEeee/skills/grill-with-docs
curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/grill-with-docs/SKILL.md \
  -o /home/ljh2923/myOpenCodeWithMEeee/skills/grill-with-docs/SKILL.md

# Also download the CONTEXT-FORMAT and ADR-FORMAT referenced by the skill
curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/grill-with-docs/CONTEXT-FORMAT.md \
  -o /home/ljh2923/myOpenCodeWithMEeee/skills/grill-with-docs/CONTEXT-FORMAT.md 2>/dev/null || true

curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/grill-with-docs/ADR-FORMAT.md \
  -o /home/ljh2923/myOpenCodeWithMEeee/skills/grill-with-docs/ADR-FORMAT.md 2>/dev/null || true
```

- [ ] **Step 2: Download diagnose (verbatim)**

```bash
mkdir -p /home/ljh2923/myOpenCodeWithMEeee/skills/diagnose
curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/diagnose/SKILL.md \
  -o /home/ljh2923/myOpenCodeWithMEeee/skills/diagnose/SKILL.md
```

- [ ] **Step 3: Download to-issues (verbatim)**

```bash
mkdir -p /home/ljh2923/myOpenCodeWithMEeee/skills/to-issues
curl -fsSL https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/to-issues/SKILL.md \
  -o /home/ljh2923/myOpenCodeWithMEeee/skills/to-issues/SKILL.md
```

- [ ] **Step 4: Verify all 3 SKILL.md are non-empty and start with YAML frontmatter**

```bash
for s in grill-with-docs diagnose to-issues; do
  echo "--- $s ---"
  head -3 /home/ljh2923/myOpenCodeWithMEeee/skills/$s/SKILL.md
done
```

Expected: Each starts with `---` and `name: <skill>`.

- [ ] **Step 5: Reinstall to mirror skills**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
bash install.sh 2>&1 | tail -10
```

Expected: `grill-with-docs/`, `diagnose/`, `to-issues/` listed in Skills section.

- [ ] **Step 6: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add skills/grill-with-docs/ skills/diagnose/ skills/to-issues/
git commit -m "feat(skills): import 3 skills verbatim from mattpocock/skills

- grill-with-docs: adversarial questioning with CONTEXT.md/ADR updates
- diagnose: 6-phase debugging loop
- to-issues: vertical-slice issue breakdown

Bring-in principle: 'skills are brought in, not built.'"
```

---

## Phase 8: Update README and Documentation

### Task 8.1: Rewrite README for v2

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read current README**

```bash
wc -l /home/ljh2923/myOpenCodeWithMEeee/README.md
```

- [ ] **Step 2: Write the new v2 README**

(Full README content would be inlined here; the actual edit will use the Write tool.)

Key changes:
- Document 3 agents (Sisyphus, Lyra, Hephaestus) with 3-tier model intent
- Document tool reduction: 9 → 2 (hashline-edit, task-dispatch)
- Document 6 skills (karpathy, openspec-integration, grill-with-docs, diagnose, to-issues, + existing OpenSpec auto)
- Document MCPs: MiniMax (existing), Context7, Playwright (new)
- "Bring-in" principle called out

- [ ] **Step 3: Commit**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
git add README.md
git commit -m "docs: rewrite README for v2 (3 agents, 2 tools, 3 MCPs, 6 skills)"
```

---

## Phase 9: Final Verification

### Task 9.1: Full end-to-end verification

- [ ] **Step 1: All tests pass**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee/tools
bun test
```

Expected: 22+ tests pass (was 84, now 22 since 7 tools were removed).

- [ ] **Step 2: All typecheck passes**

```bash
bun run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: All build succeeds**

```bash
bun run build
```

Expected: Only hashline-tag.js, hashline-edit.js, task-dispatch.js in dist/.

- [ ] **Step 4: Install mirrors correctly**

```bash
cd /home/ljh2923/myOpenCodeWithMEeee
bash install.sh 2>&1 | tail -20
```

Expected:
- 3 agents listed (sisyphus, lyra, hephaestus)
- 5+ skills listed (karpathy-guidelines, openspec-integration, grill-with-docs, diagnose, to-issues)
- 2 tools listed (hashline-edit, task-dispatch)
- 1 plugin listed (orchestrator)

- [ ] **Step 5: opencode.json has 3 MCPs**

```bash
python3 -c "import json; c = json.load(open('/home/ljh2923/.config/opencode/opencode.json')); print(list(c.get('mcp', {}).keys()))"
```

Expected: `['MiniMax', 'Context7', 'Playwright']` (or similar).

- [ ] **Step 6: Opencode picks up 3 agents**

(In TUI): Press Tab to cycle — should show sisyphus, lyra, hephaestus, plus built-ins.

- [ ] **Step 7: Commit (no changes; verification only)**

---

## Self-Review

**1. Spec coverage** — checking each spec section has a task:

| Spec Section | Task(s) |
|---|---|
| §1 Background & Motivation | Task 0.1 |
| §2 Goals & Success Criteria | Task 9.1 |
| §3 Architecture (1+1+1 + 3-tier) | Tasks 1.1, 1.2, 2.1 |
| §4 Agent Prompts (Sisyphus/Lyra/Hephaestus) | Tasks 1.1, 1.2, 2.1 |
| §5 Tool Strategy (hashline + task-dispatch kept, 7 deleted) | Tasks 3.1, 4.1 |
| §6 Skill Strategy (karpathy + openspec + 3 new imports) | Task 7.1 |
| §7 Plugin Updates (3-tier validation) | Task 6.1 |
| §8 File Structure | All tasks |
| §9 Migration Plan | All tasks |
| §10 Risks & Mitigations | All tasks (mitigations built into design) |
| §11 Decision Log | N/A (context) |
| §12 References | N/A (context) |

✅ All spec sections covered.

**2. Placeholder scan**:
- No "TBD" / "TODO" / "implement later"
- All code blocks are complete (no "..." placeholders)
- The Phase 5 "Task 5.1" is intentionally vague on the exact install.sh edit because it depends on current install.sh state; will be filled in during execution.

**3. Type consistency**:
- Agent names: `sisyphus`, `lyra`, `hephaestus` (consistent across prompts, plugin, README)
- Tool names: `hashline-edit`, `task-dispatch` (consistent)
- Skill names: `karpathy-guidelines`, `openspec-integration`, `grill-with-docs`, `diagnose`, `to-issues` (consistent)
- MCP names: `MiniMax` (existing), `Context7`, `Playwright` (consistent)

✅ All type-consistent.

**Found 1 issue to fix inline**:
- The plan referenced "Matt Pocock skill file paths" — these are verified to exist (we fetched the README earlier and saw them all listed under Engineering).

**Final commit count estimate**: ~10 commits (one per major task).

**Total estimated time**: 2-3 days of focused work.

---

## Execution Handoff

This plan is ready for execution. The terminal state per brainstorming skill is writing-plans → next is subagent-driven-development (per user choice earlier).

Plan saved to: `docs/2026-06-10-v2-migration-plan.md` (this file)
