import { test, expect } from "bun:test";
test("atomic-commit module loads", async () => {
  const mod = await import("./atomic-commit");
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
});
