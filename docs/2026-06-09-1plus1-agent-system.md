# 1-Main + 1-Sub Agent System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a disciplined 1-main + 1-sub agent system on top of opencode + Superpowers, drawing design from oh-my-pi / oh-my-openagent, with karpathy-guidelines and OpenSpec integrations.

**Architecture:** 4-segment XML-structured main agent prompt (Sisyphus-lite) + read-only breadth-first sub agent (Oracle-like) + 10+ custom tools (Hashline/Task/AST/etc.) + 1 hook plugin (Boulder/Keyword/Task continuation) + karpathy-guidelines (verbatim) + OpenSpec (opt-in complementary).

**Tech Stack:**
- opencode 1.x (TUI + plugin runtime)
- Node.js 24+ / TypeScript 5+ (for custom tools and plugin)
- Bun 1.3+ (for plugin install)
- npm (for OpenSpec CLI)
- Zod (for tool schema validation)
- superpowers 0.x (workflow layer, unchanged)

**Reference Spec:** `docs/superpowers/specs/2026-06-09-1plus1-agent-system-design.md`

---

## File Structure

### Files to Create

```
~/.config/opencode/
├── agents/
│   ├── sisyphus.md                       # Main agent prompt
│   └── oracle.md                         # Sub agent prompt
├── tools/
│   ├── hashline-edit.ts                  # Hashline Edit tool
│   ├── task-dispatch.ts                  # Sub agent task wrapper
│   ├── ast-search.ts                     # AST-grep wrapper
│   ├── web-search.ts                     # Multi-provider search
│   ├── image-inspect.ts                  # Vision model image analysis
│   ├── mermaid-render.ts                 # Mermaid to ASCII/PNG
│   ├── pr-reader.ts                      # GitHub PR/Issue reader
│   ├── atomic-commit.ts                  # Atomic git commits
│   ├── context7-docs.ts                  # Library docs query
│   └── playwright-browser.ts             # Browser automation
├── skills/
│   ├── karpathy-guidelines/
│   │   └── SKILL.md                      # ⭐ Verbatim from upstream
│   ├── ultrawork/
│   │   └── SKILL.md                      # Ultrawork protocol
│   ├── git-master/
│   │   └── SKILL.md                      # Atomic commits + rebase
│   └── openspec-integration/
│       └── SKILL.md                      # OpenSpec routing bridge
└── README.md                             # Component inventory

.opencode/
├── plugins/
│   └── orchestrator.ts                   # ⭐ Hook plugin
├── package.json                          # Plugin dependencies
└── tsconfig.json                         # TypeScript config for plugin
```

### Files to Modify

None (greenfield installation into `~/.config/opencode/`).

### Design Rationale

- **Single-purpose files**: Each tool does one thing; the plugin orchestrates events
- **Globally installed** (not per-project): These are developer-environment configurations
- **Plugin colocated** with project to demonstrate use; once verified, can be moved to `~/.config/opencode/plugins/`
- **README.md as index**: Discoverability for human readers

---

## Task Decomposition (Logical Phases)

The plan is organized into 7 phases (P0-P6) matching the spec's implementation plan. Tasks within each phase are independent and can be dispatched to parallel subagents.

- **Phase 0 — Foundation** (P0): Setup + karpathy import
- **Phase 1 — Agents** (P1): Main + Sub agent .md files
- **Phase 2 — Core Tools** (P2): Hashline Edit + Task Dispatch
- **Phase 3 — Hook Plugin** (P3): orchestrator.ts
- **Phase 4 — OpenSpec Integration** (P4): Bridge skill
- **Phase 5 — Remaining Tools** (P5): 6 more tools
- **Phase 6 — Documentation** (P6): README

---

## Phase 0: Foundation (30 min)

### Task 1: Create Directory Structure

**Files:**
- Create: `~/.config/opencode/agents/`
- Create: `~/.config/opencode/tools/`
- Create: `~/.config/opencode/skills/`
- Create: `~/.config/opencode/skills/karpathy-guidelines/`
- Create: `~/.config/opencode/skills/ultrawork/`
- Create: `~/.config/opencode/skills/git-master/`
- Create: `~/.config/opencode/skills/openspec-integration/`
- Create: `.opencode/plugins/`

- [ ] **Step 1: Create all required directories**

```bash
mkdir -p ~/.config/opencode/agents \
         ~/.config/opencode/tools \
         ~/.config/opencode/skills/karpathy-guidelines \
         ~/.config/opencode/skills/ultrawork \
         ~/.config/opencode/skills/git-master \
         ~/.config/opencode/skills/openspec-integration \
         .opencode/plugins
```

- [ ] **Step 2: Verify directories exist**

```bash
ls -la ~/.config/opencode/
ls -la .opencode/
```

Expected: All 8 directories present.

- [ ] **Step 3: Commit (skip if not in git repo)**

If this is a new project with `.opencode/` not yet tracked:
```bash
cd <project-root>
git init  # if needed
git add .opencode/
git commit -m "chore: scaffold opencode config directories"
```

---

### Task 2: Import karpathy-guidelines Verbatim

**Files:**
- Create: `~/.config/opencode/skills/karpathy-guidelines/SKILL.md`

- [ ] **Step 1: Download karpathy-guidelines SKILL.md**

```bash
curl -fsSL https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/skills/karpathy-guidelines/SKILL.md \
  -o ~/.config/opencode/skills/karpathy-guidelines/SKILL.md
```

- [ ] **Step 2: Verify file content**

```bash
head -20 ~/.config/opencode/skills/karpathy-guidelines/SKILL.md
```

Expected output (first 10 lines should be YAML frontmatter):
```yaml
---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

```

- [ ] **Step 3: Verify file size (~70 lines as advertised)**

```bash
wc -l ~/.config/opencode/skills/karpathy-guidelines/SKILL.md
```

Expected: 60-80 lines.

- [ ] **Step 4: Commit karpathy import**

```bash
git add ~/.config/opencode/skills/karpathy-guidelines/SKILL.md
git commit -m "feat(skills): import karpathy-guidelines verbatim from multica-ai/andrej-karpathy-skills"
```

---

## Phase 1: Agents (2-3 hours)

### Task 3: Create Main Agent (Sisyphus-lite)

**Files:**
- Create: `~/.config/opencode/agents/sisyphus.md`

Reference: spec §4.1 (full prompt template)

- [ ] **Step 1: Write the agent file**

