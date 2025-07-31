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

/**
 * # InMotion Types
 * @module @in/motion/types
 *
 * This module provides type definitions for the InMotion animation library.
 * Defining proper types enables better development experience with code completion and type checking.
 *
 * @example Basic Usage
 * ```typescript
 * import { animate, type AnimationParams } from "@in/motion";
 *
 * // Type-safe animation parameters
 * const params: AnimationParams = {
 *   translateX: 250,
 *   duration: 1000,
 *   easing: 'easeInOutQuad'
 * };
 * ```
 *
 * @features
 * - Comprehensive type definitions for all animation functions
 * - Type safety for animation parameters and configurations
 * - Support for keyframes, tweens, and complex animations
 * - Enhanced intellisense for animation properties
 * - Type-safe callback handlers
 * - Proper integration with DOM and Web Animation API
 * - Support for all motion components (draggable, scroll, spring)
 * - Consistent naming conventions
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

// --------------------------------------------------------------------------
// CORE ANIMATION TYPES
// --------------------------------------------------------------------------

/**
 * Base animation types that can be rendered in the animation loop
 */
type Renderable = JSAnimation | Timeline;

/**
 * Any tickable object that can be updated in the animation loop
 */
// type Tickable = Timer | Renderable; // Keep original for reference, IRenderTickable is now primary for render

/**
 * Interface for objects that can be processed by the render/tick functions,
 * exposing necessary properties publicly.
 */
export interface IRenderTickable {
  // Core Clock/Timer properties
  parent: Timeline | null;
  duration: number;
  completed: boolean;
  iterationDuration: number;
  iterationCount: number;
  currentIteration: number; 
  loopDelay: number;        
  reversed: number | boolean; 
  alternate: boolean;       
  hasChildren: boolean;     
  delay: number;            
  currentTime: number;      
  iterationTime: number;    
  offset: number;           
  head: IRenderTickable | Tween | null; // Use IRenderTickable for children if they also must be detailed
  tail: IRenderTickable | Tween | null; 
  fps: number;              
  speed: number;            
  deltaTime: number; 
  paused: boolean; 

  // Callbacks
  began: boolean;
  backwards: boolean;
  onBegin: Callback<any>; 
  onLoop: Callback<any>;
  onBeforeUpdate: Callback<any>;
  onUpdate: Callback<any>;
  onRender: Callback<any>; 
  onComplete: Callback<any>;
  resolve: () => void; 

  // Methods
  computeDeltaTime: (prevTime: number) => void;
  requestTick: (time: number) => number;

  // Easing - this is more specific to JSAnimation/Timeline.
  // Timer itself might have a default/noop easing or this could be optional.
  ease: EasingFunction; 

  // Allow other properties from specific types for flexibility during transition
  [key: string]: any;
}

/**
 * Original Tickable for broader use where detailed public access isn't assumed.
 */
export type Tickable = Timer | Renderable;

/**
 * Combined type for callback arguments that provide all functionality
 */
type CallbackArgument = Timer & JSAnimation & Timeline;

/**
 * Type for any object that can be reverted to its original state
 */
type Revertible = IAnimatable | Tickable | Draggable | ScrollObserver | Scope;

/**
 * JSAnimation interface
 */
interface JSAnimation extends Timer {
  targets: TargetsArray;
  duration: number;
  iterationDuration: number;
  iterations: number;
  endDelay: number;
  hasEnded: boolean;
  keyframes: AnyObject;
  parameters: JSAnimationParameters;
  normalizedKeyframes: AnyObject;
  easingFn: EasingFunction;
  values: AnyObject;
  percentages: number[];
  onUpdate: Callback<JSAnimation>;
  onComplete: Callback<JSAnimation>;
  onCancel?: () => void;
}

/**
 * Any generic object
 */
export type AnyObject = Record<string, any>;

/**
 * Valid property name for animation
 */
type PropertyName = string & Record<PropertyKey, never>;

/**
 * JSAnimation parameters interface
 */
type JSAnimationParameters = Record<PropertyName, any>;

/**
 * Composition type constant or string
 */
type CompositionType = string | number;

/**
 * Composition operation name
 */
type Composition = "none" | "replace" | "blend" | compositionTypes;

/**
 * Defines keyframe value structure
 */
type KeyframeValues = Record<PropertyName, any>;

/**
 * Function to modify animatable property
 */
type AnimatablePropertyModifier = (value: any) => any;

// --------------------------------------------------------------------------
// DOM AND TARGET TYPES
// --------------------------------------------------------------------------

/**
 * DOM element target for animations
 */
type DOMTarget = HTMLElement | SVGElement;

/**
 * JavaScript object target for animations
 */
type JSTarget = Record<string, any>;

/**
 * Combined target type for animations
 */
type Target = DOMTarget | JSTarget;

/**
 * Selector for targeting DOM elements
 */
type TargetSelector = Target | NodeList | string;

/**
 * Selector specifically for DOM targets
 */
type DOMTargetSelector = DOMTarget | NodeList | string;

/**
 * Parameter for selecting DOM targets
 */
type DOMTargetsParam = Array<DOMTargetSelector> | DOMTargetSelector;

/**
 * Array of resolved DOM targets
 */
type DOMTargetsArray = Array<DOMTarget>;

/**
 * Parameter for selecting JS object targets
 */
type JSTargetsParam = Array<JSTarget> | JSTarget;

/**
 * Array of resolved JS object targets
 */
type JSTargetsArray = Array<JSTarget>;

/**
 * Parameter for selecting any type of target
 */
type TargetsParam = Array<TargetSelector> | TargetSelector;

/**
 * Array of resolved animation targets
 */
type TargetsArray = Array<Target>;

/**
 * MorphableSVGElement interface
 */
interface MorphableSVGElement extends SVGElement {
  getTotalLength: () => number;
  getPointAtLength: (length: number) => DOMPoint;
}

/**
 * DOMProxy interface for non-DOM draggable targets
 */
interface DOMProxy {
  el: AnyObject;
  zIndex: number;
  parentElement: any;
  classList: {
    add: (className: string) => void;
    remove: (className: string) => void;
  };
  x: number;
  y: number;
  width: number;
  height: number;
  getBoundingClientRect: () => DOMRect;
}

// --------------------------------------------------------------------------
// CALLBACK AND FUNCTION TYPES
// --------------------------------------------------------------------------

