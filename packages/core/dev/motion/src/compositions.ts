import { compositionTypes, minValue } from "./consts.ts";

import {
  cloneArray,
  addChild,
  removeChild,
  forEachChildren,
} from "./helpers.ts";

// import { additive, addAdditiveAnimation } from "./additive.ts"; // Remove static import

const lookups = {
  /** @type {TweenReplaceLookups} */
  _rep: new WeakMap(),
  /** @type {TweenAdditiveLookups} */
  _add: new Map(), // This Map might store lookups that additive.ts also uses.
};

/**
 * @param  {Target} target
 * @param  {String} property
 * @param  {String} lookup
 * @return {TweenPropertySiblings}
 */
export const getTweenSiblings = (target, property, lookup = "_rep") => {
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
 * @param  {Tween} p
 * @param  {Tween} c
 * @return {Number|Boolean}
 */
const addTweenSortMethod = (p, c) => {
  return p._isOverridden || p._absoluteStartTime > c._absoluteStartTime;
};

/**
 * @param {Tween} tween
 */
export const overrideTween = (tween) => {
  tween._isOverlapped = 1;
  tween._isOverridden = 1;
  tween._changeDuration = minValue;
  tween._currentTime = minValue;
};

/**
 * @param  {Tween} tween
 * @param  {TweenPropertySiblings} siblings
 * @return {Tween}
 */
export const composeTween = async (tween, siblings) => { // Made async for dynamic import
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
        prevParent.iterationCount > 1 &&
        prevAbsEndTime + (prevParent.duration - prevParent.iterationDuration) >
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
      forEachChildren(prevParent, (/** @type Tween */ t) => {
        if (!t._isOverlapped) pausePrevParentAnimation = false;
      });

      if (pausePrevParentAnimation) {
        const prevParentTL = prevParent.parent;
        if (prevParentTL) {
          let pausePrevParentTL = true;
          forEachChildren(prevParentTL, (/** @type JSAnimation */ a) => {
            if (a !== prevParent) {
              forEachChildren(a, (/** @type Tween */ t) => {
                if (!t._isOverlapped) pausePrevParentTL = false;
              });
            }
          });
          if (pausePrevParentTL) {
            prevParentTL.cancel();
          }
        } else {
          prevParent.cancel();
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
    const additiveAnimation = addAdditiveAnimation(lookups._add); // lookups._add might need adjustment if additive.ts also defines/manages it

    let lookupTween = additiveTweenSiblings._head;

    if (!lookupTween) {
      lookupTween = { ...tween };
      lookupTween._composition = compositionTypes.replace;
      lookupTween._updateDuration = minValue;
      lookupTween._startTime = 0;
      lookupTween._numbers = cloneArray(tween._fromNumbers);
      lookupTween._number = 0;
      lookupTween._next = null;
      lookupTween._prev = null;
      addChild(additiveTweenSiblings, lookupTween);
      addChild(additiveAnimation, lookupTween);
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

    addChild(additiveTweenSiblings, tween, null, "_prevAdd", "_nextAdd");
  }

  return tween;
};

/**
 * @param  {Tween} tween
 * @return {Tween}
 */
export const removeTweenSliblings = async (tween) => { // Made async if it might call composeTween or similar async logic due to dynamic imports elsewhere
  const tweenComposition = tween._composition;
  if (tweenComposition !== compositionTypes.none) {
    const tweenTarget = tween.target;
    const tweenProperty = tween.property;
    const replaceTweensLookup = lookups._rep;
    const replaceTargetProps = replaceTweensLookup.get(tweenTarget);
    const tweenReplaceSiblings = replaceTargetProps[tweenProperty];
    removeChild(tweenReplaceSiblings, tween, "_prevRep", "_nextRep");
    if (tweenComposition === compositionTypes.blend) {
      const { additive } = await import("./additive.ts"); // Dynamically import `additive` for its `animation` property
      const addTweensLookup = lookups._add;
      const addTargetProps = addTweensLookup.get(tweenTarget);
      if (!addTargetProps) return tween; // Return tween if addTargetProps is undefined
      const additiveTweenSiblings = addTargetProps[tweenProperty];
      const additiveAnimation = additive.animation;
      removeChild(additiveTweenSiblings, tween, "_prevAdd", "_nextAdd");
      const lookupTween = additiveTweenSiblings._head;
      if (lookupTween && lookupTween === additiveTweenSiblings._tail) {
        removeChild(additiveTweenSiblings, lookupTween, "_prevAdd", "_nextAdd");
        if (additiveAnimation) { // Check if additiveAnimation is not null
            removeChild(additiveAnimation, lookupTween);
        }
        let shouldClean = true;
        for (let prop in addTargetProps) {
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
  return tween;
};
