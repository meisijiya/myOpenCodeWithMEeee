# AGENTS.md Format

Project-level agent config. Inspired by Matt Pocock's `setup-matt-pocock-skills`.

## This skill only owns one section: `## Agent skills`

Other sections in `AGENTS.md` (e.g. project description, install steps, conventions) are **user-owned**. Don't touch them unless the user asks.

## Canonical layout of the `## Agent skills` block

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

## Rules

- **Edit in-place** if the `## Agent skills` block already exists. Don't append a duplicate.
- **Never create `AGENTS.md` when `CLAUDE.md` exists** (or vice versa) — always edit the one that's there.
- **Link the three docs files** — they should be in `docs/agents/` (created by `setup-matt-pocock-skills`).

## What goes in each docs file (3 files)

| File | Content |
|------|---------|
| `docs/agents/issue-tracker.md` | One-line description of the issue tracker + how skills should use it (e.g. `gh issue create`, or local markdown convention). |
| `docs/agents/triage-labels.md` | The 5 canonical triage role names mapped to the actual label strings used in this repo's tracker. |
| `docs/agents/domain.md` | Where `CONTEXT.md` and `docs/adr/` live (single-context vs multi-context). Tells skills where to look. |

## Anti-patterns

- ❌ Adding the `## Agent skills` block to a file that already has it. Edit in place.
- ❌ Touching non-`## Agent skills` sections without user asking.
- ❌ Creating both `AGENTS.md` and `CLAUDE.md` — pick one.
- ❌ Skipping the link to `docs/agents/*.md` — the block must be a stub, not the full content.