/**
 * Function that returns a dynamic value based on animation target context
 */
type FunctionValue = (
  target: Target,
  index: number,
  length: number
) =>
  | number
  | string
  | TweenObjectValue
  | Array<number | string | TweenObjectValue>;

/**
 * Function that modifies a tweened value
 */
type TweenModifier = (value: number) => number | string;

/**
 * Type-safe callback with target object reference
 */
type Callback<T> = (self: T, e?: PointerEvent) => any;

/**
 * Common callback interfaces for tickable objects
 */
type TickableCallbacks<T extends unknown> = {
  /** Called when the animation begins */
  onBegin?: Callback<T>;
  /** Called before an update */
  onBeforeUpdate?: Callback<T>;
  /** Called on each update */
  onUpdate?: Callback<T>;
  /** Called on each loop completion */
  onLoop?: Callback<T>;
  /** Called when animation is paused */
  onPause?: Callback<T>;
  /** Called when animation completes */
  onComplete?: Callback<T>;
};

/**
 * Common callback interfaces for renderable objects
 */
type RenderableCallbacks<T extends unknown> = {
  /** Called on each render frame */
  onRender?: Callback<T>;
};

/**
 * Transforms interface for handling element transformations
 */
interface Transforms {
  $el: DOMTarget | DOMProxy;
  inlineTransforms: string[];
  point: DOMPoint;
  inversedMatrix: DOMMatrix;
  normalizePoint: (x: number, y: number) => DOMPoint;
  traverseUp: (cb: (el: DOMTarget, i: number) => void) => void;
  getMatrix: () => DOMMatrix;
  remove: () => void;
  revert: () => void;
}

// --------------------------------------------------------------------------
// NUMERIC CONSTANTS
// --------------------------------------------------------------------------

/**
 * Numeric constant for tween types
 */
type tweenTypes = number;

/**
 * Numeric constant for value types
 */
type valueTypes = number;

/**
 * Numeric constant for tick modes
 */
type tickModes = number;

/**
 * Numeric constant for composition types
 */
type compositionTypes = number;

// --------------------------------------------------------------------------
// CHAINABLE UTILITIES
// --------------------------------------------------------------------------

/**
 * Chained utility result function
 */
type ChainedUtilsResult = (value: number) => number;

/**
 * Collection of chainable utility functions
 */
type ChainableUtils = {
  /** Clamp a value between min and max */
  clamp: ChainedClamp;
  /** Round a value to a specific decimal length */
  round: ChainedRound;
  /** Snap a value to the nearest increment */
  snap: ChainedSnap;
  /** Wrap a value between min and max */
  wrap: ChainedWrap;
  /** Interpolate between start and end values */
  interpolate: ChainedInterpolate;
  /** Map a value from one range to another */
  mapRange: ChainedMapRange;
  /** Round and pad a value */
  roundPad: ChainedRoundPad;
  /** Pad a value at the start */
  padStart: ChainedPadStart;
  /** Pad a value at the end */
  padEnd: ChainedPadEnd;
  /** Convert degrees to radians */
  degToRad: ChainedDegToRad;
  /** Convert radians to degrees */
  radToDeg: ChainedRadToDeg;
};

/**
 * Chainable utility function
 */
type ChainableUtil = ChainableUtils & ChainedUtilsResult;

/**
 * Clamp function with chainable API
 */
type ChainedClamp = (min: number, max: number) => ChainableUtil;

/**
 * Round function with chainable API
 */
type ChainedRound = (decimalLength: number) => ChainableUtil;

/**
 * Snap function with chainable API
 */
type ChainedSnap = (increment: number) => ChainableUtil;

/**
 * Wrap function with chainable API
 */
type ChainedWrap = (min: number, max: number) => ChainableUtil;

/**
 * Interpolate function with chainable API
 */
type ChainedInterpolate = (start: number, end: number) => ChainableUtil;

/**
 * Map range function with chainable API
 */
type ChainedMapRange = (
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number
) => ChainableUtil;

/**
 * Round and pad function with chainable API
 */
type ChainedRoundPad = (decimalLength: number) => ChainableUtil;

/**
 * Pad start function with chainable API
 */
type ChainedPadStart = (
  totalLength: number,
  padString: string
) => ChainableUtil;

/**
 * Pad end function with chainable API
 */
type ChainedPadEnd = (totalLength: number, padString: string) => ChainableUtil;

/**
 * Degrees to radians function with chainable API
 */
type ChainedDegToRad = () => ChainableUtil;

/**
 * Radians to degrees function with chainable API
 */
type ChainedRadToDeg = () => ChainableUtil;

// --------------------------------------------------------------------------
// EASING TYPES
// --------------------------------------------------------------------------

/**
 * Function that transforms a progress value for animations
 */
type EasingFunction = (time: number) => number;

/**
 * Easing function with power parameter
 */
type PowerEasing = (power?: number | string) => EasingFunction;

/**
 * Easing function with overshoot parameter
 */
type BackEasing = (overshoot?: number | string) => EasingFunction;

/**
 * Easing function with amplitude and period parameters
 */
type ElasticEasing = (
  amplitude?: number | string,
  period?: number | string
) => EasingFunction;

/**
 * Named easing functions for string parameters
 */
type EaseStringParamNames =
  | "linear"
  | "linear(x1, x2 25%, x3)"
  | "in"
  | "out"
  | "inOut"
  | "inQuad"
  | "outQuad"
  | "inOutQuad"
  | "inCubic"
  | "outCubic"
  | "inOutCubic"
  | "inQuart"
  | "outQuart"
  | "inOutQuart"
  | "inQuint"
  | "outQuint"
  | "inOutQuint"
  | "inSine"
  | "outSine"
  | "inOutSine"
  | "inCirc"
  | "outCirc"
  | "inOutCirc"
  | "inExpo"
  | "outExpo"
  | "inOutExpo"
  | "inBounce"
  | "outBounce"
  | "inOutBounce"
  | "inBack"
  | "outBack"
  | "inOutBack"
  | "inElastic"
  | "outElastic"
  | "inOutElastic"
  | "irregular"
  | "cubicBezier"
  | "steps"
  | "in(p = 1.675)"
  | "out(p = 1.675)"
  | "inOut(p = 1.675)"
  | "inBack(overshoot = 1.70158)"
  | "outBack(overshoot = 1.70158)"
  | "inOutBack(overshoot = 1.70158)"
  | "inElastic(amplitude = 1, period = .3)"
  | "outElastic(amplitude = 1, period = .3)"
  | "inOutElastic(amplitude = 1, period = .3)"
  | "irregular(length = 10, randomness = 1)"
  | "cubicBezier(x1, y1, x2, y2)"
  | "steps(steps = 10)";

