# 1-Main + 1-Sub Agent System — Design Spec

**Date**: 2026-06-09
**Status**: Draft (pending user review)
**Author**: opencode + user collaboration (brainstorming session)

---

## 1. Background & Motivation

### 1.1 Problem

Current opencode + Superpowers setup has a gap:
- **No main agent specialization**: uses generic `build` agent, lacks disciplined delegation patterns from omO
- **No subagent role separation**: `explore` / `general` / `scout` are too generic
- **No tool extension**: relies on built-in tools, missing high-leverage tools like Hashline Edit
- **No workflow hooks**: missing Boulder (todo enforcement), Keyword Trigger, background task continuation
- **No spec tracking**: cannot track multiple parallel changes, no smart spec sync

### 1.2 Reference Architectures

Two projects studied as design inspiration:

| Project | Stars | Philosophy | What to Steal |
|---------|-------|------------|---------------|
| [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) | 11.4k | "The Harness Problem" — agent failure is the tool's fault, not the model's | Hashline Edit, `://` URI scheme abstraction, persistent subagents with JTD-validated output |
| [code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) | 61.6k | "Discipline Agents" + "Sisyphus never works alone" | Dynamic 4-segment prompt (role/exploration/execution/style), category-based task dispatch, Boulder todo enforcement, ultrawork keyword trigger |

### 1.3 External Additions (NEW)

