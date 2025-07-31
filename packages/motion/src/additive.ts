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


import { minValue, noop, valueTypes, tickModes } from "./consts.ts";
import { cloneArray, addChild } from "./helpers.ts";
import { render } from "./render.ts";
import { InMotion } from "./engine.ts";
import { Timer } from "./timer.ts";
import type {
  TweenAdditiveLookups,
  TweenLookups,
  Renderable,
} from "./types.ts";

/**
 * # Additive Animation System
 * @summary Enables multiple animations to stack on the same properties
 *
 * The additive animation system allows for composing multiple animations
 * affecting the same property, adding their effects together rather than
 * replacing each other.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

/**
 * AdditiveAnimation class for managing additive animations as a regular high-priority animation
 */
class AdditiveAnimation extends Timer {
  /** Collection of tween lookups for property animations */
  private _lookups: TweenAdditiveLookups;

  /**
   * Creates a new AdditiveAnimation instance
   * @param lookups - Collection of tween lookups for property animations
   */
  constructor(lookups: TweenAdditiveLookups) {
    super({
      duration: minValue,
      autoplay: true,
      onUpdate: () => this.processAdditiveTweens(),
    });

    this._lookups = lookups;
    this._offset = 0;
    this._delay = 0;
    this._head = null;
    this._tail = null;

    // Add to InMotion with highest priority (as first child)
    // Using type assertions to handle protected property access across classes
    const InMotionAny = InMotion as any;
    if (InMotionAny._head) {
      (this as any)._next = InMotionAny._head;
      InMotionAny._head._prev = this;
      InMotionAny._head = this;
    } else {
      addChild(InMotionAny, this as unknown as Renderable);
    }
  }

  /**
   * Process all additive tweens by summing their values
   */
  public processAdditiveTweens(): void {
    this._lookups.forEach((propertyAnimation: TweenLookups) => {
      for (const propertyName in propertyAnimation) {
        const tweens = propertyAnimation[propertyName];
        const lookupTween = tweens._head;

        if (lookupTween) {
          const valueType = lookupTween._valueType;
          const additiveValues =
            valueType === valueTypes.COMPLEX || valueType === valueTypes.COLOR
              ? cloneArray(lookupTween._fromNumbers)
              : null;
          let additiveValue = lookupTween._fromNumber;
          let tween = tweens._tail;

          while (tween && tween !== lookupTween) {
            if (additiveValues) {
              for (let i = 0, l = tween._numbers.length; i < l; i++)
                additiveValues[i] += tween._numbers[i];
            } else {
              additiveValue += tween._number;
            }
            tween = tween._prevAdd;
          }

          lookupTween._toNumber = additiveValue;
          lookupTween._toNumbers = additiveValues || [];

          // This is now part of the regular animation system
          render(this as any, 1, 1, 0, tickModes.FORCE);
        }
      }
    });
  }
}

/**
 * Global additive animation instance and update function
 */
export const additive: {
  animation: AdditiveAnimation | null;
  update: () => void;
} = {
  animation: null,
  update: noop,
};

/**
 * Adds a new additive animation to the InMotion
 *
 * @param lookups - Collection of tween lookups for property animations
 * @returns The additive animation object
 */
export const addAdditiveAnimation = (
  lookups: TweenAdditiveLookups
): AdditiveAnimation => {
  if (!additive.animation) {
    const animation = new AdditiveAnimation(lookups);
    additive.animation = animation;
    // Update the global update function to use the new animation system
    additive.update = animation.processAdditiveTweens.bind(animation);
  }
  return additive.animation;
};
