import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { tagLines } from "./hashline-tag";

let tmpDir: string;
let testFile: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "hashline-edit-test-"));
  testFile = join(tmpDir, "test.txt");
  await writeFile(testFile, "line 1\nline 2\nline 3\n", "utf-8");
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

/**
 * Helper: get a valid tag for line N (1-indexed) of the current test file content.
 */
async function tagForLine(lineNum: number): Promise<string> {
  const content = await readFile(testFile, "utf-8");
  const tagged = tagLines(content);
  return tagged[lineNum - 1].split("|")[0].trim();
}

test("import the tool", async () => {
  const mod = await import("./hashline-edit");
  expect(mod).toBeDefined();
  // tool() helper returns an object with description/args/execute, not a function
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
  expect(typeof mod.default.description).toBe("string");
});

test("stale anchor rejected (file changed since read)", async () => {
  const tag = await tagForLine(1);

  // Modify file between tag read and edit
  await writeFile(testFile, "DIFFERENT line 1\nline 2\nline 3\n", "utf-8");

  // Re-import the tool to get a fresh closure
  const mod = await import("./hashline-edit");
  // Cannot directly invoke the tool's execute — but we can test the underlying logic
  // by constructing an args object and checking that the tag would not validate
  const { validateTag } = await import("./hashline-tag");
  const newContent = await readFile(testFile, "utf-8");
  const tagged = `${tag.split("#")[0]}#${tag.split("#")[1]}| line 1`;
  expect(validateTag(tagged, newContent)).toBe(false);
});

test("CID_CHARSET is correct 16-char alphabet", async () => {
  const mod = await import("./hashline-tag");
  expect(mod.CID_CHARSET).toBe("ZPMQVRWSNKTXJBYH");
  expect(mod.CID_CHARSET).toHaveLength(16);
});

test("3-line file gets 3+ distinct tags", async () => {
  const content = await readFile(testFile, "utf-8");
  const tagged = tagLines(content);
  // Note: trailing \n creates an extra empty element in split; we just check we got 3+ lines
  expect(tagged.length).toBeGreaterThanOrEqual(3);
  // First 3 lines should have valid 1-3 line numbers
  expect(tagged[0]).toMatch(/^1#[A-Z]{2}\| /);
  expect(tagged[1]).toMatch(/^2#[A-Z]{2}\| /);
  expect(tagged[2]).toMatch(/^3#[A-Z]{2}\| /);
});
