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
  K,
  minValue,
  tweenTypes,
  valueTypes,
  compositionTypes,
  isDomSymbol,
  transformsSymbol,
  emptyString,
  transformsFragmentStrings,
  noop,
} from "./consts.ts";

import {
  mergeObjects,
  cloneArray,
  isArr,
  isObj,
  isUnd,
  isKey,
  addChild,
  forEachChildren,
  clampInfinity,
  normalizeTime,
  isNum,
  round,
  isStr,
} from "./helpers.ts";

import { globals } from "./globals.ts";

import { registerTargets } from "./targets.ts";

import { parseEasings } from "./eases.ts";

import {
  getRelativeValue,
  getFunctionValue,
  getOriginalAnimatableValue,
  getTweenType,
  decomposeRawValue,
  decomposeTweenValue,
  decomposedOriginalValue,
  createDecomposedValueTargetObject,
  setValue,
} from "./values.ts";

import { sanitizePropertyName as _sanitizePropertyName } from "./properties.ts";

import { convertValueUnit } from "./units.ts";

import {
  composeTween,
  getTweenSiblings,
  overrideTween,
  removeTweenSliblings,
} from "./compositions.ts";

import { additive } from "./additive.ts";

import { Timer } from "./timer.ts";

import type {
  Renderable,
  DOMTarget,
  Tween,
  TweenLookups as _TweenLookups,
  TweenKeyValue,
  TweenPropValue,
  TweenReplaceLookups as _TweenReplaceLookups,
  TweenParamsOptions,
  TweenPropertySiblings,
  TweenValues,
  TweenObjectValue as _TweenObjectValue,
  TweenParamValue,
  ArraySyntaxValue,
  Timeline,
  TargetsParam,
  Target,
  TargetsArray,
  Callback,
  Spring,
  EasingFunction,
  FunctionValue,
  TimerParams,
  EasingParam,
  DurationKeyframes,
  PercentageKeyframes,
  AnimationParams,
  JSAnimation as IJSAnimation,
  AnimatableParams,
  AnimatableObject,
  AnimatableProperty,
  AnimatablePropertySetter as _AnimatablePropertySetter,
  AnimatablePropertyGetter as _AnimatablePropertyGetter,
  TweenModifier,
  Scope,
  Tickable,
  TweenComposition,
} from "./types.ts";

// Define missing types
/** Type for composition values in tweens */
/** Generic object type for animation storage */
type AnyObject = Record<string, any>;
/** Parameters for JSAnimation */
type JSAnimationParameters = AnimationParams;

/**
 * @template {Renderable} T
 * @param {T} renderable
 * @return {T}
 */
export const cleanInlineStyles = (renderable: Renderable): Renderable => {
  // Allow cleanInlineStyles() to be called on timelines
  if (renderable._hasChildren) {
    forEachChildren(renderable, cleanInlineStyles, true);
  } else {
    const animation = renderable as IJSAnimation;
    // Using a more generic approach to pausing
    if (typeof animation.paused === "boolean") {
      animation.paused = true;
    }
    forEachChildren(
      animation,
      (tween: Tween) => {
        const tweenProperty = tween.property;
        const tweenTarget = tween.target;
        // Use type assertion for the symbol indexing
        if ((tweenTarget as any)[isDomSymbol]) {
          const targetStyle = (tweenTarget as DOMTarget).style;
          const originalInlinedValue = (animation as any)._inlineStyles[
            tweenProperty
          ];
          if (tween._tweenType === tweenTypes.TRANSFORM) {
            // Use type assertion for the symbol indexing
            const cachedTransforms = (tweenTarget as any)[transformsSymbol];
            if (
              isUnd(originalInlinedValue) ||
              originalInlinedValue === emptyString
            ) {
              delete cachedTransforms[tweenProperty];
            } else {
              cachedTransforms[tweenProperty] = originalInlinedValue;
            }
            if (tween._renderTransforms) {
              if (!Object.keys(cachedTransforms).length) {
                targetStyle.removeProperty("transform");
              } else {
                let str = emptyString;
                for (const key in cachedTransforms) {
                  str +=
                    (transformsFragmentStrings as Record<string, string>)[key] +
                    cachedTransforms[key] +
                    ") ";
                }
                targetStyle.transform = str;
              }
            }
          } else {
            if (
              isUnd(originalInlinedValue) ||
              originalInlinedValue === emptyString
            ) {
              targetStyle.removeProperty(tweenProperty);
            } else {
              targetStyle.setProperty(tweenProperty, originalInlinedValue);
            }
          }
          if (animation._tail === tween) {
            animation.targets.forEach((t) => {
              if (t.getAttribute && t.getAttribute("style") === emptyString) {
                t.removeAttribute("style");
              }
            });
          }
        }
      },
      true
    );
  }
  return renderable;
};

// Defines decomposed values target objects only once and mutate their properties later to avoid GC
// Use the exported function from values.ts to create base objects
const fromTargetObject = createDecomposedValueTargetObject() as any;
const toTargetObject = createDecomposedValueTargetObject() as any;
const toFunctionStore: { func: FunctionValue | null } = { func: null };
const keyframesTargetArray: any[] = [null];
const fastSetValuesArray: any[] = [null, null];
/** @type {TweenKeyValue} */
const keyObjectTarget: TweenKeyValue = { to: undefined };

