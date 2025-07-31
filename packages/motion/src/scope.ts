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


import { doc, win } from "./consts.ts";
import { globals } from "./globals.ts";
import { parseTargets } from "./targets.ts";

/**
 * Helper function to check if a value is a function
 */
const isFnc = (value: unknown): value is (...args: any[]) => any =>
  typeof value === "function";

/**
 * Merges two objects, with source properties overriding target properties
 */
const mergeObjects = <
  T extends Record<string, any>,
  U extends Record<string, any>
>(
  target: T,
  source?: U
): T & Partial<U> => {
  if (!source) return target as T & Partial<U>;
  const result = { ...target } as T & Partial<U>;
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      (result as any)[key] = source[key];
    }
  }
  return result;
};

/*###################################(Scope Interface)###################################*/
export interface ScopeInterface {
  defaults: any;
  root: Document | DOMTarget;
  constructors: ScopeConstructor[];
  revertConstructors: (() => void)[];
  revertibles: Revertible[];
  methods: Record<string, (...args: any[]) => any>;
  matches: Record<string, boolean>;
  mediaQueryLists: Record<string, MediaQueryList>;
  data: Record<string, any>;
  execute<T>(cb: (scope: InMotionScope) => T): T;
  refresh(): InMotionScope;
  add(a1: ScopeConstructor | string, a2?: ScopeMethod): InMotionScope;
  handleEvent(e: Event): void;
  revert(): void;
}

/*###################################(Framework Refs Integration)###################################*/

export interface ReactRef {
  current?: HTMLElement | SVGElement | null;
}

export interface AngularRef {
  nativeElement?: HTMLElement | SVGElement;
}

export interface VueRef {
  value?: HTMLElement | SVGElement | null;
}

// TODO(@motion-team): Add more framework refs

/*###################################(Scope Params)###################################*/
export interface ScopeParams {
  root?: DOMTargetSelector | ReactRef | AngularRef | VueRef;
  defaults?: Record<string, any>;
  mediaQueries?: Record<string, string>;
}

export interface Revertible {
  revert(): void;
}

export type DOMTarget = HTMLElement | SVGElement;
export type DOMTargetSelector =
  | string
  | DOMTarget
  | NodeList
  | HTMLCollection
  | Array<DOMTarget>;

export type ScopeCleanup = (scope?: InMotionScope) => void;
export type ScopeConstructor = (scope: InMotionScope) => ScopeCleanup | void;
export type ScopeMethod = (...args: any[]) => ScopeCleanup | void;

/**
 * @callback ScopeCleanup
 * @param {Scope} [scope]
 */

/**
 * @callback ScopeConstructor
 * @param {Scope} [scope]
 * @return {ScopeCleanup|void}
 */

/**
 * @callback ScopeMethod
 * @param {...*} args
 * @return {ScopeCleanup|void}
 */

/**
 * # InMotion Scope
 * #### A container for animations, media queries, and shared data
 *
 * The `InMotionScope` class manages animations and provides a container for sharing data
 * and handling responsive behaviors through media queries.
 *
 * @since 0.1.0
 * @implements {ScopeInterface}
 */
export class InMotionScope implements ScopeInterface {
  /** Default parameters for animations in this scope */
  public defaults: any;

  /** Root element for targeting elements within the scope */
  public root: Document | DOMTarget;

  /** Array of constructor functions that create scope components */
  public constructors: ScopeConstructor[];

  /** Array of functions to revert constructor effects */
  public revertConstructors: (() => void)[];

  /** Array of objects that can be reverted */
  public revertibles: Revertible[];

  /** Object of methods attached to the scope */
  public methods: Record<string, (...args: any[]) => any>;

  /** Object of media query matches */
  public matches: Record<string, boolean>;

  /** Object of media query lists */
  public mediaQueryLists: Record<string, MediaQueryList>;

  /** Object for storing arbitrary data */
  public data: Record<string, any>;