/**
 * Easing parameter that can be a string, function, or Spring object
 */
type EasingParam =
  | (string & Record<PropertyKey, never>)
  | EaseStringParamNames
  | EasingFunction
  | Spring;

// --------------------------------------------------------------------------
// TWEEN TYPES
// --------------------------------------------------------------------------

/**
 * Base tween parameter value type
 */
type TweenParamValue = number | string | FunctionValue;

/**
 * Value for a tween property (single value or from-to pair)
 */
type TweenPropValue = TweenParamValue | [TweenParamValue, TweenParamValue];

/**
 * Composition mode for tweens
 */
type TweenComposition =
  | (string & Record<PropertyKey, never>)
  | "none"
  | "replace"
  | "blend"
  | compositionTypes;

/**
 * Common options for tween parameters
 */
type TweenParamsOptions = {
  /** Duration of the tween in milliseconds */
  duration?: TweenParamValue;
  /** Delay before the tween starts in milliseconds */
  delay?: TweenParamValue;
  /** Easing function to use */
  ease?: EasingParam;
  /** Function to modify the tweened value */
  modifier?: TweenModifier;
  /** How this tween composes with others */
  composition?: TweenComposition;
};

/**
 * Possible from/to values for a tween
 */
type TweenValues = {
  /** Starting value */
  from?: TweenParamValue;
  /** Target value */
  to?: TweenPropValue;
  /** Combined from and to values */
  fromTo?: TweenPropValue;
};

/**
 * Combined tween parameter values and options
 */
type TweenKeyValue = TweenParamsOptions & TweenValues;

/**
 * Array of tween values or options
 */
type ArraySyntaxValue = Array<TweenKeyValue | TweenPropValue>;

/**
 * All possible tween option formats
 */
type TweenOptions =
  | TweenParamValue
  | (TweenPropValue | TweenKeyValue)[]
  | TweenKeyValue;

/**
 * Object value for tween parameters
 */
type TweenObjectValue = Partial<{
  /** Target value */
  to: TweenParamValue | Array<TweenParamValue>;
  /** Starting value */
  from: TweenParamValue | Array<TweenParamValue>;
  /** Combined from and to values */
  fromTo: TweenParamValue | Array<TweenParamValue>;
}>;

/**
 * Color value as an RGBA array
 */
type ColorArray = [number, number, number, number];

// --------------------------------------------------------------------------
// ANIMATION PARAMETER TYPES
// --------------------------------------------------------------------------

/**
 * Options for keyframes with percentage-based timing
 */
type PercentageKeyframeOptions = {
  /** Easing function for this keyframe */
  ease?: EasingParam;
};

/**
 * Parameters for a specific keyframe
 */
type PercentageKeyframeParams = Record<string, TweenParamValue>;

/**
 * Complete keyframes defined by percentages
 */
type PercentageKeyframes = Record<
  string,
  PercentageKeyframeParams & PercentageKeyframeOptions
>;

/**
 * Keyframes defined by duration
 */
type DurationKeyframes = Array<
  Record<string, TweenOptions | TweenModifier | boolean> & TweenParamsOptions
>;

/**
 * Animation-specific options
 */
type AnimationOptions = {
  /** Keyframes for the animation */
  keyframes?: PercentageKeyframes | DurationKeyframes;
  /** Easing function for playback */
  playbackEase?: EasingParam;
};

/**
 * # BaseParams
 * @summary Base interface for parameter objects across the motion library
 *
 * This interface defines common parameters that are shared across different components
 * like timers, animations, and timelines. It provides a consistent base for all
 * parameter objects to extend from.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */
interface BaseParams {
  /** Unique identifier for the component */
  id?: number | string;
  /** Duration of the animation in milliseconds */
  duration?: TweenParamValue;
  /** Delay before the animation starts */
  delay?: TweenParamValue;
  /** Callback when component begins */
  onBegin?: (tickable: Tickable) => void;
  /** Callback before component updates */
  onBeforeUpdate?: (tickable: Tickable) => void;
  /** Callback on component update */
  onUpdate?: (tickable: Tickable) => void;
  /** Callback when component completes */
  onComplete?: (tickable: Tickable) => void;
}

/**
 * Options for timer-based animations
 */
type TimerOptions = BaseParams & {
  /** Delay between loops */
  loopDelay?: number;
  /** Whether the animation should play in reverse */
  reversed?: boolean;
  /** Whether the animation should alternate direction on loop */
  alternate?: boolean;
  /** How many times to loop the animation */
  loop?: boolean | number;
  /** Whether to autoplay the animation */
  autoplay?: boolean | ScrollObserver;
  /** Frame rate for the animation */
  frameRate?: number;
  /** Rate at which the animation plays */
  playbackRate?: number;
};

/**
 * Complete parameters for timer-based animations
 */
type TimerParams = TimerOptions & TickableCallbacks<Timer> & RenderableCallbacks<Timer>;

/**
 * Complete animation parameters
 */
type AnimationParams = Record<
  string,
  | TweenOptions
  | Callback<JSAnimation>
  | TweenModifier
  | boolean
  | PercentageKeyframes
  | (Record<string, boolean | TweenModifier | TweenOptions> &
      TweenParamsOptions)[]
  | ScrollObserver
> &
  TimerOptions &
  AnimationOptions &
  TweenParamsOptions &
  TickableCallbacks<JSAnimation> &
  RenderableCallbacks<JSAnimation>;

/**
 * Timeline-specific options
 */
type TimelineOptions = {
  /** Default parameters for child animations */
  defaults?: DefaultsParams;
  /** Easing function for playback */
  playbackEase?: EasingParam;
};

/**
 * Complete timeline parameters
 */
type TimelineParams = TimerOptions &
  TimelineOptions &
  TickableCallbacks<Timeline> &
  RenderableCallbacks<Timeline>;

/**
 * Position in a timeline (number, string label, or function)
 */
type TimePosition = number | string | (() => number | string);

