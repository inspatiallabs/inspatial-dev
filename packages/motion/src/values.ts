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
  shortTransforms,
  validTransforms,
  tweenTypes,
  valueTypes,
  digitWithExponentRgx,
  unitsExecRgx,
  isDomSymbol,
  isSvgSymbol,
  proxyTargetSymbol,
} from "./consts.ts";

// Define helper functions directly rather than importing from utils/index.ts
const stringStartsWith = (str: string, sub: string): boolean =>
  str.indexOf(sub) === 0;
const isUnd = (value: any): boolean => typeof value === "undefined";
const isFnc = (value: any): value is (...args: any[]) => any => typeof value === "function";
const isCol = (value: string): boolean => {
  // Simple color detection - customize as needed for your use case
  return (
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl") ||
    value.startsWith("rgba") ||
    value.startsWith("hsla")
  );
};
const cloneArray = <T>(arr: T[] | null): T[] | null => {
  return arr ? [...arr] : null;
};

import { parseInlineTransforms } from "./transforms.ts";

import { isValidSVGAttribute } from "./svg.ts";

import { convertColorStringValuesToRgbaArray } from "./colors.ts";

/**
 * Sets a default value if the target value is undefined
 *
 * @template T, D
 * @param {T|undefined} targetValue - The value to check
 * @param {D} defaultValue - The default value to use if targetValue is undefined
 * @return {T|D} - The target value or default value
 */
export const setValue = <T, D>(
  targetValue: T | undefined,
  defaultValue: D
): T | D => {
  return isUnd(targetValue) ? defaultValue : (targetValue as T);
};

/**
 * Gets a value from a function or returns the value directly
 *
 * @template T
 * @param {T | ((target: any, index: number, total: number) => T)} value - Value or function returning a value
 * @param {any} target - Target element
 * @param {number} index - Index of the target
 * @param {number} total - Total number of targets
 * @param {Record<string, any>} [store] - Optional store object to save function reference
 * @return {T} - The resolved value
 */
export const getFunctionValue = <T>(
  value: T | ((target: any, index: number, total: number) => T),
  target: any,
  index: number,
  total: number,
  store?: Record<string, any>
): T => {
  if (isFnc(value)) {
    const func = () => {
      const computed = (value as (target: any, index: number, total: number) => T)(target, index, total);
      // Fallback to 0 if the function returns undefined / NaN / null / false / 0
      return !isNaN(+computed) ? +computed : computed || 0;
    };
    if (store) {
      store.func = func;
    }
    return func() as T;
  } else {
    return value as T;
  }
};

/**
 * Determines the type of tween to use for a property
 *
 * @param {any} target - The target object
 * @param {string} prop - The property name
 * @return {number} - The determined tween type constant
 */
export const getTweenType = (target: any, prop: string): number => {
  return !target[isDomSymbol]
    ? tweenTypes.OBJECT
    : // Handle SVG attributes
    target[isSvgSymbol] && isValidSVGAttribute(target, prop)
    ? tweenTypes.ATTRIBUTE
    : // Handle CSS Transform properties differently than CSS to allow individual animations
    validTransforms.includes(prop) || shortTransforms.get(prop)
    ? tweenTypes.TRANSFORM
    : // CSS variables
    stringStartsWith(prop, "--")
    ? tweenTypes.CSS_VAR
    : // All other CSS properties
    prop in target.style
    ? tweenTypes.CSS
    : // Handle other DOM Attributes
    prop in target
    ? tweenTypes.OBJECT
    : tweenTypes.ATTRIBUTE;
};

/**
 * Gets the CSS value of a property
 *
 * @param {any} target - Target element
 * @param {string} propName - Property name
 * @param {Record<string, any> | null} [animationInlineStyles] - Optional object to store inline styles
 * @return {string} - CSS value
 */
const getCSSValue = (
  target: any,
  propName: string,
  animationInlineStyles?: Record<string, any> | null
): string => {
  const inlineStyles = target.style[propName];
  // Only store the inline style if it exists and we have a storage object
  if (inlineStyles && animationInlineStyles) {
    // If animationInlineStyles is an empty object reference, initialize it now
    if (animationInlineStyles === null) {
      animationInlineStyles = {};
    }
    animationInlineStyles[propName] = inlineStyles;
  }
  const value =
    inlineStyles ||
    getComputedStyle(target[proxyTargetSymbol] || target).getPropertyValue(
      propName
    );
  return value === "auto" ? "0" : value;
};

/**
 * Gets the original value of a property before animation
 *
 * @param {any} target - Target element
 * @param {string} propName - Property name
 * @param {number} [tweenType] - Type of tween from tweenTypes constants
 * @param {Record<string, any> | null} [animationInlineStyles] - Optional object to store inline styles
 * @return {string|number} - Original value
 */
