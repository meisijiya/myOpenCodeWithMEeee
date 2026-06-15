# VIBECODING.md — Operator's Manual

> **Practical guide: when to invoke which skill, which command, which agent.**
>
> Companion to [`README.md`](./README.md) (architecture overview) and [`README.zh-CN.md`](./README.zh-CN.md) (Chinese version).
>
> Audience: human operators and OneTwo when it routes ambiguous requests.

---

## 0. TL;DR — 30-Second Decision

When OneTwo gets your request, it follows this routing (full table in §4):

```
┌─────────────────────────────────────────────────────────────┐
│ I need to...                                                │
├─────────────────────────────────────────────────────────────┤
│ Architect / design something new              → /architect  │
│ Write a multi-step plan                       → /plan       │
│ Review code / verify completion               → /verify     │
│ Update CONTEXT.md / ADR / project conventions  → /update…   │
│ Implement complex cross-file code             → @lyra       │
│ Implement CRUD / 3+ similar files             → @hephaestus │
│ Debug a hard bug (≥2 failed fixes)            → /diagnose   │
│ Clarify underspecified request                → /interview  │
│ Multi-step spec-driven change                 → OpenSpec    │
│ Test-first development                        → /tdd        │
│ Research / explore codebase                   → /zoom-out   │
│ Continue session on another device            → /handoff    │
│ Get user input with full context              → /brainstorm │
└─────────────────────────────────────────────────────────────┘
```

**Default flow** (covers 99% of tasks): `brainstorm → plan → implement → verify → finish`.

**5-second rule** (anti-overengineering): if your task is <10 lines of code change → do it yourself, don't delegate.

---

## 1. Architecture Quick Reference (7 Agents)

The system is a tiered delegation tree. Read this once, then forget it (OneTwo routes automatically):

```
                        ┌─────────────────────────┐
                        │  OneTwo (high-tier)   │
                        │  primary; intent router │
                        └────┬─────┬─────┬─────┬───┘
                             │     │     │     │
        ┌────────────┬───────┘     │     │     └────────────┬────────────┐
        ▼            ▼             ▼     ▼                  ▼            ▼
   ┌─────────┐ ┌─────────┐  ┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐
   │Architect│ │ Planner │  │ Reviewer│ │ Update  │    │   TwoOne  │ │Hephaes… │
   │ (high)  │ │ (high)  │  │ (high)  │ │ (high)  │    │  (mid)  │ │  (low)  │
   └────┬────┘ └────┬────┘  └─────────┘ └─────────┘    └────┬────┘ └─────────┘
        │           │                                         │
        └─write ADR─┘                                         ▼
       (delegated to Update)                       ┌──────────────────┐
                                                    │ EggDog (low)  │
                                                    │ CRUD / refactor   │
                                                    │ task: deny (leaf) │
                                                    └──────────────────┘
```

| Agent | Tier | One-liner | Don't ask it to... |
|-------|------|-----------|-------------------|
| **OneTwo** | high | Intent router + OpenSpec owner + atomic task orchestrator | write code directly, do reviews, write meta-docs |
| **Architect** | high | Domain model + ADR drafts | write code, review, plan |
| **Planner** | high | Implementation plans + issue breakdown | design, review, code |
| **Reviewer** | high | Independent code review (read-only) | write code, plan, design |
| **Update** | high | Single-writer for CONTEXT.md / ADR / AGENTS.md | implement, plan, review |
| **TwoOne** | mid | Complex implementation, research, mid bugs | design, review, plan |
| **EggDog** | low | CRUD, atomic refactor, test scaffolding | design, plan, review, meta-writes |
| **Librarian** | specialist | Multimodal document processing (PDF/DOC/PPT/XLS) | write code, design, plan |

**Strict depth=3 rule**: EggDog / Update / Architect / Planner / Reviewer / Librarian all have `task: false` (opencode physically removes the Task tool). Only OneTwo and TwoOne can spawn sub-agents.

**Atomic Task Orchestration**: OneTwo uses `todowrite` to track subtask progress. Large tasks are decomposed into atomic tasks (single file + clear boundary + verifiable criteria), assigned to TwoOne/EggDog based on difficulty, reviewed with karpathy 4 principles, and integrated upon completion.