/**
 * Default parameters for animations
 */
type DefaultsParams = BaseParams & {
  /** Keyframes for the animation */
  keyframes?: PercentageKeyframes | DurationKeyframes;
  /** Easing function for playback */
  playbackEase?: EasingParam;
  /** Rate at which the animation plays */
  playbackRate?: number;
  /** Frame rate for the animation */
  frameRate?: number;
  /** How many times to loop the animation */
  loop?: number | boolean;
  /** Whether the animation should play in reverse */
  reversed?: boolean;
  /** Whether the animation should alternate direction on loop */
  alternate?: boolean;
  /** Whether to autoplay the animation */
  autoplay?: boolean | ScrollObserver;
  /** Delay between loops */
  loopDelay?: number;
  /** Easing function for the animation */
  ease?: EasingParam;
  /** How this animation composes with others */
  composition?: "none" | "replace" | "blend" | compositionTypes;
  /** Function to modify the animated value */
  modifier?: (v: any) => any;
  /** Callback when animation loops */
  onLoop?: (tickable: Tickable) => void;
  /** Callback when animation pauses */
  onPause?: (tickable: Tickable) => void;
  /** Callback on animation render */
  onRender?: (renderable: Renderable) => void;
};

// --------------------------------------------------------------------------
// ANIMATABLE TYPES
// --------------------------------------------------------------------------

/**
 * Setter function for animatable properties
 */
type AnimatablePropertySetter = (
  to: number | Array<number>,
  duration?: number,
  ease?: EasingParam
) => AnimatableObject;

/**
 * Getter function for animatable properties
 */
type AnimatablePropertyGetter = () => number | Array<number>;

/**
 * Combined getter/setter for animatable properties
 */
type AnimatableProperty = AnimatablePropertySetter & AnimatablePropertyGetter;

/**
 * Object with animatable properties
 */
type AnimatableObject = IAnimatable & Record<string, AnimatableProperty>;

/**
 * Parameters for animatable properties
 */
type AnimatablePropertyParamsOptions = {
  /** Unit to use for the property */
  unit?: string;
  /** Default duration for animations */
  duration?: TweenParamValue;
  /** Default easing function */
  ease?: EasingParam;
  /** Function to modify the animated value */
  modifier?: TweenModifier;
  /** How animations of this property compose with others */
  composition?: TweenComposition;
};

/**
 * Complete parameters for animatable objects
 */
type AnimatableParams = Record<
  string,
  | TweenParamValue
  | EasingParam
  | TweenModifier
  | TweenComposition
  | AnimatablePropertyParamsOptions
> &
  AnimatablePropertyParamsOptions;

// --------------------------------------------------------------------------
// DRAGGABLE TYPES
// --------------------------------------------------------------------------

/**
 * @typedef {{ mapTo?: string, modifier?: TweenModifier, composition?: TweenComposition, snap?: number | number[] | ((draggable: IDraggable) => number | Array<number>) }} DraggableAxisParam
 */
type DraggableAxisParam = {
  /** Property to map this axis to */
  mapTo?: string;
  /** Function to modify the dragged value */
  modifier?: TweenModifier;
  /** How drag values compose with existing animations */
  composition?: TweenComposition;
  /** Snap points for this axis */
  snap?: number | number[] | ((draggable: IDraggable) => number | Array<number>);
};

/**
 * Cursor style parameters for draggable elements
 */
type DraggableCursorParams = {
  /** Cursor style when hovering */
  onHover?: string;
  /** Cursor style when grabbed */
  onGrab?: string;
};

/**
 * Parameters for a draggable element
 */
type DraggableParams = BaseParams & {
  /** Element that triggers dragging */
  trigger?: DOMTargetSelector;
  /** Container that limits dragging */
  container?:
    | number[]
    | DOMTargetSelector
    | ((draggable: Draggable) => DOMTargetSelector | Array<number>);
  /** Enable X-axis dragging */
  x?: boolean | DraggableAxisParam;
  /** Enable Y-axis dragging */
  y?: boolean | DraggableAxisParam;
  /** Function to modify drag values */
  modifier?: TweenModifier;
  /** Snap points for both axes */
  snap?: number | number[] | ((draggable: Draggable) => number | Array<number>);
  /** Padding inside the container */
  containerPadding?:
    | number
    | number[]
    | ((draggable: Draggable) => number | Array<number>);
  /** Friction when dragging inside container */
  containerFriction?: number | ((draggable: Draggable) => number);
  /** Friction when releasing inside container */
  releaseContainerFriction?: number | ((draggable: Draggable) => number);
  /** Speed multiplier for dragging */
  dragSpeed?: number | ((draggable: Draggable) => number);
  /** Speed multiplier for scrolling */
  scrollSpeed?: number | ((draggable: Draggable) => number);
  /** Threshold for scroll activation */
  scrollThreshold?: number | ((draggable: Draggable) => number);
  /** Minimum velocity to consider for momentum */
  minVelocity?: number | ((draggable: Draggable) => number);
  /** Maximum velocity for momentum */
  maxVelocity?: number | ((draggable: Draggable) => number);
  /** Multiplier for velocity calculations */
  velocityMultiplier?: number | ((draggable: Draggable) => number);
  /** Mass for release physics */
  releaseMass?: number;
  /** Stiffness for release physics */
  releaseStiffness?: number;
  /** Damping for release physics */
  releaseDamping?: number;
  /** Easing for release animation */
  releaseEase?: EasingParam;
  /** Custom cursor options */
  cursor?:
    | boolean
    | DraggableCursorParams
    | ((draggable: Draggable) => boolean | DraggableCursorParams);
  /** Callback when element is grabbed */
  onGrab?: Callback<Draggable>;
  /** Callback during dragging */
  onDrag?: Callback<Draggable>;
  /** Callback when element is released */
  onRelease?: Callback<Draggable>;
  /** Callback when movement settles */
  onSettle?: Callback<Draggable>;
  /** Callback when element snaps to a point */
  onSnap?: Callback<Draggable>;
  /** Callback when container resizes */
  onResize?: Callback<Draggable>;
  /** Callback after resize is completed */
  onAfterResize?: Callback<Draggable>;
};

/**
 * SVG geometry element with draw attribute
 */
