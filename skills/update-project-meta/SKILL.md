---
name: update-project-meta
description: AFTER setup-matt-pocock-skills has scaffolded the project, maintain the three project-level doc files (CONTEXT.md, AGENTS.md `## Agent skills` block, docs/adr/NNNN-xxx.md). User must explicitly invoke — e.g. "记录这个决策" / "加个术语" / "加个约定" / "沉淀" / "记录一下" / "add ADR" / "add term" / "supersede ADR-NNNN" / "deprecate old term". Reads existing files, checks for duplicates/conflicts, writes in canonical format. Without setup, this skill has nothing to maintain — defer to setup-matt-pocock-skills first.
disable-model-invocation: true
---

# Update Project Meta

Maintain three project-level doc files. **Single writer**: only this skill writes to these files. Agent prompts in `agents/*.md` are **off-limits** — those are the agent's own prompts, not project meta.

## Skill ecosystem — run `setup-matt-pocock-skills` first

This skill **can** run standalone (writing `CONTEXT.md` or `docs/adr/*.md` works without setup), but the full project-meta system is **interconnected**:

| Skill | Needs setup first? | Why |
|-------|--------------------|-----|
| `update-project-meta` (CONTEXT.md) | No | Setup doesn't touch CONTEXT.md |
| `update-project-meta` (ADR) | No | Setup doesn't touch docs/adr/ |
| `update-project-meta` (AGENTS.md `## Agent skills` block) | **Recommended** | Setup creates the initial block; this skill edits in-place |
| `triage` | **Yes** | Reads `docs/agents/{issue-tracker,triage-labels}.md` |
| `improve-codebase-architecture` | **Yes** | Reads `docs/agents/domain.md` + `CONTEXT.md` + `docs/adr/` |
| `setup-matt-pocock-skills` | N/A (one-time) | Scaffolds `AGENTS.md` + `docs/agents/` |

**Practical first-run order in a new project:**
1. `setup-matt-pocock-skills` — once, scaffolds the project entry point.
2. This skill for `CONTEXT.md` and ADR-0001~0005.
3. `triage` / `improve-codebase-architecture` are now usable.

## The three files

| File | What it holds | Format spec |
|------|---------------|-------------|
| `CONTEXT.md` | Domain vocabulary (terms + `_Avoid_` + relationships) | [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md) |
| `AGENTS.md` | Project conventions (only the `## Agent skills` block; other sections are user-owned) | [AGENTS-FORMAT.md](AGENTS-FORMAT.md) |
| `docs/adr/NNNN-xxx.md` | Architectural decisions (Nygard template) | [ADR-FORMAT.md](ADR-FORMAT.md) |

## When to invoke

User says one of (must be **explicit**):

- "记录这个决策" / "沉淀下来" / "加个 ADR" / "记录一下" / "存为 ADR"
- "加个术语" / "CONTEXT.md 加 X" / "add term to glossary"
- "AGENTS.md 加 X" / "更新项目约定" / "把这个写进项目规范"
- "supersede ADR-NNNN" / "deprecate old term" / "X 改成叫 Y"

**Do NOT auto-invoke** — even if a new term emerges naturally in conversation, **wait for the user to ask**. Domain docs are durable; auto-writing risks locking in decisions the user hasn't had time to think through.

## Pre-flight checks (MUST run before writing)

0. **Workspace isolation check** — confirm project root, then ALL writes stay inside it.
   - Run `pwd` (or `git rev-parse --show-toplevel` if a git repo). This is your **project root** for this session.
   - **All paths in this skill are relative to this root** — e.g. `./CONTEXT.md`, `./AGENTS.md`, `./docs/adr/NNNN-xxx.md`.
   - **NEVER write to** `~/.config/opencode/...` (user-level — that's `install.sh` / `orchestrator.js` territory, not project meta).
   - **NEVER write to another opencode workspace's directory** — even if the user mentions a sibling project. If the user wants that, they must open a new opencode session in that workspace.
1. **Read existing file** — get current state, never overwrite blindly.
2. **Duplicate check** — does the term / ADR / convention already exist?
   - CONTEXT.md: case-insensitive name match.
   - ADR: by `## Context` similarity + check NNNN file.
   - AGENTS.md: by section header (`## ...`).
3. **Conflict check** — does the new content contradict existing?
   - If yes: **flag and ask the user** before writing. Don't auto-resolve.
4. **Supersession check** — is the new content replacing old?
   - CONTEXT.md: add `_Deprecated: old term — replaced by Y because Z_` to the old entry. **Don't delete.**
   - ADR: add `supersedes: NNNN` to the new ADR's frontmatter.
   - AGENTS.md: edit the old line in place; don't leave dangling blocks.

## Write step

1. Show the user the **diff** (old → new) before writing. Wait for confirmation.
2. **Re-verify the target path is inside project root** (from step 0 of pre-flight). If the resolved absolute path starts with something other than the project root, **refuse and ask**.
3. Write the file (use relative path `./CONTEXT.md` etc. — never absolute paths that leave the workspace).
4. Confirm the write succeeded.
5. **Suggest follow-up** — what other docs / agent prompts / ADR links should be updated to match?

## Output format

After writing, output a `<results>` block:

```xml
<results>
  <file>CONTEXT.md | AGENTS.md | docs/adr/NNNN-xxx.md</file>
  <action>added | updated | deprecated | superseded</action>
  <term>name (if applicable)</term>
  <supersedes>NNNN (if applicable)</supersedes>
  <followup>What other docs should be updated to match?</followup>
  <needs_caveat>true if conflict was resolved (always surface caveat)</needs_caveat>
</results>
```

## Anti-patterns

- ❌ Writing without reading existing file first.
- ❌ Auto-invoking when the user did not ask.
- ❌ Deleting an old term or old ADR. **Deprecate, don't erase.**
- ❌ Writing to `agents/*.md` — that's the agent's own prompt, not project meta.
- ❌ Resolving conflicts silently. **Flag and ask.**
- ❌ Skipping the pre-flight duplicate check.
- ❌ Batching multiple unrelated updates into one write.
- ❌ **Writing outside the current project workspace** — no `~/.config/opencode/...`, no sibling project's directory. If the user wants to modify another workspace, they must open opencode in that workspace.
- ❌ **Using absolute paths** that could escape the workspace. Prefer `./CONTEXT.md` over `/some/other/path/CONTEXT.md`.
