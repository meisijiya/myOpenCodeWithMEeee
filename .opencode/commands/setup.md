---
description: 初始化项目元数据（CONTEXT.md / AGENTS.md / docs/adr/）
---

调用 `setup-matt-pocock-skills` skill，初始化项目元数据基础设施。

**这是使用 `/updateProjectMeta` 的前置条件。**

## 初始化内容

- `CONTEXT.md`：核心术语和概念
- `AGENTS.md`：项目约定和规范（`## Agent skills` 块）
- `docs/agents/`：agent 配置目录
- `docs/adr/`：架构决策记录目录

## 使用场景

- 首次使用本项目配置体系
- 项目元数据文件缺失
- 需要重新初始化项目记忆

## 注意

- 只运行一次（除非文件被删除）
- 不会覆盖已有的 `CONTEXT.md` / `AGENTS.md`
- 初始化后可以使用 `/updateProjectMeta` 记录术语/决策/约定
