/**
 * Owner tracking is used to enable nested tracking scopes with automatic cleanup.
 * We also use owners to also keep track of which error handling context we are in.
 *
 * If you write the following
 *
 *   const a = createOwner(() => {
 *     const b = createOwner(() => {});
 *
 *     const c = createOwner(() => {
 *       const d = createOwner(() => {});
 *     });
 *
 *     const e = createOwner(() => {});
 *   });
 *
 * The owner tree will look like this:
 *
 *    a
 *   /|\
 *  b-c-e
 *    |
 *    d
 *
 * Following the _nextSibling pointers of each owner will first give you its children, and then its siblings (in reverse).
 * a -> e -> c -> d -> b
 *
 * Note that the owner tree is largely orthogonal to the reactivity tree, and is much closer to the component tree.
 */

import { STATE_CLEAN, STATE_DISPOSED } from "./constants.ts";
import type { ComputationClass } from "./core.ts";
import {
  ContextNotFoundErrorClass,
  NoOwnerErrorClass,
  ErrorHandlerType,
} from "./error.ts";
import { globalQueue, type IQueueType } from "./scheduler.ts";
import { isUndefined } from "./utils.ts";

export type ContextRecordType = Record<string | symbol, unknown>;

export interface DisposableType {
  (): void;
}

let currentOwner: OwnerClass | null = null,
  defaultContext = {};

/**
 * Returns the currently executing parent owner.
 */
export function getOwner(): OwnerClass | null {
  return currentOwner;
}

export function setOwner(owner: OwnerClass | null): OwnerClass | null {
  const out = currentOwner;
  if (false && __DEV__ && currentOwner !== owner) {
    console.log(
      `[SET OWNER] Changing currentOwner from ${
        currentOwner ? "exists" : "null"
      } to ${owner ? "exists" : "null"}`
    );
  }
  currentOwner = owner;
  return out;
}

export class OwnerClass {
  // We flatten the owner tree into a linked list so that we don't need a pointer to .firstChild
  // However, the children are actually added in reverse creation order
  // See comment at the top of the file for an example of the _nextSibling traversal
  _parent: OwnerClass | null = null;
  _nextSibling: OwnerClass | null = null;
  _prevSibling: OwnerClass | null = null;

  _state: number = STATE_CLEAN;

  _disposal: DisposableType | DisposableType[] | null = null;
  _context: ContextRecordType = defaultContext;
  _handlers: ErrorHandlerType[] | null = null;
  _queue: IQueueType = globalQueue;

  constructor(signal = false) {
    if (false && __DEV__) {
      console.log(
        `[OWNER CONSTRUCTOR] Creating owner, currentOwner: ${
          currentOwner ? "exists" : "null"
        }, signal: ${signal}, will append: ${!!(currentOwner && !signal)}`
      );
    }
    if (currentOwner && !signal) currentOwner.append(this);
  }

  append(child: OwnerClass): void {
    child._parent = this;
    child._prevSibling = this;

    if (this._nextSibling) this._nextSibling._prevSibling = child;
    child._nextSibling = this._nextSibling;
    this._nextSibling = child;

    if (child._context !== this._context) {
      child._context = { ...this._context, ...child._context };
    }

    if (this._handlers) {
      child._handlers = !child._handlers
        ? this._handlers
        : [...child._handlers, ...this._handlers];
    }

    if (this._queue) child._queue = this._queue;
  }

  dispose(this: OwnerClass, self = true): void {
    if (this._state === STATE_DISPOSED) return;

    if (false && __DEV__) {
      console.log(
        `[DISPOSE] 🗑️ Disposing owner ${
          (this as any)._name || "unnamed"
        }, self=${self}, children: ${
          this._nextSibling ? "has children" : "no children"
        }`
      );
    }

    let head = self ? this._prevSibling || this._parent : this,
      current = this._nextSibling,
      next: ComputationClass | null = null;

    // Debug log the children found
    if (false && __DEV__) {
      let childCount = 0;
      let childCurrent = this._nextSibling;
      while (childCurrent && childCurrent._parent === this) {
        console.log(
          `[DISPOSE] 👶 Found child #${childCount}: ${
            (childCurrent as any)._name || "unnamed"
          }, state: ${childCurrent._state}`
        );
        childCount++;
        childCurrent = childCurrent._nextSibling as ComputationClass | null;
      }
      console.log(`[DISPOSE] 📊 Total children to dispose: ${childCount}`);
    }

    while (current && current._parent === this) {
      if (false && __DEV__) {
        console.log(
          `[DISPOSE] 🗑️ Disposing child: ${(current as any)._name || "unnamed"}`
        );
      }
      current.dispose(true);
      current._disposeNode();
      next = current._nextSibling as ComputationClass | null;
      current._nextSibling = null;
      current = next;
    }

    if (self) this._disposeNode();
    if (current) current._prevSibling = !self ? this : this._prevSibling;
    if (head) head._nextSibling = current;
  }

