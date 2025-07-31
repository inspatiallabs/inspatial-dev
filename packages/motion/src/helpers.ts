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
  isBrowser,
  lowerCaseRgx,
  hexTestRgx,
  maxValue,
  minValue,
} from "./consts.ts";

import { globals } from "./globals.ts";

// Strings

/**
 * @param  {String} str
 * @return {String}
 */
export const toLowerCase = (str: string): string =>
  str.replace(lowerCaseRgx, "$1-$2").toLowerCase();

/**
 * Prioritize this method instead of regex when possible
 * @param  {String} str
 * @param  {String} sub
 * @return {Boolean}
 */
export const stringStartsWith = (str: string, sub: string): boolean => str.indexOf(sub) === 0;

// Time
// Note: Date.now is used instead of performance.now since it is precise enough for timings calculations, performs slightly faster and works in Node.js environement.
export const now = Date.now;

// Types checkers

export const isArr = Array.isArray;
/**@param {any} a @return {a is Record<String, any>} */
export const isObj = (a: any): a is Record<string, any> => a && a.constructor === Object;
/**@param {any} a @return {a is Number} */
export const isNum = (a: any): a is number => typeof a === "number" && !isNaN(a);
/**@param {any} a @return {a is String} */
export const isStr = (a: any): a is string => typeof a === "string";
/**@param {any} a @return {a is (...args: any[]) => any} */
export const isFnc = (a: any): a is (...args: any[]) => any => typeof a === "function";
/**@param {any} a @return {a is undefined} */
export const isUnd = (a: any): a is undefined => typeof a === "undefined";
/**@param {any} a @return {a is null | undefined} */
export const isNil = (a: any): a is null | undefined => isUnd(a) || a === null;
/**@param {any} a @return {a is SVGElement} */
export const isSvg = (a: any): a is SVGElement => isBrowser && a instanceof SVGElement;
/**@param {any} a @return {Boolean} */
export const isHex = (a: any): boolean => hexTestRgx.test(a);
/**@param {any} a @return {Boolean} */
export const isRgb = (a: any): boolean => stringStartsWith(a, "rgb");
/**@param {any} a @return {Boolean} */
export const isHsl = (a: any): boolean => stringStartsWith(a, "hsl");
/**@param {any} a @return {Boolean} */
export const isCol = (a: any): boolean => isHex(a) || isRgb(a) || isHsl(a);
/**@param {any} a @return {Boolean} */
export const isKey = (a: any): boolean => !Object.prototype.hasOwnProperty.call(globals.defaults, a);
/**@param {any} a @return {Boolean} */
export const isDefined = (a: any): boolean => !isUnd(a) && a !== null;

// Number

/**
 * @param  {Number|String} str
 * @return {Number}
 */
export const parseNumber = (str: number | string): number =>
  isStr(str)
    ? parseFloat(/** @type {String} */ str)
    : /** @type {Number} */ str;

// Math

export const pow = Math.pow;
export const sqrt = Math.sqrt;
export const sin = Math.sin;
export const cos = Math.cos;
export const abs = Math.abs;
export const exp = Math.exp;
export const ceil = Math.ceil;
export const floor = Math.floor;
export const asin = Math.asin;
export const max = Math.max;
export const atan2 = Math.atan2;
export const PI = Math.PI;
export const _round = Math.round;

/**
 * @param  {Number} v
 * @param  {Number} min
 * @param  {Number} max
 * @return {Number}
 */
export const clamp = (v: number, min: number, max: number): number => (v < min ? min : v > max ? max : v);

const powCache: Record<number, number> = {};

/**
 * @param  {Number} v
 * @param  {Number} decimalLength
 * @return {Number}
 */
export const round = (v: number, decimalLength: number): number => {
  if (decimalLength < 0) return v;
  if (!decimalLength) return _round(v);
  let p = powCache[decimalLength];
  if (!p) p = powCache[decimalLength] = 10 ** decimalLength;
  return _round(v * p) / p;
};

/**
 * @param  {Number} v
 * @param  {Number|Array<Number>} increment
 * @return {Number}
 */
export const snap = (v: number, increment: number | number[]): number =>
  isArr(increment)
    ? increment.reduce((closest, cv) =>
        abs(cv - v) < abs(closest - v) ? cv : closest
      )
    : increment
    ? _round(v / increment) * increment
    : v;

