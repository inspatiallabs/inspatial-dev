/**
 * # DOM Utilities
 * @module @in/motion/utils/dom
 *
 * DOM manipulation and query utilities for the InMotion animation library.
 * These functions help with selecting, modifying, and managing DOM elements.
 *
 * @example Basic Usage
 * ```typescript
 * import { $, isNode } from "@in/motion/utils/dom";
 * 
 * // Select elements with a CSS selector
 * const elements = $('.my-class');
 * 
 * // Check if something is a DOM node
 * if (isNode(element)) {
 *   // Do something with the node
 * }
 * ```
 *
 * @features
 * - DOM element selection and filtering
 * - Type checking for DOM elements
 * - CSS property manipulation
 * - Element attribute handling
 * - Style management
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

import { globals as _globals } from "../../globals.ts";
import { isStr, isArr as _isArr } from "../../helpers.ts";
import { doc } from "../../consts.ts";

/**
 * # IsNode
 * @summary #### Check if a value is a DOM node
 * 
 * The `isNode` function checks if a value is a DOM node by verifying
 * its nodeType and nodeName properties.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {any} target - The value to check
 * @returns {boolean} True if the target is a DOM node
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { isNode } from '@in/motion/utils/dom';
 * 
 * const div = document.createElement('div');
 * console.log(isNode(div)); // true
 * 
 * console.log(isNode({})); // false
 * console.log(isNode('string')); // false
 * ```
 */
export const isNode = (target: any): boolean => 
  target && 
  typeof target === 'object' && 
  typeof target.nodeType === 'number' &&
  typeof target.nodeName === 'string';

/**
 * # $
 * @summary #### Select DOM elements with a CSS selector
 * 
 * The `$` function is a shorthand for querySelector/querySelectorAll.
 * It returns an array of matched elements for easy iteration.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {string} selector - CSS selector to query
 * @param {Document|Element} [context] - Element to query within
 * @returns {Array<Element>} Array of matched elements
 * 
 * @example
 * ### Basic Selection
 * ```typescript
 * import { $ } from '@in/motion/utils/dom';
 * 
 * // Select all paragraphs
 * const paragraphs = $('p');
 * 
 * // Select elements with a specific class
 * const elements = $('.my-class');
 * 
 * // Select within a specific container
 * const container = document.getElementById('container');
 * const childItems = $('li', container);
 * ```
 */
export const $ = (selector: string, context?: Document | Element): Element[] => {
  const queryContext = context || (doc as Document);
  if (!queryContext) return [];
  
  return Array.prototype.slice.call(
    queryContext.querySelectorAll(selector)
  );
};

/**
 * # GetNodeList
 * @summary #### Convert a target to a NodeList
 * 
 * The `getNodeList` function attempts to convert a string selector or 
 * other value into a NodeList of DOM elements.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {any} v - Target to convert (selector string or element)
 * @returns {NodeList|null} Resulting NodeList or null if conversion failed
 * 
 * @example
 * ### Convert Selector to NodeList
 * ```typescript
 * import { getNodeList } from '@in/motion/utils/dom';
 * 
 * const nodes = getNodeList('.my-class');
 * ```
 */
export const getNodeList = (v: any): NodeList | null => {
  if (isStr(v) && doc) {
    try {
      return (doc as Document).querySelectorAll(v);
    } catch(_e) {
      return null;
    }
  }
  return null;
};

/**
 * # CleanInlineStyles
 * @summary #### Remove inline styles from DOM elements
 * 
 * The `cleanInlineStyles` function removes animation-related inline styles
 * from DOM elements that were set during animations.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {Element[]} elements - DOM elements to clean
 * @returns {Element[]} The same elements for chaining
 * 
 * @example
 * ### Clean Animation Styles
 * ```typescript
 * import { cleanInlineStyles } from '@in/motion/utils/dom';
 * 
 * // Clean up styles after animation
 * const elements = document.querySelectorAll('.animated');
 * cleanInlineStyles(Array.from(elements));
 * ```
 */
export const cleanInlineStyles = (elements: Element[]): Element[] => {
  if (!elements.length) return elements;
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLElement;
    if (isNode(el) && el.style) {
      el.style.cssText = '';
    }
  }
  
  return elements;
};

// Re-export additional DOM-related functions
export { isNode as isDOM };
export { $ as selectElements };
export { getNodeList as queryNodes };
export { cleanInlineStyles as resetStyles }; 

// Export the new target value utilities
export { getTargetValue, setTargetValues } from "./target-values.ts"; 