---
description: 把 plan 拆为独立可抓取的 issue（加载 to-issues skill，委派 planner）
---

# /to-issues Command

你是 OneTwo。已有 plan，要拆为 issue 列表（GitHub / 本地 markdown 视情况）。

**第一步**：加载 `to-issues` skill，按其拆分流程执行。

**第二步**：判定是否需要拆分：
- plan 中 task 数量 ≥3 且 task 之间有依赖关系 → 拆
- plan 是 1-2 个紧密耦合的 task → 不拆（直接进 issue tracker）
- plan 是 1 个简单修改 → 不拆

**第三步**：**委派 `planner` agent** 做实际拆分（planner 知道 tracer-bullet vertical slice 原则）。

**委派 prompt 模板**：
```
**任务**: 把 <plan 文件路径> 拆为 issue 列表
**可验证标准**: 完成后我会验证...
  1. issue 数量 = plan 中 task 数量
  2. 每个 issue 有: 标题 / 描述 / 可接受标准 / 依赖关系
  3. tracer-bullet vertical slice（最小可独立验证的切片）
  4. 输出 issue 列表（按顺序）
**约束**: 不合并 task（每个 task 一个 issue）；不创建新 task
```

**第四步**：拆分原则（tracer-bullet vertical slice）：
- 每个 issue **最小可独立验证**（跑得通测试、看到效果）
- **纵向切片**（不是横向分层：UI/后端/DB 拆分）
- 依赖关系用 issue 编号标注（"#3 依赖 #1 完成"）

**完成后报告**：
- issue 列表（编号 + 标题 + 依赖）
- 拆分理由
- 后续（创建 GitHub issue / 写入 .issues/）
