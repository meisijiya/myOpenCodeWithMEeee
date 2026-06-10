# myOpenCodeWithMEeee v2.0 — 1 Main + 1 Assistant + 1 Worker (3-Tier Model)

**Date**: 2026-06-10
**Status**: Draft (replaces v1 design)
**Author**: User + opencode (brainstorming session)

---

## 1. Background & Motivation

### 1.1 What was wrong with v1

User feedback crystallized the problem:

> 我们项目不应该重复造轮子，应该秉承拿来主义，尽可能在 prompt 上进行创新和各种路由策略、架构等方向。
> 我们前面的工具实现是自己实现的还是别人提供的工具实现呢？skill是自己拿来用的吗？

**v1 audit (9 custom tools, mostly unnecessary)**:

| v1 tool | Already exists as | Should be |
|---------|-------------------|-----------|
| `web-search` | **MiniMax MCP `web_search`** (user already has it configured) | **Delete — use MCP** |
| `image-inspect` | **MiniMax MCP `understand_image`** | **Delete — use MCP** |
| `mermaid-render` | opencode built-in `webfetch` + `mermaid.live` | Delete or simplify to skill |
| `pr-reader` | opencode built-in `webfetch` + `gh` CLI | Delete or simplify to skill |
| `context7-docs` | Official `@context7/mcp` server | **Delete — use MCP** |
| `playwright-browser` | Official `@playwright/mcp` | **Delete — use MCP** |
| `atomic-commit` | opencode built-in `bash` + `git` | Delete or simplify to skill |
| `ast-search` | opencode built-in `grep` + `glob`; LSP MCP for AST | Delete (LSP MCP is more standard) |
| `task-dispatch` | opencode built-in `task` tool | **Keep** — wraps routing/MCP/timeout logic |
| `hashline-edit` | opencode built-in `edit` | **Keep** — truly innovative (Grok 6.7% → 68.3%) |

**v1 architecture** (1 main + 1 sub) was too thin:
- Single subagent can't differentiate between "code research" (high reasoning) and "CRUD scaffolding" (low reasoning)
- 3-tier model concept (high/medium/low) emerged from user feedback
- Need a "main agent assistant" for code collaboration with clean context

### 1.2 What was wrong with skill strategy

> skill 是自己拿来用的吗？

Yes, but inconsistently. `karpathy-guidelines` (verbatim import) and `openspec-integration` are good. The rest should be **brought in** from external sources (mattpocock/skills, oh-my-openagent, etc.), not custom-built.

### 1.3 Goal

v2 design philosophy (from user feedback):

```
拿来主义 (Take-and-use principle):
  - Tools: Use opencode built-ins + MCPs wherever possible
  - Skills: Import from external repos (verbatim or adapted)
  - Innovation: Focus on PROMPTS, ROUTING STRATEGIES, ARCHITECTURE
  - Differentiation: 1+1+1 architecture with 3-tier model dispatch
```

---

## 2. Goals & Success Criteria

### 2.1 Functional Goals

1. **3 agents** with clear role separation:
   - `Sisyphus` (primary, **high-tier model**): coordinates, designs, makes architectural decisions
   - `Lyra` (subagent, **mid-tier model**): main agent's "assistant" — code collaboration, research, mid-complexity implementation
   - `Hephaestus` (subagent, **low-tier model**): repetitive work — CRUD scaffolding, atomic refactors, bulk file ops

2. **Bring-in tools** (no custom reimplementation):
   - **Remove**: web-search, image-inspect, mermaid-render, pr-reader, context7-docs, playwright-browser, atomic-commit, ast-search
   - **Keep**: hashline-edit (true innovation), task-dispatch (router + MCP proxy + context)
   - **Newly added via bring-in**: 1+ MCP servers (Context7, Playwright) added to user's opencode.json

