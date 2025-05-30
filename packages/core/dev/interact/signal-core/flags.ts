// Ensure __DEV__ is defined
if (typeof globalThis.__DEV__ === "undefined") {
  globalThis.__DEV__ = true;
}

export const UNINITIALIZED_BIT = 1 << 0;
export const LOADING_BIT = 1 << 1;
export const ERROR_BIT = 1 << 2;

export const DEFAULT_FLAGS = 0;

/**
 * State flags define the behavior of a reactive node. They determine whether the node has
 * listeners, whether it is loading, whether it errored, or whether it is uninitialized.
 *
 * Each flag is represented by a unique bit in a single integer using bitwise operations, which
 * allows for efficient storage and manipulation of multiple flags simultaneously.
 */
export type FlagsType = number;

export const ERROR_OFFSET = 0;
export const ERROR: unique symbol = Symbol(__DEV__ ? "ERROR" : 0);

export const LOADING_OFFSET = 1;
export const LOADING: unique symbol = Symbol("LOADING");

export const UNINITIALIZED_OFFSET = 2;
export const UNINITIALIZED: unique symbol = Symbol("UNINITIALIZED");

/** Flags associated with computation nodes. */
export const enum Flags {
  /** None. */
  None = 0,
  /** Prevents memory leaks when observed node is potentially dropped. */
  Dynamic = 1 << 0,
  /** Associated with disposal of parent scope. */
  Disposal = 1 << 1,
  /** For delegated computations like Context. */
  Delegated = 1 << 2,
  /** Mark computation as dirty (pending update). */
  Dirty = 1 << 3,
  /** Mark computation as potentially dirty (used by stores). */
  DirtySync = 1 << 4,
  /** Mark computation as needing disposal. */
  NeedsDisposal = 1 << 5,
  /** Mark computation as needing update. */
  NeedsUpdate = 1 << 6,
  /** Computation is currently running. */
  Running = 1 << 7,
  /** Has finalised observers attached. */
  HasFinalized = 1 << 8,
}

/** Special signals. */
export const ERR = Symbol("ERR");
export const PENDING = Symbol("PENDING");
