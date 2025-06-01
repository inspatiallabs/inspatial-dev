/**
 * @module @in/teract/signal-core/constants
 *
 * Contains fundamental constants that power InSpatial's reactive system.
 * Think of these like the control panel labels in a nuclear reactor - they define
 * the different states and modes that keep the reactive system running smoothly.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Reactive Constants
 * @access private
 *
 * ### 💡 Core Concepts
 * - State flags manage the lifecycle of reactive computations
 * - Effect types determine how different reactive operations behave
 * - Proxy support detection enables optimal performance strategies
 * - Special symbols provide safe access to underlying store data
 *
 * ### 📚 Terminology
 * > **State**: The current condition of a reactive computation node
 * > **Effect**: A reactive operation that manages side effects
 * > **Proxy**: A wrapper object that enables reactive tracking
 * > **Symbol**: A unique identifier used for special object properties
 */

/**
 * # STATE_CLEAN
 * @summary #### Computation is up-to-date with all sources
 *
 * The `STATE_CLEAN` constant (value 0) indicates a computation node where:
 * - All source values are current
 * - No parent nodes have changed
 * - No re-calculation is needed
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default 0
 */
export const STATE_CLEAN = 0;

/**
 * # STATE_CHECK
 * @summary #### Potential changes in parent nodes need verification
 *
 * The `STATE_CHECK` constant (value 1) marks computations that:
 * - Might have outdated parent values
 * - Require dependency checking
 * - Will upgrade to DIRTY if changes are confirmed
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default 1
 */
export const STATE_CHECK = 1;

/**
 * # STATE_DIRTY
 * @summary #### Computation definitely needs re-calculation
 *
 * The `STATE_DIRTY` constant (value 2) means:
 * - Direct parents have changed
 * - Computation must re-run
 * - Dependencies need re-tracking
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default 2
 */
export const STATE_DIRTY = 2;

/**
 * # STATE_DISPOSED
 * @summary #### Computation has been cleaned up and removed
 *
 * The `STATE_DISPOSED` constant (value 3) indicates:
 * - Computation is no longer active
 * - All resources have been released
 * - Should never be updated again
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default 3
 */
export const STATE_DISPOSED = 3;

/**
 * # EFFECT_PURE
 * @summary #### Standard reactive effect with automatic cleanup
 *
 * The `EFFECT_PURE` constant (value 0) defines effects that:
 * - Automatically track dependencies
 * - Clean up after themselves
 * - Run in the reaction phase
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default 0
 */
export const EFFECT_PURE = 0;

/**
 * # EFFECT_RENDER
 * @summary #### Effect that runs during render phase
 *
 * The `EFFECT_RENDER` constant (value 1) is used for:
 * - DOM updates and layout calculations
 * - Operations requiring synchronous execution
 * - Effects that should run before paint
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default 1
 */
export const EFFECT_RENDER = 1;

/**
 * # EFFECT_USER
 * @summary #### User-defined effect with custom behavior
 *
 * The `EFFECT_USER` constant (value 2) enables:
 * - Manual dependency tracking
 * - Custom cleanup logic
 * - Advanced effect patterns
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default 2
 */
export const EFFECT_USER = 2;

/**
 * # SUPPORTS_PROXY
 * @summary #### Detects if JavaScript Proxy is available
 *
 * The `SUPPORTS_PROXY` constant checks if:
 * - The environment supports Proxy objects
 * - Store reactivity can use advanced tracking
 * - Fallback strategies are needed
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default typeof Proxy === "function"
 */
export const SUPPORTS_PROXY = typeof Proxy === "function";

/**
 * # $RAW
 * @summary #### Symbol to access unwrapped store values
 *
 * The `$RAW` symbol provides:
 * - Access to original, non-reactive objects
 * - Escape hatch for performance-critical code
 * - Safe value inspection without tracking
 *
 * @example
 * ```typescript
 * const [store] = createStore({ data: [1, 2, 3] });
 * const rawData = store[$RAW].data; // Original array, not reactive
 * ```
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @constant
 * @default Symbol("store-raw")
 */
export const $RAW = Symbol("store-raw");
