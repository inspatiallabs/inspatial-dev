import { minValue, compositionTypes } from "./consts.ts";

import {
  cloneArray,
  addChild,
  removeChild,
  forEachChildren,
} from "./helpers.ts";

import { SafeLookupMap } from "@inspatial/util/safe-lookup-map";

import type {
  Target,
  Tween,
  TweenPropertySiblings,
  TweenLookups,
  TweenReplaceLookups,
  TweenAdditiveLookups,
} from "./types.ts";

// import { additive, addAdditiveAnimation } from "./additive.ts"; // Remove static import

const lookups: {
  _rep: SafeLookupMap<Target, TweenLookups>;
  _add: SafeLookupMap<Target, TweenLookups>;
} = {
  /** @type {SafeLookupMap<Target, TweenLookups>} */
  _rep: new SafeLookupMap(),
  /** @type {SafeLookupMap<Target, TweenLookups>} */
  _add: new SafeLookupMap(),
};

/**
 * # Get Tween Siblings
 * @summary Retrieves or creates a siblings collection for a target property
 *
 * This function manages collections of tweens that affect the same property
 * on the same target, allowing for proper composition and override behavior.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 *
 * @param {Target} target - The animation target
 * @param {string} property - The property name
 * @param {keyof typeof lookups} lookup - The lookup type ("_rep" or "_add")
 * @return {TweenPropertySiblings} The siblings collection
 */
export const getTweenSiblings = (
  target: Target,
  property: string,
  lookup: keyof typeof lookups = "_rep"
): TweenPropertySiblings => {
  const lookupMap = lookups[lookup];
  let targetLookup = lookupMap.get(target);
  if (!targetLookup) {
    targetLookup = {};
    lookupMap.set(target, targetLookup);
  }
  return targetLookup[property]
    ? targetLookup[property]
    : (targetLookup[property] = {
        _head: null,
        _tail: null,
      });
};

/**
 * # Add Tween Sort Method
 * @summary Determines sort order for tweens based on override status and start time
 *
 * @param {Tween} p - Previous tween
 * @param {Tween} c - Current tween
 * @return {boolean} Whether the previous tween should come after the current one
 */
const addTweenSortMethod = (p: Tween, c: Tween): boolean => {
  return !!p._isOverridden || p._absoluteStartTime > c._absoluteStartTime;
};

/**
 * # Override Tween
 * @summary Marks a tween as overridden and sets minimal duration
 *
 * @param {Tween} tween - The tween to override
 */
export const overrideTween = (tween: Tween): void => {
  tween._isOverlapped = 1;
  tween._isOverridden = 1;
  tween._changeDuration = minValue;
  tween._currentTime = minValue;
};

/**
 * # Compose Tween
 * @summary Handles tween composition logic for replace and blend modes
 *
 * @param {Tween} tween - The tween to compose
 * @param {TweenPropertySiblings} siblings - The siblings collection
 * @return {Promise<Tween>} The composed tween
 */
