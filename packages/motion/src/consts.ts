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

// TODO(@benemma): Create/use a universal util that helps detect if we're running inside a worker Ideally this should be added on the user-agent features we have on InSpatial Cloud
export const isBrowser = typeof window !== 'undefined';

/** @type {Object|Null} */
export const win = isBrowser ? window : null;

/** @type {Document} */
export const doc = isBrowser ? document : null;

// Arrays

/** @type {Array} */
export const emptyArray = [];

// Enums

/** @enum {Number} */
export const tweenTypes = {
  OBJECT: 0,
  ATTRIBUTE: 1,
  CSS: 2,
  TRANSFORM: 3,
  CSS_VAR: 4,
}

/** @enum {Number} */
export const valueTypes = {
  NUMBER: 0,
  UNIT: 1,
  COLOR: 2,
  COMPLEX: 3,
}

/** @enum {Number} */
export const tickModes = {
  NONE: 0,
  AUTO: 1,
  FORCE: 2,
}

/** @enum {Number} */
export const compositionTypes = {
  replace: 0,
  none: 1,
  blend: 2,
}

// Cache symbols

export const isRegisteredTargetSymbol: symbol = Symbol();
export const isDomSymbol: symbol = Symbol();
export const isSvgSymbol: symbol = Symbol();
export const transformsSymbol: symbol = Symbol();
export const morphPointsSymbol: symbol = Symbol();
export const morphTargetsSymbol: symbol = Symbol();
export const proxyTargetSymbol: symbol = Symbol();

// Numbers

export const minValue = 1e-11;
export const maxValue = 1e12;
export const K = 1e3;
export const maxFps = 120;

// Strings

export const emptyString = '';
export const shortTransforms: Map<string, string> = new Map();

shortTransforms.set('x', 'translateX');
shortTransforms.set('y', 'translateY');
shortTransforms.set('z', 'translateZ');

export const validTransforms = [
  'translateX',
  'translateY',
  'translateZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'skew',
  'skewX',
  'skewY',
  'perspective',
  'matrix',
  'matrix3d',
];

export const transformsFragmentStrings: Record<string, string> = validTransforms.reduce((a, v) => ({...a, [v]: v + '('}), {});

// Functions

/** @return {void} */
export const noop = () => {};

/** @return {Boolean} */
export const isPath = (target: any) => target.tagName === 'path';

// Regex

export const hexTestRgx = /(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i;
export const rgbExecRgx = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i
export const rgbaExecRgx = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i
export const hslExecRgx = /hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i;
export const hslaExecRgx = /hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
// export const digitWithExponentRgx = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
export const digitWithExponentRgx = /[-+]?\d*\.?\d+(?:e[-+]?\d)?/gi;
// export const unitsExecRgx = /^([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)+([a-z]+|%)$/i;
export const unitsExecRgx = /^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([a-z]+|%)$/i
export const lowerCaseRgx = /([a-z])([A-Z])/g;
export const transformsExecRgx = /(\w+)(\([^)]+\)+)/g; // Match inline transforms with cacl() values, returns the value wrapped in ()
export const relativeValuesExecRgx = /(\*=|\+=|-=)/;
