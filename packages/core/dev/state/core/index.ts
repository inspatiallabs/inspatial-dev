/**
 * @module @inspatial/state
 *
 * Universal state management for InSpatial applications with a unified interface
 * for both simple and complex state management needs, integrating signals and triggers.
 *
 * @example Basic Usage
 * ```typescript
 * import { createState } from "@inspatial/state";
 * 
 * // Create a simple state
 * const counterState = createState({
 *   initialState: { count: 0 }
 * });
 * 
 * // Update the state with the improved API
 * counterState.update({ count: counterState.get().count + 1 });
 * 
 * // Use with trigger system
 * counterState.connectTrigger(incrementTrigger);
 * counterState.action.increment(5); // Increment by 5
 * 
 * // Or use the expressive StateQL syntax
 * const playerState = stateQL(createState({ 
 *   initialState: { health: 100, mana: 50 }
 * }));
 * 
 * // Update with template literals
 * playerState.update`health -= 10, mana -= 5`;
 * ```
 *
 * @features
 * - Single source of truth for application state
 * - Seamless integration with trigger system
 * - Automatic action generation from triggers
 * - Type-safe with schema validation
 * - Local and global state with naming conventions
 * - Optimized performance with batched updates
 * - Persistence options for state storage
 * - Computed values and derived state
 * - Expressive template literal updates with StateQL
 * - Integration with InSpatial Type system for runtime validation
 */

// Core state management API (Phase 1 & 2)
export { createState } from "./state.ts";
export { connectTriggerToState, connectTriggersToState } from "./bridge.ts";
export { StateManager } from "./manager.ts";

// Signal-Trigger Integration API (Phase 1)
export {
  createTriggerSignal,
  createSignalConditionTrigger,
  StateEventBus,
  createStateLens
} from "./signal-trigger.ts";

// Performance & Debugging Tools (Phase 2)
export {
  SignalTriggerProfiler,
  OptimizedEventQueue,
  optimizeUpdateTrigger,
  createGlobalProfiler,
  globalProfiler
} from "./signal-trigger-perf.ts";

export {
  SignalTriggerDebugger,
  createGlobalDebugger,
  globalDebugger,
  SignalTriggerInspector,
  createInspector
} from "./signal-trigger-debug.ts";

// Performance optimizations (Phase 2)
export { 
  createComputed,
  createComputedRecord,
  createComputedFromStates
} from "./memo.ts";

// Derived state (Phase 2)
export {
  createDerivedState,
  createDerivedStateFromMultiple
} from "./derived.ts";

// Persistence (Phase 2)
export {
  setupPersistence,
  registerStorageAdapter,
  StorageAdapters,
  setupInSpatialDBPersistence
} from "./persistence.ts";

// StateQL (Template Literal Updates)
export {
  stateQL,
  createStateQL
} from "./stateql.ts";

// Type validation (InSpatial Type System Integration)
export {
  createTypeValidator,
  validateState,
  isTypeError,
  getStateJsonSchema,
  registerStateSchema,
  StateTypes
} from "./validation.ts";

// Types
export type {
  // Core types (Phase 1)
  StateConfig,
  StateInstance,
  PersistOptions,
  StateOptions,
  
  // New types (Phase 2)
  ComputedOptionsType,
  DerivedStateOptionsType,
  StorageAdapterType,
  
  // StateQL types
  StateQLInstance
} from "./types.ts";

// Utilities
export { 
  // Core utilities (Phase 1)
  isStateInstance, 
  getGlobalState,
  
  // New utilities (Phase 2)
  createStateSnapshot,
  restoreStateSnapshot,
  getAllGlobalStates
} from "./utils.ts"; 