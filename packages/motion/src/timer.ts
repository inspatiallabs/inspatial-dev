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
  minValue,
  compositionTypes,
  tickModes,
  noop,
  maxValue,
} from "./consts.ts";

import { clampInfinity, round, normalizeTime } from "./utils/math/index.ts";

import {
  forEachChildren,
  now,
  isUnd,
  addChild,
  isFnc,
  clamp,
  floor,
} from "./helpers.ts";

import { globals } from "./globals.ts";

import { tick } from "./render.ts";

import { composeTween, getTweenSiblings } from "./compositions.ts";

import { InMotion } from "./engine.ts";

import { InMotionClock } from "./clock.ts";

import type {
  TimerParams,
  Callback,
  Timeline,
  Renderable,
  Tween,
  ScrollObserver,
  DefaultsParams,
} from "./types.ts";

/**
 * # Timer
 * @summary #### Base class for animations and timelines
 *
 * The Timer class is the foundation for all time-based animations.
 * It extends InMotionClock with animation-specific features like iteration control,
 * looping, playback direction, and callbacks.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind class
 * @access public
 */
export class Timer extends InMotionClock {
  /** Unique identifier for the timer */
  public id: number | string;

  /** Parent timeline if this timer is part of a timeline */
  public parent: Timeline | null;

  /** Total duration of the timer including all iterations */
  public duration: number;

  /** Whether the timer plays backwards */
  public backwards: boolean;

  /** Whether the timer is paused */
  public paused: boolean;

  /** Whether the timer has begun playing */
  public began: boolean;

  /** Whether the timer has completed */
  public completed: boolean;

  /** Callback when the timer begins */
  public onBegin: Callback<this>;

  /** Callback before the timer updates */
  public onBeforeUpdate: Callback<this>;

  /** Callback when the timer updates */
  public onUpdate: Callback<this>;

  /** Callback when the timer completes a loop */
  public onLoop: Callback<this>;

  /** Callback when the timer is paused */
  public onPause: Callback<this>;

  /** Callback when the timer completes */
  public onComplete: Callback<this>;

  /** Callback on each render frame */
  public onRender: Callback<this>;

  /** Duration of a single iteration */
  public iterationDuration: number;

  /** Total number of iterations */
  public iterationCount: number;

  /** Whether to autoplay or link to a scroll observer */
  protected _autoplay: boolean | ScrollObserver;

  /** Offset position in parent timeline */
  protected _offset: number;

  /** Delay before starting */
  protected _delay: number;

  /** Delay between loops */
  protected _loopDelay: number;

  /** Current time within current iteration */
  protected _iterationTime: number;

  /** Current iteration index */
  protected _currentIteration: number;

  /** Promise resolver function */
  protected _resolve: () => void;

  /** Whether the timer is currently running */
  protected _running: boolean;

  /** Whether the playback direction is reversed */
  protected _reversed: number;

  /** Internal reverse state */
  protected _reverse: number;

  /** Whether the timer is cancelled */
  protected _cancelled: number;

  /** Whether to alternate direction on loop */
  protected _alternate: boolean;

  /** Previous renderable in linked list */
  protected _prev: Renderable | null;

  /** Next renderable in linked list */
  protected _next: Renderable | null;

  /** Default timeline options */
  public defaults?: Record<string, any>;