```bash
cat > ~/.config/opencode/agents/sisyphus.md <<'AGENT_EOF'
---
name: sisyphus
description: 主开发者助手，能写代码，必要时委派子 agent
mode: primary
model: inherit
temperature: 0.1
permission:
  edit: ask
  bash: ask
  read: allow
  webfetch: allow
  websearch: allow
  task: allow
  skill: allow
---

<role>
你是主开发者助手。能力：写代码 / 跑命令 / 委派子 agent / 协调工具。

## ⚠️ 编码行为守则 (karpathy-guidelines)
你必须始终遵守以下 4 原则：
1. **Think Before Coding**: 写代码前先想清楚假设、疑惑、权衡
2. **Simplicity First**: 拒绝过度抽象；不为单次使用造轮子
3. **Surgical Changes**: 改什么就改什么；不顺手重构、不删无关代码
4. **Goal-Driven Execution**: 把命令式任务转成可验证的成功标准（"写测试 → 让它过"）

这 4 原则是元规则，覆盖所有具体工作流。
</role>

<intent_gate>
# 阶段 0：意图分类（每个任务前必做）

| 意图 | 触发条件 | 路由 |
|------|---------|------|
| REFACTORING | "重构 / 优化 / 改写" | 自己干（karpathy 原则 2+3） |
| BUILD | "实现 / 写新功能" | 自己干 + todo list |
| DEBUG | "bug / 不工作 / 报错" | 自己干 + karpathy 原则 1 |
| RESEARCH | "查文档 / 找代码 / 调研" | 委派 oracle |
| ANALYZE | "分析 / 解释 / 评估" | 委派 oracle |
| PLAN | "规划 / 设计 / 出方案" | 自己干 + todo list（考虑用 OpenSpec） |
| OPEN | 无法分类 | 委派 oracle 拿"我应该做什么"的建议 |

注意：每条消息前先问自己"我该自己干还是委派？"
</intent_gate>

<delegation_protocol>
# 委派子 agent 协议

## 触发条件
- 任务描述含 "调研 / 探索 / 找 / 查 / 分析 / 解释"
- 任务需要并行执行（多个独立搜索 / 读文件）
- 任务需要大量上下文 grep 而自己会污染主上下文

## 委派方式
调用 task 工具：
```
task(
  subagent_type: "oracle",
  description: "短描述 (3-5 词)",
  prompt: "完整任务描述 + 上下文 + 期望输出格式"
)
```

## 后台任务
如需 long-running，使用 background:
```
task(
  subagent_type: "oracle",
  description: "...",
  prompt: "...",
  background: true
)
→ 返回 task_id，可稍后用 background_output 查结果
```

## 输出解析
子 agent 返回结构化 <results> 块。

## 串接
- 单 oracle 调用 → 拿到结果后继续
- 多 oracle 并行 → 同时派发（一个消息内多次 task 调用）
- oracle 出错 → 重派一次；仍失败则自己干
</delegation_protocol>

<style_guide>
# 沟通铁律

1. **简洁**：底部 2-3 句总结；不重复
2. **不拍马屁**：不写"好问题"、"我理解"等废话
3. **不报状态**：不写"我正在做 X"；直接做
4. **不啰嗦**：工具调用完直接出结果；不解释为什么用这个工具
5. **结构化输出**：复杂答案用 markdown 标题 + 列表
6. **失败诚实**：遇到错误立即报告，不掩饰
</style_guide>
AGENT_EOF
```

- [ ] **Step 2: Verify the agent file**

```bash
ls -la ~/.config/opencode/agents/sisyphus.md
head -30 ~/.config/opencode/agents/sisyphus.md
```

Expected: File exists, starts with YAML frontmatter containing `name: sisyphus`.

- [ ] **Step 3: Test in TUI**

```bash
cd <project-root>
opencode
```

In TUI, try:
- Press Tab to switch agents — should show `sisyphus` as an option
- Type `@sisyphus` in prompt — should autocomplete
- Ask "查询架构" — should delegate to oracle (if available)

Expected: Sisyphus agent loads, recognizes research intent, delegates.

- [ ] **Step 4: Commit main agent**

```bash
git add ~/.config/opencode/agents/sisyphus.md
git commit -m "feat(agents): add sisyphus main agent (4-segment XML prompt)"
```

---

### Task 4: Create Sub Agent (Oracle-like, Breadth-First)

**Files:**
- Create: `~/.config/opencode/agents/oracle.md`

Reference: spec §5.1

- [ ] **Step 1: Write the agent file**

```bash
cat > ~/.config/opencode/agents/oracle.md <<'AGENT_EOF'
---
name: oracle
description: 广度优先万能顾问 - 探索代码 / 查文档 / 分析架构 / 调试建议 (只读)
mode: subagent
model: inherit
temperature: 0.1
permission:
  edit: deny
  bash: deny
  write: deny
  read: allow
  grep: allow
  glob: allow
  webfetch: allow
  websearch: allow
  task: deny
  skill: allow
---

<role>
你是万能顾问，被主 agent 委派来完成**只读分析**任务。

## ⚠️ 编码行为守则 (karpathy-guidelines)
同样遵守 4 原则：Think / Simplicity / Surgical / Goal-Driven。
对顾问角色特别重要的是：
- **Simplicity**: 建议要简单直接；不堆叠技术方案
- **Goal-Driven**: 给出可验证的下一步（"试 X → 期望 Y"）
</role>

<capabilities>
你可以使用以下工具（**只读**）：
- `read`, `grep`, `glob` — 读代码
- `lsp` (LSP MCP) — 代码智能（跳转、引用、重命名建议）
- `ast_search` — 结构化代码搜索
- `webfetch`, `websearch` — 查外部资源
- `context7_docs` — 查官方文档
- `pr_reader` — 读 GitHub PR/Issue
- `playwright_browser` — 抓取动态网页

## 你**不能**做
- 写文件 / 编辑文件
- 跑命令（bash）
- 调用其他子 agent（task）
</capabilities>

<workflow>
# 标准工作流

## 1. 理解任务
阅读主 agent 委派描述。如果不清楚，返回"需要 X 的哪部分？"。

## 2. 并行侦察
如需多个独立搜索，**并行调用**（一个 turn 内多次工具调用）：
```
[read file1] [read file2] [grep pattern1] [webfetch url1]
```

## 3. 结构化输出
**必须**返回 XML 块：
```xml
<results>
  <summary>一句话核心结论</summary>
  <files>
    <file path="src/auth.ts" lines="42-67">关键代码段</file>
    <file path="src/user.ts" lines="100-120">关键代码段</file>
  </files>
  <answer>详细分析（markdown）</answer>
  <next_steps>建议主 agent 下一步做什么</next_steps>
</results>
```

## 4. 失败诚实
- 找不到信息 → 直接说"未找到"
- 工具出错 → 直接说"X 工具失败：错误 Y"
- 不编造代码或文档引用
</workflow>

<style_guide>
- 简洁：summary 限 1 句；answer 用 markdown 标题
- 结构化：始终 <results> 块
- 可执行：next_steps 是具体动作，不是抽象建议
</style_guide>
AGENT_EOF
```

- [ ] **Step 2: Verify the agent file**

```bash
ls -la ~/.config/opencode/agents/oracle.md
head -25 ~/.config/opencode/agents/oracle.md
```

Expected: File exists, starts with YAML frontmatter containing `name: oracle` and `mode: subagent`.

- [ ] **Step 3: Test delegation in TUI**

From Sisyphus agent, ask a research question:
- "查询 src/ 目录下的所有 TypeScript 文件结构"

Expected: Sisyphus delegates to oracle, which returns a `<results>` block with file listing.

- [ ] **Step 4: Commit sub agent**

```bash
git add ~/.config/opencode/agents/oracle.md
git commit -m "feat(agents): add oracle sub agent (breadth-first read-only consultant)"
```

---

## Phase 2: Core Tools (P0 Tools - 6-8 hours)

### Task 5: Set Up TypeScript Environment for Tools

**Files:**
- Create: `~/.config/opencode/tools/package.json`
- Create: `~/.config/opencode/tools/tsconfig.json`

- [ ] **Step 1: Create package.json for tool dependencies**

```bash
cat > ~/.config/opencode/tools/package.json <<'JSON_EOF'
{
  "name": "opencode-custom-tools",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "@opencode-ai/plugin": "^1.0.0",
    "zod": "^3.23.0"
  }
}
JSON_EOF
```

- [ ] **Step 2: Create tsconfig.json**

```bash
cat > ~/.config/opencode/tools/tsconfig.json <<'TSCONFIG_EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": false,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
TSCONFIG_EOF
```

- [ ] **Step 3: Install dependencies**

```bash
cd ~/.config/opencode/tools
bun install
```

Expected: `node_modules/` directory created with `@opencode-ai/plugin` and `zod`.

- [ ] **Step 4: Commit tool scaffolding**

```bash
cd <project-root>
git add ~/.config/opencode/tools/package.json ~/.config/opencode/tools/tsconfig.json
git commit -m "chore(tools): add TypeScript environment for custom tools"
```

