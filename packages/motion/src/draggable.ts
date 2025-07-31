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

import { JSAnimation, Animatable } from "./animation.ts";

import { win, doc, maxValue, noop, compositionTypes } from "./consts.ts";

import { parseTargets } from "./targets.ts";

import {
  snap,
  clamp,
  round,
  isObj,
  isUnd,
  isArr,
  isFnc,
  sqrt,
  max,
  atan2,
  cos,
  sin,
  abs,
  now,
} from "./helpers.ts";

import {
  getTargetValue,
  setTargetValues,
  remove,
  mapRange,
} from "./utils/index.ts";

import { Timer } from "./timer.ts";

import { setValue } from "./values.ts";

import { parseEasings as _parseEasings } from "./eases.ts";

import { createMotionSpring } from "./spring.ts";

import type {
  DOMTarget,
  DraggableParams,
  DOMTargetSelector,
  Callback,
  EasingFunction,
  DraggableCursorParams,
  DraggableAxisParam,
  Spring,
  DOMProxy as DOMProxyInterface,
  Transforms as TransformsInterface,
  AnimatableParams,
  AnimatableObject,
  TargetsParam,
  AnyObject,
} from "./types.ts";

/**
 * Prevents default browser behavior for an event
 *
 * @param {Event} e - The event to prevent default behavior
 */
const preventDefault = (e: Event): void => {
  if (e.cancelable) e.preventDefault();
};

/**
 * Noop function specifically for Draggable callbacks
 * Implements the Callback<Draggable> type interface
 */
const draggableNoop = (_self: InMotionDraggable, _e?: PointerEvent): void => {};

/**
 * # DOMProxy
 * @summary Provides a DOM-like interface for non-DOM objects
 * NOTE: This might get replaced by @inspatial/dom module
 *
 * A proxy class that mimics DOM element behavior for JavaScript objects.
 * This allows treating any object with x, y, width, height properties
 * like a DOM element for dragging purposes.
 */
class DOMProxy implements DOMProxyInterface {
  /** The source object being proxied */
  el: AnyObject;

  /** z-index value for stacking context */
  zIndex: number;

  /** Parent element reference */
  parentElement: any;

  /** Class list for DOM compatibility */
  classList: {
    add: (className: string) => void;
    remove: (className: string) => void;
  };

  /**
   * Creates a new DOM proxy for a JavaScript object
   *
   * @param {AnyObject} el - Object to proxy
   */
  constructor(el: AnyObject) {
    this.el = el;
    this.zIndex = 0;
    this.parentElement = null;
    this.classList = {
      add: noop,
      remove: noop,
    };
  }

  /**
   * Gets the x-coordinate
   */
  get x(): number {
    return this.el.x || 0;
  }

  /**
   * Sets the x-coordinate
   */
  set x(v: number) {
    this.el.x = v;
  }

  /**
   * Gets the y-coordinate
   */
  get y(): number {
    return this.el.y || 0;
  }

  /**
   * Sets the y-coordinate
   */
  set y(v: number) {
    this.el.y = v;
  }

  /**
   * Gets the width
   */
  get width(): number {
    return this.el.width || 0;
  }

  /**
   * Sets the width
   */
  set width(v: number) {
    this.el.width = v;
  }

  /**
   * Gets the height
   */
  get height(): number {
    return this.el.height || 0;
  }

  /**
   * Sets the height
   */
  set height(v: number) {
    this.el.height = v;
  }

  /**
   * Returns a DOMRect representing the element's position and size
   *
   * @return {DOMRect} - A DOMRect object
   */
  getBoundingClientRect(): DOMRect {
    return {
      top: this.y,
      right: this.x,
      bottom: this.y + this.height,
      left: this.x + this.width,
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      toJSON: () => ({
        top: this.y,
        right: this.x,
        bottom: this.y + this.height,
        left: this.x + this.width,
        width: this.width,
        height: this.height,
        x: this.x,
        y: this.y,
      }),
    };
  }
}

/**
 * # Transforms
 * @summary Handles transform operations for DOM elements
 *
 * Manages transform operations for draggable elements, including
 * converting coordinates between coordinate systems, traversing
 * parent elements, and managing transform styles.
 */
class Transforms implements TransformsInterface {
  /** Target element */
  $el: DOMTarget | DOMProxyInterface;

  /** Original transform values for each parent */
  inlineTransforms: string[] = [];

  /** Point used for coordinate transformations */
  point: DOMPoint;

  /** Inverse matrix for coordinate system conversion */
  inversedMatrix: DOMMatrix;

  /**
   * Creates a new transform handler
   *
   * @param {DOMTarget|DOMProxyInterface} $el - Element to transform
   */
  constructor($el: DOMTarget | DOMProxyInterface) {
    this.$el = $el;
    this.inlineTransforms = [];
    this.point = new DOMPoint();
    this.inversedMatrix = this.getMatrix().inverse();
  }

  /**
   * Converts a point from screen coordinates to element's coordinate system
   *
   * @param {number} x - X coordinate in screen space
   * @param {number} y - Y coordinate in screen space
   * @return {DOMPoint} - Transformed point in element's coordinate system
   */
  normalizePoint(x: number, y: number): DOMPoint {
    this.point.x = x;
    this.point.y = y;
    return this.point.matrixTransform(this.inversedMatrix);
  }

  /**
   * Traverses up the DOM tree and executes a callback for each parent element
   *
   * @param {(el: DOMTarget, i: number) => void} cb - Callback to execute for each parent
   */
  traverseUp(cb: (el: DOMTarget, i: number) => void): void {
    let $el = (this.$el as DOMTarget).parentElement as DOMTarget | Document,
      i = 0;
    while ($el && $el !== doc) {
      cb($el as DOMTarget, i);
      $el = ($el as DOMTarget).parentElement as DOMTarget;
      i++;
    }
  }

  /**
   * Gets the combined transform matrix of all parent elements
   *
   * @return {DOMMatrix} - Combined transform matrix
   */
  getMatrix(): DOMMatrix {
    const matrix = new DOMMatrix();
    this.traverseUp(($el: DOMTarget) => {
      const transformValue = getComputedStyle($el).transform;
      if (transformValue) {
        const elMatrix = new DOMMatrix(transformValue);
        matrix.preMultiplySelf(elMatrix);
      }
    });
    return matrix;
  }

  /**
   * Removes all transforms from parent elements and stores the original values
   */
  remove(): void {
    this.traverseUp(($el: DOMTarget, i: number) => {
      this.inlineTransforms[i] = $el.style.transform;
      $el.style.transform = "none";
    });
  }

  /**
   * Restores original transform values to parent elements
   */
  revert(): void {
    this.traverseUp(($el: DOMTarget, i: number) => {
      const ct = this.inlineTransforms[i];
      if (ct === "") {
        $el.style.removeProperty("transform");
      } else {
        $el.style.transform = ct;
      }
    });
  }
}

/**
 * # parseDraggableFunctionParameter
 * @summary Resolves a parameter that might be a function
 *
 * Handles parameters that can be either static values or functions
 * that return values dynamically based on the draggable instance.
 *
 */
const parseDraggableFunctionParameter = <T>(
  value: T | ((draggable: InMotionDraggable) => T),
  draggable: InMotionDraggable
): T => {
  return value && isFnc(value)
    ? (value as (draggable: InMotionDraggable) => T)(draggable)
    : value;
};

let zIndex = 0;

/**
 * Interface for the Draggable class
 */
export interface IDraggable {
  // DOM references
  $target: HTMLElement | DOMProxyInterface;
  $trigger: HTMLElement;
  $container: HTMLElement;
  $scrollContainer: Window | HTMLElement;

  // Core properties
  parameters: DraggableParams;
  animate: AnimatableObject;
  transforms: TransformsInterface;

  // Axis properties
  xProp: string;
  yProp: string;
  activeProp: string;
  disabled: [number, number];

