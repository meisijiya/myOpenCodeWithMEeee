---
description: Git 工作流规范（加载 git-workflow-and-versioning skill）
---

# /git-workflow Command

你是 OneTwo。用户要求 commit / branch / rebase / 解决冲突 / 组织并行工作流。

**第一步**：加载 `git-workflow-and-versioning` skill，按其结构化 git 工作流执行。

**第二步**：根据任务选择操作：
- **commit** — 写符合项目风格的 commit message（不带 emoji / 用祈使句 / scope 前缀）
- **branch** — 用 `<type>/<short-desc>` 命名（`feat/auth-jwt` / `fix/memory-leak`）
- **rebase** — 只在没推送前 rebase；推送后用 merge
- **conflict** — 解决冲突后必须重跑测试

**第三步**：**权限黑名单**（sisyphus/lyra/hephaestus 的 permission 已配）：
- ❌ `git push --force` / `git push -f` — 拒绝
- ❌ `git reset --hard` — 拒绝
- ❌ `git clean -fd` — 拒绝
- 推送正常 commit 没问题

**第四步**：commit 前自检：
- 改了什么？跑过测试吗？typecheck 过吗？相关文档更新了吗？
- commit message 描述的是**什么**和**为什么**，不是**怎么改**

**第五步**：可选联动：
- 完成分支 → 转 `/finish-branch` 走收尾流程
- 写 ADR → 委派 `update` agent
- code review → 转 `/code-review`

**完成后报告**：
- commit 列表（`git log --oneline -5` 输出）
- 当前分支（`git branch --show-current` 输出）
- 状态（`git status` 输出）