export const composeTween = async (
  tween: Tween,
  siblings: TweenPropertySiblings
): Promise<Tween> => {
  // Made async for dynamic import
  const tweenCompositionType = tween._composition;

  // Handle replaced tweens
  if (tweenCompositionType === compositionTypes.replace) {
    const tweenAbsStartTime = tween._absoluteStartTime;

    addChild(siblings, tween, addTweenSortMethod, "_prevRep", "_nextRep");

    const prevSibling = tween._prevRep;

    if (prevSibling) {
      const prevParent = prevSibling.parent;
      const prevAbsEndTime =
        prevSibling._absoluteStartTime + prevSibling._changeDuration;

      if (
        tween.parent.id !== prevParent.id &&
        (prevParent as any).iterationCount > 1 &&
        prevAbsEndTime +
          (prevParent.duration - (prevParent as any).iterationDuration) >
          tweenAbsStartTime
      ) {
        overrideTween(prevSibling);
        let prevPrevSibling = prevSibling._prevRep;
        while (prevPrevSibling && prevPrevSibling.parent.id === prevParent.id) {
          overrideTween(prevPrevSibling);
          prevPrevSibling = prevPrevSibling._prevRep;
        }
      }

      const absoluteUpdateStartTime = tweenAbsStartTime - tween._delay;

      if (prevAbsEndTime > absoluteUpdateStartTime) {
        const prevChangeStartTime = prevSibling._startTime;
        const prevTLOffset =
          prevAbsEndTime - (prevChangeStartTime + prevSibling._updateDuration);

        prevSibling._changeDuration =
          absoluteUpdateStartTime - prevTLOffset - prevChangeStartTime;
        prevSibling._currentTime = prevSibling._changeDuration;
        prevSibling._isOverlapped = 1;

        if (prevSibling._changeDuration < minValue) {
          overrideTween(prevSibling);
        }
      }

      let pausePrevParentAnimation = true;
      forEachChildren(prevParent, (t: Tween) => {
        if (!t._isOverlapped) pausePrevParentAnimation = false;
      });

      if (pausePrevParentAnimation) {
        const prevParentTL = prevParent.parent;
        if (prevParentTL) {
          let pausePrevParentTL = true;
          forEachChildren(prevParentTL, (a: any) => {
            if (a !== prevParent) {
              forEachChildren(a, (t: Tween) => {
                if (!t._isOverlapped) pausePrevParentTL = false;
              });
            }
          });
          if (pausePrevParentTL) {
            (prevParentTL as any).cancel();
          }
        } else {
          (prevParent as any).cancel();
        }
      }
    }
  } else if (tweenCompositionType === compositionTypes.blend) {
    const { addAdditiveAnimation } = await import("./additive.ts"); // Dynamic import
    const additiveTweenSiblings = getTweenSiblings(
      tween.target,
      tween.property,
      "_add"
    );
    const additiveAnimation = addAdditiveAnimation(lookups._add as any); // lookups._add might need adjustment if additive.ts also defines/manages it

    let lookupTween = additiveTweenSiblings._head;

    if (!lookupTween) {
      lookupTween = { ...tween };
      lookupTween._composition = compositionTypes.replace;
      lookupTween._updateDuration = minValue;
      lookupTween._startTime = 0;
      lookupTween._numbers = cloneArray(tween._fromNumbers);
      lookupTween._number = 0;
      lookupTween._next = undefined as unknown as Tween;
      lookupTween._prev = undefined as unknown as Tween;
      addChild(additiveTweenSiblings, lookupTween);
      // Use type assertion to handle the protected property access
      addChild(additiveAnimation as any, lookupTween);
    }

    const toNumber = tween._toNumber;
    tween._fromNumber = lookupTween._fromNumber - toNumber;
    tween._toNumber = 0;
    tween._numbers = cloneArray(tween._fromNumbers);
    tween._number = 0;
    lookupTween._fromNumber = toNumber;

    if (tween._toNumbers) {
      const toNumbers = cloneArray(tween._toNumbers);
      if (toNumbers) {
        toNumbers.forEach((value, i) => {
          tween._fromNumbers[i] = lookupTween._fromNumbers[i] - value;
          tween._toNumbers[i] = 0;
        });
      }
      lookupTween._fromNumbers = toNumbers;
    }

    addChild(additiveTweenSiblings, tween, undefined, "_prevAdd", "_nextAdd");
  }

  return tween;
};

/**
 * # Remove Tween Siblings
 * @summary Removes a tween from its siblings collections and cleans up
 *
 * @param {Tween} tween - The tween to remove
 * @return {Promise<Tween>} The removed tween
 */
export const removeTweenSliblings = async (tween: Tween): Promise<Tween> => {
  // Made async if it might call composeTween or similar async logic due to dynamic imports elsewhere
  const tweenComposition = tween._composition;
  if (tweenComposition !== compositionTypes.none) {
    const tweenTarget = tween.target;
    const tweenProperty = tween.property;
    const replaceTweensLookup = lookups._rep;
    const replaceTargetProps = replaceTweensLookup.get(tweenTarget);
    if (replaceTargetProps) {
      const tweenReplaceSiblings = replaceTargetProps[tweenProperty];
      if (tweenReplaceSiblings) {
        removeChild(tweenReplaceSiblings, tween, "_prevRep", "_nextRep");
      }
    }
    if (tweenComposition === compositionTypes.blend) {
      const { additive } = await import("./additive.ts"); // Dynamically import `additive` for its `animation` property
      const addTweensLookup = lookups._add;
      const addTargetProps = addTweensLookup.get(tweenTarget);
      if (!addTargetProps) return tween; // Return tween if addTargetProps is undefined
      const additiveTweenSiblings = addTargetProps[tweenProperty];
      if (additiveTweenSiblings) {
        const additiveAnimation = additive.animation;
        removeChild(additiveTweenSiblings, tween, "_prevAdd", "_nextAdd");
        const lookupTween = additiveTweenSiblings._head;
        if (lookupTween && lookupTween === additiveTweenSiblings._tail) {
          removeChild(
            additiveTweenSiblings,
            lookupTween,
            "_prevAdd",
            "_nextAdd"
          );
          if (additiveAnimation) {
            // Check if additiveAnimation is not null
            // Use type assertion to handle the protected property access
            removeChild(additiveAnimation as any, lookupTween);
          }
          let shouldClean = true;
          for (const prop in addTargetProps) {
            if (addTargetProps[prop]._head) {
              shouldClean = false;
              break;
            }
          }
          if (shouldClean) {
            addTweensLookup.delete(tweenTarget);
          }
        }
      }
    }
  }
  return tween;
};