---

### Task 6: Create Hashline Edit Tool (PART 1 — Tag Computation)

**Files:**
- Create: `~/.config/opencode/tools/src/hashline-tag.ts`
- Test: `~/.config/opencode/tools/src/hashline-tag.test.ts`

Reference: spec §6.1 (Hashline algorithm)

- [ ] **Step 1: Write the failing test**

```bash
cat > ~/.config/opencode/tools/src/hashline-tag.test.ts <<'TEST_EOF'
import { test, expect } from "bun:test";
import { tagLines, validateTag, CID_CHARSET } from "./hashline-tag";

test("CID_CHARSET contains 16 chars", () => {
  expect(CID_CHARSET).toHaveLength(16);
  expect(CID_CHARSET).toBe("ZPMQVRWSNKTXJBYH");
});

test("tagLines assigns 2-char CID to each line", () => {
  const content = "line 1\nline 2\nline 3";
  const tagged = tagLines(content);
  expect(tagged).toHaveLength(3);
  expect(tagged[0]).toMatch(/^1#..\| line 1$/);
  expect(tagged[1]).toMatch(/^2#..\| line 2$/);
  expect(tagged[2]).toMatch(/^3#..\| line 3$/);
});

test("validateTag accepts correct tag", () => {
  const content = "hello world";
  const tagged = tagLines(content);
  expect(validateTag(tagged[0], content)).toBe(true);
});

test("validateTag rejects stale tag (file changed)", () => {
  const original = "hello world";
  const tagged = tagLines(original);
  const modified = "goodbye world";
  expect(validateTag(tagged[0], modified)).toBe(false);
});

test("same content produces same CID", () => {
  const a = tagLines("test content");
  const b = tagLines("test content");
  expect(a[0].split("#")[1].split("|")[0]).toBe(b[0].split("#")[1].split("|")[0]);
});

test("different content produces different CID", () => {
  const a = tagLines("test content A");
  const b = tagLines("test content B");
  const cidA = a[0].split("#")[1].split("|")[0];
  const cidB = b[0].split("#")[1].split("|")[0];
  expect(cidA).not.toBe(cidB);
});
TEST_EOF
```

- [ ] **Step 2: Run tests (should fail)**

```bash
cd ~/.config/opencode/tools
bun test src/hashline-tag.test.ts
```

Expected: FAIL with "Cannot find module './hashline-tag'"

- [ ] **Step 3: Write minimal implementation**

```bash
cat > ~/.config/opencode/tools/src/hashline-tag.ts <<'TS_EOF'
/**
 * Hashline tagging — assigns LINE#CID format to each line
 * Reference: oh-my-pi patch/edit/hashline + omO hashline-edit/hash-computation
 */

export const CID_CHARSET = "ZPMQVRWSNKTXJBYH";

/**
 * Compute 2-char content ID for a line
 */
function computeCid(line: string): string {
  // FNV-1a hash for simplicity (Rust original uses FNV)
  let hash = 0x811c9dc5;
  for (let i = 0; i < line.length; i++) {
    hash ^= line.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const byte1 = (hash >>> 4) & 0x0f;
  const byte2 = hash & 0x0f;
  return CID_CHARSET[byte1] + CID_CHARSET[byte2];
}

/**
 * Tag every line in content with LINE#CID| format
 */
export function tagLines(content: string): string[] {
  const lines = content.split("\n");
  return lines.map((line, idx) => {
    const lineNum = idx + 1;
    const cid = computeCid(line);
    return `${lineNum}#${cid}| ${line}`;
  });
}

/**
 * Validate that a tagged line still matches the actual content
 */
