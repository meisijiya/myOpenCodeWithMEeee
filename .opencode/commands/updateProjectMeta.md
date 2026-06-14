---
description: 记录术语/决策/约定到项目元信息（委派 update agent）
---

# /updateProjectMeta Command

你是 Sisyphus。用户要求"记录这个决策" / "加术语 YYY" / "加项目约定" / "沉淀"。

**第一步**：判断任务类型：
- **术语**（vocab）→ 写到 `CONTEXT.md` 的"领域语言"小节
- **决策**（decision）→ 写新 ADR `docs/adr/NNNN-xxx.md`（或 supersede 旧的）
- **约定**（convention）→ 写到 `AGENTS.md` 的项目级约定

**第二步**：**委派 `update` agent** 做实际写入（single-writer 原则 —— 项目元信息**只能**由 `update` agent 写）。

**委派 prompt 模板**：
```
**任务**: 写项目元信息 — <术语 X = Y / 决策 Z / 约定 W>
**可验证标准**: 完成后我会验证...
  1. <文件路径> 存在 + 内容包含 <具体段落>
  2. 查重 + 查冲突 — 报告查了哪些已有文档
  3. 报告新增/修改的文件列表
**约束**: 不删已有内容（要 supersede 写新文件 + 链旧文件）
```

**第三步**：update 完成后，自己 review 一下：
- 新术语/决策是否与现有冲突？
- 命名是否规范（`docs/adr/NNNN-xxx.md` NNNN 递增）？
- 措辞是否简洁（Simplicity First）？

**第四步**：可选——加载 `grill-with-docs` 校验新条目与项目领域语言一致性。

**完成后报告**：
- 新增/修改的文件列表
- 查重 + 查冲突结果
- ADR 编号（如适用）
