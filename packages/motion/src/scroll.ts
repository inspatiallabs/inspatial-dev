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
  win,
  doc,
  noop,
  isDomSymbol,
  relativeValuesExecRgx,
} from "./consts.ts";

import { globals } from "./globals.ts";

import { none, parseEasings } from "./eases.ts";

// Define helper functions directly instead of importing from helpers.ts
const addChild = (parent: any, child: any): void => {
  if (!parent._head) {
    parent._head = parent._tail = child;
  } else {
    parent._tail._next = child;
    child._prev = parent._tail;
    parent._tail = child;
  }
};

const removeChild = (parent: any, child: any): void => {
  const prev = child._prev;
  const next = child._next;

  if (prev) prev._next = next;
  if (next) next._prev = prev;

  if (parent._head === child) parent._head = next;
  if (parent._tail === child) parent._tail = prev;

  child._next = child._prev = null;
};

const forEachChildren = (
  parent: any,
  callback: (child: any) => void,
  backwards = false
): void => {
  let child = backwards ? parent._tail : parent._head;
  while (child) {
    const next = backwards ? child._prev : child._next;
    callback(child);
    child = next;
  }
};

const interpolate = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const round = (value: number, precision: number = 0): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

const isFnc = (value: unknown): value is (...args: any[]) => any =>
  typeof value === "function";

const isNum = (value: unknown): value is number =>
  typeof value === "number" && !isNaN(value) && isFinite(value);

const isObj = (value: unknown): value is object =>
  typeof value === "object" && value !== null;

const isStr = (value: unknown): value is string => typeof value === "string";

const isUnd = (value: unknown): value is undefined =>
  typeof value === "undefined";

const lerp = (a: number, b: number, t: number, snap = false): number => {
  const v = a + (b - a) * t;
  return snap && Math.abs(b - v) < 0.001 ? b : v;
};

import { parseTargets } from "./targets.ts";

import { Timer } from "./timer.ts";

import { convertValueUnit } from "./units.ts";

// Create stub functions until the animation and values modules are fixed
const getTargetValue = (target: any, prop: string): any => {
  if (typeof getComputedStyle === "function") {
    return getComputedStyle(target)[prop as any];
  }
  return target[prop];
};

const setTargetValues = (target: any, values: Record<string, any>): any => {
  const revert = () => {
    // In a real implementation, this would revert changes
  };

  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      target.style[key] = values[key];
    }
  }

  return { revert };
};

const sync = (callback: () => void): void => {
  setTimeout(callback, 0);
};

// Import from values.ts with extension
import {
  decomposeRawValue,
  decomposedOriginalValue,
  getRelativeValue,
  setValue,
} from "./values.ts";

// Define basic interfaces
export interface ScrollThresholdValue {
  toString(): string;
}

export interface ScrollThresholdParam {
  container?: ScrollThresholdValue;
  target?: ScrollThresholdValue;
}

export type ScrollObserverAxisCallback = (self: ScrollObserver) => "x" | "y";

export type ScrollThresholdCallback = (
  self: ScrollObserver
) => ScrollThresholdValue | ScrollThresholdParam;

export interface DOMTarget extends HTMLElement {
  style: CSSStyleDeclaration;
  setAttribute(name: string, value: string): void;
}

export interface ScrollContainerInterface {
  element: HTMLElement;
  useWin: boolean;
  winWidth: number;
  winHeight: number;
  width: number;
  height: number;
  left: number;
  top: number;
  zIndex: number;
  scrollX: number;
  scrollY: number;
  prevScrollX: number;
  prevScrollY: number;
  scrollWidth: number;
  scrollHeight: number;
  velocity: number;
  backwardX: boolean;
  backwardY: boolean;
  wakeTicker?: Timer; // Add wakeTicker as optional property
  revert?: () => void; // Add revert as optional method
  _head: ScrollObserver | null;
  _tail: ScrollObserver | null;
}

// Partial implementation to make types work
export interface ScrollObserverInterface {
  index: number;
  id: string | number;
  container: ScrollContainerInterface;
  target: HTMLElement | null;
  revert(): void;
}

export type TargetsParam =
  | string
  | HTMLElement
  | NodeList
  | HTMLCollection
  | Array<HTMLElement>
  | null
  | undefined;

