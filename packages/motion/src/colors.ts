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
  rgbExecRgx,
  rgbaExecRgx,
  hslExecRgx,
  hslaExecRgx,
} from './consts.ts'

import {
  round,
  isRgb,
  isHex,
  isHsl,
  isUnd,
} from './helpers.ts';

import type { ColorArray } from './types.ts';

/**
 * # RGB to RGBA Converter
 * @summary Converts RGB/RGBA string values to color array
 * 
 * Parses RGB and RGBA color strings and converts them to a normalized
 * array of RGBA values for animation purposes.
 * 
 * @param rgbValue - RGB or RGBA color string (e.g., "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)")
 * @returns Array of [r, g, b, a] values with alpha normalized to 0-1
 */
const rgbToRgba = (rgbValue: string): ColorArray => {
  const rgba = rgbExecRgx.exec(rgbValue) || rgbaExecRgx.exec(rgbValue);
  if (!rgba) return [0, 0, 0, 1];
  
  const a = !isUnd(rgba[4]) ? +rgba[4] : 1;
  return [
    +rgba[1],
    +rgba[2],
    +rgba[3],
    a
  ];
};

/**
 * # HEX to RGBA Converter
 * @summary Converts hexadecimal color strings to RGBA values
 * 
 * Handles 3-digit hex (#RGB), 4-digit hex (#RGBA), 6-digit hex (#RRGGBB),
 * and 8-digit hex (#RRGGBBAA) formats and converts to normalized RGBA values.
 * 
 * @param hexValue - Hex color string (e.g., "#f00" or "#ff0000")
 * @returns Array of [r, g, b, a] values with alpha normalized to 0-1
 */
const hexToRgba = (hexValue: string): ColorArray => {
  const hexLength = hexValue.length;
  const isShort = hexLength === 4 || hexLength === 5;
  return [
    +('0x' + hexValue[1] + hexValue[isShort ? 1 : 2]),
    +('0x' + hexValue[isShort ? 2 : 3] + hexValue[isShort ? 2 : 4]),
    +('0x' + hexValue[isShort ? 3 : 5] + hexValue[isShort ? 3 : 6]),
    ((hexLength === 5 || hexLength === 9) ? +(+('0x' + hexValue[isShort ? 4 : 7] + hexValue[isShort ? 4 : 8]) / 255).toFixed(3) : 1)
  ];
};

/**
 * # Hue to RGB Converter
 * @summary Helper for HSL to RGB conversion
 * 
 * Converts a hue component and associated values to an RGB component
 * using standard HSL to RGB conversion algorithm.
 * 
 * @param p - First intermediate value
 * @param q - Second intermediate value
 * @param t - Hue-based input value
 * @returns RGB component value
 */
const hue2rgb = (p: number, q: number, t: number): number => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  return t < 1 / 6 ? p + (q - p) * 6 * t :
         t < 1 / 2 ? q :
         t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 :
         p;
};

/**
 * # HSL to RGBA Converter
 * @summary Converts HSL/HSLA string values to RGBA values
 * 
 * Parses HSL and HSLA color strings and converts them to a normalized
 * array of RGBA values using standard color space conversion.
 * 
 * @param hslValue - HSL or HSLA color string (e.g., "hsl(0, 100%, 50%)")
 * @returns Array of [r, g, b, a] values with alpha normalized to 0-1
 */
const hslToRgba = (hslValue: string): ColorArray => {
  const hsla = hslExecRgx.exec(hslValue) || hslaExecRgx.exec(hslValue);
  if (!hsla) return [0, 0, 0, 1];
  
  const h = +hsla[1] / 360;
  const s = +hsla[2] / 100;
  const l = +hsla[3] / 100;
  const a = !isUnd(hsla[4]) ? +hsla[4] : 1;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < .5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = round(hue2rgb(p, q, h + 1 / 3) * 255, 0);
    g = round(hue2rgb(p, q, h) * 255, 0);
    b = round(hue2rgb(p, q, h - 1 / 3) * 255, 0);
  }
  return [r, g, b, a];
};

/**
 * # Color String to RGBA Array Converter
 * @summary Unified converter for various color formats to RGBA values
 * 
 * Takes any supported color string format (RGB, RGBA, HEX, HSL, HSLA) and 
 * converts it to a standardized RGBA values array for animation interpolation.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * 
 * @param colorString - Color string in any supported format
 * @returns Normalized RGBA values as [r, g, b, a] with components in appropriate ranges
 */
export const convertColorStringValuesToRgbaArray = (colorString: string): ColorArray => {
  return isRgb(colorString) ? rgbToRgba(colorString) :
         isHex(colorString) ? hexToRgba(colorString) :
         isHsl(colorString) ? hslToRgba(colorString) :
         [0, 0, 0, 1];
};
