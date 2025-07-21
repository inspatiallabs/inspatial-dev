/**
 * # Math Utilities
 * @module @in/motion/utils/math
 *
 * Mathematical utility functions for the InMotion animation library.
 * These functions provide various calculations and transformations.
 *
 * @example Basic Usage
 * ```typescript
 * import { clamp, round, interpolate } from "@in/motion/utils/math";
 * 
 * // Limit a value between a min and max
 * const limitedValue = clamp(value, 0, 100);
 * 
 * // Round to a specific number of decimal places
 * const roundedValue = round(3.14159, 2); // 3.14
 * 
 * // Interpolate between two values
 * const midpoint = interpolate(0, 100, 0.5); // 50
 * ```
 *
 * @features
 * - Value clamping and normalization
 * - Rounding and decimal control
 * - Linear interpolation
 * - Value snapping and increments
 * - Math exportation with descriptive names
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

// Import core math constants and functions from helpers
import { 
  pow, sqrt, sin, cos, abs, exp, ceil, floor, 
  asin, max, atan2, PI, _round as mathRound 
} from "../../helpers.ts";

// Export basic math constants and functions
export {
  pow, sqrt, sin, cos, abs, exp, ceil, floor,
  asin, max, atan2, PI, mathRound
};

/**
 * # Clamp
 * @summary #### Limit a value between minimum and maximum bounds
 * 
 * The `clamp` function restricts a value to stay within a specified range.
 * If the value is below the minimum, it returns the minimum.
 * If it's above the maximum, it returns the maximum.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { clamp } from '@in/motion/utils/math';
 * 
 * clamp(150, 0, 100); // 100 (value exceeds max)
 * clamp(-10, 0, 100); // 0 (value below min)
 * clamp(50, 0, 100);  // 50 (value within range)
 * ```
 * 
 * @example
 * ### Normalizing User Input
 * ```typescript
 * import { clamp } from '@in/motion/utils/math';
 * 
 * function setVolume(level) {
 *   // Ensure volume level stays between 0 and 100
 *   const safeLevel = clamp(level, 0, 100);
 *   console.log(`Setting volume to: ${safeLevel}`);
 * }
 * 
 * setVolume(50);  // "Setting volume to: 50"
 * setVolume(150); // "Setting volume to: 100"
 * setVolume(-10); // "Setting volume to: 0"
 * ```
 */
export const clamp = (value: number, min: number, max: number): number => 
  (value < min) ? min : (value > max) ? max : value;

/**
 * # Round
 * @summary #### Round a number to specific decimal places
 * 
 * The `round` function rounds a number to a specified number of decimal places.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} value - Number to round
 * @param {number} [decimalLength=0] - Number of decimal places
 * @returns {number} Rounded value
 * 
 * @example
 * ### Basic Rounding
 * ```typescript
 * import { round } from '@in/motion/utils/math';
 * 
 * round(3.14159);     // 3 (default is 0 decimal places)
 * round(3.14159, 2);  // 3.14
 * round(3.14159, 4);  // 3.1416
 * ```
 * 
 * @example
 * ### Financial Calculations
 * ```typescript
 * import { round } from '@in/motion/utils/math';
 * 
 * // Calculate tax and round to 2 decimal places
 * const price = 19.99;
 * const taxRate = 0.0825; // 8.25%
 * const tax = round(price * taxRate, 2);
 * console.log(`Tax: $${tax}`); // "Tax: $1.65"
 * ```
 */
export const round = (value: number, decimalLength = 0): number => {
  const multiplier = pow(10, decimalLength);
  return mathRound(value * multiplier) / multiplier;
};

/**
 * # Snap
 * @summary #### Snap a value to the nearest increment
 * 
 * The `snap` function rounds a value to the nearest increment value.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} value - Value to snap
 * @param {number} increment - Increment to snap to
 * @returns {number} Snapped value
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { snap } from '@in/motion/utils/math';
 * 
 * snap(17, 5);  // 15 (nearest multiple of 5)
 * snap(18, 5);  // 20 (nearest multiple of 5)
 * snap(7.3, 2); // 8 (nearest multiple of 2)
 * ```
 * 
 * @example
 * ### Building a Grid System
 * ```typescript
 * import { snap } from '@in/motion/utils/math';
 * 
 * // Snap an element's position to a 10px grid
 * function snapToGrid(position) {
 *   const gridSize = 10;
 *   return {
 *     x: snap(position.x, gridSize),
 *     y: snap(position.y, gridSize)
 *   };
 * }
 * 
 * const position = { x: 23, y: 47 };
 * const snapped = snapToGrid(position);
 * console.log(snapped); // { x: 20, y: 50 }
 * ```
 */
export const snap = (value: number, increment: number): number =>
  mathRound(value / increment) * increment;

/**
 * # Interpolate
 * @summary #### Calculate a value between two points
 * 
 * The `interpolate` function calculates a value at a certain point between a start and end value,
 * based on a progress parameter (0-1).
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} progress - Progress between 0 and 1
 * @returns {number} Interpolated value
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { interpolate } from '@in/motion/utils/math';
 * 
 * interpolate(0, 100, 0);    // 0 (start)
 * interpolate(0, 100, 0.5);  // 50 (halfway)
 * interpolate(0, 100, 1);    // 100 (end)
 * interpolate(0, 100, 0.25); // 25 (quarter way)
 * ```
 * 
 * @example
 * ### Color Transition
 * ```typescript
 * import { interpolate } from '@in/motion/utils/math';
 * 
 * // Interpolate between two RGB colors
 * function interpolateColor(color1, color2, progress) {
 *   return {
 *     r: Math.round(interpolate(color1.r, color2.r, progress)),
 *     g: Math.round(interpolate(color1.g, color2.g, progress)),
 *     b: Math.round(interpolate(color1.b, color2.b, progress))
 *   };
 * }
 * 
 * const redColor = { r: 255, g: 0, b: 0 };
 * const blueColor = { r: 0, g: 0, b: 255 };
 * 
 * // Get the purple color halfway between red and blue
 * const purpleColor = interpolateColor(redColor, blueColor, 0.5);
 * console.log(purpleColor); // { r: 128, g: 0, b: 128 }
 * ```
 */