type DrawableSVGGeometry = SVGGeometryElement & {
  /** Set the draw attribute with start and end percentages */
  setAttribute(name: "draw", value: `${number} ${number}`): void;
  /** Draw attribute in format "start end" */
  draw: `${number} ${number}`;
};

// --------------------------------------------------------------------------
// SCROLL TYPES
// --------------------------------------------------------------------------

/**
 * Value representing a scroll threshold position
 */
type ScrollThresholdValue = string | number;

/**
 * Parameters for a scroll threshold
 */
type ScrollThresholdParam = {
  /** Target element threshold */
  target?: ScrollThresholdValue;
  /** Container threshold */
  container?: ScrollThresholdValue;
};

/**
 * Function that returns the axis for scroll observation
 */
type ScrollObserverAxisCallback = (self: ScrollObserver) => "x" | "y";

/**
 * Function that returns a scroll threshold
 */
type ScrollThresholdCallback = (
  self: ScrollObserver
) => ScrollThresholdValue | ScrollThresholdParam;

/**
 * Parameters for scroll observers
 */
type ScrollObserverParams = BaseParams & {
  /** Enable synchronized animations */
  sync?: boolean | number | string | EasingParam;
  /** Scroll container element */
  container?: TargetsParam;
  /** Target element to observe */
  target?: TargetsParam;
  /** Scroll axis to observe */
  axis?:
    | "x"
    | "y"
    | ScrollObserverAxisCallback
    | ((observer: ScrollObserver) => "x" | "y" | ScrollObserverAxisCallback);
  /** Threshold for element entering viewport */
  enter?:
    | ScrollThresholdParam
    | ScrollThresholdValue
    | ScrollThresholdCallback
    | ((
        observer: ScrollObserver
      ) =>
        | ScrollThresholdValue
        | ScrollThresholdParam
        | ScrollThresholdCallback);
  /** Threshold for element leaving viewport */
  leave?:
    | ScrollThresholdParam
    | ScrollThresholdValue
    | ScrollThresholdCallback
    | ((
        observer: ScrollObserver
      ) =>
        | ScrollThresholdValue
        | ScrollThresholdParam
        | ScrollThresholdCallback);
  /** Whether to repeat observations */
  repeat?: boolean | ((observer: ScrollObserver) => boolean);
  /** Enable debug visualization */
  debug?: boolean;
  /** Callback when element enters viewport */
  onEnter?: Callback<ScrollObserver>;
  /** Callback when element leaves viewport */
  onLeave?: Callback<ScrollObserver>;
  /** Callback when element enters while scrolling forward */
  onEnterForward?: Callback<ScrollObserver>;
  /** Callback when element leaves while scrolling forward */
  onLeaveForward?: Callback<ScrollObserver>;
  /** Callback when element enters while scrolling backward */
  onEnterBackward?: Callback<ScrollObserver>;
  /** Callback when element leaves while scrolling backward */
  onLeaveBackward?: Callback<ScrollObserver>;
  /** Callback during scroll with element in view */
  onUpdate?: Callback<ScrollObserver>;
  /** Callback when synchronized animation completes */
  onSyncComplete?: Callback<ScrollObserver>;
};

// --------------------------------------------------------------------------
// SPRING TYPES
// --------------------------------------------------------------------------

/**
 * Parameters for a spring animation
 */
type SpringParams = BaseParams & {
  /** Mass of the spring system */
  mass?: number;
  /** Stiffness of the spring */
  stiffness?: number;
  /** Damping factor */
  damping?: number;
  /** Initial velocity */
  velocity?: number;
};

// --------------------------------------------------------------------------
// MISCELLANEOUS TYPES
// --------------------------------------------------------------------------

/**
 * Parameters for inSequenceed animations
 */
type SequenceParameters = {
  /** Start value */
  start?: number | string;
  /** Element to start from */
  from?: number | "first" | "center" | "last";
  /** Whether to reverse the inSequence order */
  reversed?: boolean;
  /** Grid dimensions for 2D sequencing */
  grid?: Array<number>;
  /** Axis for grid sequencing */
  axis?: "x" | "y";
  /** Easing function for inSequence timing */
  ease?: EasingParam;
  /** Function to modify inSequence values */
  modifier?: TweenModifier;
};

/**
 * Function that returns a inSequenceed value
 */
type SequenceFunction = (
  target?: Target,
  index?: number,
  length?: number,
  tl?: Timeline
) => number | string;

/**
 * Parameters for a scope
 */
type ScopeParams = {
  /** Root element for the scope */
  root?: DOMTargetSelector | ReactRef | AngularRef;
  /** Default parameters for animations in this scope */
  defaults?: DefaultsParams;
  /** Media queries to respond to */
  mediaQueries?: Record<string, string>;
};

/**
 * Function to clean up a scope
 */
type ScopeCleanup = (scope?: Scope) => any;

/**
 * Function to construct a scope
 */
type ScopeConstructor = (scope?: Scope) => ScopeCleanup | void;

/**
 * Method on a scope
 */
type ScopeMethod = (...args: any[]) => ScopeCleanup | void;

/**
 * React ref object
 */
type ReactRef = {
  /** Current DOM element */
  current?: HTMLElement | SVGElement | null;
};

/**
 * Angular ref object
 */
type AngularRef = {
  /** Native DOM element */
  nativeElement?: HTMLElement | SVGElement;
};

// --------------------------------------------------------------------------
// INTERNAL TYPES
// --------------------------------------------------------------------------

/**
 * Internal tween structure
 */
type Tween = {
  id: number;
  parent: JSAnimation;
  property: string;
  target: Target;
  _value: string | number;
  _func: ((target: Target, index: number) => any) | null;
  _ease: EasingFunction;
  _fromNumbers: Array<number>;
  _toNumbers: Array<number>;
  _strings: Array<string>;
  _fromNumber: number;
  _toNumber: number;
  _numbers: Array<number>;
  _number: number;
  _unit: string;
  _modifier: TweenModifier;
  _currentTime: number;
  _delay: number;
  _updateDuration: number;
  _startTime: number;
  _changeDuration: number;
  _absoluteStartTime: number;
  _tweenType: tweenTypes;
  _valueType: valueTypes;
  _composition: number;
  _isOverlapped: number;
  _isOverridden: number;
  _renderTransforms: number;
  _prevRep: Tween;
  _nextRep: Tween;
  _prevAdd: Tween;
  _nextAdd: Tween;
  _prev: Tween;
  _next: Tween;
};