---

## 2. The 20 Commands — User Entry Points

Each command loads its corresponding skill, then executes the workflow. Use these as direct shortcuts.

### 🟢 Process / Planning (start here)

| Command | Skill Loaded | When to use |
|---------|--------------|-------------|
| `/brainstorm` | `brainstorming` (Superpowers) | Need to explore user intent before coding — underspecified ask |
| `/interview` | `interview-me` | One-question-at-a-time clarification to 95% confidence |
| `/plan` | `writing-plans` (Superpowers) | Need an implementation plan with milestones before touching code |
| `/grill` | `grill-with-docs` | Stress-test an existing plan against the project's domain model |
| `/to-issues` | `to-issues` | Break a finished plan into independently-grabbable issues |
| `/prototype` | `prototype` | Want to mock up a UI / data model before committing |
| `/improve-arch` | `improve-codebase-architecture` | Identify architectural rot ("ball of mud") + improvement plan |
| `/triage` | `triage` | Manage issue state machine (5 roles: triage → ready → claimed → ...) |

### 🟡 Implementation (mid-flight)

| Command | Skill Loaded | When to use |
|---------|--------------|-------------|
| `/tdd` | `tdd` | Test-driven development (red-green-refactor loop) |
| `/incremental-impl` | `incremental-implementation` | Vertical-slice implementation, complements TDD |
| `/source-driven` | `source-driven-development` | Need to verify framework/API behavior via `ctx7` CLI |

### 🔴 Debug / Recovery

| Command | Skill Loaded | When to use |
|---------|--------------|-------------|
| `/diagnose` | `diagnose` | Hard bug or performance regression (≥2 failed fixes); reproduce → minimise → hypothesise → instrument → fix → regression-test |
| `/code-review` | `requesting-code-review` (Superpowers) | Pre-completion review of staged changes |
| `/verify` | `verification-before-completion` | Before claiming "done" — run commands, verify outputs (never trust self-claims) |
| `/finish-branch` | `finishing-a-development-branch` (Superpowers) | Branch is merged/PR'd — decide how to clean up |

### 🟣 Meta / Workflow

| Command | Skill Loaded | When to use |
|---------|--------------|-------------|
| `/git-workflow` | `git-workflow-and-versioning` | Atomic commits, branching strategy, conflict resolution |
| `/updateProjectMeta` | `update-project-meta` → **`update` agent** | "记录这个决策 / 加术语 / 加约定 / 写 ADR" |
| `/handoff` | `handoff` | Cross-session continuity (user-triggered, NOT for subagent delegation) |
| `/zoom-out` | `zoom-out` | Code comprehension from 30,000 feet (user-triggered) |
| `/caveman` | `caveman` | Token-compressed communication (-75% tokens) |
| `/mmx` | `mmx-cli-usage` | Multimodal (image/video/speech) + web search via `mmx` CLI |
| `/write-skill` | `writing-skills` | Author a new skill |

### Quick command chooser

```
I want to start a new feature            → /brainstorm → /plan → /tdd → /code-review → /verify
I want to fix a hard bug                 → /diagnose → /tdd → /verify
I want to add a small bug fix            → DEBUG_SIMPLE (just do it)
I want to add 3+ similar files           → @hephaestus (CRUD)
I want to redesign module boundaries     → @architect → /plan → implement
I want to break plan into issues         → /to-issues
I want to record a decision              → /updateProjectMeta
I want to switch devices / sessions      → /handoff
I want to understand unfamiliar code     → /zoom-out
```

---

## 3. The 19 Skills — When to Use What (by scenario)

Skills are loaded **on-demand** by commands or by agent intent_gate routing. Loading a skill injects prompt content — don't pre-load.

### 3.1 Process skills (OneTwo + Planner territory)