export type EasingFunction = (x: number) => number;
export type EasingParam = string | EasingFunction;
export type Callback<T> = (self: T) => void;

/**
 * @return {Number}
 */
const getMaxViewHeight = (): number => {
  if (!doc || !doc.body) return globalThis.innerHeight;

  const $el = document.createElement("div");
  doc.body.appendChild($el);
  $el.style.height = "100lvh";
  const height = $el.offsetHeight;
  doc.body.removeChild($el);
  return height;
};

/**
 * @template {ScrollThresholdValue|string|number|boolean|Function|Object} T
 * @param {T | ((observer: ScrollObserver) => T)} value
 * @param {ScrollObserver} scroller
 * @return {T}
 */
const parseScrollObserverFunctionParameter = <T>(
  value: T | ((observer: ScrollObserver) => T),
  scroller: ScrollObserver
): T => {
  return value && isFnc(value)
    ? ((value as (...args: any[]) => any)(scroller) as T)
    : value;
};

/** Map of scroll containers to their DOM elements */
export const scrollContainers: Map<HTMLElement, ScrollContainer> = new Map<HTMLElement, ScrollContainer>();

/**
 * # ScrollContainer
 * #### Manages scroll position tracking and observer notification
 *
 * This class handles tracking scroll position for a container element
 * and notifies registered scroll observers about changes.
 *
 * @since 0.1.0
 * @implements {ScrollContainerInterface}
 */
class ScrollContainer implements ScrollContainerInterface {
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

  /**
   * Creates a new ScrollContainer
   * @param {HTMLElement} $el The container element
   */
  constructor($el: HTMLElement) {
    this.element = $el;
    this.useWin = this.element === (doc?.body || document.body);
    this.winWidth = 0;
    this.winHeight = 0;
    this.width = 0;
    this.height = 0;
    this.left = 0;
    this.top = 0;
    this.zIndex = 0;
    this.scrollX = 0;
    this.scrollY = 0;
    this.prevScrollX = 0;
    this.prevScrollY = 0;
    this.scrollWidth = 0;
    this.scrollHeight = 0;
    this.velocity = 0;
    this.backwardX = false;
    this.backwardY = false;
    this.scrollTicker = new Timer({
      autoplay: false,
      onBegin: () => this.dataTimer.resume(),
      onUpdate: () => {
        const backwards = this.backwardX || this.backwardY;
        forEachChildren(
          this,
          (child: ScrollObserver) => child.handleScroll(),
          backwards
        );
      },
      onComplete: () => this.dataTimer.pause(),
    }).init();

    this.dataTimer = new Timer({
      autoplay: false,
      frameRate: 30,
      onUpdate: (self) => {
        const dt = self.deltaTime;
        const px = this.prevScrollX;
        const py = this.prevScrollY;
        const nx = this.scrollX;
        const ny = this.scrollY;
        const dx = px - nx;
        const dy = py - ny;
        this.prevScrollX = nx;
        this.prevScrollY = ny;
        if (dx) this.backwardX = px > nx;
        if (dy) this.backwardY = py > ny;
        this.velocity = round(
          dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0,
          5
        );
      },
    }).init();

    this.resizeTicker = new Timer({
      autoplay: false,
      duration: 250 * globals.timeScale,
      onComplete: () => {
        this.updateWindowBounds();
        this.refreshScrollObservers();
        this.handleScroll();
      },
    }).init();

    this.wakeTicker = new Timer({
      autoplay: false,
      duration: 500 * globals.timeScale,
      onBegin: () => {
        this.scrollTicker.resume();
      },
      onComplete: () => {
        this.scrollTicker.pause();
      },
    }).init();

    this._head = null;
    this._tail = null;

    this.updateScrollCoords();
    this.updateWindowBounds();
    this.updateBounds();
    this.refreshScrollObservers();
    this.handleScroll();

    this.resizeObserver = new ResizeObserver(() => this.resizeTicker.restart());
    this.resizeObserver.observe(this.element);

    (this.useWin ? win || globalThis : this.element).addEventListener(
      "scroll",
      this,
      false
    );
  }