/**
 * @param  {Number} start
 * @param  {Number} end
 * @param  {Number} progress
 * @return {Number}
 */
export const interpolate = (start: number, end: number, progress: number): number =>
  start + (end - start) * progress;

/**
 * @param  {Number} v
 * @return {Number}
 */
export const clampInfinity = (v: number): number =>
  v === Infinity ? maxValue : v === -Infinity ? -maxValue : v;

/**
 * @param  {Number} v
 * @return {Number}
 */
export const normalizeTime = (v: number): number =>
  v <= minValue ? minValue : clampInfinity(round(v, 11));

// Arrays

/**
 * @template T
 * @param {T | T[]} a
 * @return {T[]}
 */
export const cloneArray = <T>(a: T[] | T): T[] => (isArr(a) ? [...a] : [a] as unknown as T[]);

// Objects

/**
 * @template T
 * @template U
 * @param {T} o1
 * @param {U} o2
 * @return {T & U}
 */
export const mergeObjects = <T extends object, U extends object>(o1: T, o2: U): T & U => {
  const merged = /** @type {T & U} */ { ...o1 } as T & U;
  for (const p in o2) {
    const o1p = /** @type {T & U} */ (o1 as any)[p];
    merged[p] = isUnd(o1p) ? /** @type {T & U} */ (o2 as any)[p] : o1p;
  }
  return merged;
};

// Linked lists

/**
 * @param {Object} parent
 * @param {Function} callback
 * @param {Boolean} [reverse]
 * @param {String} [prevProp]
 * @param {String} [nextProp]
 * @return {void}
 */
export const forEachChildren = (
  parent: { _head: any; _tail: any },
  callback: (item: any) => void,
  reverse?: boolean,
  prevProp = "_prev",
  nextProp = "_next"
): void => {
  let next = parent._head;
  let adjustedNextProp = nextProp;
  if (reverse) {
    next = parent._tail;
    adjustedNextProp = prevProp;
  }
  while (next) {
    const currentNext = next[adjustedNextProp];
    callback(next);
    next = currentNext;
  }
};

/**
 * @param  {Object} parent
 * @param  {Object} child
 * @param  {String} [prevProp]
 * @param  {String} [nextProp]
 * @return {void}
 */
export const removeChild = (
  parent: { _head: any; _tail: any },
  child: { [key: string]: any },
  prevProp = "_prev",
  nextProp = "_next"
): void => {
  const prev = child[prevProp];
  const next = child[nextProp];
  prev ? (prev[nextProp] = next) : (parent._head = next);
  next ? (next[prevProp] = prev) : (parent._tail = prev);
  child[prevProp] = null;
  child[nextProp] = null;
};

/**
 * @param  {Object} parent
 * @param  {Object} child
 * @param  {Function} [sortMethod]
 * @param  {String} prevProp
 * @param  {String} nextProp
 * @return {void}
 */
export const addChild = (
  parent: { _head: any; _tail: any },
  child: { [key: string]: any },
  sortMethod?: (prev: any, child: any) => boolean,
  prevProp = "_prev",
  nextProp = "_next"
): void => {
  let prev = parent._tail;
  while (prev && sortMethod && sortMethod(prev, child)) prev = prev[prevProp];
  const next = prev ? prev[nextProp] : parent._head;
  prev ? (prev[nextProp] = child) : (parent._head = child);
  next ? (next[prevProp] = child) : (parent._tail = child);
  child[prevProp] = prev;
  child[nextProp] = next;
};

// Color

/**
 * Converts a CSS color string to RGB values
 * @param {string} str - CSS color value 
 * @return {number[]} - RGB values as [r, g, b]
 */
export const toRgb = (str: string): number[] => {
  // For hex colors
  if (isHex(str)) {
    const hex = str.slice(1);
    const bigint = parseInt(hex.length === 3 ? 
      hex.split('').map(n => n + n).join('') : hex, 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255
    ];
  }
  
  // For rgb colors
  if (isRgb(str)) {
    return str.replace(/[^\d,]/g, '').split(',').map(n => parseInt(n));
  }
  
  // Default fallback
  return [0, 0, 0];
}; 