import { STATE_DIRTY } from "./core/constants.ts";
import { EagerComputationClass, EffectClass } from "./core/effect.ts";
import type { SignalOptionsType } from "./core/index.ts";
import {
  ComputationClass,
  compute,
  ERROR_BIT,
  flatten,
  getClock,
  incrementClock,
  LOADING_BIT,
  NotReadyErrorClass,
  onCleanup,
  OwnerClass,
  UNCHANGED,
  UNINITIALIZED_BIT,
  untrack,
  getObserver,
  isEqual,
} from "./core/index.ts";
import { $TRACK } from "./store/index.ts";
import { batch, globalQueue } from "./core/scheduler.ts";

// Import scheduled from scheduler for flushSync
import {
  globalQueue as queue,
  flushSync as baseFlushSync,
} from "./core/scheduler.ts";

// Renamed Types
export type AccessorType<T> = () => T;

export type SetterType<in out T> = {
  <U extends T>(
    ...args: undefined extends T
      ? []
      : [value: Exclude<U, Function> | ((prev: T) => U)]
  ): undefined extends T ? undefined : U;
  <U extends T>(value: (prev: T) => U): U;
  <U extends T>(value: Exclude<U, Function>): U;
  <U extends T>(value: Exclude<U, Function> | ((prev: T) => U)): U;
};

export type SignalType<T> = [get: AccessorType<T>, set: SetterType<T>];

export type ComputeFunctionType<Prev, Next extends Prev = Prev> = (
  v: Prev
) => Next;
export type EffectFunctionType<Prev, Next extends Prev = Prev> = (
  v: Next,
  p?: Prev
) => (() => void) | void;

export interface EffectOptionsType {
  name?: string;
  defer?: boolean;
}
export interface MemoOptionsType<T> {
  name?: string;
  equals?: false | ((prev: T, next: T) => boolean);
}

// Magic type that when used at sites where generic types are inferred from, will prevent those sites from being involved in the inference.
// https://github.com/microsoft/TypeScript/issues/14829
// TypeScript Discord conversation: https://discord.com/channels/508357248330760243/508357248330760249/911266491024949328
export type NoInferType<T extends any> = [T][T extends any ? 0 : never];

/**
 * Creates a simple reactive state with a getter and setter
 * ```typescript
 * const [state: AccessorType<T>, setState: SetterType<T>] = createSignal<T>(
 *  value: T,
 *  options?: { name?: string, equals?: false | ((prev: T, next: T) => boolean) }
 * )
 * ```
 * @param value initial value of the state; if empty, the state's type will automatically extended with undefined; otherwise you need to extend the type manually if you want setting to undefined not be an error
 * @param options optional object with a name for debugging purposes and equals, a comparator function for the previous and next value to allow fine-grained control over the reactivity
 *
 * @returns ```typescript
 * [state: AccessorType<T>, setState: SetterType<T>]
 * ```
 * * the Accessor is a function that returns the current value and registers each call to the reactive root
 * * the Setter is a function that allows directly setting or mutating the value:
 * ```typescript
 * const [count, setCount] = createSignal(0);
 * setCount(count => count + 1);
 * ```
 *
 */
export function createSignal<T>(): SignalType<T | undefined>;
export function createSignal<T>(
  value: Exclude<T, Function>,
  options?: SignalOptionsType<T>
): SignalType<T>;
export function createSignal<T>(
  fn: ComputeFunctionType<T>,
  initialValue?: T,
  options?: SignalOptionsType<T>
): SignalType<T>;
export function createSignal<T>(
  first?: T | ComputeFunctionType<T>,
  second?: T | SignalOptionsType<T>,
  third?: SignalOptionsType<T>
): SignalType<T | undefined> {
  if (typeof first === "function") {
    const memo = createMemo<SignalType<T>>((p) => {
      const node = new ComputationClass<T>(
        (first as (prev?: T) => T)(p ? untrack(p[0]) : (second as T)),
        null,
        third
      );
      const getter = node.read.bind(node);
      const setter = node.write.bind(node) as SetterType<T>;

      // Expose value property for interop with store
      Object.defineProperty(getter, "value", {
        get: () => node._value,
        enumerable: true,
        configurable: true,
      });

      return [getter, setter];
    });

    // Create the outer signal accessor and setter
    const outerGetter = () => memo()[0]();
    const outerSetter = ((value) => memo()[1](value)) as SetterType<
      T | undefined
    >;

    // Make value property available on the getter for external access
    Object.defineProperty(outerGetter, "value", {
      get: () => untrack(outerGetter),
      enumerable: true,
      configurable: true,
    });

    return [outerGetter, outerSetter];
  }

  const node = new ComputationClass(
    first,
    null,
    second as SignalOptionsType<T>
  );

  // Create main getter and setter functions
  const getter = node.read.bind(node);
  const setter = node.write.bind(node) as SetterType<T | undefined>;

  // Make the getter function have a "value" property for direct access
  Object.defineProperty(getter, "value", {
    get: () => node._value,
    enumerable: true,
    configurable: true,
  });

  return [getter, setter];
}