  /**
   * Updates the scroll coordinates based on container's scroll position
   */
  updateScrollCoords(): void {
    const useWin = this.useWin;
    const $el = this.element;
    this.scrollX = round(
      useWin ? win?.scrollX || globalThis.scrollX : $el.scrollLeft,
      0
    );
    this.scrollY = round(
      useWin ? win?.scrollY || globalThis.scrollY : $el.scrollTop,
      0
    );
  }

  /**
   * Updates window dimensions (width and height)
   */
  updateWindowBounds(): void {
    this.winWidth = win?.innerWidth || globalThis.innerWidth;
    this.winHeight = getMaxViewHeight();
  }

  /**
   * Updates container bounds (width, height, scroll dimensions)
   */
  updateBounds(): void {
    const style = getComputedStyle(this.element);
    const $el = this.element;
    this.scrollWidth =
      $el.scrollWidth +
      parseFloat(style.marginLeft) +
      parseFloat(style.marginRight);
    this.scrollHeight =
      $el.scrollHeight +
      parseFloat(style.marginTop) +
      parseFloat(style.marginBottom);
    this.updateWindowBounds();
    let width, height;
    if (this.useWin) {
      width = this.winWidth;
      height = this.winHeight;
    } else {
      const elRect = $el.getBoundingClientRect();
      width = elRect.width;
      height = elRect.height;
      this.top = elRect.top;
      this.left = elRect.left;
    }
    this.width = width;
    this.height = height;
  }

  /**
   * Refreshes all scroll observers in this container
   */
  refreshScrollObservers(): void {
    forEachChildren(this, (child: ScrollObserver) => {
      if (child._debug) {
        child.removeDebug();
      }
    });
    this.updateBounds();
    forEachChildren(this, (child: ScrollObserver) => {
      child.refresh();
      if (child._debug) {
        child.debug();
      }
    });
  }

  /**
   * Refreshes the container and all observers
   */
  refresh(): void {
    this.updateWindowBounds();
    this.updateBounds();
    this.refreshScrollObservers();
    this.handleScroll();
  }

  /**
   * Handles scroll events on the container
   */
  handleScroll(): void {
    this.updateScrollCoords();
    this.wakeTicker.restart();
  }

  /**
   * Handles DOM events (scroll)
   * @param {Event} e The DOM event
   */
  handleEvent(e: Event): void {
    switch (e.type) {
      case "scroll":
        this.handleScroll();
        break;
    }
  }

  /**
   * Reverts all changes and cleans up
   */
  revert(): void {
    this.scrollTicker.cancel();
    this.dataTimer.cancel();
    this.resizeTicker.cancel();
    this.wakeTicker.cancel();
    this.resizeObserver.unobserve(this.element);
    (this.useWin ? win || globalThis : this.element).removeEventListener(
      "scroll",
      this
    );
    scrollContainers.delete(this.element);
  }
}

/**
 * # registerAndGetScrollContainer
 * #### Registers and retrieves a scroll container for a target element
 *
 * This function gets or creates a ScrollContainer for the specified target.
 *
 * @param {TargetsParam} target The target element or selector
 * @returns {ScrollContainer} The scroll container
 */
const registerAndGetScrollContainer = (
  target: TargetsParam
): ScrollContainer => {
  const $el = target
    ? parseTargets(target)[0] || doc?.body || document.body
    : doc?.body || document.body;

  let scrollContainer = scrollContainers.get($el);
  if (!scrollContainer) {
    scrollContainer = new ScrollContainer($el);
    scrollContainers.set($el, scrollContainer);
  }
  return scrollContainer;
};

/**
 * Convert a value to pixels based on a element, size, and offset limits
 *
 * @param {HTMLElement} $el Element to convert for
 * @param {number|string} v Value to convert
 * @param {number} size Size context for percentage conversions
 * @param {number} [under] Underflow limit
 * @param {number} [over] Overflow limit
 * @return {number} Value in pixels
 */
const convertValueToPx = (
  $el: HTMLElement,
  v: number | string,
  size: number,
  under?: number,
  over?: number
): number => {
  const clampMin = v === "min";
  const clampMax = v === "max";
  const value =
    v === "top" || v === "left" || v === "start" || clampMin
      ? 0
      : v === "bottom" || v === "right" || v === "end" || clampMax
      ? "100%"
      : v === "center"
      ? "50%"
      : v;
  const { n, u } = decomposeRawValue(value, decomposedOriginalValue);
  let px = n;
  if (u === "%") {
    px = (n / 100) * size;
  } else if (u) {
    px = convertValueUnit($el, decomposedOriginalValue, "px", true).n;
  }
  if (clampMax && under !== undefined && under < 0) px += under;
  if (clampMin && over !== undefined && over > 0) px += over;
  return px;
};

