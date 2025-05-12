import { emptyString, unitsExecRgx } from "./consts.ts";

import {
  isArr,
  isFnc,
  isNum,
  isObj,
  isStr,
  isDefined,
  toRgb,
  round,
  isUnd,
  sqrt,
  max,
} from "./helpers.ts";

import { parseEasings } from "./eases.ts";

import { Timeline } from "./timeline.ts";
import type { Target, EasingParam, TweenModifier, StaggerFunction } from "./types.ts";

/**
 * Local interface for stagger function parameters
 */
interface StaggerParams {
  /** Starting value for the stagger */
  start?: number | string | Record<string, any>;
  /** Element to start staggering from */
  from?: number | 'first' | 'center' | 'last';
  /** Whether to reverse the stagger order */
  reversed?: boolean;
  /** Grid dimensions for 2D staggering */
  grid?: [number, number];
  /** Axis for grid staggering */
  axis?: 'x' | 'y';
  /** Easing function for stagger timing */
  ease?: EasingParam;
  /** Function to modify stagger values */
  modifier?: TweenModifier;
}

/**
 * # Stagger Animation Helper
 * @summary Creates staggered animation timing for multiple targets
 * 
 * Stagger helps create progressive delays or values for animations with multiple targets.
 * This is useful for creating sequential or grid-based animations.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 */

/**
 * Creates a stagger function with the specified parameters
 * 
 * @param val - Base value for staggering (number, string, or [start, end] array)
 * @param params - Parameters for stagger configuration
 * @returns A function that generates staggered values for targets
 */
export const stagger = (
  val: number | string | [number | string, number | string],
  params?: StaggerParams
): StaggerFunction => {
  const valArr = isArr(val) ? val as [number | string, number | string] : [0, val];
  const p = params || {};
  const from = p.from || 0;
  const axis = p.axis || 'y';
  const ease = p.ease ? parseEasings(p.ease) : null;

  let start = isDefined(p.start) ? p.start : 0;
  let direction = p.reversed ? 1 : -1;
  
  const distributor = (
    t?: Target,
    i: number = 0,
    total: number = 1
  ): number | string => {
    let val: number | string;
    let fromIndex: number;
    const grid = p.grid;
    
    if (grid && isArr(grid)) {
      const totalPerLine = grid[0] || 1;
      const row = Math.floor(i / totalPerLine);
      const col = i % totalPerLine;
      
      if (axis === 'x') {
        fromIndex = from === 'first' ? col : 
                     from === 'center' ? (totalPerLine - 1) / 2 - col : 
                     from === 'last' ? totalPerLine - 1 - col : 
                     isNum(from) ? from : 0;
      } else {
        // Safe access to grid[1] with default value
        const gridHeight = grid.length > 1 ? grid[1] : totalPerLine;
        fromIndex = from === 'first' ? row : 
                     from === 'center' ? (gridHeight - 1) / 2 - row : 
                     from === 'last' ? gridHeight - 1 - row : 
                     isNum(from) ? from : 0;
      }
    } else {
      fromIndex = from === 'first' ? 0 : 
                   from === 'center' ? (total - 1) / 2 - i : 
                   from === 'last' ? total - 1 - i : 
                   isNum(from) ? from : 0;
    }
    
    // Staggered position calculation
    const gridDivisor = grid && axis === 'x' ? grid[0] : 
                         grid && axis === 'y' && grid.length > 1 ? grid[1] : 
                         total;
    const position = fromIndex / (gridDivisor - 1 || 1); // Avoid division by zero
    const prog = Math.max(0, Math.min(1, (direction < 0 ? 1 - position : position)));
    const easedProg = ease ? ease(prog) : prog;
    
    // Get the start value
    let startVal = 0;
    
    if (isNum(start)) {
      startVal = start as number;
    } else if (isStr(start)) {
      startVal = parseFloat(start as string);
    } else if (isFnc(start) && t) {
      startVal = (start as Function)(t, i, total);
    }
    
    // Calculate the progression between the stagger values
    // Use explicit number conversion
    const fromVal = Number(valArr[0]);
    const toVal = Number(valArr[1]);
    const diff = !isNaN(toVal) && !isNaN(fromVal) ? toVal - fromVal : 0;
    
    // Apply staggered value on the startVal
    const staggerVal = startVal + easedProg * diff;
    
    // Apply custom modifier if provided
    val = p.modifier ? p.modifier(staggerVal) : staggerVal;
    
    // Handle string values that aren't numeric with units
    if (valArr[0] && isStr(valArr[0]) && !unitsExecRgx.test(valArr[0] as string)) {
      return valArr[0] as string;
    } else if (valArr[1] && isStr(valArr[1]) && !unitsExecRgx.test(valArr[1] as string)) {
      return valArr[1] as string;
    } else {
      // Apply units if present in the value
      const match = valArr[0] && isStr(valArr[0]) ? (valArr[0] as string).match(unitsExecRgx) : null;
      const unit = match ? match[1] : emptyString;
      
      return unit ? val + unit : val;
    }
  };
  
  // Return with type assertion
  return distributor as StaggerFunction;
};

/**
 * Alias for stagger function (Phase 2 API naming)
 */
export const inSequence = stagger; 