/**
 * Decomposed tween value for internal processing
 */
type TweenDecomposedValue = {
  /** Type */
  t: number;
  /** Single number value */
  n: number;
  /** Value unit */
  u: string;
  /** Value operator */
  o: string;
  /** Array of Numbers (for complex value types) */
  d: Array<number>;
  /** Strings (for complex value types) */
  s: Array<string>;
};

/**
 * Linked list of property sibling tweens
 */
type TweenPropertySiblings = {
  _head: null | Tween;
  _tail: null | Tween;
};

/**
 * Lookup table for property siblings
 */
type TweenLookups = Record<string, TweenPropertySiblings>;

/**
 * Lookup table for replacement tweens
 */
type TweenReplaceLookups = WeakMap<Target, TweenLookups>;

/**
 * Lookup table for additive tweens
 */
type TweenAdditiveLookups = Map<Target, TweenLookups>;

// --------------------------------------------------------------------------
// FUNCTION DECLARATIONS
// --------------------------------------------------------------------------

/**
 * Function to convert an easing function to a linear keyframe string
 * @param fn The easing function to convert
 * @param samples Number of samples to use for the conversion
 * @returns A string representation of the easing function
 */
declare function easingToLinear(fn: EasingFunction, samples?: number): string;

declare function createTimer(parameters?: TimerParams): Timer;
declare function animate(
  targets: TargetsParam,
  parameters: AnimationParams
): JSAnimation;
declare function createTimeline(parameters?: TimelineParams): Timeline;
declare function createAnimatable(
  targets: TargetsParam,
  parameters: AnimatableParams
): AnimatableObject;
declare function createDraggable(
  target: TargetsParam,
  parameters?: DraggableParams
): Draggable;
declare function createScope(params?: ScopeParams): Scope;
declare function onScroll(parameters?: ScrollObserverParams): ScrollObserver;
declare function createSpring(parameters?: SpringParams): Spring;
declare function inSequence(
  val: number | string | [number | string, number | string],
  params?: SequenceParameters
): SequenceFunction;

// New API names (Phase 2 renaming)
declare function createMotionTimer(parameters?: TimerParams): Timer;
declare function createMotion(
  targets: TargetsParam,
  parameters: AnimationParams
): JSAnimation;
declare function createMotionTimeline(parameters?: TimelineParams): Timeline;
declare function createMotionAnimation(
  targets: TargetsParam,
  parameters: AnimatableParams
): AnimatableObject;
declare function createMotionDraggable(
  target: TargetsParam,
  parameters?: DraggableParams
): Draggable;
declare function createMotionScope(params?: ScopeParams): Scope;
declare function createMotionScroll(
  parameters?: ScrollObserverParams
): ScrollObserver;
declare function createMotionSpring(parameters?: SpringParams): Spring;

// --------------------------------------------------------------------------
// CLASS DECLARATIONS
// --------------------------------------------------------------------------

/**
 * Base engine class
 */
declare class Engine extends Clock {
  useDefaultMainLoop: boolean;
  pauseOnDocumentHidden: boolean;
  defaults: DefaultsParams;
  paused: boolean;
  reqId: number | unknown;
}

/**
 * Base clock class for timing
 */
declare class Clock {
  deltaTime: number;
  _currentTime: number;
  _elapsedTime: number;
  _startTime: number;
  _lastTime: number;
  _scheduledTime: number;
  _frameDuration: number;
  _fps: number;
  _speed: number;
  _hasChildren: boolean;
  _head: Tickable | Tween;
  _tail: Tickable | Tween;
}

/**
 * Timer class for animation timing
 */
declare class Timer extends Clock {
  constructor(
    parameters?: TimerParams,
    parent?: Timeline,
    parentPosition?: number
  );
  id: string | number;
  parent: Timeline;
  duration: number;
  backwards: boolean;
  paused: boolean;
  began: boolean;
  completed: boolean;
  onBegin: Callback<this>;
  onBeforeUpdate: Callback<this>;
  onUpdate: Callback<this>;
  onLoop: Callback<this>;
  onPause: Callback<this>;
  onComplete: Callback<this>;
}

/**
 * JavaScript animation class
 */
declare class JSAnimation extends Timer {
  constructor(
    targets: TargetsParam,
    parameters: AnimationParams,
    opts?: Partial<{
      playState: string;
      timelineOffset: number;
      addToLibrary: boolean;
    }>
  );

  targets: TargetsArray;
  duration: number;
  iterationDuration: number;
  iterations: number;
  endDelay: number;
  hasEnded: boolean;
  keyframes: AnyObject;
  parameters: JSAnimationParameters;
  normalizedKeyframes: AnyObject;
  easingFn: EasingFunction;
  values: AnyObject;
  percentages: number[];
  onUpdate: Callback<JSAnimation>;
  onComplete: Callback<JSAnimation>;
  onCancel?: () => void;

  process(params: AnimationParams): void;
  animateProperties(): void;
  tweenProperties(): void;
  parseProperties(params: AnimationParams): void;
  computeKeyframes(keyframes: any): Record<PropertyName, any>;
  normalizeKeyframes(keyframes: any): Record<PropertyName, any>;
}

/**
 * Timeline for sequencing animations
 */
declare class Timeline extends Timer {
  constructor(parameters?: TimelineParams);
  labels: Record<string, number>;
  defaults: DefaultsParams;
  onRender: Callback<this>;
  _ease: EasingFunction;
}

/**
 * Animatable object for property animations
 */
declare class Animatable {
  constructor(targets: TargetsParam, parameters: AnimatableParams);
  targets: (HTMLElement | SVGElement | JSTarget)[];
  animations: Record<string, JSAnimation>;
  revert(): this;
}

/**
 * Draggable element class
 */
declare class Draggable {
  constructor(target: TargetsParam, parameters?: DraggableParams);
  $target: HTMLElement;
  animate: AnimatableObject;
}

/**
 * Transforms helper class
 */
declare class Transforms {
  constructor($el: DOMTarget | DOMProxy);
  $el: DOMTarget | DOMProxy;
  inlineTransforms: string[];
  point: DOMPoint;
  inversedMatrix: DOMMatrix;
}

/**
 * DOM proxy for transforms
 */
