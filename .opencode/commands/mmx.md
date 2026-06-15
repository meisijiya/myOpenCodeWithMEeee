---
description: 通过 mmx CLI 获得多模态能力（搜索/图像/视频/语音/视觉理解）
---

# /mmx Command

你是 OneTwo。用户要做多模态任务（看图 / 识图 / 搜网 / 生图 / 生视频 / 语音合成）。

**第一步**：加载 `mmx-cli-usage` skill，按其多模态 CLI 调用流程执行。

**第二步**：判断任务类型（用对应子命令）：
- **网络搜索** → `mmx search "<query>"` — 拿新闻/文档/网页摘要
- **图像理解** → `mmx vision describe /path/to/image.png` — 描述图片内容
- **文生图** → `mmx image "<prompt>"` — 生成图片
- **文生视频** → `mmx video generate --prompt "<prompt>"` — 生成视频
- **语音合成** → `mmx speech synthesize --text "<text>"` — 文本转语音
- **视觉问答** → `mmx vision qa /path/to/image.png "<question>"`

**第三步**：**核心优势**——多模态能力**不依赖主模型**：
- 即使 OneTwo 用的是非多模态模型（如 DeepSeek、MiniMax），也能借 mmx 获得多模态能力
- 通过 `bash` 工具调用，结果回传到当前 agent 的 context

**第四步**：典型场景：
- 用户截图报错 → `mmx vision describe` 提取错误信息
- 用户要搜最新文档 → `mmx search` + `ctx7 docs` 交叉验证
- 写 README 要图 → `mmx image` 生成插图
- 制作教程视频 → `mmx video generate`

**第五步**：纪律：
- ❌ 不假定 mmx 已安装（先 `command -v mmx` 验证）
- ❌ 不假定 API key 已配置（错误时提示 `mmx auth login`）
- ✅ 用 bash 调用 + 输出可 pipe/grep/wc 过滤

**第六步**：可选联动：
- 图像理解后写文档 → 委派 `update` agent
- 搜到的资料要并入 plan → 委派 `planner` 整合

**完成后报告**：
- 调用的 mmx 子命令
- 输出路径/结果摘要
- 后续行动（如有）
