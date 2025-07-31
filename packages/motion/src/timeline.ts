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
  relativeValuesExecRgx,
  minValue,
  tickModes,
  compositionTypes,
} from "./consts.ts";

import {
  mergeObjects,
  isObj,
  isFnc,
  isUnd,
  isNil,
  isNum,
  forEachChildren,
  stringStartsWith,
  clampInfinity,
  normalizeTime,
  isStr,
} from "./helpers.ts";

import { getRelativeValue, setValue } from "./values.ts";

import { parseTargets } from "./targets.ts";

import { Timer } from "./timer.ts";

import { JSAnimation, cleanInlineStyles } from "./animation.ts";

import { tick } from "./render.ts";

import { parseEasings } from "./eases.ts";

import { remove } from "./utils/index.ts";

import type {
  TargetsParam,
  Target,
  Timeline as InMotionTimelineInterface,
  Tickable,
  Renderable,
  TimelineParams as InMotionTimelineParams,
  DefaultsParams,
  AnimationParams,
  TimerParams,
  Callback,
  EasingFunction,
} from "./types.ts";

/**
 * # InMotionTimeline
 * @summary #### Orchestrates and sequences animations with precise timing control
 *
 * The `InMotionTimeline` class allows you to create complex sequences of animations with precise control over timing.
 * Think of it like a music sequencer where you can place animations at specific points in time and control
 * their playback as a unified whole.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind class
 * @access public
 */

/**
 * TimePosition can be a number, string, or function that determines positioning
 */
type TimePosition =
  | number
  | string
  | ((
      target: Target,
      index: number,
      length: number,
      timeline: InMotionTimeline
    ) => number);

/**
 * InMotionTimeline's children offsets positions parser
 * @param  {InMotionTimeline} timeline - The timeline to parse positions for
 * @param  {string} timePosition - Position string to parse
 * @return {number | undefined} Calculated offset
 */
const getPrevChildOffset = (
  timeline: InMotionTimeline,
  timePosition: string
): number | undefined => {
  if (stringStartsWith(timePosition, "<")) {
    const goToPrevAnimationOffset = timePosition[1] === "<";
    // Need to do a type assertion here as we know this is accessing a protected property
    const prevAnimation = (timeline as any)._tail as Tickable | null;
    const prevOffset = prevAnimation
      ? (prevAnimation as any)._offset + (prevAnimation as any)._delay
      : 0;
    return goToPrevAnimationOffset
      ? prevOffset
      : prevOffset + (prevAnimation as Tickable).duration;
  }
  return undefined;
};

/**
 * Parses timeline position values into numeric offsets
 * @param  {InMotionTimeline} timeline - The timeline to parse positions for
 * @param  {TimePosition} [timePosition] - Position to parse
 * @return {number} The calculated position in milliseconds
 */
export const parseInMotionTimelinePosition = (
  timeline: InMotionTimeline,
  timePosition?: TimePosition
): number => {
  let tlDuration = timeline.iterationDuration;
  if (tlDuration === minValue) tlDuration = 0;
  if (isUnd(timePosition)) return tlDuration;
  if (isNum(+timePosition!)) return +timePosition!;
  const timePosStr = timePosition as string;
  const tlLabels = timeline ? timeline.labels : null;
  const hasLabels = !isNil(tlLabels);
  const prevOffset = getPrevChildOffset(timeline, timePosStr);
  const hasSibling = !isUnd(prevOffset);
  const matchedRelativeOperator = relativeValuesExecRgx.exec(timePosStr);
  if (matchedRelativeOperator) {
    const fullOperator = matchedRelativeOperator[0];
    const split = timePosStr.split(fullOperator);
    const labelOffset =
      hasLabels && split[0] ? tlLabels![split[0]] : tlDuration;
    const parsedOffset = hasSibling
      ? prevOffset!
      : hasLabels
      ? labelOffset
      : tlDuration;
    const parsedNumericalOffset = +split[1];
    return getRelativeValue(
      parsedOffset,
      parsedNumericalOffset,
      fullOperator[0]
    );
  } else {
    return hasSibling
      ? prevOffset!
      : hasLabels
      ? !isUnd(tlLabels![timePosStr])
        ? tlLabels![timePosStr]
        : tlDuration
      : tlDuration;
  }
};