/**
 * Creates a readonly derived reactive memoized signal
 * ```typescript
 * export function createMemo<T>(
 *   compute: (v: T) => T,
 *   value?: T,
 *   options?: { name?: string, equals?: false | ((prev: T, next: T) => boolean) }
 * ): () => T;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes and use a custom comparison function in equals
 *
 */
// The extra Prev generic parameter separates inference of the compute input
// parameter type from inference of the compute return type, so that the effect
// return type is always used as the memo Accessor's return type.
export function createMemo<Next extends Prev, Prev = Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Prev>, Next>
): AccessorType<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  compute: ComputeFunctionType<Init | Prev, Next>,
  value: Init,
  options?: MemoOptionsType<Next>
): AccessorType<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  compute: ComputeFunctionType<Init | Prev, Next>,
  value?: Init,
  options?: MemoOptionsType<Next>
): AccessorType<Next> {
  let node: ComputationClass<Next> | undefined = new ComputationClass<Next>(
    value as any,
    compute as any,
    options
  );
  let resolvedValue: Next;
  return () => {
    if (node) {
      resolvedValue = node.wait();
      // no sources so will never update so can be disposed.
      // additionally didn't create nested reactivity so can be disposed.
      if (!node._sources?.length && node._nextSibling?._parent !== node) {
        node.dispose();
        node = undefined;
      }
      // not owned and not listened to so can be garbage collected if reference lost.
      else if (!node._parent && !node._observers?.length) {
        node.dispose();
        node._state = STATE_DIRTY;
      }
    }
    return resolvedValue;
  };
}

/**
 * Creates a readonly derived async reactive memoized signal
 * ```typescript
 * export function createAsync<T>(
 *   compute: (v: T) => Promise<T> | T,
 *   value?: T,
 *   options?: { name?: string, equals?: false | ((prev: T, next: T) => boolean) }
 * ): () => T;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes and use a custom comparison function in equals
 *
 */
export function createAsync<T>(
  compute: (prev?: T) => Promise<T> | AsyncIterable<T> | T,
  value?: T,
  options?: MemoOptionsType<T>
): AccessorType<T> {
  let uninitialized = value === undefined;
  const lhs = new EagerComputationClass(
    {
      _value: value,
    } as any,
    (p?: ComputationClass<T>) => {
      const value = p?._value;
      const source = compute(value);
      const isPromise = source instanceof Promise;
      const iterator =
        typeof source === "object" &&
        source !== null &&
        (source as any)[Symbol.asyncIterator];
      if (!isPromise && !iterator) {
        // Return a proper ComputationClass instance instead of a simple object
        return new ComputationClass(source as T, null, options);
      }
      const signal = new ComputationClass(value, null, options);
      const w = signal.wait;
      signal.wait = function () {
        if (signal._stateFlags & ERROR_BIT && signal._time <= getClock()) {
          lhs._notify(STATE_DIRTY);
          throw new NotReadyErrorClass();
        }
        return w.call(this);
      };
      signal.write(
        UNCHANGED,
        LOADING_BIT | (uninitialized ? UNINITIALIZED_BIT : 0)
      );
      if (isPromise) {
        source.then(
          (value) => {
            uninitialized = false;
            signal.write(value, 0, true);
          },
          (error) => {
            uninitialized = true;
            signal._setError(error);
          }
        );
      } else {
        let abort = false;
        onCleanup(() => (abort = true));
        (async () => {
          try {
            for await (let value of source as AsyncIterable<T>) {
              if (abort) return;
              signal.write(value, 0, true);
            }
          } catch (error: any) {
            signal.write(error, ERROR_BIT);
          }
        })();
      }
      return signal;
    }
  );
  return () => lhs.wait().wait();
}