let tweenId = 0;
let keyframes: any[];
/** @type {TweenParamsOptions & TweenValues} */
let key: TweenParamsOptions & TweenValues;

/**
 * @param {DurationKeyframes | PercentageKeyframes} keyframes
 * @param {AnimationParams} parameters
 * @return {AnimationParams}
 */
const generateKeyframes = (
  keyframes: DurationKeyframes | PercentageKeyframes,
  parameters: AnimationParams
): AnimationParams => {
  /** @type {AnimationParams} */
  const properties: AnimationParams = {};
  if (isArr(keyframes)) {
    // Convert array of property names to an array of strings with proper typing
    const propertyNames = Array.from(
      new Set(
        (keyframes as DurationKeyframes).flatMap((key) =>
          Object.keys(key).filter(isKey)
        )
      )
    );

    for (let i = 0, l = propertyNames.length; i < l; i++) {
      const propName = propertyNames[i];
      const propArray = (keyframes as DurationKeyframes).map((key) => {
        /** @type {TweenKeyValue} */
        const newKey: TweenKeyValue = { to: undefined };
        for (const p in key) {
          const keyValue = key[p] as TweenPropValue;
          if (isKey(p)) {
            if (p === propName) {
              newKey.to = keyValue;
            }
          } else {
            // Use a more type-safe approach to assign properties
            if (p === "duration") newKey.duration = keyValue as TweenParamValue;
            else if (p === "delay") newKey.delay = keyValue as TweenParamValue;
            else if (p === "ease") newKey.ease = keyValue as EasingParam;
            else if (p === "modifier")
              newKey.modifier = keyValue as unknown as TweenModifier;
            else if (p === "composition")
              newKey.composition = keyValue as TweenComposition;
          }
        }
        return newKey;
      });
      properties[propName as keyof AnimationParams] =
        propArray as unknown as ArraySyntaxValue;
    }
  } else {
    const totalDuration = setValue(
      parameters.duration,
      globals.defaults.duration
    ) as number;
    const keys = Object.keys(keyframes)
      .map((key) => {
        return { o: parseFloat(key) / 100, p: (keyframes as any)[key] };
      })
      .sort((a, b) => a.o - b.o);
    const _length = keys.length;
    const _prevKey = keys[0];
    keys.forEach((key) => {
      const offset = key.o;
      const prop = key.p;
      for (const name in prop) {
        if (isKey(name)) {
          let propArray = properties[
            name as keyof AnimationParams
          ] as Array<any>;
          if (!propArray)
            propArray = properties[name as keyof AnimationParams] = [] as any;
          const duration = offset * totalDuration;
          const length = propArray.length;
          const prevKey = propArray[length - 1];
          const keyObj = {
            to: prop[name],
            from: undefined as any,
            ease: undefined as any,
            duration: 0,
          };
          let durProgress = 0;
          for (let i = 0; i < length; i++) {
            durProgress += propArray[i].duration;
          }
          if (length === 1) {
            keyObj.from = prevKey.to;
          }
          if (prop.ease) {
            keyObj.ease = prop.ease;
          }
          keyObj.duration = duration - (length ? durProgress : 0);
          propArray.push(keyObj);
        }
      }
      return key;
    });

    for (const name in properties) {
      const propArray = properties[name as keyof AnimationParams] as Array<any>;
      let prevEase;
      // let durProgress = 0
      for (let i = 0, l = propArray.length; i < l; i++) {
        const prop = propArray[i];
        // Emulate WAPPI easing parameter position
        const currentEase = prop.ease;
        prop.ease = prevEase ? prevEase : undefined;
        prevEase = currentEase;
        // durProgress += prop.duration;
        // if (i === l - 1 && durProgress !== totalDuration) {
        //   propArray.push({ from: prop.to, ease: prop.ease, duration: totalDuration - durProgress })
        // }
      }
      if (!propArray[0].duration) {
        propArray.shift();
      }
    }
  }

  return properties;
};

/**
 * # JSAnimation Class
 * @summary Core animation class handling tweening and animation playback
 *
 * This class extends Timer to create animations with multiple tweens,
 * handling property changes over time for DOM and JavaScript objects.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */
export class JSAnimation extends Timer {
  /** The animated targets */
  targets: TargetsArray = [];

  /** Total duration of the animation */
  override duration: number = 0;

  /** Duration of a single iteration */
  override iterationDuration: number = 0;

  /** Number of iterations */
  iterations: number = 1;

  /** End delay in milliseconds */
  endDelay: number = 0;

  /** Whether the animation has ended */
  hasEnded: boolean = false;

  /** Animation keyframes */
  keyframes: AnyObject = {};

  /** Animation parameters */
  parameters: JSAnimationParameters = {};

  /** Normalized keyframes */
  normalizedKeyframes: AnyObject = {};

  /** Animation easing function */
  easingFn: EasingFunction = (t) => t;

  /** Animation values */
  values: AnyObject = {};

  /** Animation percentages */
  percentages: number[] = [];

  /** Callback function to execute on each render */
  override onRender: Callback<JSAnimation> = () => {};

  /** Callback function to execute on cancel */
  onCancel?: () => void;

  /** Animation easing function */
  _ease: EasingFunction = (t) => t;

  /** Animation delay in milliseconds */
  override _delay: number = 0;

