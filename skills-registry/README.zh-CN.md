# 🧭 Skills Registry — 领域 Skill 推荐目录

> **纯指导性。** 我们不自带项目级 skill 的自动化安装。
> 用户用 `npx skills` CLI（`vercel-labs/skills`）自己装领域 skill。
> 本目录是**精选推荐索引**——不是自动化脚本。

---

## 🛒 找 Skill 第一站 —— 浏览技能市场

> **第一次找 skill？从这 2 个市场开始：**

| 🇨🇳 中文站 | 说明 |
|-----------|------|
| 🔍 **[skillsmp.com/zh](https://skillsmp.com/zh)** | 中文技能搜索，按语言/框架/场景分类检索 |
| 🔍 **[ai.codefather.cn/skills](https://ai.codefather.cn/skills)** | 鱼皮 AI 导航 Skills 专区，国内访问友好 |

> **使用流程**：在市场浏览 → 找到想用的 skill → 回到本目录学怎么装。

> **Skill 是什么？** 可复用的 prompt 模板，AI agent（像我们的 Sisyphus）匹配任务时调用。领域型 skill 教 agent React、Java、Docker 等具体技术。

---

## ⚠️ 项目级 Skill 安装警告

> **装任何领域 skill 之前先看这个。** 多数坑可预防。

| # | 坑 | 出什么错 | 怎么避免 |
|---|----|---------|---------|
| 1 | **跟 15 个全局 skill 重名冲突** | 领域 skill 的 `name:` 如果跟我们重名（如 `tdd` / `diagnose`），opencode 按文件系统遍历顺序去重——**不可预测**谁赢 | 安装前 `ls ~/.config/opencode/skills/` 看现有名字；冲突时装到项目作用域（`-p`）或跳过该 skill |
| 2 | **Token 预算爆掉** | 每个 skill 约 1-3K tokens，5 个就是 10-15K。叠加我们的 15 个（~27K），会触发更频繁的压缩 | 跟踪累计 token 成本；用 `-s <name>` 精准装，别 `--all` |
| 3 | **`disable-model-invocation: true` 标记** | 带这个 flag 的 skill 是用户手动触发。如果领域 skill 缺这个 flag，agent **可能误触发** | 装前看源 SKILL.md 的 frontmatter；想要 user-only 行为，装完本地加上这个 flag |
| 4 | **frontmatter 描述太模糊** | 社区 skill 质量参差。`description: "helps with code"` 这种会在每个代码任务触发——污染 Sisyphus 工具列表 | 装前扫一眼 description；太宽就跳过或自己写 |
| 5 | **依赖/工具假设** | 领域 skill 可能假定你装了 `docker` / `playwright` / `git` 等特定工具。缺了就报错 | 看 skill 正文 "Requirements" / "Prerequisites" 段 |
| 6 | **不自动更新** | 跟 npm 包不同，装好的 skill 不会自动升级。上游改进需手动 `npx skills update <name>` | 定期跑 `npx skills update`（建议每周）|
| 7 | **三层权限模型** | 我们项目在项目目录内给 `bash: *: allow`。如果领域 skill 在项目内执行破坏性命令，可能绕过安全网 | 看 skill 里的 shell 命令；运行前审查 |
| 8 | **压缩触发点漂移** | 如果全局装（`-g`），skill 进 `~/.config/opencode/skills/`——跟我们 15 个同位置。skill 越多 → 越早触发压缩（按我们 340K 策略）| 实验性 skill 用项目作用域（`-p`）|

### 装前快查清单

```bash
# 1. 浏览市场
open https://skillsmp.com/zh
# 或
open https://ai.codefather.cn/skills

# 2. 找到想要的 skill（如 "react-patterns"）

# 3. 装前先看它能干什么
npx skills add <owner/repo> --skill <name> --list -a opencode

# 4. 检查重名冲突
ls ~/.config/opencode/skills/ | grep -i <name>

# 5. 装（先用 -g 全局装，跟我们 15 个同位置）
npx skills add <owner/repo> --skill <name> -a opencode -g

# 6. 验证
npx skills list -a opencode
```

---

## 快速开始

```bash
# 1. 列某 repo 的所有 skill
npx skills add <owner/repo> --list -a opencode

# 2. 装特定 skill（项目作用域）
npx skills add <owner/repo> --skill <name> -a opencode

# 3. 全局装（推荐——跟我们 15 个全局 skill 同位置）
npx skills add <owner/repo> --skill <name> -a opencode -g -y
```

### `skills` CLI 在 OpenCode 下的关键参数

| Flag | 作用 |
|------|------|
| `-a opencode` | 目标 OpenCode agent |
| `-g` / `--global` | 装到 `~/.config/opencode/skills/` |
| `-s` / `--skill <name>` | 装特定 skill |
| `-l` / `--list` | 列 repo 里的 skill |
| `-y` / `--yes` | 跳过确认（无头模式）|
| `--all` | 装所有 skill 到所有 agent |

## 三大场景

| 场景 | 推荐文件 | 关键仓库 |
|------|---------|---------|
| **前端开发** | `frontend-react.md`, `frontend-vue.md`, `frontend-design.md` | `vercel-labs/agent-skills`, `PatternsDev/skills`, `anthropics/skills` |
| **后端开发** | `backend-java.md`, `backend-python.md`, `database.md` | `antigravity-awesome-skills`, `supabase/agent-skills`, `Jeffallan/claude-skills` |
| **工具与运维** | `devops.md`, `security.md`, `testing.md` | `trailofbits/skills`, `squirrelscan/skills`, `browser-use/browser-use` |

## 领域索引

| 文件 | 领域 | 重点 |
|------|------|------|
| [`tools.md`](tools.md) | 元工具 | Skill_Seekers, `skills` CLI, antigravity-awesome-skills |
| [`frontend-react.md`](frontend-react.md) | React / Next.js | Hooks, composition, RSC, Patterns.dev |
| [`frontend-vue.md`](frontend-vue.md) | Vue / Nuxt | Composition API, performance, SSR |
| [`frontend-design.md`](frontend-design.md) | UI/UX 设计 | Design guidelines, frontend-design, web-design-guidelines |
| [`backend-java.md`](backend-java.md) | Java / Spring Boot | Spring Boot, MyBatis, JPA |
| [`backend-python.md`](backend-python.md) | Python / FastAPI / Django | FastAPI, Django, testing |
| [`database.md`](database.md) | SQL & NoSQL | PostgreSQL, MySQL, Redis, MongoDB |
| [`devops.md`](devops.md) | Docker / K8s / CI-CD | Container, orchestration, pipeline |
| [`security.md`](security.md) | 安全 & 认证 | Audit, SAST, secret detection |
| [`testing.md`](testing.md) | E2E / 性能 | Playwright, browser automation, load testing |

## 哲学：我们为什么不自动化

1. **不跟 15 个全局 skill 重叠**——我们的 skill 是流程/工作流导向（karpathy, diagnose, tdd 等），领域 skill 是技术导向（React, Java, Docker）。**互补不冲突**。
2. **`skills` CLI 已经够好**——`npx skills add owner/repo --skill name -a opencode -g -y` 一行命令。打包会重复造轮子。
3. **用户选择权重要**——不是每个项目都需要 Java skill。让开发者自己决定。
4. **不碰 install.sh / uninstall.sh / orchestrator**——这些只服务于我们核心 agent 体系。

## 参考资源

### 🛒 技能市场（先浏览）
- 🇺🇸 [skills.sh](https://skills.sh/) — 官方注册表
- 🇨🇳 [skillsmp.com/zh](https://skillsmp.com/zh) — 中文技能搜索
- 🇨🇳 [ai.codefather.cn/skills](https://ai.codefather.cn/skills) — 鱼皮 AI 导航 Skills 专区

### 📖 推荐博客
- [程序员鱼皮 — 40 Agent Skills 精选资源](https://www.cnblogs.com/yupi/p/19608327)
- [技术站 — Java 技术栈 Skills 全景指南](https://jishuzhan.net/article/2062777085067866114)

### 🔧 工具
- [vercel-labs/skills](https://github.com/vercel-labs/skills) — CLI 本身
- [yusufkaraaslan/Skill_Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) — 从文档/repo/PDF 生成 skill
