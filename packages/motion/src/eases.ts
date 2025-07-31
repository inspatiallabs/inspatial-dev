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


import { minValue, emptyString } from "./consts.ts";

// Import math helpers 
import { 
  isStr,
  isFnc,
  parseNumber,
  clamp,
  sqrt,
  cos,
  sin,
  ceil,
  floor,
  abs,
  asin,
  PI,
  pow,
  isUnd,
} from "./helpers.ts";

import type { EasingFunction, EasingParam } from "./types.ts";

export type { EasingFunction, EasingParam } from "./types.ts";

const halfPI = PI / 2;
const doublePI = PI * 2;

/** Basic identity function */
export const none = (t: number): number => t;

// Cubic Bezier solver adapted from https://github.com/gre/bezier-ease © Gaëtan Renaudeau

/**
 * Calculate bezier value
 * @param  {number} aT - Time value
 * @param  {number} aA1 - First anchor point
 * @param  {number} aA2 - Second anchor point
 * @return {number} - Calculated value
 */
const calcBezier = (aT: number, aA1: number, aA2: number): number =>
  (((1 - 3 * aA2 + 3 * aA1) * aT + (3 * aA2 - 6 * aA1)) * aT + 3 * aA1) * aT;

/**
 * Binary subdivision to find bezier point
 * @param  {number} aX - X coordinate
 * @param  {number} mX1 - X1 control point
 * @param  {number} mX2 - X2 control point
 * @return {number} - Time value
 */