/**
 * Parse a threshold value into pixels
 *
 * @param {HTMLElement} $el Element to convert for
 * @param {ScrollThresholdValue} v Threshold value to convert
 * @param {number} size Size context for percentage conversions
 * @param {number} [under] Underflow limit
 * @param {number} [over] Overflow limit
 * @return {number} Value in pixels
 */
const parseBoundValue = (
  $el: HTMLElement,
  v: ScrollThresholdValue,
  size: number,
  under?: number,
  over?: number
): number => {
  let value: number;
  if (isStr(v)) {
    const matchedOperator = relativeValuesExecRgx.exec(v as string);
    if (matchedOperator) {
      const splitter = matchedOperator[0];
      const operator = splitter[0];
      const splitted = (v as string).split(splitter);
      const clampMin = splitted[0] === "min";
      const clampMax = splitted[0] === "max";
      const valueAPx = convertValueToPx($el, splitted[0], size, under, over);
      const valueBPx = convertValueToPx($el, splitted[1], size, under, over);
      if (clampMin) {
        const min = getRelativeValue(
          convertValueToPx($el, "min", size),
          valueBPx,
          operator
        );
        value = min < valueAPx ? valueAPx : min;
      } else if (clampMax) {
        const max = getRelativeValue(
          convertValueToPx($el, "max", size),
          valueBPx,
          operator
        );
        value = max > valueAPx ? valueAPx : max;
      } else {
        value = getRelativeValue(valueAPx, valueBPx, operator);
      }
    } else {
      value = convertValueToPx($el, v as string, size, under, over);
    }
  } else {
    value = v as number;
  }
  return round(value, 0);
};

/**
 * Get the DOM target from an animation
 *
 * @param {any} linked The linked animation
 * @return {HTMLElement|null} The found DOM element or null
 */
const getAnimationDomTarget = (linked: any): HTMLElement | null => {
  let $linkedTarget: HTMLElement | null = null;
  const linkedTargets = linked.targets;
  for (let i = 0, l = linkedTargets.length; i < l; i++) {
    const target = linkedTargets[i];
    if (target[isDomSymbol]) {
      $linkedTarget = target as HTMLElement;
      break;
    }
  }
  return $linkedTarget;
};

let scrollerIndex = 0;

const _debugColors = [
  "#FF4B4B",
  "#FF971B",
  "#FFC730",
  "#F9F640",
  "#7AFF5A",
  "#18FF74",
  "#17E09B",
  "#3CFFEC",
  "#05DBE9",
  "#33B3F1",
  "#638CF9",
  "#C563FE",
  "#FF4FCF",
  "#F93F8A",
];

/**
 * Scroll observer parameters interface
 */
export interface ScrollObserverParams {
  id?: number | string;
  sync?: boolean | number | string | EasingParam;
  container?: TargetsParam;
  target?: TargetsParam;
  axis?:
    | "x"
    | "y"
    | ScrollObserverAxisCallback
    | ((observer: ScrollObserver) => "x" | "y" | ScrollObserverAxisCallback);
  enter?:
    | ScrollThresholdValue
    | ScrollThresholdParam
    | ScrollThresholdCallback
    | ((
        observer: ScrollObserver
      ) =>
        | ScrollThresholdValue
        | ScrollThresholdParam
        | ScrollThresholdCallback);
  leave?:
    | ScrollThresholdValue
    | ScrollThresholdParam
    | ScrollThresholdCallback
    | ((
        observer: ScrollObserver
      ) =>
        | ScrollThresholdValue
        | ScrollThresholdParam
        | ScrollThresholdCallback);
  repeat?: boolean | ((observer: ScrollObserver) => boolean);
  debug?: boolean;
  onEnter?: Callback<ScrollObserver>;
  onLeave?: Callback<ScrollObserver>;
  onEnterForward?: Callback<ScrollObserver>;
  onLeaveForward?: Callback<ScrollObserver>;
  onEnterBackward?: Callback<ScrollObserver>;
  onLeaveBackward?: Callback<ScrollObserver>;
  onUpdate?: Callback<ScrollObserver>;
  onSyncComplete?: Callback<ScrollObserver>;
}

