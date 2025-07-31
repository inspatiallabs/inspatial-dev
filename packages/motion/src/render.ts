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


import { globals } from "./globals.ts";

import {
  tweenTypes,
  valueTypes,
  tickModes,
  compositionTypes,
  emptyString,
  transformsFragmentStrings,
  transformsSymbol,
  minValue,
} from "./consts.ts";

// Import detailed internal representation of tickable
import type { IRenderTickable as Tickable } from "./types.ts"; // Alias to reuse variable name

// Define helper functions directly instead of importing from helpers.ts
const now = (): number => performance.now();

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const round = (value: number, precision: number = 0): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const interpolate = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

function forEachChildren(
  parent: any,
  callback: (child: any) => void,
  backwards = false
): void {
  let child = backwards ? parent._tail : parent._head;
  while (child) {
    const next = backwards ? child._prev : child._next;
    callback(child);
    child = next;
  }
}

// Define types for parameters
/*
interface Tickable {
  parent: any;
  duration: number;
  completed: boolean;
  iterationDuration: number;
  iterationCount: number;
  _currentIteration: number;
  _loopDelay: number;
  _reversed: number | boolean;
  _alternate: boolean;
  _hasChildren: boolean;
  _delay: number;
  _currentTime: number;
  _iterationTime: number;
  began: boolean;
  backwards: boolean;
  onBegin: (arg: any) => void;
  onLoop: (arg: any) => void;
  onBeforeUpdate: (arg: any) => void;
  onUpdate: (arg: any) => void;
  onRender: (arg: any) => void;
  onComplete: (arg: any) => void;
  _resolve: (arg: any) => void;
  computeDeltaTime: (prevTime: number) => void;
  _offset: number;
  _head: any;
  _fps: number;
  _speed: number;
  requestTick: (time: number) => number;
}
*/

interface TransformsMap {
  [key: string]: string;
}

/**
 * Renders a tickable entity (animation, timer, etc.) at the specified time
 *
 * @param {Tickable} tickable - The tickable entity to render
 * @param {number} time - Current time for rendering
 * @param {number} muteCallbacks - Whether to mute callbacks
 * @param {number} internalRender - Whether this is an internal render
 * @param {number} tickMode - The tickmode to use
 * @return {number} - Whether anything was rendered
 */