const binarySubdivide = (aX: number, mX1: number, mX2: number): number => {
  let aA = 0,
    aB = 1,
    currentX,
    currentT,
    i = 0;
  do {
    currentT = aA + (aB - aA) / 2;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (abs(currentX) > 0.0000001 && ++i < 100);
  return currentT;
};

/**
 * Cubic bezier easing function
 * @param  {number} [mX1=0.5] - X1 control point
 * @param  {number} [mY1=0.0] - Y1 control point
 * @param  {number} [mX2=0.5] - X2 control point
 * @param  {number} [mY2=1.0] - Y2 control point
 * @return {EasingFunction} - Easing function
 */
export const cubicBezier = (mX1 = 0.5, mY1 = 0.0, mX2 = 0.5, mY2 = 1.0): EasingFunction =>
  mX1 === mY1 && mX2 === mY2
    ? none
    : (t: number): number =>
        t === 0 || t === 1
          ? t
          : calcBezier(binarySubdivide(t, mX1, mX2), mY1, mY2);

/**
 * Steps ease implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function
 * Only covers 'end' and 'start' jumpterms
 * @param  {number} steps - Number of steps
 * @param  {boolean} [fromStart] - Whether to start from the beginning
 * @return {EasingFunction} - Easing function
 */
export const steps = (steps = 10, fromStart?: boolean): EasingFunction => {
  const roundMethod = fromStart ? ceil : floor;
  return (t: number): number => roundMethod(clamp(t, 0, 1) * steps) * (1 / steps);
};

/**
 * Without parameters, the linear function creates a non-eased transition.
 * Parameters, if used, creates a piecewise linear easing by interpolating linearly between the specified points.
 * @param  {...(string|number)} [args] - Points
 * @return {EasingFunction} - Easing function
 */
const linear = (...args: Array<string | number>): EasingFunction => {
  const argsLength = args.length;
  if (!argsLength) return none;
  const totalPoints = argsLength - 1;
  const firstArg = args[0];
  const lastArg = args[totalPoints];
  const xPoints = [0];
  const yPoints = [parseNumber(firstArg)];
  for (let i = 1; i < totalPoints; i++) {
    const arg = args[i];
    const splitValue = isStr(arg)
      ? (arg as string).trim().split(" ")
      : [arg];
    const value = splitValue[0];
    const percent = splitValue[1];
    xPoints.push(
      !isUnd(percent) ? parseNumber(percent) / 100 : i / totalPoints
    );
    yPoints.push(parseNumber(value));
  }
  yPoints.push(parseNumber(lastArg));
  xPoints.push(1);
  const linearFn = function easeLinear(t: number): number {
    for (let i = 1, l = xPoints.length; i < l; i++) {
      const currentX = xPoints[i];
      if (t <= currentX) {
        const prevX = xPoints[i - 1];
        const prevY = yPoints[i - 1];
        return (
          prevY + ((yPoints[i] - prevY) * (t - prevX)) / (currentX - prevX)
        );
      }
    }
    return yPoints[yPoints.length - 1];
  };
  return linearFn;
};

/**
 * Generate random steps
 * @param  {number} [length=10] - The number of steps
 * @param  {number} [randomness=1] - How strong the randomness is
 * @return {EasingFunction} - Easing function
 */
const irregular = (length = 10, randomness = 1): EasingFunction => {
  const values = [0];
  const total = length - 1;
  for (let i = 1; i < total; i++) {
    const previousValue = values[i - 1];
    const spacing = i / total;
    const segmentEnd = (i + 1) / total;
    const randomVariation = spacing + (segmentEnd - spacing) * Math.random();
    // Mix the even spacing and random variation based on the randomness parameter
    const randomValue =
      spacing * (1 - randomness) + randomVariation * randomness;
    values.push(clamp(randomValue, previousValue, 1));
  }
  values.push(1);
  return linear(...values);
};

// Easing functions adapted from http://www.robertpenner.com/ease © Robert Penner

/**
 * Power easing function factory
 */
export type PowerEasing = (power?: number) => EasingFunction;

/**
 * Back easing function factory
 */
export type BackEasing = (overshoot?: number) => EasingFunction;

/**
 * Elastic easing function factory
 */
export type ElasticEasing = (amplitude?: number, period?: number) => EasingFunction;

/**
 * Generic ease factory
 */
export type EaseFactory = (paramA?: number, paramB?: number) => EasingFunction;

/** All possible easing factories */
export type EasesFactory = PowerEasing | BackEasing | ElasticEasing;

/** Power easing factory */
export const easeInPower: PowerEasing =
  (p = 1.68) =>
  (t: number): number =>
    pow(t, +p);

/** 
 * Dictionary of built-in easing functions 
 */
type EaseInFunctionsType = {
  [key: string]: EasesFactory | EasingFunction;
};

/** Default easing functions */
const easeInFunctions: EaseInFunctionsType = {
  [emptyString]: easeInPower,
  Quad: easeInPower(2),
  Cubic: easeInPower(3),
  Quart: easeInPower(4),
  Quint: easeInPower(5),
  Sine: (t: number): number => 1 - cos(t * halfPI),
  Circ: (t: number): number => 1 - sqrt(1 - t * t),
  Expo: (t: number): number => (t ? pow(2, 10 * t - 10) : 0),
  Bounce: (t: number): number => {
    let pow2,
      b = 4;
    while (t < ((pow2 = pow(2, --b)) - 1) / 11);
    return 1 / pow(4, 3 - b) - 7.5625 * pow((pow2 * 3 - 2) / 22 - t, 2);
  },
  Back: (overshoot = 1.70158) =>
    (t: number): number =>
      (+overshoot + 1) * t * t * t - +overshoot * t * t,
  Elastic: (amplitude = 1, period = 0.3) => {
    const a = clamp(+amplitude, 1, 10);
    const p = clamp(+period, minValue, 2);
    const s = (p / doublePI) * asin(1 / a);
    const e = doublePI / p;
    return (t: number): number =>
      t === 0 || t === 1
        ? t
        : -a * pow(2, -10 * (1 - t)) * sin((1 - t - s) * e);
  },
};

/**
 * Ease type function
 */
export type EaseType = (easeIn: EasingFunction) => EasingFunction;

/**
 * Dictionary of easing type modifiers 
 */
type EaseTypesRecord = {
  [key: string]: EaseType;
};

/** Easing type modifiers */
export const easeTypes: EaseTypesRecord = {
  in: (easeIn: EasingFunction) => (t: number): number => easeIn(t),
  out: (easeIn: EasingFunction) => (t: number): number => 1 - easeIn(1 - t),
  inOut: (easeIn: EasingFunction) => (t: number): number =>
    t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn(t * -2 + 2) / 2,
  outIn: (easeIn: EasingFunction) => (t: number): number =>
    t < 0.5 ? (1 - easeIn(1 - t * 2)) / 2 : (easeIn(t * 2 - 1) + 1) / 2,
};

/**
 * Parse an easing string into a function
 * @param  {string} easingString - Easing string to parse
 * @param  {Record<string, EasesFactory|EasingFunction>} easesFunctions - Available easing functions
 * @param  {Record<string, EasingFunction>} easesLookups - Cache of parsed easing functions
 * @return {EasingFunction} - Parsed easing function
 */
export const parseEaseString = (
  easingString: string, 
  easesFunctions: Record<string, EasesFactory | EasingFunction>,
  easesLookups: Record<string, EasingFunction>
): EasingFunction => {
  if (easesLookups[easingString]) return easesLookups[easingString];
  if (easingString.indexOf("(") <= -1) {
    const hasParams =
      Object.prototype.hasOwnProperty.call(easeTypes, easingString) ||
      easingString.includes("Back") ||
      easingString.includes("Elastic");
    const parsedFn = hasParams
      ? (easesFunctions[easingString] as EasesFactory)()
      : easesFunctions[easingString] as EasingFunction;
    return parsedFn ? (easesLookups[easingString] = parsedFn) : none;
  } else {
    const split = easingString.slice(0, -1).split("(");
    const parsedFn = easesFunctions[split[0]] as EasesFactory;
    return parsedFn
      ? (easesLookups[easingString] = parsedFn(...split[1].split(",").map(parseNumber)))
      : none;
  }
};

type EaseFactoryFunction = (...args: Array<string | number>) => EasingFunction;

/**
 * Complete easing functions collection
 */
export type EasesFunctions = {
  [key: string]: EasingFunction | EasesFactory | EaseFactoryFunction;
  linear: EaseFactoryFunction;
  irregular: typeof irregular;
  steps: typeof steps;
  cubicBezier: typeof cubicBezier;
  in: PowerEasing;
  out: PowerEasing;
  inOut: PowerEasing;
  outIn: PowerEasing;
  inQuad: EasingFunction;
  outQuad: EasingFunction;
  inOutQuad: EasingFunction;
  outInQuad: EasingFunction;
  inCubic: EasingFunction;
  outCubic: EasingFunction;
  inOutCubic: EasingFunction;
  outInCubic: EasingFunction;
  inQuart: EasingFunction;
  outQuart: EasingFunction;
  inOutQuart: EasingFunction;
  outInQuart: EasingFunction;
  inQuint: EasingFunction;
  outQuint: EasingFunction;
  inOutQuint: EasingFunction;
  outInQuint: EasingFunction;
  inSine: EasingFunction;
  outSine: EasingFunction;
  inOutSine: EasingFunction;
  outInSine: EasingFunction;
  inCirc: EasingFunction;
  outCirc: EasingFunction;
  inOutCirc: EasingFunction;
  outInCirc: EasingFunction;
  inExpo: EasingFunction;
  outExpo: EasingFunction;
  inOutExpo: EasingFunction;
  outInExpo: EasingFunction;
  inBounce: EasingFunction;
  outBounce: EasingFunction;
  inOutBounce: EasingFunction;
  outInBounce: EasingFunction;
  inBack: BackEasing;
  outBack: BackEasing;
  inOutBack: BackEasing;
  outInBack: BackEasing;
  inElastic: ElasticEasing;
  outElastic: ElasticEasing;
  inOutElastic: ElasticEasing;
  outInElastic: ElasticEasing;
};

/** Compiled list of all easing functions */
// @ts-ignore - We know this is correct, but TypeScript's type system can't fully express the relationship
export const eases: EasesFunctions = /*#__PURE__*/ (() => {
  // Create a dictionary to store all easing functions
  const list: Record<string, unknown> = { 
    linear, 
    irregular, 
    steps, 
    cubicBezier 
  };
  
  for (const type in easeTypes) {
    if (Object.prototype.hasOwnProperty.call(easeTypes, type)) {
      for (const name in easeInFunctions) {
        if (Object.prototype.hasOwnProperty.call(easeInFunctions, name)) {
          const easeIn = easeInFunctions[name];
          const easeType = easeTypes[type];
          const typedName = type + name;
          
          if (name === emptyString || name === "Back" || name === "Elastic") {
            list[typedName] = function(a?: number | string, b?: number | string): number {
              const numA = typeof a === 'string' ? parseNumber(a) : a;
              const numB = typeof b === 'string' ? parseNumber(b) : b;
              const easingFn = (easeIn as EasesFactory)(numA, numB);
              return function(t: number): number {
                return easeType(easingFn)(t);
              } as unknown as number;
            };
          } else {
            list[typedName] = function(t: number): number {
              return easeType(easeIn as EasingFunction)(t);
            };
          }
        }
      }
    }
  }
  
  return list as unknown as EasesFunctions;
})();

/** Cache of parsed easing functions */
const JSEasesLookups: Record<string, EasingFunction> = { linear: none };

/**
 * Parse easing parameter into an easing function
 * @param  {EasingParam} ease - Easing parameter to parse
 * @return {EasingFunction} - Parsed easing function
 */
export const parseEasings = (ease: EasingParam): EasingFunction =>
  isFnc(ease)
    ? ease as EasingFunction
    : isStr(ease)
    // @ts-ignore - We know the eases object is valid, TypeScript can't express this complex type relationship
    ? parseEaseString(ease as string, eases, JSEasesLookups)
    : none;