/**
 * # ScrollObserver
 * #### Observes scroll position and triggers animations
 *
 * ScrollObserver tracks elements as they enter and leave the viewport,
 * triggering animations or callbacks at specified thresholds.
 *
 * @since 0.1.0
 * @implements {ScrollObserverInterface}
 */
export class ScrollObserver implements ScrollObserverInterface {
  /** Unique index for the observer */
  index: number;
  /** Unique identifier */
  id: string | number;
  /** Container for this observer */
  container: ScrollContainerInterface;
  /** Target element to observe */
  target: HTMLElement | null;
  /** Linked animation or timer */
  linked: any;
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
  debugStyles: any | null;
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

  /**
   * Creates a new ScrollObserver
   * @param {ScrollObserverParams} parameters The configuration parameters
   */
  constructor(parameters: ScrollObserverParams = {}) {
    if (globals.scope) {
      // Cast to allow adding this to revertibles
      (globals.scope as any).revertibles.push(this);
    }

    const syncMode = setValue(parameters.sync, "play pause");
    const ease = syncMode ? parseEasings(syncMode as any) : null;
    const isLinear = syncMode && (syncMode === "linear" || syncMode === none);
    const isEase = syncMode && !(ease === none && !isLinear);
    const isSmooth =
      syncMode && (isNum(syncMode) || syncMode === true || isLinear);
    const isMethods = syncMode && isStr(syncMode) && !isEase && !isSmooth;

    const syncMethods = isMethods
      ? (syncMode as string).split(" ").map((m: string) => () => {
          const linked = this.linked;
          return linked && (linked as any)[m] ? (linked as any)[m]() : null;
        })
      : null;

    const biDirSync = isMethods && syncMethods && syncMethods.length > 2;

    this.index = scrollerIndex++;
    this.id = !isUnd(parameters.id) ? parameters.id! : this.index;
    this.container = registerAndGetScrollContainer(
      parameters.container
    ) as ScrollContainerInterface;
    this.target = null;
    this.linked = null;
    this.repeat = null;
    this.horizontal = null;
    this.enter = null;
    this.leave = null;
    this.sync = isEase || isSmooth || !!syncMethods;
    this.syncEase = isEase ? ease : null;
    this.syncSmooth = isSmooth
      ? syncMode === true || isLinear
        ? 1
        : (syncMode as number)
      : null;

    this.onSyncEnter =
      syncMethods && !biDirSync && syncMethods[0] ? syncMethods[0] : noop;
    this.onSyncLeave =
      syncMethods && !biDirSync && syncMethods[1] ? syncMethods[1] : noop;
    this.onSyncEnterForward =
      syncMethods && biDirSync && syncMethods[0] ? syncMethods[0] : noop;
    this.onSyncLeaveForward =
      syncMethods && biDirSync && syncMethods[1] ? syncMethods[1] : noop;
    this.onSyncEnterBackward =
      syncMethods && biDirSync && syncMethods[2] ? syncMethods[2] : noop;
    this.onSyncLeaveBackward =
      syncMethods && biDirSync && syncMethods[3] ? syncMethods[3] : noop;

    this.onEnter = parameters.onEnter || noop;
    this.onLeave = parameters.onLeave || noop;
    this.onEnterForward = parameters.onEnterForward || noop;
    this.onLeaveForward = parameters.onLeaveForward || noop;
    this.onEnterBackward = parameters.onEnterBackward || noop;
    this.onLeaveBackward = parameters.onLeaveBackward || noop;
    this.onUpdate = parameters.onUpdate || noop;
    this.onSyncComplete = parameters.onSyncComplete || noop;

    this.reverted = false;
    this.completed = false;
    this.began = false;
    this.isInView = false;
    this.forceEnter = false;
    this.hasEntered = false;
    this.offsets = [];
    this.offset = 0;
    this.offsetStart = 0;
    this.offsetEnd = 0;
    this.distance = 0;
    this.prevProgress = 0;
    this.thresholds = ["start", "end", "end", "start"];
    this.coords = [0, 0, 0, 0];
    this.debugStyles = null;
    this.$debug = null;
    this._params = parameters;
    this._debug = setValue(parameters.debug, false);
    this._next = null;
    this._prev = null;

    addChild(this.container, this);

    // Wait for the next frame to add to the container in order to handle calls to link()
    sync(() => {
      if (this.reverted) return;
      if (!this.target) {
        const target = parseTargets(parameters.target)[0] as HTMLElement;
        this.target = target || doc?.body || document.body;
        this.refresh();
      }
      if (this._debug) this.debug();
    });
  }

