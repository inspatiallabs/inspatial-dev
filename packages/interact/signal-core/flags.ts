/**
 * @module @in/teract/signal-core/flags
 *
 * This module defines a set of constants and an enumeration (`Flags`) used internally
 * by the InSpatial Signal Core to manage the state and behavior of reactive computations.
 * These flags are typically combined using bitwise operations to represent multiple states
 * efficiently within a single number.
 *
 * Think of these flags as a set of small, colored sticky notes that can be attached to a task
 * on a project board. A single task (a reactive computation) can have multiple notes indicating
 * its status: "Needs Update" (Dirty), "Currently Working On It" (Running), "Waiting for Info"
 * (Loading), "Problem Encountered" (Error), etc. This system allows for quick checks and
 * efficient management of many computations.
 *
 * @example Conceptual usage (internal)
 * ```typescript
 * // Internal reactive node might have a state like this:
 * let nodeState = Flags.None;
 *
 * // If it needs an update:
 * nodeState |= Flags.Dirty;
 *
 * // If it's also dynamic:
 * nodeState |= Flags.Dynamic;
 *
 * // Check if dirty:
 * if (nodeState & Flags.Dirty) {
 *   // ... perform update
 * }
 * ```
 *
 * @features
 *  - **Bitwise Constants**: `UNINITIALIZED_BIT`, `LOADING_BIT`, `ERROR_BIT` for common states.
 *  - **`FlagsType`**: A type alias for numbers representing combined flags.
 *  - **`Flags` Enum**: A comprehensive set of flags for various computation states like `Dynamic`, `Disposal`, `Dirty`, `Running`, etc.
 *  - **Symbol Constants**: `ERROR`, `LOADING`, `UNINITIALIZED`, `ERR`, `PENDING` for special internal signaling or identification.
 *
 * @access private
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 */

// Ensure __DEV__ is defined
if (typeof globalThis.__DEV__ === "undefined") {
  globalThis.__DEV__ = true;
}

/**
 * # UNINITIALIZED_BIT
 * @summary #### Bit flag indicating a computation has not been initialized with a value.
 *
 * This flag is used when a reactive computation (like a memo or resource) has been created
 * but its actual value has not yet been computed or resolved for the first time.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {number}
 * @default 1 << 0 (which is 1)
 */
export const UNINITIALIZED_BIT = 1 << 0;

/**
 * # LOADING_BIT
 * @summary #### Bit flag indicating a computation is currently in a loading state.
 *
 * This is typically used for asynchronous operations, like those managed by `createResource`,
 * to signal that data is being fetched and is not yet available.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {number}
 * @default 1 << 1 (which is 2)
 */
export const LOADING_BIT = 1 << 1;

/**
 * # ERROR_BIT
 * @summary #### Bit flag indicating a computation has encountered an error.
 *
 * If a computation function throws an error, or an asynchronous operation fails,
 * this flag can be set on the reactive node to indicate an error state.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {number}
 * @default 1 << 2 (which is 4)
 */
export const ERROR_BIT = 1 << 2;

/**
 * # DEFAULT_FLAGS
 * @summary #### Represents the default, clean state with no flags set.
 *
 * This is the initial state for flags when a computation is first created or after
 * it has successfully updated and is not in any special state (loading, error, etc.).
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {number}
 * @default 0
 */
export const DEFAULT_FLAGS = 0;

/**
 * # FlagsType
 * @summary #### Type alias for a number representing a combination of bitwise flags.
 *
 * State flags define the behavior of a reactive node. They determine whether the node has
 * listeners, whether it is loading, whether it errored, or whether it is uninitialized.
 *
 * Each flag is represented by a unique bit in a single integer using bitwise operations, which
 * allows for efficient storage and manipulation of multiple flags simultaneously.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @typedef {number} FlagsType
 */
export type FlagsType = number;

/**
 * @summary #### Offset for the ERROR bit (internal use).
 * @internal
 */
export const ERROR_OFFSET = 0;
/**
 * # ERROR
 * @summary #### Symbol used internally to represent an error state or marker.
 *
 * This symbol can be used by reactive primitives for special internal signaling related to errors,
 * distinct from the `ERROR_BIT` which is a bitwise flag.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {unique symbol}
 */
export const ERROR: unique symbol = Symbol(__DEV__ ? "ERROR" : 0);