  /**
   * Creates a new Timer instance
   *
   * @param {TimerParams} parameters - Configuration parameters
   * @param {Timeline | null} parent - Parent timeline if this is a child
   * @param {number} parentPosition - Position in the parent timeline
   */
  constructor(
    parameters: TimerParams = {},
    parent: Timeline | null = null,
    parentPosition = 0
  ) {
    super(0);

    const {
      id,
      delay,
      duration,
      reversed,
      alternate,
      loop,
      loopDelay,
      autoplay,
      frameRate,
      playbackRate,
      onComplete,
      onLoop,
      onPause,
      onBegin,
      onBeforeUpdate,
      onUpdate,
      onRender,
    } = parameters;

    // Use type assertion to handle the revertibles array
    if (globals.scope) (globals.scope as any).revertibles.push(this);

    const timerInitTime = parent ? 0 : (InMotion as any)._elapsedTime;
    const timerDefaults = (
      parent ? parent.defaults : globals.defaults
    ) as DefaultsParams;
    const timerDelay =
      isFnc(delay) || isUnd(delay) ? timerDefaults.delay : +(delay || 0);
    const timerDuration: number = isFnc(duration)
      ? Infinity
      : isUnd(duration)
      ? (timerDefaults.duration as number)
      : +duration!;
    const timerLoop = isUnd(loop) ? timerDefaults.loop : loop;
    const timerLoopDelayValue = isUnd(loopDelay)
      ? timerDefaults.loopDelay
      : +loopDelay;

    const timerIterationCount =
      timerLoop === true ||
      timerLoop === Infinity ||
      (typeof timerLoop === "number" && timerLoop < 0)
        ? Infinity
        : (typeof timerLoop === "number" ? timerLoop : 0) + 1;

    let offsetPosition = 0;

    if (parent) {
      offsetPosition = parentPosition;
    } else {
      let startTime = now();
      // Make sure to tick the InMotion once if suspended to avoid big gaps with the following offsetPosition calculation
      if (InMotion.paused) {
        InMotion.requestTick(startTime);
        startTime = (InMotion as any)._elapsedTime;
      }
      offsetPosition = startTime - (InMotion as any)._startTime;
    }

    // Timer's parameters
    this.id = !isUnd(id) ? id! : ++timerId;
    this.parent = parent;
    // Total duration of the timer
    this.duration =
      clampInfinity(
        (timerDuration + (timerLoopDelayValue || 0)) * timerIterationCount -
          (timerLoopDelayValue || 0)
      ) || minValue;
    this.backwards = false;
    this.paused = true;
    this.began = false;
    this.completed = false;
    // Use type assertions to handle callback type mismatches
    this.onBegin = (onBegin ||
      timerDefaults.onBegin ||
      noop) as unknown as Callback<this>;
    this.onBeforeUpdate = (onBeforeUpdate ||
      timerDefaults.onBeforeUpdate ||
      noop) as unknown as Callback<this>;
    this.onUpdate = (onUpdate ||
      timerDefaults.onUpdate ||
      noop) as unknown as Callback<this>;
    this.onRender = (onRender ||
      timerDefaults.onRender ||
      noop) as unknown as Callback<this>;
    this.onLoop = (onLoop ||
      timerDefaults.onLoop ||
      noop) as unknown as Callback<this>;
    this.onPause = (onPause ||
      timerDefaults.onPause ||
      noop) as unknown as Callback<this>;
    this.onComplete = (onComplete ||
      timerDefaults.onComplete ||
      noop) as unknown as Callback<this>;
    this.iterationDuration = timerDuration; // Duration of one loop
    this.iterationCount = timerIterationCount; // Number of loops
    this._autoplay = parent
      ? false
      : ((isUnd(autoplay) ? timerDefaults.autoplay : autoplay) as
          | boolean
          | ScrollObserver);
    this._offset = offsetPosition;
    this._delay = timerDelay as number;
    this._loopDelay = (timerLoopDelayValue || 0) as number;
    this._iterationTime = 0;
    this._currentIteration = 0; // Current loop index
    this._resolve = noop; // Used by .then()
    this._running = false;
    this._reversed = +(isUnd(reversed)
      ? timerDefaults.reversed || 0
      : reversed) as number;
    this._reverse = this._reversed;
    this._cancelled = 0;
    this._alternate = (
      isUnd(alternate) ? timerDefaults.alternate : alternate
    ) as boolean;
    this._prev = null;
    this._next = null;

    // InMotionClock's parameters
    this._elapsedTime = timerInitTime;
    this._startTime = timerInitTime;
    this._lastTime = timerInitTime;
    this._fps = (
      isUnd(frameRate) ? timerDefaults.frameRate : frameRate
    ) as number;
    this._speed = (
      isUnd(playbackRate) ? timerDefaults.playbackRate : playbackRate
    ) as number;
  }

