# myOpenCodeWithMEeee

> Custom 1-Main + 1-Sub agent system for opencode, drawing design from [oh-my-pi](https://github.com/can1357/oh-my-pi) and [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent), with [karpathy-guidelines](https://github.com/multica-ai/andrej-karpathy-skills) and [OpenSpec](https://github.com/Fission-AI/OpenSpec) integrations.

## Quick Start

```bash
# Install (mirrors files to ~/.config/opencode/)
bash install.sh
# or: ./install.sh (after chmod +x)

# Uninstall (removes from ~/.config/opencode/ but keeps this repo intact)
bash uninstall.sh
# or: ./uninstall.sh (after chmod +x)
```

## Structure

```
myOpenCodeWithMEeee/
├── agents/
│   ├── sisyphus.md              # Main agent (4-segment XML prompt)
│   └── oracle.md                # Sub agent (breadth-first consultant)
├── tools/                       # Custom opencode tools (TypeScript)
│   ├── src/                     # TypeScript source
│   └── package.json
├── plugins/
│   └── orchestrator.ts          # Hook plugin source (Boulder + Keyword)
├── .opencode/
│   └── plugins/                 # Per spec: project-level plugin mirror
├── skills/
│   ├── karpathy-guidelines/     # 4 coding principles (verbatim import)
│   ├── ultrawork/               # Full work mode
│   ├── git-master/              # Atomic commits + rebase
│   └── openspec-integration/    # OpenSpec routing bridge
├── docs/                        # Design spec + implementation plan
├── install.sh                   # Mirrors files to ~/.config/opencode/
└── uninstall.sh                 # Removes installed files
```

## Reference Documents

- **Design spec**: `docs/2026-06-09-1plus1-agent-system-design.md`
- **Implementation plan**: `docs/2026-06-09-1plus1-agent-system.md`

## Components (target)

- 2 agents (Sisyphus main + Oracle sub)
- 10 custom tools (Hashline Edit + 9 others)
- 1 hook plugin (Boulder + Keyword)
- 4 skills (karpathy + ultrawork + git-master + openspec-integration)
- OpenSpec CLI + integration

See `docs/` for full design and task breakdown.

## License

MIT
