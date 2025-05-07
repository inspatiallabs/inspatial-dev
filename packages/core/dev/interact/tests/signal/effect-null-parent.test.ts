import { test, expect, describe } from "../../../test/src/index.ts";
import { createEffect } from "../../signal/src/signals.ts";
import { flushSync } from "../../signal/src/core/scheduler.ts";

// This test demonstrates the issue with effects created without a parent owner
describe("Effect with null parent", () => {
  test("Effect should handle null parent gracefully", () => {
    // This test will fail because createEffect tries to access _parent!._queue
    // where _parent is null in some cases
    let count = 0;
    let effectRan = false;
    
    // Create an effect without proper owner context
    // This should use globalQueue instead of failing
    createEffect(
      () => count,
      (value) => {
        // Effect handler
        effectRan = true;
      }
    );
    
    flushSync();
    // The test passes if it doesn't throw an error
    expect(true).toBe(true);
  });
}); 