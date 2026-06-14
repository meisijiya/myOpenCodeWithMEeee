# ADR Format (Nygard template)

Architectural Decision Records. Inspired by Michael Nygard's "Documenting Architecture Decisions".

## File naming

`docs/adr/NNNN-short-kebab-title.md` where NNNN is zero-padded 4-digit sequence.

Use the **next available NNNN** — read all existing `docs/adr/*.md` to find the max + 1.

## Canonical layout

```markdown
---
status: proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
supersedes: NNNN  # optional, only if replacing an older ADR
---

# ADR-NNNN: <Title>

## Context and Problem Statement

[2-3 sentences. What is the issue? Why is it hard? What forces are at play?]

## Considered Options

1. **Option A** — <one-line description>
   - ✅ Pro: ...
   - ❌ Con: ...
2. **Option B** — ...
3. **Option C** — ...

## Decision Outcome

Chosen option: "**Option X**", because [the primary reason in 1-2 sentences].

### Consequences

- ✅ Good, because ...
- ❌ Bad, because ...

## Follow-up

[Things that need to happen to make this decision work. Optional — only if there are concrete next steps.]
```

## Rules

- **Status lifecycle**: `proposed` (initial) → `accepted` (after team buys in) → `deprecated` or `superseded` (replaced).
- **Don't delete old ADRs.** Mark `superseded` with `supersedes: NNNN` field pointing to the new ADR.
- **Context is for the future reader.** They didn't live through the discussion — make the problem statement self-contained.
- **Considered Options must be 2+.** Single-option ADRs are decisions disguised as analysis.
- **Consequences are honest.** List the bads. Don't sell the decision.

## Anti-patterns

- ❌ Writing the decision before the options. The point of an ADR is to show the reasoning, not the verdict.
- ❌ Putting implementation details here. ADRs are about decisions, not code.
- ❌ Single-option ADRs. If you only considered one option, write a "decision" note, not an ADR.
- ❌ Deleting an old ADR. **Mark `superseded` instead.**

## Example: real ADR skeleton

```yaml
---
status: proposed
date: 2025-06-14
---

# ADR-0001: Project memory uses Markdown + grep, not SQLite FTS5

## Context and Problem Statement

Need project-level long-term memory (LLM forgets between sessions). v1 used SQLite FTS5 but added complexity and made the single-writer principle hard to maintain.

## Considered Options

1. **SQLite FTS5** — full-text index, fast queries.
   - ✅ Pro: query performance, semantics-aware
   - ❌ Con: doubled plugin code complexity; corrupt-on-multi-writer risk
2. **Markdown + grep** (chosen) — simple, file-based, single-writer.
   - ✅ Pro: KISS, git-trackable, easy to debug
   - ❌ Con: slow at >5000 lines; no semantic search
3. **Vector DB (pgvector/chroma)** — semantic retrieval.
   - ✅ Pro: semantic match
   - ❌ Con: another dep; overkill for current scale

## Decision Outcome

Chosen: "**Markdown + grep**", because single-writer + KISS wins; we can add FTS5 later if daily logs exceed ~50 entries.

### Consequences

- ✅ Plugin stays < 400 lines
- ✅ Corruption mode is observable (open the file)
- ❌ Query performance degrades past ~5000 lines

## Follow-up

- Monitor `data/memory/memory/*.md` total line count.
- If > 5000 lines, add an FTS5 index layer (don't rewrite the plugin).
```