export const interpolate = (start: number, end: number, progress: number): number =>
  start + (end - start) * progress;

/**
 * # Normalize
 * @summary #### Convert a value from one range to 0-1
 * 
 * The `normalize` function converts a value from its original range to a normalized
 * range between 0 and 1.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum of the original range
 * @param {number} max - Maximum of the original range
 * @returns {number} Normalized value between 0 and 1
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { normalize } from '@in/motion/utils/math';
 * 
 * normalize(50, 0, 100);  // 0.5 (halfway between 0-100)
 * normalize(25, 0, 100);  // 0.25 (quarter way between 0-100)
 * normalize(5, 0, 10);    // 0.5 (halfway between 0-10)
 * ```
 */
export const normalize = (value: number, min: number, max: number): number => 
  (value - min) / (max - min);

/**
 * # MapRange
 * @summary #### Map a value from one range to another
 * 
 * The `mapRange` function converts a value from one range to another.
 * For example, converting a value from 0-1 to 0-100.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { mapRange } from '@in/motion/utils/math';
 * 
 * // Map a percentage (0-1) to a score (0-100)
 * mapRange(0.75, 0, 1, 0, 100); // 75
 * 
 * // Map temperature from Celsius (0-100) to Fahrenheit (32-212)
 * mapRange(25, 0, 100, 32, 212); // 77
 * ```
 * 
 * @example
 * ### Input Handling
 * ```typescript
 * import { mapRange } from '@in/motion/utils/math';
 * 
 * // Map scroll position to animation progress
 * function handleScroll(event) {
 *   const scrollHeight = document.body.scrollHeight - window.innerHeight;
 *   const scrollPosition = window.scrollY;
 *   
 *   // Map scroll position (0 to scrollHeight) to animation progress (0-1)
 *   const animationProgress = mapRange(scrollPosition, 0, scrollHeight, 0, 1);
 *   console.log(`Animation progress: ${animationProgress}`);
 * }
 * ```
 */
export const mapRange = (
  value: number, 
  inMin: number, 
  inMax: number, 
  outMin: number, 
  outMax: number
): number => {
  // First normalize to 0-1
  const normalized = normalize(value, inMin, inMax);
  // Then scale to output range
  return interpolate(outMin, outMax, normalized);
};

/**
 * # ClampInfinity
 * @summary #### Prevent overflow to infinity
 * 
 * The `clampInfinity` function prevents a value from reaching infinity
 * by setting a very large upper limit.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} value - Value to clamp
 * @returns {number} Value clamped to avoid infinity
 * 
 * @example
 * ### Preventing Overflow
 * ```typescript
 * import { clampInfinity } from '@in/motion/utils/math';
 * 
 * // Avoid very large values from calculations that might reach infinity
 * const result = clampInfinity(1e20); // Returns a very large but finite number
 * ```
 */
export const clampInfinity = (value: number): number => 
  value === Infinity ? Number.MAX_SAFE_INTEGER : value === -Infinity ? -Number.MAX_SAFE_INTEGER : value;

/**
 * # DegToRad
 * @summary #### Convert degrees to radians
 * 
 * The `degToRad` function converts an angle in degrees to radians.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { degToRad } from '@in/motion/utils/math';
 * 
 * degToRad(0);    // 0
 * degToRad(90);   // ~1.5708 (PI/2)
 * degToRad(180);  // ~3.1416 (PI)
 * degToRad(360);  // ~6.2832 (2*PI)
 * ```
 */
export const degToRad = (degrees: number): number => degrees * (PI / 180);

/**
 * # RadToDeg
 * @summary #### Convert radians to degrees
 * 
 * The `radToDeg` function converts an angle in radians to degrees.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { radToDeg } from '@in/motion/utils/math';
 * 
 * radToDeg(0);         // 0
 * radToDeg(Math.PI/2); // 90
 * radToDeg(Math.PI);   // 180
 * radToDeg(2*Math.PI); // 360
 * ```
 */
export const radToDeg = (radians: number): number => radians * (180 / PI);

/**
 * # NormalizeTime
 * @summary #### Normalize animation time to 0-1 range
 * 
 * The `normalizeTime` function converts an animation time value
 * to a normalized range between 0 and 1, useful for animation progress.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {number} time - Time value to normalize
 * @returns {number} Normalized time between 0 and 1
 * 
 * @example
 * ### Animation Progress
 * ```typescript
 * import { normalizeTime } from '@in/motion/utils/math';
 * 
 * // Track animation progress
 * function updateAnimation(currentTime, duration) {
 *   const progress = normalizeTime(currentTime / duration);
 *   console.log(`Animation progress: ${Math.round(progress * 100)}%`);
 * }
 * 
 * updateAnimation(500, 2000); // "Animation progress: 25%"
 * ```
 */
export const normalizeTime = (time: number): number => {
  if (isNaN(time)) {
    return 0;
  }
  return clamp(time, 0, 1);
};

/**
 * Alternative function names for backward compatibility and readability
 */
export {
  clamp as limit,
  normalize as norm,
  interpolate as lerp,
  mapRange as map,
  degToRad as toRadians,
  radToDeg as toDegrees
}; 