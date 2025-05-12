// Environments

// TODO: Do we need to check if we're running inside a worker ?
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

export const isRegisteredTargetSymbol = Symbol();
export const isDomSymbol = Symbol();
export const isSvgSymbol = Symbol();
export const transformsSymbol = Symbol();
export const morphPointsSymbol = Symbol();
export const morphTargetsSymbol = Symbol();
export const proxyTargetSymbol = Symbol();

// Numbers

export const minValue = 1e-11;
export const maxValue = 1e12;
export const K = 1e3;
export const maxFps = 120;

// Strings

export const emptyString = '';
export const shortTransforms = new Map();

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

export const transformsFragmentStrings = validTransforms.reduce((a, v) => ({...a, [v]: v + '('}), {});

// Functions

/** @return {void} */
export const noop = () => {};

/** @return {Boolean} */
export const isPath = (target) => target.tagName === 'path';

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
