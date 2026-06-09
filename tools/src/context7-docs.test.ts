import { test, expect } from "bun:test";
test("context7-docs module loads", async () => {
  const mod = await import("./context7-docs");
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
});
