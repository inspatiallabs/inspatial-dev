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

import { defaults, globals, globalVersions } from "./globals.ts";

import { tickModes, isBrowser, K, doc, minValue } from "./consts.ts";

import { now, forEachChildren, removeChild, round } from "./helpers.ts";

import { InMotionClock } from "./clock.ts";

import { tick } from "./render.ts";

import type { Tickable } from "./types.ts";

// Define types for Deno environment
type DenoTimeout = number;

// Use setTimeout for Deno instead of setImmediate for Node.js
const denoImmediate = (callback: () => void): number =>
  setTimeout(callback, 0) as unknown as number;
const denoClearImmediate = (id: number): void => clearTimeout(id);

// Use constants instead of exported variables to avoid conflicts
const browserTickMethod: ((callback: () => void) => number) | undefined = isBrowser
  ? globalThis.requestAnimationFrame?.bind(globalThis)
  : denoImmediate;

const browserCancelMethod: ((id: number) => void) | undefined = isBrowser
  ? globalThis.cancelAnimationFrame?.bind(globalThis)
  : denoClearImmediate;

/**
 * # InMotion Engine
 * @summary Core animation InMotion that powers all motion functionality
 *
 * The Engine class handles the animation loop and manages tickable objects.
 * It provides methods for requesting animation frames, computing delta time,
 * and managing animation timing.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */
export class InMotionEngine extends InMotionClock {
  /**
   * Whether to use the default main loop for animations
   */
  public useDefaultMainLoop: boolean = true;

  /**
   * Whether to pause animations when the document is hidden
   */
  public pauseOnDocumentHidden: boolean = true;

  /**
   * Default animation parameters
   */
  public defaults: Record<string, any>;

  /**
   * Whether the engine is currently paused
   */
  public paused: boolean = false;

  /**
   * Request animation frame ID
   */
  public reqId: number | null = null;

  /**
   * Creates a new InMotionEngine instance
   * @param initTime - Initial time value for the engine
   */
  constructor(initTime?: number) {
    const time = initTime !== undefined ? initTime : now();
    super(time); // Pass the time to parent constructor
    this.defaults = { ...defaults }; // Create a copy of defaults
    // Set default FPS to 60 instead of maxFps (120)
    this._fps = 60;
    this._frameDuration = round(K / 60, 0);
  }

  /**
   * Request an animation tick
   * @param _time - Current time (unused in base implementation)
   * @returns Tick mode value (number)
   */
  override requestTick(_time: number): number {
    return tickModes.AUTO; // Return a number instead of boolean
  }

  /**
   * Compute delta time between frames
   * @param time - Current time
   */
  override computeDeltaTime(time: number): number {
    const delta = (time - this._lastTime) * this._speed;
    this.deltaTime = delta;
    this._lastTime = time;
    this._currentTime = time;
    this._elapsedTime += Math.abs(delta); // Use absolute value to prevent negative accumulation
    return this.deltaTime;
  }

  /**
   * Update all tickable objects
   */
  update(): this {
    const time = (this._currentTime = now());
    if (this.requestTick(time) === tickModes.AUTO) {
      this.computeDeltaTime(time);
      const InMotionSpeed = this._speed;
      const InMotionFps = this._fps;
      let activeTickable = this._head as Tickable;

      while (activeTickable) {
        const nextTickable = (activeTickable as any)._next as Tickable;

        if (!activeTickable.paused) {
          // Ensure we only pass the expected number of arguments to tick
          tick(
            activeTickable as any, // Type assertion to handle interface mismatch
            activeTickable.deltaTime,
            this._elapsedTime,
            InMotionSpeed,
            InMotionFps
          );
        } else {
          removeChild(this as any, activeTickable); // Type assertion for protected property access
          this._hasChildren = !!this._tail;

          if (typeof (activeTickable as any)._running !== "undefined") {
            (activeTickable as any)._running = false;
          }

          if (
            activeTickable.completed &&
            typeof (activeTickable as any)._cancelled !== "undefined" &&
            !(activeTickable as any)._cancelled &&
            typeof (activeTickable as any).cancel === "function"
          ) {
            (activeTickable as any).cancel();
          }
        }

        activeTickable = nextTickable;
      }
    }
    return this;
  }

  /**
   * Wake the animation InMotion
   */
  wake(): this {
    if (this.reqId) return this;
    if (typeof globalThis !== "undefined" && globalThis.requestAnimationFrame) {
      this.reqId = globalThis.requestAnimationFrame(tickEngine);
    }
    return this;
  }