  /**
   * Create a new scope instance
   * @param parameters - Configuration options for the scope
   */
  constructor(parameters: ScopeParams = {}) {
    // Add scope to global revertibles if global scope exists
    if (globals.scope) {
      (globals.scope as unknown as ScopeInterface).revertibles.push(
        this as unknown as Revertible
      );
    }

    const rootParam = parameters.root;
    // Use document as fallback if doc is null
    let root: Document | DOMTarget = doc || document;

    if (rootParam) {
      const refCurrent = (rootParam as ReactRef).current;
      const nativeElement = (rootParam as AngularRef).nativeElement;
      const targetElement = parseTargets(rootParam as DOMTargetSelector)[0];

      root = refCurrent || nativeElement || targetElement || root;
    }

    const scopeDefaults = parameters.defaults;
    const globalDefault = globals.defaults;
    const mediaQueries = parameters.mediaQueries;

    this.defaults = scopeDefaults
      ? mergeObjects(globalDefault, scopeDefaults)
      : globalDefault;
    this.root = root;
    this.constructors = [];
    this.revertConstructors = [];
    this.revertibles = [];
    this.methods = {};
    this.matches = {};
    this.mediaQueryLists = {};
    this.data = {};

    if (mediaQueries && win) {
      for (const mq in mediaQueries) {
        const _mq = win.matchMedia(mediaQueries[mq]);
        if (_mq) {
          this.mediaQueryLists[mq] = _mq;
          _mq.addEventListener("change", this);
        }
      }
    }
  }

  /**
   * Execute a callback with this scope as the active scope
   *
   * @param cb - Callback function to execute
   * @returns The result of the callback
   */
  execute<T>(cb: (scope: InMotionScope) => T): T {
    const activeScope = globals.scope;
    const activeRoot = globals.root;
    const activeDefaults = globals.defaults;

    // Cast to any to avoid type compatibility issues
    globals.scope = this as unknown as typeof globals.scope;
    globals.root = this.root as typeof globals.root;
    globals.defaults = this.defaults;

    const mqs = this.mediaQueryLists;
    for (const mq in mqs) this.matches[mq] = mqs[mq].matches;

    const returned = cb(this);

    globals.scope = activeScope;
    globals.root = activeRoot;
    globals.defaults = activeDefaults;

    return returned;
  }

  /**
   * Refresh all constructors
   *
   * @returns This scope instance for chaining
   */
  refresh(): InMotionScope {
    this.execute(() => {
      let i = this.revertibles.length;
      let y = this.revertConstructors.length;

      while (i--) {
        const revertible = this.revertibles[i];
        if (typeof revertible.revert === "function") {
          revertible.revert();
        }
      }

      while (y--) this.revertConstructors[y]();

      this.revertibles.length = 0;
      this.revertConstructors.length = 0;

      this.constructors.forEach((constructor) => {
        const revertConstructor = constructor(this);
        if (revertConstructor) {
          this.revertConstructors.push(revertConstructor);
        }
      });
    });

    return this;
  }

  /**
   * Add a constructor or method to the scope
   *
   * @param a1 - Either a constructor function or method name
   * @param a2 - Optional method implementation when a1 is a method name
   * @returns This scope instance for chaining
   */
  add(a1: ScopeConstructor | string, a2?: ScopeMethod): InMotionScope {
    if (isFnc(a1)) {
      const constructor = a1 as ScopeConstructor;
      this.constructors.push(constructor);

      this.execute(() => {
        const revertConstructor = constructor(this);
        if (revertConstructor) {
          this.revertConstructors.push(revertConstructor);
        }
      });
    } else if (a2) {
      this.methods[a1 as string] = (...args: any[]) =>
        this.execute(() => a2(...args));
    }

    return this;
  }

  /**
   * Handle events from event listeners
   *
   * @param e - Event object
   */
  handleEvent(e: Event): void {
    switch (e.type) {
      case "change":
        this.refresh();
        break;
    }
  }

  /**
   * Revert all changes and clean up resources
   */
  revert(): void {
    const revertibles = this.revertibles;
    const revertConstructors = this.revertConstructors;
    const mqs = this.mediaQueryLists;

    let i = revertibles.length;
    let y = revertConstructors.length;

    while (i--) {
      const revertible = revertibles[i];
      if (typeof revertible.revert === "function") {
        revertible.revert();
      }
    }

    while (y--) revertConstructors[y]();

    for (const mq in mqs) mqs[mq].removeEventListener("change", this);

    revertibles.length = 0;
    revertConstructors.length = 0;
    this.constructors.length = 0;
    this.matches = {};
    this.methods = {};
    this.mediaQueryLists = {};
    this.data = {};
  }
}

/**
 * Create a new scope instance
 * Implements `InMotionScope`
 *
 *
 * @param params - Configuration options for the scope
 * @returns A new scope instance
 */
export const createMotionScope = (params?: ScopeParams): InMotionScope =>
  new InMotionScope(params);