  /**
   * Whether the timer is cancelled
   */
  get cancelled(): boolean {
    return !!this._cancelled;
  }

  /**
   * Set cancelled state
   */
  set cancelled(cancelled: boolean) {
    cancelled ? this.cancel() : this.reset(1).play();
  }

  /**
   * Current time of the timer
   */
  override get currentTime(): number {
    return clamp(
      round(this._currentTime, globals.precision),
      -this._delay,
      this.duration
    );
  }

  /**
   * Set current time
   */
  override set currentTime(time: number) {
    const paused = this.paused;
    // Pausing the timer is necessary to avoid time jumps on a running instance
    this.pause().seek(+time);
    if (!paused) this.resume();
  }

  /**
   * Current time within the current iteration
   */
  get iterationCurrentTime(): number {
    return round(this._iterationTime, globals.precision);
  }

  /**
   * Set time within the current iteration
   */
  set iterationCurrentTime(time: number) {
    this.currentTime = this.iterationDuration * this._currentIteration + time;
  }

  /**
   * Progress of the entire animation (0-1)
   */
  get progress(): number {
    return clamp(round(this._currentTime / this.duration, 5), 0, 1);
  }

  /**
   * Set overall progress
   */
  set progress(progress: number) {
    this.currentTime = this.duration * progress;
  }

  /**
   * Progress within the current iteration (0-1)
   */
  get iterationProgress(): number {
    return clamp(round(this._iterationTime / this.iterationDuration, 5), 0, 1);
  }

  /**
   * Set progress within the current iteration
   */
  set iterationProgress(progress: number) {
    const iterationDuration = this.iterationDuration;
    this.currentTime =
      iterationDuration * this._currentIteration + iterationDuration * progress;
  }

  /**
   * Current iteration index
   */
  override get currentIteration(): number {
    return this._currentIteration;
  }

  /**
   * Set current iteration
   */
  override set currentIteration(iterationCount: number) {
    this.currentTime =
      this.iterationDuration *
      clamp(+iterationCount, 0, this.iterationCount - 1);
  }

  /**
   * Whether playback is reversed
   */
  override get reversed(): boolean {
    return !!this._reversed;
  }

  /**
   * Set reversed state
   */
  override set reversed(reverse: boolean) {
    reverse ? this.reverse() : this.play();
  }

  /**
   * Playback speed
   */
  override get speed(): number {
    return this._speed;
  }

  /**
   * Set playback speed
   */
  override set speed(playbackRate: number) {
    this._speed = playbackRate < minValue ? minValue : +playbackRate;
    this.resetTime();
  }

  /**
   * Reset the timer to initial state
   *
   * @param internalRender - Whether rendering is for internal use
   * @returns This timer instance
   */
  reset(internalRender = 0): this {
    // If cancelled, revive the timer before rendering in order to have propertly composed tweens siblings
    reviveTimer(this);
    if (this._reversed && !this._reverse) this.reversed = false;
    // Rendering before updating the completed flag to prevent skips and to make sure the properties are not overridden
    // Setting the iterationTime at the end to force the rendering to happend backwards, otherwise calling .reset() on Timelines might not render children in the right order
    // NOTE: This is only required for Timelines and might be better to move to the Timeline class?
    this._iterationTime = this.iterationDuration;
    // Set tickMode to tickModes.FORCE to force rendering
    // Use type assertion to handle interface mismatch
    tick(this as any, 0, 1, internalRender, tickModes.FORCE);
    // Reset timer properties after revive / render to make sure the props are not updated again
    resetTimerProperties(this);
    // Also reset children properties
    if (this._hasChildren) {
      // Use type assertion to bypass protected property access
      forEachChildren(
        this as any,
        resetTimerProperties,
        false,
        undefined,
        undefined
      );
    }
    return this;
  }