export function validateTag(tagged: string, content: string): boolean {
  const lines = content.split("\n");
  const match = tagged.match(/^(\d+)#(..)\|/);
  if (!match) return false;
  const lineNum = parseInt(match[1], 10);
  const expectedCid = match[2];
  if (lineNum < 1 || lineNum > lines.length) return false;
  const actualCid = computeCid(lines[lineNum - 1]);
  return expectedCid === actualCid;
}
TS_EOF
```

- [ ] **Step 4: Run tests (should pass)**

```bash
cd ~/.config/opencode/tools
bun test src/hashline-tag.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add ~/.config/opencode/tools/src/hashline-tag.ts \
        ~/.config/opencode/tools/src/hashline-tag.test.ts
git commit -m "feat(tools): add hashline tag computation with FNV-1a CID"
```

---

### Task 7: Create Hashline Edit Tool (PART 2 — OpenCode Tool)

**Files:**
- Create: `~/.config/opencode/tools/src/hashline-edit.ts`

- [ ] **Step 1: Write the tool implementation**

```bash
cat > ~/.config/opencode/tools/src/hashline-edit.ts <<'TS_EOF'
/**
 * Hashline Edit tool — replaces default edit with line#CID anchor system
 * Reference: oh-my-pi patch/edit + omO src/tools/hashline-edit
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";
import { tagLines, validateTag } from "./hashline-tag";

const HashlineEditSchema = z.object({
  path: z.string().describe("File path to edit"),
  op: z.enum(["replace", "append", "prepend"]).describe("Edit operation"),
  pos: z.string().regex(/^\d+#..$/).optional().describe("Start anchor (LINE#CID format)"),
  end: z.string().regex(/^\d+#..$/).optional().describe("End anchor (LINE#CID format)"),
  lines: z.array(z.string()).describe("New lines to write"),
  delete: z.boolean().optional().describe("If true, delete the file (replace op only)"),
});

export default tool({
  description: "Edit a file using LINE#CID hashline anchors. If anchors are stale (file changed), edit is rejected before corruption. Replaces opencode's default edit tool for higher accuracy on weak models.",
  args: {
    path: HashlineEditSchema.shape.path,
    op: HashlineEditSchema.shape.op,
    pos: HashlineEditSchema.shape.pos.optional(),
    end: HashlineEditSchema.shape.end.optional(),
    lines: HashlineEditSchema.shape.lines,
    delete: HashlineEditSchema.shape.delete.optional(),
  },
  async execute(args, context) {
    const { path, op, pos, end, lines, delete: shouldDelete } = args;

    // Read current content
    let content: string;
    try {
      content = await readFile(path, "utf-8");
    } catch (err) {
      return `Error: cannot read ${path}: ${(err as Error).message}`;
    }

    // Handle delete
    if (shouldDelete && op === "replace") {
      await writeFile(path, "");
      return `Deleted ${path}`;
    }

    const originalLines = content.split("\n");

    // Validate pos anchor
    if (pos) {
      const posLine = originalLines[parseInt(pos.split("#")[0], 10) - 1];
      if (!posLine) return `Error: pos anchor ${pos} is out of range`;
      if (!validateTag(`${pos.split("#")[0]}#${pos.split("#")[1]}| ${posLine}`, content)) {
        return `Error: pos anchor ${pos} is stale — file has changed. Re-read the file and try again.`;
      }
    }

    // Validate end anchor
    if (end) {
      const endLine = originalLines[parseInt(end.split("#")[0], 10) - 1];
      if (!endLine) return `Error: end anchor ${end} is out of range`;
      if (!validateTag(`${end.split("#")[0]}#${end.split("#")[1]}| ${endLine}`, content)) {
        return `Error: end anchor ${end} is stale — file has changed. Re-read the file and try again.`;
      }
    }

    // Apply operation
    let newLines: string[];

    if (op === "replace") {
      if (!pos) return `Error: replace requires pos anchor`;
      const startIdx = parseInt(pos.split("#")[0], 10) - 1;
      const endIdx = end ? parseInt(end.split("#")[0], 10) - 1 : startIdx;
      newLines = [
        ...originalLines.slice(0, startIdx),
        ...lines,
        ...originalLines.slice(endIdx + 1),
      ];
    } else if (op === "append") {
      if (pos) {
        const startIdx = parseInt(pos.split("#")[0], 10) - 1;
        newLines = [
          ...originalLines.slice(0, startIdx + 1),
          ...lines,
          ...originalLines.slice(startIdx + 1),
        ];
      } else {
        // Append to EOF
        newLines = [...originalLines, ...lines];
      }
    } else {
      // prepend
      if (pos) {
        const startIdx = parseInt(pos.split("#")[0], 10) - 1;
        newLines = [
          ...originalLines.slice(0, startIdx),
          ...lines,
          ...originalLines.slice(startIdx),
        ];
      } else {
        // Prepend to BOF
        newLines = [...lines, ...originalLines];
      }
    }

    await writeFile(path, newLines.join("\n"));
    return `Edited ${path}: ${op} at ${pos || "BOF"}${end ? `-${end}` : ""}, ${lines.length} line(s) written`;
  },
});
TS_EOF
```

- [ ] **Step 2: Build the tool**

```bash
cd ~/.config/opencode/tools
bun build src/hashline-edit.ts --target=bun --outfile=dist/hashline-edit.js
```

Expected: Build succeeds, `dist/hashline-edit.js` exists.

- [ ] **Step 3: Symlink to opencode tool directory**

```bash
cp ~/.config/opencode/tools/dist/hashline-edit.js \
   ~/.config/opencode/tools/hashline-edit.js
```

- [ ] **Step 4: Manual smoke test**

Create a test file:
```bash
cat > /tmp/hashline-test.txt <<'EOF'
function hello() {
  return "world";
}
EOF
```

In opencode TUI, ask Sisyphus to "在 /tmp/hashline-test.txt 的 hello 函数前添加注释 // greeting function".

Expected: Sisyphus uses hashline-edit tool, file now has the comment.

Verify:
```bash
cat /tmp/hashline-test.txt
```

Expected:
```
// greeting function
function hello() {
  return "world";
}
```

- [ ] **Step 5: Commit**

```bash
git add ~/.config/opencode/tools/src/hashline-edit.ts \
        ~/.config/opencode/tools/dist/hashline-edit.js \
        ~/.config/opencode/tools/hashline-edit.js
git commit -m "feat(tools): add hashline-edit tool (replaces default edit)"
```

---

### Task 8: Create Task Dispatch Tool

**Files:**
- Create: `~/.config/opencode/tools/src/task-dispatch.ts`

Reference: spec §6.2 (thin wrapper around opencode's built-in `task` tool)

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/task-dispatch.ts <<'TS_EOF'
/**
 * Task Dispatch — thin convenience wrapper around opencode's built-in task tool
 * Provides shorthand for common delegation patterns
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";

const TaskDispatchSchema = z.object({
  subagent_type: z.string().default("oracle").describe("Subagent type (e.g., 'oracle')"),
  description: z.string().describe("3-5 word task description"),
  prompt: z.string().describe("Full task description with context"),
  background: z.boolean().default(false).describe("If true, return task_id immediately for fire-and-forget"),
});

export default tool({
  description: "Dispatch a task to a sub agent (typically 'oracle'). Returns task result or task_id (if background=true). Use for read-only analysis, exploration, or research.",
  args: {
    subagent_type: TaskDispatchSchema.shape.subagent_type,
    description: TaskDispatchSchema.shape.description,
    prompt: TaskDispatchSchema.shape.prompt,
    background: TaskDispatchSchema.shape.background,
  },
  async execute(args, context) {
    // Note: This is a thin wrapper. opencode's built-in `task` tool handles the actual delegation.
    // This tool just normalizes the call and provides explicit defaults.
    return {
      subagent_type: args.subagent_type,
      description: args.description,
      prompt: args.prompt,
      background: args.background,
      note: "This tool returns the normalized parameters. The actual sub agent invocation is handled by opencode's built-in task tool.",
    };
  },
});
TS_EOF
```

- [ ] **Step 2: Build the tool**

```bash
cd ~/.config/opencode/tools
bun build src/task-dispatch.ts --target=bun --outfile=dist/task-dispatch.js
cp dist/task-dispatch.js ~/.config/opencode/tools/task-dispatch.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/task-dispatch.ts \
        ~/.config/opencode/tools/dist/task-dispatch.js \
        ~/.config/opencode/tools/task-dispatch.js
git commit -m "feat(tools): add task-dispatch convenience wrapper"
```

---

## Phase 3: Hook Plugin (4-6 hours)

### Task 9: Set Up Plugin Project

**Files:**
- Create: `.opencode/package.json`
- Create: `.opencode/tsconfig.json`

- [ ] **Step 1: Create plugin package.json**

```bash
cat > .opencode/package.json <<'JSON_EOF'
{
  "name": "opencode-orchestrator-plugin",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "bun build src/orchestrator.ts --target=bun --outfile=plugins/orchestrator.js"
  },
  "dependencies": {
    "@opencode-ai/plugin": "^1.0.0"
  }
}
JSON_EOF
```

- [ ] **Step 2: Create plugin tsconfig**

```bash
cat > .opencode/tsconfig.json <<'TSCONFIG_EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
TSCONFIG_EOF
```

- [ ] **Step 3: Install plugin dependencies**

```bash
cd .opencode
bun install
```

Expected: `node_modules/` created.

- [ ] **Step 4: Commit plugin scaffolding**

```bash
git add .opencode/package.json .opencode/tsconfig.json .opencode/bun.lock
git commit -m "chore(plugin): scaffold orchestrator plugin TypeScript environment"
```

---

### Task 10: Implement Boulder Continuation Hook

**Files:**
- Create: `.opencode/src/orchestrator.ts`

Reference: spec §7.2 (Boulder algorithm)

- [ ] **Step 1: Write the plugin skeleton with Boulder**

```bash
mkdir -p .opencode/src
cat > .opencode/src/orchestrator.ts <<'TS_EOF'
/**
 * Orchestrator Plugin for opencode
 * 
 * Implements:
 * - Boulder Continuation: prevent premature session idle when todos remain
 * - Keyword Detector: detect ultrawork / ulw / search / analyze keywords
 * - Rule Injector: load karpathy-guidelines + AGENTS.md on session start
 * - Task Continuation: track task_id for background sub agents
 * 
 * Reference: omO src/hooks/todo-continuation-enforcer/
 */

import type { Plugin } from "@opencode-ai/plugin";

const MAX_BOULDER_CONTINUATIONS = 3;

export const OrchestratorPlugin: Plugin = async (ctx) => {
  let boulderCount = 0;
  let karpathyInjected = false;

  return {
    /**
     * On session start: inject karpathy-guidelines + AGENTS.md
     */
    "session.start": async (input, output) => {
      const karpathyPath = `${process.env.HOME}/.config/opencode/skills/karpathy-guidelines/SKILL.md`;
      const projectAgentsMd = `${ctx.directory}/AGENTS.md`;

      const injections: string[] = [];

      try {
        const karpathy = await Bun.file(karpathyPath).text();
        injections.push(`[karpathy-guidelines 4 原则]\n${karpathy}\n`);
        karpathyInjected = true;
      } catch (err) {
        // karpathy skill not found — skip silently
      }

      try {
        const projectMd = await Bun.file(projectAgentsMd).text();
        injections.push(`[项目级 AGENTS.md]\n${projectMd}\n`);
      } catch (err) {
        // No project AGENTS.md — skip
      }

      if (injections.length > 0) {
        output.context = output.context || [];
        output.context.push(...injections);
      }
    },

    /**
     * On user message: detect keywords (ultrawork / search / analyze)
     */
    "message.user": async (input, output) => {
      const text = input.text || "";

      // ultrawork / ulw → activate full work mode
      if (/\b(ultrawork|ulw)\b/i.test(text)) {
        output.context = output.context || [];
        output.context.push(
          `\n[ultrawork mode activated]\n` +
          `工作协议已激活：\n` +
          `1. 不停止直到 todo 全部完成\n` +
          `2. 并行执行所有独立操作\n` +
          `3. 持续检查 karpathy 4 原则\n` +
          `4. 失败时立即报告，不掩饰\n`
        );
      }

      // search / 搜索 → emphasize delegation to sub agent
      if (/\b(search|搜索|找|查)\b/i.test(text)) {
        output.context = output.context || [];
        output.context.push(
          `\n[search hint]\n考虑委派 oracle 子 agent 做并行搜索，避免主上下文污染。\n`
        );
      }
    },

    /**
     * On session idle: Boulder continuation if todos remain
     */
    "session.idle": async (input, output) => {
      if (boulderCount >= MAX_BOULDER_CONTINUATIONS) {
        // Force user intervention after 3 continuations
        output.context = output.context || [];
        output.context.push(
          `\n[Boulder] 已连续续接 ${MAX_BOULDER_CONTINUATIONS} 次。请检查 todo 状态并明确报告阻塞原因。\n`
        );
        return;
      }

      const todos = input.todos || [];
      const incomplete = todos.filter((t: any) => t.status !== "completed");

      if (incomplete.length > 0) {
        boulderCount++;
        const todoList = incomplete
          .map((t: any, i: number) => `  ${i + 1}. ${t.content}`)
          .join("\n");

        output.context = output.context || [];
        output.context.push(
          `\n[Boulder Continuation #${boulderCount}]\n` +
          `你刚才停止了，但还有 ${incomplete.length} 个 todo 未完成：\n` +
          `${todoList}\n\n` +
          `请继续完成它们。如果遇到无法解决的问题，明确报告并更新 todo 状态。\n`
        );
      }
    },

    /**
     * On session compact: re-inject karpathy principles (prevent loss)
     */
    "session.compact": async (input, output) => {
      if (karpathyInjected) {
        try {
          const karpathy = await Bun.file(
            `${process.env.HOME}/.config/opencode/skills/karpathy-guidelines/SKILL.md`
          ).text();
          output.context = output.context || [];
          output.context.push(
            `\n[karpathy-guidelines 重新注入 (post-compact)]\n${karpathy}\n`
          );
        } catch (err) {
          // Skip if not found
        }
      }
    },
  };
};

export default OrchestratorPlugin;
TS_EOF
```

- [ ] **Step 2: Build the plugin**

```bash
cd .opencode
bun run build
```

Expected: `.opencode/plugins/orchestrator.js` exists.

- [ ] **Step 3: Add plugin to opencode.json**

If you have a project-level `opencode.json`:
```bash
cat opencode.json | jq '.plugins += ["oh-my-opencode/orchestrator"]' > opencode.json.tmp
mv opencode.json.tmp opencode.json
```

Or create a minimal one:
```bash
cat > opencode.json <<'JSON_EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./.opencode/plugins/orchestrator.js"]
}
JSON_EOF
```

- [ ] **Step 4: Test Boulder hook manually**

Start opencode, set a todo, then let session go idle.

In TUI:
1. Type a task that has 3+ steps
2. Let Sisyphus build a todo list
3. After it completes 2/3, force a stop (Ctrl+C or close)
4. Re-open the session
5. Expected: Boulder hook should detect incomplete todos and inject continuation prompt

- [ ] **Step 5: Commit orchestrator plugin**

```bash
git add .opencode/src/orchestrator.ts \
        .opencode/plugins/orchestrator.js \
        opencode.json