declare class DOMProxy {
  constructor(target: DOMTarget);
  el: AnyObject;
  zIndex: number;
  parentElement: any;
  classList: {
    add: (className: string) => void;
    remove: (className: string) => void;
  };
}

/**
 * Animation scope for organization
 */
declare class Scope {
  constructor(params?: ScopeParams);
  defaults: DefaultsParams;
  root: Document | DOMTarget;
  constructors: Array<ScopeConstructor>;
  revertConstructors: Array<() => void>;
  revertibles: Array<Revertible>;
  methods: Record<string, (...args: any[]) => any>;
  matches: Record<string, boolean>;
  mediaQueryLists: Record<string, MediaQueryList>;
  data: Record<string, any>;
}

/**
 * Scroll observer class
 */
declare class ScrollObserver {
  constructor(parameters?: ScrollObserverParams);
  index: number;
  id: string | number;
  container: ScrollContainer;
  target: HTMLElement;
  linked: Tickable | unknown;
  repeat: boolean;
  horizontal: boolean;
  enter: ScrollThresholdParam | ScrollThresholdValue | ScrollThresholdCallback;
  leave: ScrollThresholdParam | ScrollThresholdValue | ScrollThresholdCallback;
  sync: boolean;
  syncEase: EasingFunction;
  syncSmooth: number;
}

/**
 * Scroll container class
 */
declare class ScrollContainer {
  constructor(container: DOMTargetSelector);
  element: HTMLElement;
  useWin: boolean;
  winWidth: number;
  winHeight: number;
  width: number;
  height: number;
}

/**
 * Spring physics class
 */
declare class Spring {
  constructor(parameters?: SpringParams);
  timeStep: number;
  restThreshold: number;
  restDuration: number;
  maxDuration: number;
  maxRestSteps: number;
  maxIterations: number;
  m: number;
  s: number;
  d: number;
  v: number;
  w0: number;
  zeta: number;
  wd: number;
  b: number;
  solverDuration: number;
  duration: number;
  ease: EasingFunction;
}

// --------------------------------------------------------------------------
// EXPORTS
// --------------------------------------------------------------------------

declare const engine: Engine;
declare const utils: any;
declare const svg: any;
declare const eases: any;
declare const scrollContainers: any;

// New API names (Phase 2 renaming)
declare const InMotion: Engine;
declare const inMotion: any;
declare const createMotionSVG: any;

// Type exports
export type {
  // Core Animation Types
  Renderable,
  Tickable,
  CallbackArgument,
  Revertible,

  // DOM and Target Types
  DOMTarget,
  JSTarget,
  Target,
  TargetSelector,
  DOMTargetSelector,
  DOMTargetsParam,
  DOMTargetsArray,
  JSTargetsParam,
  JSTargetsArray,
  TargetsParam,
  TargetsArray,

  // Callback and Function Types
  FunctionValue,
  TweenModifier,
  Callback,
  TickableCallbacks,
  RenderableCallbacks,

  // Numeric Constants
  tweenTypes,
  valueTypes,
  tickModes,
  compositionTypes,

  // Chainable Utils
  ChainedUtilsResult,
  ChainableUtils,
  ChainableUtil,
  ChainedClamp,
  ChainedRound,
  ChainedSnap,
  ChainedWrap,
  ChainedInterpolate,
  ChainedMapRange,
  ChainedRoundPad,
  ChainedPadStart,
  ChainedPadEnd,
  ChainedDegToRad,
  ChainedRadToDeg,

  // Easing Types
  EasingFunction,
  PowerEasing,
  BackEasing,
  ElasticEasing,
  EaseStringParamNames,
  EasingParam,

  // Tween Types
  TweenParamValue,
  TweenPropValue,
  TweenComposition,
  TweenParamsOptions,
  TweenValues,
  TweenKeyValue,
  ArraySyntaxValue,
  TweenOptions,
  TweenObjectValue,
  ColorArray,

  // Animation Parameter Types
  PercentageKeyframeOptions,
  PercentageKeyframeParams,
  PercentageKeyframes,
  DurationKeyframes,
  AnimationOptions,
  TimerOptions,
  TimerParams,
  AnimationParams,
  TimelineOptions,
  TimelineParams,
  TimePosition,
  DefaultsParams,

  // Animatable Types
  AnimatablePropertySetter,
  AnimatablePropertyGetter,
  AnimatableProperty,
  AnimatableObject,
  AnimatablePropertyParamsOptions,
  AnimatableParams,

  // Draggable Types
  DraggableAxisParam,
  DraggableCursorParams,
  DraggableParams,
  DrawableSVGGeometry,

  // Scroll Types
  ScrollThresholdValue,
  ScrollThresholdParam,
  ScrollObserverAxisCallback,
  ScrollThresholdCallback,
  ScrollObserverParams,

  // Spring Types
  SpringParams,

  // Miscellaneous Types
  SequenceParameters,
  SequenceFunction,
  ScopeParams,
  ScopeCleanup,
  ScopeConstructor,
  ScopeMethod,
  ReactRef,
  AngularRef,

  // Internal Types
  Tween,
  TweenDecomposedValue,
  TweenPropertySiblings,
  TweenLookups,
  TweenReplaceLookups,
  TweenAdditiveLookups,

  // Newly exposed class / interface types
  Timeline,
  JSAnimation,
  Spring,
  Scope,
  Timer,
  ScrollObserver,
  Draggable,
  DOMProxy,
  Transforms,
  Animatable,
  Engine,
  Clock,
};

/**
 * ScrollObserverInterface for observing elements within scroll containers
 */