/**
 * Creates a reactive effect that runs after the render phase
 * ```typescript
 * export function createEffect<T>(
 *   compute: (prev: T) => T,
 *   effect: (v: T, prev: T) => (() => void) | void,
 *   value?: T,
 *   options?: { name?: string }
 * ): void;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param effect a function that receives the new value and is used to perform side effects, return a cleanup function to run on disposal
 * @param error an optional function that receives an error if thrown during the computation
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes
 *
 */
export function createEffect<Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Next>, Next>,
  effect?: EffectFunctionType<NoInferType<Next>, Next>,
  error?: (err: unknown) => void
): void;
export function createEffect<Next, Init = Next>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect?: EffectFunctionType<Next, Next>,
  error?: (err: unknown) => void,
  value?: Init,
  options?: EffectOptionsType
): void;
export function createEffect<Next, Init>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect?: EffectFunctionType<Next, Next>,
  error?: (err: unknown) => void,
  value?: Init,
  options?: EffectOptionsType
): void {
  // Special handling for signal-like objects
  if (
    typeof compute === "function" &&
    !effect &&
    typeof (compute as any).read !== "function" &&
    arguments.length === 2
  ) {
    // This is the case where compute is a signal and effect is the handler
    const signalGetter = compute;
    const handler = error as EffectFunctionType<Next, Next>;

    // Create an effect that reads the signal and calls the handler
    const effectFn = () => {
      // Read the signal and ensure dependencies are tracked
      const value = untrack(() => (signalGetter as Function)());
      // Return the value to be passed to the handler
      return value;
    };

    // Now create the real effect
    void new EffectClass(
      value as any,
      effectFn as any,
      handler,
      undefined,
      __DEV__ ? { ...options, name: options?.name ?? "effect" } : options
    );
    return;
  }

  // Handle the case where only compute function is provided
  const effectHandler = effect === undefined ? () => {} : effect;

  // Create the effect instance and run it
  void new EffectClass(
    value as any,
    compute as any,
    effectHandler,
    error,
    __DEV__ ? { ...options, name: options?.name ?? "effect" } : options
  );
}

/**
 * Creates a reactive computation that runs during the render phase as DOM elements are created and updated but not necessarily connected
 * ```typescript
 * export function createRenderEffect<T>(
 *   compute: (prev: T) => T,
 *   effect: (v: T, prev: T) => (() => void) | void,
 *   value?: T,
 *   options?: { name?: string }
 * ): void;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param effect a function that receives the new value and is used to perform side effects
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes
 *
 */
export function createRenderEffect<Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Next>, Next>,
  effect: EffectFunctionType<NoInferType<Next>, Next>
): void;
export function createRenderEffect<Next, Init = Next>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect: EffectFunctionType<Next, Next>,
  value: Init,
  options?: EffectOptionsType
): void;
export function createRenderEffect<Next, Init>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect: EffectFunctionType<Next, Next>,
  value?: Init,
  options?: EffectOptionsType
): void {
  void new EffectClass(value as any, compute as any, effect, undefined, {
    render: true,
    ...(__DEV__ ? { ...options, name: options?.name ?? "effect" } : options),
  });
}

/**
 * Creates a new non-tracked reactive context with manual disposal
 *
 * @param fn a function in which the reactive state is scoped
 * @returns the output of `fn`.
 *
 */
export function createRoot<T>(
  init: ((dispose: () => void) => T) | (() => T)
): T {
  const owner = new OwnerClass();
  return compute(
    owner,
    !init.length ? (init as () => T) : () => init(() => owner.dispose()),
    null
  );
}

/**
 * Runs the given function in the given owner to move ownership of nested primitives and cleanups.
 * This method untracks the current scope.
 *
 * Warning: Usually there are simpler ways of modeling a problem that avoid using this function
 */
export function runWithOwner<T>(owner: OwnerClass | null, run: () => T): T {
  return compute(owner, run, null);
}

