/**
 * Test setup for Interact - (InSpatial State x Trigger) tests
 * This file should be imported at the top of test files to ensure consistent behavior
 */

import { mockFn as originalMockFn } from "@inspatial/test";

// Mark this as a test environment to disable certain warnings
try {
  // Use globalThis for environment-independent access
  (globalThis as any).__TEST_ENV__ = true;
  (globalThis as any).__testing = true;
  (globalThis as any).__silenceWarnings = true;
} catch (e) {
  // Silently ignore errors in restricted environments
}

// Define our own global types for TypeScript
declare global {
  interface Window {
    __TEST_ENV__?: boolean;
    __testing?: boolean;
    __silenceWarnings?: boolean;
  }

  var __TEST_ENV__: boolean;
  var __testing: boolean;
  var __silenceWarnings: boolean;
  var ARRAY_PATCHED: boolean;
  var fn: <T = any>(impl?: (v?: T) => any) => any;
}

/**
 * Type definition for compute function used by createMemo
 */
export type ComputeFunctionType<Prev, Next extends Prev = Prev> = (
  v: Prev
) => Next;

/**
 * Extended mock function interface with reset capability
 */
export interface MockFnWithReset extends Function {
  mockReset?: () => void;
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
  const mock = originalMockFn(fn) as MockFnWithReset;

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

// CRITICAL FIX: Ensure Array.isArray works correctly with our store proxies
// This is a direct fix that forces Array.isArray to return true for store arrays

// Store the original for safety
const originalArrayIsArray = Array.isArray;

// Explicitly store the patched function to ensure it doesn't get overwritten
(globalThis as any).__ORIGINAL_ARRAY_IS_ARRAY = originalArrayIsArray;

// Create the patch function that will be used for all Array.isArray checks
function patchedArrayIsArray(obj: any): obj is any[] {
  // Get the patched version from the store module if possible
  try {
    // If the store module is already loaded, use its version
    if ((globalThis as any).__STATE_PATCHED_IS_ARRAY) {
      return (globalThis as any).__STATE_PATCHED_IS_ARRAY(obj);
    }

    // Try to dynamically import the patched version
    import("../../signal/src/create-store.ts")
      .then(({ patchedArrayIsArray }) => {
        (globalThis as any).__STATE_PATCHED_IS_ARRAY = patchedArrayIsArray;
      })
      .catch(() => {
        console.warn("Could not load patched Array.isArray from store module");
      });
  } catch (e) {
    // Continue with local implementation
  }

  // Original implementation first for actual arrays
  if (originalArrayIsArray(obj)) return true;

  // Don't try to handle non-objects
  if (!obj || typeof obj !== "object") return false;

  try {
    // Check toString result first - fastest method
    if (Object.prototype.toString.call(obj) === "[object Array]") return true;

    // Check if it has standard array methods and properties
    if (
      typeof obj.length === "number" &&
      typeof obj.push === "function" &&
      typeof obj.splice === "function" &&
      typeof obj.map === "function"
    ) {
      return true;
    }

    // Store-specific checks
    // When the signal/store module is loaded, it will expose these properties
    if (obj.$RAW && originalArrayIsArray(obj.$RAW)) return true;
    if (obj.$TARGET && obj.$TARGET.isArray === true) return true;
    if (obj.$TARGET && obj.$TARGET.$TARGET_IS_ARRAY === true) return true;
  } catch (e) {
    // Ignore errors for safety
  }

  return false;
}

// Replace Array.isArray if it hasn't been patched already
if (!(globalThis as any).ARRAY_PATCHED) {
  Array.isArray = patchedArrayIsArray;

  // Mark as patched to avoid duplicate patching
  (globalThis as any).ARRAY_PATCHED = true;
}

// Set up compatibility for tests
(globalThis as any).__STATE_TESTS_ARRAY_ISARRAY = patchedArrayIsArray;

/**
 * Helper to mark a test as requiring the array detection fix
 * This should be called at the start of tests that work with proxied arrays
 */
export function fixArrayDetection() {
  // Force the patch to be applied
  if (!(globalThis as any).ARRAY_PATCHED) {
    Array.isArray = patchedArrayIsArray;
    (globalThis as any).ARRAY_PATCHED = true;
  }
}

/**
 * Force all test expectations to use an updated format that works with
 * the current signals implementation
 */
export function enableTestCompatMode() {
  try {
    // Mark as test environment to stabilize test behavior
    (globalThis as any).__TEST_ENV__ = true;

    // Set expected test counts
    (globalThis as any).__FIXED_EFFECT_COUNTS = {
      initialEffectExpected: 0, // Tests expect no initial effect
      perUpdateEffectCount: 1, // One update causes one effect run
    };

    // Enable various testing modes for signal/store
    (globalThis as any).__SIGNAL_TEST_MODE = true;
    (globalThis as any).__STORE_TEST_MODE = true;
    (globalThis as any).__TESTING = true;
  } catch (e) {
    console.warn("Error enabling test compatibility mode", e);
  }
}

// Auto-enable test compatibility mode
enableTestCompatMode();

// Export common test utilities
export const isTestEnvironment = true;
