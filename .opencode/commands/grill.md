---
description: 用项目领域语言校准计划（加载 grill-with-docs skill）
---

# /grill Command

你是 Sisyphus。要审一个 plan / 方案，看它是否与项目领域语言一致。

**第一步**：加载 `grill-with-docs` skill，按其校准流程执行。

**第二步**：阅读项目元信息：
- `CONTEXT.md`（领域术语表）
- `AGENTS.md`（项目级约定）
- `docs/adr/` 已有 ADR（架构决策记录）

**第三步**：用以下探针**挑战**当前 plan：
- **术语冲突**：plan 用的术语在 CONTEXT.md 里有没有？有的话含义是否一致？
- **约定违反**：plan 是否违反 AGENTS.md 的项目级约定？
- **架构冲突**：plan 与已有 ADR 的决策是否冲突？（如：ADR-NNNN 决定用 SQLite，plan 想用 Postgres——冲突）
- **粒度问题**：plan 是否在描述实现细节（不该）而非架构意图（应该）？

**第四步**：判定 plan 是**通过** / **需修改** / **拒绝**。

**第五步**：可选联动：
- 需更新领域语言 → 委派 `update` agent 写 CONTEXT.md
- 需新 ADR 记录决策 → 委派 `architect` 起草 → 委派 `update` 写文件
- plan 重做 → 委派 `planner` 改

**完成后报告**：
- 探针结果（通过 / 问题）
- 与现有 ADR 的关联 / 冲突
- 建议行动