| Project | Stars | Integration Mode |
|---------|-------|------------------|
| [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | 172k | **Verbatim import** — single SKILL.md (~70 lines) of Karpathy's 4 coding principles |
| [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 53.7k | **Complementary only** — fills spec-tracking gaps Superpowers doesn't cover (multi-change DAG, smart delta sync, requirement traceability, project-level spec center) |

### 1.4 Non-Goals

- Not building 11 agents (Sisyphus/Hephaestus/Prometheus/Oracle/Librarian/Explore/Metis/Momus/Atlas/Multimodal-Looker/Sisyphus-Junior) — too heavy
- Not building team_mode (12 `team_*` tools, lead+8 members, tmux visualization) — out of scope
- Not building category-based model dispatch (visual-engineering / deep / quick / ultrabrain → model mapping) — let opencode handle via built-in model fallback
- Not replacing Superpowers workflows — OpenSpec is a **complement**, not a replacement

---

## 2. Goals & Success Criteria

### 2.1 Functional Goals

1. **Main agent** (Sisyphus-lite): full tool access, can write code, smartly delegates complex analysis to sub agent
2. **Sub agent** (Oracle-like): breadth-first consultant — combines explore + librarian + oracle into one read-only role
3. **10+ custom tools** registered in opencode, covering the most leverage points
4. **karpathy-guidelines** imported verbatim — applied to both main and sub agent
5. **OpenSpec** integrated for spec tracking — but only when user explicitly requests it
6. **Hook plugin** to enforce workflow discipline (Boulder continuation, keyword trigger, task continuation, rule injection)

### 2.2 Success Criteria

- [ ] Main agent delegates ~30% of complex tasks to sub agent (avoid doing deep analysis itself)
- [ ] Hashline Edit tool reduces edit errors on weak models (Grok Code Fast 1 baseline: 6.7% → 68.3% success rate)
- [ ] Boulder hook prevents premature session idle when todos remain
- [ ] `ultrawork` keyword triggers full work mode without re-prompting
- [ ] karpathy 4 principles visibly reduce over-engineering (qualitative)
- [ ] OpenSpec is opt-in: never auto-triggered; only when user says "explore" / "propose" / "archive" workflow

### 2.3 Non-Functional Goals

- **Latency**: 1 main + 1 sub agent < 2s overhead vs. current setup
- **Token efficiency**: sub agent should produce structured output, not prose
- **Discoverability**: all custom tools/skills/agents listed in `~/.config/opencode/README.md`
- **Reversibility**: any component can be disabled without breaking the rest

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
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Main Agent (Sisyphus-lite)                       │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ System Prompt (4 segments, XML-structured):        │  │   │
│  │  │   <role>  + karpathy 4 principles (explicit)       │  │   │
│  │  │   <intent_gate>  (phase 0 routing table)           │  │   │
│  │  │   <delegation_protocol>  (when/how to sub agent)   │  │   │
│  │  │   <style_guide>  (concise, no flattery)            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  Tools: full set (10+ custom + builtins)                  │   │
│  │  Permission: edit/bash/read/etc. = "ask"                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            │ task(subagent_type="oracle")        │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Sub Agent (Oracle-like, breadth-first)           │   │
│  │  System Prompt: Oracle XML template + explore patterns   │   │
│  │  Tools: read-only (grep, glob, lsp, web, ast_search)     │   │
│  │  Permission: edit/bash/write = "deny"                     │   │
│  │  Output: structured <results> XML block                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Hook Plugin: orchestrator.ts                     │   │
│  │  - session.idle       → Boulder continuation              │   │
│  │  - message.user       → Keyword detector (ultrawork)     │   │
│  │  - message.assistant  → Output structure check            │   │
│  │  - task.spawn         → task_id injection                 │   │
│  │  - session.start      → Load karpathy + AGENTS.md         │   │
│  │  - session.compact    → Re-inject karpathy principles     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                External Skills & Tools                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  karpathy-      │  │  OpenSpec       │  │  Superpowers    │  │
│  │  guidelines     │  │  (opt-in)       │  │  (unchanged)    │  │
│  │  (always-on)    │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Inventory

| Component | Type | Path | Purpose |
|-----------|------|------|---------|
| Main agent | Primary | `~/.config/opencode/agents/sisyphus.md` | Developer assistant, full tool access, delegates to sub agent |
| Sub agent | Subagent | `~/.config/opencode/agents/oracle.md` | Read-only breadth-first consultant (explore + librarian + oracle merged) |
| Hashline Edit | Custom tool | `~/.config/opencode/tools/hashline-edit.ts` | Replaces default `edit` with line#CID anchor system |
| Task Dispatch | Custom tool | `~/.config/opencode/tools/task-dispatch.ts` | Background sub agent with task_id, output, cancel |
| AST Search | Custom tool | `~/.config/opencode/tools/ast-search.ts` | tree-sitter-based structural code search |
| Web Search | Custom tool | `~/.config/opencode/tools/web-search.ts` | Multi-provider search chain |
| Image Inspect | Custom tool | `~/.config/opencode/tools/image-inspect.ts` | Vision model image analysis |
| Mermaid Render | Custom tool | `~/.config/opencode/tools/mermaid-render.ts` | Diagram to ASCII/PNG |
| PR Reader | Custom tool | `~/.config/opencode/tools/pr-reader.ts` | GitHub PR/Issue content access |
| Atomic Commit | Custom tool | `~/.config/opencode/tools/atomic-commit.ts` | Split changes into atomic commits |
| Context7 Docs | Custom tool | `~/.config/opencode/tools/context7-docs.ts` | Official documentation query |
| Playwright Browser | Custom tool | `~/.config/opencode/tools/playwright-browser.ts` | Browser automation |
| Hook Plugin | Plugin | `.opencode/plugins/orchestrator.ts` | Boulder + Keyword + Task continuation + Rule injection |
| karpathy-guidelines | Skill | `~/.config/opencode/skills/karpathy-guidelines/SKILL.md` | 4 coding principles (verbatim from multica-ai repo) |
| OpenSpec Bridge | Skill | `~/.config/opencode/skills/openspec-integration/SKILL.md` | Routes "explore/propose/apply/sync/archive" keywords to OpenSpec CLI |
| ultrawork | Skill | `~/.config/opencode/skills/ultrawork/SKILL.md` | Full work mode protocol (loaded by keyword detector) |
| git-master | Skill | `~/.config/opencode/skills/git-master/SKILL.md` | Atomic commits + rebase surgery |

---

## 4. Main Agent Design (Sisyphus-lite)

### 4.1 Dynamic Prompt Structure (4 Segments)

```markdown
---
name: sisyphus
description: 主开发者助手，能写代码，必要时委派子 agent
mode: primary
model: <inherited from global config; omit this field>
temperature: 0.1
permission:
  edit: ask
  bash: ask
  read: allow
  webfetch: allow
  task: allow
---

<role>
你是 [项目名] 的主开发者助手。
能力：写代码 / 跑命令 / 委派子 agent / 协调工具。

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
| RESEARCH | "查文档 / 找代码 / 调研" | **委派 oracle** |
| ANALYZE | "分析 / 解释 / 评估" | **委派 oracle** |
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
子 agent 返回结构化 <results> 块：
```xml
<results>
  <summary>一句话总结</summary>
  <files><file path="...">关键内容</file></files>
  <answer>详细分析</answer>
  <next_steps>建议后续动作</next_steps>
</results>
```

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
```

### 4.2 Why 4 Segments?

Borrowed from omO's `sisyphus-dynamic-prompt-{role,exploration,execution,style}.ts`. Benefits:
- **Modifiable**: change `<style_guide>` without touching `<intent_gate>`
- **Testable**: each segment can be evaluated independently
- **Composable**: future segments (e.g., `<security_review>`) can be added without rewriting
- **Auditable**: each section has clear ownership

---

## 5. Sub Agent Design (Oracle-like, Breadth-First)

### 5.1 System Prompt (Adapted from omO Oracle)

```markdown
---
name: oracle
description: 广度优先万能顾问 - 探索代码 / 查文档 / 分析架构 / 调试建议 (只读)
mode: subagent
model: <inherited from global config; omit this field>
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
阅读主 agent 委派描述。如果不清楚，问"需要 X 的哪部分？"（通过 task output 返回）。

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
```

### 5.2 Why Breadth-First (not Depth-First)?

User chose breadth-first over depth-first:
- **Single subagent** = simpler architecture; main agent doesn't need to pick which sub to call
- **Combined role** = explore (codebase grep) + librarian (external docs) + oracle (architecture) in one
- **Context isolation** = main agent's context stays clean; sub agent absorbs the noise

---

## 6. Tools Design (10+ Custom Tools)

### 6.1 Hashline Edit (HIGHEST PRIORITY)

**Reference**: oh-my-pi `patch/edit/hashline/` (Rust) + omO `src/tools/hashline-edit/` (TS)

**Algorithm**:
```
1. Read file → tag every line with LINE#CID (CID = 2-char content hash)
   42#VK| function hello() {
   22#XJ|   return "world";
   33#MB| }

2. Edit by referencing tags:
   hashline_edit(
     op: "replace" | "append" | "prepend",
     pos: "42#VK",        // start anchor
     end: "45#AB",        // optional end anchor
     lines: ["new line 1", "new line 2"]
   )

3. Validate: if file has changed since read, hash mismatches → reject edit
```

**Three operations**:
| Op | pos | end | lines | Effect |
|---|---|---|---|---|
| `replace` | required | optional | required | Replace line(s) at pos..end |
| `append` | optional | optional | required | Insert after anchor (EOF if no anchor) |
| `prepend` | optional | optional | required | Insert before anchor (BOF if no anchor) |

`lines: null` + `replace` = delete; `delete: true` (tool-level) = delete file.

**Result data** (from omO): Grok Code Fast 1: 6.7% → 68.3% success rate.

### 6.2 Task Dispatch

**Reference**: omO `src/tools/task/` + oh-my-pi `src/task/`

**Behavior**:
- Wraps opencode's built-in `task` tool with a thin convenience layer
- Spawns sub agent in separate session (isolated context)
- When `background: true`, returns `task_id` immediately for fire-and-forget work
- opencode built-in handles `background_output(task_id)` and `background_cancel(task_id)` retrieval (not custom-implemented)

**Schema**:
```typescript
{
  subagent_type: "oracle",
  description: string,    // 3-5 word summary
  prompt: string,         // full task
  background?: boolean    // if true, returns task_id immediately
}
```

**Retrieval** (uses opencode built-ins):
- `background_output(task_id)` — fetch result
- `background_cancel(task_id)` — abort running task

### 6.3 AST Search

**Reference**: omO LSP MCP + oh-my-pi `crates/pi-ast/`

**Behavior**: tree-sitter-based structural code search across 25+ languages

**Schema**:
```typescript
{
  pattern: string,        // AST pattern (e.g., "function $NAME($$$ARGS) { $$$BODY }")
  language?: string,      // auto-detect if not specified
  path?: string,          // default: cwd
  context?: number        // lines of context around match
}
```

### 6.4 Web Search

**Reference**: oh-my-pi `src/web/` (14 providers chain)

**Behavior**: Multi-provider fallback chain (Exa → Brave → Jina → Kimi → ZAI → Anthropic → Perplexity → Gemini → Codex → Tavily → Parallel → Kagi → Synthetic → SearXNG)

**Schema**:
```typescript
{
  query: string,
  provider?: string,      // pin to specific provider; default: "auto"
  max_results?: number
}
```

### 6.5 Image Inspect

**Reference**: oh-my-pi `tools/inspect_image`

**Behavior**: Vision model analyzes local image file

**Schema**:
```typescript
{
  path: string,           // local image path
  prompt: string          // what to analyze
}
```

### 6.6 Mermaid Render

**Reference**: oh-my-pi `tools/render_mermaid`

**Behavior**: Convert Mermaid source to terminal-friendly ASCII or PNG

**Schema**:
```typescript
{
  source: string,
  format?: "ascii" | "png"
}
```

### 6.7 PR Reader

**Reference**: oh-my-pi `internal-urls/pr://` scheme

**Behavior**: Read GitHub PR/Issue as structured markdown

**Schema**:
```typescript
{
  url: string             // GitHub PR/Issue URL
}
```

### 6.8 Atomic Commit

**Reference**: oh-my-pi `omp commit` + omO `git-master` skill

**Behavior**: Splits working tree changes into atomic commits ordered by dependencies. Rejects cycles. Scores source files above tests/docs/configs.

**Schema**:
```typescript
{
  message_style?: "conventional" | "freeform"
}
```

### 6.9 Context7 Docs

**Reference**: omO `context7` MCP

**Behavior**: Query official library documentation (returns up-to-date version-specific docs)

**Schema**:
```typescript
{
  library: string,        // e.g., "react", "fastapi"
  query: string
}
```

### 6.10 Playwright Browser

**Reference**: omO `playwright` skill

**Behavior**: Full browser automation (navigation, clicking, screenshot, JS eval)

**Schema**:
```typescript
{
  action: "navigate" | "click" | "screenshot" | "eval" | "scrape",
  ...
}
```

### 6.11 Tool Priority Order

| Priority | Tool | Rationale |
|----------|------|-----------|
| **P0** | Hashline Edit | Highest ROI single change (Grok 6.7% → 68.3%) |
| **P0** | Task Dispatch | Required for sub agent + background tasks |
| **P1** | AST Search | Core code intelligence (25 languages) |
| **P1** | Web Search | External research backbone |
| **P2** | PR Reader | Common dev workflow |
| **P2** | Context7 Docs | Modern library docs |
| **P3** | Image Inspect | Multimodal |
| **P3** | Mermaid Render | Diagram output |
| **P3** | Atomic Commit | Git workflow |
| **P3** | Playwright Browser | E2E testing / scraping |

---

## 7. Hook Plugin Design (orchestrator.ts)

### 7.1 Event Handlers

| Event | Handler | Behavior |
|-------|---------|----------|
| `session.start` | `injectBootstrap` | Load `karpathy-guidelines` + project `AGENTS.md` |
| `message.user` | `keywordDetector` | Detect `ultrawork` / `ulw` → load `ultrawork` skill, append full-mode instruction |
| `message.assistant` | `outputValidator` | Check that sub agent outputs contain `<results>` block; warn if missing |
| `task.spawn` | `taskIdManager` | Inject `task_id` for background tracking |
| `session.idle` | `boulderContinuation` | If todos not done, inject continuation prompt |
| `session.compact` | `reInjectKarpathy` | Re-inject karpathy 4 principles after compaction |

### 7.2 Boulder Continuation (Highest Impact Hook)

**Reference**: omO `src/hooks/todo-continuation-enforcer/`

**Algorithm**:
```
on session.idle:
  todos = getTodos()
  if todos.incomplete():
    injection = buildContinuationPrompt(todos)
    message.append({
      role: "assistant",
      content: injection,
      synthetic: true
    })
    → session resumes
```

**Continuation prompt template**:
```
[Boulder Continuation]
你刚才停止了，但还有 N 个 todo 未完成：
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

请继续完成它们。如果遇到无法解决的问题，明确报告并更新 todo 状态。
```

**Effect**: prevents "AI 提前放弃" — omO's signature feature

### 7.3 Keyword Detector

**Reference**: omO `src/hooks/keyword-detector/`

**Patterns** (regex):
- `\b(ultrawork|ulw)\b` → ultrawork mode
- `\b(search|搜索)\b` → search mode
- `\b(analyze|分析)\b` → analyze mode
- `\b(team|团队)\b` → team mode (out of scope; injects note)
- `\b(hyperplan)\b` → hyperplan mode (out of scope; injects note)

**Ultrawork mode injection**:
```
[ultrawork mode activated]
工作协议已激活。规则：
1. 不停止直到 todo 全部完成
2. 并行执行所有独立操作
3. 持续检查 karpathy 4 原则
4. 失败时立即报告，不掩饰
```

---

## 8. External Integrations

### 8.1 karpathy-guidelines (Verbatim Import)

**Action**: Copy `SKILL.md` from `https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/main/skills/karpathy-guidelines/SKILL.md` to `~/.config/opencode/skills/karpathy-guidelines/SKILL.md`

**Why verbatim**:
- Original is well-written, model-agnostic
- Modifying reduces canonical value
- Already has perfect frontmatter (`name`, `description`, `license`)

**Wiring**:
- Main agent prompt's `<role>` segment explicitly references it (user choice)
- Sub agent prompt's `<role>` segment also references it
- Hook plugin re-injects on `session.compact` to prevent loss

**Frontmatter**:
```yaml
---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---
```

### 8.2 OpenSpec (Complementary Only)

**Core principle**: OpenSpec fills gaps Superpowers doesn't cover:
1. **Multi-Change parallel tracking** (DAG with topological sort)
2. **Smart spec merge** (ADDED/MODIFIED/REMOVED delta into main spec)
3. **Requirement traceability** (which task fulfills which requirement)
4. **Project-level spec center** (`openspec/specs/<domain>/spec.md` as single source of truth)

**What OpenSpec does NOT replace**:
- Superpowers `brainstorming` — stays for intent exploration
- Superpowers `writing-plans` — stays for in-session plans (use OpenSpec only for project-level)
- Superpowers `subagent-driven-development` — stays for execution
- Superpowers `review` — stays for two-stage review
- Superpowers `finishing-a-development-branch` — stays for git worktree completion

**Trigger model** (opt-in):
- User says: "explore" / "propose" / "apply" / "sync" / "archive" → OpenSpec workflow
- User says: anything else → standard flow
- No keyword auto-detection for OpenSpec (unlike ultrawork)

**Integration architecture**:

```
User mentions: "explore this domain" / "propose a change" / "archive"
     ↓
openspec-integration skill loads (or main agent recognizes keyword)
     ↓
Skill routes to OpenSpec CLI:
  - `openspec explore` → free-form exploration
  - `openspec propose <name>` → create change folder with proposal/specs/design/tasks
  - `openspec apply <name>` → read tasks.md, write code
  - `openspec sync <name>` → smart merge delta to main spec
  - `openspec archive <name>` → move to changes/archive/
     ↓
Main agent delegates to sub agent (oracle) for read-heavy operations
     ↓
After apply → subagent-driven-development review loop (if user wants)
     ↓
archive → finishing-a-development-branch
```

**Installation**:
```bash
npm i -g @fission-ai/openspec
cd <project>
openspec init --tools opencode --profile core
```

**File created by init** (in `.opencode/`):
- `skills/openspec-{propose,explore,apply-change,sync-specs,archive-change}/SKILL.md`
- `commands/opsx-{propose,explore,apply,sync,archive}.md`

**No modification** to Superpowers. OpenSpec is a separate stack.

---

## 9. File Structure (Final)

```
~/.config/opencode/
├── agents/
│   ├── sisyphus.md                   # Main agent (4-segment XML prompt)
│   └── oracle.md                     # Sub agent (breadth-first consultant)
├── tools/
│   ├── hashline-edit.ts
│   ├── task-dispatch.ts
│   ├── ast-search.ts
│   ├── web-search.ts
│   ├── image-inspect.ts
│   ├── mermaid-render.ts
│   ├── pr-reader.ts
│   ├── atomic-commit.ts
│   ├── context7-docs.ts
│   └── playwright-browser.ts
├── skills/
│   ├── karpathy-guidelines/          # ⭐ Verbatim import
│   │   └── SKILL.md
│   ├── ultrawork/                    # Keyword-triggered
│   │   └── SKILL.md
│   ├── git-master/                   # Atomic commits + rebase
│   │   └── SKILL.md
│   └── openspec-integration/         # ⭐ OpenSpec routing bridge
│       └── SKILL.md
├── AGENTS.md                         # Team/project coding standards
└── README.md                         # Component inventory

.opencode/
├── plugins/
│   └── orchestrator.ts               # ⭐ Hook plugin (Boulder + Keyword + Task + Rules)
├── commands/
│   ├── /openspec-explore.md          # Auto-generated by `openspec init`
│   ├── /openspec-propose.md
│   ├── /openspec-apply.md
│   ├── /openspec-sync.md
│   └── /openspec-archive.md
└── skills/                           # Project-level overrides
    └── (none for now; global is enough)
```

---

## 10. Implementation Plan

### Phase 0: Foundation (Day 0 - 30 min)
- [ ] `mkdir -p ~/.config/opencode/{agents,tools,skills}`
- [ ] Copy karpathy-guidelines SKILL.md verbatim

### Phase 1: Agents (Day 0 - 2-3 hours)
- [ ] Write `agents/sisyphus.md` (4-segment XML prompt)
- [ ] Write `agents/oracle.md` (breadth-first consultant prompt)
- [ ] Test `@sisyphus` and `@oracle` mention in TUI

### Phase 2: Core Tools (Day 0-1 - 6-8 hours)
- [ ] `tools/hashline-edit.ts` (P0 - highest ROI)
- [ ] `tools/task-dispatch.ts` (P0 - required for sub agent)
- [ ] `tools/ast-search.ts` (P1)
- [ ] `tools/web-search.ts` (P1)

### Phase 3: Hook Plugin (Day 1 - 4-6 hours)
- [ ] `orchestrator.ts` skeleton with all 6 event handlers
- [ ] `boulderContinuation` (highest impact)
- [ ] `keywordDetector` (ultrawork trigger)
- [ ] `injectBootstrap` + `reInjectKarpathy`

### Phase 4: OpenSpec Integration (Day 1 - 1-2 hours)
- [ ] `npm i -g @fission-ai/openspec`
- [ ] `openspec init --tools opencode --profile core`
- [ ] Write `skills/openspec-integration/SKILL.md` (routing bridge)

### Phase 5: Remaining Tools (Day 2-3 - 1-2 days)
- [ ] `tools/image-inspect.ts`
- [ ] `tools/mermaid-render.ts`
- [ ] `tools/pr-reader.ts`
- [ ] `tools/atomic-commit.ts`
- [ ] `tools/context7-docs.ts`
- [ ] `tools/playwright-browser.ts`

### Phase 6: Documentation (Day 3)
- [ ] `~/.config/opencode/README.md` (component inventory)
- [ ] Update `AGENTS.md` with link to system

---

## 11. Testing Strategy

### 11.1 Unit Tests (per tool)
- Hashline Edit: 5 test cases (replace / append / prepend / delete / stale-anchor)
- Task Dispatch: spawn / background / cancel / output
- AST Search: language detection + pattern match
- Web Search: provider fallback

### 11.2 Integration Tests
- Main agent delegates to sub agent (oracle) on RESEARCH intent
- Boulder hook fires when todos incomplete
- Keyword detector injects ultrawork protocol
- OpenSpec workflow end-to-end (propose → apply → sync → archive)

### 11.3 Manual Smoke Tests
- `ultrawork` keyword triggers full mode
- `karpathy 4 principles` visible in sub agent output
- OpenSpec commands route correctly

### 11.4 Acceptance Tests
- [ ] Hashline Edit reduces edit errors on weak model
- [ ] Boulder prevents premature idle
- [ ] karpathy principles reduce over-engineering (qualitative)
- [ ] OpenSpec doesn't auto-trigger

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **karpathy-guidelines ignored by weak model** | Low | Explicit reference in main agent `<role>` + hook re-injects on compact |
| **OpenSpec conflicts with Superpowers** | Medium | Strict "complementary only" — different trigger words |
| **Boulder hook loops infinitely** | High | Max 3 continuations; then force `NEEDS_CONTEXT` state |
| **Hashline Edit breaks whitespace-sensitive files** | Low | Auto-detect line ending; skip hash for binary |
| **Sub agent too generic** | Medium | Tight scope in `<capabilities>` + read-only permission deny |
| **10+ tools slow down TUI** | Low | Tool index lazy-loaded (omO pattern) |

---

## 13. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-09 | Main agent = Sisyphus-lite (generalist) | User chose generalist over pure dispatcher |
| 2026-06-09 | Sub agent = breadth-first consultant | User chose breadth over depth; merged 3 roles |
| 2026-06-09 | Tools = full 10+ (not minimal 2-3) | User wants comprehensive coverage |
| 2026-06-09 | Prompt style = XML 4-segment | User chose structured dynamic composition |
| 2026-06-09 | Delivery = opencode Agent + Skill | User chose opencode-native |
| 2026-06-09 | karpathy = verbatim import | User chose zero modification |
| 2026-06-09 | OpenSpec = complementary only | User chose "不混用" over replacement |
| 2026-06-09 | karpathy = explicit prompt mention | User chose explicit over auto-load |
| 2026-06-09 | Hook plugin = included (方案 B) | User confirmed方案 B over方案 A |

---

## 14. References

### Inspiration Projects
- [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) — Hashline Edit, persistent subagents, `://` URI schemes
- [code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — 4-segment dynamic prompt, Boulder hook, ultrawork keyword, Oracle agent
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) — Karpathy 4 coding principles
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) — Spec-driven development

### OpenCode Documentation
- [Custom Tools](https://opencode.ai/docs/custom-tools/)
- [Agents](https://opencode.ai/docs/agents/)
- [Plugins](https://opencode.ai/docs/plugins/)
- [Agent Skills](https://opencode.ai/docs/skills/)
- [Config](https://opencode.ai/docs/config/)

### Key Internal Research Files
- `/home/ljh2923/oh-my-pi-research/REPORT.md` (892 lines, comprehensive)
- `/home/ljh2923/oh-my-openagent-research/REPORT.md` (sister report)

---

**End of Design Spec. Ready for user review.**
