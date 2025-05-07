/**
 * Test helpers to make testing easier with the InSpatial Test module
 * 
 * This file provides compatibility between different mock/spy implementations
 */

import { mockFn, getMockCalls } from "../../test/src/mock/mock.ts";
import { createEffect as originalCreateEffect, createRenderEffect as originalCreateRenderEffect } from "../signal/src/index.ts";

// Mark this file as a type module
declare global {
  // Define the mock symbol for type safety
  const MOCK_SYMBOL: unique symbol;
  
  interface MockFunctionType {
    (...args: any[]): any;
    mock: {
      calls: any[][];
      reset: () => void;
    };
    [MOCK_SYMBOL]?: {
      calls: any[];
    };
    calls?: any[];
    mockReset: () => void;
    mockClear: () => void;
    mockImplementation: (impl: Function) => any;
  }
}

// Extract the actual MOCK_SYMBOL used by the test framework for direct access
const MOCK_SYMBOL = Symbol.for("@MOCK");

/**
 * Create a test spy function that is compatible directly with the test framework
 * 
 * @param impl Optional implementation function
 * @returns A spy function that works with expect().toHaveBeenCalledTimes()
 */
export function createTestSpy<T extends (...args: any[]) => any>(impl?: T): any {
  // Create a native mock function from the test framework
  // This ensures it works directly with the expect().toHaveBeenCalledTimes() assertion
  return mockFn(impl || (() => {}));
}

/**
 * Execute a function with retry logic to handle async state updates
 * This is useful for tests that may need to wait for effects to propagate
 * 
 * @param fn Function to execute
 * @param timeout Maximum time to wait (ms)
 * @param interval Retry interval (ms)
 */
export async function retry(fn: () => boolean, timeout = 1000, interval = 50): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fn()) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

/**
 * Type definition for the compute function in createEffect
 */
export type ComputeFnType<T> = (prev?: T) => T;

/**
 * Type definition for the effect function in createEffect
 */
export type EffectFnType<T> = (value: T, prev?: T) => void;

/**
 * Wrapper for createEffect that supports both 1-argument and 2-argument patterns
 * This helps maintain compatibility with tests that expect different signatures
 */
export function createEffectAdapter<T>(
  computeFn: ComputeFnType<T>, 
  effectFn?: EffectFnType<T>,
  errorFn?: (err: unknown) => void,
  value?: any,
  options?: any
): void {
  // Define a default effect function if one isn't provided
  // This is crucial because originalCreateEffect expects this parameter
  const defaultEffectFn = () => {};
  
  // When no effect handler is provided, use our default
  const actualEffectFn = effectFn === undefined ? defaultEffectFn : effectFn;
  
  // Create error handler if not provided
  const actualErrorFn = errorFn || ((err: unknown) => {
    if (__DEV__ && typeof console !== 'undefined') {
      console.error("Unhandled effect error:", err);
    }
  });
  
  // Always provide all parameters to ensure consistent behavior
  return originalCreateEffect(
    computeFn, 
    actualEffectFn, 
    actualErrorFn, 
    value, 
    { name: "test-effect", ...(options || {}) }
  );
}

/**
 * Wrapper for createRenderEffect that supports both 1-argument and 2-argument patterns
 * This helps maintain compatibility with tests that expect different signatures
 */
export function createRenderEffectAdapter<T>(
  computeFn: ComputeFnType<T>, 
  effectFn?: EffectFnType<T>, 
  value?: any,
  options?: any
): void {
  // Define a default effect function if one isn't provided
  const defaultEffectFn = () => {};
  
  // When no effect handler is provided, use our default
  const actualEffectFn = effectFn === undefined ? defaultEffectFn : effectFn;
  
  // Always provide all parameters to ensure consistent behavior
  return originalCreateRenderEffect(
    computeFn, 
    actualEffectFn, 
    value, 
    { name: "test-render-effect", ...(options || {}) }
  );
}

/**
 * Helper function to create a compatibility mock that works directly with the test framework
 */
export function createCompatibleMock(impl = () => {}) {
  return createTestSpy(impl);
} 