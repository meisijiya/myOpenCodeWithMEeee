# Compaction Strategy: Why and How We Use ~340K Trigger

> **TL;DR**: 1M context models suffer from attention decay + token bloat past ~340K tokens. We tune opencode's compaction to trigger around that threshold.

**Reference**: AI attention U-curve study (`_AI编程009_如何解决AI模型注意力涣散问题_BV1v9ER68EJE`)

## The Problem

Modern LLMs advertise 1M token context windows. In practice, the effective working zone is much smaller:

| Context Used | Behavior |
|--------------|----------|
| 0 - 200K | Full attention, high fidelity |
| 200K - 400K | Mild degradation, mostly OK |
| 400K - 600K | **Attention decay starts** |
| 600K - 800K | **Severe attention loss** on middle tokens |
| 800K - 1M+ | **Attention collapse** — LLM loses track of context |

Two costs compound:

1. **Per-token cost** scales with context size — you pay for every token in every call
2. **Attention cost** — model "forgets" middle-of-context info, requiring re-reading

**Net effect**: Letting context grow to 800K is **more expensive AND worse** than compacting at 340K.

## opencode 1.16.2 Schema (Authoritative)

`compaction` block has **5 official fields** (verified against `https://opencode.ai/config.json`):

| Field | Type | Default | Meaning |
|-------|------|---------|---------|
| `auto` | bool | `true` | Auto-compact when context fills |
| `prune` | bool | `false` | Drop old tool outputs (saves tokens) |
| `tail_turns` | int | `2` | Recent turns to keep verbatim during compaction |
| `preserve_recent_tokens` | int | (none) | Max tokens of recent turns to keep verbatim |
| `reserved` | int | (none) | Buffer tokens for the compaction process itself |

**No "compaction threshold" field exists.** Trigger is internal:
```
trigger ≈ model_context - reserved - preserve_recent_tokens
```

## Our Configuration

```jsonc
{
  "compaction": {
    "auto": true,                 // ON: automatic trigger
    "prune": true,                // ON: drop old tool outputs (big token saver)
    "reserved": 100000,           // Down from 300K (was eating 30% of window)
    "preserve_recent_tokens": 40000,  // Down from 64K
    "tail_turns": 1               // Down from default 2 (keep only last turn)
  },
  "agent": {
    "compaction": {
      "prompt": "Aggressive compaction rules — see below"
    }
  }
}
```

### Trigger Point Per Model

| Model | Context | Trigger Point | Notes |
|-------|---------|---------------|-------|
| **MiniMax-M3** (Sisyphus) | 512K | **~372K** | ✅ Matches 340K target |
| **deepseek-v4-flash** (Lyra) | 1M | ~860K | Still late — relies on aggressive compaction to keep session short |
| **deepseek-v4-flash-free** (Hephaestus) | 1M | ~860K | Same |

For Sisyphus (primary agent), the **372K trigger ≈ 340K target** — the user-specified sweet spot.

For Lyra/Hephaestus (1M models), we can't get below ~860K trigger through schema alone. The aggressive `agent.compaction` prompt is the workaround: compress the session **hard** so it stays far from 860K most of the time.

## Aggressive Compaction Prompt

```text
You are an aggressive context compactor. Your job: produce the SHORTEST
possible summary that preserves the agent's ability to continue the task.
RULES (strict):

1. Output MUST fit in 30K tokens or less. Aim for 15-25K.
2. KEEP verbatim: the latest user request (last 1 turn), the last 3 tool
   results, current task status, key file paths being edited, and
   unresolved errors.
3. DISCARD: all intermediate reasoning, redundant tool calls, verbose
   error logs, exploration history, completed sub-tasks' detail (keep
   only their outcome).
4. Use terse bullet points, not prose. No filler words.
5. End with a 'NEXT STEPS' section listing 1-3 concrete actions.
6. NEVER include greetings, summaries-of-summaries, or meta-commentary
   about this prompt.

Format: code-block-friendly markdown. No emoji.
```

**Why this matters**:
- Default compaction preserves ~80% of detail
- Aggressive compaction drops to ~20% → session **shrinks 5x** after each trigger
- Once compacted, the session takes much longer to grow back to trigger point

## Why We Don't Use RTK-Style Token Slicing

RTK (Rust Token Killer) shaves 60-90% of tokens by reformatting tool output. We recommend it (see README §RTK). But RTK doesn't address attention decay — it just makes the same context cheaper. Compaction is the only solution to attention decay.

## What About Sub-Delegations?

When Sisyphus delegates to Lyra (mid-tier), Lyra operates in its **own session**. Lyra's session gets compacted independently using the same rules. Compacted summary is passed back to Sisyphus.

Same for Lyra → Hephaestus.

So each tier's session stays short. Sisyphus sees the **results** of sub-agent work, not the full history.

## Trade-offs

| Pro | Con |
|-----|-----|
| Lower token cost per call | Slight context loss during compaction |
| Better attention fidelity | More frequent compactions (every ~340K-400K tokens) |
| Cheaper long sessions | If 30K summary misses something, agent re-explores |
| Predictable memory | Need good compaction prompt (not too lossy) |

## Verification

After install, check that opencode.json has these fields:

```bash
python3 -c "import json; c=json.load(open('~/.config/opencode/opencode.json')); print(json.dumps(c['compaction'], indent=2))"
```

Expected output:
```json
{
  "auto": true,
  "prune": true,
  "reserved": 100000,
  "preserve_recent_tokens": 40000,
  "tail_turns": 1
}
```

## References

- opencode compaction config: <https://opencode.ai/config.json> (`$defs.Config.properties.compaction`)
- AI attention U-curve: `_AI编程009_如何解决AI模型注意力涣散问题_BV1v9ER68EJE`
- Models.dev context sizes: <https://models.dev>
