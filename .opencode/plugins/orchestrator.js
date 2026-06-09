// @bun
// src/orchestrator.ts
var MAX_BOULDER_CONTINUATIONS = 3;
var OrchestratorPlugin = async (ctx) => {
  let boulderCount = 0;
  let karpathyInjected = false;
  return {
    "session.start": async (input, output) => {
      const karpathyPath = `${process.env.HOME}/.config/opencode/skills/karpathy-guidelines/SKILL.md`;
      const projectAgentsMd = `${ctx.directory}/AGENTS.md`;
      const injections = [];
      try {
        const karpathy = await Bun.file(karpathyPath).text();
        injections.push(`[karpathy-guidelines 4 \u539F\u5219]
${karpathy}
`);
        karpathyInjected = true;
      } catch (err) {}
      try {
        const projectMd = await Bun.file(projectAgentsMd).text();
        injections.push(`[\u9879\u76EE\u7EA7 AGENTS.md]
${projectMd}
`);
      } catch (err) {}
      if (injections.length > 0) {
        output.context = output.context || [];
        output.context.push(...injections);
      }
    },
    "message.user": async (input, output) => {
      const text = input.text || "";
      if (/\b(ultrawork|ulw)\b/i.test(text)) {
        output.context = output.context || [];
        output.context.push(`
[ultrawork mode activated]
` + `\u5DE5\u4F5C\u534F\u8BAE\u5DF2\u6FC0\u6D3B\uFF1A
` + `1. \u4E0D\u505C\u6B62\u76F4\u5230 todo \u5168\u90E8\u5B8C\u6210
` + `2. \u5E76\u884C\u6267\u884C\u6240\u6709\u72EC\u7ACB\u64CD\u4F5C
` + `3. \u6301\u7EED\u68C0\u67E5 karpathy 4 \u539F\u5219
` + `4. \u5931\u8D25\u65F6\u7ACB\u5373\u62A5\u544A\uFF0C\u4E0D\u63A9\u9970
`);
      }
      if (/\b(search|\u641C\u7D22|\u627E|\u67E5)\b/i.test(text)) {
        output.context = output.context || [];
        output.context.push(`
[search hint]
\u8003\u8651\u59D4\u6D3E oracle \u5B50 agent \u505A\u5E76\u884C\u641C\u7D22\uFF0C\u907F\u514D\u4E3B\u4E0A\u4E0B\u6587\u6C61\u67D3\u3002
`);
      }
    },
    "session.idle": async (input, output) => {
      if (boulderCount >= MAX_BOULDER_CONTINUATIONS) {
        output.context = output.context || [];
        output.context.push(`
[Boulder] \u5DF2\u8FDE\u7EED\u7EED\u63A5 ${MAX_BOULDER_CONTINUATIONS} \u6B21\u3002\u8BF7\u68C0\u67E5 todo \u72B6\u6001\u5E76\u660E\u786E\u62A5\u544A\u963B\u585E\u539F\u56E0\u3002
`);
        return;
      }
      const todos = input.todos || [];
      const incomplete = todos.filter((t) => t.status !== "completed");
      if (incomplete.length > 0) {
        boulderCount++;
        const todoList = incomplete.map((t, i) => `  ${i + 1}. ${t.content}`).join(`
`);
        output.context = output.context || [];
        output.context.push(`
[Boulder Continuation #${boulderCount}]
` + `\u4F60\u521A\u624D\u505C\u6B62\u4E86\uFF0C\u4F46\u8FD8\u6709 ${incomplete.length} \u4E2A todo \u672A\u5B8C\u6210\uFF1A
` + `${todoList}

` + `\u8BF7\u7EE7\u7EED\u5B8C\u6210\u5B83\u4EEC\u3002\u5982\u679C\u9047\u5230\u65E0\u6CD5\u89E3\u51B3\u7684\u95EE\u9898\uFF0C\u660E\u786E\u62A5\u544A\u5E76\u66F4\u65B0 todo \u72B6\u6001\u3002
`);
      }
    },
    "session.compact": async (input, output) => {
      if (karpathyInjected) {
        try {
          const karpathy = await Bun.file(`${process.env.HOME}/.config/opencode/skills/karpathy-guidelines/SKILL.md`).text();
          output.context = output.context || [];
          output.context.push(`
[karpathy-guidelines \u91CD\u65B0\u6CE8\u5165 (post-compact)]
${karpathy}
`);
        } catch (err) {}
      }
    }
  };
};
var orchestrator_default = OrchestratorPlugin;
export {
  orchestrator_default as default,
  OrchestratorPlugin
};
