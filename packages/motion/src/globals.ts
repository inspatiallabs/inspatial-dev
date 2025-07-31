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
  noop,
  maxFps,
  compositionTypes,
  win,
  doc,
  isBrowser,
} from "./consts.ts";

import type { DefaultsParams, Scope } from "./types.ts";

// Define interface for global InMotion property
interface WindowWithInMotion extends Window {
  InMotion?: Array<Record<string, any>>;
}

/**
 * Default animation parameters
 * @type {DefaultsParams}
 */
export const defaults: DefaultsParams = {
  id: undefined,
  keyframes: undefined,
  playbackEase: undefined,
  playbackRate: 1,
  frameRate: maxFps,
  loop: 0,
  reversed: false,
  alternate: false,
  autoplay: true,
  duration: K,
  delay: 0,
  loopDelay: 0,
  ease: "out(2)",
  composition: compositionTypes.replace,
  modifier: (v: any) => v,
  onBegin: noop,
  onBeforeUpdate: noop,
  onUpdate: noop,
  onLoop: noop,
  onPause: noop,
  onComplete: noop,
  onRender: noop,
};

/**
 * Global configuration settings for the animation engine
 */
export const globals = {
  /** @type {DefaultsParams} */
  defaults,
  /** @type {Document|DOMTarget} */
  root: doc,
  /** @type {Scope} */
  scope: null as Scope | null,
  /** @type {Number} */
  precision: 4,
  /** @type {Number} */
  timeScale: 1,
  /** @type {Number} */
  tickThreshold: 200,
};

/**
 * Global version information
 */
export const globalVersions = {
  version: "__packageVersion__",
  inMotionEngine: null,
};

// Add the library version to the window object if browser environment
if (isBrowser && win) {
  // Safely access and modify window object
  const typedWin = win as WindowWithInMotion;

  // Initialize InMotion array if it doesn't exist
  if (!typedWin.InMotion) {
    typedWin.InMotion = [];
  }

  // Add this instance to the array
  typedWin.InMotion.push(globalVersions);
}