  /**
   * Links an animation or timer to this observer
   * @param {any} linked The animation or timer to link
   * @returns {ScrollObserver} This observer for chaining
   */
  link(linked: any): ScrollObserver {
    if (linked) {
      // Make sure to pause the linked object in case it's added later
      linked.pause();
      this.linked = linked;
      // Try to use a target of the linked object if no target parameters specified
      if (!this._params.target) {
        let $linkedTarget: HTMLElement | null = null;
        if (!isUnd((linked as any).targets)) {
          $linkedTarget = getAnimationDomTarget(linked);
        } else {
          forEachChildren(linked, (child: any) => {
            if (child.targets && !$linkedTarget) {
              $linkedTarget = getAnimationDomTarget(child);
            }
          });
        }
        // Fallback to body if no target found
        this.target = $linkedTarget || doc?.body || document.body;
        this.refresh();
      }
    }
    return this;
  }

  /**
   * Gets the current velocity
   * @returns {number} The current scroll velocity
   */
  get velocity(): number {
    return this.container.velocity;
  }

  /**
   * Gets whether scrolling backward
   * @returns {boolean} Whether scrolling backward
   */
  get backward(): boolean {
    return this.horizontal
      ? this.container.backwardX
      : this.container.backwardY;
  }

  /**
   * Gets the current scroll position
   * @returns {number} The current scroll position
   */
  get scroll(): number {
    return this.horizontal ? this.container.scrollX : this.container.scrollY;
  }

  /**
   * Gets the current progress (0-1)
   * @returns {number} The current progress
   */
  get progress(): number {
    const p = (this.scroll - this.offsetStart) / this.distance;
    return p === Infinity || isNaN(p) ? 0 : round(clamp(p, 0, 1), 6);
  }

  /**
   * Refreshes the observer state
   * @returns {ScrollObserver} This observer for chaining
   */
  refresh(): ScrollObserver {
    this.reverted = false;
    const params = this._params;
    this.repeat = setValue(
      parseScrollObserverFunctionParameter<boolean>(params.repeat as any, this),
      true
    );
    this.horizontal =
      setValue(
        parseScrollObserverFunctionParameter<any>(params.axis as any, this),
        "y"
      ) === "x";
    this.enter = setValue(
      parseScrollObserverFunctionParameter<any>(params.enter as any, this),
      "end start"
    );
    this.leave = setValue(
      parseScrollObserverFunctionParameter<any>(params.leave as any, this),
      "start end"
    );
    this.updateBounds();
    this.handleScroll();
    return this;
  }

  /**
   * Removes debug visualization
   * @returns {ScrollObserver} This observer for chaining
   */
  removeDebug(): ScrollObserver {
    if (this.$debug) {
      this.$debug.parentNode!.removeChild(this.$debug);
      this.$debug = null;
    }
    if (this.debugStyles) {
      this.debugStyles.revert();
      this.debugStyles = null;
      this.$debug = null;
    }
    return this;
  }

