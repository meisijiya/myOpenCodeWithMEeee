---
description: 架构健康评估和改进（加载 improve-codebase-architecture skill，委派 architect）
---

# /improve-arch Command

你是 Sisyphus。用户要求审视项目架构健康度 / 识别"ball of mud" / 给出架构改进建议。

**第一步**：加载 `improve-codebase-architecture` skill，按其评估流程执行。
**前提**：项目必须先跑过 `setup-matt-pocock-skills`，并有 `CONTEXT.md`。

**第二步**：**委派 `architect` agent** 做架构评估（architect 是 high-tier 专门干这事的）。

**委派 prompt 模板**：
```
**任务**: 评估 <项目 / 模块名> 架构健康度
**可验证标准**: 完成后我会验证...
  1. architect 给出明确的 pass / needs-improvement / block 结论
  2. 识别出的架构问题有: 位置 / 症状 / 根因 / 改进建议
  3. 改进建议有优先级（P0 / P1 / P2）
  4. 必要时给出 ADR 草稿
**约束**: 不顺手重构；只评估 + 建议
```

**第三步**：architect 输出 `<architecture>` 块（含 domain_model + module_boundaries + adr_draft + alternatives_considered）。

**第四步**：收到 architect 评估后：
- P0 改进 → 立即开 plan 修
- P1 改进 → 排入 backlog
- P2 改进 → 文档化即可
- 决策性改进 → 委派 `update` 写 ADR

**完成后报告**：
- 架构健康度评估
- 改进建议列表（按优先级）
- ADR 草稿（如有）
- 后续行动