export const render = (
  tickable: Tickable,
  time: number,
  muteCallbacks: number,
  internalRender: number,
  tickMode: number
): number => {
  const parent = tickable.parent;
  const duration = tickable.duration;
  const completed = tickable.completed;
  const iterationDuration = tickable.iterationDuration;
  const iterationCount = tickable.iterationCount;
  const _currentIteration = tickable._currentIteration;
  const _loopDelay = tickable._loopDelay;
  const _reversed = tickable._reversed;
  const _alternate = tickable._alternate;
  const _hasChildren = tickable._hasChildren;
  const tickableDelay = tickable._delay;
  const tickablePrevAbsoluteTime = tickable._currentTime; // Renamed from tickablePrevAbsoluteTime to better reflect that this is absolute time

  const tickableEndTime = tickableDelay + iterationDuration;
  const tickableAbsoluteTime = time - tickableDelay;
  const tickablePrevTime = clamp(
    tickablePrevAbsoluteTime,
    -tickableDelay,
    duration
  );
  const tickableCurrentTime = clamp(
    tickableAbsoluteTime,
    -tickableDelay,
    duration
  );
  const deltaTime = tickableAbsoluteTime - tickablePrevAbsoluteTime;
  const isCurrentTimeAboveZero = tickableCurrentTime > 0;
  const isCurrentTimeEqualOrAboveDuration = tickableCurrentTime >= duration;
  const isSetter = duration <= minValue;
  const forcedTick = tickMode === tickModes.FORCE;

  let isOdd = 0;
  let iterationElapsedTime = tickableAbsoluteTime;
  // Render checks
  // Used to also check if the children have rendered in order to trigger the onRender callback on the parent timer
  let hasRendered = 0;

  // Execute the "expensive" iterations calculations only when necessary
  if (iterationCount > 1) {
    // bitwise NOT operator seems to be generally faster than Math.floor() across browsers
    const currentIteration = ~~(
      tickableCurrentTime /
      (iterationDuration + (isCurrentTimeEqualOrAboveDuration ? 0 : _loopDelay))
    );
    tickable._currentIteration = clamp(currentIteration, 0, iterationCount);
    // Prevent the iteration count to go above the max iterations when reaching the end of the animation
    if (isCurrentTimeEqualOrAboveDuration) tickable._currentIteration--;
    isOdd = tickable._currentIteration % 2;
    iterationElapsedTime =
      tickableCurrentTime % (iterationDuration + _loopDelay) || 0;
  }

  // Checks if exactly one of _reversed and (_alternate && isOdd) is true
  const isReversed = _reversed ? !(_alternate && isOdd) : _alternate && isOdd;
  const _ease = tickable._ease;
  let iterationTime = isCurrentTimeEqualOrAboveDuration
    ? isReversed
      ? 0
      : duration
    : isReversed
    ? iterationDuration - iterationElapsedTime
    : iterationElapsedTime;
  if (_ease)
    iterationTime =
      iterationDuration * _ease(iterationTime / iterationDuration) || 0;
  const isRunningBackwards = (
    parent ? parent.backwards : tickableAbsoluteTime < tickablePrevAbsoluteTime
  )
    ? !isReversed
    : !!isReversed;

  tickable._currentTime = tickableAbsoluteTime;
  tickable._iterationTime = iterationTime;
  tickable.backwards = isRunningBackwards;

  if (isCurrentTimeAboveZero && !tickable.began) {
    tickable.began = true;
    if (!muteCallbacks && !(parent && (isRunningBackwards || !parent.began))) {
      tickable.onBegin(tickable);
    }
  } else if (tickableAbsoluteTime <= 0) {
    tickable.began = false;
  }

  // Only triggers onLoop for tickable without children, otherwise call the the onLoop callback in the tick function
  // Make sure to trigger the onLoop before rendering to allow .refresh() to pickup the current values
  if (
    !muteCallbacks &&
    !_hasChildren &&
    isCurrentTimeAboveZero &&
    tickable._currentIteration !== _currentIteration
  ) {
    tickable.onLoop(tickable);
  }

  if (
    forcedTick ||
    (tickMode === tickModes.AUTO &&
      ((time >= tickableDelay && time <= tickableEndTime) || // Normal render
        (time <= tickableDelay && tickablePrevTime > tickableDelay) || // Playhead is before the animation start time so make sure the animation is at its initial state
        (time >= tickableEndTime && tickablePrevTime !== duration))) || // Playhead is after the animation end time so make sure the animation is at its end state
    (iterationTime >= tickableEndTime && tickablePrevTime !== duration) ||
    (iterationTime <= tickableDelay && tickablePrevTime > 0) ||
    (time <= tickablePrevTime && tickablePrevTime === duration && completed) || // Force a render if a seek occurs on an completed animation
    (isCurrentTimeEqualOrAboveDuration && !completed && isSetter) // This prevents 0 duration tickables to be skipped
  ) {
    if (isCurrentTimeAboveZero) {
      // Trigger onUpdate callback before rendering
      tickable.computeDeltaTime(tickablePrevTime);
      if (!muteCallbacks) tickable.onBeforeUpdate(tickable);
    }

    // Start tweens rendering
    if (!_hasChildren) {
      // Time has jumped more than globals.tickThreshold so consider this tick manual
      const forcedRender =
        forcedTick ||
        (isRunningBackwards ? deltaTime * -1 : deltaTime) >=
          globals.tickThreshold;
      const absoluteTime =
        tickable._offset +
        (parent ? (parent as any)._offset : 0) +
        tickableDelay +
        iterationTime;

      // Only Animation can have tweens, Timer returns undefined
      let tween = tickable._head;
      let tweenTarget;
      let tweenStyle;
      let tweenTargetTransforms;
      let tweenTargetTransformsProperties: TransformsMap = {};
      let tweenTransformsNeedUpdate = 0;

      while (tween) {
        const tweenComposition = tween._composition;
        const tweenCurrentTime = tween._currentTime;
        const tweenChangeDuration = tween._changeDuration;
        const tweenAbsEndTime =
          tween._absoluteStartTime + tween._changeDuration;
        const tweenNextRep = tween._nextRep;
        const tweenPrevRep = tween._prevRep;
        const tweenHasComposition = tweenComposition !== compositionTypes.none;

        if (
          (forcedRender ||
            ((tweenCurrentTime !== tweenChangeDuration ||
              absoluteTime <=
                tweenAbsEndTime + (tweenNextRep ? tweenNextRep._delay : 0)) &&
              (tweenCurrentTime !== 0 ||
                absoluteTime >= tween._absoluteStartTime))) &&
          (!tweenHasComposition ||
            (!tween._isOverridden &&
              (!tween._isOverlapped || absoluteTime <= tweenAbsEndTime) &&
              (!tweenNextRep ||
                tweenNextRep._isOverridden ||
                absoluteTime <= tweenNextRep._absoluteStartTime) &&
              (!tweenPrevRep ||
                tweenPrevRep._isOverridden ||
                absoluteTime >=
                  tweenPrevRep._absoluteStartTime +
                    tweenPrevRep._changeDuration +
                    tween._delay)))
        ) {
          const tweenNewTime = (tween._currentTime = clamp(
            iterationTime - tween._startTime,
            0,
            tweenChangeDuration
          ));
          const tweenProgress = tween._ease(
            tweenNewTime / tween._updateDuration
          );
          const tweenModifier = tween._modifier;
          const tweenValueType = tween._valueType;
          const tweenType = tween._tweenType;
          const tweenIsObject = tweenType === tweenTypes.OBJECT;
          const tweenIsNumber = tweenValueType === valueTypes.NUMBER;
          // Only round the in-between frames values if the final value is a string
          const tweenPrecision =
            (tweenIsNumber && tweenIsObject) ||
            tweenProgress === 0 ||
            tweenProgress === 1
              ? -1
              : globals.precision;

          // Recompose tween value
          let value: string | number;
          let number: number | undefined;

          if (tweenIsNumber) {
            value = number = tweenModifier(
              round(
                interpolate(tween._fromNumber, tween._toNumber, tweenProgress),
                tweenPrecision
              )
            );
          } else if (tweenValueType === valueTypes.UNIT) {
            // Rounding the values speed up string composition
            number = tweenModifier(
              round(
                interpolate(tween._fromNumber, tween._toNumber, tweenProgress),
                tweenPrecision
              )
            );
            value = `${number}${tween._unit}`;
          } else if (tweenValueType === valueTypes.COLOR) {
            const fn = tween._fromNumbers;
            const tn = tween._toNumbers;
            const r = round(
              clamp(
                tweenModifier(interpolate(fn[0], tn[0], tweenProgress)),
                0,
                255
              ),
              0
            );
            const g = round(
              clamp(
                tweenModifier(interpolate(fn[1], tn[1], tweenProgress)),
                0,
                255
              ),
              0
            );
            const b = round(
              clamp(
                tweenModifier(interpolate(fn[2], tn[2], tweenProgress)),
                0,
                255
              ),
              0
            );
            const a = clamp(
              tweenModifier(
                round(interpolate(fn[3], tn[3], tweenProgress), tweenPrecision)
              ),
              0,
              1
            );
            value = `rgba(${r},${g},${b},${a})`;
            if (tweenHasComposition) {
              const ns = tween._numbers;
              ns[0] = r;
              ns[1] = g;
              ns[2] = b;
              ns[3] = a;
            }
          } else if (tweenValueType === valueTypes.COMPLEX) {
            value = tween._strings[0];
            for (let j = 0, l = tween._toNumbers.length; j < l; j++) {
              const n = tweenModifier(
                round(
                  interpolate(
                    tween._fromNumbers[j],
                    tween._toNumbers[j],
                    tweenProgress
                  ),
                  tweenPrecision
                )
              );
              const s = tween._strings[j + 1];
              value += `${s ? n + s : n}`;
              if (tweenHasComposition) {
                tween._numbers[j] = n;
              }
            }
          }

          // For additive tweens and Animatables
          if (tweenHasComposition) {
            tween._number = number;
          }

          if (!internalRender && tweenComposition !== compositionTypes.blend) {
            const tweenProperty = tween.property;
            tweenTarget = tween.target;

            if (tweenIsObject) {
              (tweenTarget as any)[tweenProperty] = value!;
            } else if (tweenType === tweenTypes.ATTRIBUTE) {
              (tweenTarget as HTMLElement).setAttribute(
                tweenProperty,
                value! as string
              );
            } else {
              tweenStyle = (tweenTarget as HTMLElement).style;
              if (tweenType === tweenTypes.TRANSFORM) {
                if (tweenTarget !== tweenTargetTransforms) {
                  tweenTargetTransforms = tweenTarget;
                  // NOTE: Referencing the cachedTransforms in the tween property directly can be a little bit faster but appears to increase memory usage.
                  tweenTargetTransformsProperties =
                    (tweenTarget as any)[transformsSymbol] || {};
                }
                tweenTargetTransformsProperties[tweenProperty] =
                  value! as string;
                tweenTransformsNeedUpdate = 1;
              } else if (tweenType === tweenTypes.CSS) {
                (tweenStyle as any)[tweenProperty] = value!;
              } else if (tweenType === tweenTypes.CSS_VAR) {
                tweenStyle.setProperty(tweenProperty, value! as string);
              }
            }

            if (isCurrentTimeAboveZero) hasRendered = 1;
          } else {
            // Used for composing timeline tweens without having to do a real render
            tween._value = value!;
          }
        }

        // NOTE: Possible improvement: Use translate(x,y) / translate3d(x,y,z) syntax
        // to reduce memory usage on string composition
        if (tweenTransformsNeedUpdate && tween._renderTransforms) {
          let str = emptyString;
          for (const key in tweenTargetTransformsProperties) {
            const transformFragmentString =
              transformsFragmentStrings[
                key as keyof typeof transformsFragmentStrings
              ] || "";
            str += `${transformFragmentString}${tweenTargetTransformsProperties[key]}) `;
          }
          if (tweenStyle) {
            tweenStyle.transform = str;
          }
          tweenTransformsNeedUpdate = 0;
        }

        tween = tween._next;
      }

      if (!muteCallbacks && hasRendered) {
        tickable.onRender(tickable);
      }
    }

    if (!muteCallbacks && isCurrentTimeAboveZero) {
      tickable.onUpdate(tickable);
    }
  }

  // End tweens rendering

  // Handle setters on timeline differently and allow re-trigering the onComplete callback when seeking backwards
  if (parent && isSetter) {
    if (
      !muteCallbacks &&
      ((parent.began &&
        !isRunningBackwards &&
        tickableAbsoluteTime >= duration &&
        !completed) ||
        (isRunningBackwards && tickableAbsoluteTime <= minValue && completed))
    ) {
      tickable.onComplete(tickable);
      tickable.completed = !isRunningBackwards;
    }
    // If currentTime is both above 0 and at least equals to duration, handles normal onComplete or infinite loops
  } else if (isCurrentTimeAboveZero && isCurrentTimeEqualOrAboveDuration) {
    if (iterationCount === Infinity) {
      // Offset the tickable _startTime with its duration to reset _currentTime to 0 and continue the infinite timer
      tickable._startTime += tickable.duration;
    } else if (tickable._currentIteration >= iterationCount - 1) {
      // By setting paused to true, we tell the engine loop to not render this tickable and removes it from the list on the next tick
      tickable.paused = true;
      if (!completed && !_hasChildren) {
        // If the tickable has children, triggers onComplete() only when all children have completed in the tick function
        tickable.completed = true;
        if (
          !muteCallbacks &&
          !(parent && (isRunningBackwards || !parent.began))
        ) {
          tickable.onComplete(tickable);
          tickable._resolve(tickable);
        }
      }
    }
    // Otherwise set the completed flag to false
  } else {
    tickable.completed = false;
  }

  // NOTE: hasRendered * direction (negative for backwards) this way we can remove the tickable.backwards property completly ?
  return hasRendered;
};