  /**
   * Initialize the timer
   *
   * @param internalRender - Whether rendering is for internal use
   * @returns This timer instance
   */
  init(internalRender = 0): this {
    this.fps = this._fps;
    this.speed = this._speed;
    // Manually calling .init() on timelines should render all children intial state
    // Forces all children to render once then render to 0 when reseted
    if (!internalRender && this._hasChildren) {
      tick(this as any, this.duration, 1, internalRender, tickModes.FORCE);
    }
    this.reset(internalRender);
    // Make sure to set autoplay to false to child timers so it doesn't attempt to autoplay / link
    const autoplay = this._autoplay;
    if (autoplay === true) {
      this.resume();
    } else if (autoplay && !isUnd((autoplay as ScrollObserver).linked)) {
      // Use type assertion for ScrollObserver link method
      (autoplay as ScrollObserver as any).link(this);
    }
    return this;
  }

  /**
   * Reset the timer's time properties
   *
   * @returns This timer instance
   */
  resetTime(): this {
    const timeScale = 1 / (this._speed * (InMotion as any)._speed);
    this._startTime = now() - (this._currentTime + this._delay) * timeScale;
    return this;
  }

  /**
   * Pause the timer
   *
   * @returns This timer instance
   */
  pause(): this {
    if (this.paused) return this;
    this.paused = true;
    this.onPause(this);
    return this;
  }

  /**
   * Resume the timer from a paused state
   *
   * @returns This timer instance
   */
  resume(): this {
    if (!this.paused) return this;
    this.paused = false;
    // We can safely imediatly render a timer that has no duration and no children
    if (this.duration <= minValue && !this._hasChildren) {
      tick(this as any, minValue, 0, 0, tickModes.FORCE);
    } else {
      if (!this._running) {
        // Use type assertion for Engine properties
        addChild(InMotion as any, this, undefined, undefined, undefined);
        (InMotion as any)._hasChildren = true;
        this._running = true;
      }
      this.resetTime();
      // Forces the timer to advance by at least one frame when the next tick occurs
      this._startTime -= 12;
      InMotion.wake();
    }
    return this;
  }

  /**
   * Restart the timer from the beginning
   *
   * @returns This timer instance
   */
  restart(): this {
    return this.reset(0).resume();
  }

  /**
   * Seek to a specific time
   *
   * @param time - Time to seek to
   * @param muteCallbacks - Whether to mute callbacks during seeking
   * @param internalRender - Whether rendering is for internal use
   * @returns This timer instance
   */
  seek(time: number, muteCallbacks = 0, internalRender = 0): this {
    // Recompose the tween siblings in case the timer has been cancelled
    reviveTimer(this);
    // If you seek a completed animation, otherwise the next play will starts at 0
    this.completed = false;
    const isPaused = this.paused;
    this.paused = true;
    // timer, time, muteCallbacks, internalRender, tickMode
    // Use type assertion to handle interface mismatch
    tick(
      this as any,
      time + this._delay,
      ~~muteCallbacks,
      ~~internalRender,
      tickModes.AUTO
    );
    return isPaused ? this : this.resume();
  }

  /**
   * Toggle between forward and reverse playback
   *
   * @returns This timer instance
   */
  alternate(): this {
    const reversed = this._reversed;
    const count = this.iterationCount;
    const duration = this.iterationDuration;
    // Calculate the maximum iterations possible given the iteration duration
    const iterations = count === Infinity ? floor(maxValue / duration) : count;
    this._reversed = +(this._alternate && !(iterations % 2)
      ? reversed
      : !reversed);
    if (count === Infinity) {
      // Handle infinite loops to loop on themself
      this.iterationProgress = this._reversed
        ? 1 - this.iterationProgress
        : this.iterationProgress;
    } else {
      this.seek(duration * iterations - this._currentTime);
    }
    this.resetTime();
    return this;
  }

  /**
   * Play the timer forward
   *
   * @returns This timer instance
   */
  play(): this {
    if (this._reversed) this.alternate();
    return this.resume();
  }

  /**
   * Play the timer in reverse
   *
   * @returns This timer instance
   */
  reverse(): this {
    if (!this._reversed) this.alternate();
    return this.resume();
  }

  /**
   * Cancel the timer
   *
   * @returns This timer instance
   */
  cancel(): this {
    // Basic timer cancellation logic - animation specific functionality moved to JSAnimation.cancel()
    this._cancelled = 1;
    // Pausing the timer removes it from the InMotion
    return this.pause();
  }

