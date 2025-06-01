import { OwnerClass } from "./owner.ts";

/**
 * # AccessorType
 * @summary #### Represents a function that returns a value, typically a reactive signal's getter.
 *
 * This is the standard way to read the value of a signal or memo. Calling this function
 * will return the current value and, if called within a reactive scope (like an effect or memo),
 * establish a dependency on the signal.
 *
 * @template T - The type of the value returned by the accessor.
 * @returns {T} The current value of the reactive primitive.
 * @see {@link createSignal}
 * @see {@link createMemo}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type AccessorType<T> = () => T;

/**
 * # SetterType
 * @summary #### Represents a function that updates a reactive signal's value.
 *
 * This function is used to change the value of a signal created by `createSignal` or to
 * mutate the data of a resource created by `createResource`.
 * It can be called with a new value directly, or with an updater function that receives
 * the previous value and returns the new value.
 *
 * @template T - The type of the value the signal holds.
 * @param {Exclude<U, Function> | ((prev: T) => U)} [value] - The new value or an updater function.
 *   If `T` can be `undefined`, this argument is optional.
 * @returns {U | undefined} The new value of the signal. If `T` can be `undefined`, this can be `undefined`.
 * @template U - A subtype of T, representing the type of the new value.
 * @see {@link createSignal}
 * @see {@link ResourceType.mutate}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
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

/**
 * # SignalType
 * @summary #### Represents a reactive signal, as a tuple of [getter, setter].
 *
 * This is the return type of `createSignal`. It provides a getter function to read the
 * signal's value and a setter function to update it.
 *
 * @template T - The type of the value held by the signal.
 * @property {AccessorType<T>} 0 - The getter function (`get`).
 * @property {SetterType<T>} 1 - The setter function (`set`).
 * @see {@link createSignal}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type SignalType<T> = [get: AccessorType<T>, set: SetterType<T>];

/**
 * # ComputeFunctionType
 * @summary #### Defines the shape of a function used for computations in memos or effects.
 *
 * This function typically reads other reactive values (signals or memos) and computes a new value.
 * It receives the previous value of the computation as an argument.
 *
 * @template Prev - The type of the previous value passed to the computation.
 * @template Next - The type of the value returned by the computation (defaults to `Prev`).
 * @param {Prev} v - The previous value of this computation.
 * @returns {Next} The newly computed value.
 * @see {@link createMemo}
 * @see {@link createEffect}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type ComputeFunctionType<Prev, Next extends Prev = Prev> = (
  v: Prev
) => Next;

/**
 * # EffectFunctionType
 * @summary #### Defines the shape of an effect function that performs side effects.
 *
 * This function is executed when the dependencies of an effect change. It receives the current
 * computed value and optionally the previous value. It can return a cleanup function.
 *
 * @template Prev - The type of the previous value (if tracked and passed).
 * @template Next - The type of the current value passed to the effect (defaults to `Prev`).
 * @param {Next} v - The current value that triggered the effect.
 * @param {Prev} [p] - The previous value (optional).
 * @returns {(() => void) | void} An optional cleanup function that runs before the next effect execution or when the effect is disposed.
 * @see {@link createEffect}
 * @see {@link createRenderEffect}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type EffectFunctionType<Prev, Next extends Prev = Prev> = (
  v: Next,
  p?: Prev
) => (() => void) | void;

/**
 * # EffectOptionsType
 * @summary #### Options for configuring `createEffect` or `createRenderEffect`.
 *
 * Allows specifying a `name` for debugging and a `defer` option (primarily for `createEffect`)
 * to control execution timing relative to rendering, though `defer` is less commonly used directly.
 *
 * @property {string} [name] - A name for debugging purposes, visible in reactive graph debugging tools.
 * @property {boolean} [defer] - If `true`, defers the effect execution. For `createRenderEffect`, this is implicitly false.
 * @see {@link createEffect}
 * @see {@link createRenderEffect}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind interface
 */
export interface EffectOptionsType {
  name?: string;
  defer?: boolean;
}

/**
 * # MemoOptionsType
 * @summary #### Options for configuring `createMemo`.
 *
 * Allows specifying a `name` for debugging and a custom `equals` function to determine
 * when the memo's value has actually changed, preventing unnecessary downstream updates.
 *
 * @template T - The type of the value held by the memo.
 * @property {string} [name] - A name for debugging purposes.
 * @property {false | ((prev: T, next: T) => boolean)} [equals] - A function to compare the previous and next values.
 *   If `false`, the memo always re-runs dependents. If not provided, uses referential equality (`===`).
 * @see {@link createMemo}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind interface
 */
