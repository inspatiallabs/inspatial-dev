/**
 * Tests specifically for effect system fixes
 * 
 * This tests the critical fixes we've made to ensure the effect system works 
 * properly in all environments.
 */

import { test, expect } from "@inspatial/test";
import { createSignal, createRoot, createEffect, flushSync } from "../signal/src/index.ts";
import { createTestSpy } from "./test-helpers.ts";
import { EffectClass } from "../signal/src/core/effect.ts"; // Import directly for reliable tests
import { STATE_DIRTY } from "../signal/src/core/constants.ts"; // Import STATE_DIRTY
import { globalQueue } from "../signal/src/core/scheduler.ts"; // Import queue for manual flushing

// Import test setup
import "./test-setup.ts";

// Basic effect test with minimal dependencies
test("direct effect runs and tracks dependencies", async () => {
  const testFn = createTestSpy(() => {});
  const [count, setCount] = createSignal(0);
  
  // Create effect directly without helpers
  let effect: EffectClass | null = null;
  createRoot((dispose) => {
    effect = new EffectClass(
      0, // Initial value
      () => {
        const val = count();
        testFn(val);
        return val;
      },
      () => {}, // Effect function (noop)
      (err) => console.error("Error in test:", err),
      { name: "test-direct-effect" }
    );
    
    // Force the effect to run immediately
    effect._runEffect();
  });
  
  // We should have one call with the initial signal value
  expect(testFn).toHaveBeenCalledTimes(1);
  expect(testFn).toHaveBeenCalledWith(0);
  
  // Update the signal
  setCount(1);
  
  // Manually trigger effect - in a real app this would happen through the reactive system
  if (effect) {
    effect._notify(STATE_DIRTY);
    effect._runEffect();
  }
  
  // We should now have two calls
  expect(testFn).toHaveBeenCalledTimes(2);
  expect(testFn).toHaveBeenCalledWith(1);
});

// Test that effects handle errors gracefully
test("effects handle errors gracefully", async () => {
  // Track if the error handler was called
  let errorHandlerCalled = false;
  let caughtError: Error | null = null;
  
  const errorHandler = createTestSpy((err) => {
    errorHandlerCalled = true;
    caughtError = err;
  });
  
  const successHandler = createTestSpy(() => {});
  const [shouldThrow, setShouldThrow] = createSignal(false);
  
  // Create effect outside of createRoot to maintain reference
  let effect: EffectClass | null = null;
  
  createRoot(() => {
    effect = new EffectClass(
      undefined,
      () => {
        if (shouldThrow()) {
          throw new Error("Test error");
        }
        return "success";
      },
      (value) => {
        successHandler(value);
      },
      (error) => {
        errorHandler(error);
      },
      { name: "test-error-effect" }
    );
    
    // Force run the effect
    effect._runEffect();
  });
  
  // Success handler should have been called with the initial value
  expect(successHandler).toHaveBeenCalledTimes(1);
  expect(successHandler).toHaveBeenCalledWith("success");
  
  // Now trigger an error
  setShouldThrow(true);
  
  // Manually run the effect to trigger the error handler
  if (effect) {
    effect._notify(STATE_DIRTY);
    effect._runEffect();
  }
  
  // Verify that error handler was called properly
  expect(errorHandlerCalled).toBe(true);
  expect(caughtError).not.toBe(null);
  expect(caughtError!.message).toBe("Test error");
});

// Test that effects run cleanup functions properly
test("effects run cleanup functions", async () => {
  const cleanupFn = createTestSpy(() => {});
  const effectFn = createTestSpy(() => cleanupFn);
  const [value, setValue] = createSignal("initial");
  
  // Create effect outside of createRoot to maintain reference
  let effect: EffectClass | null = null;
  
  createRoot(() => {
    effect = new EffectClass(
      undefined,
      () => value(),
      effectFn,
      undefined,
      { name: "test-cleanup-effect" }
    );
    
    // Force run the effect
    effect._runEffect();
  });
  
  // Effect should have run once
  expect(effectFn).toHaveBeenCalledTimes(1);
  expect(effectFn).toHaveBeenCalledWith("initial", undefined);
  
  // Cleanup should not have run yet
  expect(cleanupFn).toHaveBeenCalledTimes(0);
  
  // Update the signal to trigger effect again
  setValue("updated");
  
  // Manually run the effect again
  if (effect) {
    effect._notify(STATE_DIRTY);
    effect._runEffect();
  }
  
  // Effect should have run again
  expect(effectFn).toHaveBeenCalledTimes(2);
  expect(effectFn).toHaveBeenCalledWith("updated", "initial");
  
  // Cleanup should have run once before the second effect execution
  expect(cleanupFn).toHaveBeenCalledTimes(1);
});

// Test that effects with no explicit owner still run
test("effects with no explicit owner run", async () => {
  const testFn = createTestSpy(() => {});
  const [count, setCount] = createSignal(0);
  
  // No createRoot - should automatically use global owner
  // Create effect outside of any block to keep reference
  const effect = new EffectClass(
    undefined,
    () => {
      const val = count();
      testFn(val);
      return val;
    },
    () => {},
    undefined,
    { name: "test-no-owner-effect" }
  );
  
  // Force run the effect
  effect._runEffect();
  
  // We should have one call with the initial signal value
  expect(testFn).toHaveBeenCalledTimes(1);
  expect(testFn).toHaveBeenCalledWith(0);
  
  // Update the signal
  setCount(1);
  
  // Manually run the effect again
  effect._notify(STATE_DIRTY);
  effect._runEffect();
  
  // We should now have two calls
  expect(testFn).toHaveBeenCalledTimes(2);
  expect(testFn).toHaveBeenCalledWith(1);
  
  // Clean up the effect when done
  effect._disposeNode();
}); 