/**
 * Calculates the total duration of a timeline including all iterations
 * @param {InMotionTimeline} tl - The timeline to calculate duration for
 * @return {number} Total duration in milliseconds
 */
function getInMotionTimelineTotalDuration(tl: InMotionTimeline): number {
  return (
    clampInfinity(
      (tl.iterationDuration + (tl as any)._loopDelay) * tl.iterationCount -
        (tl as any)._loopDelay
    ) || minValue
  );
}

/**
 * Adds a child to a timeline at a specific position
 * @param {TimerParams | AnimationParams} childParams - Child parameters
 * @param {InMotionTimeline} tl - Parent timeline
 * @param {number} timePosition - Position on the timeline
 * @param {TargetsParam} [targets] - Animation targets
 * @param {number} [index] - Index for staggered animations
 * @param {number} [length] - Length for staggered animations
 * @return {InMotionTimeline} The parent timeline
 */
function addTlChild(
  childParams: TimerParams | AnimationParams,
  tl: InMotionTimeline,
  timePosition: number,
  targets?: TargetsParam,
  index?: number,
  length?: number
): InMotionTimeline {
  const isSetter =
    isNum(childParams.duration) && (childParams.duration as number) <= minValue;
  // Offset the tl position with -minValue for 0 duration animations or .set() calls in order to align their end value with the defined position
  const adjustedPosition = isSetter ? timePosition - minValue : timePosition;

  // Use type assertion to handle the interface mismatch
  tick(tl as any, adjustedPosition, 1, 1, tickModes.AUTO);

  const tlChild = targets
    ? new JSAnimation(
        targets,
        childParams as AnimationParams,
        tl as any,
        adjustedPosition,
        false,
        index,
        length
      )
    : new Timer(childParams as TimerParams, tl as any, adjustedPosition);
  tlChild.init(1);

  // Insert at a position relative to startTime rather than at the end
  // This ensures animations are stored in chronological order which helps with performance
  let currentChild = (tl as any)._head;
  let previousChild = null;
  const childStartTime = (tlChild as any)._offset + (tlChild as any)._delay;

  // Find the correct insertion point based on start time
  while (
    currentChild &&
    (currentChild as any)._offset + (currentChild as any)._delay <
      childStartTime
  ) {
    previousChild = currentChild;
    currentChild = (currentChild as any)._next;
  }

  // Insert the child at the correct position in the linked list
  if (previousChild) {
    (tlChild as any)._prev = previousChild;
    (tlChild as any)._next = currentChild;
    (previousChild as any)._next = tlChild;
    if (currentChild) {
      (currentChild as any)._prev = tlChild;
    } else {
      (tl as any)._tail = tlChild;
    }
  } else {
    // Insert at the beginning
    (tlChild as any)._next = currentChild;
    if (currentChild) {
      (currentChild as any)._prev = tlChild;
    } else {
      (tl as any)._tail = tlChild;
    }
    (tl as any)._head = tlChild;
  }

  forEachChildren(tl as any, (child: Renderable) => {
    const childTLOffset = (child as any)._offset + (child as any)._delay;
    const childDur = childTLOffset + child.duration;
    if (childDur > tl.iterationDuration) tl.iterationDuration = childDur;
  });
  tl.duration = getInMotionTimelineTotalDuration(tl);
  return tl;
}

/**
 * InMotionTimeline class for sequencing and orchestrating animations
 */
