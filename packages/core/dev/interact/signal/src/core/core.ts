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
  STATE_CHECK,
  STATE_CLEAN,
  STATE_DIRTY,
  STATE_DISPOSED,
} from "./constants.ts";
import { NotReadyErrorClass } from "./error.ts";
import {
  DEFAULT_FLAGS,
  ERROR_BIT,
  LOADING_BIT,
  UNINITIALIZED_BIT,
  type FlagsType,
} from "./flags.ts";
import { getOwner, OwnerClass, setOwner } from "./owner.ts";
import { getClock, type IQueueType } from "./scheduler.ts";

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
  updateCheck: null | { _value: boolean, _forHasUpdated?: boolean, _sources?: Set<any>, _latestSource?: any } = null,
  staleCheck: null | { _value: boolean } = null;

/**
 * Returns the current observer.
 */
export function getObserver(): ComputationClass | null {
  return currentObserver as ComputationClass | null;
}

export const UNCHANGED: unique symbol = Symbol("unchanged");
export type UNCHANGED = typeof UNCHANGED;

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

  _read(): T {
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
      return this._value!;
    }
  }

  /**
   * Return the current value of this computation
   * Automatically re-executes the surrounding computation when the value changes
   */
  read(): T {
    return this._read();
  }

  /**
   * Return the current value of this computation
   * Automatically re-executes the surrounding computation when the value changes
   *
   * If the computation has any unresolved ancestors, this function waits for the value to resolve
   * before continuing
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

  /** Update the computation with a new value. */
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
      for (let i = 0; i < this._observers.length; i++) {
        if (valueChanged) {
          this._observers[i]._notify(STATE_DIRTY);
        } else if (changedFlagsMask) {
          this._observers[i]._notifyFlags(changedFlagsMask, changedFlags);
        }
      }
    }

    // We return the value so that .write can be used in an expression
    // (although it is not usually recommended)
    return this._value!;
  }

  /**
   * Set the current node's state, and recursively mark all of this node's observers as STATE_CHECK
   */
  _notify(state: number, skipQueue?: boolean): void {
    // If the state is already STATE_DIRTY and we are trying to set it to STATE_CHECK,
    // then we don't need to do anything. Similarly, if the state is already STATE_CHECK
    // and we are trying to set it to STATE_CHECK, then we don't need to do anything because
    // a previous _notify call has already set this state and all observers as STATE_CHECK
    if (this._state >= state && !this._forceNotify) return;

    this._forceNotify = !!skipQueue;
    this._state = state;

    if (this._observers) {
      for (let i = 0; i < this._observers.length; i++) {
        this._observers[i]._notify(STATE_CHECK, skipQueue);
      }
    }
  }

  /**
   * Notify the computation that one of its sources has changed flags.
   *
   * @param mask A bitmask for which flag(s) were changed.
   * @param newFlags The source's new flags, masked to just the changed ones.
   */
  _notifyFlags(mask: FlagsType, newFlags: FlagsType): void {
    // If we're dirty, none of the things we do can matter.
    if (this._state >= STATE_DIRTY) return;

    // If the changed flags have side effects attached, we have to re-run.
    if (mask & this._handlerMask) {
      this._notify(STATE_DIRTY);
      return;
    }

    // If we're already check, we can delay this propagation until we check.
    if (this._state >= STATE_CHECK) return;

    // If we're clean, and none of these flags have a handler, we can try to
    // propagate them.
    const prevFlags = this._stateFlags & mask;
    const deltaFlags = prevFlags ^ newFlags;

    if (newFlags === prevFlags) {
      // No work to do if the flags are unchanged.
    } else if (deltaFlags & prevFlags & mask) {
      // One of the changed flags was previously _on_, so we can't eagerly
      // propagate anything; we'll wait until we're checked.
      this._notify(STATE_CHECK);
    } else {
      // The changed flags were previously _off_, which means we can remain
      // clean with updated flags and pass this notification on transitively.
      this._stateFlags ^= deltaFlags;
      if (this._observers) {
        for (let i = 0; i < this._observers.length; i++) {
          this._observers[i]._notifyFlags(mask, newFlags);
        }
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
    // If the user tries to read a computation that has been disposed, we throw an error, because
    // they probably kept a reference to it as the parent reran, so there is likely a new computation
    // with the same _compute function that they should be reading instead.
    if (this._state === STATE_DISPOSED) {
      const errorMsg =
        __DEV__ && this._name
          ? `Tried to read disposed computation "${this._name}"`
          : "Tried to read a disposed computation";
      throw new Error(errorMsg);
    }

    // If the computation is already clean, none of our sources have changed, so we know that
    // our value and stateFlags are up to date, and we can just return.
    if (this._state === STATE_CLEAN) {
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

    // Unlink ourselves from our sources' observers array so that we can be garbage collected
    // This removes us from the computation graph
    if (this._sources) removeSourceObservers(this, 0);

    // Remove ourselves from the ownership tree as well
    super._disposeNode();
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
  if (currentObserver) {
    if (
      !newSources &&
      currentObserver._sources &&
      currentObserver._sources[newSourcesIndex] === computation
    ) {
      newSourcesIndex++;
    } else if (!newSources) newSources = [computation];
    else if (computation !== newSources[newSources.length - 1]) {
      // If the computation is the same as the last source we read, we don't need to add it to newSources
      newSources.push(computation);
    }
    // Special handling for the updateCheck value which is used by hasUpdated
    if (updateCheck) {
      // For hasUpdated tracking, we need special logic to track individual signal updates
      if (updateCheck._forHasUpdated && updateCheck._sources) {
        // Record this signal as one we've seen during this hasUpdated call
        updateCheck._sources.add(computation);
        
        // Check if this specific signal has been updated since last computation
        // We're checking if this signal has a timestamp newer than the observer
        const hasChanged = computation._time > currentObserver._time;
        
        // Set the updateCheck value to true if this signal has changed
        if (hasChanged) {
          updateCheck._value = true;
          // Store which signal triggered the update - this is essential for the "should detect which signal triggered it" test
          updateCheck._latestSource = computation;
        }
      } else {
        // Standard update check logic for normal computations
        // Mark as updated if this computation is newer than the observer
        const hasChanged = computation._time > currentObserver._time;
        if (hasChanged) {
          updateCheck._value = true;
          // Even in non-hasUpdated contexts, track the source for potential future hasUpdated checks
          updateCheck._latestSource = computation;
        }
      }
    }
  }
}

/**
 * Reruns a computation's _compute function, producing a new value and keeping track of dependencies.
 *
 * It handles the updating of sources and observers, disposal of previous executions,
 * and error handling if the _compute function throws. It also sets the node as loading
 * if it reads any parents that are currently loading.
 */
export function update<T>(node: ComputationClass<T>): void {
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
  } catch (error) {
    if (error instanceof NotReadyErrorClass) {
      node.write(
        UNCHANGED,
        newFlags | LOADING_BIT | (node._stateFlags & UNINITIALIZED_BIT)
      );
    } else {
      node._setError(error);
    }
  } finally {
    if (newSources) {
      // If there are new sources, that means the end of the sources array has changed
      // newSourcesIndex keeps track of the index of the first new source
      // See track() above for more info

      // We need to remove any old sources after newSourcesIndex
      if (node._sources) removeSourceObservers(node, newSourcesIndex);

      // First we update our own sources array (uplinks)
      if (node._sources && newSourcesIndex > 0) {
        // If we shared some sources with the previous execution, we need to copy those over to the
        // new sources array

        // First we need to make sure the sources array is long enough to hold all the new sources
        node._sources.length = newSourcesIndex + newSources.length;

        // Then we copy the new sources over
        for (let i = 0; i < newSources.length; i++) {
          node._sources[newSourcesIndex + i] = newSources[i];
        }
      } else {
        // If we didn't share any sources with the previous execution, set the sources array to newSources
        node._sources = newSources;
      }

      // For each new source, we need to add this `node` to the source's observers array (downlinks)
      let source: SourceNodeType;
      for (let i = newSourcesIndex; i < node._sources.length; i++) {
        source = node._sources[i];
        if (!source._observers) source._observers = [node];
        else source._observers.push(node);
      }
    } else if (node._sources && newSourcesIndex < node._sources.length) {
      // If there are no new sources, but the sources array is longer than newSourcesIndex,
      // that means the sources array has just shrunk so we remove the tail end
      removeSourceObservers(node, newSourcesIndex);
      node._sources.length = newSourcesIndex;
    }

    // Reset global context after computation
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
 * Returns the current value stored inside the given compute function without triggering any
 * dependencies. Use `untrack` if you want to also disable owner tracking.
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
    _latestSource: null // Track the most recently updated source
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
  return (computation._observers?.slice() as ComputationClass[]) || [];
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