  /** Autoplays the animation on creation */
  override _autoplay: boolean = true;

  /** Number of iterations */
  override iterationCount: number = 0;

  /** Delay between animation loops */
  override _loopDelay: number = 0;

  /** Original styles to restore when animation is clean */
  _inlineStyles: Record<string, any> = {};

  /** Absolute time offset */
  override _offset: number = 0;

  /** The head of the linked list of tweens */
  declare _head: Tickable | Tween;

  /** The tail of the linked list of tweens */
  declare _tail: Tickable | Tween;

  /** Whether the animation has children */
  override _hasChildren: boolean = false;

  /**
   * @param {TargetsParam} targets
   * @param {AnimationParams} parameters
   * @param {Timeline} [parent]
   * @param {Number} [parentPosition]
   * @param {Boolean} [fastSet=false]
   * @param {Number} [index=0]
   * @param {Number} [length=0]
   */
  constructor(
    targets: TargetsParam,
    parameters: AnimationParams,
    parent?: Timeline,
    parentPosition?: number,
    fastSet: boolean = false,
    index: number = 0,
    length: number = 0
  ) {
    super(parameters as TimerParams & AnimationParams, parent, parentPosition);

    const parsedTargets = registerTargets(targets);
    const targetsLength = parsedTargets.length;

    // If the parameters object contains a "keyframes" property, convert all the keyframes values to regular properties
    const kfParams = parameters.keyframes;
    const params = kfParams
      ? mergeObjects(
          generateKeyframes(
            // Use type assertion with unknown to handle the type conversion safely
            kfParams as unknown as DurationKeyframes,
            parameters
          ),
          parameters
        )
      : parameters;

    const {
      delay,
      duration,
      ease,
      playbackEase,
      modifier,
      composition,
      onRender,
    } = params;

    const animDefaults = parent ? parent.defaults : globals.defaults;
    const animaPlaybackEase = setValue(playbackEase, animDefaults.playbackEase);
    const animEase = animaPlaybackEase ? parseEasings(animaPlaybackEase) : null;
    const hasSpring = !isUnd(ease) && !isUnd((ease as Spring).ease);
    const tEasing = hasSpring
      ? (ease as Spring).ease
      : setValue(ease, animEase ? "linear" : animDefaults.ease);
    const tDuration = hasSpring
      ? (ease as Spring).duration
      : setValue(duration, animDefaults.duration);
    const tDelay = setValue(delay, animDefaults.delay);
    const tModifier = modifier || animDefaults.modifier;
    // If no composition is defined and the targets length is high (>= 1000) set the composition to 'none' (0) for faster tween creation
    const tComposition =
      isUnd(composition) && targetsLength >= K
        ? compositionTypes.none
        : !isUnd(composition)
        ? composition
        : animDefaults.composition;
    // Only create the inline styles object when we know it will be used
    const animInlineStyles: Record<string, any> | null = null;
    // const absoluteOffsetTime = this._offset;
    const absoluteOffsetTime =
      this._offset + (parent ? (parent as any)._offset : 0);

    let iterationDuration = NaN;
    let iterationDelay = NaN;
    let animationAnimationLength = 0;
    let shouldTriggerRender = 0;

    // Track the last transform tween per target to optimize _renderTransforms setting
    const lastTransformTweenPerTarget = new Map<Target, Tween>();

    for (let targetIndex = 0; targetIndex < targetsLength; targetIndex++) {
      const target = parsedTargets[targetIndex];
      const ti = index || targetIndex;
      const tl = length || targetsLength;

      for (const propName in params) {
        if (isKey(propName)) {
          const tweenType = getTweenType(target, propName);

          let propValue = params[propName];

          const isPropValueArray = isArr(propValue);

          if (fastSet && !isPropValueArray) {
            fastSetValuesArray[0] = propValue;
            fastSetValuesArray[1] = propValue;
            propValue = fastSetValuesArray;
          }

          // Allow nested keyframes inside ObjectValue value (prop: { to: [.5, 1, .75, 2, 3] })
          // Normalize property values to valid keyframe syntax:
          // [x, y] to [{to: [x, y]}] or {to: x} to [{to: x}] or keep keys syntax [{}, {}, {}...]
          if (isPropValueArray) {
            const arrayLength = (propValue as Array<any>).length;
            // Safe access using Array type checking
            const isNotObjectValue =
              Array.isArray(propValue) &&
              propValue.length > 0 &&
              !isObj(propValue[0]);

            // Convert [x, y] to [{to: [x, y]}]
            if (arrayLength === 2 && isNotObjectValue) {
              keyObjectTarget.to = propValue as unknown as TweenParamValue;
              keyframesTargetArray[0] = keyObjectTarget;
              keyframes = keyframesTargetArray;
            }
            // Support nested keyframes inside ObjectValue
            else if (arrayLength > 2 && isNotObjectValue) {
              // Check if the array is contained within an object with a 'to' property (nested keyframes)
              if (
                isObj(propValue) &&
                "to" in propValue &&
                Array.isArray((propValue as any).to)
              ) {
                // This is an object with a nested keyframe array
                const nestedKeyframes = (propValue as any).to;
                keyframes = [];

                // Process each item in the nested keyframe array
                for (let i = 0; i < nestedKeyframes.length; i++) {
                  const keyframe: Record<string, any> = {
                    to: nestedKeyframes[i],
                  };
                  // Copy other properties like duration, ease, etc.
                  if (isObj(propValue)) {
                    for (const prop in propValue as Record<string, any>) {
                      if (prop !== "to") {
                        keyframe[prop] = (propValue as Record<string, any>)[
                          prop
                        ];
                      }
                    }
                  }
                  keyframes.push(keyframe);
                }
              } else {
                // Standard handling for non-nested arrays
                keyframes = [];
                (propValue as Array<any>).forEach((v, i) => {
                  if (!i) {
                    fastSetValuesArray[0] = v;
                  } else if (i === 1) {
                    fastSetValuesArray[1] = v;
                    keyframes.push(fastSetValuesArray);
                  } else {
                    keyframes.push(v);
                  }
                });
              }
            } else {
              keyframes = propValue as Array<TweenKeyValue>;
            }
          } else {
            keyframesTargetArray[0] = propValue;
            keyframes = keyframesTargetArray;
          }

          let siblings = null;
          let prevTween = null;
          let firstTweenChangeStartTime = NaN;
          let lastTweenChangeEndTime = 0;
          let tweenIndex = 0;

          for (const l = keyframes.length; tweenIndex < l; tweenIndex++) {
            const keyframe = keyframes[tweenIndex];

            if (isObj(keyframe)) {
              key = keyframe as TweenParamsOptions & TweenValues;
            } else {
              keyObjectTarget.to = keyframe as TweenParamValue;
              key = keyObjectTarget as TweenParamsOptions & TweenValues;
            }

            toFunctionStore.func = null;

            const computedToValue = getFunctionValue(
              key.to as
                | string
                | number
                | Partial<{ to: TweenParamValue | TweenParamValue[] }>
                | ((target: any, index: number, total: number) => any)
                | undefined,
              target,
              ti,
              tl,
              toFunctionStore
            );

            let tweenToValue;
            // Allows function based values to return an object syntax value ({to: v})
            if (isObj(computedToValue) && !isUnd((computedToValue as any).to)) {
              key = computedToValue as TweenParamsOptions & TweenValues;
              tweenToValue = (computedToValue as any).to;
            } else {
              tweenToValue = computedToValue;
            }
            const tweenFromValue = getFunctionValue(
              key.from as
                | string
                | number
                | Partial<{ from: TweenParamValue | TweenParamValue[] }>
                | ((target: any, index: number, total: number) => any)
                | undefined,
              target,
              ti,
              tl,
              {} as Record<string, any>
            );
            const keyEasing = key.ease;
            const hasSpring =
              !isUnd(keyEasing) && !isUnd((keyEasing as Spring).ease);
            // Easing are treated differently and don't accept function based value to prevent having to pass a function wrapper that returns an other function all the time
            const tweenEasing = hasSpring
              ? (keyEasing as Spring).ease
              : keyEasing || tEasing;
            // Calculate default individual keyframe duration by dividing the tl of keyframes
            const tweenDuration = hasSpring
              ? (keyEasing as Spring).duration
              : getFunctionValue(
                  setValue(
                    key.duration,
                    l > 1
                      ? getFunctionValue(
                          tDuration as number,
                          target,
                          ti,
                          tl,
                          {} as Record<string, any>
                        ) / l
                      : tDuration
                  ),
                  target,
                  ti,
                  tl,
                  {} as Record<string, any>
                );
            // Default delay value should only be applied to the first tween
            const tweenDelay = getFunctionValue(
              setValue(key.delay, !tweenIndex ? tDelay : 0),
              target,
              ti,
              tl,
              {} as Record<string, any>
            );
            const computedComposition = getFunctionValue(
              setValue(key.composition, tComposition),
              target,
              ti,
              tl,
              {} as Record<string, any>
            );
            const tweenComposition = isNum(computedComposition)
              ? computedComposition
              : compositionTypes[
                  computedComposition as keyof typeof compositionTypes
                ];
            // Modifiers are treated differently and don't accept function based value to prevent having to pass a function wrapper
            const tweenModifier = key.modifier || tModifier;
            const hasFromvalue = !isUnd(tweenFromValue);
            const hasToValue = !isUnd(tweenToValue);
            const isFromToArray = isArr(tweenToValue);
            const isFromToValue = isFromToArray || (hasFromvalue && hasToValue);
            const tweenStartTime = prevTween
              ? lastTweenChangeEndTime + (tweenDelay as number)
              : (tweenDelay as number);
            const absoluteStartTime = absoluteOffsetTime + tweenStartTime;

            // Force a onRender callback if the animation contains at least one from value and autoplay is set to false
            if (!shouldTriggerRender && (hasFromvalue || isFromToArray))
              shouldTriggerRender = 1;

            let prevSibling = prevTween;

            if (tweenComposition !== compositionTypes.none) {
              if (!siblings) siblings = getTweenSiblings(target, propName);
              let nextSibling = siblings._head;
              // Iterate trough all the next siblings until we find a sibling with an equal or inferior start time
              while (
                nextSibling &&
                !nextSibling._isOverridden &&
                nextSibling._absoluteStartTime <= absoluteStartTime
              ) {
                prevSibling = nextSibling;
                nextSibling = nextSibling._nextRep;
                // Overrides all the next siblings if the next sibling starts at the same time of after as the new tween start time
                if (
                  nextSibling &&
                  nextSibling._absoluteStartTime >= absoluteStartTime
                ) {
                  while (nextSibling) {
                    overrideTween(nextSibling);
                    // This will ends both the current while loop and the upper one once all the next sibllings have been overriden
                    nextSibling = nextSibling._nextRep;
                  }
                }
              }
            }

            // Decompose values
            if (isFromToValue) {
              decomposeRawValue(
                isFromToArray
                  ? getFunctionValue(
                      tweenToValue[0],
                      target,
                      ti,
                      tl,
                      {} as Record<string, any>
                    )
                  : tweenFromValue,
                fromTargetObject
              );
              decomposeRawValue(
                isFromToArray
                  ? getFunctionValue(
                      tweenToValue[1],
                      target,
                      ti,
                      tl,
                      toFunctionStore
                    )
                  : tweenToValue,
                toTargetObject
              );
              if (fromTargetObject.t === valueTypes.NUMBER) {
                if (prevSibling) {
                  if (prevSibling._valueType === valueTypes.UNIT) {
                    fromTargetObject.t = valueTypes.UNIT;
                    fromTargetObject.u = prevSibling._unit || "";
                  }
                } else {
                  decomposeRawValue(
                    getOriginalAnimatableValue(
                      target,
                      propName,
                      tweenType,
                      animInlineStyles
                    ),
                    decomposedOriginalValue
                  );
                  if (decomposedOriginalValue.t === valueTypes.UNIT) {
                    fromTargetObject.t = valueTypes.UNIT;
                    fromTargetObject.u = decomposedOriginalValue.u;
                  }
                }
              }
            } else {
              if (hasToValue) {
                decomposeRawValue(tweenToValue, toTargetObject);
              } else {
                if (prevTween) {
                  decomposeTweenValue(prevTween, toTargetObject);
                } else {
                  // No need to get and parse the original value if the tween is part of a timeline and has a previous sibling part of the same timeline
                  decomposeRawValue(
                    parent &&
                      prevSibling &&
                      prevSibling.parent.parent === parent
                      ? prevSibling._value
                      : getOriginalAnimatableValue(
                          target,
                          propName,
                          tweenType,
                          animInlineStyles
                        ),
                    toTargetObject
                  );
                }
              }
              if (hasFromvalue) {
                decomposeRawValue(tweenFromValue, fromTargetObject);
              } else {
                if (prevTween) {
                  decomposeTweenValue(prevTween, fromTargetObject);
                } else {
                  decomposeRawValue(
                    parent &&
                      prevSibling &&
                      prevSibling.parent.parent === parent
                      ? prevSibling._value
                      : // No need to get and parse the original value if the tween is part of a timeline and has a previous sibling part of the same timeline
                        getOriginalAnimatableValue(
                          target,
                          propName,
                          tweenType,
                          animInlineStyles
                        ),
                    fromTargetObject
                  );
                }
              }
            }

            // Apply operators
            if (fromTargetObject.o) {
              fromTargetObject.n = getRelativeValue(
                !prevSibling
                  ? decomposeRawValue(
                      getOriginalAnimatableValue(
                        target,
                        propName,
                        tweenType,
                        animInlineStyles
                      ),
                      decomposedOriginalValue
                    ).n
                  : prevSibling._toNumber,
                fromTargetObject.n,
                fromTargetObject.o
              );
            }

            if (toTargetObject.o) {
              toTargetObject.n = getRelativeValue(
                fromTargetObject.n,
                toTargetObject.n,
                toTargetObject.o
              );
            }

            // Values omogenisation in cases of type difference between "from" and "to"
            if (fromTargetObject.t !== toTargetObject.t) {
              if (
                fromTargetObject.t === valueTypes.COMPLEX ||
                toTargetObject.t === valueTypes.COMPLEX
              ) {
                const complexValue =
                  fromTargetObject.t === valueTypes.COMPLEX
                    ? fromTargetObject
                    : toTargetObject;
                const notComplexValue =
                  fromTargetObject.t === valueTypes.COMPLEX
                    ? toTargetObject
                    : fromTargetObject;
                notComplexValue.t = valueTypes.COMPLEX;
                notComplexValue.s = cloneArray(complexValue.s || []) || [];
                // Handle potentially null complex values
                if (complexValue.d && Array.isArray(complexValue.d)) {
                  notComplexValue.d = complexValue.d.map(
                    (_val: number) => notComplexValue.n
                  );
                } else {
                  notComplexValue.d = [notComplexValue.n];
                }
              } else if (
                fromTargetObject.t === valueTypes.UNIT ||
                toTargetObject.t === valueTypes.UNIT
              ) {
                const unitValue =
                  fromTargetObject.t === valueTypes.UNIT
                    ? fromTargetObject
                    : toTargetObject;
                const notUnitValue =
                  fromTargetObject.t === valueTypes.UNIT
                    ? toTargetObject
                    : fromTargetObject;
                notUnitValue.t = valueTypes.UNIT;
                notUnitValue.u = unitValue.u || "";
              } else if (
                fromTargetObject.t === valueTypes.COLOR ||
                toTargetObject.t === valueTypes.COLOR
              ) {
                const colorValue =
                  fromTargetObject.t === valueTypes.COLOR
                    ? fromTargetObject
                    : toTargetObject;
                const notColorValue =
                  fromTargetObject.t === valueTypes.COLOR
                    ? toTargetObject
                    : fromTargetObject;
                notColorValue.t = valueTypes.COLOR;
                notColorValue.s = colorValue.s;
                // Use an explicit array assignment rather than a direct array literal
                const colorArray: number[] = [0, 0, 0, 1];
                notColorValue.d = colorArray;
              }
            }

            // Unit conversion
            if (fromTargetObject.u !== toTargetObject.u) {
              let valueToConvert = toTargetObject.u
                ? fromTargetObject
                : toTargetObject;
              valueToConvert = convertValueUnit(
                target as DOMTarget,
                valueToConvert,
                toTargetObject.u ? toTargetObject.u : fromTargetObject.u,
                false
              );
              // Complete the unit conversion for both from and to values to ensure consistency
              if (
                fromTargetObject.u &&
                toTargetObject.u &&
                fromTargetObject.u !== toTargetObject.u
              ) {
                convertValueUnit(
                  target as DOMTarget,
                  fromTargetObject,
                  toTargetObject.u,
                  false
                );
              }
            }

            // Fill in non existing complex values
            if (
              toTargetObject.d &&
              fromTargetObject.d &&
              Array.isArray(toTargetObject.d) &&
              Array.isArray(fromTargetObject.d) &&
              toTargetObject.d.length !== fromTargetObject.d.length
            ) {
              const longestValue =
                fromTargetObject.d.length > toTargetObject.d.length
                  ? fromTargetObject
                  : toTargetObject;
              const shortestValue =
                longestValue === fromTargetObject
                  ? toTargetObject
                  : fromTargetObject;

              // Make sure both arrays exist before mapping
              if (longestValue.d && shortestValue.d) {
                // Create a properly typed map function with the correct parameter types
                shortestValue.d = longestValue.d.map(
                  (_val: number, i: number) =>
                    shortestValue.d &&
                    i < shortestValue.d.length &&
                    !isUnd(shortestValue.d[i])
                      ? shortestValue.d[i]
                      : 0
                );
                shortestValue.s = cloneArray(longestValue.s || []);
              }
            }

            // Rounding is necessary here to minimize floating point errors
            const tweenUpdateDuration = round(+(tweenDuration || minValue), 12);

            /** @type {Tween} */
            const tween: Tween = {
              parent: this as any,
              id: tweenId++,
              property: propName,
              target: target,
              _value: "", // Initialize with empty string instead of null
              _func: toFunctionStore.func,
              _ease: parseEasings(tweenEasing || "linear"),
              _fromNumbers: cloneArray(fromTargetObject.d || []),
              _toNumbers: cloneArray(toTargetObject.d || []),
              _strings: cloneArray(toTargetObject.s || []),
              _fromNumber: fromTargetObject.n,
              _toNumber: toTargetObject.n,
              _numbers: cloneArray(fromTargetObject.d || []), // For additive tween and animatables
              _number: fromTargetObject.n, // For additive tween and animatables
              _unit: toTargetObject.u || "", // Initialize with empty string instead of null
              _modifier: tweenModifier || ((v) => v),
              _currentTime: 0,
              _startTime: tweenStartTime,
              _delay: +(tweenDelay || 0),
              _updateDuration: tweenUpdateDuration,
              _changeDuration: tweenUpdateDuration,
              _absoluteStartTime: absoluteStartTime,
              // NOTE: Investigate bit packing to stores ENUM / BOOL
              _tweenType: tweenType,
              _valueType: toTargetObject.t,
              _composition: tweenComposition,
              _isOverlapped: 0,
              _isOverridden: 0,
              _renderTransforms: 0,
              _prevRep: undefined as unknown as Tween, // Use undefined with type assertion
              _nextRep: undefined as unknown as Tween, // Use undefined with type assertion
              _prevAdd: undefined as unknown as Tween, // Use undefined with type assertion
              _nextAdd: undefined as unknown as Tween, // Use undefined with type assertion
              _prev: undefined as unknown as Tween, // Use undefined with type assertion
              _next: undefined as unknown as Tween, // Use undefined with type assertion
            };

            if (tweenComposition !== compositionTypes.none) {
              composeTween(tween, siblings as TweenPropertySiblings);
            }

            if (isNaN(firstTweenChangeStartTime)) {
              firstTweenChangeStartTime = tween._startTime;
            }
            // Rounding is necessary here to minimize floating point errors
            lastTweenChangeEndTime = round(
              tweenStartTime + tweenUpdateDuration,
              12
            );
            prevTween = tween;
            animationAnimationLength++;

            addChild(this, tween, undefined);
          }

          // Update animation timings with the added tweens properties

          if (
            isNaN(iterationDelay) ||
            firstTweenChangeStartTime < iterationDelay
          ) {
            iterationDelay = firstTweenChangeStartTime;
          }

          if (
            isNaN(iterationDuration) ||
            lastTweenChangeEndTime > iterationDuration
          ) {
            iterationDuration = lastTweenChangeEndTime;
          }

          // Optimized transform rendering: Set _renderTransforms on the current transform tween
          // and clear it from the previous one for the same target (inline approach)
          if (tweenType === tweenTypes.TRANSFORM) {
            // Clear _renderTransforms from the previous transform tween for this target
            const previousTransformTween =
              lastTransformTweenPerTarget.get(target);
            if (previousTransformTween) {
              previousTransformTween._renderTransforms = 0;

              // Also clear from related additive tweens if using blend composition
              if (
                previousTransformTween._composition ===
                  compositionTypes.blend &&
                additive.animation
              ) {
                forEachChildren(
                  additive.animation as unknown as { _head: any; _tail: any },
                  (additiveTween: Tween) => {
                    if (additiveTween.id === previousTransformTween.id) {
                      additiveTween._renderTransforms = 0;
                    }
                  },
                  true
                );
              }
            }

            // Set _renderTransforms on the current transform tween (this will be the "last" one until a new one is created)
            if (prevTween && prevTween._tweenType === tweenTypes.TRANSFORM) {
              prevTween._renderTransforms = 1;

              // Track this as the last transform tween for this target
              lastTransformTweenPerTarget.set(target, prevTween);

              // Also mark any related additive tweens if using blend composition
              if (
                prevTween._composition === compositionTypes.blend &&
                additive.animation
              ) {
                forEachChildren(
                  additive.animation as unknown as { _head: any; _tail: any },
                  (additiveTween: Tween) => {
                    if (additiveTween.id === prevTween!.id) {
                      additiveTween._renderTransforms = 1;
                    }
                  },
                  true
                );
              }
            }
          }
        }
      }
    }

    if (!targetsLength) {
      console.warn(
        `No target found. Make sure the element you're trying to animate is accessible before creating your animation.`
      );
    }

    if (iterationDelay) {
      forEachChildren(
        this,
        (tween: Tween) => {
          // If (startTime - delay) equals 0, this means the tween is at the begining of the animation so we need to trim the delay too
          if (!(tween._startTime - tween._delay)) {
            tween._delay -= iterationDelay;
          }
          tween._startTime -= iterationDelay;
        },
        true
      );
      iterationDuration -= iterationDelay;
    } else {
      iterationDelay = 0;
    }

    // Prevents iterationDuration to be NaN if no valid animatable props have been provided
    // Prevents _iterationCount to be NaN if no valid animatable props have been provided
    if (!iterationDuration) {
      iterationDuration = minValue;
      this.iterationCount = 0;
    }
    /** @type {TargetsArray} */
    this.targets = parsedTargets;
    /** @type {Number} */
    this.duration =
      iterationDuration === minValue
        ? minValue
        : clampInfinity(
            (iterationDuration + this._loopDelay) * this.iterationCount -
              this._loopDelay
          ) || minValue;
    /** @type {Callback<this>} */
    this.onRender = (onRender || animDefaults.onRender || (() => {})) as any;
    /** @type {EasingFunction} */
    this._ease = animEase || ((t: number) => t);
    /** @type {Number} */
    this._delay = iterationDelay;
    // NOTE: I'm keeping delay values separated from offsets in timelines because delays can override previous tweens and it could be confusing to debug a timeline with overridden tweens and no associated visible delays.
    // this._delay = parent ? 0 : iterationDelay;
    // this._offset += parent ? iterationDelay : 0;
    /** @type {Number} */
    this.iterationDuration = iterationDuration;
    /** @type {{}} */
    this._inlineStyles = animInlineStyles || {};

    if (!this._autoplay && shouldTriggerRender) this.onRender(this);
  }