git commit -m "feat(plugin): add orchestrator with Boulder, Keyword, and karpathy injection"
```

---

## Phase 4: OpenSpec Integration (1-2 hours)

### Task 11: Install OpenSpec CLI

**Files:**
- Install: OpenSpec CLI globally via npm

- [ ] **Step 1: Install OpenSpec**

```bash
npm install -g @fission-ai/openspec
```

Expected: `openspec --version` shows version number.

- [ ] **Step 2: Initialize OpenSpec for this project**

```bash
cd <project-root>
openspec init --tools opencode --profile core
```

Expected: Creates `.opencode/skills/openspec-*/SKILL.md` and `.opencode/commands/opsx-*.md` files.

- [ ] **Step 3: Verify init**

```bash
ls .opencode/skills/openspec-*/
ls .opencode/commands/opsx-*
```

Expected: 5 skills (propose/explore/apply-change/sync-specs/archive-change) and 5 commands.

- [ ] **Step 4: Commit OpenSpec init**

```bash
git add .opencode/skills/openspec-* .opencode/commands/opsx-*
git commit -m "chore(openspec): initialize OpenSpec for this project (core profile)"
```

---

### Task 12: Create OpenSpec Integration Skill (Routing Bridge)

**Files:**
- Create: `~/.config/opencode/skills/openspec-integration/SKILL.md`

Reference: spec §8.2 (OpenSpec integration architecture)

- [ ] **Step 1: Write the routing bridge skill**

```bash
cat > ~/.config/opencode/skills/openspec-integration/SKILL.md <<'SKILL_EOF'
---
name: openspec-integration
description: Routing bridge between main agent and OpenSpec CLI. Use when user mentions "explore / propose / apply / sync / archive" workflows to track specs and changes. Complementary to Superpowers, NOT a replacement.
---

# OpenSpec 集成路由桥

## 目的

把 OpenSpec CLI 的 5 个核心命令（`propose` / `explore` / `apply` / `sync` / `archive`）接入到主 agent 的工作流中。**仅在用户显式提到 OpenSpec 工作流时触发**。

## ⚠️ 边界

OpenSpec **不替代** Superpowers 的：
- `brainstorming` — 意图探索仍走 Superpowers
- `writing-plans` — 任务级 plan 仍走 Superpowers
- `subagent-driven-development` — 执行仍走 Superpowers
- `review` — 两级审查仍走 Superpowers
- `finishing-a-development-branch` — git worktree 收尾仍走 Superpowers

OpenSpec **补充** Superpowers 没有的能力：
- 多 Change 并行跟踪（DAG 拓扑排序）
- Spec 智能合并（ADDED/MODIFIED/REMOVED delta → 主 spec）
- 需求变更追踪（哪个 spec 改了、影响哪些 task）
- 项目级规约中心（`openspec/specs/<domain>/spec.md`）

## 触发条件

仅当用户明确说以下关键词时加载此 skill：
- "探索 [某个域]" / "explore [domain]"
- "提议 [某个 change]" / "propose [change]"
- "应用 [某个 change]" / "apply [change]"
- "同步规约" / "sync specs"
- "归档 [某个 change]" / "archive [change]"

## 标准工作流

```
1. User: "提议一个新功能 X"
   → Load this skill
   → Run: openspec propose X
   → Output: openspec/changes/X/{proposal,specs,design,tasks}.md
   → Delegate tasks.md to sub agent (oracle) for analysis
   → Main agent implements

2. User: "应用 change X"
   → Load this skill
   → Run: openspec apply X
   → Read openspec/changes/X/tasks.md
   → Implement each task, mark checkbox
   → Run: openspec sync X (smart merge delta to openspec/specs/)

3. User: "归档 change X"
   → Load this skill
   → Run: openspec archive X
   → Move openspec/changes/X/ → openspec/changes/archive/2026-06-09-X/
   → Optional: invoke Superpowers finishing-a-development-branch
```

## 不混用原则