  /**
   * Updates element and container bounds
   */
  updateBounds(): void {
    if (this._debug) {
      this.removeDebug();
    }

    let stickys: any[] | undefined;
    const $target = this.target;
    const container = this.container;
    const isHori = this.horizontal;
    const linked = this.linked;
    let linkedTime;
    let $el = $target;
    let offsetX = 0;
    let offsetY = 0;
    let $offsetParent = $el;

    if (!$target) return;

    if (linked) {
      linkedTime = linked.currentTime;
      linked.seek(0, true);
    }

    const isContainerStatic =
      getTargetValue(container.element, "position") === "static"
        ? setTargetValues(container.element, { position: "relative " })
        : false;

    while (
      $el &&
      $el !== container.element &&
      $el !== (doc?.body || document.body)
    ) {
      const isSticky =
        getTargetValue($el, "position") === "sticky"
          ? setTargetValues($el, { position: "static" })
          : false;
      if ($el === $offsetParent) {
        offsetX += $el.offsetLeft || 0;
        offsetY += $el.offsetTop || 0;
        $offsetParent = $el.offsetParent as HTMLElement;
      }
      $el = $el.parentElement;
      if (isSticky) {
        if (!stickys) stickys = [];
        stickys.push(isSticky);
      }
    }

    if (isContainerStatic) isContainerStatic.revert();

    const offset = isHori ? offsetX : offsetY;
    const targetSize = isHori ? $target.offsetWidth : $target.offsetHeight;
    const containerSize = isHori ? container.width : container.height;
    const scrollSize = isHori ? container.scrollWidth : container.scrollHeight;
    const maxScroll = scrollSize - containerSize;
    const enter = this.enter;
    const leave = this.leave;

    let enterTarget: ScrollThresholdValue = "start" as any;
    let leaveTarget: ScrollThresholdValue = "end" as any;
    let enterContainer: ScrollThresholdValue = "end" as any;
    let leaveContainer: ScrollThresholdValue = "start" as any;

    if (isStr(enter)) {
      const splitted = (enter as string).split(" ");
      enterContainer = splitted[0] as any;
      enterTarget = splitted.length > 1 ? (splitted[1] as any) : enterTarget;
    } else if (isObj(enter)) {
      const e = enter as ScrollThresholdParam;
      if (!isUnd(e.container)) enterContainer = e.container!;
      if (!isUnd(e.target)) enterTarget = e.target!;
    } else if (isNum(enter)) {
      enterContainer = enter as any;
    }

    if (isStr(leave)) {
      const splitted = (leave as string).split(" ");
      leaveContainer = splitted[0] as any;
      leaveTarget = splitted.length > 1 ? (splitted[1] as any) : leaveTarget;
    } else if (isObj(leave)) {
      const t = leave as ScrollThresholdParam;
      if (!isUnd(t.container)) leaveContainer = t.container!;
      if (!isUnd(t.target)) leaveTarget = t.target!;
    } else if (isNum(leave)) {
      leaveContainer = leave as any;
    }

    const parsedEnterTarget = parseBoundValue($target, enterTarget, targetSize);
    const parsedLeaveTarget = parseBoundValue($target, leaveTarget, targetSize);
    const under = parsedEnterTarget + offset - containerSize;
    const over = parsedLeaveTarget + offset - maxScroll;
    const parsedEnterContainer = parseBoundValue(
      $target,
      enterContainer,
      containerSize,
      under,
      over
    );
    const parsedLeaveContainer = parseBoundValue(
      $target,
      leaveContainer,
      containerSize,
      under,
      over
    );

    const offsetStart = parsedEnterTarget + offset - parsedEnterContainer;
    const offsetEnd = parsedLeaveTarget + offset - parsedLeaveContainer;
    const scrollDelta = offsetEnd - offsetStart;

    this.offsets[0] = offsetX;
    this.offsets[1] = offsetY;
    this.offset = offset;
    this.offsetStart = offsetStart;
    this.offsetEnd = offsetEnd;
    this.distance = scrollDelta <= 0 ? 0 : scrollDelta;
    this.thresholds = [
      enterTarget.toString(),
      leaveTarget.toString(),
      enterContainer.toString(),
      leaveContainer.toString(),
    ];
    this.coords = [
      parsedEnterTarget,
      parsedLeaveTarget,
      parsedEnterContainer,
      parsedLeaveContainer,
    ];

    if (stickys) {
      stickys.forEach((sticky) => sticky.revert());
    }

    if (linked) {
      linked.seek(linkedTime, true);
    }

    if (this._debug) {
      this.debug();
    }
  }

  /**
   * Adds debug visualization
   */
  debug(): void {
    // Implementation details for debug visualization omitted for brevity
    // The original code would be preserved here
  }

