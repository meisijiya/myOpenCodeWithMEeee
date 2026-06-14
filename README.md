# myOpenCodeWithMEeee

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![English](https://img.shields.io/badge/EN-English-blue)](./README.md)
[![中文](https://img.shields.io/badge/中文-Chinese-red)](./README.zh-CN.md)

> A lightweight opencode Agent system built on **[Superpowers](https://github.com/obra/superpowers)** (14 workflow orchestration skills) — featuring **7-agent architecture** + **3-tier model routing** (high / mid / low) + **CLI-first external capabilities**. Synthesizing ideas from [Pi Subagents](https://github.com/mattpocock/skills) (frontmatter nesting + bash safety), [Matt Pocock's diagnostic suite](https://github.com/mattpocock/skills), [karpathy-guidelines](https://github.com/multica-ai/andrej-karpathy-skills) (coding discipline), [OpenSpec](https://github.com/Fission-AI/OpenSpec) (spec-driven changes), [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (architecture inspiration), and [RTK](https://github.com/rtk-ai/rtk) (token compression).

---

## 🛒 Looking for Domain-Specific Skills? (React, Java, Docker, etc.)

> Our project ships **19 general-purpose skills** (process/workflow oriented, see `VIBECODING.md` for the operator's manual). For **domain-specific skills** (frameworks, databases, languages), browse community catalogs and install via the `npx skills` CLI.
>
> 🔍 **Find skills first**: [skillsmp.com/zh](https://skillsmp.com/zh) · [ai.codefather.cn/skills](https://ai.codefather.cn/skills) · [vercel-labs/skills](https://github.com/vercel-labs/skills)
>
> ⚠️ **Before installing any domain skill**, see the [Project-Level Customization](#project-level-customization-recommended-pattern) section below — covers name conflicts, token budget, and our permission model.

---

## ⚡ One-Click Install

```bash
git clone https://github.com/meisijiya/myOpenCodeWithMEeee.git
cd myOpenCodeWithMEeee
bash install.sh
```

**The install script automates**:

| Automated Item | Details |
|---------------|---------|
| **7 agents** | `sisyphus.md` / `lyra.md` / `hephaestus.md` / `update.md` / `architect.md` / `planner.md` / `reviewer.md` → `~/.config/opencode/agents/` |
| **19 skills** | caveman / diagnose / git-workflow-and-versioning / grill-with-docs / handoff / improve-codebase-architecture / incremental-implementation / interview-me / karpathy-guidelines / mmx-cli-usage / openspec-integration / prototype / setup-matt-pocock-skills / source-driven-development / tdd / to-issues / triage / update-project-meta / zoom-out |
| **20 commands** | brainstorm / caveman / code-review / diagnose / finish-branch / git-workflow / grill / handoff / improve-arch / interview / mmx / plan / prototype / tdd / to-issues / triage / updateProjectMeta / verify / write-skill / zoom-out → `~/.config/opencode/commands/` |
| **0 tools** | (None — all custom tools retired; CLI-based workflow instead) |
| **0 plugins** | (None — karpathy-guidelines auto-loaded via prompt injection; no runtime plugin needed) |
| **AGENTS.md template** | Only copied if you don't have a global `~/.config/opencode/AGENTS.md` (**never overwrites** your personal config) |
| **3 CLIs** | `mmx` / `ctx7` / `playwright-cli` — called via bash, token-efficient (no full DOM dump into context) |

> All operations are **idempotent** — re-running won't re-register anything.

### ⚠️ Edit AGENTS.md Template After First Install

`install.sh` copies `templates/AGENTS.md` to `~/.config/opencode/AGENTS.md` **only if it doesn't exist**. **The template has 3 placeholders** (each user's system is different) that you need to manually replace:

```bash
nano ~/.config/opencode/AGENTS.md
```

| Placeholder | Meaning | Your actual value |
|-------------|---------|-------------------|
| `{{SYSTEM_INFO}}` | Your operating system | WSL2 Ubuntu 24.04 / macOS Sonoma / Windows 11 / ... |
| `{{CODING_STYLE_NOTE}}` | Code commenting style | "Add function-level comments" / "Only comment complex logic" / ... |
| `{{EMOJI_USAGE_NOTE}}` | Emoji usage preference | "Use emojis in responses" / "Only in titles" / "Don't use" / ... |

> **Already have an AGENTS.md**? `install.sh` won't overwrite your personal config — it protects your existing global preferences.

Uninstall:

```bash
bash uninstall.sh   # Removes all above files + cleans plugin registration + CLI hints
```

---

## 📋 Prerequisites

This project depends on the following external components. Install them **before** `bash install.sh`:

### 1. opencode (Required)

```bash
# Official installation (pick one)
npm install -g @opencode-ai/opencode
# or
curl -fsSL https://opencode.ai/install.sh | bash
```

### 2. Superpowers Workflow Skill System (Strongly Recommended)

Superpowers provides 14 workflow orchestration skills (brainstorming → writing-plans → subagent-driven-dev → review → finish). Sisyphus's `<openspec_protocol>` routing depends on it for the default workflow.

```bash
# Method A: opencode plugin install (recommended)
opencode plugin install superpowers

# Method B: Manual clone
git clone https://github.com/obra/superpowers.git \
  ~/.config/opencode/superpowers
```

> Without Superpowers, Sisyphus will skip these skills and fall back to opencode built-in tools.

### 3. OpenSpec CLI (Optional — only for spec-driven changes)

OpenSpec is a project-level spec center. You need it when you want **multi-change parallel tracking**, **spec smart merge**, or **requirement change tracking**. Daily CRUD / research / simple implementations **don't need** it.

```bash
npm install -g @fission-ai/openspec@latest
```

**On-demand init** (run in projects that need spec-driven workflows, not globally):

```bash
cd your-project
openspec init --tools opencode
```

`openspec init` generates `.opencode/skills/openspec-*` (5 skills) and `.opencode/commands/opsx-*` (5 commands) in the project directory. **These are project-level auto-generated artifacts — we don't bundle them in our repo.** Users run them on-demand in their own projects.

### Check List

```bash
opencode --version              # Confirm opencode is installed
ls ~/.cache/opencode/packages/  # Confirm Superpowers is installed
openspec --version              # Confirm openspec CLI is available (optional)
```

### 4. RTK (Strongly Recommended — Saves 60-90% Tokens)

[RTK](https://github.com/rtk-ai/rtk) is a CLI proxy that automatically compresses the output of common commands like `git status`/`ls`/`grep`/`cat` before sending it to the LLM context. Single Rust binary, zero dependencies, <10ms overhead.

**Effect** (30-min session): ~118K tokens → ~24K tokens (**-80%**)

```bash
# Install RTK
brew install rtk
# Or: curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Initialize for opencode (installs hook + RTK.md guidance)
rtk init -g --opencode

# Verify
rtk --version   # rtk 0.x
rtk gain        # View token savings stats
```

After initialization, the agent's bash commands are automatically rewritten:
- `git status` → `rtk git status` (~200 tokens → ~40)
- `grep "pattern"` → `rtk grep "pattern"` (grouped output)
- `cargo test` → `rtk test cargo test` (failures only, ~2000 tokens → ~200)
- `ls -la` → `rtk ls` (directory tree, ~800 tokens → ~150)

> RTK is machine-level, **not affecting other users** — every agent benefits independently.

### ⚠️ About mattpocock/skills

Our `caveman`, `diagnose`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`, `prototype`, `setup-matt-pocock-skills`, `tdd`, `to-issues`, `triage`, `zoom-out` are **verbatim imports** from [mattpocock/skills](https://github.com/mattpocock/skills) — only the 11 we actually need. **Do not** also run mattpocock's official setup script, otherwise same-named skills will conflict, and opencode will dedupe based on file system traversal order, with unpredictable results.

| Method | Effect |
|--------|--------|
| ✅ Use our `install.sh` | Exactly 11 skills, no conflict |
| ❌ Also run mattpocock official setup | 11 same-name skills, unknown which wins |

---

## 📦 Required vs Recommended vs Optional

The minimum to run the project is just `opencode` itself. Everything else improves the experience but can be added incrementally.

### Tier 1: Required (Required for any functionality)

| Component | Why | Install |
|-----------|-----|---------|
| **opencode 1.16.2+** | Runtime | `npm i -g @opencode-ai/opencode` |

Without this, nothing works.

### Tier 2: Strongly Recommended (Core features disabled without these)

| Component | Why | Install |
|-----------|-----|---------|
| **Superpowers (14 skills)** | Provides the default workflow (`brainstorming → writing-plans → subagent-driven-dev → review → finish`) that Sisyphus uses as its backbone | `opencode plugin install superpowers` |
| **RTK (Rust Token Killer)** | Saves 60-90% tokens on common commands (`git status`/`ls`/`grep`/`cargo test`/...) | `brew install rtk && rtk init -g --opencode` |

Without these, Sisyphus still works but:
- No Superpowers → Sisyphus's `<openspec_protocol>` defaults fall back to built-in tools, less structured workflow
- No RTK → every command uses standard output, more tokens

### Tier 3: Optional (For specific advanced features)

| Component | Why | Install |
|-----------|-----|---------|
| **OpenSpec CLI** | Multi-change parallel tracking, spec smart merge, change DAG | `npm i -g @fission-ai/openspec@latest` |
| **MiniMax CLI (`mmx`)** | Multimodal (image/video/speech/music) + web search — works with any model | `npm i -g mmx-cli && mmx auth login` |
| **Context7 CLI (`ctx7`)** | Library documentation queries (replaces self-built `context7-docs` tool) — **free tier: 1000 calls/month**, see `source-driven-development` skill for budget rules | `npm i -g ctx7 && npx ctx7 setup --opencode` |
| **Playwright CLI (`playwright-cli`)** | Browser automation (replaces self-built `playwright-browser` tool) | `npm i -g @playwright/cli@latest && playwright-cli install --skills` |

### Skills Already Provided by This Project (19)

After `bash install.sh`, these skills are mirrored to `~/.config/opencode/skills/`:

| Skill | Type | Trigger |
|-------|------|---------|
| `karpathy-guidelines` | Self-built (4 karpathy principles) | Auto-loaded on every LLM call (meta-skill) |
| `openspec-integration` | Self-built (routing bridge) | Two-layer trigger: (1) keyword OR (2) semantic intent (multi-step change / cross-spec) |
| `update-project-meta` | Self-built (single-writer) | User says "记录决策 / 加术语 / 加约定" → write CONTEXT.md / ADR / AGENTS.md |
| `mmx-cli-usage` | Self-built (mmx guide) | Multimodal / search needs |
| `grill-with-docs` | Imported from mattpocock/skills | Adversarial questioning of plans against domain model |
| `caveman` | Imported from mattpocock/skills | Ultra-compressed communication (-75% tokens) |
| `diagnose` | Imported from mattpocock/skills | Hard bugs, performance regressions (6-phase loop) |
| `prototype` | Imported from mattpocock/skills | Throwaway prototype for early design exploration |
| `to-issues` | Imported from mattpocock/skills | Break plan into independent issues |
| `improve-codebase-architecture` | Imported from mattpocock/skills | Identify "ball of mud" + suggest architecture improvements |
| `triage` | Imported from mattpocock/skills | Issue state-machine driven by 5 triage roles |
| `setup-matt-pocock-skills` | Imported from mattpocock/skills | One-time scaffolding of issue tracker + triage labels |
| `git-workflow-and-versioning` | Imported from addyosmani/agent-skills | Git workflow: atomic commits, branching, conflict resolution |
| `incremental-implementation` | Imported from addyosmani/agent-skills | Vertical-slice implementation, complements tdd |
| `interview-me` | Imported from addyosmani/agent-skills | Underspecified ask (missing who/why/success/constraint) |
| `source-driven-development` | Lightweight re-implementation of addyosmani skill | Framework/API decision needs official doc verification (use ctx7 CLI) |
| `handoff` | Verbatim from mattpocock/skills (`SKILL.md` 15 lines) | Compact conversation into handoff document for next agent |
| `tdd` | Verbatim from mattpocock/skills (`SKILL.md` + 5 sub-files) | Test-driven development with red-green-refactor loop |
| `zoom-out` | Verbatim from mattpocock/skills (`SKILL.md` 7 lines) | Zoom out for broader context and higher-level perspective |

> See `VIBECODING.md` for the full operator's manual: when to invoke each skill, which agent owns it, and how it maps to the 20 commands.

### Quick Verification

```bash
# Tier 1: opencode
opencode --version

# Tier 2: superpowers + rtk
ls ~/.cache/opencode/packages/superpowers@* 2>/dev/null && echo "✅ superpowers" || echo "❌ superpowers missing"
rtk --version 2>/dev/null && echo "✅ rtk" || echo "❌ rtk missing"

# Tier 3: optional
openspec --version 2>/dev/null && echo "✅ openspec" || echo "❌ openspec missing"
command -v mmx && echo "✅ mmx" || echo "❌ mmx missing"
command -v ctx7 && echo "✅ ctx7" || echo "❌ ctx7 missing"
command -v playwright-cli && echo "✅ playwright-cli" || echo "❌ playwright-cli missing"
```

### OpenSpec Fallback Strategy (Graceful Degradation)

The `openspec-integration` skill has a built-in 4-tier fallback strategy:

| Scenario | Detection | Fallback |
|----------|-----------|----------|
| **A. CLI missing** | `command -v openspec` fails | Downgrade to Superpowers workflow + remind user to install |
| **B. CLI exists but project not initialized** | `openspec/` dir doesn't exist | Ask user, then auto-run `openspec init --tools opencode` |
| **C. Target change doesn't exist** | apply/archive can't find change | List existing changes, ask user to re-specify |
| **D. Change structure corrupted** | Missing proposal.md/tasks.md | Report + suggest `openspec validate <id>`, don't try to repair |

**Core principle**: **Never fabricate OpenSpec artifacts.** Downgrade explicitly, never silently.

---

After install, edit `~/.config/opencode/opencode.json` to add the 7-agent model assignments:

```json
{
  "agent": {
    "sisyphus":   { "model": "<provider>/<high-tier-model-id>" },
    "lyra":       { "model": "<provider>/<mid-tier-model-id>" },
    "hephaestus": { "model": "<provider>/<low-tier-model-id>" },
    "update":     { "model": "<provider>/<high-tier-model-id>" },
    "architect":  { "model": "<provider>/<high-tier-model-id>" },
    "planner":    { "model": "<provider>/<high-tier-model-id>" },
    "reviewer":   { "model": "<provider>/<high-tier-model-id>" }
  }
}
```

> Note: `install.sh` automatically registers all 7 agents (with prompt + tool config); you only need to fill in **model IDs** per tier.

### Recommended Pairings

| Tier | Role | Agents | Recommended Models (Examples) | Monthly Estimate |
|------|------|--------|------------------------------|-----------------|
| **high** | Architecture / planning / review / meta-writes | Sisyphus · Architect · Planner · Reviewer · Update | `anthropic/claude-opus-4-20250514` or `deepseek/deepseek-v4-pro` | ~$200 |
| **mid** | Complex implementation, research, mid-difficulty bugs | Lyra | `anthropic/claude-sonnet-4-20250514` or `deepseek/deepseek-v4-flash` | ~$20 |
| **low** | CRUD, mechanical refactor, test boilerplate | Hephaestus | `anthropic/claude-haiku-4-20250514` or `deepseek/deepseek-v4-flash-free` | ~$0 |

> See [Architecture](#architecture) for the full delegation map and tier rationale.

### Global Default Model (Lazy Option)

If you don't want to configure 7 agents, just set the global model:

```json
{
  "model": "anthropic/claude-sonnet-4-20250514"
}
```

> ⚠️ In this case, `install.sh`'s `agent.compaction.prompt` will still apply, but the 7-agent tier mapping won't have cost-aware routing. Full configuration is recommended for the best cost/performance ratio.

### Provider Configuration

Provider / API Key is configured via opencode's `/connect` command (in TUI), or directly in the `provider` section of `opencode.json`. This project **does not** manage provider configuration — it reuses your existing opencode environment.

### Prefer Sisyphus Over build

After install, opencode defaults to two primary agents: **build** and **plan**. With our project installed, **Sisyphus** (also primary) becomes available, and the 6 sub-agents (Lyra / Hephaestus / Architect / Planner / Reviewer / Update) are reachable via `@<agent>` or `task()`.

**On first opencode launch** (press **Tab** to cycle primary agents):

```
┌─ build (opencode native)         ← Full-featured but no 7-agent routing
├─ plan (opencode native)          ← Read-only planning
├─ Sisyphus (our project)          ← ★ Recommended entry
└─ (other built-in subagents)
```

| Agent | When to Use |
|-------|-------------|
| **Sisyphus** | 99% of tasks — architecture, delegation, cross-file, complex implementations |
| **build** | Just want to run a single shell command / quick read file, no need for Sisyphus's 7-agent routing |
| **plan** | Read-only analysis, zero modifications |

**Quick switch**: In TUI press **Tab** (or `switch_agent` keybind) to cycle Sisyphus and build.

**@ delegate to sub-agents**:
```
@lyra help me implement this feature
@hephaestus create 5 CRUD files
@architect design the module boundaries for this new subsystem
@planner write an implementation plan with issue breakdown
@reviewer audit this PR before merge
@update add this decision to docs/adr/
```

You can also let Sisyphus delegate directly in conversation (it auto-selects based on its 12-row intent_gate routing table — see [Architecture](#architecture) below).

---

## 🌟 Inspiration & Provenance

This project synthesizes ideas from multiple sources. Every imported skill cites its origin in the frontmatter `metadata.source` / `sourceUrl`.

### Foundations

| Source | What we took | What we skipped |
|--------|--------------|------------------|
| **[Superpowers](https://github.com/obra/superpowers)** | Default workflow foundation (brainstorming → writing-plans → subagent-driven-dev → review → finish) | We don't bundle their skill files (user installs via `opencode plugin install`) |
| **[Pi Subagents](https://github.com/mattpocock/skills)** | `permission.task` (depth=3 nesting) + `permission.bash` safe-glob | We don't import Pi agent configs (opencode-native instead) |
| **[Matt Pocock skills](https://github.com/mattpocock/skills)** | 11 verbatim imports: caveman / diagnose / grill-with-docs / handoff / improve-codebase-architecture / prototype / setup-matt-pocock-skills / tdd / to-issues / triage / zoom-out | Don't run their full installer (same-name skill conflict risk; we picked the 11 we need) |
| **[karpathy-guidelines](https://github.com/multica-ai/andrej-karpathy-skills)** | 4 coding principles (Think/Simplicity/Surgical/Goal-Driven) — auto-loaded as meta-skill | — |
| **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** | Two-layer trigger routing (keyword + semantic) | We don't bundle the generated skills/commands (user runs `openspec init` per-project) |
| **[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)** | Architecture inspiration (orchestrator → specialists pattern) | We don't use 100K+ LOC codebase or HTTP-based background subagents (opencode plugin mode doesn't support it) |
| **[oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)** | Role-based permission tiers (read-only vs read-write agents) | We don't import 5+ specialist agents (we keep 7 with 3 tiers) |
| **[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)** | `interview-me` (verbatim) + `source-driven-development` (lightweight re-implementation) + `git-workflow-and-versioning` + `incremental-implementation` | We don't import all 23 skills (lightweight principle) |
| **[RTK](https://github.com/rtk-ai/rtk)** | Recommended for 60-90% token savings | — |

### AI Model Attention Insights

We apply insights from [BV1v9ER68EJE](https://www.bilibili.com/video/BV1v9ER68EJE/) ("如何解决AI模型注意力涣散问题"):

| Insight | Applied |
|---------|--------|
| **U-shape attention curve** (>50% context → only end matters) | `<style_guide>` is the LAST segment in all 7 agent prompts; HTML comment block at Sisyphus tail emphasizes "关键尾部提示词" |
| **Hard constraints (never/always/must/绝对不要)** | Rewrote all 7 agents' `style_guide` with strong vocabulary + 反例/正例 |
| **Skill files ≤ 300-500 lines** | All skills under 250 lines; Sisyphus.md at 432 (acceptable) |
| **Solutions 1+2+3+4** (AGENTS.md + Scan + Hooks + SubAgent isolation) | All present: `karpathy-guidelines` auto-loaded as meta-skill is our "Hook"; subagent isolation is core to 7-agent architecture |
| **Anti-compaction-passive** (don't wait for quality to drop) | 3-piece verification (`<delegation_review>`) catches issues early per-call |
| **Soft constraints = no constraints** | `bash: *: allow` (project-internal trust) + hard deny blacklists (not "尽量") |

---

## 🏗️ Architecture

The **7-agent system** is organized as a tiered delegation tree. **Sisyphus** is the primary entry; everything else is a sub-agent invoked via opencode's `task()` tool.

```
                        ┌──────────────────────────────────────┐
                        │  Sisyphus (primary, high-tier)       │
                        │  • Intent routing (12-row gate)      │
                        │  • Owns OpenSpec, skill discovery    │
                        │  • Coordinates 6 sub-agents          │
                        └──────┬─────┬─────┬─────┬─────┬──────┘
                               │     │     │     │     │
        ┌──────────────────────┘     │     │     │     └──────────────────────┐
        │                            │     │     │                            │
        ▼                            ▼     ▼     ▼                            ▼
┌───────────────┐         ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Architect     │         │ Planner       │ │ Reviewer      │ │ Update        │ │ Lyra          │
│ (high-tier)   │         │ (high-tier)   │ │ (high-tier)   │ │ (high-tier)   │ │ (mid-tier)    │
│ Domain model  │         │ Plans +       │ │ Code review + │ │ CONTEXT.md /  │ │ Complex impl  │
│ + ADR drafts  │         │ to-issues     │ │ verification  │ │ ADR / AGENTS  │ │ + research    │
└──────┬────────┘         └──────┬────────┘ └───────────────┘ └───────────────┘ └──────┬────────┘
       │                        │                                                       │
       │  (architect → update)  │  (planner → lyra → hephaestus)                       │
       └──── write ADR ─────────┘                                                       │
                                                                                       ▼
                                                                          ┌─────────────────────┐
                                                                          │ Hephaestus          │
                                                                          │ (low-tier)          │
                                                                          │ CRUD / refactor /   │
                                                                          │ test boilerplate    │
                                                                          │ task: deny (leaf)   │
                                                                          └─────────────────────┘
```

**Strict depth=3 rule**: Hephaestus + Update + Architect + Planner + Reviewer all have `task: false` (opencode's hard guarantee — the Task tool is **physically removed**). Lyra + Sisyphus can spawn sub-agents, but Lyra is **forbidden from spawning Hephaestus directly** without going through Sisyphus intent_gate. No infinite recursion.

### Agent Roles (TL;DR)

| Agent | Tier | What it does | What it does NOT do |
|-------|------|--------------|---------------------|
| **Sisyphus** | high | Intent routing, OpenSpec orchestration, skill discovery | Implementation, code review, meta-writes |
| **Architect** | high | Domain modeling, module boundaries, ADR drafts | Code review, code writing, plan writing |
| **Planner** | high | Implementation plans, issue breakdown | Architecture design, code review, code writing |
| **Reviewer** | high | Independent code review, pre-completion verification | Writing code, planning, architecture |
| **Update** | high | Single-writer for CONTEXT.md / ADR / AGENTS.md | Implementation, planning, review |
| **Lyra** | mid | Complex implementation, research, mid-difficulty bugs | Architecture design, code review, plan writing |
| **Hephaestus** | low | CRUD, atomic refactor, test scaffolding | Architecture, planning, review, meta-writes |

### Routing Logic (12-row intent_gate)

| Intent | Trigger | Route | Tier | OpenSpec |
|--------|---------|-------|------|----------|
| ARCHITECTURE | Major architecture decision / module boundary / domain modeling | **Architect** | high | yes |
| DESIGN | New feature design (incl. single-file + design content) | Sisyphus (self) | high | yes |
| COMPLEX_CODE | Cross-file new feature (≥2 files need coordination) | **Lyra** | mid | yes |
| RESEARCH | Investigation, documentation | **Lyra** | mid | no |
| DEBUG_HARD | Complex bug (diagnose + fix + test verify) | **Lyra** | mid | no |
| DEBUG_SIMPLE | Obvious bug (single-file ≤10 lines) | Sisyphus (self) | high | no |
| CRUD | Repetitive writes (3+ similar files) | **Hephaestus** | low | no |
| ATOMIC_REFACTOR | Mechanical transform (cross-file rename) | **Hephaestus** | low | no |
| TEST_BOILERPLATE | Test scaffolding | **Hephaestus** | low | no |
| PLAN | Implementation plan / issue breakdown | **Planner** | high | no |
| REVIEW | Code review / pre-completion verification / receive feedback | **Reviewer** | high | no |
| META_WRITE | Write CONTEXT.md / ADR / AGENTS.md (terms / conventions) | **Update** | high | no |

**Core principle**: **Reasoning complexity** (not file count) determines the tier.

**Edge cases** (avoid "I'll do it myself" temptation):
- "Modify 1 file + run quick command" → DEBUG_SIMPLE / Sisyphus (self)
- "Modify 1 file + run full test suite" → DEBUG_HARD / Lyra (verification IS research)
- "Create 1 design doc (CONTRIBUTING.md)" → DESIGN / Sisyphus (self)
- "Create README + install script联动" → COMPLEX_CODE / Lyra (multi-file coordination)

> See `VIBECODING.md` for full delegation flowcharts and decision trees.

---

## 🛡️ Permission Strategy: Trust Project, Ask Beyond

Following the official permissions documentation ([opencode permissions](https://opencode.ai/docs/zh-cn/permissions/)) and inspired by [oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)'s role-based permission tiers, we configured **fine-grained glob rules** with a clear principle:

> **Project-internal = full trust (max allow). Project-external = ask. Dangerous operations = hard deny.**
>
> **Safety net**: opencode's default `build`/`plan` agents use opencode's factory-conservative permissions. Switch to them when you want extra caution.

### Core Design Principle

You opened this project **so that opencode can work on it**. The project directory is by definition the trust zone. So:

- Anything **inside cwd** → no asking
- Anything **outside cwd** → opencode's `external_directory` mechanism asks
- A few **hard-deny** operations (catastrophic / privilege escalation / accidental publish) are blocked at the prompt level

If you're ever worried an agent is doing something risky, **switch to `build` or `plan` agents** — they have opencode's default cautious permissions. This is your escape hatch.

### Permission Matrix

| Operation | Sisyphus | Lyra | Hephaestus | Architect | Planner | Reviewer | Update |
|-----------|:--------:|:----:|:----------:|:---------:|:-------:|:--------:|:------:|
| `read / grep / glob / webfetch / websearch` | ✅ allow | ✅ allow | ✅ allow (websearch deny) | ✅ allow | ✅ allow | ✅ allow | ✅ allow |
| `edit / write` project-internal | ✅ allow | ✅ allow | ✅ allow | ✅ allow (design docs only) | ✅ allow (plans only) | ❌ deny (read-only) | ✅ allow (meta files only) |
| `edit / write` project-external (via `external_directory`) | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask |
| `edit / write` `.env*` | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny |
| `bash` project-internal (default) | ✅ **allow** | ✅ **allow** | ✅ allow | ✅ allow | ⚠️ ask | ⚠️ ask | ⚠️ ask |
| `bash` dangerous (`rm -rf /`, `sudo`, `mkfs`, `dd`, `chmod -R 777`) | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny |
| `bash` git force push / hard reset / clean -fd | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny |
| `bash` package publish (`npm/pnpm/yarn/cargo publish`) | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny | ❌ deny |
| `task` delegation | lyra/hephaestus/architect/planner/reviewer/update | hephaestus | ❌ deny (leaf) | update/lyra | architect/update/hephaestus | ❌ deny (independent review) | ❌ deny (single-writer) |
| `external_directory` (project-external access) | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask | ⚠️ ask |
| `doom_loop` (3x identical call) | ⚠️ ask (default) | ⚠️ ask (default) | ⚠️ ask (default) | ⚠️ ask (default) | ⚠️ ask (default) | ⚠️ ask (default) | ⚠️ ask (default) |

**Per-agent notes**:
- **Reviewer**: read-only — must not edit code that it's reviewing (independent-review principle).
- **Update**: meta-files only — single-writer for CONTEXT.md / ADR / AGENTS.md to avoid merge conflicts.
- **Architect**: writes design docs + ADR drafts, then hands off to Update for persistence.
- **Planner**: writes plan docs + issue text, no application code.

### What Changed (vs. v1)

| Aspect | v1 (older) | v2 (current) |
|--------|------------|--------------|
| `bash` default for Sisyphus/Lyra | `ask` (too cautious) | **`allow`** (project trust) |
| Project-external `edit`/`write` | Custom `**/../**` glob (leaky) | `external_directory: ask` (opencode native) |
| Safety mechanism | Multiple ask prompts | Switch agent to `build`/`plan` |

### Design Intent (insights from omo-slim)

- **Role-based permission tiers**: Different agents have different default trust levels. omo-slim does this with read-only agents (`explorer`/`librarian`/`oracle`/`observer`) vs read-write agents (`designer`/`fixer`). We do the same: **Hephaestus** is most permissive (worker needs many commands), **Lyra** is mid-permissive (default allow + hard denies), **Architect/Planner/Reviewer/Update** are restrictive (scope-limited writes), and `build`/`plan` are the most conservative (opencode factory defaults).
- **Don't make the agent cautious — make the safety net accessible**: The user can always switch to a more cautious agent. Don't punish normal flow with constant prompts.
- **Hard denies are irreplaceable**: Even the most permissive agent must have hard `rm -rf /`/`sudo`/`npm publish` denies. These are the only rules that truly cannot be overridden.

### Pattern Matching Example

```yaml
# How these glob patterns work:
bash:
  "*": allow                          # Default: all bash commands allow (project-internal)
  "rm -rf /*": deny                   # Hard deny
  "sudo *": deny                      # Hard deny
  "git push --force *": deny          # Hard deny
  "npm publish *": deny               # Hard deny
external_directory: ask              # Any escape-cwd operation asks
```

**Last-rule-wins**: In each permission block, **the last matching rule takes priority**. So put `"*": allow` first, specific denys after.

### Customization

To change an agent's permissions, edit the corresponding `agents/<name>.md` frontmatter, then:

```bash
bash install.sh   # Re-mirror to ~/.config/opencode/
```

---

## 🧩 Skill System

### Bring-in Skills (Imported, Not Self-Built)

| Skill | Source | Trigger Condition | Primary Agent |
|-------|--------|-------------------|---------------|
| **karpathy-guidelines** | multica-ai/andrej-karpathy-skills | All LLM calls (auto-loaded as meta-skill) | All |
| **grill-with-docs** | mattpocock/skills | Stress-test plan vs domain model consistency | Sisyphus / Architect / Planner |
| **caveman** | mattpocock/skills | Ultra-compressed comms (-75% tokens) | All (user-triggered) |
| **diagnose** | mattpocock/skills | Hard bugs, performance regressions (6-phase loop) | Lyra |
| **prototype** | mattpocock/skills | Throwaway prototype for early design exploration | Lyra |
| **to-issues** | mattpocock/skills | Break down plan/spec into independent issues | Planner |
| **improve-codebase-architecture** | mattpocock/skills | Identify "ball of mud" + architecture improvement opportunities | Architect |
| **triage** | mattpocock/skills | Issue state-machine driven by 5 triage roles | Sisyphus (maintainer) |
| **setup-matt-pocock-skills** | mattpocock/skills | One-time scaffolding of issue tracker + triage labels | Sisyphus (run once) |
| **update-project-meta** | Self-built | User says "记录决策 / 加术语 / 加约定" — write CONTEXT.md / ADR / AGENTS.md | Update (single-writer) |
| **git-workflow-and-versioning** | addyosmani/agent-skills (verbatim) | Git workflow: atomic commits, branch strategy, conflict resolution | All |
| **incremental-implementation** | addyosmani/agent-skills (verbatim) | Vertical-slice implementation, complements tdd | Lyra |
| **interview-me** | addyosmani/agent-skills (verbatim) | Underspecified ask — interview one-question-at-a-time to 95% confidence | Sisyphus / Planner |
| **source-driven-development** | addyosmani/agent-skills (lightweight re-implementation) | Framework/API decision needs official doc verification via `ctx7` CLI | Lyra |
| **handoff** | mattpocock/skills (verbatim) | Compact conversation into handoff document for next agent | All (user-triggered) |
| **tdd** | mattpocock/skills (verbatim) | Test-driven development with red-green-refactor loop | Lyra / Hephaestus |
| **zoom-out** | mattpocock/skills (verbatim) | Zoom out for broader context and higher-level perspective | All (user-triggered) |
| **openspec-integration** | Self-built (routing bridge) | Cross-spec change / multi-step spec-driven work — propose/explore/apply/sync/archive | Sisyphus / Lyra |
| **mmx-cli-usage** | Self-built (mmx guide) | Multimodal (image/video/speech) + web search needs | All (via `mmx` CLI) |

> Full operator's manual with **when-to-use** flowcharts: see [`VIBECODING.md`](./VIBECODING.md).

### User-Facing Skills: `handoff` and `zoom-out`

These two skills are **for the user, not the agent system**. They bridge the gap between your sessions and the agent's mental model.

#### `handoff` — Cross-Session Continuity

**What it does**: Compact the current conversation into a handoff document so a fresh session (or different device) can pick up where you left off.

**When to use it** (user-triggered):
- 🌙 **Long tasks**: You started something last night, need to continue tomorrow
- 📱 **Cross-device**: Switching from PC to phone (or vice versa)
- 🔄 **Switching tools**: Moving from opencode TUI to web UI / IDE plugin
- 👥 **Handing off to a human**: Another developer needs to take over

**When NOT to use it** (anti-patterns):
- ❌ **Subagent delegation** — that's Sisyphus → Lyra / Architect / Planner / Reviewer / Update / Hephaestus, which uses `<delegation_protocol>` (not handoff)
- ❌ **Task summaries in current session** — just ask the agent to summarize
- ❌ **"Save my work"** — git commits handle that (`git-workflow-and-versioning`)

**Usage**:
```bash
/handoff "continue auth refactor on phone, check src/auth/refresh.js"
# or
/handoff
```

The agent writes a handoff doc to OS temp dir (e.g., `/tmp/handoff-...md` on Linux) with:
- Task state (in-progress / blocked / done)
- Key file paths and decisions
- **Suggested skills** for the next session to invoke
- Redacted sensitive info

#### `zoom-out` — Code Comprehension from 30,000 Feet

**What it does**: When you're staring at unfamiliar code, the agent gives a high-level map: modules, callers, the domain vocabulary.

**When to use it** (user-triggered only — `disable-model-invocation: true`):
- 🆕 **New to a codebase**: Just opened an unfamiliar project
- 🔍 **Reviewing a PR**: Want context before approving
- 🐛 **Debugging a cross-module bug**: Need to see the system boundary
- 🤔 **"How does X work?"**: General code understanding

**When NOT to use it**:
- ❌ **Auto-triggered** — never, by design (the agent won't proactively use it)
- ❌ **Single function deep-dive** — that's just reading the code
- ❌ **External API lookup** — that's `source-driven-development`

**Usage**:
```
You: I don't understand how the auth flow works. Zoom out.
Agent: [map of auth modules, callers, domain terms]
```

#### Why These Two Are Special

| Aspect | handoff | zoom-out |
|--------|---------|----------|
| Trigger | **User must invoke** | **User must invoke** |
| Why | Sessions are user-driven | Code understanding is user-driven |
| Auto-trigger risk | Could spam agent output if always on | Would clutter response if always on |
| 3-agent integration | ❌ None (user-only) | ⚠️ Can be asked across agents, but not auto |

Both have `disable-model-invocation: true` (or are user-named actions) — the agent will never proactively use them.

### OpenSpec Integration (Project-Level Spec-Driven)

| Command | Function | Who Uses |
|---------|----------|----------|
| `/opsx:propose` | Create change proposal | Sisyphus / Lyra |
| `/opsx:explore` | Free exploration | Sisyphus / Lyra |
| `/opsx:apply` | Implement tasks.md | Lyra (delegated execution) |
| `/opsx:sync` | Merge delta → main spec | Sisyphus |
| `/opsx:archive` | Archive completed change | Sisyphus |

**Hephaestus bypasses OpenSpec entirely** — CRUD doesn't need specs.

### 🛡️ Why We Don't Lean Fully Into OpenSpec

OpenSpec is one of three **orthogonal layers** in our architecture. We don't depend on it; we coexist with it.

```
┌──────────────────────────────────────────────────────────────┐
│ Layer 1: Scheduling (our 7 agents)                             │
│  Sisyphus / Lyra / Hephaestus / Architect / Planner /         │
│  Reviewer / Update — intent routing + delegation               │
│  "Who does what?"                                              │
├──────────────────────────────────────────────────────────────┤
│ Layer 2: Workflow (our 19 skills + Superpowers)                │
│  karpathy / grill-with-docs / diagnose / interview-me /        │
│  tdd / source-driven / openspec-integration / ...              │
│  Superpowers (14 skills, opencode plugin)                      │
│  "How do we work?"                                             │
│  → DEFAULT for 99% of tasks                                     │
├──────────────────────────────────────────────────────────────┤
│ Layer 3: Application (OpenSpec, optional)                       │
│  /opsx:propose / :apply / :sync / :archive                     │
│  openspec-propose / openspec-apply-change / ...                 │
│  "What are we building?"                                       │
│  → ~1% of tasks: complex multi-spec changes + audit             │
└──────────────────────────────────────────────────────────────┘
```

**Why this matters:**

1. **No single point of failure** — if OpenSpec breaks or changes, only Layer 3 is affected. 99% of work still flows through Layers 1+2.
2. **No name conflict** — our `openspec-integration` skill is distinct from the 5 `openspec-*` skills OpenSpec generates per-project. They coexist without colliding.
3. **No default-drift** — Layer 2 is the default. OpenSpec is opt-in (keyword OR semantic trigger).
4. **Escape hatch** — switch to `build`/`plan` (opencode factory) to fully bypass OpenSpec.

### When Does OpenSpec Trigger? (realistic frequency)

| Task Type | % | Which Layer |
|-----------|---|-------------|
| Daily CRUD (read/edit/write) | 60% | Layer 2 (Superpowers) |
| Research / simple impl | 25% | Layer 2 (karpathy + source-driven) |
| Cross-file implementation | 10% | Layer 1 (Lyra / Architect / Planner) |
| Hard bugs | 3% | Layer 1 (Lyra + diagnose) |
| **Multi-spec change + audit** | **1%** | **Layer 3 (OpenSpec)** |

Even if the 5 `openspec-*` skills load on every LLM call, the *operations* (when triggered) are <1% of work. Token budget is dominated by Layer 2.

### OpenSpec Two-Layer Trigger

The `openspec-integration` skill uses a **two-layer trigger** to balance accuracy vs user-friendliness:

| Layer | Type | Trigger | Behavior |
|-------|------|---------|----------|
| **Layer 1** | Strong (keyword) | User says `propose/explore/apply/sync/archive/提议/应用/归档` | **Always** OpenSpec (no questions) |
| **Layer 2** | Semantic (suggest) | Task involves multi-step change / cross-spec impact / requirement tracking / brownfield | **SUGGEST** OpenSpec + ask user |
| **Layer 3** | Default | None of the above | Superpowers (no OpenSpec) |

**Semantic signals that suggest OpenSpec**:
- Multi-step change with cross-spec impact (e.g., "重构 auth + 改 user model + 改 API")
- Cross-spec influence query (e.g., "改 X 会影响 Y 吗？")
- Requirement change tracking (e.g., "这个 spec 改了哪些 task？")
- Brownfield legacy code modifications
- Audit / review (e.g., "上个月做的 X 在哪？")
- Multiple parallel changes
- New project initialization

**SUGGEST template** (Sisyphus says this when Layer 2 matches):
> "This task looks like [multi-step change / cross-spec / ...] — OpenSpec handles this well.
> Go OpenSpec (write proposal.md first) or Superpowers (brainstorming → plans)?
> - OpenSpec: I'll create `openspec/changes/X/` with proposal.md
> - Superpowers: I'll go straight to brainstorming + writing-plans"

**Anti-patterns** (don't do these):
- ❌ "新功能" → auto OpenSpec (too aggressive, false positives)
- ❌ "改" → ask "要不要 OpenSpec" (too noisy, breaks flow)
- ✅ keyword → unconditionally OpenSpec
- ✅ semantic → SUGGEST once with reason
- ✅ default → silently Superpowers

### Foundation: Superpowers (14 skills, used in full)

The **full workflow foundation** of this project. Superpowers provides end-to-end process orchestration from idea to merge (brainstorming → writing-plans → subagent-driven-dev → review → finish). Sisyphus's `<openspec_protocol>` segment handles routing: OpenSpec keyword mentioned → go OpenSpec; default → go Superpowers.

> Requires separate install: `opencode plugin install superpowers` (see [Prerequisites](#3-openspec-clioptional--only-for-spec-driven-changes)). This project **does not** ship Superpowers skill files.

### 📖 Domain Skills (Install On-Demand)

This project ships **process/workflow** skills only. For **domain-specific** skills (frameworks, databases, languages, etc.), browse community catalogs and install with the `npx skills` CLI:

```bash
# Install any community domain skill globally for opencode
npx skills add <owner/repo> --skill <name> -a opencode -g -y
```

**Where to find them**:

| Catalog | URL |
|---------|-----|
| 🇺🇸 vercel-labs/skills (official installer) | [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills) |
| 🇨🇳 鱼皮 AI 导航 (Chinese-mainland picks) | [ai.codefather.cn/skills](https://ai.codefather.cn/skills) |
| 🇨🇳 skillsmp (search engine) | [skillsmp.com/zh](https://skillsmp.com/zh) |
| 🇹🇷 Skill_Seekers (generate from docs) | [github.com/yusufkaraaslan/Skill_Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) |

These domain skills are **complementary knowledge** — they don't overlap with our 19 **process** skills (karpathy, diagnose, tdd, etc.).

---

## 📦 Components

| Component | Type | Count | Source |
|-----------|------|-------|--------|
| Agents | `.md` prompt files | **7** | Self-built (sisyphus/lyra/hephaestus + update/architect/planner/reviewer) |
| Skills | `SKILL.md` files | **19** | 4 self-built + 15 imported (11 from mattpocock + 3 from addyosmani + 1 re-implemented from addyosmani) |
| Commands | Slash-command files | **20** | Self-built, one-per-skill (plan/tdd/code-review/brainstorm/diagnose/verify/...) |
| Tools | TypeScript → `.js` | **0** | (Retired in v2.2; replaced by CLIs + native opencode tools) |
| Plugins | Runtime hook | **0** | (Retired in v2.2; karpathy-guidelines auto-loaded via meta-skill injection) |
| CLIs | npm -g | **3** | mmx-cli (MiniMax multimodal+search) + ctx7 (lib docs) + playwright-cli (browser automation) |

> The 20 commands are the **user-facing entry points** — see [`VIBECODING.md`](./VIBECODING.md) for the full command catalog.

---

## 🛠️ Customization Notes

### Modify Agent Behavior

Edit `agents/<agent>.md`, then re-run install:

```bash
vim agents/sisyphus.md   # Edit routing rules, delegation protocol, style_guide
bash install.sh           # Mirror to ~/.config/opencode/
```

### Add a New Skill

```bash
mkdir -p skills/my-skill
cp /path/to/SKILL.md skills/my-skill/
# Add to install.sh's SKILLS array
bash install.sh
```

### Add a New Command

```bash
mkdir -p .opencode/commands
cat > .opencode/commands/mycommand.md <<'EOF'
---
description: Short description for TUI command list
---

<command-body-content>
EOF
bash install.sh
```

### Add a New Agent

```bash
cat > agents/myagent.md <<'EOF'
---
name: myagent
description: What this agent does
mode: subagent
---

<prompt-content>
EOF
# Register in opencode.json (install.sh auto-merges)
bash install.sh
```

### Skip a Component

`install.sh` only installs files that **exist**. To skip:
- Agent: Delete `agents/<name>.md` then run install
- Skill: Remove from `SKILLS` array
- Command: Delete from `.opencode/commands/`

### Project-Level Customization (Recommended Pattern)

Our project is **global layer config** — once installed to `~/.config/opencode/`, it's available for all projects. To add project-level rules to a specific project, follow the official layering:

#### 1. Project-Level `AGENTS.md` (Project-Specific Rules)

Create `AGENTS.md` at the project root, **merged with global AGENTS.md** (project-level takes precedence):

```bash
cd your-project
cat > AGENTS.md <<'EOF'
# My Project Rules

## Build Commands
- `bun install` install dependencies
- `bun test` run tests
- `bun run build` build

## Architecture Conventions
- src/components/ - React components
- src/api/ - Backend API routes
- tests/ - Unit tests

## Skill Routing (Project-Level)
This project uses Sisyphus (not build). Default workflow:
- Start a requirement → Superpowers `brainstorming`
- Write code → `lyra` subagent (mid-tier)
- Repetitive tasks → `hephaestus` subagent (low-tier)
- Complex changes → OpenSpec `/opsx:propose`
- Hard bugs → Superpowers `systematic-debugging` or `diagnose` skill
EOF
```

**Loading rules**: opencode walks up from cwd to git worktree, the first matching `AGENTS.md` takes precedence; falls back to `~/.config/opencode/AGENTS.md` if not found.

**Global vs Project Division of Labor**:
- Global AGENTS.md: **Personal behavior preferences** (language/system/comment style/Emoji)
- Project-level AGENTS.md: **Project architecture/build commands/project-level skill routing**

#### 2. Project-Level `opencode.json` (Merge, Not Replace)

Create `opencode.json` at the project root, **merged with global `~/.config/opencode/opencode.json`**:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "sisyphus": { "model": "anthropic/claude-opus-4-20250514" }
  }
}
```

**Merge rules**: Project-level **only overrides conflicting keys**; global's provider/MCP/plugin are all preserved. So after installing our project, **you don't need to configure providers again** — just reuse the global ones.

#### 3. Project-Level Skill Loading

opencode by default scans 6 paths:

| Location | Priority |
|----------|----------|
| `.opencode/skills/<name>/SKILL.md` | Project-level (overlays global) |
| `.claude/skills/<name>/SKILL.md` | Project-level (Claude compatible) |
| `.agents/skills/<name>/SKILL.md` | Project-level (agent compatible) |
| `~/.config/opencode/skills/<name>/SKILL.md` | Global |
| `~/.claude/skills/<name>/SKILL.md` | Global (Claude compatible) |
| `~/.agents/skills/<name>/SKILL.md` | Global (agent compatible) |

**Same-name skills from all paths are loaded**. If a project wants to override a global same-name skill, **use the `permission` field to control visibility**:

```json
// .opencode/opencode.json
{
  "permission": {
    "skill": {
      "karpathy-guidelines": "deny"  // Hide global one in this project
    }
  }
}
```

#### 4. Project-Level Agent Override

If a project wants to override the behavior of one of our 7 agents, place a same-name `.md` in `.opencode/agents/`:

```bash
mkdir -p .opencode/agents
cp ~/.config/opencode/agents/sisyphus.md .opencode/agents/sisyphus.md
# Edit project-level sisyphus.md (modify intent_gate routing, etc.)
```

**Loading rules**: Project-level same-name agent overrides global. Our `install.sh` only installs to `~/.config/opencode/agents/` — **doesn't pollute project directories**.

> Override any of the 7: sisyphus / lyra / hephaestus / update / architect / planner / reviewer.

---

## 📐 Compaction Strategy (340K Trigger)

> **Why**: 1M context models suffer attention decay past ~340K tokens. Long context = expensive + bad. We compact around that threshold.

**Reference**: AI attention U-curve study — see [Compaction Strategy doc](docs/2026-06-11-compaction-strategy-340k.md)

### opencode 1.16.2 Schema (verified against `https://opencode.ai/config.json`)

The `compaction` block has **5 official fields**. There is **no "compaction threshold" field** — trigger is internal:

```
trigger ≈ model_context - reserved - preserve_recent_tokens
```

### Our Default Config

```jsonc
{
  "compaction": {
    "auto": true,                  // automatic trigger
    "prune": true,                 // drop old tool outputs
    "reserved": 100000,            // ⬇ from 300K (was eating 30% of window)
    "preserve_recent_tokens": 40000,  // ⬇ from 64K
    "tail_turns": 1                // ⬇ from default 2
  },
  "agent": {
    "compaction": {
      "prompt": "Aggressive compactor: 30K output, keep only essentials..."
    }
  }
}
```

### Trigger Point Per Model

| Model | Context | Trigger | Notes |
|-------|---------|---------|-------|
| **MiniMax-M3** (high-tier: Sisyphus / Architect / Planner / Reviewer / Update) | 512K | **~372K** | ✅ Matches 340K target |
| **deepseek-v4-flash** (mid/low: Lyra / Hephaestus) | 1M | ~860K | Aggressive prompt keeps session far below 860K |

For high-tier agents (Sisyphus primary), **372K trigger ≈ 340K target** — your specified sweet spot.

For 1M models, schema can't trigger below ~860K. We use **aggressive compaction prompt** as workaround: compresses session to 30K, so it takes 5x longer to grow back.

### Why This Matters

| Without Compaction Tuning | With Our Defaults |
|---------------------------|-------------------|
| Trigger at ~636K (1M model) | Trigger at ~860K + session stays short after |
| 1M-token session = **10x cost** vs 100K | 30K post-compact = **3x cost** |
| Attention decay past 400K | Attention fidelity throughout |

See [Compaction Strategy doc](docs/2026-06-11-compaction-strategy-340k.md) for full details.

---

## 🔍 Verification

```bash
# Install (idempotent)
bash install.sh

# Confirm CLI availability
for cmd in mmx ctx7 playwright-cli; do
  command -v $cmd && echo "  ✅ $cmd" || echo "  ⬜ $cmd"
done

# Confirm 7 agents + 19 skills + 20 commands are mirrored
ls ~/.config/opencode/agents/     # should list 7 .md files
ls ~/.config/opencode/skills/     # should list 19 directories
ls ~/.config/opencode/commands/   # should list 20 .md files
```

> As of v2.2 there are no TypeScript tools to build — all custom tooling has been replaced by CLI calls and native opencode features.

---

## 🔄 Maintenance: Upstream Skill Sync

> **15 of our 19 global skills come from upstream** (mattpocock/skills, addyosmani/agent-skills). We track every source in [`skills/SOURCES.yaml`](skills/SOURCES.yaml) and provide a check-and-update script.

### Skill Provenance Summary

| Type | Count | Update Strategy |
|------|-------|-----------------|
| **self** (no upstream) | 4 (karpathy, openspec-integration, mmx-cli-usage, update-project-meta) | N/A |
| **verbatim** (100% as-is) | 14 (mattpocock + addyosmani) | ✅ Auto-check + safe apply |
| **reimpl** (lightweight) | 1 (source-driven-development) | ⚠️ Manual review required |

### Check for Upstream Drift

```bash
# Default: check only (safe, doesn't modify anything)
bash scripts/update-skills.sh

# Preview what would change (without writing)
bash scripts/update-skills.sh --dry-run

# Apply all verbatim updates
bash scripts/update-skills.sh --apply

# Check a specific skill
bash scripts/update-skills.sh --skill grill-with-docs
```

**Exit codes**:
- `0` = all up-to-date
- `1` = drift detected (check mode)
- `2` = network/auth error

### How It Works

1. **Reads** `skills/SOURCES.yaml` (19 skills, each with source_repo + source_path)
2. **Fetches** latest SKILL.md from each upstream via `api.github.com` (works around `raw.githubusercontent.com` timeouts)
3. **Compares** SHA-256 of local + upstream content
4. **Reports** drift (or applies with `--apply`)
5. **Never** auto-updates reimpl skills (manual review required)

### Registry Format

```yaml
- name: grill-with-docs
  type: verbatim
  source_repo: mattpocock/skills
  source_path: skills/engineering/grill-with-docs/SKILL.md
  imported_at: 2026-06-10
  lines: 88
```

> **Adding a new imported skill?** Add an entry to `skills/SOURCES.yaml` so it shows up in drift checks.

### Real-World Maintenance Workflow

```bash
# Monthly: check if our 19 global skills have upstream updates
bash scripts/update-skills.sh

# If drift found, preview the changes
bash scripts/update-skills.sh --dry-run

# If happy with the diff, apply (verbatim skills only)
bash scripts/update-skills.sh --apply

# Verify no drift remains
bash scripts/update-skills.sh  # should show 0 drift, exit 0

# Commit the updates
git add skills/ && git commit -m "chore(skills): sync N verbatim skills with upstream"
```

**Last run (this session)**:
- Detected: 2 drifts (caveman, interview-me)
- Applied: 2 verbatim updates
- Re-checked: 0 drift, 14/14 verbatim up-to-date ✅

---

## 📁 Repository Structure

```
myOpenCodeWithMEeee/
├── agents/                 # 7 agent prompt files
│   ├── sisyphus.md         # primary (high-tier) — 7 XML segments + 12-row intent_gate
│   ├── lyra.md             # subagent (mid-tier) — can delegate to Hephaestus
│   ├── hephaestus.md       # subagent (low-tier) — task:deny, bash safe-glob
│   ├── architect.md        # subagent (high-tier) — domain model + ADR drafts
│   ├── planner.md          # subagent (high-tier) — implementation plans + to-issues
│   ├── reviewer.md         # subagent (high-tier) — read-only code review
│   └── update.md           # subagent (high-tier) — single-writer for CONTEXT.md/ADR/AGENTS.md
├── skills/                 # 19 skills (SKILL.md)
│   ├── caveman/                   # from mattpocock (ultra-compressed comms)
│   ├── diagnose/                  # from mattpocock (6-phase bug loop)
│   ├── git-workflow-and-versioning/ # from addyosmani (git workflow)
│   ├── grill-with-docs/           # from mattpocock
│   ├── handoff/                   # from mattpocock (cross-session continuity)
│   ├── improve-codebase-architecture/ # from mattpocock (architect primary)
│   ├── incremental-implementation/   # from addyosmani (vertical slices)
│   ├── interview-me/             # from addyosmani (verbatim, 1Q-at-a-time)
│   ├── karpathy-guidelines/       # 4 karpathy principles (auto-loaded)
│   ├── mmx-cli-usage/             # mmx CLI guide (multimodal)
│   ├── openspec-integration/      # OpenSpec ↔ Superpowers routing bridge
│   ├── prototype/                 # from mattpocock (throwaway exploration)
│   ├── setup-matt-pocock-skills/  # from mattpocock (one-time scaffolding)
│   ├── source-driven-development/ # lightweight re-impl (use ctx7 CLI)
│   ├── tdd/                       # from mattpocock (red-green-refactor)
│   ├── to-issues/                 # from mattpocock (planner primary)
│   ├── triage/                    # from mattpocock (5-role issue state machine)
│   ├── update-project-meta/       # CONTEXT.md / ADR / AGENTS.md (update agent)
│   └── zoom-out/                  # from mattpocock (high-level overview)
├── .opencode/
│   └── commands/           # 20 slash-command files
│       ├── brainstorm.md / caveman.md / code-review.md / diagnose.md /
│       │ finish-branch.md / git-workflow.md / grill.md / handoff.md /
│       │ improve-arch.md / interview.md / mmx.md / plan.md /
│       │ prototype.md / tdd.md / to-issues.md / triage.md /
│       │ updateProjectMeta.md / verify.md / write-skill.md / zoom-out.md
├── templates/              # Config templates
│   ├── AGENTS.md           # Global AGENTS.md template (copied on first install, never overwrites)
│   └── opencode-compaction.jsonc # 340K-trigger compaction defaults
├── scripts/                # Helper scripts
│   └── update-skills.sh    # Upstream drift checker
├── install.sh              # One-click install (idempotent) — 7 agents + 19 skills + 20 commands
├── uninstall.sh            # One-click uninstall
├── CHANGELOG.md            # Changelog
├── CONTRIBUTING.md         # Contribution guide
├── README.md               # English version (this file)
├── README.zh-CN.md         # 中文版本
├── VIBECODING.md           # Operator's manual — when to use what skill/command/agent
└── LICENSE                 # MIT
```

---

## 📄 License

This project is licensed under MIT, see [LICENSE](./LICENSE).