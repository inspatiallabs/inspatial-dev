import { NotReadyErrorClass } from "./error.ts";
import { createMemo } from "./create-memo.ts";
import { createRenderEffect } from "./create-render-effect.ts";
import { createSignal } from "./create-signal.ts";
import type {
  ResourceOptionsType,
  ResourceReturnType,
  ResourceFetcherInfoType,
  ResourceFetcherType,
  ResourceSourceType,
  InitialResourceFetcherType,
  AccessorType,
  SetterType,
  ResourceStateType,
} from "./types.ts";

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

    const promise = Promise.resolve(
      currentFetcher(src as S & ResourceFetcherInfoType<T>, ref)
    );
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
