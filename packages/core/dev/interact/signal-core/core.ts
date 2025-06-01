/**
 * @module @in/teract/signal-core/core
 *
 * The reactive engine core powering InSpatial's signal system. Think of this like
 * the central nervous system that coordinates all reactive updates, automatically
 * tracking dependencies and propagating changes through your application.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Reactive Core
 * @access private
 *
 * ### 💡 Core Concepts
 * - Manages a graph of reactive computations and signals
 * - Automatically tracks dependencies between values
 * - Efficiently propagates changes through the dependency graph
 * - Handles error states and loading/async states
 * - Implements granular update detection and propagation
 *
 * ### 🎯 Prerequisites
 * Before diving into the core:
 * - Understand basic reactivity concepts (signals, effects, memos)
 * - Familiarity with dependency tracking patterns
 * - Knowledge of graph data structures
 *
 * ### 📚 Terminology
 * > **Computation**: A node in the reactive graph that calculates values
 * > **Signal**: A leaf node that stores primitive values
 * > **Observer**: A node that watches other nodes for changes
 * > **Source**: A node being observed by other computations
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn about edge cases</summary>
 *
 * > [!NOTE]
 * > The reactive graph is acyclic - circular dependencies will cause infinite loops
 *
 * > [!NOTE]
 * > Always clean up computations to prevent memory leaks
 *
 * > [!NOTE]
 * > Avoid direct mutation of computation states outside the core system
 * </details>
 */

declare global {
  var __DEV__: boolean | undefined;
}

/**
 * Nodes for constructing a graph of reactive values and reactive computations.
 *
 * - The graph is acyclic.
 * - The user inputs new values into the graph by calling .write() on one more computation nodes.
 * - The user retrieves computed results from the graph by calling .read() on one or more computation nodes.
 * - The library is responsible for running any necessary computations so that .read() is up to date
 *   with all prior .write() calls anywhere in the graph.
 * - We call the input nodes 'roots' and the output nodes 'leaves' of the graph here.
 * - Changes flow from roots to leaves. It would be effective but inefficient to immediately
 *   propagate all changes from a root through the graph to descendant leaves. Instead, we defer
 *   change most change propagation computation until a leaf is accessed. This allows us to
 *   coalesce computations and skip altogether recalculating unused sections of the graph.
 * - Each computation node tracks its sources and its observers (observers are other
 *   elements that have this node as a source). Source and observer links are updated automatically
 *   as observer computations re-evaluate and call get() on their sources.
 * - Each node stores a cache state (clean/check/dirty) to support the change propagation algorithm:
 *
 * In general, execution proceeds in three passes:
 *
 *  1. write() propagates changes down the graph to the leaves
 *     direct children are marked as dirty and their deeper descendants marked as check
 *     (no computations are evaluated)
 *  2. read() requests that parent nodes updateIfNecessary(), which proceeds recursively up the tree
 *     to decide whether the node is clean (parents unchanged) or dirty (parents changed)
 *  3. updateIfNecessary() evaluates the computation if the node is dirty (the computations are
 *     executed in root to leaf order)
 */

import {
  EFFECT_PURE,
  EFFECT_RENDER,
  EFFECT_USER,
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
  STATE_DISPOSED,
} from "./constants.ts";
import { NotReadyErrorClass } from "./create-resource.ts";
import {
  DEFAULT_FLAGS,
  ERROR_BIT,
  LOADING_BIT,
  UNINITIALIZED_BIT,
  type FlagsType,
} from "./flags.ts";
import { getOwner, OwnerClass, setOwner } from "./owner.ts";
import { getClock, globalQueue, type IQueueType } from "./scheduler.ts";
import { onCleanup } from "./on-cleanup.ts";
import { ErrorHandlerType } from "./types.ts";

export interface SignalOptionsType<T> {
  name?: string;
  equals?: ((prev: T, next: T) => boolean) | false;
  unobserved?: () => void;
}

interface SourceNodeType {
  _observers: ObserverNodeType[] | null;
  _unobserved?: () => void;
  _updateIfNecessary: () => void;

  _stateFlags: FlagsType;
  _time: number;
}

interface ObserverNodeType {
  _sources: SourceNodeType[] | null;
  _notify: (state: number, skipQueue?: boolean) => void;

  _handlerMask: FlagsType;
  _notifyFlags: (mask: FlagsType, newFlags: FlagsType) => void;
  _time: number;
}

let currentObserver: ObserverNodeType | null = null,
  currentMask: FlagsType = DEFAULT_FLAGS,
  newSources: SourceNodeType[] | null = null,
  newSourcesIndex = 0,
  newFlags: FlagsType = 0,
  notStale = false,
  updateCheck: null | {
    _value: boolean;
    _forHasUpdated?: boolean;
    _sources?: Set<any>;
    _latestSource?: any;
  } = null,
  staleCheck: null | { _value: boolean } = null;

// Global flag to track if we're currently inside an effect execution
let isInsideEffectExecution = false;

// Track effects that were created during effect execution and need initial runs
let deferredEffects: EffectClass[] = [];

/**
 * # getObserver
 * @summary #### Gets current active computation context
 *
 * Returns the currently running computation that should
 * register dependencies when reading values.
 *
 * @example
 * ```typescript
 * createEffect(() => {
 *   // Inside here, getObserver() returns the effect's computation
 *   const value = someSignal();
 * });
 * ```
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @function
 * @returns Current active computation or null
 */
export function getObserver(): ComputationClass | null {
  return currentObserver as ComputationClass | null;
}

export const UNCHANGED: unique symbol = Symbol("unchanged");
export type UNCHANGED = typeof UNCHANGED;

/**
 * # ComputationClass
 * @summary #### The fundamental building block of the reactive system
 *
 * Represents a node in the reactive graph that can both:
 * - Store values (like signals)
 * - Compute values based on other nodes (like memos/effects)
 *
 * Think of computations like cells in a spreadsheet that can either contain
 * raw values (numbers) or formulas that reference other cells.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @class
 * @access private
 *
 * ### 💡 Core Concepts
 * - Maintains current value and error state
 * - Tracks sources (dependencies) and observers (dependents)
 * - Manages lifecycle states (CLEAN/CHECK/DIRTY/DISPOSED)
 * - Handles async loading states and error propagation
 *
 * @template T - Type of the stored/computed value
 */
