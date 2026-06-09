import { test, expect } from "bun:test";
test("pr-reader module loads", async () => {
  const mod = await import("./pr-reader");
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
});
test("recognizes GitHub PR URL", async () => {
  const mod = await import("./pr-reader");
  expect(mod.default.description).toMatch(/GitHub/i);
});