/**
 * @summary #### Offset for the LOADING bit (internal use).
 * @internal
 */
export const LOADING_OFFSET = 1;
/**
 * # LOADING
 * @summary #### Symbol used internally to represent a loading state or marker.
 *
 * This symbol can be used by reactive primitives for special internal signaling related to loading states.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {unique symbol}
 */
export const LOADING: unique symbol = Symbol("LOADING");

/**
 * @summary #### Offset for the UNINITIALIZED bit (internal use).
 * @internal
 */
export const UNINITIALIZED_OFFSET = 2;
/**
 * # UNINITIALIZED
 * @summary #### Symbol used internally to represent an uninitialized state or marker.
 *
 * This symbol can be used by reactive primitives for special internal signaling for uninitialized states.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {unique symbol}
 */
export const UNINITIALIZED: unique symbol = Symbol("UNINITIALIZED");

/**
 * # Flags
 * @summary #### Enumeration of bitwise flags for reactive computation nodes.
 *
 * These flags define various states and properties of computations within the InSpatial Signal Core.
 * They are combined using bitwise operations to efficiently manage the node's status.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @enum {number}
 * @access package
 */
export const enum Flags {
  /**
   * @summary #### No flags set; represents a clean or default state.
   * @default 0
   */
  None = 0,
  /**
   * @summary #### Prevents memory leaks when an observed node is potentially dropped.
   * Mark a computation as having dynamic dependencies, meaning its sources might change frequently.
   * This can influence how the system optimizes its tracking or cleanup.
   * @default 1 << 0 (1)
   */
  Dynamic = 1 << 0,
  /**
   * @summary #### Indicates the computation is associated with the disposal of its parent scope.
   * When the parent owner is disposed, computations with this flag should also be cleaned up.
   * @default 1 << 1 (2)
   */
  Disposal = 1 << 1,
  /**
   * @summary #### Marks the computation as delegated, like a Context.
   * Delegated computations might have special behavior, for example, how they propagate updates
   * or how they are looked up in the reactive graph.
   * @default 1 << 2 (4)
   */
  Delegated = 1 << 2,
  /**
   * @summary #### Mark computation as dirty, indicating it needs to be re-evaluated.
   * This is a core flag that signals a computation's value is stale due to changes in its dependencies.
   * @default 1 << 3 (8)
   */
  Dirty = 1 << 3,
  /**
   * @summary #### Mark computation as potentially dirty (used by stores for synchronous updates).
   * This is a variation of `Dirty` often used in store implementations to handle synchronous changes
   * that might require immediate re-evaluation or specific handling.
   * @default 1 << 4 (16)
   */
  DirtySync = 1 << 4,
  /**
   * @summary #### Mark computation as needing disposal.
   * This flag indicates that the computation is scheduled for cleanup and should release its resources.
   * @default 1 << 5 (32)
   */
  NeedsDisposal = 1 << 5,
  /**
   * @summary #### Mark computation as needing an update (distinct from being dirty).
   * This might be used for cases where a re-evaluation isn't strictly because dependencies changed value
   * but because some other condition necessitates an update.
   * @default 1 << 6 (64)
   */
  NeedsUpdate = 1 << 6,
  /**
   * @summary #### Indicates the computation is currently running its evaluation function.
   * This helps prevent re-entrant execution or to understand the graph's state during debugging.
   * @default 1 << 7 (128)
   */
  Running = 1 << 7,
  /**
   * @summary #### Indicates the computation has finalized observers attached.
   * This could be used for optimizations or specific lifecycle management related to observers that have special finalization logic.
   * @default 1 << 8 (256)
   */
  HasFinalized = 1 << 8,
}

/**
 * # ERR
 * @summary #### Symbol used internally as a special marker, often related to error states.
 *
 * This symbol provides a unique identifier for internal signaling, potentially for specific
 * types of errors or error-related conditions that are distinct from the `ERROR` symbol or `ERROR_BIT`.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {unique symbol}
 */
export const ERR = Symbol("ERR");
/**
 * # PENDING
 * @summary #### Symbol used internally as a special marker, often related to pending states.
 *
 * This symbol provides a unique identifier for internal signaling, potentially for specific
 * types of pending or loading states that are distinct from the `LOADING` symbol or `LOADING_BIT`.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Flags
 * @constant
 * @type {unique symbol}
 */
export const PENDING = Symbol("PENDING");