interface ScrollObserverInterface {
  /** Unique index for the observer */
  index: number;
  /** Unique identifier */
  id: string | number;
  /** Container for this observer */
  container: ScrollContainerInterface;
  /** Target element to observe */
  target: HTMLElement | null;
  /** Linked animation or timer */
  linked: Tickable | unknown;
  /** Whether to repeat observation */
  repeat: boolean | null;
  /** Whether scrolling on horizontal axis */
  horizontal: boolean | null;
  /** Enter threshold configuration */
  enter:
    | ScrollThresholdParam
    | ScrollThresholdValue
    | ScrollThresholdCallback
    | null;
  /** Leave threshold configuration */
  leave:
    | ScrollThresholdParam
    | ScrollThresholdValue
    | ScrollThresholdCallback
    | null;
  /** Whether to sync with linked animation */
  sync: boolean;
  /** Easing function for sync */
  syncEase: EasingFunction | null;
  /** Smoothness amount for sync */
  syncSmooth: number | null;
  /** Callback when element enters viewport in sync mode */
  onSyncEnter: Callback<ScrollObserver>;
  /** Callback when element leaves viewport in sync mode */
  onSyncLeave: Callback<ScrollObserver>;
  /** Callback when element enters viewport while scrolling forward in sync mode */
  onSyncEnterForward: Callback<ScrollObserver>;
  /** Callback when element leaves viewport while scrolling forward in sync mode */
  onSyncLeaveForward: Callback<ScrollObserver>;
  /** Callback when element enters viewport while scrolling backward in sync mode */
  onSyncEnterBackward: Callback<ScrollObserver>;
  /** Callback when element leaves viewport while scrolling backward in sync mode */
  onSyncLeaveBackward: Callback<ScrollObserver>;
  /** Callback when element enters viewport */
  onEnter: Callback<ScrollObserver>;
  /** Callback when element leaves viewport */
  onLeave: Callback<ScrollObserver>;
  /** Callback when element enters viewport while scrolling forward */
  onEnterForward: Callback<ScrollObserver>;
  /** Callback when element leaves viewport while scrolling forward */
  onLeaveForward: Callback<ScrollObserver>;
  /** Callback when element enters viewport while scrolling backward */
  onEnterBackward: Callback<ScrollObserver>;
  /** Callback when element leaves viewport while scrolling backward */
  onLeaveBackward: Callback<ScrollObserver>;
  /** Callback during scroll with element in view */
  onUpdate: Callback<ScrollObserver>;
  /** Callback when synchronized animation completes */
  onSyncComplete: Callback<ScrollObserver>;
  /** Whether observer has been reverted */
  reverted: boolean;
  /** Whether animation has completed */
  completed: boolean;
  /** Whether animation has begun */
  began: boolean;
  /** Whether element is currently in view */
  isInView: boolean;
  /** Whether to force enter state */
  forceEnter: boolean;
  /** Whether element has entered view at least once */
  hasEntered: boolean;
  /** Element offsets [x, y] */
  offsets: number[];
  /** Current offset value */
  offset: number;
  /** Start offset for animation */
  offsetStart: number;
  /** End offset for animation */
  offsetEnd: number;
  /** Distance between start and end */
  distance: number;
  /** Previous progress value */
  prevProgress: number;
  /** Threshold configuration names */
  thresholds: string[];
  /** Coordinate values for thresholds */
  coords: [number, number, number, number];
  /** Debug animation styles */
  debugStyles: JSAnimation | null;
  /** Debug element */
  $debug: HTMLElement | null;
  /** Original parameters */
  _params: ScrollObserverParams;
  /** Whether debug is enabled */
  _debug: boolean;
  /** Next observer in linked list */
  _next: ScrollObserver | null;
  /** Previous observer in linked list */
  _prev: ScrollObserver | null;

  /** Link to an animation or timer */
  link(linked: Tickable | unknown): ScrollObserver;
  /** Get current velocity */
  velocity: number;
  /** Whether scrolling backward */
  backward: boolean;
  /** Current scroll position */
  scroll: number;
  /** Current progress (0-1) */
  progress: number;
  /** Refresh observer state */
  refresh(): ScrollObserver;
  /** Remove debug visualization */
  removeDebug(): ScrollObserver;
  /** Add debug visualization */
  debug(): void;
  /** Update element and container bounds */
  updateBounds(): void;
  /** Handle scroll events */
  handleScroll(): void;
  /** Revert all changes and clean up */
  revert(): ScrollObserver | void;
}

/**
 * ScrollContainerInterface for managing scroll containers
 */
interface ScrollContainerInterface {
  /** The container element */
  element: HTMLElement;
  /** Whether this container is the window/body */
  useWin: boolean;
  /** Window width */
  winWidth: number;
  /** Window height */
  winHeight: number;
  /** Container width */
  width: number;
  /** Container height */
  height: number;
  /** Container left position */
  left: number;
  /** Container top position */
  top: number;
  /** Container z-index value */
  zIndex: number;
  /** Current scroll position on x-axis */
  scrollX: number;
  /** Current scroll position on y-axis */
  scrollY: number;
  /** Previous scroll position on x-axis */
  prevScrollX: number;
  /** Previous scroll position on y-axis */
  prevScrollY: number;
  /** Scrollable width of the container */
  scrollWidth: number;
  /** Scrollable height of the container */
  scrollHeight: number;
  /** Current scroll velocity */
  velocity: number;
  /** Whether scrolling backward on x-axis */
  backwardX: boolean;
  /** Whether scrolling backward on y-axis */
  backwardY: boolean;
  /** Timer for scroll events */
  scrollTicker: Timer;
  /** Timer for scroll data updates */
  dataTimer: Timer;
  /** Timer for resize events */
  resizeTicker: Timer;
  /** Timer for waking up scrolling */
  wakeTicker: Timer;
  /** ResizeObserver for container */
  resizeObserver: ResizeObserver;
  /** Head of the linked child list */
  _head: ScrollObserver | null;
  /** Tail of the linked child list */
  _tail: ScrollObserver | null;

  /** Update current scroll coordinates */
  updateScrollCoords(): void;
  /** Update window dimensions */
  updateWindowBounds(): void;
  /** Update container bounds */
  updateBounds(): void;
  /** Refresh all scroll observers */
  refreshScrollObservers(): void;
  /** Refresh container and all observers */
  refresh(): void;
  /** Handle scroll events */
  handleScroll(): void;
  /** Handle DOM events */
  handleEvent(e: Event): void;
  /** Revert all changes and clean up */
  revert(): void;
}

/**
 * Animatable interface for animation objects with dynamic properties
 */
export interface IAnimatable {
  /** Array of animation targets */
  targets: TargetsArray;
  /** Storage for property animations */
  animations: Record<string, JSAnimation>;
  /** Dynamic property indexer for animatable properties */
  [key: string]: AnimatableProperty | any;
  
  /**
   * Reverts all animations and restores original state.
   * @return The current animatable instance
   */
  revert(): IAnimatable;
}

/**
 * Draggable interface for animation objects with draggable functionality
 */
export interface IDraggable {
  $target: HTMLElement;
  animate: AnimatableObject;
}
