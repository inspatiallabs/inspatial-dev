/**
 * A smoke test that verifies motion module imports
 */

import { assertEquals, test } from "@inspatial/test";

test("motion modules import without throwing", async () => {
  const modules = [
    "../src/clock.ts",
    "../src/timer.ts",
    "../src/render.ts",
    "../src/engine.ts",
  ];

  for (const module of modules) {
    const imported = await import(module);
    assertEquals(typeof imported, "object");
  }
});