  _disposeNode(): void {
    if (false && __DEV__) {
      console.log(
        `[DISPOSE NODE] 💀 Setting state to DISPOSED for ${
          (this as any)._name || "unnamed"
        }`
      );
    }
    if (this._prevSibling) this._prevSibling._nextSibling = null;
    this._parent = null;
    this._prevSibling = null;
    this._context = defaultContext;
    this._handlers = null;
    this._state = STATE_DISPOSED;
    this.emptyDisposal();
  }

  emptyDisposal(): void {
    if (!this._disposal) return;

    if (Array.isArray(this._disposal)) {
      for (let i = 0; i < this._disposal.length; i++) {
        const callable = this._disposal[i];
        callable.call(callable);
      }
    } else {
      this._disposal.call(this._disposal);
    }

    this._disposal = null;
  }

  handleError(error: unknown): void {
    if (!this._handlers) throw error;

    let i = 0,
      len = this._handlers.length;

    for (i = 0; i < len; i++) {
      try {
        this._handlers[i](error, this);
        break; // error was handled.
      } catch (e) {
        error = e;
      }
    }

    // Error was not handled as we exhausted all handlers.
    if (i === len) throw error;
  }
}

export interface ContextType<T> {
  readonly id: symbol;
  readonly defaultValue: T | undefined;
}

/**
 * Context provides a form of dependency injection. It is used to save from needing to pass
 * data as props through intermediate components. This function creates a new context object
 * that can be used with `getContext` and `setContext`.
 *
 * A default value can be provided here which will be used when a specific value is not provided
 * via a `setContext` call.
 */
export function createContext<T>(
  defaultValue?: T,
  description?: string
): ContextType<T> {
  return { id: Symbol(description), defaultValue };
}

/**
 * Attempts to get a context value for the given key.
 *
 * @throws `NoOwnerError` if there's no owner at the time of call.
 * @throws `ContextNotFoundError` if a context value has not been set yet.
 */
export function getContext<T>(
  context: ContextType<T>,
  owner: OwnerClass | null = currentOwner
): T {
  if (!owner) {
    const contextDetails =
      __DEV__ && context.id.description
        ? `context "${context.id.description}"`
        : "context";
    throw new NoOwnerErrorClass(
      `No owner found when trying to get ${contextDetails}. Ensure getContext is called within a reactive scope (e.g., createRoot, createSignal, createMemo, createEffect).`
    );
  }

  const value = hasContext(context, owner)
    ? (owner._context[context.id] as T)
    : context.defaultValue;

  if (isUndefined(value)) {
    const contextDetails =
      __DEV__ && context.id.description
        ? `Context "${context.id.description}"`
        : "Context";
    throw new ContextNotFoundErrorClass(
      `${contextDetails} not found. Ensure a value was set via setContext in an ancestor scope.`
    );
  }

  return value;
}

/**
 * Attempts to set a context value on the parent scope with the given key.
 *
 * @throws `NoOwnerError` if there's no owner at the time of call.
 */
export function setContext<T>(
  context: ContextType<T>,
  value?: T,
  owner: OwnerClass | null = currentOwner
) {
  if (!owner) {
    const contextDetails =
      __DEV__ && context.id.description
        ? `context "${context.id.description}"`
        : "context";
    throw new NoOwnerErrorClass(
      `No owner found when trying to set ${contextDetails}. Ensure setContext is called within a reactive scope.`
    );
  }

  // We're creating a new object to avoid child context values being exposed to parent owners. If
  // we don't do this, everything will be a singleton and all hell will break lose.
  owner._context = {
    ...owner._context,
    [context.id]: isUndefined(value) ? context.defaultValue : value,
  };
}

/**
 * Whether the given context is currently defined.
 */
export function hasContext(
  context: ContextType<any>,
  owner: OwnerClass | null = currentOwner
): boolean {
  return !isUndefined(owner?._context[context.id]);
}

/**
 * Runs an effect once before the reactive scope is disposed
 * @param fn an effect that should run only once on cleanup
 *
 * @returns the same {@link fn} function that was passed in
 * */
export function onCleanup(fn: DisposableType): DisposableType {
  if (!currentOwner) return fn;

  const node = currentOwner;

  if (!node._disposal) {
    node._disposal = fn;
  } else if (Array.isArray(node._disposal)) {
    node._disposal.push(fn);
  } else {
    node._disposal = [node._disposal, fn];
  }
  return fn;
}