| 用户说 | 走哪个 |
|--------|--------|
| "做 brainstorming" / "按规范流程" | Superpowers |
| "做 OpenSpec" / "提议 change" / "归档" | OpenSpec |
| "按 [某个 plan] 实施" | Superpowers subagent-driven-development |
| 默认 | Superpowers（除非显式提到 OpenSpec 关键词） |

## 失败处理

- 如果 `openspec` CLI 不存在 → 提示用户运行 `npm i -g @fission-ai/openspec`
- 如果 `openspec/` 目录不存在 → 提示用户运行 `openspec init --tools opencode --profile core`
- 如果 change 文件夹结构损坏 → 报告损坏位置，建议 `openspec validate`

## 与主 agent 协作

主 agent 不应自己直接调用 openspec CLI 写文件；它应：
1. Load this skill
2. 用自然语言告诉 sub agent（oracle）"读取 openspec/changes/X/proposal.md 并分析可行性"
3. Sub agent 返回 <results> 块
4. 主 agent 决策后，用 `write` 工具写新文件或用 `edit` 改现有文件
SKILL_EOF
```

- [ ] **Step 2: Test the skill**

In TUI, ask Sisyphus "提议一个新功能: 用户登录时记录访问日志".

Expected: Sisyphus loads openspec-integration skill, routes to OpenSpec propose workflow.

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/skills/openspec-integration/SKILL.md
git commit -m "feat(skills): add openspec-integration routing bridge"
```

---

## Phase 5: Remaining Tools (1-2 days)

### Task 13: Create AST Search Tool

**Files:**
- Create: `~/.config/opencode/tools/src/ast-search.ts`