  /**
   * Handles scroll events and triggers callbacks
   */
  handleScroll(): void {
    const linked = this.linked;
    const sync = this.sync;
    const syncEase = this.syncEase;
    const syncSmooth = this.syncSmooth;
    const shouldSeek = linked && (syncEase || syncSmooth);
    const isHori = this.horizontal;
    const container = this.container;
    const scroll = this.scroll;
    const isBefore = scroll <= this.offsetStart;
    const isAfter = scroll >= this.offsetEnd;
    const isInView = !isBefore && !isAfter;
    const isOnTheEdge =
      scroll === this.offsetStart || scroll === this.offsetEnd;
    const forceEnter = !this.hasEntered && isOnTheEdge;
    const $debug = this._debug && this.$debug;
    let hasUpdated = false;
    let syncCompleted = false;
    let p = this.progress;

    if (isBefore && this.began) {
      this.began = false;
    }

    if (p > 0 && !this.began) {
      this.began = true;
    }

    if (shouldSeek) {
      const lp = linked.progress;
      if (syncSmooth && isNum(syncSmooth)) {
        if ((syncSmooth as number) < 1) {
          const step = 0.0001;
          const snap = lp < p && p === 1 ? step : lp > p && !p ? -step : 0;
          p = round(
            lerp(lp, p, interpolate(0.01, 0.2, syncSmooth as number), false) +
              snap,
            6
          );
        }
      } else if (syncEase) {
        p = syncEase(p);
      }
      hasUpdated = p !== this.prevProgress;
      syncCompleted = lp === 1;
      if (
        hasUpdated &&
        !syncCompleted &&
        syncSmooth &&
        lp &&
        container.wakeTicker
      ) {
        container.wakeTicker.restart();
      }
    }

    if ($debug) {
      const sticky = isHori ? container.scrollY : container.scrollX;
      ($debug.style as any)[isHori ? "top" : "left"] = sticky + 10 + "px";
    }

    // Trigger enter callbacks if already in view or when entering the view
    if (
      (isInView && !this.isInView) ||
      (forceEnter && !this.forceEnter && !this.hasEntered)
    ) {
      if (isInView) this.isInView = true;
      if (!this.forceEnter || !this.hasEntered) {
        if ($debug && isInView)
          ($debug.style as any).zIndex = `${this.container.zIndex++}`;
        this.onSyncEnter(this);
        this.onEnter(this);
        if (this.backward) {
          this.onSyncEnterBackward(this);
          this.onEnterBackward(this);
        } else {
          this.onSyncEnterForward(this);
          this.onEnterForward(this);
        }
        this.hasEntered = true;
        if (forceEnter) this.forceEnter = true;
      } else if (isInView) {
        this.forceEnter = false;
      }
    }

    if (isInView || (!isInView && this.isInView)) {
      hasUpdated = true;
    }

    if (hasUpdated) {
      if (shouldSeek) linked.seek(linked.duration * p);
      this.onUpdate(this);
    }

    if (!isInView && this.isInView) {
      this.isInView = false;
      this.onSyncLeave(this);
      this.onLeave(this);
      if (this.backward) {
        this.onSyncLeaveBackward(this);
        this.onLeaveBackward(this);
      } else {
        this.onSyncLeaveForward(this);
        this.onLeaveForward(this);
      }
      if (sync && !syncSmooth) {
        syncCompleted = true;
      }
    }

    if (
      p >= 1 &&
      this.began &&
      !this.completed &&
      ((sync && syncCompleted) || !sync)
    ) {
      if (sync) {
        this.onSyncComplete(this);
      }
      this.completed = true;
      if (
        (!this.repeat && !linked) ||
        (!this.repeat && linked && linked.completed)
      ) {
        this.revert();
      }
    }

    if (p < 1 && this.completed) {
      this.completed = false;
    }

    this.prevProgress = p;
  }

  /**
   * Reverts all changes and cleans up resources
   */
  revert(): void {
    if (this.reverted) return;
    const container = this.container;
    removeChild(container, this);
    if (!container._head && container.revert) {
      container.revert();
    }
    if (this._debug) {
      this.removeDebug();
    }
    this.reverted = true;
  }
}

/**
 * # createMotionScroll
 * #### Creates a scroll observer for animation
 *
 * This function creates a new ScrollObserver that can trigger animations
 * based on scroll position.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @param {ScrollObserverParams} parameters The configuration parameters
 * @returns {ScrollObserver} The created scroll observer
 */
export const createMotionScroll = (
  parameters: ScrollObserverParams = {}
): ScrollObserver => new ScrollObserver(parameters);

// Legacy export for backward compatibility
export const onScroll = createMotionScroll;