  /**
   * Change the duration of the timer
   *
   * @param newDuration - New duration
   * @returns This timer instance
   */
  stretch(newDuration: number): this {
    const currentDuration = this.duration;
    const normlizedDuration = normalizeTime(newDuration);
    if (currentDuration === normlizedDuration) return this;
    const timeScale = newDuration / currentDuration;
    const isSetter = newDuration <= minValue;
    this.duration = isSetter ? minValue : normlizedDuration;
    this.iterationDuration = isSetter
      ? minValue
      : normalizeTime(this.iterationDuration * timeScale);
    this._offset *= timeScale;
    this._delay *= timeScale;
    this._loopDelay *= timeScale;
    return this;
  }

  /**
   * Cancel the timer and revert any changes it made
   *
   * @returns This timer instance
   */
  revert(): this {
    tick(this as any, 0, 1, 0, tickModes.AUTO);
    const ap = this._autoplay as ScrollObserver;
    // Use type assertion for revert method
    if (ap && ap.linked && ap.linked === this) (ap as any).revert();
    return this.cancel();
  }

  /**
   * Complete the timer immediately
   *
   * @returns This timer instance
   */
  complete(): this {
    return this.seek(this.duration).cancel();
  }

  /**
   * Chain a promise to execute after the timer completes
   *
   * @param callback - Function to call when the timer completes
   * @returns Promise resolved when the timer completes
   */
  then(callback: Callback<this> = noop): Promise<unknown> {
    const then = this.then;
    const onResolve = () => {
      (this as any).then = null;
      callback(this);
      (this as any).then = then;
      this._resolve = noop;
    };
    return new Promise((r) => {
      this._resolve = () => r(onResolve());
      // Make sure to resolve imediatly if the timer has already completed
      if (this.completed) this._resolve();
      return this;
    });
  }
}

// Counter must be defined before it's used
let timerId = 0;

/**
 * # ResetTimerProperties
 * @summary #### Resets the basic state properties of a timer
 *
 * This function sets the timer to a paused state and clears its began and completed flags.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access private
 *
 * @param {Timer} timer - The timer to reset
 * @returns {Timer} The same timer with reset properties
 */
const resetTimerProperties = (timer: Timer): Timer => {
  timer.paused = true;
  timer.began = false;
  timer.completed = false;
  return timer;
};

/**
 * # ReviveTimer
 * @summary #### Restores a cancelled timer by recomposing its tweens
 *
 * This function revives a timer that was previously cancelled. If the timer has children,
 * it will recursively revive them. Otherwise, it will recompose the tweens.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access private
 *
 * @param {Timer} timer - The timer to revive
 * @returns {Timer} The revived timer
 */
const reviveTimer = (timer: Timer): Timer => {
  // Use type assertion to bypass protected property access
  if (!(timer as any)._cancelled) return timer;
  if ((timer as any)._hasChildren) {
    forEachChildren(timer as any, reviveTimer, false, undefined, undefined);
  } else {
    forEachChildren(
      timer as any,
      (tween: Tween) => {
        if (tween._composition !== compositionTypes.none) {
          composeTween(tween, getTweenSiblings(tween.target, tween.property));
        }
      },
      false,
      undefined,
      undefined
    );
  }
  (timer as any)._cancelled = 0;
  return timer;
};

/**
 * # CreateTimer
 * @summary #### Creates and initializes a new Timer instance
 *
 * This function creates a new Timer with the provided parameters, initializes it,
 * and returns it ready to use.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 *
 * @param {TimerParams} parameters - Configuration parameters
 * @returns {Timer} The initialized timer
 */
export const createTimer = (parameters?: TimerParams): Timer =>
  new Timer(parameters, null, 0).init();

/**
 * # CreateMotionTimer
 * @summary #### Creates and initializes a new Timer instance (InSpatial naming convention)
 *
 * This is an alias of createTimer following the InSpatial naming convention.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 *
 * @param {TimerParams} parameters - Configuration parameters
 * @returns {Timer} The initialized timer
 */
export const createMotionTimer = createTimer;
