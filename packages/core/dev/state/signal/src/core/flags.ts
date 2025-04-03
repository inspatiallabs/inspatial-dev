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
export const LOADING: unique symbol = Symbol(__DEV__ ? "LOADING" : 0);

export const UNINITIALIZED_OFFSET = 2;
export const UNINITIALIZED: unique symbol = Symbol(__DEV__ ? "UNINITIALIZED" : 0);
