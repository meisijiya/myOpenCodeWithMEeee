---
description: 初始化项目级元数据（项目根目录的 CONTEXT.md / AGENTS.md / docs/adr/ / .gitignore）
---

调用 `setup-matt-pocock-skills` skill，初始化**项目级**元数据基础设施。

**这是使用 `/updateProjectMeta` 的前置条件。**

## ⚠️ 重要：项目级 vs 用户级

- **项目级**（本命令操作）：项目根目录的 `CONTEXT.md` / `AGENTS.md` / `docs/adr/` / `.gitignore`
- **用户级**（**不要动**）：`~/.config/opencode/` 下的文件（包括用户级 `AGENTS.md`）

**铁律**：用户级配置（`~/.config/opencode/`）是**只读的**，不能改。如果要改，必须先询问用户。

## 初始化内容（项目级）

- `CONTEXT.md`：项目核心术语和概念（项目根目录）
- `AGENTS.md`：项目级约定和规范（项目根目录，`## Agent skills` 块）
- `docs/agents/`：agent 配置目录（项目根目录）
- `docs/adr/`：架构决策记录目录（项目根目录）
- `.gitignore`：项目忽略规则（项目根目录，如果不存在则创建）

## .gitignore 配置

### 标准忽略规则（自动添加）

如果 `.gitignore` 不存在，创建并添加以下标准规则：

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
*.log

# Environment variables
.env
.env.local
.env.*.local

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# OpenCode runtime artifacts
data/
session-*.md

# OpenSpec auto-generated (per-project)
.opencode/skills/openspec-*/
.opencode/commands/opsx-*
openspec/
```

### 如果 .gitignore 已存在

- **不覆盖**已有规则
- **追加**缺失的标准规则（如 `.env`, `node_modules/`, `dist/` 等）
- **保留**用户自定义规则

### 使用场景

- 首次初始化项目
- 项目缺少 .gitignore
- 需要补充标准忽略规则

## 使用场景

- 首次使用本项目配置体系
- 项目级元数据文件缺失
- 需要重新初始化项目记忆

## 注意

- 只运行一次（除非文件被删除）
- 不会覆盖已有的项目级 `CONTEXT.md` / `AGENTS.md`
- 不会覆盖已有的 `.gitignore` 规则（只追加缺失的）
- 初始化后可以使用 `/updateProjectMeta` 记录术语/决策/约定
- **不要动用户级配置**（`~/.config/opencode/`）
