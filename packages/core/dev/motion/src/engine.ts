import { defaults, globals, globalVersions } from "./globals.ts";

import { tickModes, isBrowser, K, doc } from "./consts.ts";

import { now, forEachChildren, removeChild } from "./helpers.ts";

import { Clock } from "./clock.ts";

import { tick } from "./render.ts";

import type { Tickable } from "./types.ts";

// Define types for Deno environment
type DenoTimeout = number;

// Use setTimeout for Deno instead of setImmediate for Node.js
const denoImmediate = (callback: () => void): number =>
  setTimeout(callback, 0) as unknown as number;
const denoClearImmediate = (id: number): void => clearTimeout(id);

// Use constants instead of exported variables to avoid conflicts
const browserTickMethod = isBrowser
  ? globalThis.requestAnimationFrame?.bind(globalThis)
  : denoImmediate;

const browserCancelMethod = isBrowser
  ? globalThis.cancelAnimationFrame?.bind(globalThis)
  : denoClearImmediate;

/**
 * # Animation Engine
 * @summary Core animation engine that powers all motion functionality
 *
 * The Engine class handles the animation loop and manages tickable objects.
 * It provides methods for requesting animation frames, computing delta time,
 * and managing animation timing.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */
export class Engine extends Clock {
  /**
   * Whether to use the default main animation loop
   */
  public useDefaultMainLoop: boolean = true;

  /**
   * Whether to pause animations when document is hidden
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
   * Request ID for the animation frame
   */
  public reqId: number | null = null;

  /**
   * Creates a new Engine instance
   * @param initTime - Initial time for the engine
   */
  constructor(initTime?: number) {
    super();
    this.defaults = defaults;
    const time = initTime || now();
    this._startTime = time;
    this._lastTime = time;
    this._elapsedTime = 0;
  }

  /**
   * Request an animation tick
   * @param time - Current time
   * @returns Tick mode value (number)
   */
  override requestTick(time: number): number {
    return tickModes.AUTO; // Return a number instead of boolean
  }

  /**
   * Compute delta time between frames
   * @param time - Current time
   */
  override computeDeltaTime(time: number): number {
    this.deltaTime = (time - this._lastTime) * this._speed;
    this._lastTime = time;
    this._elapsedTime += this.deltaTime;
    return this.deltaTime;
  }

  /**
   * Update all tickable objects
   */
  update(): this {
    const time = (this._currentTime = now());
    if (this.requestTick(time) === tickModes.AUTO) {
      this.computeDeltaTime(time);
      const engineSpeed = this._speed;
      const engineFps = this._fps;
      let activeTickable = this._head as Tickable;

      while (activeTickable) {
        const nextTickable = (activeTickable as any)._next as Tickable;

        if (!activeTickable.paused) {
          // Ensure we only pass the expected number of arguments to tick
          tick(
            activeTickable,
            activeTickable.deltaTime,
            this._elapsedTime,
            engineSpeed,
            engineFps
          );
        } else {
          removeChild(this, activeTickable);
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
   * Wake the animation engine
   */
  wake(): this {
    if (this.reqId) return this;
    if (typeof window !== "undefined") {
      this.reqId = window.requestAnimationFrame(tickEngine);
    }
    return this;
  }

  /**
   * Cancel animation frame request
   */
  sleep(): this {
    if (typeof window !== "undefined" && this.reqId) {
      window.cancelAnimationFrame(this.reqId);
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
      this,
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
   * Set the playback speed
   */
  override set speed(playbackRate: number) {
    this._speed = playbackRate * globals.timeScale;
    forEachChildren(
      this,
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
   * Reset all animation properties
   */
  reset(): this {
    this.defaults = defaults;
    return this;
  }

  /**
   * Check if engine has active animations
   */
  hasActiveAnimations(): boolean {
    return !!this._head;
  }
}

// Define a local function for requestAnimationFrame handling
let localTickMethod: (callback: FrameRequestCallback) => number;
let engine: Engine;

if (typeof window !== "undefined") {
  localTickMethod = window.requestAnimationFrame.bind(window);
  engine = new Engine(now());
  if (isBrowser) {
    globalVersions.engine = engine as any;
    doc?.addEventListener("visibilitychange", () => {
      if (!engine.pauseOnDocumentHidden) return;
      doc?.hidden ? engine.pause() : engine.resume();
    });
  }
} else {
  // Use setTimeout for non-browser environments
  localTickMethod = (callback) =>
    setTimeout(() => callback(now()), 16) as unknown as number;
  engine = new Engine(now());
}

/**
 * Function to request a new animation frame
 */
const tickEngine = () => {
  if (engine.hasActiveAnimations()) {
    engine.reqId = localTickMethod(tickEngine);
    engine.update();
  } else {
    engine.sleep();
  }
};

engine.wake();

// Export both the browser methods and the engine instance
export {
  browserTickMethod as engineTickMethod,
  browserCancelMethod as engineCancelMethod,
  engine,
};
