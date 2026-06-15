---
description: 跨 session 交接（加载 handoff skill 生成 handoff 文档）
---

# /handoff Command

你是 OneTwo。当前 session 上下文即将耗尽 / 需要把工作交接给另一个 agent / 跨 session 继续。

**第一步**：加载 `handoff` skill，按其工作流执行。

**第二步**：handoff 文档结构（标准模板）：
```markdown
# Handoff: <任务标题>

## 当前状态
- 完成了什么（含文件路径 + 关键改动）
- 验证状态（哪些测试 pass / 哪些标准达成）

## 待完成
- 下一步要做什么
- 阻塞点（如有）

## 关键文件 / 决策
- 改动的核心文件路径
- 重要的设计决策（带 ADR 编号或链接）
- 已知陷阱（不要重蹈覆辙）

## 上下文压缩建议
- 哪些可丢弃（探索历史 / 失败的尝试）
- 哪些必须保留（最新状态、关键文件、未解决的错误）
```

**第三步**：handoff 文档**精简优先**（30K tokens 以内）：
- ✅ 保留：最新需求、最近 3 个 tool 结果、当前任务状态、关键文件路径、未解决的错误
- ❌ 丢弃：中间推理、重复的 tool 调用、详细错误日志、探索历史、已完成子任务的细节

**第四步**：handoff 完成后，告知新 session：
- 交接文档路径
- 接手 agent 是什么（OneTwo / TwoOne / EggDog / new session）
- 第一个动作是什么

**完成后报告**：
- handoff 文档路径
- token 数（如 `wc -c` 报告字符数）
- 接手方是谁
