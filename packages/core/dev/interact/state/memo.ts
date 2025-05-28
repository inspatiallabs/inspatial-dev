/**
 * # Computed Values
 * @summary #### Memoized computed values derived from state
 * 
 * This module provides functions to create computed values derived from state
 * that automatically update when their dependencies change. These functions 
 * optimize performance by memoizing results and only recomputing when necessary.
 * 
 * @since 0.1.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import { createMemo, createRoot, createSignal, createEffect } from "../signal/src/signals";
import { StateManager } from "./manager";
import type { StateInstanceType, ComputedOptionsType } from "./types";

/**
 * Create a computed value that automatically updates when its dependencies change
 * 
 * @param compute Function that computes the derived value
 * @param options Optional configuration for the computed value
 * @returns A function that returns the current computed value
 */
export function createComputed<T>(
  compute: () => T,
  options?: ComputedOptionsType<T>
): () => T {
  return createRoot(dispose => {
    // Create the memo computation
    const memo = createMemo(compute, undefined, {
      equals: options?.equals
    });
    
    // Return a function that gets the computed value
    const getValue = () => memo();
    
    // Store the disposal function on the getter for cleanup
    (getValue as any)._dispose = dispose;
    
    return getValue;
  });
}

/**
 * Create a computed value that combines multiple properties from a state
 * 
 * @param state The state instance to derive from
 * @param selector Function that selects and computes from the state
 * @param options Optional configuration for the computed value
 * @returns A function that returns the current computed value
 */
export function createComputedFromState<S extends object, T>(
  state: StateInstanceType<S>,
  selector: (state: S) => T,
  options?: ComputedOptionsType<T>
): () => T {
  return createComputed(() => selector(state.get()), options);
}

/**
 * Create a computed value that depends on multiple states
 * 
 * @param states Array of state instances to derive from
 * @param selector Function that selects and computes from all states
 * @param options Optional configuration for the computed value
 * @returns A function that returns the current computed value
 */
export function createComputedFromStates<T>(
  states: Array<StateInstanceType<any>>,
  selector: (states: Array<any>) => T,
  options?: ComputedOptionsType<T>
): () => T {
  return createComputed(() => {
    const stateValues = states.map(state => state.get());
    return selector(stateValues);
  }, options);
}

/**
 * Create a computed record with multiple values derived from a state
 * 
 * @param state The state instance to derive from
 * @param selectors Record of selector functions for each computed property
 * @param options Optional configuration for the computed values
 * @returns A function that returns the current computed record
 */
export function createComputedRecord<S extends object, T extends Record<string, (state: S) => any>>(
  state: StateInstanceType<S>,
  selectors: T,
  options?: ComputedOptionsType<any>
): () => { [K in keyof T]: ReturnType<T[K]> } {
  type Result = { [K in keyof T]: ReturnType<T[K]> };
  
  return createComputed(() => {
    const currentState = state.get();
    const result = {} as Result;
    
    for (const key in selectors) {
      result[key] = selectors[key](currentState);
    }
    
    return result;
  }, options);
}

/**
 * Clean up resources used by a computed value
 * 
 * @param computedGetter The computed getter function to dispose
 */
export function disposeComputed(computedGetter: () => any): void {
  if (typeof computedGetter === 'function' && (computedGetter as any)._dispose) {
    (computedGetter as any)._dispose();
  }
}

/**
 * Create a computed value that tracks when state changes
 * 
 * @param state The state instance to track
 * @param comparator Optional comparison function to determine if the state changed
 * @returns A function that returns true if the state changed
 */
export function createChangeTracker<S extends object>(
  state: StateInstanceType<S>,
  comparator?: (prev: S, next: S) => boolean
): () => boolean {
  let changed = false;
  let lastValue = state.get();
  
  // Define default comparator that does shallow equality check
  const defaultComparator = (prev: S, next: S) => {
    if (prev === next) return true;
    if (!prev || !next) return false;
    
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => prev[key as keyof S] === next[key as keyof S]);
  };
  
  // Use provided comparator or the default one
  const compareValues = comparator || defaultComparator;
  
  // Subscribe to state changes
  const unsubscribe = state.subscribe(newValue => {
    changed = !compareValues(lastValue, newValue);
    lastValue = { ...newValue }; // Create a copy to avoid reference issues
  });
  
  // Create a function to check if the state changed
  const hasChanged = () => {
    const result = changed;
    changed = false; // Reset after read
    return result;
  };
  
  // Store cleanup function
  (hasChanged as any)._dispose = unsubscribe;
  
  return hasChanged;
} 