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

export type NoInferType<T extends any> = [T][T extends any ? 0 : never];

/** Input to fetcher function, signifying the fetch should occur. */
export type ResourceSourceType<S> = S | false | null | undefined;

/** Function that performs the asynchronous fetching. */
export type ResourceFetcherType<S, T> = (
  source: S,
  info: ResourceFetcherInfoType<T>
) => Promise<T> | T;

/** Function that performs the asynchronous fetching without a source. */
export type InitialResourceFetcherType<T> = (
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
export interface ResourceStateType<T> {
  loading: boolean;
  error: any;
  latest: T | undefined;
}

// Resource return type combines Accessor and properties
export type ResourceReturnType<T> = AccessorType<T | undefined> &
  ResourceType<T>;