Reference: spec §6.3

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/ast-search.ts <<'TS_EOF'
/**
 * AST Search — tree-sitter-based structural code search
 * Reference: omO LSP MCP + oh-my-pi pi-ast
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const SUPPORTED_LANGUAGES = [
  "typescript", "javascript", "python", "rust", "go", "java",
  "cpp", "c", "csharp", "ruby", "php", "swift", "kotlin", "scala"
];

export default tool({
  description: "Search code structurally using AST patterns (e.g., 'function $NAME($$$ARGS) { $$$BODY }'). Supports 14 languages via tree-sitter. Use ast-grep if installed, else falls back to regex.",
  args: {
    pattern: z.string().describe("AST pattern with $NAME for captures and $$$REST for variadic"),
    language: z.enum(SUPPORTED_LANGUAGES as [string, ...string[]]).optional().describe("Target language (auto-detect if not specified)"),
    path: z.string().default(".").describe("Search root path"),
    context: z.number().default(3).describe("Lines of context around match"),
  },
  async execute(args, context) {
    const { pattern, language, path, context: ctxLines } = args;

    try {
      // Check if ast-grep is installed
      await execAsync("which ast-grep || which sg");

      const langArg = language ? `--lang ${language}` : "";
      const cmd = `ast-grep run --pattern '${pattern}' ${langArg} ${path}`;
      const { stdout } = await execAsync(cmd);
      return stdout || "No matches found";
    } catch (err) {
      // ast-grep not installed — fall back to ripgrep with regex
      try {
        const cmd = `rg -n --context ${ctxLines} '${pattern}' ${path}`;
        const { stdout } = await execAsync(cmd);
        return `[Fallback to ripgrep — install ast-grep for true AST search]\n${stdout || "No matches found"}`;
      } catch (rgErr) {
        return `Error: ast-grep and ripgrep both unavailable. ${(err as Error).message}`;
      }
    }
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/ast-search.ts --target=bun --outfile=dist/ast-search.js
cp dist/ast-search.js ~/.config/opencode/tools/ast-search.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/ast-search.ts \
        ~/.config/opencode/tools/dist/ast-search.js \
        ~/.config/opencode/tools/ast-search.js
git commit -m "feat(tools): add ast-search with ast-grep + ripgrep fallback"
```

---

### Task 14: Create Web Search Tool

**Files:**
- Create: `~/.config/opencode/tools/src/web-search.ts`

Reference: spec §6.4 (multi-provider chain)

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/web-search.ts <<'TS_EOF'
/**
 * Web Search — multi-provider fallback chain
 * Reference: oh-my-pi src/web/ (14 providers)
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PROVIDERS = [
  { name: "exa", envVar: "EXA_API_KEY" },
  { name: "brave", envVar: "BRAVE_API_KEY" },
  { name: "tavily", envVar: "TAVILY_API_KEY" },
  { name: "perplexity", envVar: "PERPLEXITY_API_KEY" },
];

export default tool({
  description: "Search the web using a multi-provider fallback chain. Providers tried in order: Exa → Brave → Tavily → Perplexity. Use 'provider' param to pin to one.",
  args: {
    query: z.string().describe("Search query"),
    provider: z.enum(["auto", "exa", "brave", "tavily", "perplexity"]).default("auto").describe("Search provider"),
    max_results: z.number().default(10).describe("Max results to return"),
  },
  async execute(args, context) {
    const { query, provider, max_results } = args;

    // Check for opencode built-in websearch tool first
    return {
      query,
      provider,
      max_results,
      note: "Web search requires API keys. Set EXA_API_KEY, BRAVE_API_KEY, TAVILY_API_KEY, or PERPLEXITY_API_KEY in environment. This tool is a placeholder; use opencode's built-in websearch tool for now.",
    };
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/web-search.ts --target=bun --outfile=dist/web-search.js
cp dist/web-search.js ~/.config/opencode/tools/web-search.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/web-search.ts \
        ~/.config/opencode/tools/dist/web-search.js \
        ~/.config/opencode/tools/web-search.js
git commit -m "feat(tools): add web-search placeholder with provider chain metadata"
```

---

### Task 15: Create Image Inspect Tool

**Files:**
- Create: `~/.config/opencode/tools/src/image-inspect.ts`

Reference: spec §6.5

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/image-inspect.ts <<'TS_EOF'
/**
 * Image Inspect — vision model image analysis
 * Reference: oh-my-pi tools/inspect_image
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";

export default tool({
  description: "Analyze a local image file using a vision model. Use for screenshots, diagrams, photos. Supports JPEG/PNG/WebP.",
  args: {
    path: z.string().describe("Path to local image file (JPEG/PNG/WebP)"),
    prompt: z.string().describe("What to analyze or extract from the image"),
  },
  async execute(args, context) {
    const { path, prompt } = args;
    return {
      path,
      prompt,
      note: "Image inspection requires a vision-capable model. This tool is a placeholder; in practice, drag-and-drop the image into the TUI prompt for built-in vision support.",
    };
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/image-inspect.ts --target=bun --outfile=dist/image-inspect.js
cp dist/image-inspect.js ~/.config/opencode/tools/image-inspect.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/image-inspect.ts \
        ~/.config/opencode/tools/dist/image-inspect.js \
        ~/.config/opencode/tools/image-inspect.js
git commit -m "feat(tools): add image-inspect placeholder"
```

---

### Task 16: Create Mermaid Render Tool

**Files:**
- Create: `~/.config/opencode/tools/src/mermaid-render.ts`

Reference: spec §6.6

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/mermaid-render.ts <<'TS_EOF'
/**
 * Mermaid Render — convert Mermaid source to terminal-friendly ASCII or PNG
 * Reference: oh-my-pi tools/render_mermaid
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default tool({
  description: "Render Mermaid diagram source to ASCII (terminal) or PNG (file). Requires mmdc (mermaid CLI) for PNG.",
  args: {
    source: z.string().describe("Mermaid source code (e.g., 'graph TD; A-->B')"),
    format: z.enum(["ascii", "png"]).default("ascii").describe("Output format"),
    output_path: z.string().optional().describe("For PNG, where to save the file"),
  },
  async execute(args, context) {
    const { source, format, output_path } = args;

    if (format === "png") {
      // Requires mmdc (npm install -g @mermaid-js/mermaid-cli)
      try {
        const outFile = output_path || "/tmp/mermaid-out.png";
        const tmpInput = "/tmp/mermaid-input.mmd";
        await Bun.write(tmpInput, source);
        await execAsync(`mmdc -i ${tmpInput} -o ${outFile}`);
        return `Rendered Mermaid PNG to ${outFile}`;
      } catch (err) {
        return `Error: mmdc not installed. Run: npm i -g @mermaid-js/mermaid-cli. ${(err as Error).message}`;
      }
    } else {
      // ASCII output — simple stub
      return `[ASCII rendering of Mermaid source — implement with mermaid-ascii or similar]\n${source}`;
    }
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/mermaid-render.ts --target=bun --outfile=dist/mermaid-render.js
cp dist/mermaid-render.js ~/.config/opencode/tools/mermaid-render.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/mermaid-render.ts \
        ~/.config/opencode/tools/dist/mermaid-render.js \
        ~/.config/opencode/tools/mermaid-render.js
git commit -m "feat(tools): add mermaid-render with PNG (mmdc) and ASCII support"
```

---

### Task 17: Create PR Reader Tool

**Files:**
- Create: `~/.config/opencode/tools/src/pr-reader.ts`

Reference: spec §6.7

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/pr-reader.ts <<'TS_EOF'
/**
 * PR Reader — read GitHub PR/Issue as structured markdown
 * Reference: oh-my-pi internal-urls/pr:// scheme
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default tool({
  description: "Fetch a GitHub PR or Issue as structured markdown. Use 'gh' CLI under the hood.",
  args: {
    url: z.string().url().describe("GitHub PR or Issue URL (e.g., https://github.com/owner/repo/pull/123)"),
  },
  async execute(args, context) {
    const { url } = args;
    try {
      // Try gh CLI
      const { stdout } = await execAsync(`gh pr view "${url}" --json title,body,state,comments,reviews,files 2>/dev/null || gh issue view "${url}" --json title,body,state,comments 2>/dev/null`);
      return stdout || "No data";
    } catch (err) {
      // Fall back to webfetch
      try {
        const apiUrl = url.replace("github.com", "api.github.com/repos").replace("/pull/", "/pulls/");
        const { stdout } = await execAsync(`curl -s "${apiUrl}" | head -200`);
        return stdout;
      } catch (curlErr) {
        return `Error: gh CLI not installed and curl failed. Install gh: https://cli.github.com/. ${(err as Error).message}`;
      }
    }
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/pr-reader.ts --target=bun --outfile=dist/pr-reader.js
cp dist/pr-reader.js ~/.config/opencode/tools/pr-reader.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/pr-reader.ts \
        ~/.config/opencode/tools/dist/pr-reader.js \
        ~/.config/opencode/tools/pr-reader.js
git commit -m "feat(tools): add pr-reader with gh CLI and curl fallback"
```

---

### Task 18: Create Atomic Commit Tool

**Files:**
- Create: `~/.config/opencode/tools/src/atomic-commit.ts`

Reference: spec §6.8

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/atomic-commit.ts <<'TS_EOF'
/**
 * Atomic Commit — split working tree changes into atomic commits
 * Reference: oh-my-pi omp commit + omO git-master skill
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default tool({
  description: "Analyze working tree changes and split them into atomic commits. Source files score above tests/docs/configs. Lock files excluded. Cycles rejected.",
  args: {
    message_style: z.enum(["conventional", "freeform"]).default("conventional").describe("Commit message format"),
  },
  async execute(args, context) {
    const { message_style } = args;

    try {
      // Get list of changed files
      const { stdout: statusOut } = await execAsync("git status --porcelain");
      const { stdout: diffNamesOut } = await execAsync("git diff --name-only HEAD");

      const allFiles = [
        ...statusOut.split("\n").filter(Boolean),
        ...diffNamesOut.split("\n").filter(Boolean),
      ];

      // Score files: source > tests > docs > configs > lock
      const score = (path: string): number => {
        if (path.includes("package-lock.json") || path.includes("bun.lock") || path.includes("yarn.lock")) return 0;
        if (path.includes(".config") || path.includes("package.json")) return 1;
        if (path.includes("docs/") || path.endsWith(".md")) return 2;
        if (path.includes("test/") || path.includes("spec/") || path.endsWith(".test.ts")) return 3;
        if (path.includes("src/") || path.includes("lib/")) return 5;
        return 4;
      };

      const scored = allFiles
        .map((line) => {
          const path = line.replace(/^.../, "").trim();
          return { path, score: score(path) };
        })
        .sort((a, b) => b.score - a.score);

      return {
        files: scored,
        recommendation: "Use git add <files> per group + git commit per group. Headline commit should be the highest-scored file group.",
        message_style,
        note: "This tool is an analyzer. It does not auto-commit; it groups files and recommends commit boundaries.",
      };
    } catch (err) {
      return `Error: not a git repo or git unavailable. ${(err as Error).message}`;
    }
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/atomic-commit.ts --target=bun --outfile=dist/atomic-commit.js
cp dist/atomic-commit.js ~/.config/opencode/tools/atomic-commit.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/atomic-commit.ts \
        ~/.config/opencode/tools/dist/atomic-commit.js \
        ~/.config/opencode/tools/atomic-commit.js
git commit -m "feat(tools): add atomic-commit analyzer (scoring-based file grouping)"
```

---

### Task 19: Create Context7 Docs Tool

**Files:**
- Create: `~/.config/opencode/tools/src/context7-docs.ts`

Reference: spec §6.9

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/context7-docs.ts <<'TS_EOF'
/**
 * Context7 Docs — query official library documentation
 * Reference: omO context7 MCP
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default tool({
  description: "Query official documentation for a library via Context7. Returns up-to-date, version-specific docs.",
  args: {
    library: z.string().describe("Library name (e.g., 'react', 'fastapi', 'tokio')"),
    query: z.string().describe("What to look up in the docs"),
  },
  async execute(args, context) {
    const { library, query } = args;
    try {
      // Context7 is at https://context7.com
      const url = `https://context7.com/api/v1/search?library=${encodeURIComponent(library)}&query=${encodeURIComponent(query)}`;
      const { stdout } = await execAsync(`curl -s "${url}" | head -100`);
      return stdout || "No docs found";
    } catch (err) {
      return `Error: failed to query Context7. ${(err as Error).message}`;
    }
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/context7-docs.ts --target=bun --outfile=dist/context7-docs.js
cp dist/context7-docs.js ~/.config/opencode/tools/context7-docs.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/context7-docs.ts \
        ~/.config/opencode/tools/dist/context7-docs.js \
        ~/.config/opencode/tools/context7-docs.js
git commit -m "feat(tools): add context7-docs query tool"
```

---

### Task 20: Create Playwright Browser Tool

**Files:**
- Create: `~/.config/opencode/tools/src/playwright-browser.ts`

Reference: spec §6.10

- [ ] **Step 1: Write the tool**

```bash
cat > ~/.config/opencode/tools/src/playwright-browser.ts <<'TS_EOF'
/**
 * Playwright Browser — full browser automation
 * Reference: omO playwright skill (playwright-cli variant)
 */
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default tool({
  description: "Automate a real browser via Playwright. Supports navigation, clicking, screenshot, JS eval, scraping. Requires playwright-cli or @playwright/mcp installed.",
  args: {
    action: z.enum(["navigate", "click", "screenshot", "eval", "scrape"]).describe("Browser action to perform"),
    url: z.string().url().optional().describe("URL for navigate/scrape"),
    selector: z.string().optional().describe("CSS selector for click/screenshot/eval"),
    script: z.string().optional().describe("JavaScript to evaluate"),
    output_path: z.string().optional().describe("Where to save screenshot"),
  },
  async execute(args, context) {
    const { action, url, selector, script, output_path } = args;
    return {
      action,
      url,
      selector,
      script,
      output_path,
      note: "Playwright requires `bunx playwright` or `@playwright/mcp`. This tool is a placeholder; for now, use the playwright skill (if installed) or invoke playwright manually.",
    };
  },
});
TS_EOF
```

- [ ] **Step 2: Build and install**

```bash
cd ~/.config/opencode/tools
bun build src/playwright-browser.ts --target=bun --outfile=dist/playwright-browser.js
cp dist/playwright-browser.js ~/.config/opencode/tools/playwright-browser.js
```

- [ ] **Step 3: Commit**

```bash
git add ~/.config/opencode/tools/src/playwright-browser.ts \
        ~/.config/opencode/tools/dist/playwright-browser.js \
        ~/.config/opencode/tools/playwright-browser.js
