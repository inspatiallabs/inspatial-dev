/**
 * # InMotion Utilities
 * @module @in/motion/utils
 *
 * Central export point for all utility functions in the InMotion animation library.
 * This module provides a convenient way to import utilities from various categories.
 *
 * @example Basic Usage
 * ```typescript
 * // Import everything
 * import * as motionUtils from "@in/motion/utils";
 *
 * // Import specific utilities
 * import { delay, get, set } from "@in/motion/utils";
 *
 * // Import from a specific category
 * import { clamp, interpolate } from "@in/motion/utils/math";
 * ```
 *
 * @features
 * - Centralized exports for all utility functions
 * - Categorized utilities for better organization
 * - Comprehensive animation and DOM manipulation utilities
 * - Math functions for animation calculations
 * - Timing and scheduling utilities
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

// Re-export utilities from categories
export * from "./animation/index.ts";
export * from "./dom/index.ts";
export * from "./math/index.ts";

export { delay, stop, remove, get, set } from "./animation/index.ts";
export {
  isNode,
  cleanInlineStyles,
  getTargetValue,
  setTargetValues,
} from "./dom/index.ts";
export {
  clamp,
  interpolate,
  round,
  snap,
  normalize,
  mapRange,
  normalizeTime,
} from "./math/index.ts";

export const getChildAtIndex = (parent: any, index: number): any => {
  // If the parent has no children or is null/undefined, return null
  if (!parent || !parent._head) {
    return null;
  }
  
  let next = parent._head;
  let i = 0;
  while (next) {
    const currentNext = next._next;
    if (i === index) break;
    next = currentNext;
    i++;
  }
  return next;
};

export const getChildLength = (parent: any): number => {
  // If the parent is null/undefined or has no children, return 0
  if (!parent || !parent._head) {
    return 0;
  }
  
  let next = parent._head;
  let i = 0;
  while (next) {
    next = next._next;
    i++;
  }
  return i;
};

export const getTweenDelay = (tween: any) => tween._delay;