  /**
   * @param  {Number} newDuration
   * @return {this}
   */
  override stretch(newDuration: number): this {
    const currentDuration = this.duration;
    if (currentDuration === normalizeTime(newDuration)) return this;
    const timeScale = newDuration / currentDuration;
    // NOTE: Find a better way to handle the stretch of an animation after stretch = 0
    forEachChildren(
      this,
      (tween: Tween) => {
        // Rounding is necessary here to minimize floating point errors
        tween._updateDuration = normalizeTime(
          tween._updateDuration * timeScale
        );
        tween._changeDuration = normalizeTime(
          tween._changeDuration * timeScale
        );
        tween._currentTime *= timeScale;
        tween._startTime *= timeScale;
        tween._absoluteStartTime *= timeScale;
      },
      true
    );
    return super.stretch(newDuration);
  }

  /**
   * @return {this}
   */
  refresh(): this {
    forEachChildren(
      this,
      (tween: Tween) => {
        const ogValue = getOriginalAnimatableValue(
          tween.target,
          tween.property,
          tween._tweenType,
          this._inlineStyles
        );
        decomposeRawValue(ogValue, decomposedOriginalValue);
        tween._fromNumbers = cloneArray(decomposedOriginalValue.d || []);
        tween._fromNumber = decomposedOriginalValue.n;
        if (tween._func) {
          decomposeRawValue(tween._func(tween.target, 0), toTargetObject);
          tween._toNumbers = cloneArray(toTargetObject.d || []);
          tween._strings = cloneArray(toTargetObject.s || []);
          tween._toNumber = toTargetObject.n;
        }
      },
      true
    );
    return this;
  }

