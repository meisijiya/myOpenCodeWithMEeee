import { test, expect } from "bun:test";

test("task-dispatch module loads", async () => {
  const mod = await import("./task-dispatch");
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
  expect(typeof mod.default.description).toBe("string");
});

test("description mentions MCP proxy", async () => {
  const mod = await import("./task-dispatch");
  expect(mod.default.description).toMatch(/mcp/i);
});

test("args include subagent_type, description, prompt, mode, task_id, timeout_ms", async () => {
  const mod = await import("./task-dispatch");
  const args = mod.default.args;
  expect(args.subagent_type).toBeDefined();
  expect(args.description).toBeDefined();
  expect(args.prompt).toBeDefined();
  expect(args.mode).toBeDefined();
  expect(args.task_id).toBeDefined();
  expect(args.timeout_ms).toBeDefined();
});

test("MCP proxy format recognized in subagent_type", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "mcp:MiniMax:web_search",
      description: "test search",
      prompt: "hello world",
      mode: "sync",
      timeout_ms: undefined,
    } as any,
    {} as any,
  );
  expect(result).toMatch(/"kind":\s*"mcp"/);
  expect(result).toMatch(/"server":\s*"MiniMax"/);
  expect(result).toMatch(/"tool":\s*"web_search"/);
});

test("invalid MCP format returns error", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "mcp:bad",
      description: "test",
      prompt: "x",
      mode: "sync",
    } as any,
    {} as any,
  );
  expect(result).toMatch(/Invalid MCP format/);
});

test("agent dispatch returns normalized parameters (mode=background)", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "lyra",
      description: "test research",
      prompt: "find X",
      mode: "background",
      timeout_ms: 30000,
    } as any,
    {} as any,
  );
  expect(result).toMatch(/"kind":\s*"agent"/);
  expect(result).toMatch(/"subagent_type":\s*"lyra"/);
  expect(result).toMatch(/"mode":\s*"background"/);
  expect(result).toMatch(/"background":\s*true/);
  expect(result).toMatch(/"timeout_ms":\s*30000/);
});

test("mode=continuation requires task_id", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "lyra",
      description: "resume session",
      prompt: "continue previous work",
      mode: "continuation",
    } as any,
    {} as any,
  );
  expect(result).toMatch(/continuation requires task_id/);
});

test("mode=continuation with task_id includes task_id in result", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "lyra",
      description: "resume session",
      prompt: "continue previous work",
      mode: "continuation",
      task_id: "ses_12345abc",
    } as any,
    {} as any,
  );
  expect(result).toMatch(/"kind":\s*"agent"/);
  expect(result).toMatch(/"mode":\s*"continuation"/);
  expect(result).toMatch(/"task_id":\s*"ses_12345abc"/);
});

test("mode=sync maps background to false", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "hephaestus",
      description: "create boilerplate",
      prompt: "create 3 files",
      mode: "sync",
    } as any,
    {} as any,
  );
  expect(result).toMatch(/"mode":\s*"sync"/);
  expect(result).toMatch(/"background":\s*false/);
});

test("default mode is background (background:true)", async () => {
  const mod = await import("./task-dispatch");
  const result = await mod.default.execute(
    {
      subagent_type: "lyra",
      description: "default mode test",
      prompt: "x",
    } as any,
    {} as any,
  );
  expect(result).toMatch(/"mode":\s*"background"/);
  expect(result).toMatch(/"background":\s*true/);
});
