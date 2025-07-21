/**
 * # Derived State
 * @summary #### State derived from other state instances
 *
 * This module provides functionality to create state that derives its values
 * from other state instances, automatically updating when source states change.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial State x Trigger)
 * @module @in/teract
 * @kind module
 * @access public
 */

import { createState } from "./state.ts";
import type {
  StateInstanceType,
  DerivedStateOptionsType,
  StateConfigType,
} from "./types.ts";

/**
 * Create a state instance that derives its values from another state
 *
 * @param sourceState The state to derive from
 * @param deriveFn Function that computes the derived state from the source state
 * @param options Additional options for the derived state
 * @returns A state instance with values derived from the source state
 */
export function createDerivedState<S extends object, T extends object>(
  sourceState: StateInstanceType<S>,
  deriveFn: (sourceState: S) => T,
  options?: DerivedStateOptionsType<T>
): StateInstanceType<T> {
  // Generate a default ID if not provided
  const id = options?.id || `derived-${sourceState.meta.id}`;

  // Create initial derived state
  const initialDerivedState = deriveFn(sourceState.get());

  // Set up configuration for derived state
  const derivedConfig: StateConfigType<T> = {
    id,
    initialState: initialDerivedState,
    ...(options?.config || {}),
  };

  // Create the derived state instance
  const derivedState = createState(derivedConfig, {
    ...(options || {}),
    // Override ID if provided in options to avoid conflicts with config
    ...(options?.id ? { id: options.id } : {}),
  });

  // Only set up auto-updates if not explicitly disabled
  if (options?.autoUpdate !== false) {
    // Automatic update mechanism
    const unsubscribe = sourceState.subscribe((sourceValue) => {
      // Compute new derived state
      const newDerivedState = deriveFn(sourceValue);

      // Update the derived state
      derivedState.update(newDerivedState);
    });

    // Store unsubscribe function for cleanup
    const originalDestroy = derivedState.destroy;
    derivedState.destroy = () => {
      unsubscribe();
      originalDestroy();
    };
  }

  // If interval updates are configured, set up a timer
  if (options?.updateInterval && options.updateInterval > 0) {
    let intervalId: any;

    // Set up interval updates
    const startInterval = () => {
      intervalId = setInterval(() => {
        const newDerivedState = deriveFn(sourceState.get());
        derivedState.update(newDerivedState);
      }, options.updateInterval);
    };

    // Start the interval
    startInterval();

    // Extend the destroy method to clean up the interval
    const intervalDestroy = derivedState.destroy;
    derivedState.destroy = () => {
      clearInterval(intervalId);
      intervalDestroy();
    };
  }

  return derivedState;
}

/**
 * Create a state instance that derives its values from multiple source states
 *
 * @param sourceStates Array of states to derive from
 * @param deriveFn Function that computes the derived state from all source states
 * @param options Additional options for the derived state
 * @returns A state instance with values derived from the source states
 */
export function createDerivedStateFromMultiple<T extends object>(
  sourceStates: Array<StateInstanceType<any>>,
  deriveFn: (sourceStates: Array<any>) => T,
  options?: DerivedStateOptionsType<T>
): StateInstanceType<T> {
  // Generate a default ID
  const id = options?.id || `derived-multi-${Date.now()}`;

  // Get current values from all source states
  const sourceValues = sourceStates.map((state) => state.get());

  // Create initial derived state
  const initialDerivedState = deriveFn(sourceValues);

  // Set up configuration for derived state
  const derivedConfig: StateConfigType<T> = {
    id,
    initialState: initialDerivedState,
    ...(options?.config || {}),
  };

  // Create the derived state instance
  const derivedState = createState(derivedConfig, {
    ...(options || {}),
    // Override ID if provided in options
    ...(options?.id ? { id: options.id } : {}),
  });

  // Only set up auto-updates if not explicitly disabled
  if (options?.autoUpdate !== false) {
    // Track previous values to avoid unnecessary updates
    let previousValues = sourceValues.map((value) => ({ ...value }));

    // Set up subscriptions to all source states
    const unsubscribes = sourceStates.map((sourceState, index) => {
      return sourceState.subscribe((newValue) => {
        // Update the stored value for this state
        previousValues[index] = newValue;

        // Compute new derived state from all current values
        const newDerivedState = deriveFn([...previousValues]);

        // Update the derived state
        derivedState.update(newDerivedState);
      });
    });

    // Extend destroy method to clean up all subscriptions
    const originalDestroy = derivedState.destroy;
    derivedState.destroy = () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      originalDestroy();
    };
  }

  // If interval updates are configured, set up a timer
  if (options?.updateInterval && options.updateInterval > 0) {
    let intervalId: any;

    // Set up interval updates
    const startInterval = () => {
      intervalId = setInterval(() => {
        const currentValues = sourceStates.map((state) => state.get());
        const newDerivedState = deriveFn(currentValues);
        derivedState.update(newDerivedState);
      }, options.updateInterval);
    };

    // Start the interval
    startInterval();

    // Extend the destroy method to clean up the interval
    const intervalDestroy = derivedState.destroy;
    derivedState.destroy = () => {
      clearInterval(intervalId);
      intervalDestroy();
    };
  }

  return derivedState;
}

/**
 * Create a derived state that merges multiple states into one
 *
 * @param sourceStates Record of state instances to merge
 * @param options Additional options for the derived state
 * @returns A state instance containing merged values from all source states
 */
export function createMergedState<
  T extends Record<string, StateInstanceType<any>>
>(
  sourceStates: T,
  options?: DerivedStateOptionsType<{ [K in keyof T]: ReturnType<T[K]["get"]> }>
): StateInstanceType<{ [K in keyof T]: ReturnType<T[K]["get"]> }> {
  // Create a function that merges all source states
  const mergeStates = (states: Record<string, StateInstanceType<any>>) => {
    const result: Record<string, any> = {};

    for (const key in states) {
      if (Object.prototype.hasOwnProperty.call(states, key)) {
        result[key] = states[key].get();
      }
    }

    return result as { [K in keyof T]: ReturnType<T[K]["get"]> };
  };

  // Transform the record into an array for createDerivedStateFromMultiple
  const stateArray = Object.values(sourceStates);
  const stateKeys = Object.keys(sourceStates);

  // Use createDerivedStateFromMultiple with a custom merge function
  return createDerivedStateFromMultiple(
    stateArray,
    (values) => {
      const result: Record<string, any> = {};
      values.forEach((value, index) => {
        result[stateKeys[index]] = value;
      });
      return result as { [K in keyof T]: ReturnType<T[K]["get"]> };
    },
    options
  );
}

/**
 * Create a filtered state that includes only specific properties from a source state
 *
 * @param sourceState The state to filter
 * @param keys Array of keys to include in the derived state
 * @param options Additional options for the derived state
 * @returns A state instance containing only the specified properties
 */
export function createFilteredState<S extends object, K extends keyof S>(
  sourceState: StateInstanceType<S>,
  keys: K[],
  options?: DerivedStateOptionsType<Pick<S, K>>
): StateInstanceType<Pick<S, K>> {
  return createDerivedState(
    sourceState,
    (state) => {
      const result = {} as Pick<S, K>;
      keys.forEach((key) => {
        result[key] = state[key];
      });
      return result;
    },
    options
  );
}
