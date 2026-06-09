import { test, expect } from "bun:test";
test("playwright-browser module loads", async () => {
  const mod = await import("./playwright-browser");
  expect(typeof mod.default).toBe("object");
  expect(typeof mod.default.execute).toBe("function");
});
