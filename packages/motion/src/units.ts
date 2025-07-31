
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

import {
  doc,
  valueTypes,
} from './consts.ts';

// Define helper functions directly rather than importing
const isUnd = (value: any): boolean => typeof value === "undefined";

// Define PI constant if it's not available from helpers
const PI = Math.PI;

// Define type-safe map for angle units
const angleUnitsMap: Record<string, number> = { 'deg': 1, 'rad': 180 / PI, 'turn': 360 };
// Type-safe cache for converted values
const convertedValuesCache: Record<string, number> = {};

/**
 * Converts a value from one unit to another
 * 
 * @param {Element} el - The DOM element to use for measurement
 * @param {any} decomposedValue - The decomposed value object
 * @param {string} unit - The target unit to convert to
 * @param {boolean} [force=false] - Whether to force recalculation even if cached
 * @return {any} - The decomposed value with converted unit
 */
export const convertValueUnit = (
  el: Element, 
  decomposedValue: any, 
  unit: string, 
  force = false
): any => {
  const currentUnit = decomposedValue.u;
  const currentNumber = decomposedValue.n;
  
  // If the value is already a UNIT type and the units match, no conversion needed
  // We already know the units are the same, so this check is necessary to avoid redundant conversion
  if (decomposedValue.t === valueTypes.UNIT && currentUnit === unit) {
    return decomposedValue;
  }
  const cachedKey = `${currentNumber}${currentUnit}${unit}`;
  const cached = convertedValuesCache[cachedKey];
  if (!isUnd(cached) && !force) {
    decomposedValue.n = cached;
  } else {
    let convertedValue: number;
    if (currentUnit && currentUnit in angleUnitsMap) {
      convertedValue = currentNumber * angleUnitsMap[currentUnit] / angleUnitsMap[unit];
    } else {
      const baseline = 100;
      const tempEl = el.cloneNode() as Element;
      const parentNode = el.parentNode;
      // Safely handle doc reference, falling back to document.body if needed
      const parentEl = (parentNode && (parentNode !== doc)) 
        ? parentNode as Element 
        : doc?.body || document.body;
        
      parentEl.appendChild(tempEl);
      const elStyle = (tempEl as HTMLElement).style;
      elStyle.width = baseline + (currentUnit || 'px');
      const currentUnitWidth = (tempEl as HTMLElement).offsetWidth || baseline;
      elStyle.width = baseline + unit;
      const newUnitWidth = (tempEl as HTMLElement).offsetWidth || baseline;
      const factor = currentUnitWidth / newUnitWidth;
      parentEl.removeChild(tempEl);
      convertedValue = factor * currentNumber;
    }
    decomposedValue.n = convertedValue;
    convertedValuesCache[cachedKey] = convertedValue;
  }
  decomposedValue.t = valueTypes.UNIT;
  decomposedValue.u = unit;
  return decomposedValue;
}