export interface MemoOptionsType<T> {
  name?: string;
  equals?: false | ((prev: T, next: T) => boolean);
}

/**
 * # NoInferType
 * @summary #### A utility type to prevent TypeScript from inferring a type too broadly.
 *
 * This type helper can be used in function signatures to ensure that a generic type `T`
 * is taken literally as provided, rather than TypeScript trying to widen it or infer it
 * from other parts of the function call.
 *
 * @template T - The type to be preserved without excessive inference.
 * @see Used internally in `createSignal`, `createEffect`, etc., for more precise type checking.
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 * @access package
 */
export type NoInferType<T extends any> = [T][T extends any ? 0 : never];

/**
 * # ResourceSourceType
 * @summary #### Represents the type of the source input for `createResource`'s fetcher.
 *
 * The `fetcher` function in `createResource` will only run if the `source` value is "truthy"
 * in a reactive sense (i.e., not `false`, `null`, or `undefined`). This type defines that contract.
 *
 * @template S - The actual type of the source when it's valid (e.g., `number` for an ID, `string` for a query).
 * @see {@link createResource}
 * @see {@link ResourceFetcherType}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type ResourceSourceType<S> = S | false | null | undefined;

/**
 * # ResourceFetcherType
 * @summary #### Defines the shape of a fetcher function used with `createResource` when a source is provided.
 *
 * This function is responsible for performing the asynchronous data fetching. It receives the current
 * value of the `source` signal and an `info` object containing the previous resource value and refetching status.
 *
 * @template S - The type of the `source` value.
 * @template T - The type of the data the fetcher is expected to return (can be a Promise or a direct value).
 * @param {S} source - The current value from the source signal that triggered the fetch.
 * @param {ResourceFetcherInfoType<T>} info - An object containing the previous value of the resource (`value`)
 *   and a flag indicating if this fetch was triggered by `refetch()` (`refetching`).
 * @returns {Promise<T> | T} The fetched data, or a Promise that resolves to the data.
 * @see {@link createResource}
 * @see {@link ResourceSourceType}
 * @see {@link ResourceFetcherInfoType}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type ResourceFetcherType<S, T> = (
  source: S,
  info: ResourceFetcherInfoType<T>
) => Promise<T> | T;

/**
 * # InitialResourceFetcherType
 * @summary #### Defines the shape of a fetcher function used with `createResource` when no source is provided.
 *
 * This function is responsible for performing the asynchronous data fetching. It's called once when the
 * resource is created and can be re-triggered by `refetch()`. It receives an `info` object.
 *
 * @template T - The type of the data the fetcher is expected to return (can be a Promise or a direct value).
 * @param {ResourceFetcherInfoType<T>} info - An object containing the previous value of the resource (`value`)
 *   and a flag indicating if this fetch was triggered by `refetch()` (`refetching`).
 * @returns {Promise<T> | T} The fetched data, or a Promise that resolves to the data.
 * @see {@link createResource}
 * @see {@link ResourceFetcherInfoType}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type InitialResourceFetcherType<T> = (
  info: ResourceFetcherInfoType<T>
) => Promise<T> | T;

/**
 * # ResourceFetcherInfoType
 * @summary #### Provides additional information to a `createResource` fetcher function.
 *
 * This object is passed as the second argument to the fetcher function (or first if no source).
 * It gives the fetcher access to the resource's previous value and indicates if the current
 * fetch was initiated by a manual `refetch()` call.
 *
 * @template T - The type of the resource's data.
 * @property {T | undefined} value - The current value of the resource data before this fetch operation. This could be the `initialValue`, the result of a previous successful fetch, or `undefined` if no value has been resolved yet.
 * @property {boolean | unknown} refetching - Indicates if this fetch was triggered by a call to `resource.refetch()`. Can be `true` or the argument passed to `refetch()`.
 * @see {@link createResource}
 * @see {@link ResourceFetcherType}
 * @see {@link InitialResourceFetcherType}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind interface
 */
export interface ResourceFetcherInfoType<T> {
  /** The current value of the resource data before fetching. */
  value: T | undefined;
  /** A method to refetch the resource. */
  refetching: boolean | unknown;
}