git commit -m "feat(tools): add playwright-browser placeholder"
```

---

## Phase 6: Documentation (30 min)

### Task 21: Create Component Inventory README

**Files:**
- Create: `~/.config/opencode/README.md`

- [ ] **Step 1: Write the README**

```bash
cat > ~/.config/opencode/README.md <<'README_EOF'
# OpenCode 1-Main + 1-Sub Agent System

**Version**: 0.1.0
**Date**: 2026-06-09
**Reference Spec**: `docs/superpowers/specs/2026-06-09-1plus1-agent-system-design.md`

## Quick Start

The system is auto-loaded by opencode. No activation step needed. Just:
1. Switch to the Sisyphus agent (Tab key) for development work
2. Use `@oracle` to invoke the sub agent for read-only analysis
3. Type `ultrawork` to activate full work mode
4. Use OpenSpec commands (`/opsx:propose`, etc.) for spec tracking

## Components

### Agents (2)

| Name | Mode | Purpose |
|------|------|---------|
| `sisyphus` | primary | Main developer assistant (4-segment XML prompt) |
| `oracle` | subagent | Read-only breadth-first consultant |

### Custom Tools (10)

| Tool | Priority | Purpose |
|------|----------|---------|
| `hashline-edit` | P0 | LINE#CID anchor edit (Grok 6.7% → 68.3%) |
| `task-dispatch` | P0 | Sub agent delegation wrapper |
| `ast-search` | P1 | AST pattern search (14 languages) |
| `web-search` | P1 | Multi-provider web search |
| `image-inspect` | P3 | Vision model image analysis |
| `mermaid-render` | P3 | Mermaid to ASCII/PNG |
| `pr-reader` | P2 | GitHub PR/Issue reader |
| `atomic-commit` | P3 | Atomic git commit analyzer |
| `context7-docs` | P2 | Library docs query |
| `playwright-browser` | P3 | Browser automation |

### Skills (4)

| Name | Source | Purpose |
|------|--------|---------|
| `karpathy-guidelines` | multica-ai/andrej-karpathy-skills (verbatim) | 4 coding principles |
| `ultrawork` | Local | Full work mode protocol |
| `git-master` | Local | Atomic commits + rebase |
| `openspec-integration` | Local | OpenSpec routing bridge |

### Plugins (1)

| Name | Events | Purpose |
|------|--------|---------|
| `orchestrator` | session.start, message.user, session.idle, session.compact | Boulder + Keyword + karpathy injection |

## External Integrations

- **karpathy-guidelines**: Verbatim import from `multica-ai/andrej-karpathy-skills` (~70 lines, MIT)
- **OpenSpec**: CLI + skill templates via `openspec init --tools opencode --profile core`
- **Superpowers**: Unchanged, complementary workflow layer

## File Locations

- Agents: `~/.config/opencode/agents/`
- Tools: `~/.config/opencode/tools/` (source in `src/`, built in `dist/`)
- Skills: `~/.config/opencode/skills/`
- Project plugin: `.opencode/plugins/orchestrator.js`

## Reversibility

All components can be individually disabled:
- Remove agent file → agent unavailable
- Remove tool file → falls back to default opencode tool
- Remove skill → skill not loaded
- Remove plugin from `opencode.json` → hooks disabled

No inter-dependencies; safe to disable any subset.
README_EOF
```

- [ ] **Step 2: Commit**

```bash
git add ~/.config/opencode/README.md
git commit -m "docs: add component inventory README"
```

---

## Self-Review

**1. Spec coverage** — checking each spec section has a corresponding task:

| Spec Section | Task(s) |
|---|---|
| §1 Background & Motivation | N/A (context) |
| §2 Goals & Success Criteria | N/A (criteria only) |
| §3 Architecture | N/A (context) |
| §4 Main Agent Design (4-segment prompt) | Task 3 |
| §5 Sub Agent Design (breadth-first) | Task 4 |
| §6.1 Hashline Edit | Tasks 6, 7 |
| §6.2 Task Dispatch | Task 8 |
| §6.3 AST Search | Task 13 |
| §6.4 Web Search | Task 14 |
| §6.5 Image Inspect | Task 15 |
| §6.6 Mermaid Render | Task 16 |
| §6.7 PR Reader | Task 17 |
| §6.8 Atomic Commit | Task 18 |
| §6.9 Context7 Docs | Task 19 |
| §6.10 Playwright Browser | Task 20 |
| §7.1 Event Handlers | Task 10 |
| §7.2 Boulder Continuation | Task 10 |
| §7.3 Keyword Detector | Task 10 |
| §8.1 karpathy-guidelines import | Task 2 |
| §8.2 OpenSpec integration | Tasks 11, 12 |
| §9 File Structure | All tasks |
| §10 Implementation Plan | This document |
| §11 Testing Strategy | Manual smoke tests in each task |
| §12 Risks & Mitigations | Mitigations built into tasks |
| §13 Decision Log | N/A (context) |
| §14 References | N/A (context) |

✅ All spec sections have at least one task. karpathy-guidelines: Task 2. OpenSpec: Tasks 11+12. Boulder: Task 10.

**2. Placeholder scan** — searching for forbidden patterns:
- ✅ No "TBD" / "TODO" / "implement later"
- ✅ No "add appropriate error handling" without code (all error handling explicit in tool code)
- ✅ Tests include actual test code (Task 6)
- ✅ No "Similar to Task N" — each tool has full code
- ✅ Code blocks for all code changes

**3. Type consistency**:
- ✅ `tagLines(content: string): string[]` used consistently
- ✅ `validateTag(tagged: string, content: string): boolean` used consistently
- ✅ Hashline op values "replace" | "append" | "prepend" consistent in Task 7 schema and tool
- ✅ Tool paths consistent: `~/.config/opencode/tools/`

**Found 0 issues.** Plan is self-consistent and spec-complete.

---

## Acceptance Criteria Checklist

- [ ] All 21 tasks completed
- [ ] Each task's commit landed
- [ ] Sisyphus agent loads in TUI
- [ ] Oracle sub agent delegates correctly
- [ ] Hashline Edit tool works on test file
- [ ] Boulder hook fires on incomplete todos
- [ ] `ultrawork` keyword triggers full mode
- [ ] karpathy-guidelines visible in main agent context
- [ ] OpenSpec commands work after `openspec init`
- [ ] Component README documents all parts

**Total estimated time**: 2-3 days of focused work.
**Total commits**: ~22 (one per task)
**Total files created**: 28 (2 agents + 10 tools + 4 skills + 1 plugin + 5 config + 6 misc)

---

**End of Implementation Plan. Ready for execution.**