3. **Bring-in skills** (verbatim or adapted from external repos):
   - `karpathy-guidelines` (already imported, keep)
   - `openspec-integration` (already created, keep)
   - `mattpocock/grill-with-docs` (NEW import)
   - `mattpocock/diagnose` (NEW import)
   - `mattpocock/to-issues` (NEW import)
   - `mattpocock/caveman` (NEW, optional)

4. **Dynamic routing** in main agent's prompt:
   - Intent classification (research/CRUD/architecture/code-impl)
   - Pick assistant or worker based on complexity
   - Assistant can further delegate to worker

5. **3-tier model selection** (user-configurable):
   - Document the recommended tier assignments
   - OpenSpec handles main + assistant; worker bypasses OpenSpec
   - User assigns actual model IDs in `opencode.json` (no hardcoding)

### 2.2 Non-Functional Goals

- **Token efficiency**: Worker should run cheap models; assistant gets mid-tier for balance
- **Context cleanliness**: Assistant and worker both use isolated contexts (subagent pattern)
- **Composability**: All routing in **prompt**, not code
- **Reversibility**: User can disable any layer without breaking the rest
- **No "duplicate" tools**: If a tool already exists in opencode/MCP, don't reimplement

### 2.3 Success Criteria

- [ ] Web search / image inspection requests route to MiniMax MCP, not custom tool
- [ ] Main agent decides between assistant vs worker based on task complexity
- [ ] Worker handles ≥30% of routine tasks (CRUD, file ops) without main agent involvement
- [ ] 3-tier model config is in `opencode.json`, not hardcoded in prompt
- [ ] `karpathy-guidelines` is the only "self-written" skill (verbatim import is allowed)
- [ ] No more than **2 custom tools** (hashline-edit + task-dispatch)
- [ ] 80%+ of v1's tool LOC is **removed**

---

## 3. Architecture

