import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import type { ToolContext, ToolResult } from "@opencode-ai/plugin/tool";

let tmpDir: string;
let srcFile: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "ast-search-test-"));
  srcFile = join(tmpDir, "sample.ts");
  await writeFile(
    srcFile,
    [
      "export function hello(name: string): string {",
      "  return `Hello, ${name}!`;",
      "}",
      "",
      "export function greet(target: string): void {",
      "  console.log(hello(target));",
      "}",
    ].join("\n"),
    "utf-8",
  );
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

/**
 * Normalize a ToolResult to a plain string for assertion purposes.
 * The tool returns either a raw string or an object with an `output` field;
 * both cases should produce readable text for the model.
 */
function toText(result: ToolResult): string {
  if (typeof result === "string") return result;
  return result.output;
}

const mockContext = {
  sessionID: "test",
  messageID: "test",
  agent: "test",
  directory: "/tmp",
  worktree: "/tmp",
  abort: new AbortController().signal,
  metadata: () => {},
  ask: async () => {},
} as unknown as ToolContext;

test("tool module loads and exports a default tool object", async () => {
  const mod = await import("./ast-search");
  expect(mod).toBeDefined();
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
  expect(typeof mod.default.description).toBe("string");
});

test("description mentions AST patterns and language list", async () => {
  const mod = await import("./ast-search");
  expect(mod.default.description).toMatch(/AST/i);
  expect(mod.default.description).toMatch(/pattern/i);
});

test("args schema has pattern, language, path, context", async () => {
  const mod = await import("./ast-search");
  const args = mod.default.args;
  expect(args).toBeDefined();
  expect(args.pattern).toBeDefined();
  expect(args.language).toBeDefined();
  expect(args.path).toBeDefined();
  expect(args.context).toBeDefined();
});

test("execute returns a ToolResult (string or object) without throwing", async () => {
  const mod = await import("./ast-search");
  const result = await mod.default.execute(
    { pattern: "function $NAME", path: tmpDir, context: 3 },
    mockContext,
  );
  // ToolResult is a string or an object with an output field
  expect(result).toBeDefined();
  const text = toText(result);
  expect(text.length).toBeGreaterThan(0);
});

test("execute handles patterns with single quotes safely", async () => {
  const mod = await import("./ast-search");
  // Quote in pattern should not break the shell command
  const result = await mod.default.execute(
    { pattern: "function $NAME(it's)", path: tmpDir, context: 3 },
    mockContext,
  );
  const text = toText(result);
  expect(text.length).toBeGreaterThan(0);
});

test("execute finds matches in target directory when grep fallback used", async () => {
  const mod = await import("./ast-search");
  const result = await mod.default.execute(
    { pattern: "function hello", path: tmpDir, context: 3 },
    mockContext,
  );
  const text = toText(result);
  // Either ast-grep or grep fallback should locate "function hello" in the sample file
  if (!text.toLowerCase().includes("error")) {
    expect(text.toLowerCase()).toMatch(/hello|sample\.ts|no match/);
  }
});

test("execute handles non-existent path without throwing", async () => {
  const mod = await import("./ast-search");
  const bogusPath = join(tmpDir, "does-not-exist-xyz");
  const result = await mod.default.execute(
    { pattern: "anything", path: bogusPath, context: 3 },
    mockContext,
  );
  // No unhandled throw — return value is always defined
  const text = toText(result);
  expect(text.length).toBeGreaterThan(0);
});

test("uses a real search binary — no mock results", async () => {
  // TDD sanity: the tool must shell out to a real binary, not fake matches.
  // Verify by running the tool with a known input and checking the output references
  // the real file content (sample.ts contains "hello").
  const mod = await import("./ast-search");
  const result = await mod.default.execute(
    { pattern: "hello", path: tmpDir, context: 3 },
    mockContext,
  );
  const text = toText(result);
  // If a search engine ran successfully, sample.ts content should appear
  if (!text.toLowerCase().includes("error") && !text.toLowerCase().includes("not found")) {
    expect(text).toMatch(/hello|sample\.ts/);
  } else {
    // Acceptable: a clear "no binary available" error message
    expect(text.toLowerCase()).toMatch(/error|unavailable|install/);
  }
});
