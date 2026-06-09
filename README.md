# myOpenCodeWithMEeee

> Custom 1-Main + 1-Sub agent system for opencode, drawing design from [oh-my-pi](https://github.com/can1357/oh-my-pi) and [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent), with [karpathy-guidelines](https://github.com/multica-ai/andrej-karpathy-skills) and [OpenSpec](https://github.com/Fission-AI/OpenSpec) integrations.

## How it integrates with opencode

This project is a **drop-in addition** to your existing opencode setup. It does **not** require any separate provider/MCP configuration — it reuses whatever you've already configured via opencode's `/connect` command and your `opencode.json`.

| What | Where it lives | How to configure |
|------|---------------|------------------|
| **Providers / API keys** | opencode's own `opencode.json` | `/connect` in TUI (or edit `opencode.json` directly) |
| **MCP servers** (e.g. `MiniMax`) | opencode's own `opencode.json` | `mcp` field in `opencode.json` |
| **karpathy-guidelines** | This project, mirrored to `~/.config/opencode/skills/` | `bash install.sh` |
| **Sisyphus + Oracle agents** | This project, mirrored to `~/.config/opencode/agents/` | `bash install.sh` |
| **Orchestrator hook plugin** | This project, registered in your `opencode.json` | `bash install.sh` (auto-registers) |
| **9 custom tools** | This project, mirrored to `~/.config/opencode/tools/` | `bash install.sh` |
| **OpenSpec integration** | This project, in `.opencode/skills/openspec-*` and `.opencode/commands/opsx-*` | `openspec init --tools opencode` |

Agents **omit the `model` field** entirely, so they pick up whatever provider/model is globally configured in opencode (primary agents use the global model; subagents inherit the primary agent's model). The orchestrator plugin re-injects karpathy-guidelines + project `AGENTS.md` into every LLM call's system prompt — it doesn't add or replace any model configuration.

## Quick Start

```bash
# Install (mirrors files to ~/.config/opencode/ AND auto-registers orchestrator plugin)
bash install.sh

# In TUI: pick a model via /connect (or pre-configure in opencode.json)
opencode
# Then:  /connect  →  choose provider
# Then:  [TAB]  to switch to "sisyphus" or "oracle" agent

# Uninstall (removes files + unregisters plugin; preserves your /connect providers)
bash uninstall.sh
```

## What install.sh does

1. Copies `agents/*.md` → `~/.config/opencode/agents/`
2. Copies `skills/karpathy-guidelines/SKILL.md` → `~/.config/opencode/skills/karpathy-guidelines/`
3. Copies `skills/openspec-integration/SKILL.md` → `~/.config/opencode/skills/openspec-integration/`
4. Copies built tools (9 files, excluding tests/helpers) → `~/.config/opencode/tools/`
5. Copies `plugins/orchestrator.js` → `~/.config/opencode/plugins/`
6. **Appends `plugins/orchestrator.js` to the `plugin` array in `~/.config/opencode/opencode.json`** (idempotent)

It does **not** touch: providers, MCPs, `MiniMax` config, `compaction` settings, superpowers, or any other plugin you have installed.

## What uninstall.sh does

1. Removes all files this project created
2. **Removes `plugins/orchestrator.js` from `opencode.json`'s `plugin` array**

It does **not** touch: providers, MCPs, other plugins, or anything else in your `opencode.json`.

## Components

### Agents (2)

| Name | Mode | Description |
|------|------|-------------|
| `sisyphus` | primary | 4-segment XML prompt: `<role>` (karpathy 4 principles) + `<intent_gate>` (7-intent routing) + `<delegation_protocol>` + `<style_guide>`. Can write code; delegates research/analysis to oracle. |
| `oracle` | subagent | Breadth-first read-only consultant. Combines explore + librarian + oracle. Returns structured `<results>` XML block. No edit/bash/write/task permissions. |

### Custom Tools (9)

| Tool | Purpose | Notes |
|------|---------|-------|
| `hashline-edit` | LINE#CID-anchored file edit | Replaces default `edit`. Stale-anchor detection (Grok 6.7% → 68.3%). |
| `task-dispatch` | Sub-agent delegation wrapper | Convenience layer for calling the built-in `task` tool. |
| `ast-search` | tree-sitter AST pattern search | Supports 14 languages; falls back to ripgrep, then grep. |
| `web-search` | Web search via MiniMax API | Auto-discovers creds from opencode.json's `mcp.MiniMax` block. |
| `image-inspect` | VLM image analysis via MiniMax | Auto-discovers creds. Supports HTTP/data/file paths. |
| `mermaid-render` | Mermaid → ASCII/PNG | ASCII stub; PNG via `mmdc`. |
| `pr-reader` | GitHub PR/Issue reader | Uses `gh` CLI; falls back to GitHub API. |
| `atomic-commit` | Group working tree into atomic commits | Source > test > docs > config scoring. |
| `context7-docs` | Library documentation query | Via context7.com API. |
| `playwright-browser` | Browser automation | Stub for `bunx playwright`; recommend `@playwright/mcp` for full UI. |

> 10 tool names listed; `hashline-tag` is bundled into `hashline-edit` (internal helper, not a standalone tool).

### Skills (4)

| Skill | Source | Purpose |
|-------|--------|---------|
| `karpathy-guidelines` | multica-ai/andrej-karpathy-skills (verbatim) | 4 coding principles (Think / Simplicity / Surgical / Goal-Driven) |
| `openspec-integration` | This project | Routing bridge: OpenSpec ↔ Superpowers boundaries |
| `openspec-{propose,explore,apply-change,sync-specs,archive-change}` | Auto-generated by `openspec init` | OpenSpec's 5 workflow skills |
| `git-master`, `ultrawork` | (planned, dirs exist but no SKILL.md yet) | Reserved for future expansion |

### Plugins (1)

| Plugin | Events | Purpose |
|--------|--------|---------|
| `orchestrator` | `experimental.chat.system.transform` + `chat.message` + `experimental.session.compacting` | Injects karpathy-guidelines + project AGENTS.md into every LLM call; detects `ultrawork` / `search` keywords; re-injects karpathy pre-compact. |

> Note: opencode 1.16.2's actual plugin API does NOT include `session.start`, `message.user`, `session.idle`, or `session.compact` — those were the plan's assumptions. The plugin uses the actual `experimental.*` hooks. Boulder-style "session.idle → todo continuation" is not possible in current opencode API.

## Structure

```
myOpenCodeWithMEeee/
├── agents/
│   ├── sisyphus.md              # Main agent (4-segment XML prompt)
│   └── oracle.md                # Sub agent (breadth-first consultant)
├── tools/                       # Custom opencode tools (TypeScript + Bun)
│   ├── src/                     # 10 source files + 10 test files
│   ├── dist/                    # Built .js (gitignored, installed by install.sh)
│   ├── package.json
│   ├── tsconfig.json
│   └── bun.lock
├── .opencode/
│   ├── src/orchestrator.ts      # Hook plugin source
│   ├── plugins/orchestrator.js  # Built output
│   ├── skills/                  # 5 OpenSpec skills (auto-generated)
│   ├── commands/                # 5 OpenSpec commands (auto-generated)
│   ├── package.json
│   └── tsconfig.json
├── skills/
│   ├── karpathy-guidelines/     # 4 coding principles (verbatim, MIT)
│   └── openspec-integration/    # Routing bridge
├── openspec/                    # OpenSpec project-level content
│   ├── specs/                   # Topic-level main specs (single source of truth)
│   └── changes/                 # In-progress + archived changes
├── docs/                        # Design spec + implementation plan
├── install.sh                   # Mirrors files + auto-registers plugin
└── uninstall.sh                 # Removes files + unregisters plugin
```

## Testing

```bash
cd /home/ljh2923/myOpenCodeWithMEeee/tools
bun test                # 84+ tests across 23 files
bun run typecheck       # 0 errors
bun run build           # Bundles 10 entry points to dist/
```

## Development

To add a new tool:

1. Create `tools/src/your-tool.ts` following the pattern from existing tools (`tool.schema` for zod, `async execute(args, context)` shape).
2. Add `tools/src/your-tool.test.ts` with module load + schema sanity tests.
3. Run `bun run build` — output goes to `tools/dist/your-tool.js`.
4. Commit. The next `bash install.sh` will mirror it to `~/.config/opencode/tools/`.

To update an existing tool:

1. Edit `tools/src/your-tool.ts`.
2. Run `bun test && bun run build`.
3. Commit. Re-run `bash install.sh`.

## Reference Documents

- **Design spec**: `docs/2026-06-09-1plus1-agent-system-design.md`
- **Implementation plan**: `docs/2026-06-09-1plus1-agent-system.md`

## Inspiration

- [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) — Hashline Edit, persistent subagents, `://` URI schemes
- [code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — 4-segment dynamic prompt, Boulder hook, ultrawork keyword
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) — Karpathy 4 coding principles
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) — Spec-driven development

## License

MIT
