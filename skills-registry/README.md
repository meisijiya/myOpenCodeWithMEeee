# 🧭 Skills Registry — Domain-Skill Recommendations

> **Guidance-only.** We don't ship project-level skill auto-installation.
> Users install domain skills themselves via `npx skills` CLI (`vercel-labs/skills`).
> This directory is a **curated recommendation index** — not an automation script.
>
> 📘 **中文版**: [`README.zh-CN.md`](README.zh-CN.md)

---

## 🛒 Browse Skills Marketplace — Start Here

> **First time looking for skills? Use these 2 marketplaces to discover:**

| 🇨🇳 中文站 | Description |
|-----------|-------------|
| 🔍 **[skillsmp.com/zh](https://skillsmp.com/zh)** | 中文技能搜索，按语言/框架/场景分类检索 |
| 🔍 **[ai.codefather.cn/skills](https://ai.codefather.cn/skills)** | 鱼皮 AI 导航 Skills 专区，国内访问友好 |

> **Workflow**: Browse on the marketplace → find a skill you want → come back here to learn how to install it.

> **What are skills?** Reusable prompt templates that an AI agent (like our Sisyphus) can invoke when matching tasks. Domain-specific skills teach the agent about React, Java, Docker, etc.

---

## ⚠️ Project-Level Skill Installation Warnings

> **Read this BEFORE installing any domain skill.** Most pitfalls are preventable.

| # | Pitfall | What can go wrong | How to avoid |
|---|---------|-------------------|--------------|
| 1 | **Name conflict with our 11 global skills** | If a domain skill's `name:` matches one of ours (e.g., `tdd`, `diagnose`), opencode dedupes by file-system traversal order — **unpredictable** which wins | Before install: `ls ~/.config/opencode/skills/` to see existing names; if conflict, install to a different scope (`-p` for project) or skip that skill |
| 2 | **Token budget blowout** | Each skill ≈ 1-3K tokens. 5 skills ≈ 10-15K. Combined with our 15 (~27K), you may hit compaction triggers more often | Track cumulative token cost; prefer targeted install (`-s <name>`) over `--all` |
| 3 | **`disable-model-invocation: true` flag** | Skills with this flag are user-triggered only. If a domain skill lacks it, the agent **may auto-invoke it at wrong times** | Check the source SKILL.md's frontmatter before installing; if you want user-only behavior, add the flag locally after install |
| 4 | **Vague frontmatter descriptions** | Community skills vary in quality. A skill with `description: "helps with code"` may trigger on every code task — polluting Sisyphus's tool list | Skim the description first; if too broad, skip or write your own |
| 5 | **Tool/dependency assumptions** | A domain skill may assume you have `docker`, `playwright`, `git`, or specific CLI tools. Without them, the skill produces errors | Read the skill body for "Requirements" or "Prerequisites" sections |
| 6 | **No auto-update** | Unlike npm packages, installed skills don't auto-upgrade. Upstream improvements require `npx skills update <name>` | Run `npx skills update` periodically (or weekly) to stay current |
| 7 | **Three-tier permission model** | Our project grants `bash: *: allow` inside the project dir. A domain skill that runs destructive commands may bypass the safety net if it executes inside a project | Check the skill's instruction for shell commands; review before running |
| 8 | **Compaction trigger drift** | If installed globally (`-g`), the skill is in `~/.config/opencode/skills/` — same location as our 15. More skills = earlier compaction (per our 340K strategy) | Consider project-scope (`-p`) for experimental skills |

### Quick Pre-Install Checklist

```bash
# 1. Browse the marketplace
open https://skillsmp.com/zh
# or
open https://ai.codefather.cn/skills

# 2. Find a skill you want (e.g., "react-patterns")

# 3. List what it does BEFORE installing
npx skills add <owner/repo> --skill <name> --list -a opencode

# 4. Check for name conflicts
ls ~/.config/opencode/skills/ | grep -i <name>

# 5. Install (start with -g for global, our default)
npx skills add <owner/repo> --skill <name> -a opencode -g

# 6. Verify
npx skills list -a opencode
```

---

## Quick Start

```bash
# 1. List all skills in a repo
npx skills add <owner/repo> --list -a opencode

# 2. Install a specific skill (project scope)
npx skills add <owner/repo> --skill <name> -a opencode

# 3. Install globally (recommended — same location as our 15 global skills)
npx skills add <owner/repo> --skill <name> -a opencode -g -y
```

### Key `skills` CLI Options for OpenCode

| Flag | Purpose |
|------|---------|
| `-a opencode` | Target OpenCode agent |
| `-g` / `--global` | Install to `~/.config/opencode/skills/` |
| `-s` / `--skill <name>` | Install specific skill(s) |
| `-l` / `--list` | List available skills in a repo |
| `-y` / `--yes` | Skip confirmations (headless) |
| `--all` | Install all skills to all agents |

## Three Major Scenarios

| Scenario | Recommended Files | Key Repos |
|----------|-------------------|-----------|
| **Frontend dev** | `frontend-react.md`, `frontend-vue.md`, `frontend-design.md` | `vercel-labs/agent-skills`, `PatternsDev/skills`, `anthropics/skills` |
| **Backend dev** | `backend-java.md`, `backend-python.md`, `database.md` | `antigravity-awesome-skills`, `supabase/agent-skills`, `Jeffallan/claude-skills` |
| **Tooling & Ops** | `devops.md`, `security.md`, `testing.md` | `trailofbits/skills`, `squirrelscan/skills`, `browser-use/browser-use` |

## Domain Index

| File | Domain | Focus |
|------|--------|-------|
| [`tools.md`](tools.md) | Meta-tools | Skill_Seekers, `skills` CLI, antigravity-awesome-skills |
| [`frontend-react.md`](frontend-react.md) | React / Next.js | Hooks, composition, RSC, Patterns.dev |
| [`frontend-vue.md`](frontend-vue.md) | Vue / Nuxt | Composition API, performance, SSR |
| [`frontend-design.md`](frontend-design.md) | UI/UX design | Design guidelines, frontend-design, web-design-guidelines |
| [`backend-java.md`](backend-java.md) | Java / Spring Boot | Spring Boot, MyBatis, JPA |
| [`backend-python.md`](backend-python.md) | Python / FastAPI / Django | FastAPI, Django, testing |
| [`database.md`](database.md) | SQL & NoSQL | PostgreSQL, MySQL, Redis, MongoDB |
| [`devops.md`](devops.md) | Docker / K8s / CI-CD | Container, orchestration, pipeline |
| [`security.md`](security.md) | Security & auth | Audit, SAST, secret detection |
| [`testing.md`](testing.md) | E2E / performance | Playwright, browser automation, load testing |

## Philosophy: Why We Don't Automate

1. **No overlap with our 15 global skills** — our skills are process/workflow oriented (karpathy, diagnose, tdd, etc.). Domain skills are technology-specific (React, Java, Docker). They complement, not conflict.
2. **`skills` CLI is already excellent** — `npx skills add owner/repo --skill name -a opencode -g -y` is a single command. Bundling would duplicate functionality.
3. **User choice matters** — not every project needs Java skills. Let the developer decide.
4. **No touching install.sh / uninstall.sh / orchestrator** — these remain purely for our core agent system.

## Reference Resources

### 🛒 Skill Marketplaces (browse first)
- 🇺🇸 [skills.sh](https://skills.sh/) — official registry
- 🇨🇳 [skillsmp.com/zh](https://skillsmp.com/zh) — Chinese skill search
- 🇨🇳 [ai.codefather.cn/skills](https://ai.codefather.cn/skills) — 鱼皮 AI 导航 Skills 专区

### 📖 Curated Blog Posts
- [程序员鱼皮 — 40 Agent Skills 精选资源](https://www.cnblogs.com/yupi/p/19608327)
- [技术站 — Java 技术栈 Skills 全景指南](https://jishuzhan.net/article/2062777085067866114)

### 🔧 Tools
- [vercel-labs/skills](https://github.com/vercel-labs/skills) — the CLI itself
- [yusufkaraaslan/Skill_Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) — generate skills from docs/repos/PDFs
