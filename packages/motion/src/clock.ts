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


import { K, maxFps, minValue, tickModes } from "./consts.ts";

import { round } from "./helpers.ts";

import type { Tickable, Tween } from "./types.ts";

/**
 * # InMotionClock
 * @summary Base class to control framerate and playback rate
 *
 * The InMotionClock class provides foundational timing functionality that is inherited by
 * Engine, Timer, Animation and Timeline classes. It manages time calculations,
 * frame rates, and playback speed.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */
export class InMotionClock {
  /** Delta time between the current and previous frame */
  public deltaTime: number;

  /** Current time of the clock */
  protected _currentTime: number;

  /** Elapsed time since the clock started */
  protected _elapsedTime: number;

  /** Time when the clock started */
  protected _startTime: number;

  /** Last time the clock was updated */
  protected _lastTime: number;

  /** Time scheduled for the next frame */
  protected _scheduledTime: number;

  /** Duration of a single frame based on fps */
  protected _frameDuration: number;

  /** Frames per second */
  protected _fps: number;

  /** Playback speed multiplier */
  protected _speed: number;

  /** Whether the clock has children */
  protected _hasChildren: boolean;

  /** First child in the linked list */
  protected _head: Tickable | Tween | null;

  /** Last child in the linked list */
  protected _tail: Tickable | Tween | null;

  /**
   * Creates a new InMotionClock instance
   * @param initTime - Initial time value for the clock
   */
  constructor(initTime = 0) {
    this.deltaTime = 0;
    this._currentTime = initTime;
    this._elapsedTime = initTime;
    this._startTime = initTime;
    this._lastTime = initTime;
    this._scheduledTime = 0;
    this._frameDuration = round(K / maxFps, 0);
    this._fps = maxFps;
    this._speed = 1;
    this._hasChildren = false;
    this._head = null;
    this._tail = null;
  }

  /**
   * Gets the tail of the linked list (for testing purposes)
   * @returns The last child in the linked list
   */
  getTail(): Tickable | Tween | null {
    return this._tail;
  }

  /**
   * Iterates over each child in the linked list (for testing purposes)
   * @param callback - Function to call for each child
   */
  forEachChild(callback: (child: Tickable | Tween) => void): void {
    let child = this._head;
    while (child) {
      callback(child);
      child = (child as any)._next;
    }
  }

  /**
   * Gets the current frames per second setting
   */
  get fps(): number {
    return this._fps;
  }

  /**
   * Sets the frames per second, adjusting frame duration accordingly
   * @param frameRate - The new frame rate to set
   */
  set fps(frameRate: number) {
    const previousFrameDuration = this._frameDuration;
    const fr = +frameRate;
    const fps = fr < minValue ? minValue : fr;
    const frameDuration = round(K / fps, 0);
    this._fps = fps;
    this._frameDuration = frameDuration;
    this._scheduledTime += frameDuration - previousFrameDuration;
  }

  /**
   * Gets the current playback speed
   */
  get speed(): number {
    return this._speed;
  }

  /**
   * Sets the playback speed
   * @param playbackRate - The new playback rate to set
   */
  set speed(playbackRate: number) {
    const pbr = +playbackRate;
    this._speed = pbr < minValue ? minValue : pbr;
  }

  /**
   * Requests a tick based on the current time
   * @param time - Current time
   * @returns The tick mode (AUTO or NONE)
   */
  requestTick(time: number): number {
    const scheduledTime = this._scheduledTime;
    const elapsedTime = this._elapsedTime;
    this._elapsedTime += time - elapsedTime;
    // If the elapsed time is lower than the scheduled time
    // this means not enough time has passed to hit one frameDuration
    // so skip that frame
    if (elapsedTime < scheduledTime) return tickModes.NONE;
    const frameDuration = this._frameDuration;
    const frameDelta = elapsedTime - scheduledTime;
    // Ensures that _scheduledTime progresses in steps of at least 1 frameDuration.
    // Skips ahead if the actual elapsed time is higher.
    this._scheduledTime +=
      frameDelta < frameDuration ? frameDuration : frameDelta;
    return tickModes.AUTO;
  }

  /**
   * Computes the delta time between the current and previous frame
   * @param time - Current time
   * @returns The computed delta time
   */
  computeDeltaTime(time: number): number {
    const delta = time - this._lastTime;
    this.deltaTime = delta;
    this._lastTime = time;
    return delta;
  }

  // Make properties required by render/tick public
  public get currentTime(): number { return this._currentTime; }
  public set currentTime(time: number) { this._currentTime = time; }
  public get currentIteration(): number { 
    // This property is specific to Timer/JSAnimation, Clock itself doesn't have it.
    // Subclasses will need to provide a meaningful implementation or override.
    return 0; 
  }
  public set currentIteration(iteration: number) { 
    // Placeholder, subclasses to implement
  }
  public get loopDelay(): number { return 0; } // Placeholder
  public get reversed(): boolean | number { return false; } // Placeholder
  public get delay(): number { return 0; }
  public get iterationTime(): number { return this._currentTime; } // Or more specific logic in Timer
  public set iterationTime(time: number) { /* Placeholder */ }
  public get offset(): number { return 0; } // Placeholder
  public get head(): Tickable | Tween | null { return this._head; }
}
