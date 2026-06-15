# Token 优化路线图

## 已完成的优化

### 短期优化（Agent Prompt 精简）✅

**目标**：减少 agent prompt 的 token 消耗

**成果**：
- `sisyphus.md`: 491 → 244 行 (-50%)
- `lyra.md`: 177 → 125 行 (-29%)
- `hephaestus.md`: 133 → 112 行 (-16%)
- **总计**: 801 → 481 行 (-40%, -320 行)

**方法**：
- 压缩 skill 路由表（删除冗余示例）
- 简化委派协议（删除冗长解释）
- 精简 karpathy 4 原则（保留核心，删除细节）
- 压缩 CLI 路由（用表格代替代码块）
- 简化 style guide（删除冗长示例）

**Commit**: `41f9aa2` — `perf: optimize token consumption by streamlining agent prompts`

### 中期优化（子 Agent 返回精简）✅

**目标**：减少子 agent 返回的 token 消耗

**成果**：
- TwoOne/EggDog 返回格式简化为：
  ```xml
  <results>
    <summary>一句话结论</summary>
    <files>path1, path2, path3</files>
    <verification>命令输出片段（证明真跑过）</verification>
  </results>
  ```
- 删除 `<next_steps>`（OneTwo 自己知道下一步做什么）
- 删除详细推理过程（只返回可验证事实）

**好处**：
- 减少子 agent 返回的 token 消耗
- 更清晰的返回格式（聚焦可验证事实）
- 便于 OneTwo 快速审查

**Commit**: `41f9aa2`（同上）

---

## 待完成的优化

### 长期优化（词级 Skill 加载）🔮

**目标**：进一步减少 skill 加载的 token 消耗

**当前状态（句级加载）**：
- 加载 skill = 整个 SKILL.md（~5K tokens）
- 即使只需要知道"这个 skill 是干什么的"，也要加载完整指令

**目标状态（词级加载）**：
```
第一步：只加载 description + 触发条件（~500 tokens）
第二步：如果需要，再加载完整指令（~5K tokens）
```

**好处**：
- 90% 的情况只需要知道"这个 skill 是干什么的"，不需要完整指令
- 只有真正要用时，才加载完整指令
- 预计可减少 ~80% 的 skill 加载 token 消耗

**实现方式**：
1. **方案 A**：opencode 原生支持（需要 opencode 团队实现）
   - 修改 `skill` 工具，支持两阶段加载
   - 第一阶段：加载 SKILL.md 的 frontmatter（name + description + triggers）
   - 第二阶段：加载完整 SKILL.md 内容

2. **方案 B**：自定义 plugin（我们自己实现）
   - 创建 `skill-loader` plugin
   - 拦截 `skill` 工具调用
   - 实现两阶段加载逻辑

3. **方案 C**：修改 SKILL.md 格式（社区贡献）
   - 将 SKILL.md 拆分为两个文件：
     - `SKILL.md.meta`（frontmatter + description + triggers）
     - `SKILL.md.full`（完整指令）
   - 修改 opencode 的 skill 加载逻辑

**优先级**：低（当前优化已足够，token 消耗不是瓶颈）

**预计收益**：
- 每次 skill 加载减少 ~4.5K tokens
- 如果每个任务平均加载 3 个 skill，每个任务减少 ~13.5K tokens
- 对于长 session（100 个任务），总共减少 ~1.35M tokens

**预计成本**：
- 方案 A：需要 opencode 团队支持（不可控）
- 方案 B：需要开发 plugin（~1-2 天）
- 方案 C：需要社区贡献（不可控）

**建议**：
- 先观察 token 消耗情况，如果成为瓶颈再实施
- 优先实施方案 B（自定义 plugin），可控且快速
- 如果 opencode 团队实现了方案 A，优先使用原生支持

---

## 其他潜在优化

### 优化 1：Agent Prompt 进一步精简 🔮

**目标**：将 3 个老 agent prompt 进一步精简到 ~200 行

**方法**：
- 删除所有示例（只保留核心规则）
- 删除所有解释（只保留指令）
- 使用更紧凑的格式（单行规则）

**预计收益**：
- 每个 agent prompt 减少 ~50 行
- 3 个 agent 总共减少 ~150 行

**风险**：
- 过度精简可能导致 agent 行为不一致
- 需要大量测试验证

**优先级**：低（当前精简已足够）

### 优化 2：Skill 去重 🔮

**目标**：合并功能重叠的 skill

**候选**：
- `tdd` + `test-driven-development`（功能重叠）
- `diagnose` + `systematic-debugging`（功能重叠）
- `writing-plans` + `executing-plans`（可以合并）

**预计收益**：
- 减少 3-5 个 skill
- 每个 skill 减少 ~5K tokens（如果加载）
- 总共减少 ~15-25K tokens

**风险**：
- 可能丢失某些场景的最佳实践
- 需要仔细评估每个 skill 的独特价值

**优先级**：低（当前 skill 数量可控）

### 优化 3：Context 压缩 🔮

**目标**：在 context 接近上限时，自动压缩历史对话

**方法**：
- 创建 `context-compressor` plugin
- 监控 context 使用率
- 当使用率 > 70% 时，自动压缩历史对话（保留关键信息）

**预计收益**：
- 延长 session 长度
- 减少因 context 溢出导致的错误

**风险**：
- 压缩可能丢失重要信息
- 需要仔细设计压缩策略

**优先级**：中（context 溢出是常见问题）

---

## 监控指标

### Token 消耗监控

**指标**：
- 每个 session 的总 token 消耗
- 每个 agent 的平均 token 消耗
- 每个 skill 加载的 token 消耗
- 每个子 agent 返回的 token 消耗

**工具**：
- opencode 内置的 token 统计
- 自定义 plugin 记录详细日志

**目标**：
- 每个 session 的 token 消耗 < 100K
- 每个 agent 的平均 token 消耗 < 10K
- 每个 skill 加载的 token 消耗 < 5K
- 每个子 agent 返回的 token 消耗 < 2K

### 性能监控

**指标**：
- 每个任务的平均完成时间
- 每个 session 的平均任务数
- 子 agent 委派的平均延迟

**工具**：
- opencode 内置的性能统计
- 自定义 plugin 记录详细日志

**目标**：
- 每个任务的平均完成时间 < 5 分钟
- 每个 session 的平均任务数 > 10
- 子 agent 委派的平均延迟 < 30 秒

---

## 总结

**已完成**：
- ✅ 短期优化：agent prompt 精简（-40%）
- ✅ 中期优化：子 agent 返回精简

**待完成**：
- 🔮 长期优化：词级 skill 加载（预计 -80% skill 加载 token）
- 🔮 其他优化：agent prompt 进一步精简、skill 去重、context 压缩

**建议**：
- 先观察 token 消耗情况，如果成为瓶颈再实施长期优化
- 优先实施 context 压缩（中优先级）
- 其他优化可以根据实际需求决定

**Commit 记录**：
- `41f9aa2` — `perf: optimize token consumption by streamlining agent prompts`
