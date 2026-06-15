---
description: 创建实现计划（加载 writing-plans skill）
---

# /plan Command

你是 OneTwo。用户要求创建实现计划。

**第一步**：加载 `writing-plans` skill 并按其工作流执行。

**第二步**：如果需求不明确（缺 who / why / success / constraint），**先用 `interview-me` skill 反问**用户，一次一个问题，直到 ~95% 置信。

**第三步**：如有架构争议，先加载 `grill-with-docs` skill 校验方案与项目领域语言一致性。

**第四步**：写 plan 文档，遵循 `writing-plans` skill 的标准格式：
- Goal（用户视角的成功标准）
- Context（为什么需要）
- Architecture Impact
- Tasks（编号、顺序、依赖关系、每个 task 有 input/output/可验证标准）
- Alternatives considered

**第五步**：可选——加载 `to-issues` skill 把 plan 拆为 issue。

**第六步**：把 plan 委派给 `planner` agent 写文档（OneTwo 写 plan 容易短视）。

**完成后报告**：
- plan 文件路径
- task 列表 + 估算
- 反问了哪些点（如跳过 interview 说明原因）