export const getOriginalAnimatableValue = (
  target: any,
  propName: string,
  tweenType?: number,
  animationInlineStyles?: Record<string, any> | null
): string | number => {
  const type = !isUnd(tweenType) ? tweenType : getTweenType(target, propName);
  return type === tweenTypes.OBJECT
    ? target[propName] || 0
    : type === tweenTypes.ATTRIBUTE
    ? target.getAttribute(propName)
    : type === tweenTypes.TRANSFORM
    ? parseInlineTransforms(
        target,
        propName,
        animationInlineStyles || undefined
      )
    : type === tweenTypes.CSS_VAR
    ? getCSSValue(target, propName, animationInlineStyles).trimStart()
    : getCSSValue(target, propName, animationInlineStyles);
};

/**
 * Calculates a relative value based on an operator
 *
 * @param {number} x - Base value
 * @param {number} y - Value to combine
 * @param {string} operator - Operator to use (+, -, *)
 * @return {number} - Calculated value
 */
export const getRelativeValue = (
  x: number,
  y: number,
  operator: string
): number => {
  return operator === "-" ? x - y : operator === "+" ? x + y : x * y;
};

/**
 * Creates a new target object for decomposed values
 *
 * @return {any} - Empty target object with default values
 */
export const createDecomposedValueTargetObject = (): { t: number; n: number; u: string | null; o: string | null; d: number[] | null; s: string[] | null } => {
  return {
    t: valueTypes.NUMBER,
    n: 0,
    u: null,
    o: null,
    d: null,
    s: null,
  };
};

/**
 * Decomposes a raw value into its components
 *
 * @param {string|number} rawValue - Value to decompose
 * @param {any} targetObject - Target object to store decomposed values
 * @return {any} - Target object with decomposed values
 */
export const decomposeRawValue = (
  rawValue: string | number,
  targetObject: any
): any => {
  targetObject.t = valueTypes.NUMBER;
  targetObject.n = 0;
  targetObject.u = null;
  targetObject.o = null;
  targetObject.d = null;
  targetObject.s = null;
  if (!rawValue && rawValue !== 0) return targetObject;
  
  // Handle numeric values first
  if (typeof rawValue === 'number') {
    targetObject.n = rawValue;
    return targetObject;
  }
  
  const num = +rawValue;
  if (!isNaN(num)) {
    // It's a number
    targetObject.n = num;
    return targetObject;
  } else {
    let str = String(rawValue); // Ensure we have a string
    // Parsing operators (+=, -=, *=) manually is much faster than using regex here
    if (str[1] === "=") {
      targetObject.o = str[0];
      str = str.slice(2);
    }
    // Skip exec regex if the value type is complex or color to avoid long regex backtracking
    const unitMatch = str.includes(" ") ? false : unitsExecRgx.exec(str);
    if (unitMatch) {
      // Has a number and a unit
      targetObject.t = valueTypes.UNIT;
      targetObject.n = +unitMatch[1];
      targetObject.u = unitMatch[2];
      return targetObject;
    } else if (targetObject.o) {
      // Has an operator (+=, -=, *=)
      targetObject.n = +str;
      return targetObject;
    } else if (isCol(str)) {
      // Is a color
      targetObject.t = valueTypes.COLOR;
      targetObject.d = convertColorStringValuesToRgbaArray(str);
      return targetObject;
    } else {
      // Is a more complex string (generally svg coords, calc() or filters CSS values)
      const matchedNumbers = str.match(digitWithExponentRgx);
      targetObject.t = valueTypes.COMPLEX;
      targetObject.d = matchedNumbers ? matchedNumbers.map(Number) : [];
      targetObject.s = str.split(digitWithExponentRgx) || [];
      return targetObject;
    }
  }
};

/**
 * Decomposes a tween value into a target object
 *
 * @param {any} tween - Tween to decompose
 * @param {any} targetObject - Target object to store decomposed values
 * @return {any} - Target object with decomposed values
 */
export const decomposeTweenValue = (tween: any, targetObject: any): any => {
  targetObject.t = tween._valueType;
  targetObject.n = tween._toNumber;
  targetObject.u = tween._unit;
  targetObject.o = null;
  targetObject.d = cloneArray(tween._toNumbers);
  targetObject.s = cloneArray(tween._strings);
  return targetObject;
};

export const decomposedOriginalValue: { t: number; n: number; u: string | null; o: string | null; d: number[] | null; s: string[] | null } = createDecomposedValueTargetObject();
