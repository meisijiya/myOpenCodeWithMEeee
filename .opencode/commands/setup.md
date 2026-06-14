---
description: 初始化项目级元数据（项目根目录的 CONTEXT.md / AGENTS.md / docs/adr/）
---

调用 `setup-matt-pocock-skills` skill，初始化**项目级**元数据基础设施。

**这是使用 `/updateProjectMeta` 的前置条件。**

## ⚠️ 重要：项目级 vs 用户级

- **项目级**（本命令操作）：项目根目录的 `CONTEXT.md` / `AGENTS.md` / `docs/adr/`
- **用户级**（**不要动**）：`~/.config/opencode/` 下的文件（包括用户级 `AGENTS.md`）

**铁律**：用户级配置（`~/.config/opencode/`）是**只读的**，不能改。如果要改，必须先询问用户。

## 初始化内容（项目级）

- `CONTEXT.md`：项目核心术语和概念（项目根目录）
- `AGENTS.md`：项目级约定和规范（项目根目录，`## Agent skills` 块）
- `docs/agents/`：agent 配置目录（项目根目录）
- `docs/adr/`：架构决策记录目录（项目根目录）

## 使用场景

- 首次使用本项目配置体系
- 项目级元数据文件缺失
- 需要重新初始化项目记忆

## 注意

- 只运行一次（除非文件被删除）
- 不会覆盖已有的项目级 `CONTEXT.md` / `AGENTS.md`
- 初始化后可以使用 `/updateProjectMeta` 记录术语/决策/约定
- **不要动用户级配置**（`~/.config/opencode/`）