export class ComputationClass<T = any>
  extends OwnerClass
  implements SourceNodeType, ObserverNodeType
{
  _sources: SourceNodeType[] | null = null;
  _observers: ObserverNodeType[] | null = null;
  _value: T | undefined;
  _error: unknown;
  _compute: null | ((p?: T) => T);

  // Used in __DEV__ mode, hopefully removed in production
  _name: string | undefined;

  // Using false is an optimization as an alternative to _equals: () => false
  // which could enable more efficient DIRTY notification
  _equals: false | ((a: T, b: T) => boolean) = isEqual;
  _unobserved: (() => void) | undefined;

  /** Whether the computation is an error or has ancestors that are unresolved */
  _stateFlags: FlagsType = 0;

  /** Which flags raised by sources are handled, vs. being passed through. */
  _handlerMask: FlagsType = DEFAULT_FLAGS;

  _loading: ComputationClass<boolean> | null = null;
  _time: number = -1;
  _forceNotify = false;

  /**
   * Creates a new computation node
   * @param initialValue - Starting value or undefined for computed values
   * @param compute - Function to calculate value (null for signals)
   * @param options - Configuration options including name and equality check
   */
  constructor(
    initialValue: T | undefined,
    compute: null | ((p?: T) => T),
    options?: SignalOptionsType<T>
  ) {
    // Initialize self as a node in the Owner tree, for tracking cleanups.
    // If we aren't passed a compute function, we don't need to track nested computations
    // because there is no way to create a nested computation (a child to the owner tree)
    super(compute === null);

    this._compute = compute;

    this._state = compute ? STATE_DIRTY : STATE_CLEAN;
    this._stateFlags =
      compute && initialValue === undefined ? UNINITIALIZED_BIT : 0;
    this._value = initialValue;

    // Used when debugging the graph; it is often helpful to know the names of sources/observers
    if (__DEV__)
      this._name = options?.name ?? (this._compute ? "computed" : "signal");

    if (options?.equals !== undefined) this._equals = options.equals;

    if (options?.unobserved) this._unobserved = options?.unobserved;
  }

  /**
   * # read
   * @summary #### Gets current value and tracks dependencies
   *
   * Retrieves the computation's value while:
   * - Registering the current observer as a dependent
   * - Ensuring value freshness through update checks
   * - Propagating error states when needed
   *
   * @example
   * ```typescript
   * const [count] = createSignal(0);
   * const double = createMemo(() => count() * 2);
   *
   * console.log(double.read()); // 0 (automatically tracks count as dependency)
   * ```
   *
   * @throws {Error} When computation is disposed or in error state
   * @returns Current value of the computation
   */
  _read(): T {
    if (false && __DEV__) {
      console.log(
        `[COMPUTATION READ] Starting _read for ${
          (this as any)._name || "unnamed"
        }, _compute: ${!!this._compute}, _state: ${this._state}, _value: ${
          this._value
        }`
      );
    }

    if (this._compute) {
      if (this._stateFlags & ERROR_BIT && this._time <= getClock())
        update(this);
      else this._updateIfNecessary();
    }

    // When the currentObserver reads this._value, the want to add this computation as a source
    // so that when this._value changes, the currentObserver will be re-executed
    if (!this._compute || this._sources?.length) track(this);

    // Handle specific flags through appropriate handlers
    if (currentObserver) {
      // For each flag in _stateFlags, check if currentObserver has a handler for it
      const unhandledFlags = this._stateFlags & ~currentMask;
      if (unhandledFlags) {
        // Add any unhandled flags to newFlags to be propagated to parent
        newFlags |= unhandledFlags;
      }
    } else {
      // No observer to handle flags, preserve them all
      newFlags |= this._stateFlags & ~currentMask;
    }

    if (this._stateFlags & ERROR_BIT) {
      throw this._error as Error;
    } else {
      if (false && __DEV__) {
        console.log(
          `[COMPUTATION READ] Returning _value for ${
            (this as any)._name || "unnamed"
          }: ${this._value}`
        );
      }
      return this._value!;
    }
  }

  /**
   * # read
   * @summary #### Gets current value and tracks dependencies
   *
   * Retrieves the computation's value while:
   * - Registering the current observer as a dependent
   * - Ensuring value freshness through update checks
   * - Propagating error states when needed
   *
   * @example
   * ```typescript
   * const [count] = createSignal(0);
   * const double = createMemo(() => count() * 2);
   *
   * console.log(double.read()); // 0 (automatically tracks count as dependency)
   * ```
   *
   * @throws {Error} When computation is disposed or in error state
   * @returns Current value of the computation
   */
  read(): T {
    return this._read();
  }

  /**
   * Return the current value of this computation
   * Automatically re-executes the surrounding computation when the value changes
   */
  wait(): T {
    if (
      this._compute &&
      this._stateFlags & ERROR_BIT &&
      this._time <= getClock()
    ) {
      update(this);
    }

    if ((notStale || this._stateFlags & UNINITIALIZED_BIT) && this.loading()) {
      throw new NotReadyErrorClass();
    }
    if (staleCheck && this.loading()) staleCheck._value = true;

    return this._read();
  }

  /**
   * Return true if the computation is the value is dependent on an unresolved promise
   * Triggers re-execution of the computation when the loading state changes
   *
   * This is useful especially when effects want to re-execute when a computation's
   * loading state changes
   */
  loading(): boolean {
    if (this._loading === null) {
      this._loading = loadingState(this);
    }

    return this._loading.read();
  }

  /**
   * # write
   * @summary #### Updates the computation's value and propagates changes
   *
   * Handles value updates by:
   * - Comparing new value with equality check
   * - Marking dependent computations as dirty
   * - Propagating flags through the reactive graph
   *
   * @example
   * ```typescript
   * const [count, setCount] = createSignal(0);
   * setCount(5); // Internally calls write(5)
   * ```
   *
   * @param value - New value or update function
   * @param flags - State flags (ERROR/LOADING etc)
   * @param raw - Skip function unwrapping
   * @returns Updated value
   */
  write(
    value: T | ((currentValue: T) => T) | UNCHANGED,
    flags: FlagsType = 0,
    // Tracks whether a function was returned from a compute result so we don't unwrap it.
    raw = false
  ): T {
    const newValue =
      !raw && typeof value === "function"
        ? (value as (currentValue: T) => T)(this._value!)
        : (value as T);

    // Determine if the value has changed based on the equals function
    let valueChanged = false;

    // Only check for changes if we have a new value being passed
    if (newValue !== UNCHANGED) {
      // Always consider a change if the value was previously uninitialized
      if (this._stateFlags & UNINITIALIZED_BIT) {
        valueChanged = true;
      }
      // If _equals is false, always consider the value changed
      else if (this._equals === false) {
        valueChanged = true;
      }
      // Otherwise, use the equals function to check
      else {
        // IMPORTANT: The equals function returns true if the values should be considered EQUAL
        // If they're equal according to the function, then no change has occurred
        // If they're not equal, then a change has occurred
        valueChanged = !this._equals(this._value!, newValue);
      }
    }

    if (valueChanged) {
      this._value = newValue;
      this._error = undefined;
    }

    const changedFlagsMask = this._stateFlags ^ flags,
      changedFlags = changedFlagsMask & flags;

    this._stateFlags = flags;
    this._time = getClock() + 1;

    // Our value has changed, so we need to notify all of our observers that the value has
    // changed and so they must rerun
    if (this._observers) {
      if (__DEV__) {
        console.log(
          `[SIGNAL WRITE] Notifying ${this._observers?.length} observers of value change`
        );
      }
      for (let i = 0; i < this._observers.length; i++) {
        if (valueChanged) {
          if (__DEV__) {
            console.log(
              `[SIGNAL WRITE] Calling _notify(STATE_DIRTY) on observer ${i}`
            );
          }
          this._observers[i]._notify(STATE_DIRTY);
        } else if (changedFlagsMask) {
          this._observers[i]._notifyFlags(changedFlagsMask, changedFlags);
        }
      }
    } else if (__DEV__) {
      console.log(`[SIGNAL WRITE] No observers to notify for signal write`);
    }

    // We return the value so that .write can be used in an expression
    // (although it is not usually recommended)
    return this._value!;
  }

  /**
   * Set the current node's state, and recursively mark all of this node's observers as STATE_CHECK
   */
  _notify(state: number, skipQueue?: boolean): void {
    if (__DEV__) {
      console.log(
        `[COMPUTATION NOTIFY] ${
          (this as any)._name || "unnamed"
        } notified with state: ${state}, current state: ${
          this._state
        }, skipQueue: ${skipQueue}`
      );
    }

    // If the state is already STATE_DIRTY and we are trying to set it to STATE_CHECK,
    // then we don't need to do anything. Similarly, if the state is already STATE_CHECK
    // and we are trying to set it to STATE_CHECK, then we don't need to do anything because
    // a previous _notify call has already set this state and all observers as STATE_CHECK
    if (this._state >= state && !this._forceNotify) {
      if (false && __DEV__) {
        console.log(
          `[COMPUTATION NOTIFY] ${
            (this as any)._name || "unnamed"
          } - state already >= ${state}, returning early`
        );
      }
      return;
    }

    this._forceNotify = !!skipQueue;
    this._state = state;

    // CRITICAL FIX: Enqueue computations (memos) in the scheduler when they become dirty
    // This ensures they get processed during flushSync, just like effects
    if (state === STATE_DIRTY && !skipQueue && this._compute) {
      if (__DEV__) {
        console.log(
          `[COMPUTATION NOTIFY] Enqueueing computation ${
            (this as any)._name || "unnamed"
          } in EFFECT_PURE queue`
        );
      }
      globalQueue.enqueue(0, this); // 0 = EFFECT_PURE queue
    }

    if (false && __DEV__) {
      console.log(
        `[COMPUTATION NOTIFY] ${
          (this as any)._name || "unnamed"
        } - state set to ${state}, notifying ${
          this._observers?.length || 0
        } observers`
      );
    }

    if (this._observers) {
      for (let i = 0; i < this._observers.length; i++) {
        if (false && __DEV__) {
          console.log(
            `[COMPUTATION NOTIFY] ${
              (this as any)._name || "unnamed"
            } - notifying observer ${i} with STATE_CHECK`
          );
        }
        this._observers[i]._notify(STATE_CHECK, skipQueue);
      }
    }
  }

  _setError(error: unknown): void {
    this._error = error;
    this.write(
      UNCHANGED,
      (this._stateFlags & ~LOADING_BIT) | ERROR_BIT | UNINITIALIZED_BIT
    );
  }

  /**
   * This is the core part of the reactivity system, which makes sure that the values are updated
   * before they are read. We've also adapted it to return the loading state of the computation,
   * so that we can propagate that to the computation's observers.
   *
   * This function will ensure that the value and states we read from the computation are up to date
   */
  _updateIfNecessary(): void {
    if (false && __DEV__) {
      console.log(
        `[UPDATE IF NECESSARY] ${(this as any)._name || "unnamed"} - state: ${
          this._state
        }, sources: ${this._sources?.length || 0}`
      );
    }

    // If the user tries to read a computation that has been disposed, we throw an error, because
    // they probably kept a reference to it as the parent reran, so there is likely a new computation
    // with the same _compute function that they should be reading instead.
    if (this._state === STATE_DISPOSED) {
      const errorMsg =
        __DEV__ && (this as any)._name
          ? `Tried to read disposed computation "${(this as any)._name}"`
          : "Tried to read a disposed computation";
      throw new Error(errorMsg);
    }

    // If the computation is already clean, none of our sources have changed, so we know that
    // our value and stateFlags are up to date, and we can just return.
    if (this._state === STATE_CLEAN) {
      if (false && __DEV__) {
        console.log(
          `[UPDATE IF NECESSARY] ${
            (this as any)._name || "unnamed"
          } - already clean, returning`
        );
      }
      return;
    }

    // Otherwise, our sources' values may have changed, or one of our sources' loading states
    // may have been set to no longer loading. In either case, what we need to do is make sure our
    // sources all have up to date values and loading states and then update our own value and
    // loading state

    // We keep track of whether any of our sources have changed loading state so that we can update
    // our loading state. This is only necessary if none of them change value because update() will
    // also cause us to recompute our loading state.
    let observerFlags: FlagsType = 0;

    // STATE_CHECK means one of our grandparent sources may have changed value or loading state,
    // so we need to recursively call _updateIfNecessary to update the state of all of our sources
    // and then update our value and loading state.
    if (this._state === STATE_CHECK) {
      for (let i = 0; i < this._sources!.length; i++) {
        // Make sure the parent is up to date. If it changed value, then it will mark us as
        // STATE_DIRTY, and we will know to rerun
        this._sources![i]._updateIfNecessary();

        // If the parent is loading, then we are waiting
        observerFlags |= this._sources![i]._stateFlags;

        // If the parent changed value, it will mark us as STATE_DIRTY and we need to call update()
        // Cast because the _updateIfNecessary call above can change our state
        if ((this._state as number) === STATE_DIRTY) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    if (this._state === STATE_DIRTY) {
      update(this);
    } else {
      // isWaiting has now coallesced all of our parents' loading states
      this.write(UNCHANGED, observerFlags);

      // None of our parents changed value, so our value is up to date (STATE_CLEAN)
      this._state = STATE_CLEAN;
    }
  }

  /**
   * Remove ourselves from the owner graph and the computation graph
   */
  override _disposeNode(): void {
    // If we've already been disposed, don't try to dispose twice
    if (this._state === STATE_DISPOSED) return;

    if (false && __DEV__) {
      console.log(
        `[COMPUTATION DISPOSE] Disposing computation ${
          this._name || "unnamed"
        }, sources: ${this._sources?.length || 0}`
      );
    }

    // Unlink ourselves from our sources' observers array so that we can be garbage collected
    // This removes us from the computation graph
    if (this._sources) {
      if (false && __DEV__) {
        console.log(
          `[COMPUTATION DISPOSE] Removing ${this._name || "unnamed"} from ${
            this._sources!.length
          } source observer lists`
        );
      }
      removeSourceObservers(this, 0);
    }

    // Remove ourselves from the ownership tree as well
    super._disposeNode();
  }

  /**
   * # _notifyFlags
   * @summary #### Handles flag changes from source nodes
   *
   * This method is called when flags (like ERROR_BIT, LOADING_BIT) change
   * in source nodes. It propagates relevant flags to observers while
   * respecting the handler mask.
   *
   * @param mask - Bitmask indicating which flags changed
   * @param newFlags - The new flag values
   */
  _notifyFlags(mask: FlagsType, newFlags: FlagsType): void {
    // Handle flags that this computation can process
    const handledFlags = mask & this._handlerMask;
    const unhandledFlags = mask & ~this._handlerMask;

    // Update our own state flags for handled flags
    if (handledFlags) {
      const currentHandledFlags = this._stateFlags & handledFlags;
      const newHandledFlags = newFlags & handledFlags;
      this._stateFlags = (this._stateFlags & ~handledFlags) | newHandledFlags;
    }

    // Propagate unhandled flags to our observers
    if (unhandledFlags && this._observers) {
      const propagatedFlags = newFlags & unhandledFlags;
      for (let i = 0; i < this._observers.length; i++) {
        this._observers[i]._notifyFlags(unhandledFlags, propagatedFlags);
      }
    }
  }
}

function loadingState(node: ComputationClass): ComputationClass<boolean> {
  const prevOwner = setOwner(node._parent);

  const options = __DEV__
    ? { name: node._name ? `loading ${node._name}` : "loading" }
    : undefined;

  const computation = new ComputationClass<boolean>(
    undefined,
    () => {
      track(node);
      node._updateIfNecessary();
      return !!(node._stateFlags & LOADING_BIT);
    },
    options
  );

  computation._handlerMask = ERROR_BIT | LOADING_BIT;
  setOwner(prevOwner);

  return computation;
}

/**
 * Instead of wiping the sources immediately on `update`, we compare them to the new sources
 * by checking if the source we want to add is the same as the old source at the same index.
 *
 * This way when the sources don't change, we are just doing a fast comparison:
 *
 * _sources: [a, b, c]
 *            ^
 *            |
 *      newSourcesIndex
 *
 * When the sources do change, we create newSources and push the values that we read into it
 */
function track(computation: SourceNodeType): void {
  if (!currentObserver) {
    // Early exit if no observer - this handles untrack scenarios
    return;
  }

  if (false && __DEV__) {
    console.log(
      `[TRACK] Tracking computation, observer: ${
        (currentObserver as any)._name || "unnamed"
      }, computation has _compute: ${!!(computation as any)
        ._compute}, computation _observers: ${
        (computation as any)._observers?.length || 0
      }`
    );
  }

  // CRITICAL FIX: Properly detect effects vs memos
  // EffectClass has _effect property, ComputationClass (memos) does not
  const isEffect = !!(currentObserver as any)._effect;

  if (false && __DEV__) {
    console.log(
      `[TRACK] Observer type detection - has _effect: ${!!(
        currentObserver as any
      )._effect}, has _fn: ${!!(currentObserver as any)
        ._fn}, has _compute: ${!!(currentObserver as any)
        ._compute}, isEffect: ${isEffect}`
    );
  }

  // For signals (no _compute function), establish immediate links for effects
  // but use deferred linking for memos
  if (!(computation as any)._compute) {
    if (false && __DEV__) {
      console.log(`[TRACK] Signal tracking - isEffect: ${isEffect}`);
    }

    if (isEffect) {
      if (false && __DEV__) {
        console.log(
          `[TRACK] Using immediate bidirectional linking for effect reading signal`
        );
      }

      // IMMEDIATE bidirectional linking for effects reading signals
      // Add signal to effect's sources
      if (!currentObserver._sources) {
        currentObserver._sources = [computation];
      } else if (!currentObserver._sources.includes(computation)) {
        currentObserver._sources.push(computation);
      }

      // Add effect to signal's observers
      if (!computation._observers) {
        computation._observers = [currentObserver];
      } else if (!computation._observers.includes(currentObserver)) {
        computation._observers.push(currentObserver);
      }

      if (false && __DEV__) {
        console.log(
          `[TRACK] Linked signal to effect - signal observers: ${computation._observers?.length}, effect sources: ${currentObserver?._sources?.length}`
        );
      }

      return; // Skip deferred tracking for effects
    } else {
      if (false && __DEV__) {
        console.log(
          `[TRACK] Using deferred newSources tracking for memo reading signal`
        );
      }
      // Fall through to deferred tracking for memos reading signals
    }
  } else {
    // For computations/memos, check if current observer is an effect
    if (isEffect) {
      if (false && __DEV__) {
        console.log(
          `[TRACK] Effect reading from memo - establishing immediate bidirectional link`
        );
      }

      // IMMEDIATE bidirectional linking for effects reading memos
      // Add memo to effect's sources
      if (!currentObserver._sources) {
        currentObserver._sources = [computation];
      } else if (!currentObserver._sources.includes(computation)) {
        currentObserver._sources.push(computation);
      }

      // Add effect to memo's observers
      if (!computation._observers) {
        computation._observers = [currentObserver];
      } else if (!computation._observers.includes(currentObserver)) {
        computation._observers.push(currentObserver);
      }

      if (false && __DEV__) {
        console.log(
          `[TRACK] Linked memo to effect - memo observers: ${computation._observers?.length}, effect sources: ${currentObserver?._sources?.length}`
        );
      }

      return; // Skip deferred tracking for effects
    }
  }

  // DEFERRED tracking logic for memo-to-memo and memo-to-signal dependencies
  // Additional safety check for currentObserver before accessing _sources
  if (!currentObserver) {
    // This should not happen, but be defensive
    return;
  }

  if (false && __DEV__) {
    console.log(
      `[TRACK] Using deferred tracking - newSources: ${
        newSources?.length || 0
      }, newSourcesIndex: ${newSourcesIndex}`
    );
  }

  if (
    !newSources &&
    currentObserver._sources &&
    currentObserver._sources[newSourcesIndex] === computation
  ) {
    newSourcesIndex++;
  } else if (!newSources) {
    newSources = [computation];
  } else if (computation !== newSources[newSources.length - 1]) {
    // If the computation is the same as the last source we read, we don't need to add it to newSources
    newSources.push(computation);
  }

  if (false && __DEV__) {
    console.log(
      `[TRACK] After deferred tracking - newSources: ${
        newSources?.length || 0
      }, newSourcesIndex: ${newSourcesIndex}`
    );
  }
}

/**
 * # update
 * @summary #### Forces recomputation of a node and its dependents
 *
 * Handles the core update logic by:
 * 1. Cleaning up previous dependencies
 * 2. Re-running the computation function
 * 3. Updating dependency tracking
 * 4. Propagating new values through the graph
 *
 * @example
 * ```typescript
 * const memo = createMemo(() => expensiveCalculation());
 * update(memo); // Force recomputation
 * ```
 *
 * @param node - Computation node to update
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @function
 */
export function update<T>(node: ComputationClass<T>): void {
  if (false && __DEV__) {
    console.log(
      `[UPDATE] Starting update for ${
        (node as any)._name || "unnamed"
      }, newSources: ${
        newSources?.length || 0
      }, newSourcesIndex: ${newSourcesIndex}`
    );
  }

  const prevSources = newSources,
    prevSourcesIndex = newSourcesIndex,
    prevFlags = newFlags;

  newSources = null as ComputationClass[] | null;
  newSourcesIndex = 0;
  newFlags = 0;

  try {
    node.dispose(false);
    node.emptyDisposal();

    // Rerun the node's _compute function, setting node as owner and listener so that any
    // computations read are added to node's sources and any computations are automatically disposed
    // if `node` is rerun
    const result = compute(node, node._compute!, node);

    // Update the node's value
    node.write(result, newFlags, true);
  } catch (error: unknown) {
    node.emptyDisposal();
    node._setError(error);
  } finally {
    if (false && __DEV__) {
      console.log(
        `[UPDATE] Finally block for ${
          (node as any)._name || "unnamed"
        } - newSources: ${
          newSources?.length || 0
        }, newSourcesIndex: ${newSourcesIndex}`
      );
    }

    if (newSources) {
      if (false && __DEV__) {
        console.log(
          `[UPDATE] Processing newSources for ${
            (node as any)._name || "unnamed"
          } - newSources: ${
            newSources!.length
          }, newSourcesIndex: ${newSourcesIndex}`
        );
      }

      // First we update our own sources array (uplinks)
      if (newSourcesIndex > 0) {
        // If we shared some sources with the previous execution, we need to copy those over to the
        // new sources array

        // First we need to make sure the sources array is long enough to hold all the new sources
        node._sources!.length = newSourcesIndex + newSources.length;

        // Then we copy the new sources over
        for (let i = 0; i < newSources.length; i++) {
          node._sources![newSourcesIndex + i] = newSources[i];
        }
      } else {
        // If we didn't share any sources with the previous execution, set the sources array to newSources
        node._sources = newSources;
      }

      // For each new source, we need to add this `node` to the source's observers array (downlinks)
      let source: SourceNodeType;
      for (let i = newSourcesIndex; i < node._sources!.length; i++) {
        source = node._sources![i];
        if (!source._observers) source._observers = [node];
        else source._observers.push(node);

        if (false && __DEV__) {
          console.log(
            `[UPDATE] Added ${
              (node as any)._name || "unnamed"
            } as observer to source, source now has ${
              source._observers!.length
            } observers`
          );
        }
      }
    } else if (false && __DEV__) {
      console.log(
        `[UPDATE] No newSources to process for ${
          (node as any)._name || "unnamed"
        }`
      );
    }

    newSources = prevSources;
    newSourcesIndex = prevSourcesIndex;
    newFlags = prevFlags;

    node._time = getClock() + 1;

    // By now, we have updated the node's value and sources array, so we can mark it as clean
    // TODO: This assumes that the computation didn't write to any signals, throw an error if it did
    node._state = STATE_CLEAN;
  }
}

/**
 * Removes node from the observers array of the sources listed from `start` index.
 */
function removeSourceObservers(node: ObserverNodeType, start: number): void {
  const sources = node._sources!;
  for (let i = start; i < sources.length; i++) {
    const source = sources[i],
      observers = source._observers;
    if (observers) {
      const index = observers.indexOf(node);
      observers.splice(index, 1);
      if (!observers.length && source._unobserved) source._unobserved();
    }
  }
  sources.length = start;
}

export function isEqual<T>(a: T, b: T): boolean {
  return a === b;
}

/**
 * # untrack
 * @summary #### Reads value without tracking dependencies
 *
 * Temporarily disables dependency tracking while
 * reading reactive values. Useful for:
 * - Logging/analytics that shouldn't trigger updates
 * - Performance-sensitive reads that don't need reactivity
 *
 * @example
 * ```typescript
 * const [count] = createSignal(0);
 *
 * // Log current value without creating dependency
 * createEffect(() => {
 *   console.log("Current count:", untrack(() => count()));
 * });
 * ```
 *
 * @param fn - Function to execute without tracking
 * @returns Result of the function
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @function
 */
export function untrack<T>(fn: () => T): T {
  const prev = currentObserver;
  currentObserver = null;
  const result = fn();
  currentObserver = prev;
  return result;
}

/**
 * Returns true if the given function contains signals that have been updated since the last time
 * the parent computation was run.
 *
 * @param fn The function to run to check for updates
 * @returns Boolean indicating if the signals in fn have been updated
 */
export function hasUpdated(fn: () => any): boolean {
  // Store the previous update check context
  const prevCheck = updateCheck;

  // Store a reference to the current observer to preserve parent-child relationships
  const prevObserver = currentObserver;

  // We don't need the current computation for hasUpdated

  // Create a fresh update check object with additional metadata
  updateCheck = {
    _value: false, // Will be set to true if any signal has updated
    _forHasUpdated: true, // Mark that this is for a hasUpdated call (special handling)
    _sources: new Set(), // Track which signals have been accessed
    _latestSource: null, // Track the most recently updated source
  };

  try {
    // Create a clean execution environment to properly detect signal updates
    // We temporarily clear the current observer to avoid side effects
    currentObserver = null;

    // Run the function which will access signals and track updates
    fn();

    // Return true if any signal was updated
    return updateCheck._value;
  } finally {
    // If we detected updates during this hasUpdated call and there's a parent check
    // that isn't another hasUpdated call, propagate our update status
    if (prevCheck && updateCheck._value && !prevCheck._forHasUpdated) {
      prevCheck._value = true;
      // Also propagate the latest source information
      if (updateCheck._latestSource) {
        prevCheck._latestSource = updateCheck._latestSource;
      }
    }

    // Restore the previous context
    updateCheck = prevCheck;
    currentObserver = prevObserver;
  }
}

/**
 * Returns true if the given function contains async signals are out of date.
 */
export function isPending(fn: () => any): boolean;
export function isPending(fn: () => any, loadingValue: boolean): boolean;
export function isPending(fn: () => any, loadingValue?: boolean): boolean {
  const argLength = arguments.length;
  const current = staleCheck;
  staleCheck = { _value: false };
  try {
    latest(fn);
    return staleCheck._value;
  } catch (err) {
    if (!(err instanceof NotReadyErrorClass)) return false;
    if (argLength > 1) return loadingValue!;
    throw err;
  } finally {
    staleCheck = current;
  }
}

/**
 * Attempts to resolve value of expression synchronously returning the last resolved value for any async computation.
 */
export function latest<T>(fn: () => T): T;
export function latest<T, U>(fn: () => T, fallback: U): T | U;
export function latest<T, U>(fn: () => T, fallback?: U): T | U {
  const argLength = arguments.length;
  const prevFlags = newFlags;
  const prevNotStale = notStale;
  notStale = false;
  try {
    return fn();
  } catch (err) {
    if (argLength > 1 && err instanceof NotReadyErrorClass)
      return fallback as U;
    throw err;
  } finally {
    newFlags = prevFlags;
    notStale = prevNotStale;
  }
}

export function catchError(fn: () => void): unknown | undefined {
  try {
    fn();
  } catch (e) {
    if (e instanceof NotReadyErrorClass) throw e;
    return e;
  }
}

/**
 * Runs the given function in the given observer.
 *
 * Warning: Usually there are simpler ways of modeling a problem that avoid using this function
 */
export function runWithObserver<T>(
  observer: ComputationClass,
  run: () => T
): T | undefined {
  const prevSources = newSources,
    prevSourcesIndex = newSourcesIndex,
    prevFlags = newFlags;

  newSources = null as ComputationClass[] | null;
  newSourcesIndex = observer._sources ? observer._sources.length : 0;
  newFlags = 0;

  try {
    return compute(observer, run, observer);
  } catch (error) {
    if (error instanceof NotReadyErrorClass) {
      observer.write(
        UNCHANGED,
        newFlags | LOADING_BIT | (observer._stateFlags & UNINITIALIZED_BIT)
      );
    } else {
      observer._setError(error);
    }
  } finally {
    if (newSources) {
      // First we update our own sources array (uplinks)
      if (newSourcesIndex > 0) {
        // If we shared some sources with the previous execution, we need to copy those over to the
        // new sources array

        // First we need to make sure the sources array is long enough to hold all the new sources
        observer._sources!.length = newSourcesIndex + newSources.length;

        // Then we copy the new sources over
        for (let i = 0; i < newSources.length; i++) {
          observer._sources![newSourcesIndex + i] = newSources[i];
        }
      } else {
        // If we didn't share any sources with the previous execution, set the sources array to newSources
        observer._sources = newSources;
      }

      // For each new source, we need to add this `node` to the source's observers array (downlinks)
      let source: SourceNodeType;
      for (let i = newSourcesIndex; i < observer._sources!.length; i++) {
        source = observer._sources![i];
        if (!source._observers) source._observers = [observer];
        else source._observers.push(observer);
      }
    }

    // Reset global context after computation
    newSources = prevSources;
    newSourcesIndex = prevSourcesIndex;
    newFlags = prevFlags;
  }
}

/**
 * A convenient wrapper that calls `compute` with the `owner` and `observer` and is guaranteed
 * to reset the global context after the computation is finished even if an error is thrown.
 */
export function compute<T>(
  owner: OwnerClass | null,
  fn: () => T,
  node: ComputationClass | null
): T {
  const prevOwner = getOwner(),
    prevObserver = currentObserver,
    prevMask = currentMask,
    prevUpdateCheck = updateCheck,
    prevStaleCheck = staleCheck;

  setOwner(owner);
  currentObserver = node;
  currentMask = node?._handlerMask ?? DEFAULT_FLAGS;
  updateCheck = null;
  staleCheck = null;

  let result: T;
  let hadError = false;

  try {
    result = fn();
    return result;
  } catch (error: any) {
    hadError = true;
    if (node) {
      node._setError(error);
      return node._value!;
    }
    throw error;
  } finally {
    setOwner(prevOwner);
    currentObserver = prevObserver;
    currentMask = prevMask;
    updateCheck = prevUpdateCheck;
    staleCheck = prevStaleCheck;
  }
}

export function flatten<T>(
  computation: ComputationClass<ComputationClass<T>>
): ComputationClass<T> {
  const node = new ComputationClass<T>(undefined, null);

  node._handlerMask = ERROR_BIT | LOADING_BIT;
  node._equals = false;

  function getValue() {
    computation._updateIfNecessary();

    if (computation._stateFlags & ERROR_BIT) {
      node.write(UNCHANGED, ERROR_BIT);
      throw computation._error;
    }

    if (computation._stateFlags & LOADING_BIT) {
      return {
        _value: undefined,
        read() {
          return undefined;
        },
        wait() {
          throw new NotReadyErrorClass();
        },
        loading() {
          return true;
        },
        _stateFlags: LOADING_BIT,
        _updateIfNecessary() {
          throw new Error("Unreachable");
        },
        write() {
          throw new Error("Unreachable");
        },
      } as unknown as ComputationClass<T>;
    }

    return computation._value!;
  }

  let memo = new ComputationClass<T>(undefined, getValue as () => T);
  memo._handlerMask = ERROR_BIT | LOADING_BIT;
  return memo;
}

export function createBoundary<T>(
  fn: () => T,
  queue: IQueueType,
  owner = getOwner()
): ComputationClass<T> {
  const node = new ComputationClass<T>(undefined, fn);
  node._queue = queue;
  queue.addChild(node._queue);
  owner?.append(node);
  return node;
}

// ===================================================================
// Debugging Utilities
// ===================================================================

/**
 * Returns the current dependencies (sources) of the given computation node.
 */
export function getComputationDependencies(
  computation: ComputationClass
): ComputationClass[] {
  // @ts-ignore __DEV__ is expected to be defined globally by the build process
  if (!__DEV__) return [];
  return (computation._sources?.slice() as ComputationClass[]) || [];
}

/**
 * Returns the current observers of the given computation node.
 */
export function getComputationObservers(
  computation: ComputationClass
): ComputationClass[] {
  // @ts-ignore __DEV__ is expected to be defined globally by the build process
  if (!__DEV__) return [];
  return (
    (computation._observers?.slice() as unknown as ComputationClass[]) || []
  );
}

/**
 * Returns the developer-assigned name of the computation node, if available.
 */
export function getComputationName(
  computation: ComputationClass
): string | undefined {
  // @ts-ignore __DEV__ is expected to be defined globally by the build process
  if (!__DEV__) return undefined;
  return computation._name;
}

/**
 * # EffectClass
 * @summary #### Represents a reactive computation that performs side effects.
 *
 * `EffectClass` is the core implementation behind `createEffect` and `createRenderEffect`.
 * It extends `ComputationClass` to add behavior specific to effects, such as managing
 * cleanup functions, handling execution queues (normal vs. render effects), and
 * orchestrating when the actual side effect function is run based on dependency changes.
 *
 * Think of it as a specialized worker in the reactive system. While a regular `ComputationClass`
 * (like a memo) is focused on calculating a value, an `EffectClass` is focused on *doing*
 * something in response to value changes (e.g., updating the DOM, logging, making API calls).
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Effect
 * @class
 * @access private
 *
 * @augments ComputationClass
 */
export class EffectClass extends ComputationClass<any> {
  _fn: (prev?: any) => any;
  _effect: (value: any, prev?: any) => (() => void) | void;
  _queueType: number;
  _errorEffect: ErrorHandlerType | undefined;
  _hasRun: boolean = false; // Track if effect has ever run
  _pendingExecutions: number = 0; // Track how many times this effect should run
  _wasDeferred: boolean = false; // Track if this effect was deferred
  _skipEffectFunction: boolean = false; // Track if effect function should be skipped
  _suppressSideEffects: boolean = false; // Track if side effects should be suppressed for this run

  // Track disposers for proper cleanup between runs
  _disposers: Array<() => void> = [];

  /**
   * # Constructor
   * @summary #### Initializes a new EffectClass instance.
   *
   * Sets up the effect with its computation function (`fn`), the side effect function (`effect`),
   * an optional error handler, and various options that control its behavior (e.g., if it's a render effect).
   * It also handles deferring the initial run if the effect is created within another actively running effect.
   *
   * @param initialValue - The initial value to pass to the computation function (`fn`).
   * @param fn - The computation function that tracks dependencies. Its return value is passed to the `_effect` function.
   * @param effect - The function that performs the side effect. It receives the result of `fn`.
   * @param error - An optional error handler for errors occurring in `fn` or `_effect`.
   * @param options - Optional configuration for the effect, including `name` for debugging, `render` to mark it as a render effect, and `type` for queue management.
   */
  constructor(
    initialValue: unknown,
    fn: (prev?: any) => any,
    effect: (value: any, prev?: any) => (() => void) | void,
    error?: ErrorHandlerType,
    options?: SignalOptionsType<any> & { render?: boolean; type?: number }
  ) {
    // Pass fn as the compute function instead of null
    // This ensures effects are treated as reactive computations, not signals
    super(initialValue, fn, options);
    this._fn = fn;
    this._effect = effect;
    this._errorEffect = error;
    this._queueType =
      options?.type || (options?.render ? EFFECT_RENDER : EFFECT_USER);
    this._hasRun = false;

    // Always ensure effects have a valid queue
    if (!options?.render) {
      this._queue = options?.type
        ? globalQueue
        : this._parent?._queue || globalQueue;
    }

    // Check if we're currently inside another effect's execution
    // If so, defer the initial execution to avoid nested immediate runs

    if (true && __DEV__) {
      console.log(
        `[EFFECT CONSTRUCTOR] Creating effect ${
          this._name || "unnamed"
        }, isInsideEffectExecution: ${isInsideEffectExecution}`
      );
    }

    if (isInsideEffectExecution) {
      // Defer execution - add to deferred list to run after current effect completes
      if (true && __DEV__) {
        console.log(
          `[EFFECT CONSTRUCTOR] Deferring initial execution for ${
            this._name || "unnamed"
          } - inside effect execution`
        );
      }
      this._wasDeferred = true;
      deferredEffects.push(this);
    } else {
      // Normal immediate execution for top-level effects
      this._notify(STATE_DIRTY);
    }
  }

  /**
   * # emptyDisposal
   * @summary #### Clears previously registered cleanup functions.
   *
   * This method is called before an effect re-runs or when it's completely disposed.
   * It iterates through any cleanup functions returned by the previous execution of the
   * `_effect` function and calls them to release resources (e.g., clear timers, remove event listeners).
   *
   * @override
   */
  override emptyDisposal(): void {
    super.emptyDisposal();

    // Also run any registered disposers in reverse order
    if (this._disposers.length > 0) {
      const disposers = this._disposers;
      this._disposers = [];
      for (let i = disposers.length - 1; i >= 0; i--) {
        try {
          disposers[i]();
        } catch (err) {
          if (__DEV__) console.error("Error in effect disposer:", err);
        }
      }
    }
  }

  /**
   * # addDisposer
   * @summary #### Registers a cleanup function for the current effect execution.
   *
   * If the `_effect` function returns a function, that function is treated as a disposer
   * and is added here. It will be called by `emptyDisposal` before the next run or full disposal.
   *
   * @param disposer - The cleanup function to register.
   */
  addDisposer(disposer: () => void): void {
    if (typeof disposer === "function") {
      this._disposers.push(disposer);
    }
  }

  /**
   * # _notify
   * @summary #### Notifies the effect that its dependencies might have changed.
   *
   * This method is called by the signals an effect depends on when their values change.
   * It updates the effect's internal state (e.g., to `STATE_DIRTY`) and, if necessary,
   * enqueues the effect in the appropriate scheduler queue (`EFFECT_PURE`, `EFFECT_RENDER`)
   * to be run.
   *
   * @override
   * @param state - The new state to set for the effect (e.g., `STATE_DIRTY`, `STATE_CHECK`).
   * @param skipQueue - If `true`, the effect's state is updated, but it's not added to the scheduler queue.
   */
  override _notify(state: number, skipQueue?: boolean) {
    // Add debugging to track notifications
    if (false && __DEV__) {
      console.log(
        `[EFFECT NOTIFY] Effect ${
          this._name || "unnamed"
        } notified with state: ${state}, skipQueue: ${skipQueue}, current state: ${
          this._state
        }, hasRun: ${this._hasRun}, wasDeferred: ${this._wasDeferred}`
      );
    }

    // Update the state to the new state
    this._state = Math.max(this._state, state);

    // Only enqueue if we're not skipping the queue AND the effect needs to run
    if (!skipQueue && (this._state >= STATE_DIRTY || !this._hasRun)) {
      if (false && __DEV__) {
        console.log(
          `[EFFECT NOTIFY] Enqueueing effect ${
            this._name || "unnamed"
          } in queue type ${this._queueType}`
        );
      }

      this._queue.enqueue(this._queueType, this);
    }

    // Propagate state to observers
    if (this._observers) {
      for (let i = 0; i < this._observers.length; i++) {
        this._observers[i]._notify(STATE_CHECK, skipQueue);
      }
    }
  }

  /**
   * # _updateIfNecessary
   * @summary #### Ensures the effect is up-to-date before execution.
   *
   * This method is called before an effect's execution to verify that all its dependencies
   * have current values. If dependencies have changed, the effect is marked as dirty and
   * will re-run. Otherwise, it remains clean.
   *
   * @override
   */
  override _updateIfNecessary(): void {
    if (this._state === STATE_DISPOSED) {
      throw new Error("Tried to access a disposed effect");
    }

    if (this._state === STATE_CLEAN) return;

    if (this._state === STATE_CHECK) {
      for (let i = 0; i < this._sources!.length; i++) {
        this._sources![i]._updateIfNecessary();
        if ((this._state as number) === STATE_DIRTY) break;
      }
    }

    if (this._state === STATE_DIRTY) {
      this._runEffect();
    } else {
      this._state = STATE_CLEAN;
    }
  }

  /**
   * # _runEffect
   * @summary #### Executes the effect's computation and side effect functions.
   *
   * This is the core method that handles the full effect execution cycle:
   * 1. Sets up the execution context and tracks dependencies
   * 2. Runs the computation function (`_fn`) to get the result
   * 3. Passes the result to the side effect function (`_effect`)
   * 4. Handles cleanup functions and error management
   */
  _runEffect(): void {
    if (false && __DEV__) {
      console.log(
        `[EFFECT RUN] Running effect ${this._name || "unnamed"}, hasRun: ${
          this._hasRun
        }, state: ${this._state}`
      );
    }

    // If we're suppressing side effects for this run, update the computation but skip the effect
    if (this._suppressSideEffects) {
      if (false && __DEV__) {
        console.log(
          `[EFFECT RUN] Suppressing side effects for ${this._name || "unnamed"}`
        );
      }
      this._suppressSideEffects = false;

      // Just update the computation part without running the effect
      update(this);
      return;
    }

    const wasInsideEffectExecution = isInsideEffectExecution;
    const prevDeferredEffects = deferredEffects;

    try {
      // Set flag to track that we're inside an effect execution
      isInsideEffectExecution = true;
      deferredEffects = [];

      // Clean up previous disposers before re-running
      this.emptyDisposal();

      // Track previous value for the effect function
      const prevValue = this._value;

      // Update the computation (this will call the _fn and track dependencies)
      update(this);

      // Get the computed value to pass to the effect
      const newValue = this._value;

      // Only run the effect function if this isn't a skipEffectFunction scenario
      if (!this._skipEffectFunction) {
        if (false && __DEV__) {
          console.log(
            `[EFFECT RUN] Running effect function for ${
              this._name || "unnamed"
            }`
          );
        }

        try {
          // Run the effect function with the computed value
          const disposer = this._effect(newValue, prevValue);

          // If effect returns a function, register it as a disposer
          if (typeof disposer === "function") {
            this.addDisposer(disposer);
          }
        } catch (error) {
          if (this._errorEffect) {
            try {
              this._errorEffect(error, this);
            } catch (handlerError) {
              // If error handler itself throws, propagate the original error
              if (this._parent) {
                this._parent.handleError(handlerError);
              } else {
                throw handlerError;
              }
            }
          } else {
            // No error handler, propagate error up the owner chain
            if (this._parent) {
              this._parent.handleError(error);
            } else {
              throw error;
            }
          }
        }
      } else {
        // Reset the flag
        this._skipEffectFunction = false;
      }

      // Mark that this effect has run at least once
      this._hasRun = true;

      if (false && __DEV__) {
        console.log(
          `[EFFECT RUN] Effect ${
            this._name || "unnamed"
          } completed successfully`
        );
      }

      // Process any deferred effects that were created during this effect's execution
      if (deferredEffects.length > 0) {
        if (false && __DEV__) {
          console.log(
            `[EFFECT RUN] Processing ${deferredEffects.length} deferred effects`
          );
        }

        const effectsToRun = deferredEffects.slice();
        deferredEffects = [];

        for (const deferredEffect of effectsToRun) {
          try {
            if (deferredEffect._state >= STATE_DIRTY) {
              deferredEffect._runEffect();
            }
          } catch (error) {
            if (__DEV__) {
              console.error(
                `Error running deferred effect ${
                  deferredEffect._name || "unnamed"
                }:`,
                error
              );
            }
          }
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`Error in effect ${this._name || "unnamed"}:`, error);
      }
      throw error;
    } finally {
      // Always restore the previous context
      isInsideEffectExecution = wasInsideEffectExecution;
      deferredEffects = prevDeferredEffects;
    }
  }

  /**
   * # _disposeNode
   * @summary #### Disposes the effect and cleans up all resources.
   *
   * This method extends the base disposal logic to also clean up effect-specific
   * resources like disposer functions and removes the effect from any scheduler queues.
   *
   * @override
   */
  override _disposeNode(): void {
    if (false && __DEV__) {
      console.log(
        `[EFFECT DISPOSE] Disposing effect ${this._name || "unnamed"}`
      );
    }

    // Clean up any pending disposers
    this.emptyDisposal();

    // Call parent disposal logic
    super._disposeNode();
  }
}

/**
 * # EagerComputationClass
 * @summary #### A specialized computation that eagerly evaluates its source
 *
 * EagerComputationClass is used for advanced reactive patterns where you need
 * immediate evaluation of dependencies rather than lazy evaluation.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Effect
 * @class
 * @access private
 *
 * @augments EffectClass
 */
export class EagerComputationClass<T> extends EffectClass {
  _nextSourceTime = -1;
  override _value: T | undefined = undefined;
  _prevSource: ComputationClass<T> | undefined = undefined;
  _defer: boolean;

  /**
   * # Constructor
   * @summary #### Creates a new eager computation
   */
  constructor(
    initialValue: T | undefined,
    fn: (prev: ComputationClass<T> | undefined) => ComputationClass<T>,
    options?: SignalOptionsType<T> & { defer?: boolean }
  ) {
    const runEffect = function (this: EagerComputationClass<T>) {
      const prevSource = this._prevSource;
      const nextSource = fn(prevSource);

      if (nextSource !== prevSource) {
        this._prevSource = nextSource;
        this._nextSourceTime = nextSource._time;
        this._value = nextSource._value;
      } else if (nextSource._time > this._nextSourceTime) {
        this._nextSourceTime = nextSource._time;
        this._value = nextSource._value;
      }
    };

    super(initialValue, () => {}, runEffect, undefined, options);
    this._defer = options?.defer ?? false;
  }

  override _notify(state: number, skipQueue?: boolean) {
    if (this._defer) {
      super._notify(state, skipQueue);
    } else {
      // Eager evaluation - run immediately
      if (this._state < state) {
        this._state = state;
        if (state === STATE_DIRTY) {
          this._runEffect();
        }
      }
    }
  }

  override _runEffect() {
    try {
      const prevSource = this._prevSource;

      // Get the new source by running the function
      const newSource = (this._fn as any)(prevSource);

      if (newSource !== prevSource) {
        this._prevSource = newSource;
        this._nextSourceTime = newSource._time;
        this._value = newSource._value;
      } else if (newSource._time > this._nextSourceTime) {
        this._nextSourceTime = newSource._time;
        this._value = newSource._value;
      }

      this._state = STATE_CLEAN;
      this._hasRun = true;
    } catch (error) {
      this._setError(error);
    }
  }

  override read() {
    if (this._prevSource) {
      track(this._prevSource);
    }
    return this._value!;
  }

  override wait() {
    if (this._prevSource) {
      this._prevSource.wait();
    }
    return this.read();
  }

  override loading() {
    if (this._prevSource) {
      return this._prevSource.loading();
    }
    return false;
  }
}

/**
 * # EffectErrorClass
 * @summary #### Specialized error class for effect execution errors
 *
 * Provides enhanced error information specific to effect failures,
 * including context about which effect failed and why.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Effect
 * @class
 * @access private
 *
 * @augments Error
 */
export class EffectErrorClass extends Error {
  /**
   * The underlying cause of the effect error
   */
  override cause: unknown;

  /**
   * # Constructor
   * @summary #### Creates a new effect error with context
   */
  constructor(effect: Function, cause: unknown) {
    const message = `Error in effect${
      effect.name ? ` "${effect.name}"` : ""
    }: ${cause instanceof Error ? cause.message : String(cause)}`;

    super(message);
    this.name = "EffectErrorClass";
    this.cause = cause;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EffectErrorClass);
    }
  }
}

/**
 * # ProjectionComputation
 * @summary #### Specialized computation for projecting values
 *
 * Used internally for advanced reactive patterns that need
 * to project or transform reactive values.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Effect
 * @class
 * @access private
 *
 * @augments ComputationClass
 */
export class ProjectionComputation extends ComputationClass {
  /**
   * # Constructor
   * @summary #### Creates a new projection computation
   */
  constructor(compute: () => void) {
    super(undefined, compute as any);
    // Set appropriate handler mask for projections
    this._handlerMask = ERROR_BIT | LOADING_BIT;
  }

  /**
   * # _notify
   * @summary #### Specialized notification handling for projections
   */
  override _notify(state: number, skipQueue?: boolean): void {
    // Projections use specialized notification logic
    if (this._state >= state) return;

    this._state = state;

    if (state === STATE_DIRTY && !skipQueue) {
      // Enqueue in the pure computation queue
      this._queue.enqueue(0, this);
    }

    // Notify observers
    if (this._observers) {
      for (let i = 0; i < this._observers.length; i++) {
        this._observers[i]._notify(STATE_CHECK, skipQueue);
      }
    }
  }
}