### 3.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (TUI/IDE)                            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   opencode Runtime                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Main Agent: Sisyphus (mode: primary, high-tier model) │     │
│  │                                                        │     │
│  │  Prompt sections:                                      │     │
│  │  1. <role> + karpathy 4 principles                     │     │
│  │  2. <intent_gate> (7 intents → 3 routes)              │     │
│  │  3. <delegation_protocol> (assistant vs worker)       │     │
│  │  4. <mcp_routing> (use MCP tools when available)       │     │
│  │  5. <openspec_protocol> (delegate to OpenSpec)        │     │
│  │  6. <style_guide>                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│            │                            │                        │
│            │ task(subagent_type=        │ task(subagent_type=    │
│            │      "lyra", model=mid)    │      "hephaestus",     │
│            │                            │      model=low)        │
│            ▼                            ▼                        │
│  ┌─────────────────────┐   ┌─────────────────────────────┐     │
│  │ Lyra (mode:         │   │ Hephaestus (mode:           │     │
│  │ subagent, mid-tier) │   │ subagent, low-tier)         │     │
│  │                     │   │                             │     │
│  │ Role: Main's        │   │ Role: Repetitive work       │     │
│  │ assistant. Clean    │   │ - CRUD scaffolding          │     │
│  │ context. Code       │   │ - Bulk file ops             │     │
│  │ collab + research.  │   │ - Atomic refactors          │     │
│  │                     │   │ - Test boilerplate          │     │
│  │ Can call worker for │   │                             │     │
│  │ sub-tasks.          │   │ OpenSpec: BYPASS            │     │
│  │ OpenSpec: USES      │   │ (CRUD doesn't need specs)  │     │
│  └─────────────────────┘   └─────────────────────────────┘     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Hook Plugin: orchestrator.ts                            │   │
│  │  - karpathy-guidelines injection (every LLM call)       │   │
│  │  - ultrawork / search keyword detection                   │   │
│  │  - 3-tier model check (warn if not configured)            │   │
│  │  - Compact re-injection of karpathy                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                External (bring-in)                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ MiniMax MCP     │  │ Context7 MCP    │  │ Playwright MCP  │  │
│  │ web_search      │  │ library docs    │  │ browser auto    │  │
│  │ understand_image│  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────────────────────────────┐│
│  │ OpenSpec CLI    │  │ External skill repos (verbatim/adapted)││
│  │ propose/explore │  │ - karpathy-guidelines (multica-ai)     ││
│  │ apply/sync/arch │  │ - mattpocock skills                    ││
│  └─────────────────┘  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Routing Logic (in Sisyphus prompt)

| User intent | Route to | Tier | OpenSpec? | Notes |
|-------------|----------|------|-----------|-------|
| Architecture / design | Sisyphus self | high | yes (propose) | Sisyphus handles directly |
| Complex code (multi-file, new feature) | Lyra | mid | yes | Mid-tier reasoning, clean context |
| Research / exploration | Lyra | mid | no | Lyra reads docs/code, returns summary |
| Debugging (hard) | Lyra | mid | no | Mid-tier with reproduce→diagnose loop |
| Debugging (simple) | Sisyphus self | high | no | Self-handle if obvious |
| CRUD / repetitive | Hephaestus | low | no | Bulk ops, boilerplate |
| Atomic refactor | Hephaestus | low | no | Mechanical transformation |
| Test boilerplate | Hephaestus | low | no | Generate test scaffolds |

**Key insight**: Tier assignment is based on **reasoning complexity**, not file count.

### 3.3 Component Inventory

| Component | Type | Status | Source |
|-----------|------|--------|--------|
| `sisyphus.md` | Primary agent prompt | REWRITE | Self (with karpathy + new routing) |
| `lyra.md` | Subagent prompt (mid-tier) | NEW | Self |
| `hephaestus.md` | Subagent prompt (low-tier) | NEW | Self |
| `hashline-edit.ts` | Custom tool | KEEP | Self (true innovation) |
| `task-dispatch.ts` | Custom tool | REWRITE | Self (router + MCP proxy) |
| `web-search.ts` | Custom tool | **DELETE** | Use MiniMax MCP |
| `image-inspect.ts` | Custom tool | **DELETE** | Use MiniMax MCP |
| `mermaid-render.ts` | Custom tool | **DELETE** | Use `webfetch` + skill |
| `pr-reader.ts` | Custom tool | **DELETE** | Use `webfetch` + `gh` CLI |
| `context7-docs.ts` | Custom tool | **DELETE** | Add `@context7/mcp` |
| `playwright-browser.ts` | Custom tool | **DELETE** | Add `@playwright/mcp` |
| `atomic-commit.ts` | Custom tool | **DELETE** | Use `bash` + `git` + skill |
| `ast-search.ts` | Custom tool | **DELETE** | Use `grep` + LSP MCP |
| `karpathy-guidelines/SKILL.md` | Skill | KEEP | multica-ai/andrej-karpathy-skills (verbatim) |
| `openspec-integration/SKILL.md` | Skill | KEEP | Local |
| `grill-with-docs/SKILL.md` | Skill | NEW IMPORT | mattpocock/skills (verbatim) |
| `diagnose/SKILL.md` | Skill | NEW IMPORT | mattpocock/skills (adapted) |
| `to-issues/SKILL.md` | Skill | NEW IMPORT | mattpocock/skills (adapted) |
| `orchestrator.ts` | Plugin | MODIFY | Add 3-tier model validation |
| `MiniMax` MCP | External | KEEP (user already has) | User-configured |
| `Context7` MCP | External | NEW (add to opencode.json) | `@context7/mcp` |
| `Playwright` MCP | External | NEW (add to opencode.json) | `@playwright/mcp` |

---

## 4. Agent Prompts Design

### 4.1 Sisyphus (Main, High-Tier)

Same 4-segment XML structure as v1, but updated routing:

```yaml
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
  # 第 1 层（主 agent）：可创建第 2 层子 agent
  # 显式 allow 列表，deny 通配符兜底
  # 深度=3 约束：主 → 子 → 叶子（Hephaestus）
  task:
    "*": deny           # 默认禁止调任何子 agent
    lyra: allow         # 显式允许调 Lyra
    hephaestus: allow   # 显式允许调 Hephaestus
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

| 意图 | 触发条件 | 路由 | 模型档位 | OpenSpec? |
|------|---------|------|---------|-----------|
| ARCHITECTURE | 重大架构决策 | 自己 | high | yes (propose) |
| DESIGN | 新特性设计 | 自己 | high | yes (propose) |
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
上下文：纯净（subagent 模式）
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
OpenSpec：绕过（CRUD 不需要 spec）

## 后台任务
使用 background: true + task_id，可续接。

## 嵌套规则：深度=3（主 → 子 → 叶子）
- Sisyphus (主) 可调 Lyra + Hephaestus
- Lyra (子) 只能调 Hephaestus
- Hephaestus (叶子) 不能再调任何子 agent（`task: deny` 是 opencode 强制保证）

## Lyra 可以进一步委派 Hephaestus
复杂实现中如果涉及重复性子任务，Lyra 自行委派给 Hephaestus。Hephaestus 完成任务后直接返回 Lyra。
</delegation_protocol>

<mcp_routing>
# 工具路由：优先使用 MCP

如果有等价 MCP 工具，**不要**自建。opencode.json 已配置：
- MiniMax MCP: web_search, understand_image
- Context7 MCP (待添加): 库文档查询
- Playwright MCP (待添加): 浏览器自动化

使用 MCP 工具前缀 `mcp__`（例如 `mcp__MiniMax__web_search`）。
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
```

### 4.2 Lyra (Assistant, Mid-Tier)

```yaml
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
  # - 默认 deny 防止无限嵌套
  # - 显式 allow Hephaestus（PID 的 worker）
  # - 注意：opencode 的 `permission.task` 用 glob 模式 + last-rule-wins
  task:
    "*": deny           # 默认禁止调任何子 agent
    hephaestus: allow   # 显式允许调 Hephaestus
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
```

### 4.3 Hephaestus (Worker, Low-Tier)

```yaml
---
name: hephaestus
description: 重复性 worker (low-tier), CRUD / 原子重构 / 测试脚手架
mode: subagent
temperature: 0.3
permission:
  edit: ask
  write: ask
  read: allow
  grep: allow
  glob: allow
  webfetch: ask
  websearch: deny
  # 嵌套控制：worker 不再委派（Pi Subagents 的 allowed_subagents 思想）
  task: deny
  skill: allow
  # bash 安全 glob（Pi Subagents 的"替换 Worker 的 bash"思想）：
  # - 默认 allow 保持高效
  # - 显式 deny 危险命令（rm -rf /, git push --force, mkfs, dd 等）
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
不可用：websearch, task, write-only operations without approval
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
```

### 4.4 Prompt Innovation: Why 4-Segment XML

This is the **true innovation** of v2 — not the tools, but the **prompt architecture**:
- **4 segments compose**: change one without touching others
- **Intent gate** is the routing logic — embedded in natural language
- **Delegation protocol** is the inter-agent contract — declarative
- **Style guide** is the personality layer — overridable per-agent

Each segment can be A/B tested independently. This is what makes the system different from "agents with system prompts".

### 4.5 Pi Subagents Inspiration: Frontmatter Nesting + Bash Safety

Reference: [Pi Subagents 笔记](https://github.com/mattpocock/skills) — lightweight sub-agent extension philosophy.

**Two key innovations adopted**:

#### 4.5.1 `permission.task` for nested subagent control (Pi's `allowed_subagents`)

Pi's `allowed_subagents` frontmatter field lets each agent declare which sub-agents it can spawn. opencode 1.16.2 implements this via `permission.task` with glob patterns (last-rule-wins).

**Strict depth=3 rule** (per user feedback): 主 → 子 → 叶子，共 3 层。

**Examples** (see §4.1, §4.2, §4.3 above):

- **Sisyphus** (primary, 第1层): can dispatch to both Lyra and Hephaestus
  ```yaml
  task:
    "*": deny           # 默认禁止
    lyra: allow         # 显式允许调 Lyra
    hephaestus: allow   # 显式允许调 Hephaestus
  ```
- **Lyra** (mid, 第2层): can only call Hephaestus (叶子)
  ```yaml
  task:
    "*": deny
    hephaestus: allow
  ```
- **Hephaestus** (low, 第3层 / 叶子): cannot call any sub-agent
  ```yaml
  task: deny
  ```

**Hard guarantee**: Hephaestus `task: deny` → opencode **removes the Task tool description entirely** for Hephaestus. The model physically cannot spawn children.

**Effect**: When the model tries to call an unallowed sub-agent, opencode **removes it from the Task tool description entirely**. The model never sees the option.

#### 4.5.2 Bash safe-glob (Pi's "replace Worker bash")

Pi's Worker has its bash tool **replaced** with a safer version that blocks `rm -rf /`, etc. opencode implements this via `permission.bash` with glob patterns.

**Hephaestus's bash safe-glob** (see §4.3):
```yaml
bash:
  "*": allow                # 默认允许
  "rm -rf /*": deny          # 灾难性删除
  "sudo *": deny            # 提权
  "git push --force *": deny # 强制推送
  "git reset --hard *": deny # 硬重置
  "mkfs *": deny            # 格式化
  "dd *": deny              # 磁盘擦写
  "chmod -R 777 *": deny    # 权限放宽
```

**Effect**: User doesn't get asked (`ask` mode) for safe commands; dangerous commands are blocked at the tool description level.

#### 4.5.3 What we DIDN'T adopt (YAGNI)

- **`subagent_model` field**: opencode doesn't formally support this. Model assignment uses `model: provider/model-id` (verified).
- **`allowed_subagents` field (Pi's name)**: We use `permission.task` (opencode's native equivalent). Same effect.
- **`thinking_level` field**: opencode uses `temperature` instead.
- **Live observability footer**: opencode TUI already provides `Ctrl+O` (tool call details) and `Ctrl+L` (sub-agent output).

**Net result**: 2 lightweight frontmatter additions (task + bash), zero prompt changes, zero code. Aligns with user's "lightweight" preference.

---

## 5. Tool Strategy (Bring-In)

### 5.1 Hashline Edit (Keep, True Innovation)

**Why keep**: omO data shows 6.7% → 68.3% success rate on Grok Code Fast 1. This is the only tool that provides a meaningful capability gap.

**Implementation**: unchanged from v1 (FNV-1a CID, stale-anchor detection, 3 operations).

### 5.2 Task Dispatch (Rewrite, Router + MCP Proxy)

**Why keep**: 3 reasons from user feedback:
1. **Routing**: explicit surface for Sisyphus to invoke (vs implicit sub-agent dispatch)
2. **Context management**: explicit timeout, output filtering, context injection
3. **MCP proxy**: wrap MCP calls in our routing layer for normalization

**Implementation**: rewrite as a router:

```typescript
// Pseudo-code
async execute(args) {
  // 1. Normalize args
  // 2. If subagent_type === "mcp", proxy to MCP tool
  // 3. If subagent_type === "lyra"/"hephaestus", set timeout + inject context
  // 4. Return normalized output
}
```

### 5.3 Removed Tools (Replace with Built-ins / MCPs)

| Removed | Use Instead |
|---------|-------------|
| `web-search` | `mcp__MiniMax__web_search` (user already has) |
| `image-inspect` | `mcp__MiniMax__understand_image` |
| `mermaid-render` | Skill: `fetch https://mermaid.ink/{base64-svg}` + `webfetch` |
| `pr-reader` | `webfetch` + `gh issue/pr view` via `bash` |
| `context7-docs` | Add `@context7/mcp` to opencode.json |
| `playwright-browser` | Add `@playwright/mcp` to opencode.json |
| `atomic-commit` | `bash` + `git` + skill prompt |
| `ast-search` | `grep` + LSP MCP if available |

### 5.4 MCP Additions (install.sh / opencode.json)

```json
{
  "mcp": {
    "MiniMax": { /* keep, user already has */ },
    "Context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/sse"
    },
    "Playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp"]
    }
  }
}
```

---

## 6. Skill Strategy (Bring-In)

### 6.1 Keep (Verbatim Imports)

- `karpathy-guidelines` — from `multica-ai/andrej-karpathy-skills` (70 lines, MIT)

### 6.2 New Imports from mattpocock/skills

| Skill | What | Verbatim or adapted |
|-------|------|---------------------|
| `grill-with-docs` | Adversarial questioning with CONTEXT.md/ADR updates | Verbatim |
| `diagnose` | 6-phase debugging loop (reproduce→minimise→hypothesise→instrument→fix→regression-test) | Adapted (use with our `task-dispatch`) |
| `to-issues` | Break plans into vertical-slice issues | Verbatim |

### 6.3 Skill Auto-Loading Strategy

Sisyphus's prompt should **reference** these skills (so they're loaded on demand):
```
如需深度调研: 调用 grill-with-docs skill
如遇复杂 bug: 调用 diagnose skill
如需拆分为可领任务: 调用 to-issues skill
```

Lyra's prompt: same as Sisyphus.

Hephaestus's prompt: doesn't need these (no deep work).

---

## 7. Plugin Updates (orchestrator.ts)

### 7.1 3-Tier Model Validation

```typescript
"experimental.chat.system.transform": async (input, output) => {
  // 1. Inject karpathy
  // 2. Inject project AGENTS.md
  // 3. **NEW**: Validate 3-tier model config exists
  //    (warn if Sisyphus/Lyra/Hephaestus don't have models set)
};
```

### 7.2 Existing Behavior (Keep)

- karpathy injection
- AGENTS.md injection
- ultrawork/search keyword detection
- Compact re-injection

---

## 8. File Structure (v2)

```
myOpenCodeWithMEeee/
├── agents/
│   ├── sisyphus.md              # Main agent (4-segment XML, high-tier)
│   ├── lyra.md                  # NEW: Assistant (mid-tier)
│   └── hephaestus.md            # NEW: Worker (low-tier)
├── tools/                       # REDUCED to 2 tools
│   ├── src/
│   │   ├── hashline-tag.ts      # FNV-1a CID (unchanged)
│   │   ├── hashline-tag.test.ts
│   │   ├── hashline-edit.ts     # LINE#CID edit (unchanged)
│   │   ├── hashline-edit.test.ts
│   │   ├── task-dispatch.ts     # REWRITTEN: router + MCP proxy
│   │   └── task-dispatch.test.ts
│   └── (7 tools deleted)
├── .opencode/
│   ├── src/orchestrator.ts      # MODIFIED: + 3-tier model validation
│   └── (unchanged)
├── skills/
│   ├── karpathy-guidelines/     # Keep
│   ├── openspec-integration/    # Keep
│   ├── grill-with-docs/         # NEW IMPORT: mattpocock
│   ├── diagnose/                # NEW IMPORT: mattpocock (adapted)
│   └── to-issues/               # NEW IMPORT: mattpocock
├── docs/
│   ├── 2026-06-09-1plus1-agent-system-design.md   # v1 (archive)
│   └── 2026-06-10-1plus1plus1-agent-system-design.md  # v2 (this file)
├── install.sh                   # MODIFIED: add MCP config to opencode.json
├── uninstall.sh                 # MODIFIED: remove MCP config
└── README.md                    # REWRITTEN for v2
```

---

## 9. Migration Plan (v1 → v2)

### 9.1 Keep
- hashline-tag.ts + tests
- hashline-edit.ts + tests
- karpathy-guidelines/SKILL.md
- openspec-integration/SKILL.md
- orchestrator.ts (with modifications)
- install.sh / uninstall.sh (with modifications)
- All OpenSpec scaffolding

### 9.2 Delete (7 tools)
- web-search.ts + test
- image-inspect.ts + test
- mermaid-render.ts + test
- pr-reader.ts + test
- context7-docs.ts + test
- playwright-browser.ts + test
- atomic-commit.ts + test
- ast-search.ts + test (and tests)

### 9.3 Rewrite
- sisyphus.md (new routing, mcp_routing, openspec_protocol sections)
- task-dispatch.ts (router + MCP proxy)
- orchestrator.ts (3-tier model validation)
- install.sh (MCP config injection)
- uninstall.sh (MCP config removal)
- README.md (full v2 rewrite)

### 9.4 Add (NEW)
- lyra.md
- hephaestus.md
- grill-with-docs/SKILL.md (verbatim import)
- diagnose/SKILL.md (adapted import)
- to-issues/SKILL.md (verbatim import)

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| User doesn't have `@context7/mcp` or `@playwright/mcp` | Low | install.sh attempts to add; warn if npm install fails |
| 3-tier model config wrong in opencode.json | Med | orchestrator plugin warns at session start |
| Matt Pocock skill import has wrong path | Low | Verify import with skill loader before commit |
| Removing tools breaks existing workflows | Med | Uninstall preserves files for 1 release; deprecation note in README |
| `task-dispatch` rewrite breaks existing subagent calls | Med | Keep old behavior as fallback, log if used |

---

## 11. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-10 | 1+1+1 architecture | User requested 3-tier separation |
| 2026-06-10 | Delete 8 of 9 custom tools | "Don't reinvent" — use opencode built-ins + MCPs |
| 2026-06-10 | Keep hashline-edit | True innovation (6.7% → 68.3% per omO) |
| 2026-06-10 | Keep task-dispatch | Router + MCP proxy + explicit surface |
| 2026-06-10 | Add @context7/mcp + @playwright/mcp | Replace custom context7-docs + playwright-browser |
| 2026-06-10 | Model tiers: high/mid/low (user-configurable) | User explicit request |
| 2026-06-10 | OpenSpec: main + Lyra use, Hephaestus bypasses | CRUD doesn't need spec |
| 2026-06-10 | Matt Pocock skills: 3 imports (grill-with-docs, diagnose, to-issues) | "Skills are brought in" principle |
| 2026-06-10 | Prompt innovation is the true differentiator | User's "拿来主义 + prompt 创新" principle |
| 2026-06-10 | Adopt Pi Subagents: `permission.task` for nested agent control | opencode 1.16.2 native equivalent of Pi's `allowed_subagents`; prevents infinite recursion |
| 2026-06-10 | Strict depth=3 nesting rule: 主 → 子 → 叶子 | User requirement: no infinite recursion; Hephaestus is the terminal leaf with `task: deny` (hard guarantee via opencode) |
| 2026-06-10 | Adopt Pi Subagents: bash safe-glob in Hephaestus | opencode glob patterns match Pi's "replace Worker bash" goal; no user-prompting needed |

---

## 12. References

- v1 design: `docs/2026-06-09-1plus1-agent-system-design.md` (archived)
- Bilibili notes: `/mnt/c/Users/22923/Desktop/文档/` (5 files)
- Pi Subagents note: `/mnt/c/Users/22923/Downloads/Pi Subagents_轻量级的子代理扩展方案_BV1qcVQ66EuT_笔记.md`
- Matt Pocock skills: https://github.com/mattpocock/skills
- oh-my-openagent: https://github.com/code-yeongyu/oh-my-openagent
- karpathy-guidelines: https://github.com/multica-ai/andrej-karpathy-skills

---

**End of v2 Design Spec. Ready for implementation planning.**