/**
 * Process a tick for a tickable entity
 *
 * @param {Tickable} tickable - The tickable entity to process
 * @param {number} time - Current time for the tick
 * @param {number} muteCallbacks - Whether to mute callbacks
 * @param {number} internalRender - Whether this is an internal render
 * @param {number} tickMode - The tickmode to use
 */
export const tick = (
  tickable: Tickable,
  time: number,
  muteCallbacks: number,
  internalRender: number,
  tickMode: number
): void => {
  const _currentIteration = tickable._currentIteration;
  render(tickable, time, muteCallbacks, internalRender, tickMode);

  if (tickable._hasChildren) {
    const tl = tickable;
    const tlIsRunningBackwards = tl.backwards;
    const tlChildrenTime = internalRender ? time : tl._iterationTime;
    const tlCildrenTickTime = now();

    let tlChildrenHasRendered = 0;
    let tlChildrenHaveCompleted = true;

    // If the timeline has looped forward, we need to manually triggers children skipped callbacks
    if (!internalRender && tl._currentIteration !== _currentIteration) {
      const tlIterationDuration = tl.iterationDuration;
      forEachChildren(tl, (child) => {
        if (!tlIsRunningBackwards) {
          // Force an internal render to trigger the callbacks if the child has not completed on loop
          if (
            !child.completed &&
            !child.backwards &&
            child._currentTime < child.iterationDuration
          ) {
            render(
              child,
              tlIterationDuration,
              muteCallbacks,
              1,
              tickModes.FORCE
            );
          }
          // Reset their began and completed flags to allow retrigering callbacks on the next iteration
          child.began = false;
          child.completed = false;
        } else {
          const childDuration = child.duration;
          const childStartTime = child._offset + child._delay;
          const childEndTime = childStartTime + childDuration;
          // Triggers the onComplete callback on reverse for children on the edges of the timeline
          if (
            !muteCallbacks &&
            childDuration <= minValue &&
            (!childStartTime || childEndTime === tlIterationDuration)
          ) {
            child.onComplete(child);
          }
        }
      });
      if (!muteCallbacks) tl.onLoop(tl);
    }

    forEachChildren(
      tl,
      (child) => {
        const childTime = round(
          (tlChildrenTime - child._offset) * child._speed,
          12
        ); // Rounding is needed when using seconds
        const childTickMode =
          child._fps < tl._fps
            ? child.requestTick(tlCildrenTickTime)
            : tickMode;
        tlChildrenHasRendered += render(
          child,
          childTime,
          muteCallbacks,
          internalRender,
          childTickMode
        );
        if (!child.completed && tlChildrenHaveCompleted)
          tlChildrenHaveCompleted = false;
      },
      tlIsRunningBackwards
    );

    // Renders on timeline are triggered by its children so it needs to be set after rendering the children
    if (!muteCallbacks && tlChildrenHasRendered) tl.onRender(tl);

    // Triggers the timeline onComplete() once all chindren all completed and the current time has reached the end
    if (tlChildrenHaveCompleted && tl._currentTime >= tl.duration) {
      // Make sure the paused flag is false in case it has been skipped in the render function
      tl.paused = true;
      if (!tl.completed) {
        tl.completed = true;
        if (!muteCallbacks) {
          tl.onComplete(tl);
          tl._resolve(tl);
        }
      }
    }
  }
};