/**
 * Switches to fallback whenever an error is thrown within the context of the child scopes
 * @param fn boundary for the error
 * @param fallback an error handler that receives the error
 *
 * * If the error is thrown again inside the error handler, it will trigger the next available parent handler
 *
 */
export function createErrorBoundary<T, U>(
  fn: () => T,
  fallback: (error: unknown, reset: () => void) => U
): AccessorType<T | U> {
  const owner = new OwnerClass();
  const error = new ComputationClass<{ _error: any } | undefined>(
    undefined,
    null
  );
  const nodes = new Set<OwnerClass>();
  function handler(err: unknown, node: OwnerClass) {
    if (nodes.has(node)) return;
    compute(
      node,
      () =>
        onCleanup(() => {
          nodes.delete(node);
          if (!nodes.size) error.write(undefined);
        }),
      null
    );
    nodes.add(node);
    if (nodes.size === 1) error.write({ _error: err });
  }

  owner._handlers = [handler];
  const c = new ComputationClass<ComputationClass<undefined>>(undefined, () => {
    owner.dispose(false);
    owner.emptyDisposal();
    const result = compute(owner, fn, owner as any);
    return new ComputationClass<undefined>(result, null);
  });
  const f = new EagerComputationClass<ComputationClass<U>>(
    undefined,
    () => {
      const err = error.read();
      if (!err) return c as any;
      const reset = () => error.write(undefined);
      const result = fallback(err._error, reset);
      return new ComputationClass<U>(result, null);
    },
    {}
  );
  return () => f.wait().wait();
}

/**
 * Returns a promise of the resolved value of a reactive expression
 * @param fn a reactive expression to resolve
 */
export function resolve<T>(fn: () => T): Promise<T> {
  return new Promise((res, rej) => {
    createRoot((dispose) => {
      new EagerComputationClass(undefined, () => {
        try {
          res(fn());
        } catch (err) {
          if (err instanceof NotReadyErrorClass) throw err;
          rej(err);
        }
        dispose();
      });
    });
  });
}

// --- Start createResource ---

/** Input to fetcher function, signifying the fetch should occur. */
type ResourceSourceType<S> = S | false | null | undefined;

/** Function that performs the asynchronous fetching. */
type ResourceFetcherType<S, T> = (
  source: S,
  info: ResourceFetcherInfoType<T>
) => Promise<T> | T;

/** Function that performs the asynchronous fetching without a source. */
type InitialResourceFetcherType<T> = (
  info: ResourceFetcherInfoType<T>
) => Promise<T> | T;

/** Additional info passed to the fetcher function. */
export interface ResourceFetcherInfoType<T> {
  /** The current value of the resource data before fetching. */
  value: T | undefined;
  /** A method to refetch the resource. */
  refetching: boolean | unknown;
}

/** Options for `createResource`. */
export interface ResourceOptionsType<T, S = unknown> {
  /** Initial value of the resource while loading. */
  initialValue?: T;
  /** Name for debugging purposes. */
  name?: string;
  /** Custom storage for resource state (advanced). */
  storage?: (init: T | undefined) => SignalType<T | undefined>;
  /** Source signal for the fetcher. Fetcher runs when source is not null/undefined/false. */
  source?: AccessorType<ResourceSourceType<S>>;
  /** A function that returns the resource's value on the server. */
  ssrLoadFrom?: "initialValue";
  /** Optional defer function to prevent fetcher running immediately */
  deferStream?: boolean;
}

/** Reactive primitives returned by `createResource`. */
export interface ResourceType<T> {
  /** Reactive accessor for the latest resolved value. */
  (): T | undefined;
  /** Reactive accessor for the loading state. */
  loading: AccessorType<boolean>;
  /** Reactive accessor for the latest error. */
  error: AccessorType<any>;
  /** Trigger a refetch of the resource. */
  refetch: (info?: unknown) => Promise<T> | T | undefined | null;
  /** Mutate the resource value directly. */
  mutate: SetterType<T | undefined>;
  /** Reactive accessor for the latest resolved value (explicit property). */
  latest: AccessorType<T | undefined>;
}

// Internal state for resource
interface ResourceStateType<T> {
  loading: boolean;
  error: any;
  latest: T | undefined;
}

// Resource return type combines Accessor and properties
type ResourceReturnType<T> = AccessorType<T | undefined> & ResourceType<T>;