| Skill | Trigger | Primary agent |
|-------|---------|---------------|
| `interview-me` | Underspecified ask (missing who/why/success/constraint) | OneTwo / Planner |
| `grill-with-docs` | Plan conflicts with domain model | OneTwo / Architect / Planner |
| `setup-matt-pocock-skills` | **First-time scaffolding** (issue tracker, triage labels, AGENTS.md block) | OneTwo (run once) |
| `update-project-meta` | User says "记录决策 / 加术语 / 加约定" — write CONTEXT.md / ADR / AGENTS.md | **Update agent** (single-writer) |
| `openspec-integration` | Cross-spec change / multi-step spec-driven work | OneTwo / TwoOne |
| `improve-codebase-architecture` | Identify "ball of mud" + architecture improvement opportunities | Architect |
| `triage` | Issue state-machine driven by 5 triage roles | OneTwo (maintainer) |
| `to-issues` | Break plan into independent issues | Planner |

### 3.2 Implementation skills (TwoOne / EggDog territory)

| Skill | Trigger | Primary agent |
|-------|---------|---------------|
| `tdd` | Test-driven development (red-green-refactor) | TwoOne / EggDog |
| `incremental-implementation` | Vertical-slice implementation, complements TDD | TwoOne |
| `source-driven-development` | Framework/API decision needs official doc verification via `ctx7` CLI | TwoOne |
| `prototype` | Throwaway prototype for early design exploration | TwoOne |
| `diagnose` | Hard bugs, performance regressions (≥2 failed fixes; 6-phase loop) | TwoOne |
| `git-workflow-and-versioning` | Git ops (atomic commits, branches, conflicts) | All (with care for force/reset deny) |

### 3.3 Meta / cross-cutting skills

| Skill | Trigger | Primary agent |
|-------|---------|---------------|
| `karpathy-guidelines` | **Auto-loaded meta-skill** — 4 coding principles | All (always) |
| `mmx-cli-usage` | Multimodal / search needs (image, video, speech) | All (via `mmx` CLI) |

### 3.4 User-facing skills (you invoke; agent won't auto-load)