  /**
   * Cancel the animation and all tweens
   * @return {this}
   */
  override cancel(): this {
    if (this._hasChildren) {
      forEachChildren(
        this,
        (child: Renderable) => {
          if ((child as any).cancel) (child as any).cancel();
        },
        true
      );
    } else {
      forEachChildren(this, removeTweenSliblings, false);
    }
    this._cancelled = 1;
    return this.pause();
  }

  /**
   * Cancel the animation and revert all the values affected by this animation to their original state
   * @return {this}
   */
  override revert(): this {
    super.revert();
    // Use type assertion to handle the return type mismatch
    return cleanInlineStyles(this as unknown as Renderable) as unknown as this;
  }

  /**
   * @param  {Callback<this>} [callback]
   * @return {Promise<this>}
   */
  override then(callback?: Callback<this>): Promise<this> {
    return super.then(callback) as Promise<this>;
  }
}

/**
 * # Create Motion
 * @summary Creates and initializes a new animation
 *
 * This function creates a new JSAnimation instance with the provided targets and parameters,
 * and initializes it for playback.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 *
 * @param {TargetsParam} targets - Elements, selectors, or objects to animate
 * @param {AnimationParams} parameters - Animation parameters and properties
 * @return {JSAnimation} The initialized animation instance
 */
