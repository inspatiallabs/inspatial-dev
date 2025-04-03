/**
 * # State Utilities
 * @summary #### Helper functions for working with state instances
 * 
 * This module provides utility functions for working with state instances,
 * including snapshot creation, type checking, and global state access.
 * 
 * @since 1.0.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import { StateManager } from "./manager";
import type { StateInstanceType } from "./types";

/**
 * Check if a value is a state instance
 * 
 * @param value The value to check
 * @returns True if the value is a state instance
 */
export function isStateInstance<T extends object = any>(value: any): value is StateInstanceType<T> {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.getState === 'function' &&
    typeof value.setState === 'function' &&
    typeof value.subscribe === 'function' &&
    typeof value.meta === 'object' &&
    typeof value.meta.id === 'string'
  );
}

/**
 * Get a global state instance by ID
 * 
 * @param id The ID of the state to retrieve
 * @returns The state instance or undefined if not found
 */
export function getGlobalState<T extends object = any>(id: string): StateInstanceType<T> | undefined {
  return StateManager.getGlobalState<T>(id);
}

/**
 * Get all registered global state instances
 * 
 * @returns A record of all global state instances
 */
export function getAllGlobalStates(): Record<string, StateInstanceType<any>> {
  return StateManager.getAllGlobalStates();
}

/**
 * Create a snapshot of a state instance's current value
 * 
 * @param state The state instance to snapshot
 * @returns A deep copy of the current state value
 */
export function createStateSnapshot<T extends object>(state: StateInstanceType<T>): T {
  const currentState = state.get();
  // Create a deep clone using JSON serialization
  return JSON.parse(JSON.stringify(currentState));
}

/**
 * Create snapshots of multiple state instances
 * 
 * @param states Record of state instances to snapshot
 * @returns Record of state snapshots with the same keys
 */
export function createStateSnapshots<T extends Record<string, StateInstanceType<any>>>(
  states: T
): { [K in keyof T]: ReturnType<T[K]['get']> } {
  const result: Record<string, any> = {};
  
  for (const key in states) {
    if (Object.prototype.hasOwnProperty.call(states, key)) {
      result[key] = createStateSnapshot(states[key]);
    }
  }
  
  return result as { [K in keyof T]: ReturnType<T[K]['get']> };
}

/**
 * Restore a state instance to a previous snapshot
 * 
 * @param state The state instance to restore
 * @param snapshot The snapshot to restore from
 */
export function restoreStateSnapshot<T extends object>(
  state: StateInstanceType<T>,
  snapshot: T
): void {
  state.update(snapshot);
}

/**
 * Restore multiple state instances from snapshots
 * 
 * @param statesAndSnapshots Record of state instances and their snapshots
 */
export function restoreStateSnapshots<T extends Record<string, StateInstanceType<any>>>(
  statesAndSnapshots: { [K in keyof T]: { state: T[K], snapshot: ReturnType<T[K]['get']> } }
): void {
  for (const key in statesAndSnapshots) {
    if (Object.prototype.hasOwnProperty.call(statesAndSnapshots, key)) {
      const { state, snapshot } = statesAndSnapshots[key];
      restoreStateSnapshot(state, snapshot);
    }
  }
}

/**
 * Compare two state snapshots for equality
 * 
 * @param snapshot1 First snapshot
 * @param snapshot2 Second snapshot
 * @param strict If true, uses strict equality; otherwise uses deep equality
 * @returns True if the snapshots are equal
 */
export function compareStateSnapshots<T extends object>(
  snapshot1: T,
  snapshot2: T,
  strict = false
): boolean {
  if (strict) {
    return snapshot1 === snapshot2;
  }
  
  // Deep comparison
  const json1 = JSON.stringify(snapshot1);
  const json2 = JSON.stringify(snapshot2);
  
  return json1 === json2;
}

/**
 * Find the differences between two state snapshots
 * 
 * @param oldSnapshot First snapshot
 * @param newSnapshot Second snapshot
 * @returns Object containing added, removed, and changed properties
 */
export function diffStateSnapshots<T extends object>(
  oldSnapshot: T,
  newSnapshot: T
): {
  added: string[];
  removed: string[];
  changed: { key: string; oldValue: any; newValue: any }[];
} {
  const oldKeys = Object.keys(oldSnapshot);
  const newKeys = Object.keys(newSnapshot);
  
  // Find added keys
  const added = newKeys.filter(key => !oldKeys.includes(key));
  
  // Find removed keys
  const removed = oldKeys.filter(key => !newKeys.includes(key));
  
  // Find changed values
  const changed: { key: string; oldValue: any; newValue: any }[] = [];
  
  // Check keys that exist in both
  const commonKeys = oldKeys.filter(key => newKeys.includes(key));
  for (const key of commonKeys) {
    const oldValue = (oldSnapshot as any)[key];
    const newValue = (newSnapshot as any)[key];
    
    // Compare values
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changed.push({ key, oldValue, newValue });
    }
  }
  
  return { added, removed, changed };
}

/**
 * Transform a state snapshot
 * 
 * @param snapshot The snapshot to transform
 * @param transformer Function that transforms the snapshot
 * @returns Transformed snapshot
 */
export function transformStateSnapshot<T extends object, R extends object = T>(
  snapshot: T,
  transformer: (snapshot: T) => R
): R {
  return transformer(JSON.parse(JSON.stringify(snapshot)));
}

/**
 * Check if a state has any subscribers
 * 
 * @param state The state instance to check
 * @returns True if the state has subscribers
 */
export function hasSubscribers(state: StateInstanceType<any>): boolean {
  // This is an implementation detail that may not be available in all cases
  return (state as any)._subscriberCount > 0;
}

/**
 * Reset all global states
 * 
 * @returns Count of states that were reset
 */
export function resetAllGlobalStates(): number {
  const states = StateManager.getAllGlobalStates();
  let count = 0;
  
  for (const id in states) {
    if (Object.prototype.hasOwnProperty.call(states, id)) {
      states[id].reset();
      count++;
    }
  }
  
  return count;
}

/**
 * Create a serializable representation of state
 * 
 * @param state The state instance to serialize
 * @returns An object representing the state
 */
export function serializeState<T extends object>(state: StateInstanceType<T>): {
  id: string;
  isGlobal: boolean;
  value: T;
} {
  return {
    id: state.meta.id,
    isGlobal: state.meta.isGlobal,
    value: state.get()
  };
} 