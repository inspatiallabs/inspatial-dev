/**
 * # Memo Test Helpers
 * Utility functions to help with testing memoized signals
 */

import { mockFn as originalMockFn } from "@inspatial/test";
import { test, expect } from "@inspatial/test";
import { createMemo, createSignal, flushSync } from "../../signal/src/index.ts";

/**
 * Type definition for compute function used by createMemo
 */
export type ComputeFunctionType<Prev, Next extends Prev = Prev> = (
  v: Prev
) => Next;

/**
 * Extended mock function interface with reset capability
 */
export interface MockFnWithReset<T = any> {
  (...args: any[]): T;
  mockReset: () => void;
}

/**
 * Type for the enhanced mock function that works with createMemo and has mockReset
 */
export type TypedMockFn<Prev, Next extends Prev = Prev> = ComputeFunctionType<
  Prev,
  Next
> & { mockReset: () => void };

/**
 * Creates a mock function that is properly typed for use with createMemo
 * This addresses type compatibility issues between mockFn and createMemo
 *
 * @param fn The function implementation to mock
 * @returns A properly typed mock function for use with createMemo
 */
export function createTypedMockFn<T extends any, R extends T>(
  fn: (v?: T) => R
): TypedMockFn<T | undefined, R> {
  // Create the original mock function
  const mock = originalMockFn(fn) as MockFnWithReset<R>;

  // Add mockReset method if it doesn't exist
  if (!mock.mockReset) {
    mock.mockReset = function () {
      // Clear mock calls history if possible
      const mockSymbol = Symbol.for("@MOCK");
      if (mock[mockSymbol] && mock[mockSymbol].calls) {
        mock[mockSymbol].calls = [];
      }
    };
  }

  // Cast the mock to the correct type for createMemo compatibility
  return mock as unknown as TypedMockFn<T | undefined, R>;
}

/**
 * A helper function for tests that creates a properly typed mock function.
 * This is compatibility wrapper for the existing `fn` pattern used in tests.
 *
 * @param impl Optional function implementation
 * @returns A typed mock function
 */
export function fn<T = any>(impl?: (v?: T) => any): any {
  return createTypedMockFn(impl || ((v?: T) => v));
}

// Add to global scope as it's used in multiple test files
(globalThis as any).fn = fn;

// Simple test to verify the helper works correctly
test("createTypedMockFn works with createMemo", () => {
  // Create a signal and a mock function
  const [value, setValue] = createSignal(10);

  // Create a mock compute function
  const compute = createTypedMockFn((v) => {
    return "Value: " + value();
  });

  // Create a memo using the mock function
  const memo = createMemo(compute);

  // Initially the function should be called once
  expect(memo()).toBe("Value: 10");
  expect(compute).toHaveBeenCalledTimes(1);

  // Reset the mock
  compute.mockReset();

  // Change the signal value and flush the queue
  setValue(20);
  flushSync();

  // The compute function should be called again
  const result = memo();
  expect(result).toBe("Value: 20");
  expect(compute).toHaveBeenCalledTimes(1);
});
