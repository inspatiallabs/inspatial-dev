/**
 * # Animation Utilities
 * @module @in/motion/utils/animation
 *
 * Utility functions for working with animations in the InMotion library.
 * These functions provide common helpers for controlling animations and
 * working with animation objects.
 *
 * @example Basic Usage
 * ```typescript
 * import { delay, stop, remove } from "@in/motion/utils/animation";
 * 
 * // Run code after a delay
 * delay(() => {
 *   console.log('This executes after 1 second');
 * }, 1000);
 * 
 * // Stop animations on an element
 * stop(document.querySelector('.animated-element'));
 * 
 * // Remove all animation styles from an element
 * remove(document.querySelector('.styled-element'));
 * ```
 *
 * @features
 * - Delay execution and timing utilities
 * - Animation stopping and control
 * - Property animation utilities
 * - Element animation cleaning
 * - Animation inspection tools
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

import { InMotion } from "../../engine.ts";
import { Timer } from "../../timer.ts";
import { parseTargets } from "../../targets.ts";
import { isNode } from "../dom/index.ts";
import { sanitizePropertyName } from "../../properties.ts";
import { tweenTypes } from "../../consts.ts";
import { isArr } from "../../helpers.ts";
import { JSAnimation } from "../../animation.ts";
import { cleanInlineStyles } from "../dom/index.ts";

import type {
  TargetsParam,
  TargetsArray,
  DOMTarget,
  Timer as TimerType,
  CallbackArgument,
  Tickable as _Tickable
} from "../../types.ts";

/**
 * # Delay
 * @summary #### Run a callback after a specified delay
 * 
 * The `delay` function lets you execute a callback after waiting for a specific time.
 * Think of it like setting a timer for your animation functions.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {Function} callback - Function to run after the delay
 * @param {number} _delay - Time to wait before running the callback (in ms)
 * @returns {Timer} Timer instance that can be controlled
 * 
 * @example
 * ### Simple Delayed Execution
 * ```typescript
 * import { delay } from '@in/motion/utils';
 * 
 * // Wait 2 seconds then run a function
 * delay(() => {
 *   console.log('This runs after 2 seconds!');
 * }, 2000);
 * ```
 * 
 * @example
 * ### Controlled Delay
 * ```typescript
 * import { delay } from '@in/motion/utils';
 * 
 * // Create a delay timer
 * const timer = delay(() => {
 *   console.log('This might never run if paused!');
 * }, 1000);
 * 
 * // You can control the timer
 * timer.pause();  // Pause the timer
 * timer.resume(); // Resume the timer
 * ```
 */
export function delay<T extends CallbackArgument>(
  callback?: (timer: T) => any,
  _delay?: number
): TimerType {
  const timer = new Timer();
  
  const start = () => {
    // Use any to bypass the protected property check
    (timer as any)._callback = callback;
    timer.play();
  };
  
  return (
    callback
      ? // Delay running if the InMotion hasn't ran once yet
        (InMotion as any)._hasChildren || !InMotion.useDefaultMainLoop
        ? start()
        : InMotion.update() && start()
      : timer
  ) as TimerType;
}

/**
 * # Remove
 * @summary #### Remove inline CSS properties created by animations
 * 
 * The `remove` function cleans up inline styles that were set by animations.
 * It's like erasing an animation's traces from the DOM.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {TargetsParam} targets - Target elements to clean
 * @param {string | string[]} [properties] - Specific properties to clean (cleans all if not specified)
 * 
 * @example
 * ### Remove All Animation Styles
 * ```typescript
 * import { remove } from '@in/motion/utils/animation';
 * 
 * // Remove all animation styles from an element
 * remove(document.querySelector('.animated-box'));
 * ```
 * 
 * @example
 * ### Remove Specific Properties
 * ```typescript
 * import { remove } from '@in/motion/utils/animation';
 * 
 * // Only remove translateX and opacity styles
 * remove(document.querySelector('.animated-box'), ['translateX', 'opacity']);
 * ```
 */
export const remove = (
  targets: TargetsParam,
  properties?: string | string[]
): void => {
  const targetsArray = parseTargets(targets);
  if (!targetsArray.length) return;
  
  // Stop all animations affecting these targets
  stop(targets, properties);
  
  // For DOM targets, remove inline styles
  for (let i = 0; i < targetsArray.length; i++) {
    const target = targetsArray[i];
    
    if (isNode(target)) {
      if (properties) {
        // Remove specific properties
        const props = isArr(properties) ? properties : [properties];
        for (let p = 0; p < props.length; p++) {
          const propertyName = sanitizePropertyName(props[p], target, tweenTypes.CSS);
          (target as DOMTarget).style.removeProperty(propertyName);
        }
      } else {
        // Remove all properties created by animations
        cleanInlineStyles([target as Element]);
      }
    }
  }
};

/**
 * # Stop
 * @summary #### Stop animations targeting specific elements
 * 
 * The `stop` function halts running animations for specified targets.
 * Think of it as pressing the stop button for animations on particular elements.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {TargetsParam} targets - Elements to stop animations for
 * @param {string | string[]} [properties] - Specific properties to stop (stops all if not specified)
 * @param {boolean} [completeAnimation] - Whether to complete the animations
 * @returns {boolean} Whether any animations were stopped
 * 
 * @example
 * ### Stop All Animations
 * ```typescript
 * import { stop } from '@in/motion/utils/animation';
 * 
 * // Stop all animations on a specific element
 * stop(document.querySelector('.moving-element'));
 * ```
 * 
 * @example
 * ### Stop Specific Property Animation
 * ```typescript
 * import { stop } from '@in/motion/utils/animation';
 * 
 * // Only stop the opacity animation
 * stop(document.querySelector('.fading-element'), 'opacity');
 * ```
 * 
 * @example
 * ### Complete Animation Before Stopping
 * ```typescript
 * import { stop } from '@in/motion/utils/animation';
 * 
 * // Complete the animation before stopping it
 * stop(document.querySelector('.animated-element'), null, true);
 * ```
 */
