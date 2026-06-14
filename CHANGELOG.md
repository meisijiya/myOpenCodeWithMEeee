# Changelog

> **myOpenCodeWithMEeee** — 定制化多 Agent 协作系统 for opencode。  
> 从 v1 (Sisyphus + Oracle, 9 自建工具) 演进至 v2 (Sisyphus + Lyra + Hephaestus, 2 自建工具 + 3 MCP)，再到 v2.2 (7 Agents + 20 Commands + 项目记忆系统)。

## [v2.2] — 2026-06-15

### 🎯 优化方向

本次更新聚焦于**工程化协作**和**Token 效率优化**，引入细分领域 Agent、Command 系统、项目记忆系统，并对 Agent Prompt 进行大幅精简。

### 🤖 Agents (3 → 7)

- **新增 4 个细分领域 Agent**：
  - `update` — 项目元信息整理（CONTEXT.md / ADR / AGENTS.md），single-writer 原则
  - `architect` — 架构设计 + 领域建模 + ADR 起草
  - `planner` — 实现计划 + 任务拆分 + 需求澄清
  - `reviewer` — 代码审查 + 质量把关 + 接收反馈求证
- **Sisyphus 原子任务编排模式**：大任务拆分为原子任务（单文件 + 明确边界 + 可验证标准），逐个委派、逐个审查、及时纠正
- **Agent Prompt 精简**：
  - `sisyphus.md`: 491 → 244 行 (-50%)
  - `lyra.md`: 177 → 125 行 (-29%)
  - `hephaestus.md`: 133 → 112 行 (-16%)
  - **总计**: 801 → 481 行 (-40%, -320 行)
- **项目级 vs 用户级配置边界**：所有 Agent 明确"用户级配置（`~/.config/opencode/`）只读，项目级配置（项目根目录）可写"

### 📝 Commands (0 → 20)

新增 20 个快捷命令，覆盖常用工作流：
- **流程类**：`/plan`, `/tdd`, `/code-review`, `/brainstorm`, `/diagnose`, `/verify`
- **实现类**：`/interview`, `/grill`, `/to-issues`, `/triage`, `/improve-arch`, `/prototype`
- **元信息类**：`/setup`, `/updateProjectMeta`, `/handoff`, `/zoom-out`
- **工具类**：`/caveman`, `/git-workflow`, `/finish-branch`, `/write-skill`, `/mmx`

### 🧠 项目记忆系统

- **跨 Session 持久化**：`CONTEXT.md`（术语）/ `AGENTS.md`（约定）/ `docs/adr/`（决策）
- **工作流**：`/setup` 初始化 → 开发中 `/updateProjectMeta` 记录 → 关闭 Session 前保存 → 下次 Session 自动恢复
- **最佳实践**：关闭 Session 前执行 `/updateProjectMeta`，保存关键信息

### ⚙️ Compaction 优化（512K 模型适配）

- `reserved`: 100K → 50K（Agent Prompt 已精简 40%）
- `preserve_recent_tokens`: 40K → 50K（保留更多最近上下文）
- `tail_turns`: 1 → 2（更好的多步骤跟踪）
- **触发点**: 372K → 422K（512K 模型优化）
- **收益**：多出 50K tokens 用于实际对话，延长 Session 长度

### 📚 文档

- **VIBECODING.md**：操作手册（498 行），包含 20 Commands 使用指南、19 Skills 路由表、三层 Skill 路由说明、决策流程图、反模式清单
- **OPTIMIZATION.md**：Token 优化路线图，记录已完成优化（短期/中期）和未来优化方向（长期：词级 Skill 加载）
- **README.md**：更新 Compaction 配置章节、新增"项目记忆"章节

### 🔧 清理

- **删除过时文档**：`docs/` 5 个 v0 设计文档（171K）
- **删除死代码**：`tools/` 整个目录（950K）
- **删除运行时产物**：`data/` + `session-*.md`（300K）
- **删除弃用 Plugin**：`.opencode/src/orchestrator.ts` + `.opencode/plugins/orchestrator.js`
- **删除过时索引**：`skills-registry/` 12 个文件（56K）
- **删除弃用分支**：`archive/memory-plugin-v1-beta`, `v2-long-term-memory`, `v3-long-term-memory`
- **总计**：31 文件，-32,500 行

### 📊 统计摘要

| 类别 | 变更数 |
|------|-------|
| 🤖 Agents | 7 |
| 📝 Commands | 20 |
| 🧠 项目记忆 | 3 文件 |
| ⚙️ Compaction | 3 配置项 |
| 📚 文档 | 3 文件 |
| 🔧 清理 | 31 文件 |
| **总计** | **67** |

---

## [v2] — 2026-06-10

### 🏛️ 架构 (Architecture)
- **项目脚手架:** 初始化 `myOpenCodeWithMEeee` 项目目录结构，包含 agents/、tools/、skills/、plugins/、docs/、openspec/ 等核心文件夹。
- **安装脚本:** 实现 `install.sh` / `uninstall.sh`，支持幂等镜像安装至 `~/.config/opencode/`；修复安装中测试文件、占位文件和内部 helper 的排除逻辑，确保仅分发运行时文件。
- **Orchestrator 插件 (v1 → v2):**
  - 初始版本实现 Boulder-style 自动续跑、关键词检测（`ultrawork`/`ulw`/`search`）和 karpathy-guidelines 注入；
  - 修复插件事件名以兼容 opencode 1.16.2 实际 API（从假定的 `session.start` 切换至 `experimental.chat.system.transform`）；
  - **v2 增强:** 增加 3-tier 模型配置校验，启动时检测 Sisyphus/Lyra/Hephaestus 是否已分配模型，缺失时输出警告。
