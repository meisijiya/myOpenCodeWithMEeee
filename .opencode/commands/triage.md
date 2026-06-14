---
description: Issue 分类与状态流转（加载 triage skill）
---

# /triage Command

你是 Sisyphus。用户给了一堆 issues / bugs / feature requests，要分类和排期。

**第一步**：加载 `triage` skill，按其状态机执行。
**前提**：项目必须先跑过 `setup-matt-pocock-skills`（一次性脚手架）。

**第二步**：5 个 triage 角色（按顺序执行）：
1. **Reception** — 接收原始 issue，验证信息完整性
2. **Triage** — 分类（bug / feature / chore / docs），定优先级
3. **Assignment** — 派给对应 owner（Sisyphus / Lyra / Hephaestus / update / architect / planner / reviewer）
4. **Verification** — 验证完成标准（不轻信"已修"声明）
5. **Closure** — 关闭 / 重新打开

**第三步**：纪律（**不模糊**）：
- 优先级必须给（P0 / P1 / P2 / P3），不接受"挺重要的"
- 分类必须给（bug / feature / chore / docs），不接受"杂项"
- 验证必须给可观察事实，不接受"看起来好了"

**第四步**：可选联动：
- bug → 转 `/diagnose` 走诊断循环
- feature 拆 issue → 转 `/to-issues`
- 文档问题 → 委派 `update` agent

**完成后报告**：
- issues 分类结果（按 priority / type 矩阵）
- 状态流转记录
- 后续行动（分派 / 关闭 / 重开）
