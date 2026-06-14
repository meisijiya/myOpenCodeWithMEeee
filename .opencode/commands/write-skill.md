---
description: 创建/编辑/验证 skill（加载 writing-skills skill）
---

# /write-skill Command

你是 Sisyphus。用户要创建新 skill / 编辑现有 skill / 验证 skill 部署前是否正常。

**第一步**：加载 `writing-skills` skill，按其 skill 创建工作流执行。

**第二步**：skill 文件结构标准：
```
skills/<skill-name>/
├── SKILL.md          # 必填 — 包含 frontmatter（name + description）
├── references/       # 可选 — 详细文档
├── scripts/          # 可选 — 辅助脚本
└── examples/         # 可选 — 使用示例
```

**第三步**：SKILL.md frontmatter（**关键**）：
```yaml
---
name: <skill-name>
description: <何时用 + 触发条件 + 做什么>  # description 决定 auto-load 行为
---
```

**第四步**：description 写作纪律（**最容易出错**）：
- **宽 description**（如"通用助手"）→ auto-load 频繁、context 浪费
- **窄 description**（如"只在 React 项目用"）→ 错过触发
- **好 description**：明确触发条件 + 不模糊

**第五步**：写作原则：
- 用祈使句（"Load the X skill" 而不是 "This skill does X"）
- 避免 preamble
- 给具体例子
- 引用相关文件用 `@<path>` 语法
- shell 命令用 `!`command`` 语法

**第六步**：验证（**用 `verification-before-completion` skill**）：
- [ ] SKILL.md 存在 + frontmatter 正确
- [ ] description 触发条件清晰
- [ ] 流程步骤明确
- [ ] 在 install.sh 的 `SKILLS=(...)` 数组中加上了新 skill

**完成后报告**：
- 新建/修改的 skill 路径
- install.sh 改动（如有）
- 验证清单结果