  // State flags
  fixed: boolean;
  contained: boolean;
  manual: boolean;
  grabbed: boolean;
  dragged: boolean;
  updated: boolean;
  released: boolean;
  canScroll: boolean;
  enabled: boolean;
  initialized: boolean;
  isFinePointer: boolean;

  // Position and movement data
  x: number;
  y: number;
  destX: number;
  destY: number;
  deltaX: number;
  deltaY: number;
  progressX: number;
  progressY: number;
  velocity: number;
  angle: number;
  containerArray: number[] | null;
  containerBounds: [number, number, number, number];
  containerPadding: [number, number, number, number];
  containerFriction: number;
  releaseContainerFriction: number;
  coords: [number, number, number, number];
  snapped: [number, number];
  snapX: number | number[];
  snapY: number | number[];
  scroll: { x: number; y: number };
  scrollView: [number, number];
  dragArea: [number, number, number, number];
  scrollBounds: [number, number, number, number];
  targetBounds: [number, number, number, number];
  pointer: [number, number, number, number, number, number, number, number];
  window: [number, number];

  // Physics and animation properties
  scrollSpeed: number;
  scrollThreshold: number;
  dragSpeed: number;
  maxVelocity: number;
  minVelocity: number;
  velocityMultiplier: number;
  velocityTime: number;
  velocityStack: [number, number, number];
  velocityStackIndex: number;
  useWin: boolean;
  cursor: boolean | DraggableCursorParams;
  releaseXSpring: Spring;
  releaseYSpring: Spring;
  releaseEase: EasingFunction;
  hasReleaseSpring: boolean;

  // Animation objects
  cursorStyles: JSAnimation | null;
  triggerStyles: JSAnimation | null;
  bodyStyles: JSAnimation | null;
  targetStyles: JSAnimation | null;
  touchActionStyles: JSAnimation | null;
  overshootCoords: { x: number; y: number };
  overshootXTicker: Timer;
  overshootYTicker: Timer;
  updateTicker: Timer;
  resizeTicker: Timer;
  resizeObserver: ResizeObserver;

  // Callbacks
  onGrab: Callback<InMotionDraggable>;
  onDrag: Callback<InMotionDraggable>;
  onRelease: Callback<InMotionDraggable>;
  onUpdate: Callback<InMotionDraggable>;
  onSettle: Callback<InMotionDraggable>;
  onSnap: Callback<InMotionDraggable>;
  onResize: Callback<InMotionDraggable>;
  onAfterResize: Callback<InMotionDraggable>;

  // Methods
  computeVelocity(dx: number, dy: number): number;
  setX(x: number, muteUpdateCallback?: boolean): InMotionDraggable;
  setY(y: number, muteUpdateCallback?: boolean): InMotionDraggable;
  updateScrollCoords(): void;
  updateBoundingValues(): void;
  isOutOfBounds(bounds: number[], x: number, y: number): number;
  refresh(): void;
  update(): void;
  stop(): InMotionDraggable;
  scrollInView(
    duration?: number,
    gap?: number,
    ease?: EasingFunction
  ): InMotionDraggable;
  handleHover(): void;
  animateInView(
    duration?: number,
    gap?: number,
    ease?: EasingFunction
  ): InMotionDraggable;
  handleDown(e: MouseEvent | TouchEvent): void;
  handleMove(e: MouseEvent | TouchEvent): void;
  handleUp(): void;
  reset(): InMotionDraggable;
  enable(): InMotionDraggable;
  disable(): InMotionDraggable;
  revert(): InMotionDraggable;
  handleEvent(e: Event): void;
}

/**
 * # InMotionDraggable
 * @summary Creates draggable elements with physics-based animations
 *
 * Enables dragging and flicking of DOM elements or JavaScript objects.
 * Supports physics-based spring animations, containment, snapping, and
 * customizable interactions.
 */
export class InMotionDraggable implements IDraggable {
  // DOM references
  $target!: HTMLElement | DOMProxyInterface;
  $trigger!: HTMLElement;
  $container!: HTMLElement;
  $scrollContainer!: Window | HTMLElement;

  // Core properties
  parameters!: DraggableParams;
  animate!: AnimatableObject;
  transforms!: TransformsInterface;

  // Axis properties
  xProp!: string;
  yProp!: string;
  activeProp!: string;
  disabled!: [number, number];

  // State flags
  fixed!: boolean;
  contained!: boolean;
  manual!: boolean;
  grabbed!: boolean;
  dragged!: boolean;
  updated!: boolean;
  released!: boolean;
  canScroll!: boolean;
  enabled!: boolean;
  initialized!: boolean;
  isFinePointer!: boolean;

  // Position and movement data
  destX!: number;
  destY!: number;
  deltaX!: number;
  deltaY!: number;
  containerArray!: number[] | null;
  containerBounds!: [number, number, number, number];
  containerPadding!: [number, number, number, number];
  containerFriction!: number;
  releaseContainerFriction!: number;
  coords!: [number, number, number, number];
  snapped!: [number, number];
  snapX!: number | number[];
  snapY!: number | number[];
  scroll!: { x: number; y: number };
  scrollView!: [number, number];
  dragArea!: [number, number, number, number];
  scrollBounds!: [number, number, number, number];
  targetBounds!: [number, number, number, number];
  pointer!: [number, number, number, number, number, number, number, number];
  window!: [number, number];

  // Physics and animation properties
  scrollSpeed!: number;
  scrollThreshold!: number;
  dragSpeed!: number;
  maxVelocity!: number;
  minVelocity!: number;
  velocityMultiplier!: number;
  velocityTime!: number;
  velocityStack!: [number, number, number];
  velocityStackIndex!: number;
  useWin!: boolean;
  cursor!: boolean | DraggableCursorParams;
  releaseXSpring!: Spring;
  releaseYSpring!: Spring;
  releaseEase!: EasingFunction;
  hasReleaseSpring!: boolean;
  velocity!: number;
  angle!: number;

  // Animation objects
  cursorStyles!: JSAnimation | null;
  triggerStyles!: JSAnimation | null;
  bodyStyles!: JSAnimation | null;
  targetStyles!: JSAnimation | null;
  touchActionStyles!: JSAnimation | null;
  overshootCoords!: { x: number; y: number };
  overshootXTicker!: Timer;
  overshootYTicker!: Timer;
  updateTicker!: Timer;
  resizeTicker!: Timer;
  resizeObserver!: ResizeObserver;

  // Callbacks
  onGrab!: Callback<InMotionDraggable>;
  onDrag!: Callback<InMotionDraggable>;
  onRelease!: Callback<InMotionDraggable>;
  onUpdate!: Callback<InMotionDraggable>;
  onSettle!: Callback<InMotionDraggable>;
  onSnap!: Callback<InMotionDraggable>;
  onResize!: Callback<InMotionDraggable>;
  onAfterResize!: Callback<InMotionDraggable>;