/**
 * # ResourceOptionsType
 * @summary #### Configuration options for `createResource`.
 *
 * These options allow customization of `createResource` behavior, such as providing an initial value,
 * naming for debugging, specifying a reactive source, or custom storage mechanisms (advanced).
 *
 * @template T - The type of the data the resource will hold.
 * @template S - The type of the source signal, if one is provided.
 * @property {T} [initialValue] - The value the resource will have while the first fetch is loading, or if a fetch fails and no previous successful data exists. Also used if the `source` becomes `null`, `undefined`, or `false`.
 * @property {string} [name] - A name for debugging purposes, helpful in reactive graph devtools.
 * @property {(init: T | undefined) => SignalType<T | undefined>} [storage] - An advanced option to provide a custom signal for storing the resource's state. Useful for integrating with external state management or persisting resource state.
 * @property {AccessorType<ResourceSourceType<S>>} [source] - A reactive signal (accessor). When this signal provides a truthy value (not `null`, `undefined`, or `false`), the fetcher function will be executed.
 * @property {"initialValue"} [ssrLoadFrom] - Used in Server-Side Rendering (SSR) contexts. If set to `"initialValue"`, the server will use the `initialValue` as the resource's data during SSR.
 * @property {boolean} [deferStream] - If `true`, and the fetcher returns a stream-like object (e.g., an AsyncIterable), processing of the stream might be deferred. (Behavior might vary based on specific InSpatial version and usage context).
 * @see {@link createResource}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind interface
 */
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

/**
 * # ResourceType
 * @summary #### Defines the properties available on the object returned by `createResource`.
 *
 * A resource is primarily an accessor function to get the data, but it also has properties
 * like `loading`, `error`, `latest`, `refetch`, and `mutate` to manage its state and behavior.
 *
 * @template T - The type of the data held by the resource.
 * @property {AccessorType<boolean>} loading - A reactive accessor that returns `true` if the resource is currently fetching data, `false` otherwise.
 * @property {AccessorType<any>} error - A reactive accessor that returns the error object if the last fetch attempt failed, otherwise `undefined`.
 * @property {AccessorType<T | undefined>} latest - A reactive accessor that returns the most recently successfully fetched data, or the `initialValue` if no fetch has succeeded or if `mutate` was used. Unlike the main resource accessor, this does not throw `NotReadyErrorClass` when loading.
 * @property {(info?: unknown) => Promise<T> | T | undefined | null} refetch - A function to manually trigger a new fetch operation. Optionally takes an `info` argument that is passed to the fetcher.
 * @property {SetterType<T | undefined>} mutate - A function to directly set or update the resource's data on the client-side. Useful for optimistic updates.
 * @see {@link createResource}
 * @see {@link ResourceReturnType}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind interface
 */
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

/**
 * # ResourceStateType
 * @summary #### Internal state representation for a resource.
 *
 * This interface describes the structure of the internal signal that `createResource`
 * uses to manage its loading status, error state, and the latest successfully fetched data.
 *
 * @template T - The type of the data held by the resource.
 * @property {boolean} loading - `true` if the resource is currently fetching.
 * @property {any} error - The error object from the last failed fetch, or `undefined`.
 * @property {T | undefined} latest - The most recently resolved data or `initialValue`.
 * @access package
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind interface
 */
export interface ResourceStateType<T> {
  loading: boolean;
  error: any;
  latest: T | undefined;
}

/**
 * # ResourceReturnType
 * @summary #### The combined type returned by `createResource`.
 *
 * It's an accessor function for the resource's data, augmented with additional
 * properties like `loading`, `error`, `latest`, `refetch`, and `mutate`.
 *
 * @template T - The type of the data held by the resource.
 * @augments {AccessorType<T | undefined>} The main function to access the resource data.
 * @augments {ResourceType<T>} Additional properties for state management.
 * @see {@link createResource}
 * @see {@link AccessorType}
 * @see {@link ResourceType}
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind type
 */
export type ResourceReturnType<T> = AccessorType<T | undefined> &
  ResourceType<T>;

export interface ContextType<T> {
  readonly id: symbol;
  readonly defaultValue: T | undefined;
}

export type ContextRecordType = Record<string | symbol, unknown>;

export interface DisposableType {
  (): void;
}

/**
 * # ErrorHandlerType
 * @summary #### Defines the signature for functions that handle errors within a reactive scope.
 *
 * An `ErrorHandlerType` function can be registered with an `OwnerClass` (typically a root or an
 * effect). If a computation owned by that owner (or any of its descendants) throws an error,
 * this handler will be invoked with the error and the node that caught it.
 *
 * This allows for centralized error management within specific parts of a reactive system,
 * similar to how `try...catch` blocks work but integrated with the reactive graph.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Error
 * @interface
 * @access public
 *
 * @param error - The error that was caught.
 * @param node - The `OwnerClass` instance (e.g., an effect or root) that is handling the error.
 *                 This is the owner that had the error handler registered on it.
 * @returns {void}
 */
export interface ErrorHandlerType {
  (error: unknown, node: OwnerClass): void;
}
