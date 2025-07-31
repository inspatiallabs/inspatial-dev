/**
 * anime.js - ESM
 * @version v4.1.2
 * @author Julian Garnier
 * @license MIT
 * @copyright (c) 2025 Julian Garnier
 * @see https://animejs.com
 */

/****************************************************
 * InMotion (InSpatial Motion)
 * @version v1.0.0
 * @author InSpatial Labs
 * @license Apache-2.0
 * @copyright (c) 2026 InSpatial Labs
 * @see https://inspatial.dev/motion
 ****************************************************/

import { emptyString, unitsExecRgx } from "./consts.ts";

import {
  isArr,
  isFnc,
  isNum,
  isStr,
  isDefined,
} from "./helpers.ts";

import { parseEasings } from "./eases.ts";
import type {
  Target,
  EasingParam,
  TweenModifier,
  SequenceFunction,
} from "./types.ts";

/**
 * Local interface for inSequence function parameters
 */
interface SequenceParams {
  /** Starting value for the inSequence */
  start?: number | string | Record<string, any>;
  /** Element to start sequencing from */
  from?: number | "first" | "center" | "last";
  /** Whether to reverse the inSequence order */
  reversed?: boolean;
  /** Grid dimensions for 2D sequencing */
  grid?: [number, number];
  /** Axis for grid sequencing */
  axis?: "x" | "y";
  /** Easing function for inSequence timing */
  ease?: EasingParam;
  /** Function to modify inSequence values */
  modifier?: TweenModifier;
}

/**
 * # InMotion Sequencer
 * @summary Creates sequencetial animation and timing for multiple targets
 *
 * inSequence helps create progressive delays or values for animations with multiple targets.
 * This is useful for creating sequential or grid-based animations.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

/**
 * Creates a inSequence function with the specified parameters
 *
 * @param val - Base value for sequencing (number, string, or [start, end] array)
 * @param params - Parameters for inSequence configuration
 * @returns A function that generates sequenced values for targets
 */
export const inSequence = (
  val: number | string | [number | string, number | string],
  params?: SequenceParams
): SequenceFunction => {
  const valArr = isArr(val)
    ? (val as [number | string, number | string])
    : [0, val];
  const p = params || {};
  const from = p.from || "last";
  const axis = p.axis || "y";
  const ease = p.ease ? parseEasings(p.ease) : null;

  const start = isDefined(p.start) ? p.start : 0;
  const direction = p.reversed ? 1 : -1;

  const distributor = (
    t?: Target,
    i: number = 0,
    total: number = 1
  ): number | string => {
    let val: number | string = 0;
    let fromIndex: number;
    const grid = p.grid;

    if (grid && isArr(grid)) {
      const totalPerLine = grid[0] || 1;
      const row = Math.floor(i / totalPerLine);
      const col = i % totalPerLine;

      if (axis === "x") {
        fromIndex =
          from === "first"
            ? col
            : from === "center"
            ? Math.abs((totalPerLine - 1) / 2 - col)
            : from === "last"
            ? totalPerLine - 1 - col
            : isNum(from)
            ? from
            : 0;
      } else {
        // Safe access to grid[1] with default value
        const gridHeight = grid.length > 1 ? grid[1] : totalPerLine;
        fromIndex =
          from === "first"
            ? row
            : from === "center"
            ? Math.abs((gridHeight - 1) / 2 - row)
            : from === "last"
            ? gridHeight - 1 - row
            : isNum(from)
            ? from
            : 0;
      }
    } else {
      fromIndex =
        from === "first"
          ? i
          : from === "center"
          ? Math.abs((total - 1) / 2 - i)
          : from === "last"
          ? total - 1 - i
          : isNum(from)
          ? from
          : 0;
    }

    // Sequence position calculation
    const gridDivisor =
      grid && axis === "x"
        ? grid[0]
        : grid && axis === "y" && grid.length > 1
        ? grid[1]
        : total;
    const position = fromIndex / (gridDivisor - 1 || 1); // Avoid division by zero
    const prog = Math.max(
      0,
      Math.min(1, direction < 0 ? 1 - position : position)
    );
    const easedProg = ease ? ease(prog) : prog;

    // Get the start value
    let startVal = 0;

    if (isNum(start)) {
      startVal = start as number;
    } else if (isStr(start)) {
      startVal = parseFloat(start as string);
    } else if (isFnc(start) && t) {
      startVal = (start as (target: Target, index: number, total: number) => number)(t, i, total);
    }

    // Calculate the progression between the inSequence values
    // Use parseFloat for string values with units, Number for pure numbers
    const fromVal = isStr(valArr[0]) ? parseFloat(valArr[0] as string) : Number(valArr[0]);
    const toVal = isStr(valArr[1]) ? parseFloat(valArr[1] as string) : Number(valArr[1]);
    const diff = !isNaN(toVal) && !isNaN(fromVal) ? toVal - fromVal : 0;

    // Apply inSequenceed value on the startVal
    const inSequenceVal = startVal + easedProg * diff;

    // Apply custom modifier if provided
    val = p.modifier ? p.modifier(inSequenceVal) : inSequenceVal;

    // Handle string values that aren't numeric with units
    if (
      valArr[0] &&
      isStr(valArr[0]) &&
      !unitsExecRgx.test(valArr[0] as string)
    ) {
      // Non-numeric strings - choose based on progression
      if (valArr[1] && isStr(valArr[1]) && !unitsExecRgx.test(valArr[1] as string)) {
        // Two non-numeric strings - interpolate based on progression
        return easedProg < 0.5 ? valArr[0] as string : valArr[1] as string;
      }
      return valArr[0] as string;
    } else if (
      valArr[1] &&
      isStr(valArr[1]) &&
      !unitsExecRgx.test(valArr[1] as string)
    ) {
      return valArr[1] as string;
    } else {
      // Apply units if present in the value
      const match =
        valArr[0] && isStr(valArr[0])
          ? (valArr[0] as string).match(unitsExecRgx)
          : null;
      const unit = match ? match[2] : emptyString;

      return unit ? val + unit : val;
    }
  };

  // Return with type assertion
  return distributor as SequenceFunction;
};