  /**
   * Creates a new draggable element or object
   *
   * @param {TargetsParam} target - Element to make draggable
   * @param {DraggableParams} parameters - Configuration parameters
   */
  constructor(target: TargetsParam, parameters: DraggableParams = {}) {
    // Store parameters
    this.parameters = parameters;

    // Get global references with fallbacks for clean testing
    const doc = globalThis.document;
    const win = globalThis.window;

    // Parse parameters
    const trigger = parameters.trigger;
    const modifier = parameters.modifier;
    const ease = parameters.releaseEase;
    const hasSpring = ease && (ease as any).ease;
    const customEase = ease && !hasSpring ? (ease as EasingFunction) : null;
    const paramX = parameters.x;
    const paramY = parameters.y;
    const xProp =
      isObj(paramX) && (paramX as DraggableAxisParam).mapTo
        ? (paramX as DraggableAxisParam).mapTo!
        : "x";
    const yProp =
      isObj(paramY) && (paramY as DraggableAxisParam).mapTo
        ? (paramY as DraggableAxisParam).mapTo!
        : "y";

    // Parse container parameter
    const container = parseDraggableFunctionParameter(
      parameters.container as any,
      this as InMotionDraggable
    );

    // Initialize properties
    this.containerArray = isArr(container) ? (container as number[]) : null;

    // Handle container setup with DOM-less fallbacks
    if (container && !this.containerArray) {
      this.$container = parseTargets(container as DOMTarget)[0] as HTMLElement;
    } else {
      // Create fallback container for clean testing
      if (doc?.body) {
        this.$container = doc.body as HTMLElement;
      } else {
        // DOM-less fallback: create a mock container
        this.$container = new DOMProxy({
          tagName: "BODY",
          clientWidth: 1024,
          clientHeight: 768,
          scrollWidth: 1024,
          scrollHeight: 768,
          scrollLeft: 0,
          scrollTop: 0,
        }) as any;
      }
    }

    // Determine if using window with DOM-less fallbacks
    const isDocumentBody = doc?.body && this.$container === doc.body;
    this.useWin = isDocumentBody || false;

    // Set scroll container with fallbacks
    if (this.useWin && win) {
      this.$scrollContainer = win;
    } else if (this.useWin && !win) {
      // DOM-less fallback: create mock window
      this.$scrollContainer = {
        innerWidth: 1024,
        innerHeight: 768,
        scrollX: 0,
        scrollY: 0,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as any;
    } else {
      this.$scrollContainer = this.$container;
    }

    // Set up target and trigger elements
    this.$target = isObj(target)
      ? new DOMProxy(target as AnyObject)
      : (parseTargets(target)[0] as HTMLElement);

    this.$trigger = parseTargets(trigger ? trigger : target)[0] as HTMLElement;

    // Get position with fallback for mock objects
    let targetPosition = "static";
    try {
      targetPosition = getTargetValue(this.$target, "position") || "static";
    } catch {
      // Fallback for mock objects
      targetPosition = (this.$target as any).position || "static";
    }
    this.fixed = targetPosition === "fixed";

    // Initialize refreshable parameters
    this.isFinePointer = true;
    this.containerPadding = [0, 0, 0, 0];
    this.containerFriction = 0;
    this.releaseContainerFriction = 0;
    this.snapX = 0;
    this.snapY = 0;
    this.scrollSpeed = 0;
    this.scrollThreshold = 0;
    this.dragSpeed = 0;
    this.maxVelocity = 0;
    this.minVelocity = 0;
    this.velocityMultiplier = 0;
    this.cursor = false;

    // Set up spring physics
    this.releaseXSpring = hasSpring
      ? (ease as Spring)
      : createMotionSpring({
          mass: setValue(parameters.releaseMass, 1),
          stiffness: setValue(parameters.releaseStiffness, 80),
          damping: setValue(parameters.releaseDamping, 20),
        });

    this.releaseYSpring = hasSpring
      ? (ease as Spring)
      : createMotionSpring({
          mass: setValue(parameters.releaseMass, 1),
          stiffness: setValue(parameters.releaseStiffness, 80),
          damping: setValue(parameters.releaseDamping, 20),
        });

    this.releaseEase = customEase || ((t: number) => t);
    this.hasReleaseSpring = hasSpring;

    // Set up callbacks with type assertion
    this.onGrab = (parameters.onGrab ||
      draggableNoop) as Callback<InMotionDraggable>;
    this.onDrag = (parameters.onDrag ||
      draggableNoop) as Callback<InMotionDraggable>;
    this.onRelease = (parameters.onRelease ||
      draggableNoop) as Callback<InMotionDraggable>;
    this.onUpdate = (parameters.onUpdate ||
      draggableNoop) as Callback<InMotionDraggable>;
    this.onSettle = (parameters.onSettle ||
      draggableNoop) as Callback<InMotionDraggable>;
    this.onSnap = (parameters.onSnap ||
      draggableNoop) as Callback<InMotionDraggable>;
    this.onResize = (parameters.onResize ||
      draggableNoop) as Callback<InMotionDraggable>;
    this.onAfterResize = (parameters.onAfterResize ||
      draggableNoop) as Callback<InMotionDraggable>;

    // Set up axis enabling/disabling
    this.disabled = [0, 0];

    // Configure animatable parameters
    const animatableParams: AnimatableParams = {};

    if (modifier) {
      animatableParams.modifier = modifier;
    }

    // Configure X axis
    if (isUnd(paramX) || paramX === true) {
      animatableParams[xProp] = 0;
    } else if (isObj(paramX)) {
      const paramXObject = paramX as DraggableAxisParam;
      const animatableXParams: Record<string, any> = {};

      if (paramXObject.modifier) {
        animatableXParams.modifier = paramXObject.modifier;
      }

      if (paramXObject.composition) {
        animatableXParams.composition = paramXObject.composition;
      }

      animatableParams[xProp] = animatableXParams;
    } else if (paramX === false) {
      animatableParams[xProp] = 0;
      this.disabled[0] = 1;
    }

    // Configure Y axis
    if (isUnd(paramY) || paramY === true) {
      animatableParams[yProp] = 0;
    } else if (isObj(paramY)) {
      const paramYObject = paramY as DraggableAxisParam;
      const animatableYParams: Record<string, any> = {};

      if (paramYObject.modifier) {
        animatableYParams.modifier = paramYObject.modifier;
      }

      if (paramYObject.composition) {
        animatableYParams.composition = paramYObject.composition;
      }

      animatableParams[yProp] = animatableYParams;
    } else if (paramY === false) {
      animatableParams[yProp] = 0;
      this.disabled[1] = 1;
    }

    // Create animatable object
    this.animate = new Animatable(
      this.$target,
      animatableParams
    ) as unknown as AnimatableObject;

    // Set up internal properties
    this.xProp = xProp;
    this.yProp = yProp;
    this.destX = 0;
    this.destY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.scroll = { x: 0, y: 0 };
    this.coords = [0, 0, 0, 0]; // x, y, temp x, temp y
    this.snapped = [0, 0]; // x, y
    this.pointer = [0, 0, 0, 0, 0, 0, 0, 0]; // x1, y1, x2, y2, temp x1, temp y1, temp x2, temp y2
    this.scrollView = [0, 0]; // w, h
    this.dragArea = [0, 0, 0, 0]; // x, y, w, h
    this.containerBounds = [-maxValue, maxValue, maxValue, -maxValue]; // t, r, b, l
    this.scrollBounds = [0, 0, 0, 0]; // t, r, b, l
    this.targetBounds = [0, 0, 0, 0]; // t, r, b, l
    this.window = [0, 0]; // w, h
    this.velocityStack = [0, 0, 0];
    this.velocityStackIndex = 0;
    this.velocityTime = now();
    this.velocity = 0;
    this.angle = 0;

    // Null animation objects (set later)
    this.cursorStyles = null;
    this.triggerStyles = null;
    this.bodyStyles = null;
    this.targetStyles = null;
    this.touchActionStyles = null;

    // Create transform handler
    this.transforms = new Transforms(this.$target);

    // Set up animation objects
    this.overshootCoords = { x: 0, y: 0 };

    // Create animation tickers
    this.overshootXTicker = new Timer({ autoplay: false }, null, 0).init();
    this.overshootYTicker = new Timer({ autoplay: false }, null, 0).init();
    this.updateTicker = new Timer({ autoplay: false }, null, 0).init();

    // Set up ticker callbacks
    this.overshootXTicker.onUpdate = () => {
      if (this.disabled[0]) return;
      this.updated = true;
      this.manual = true;
      this.animate[this.xProp](this.overshootCoords.x, 0);
    };

    this.overshootXTicker.onComplete = () => {
      if (this.disabled[0]) return;
      this.manual = false;
      this.animate[this.xProp](this.overshootCoords.x, 0);
    };

    this.overshootYTicker.onUpdate = () => {
      if (this.disabled[1]) return;
      this.updated = true;
      this.manual = true;
      this.animate[this.yProp](this.overshootCoords.y, 0);
    };

    this.overshootYTicker.onComplete = () => {
      if (this.disabled[1]) return;
      this.manual = false;
      this.animate[this.yProp](this.overshootCoords.y, 0);
    };

    this.updateTicker.onUpdate = () => this.update();

    // Set up state flags
    this.contained = !isUnd(container);
    this.manual = false;
    this.grabbed = false;
    this.dragged = false;
    this.updated = false;
    this.released = true; // Start in released state
    this.canScroll = false;
    this.enabled = false;
    this.initialized = false;

    // Set active property based on disabled axes
    this.activeProp = this.disabled[1] ? xProp : yProp;

    // Configure animation rendering callbacks
    // @ts-ignore - animations property exists at runtime
    this.animate.animations[this.activeProp].onRender = () => {
      const hasUpdated = this.updated;
      const hasMoved = this.grabbed && hasUpdated;
      const hasReleased = !hasMoved && this.released;
      const x = this.x;
      const y = this.y;
      const dx = x - this.coords[2];
      const dy = y - this.coords[3];
      this.deltaX = dx;
      this.deltaY = dy;
      this.coords[2] = x;
      this.coords[3] = y;

      if (hasUpdated) {
        this.onUpdate(this);
      }

      if (!hasReleased) {
        this.updated = false;
      } else {
        this.computeVelocity(dx, dy);
        this.angle = atan2(dy, dx);
      }
    };

    // @ts-ignore - animations property exists at runtime
    this.animate.animations[this.activeProp].onComplete = () => {
      if (!this.grabbed && this.released) {
        // Set released to false before calling onSettle to avoid recursion
        this.released = false;
      }

      if (!this.manual) {
        this.deltaX = 0;
        this.deltaY = 0;
        this.velocity = 0;
        this.velocityStack[0] = 0;
        this.velocityStack[1] = 0;
        this.velocityStack[2] = 0;
        this.velocityStackIndex = 0;
        this.onSettle(this);
      }
    };

    // Set up resize handler
    this.resizeTicker = new Timer({
      autoplay: false,
      duration: 150 * globals.timeScale,
      onComplete: () => {
        this.onResize(this);
        this.refresh();
        this.onAfterResize(this);
      },
    }).init();

    // Set up resize observer with DOM-less fallback
    if (globalThis.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.initialized) {
          this.resizeTicker.restart();
        } else {
          this.initialized = true;
        }
      });
    } else {
      // DOM-less fallback: create mock ResizeObserver
      this.resizeObserver = {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {},
      } as any;
    }

    // Enable dragging, refresh bounds, and observe size changes
    this.enable();
    this.refresh();

    // Only observe if ResizeObserver is available
    if (globalThis.ResizeObserver) {
      this.resizeObserver.observe(this.$container);

      if (!isObj(target) || target instanceof Element) {
        this.resizeObserver.observe(this.$target as HTMLElement);
      }
    } else {
      // For DOM-less testing, mark as initialized
      this.initialized = true;
    }
  }

  /**
   * Computes velocity from delta movement over time
   *
   * @param {number} dx - Change in x position
   * @param {number} dy - Change in y position
   * @return {number} - Computed velocity
   */
  computeVelocity(dx: number, dy: number): number {
    const prevTime = this.velocityTime;
    const curTime = now();
    const elapsed = curTime - prevTime;
    if (elapsed < 17) return this.velocity;

    this.velocityTime = curTime;
    const velocityStack = this.velocityStack;
    const vMul = this.velocityMultiplier;
    const minV = this.minVelocity;
    const maxV = this.maxVelocity;
    const vi = this.velocityStackIndex;

    velocityStack[vi] = round(
      clamp((sqrt(dx * dx + dy * dy) / elapsed) * vMul, minV, maxV),
      5
    );

    const velocity = max(velocityStack[0], velocityStack[1], velocityStack[2]);
    this.velocity = velocity;
    this.velocityStackIndex = (vi + 1) % 3;
    return velocity;
  }

  /**
   * Sets the x position with optional callback muting
   *
   * @param {number} x - New x position
   * @param {boolean} [muteUpdateCallback=false] - Whether to suppress the update callback
   * @return {this} - Chainable instance
   */
  setX(x: number, muteUpdateCallback = false): this {
    if (this.disabled[0]) return this;

    const v = round(x, 5);
    this.overshootXTicker.pause();
    this.manual = true;
    this.updated = !muteUpdateCallback;
    this.destX = v;
    this.snapped[0] = snap(v, this.snapX) || 0;
    this.animate[this.xProp](v, 0);
    this.manual = false;
    return this;
  }

  /**
   * Sets the y position with optional callback muting
   *
   * @param {number} y - New y position
   * @param {boolean} [muteUpdateCallback=false] - Whether to suppress the update callback
   * @return {this} - Chainable instance
   */
  setY(y: number, muteUpdateCallback = false): this {
    if (this.disabled[1]) return this;

    const v = round(y, 5);
    this.overshootYTicker.pause();
    this.manual = true;
    this.updated = !muteUpdateCallback;
    this.destY = v;
    this.snapped[1] = snap(v, this.snapY) || 0;
    this.animate[this.yProp](v, 0);
    this.manual = false;
    return this;
  }

  /**
   * Get the current x position
   */
  get x(): number {
    return round(this.animate[this.xProp]() as number, globals.precision);
  }

  /**
   * Set the x position
   */
  set x(x: number) {
    this.setX(x, false);
  }

  /**
   * Get the current y position
   */
  get y(): number {
    return round(this.animate[this.yProp]() as number, globals.precision);
  }

  /**
   * Set the y position
   */
  set y(y: number) {
    this.setY(y, false);
  }

  /**
   * Get the x position as a progress value (0-1) within container bounds
   */
  get progressX(): number {
    return mapRange(
      this.x,
      this.containerBounds[3],
      this.containerBounds[1],
      0,
      1
    );
  }

  /**
   * Set the x position using a progress value (0-1)
   */
  set progressX(x: number) {
    this.setX(
      mapRange(x, 0, 1, this.containerBounds[3], this.containerBounds[1]),
      false
    );
  }

  /**
   * Get the y position as a progress value (0-1) within container bounds
   */
  get progressY(): number {
    return mapRange(
      this.y,
      this.containerBounds[0],
      this.containerBounds[2],
      0,
      1
    );
  }

  /**
   * Set the y position using a progress value (0-1)
   */
  set progressY(y: number) {
    this.setY(
      mapRange(y, 0, 1, this.containerBounds[0], this.containerBounds[2]),
      false
    );
  }

  /**
   * Updates scroll coordinates based on current position
   */
  updateScrollCoords(): void {
    const sx = round(
      this.useWin
        ? ((win || window) as Window).scrollX
        : this.$container.scrollLeft,
      0
    );
    const sy = round(
      this.useWin
        ? ((win || window) as Window).scrollY
        : this.$container.scrollTop,
      0
    );
    const [cpt, cpr, cpb, cpl] = this.containerPadding;
    const threshold = this.scrollThreshold;

    this.scroll.x = sx;
    this.scroll.y = sy;
    this.scrollBounds[0] = sy - this.targetBounds[0] + cpt - threshold;
    this.scrollBounds[1] = sx - this.targetBounds[1] - cpr + threshold;
    this.scrollBounds[2] = sy - this.targetBounds[2] - cpb + threshold;
    this.scrollBounds[3] = sx - this.targetBounds[3] + cpl - threshold;
  }

  /**
   * Updates all bounding values for containers and targets
   */
  updateBoundingValues(): void {
    const $container = this.$container;
    const cx = this.x;
    const cy = this.y;
    const cx2 = this.coords[2];
    const cy2 = this.coords[3];

    // Prevents interfering with the scroll area if target is outside of container
    // Make sure the temp coords are also adjusted to prevent wrong delta calculation
    this.coords[2] = 0;
    this.coords[3] = 0;
    this.setX(0, true);
    this.setY(0, true);
    this.transforms.remove();

    const iw = (this.window[0] = ((win || window) as Window).innerWidth);
    const ih = (this.window[1] = ((win || window) as Window).innerHeight);
    const uw = this.useWin;
    const sw = $container.scrollWidth;
    const sh = $container.scrollHeight;
    const fx = this.fixed;
    const transformContainerRect = $container.getBoundingClientRect();
    const [cpt, cpr, cpb, cpl] = this.containerPadding;

    this.dragArea[0] = uw ? 0 : transformContainerRect.left;
    this.dragArea[1] = uw ? 0 : transformContainerRect.top;
    this.scrollView[0] = uw ? clamp(sw, iw, sw) : sw;
    this.scrollView[1] = uw ? clamp(sh, ih, sh) : sh;

    this.updateScrollCoords();

    const { width, height, left, top, right, bottom } =
      $container.getBoundingClientRect();

    this.dragArea[2] = round(uw ? clamp(width, iw, iw) : width, 0);
    this.dragArea[3] = round(uw ? clamp(height, ih, ih) : height, 0);

    const containerOverflow = getTargetValue($container, "overflow");
    const visibleOverflow = containerOverflow === "visible";
    const hiddenOverflow = containerOverflow === "hidden";

    this.canScroll = fx
      ? false
      : this.contained &&
        (($container === (doc?.body || document.body) && visibleOverflow) ||
          (!hiddenOverflow && !visibleOverflow)) &&
        (sw > this.dragArea[2] + cpl - cpr ||
          sh > this.dragArea[3] + cpt - cpb) &&
        (!this.containerArray ||
          (this.containerArray && !isArr(this.containerArray)));

    if (this.contained) {
      const sx = this.scroll.x;
      const sy = this.scroll.y;
      const canScroll = this.canScroll;
      const targetRect = this.$target.getBoundingClientRect();
      const hiddenLeft = canScroll ? (uw ? 0 : $container.scrollLeft) : 0;
      const hiddenTop = canScroll ? (uw ? 0 : $container.scrollTop) : 0;
      const hiddenRight = canScroll
        ? this.scrollView[0] - hiddenLeft - width
        : 0;
      const hiddenBottom = canScroll
        ? this.scrollView[1] - hiddenTop - height
        : 0;

      this.targetBounds[0] = round(targetRect.top + sy - (uw ? 0 : top), 0);
      this.targetBounds[1] = round(
        targetRect.right + sx - (uw ? iw : right),
        0
      );
      this.targetBounds[2] = round(
        targetRect.bottom + sy - (uw ? ih : bottom),
        0
      );
      this.targetBounds[3] = round(targetRect.left + sx - (uw ? 0 : left), 0);

      if (this.containerArray) {
        this.containerBounds[0] = this.containerArray[0] + cpt;
        this.containerBounds[1] = this.containerArray[1] - cpr;
        this.containerBounds[2] = this.containerArray[2] - cpb;
        this.containerBounds[3] = this.containerArray[3] + cpl;
      } else {
        this.containerBounds[0] = -round(
          targetRect.top - (fx ? clamp(top, 0, ih) : top) + hiddenTop - cpt,
          0
        );
        this.containerBounds[1] = -round(
          targetRect.right -
            (fx ? clamp(right, 0, iw) : right) -
            hiddenRight +
            cpr,
          0
        );
        this.containerBounds[2] = -round(
          targetRect.bottom -
            (fx ? clamp(bottom, 0, ih) : bottom) -
            hiddenBottom +
            cpb,
          0
        );
        this.containerBounds[3] = -round(
          targetRect.left - (fx ? clamp(left, 0, iw) : left) + hiddenLeft - cpl,
          0
        );
      }
    }

    this.transforms.revert();

    // Restore coordinates
    this.coords[2] = cx2;
    this.coords[3] = cy2;
    this.setX(cx, true);
    this.setY(cy, true);
  }

  /**
   * Checks if current position is out of container bounds
   *
   * Returns 0 if not out of bounds, 1 if x is out of bounds,
   * 2 if y is out of bounds, 3 if both x and y are out of bounds
   *
   * @param {number[]} bounds - Container bounds
   * @param {number} x - Current x position
   * @param {number} y - Current y position
   * @return {number} - Out of bounds status code (0-3)
   */
  isOutOfBounds(bounds: number[], x: number, y: number): number {
    if (!this.contained) return 0;

    const [bt, br, bb, bl] = bounds;
    const [dx, dy] = this.disabled;
    const obx = (!dx && x < bl) || (!dx && x > br);
    const oby = (!dy && y < bt) || (!dy && y > bb);

    return obx && !oby ? 1 : !obx && oby ? 2 : obx && oby ? 3 : 0;
  }

  /**
   * Refreshes all draggable configuration based on parameters
   */
  refresh(): void {
    const params = this.parameters;
    const paramX = params.x;
    const paramY = params.y;
    const container = parseDraggableFunctionParameter(
      params.container as any,
      this
    );
    const cp =
      parseDraggableFunctionParameter(params.containerPadding as any, this) ||
      0;
    const containerPadding = isArr(cp)
      ? (cp as [number, number, number, number])
      : ([cp, cp, cp, cp] as [number, number, number, number]);
    const cx = this.x;
    const cy = this.y;

    const parsedCursorStyles = parseDraggableFunctionParameter(
      params.cursor as any,
      this
    );
    const cursorStyles = { onHover: "grab", onGrab: "grabbing" };

    if (parsedCursorStyles) {
      const { onHover, onGrab } = parsedCursorStyles as DraggableCursorParams;
      if (onHover) cursorStyles.onHover = onHover;
      if (onGrab) cursorStyles.onGrab = onGrab;
    }

    this.containerArray = isArr(container) ? (container as number[]) : null;
    this.$container =
      container && !this.containerArray
        ? (parseTargets(container as DOMTarget)[0] as HTMLElement)
        : doc?.body || document.body;
    this.useWin = this.$container === (doc?.body || document.body);
    this.$scrollContainer = this.useWin ? win || window : this.$container;
    this.isFinePointer = matchMedia("(pointer:fine)").matches;
    this.containerPadding = setValue(containerPadding, [0, 0, 0, 0]);

    this.containerFriction = clamp(
      setValue(
        parseDraggableFunctionParameter(params.containerFriction as any, this),
        0.8
      ),
      0,
      1
    );

    this.releaseContainerFriction = clamp(
      setValue(
        parseDraggableFunctionParameter(
          params.releaseContainerFriction as any,
          this
        ),
        this.containerFriction
      ),
      0,
      1
    );

    this.snapX =
      parseDraggableFunctionParameter(
        isObj(paramX) && !isUnd((paramX as DraggableAxisParam).snap)
          ? ((paramX as DraggableAxisParam).snap as any)
          : (params.snap as any),
        this
      ) || 0;

    this.snapY =
      parseDraggableFunctionParameter(
        isObj(paramY) && !isUnd((paramY as DraggableAxisParam).snap)
          ? ((paramY as DraggableAxisParam).snap as any)
          : (params.snap as any),
        this
      ) || 0;

    this.scrollSpeed = setValue(
      parseDraggableFunctionParameter(params.scrollSpeed as any, this),
      1.5
    );

    this.scrollThreshold = setValue(
      parseDraggableFunctionParameter(params.scrollThreshold as any, this),
      20
    );

    this.dragSpeed = setValue(
      parseDraggableFunctionParameter(params.dragSpeed as any, this),
      1
    );

    this.minVelocity = setValue(
      parseDraggableFunctionParameter(params.minVelocity as any, this),
      0
    );

    this.maxVelocity = setValue(
      parseDraggableFunctionParameter(params.maxVelocity as any, this),
      50
    );

    this.velocityMultiplier = setValue(
      parseDraggableFunctionParameter(params.velocityMultiplier as any, this),
      1
    );

    this.cursor = parsedCursorStyles === false ? false : cursorStyles;

    this.updateBoundingValues();

    // Set position within bounds
    const [bt, br, bb, bl] = this.containerBounds;
    this.setX(clamp(cx, bl, br), true);
    this.setY(clamp(cy, bt, bb), true);
  }

  /**
   * Updates the draggable position and handles scrolling
   */
  update(): void {
    this.updateScrollCoords();

    if (this.canScroll) {
      const [cpt, cpr, cpb, cpl] = this.containerPadding;
      const [sw, sh] = this.scrollView;
      const daw = this.dragArea[2];
      const dah = this.dragArea[3];
      const csx = this.scroll.x;
      const csy = this.scroll.y;
      const nsw = this.$container.scrollWidth;
      const nsh = this.$container.scrollHeight;
      const csw = this.useWin ? clamp(nsw, this.window[0], nsw) : nsw;
      const csh = this.useWin ? clamp(nsh, this.window[1], nsh) : nsh;
      const swd = sw - csw;
      const shd = sh - csh;

      // Handle cases where the scrollarea dimensions changes during drag
      if (this.dragged && swd > 0) {
        this.coords[0] -= swd;
        this.scrollView[0] = csw;
      }

      if (this.dragged && shd > 0) {
        this.coords[1] -= shd;
        this.scrollView[1] = csh;
      }

      // Handle autoscroll when target is at the edges of the scroll bounds
      const s = this.scrollSpeed * 10;
      const threshold = this.scrollThreshold;
      const [x, y] = this.coords;
      const [st, sr, sb, sl] = this.scrollBounds;
      const t = round(clamp((y - st + cpt) / threshold, -1, 0) * s, 0);
      const r = round(clamp((x - sr - cpr) / threshold, 0, 1) * s, 0);
      const b = round(clamp((y - sb - cpb) / threshold, 0, 1) * s, 0);
      const l = round(clamp((x - sl + cpl) / threshold, -1, 0) * s, 0);

      if (t || b || l || r) {
        const [nx, ny] = this.disabled;
        let scrollX = csx;
        let scrollY = csy;

        if (!nx) {
          scrollX = round(clamp(csx + (l || r), 0, sw - daw), 0);
          this.coords[0] -= csx - scrollX;
        }

        if (!ny) {
          scrollY = round(clamp(csy + (t || b), 0, sh - dah), 0);
          this.coords[1] -= csy - scrollY;
        }

        // Using different scroll methods depending if using window or not
        if (this.useWin) {
          (this.$scrollContainer as Window).scrollBy(
            -(csx - scrollX),
            -(csy - scrollY)
          );
        } else {
          (this.$scrollContainer as HTMLElement).scrollTo(scrollX, scrollY);
        }
      }
    }

    const [ct, cr, cb, cl] = this.containerBounds;
    const [px1, py1, px2, py2, px3, py3] = this.pointer;

    this.coords[0] += (px1 - px3) * this.dragSpeed;
    this.coords[1] += (py1 - py3) * this.dragSpeed;
    this.pointer[4] = px1;
    this.pointer[5] = py1;

    const [cx, cy] = this.coords;
    const [sx, sy] = this.snapped;
    const cf = (1 - this.containerFriction) * this.dragSpeed;

    this.setX(
      cx > cr ? cr + (cx - cr) * cf : cx < cl ? cl + (cx - cl) * cf : cx,
      false
    );

    this.setY(
      cy > cb ? cb + (cy - cb) * cf : cy < ct ? ct + (cy - ct) * cf : cy,
      false
    );

    this.computeVelocity(px1 - px3, py1 - py3);
    this.angle = atan2(py1 - py2, px1 - px2);

    const [nsx, nsy] = this.snapped;
    if ((nsx !== sx && this.snapX) || (nsy !== sy && this.snapY)) {
      this.onSnap(this);
    }
  }

  /**
   * Stops all animations and removes active animations
   *
   * @return {this} - Chainable instance
   */
  stop(): this {
    this.updateTicker.pause();
    this.overshootXTicker.pause();
    this.overshootYTicker.pause();

    // Pauses the in bounds onRelease animations
    for (const prop in this.animate.animations) {
      this.animate.animations[prop].paused = true;
    }

    // Remove any running animations
    remove(this);
    remove(this.scroll); // Removes active animations on container scroll
    remove(this.overshootCoords); // Removes active overshoot animations

    return this;
  }

  /**
   * Scrolls the draggable into view with animation
   *
   * @param {number} [duration] - Animation duration in milliseconds
   * @param {number} [gap=0] - Gap around element in pixels
   * @param {EasingParam} [ease=eases.inOutQuad] - Easing function to use
   * @return {this} - Chainable instance
   */
  scrollInView(
    duration?: number,
    gap = 0,
    ease: EasingFunction = (t: number) => t
  ): this {
    this.updateScrollCoords();
    const x = this.destX;
    const y = this.destY;
    const scroll = this.scroll;
    const scrollBounds = this.scrollBounds;
    const canScroll = this.canScroll;

    if (!this.containerArray && this.isOutOfBounds(scrollBounds, x, y)) {
      const [st, sr, sb, sl] = scrollBounds;
      const t = round(clamp(y - st, -maxValue, 0), 0);
      const r = round(clamp(x - sr, 0, maxValue), 0);
      const b = round(clamp(y - sb, 0, maxValue), 0);
      const l = round(clamp(x - sl, -maxValue, 0), 0);

      new JSAnimation(scroll, {
        x: round(scroll.x + (l ? l - gap : r ? r + gap : 0), 0),
        y: round(scroll.y + (t ? t - gap : b ? b + gap : 0), 0),
        duration: isUnd(duration) ? 350 * globals.timeScale : duration,
        ease,
        onUpdate: () => {
          this.canScroll = false;
          this.$scrollContainer.scrollTo(scroll.x, scroll.y);
        },
      })
        .init()
        .then(() => {
          this.canScroll = canScroll;
        });
    }

    return this;
  }

  /**
   * Handles hovering over the draggable element
   */
  handleHover(): void {
    if (this.isFinePointer && this.cursor && !this.cursorStyles) {
      this.cursorStyles = setTargetValues(this.$trigger, {
        cursor: (this.cursor as DraggableCursorParams).onHover,
      });
    }
  }

  /**
   * Animates the draggable into view within its container
   *
   * @param {number} [duration] - Animation duration in milliseconds
   * @param {number} [gap=0] - Gap around element in pixels
   * @param {EasingParam} [ease=eases.inOutQuad] - Easing function to use
   * @return {this} - Chainable instance
   */
  animateInView(
    duration?: number,
    gap = 0,
    ease: EasingFunction = (t: number) => t
  ): this {
    this.stop();
    this.updateBoundingValues();

    const x = this.x;
    const y = this.y;
    const [cpt, cpr, cpb, cpl] = this.containerPadding;

    const bt = this.scroll.y - this.targetBounds[0] + cpt + gap;
    const br = this.scroll.x - this.targetBounds[1] - cpr - gap;
    const bb = this.scroll.y - this.targetBounds[2] - cpb - gap;
    const bl = this.scroll.x - this.targetBounds[3] + cpl + gap;

    const ob = this.isOutOfBounds([bt, br, bb, bl], x, y);

    if (ob) {
      const [disabledX, disabledY] = this.disabled;
      const destX = clamp(snap(x, this.snapX), bl, br);
      const destY = clamp(snap(y, this.snapY), bt, bb);
      const dur = isUnd(duration) ? 350 * globals.timeScale : duration;

      if (!disabledX && (ob === 1 || ob === 3)) {
        this.animate[this.xProp](destX, dur, ease);
      }

      if (!disabledY && (ob === 2 || ob === 3)) {
        this.animate[this.yProp](destY, dur, ease);
      }
    }

    return this;
  }

  /**
   * Handles mousedown or touchstart on the draggable element
   *
   * @param {MouseEvent|TouchEvent} e - The interaction event
   */
  handleDown(e: MouseEvent | TouchEvent): void {
    const $eTarget = e.target as HTMLElement;
    if (this.grabbed || ($eTarget as HTMLInputElement).type === "range") {
      return;
    }

    e.stopPropagation();

    this.grabbed = true;
    this.released = false;
    this.stop();
    this.updateBoundingValues();

    const touches = (e as TouchEvent).changedTouches;
    const eventX = touches ? touches[0].clientX : (e as MouseEvent).clientX;
    const eventY = touches ? touches[0].clientY : (e as MouseEvent).clientY;

    const { x, y } = this.transforms.normalizePoint(eventX, eventY);
    const [ct, cr, cb, cl] = this.containerBounds;
    const cf = (1 - this.containerFriction) * this.dragSpeed;
    const cx = this.x;
    const cy = this.y;

    this.coords[0] = this.coords[2] = !cf
      ? cx
      : cx > cr
      ? cr + (cx - cr) / cf
      : cx < cl
      ? cl + (cx - cl) / cf
      : cx;

    this.coords[1] = this.coords[3] = !cf
      ? cy
      : cy > cb
      ? cb + (cy - cb) / cf
      : cy < ct
      ? ct + (cy - ct) / cf
      : cy;

    this.pointer[0] = x;
    this.pointer[1] = y;
    this.pointer[2] = x;
    this.pointer[3] = y;
    this.pointer[4] = x;
    this.pointer[5] = y;
    this.pointer[6] = x;
    this.pointer[7] = y;

    this.deltaX = 0;
    this.deltaY = 0;
    this.velocity = 0;
    this.velocityStack[0] = 0;
    this.velocityStack[1] = 0;
    this.velocityStack[2] = 0;
    this.velocityStackIndex = 0;
    this.angle = 0;

    if (this.targetStyles) {
      this.targetStyles.revert();
      this.targetStyles = null;
    }

    const z = getTargetValue(this.$target, "zIndex") as number;
    zIndex = (z > zIndex ? z : zIndex) + 1;
    this.targetStyles = setTargetValues(this.$target, { zIndex });

    if (this.triggerStyles) {
      this.triggerStyles.revert();
      this.triggerStyles = null;
    }

    if (this.cursorStyles) {
      this.cursorStyles.revert();
      this.cursorStyles = null;
    }

    if (this.isFinePointer && this.cursor) {
      this.bodyStyles = setTargetValues(document.body, {
        cursor: (this.cursor as DraggableCursorParams).onGrab,
      });
    }

    this.scrollInView(100, 0, (t: number) => t);
    this.onGrab(this);

    document.addEventListener(
      "touchmove",
      this as unknown as EventListenerObject
    );
    document.addEventListener(
      "touchend",
      this as unknown as EventListenerObject
    );
    document.addEventListener(
      "touchcancel",
      this as unknown as EventListenerObject
    );
    document.addEventListener(
      "mousemove",
      this as unknown as EventListenerObject
    );
    document.addEventListener(
      "mouseup",
      this as unknown as EventListenerObject
    );
    document.addEventListener(
      "selectstart",
      this as unknown as EventListenerObject
    );
  }

  /**
   * Handles mousemove or touchmove on the draggable element
   *
   * @param {MouseEvent|TouchEvent} e - The interaction event
   */
  handleMove(e: MouseEvent | TouchEvent): void {
    if (!this.grabbed) return;

    const touches = (e as TouchEvent).changedTouches;
    const eventX = touches ? touches[0].clientX : (e as MouseEvent).clientX;
    const eventY = touches ? touches[0].clientY : (e as MouseEvent).clientY;

    const { x, y } = this.transforms.normalizePoint(eventX, eventY);
    const movedX = x - this.pointer[6];
    const movedY = y - this.pointer[7];

    let $parent = e.target as HTMLElement;
    let isAtTop = false;
    let isAtBottom = false;
    let canTouchScroll = false;

    // Check if touch event is on a scrollable element
    while (touches && $parent && $parent !== this.$trigger) {
      const overflowY = getTargetValue($parent, "overflow-y");
      if (overflowY !== "hidden" && overflowY !== "visible") {
        const { scrollTop, scrollHeight, clientHeight } = $parent;
        if (scrollHeight > clientHeight) {
          canTouchScroll = true;
          isAtTop = scrollTop <= 3;
          isAtBottom = scrollTop >= scrollHeight - clientHeight - 3;
          break;
        }
      }
      $parent = $parent.parentNode as HTMLElement;
    }

    // Handle touch scrolling for nested scrollable elements
    if (
      canTouchScroll &&
      ((!isAtTop && !isAtBottom) ||
        (isAtTop && movedY < 0) ||
        (isAtBottom && movedY > 0))
    ) {
      this.pointer[0] = x;
      this.pointer[1] = y;
      this.pointer[2] = x;
      this.pointer[3] = y;
      this.pointer[4] = x;
      this.pointer[5] = y;
      this.pointer[6] = x;
      this.pointer[7] = y;
    } else {
      preventDefault(e);

      // Needed to prevent click on handleUp
      if (!this.triggerStyles) {
        this.triggerStyles = setTargetValues(this.$trigger, {
          pointerEvents: "none",
        });
      }

      // Needed to prevent page scroll while dragging on touch device
      this.$trigger.addEventListener("touchstart", preventDefault, {
        passive: false,
      });
      this.$trigger.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      this.$trigger.addEventListener("touchend", preventDefault);

      // Start dragging if moved enough in any enabled direction
      if (
        (!this.disabled[0] && abs(movedX) > 3) ||
        (!this.disabled[1] && abs(movedY) > 3)
      ) {
        this.updateTicker.resume();
        this.pointer[2] = this.pointer[0];
        this.pointer[3] = this.pointer[1];
        this.pointer[0] = x;
        this.pointer[1] = y;
        this.dragged = true;
        this.released = false;
        this.onDrag(this);
      }
    }
  }

  /**
   * Handles mouseup or touchend on the draggable element
   */
  handleUp(): void {
    if (!this.grabbed) return;

    this.updateTicker.pause();

    if (this.triggerStyles) {
      this.triggerStyles.revert();
      this.triggerStyles = null;
    }

    if (this.bodyStyles) {
      this.bodyStyles.revert();
      this.bodyStyles = null;
    }

    const [disabledX, disabledY] = this.disabled;
    const [px1, py1, px2, py2, px3, py3] = this.pointer;
    const [ct, cr, cb, cl] = this.containerBounds;
    const [sx, sy] = this.snapped;
    const springX = this.releaseXSpring;
    const springY = this.releaseYSpring;
    const releaseEase = this.releaseEase;
    const hasReleaseSpring = this.hasReleaseSpring;
    const overshootCoords = this.overshootCoords;
    const cx = this.x;
    const cy = this.y;
    const pv = this.computeVelocity(px1 - px3, py1 - py3);
    const pa = (this.angle = atan2(py1 - py2, px1 - px2));
    const ds = pv * 150;
    const cf = (1 - this.releaseContainerFriction) * this.dragSpeed;
    const nx = cx + cos(pa) * ds;
    const ny = cy + sin(pa) * ds;
    const bx =
      nx > cr ? cr + (nx - cr) * cf : nx < cl ? cl + (nx - cl) * cf : nx;
    const by =
      ny > cb ? cb + (ny - cb) * cf : ny < ct ? ct + (ny - ct) * cf : ny;
    const dx = (this.destX = clamp(round(snap(bx, this.snapX), 5), cl, cr));
    const dy = (this.destY = clamp(round(snap(by, this.snapY), 5), ct, cb));
    const ob = this.isOutOfBounds(this.containerBounds, nx, ny);

    let durationX = 0;
    let durationY = 0;
    let easeX: EasingFunction = releaseEase;
    let easeY: EasingFunction = releaseEase;
    let longestReleaseDuration = 0;

    overshootCoords.x = cx;
    overshootCoords.y = cy;

    if (!disabledX) {
      const directionX = dx === cr ? (cx > cr ? -1 : 1) : cx < cl ? -1 : 1;
      const distanceX = round(cx - dx, 0);
      // Set velocity if spring has velocity property
      if ("velocity" in springX) {
        (springX as any).velocity =
          disabledY && hasReleaseSpring
            ? distanceX
              ? (ds * directionX) / abs(distanceX)
              : 0
            : pv;
      }
      const { ease, duration, restDuration } = springX;
      durationX =
        cx === dx
          ? 0
          : hasReleaseSpring
          ? duration
          : duration - restDuration * globals.timeScale;
      if (hasReleaseSpring) easeX = ease as EasingFunction;
      if (durationX > longestReleaseDuration)
        longestReleaseDuration = durationX;
    }

    if (!disabledY) {
      const directionY = dy === cb ? (cy > cb ? -1 : 1) : cy < ct ? -1 : 1;
      const distanceY = round(cy - dy, 0);
      // Set velocity if spring has velocity property
      if ("velocity" in springY) {
        (springY as any).velocity =
          disabledX && hasReleaseSpring
            ? distanceY
              ? (ds * directionY) / abs(distanceY)
              : 0
            : pv;
      }
      const { ease, duration, restDuration } = springY;
      durationY =
        cy === dy
          ? 0
          : hasReleaseSpring
          ? duration
          : duration - restDuration * globals.timeScale;
      if (hasReleaseSpring) easeY = ease as EasingFunction;
      if (durationY > longestReleaseDuration)
        longestReleaseDuration = durationY;
    }

    if (!hasReleaseSpring && ob && cf && (durationX || durationY)) {
      const composition = compositionTypes.blend;

      new JSAnimation(overshootCoords, {
        x: { to: bx, duration: durationX * 0.65 },
        y: { to: by, duration: durationY * 0.65 },
        ease: releaseEase,
        composition,
      }).init();

      new JSAnimation(overshootCoords, {
        x: { to: dx, duration: durationX },
        y: { to: dy, duration: durationY },
        ease: releaseEase,
        composition,
      }).init();

      this.overshootXTicker.stretch(durationX).restart();
      this.overshootYTicker.stretch(durationY).restart();
    } else {
      if (!disabledX) this.animate[this.xProp](dx, durationX, easeX);
      if (!disabledY) this.animate[this.yProp](dy, durationY, easeY);
    }

    this.scrollInView(
      longestReleaseDuration,
      this.scrollThreshold,
      releaseEase
    );

    let hasSnapped = false;

    if (dx !== sx) {
      this.snapped[0] = dx;
      if (this.snapX) hasSnapped = true;
    }

    if (dy !== sy && this.snapY) {
      this.snapped[1] = dy;
      if (this.snapY) hasSnapped = true;
    }

    if (hasSnapped) this.onSnap(this);

    this.grabbed = false;
    this.dragged = false;
    this.updated = true;
    this.released = true;

    // Trigger the callback after the release animations
    this.onRelease(this);

    this.$trigger.removeEventListener("touchstart", preventDefault);
    this.$trigger.removeEventListener("touchmove", preventDefault);
    this.$trigger.removeEventListener("touchend", preventDefault);

    document.removeEventListener(
      "touchmove",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "touchend",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "touchcancel",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "mousemove",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "mouseup",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "selectstart",
      this as unknown as EventListenerObject
    );
  }

  /**
   * Resets the draggable to its initial state
   *
   * @return {this} - Chainable instance
   */
  reset(): this {
    this.stop();
    this.resizeTicker.pause();
    this.grabbed = false;
    this.dragged = false;
    this.updated = false;
    this.released = false;
    this.canScroll = false;
    this.setX(0, true);
    this.setY(0, true);
    this.coords[0] = 0;
    this.coords[1] = 0;
    this.pointer[0] = 0;
    this.pointer[1] = 0;
    this.pointer[2] = 0;
    this.pointer[3] = 0;
    this.pointer[4] = 0;
    this.pointer[5] = 0;
    this.pointer[6] = 0;
    this.pointer[7] = 0;
    this.velocity = 0;
    this.velocityStack[0] = 0;
    this.velocityStack[1] = 0;
    this.velocityStack[2] = 0;
    this.velocityStackIndex = 0;
    this.angle = 0;
    return this;
  }

  /**
   * Enables the draggable
   *
   * @return {this} - Chainable instance
   */
  enable(): this {
    if (!this.enabled) {
      this.enabled = true;
      (this.$target as HTMLElement).classList.remove("is-disabled");
      this.touchActionStyles = setTargetValues(this.$trigger, {
        touchAction: this.disabled[0]
          ? "pan-x"
          : this.disabled[1]
          ? "pan-y"
          : "none",
      });
      this.$trigger.addEventListener(
        "touchstart",
        this as unknown as EventListenerObject,
        { passive: true }
      );
      this.$trigger.addEventListener(
        "mousedown",
        this as unknown as EventListenerObject,
        { passive: true }
      );
      this.$trigger.addEventListener(
        "mouseenter",
        this as unknown as EventListenerObject
      );
    }
    return this;
  }

  /**
   * Disables the draggable
   *
   * @return {this} - Chainable instance
   */
  disable(): this {
    this.enabled = false;
    this.grabbed = false;
    this.dragged = false;
    this.updated = false;
    this.released = false;
    this.canScroll = false;

    if (this.touchActionStyles) {
      this.touchActionStyles.revert();
    }

    if (this.cursorStyles) {
      this.cursorStyles.revert();
      this.cursorStyles = null;
    }

    if (this.triggerStyles) {
      this.triggerStyles.revert();
      this.triggerStyles = null;
    }

    if (this.bodyStyles) {
      this.bodyStyles.revert();
      this.bodyStyles = null;
    }

    if (this.targetStyles) {
      this.targetStyles.revert();
      this.targetStyles = null;
    }

    this.stop();
    (this.$target as HTMLElement).classList.add("is-disabled");
    this.$trigger.removeEventListener(
      "touchstart",
      this as unknown as EventListenerObject
    );
    this.$trigger.removeEventListener(
      "mousedown",
      this as unknown as EventListenerObject
    );
    this.$trigger.removeEventListener(
      "mouseenter",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "touchmove",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "touchend",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "touchcancel",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "mousemove",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "mouseup",
      this as unknown as EventListenerObject
    );
    document.removeEventListener(
      "selectstart",
      this as unknown as EventListenerObject
    );
    return this;
  }

  /**
   * Reverts all changes made by this draggable instance
   *
   * @return {this} - Chainable instance
   */
  revert(): this {
    this.reset();
    this.disable();
    (this.$target as HTMLElement).classList.remove("is-disabled");
    this.updateTicker.revert();
    this.overshootXTicker.revert();
    this.overshootYTicker.revert();
    this.resizeTicker.revert();
    this.animate.revert();
    return this;
  }

  /**
   * General event handler that routes events to specific handlers
   *
   * @param {Event} e - The event to handle
   */
  handleEvent(e: Event): void {
    switch (e.type) {
      case "mousedown":
        this.handleDown(e as MouseEvent);
        break;
      case "touchstart":
        this.handleDown(e as TouchEvent);
        break;
      case "mousemove":
        this.handleMove(e as MouseEvent);
        break;
      case "touchmove":
        this.handleMove(e as TouchEvent);
        break;
      case "mouseup":
        this.handleUp();
        break;
      case "touchend":
        this.handleUp();
        break;
      case "touchcancel":
        this.handleUp();
        break;
      case "mouseenter":
        this.handleHover();
        break;
      case "selectstart":
        preventDefault(e);
        break;
    }
  }
}

/**
 * # createMotionDraggable
 * @summary Creates a new Draggable instance
 *
 * Factory function to create a draggable element with the given
 * parameters. Equivalent to calling `new InMotionDraggable()` directly.
 *
 * @param {DOMTargetSelector} target - Element or selector to make draggable
 * @param {DraggableParams} [parameters] - Configuration parameters
 * @return {InMotionDraggable} - New draggable instance
 */
export const createMotionDraggable = (
  target: DOMTargetSelector,
  parameters?: DraggableParams
): InMotionDraggable => new InMotionDraggable(target, parameters);
