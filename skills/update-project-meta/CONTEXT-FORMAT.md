# CONTEXT.md Format

Domain vocabulary. Inspired by Matt Pocock's `CONTEXT.md` (see `improve-codebase-architecture` skill).

## Canonical layout

```markdown
# <Project Name>

## Language

**Term1**: Definition.
_Avoid_: synonym1, synonym2

**Term2**: Definition.
_Avoid_: synonym1

## Relationships

- A holds many B
- B carries one C
- C is implemented by D

## Flagged ambiguities

- "old term" was previously used for both X and Y — resolved: use X for ..., Y for ...
```

## Rules

- **One term per entry.** Don't combine related concepts.
- **`_Avoid_` is mandatory for terms that have aliases** — explicit non-usage prevents drift.
- **Definitions are 1-2 sentences max.** This is a glossary, not a spec.
- **Relationships are forward-pointing** — "A holds B" not "B is held by A".
- **Flagged ambiguities document historical decisions.** Don't delete old entries; mark them as resolved.

## Anti-patterns

- ❌ Long paragraphs of explanation. Use doc files / ADR for that.
- ❌ Putting code identifiers here (`MyClass`, `myFunction`). Those are in the code, not the glossary.
- ❌ Putting non-domain jargon here ("async", "callback", "middleware"). Those are programming concepts, not project-specific.

## Example: a real entry

```markdown
**Memory**: Project long-term persistence layer. The only writer is `memory-agent`; reads via `memory_read` tool. Plain Markdown + grep, no FTS5 in v1.
_Avoid_: "context" (memory ≠ context window), "knowledge base" (sounds enterprise)
```