  /**
   * Cancel animation frame request
   */
  sleep(): this {
    if (
      typeof globalThis !== "undefined" &&
      globalThis.cancelAnimationFrame &&
      this.reqId
    ) {
      globalThis.cancelAnimationFrame(this.reqId);
    }
    this.reqId = null;
    return this;
  }

  /**
   * Pause all animations
   */
  pause(): this {
    if (this.paused) return this;
    this.paused = true;
    return this.sleep();
  }

  /**
   * Resume all animations
   */
  resume(): this {
    if (!this.paused) return this;
    this.paused = false;
    forEachChildren(
      this as any, // Type assertion for protected property access
      (child: Tickable) => {
        if (typeof (child as any).resetTime === "function") {
          (child as any).resetTime();
        }
      },
      true,
      undefined,
      undefined
    );
    return this.wake();
  }

  /**
   * Get the current playback speed
   */
  override get speed(): number {
    return this._speed * (globals.timeScale === 1 ? 1 : K);
  }

  /**
   * Set the playback speed with validation
   */
  override set speed(playbackRate: number) {
    // Validate and clamp speed values
    const pbr = +playbackRate;
    if (isNaN(pbr) || pbr <= 0) {
      this._speed = minValue; // Use minimum valid value instead of invalid input
    } else {
      this._speed = pbr;
    }

    forEachChildren(
      this as any, // Type assertion for protected property access
      (child: Tickable) => {
        if (typeof (child as any)._speed !== "undefined") {
          (child as any).speed = (child as any)._speed;
        }
      },
      true,
      undefined,
      undefined
    );
  }

  /**
   * Get the current frames per second setting
   */
  override get fps(): number {
    return this._fps;
  }

  /**
   * Set the FPS with validation
   */
  override set fps(frameRate: number) {
    // Validate and clamp fps values
    const fr = +frameRate;
    if (isNaN(fr) || fr <= 0) {
      super.fps = minValue; // Use minimum valid value instead of invalid input
    } else {
      super.fps = fr;
    }
  }

  /**
   * Change the timing scale
   * @param scale - Factor to scale by
   */
  timeScale(scale: number): void {
    const scaleFactor = scale * K || K;
    globals.timeScale = scaleFactor;

    // Track parameters that need scaling
    if (this.defaults.duration !== undefined) {
      this.defaults.duration *= scaleFactor;
      this._speed *= scaleFactor;
    }
  }

  /**
   * Set a specific animation property
   * @param key - Property name
   * @param value - Property value
   */
  set(key: string, value: any): this {
    this.defaults[key] = value;
    return this;
  }

  /**
   * Get a specific animation property
   * @param key - Property name
   */
  get(key: string): any {
    return this.defaults[key];
  }

  /**
   * Remove a specific animation property
   * @param key - Property name
   */
  remove(key: string): this {
    delete this.defaults[key];
    return this;
  }

  /**
   * Reset all animation defaults to empty state
   */
  reset(): this {
    this.defaults = {}; // Clear all defaults
    return this;
  }

  /**
   * Check if InMotion has active animations
   */
  hasActiveAnimations(): boolean {
    return !!this._head;
  }

  /**
   * Checks if the engine has any active children
   *
   * @returns {boolean} True if the engine has active children
   */
  hasChildren(): boolean {
    // @ts-ignore: Accessing protected property for testing
    return !!this._head;
  }
}

// Define a local function for requestAnimationFrame handling
let localTickMethod: (callback: FrameRequestCallback) => number;
let InMotion: InMotionEngine;

if (typeof globalThis !== "undefined" && globalThis.requestAnimationFrame) {
  localTickMethod = globalThis.requestAnimationFrame.bind(globalThis);
  InMotion = new InMotionEngine(now());
  if (isBrowser) {
    globalVersions.inMotionEngine = InMotion as any;
    if (doc && typeof doc.addEventListener === "function") {
      doc.addEventListener("visibilitychange", () => {
        if (!InMotion.pauseOnDocumentHidden) return;
        doc && doc.hidden ? InMotion.pause() : InMotion.resume(); // Add null check for doc
      });
    }
  }
} else {
  // Use setTimeout for non-browser environments
  localTickMethod = (callback) =>
    setTimeout(() => callback(now()), 16) as unknown as number;
  InMotion = new InMotionEngine(now());
}

/**
 * Function to request a new animation frame
 */
const tickEngine = () => {
  if (InMotion.hasActiveAnimations()) {
    InMotion.reqId = localTickMethod(tickEngine);
    InMotion.update();
  } else {
    InMotion.sleep();
  }
};

InMotion.wake();

// Export both the browser methods and the InMotion instance
export {
  browserTickMethod as InMotionTickMethod,
  browserCancelMethod as InMotionCancelMethod,
  InMotion,
};
