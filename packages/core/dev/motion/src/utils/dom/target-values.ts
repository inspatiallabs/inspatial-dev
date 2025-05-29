/**
 * # Target Value Utilities
 * @module @in/motion/utils/dom/target-values
 *
 * Utility functions for getting and setting values on DOM elements or JavaScript objects.
 * These functions provide a consistent interface for working with different target types.
 *
 * @example Basic Usage
 * ```typescript
 * import { getTargetValue, setTargetValues } from "@in/motion/utils/dom/target-values";
 *
 * // Get a computed style property from an element
 * const opacity = getTargetValue(element, 'opacity');
 *
 * // Set multiple style properties on an element
 * setTargetValues(element, {
 *   opacity: 0.5,
 *   translateX: '20px'
 * });
 * ```
 *
 * @features
 * - Get computed style values from DOM elements
 * - Get property values from JavaScript objects
 * - Set multiple style properties on DOM elements
 * - Set multiple property values on JavaScript objects
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

import { isObj } from "../../helpers.ts";
import { isNode } from "../dom/index.ts";
import { doc as _doc, win } from "../../consts.ts";
import type { DOMTarget } from "../../types.ts";

// Define a generic object type
type GenericObject = Record<string, any>;

/**
 * # GetTargetValue
 * @summary #### Gets a value from a DOM element or JavaScript object
 *
 * The `getTargetValue` function retrieves a property value from either a DOM element's
 * computed style or a JavaScript object property. This creates a consistent
 * interface regardless of target type.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 *
 * @param {any} target - DOM element or JavaScript object
 * @param {string} property - Property name to retrieve
 * @param {any} [defaultValue=undefined] - Default value if property doesn't exist
 * @returns {any} The property value or defaultValue if not found
 *
 * @example
 * ### Get DOM Element Style
 * ```typescript
 * import { getTargetValue } from '@in/motion/utils/dom/target-values';
 *
 * // Get the computed opacity of an element
 * const element = document.querySelector('.fade-in');
 * const opacity = getTargetValue(element, 'opacity');
 * console.log(`Current opacity: ${opacity}`);
 * ```
 *
 * @example
 * ### Get Object Property
 * ```typescript
 * import { getTargetValue } from '@in/motion/utils/dom/target-values';
 *
 * // Get a property from a JavaScript object
 * const position = { x: 100, y: 200 };
 * const xPos = getTargetValue(position, 'x');
 * console.log(`X position: ${xPos}`);
 * ```
 *
 * @example
 * ### With Default Value
 * ```typescript
 * import { getTargetValue } from '@in/motion/utils/dom/target-values';
 *
 * // Provide a default if property doesn't exist
 * const config = { timeout: 1000 };
 * const retries = getTargetValue(config, 'retries', 3);
 * console.log(`Retries: ${retries}`); // Outputs: "Retries: 3"
 * ```
 */
export function getTargetValue(
  target: any,
  property: string,
  defaultValue?: any
): any {
  // Handle DOM elements
  if (isNode(target)) {
    try {
      // Try to get computed style first
      const computedStyle = (win || window).getComputedStyle(target as Element);
      let value = computedStyle.getPropertyValue(property);

      // If property doesn't exist in computed style, try getting it directly
      if (!value && property in (target as Element)) {
        value = (target as any)[property];
      }

      return value !== undefined && value !== "" ? value : defaultValue;
    } catch (_e) {
      // Fallback to default if any error occurs
      return defaultValue;
    }
  }

  // Handle JavaScript objects
  if (isObj(target) && property in target) {
    return (target as GenericObject)[property];
  }

  return defaultValue;
}

/**
 * # SetTargetValues
 * @summary #### Sets multiple values on a DOM element or JavaScript object
 *
 * The `setTargetValues` function sets multiple property values on either a DOM element
 * or a JavaScript object at once. It provides a consistent interface for setting
 * values regardless of the target type.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 *
 * @param {any} target - DOM element or JavaScript object
 * @param {GenericObject} values - Object mapping property names to values
 * @returns {any} The target (for chaining)
 *
 * @example
 * ### Set DOM Element Styles
 * ```typescript
 * import { setTargetValues } from '@in/motion/utils/dom/target-values';
 *
 * // Set multiple styles on an element
 * const element = document.querySelector('.animated-box');
 * setTargetValues(element, {
 *   'opacity': 0.8,
 *   'transform': 'translateX(20px)',
 *   'background-color': 'red'
 * });
 * ```
 *
 * @example
 * ### Set Object Properties
 * ```typescript
 * import { setTargetValues } from '@in/motion/utils/dom/target-values';
 *
 * // Set multiple properties on a JavaScript object
 * const position = { x: 0, y: 0 };
 * setTargetValues(position, {
 *   x: 100,
 *   y: 200,
 *   z: 50  // Add new property
 * });
 * console.log(position); // { x: 100, y: 200, z: 50 }
 * ```
 */
export function setTargetValues(target: any, values: GenericObject): any {
  if (!target || !isObj(values)) return target;

  // Store original values for potential revert functionality
  const originalValues: GenericObject = {};

  // Handle DOM elements
  if (isNode(target)) {
    const element = target as DOMTarget;

    for (const property in values) {
      if (Object.prototype.hasOwnProperty.call(values, property)) {
        const value = values[property];

        // Store original value before changing
        if (property in element.style) {
          originalValues[property] = element.style[property as any];
          element.style[property as any] = value;
        } else {
          // For other properties, set directly
          try {
            originalValues[property] = (element as any)[property];
            (element as any)[property] = value;
          } catch (_e) {
            // Ignore errors for properties that can't be set
          }
        }
      }
    }
  } else if (isObj(target)) {
    // Handle JavaScript objects
    for (const property in values) {
      if (Object.prototype.hasOwnProperty.call(values, property)) {
        originalValues[property] = (target as GenericObject)[property];
        (target as GenericObject)[property] = values[property];
      }
    }
  }

  // Return a JSAnimation-like object with revert functionality
  return {
    revert() {
      // Restore original values
      if (isNode(target)) {
        const element = target as DOMTarget;
        for (const property in originalValues) {
          if (property in element.style) {
            element.style[property as any] = originalValues[property];
          } else {
            try {
              (element as any)[property] = originalValues[property];
            } catch (_e) {
              // Ignore errors
            }
          }
        }
      } else if (isObj(target)) {
        for (const property in originalValues) {
          (target as GenericObject)[property] = originalValues[property];
        }
      }
      return this;
    },
    // Add other JSAnimation-like properties for compatibility
    duration: 0,
    progress: 0,
    isActive: false,
    isComplete: true,
    // Add methods that might be called
    pause() {
      return this;
    },
    play() {
      return this;
    },
    cancel() {
      return this;
    },
    finish() {
      return this;
    },
  };
}