export const createMotion = (
  targets: TargetsParam,
  parameters: AnimationParams
): JSAnimation =>
  new JSAnimation(targets, parameters, undefined, 0, false).init();

/**
 * # Create Motion Animation
 * @summary Creates animatable objects with property-specific animations
 *
 * This class creates objects with properties that can be animated individually.
 * Each property becomes a getter/setter that can be used to animate the specific property.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */
export class Animatable {
  /** Array of animation targets */
  public targets: TargetsArray;
  /** Storage for property animations */
  public animations: Record<string, JSAnimation>;
  /** Dynamic property indexer for animatable properties */
  [key: string]: AnimatableProperty | any;

  /**
   * Creates a new Animatable instance.
   * @param {TargetsParam} targets - Elements or objects to animate
   * @param {AnimatableParams} parameters - Configuration parameters
   */
  constructor(targets: TargetsParam, parameters: AnimatableParams) {
    if (globals.scope) {
      const scope = globals.scope as unknown as Scope;
      if (scope.revertibles) {
        scope.revertibles.push(this as any);
      }
    }

    const globalParams: Record<string, any> = {};
    const properties: Record<string, any> = {};

    this.targets = [];
    this.animations = {};

    if (isUnd(targets) || isUnd(parameters)) return;

    for (const propName in parameters) {
      const paramValue = parameters[propName];
      if (isKey(propName)) {
        properties[propName] = paramValue;
      } else {
        globalParams[propName] = paramValue;
      }
    }

    for (const propName in properties) {
      const propValue = properties[propName];
      const isObjValue = isObj(propValue);

      const propParams: TweenParamsOptions & Record<string, any> = {};
      let to = "+=0";

      if (isObjValue) {
        const unit = (propValue as any).unit;
        if (isStr(unit)) to += unit;
      } else {
        propParams.duration = propValue;
      }

      propParams[propName] = isObjValue ? mergeObjects({ to }, propValue) : to;
      const animParams = mergeObjects(globalParams, propParams);
      animParams.composition = compositionTypes.replace;
      animParams.autoplay = false;

      const animation = (this.animations[propName] = new JSAnimation(
        targets,
        animParams,
        undefined,
        0,
        false
      ).init());
      if (!this.targets.length)
        this.targets.push(...(animation.targets as Target[]));

      // Create the property getter/setter
      const animProperty = (
        to?: TweenParamValue | TweenParamValue[],
        duration?: number,
        ease?: EasingParam
      ): AnimatableObject | number | number[] => {
        const tween = animation._head as Tween;
        if (isUnd(to) && tween) {
          const numbers = tween._numbers;
          if (numbers && numbers.length) {
            return numbers;
          } else {
            return tween._modifier(tween._number) as number;
          }
        } else {
          forEachChildren(
            animation,
            (tween: Tween) => {
              if (isArr(to)) {
                for (let i = 0, l = (to as Array<any>).length; i < l; i++) {
                  if (!isUnd(tween._numbers[i])) {
                    tween._fromNumbers[i] = tween._modifier(
                      tween._numbers[i]
                    ) as number;
                    tween._toNumbers[i] = to[i] as number;
                  }
                }
              } else {
                tween._fromNumber = tween._modifier(tween._number) as number;
                tween._toNumber = to as number;
              }
              if (!isUnd(ease)) tween._ease = parseEasings(ease);
              tween._currentTime = 0;
            },
            false
          );
          if (!isUnd(duration)) animation.stretch(duration);
          animation.reset(1).resume();
          return this as unknown as AnimatableObject;
        }
      };

      // Assign the property to this object
      this[propName] = animProperty;
    }
  }

  /**
   * Reverts all animations and restores original state.
   * @return {this} The current animatable instance
   */
  revert(): this {
    for (const propName in this.animations) {
      this[propName] = noop;
      this.animations[propName].revert();
    }
    this.animations = {};
    this.targets.length = 0;
    return this;
  }
}

/**
 * Creates a new animatable object with the specified parameters.
 * @param {TargetsParam} targets - Elements or objects to animate
 * @param {AnimatableParams} parameters - Configuration parameters
 * @return {AnimatableObject} Animatable object with animation methods
 */
export const createMotionAnimation = (
  targets: TargetsParam,
  parameters: AnimatableParams
): AnimatableObject =>
  new Animatable(targets, parameters) as unknown as AnimatableObject;