| Skill | Why user-only |
|-------|---------------|
| `handoff` | Cross-session continuity is user-driven (not subagent delegation) |
| `zoom-out` | Code comprehension is user-driven (won't pollute response) |
| `caveman` | Communication style is user-driven (token-savings explicit request) |

All three have `disable-model-invocation: true`.

### 3.5 Skill loading discipline

**Don't "load first, use later"** — skills inject prompt content that costs context. Load only when:
- Trigger condition actually matches
- Agent intent_gate matched the skill
- User explicitly invoked via command

If unsure → OneTwo reads intent_gate table first, then loads.

---

## 4. Three-Layer Skill Routing

This project integrates **three orthogonal skill sources**. They don't conflict — they layer:

```
┌──────────────────────────────────────────────────────────────────┐
│ Layer 1: Project skills (19, this repo)                            │
│  Loaded on intent_gate match + command invocation                  │
│  Managed via install.sh + scripts/update-skills.sh                 │
│  Source: skills/ in this repo                                     │
├──────────────────────────────────────────────────────────────────┤
│ Layer 2: Superpowers (14, external opencode plugin)                 │
│  Auto-loaded via using-superpowers meta-skill                      │
│  Source: ~/.cache/opencode/packages/superpowers@*/                 │
│  Install: opencode plugin install superpowers                      │
├──────────────────────────────────────────────────────────────────┤
│ Layer 3: OpenSpec (5, project-level optional)                      │
│  Generated by `openspec init --tools opencode` per project         │
│  Source: .opencode/skills/openspec-*/ in user's project            │
│  Install: npm i -g @fission-ai/openspec@latest                     │
└──────────────────────────────────────────────────────────────────┘
```

### When each layer triggers

| Layer | Default trigger | Override |
|-------|----------------|----------|
| **Layer 1 (project)** | Always available | — |
| **Layer 2 (Superpowers)** | `using-superpowers` meta-skill auto-injects; commands like `/brainstorm` route here | — |
| **Layer 3 (OpenSpec)** | **Two-layer trigger** (see §5 below) | Project may explicitly opt-in via `openspec init` |

### Why three layers?

1. **No single point of failure** — if any layer breaks, others still work
2. **No name conflict** — each layer's skills are distinct namespaces
3. **No default drift** — Layer 2 is the default; OpenSpec is opt-in
4. **Escape hatch** — switch to `build` / `plan` (opencode factory) to bypass all three

---

## 5. When to Use OpenSpec

OpenSpec is the **spec-driven change management** layer. It's powerful but heavy. Use only when:

### Two-layer trigger (OneTwo applies automatically)

| Layer | Type | Trigger | Behavior |
|-------|------|---------|----------|
| **Layer 1 (STRONG)** | Keyword | User says `propose` / `explore` / `apply` / `sync` / `archive` / 提议 / 应用 / 归档 | **Always** OpenSpec (no question) |
| **Layer 2 (SEMANTIC)** | Intent | Task involves multi-step change / cross-spec / brownfield / audit | **SUGGEST** OpenSpec + ask |
| **Layer 3 (DEFAULT)** | None | None of the above | **Silently** Superpowers (no OpenSpec) |

### Semantic signals that suggest OpenSpec

- ✅ Multi-step change with cross-spec impact (e.g., "重构 auth + 改 user model + 改 API")
- ✅ Cross-spec influence query (e.g., "改 X 会影响 Y 吗？")
- ✅ Requirement change tracking (e.g., "这个 spec 改了哪些 task？")
- ✅ Brownfield legacy code modifications
- ✅ Audit / review (e.g., "上个月做的 X 在哪？")
- ✅ Multiple parallel changes
- ✅ New project initialization

### Anti-patterns (DON'T do these)

- ❌ "新功能" → auto OpenSpec (too aggressive, false positives)
- ❌ "改" → ask "要不要 OpenSpec" (too noisy, breaks flow)
- ✅ keyword → unconditionally OpenSpec
- ✅ semantic → SUGGEST once with reason
- ✅ default → silently Superpowers

### SUGGEST template (OneTwo says this when Layer 2 matches)

> "This task looks like [multi-step change / cross-spec / ...] — OpenSpec handles this well.
> Go OpenSpec (write proposal.md first) or Superpowers (brainstorming → plans)?
> - OpenSpec: I'll create `openspec/changes/X/` with proposal.md
> - Superpowers: I'll go straight to brainstorming + writing-plans"

### When NOT to use OpenSpec

- Daily CRUD / research / simple implementations → use Layer 2 (Superpowers)
- Subagent delegation between our 7 agents → use our delegation_protocol (not OpenSpec)
- Cross-session continuity → use `/handoff`
- Issue tracking → use `/triage` (not OpenSpec)

---

## 6. Decision Flowcharts

### 6.1 "I want to start a new feature"

```
Are requirements clear? (who/why/success/constraint)
├─ NO → /interview or /brainstorm (Layer 2)
└─ YES
   │
   Is it cross-file + ≥2 files coordinating?
   ├─ NO (single file) → just implement
   └─ YES → @lyra (or /plan first if complex)
              │
              Need user sign-off on plan?
              ├─ NO → @lyra implements directly
              └─ YES → /plan → @lyra implements
                        │
                        Multi-spec change?
                        └─ YES → /opsx:propose (Layer 3)
```

### 6.2 "I want to fix a bug"

```
Single-line fix, obvious cause?
├─ YES → DEBUG_SIMPLE (OneTwo does it)
└─ NO
   │
   Has first fix attempt already failed?
   ├─ NO → OneTwo tries one fix
   └─ YES (≥2 failed fixes) → /diagnose (TwoOne)
                                │
                                reproduce → minimise → hypothesise → instrument → fix → regression-test
                                │
                                Need tests around fix?
                                └─ YES → /tdd around the fix
```

### 6.3 "I want to refactor / reorganize"

```
Mechanical rename across many files?
├─ YES → @hephaestus (ATOMIC_REFACTOR)
└─ NO
   │
   Affects module boundaries / contracts?
   ├─ NO → incremental-implementation (TwoOne)
   └─ YES → @architect → /plan → @lyra implements → @reviewer audits
```

### 6.4 "I want to add a new skill / command / agent"

```
Need user sign-off on naming + scope?
├─ YES → /brainstorm first
└─ NO
   │
   Skill? → write skills/<name>/SKILL.md, add to install.sh SKILLS array, bash install.sh
   Command? → write .opencode/commands/<name>.md, bash install.sh
   Agent? → write agents/<name>.md, register in opencode.json, bash install.sh
```

### 6.5 "I want to record a project decision"

```
Is it a domain term, architectural decision, or workflow convention?
├─ YES → /updateProjectMeta (delegates to **update** agent)
│        ├─ ADR → docs/adr/NNNN-<slug>.md
│        ├─ Term → docs/CONTEXT.md (or whatever project uses)
│        └─ Convention → AGENTS.md ## Conventions block
└─ NO → just chat about it (no need to persist)
```

### 6.6 "I want to verify completion"

```
Have you run the actual commands / tests / checks?
├─ NO → /verify (NEVER claim "done" without evidence)
└─ YES
   │
   Has a human reviewed the diff?
   ├─ NO → /code-review or @reviewer
   └─ YES → /finish-branch (decide merge / PR / cleanup)
```

---

## 7. Common Scenarios Cheatsheet

| Scenario | Flow | Command(s) |
|----------|------|------------|
| New feature (clear req) | OneTwo → @lyra → @reviewer | (auto) |
| New feature (unclear req) | /brainstorm → /plan → @lyra → @reviewer | `/brainstorm /plan` |
| New feature (multi-spec) | /opsx:propose → @lyra → /opsx:apply → @reviewer → /opsx:sync | `/opsx:*` |
| Hard bug (≥2 fix attempts) | /diagnose → /tdd around fix → /verify | `/diagnose /tdd /verify` |
| 3+ similar CRUD files | @hephaestus directly (one delegation) | `@hephaestus` |
| Mechanical rename | @hephaestus (ATOMIC_REFACTOR) | `@hephaestus` |
| Architecture redesign | @architect → /grill → /plan → @lyra → @reviewer | `@architect /grill /plan` |
| Add new domain skill | /write-skill → add to install.sh → bash install.sh | `/write-skill` |
| Record a decision | /updateProjectMeta | `/updateProjectMeta` |
| Continue tomorrow | /handoff | `/handoff` |
| Understand unfamiliar code | /zoom-out | `/zoom-out` |
| Compress tokens mid-session | /caveman (one-shot, then revert) | `/caveman` |
| Image / video / speech input | /mmx | `/mmx` |
| Verify library API behavior | /source-driven (calls `ctx7` CLI) | `/source-driven` |
| Setup new project for engineering skills | /setupMattPocockSkills (one-time) | (run once) |
| Manage issue queue | /triage | `/triage` |
| Audit codebase architecture | /improve-arch | `/improve-arch` |
| Prototype before committing | /prototype | `/prototype` |
| Save plan as issues | /to-issues | `/to-issues` |

---

## 8. Anti-Patterns

Things that look right but break the system. Memorize these:

| Anti-pattern | Why it's wrong | What to do instead |
|--------------|----------------|-------------------|
| **"I'll just do this myself"** (when intent_gate matched EggDog/TwoOne) | Bypasses delegation; future sessions won't have the same shortcut | Trust intent_gate. Delegate. |
| **"The skill description tells me what to do, I'll skip reading the body"** | Description is for triggering; body has the workflow | Read the skill body when it loads. |
| **"OpenSpec is overkill, let's just plan informally"** | OpenSpec handles cross-spec tracking; informal plans drift | Use OpenSpec when Layer 2 triggers (semantic match). |
| **"I'll claim 'done' without running commands"** | Self-claims are unreliable; verification-before-completion exists for a reason | Run `/verify` — actual `bash` / `bun test` / `git diff` output. |
| **"EggDog should review this PR"** | EggDog has no review capability; review needs independent perspective | Use `/code-review` or `@reviewer`. |
| **"Let me load every skill upfront to be safe"** | Skills cost context; pre-loading wastes tokens | Load on-demand via intent_gate or commands. |
| **"OneTwo → TwoOne → TwoOne → TwoOne"** | Depth=3 is hard limit; TwoOne spawning TwoOne breaks it | OneTwo routes directly. No nested dispatch. |
| **"Update agent wrote the ADR, let me also commit it"** | Update is single-writer; merge conflicts arise | Update writes; others only read. |
| **"I'll add a domain skill to the registry"** | We deleted skills-registry/ — install via `npx skills add` directly | See [README §Domain Skills](./README.md#📖-domain-skills-install-on-demand). |
| **"Force-push to fix my mistake"** | opencode `bash` permission denies `git push --force` | Use `git revert` or new commit. |
| **"Skip TDD for this trivial change"** | TDD is the discipline; "trivial" is rationalization | `/tdd` — even for 5 lines. |
| **"Background task is modifying X, let me also touch X"** | File state conflict; two agents modifying same file = corruption | Track background tasks; never touch files they're modifying. |
| **"Ctrl+B put task in background, I'll delegate similar task"** | Duplicate work; both agents modify same files = inconsistent state | Check background task status before delegating similar work. |
| **"I'll run tests on files background task is editing"** | Tests read intermediate state; false failures or false passes | Wait for background task to complete before running tests. |

---

## 9. Failure Recovery

When something breaks:

```
OneTwo misroutes?
  → Check intent_gate table (§1) — maybe intent didn't match cleanly
  → Manually invoke correct command (e.g., `/diagnose` instead of `/tdd`)
  → Tell OneTwo "that's wrong, route to X"

TwoOne's "I'm done" is suspicious?
  → /verify — run the commands TwoOne claims succeeded
  → /code-review — independent audit
  → If output doesn't match claim, push back

Plan conflicts with reality?
  → /grill — re-test against domain model
  → Update CONTEXT.md if model changed
  → Revise plan or add new ADR

Skill loaded but agent ignored it?
  → Skill description might be too narrow (didn't trigger)
  → Or agent didn't read the body (only description)
  → Invoke via command instead of relying on auto-trigger

OpenSpec conflict?
  → Check 4-tier fallback (CLI missing / uninitialized / change missing / structure corrupted)
  → See README §OpenSpec Fallback Strategy

Compaction ate important context?
  → /handoff — save state before compaction
  → Or restart with the handoff doc
```

---

## 10. Quick Reference: One-Page Card

```
┌──────────────────────────────────────────────────────────────────────┐
│  myOpenCodeWithMEeee — VIBECODING QUICK CARD (v2.2)                  │
├──────────────────────────────────────────────────────────────────────┤
│  7 AGENTS: OneTwo (router) │ TwoOne (mid) │ EggDog (low) │       │
│            Architect │ Planner │ Reviewer │ Update (high)             │
│                                                                      │
│  19 SKILLS (project) + 14 SUPERPOWERS + 5 OPENSPEC (opt)             │
│                                                                      │
│  20 COMMANDS: /brainstorm /plan /grill /to-issues /prototype /       │
│               /improve-arch /triage /tdd /diagnose /code-review /    │
│               /verify /finish-branch /git-workflow /updateProject…  │
│               /handoff /zoom-out /caveman /mmx /write-skill /       │
│               /incremental-impl /source-driven /interview            │
│                                                                      │
│  DEFAULT FLOW: brainstorm → plan → implement → verify → finish       │
│                                                                      │
│  5-SEC RULE: <10 lines → do yourself. ≥10 lines → delegate.          │
│                                                                      │
│  DEPTH=3: EggDog/Update/Architect/Planner/Reviewer all task:deny │
│                                                                      │
│  OPENSPEC: keyword → always; semantic → suggest; default → silent.   │
│                                                                      │
│  NEVER: trust self-claims without /verify. Skip TDD. Force-push.     │
│         Load skills upfront. Nest dispatch beyond depth=3.           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 11. See Also

- [`README.md`](./README.md) — Architecture overview, install, permissions
- [`README.zh-CN.md`](./README.zh-CN.md) — Chinese version
- [`agents/sisyphus.md`](./agents/sisyphus.md) — Intent routing table (authoritative)
- [`agents/<name>.md`](./agents/) — Agent prompts (lyra / hephaestus / architect / planner / reviewer / update)
- [`skills/<name>/SKILL.md`](./skills/) — 19 project skills
- [`skills/SOURCES.yaml`](./skills/SOURCES.yaml) — Skill provenance + drift tracking
- [`install.sh`](./install.sh) — Idempotent installer
- [`scripts/update-skills.sh`](./scripts/update-skills.sh) — Upstream drift check

---

**Last updated**: 2026-06-15 (v2.2)