export class InMotionTimeline
  extends Timer
  implements InMotionTimelineInterface
{
  /** InMotionTimeline duration */
  override duration: number;
  /** InMotionTimeline labels for positioning */
  labels: Record<string, number>;
  /** Default parameters */
  override defaults: DefaultsParams;
  /** Render callback */
  override onRender: Callback<InMotionTimeline>;
  /** Easing function */
  _ease: EasingFunction;
  /** Duration of one iteration */
  override iterationDuration: number;

  /**
   * Creates a new InMotionTimeline instance
   * @param {InMotionTimelineParams} [parameters] - InMotionTimeline configuration
   */
  constructor(parameters: InMotionTimelineParams = {}) {
    super(parameters as TimerParams, null, 0);
    /** InMotionTimeline duration starts at 0 and grows when adding children */
    this.duration = 0;
    /** Map of named positions */
    this.labels = {};
    const defaultsParams = parameters.defaults;
    const globalDefaults = globals.defaults;
    /** Default animation parameters */
    this.defaults = defaultsParams
      ? mergeObjects(defaultsParams, globalDefaults)
      : globalDefaults;
    /** Render callback */
    this.onRender = (parameters.onRender ||
      globalDefaults.onRender ||
      (() => {})) as unknown as Callback<InMotionTimeline>;
    const tlPlaybackEase = setValue(
      parameters.playbackEase,
      globalDefaults.playbackEase
    );
    this._ease = tlPlaybackEase
      ? parseEasings(tlPlaybackEase)
      : (t: number) => t;
    /** Duration of one iteration */
    this.iterationDuration = 0;
  }

  /**
   * Adds an animation to the timeline
   * @param {TargetsParam | TimerParams} a1 - Targets or timer parameters
   * @param {AnimationParams | TimePosition} a2 - Animation parameters or position
   * @param {TimePosition} [a3] - Position for animation
   * @return {this} Self reference for chaining
   */
  add(
    a1: TargetsParam | TimerParams,
    a2: AnimationParams | TimePosition,
    a3?: TimePosition
  ): this {
    const isAnim = isObj(a2);
    const isTimer = isObj(a1);
    if (isAnim || isTimer) {
      this._hasChildren = true;
      if (isAnim) {
        const childParams = a2 as AnimationParams;
        // Check for function for children stagger positions
        if (isFnc(a3)) {
          const staggeredPosition = a3 as (
            target: Target,
            index: number,
            length: number,
            timeline: InMotionTimeline
          ) => number;
          const parsedTargetsArray = parseTargets(a1 as TargetsParam);
          // Store initial duration before adding new children that will change the duration
          const tlDuration = this.duration;
          // Store initial _iterationDuration before adding new children that will change the duration
          const tlIterationDuration = this.iterationDuration;
          // Store the original id in order to add specific indexes to the new animations ids
          const id = childParams.id;
          let i = 0;
          const parsedLength = parsedTargetsArray.length;
          parsedTargetsArray.forEach((target: Target) => {
            // Create a new parameter object for each staggered children
            const staggeredChildParams = { ...childParams };
            // Reset the duration of the timeline iteration before each stagger to prevent wrong start value calculation
            this.duration = tlDuration;
            this.iterationDuration = tlIterationDuration;
            if (!isUnd(id)) staggeredChildParams.id = id + "-" + i;
            addTlChild(
              staggeredChildParams,
              this,
              staggeredPosition(target, i, parsedLength, this),
              target,
              i,
              parsedLength
            );
            i++;
          });
        } else {
          addTlChild(
            childParams,
            this,
            parseInMotionTimelinePosition(this, a3),
            a1 as TargetsParam,
            undefined,
            undefined
          );
        }
      } else {
        // It's a Timer
        addTlChild(
          a1 as TimerParams,
          this,
          parseInMotionTimelinePosition(this, a2 as TimePosition),
          undefined,
          undefined,
          undefined
        );
      }
      return this.init(1); // 1 = internalRender
    }
    return this;
  }

  /**
   * Synchronizes an external animation with this timeline
   * @param {Tickable | any} [synced] - Animation to synchronize
   * @param {TimePosition} [position] - Position on timeline
   * @return {this} Self reference for chaining
   */
  sync(synced?: Tickable | any, position?: TimePosition): this {
    if (isUnd(synced) || (synced && isUnd(synced.pause))) return this;
    synced.pause();
    const duration = +(synced.effect
      ? synced.effect.getTiming().duration
      : synced.duration);
    return this.add(
      synced,
      { currentTime: [0, duration], duration, ease: "linear" },
      position
    );
  }

  /**
   * Sets properties on targets at a specific point in the timeline
   * @param {TargetsParam} targets - Elements to modify
   * @param {AnimationParams} parameters - Properties to set
   * @param {TimePosition} [position] - Position on timeline
   * @return {this} Self reference for chaining
   */
  set(
    targets: TargetsParam,
    parameters: AnimationParams,
    position?: TimePosition
  ): this {
    if (isUnd(parameters)) return this;
    parameters.duration = minValue;
    parameters.composition = compositionTypes.replace;
    return this.add(targets, parameters, position);
  }

  /**
   * Adds a callback function at a specific point in the timeline
   * @param {Callback<Timer>} callback - Function to call
   * @param {TimePosition} [position] - Position on timeline
   * @return {this} Self reference for chaining
   */
  call(callback: Callback<Timer>, position?: TimePosition): this {
    if (isUnd(callback) || (callback && !isFnc(callback))) return this;
    return this.add(
      {
        duration: 0,
        onComplete: function () {
          callback(this as unknown as Timer);
        },
      } as TimerParams,
      position as TimePosition
    );
  }

  /**
   * Creates a named label at a specific point in the timeline
   * @param {string} labelName - Name for the label
   * @param {TimePosition} [position] - Position on timeline
   * @return {this} Self reference for chaining
   */
  label(labelName: string, position?: TimePosition): this {
    if (isUnd(labelName) || (labelName && !isStr(labelName))) return this;
    this.labels[labelName] = parseInMotionTimelinePosition(this, position);
    return this;
  }

  /**
   * Removes an animation from the timeline
   * @param {TargetsParam} targets - Elements to remove
   * @param {string} [propertyName] - Specific property to remove
   * @return {this} Self reference for chaining
   */
  remove(targets: TargetsParam, propertyName?: string): this {
    // Use type assertion to handle the function signature mismatch
    (remove as any)(targets, this, propertyName);
    return this;
  }

  /**
   * Stretches or compresses the timeline to a new duration
   * @param {number} newDuration - New timeline duration
   * @return {this} Self reference for chaining
   */
  override stretch(newDuration: number): this {
    const currentDuration = this.duration;
    if (currentDuration === normalizeTime(newDuration)) return this;
    const timeScale = newDuration / currentDuration;
    const labels = this.labels;
    forEachChildren(
      this as any,
      (child: JSAnimation) => child.stretch(child.duration * timeScale),
      false,
      undefined,
      undefined
    );
    for (const labelName in labels) labels[labelName] *= timeScale;
    return super.stretch(newDuration);
  }

  /**
   * Refreshes all children animations
   * @return {this} Self reference for chaining
   */
  refresh(): this {
    forEachChildren(
      this as any,
      (child: JSAnimation) => {
        if (child.refresh) child.refresh();
      },
      false,
      undefined,
      undefined
    );
    return this;
  }

  /**
   * Reverts all changes made by the timeline
   * @return {this} Self reference for chaining
   */
  override revert(): this {
    super.revert();
    forEachChildren(
      this as any,
      (child: JSAnimation) => child.revert && child.revert(),
      true,
      undefined,
      undefined
    );
    return cleanInlineStyles(this as any) as unknown as this;
  }

  /**
   * Returns a promise that resolves when the timeline completes
   * @param {Callback<this>} [callback] - Completion callback
   * @return {Promise<this>} Promise resolving on completion
   */
  override then(callback?: Callback<this>): Promise<this> {
    return super.then(callback) as unknown as Promise<this>;
  }
}

/**
 * # createMotionTimeline
 * @summary #### Creates a new timeline for sequencing animations
 *
 * This function creates a new InMotionTimeline instance with the provided parameters,
 * allowing you to sequence and orchestrate multiple animations with precise timing.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind function
 * @access public
 *
 * @param {InMotionTimelineParams} [parameters] - InMotionTimeline configuration options
 * @return {InMotionTimeline} Initialized timeline instance
 */
export const createMotionTimeline = (
  parameters?: InMotionTimelineParams
): InMotionTimeline => new InMotionTimeline(parameters).init();