- **安装自动注册:** `install.sh` 自动在 `opencode.json` 注册 orchestrator 插件、@context7/mcp 和 @playwright/mcp 服务。
- **OpenSpec 初始化:** 初始化 OpenSpec 规范框架，生成 opsx-* 命令和 openspec-* skill 路由。

### 🤖 Agents
- **v1 (1+1 架构):** 创建 Sisyphus 主 Agent（4 段 XML prompt：角色/意图门/委派协议/风格指南）和 Oracle 子 Agent（广度优先只读顾问）。
- **修复 Agent 配置:** 移除 `model: inherit` 无效字段——opencode 1.16.2 拒绝此值，模型分配改由 `opencode.json` 配置。
- **🎯 v2 升级 (1+1+1 架构):**
  - 新增 **Lyra**（中档子 Agent）— 纯净上下文执行复杂代码实现、研究与文档调研、中等难度 Bug 修复，可进一步委派 Hephaestus；
  - 新增 **Hephaestus**（低档 Worker）— 专用于 CRUD、原子重构、测试脚手架，`task: deny` 禁止无限嵌套；bash 安全策略防误操作（`rm -rf /`、`git push --force` 等）；
  - **重写 Sisyphus** — 从 4 段扩展为 6 段 XML prompt，增加 9 行意图路由表（ARCHITECTURE→自己、COMPLEX_CODE→Lyra、CRUD→Hephaestus），与 OpenSpec 协议集成；严格深度=3 嵌套规则（主→子→叶子）。

### 🔧 Tools
- **TypeScript 环境搭建:** 为自定义工具初始化 Bun + TypeScript 构建链，锁定依赖版本，修复 tsconfig 中 noEmit 重复声明问题。
- **v1 自建工具 (7 个，均已删除):**
  - `ast-search` — ast-grep + ripgrep + grep 三阶降级搜索；
  - `web-search` — 先尝试 4-provider 链（被 revert），后改为 MiniMax API 单通道 + 简化凭据发现与多 provider 降级；
  - `image-inspect` — 调用 MiniMax VLM 分析的图片理解工具；
  - `mermaid-render` — Mermaid 图表在线渲染工具；
  - `pr-reader` — PR 内容抓取阅读工具；
  - `atomic-commit` — 原子化 Git 提交流程封装；
  - `context7-docs` / `playwright-browser` — 分别封装 Context7 文档查询和 Playwright 浏览器操作。
- **⚠️ BREAKING: v2 工具精简 — 删 7 留 2。** 遵循"拿来主义"原则，删除上述 7 个自建工具，替换为 MCP 直调 (`mcp__MiniMax__web_search`、`mcp__Context7__*`、`mcp__Playwright__*`) 或 opencode 内置 (`webfetch`、`bash`、`grep`)。
- **保留的两个创新工具:**
  - `hashline-edit` — 基于 FNV-1a CID 的行级锚点编辑工具，防止长文件中 Edit 漂移（omO 数据 6.7% → 68.3%）；经历错误处理加固和冗余代码清理；
  - `task-dispatch` — 子 Agent 委派的统一封装层，**v2 重写为 Router + MCP Proxy 模式**，支持 `agent:<type>` 和 `mcp:<server>:<tool>` 双模式路由。

### 🎯 Skills
- **导入 karpathy-guidelines:** 从 multica-ai/andrej-karpathy-skills 逐字导入 4 原则编码行为守则（Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution）。
- **导入 openspec-integration:** 自建路由桥接 Skill，统一 OpenSpec 命令（propose/explore/apply/sync/archive）与 Superpowers 工作流的调度策略。
- **🎯 v2 新增:** 从 mattpocock/skills 导入 3 个互补技能 — `grill-with-docs`（跟项目文档对抗式打磨设计）、`diagnose`（严谨的 Bug 诊断循环）、`to-issues`（将计划拆解为可领取 Issue）。

### 🔌 MCPs
- **新增 MCP 服务:** `install.sh` 自动注册 [@context7/mcp](https://context7.com)（库文档查询）和 [@playwright/mcp](https://playwright.dev)（浏览器自动化），补齐 MiniMax 之外的 MCP 生态。项目总计 3 个 MCP 服务（MiniMax + Context7 + Playwright）。

### 📝 文档
- **README v1:** 完整罗列 9 工具 + 2 技能 + 2 Agent 的清单与架构说明。
- **v2 设计规格:** 撰写 `2026-06-10-1plus1plus1-agent-system-design.md`（822 行），深入分析 v1 审计结论、Pi Subagents 参考、3-tier 路由设计、Bring-in 原则；补充 `v2-migration-plan.md` 实现计划。
- **深度=3 规则说明:** 在架构文档中明确严格嵌套规则（Sisyphus→Lyra/Hephaestus→叶子）及 opencode `task: deny` 硬保障机制。
- **README v2:** 全面重写，反映 v2 架构（3 Agents 2 Tools 5 Skills 3 MCPs），新增 9 行路由表、Bring-in 替换对照表、快速使用指南。

### 🐛 修复 (Fixes)
- **安装脚本修复:** 隔离测试文件和占位文件避免被错误安装到 `~/.config/opencode/tools/` 运行时目录；排除 `hashline-tag.js`（仅供 `hashline-edit` 内联使用的 Helper）；确保 Skill 目录仅在有内容时创建。

---

## 统计摘要

| 类别 | 变更数 |
|------|-------|
| 🏛️ 架构 | 8 |
| 🤖 Agents | 6 |
| 🔧 Tools | 19 |
| 🎯 Skills | 3 |
| 🔌 MCPs | 1 |
| 📝 文档 | 4 |
| 🐛 修复 | 3 |
| **总计** | **44** |