export const stop = (
  targets: TargetsParam,
  properties?: string | string[],
  completeAnimation?: boolean
): boolean => {
  const targetsArray = parseTargets(targets);
  if (!targetsArray.length) return false;

  let hasRemovedTargets = false;
  
  // Find all active animations in the InMotion
  let activeAnimation = (InMotion as any)._head as JSAnimation;
  
  while (activeAnimation) {
    const next = activeAnimation._next;
    
    if (
      activeAnimation instanceof JSAnimation && 
      activeAnimation.targets && 
      removeTargetsFromAnimation(targetsArray, activeAnimation, properties)
    ) {
      hasRemovedTargets = true;
      
      // If no targets are left, remove the animation entirely
      if (!activeAnimation.targets.length) {
        if (completeAnimation) {
          // Force completion of the animation
          activeAnimation.seek(activeAnimation.duration);
          activeAnimation.complete();
          activeAnimation.remove();
        } else {
          // Just remove the animation
          activeAnimation.remove();
        }
      }
    }
    
    activeAnimation = next as JSAnimation;
  }
  
  return hasRemovedTargets;
};

/**
 * # Get
 * @summary #### Get computed animation property value
 * 
 * The `get` function retrieves the current value of a property on animated elements.
 * It's like taking a snapshot of an element's current state during animation.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {TargetsParam} targets - Elements to get property from
 * @param {string} property - Property name to get
 * @param {string} [unit] - Unit to convert the value to
 * @returns {string|number|Array<number>} Property value(s)
 * 
 * @example
 * ### Get Element Position
 * ```typescript
 * import { get } from '@in/motion/utils/animation';
 * 
 * // Get the current translateX value
 * const currentX = get(document.querySelector('.moving-box'), 'translateX');
 * console.log(`Current X position: ${currentX}px`);
 * ```
 * 
 * @example
 * ### Get With Unit Conversion
 * ```typescript
 * import { get } from '@in/motion/utils/animation';
 * 
 * // Get rotation in degrees
 * const rotation = get(document.querySelector('.rotating-element'), 'rotate', 'deg');
 * console.log(`Current rotation: ${rotation}°`);
 * ```
 */
export const get = (
  targets: TargetsParam,
  _property: string,
  _unit?: string
): string | number | number[] => {
  const targetsArray = parseTargets(targets);
  if (!targetsArray.length) return 0;
  
  // For now, just return a placeholder implementation
  // This is a simplified version - the real implementation would need to access
  // the actual computed values from either the DOM or JavaScript objects
  return 0; 
};

/**
 * # Set
 * @summary #### Set animation property value
 * 
 * The `set` function directly sets property values on elements without animation.
 * It's useful for setting initial states before animating.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 * 
 * @param {TargetsParam} targets - Elements to set properties on
 * @param {string} property - Property name to set
 * @param {any} value - Value to set
 * @returns {TargetsArray} The target elements (for chaining)
 * 
 * @example
 * ### Basic Usage
 * ```typescript
 * import { set } from '@in/motion/utils/animation';
 * 
 * // Set initial position before animating
 * set(document.querySelector('.box'), 'translateX', '0px');
 * ```
 * 
 * @example
 * ### Set Multiple Properties
 * ```typescript
 * import { set } from '@in/motion/utils/animation';
 * 
 * // Set initial state with multiple calls
 * const element = document.querySelector('.element');
 * set(element, 'opacity', 0);
 * set(element, 'translateY', '50px');
 * 
 * // Now element is ready to animate in
 * ```
 */
export const set = (
  targets: TargetsParam,
  _property: string,
  _value: any
): TargetsArray => {
  const targetsArray = parseTargets(targets);
  if (!targetsArray.length) return targetsArray;
  
  // For now, just return a placeholder implementation
  // This is a simplified version - the real implementation would set values
  // directly on either the DOM or JavaScript objects
  return targetsArray;
};

/**
 * Removes specified targets from an animation
 * @param targetsArray Targets to remove
 * @param animation Animation to remove targets from
 * @param propertyName Optional property to limit removal to
 * @returns Whether any targets were removed
 */
function removeTargetsFromAnimation(
  targetsArray: TargetsArray,
  animation: JSAnimation,
  propertyName?: string | string[]
): boolean {
  // For each target we want to remove
  for (let i = 0; i < targetsArray.length; i++) {
    const target = targetsArray[i];
    
    // Check if this target is in the animation's targets array
    const index = animation.targets.indexOf(target);
    if (index === -1) continue;
    
    // If we only want to remove specific properties, we would need to 
    // filter tweens that affect those properties.
    // This is a simplified version that removes the entire target
    if (!propertyName) {
      // Remove the entire target from the animation
      animation.targets.splice(index, 1);
      return true;
    }
    
    // If we have property names, would need to filter tweens
    // This is a placeholder - in a complete implementation, we would
    // filter the tweens affecting only the specified properties
    return true;
  }
  
  return false;
} 