/**
 * Creates a reactive resource that handles asynchronous data fetching.
 *
 * @param fetcher - The function that fetches the data. It receives the source value (if provided) and previous value.
 * @param options - Resource options: initialValue, name, source, etc.
 * @returns A Resource object with reactive accessors for `loading`, `error`, the value, and `refetch`/`mutate` methods.
 *
 */
export function createResource<T, S = true>(
  fetcher: InitialResourceFetcherType<T>,
  options?: ResourceOptionsType<T, S>
): ResourceReturnType<T>;
export function createResource<T, S extends ResourceFetcherInfoType<T>>(
  source: AccessorType<ResourceSourceType<S>>,
  fetcher: ResourceFetcherType<S, T>,
  options?: ResourceOptionsType<T, S>
): ResourceReturnType<T>;
export function createResource<T, S>(
  sourceOrFetcher:
    | AccessorType<ResourceSourceType<S>>
    | InitialResourceFetcherType<T>,
  fetcherOrOptions?: ResourceFetcherType<S, T> | ResourceOptionsType<T, S>,
  optionsArg?: ResourceOptionsType<T, S>
): ResourceReturnType<T> {
  let source: AccessorType<ResourceSourceType<S>>;
  let fetcher: ResourceFetcherType<S, T> | InitialResourceFetcherType<T>;
  let options: ResourceOptionsType<T, S>;

  // Normalize arguments
  if (
    arguments.length === 2 &&
    typeof sourceOrFetcher === "function" &&
    typeof fetcherOrOptions === "object"
  ) {
    source = () => true as ResourceSourceType<S>;
    fetcher = sourceOrFetcher as InitialResourceFetcherType<T>;
    options = fetcherOrOptions as ResourceOptionsType<T, S>;
  } else if (
    arguments.length >= 2 &&
    typeof sourceOrFetcher === "function" &&
    typeof fetcherOrOptions === "function"
  ) {
    source = sourceOrFetcher as AccessorType<ResourceSourceType<S>>;
    fetcher = fetcherOrOptions as ResourceFetcherType<S, T>;
    options = optionsArg ?? ({} as ResourceOptionsType<T, S>);
  } else {
    source = () => true as ResourceSourceType<S>;
    fetcher = sourceOrFetcher as InitialResourceFetcherType<T>;
    options = {} as ResourceOptionsType<T, S>;
  }

  const [state, setState] = createSignal<ResourceStateType<T>>(
    {
      loading: false,
      error: undefined,
      latest: options.initialValue,
    },
    {
      equals: false,
      name: __DEV__ ? `${options.name ?? "resource"}_state` : undefined,
    }
  );

  const [trackVal, trigger] = createSignal(undefined, { equals: false });
  const [trackFetcher, triggerFetcher] = createSignal<
    InitialResourceFetcherType<T> | ResourceFetcherType<S, T>
  >(fetcher, { equals: false });
  const [sourceVal, setSourceVal] = createSignal<ResourceSourceType<S>>();
  const [mutatedValue, setMutatedValue] = createSignal<T | undefined>(
    undefined,
    { equals: false }
  );

  let loading = false;
  let errorVal: unknown;
  let explicitSource = !!options.source;
  let value = options.initialValue;
  let fetchCnt = 0;
  let modified = false;
  let loadedDeferred = false;
  let resolved = options.initialValue !== undefined;
  let requested = false;
  let currentPromise: Promise<T> | undefined = undefined;

  function load(refetchingInfo: boolean | unknown = false) {
    if (!modified && mutatedValue() !== undefined) return;
    const src = source();
    setSourceVal(() => src);
    if (src == null || src === false) {
      setState({
        loading: false,
        error: undefined,
        latest: options.initialValue,
      });
      value = options.initialValue;
      resolved = options.initialValue !== undefined;
      loading = false;
      errorVal = undefined;
      requested = false;
      currentPromise = undefined;
      trigger(undefined);
      return;
    }

    const currentFetcher = trackFetcher();
    fetchCnt++;
    const currentFetchCnt = fetchCnt;
    loading = true;
    errorVal = undefined;
    requested = true;
    const ref: ResourceFetcherInfoType<T> = {
      value,
      refetching: refetchingInfo,
    };
    modified = false;

    setState((prev) => ({
      latest: prev.latest,
      error: undefined,
      loading: true,
    }));
    trigger(undefined);

    const promise = Promise.resolve(currentFetcher(src as S, ref));
    currentPromise = promise;

    promise
      .then((res) => {
        if (fetchCnt === currentFetchCnt) {
          value = res;
          resolved = true;
          loading = false;
          errorVal = undefined;
          modified = false;
          setMutatedValue(undefined);
          setState({ latest: res, error: undefined, loading: false });
          currentPromise = undefined;
          trigger(undefined);
        }
      })
      .catch((err) => {
        if (fetchCnt === currentFetchCnt) {
          errorVal = err;
          resolved = false;
          loading = false;
          setState((prev) => ({
            latest: prev.latest,
            error: err,
            loading: false,
          }));
          currentPromise = undefined;
          trigger(undefined);
        }
      });
    return promise;
  }

  const resourceAccessor: AccessorType<T | undefined> = createMemo(
    () => {
      trackVal();
      if (modified) return mutatedValue();

      const currentActualSource = explicitSource ? source() : true;

      if (!resolved && !errorVal) {
        if (currentActualSource == null || currentActualSource === false) {
          throw new NotReadyErrorClass();
        } else if (!requested) {
          throw new NotReadyErrorClass();
        } else {
          throw new NotReadyErrorClass();
        }
      }
      if (errorVal && !state().error) {
        throw errorVal;
      }
      return state().latest;
    },
    undefined,
    { name: __DEV__ ? `${options.name ?? "resource"}_memo` : undefined }
  );

  createRenderEffect((prevSource) => {
    const currentSource = source();
    setSourceVal(() => currentSource);

    if (
      prevSource === undefined &&
      (currentSource == null || currentSource === false) &&
      !requested
    ) {
      return currentSource;
    }

    if (currentSource == null || currentSource === false) {
      setState({
        loading: false,
        error: undefined,
        latest: options.initialValue,
      });
      value = options.initialValue;
      resolved = options.initialValue !== undefined;
      loading = false;
      errorVal = undefined;
      modified = false;
      setMutatedValue(undefined);
      requested = false;
      currentPromise = undefined;
      trigger(undefined);
    } else if (prevSource !== currentSource || requested) {
      load();
    }
    return currentSource;
  });

  const refetch = (info?: unknown) => {
    const promise = load(info || true);
    return promise;
  };

  const mutate = (
    v: T | undefined | ((prev?: T) => T | undefined)
  ): T | undefined => {
    const val =
      typeof v === "function"
        ? (v as (prev?: T) => T | undefined)(state().latest)
        : v;
    modified = true;
    resolved = true;
    errorVal = undefined;
    loading = false;
    currentPromise = undefined;
    setMutatedValue(() => val);
    setState((prev) => ({ latest: val, error: undefined, loading: false }));
    trigger(undefined);
    return val;
  };

  const resourceReturn = resourceAccessor as ResourceReturnType<T>;
  resourceReturn.loading = createMemo(() => state().loading, undefined, {
    equals: false,
    name: __DEV__ ? `${options.name ?? "resource"}_loading` : undefined,
  });
  resourceReturn.error = createMemo(() => state().error, undefined, {
    equals: false,
    name: __DEV__ ? `${options.name ?? "resource"}_error` : undefined,
  });
  resourceReturn.latest = createMemo(() => state().latest, undefined, {
    equals: false,
    name: __DEV__ ? `${options.name ?? "resource"}_latest` : undefined,
  });
  resourceReturn.refetch = refetch;
  resourceReturn.mutate = mutate as SetterType<T | undefined>;

  return resourceReturn;
}

// --- End createResource ---

let batchDepth = 0;

/**
 * Check if we're currently in a batch
 */
export function isBatching(): boolean {
  return batchDepth > 0;
}

/**
 * By default, changes are batched on the microtask queue which is an async process. You can flush
 * the queue synchronously to get the latest updates. This is useful for testing and synchronous situations
 * where you need the latest values immediately.
 *
 * @param fn An optional function to execute before flushing.
 * @returns The return value of the provided function, or undefined if no function is provided.
 */
export function flushSync<T>(fn?: () => T): T | undefined {
  // Use the base implementation from scheduler
  return baseFlushSync(fn);
}
