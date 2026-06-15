---
description: 分支收尾（加载 finishing-a-development-branch skill）
---

# /finish-branch Command

你是 OneTwo。实现已通过测试，要收尾分支（merge / PR / 清理）。

**第一步**：加载 `finishing-a-development-branch` skill，按其结构化收尾流程执行。

**第二步**：完成前的硬性检查：
- [ ] 所有测试 pass
- [ ] typecheck 通过
- [ ] commit 信息清晰（描述**什么**和**为什么**）
- [ ] 文档已更新（README / AGENTS.md / CHANGELOG）
- [ ] 无未追踪的临时文件
- [ ] **委派 `reviewer` agent 做最终审查**（独立原则，不轻信"已完成"）

**第三步**：决策收尾方式（3 选 1）：
1. **Merge to main** — 简单 squash merge（适合个人项目）
2. **Pull Request** — 团队协作 / 需要 code review
3. **Cleanup** — 关闭 + 删分支（如果是放弃的尝试）

**第四步**：merge / PR 后做：
- 删本地 feature branch（`git branch -d <name>`）
- 删远程 feature branch（`git push origin --delete <name>`）
- 更新 CHANGELOG.md（如有 release 编号变化）
- 可选——发 release notes（如果是 release 分支）

**第五步**：可选联动：
- 发现新术语/决策 → 委派 `update` 写元信息
- 实现过程值得记录 → 委派 `architect` 起草 ADR → `update` 写

**完成后报告**：
- merge / PR 链接
- 删除的分支列表
- 后续行动（如果有）
