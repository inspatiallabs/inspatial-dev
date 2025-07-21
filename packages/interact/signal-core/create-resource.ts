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
 * @module @in/teract/signal-core/create-resource
 *
 * This module provides `createResource`, a powerful utility for managing asynchronous
 * data fetching and state within a reactive system. It simplifies handling loading states,
 * errors, and updates for data that comes from promises or other async operations.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateResource
 * @access public
 */

/**
 * # CreateResource
 * @summary #### Creates a reactive resource for asynchronous data fetching and state management.
 *
 * Think of `createResource` like a dedicated research assistant for your application.
 * You tell it what information to find (the `fetcher` function) and optionally, what clues to
 * base its search on (the `source` signal). The assistant will then:
 * 1. Tell you if it's currently busy searching (`resource.loading()`).
 * 2. Let you know if it ran into any problems (`resource.error()`).
 * 3. Provide you with the latest information it found (`resource()` or `resource.latest()`).
 * You can also ask it to re-check its sources (`resource.refetch()`) or give it new information directly (`resource.mutate()`).
 *
 * `createResource` automatically handles the lifecycle of asynchronous operations,
 * making it easy to display loading indicators, error messages, and the fetched data
 * in a reactive way.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateResource
 * @kind function
 * @access public
 *
 * @typeParam T - The type of the data that the resource will hold (e.g., `UserType`, `Product[]`).
 * @typeParam S - The type of the source signal, if one is provided (e.g., `number` for a user ID, `string` for a search query).
 *
 * ### 💡 Core Concepts
 * - **Asynchronous Data Handling**: Manages the states (loading, error, success) of data fetched asynchronously.
 * - **Reactive Fetching**: If a `source` signal is provided, the resource automatically re-fetches when the `source` value changes.
 * - **State Properties**: Exposes reactive accessors for `loading`, `error`, and the `latest` resolved value.
 * - **Manual Control**: Offers `refetch()` to manually trigger a new fetch and `mutate()` to optimistically update the data locally.
 * - **Error Handling**: Throws `NotReadyErrorClass` when accessed while loading and no initial value is available. Errors from the fetcher are available via `resource.error()`.
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of JavaScript Promises and `async/await`.
 * - Familiarity with InSpatial signals (`createSignal`) and effects (`createEffect`).
 * - Basic concepts of data fetching in web applications.
 *
 * ### 📚 Terminology
 * > **Fetcher**: The asynchronous function you provide to `createResource` that performs the actual data fetching (e.g., an API call).
 * > **Source**: An optional reactive signal. If provided, `createResource` will re-run the `fetcher` whenever this signal's value changes.
 * > **Resource State**: The current condition of the resource, typically including `loading` (boolean), `error` (any), and `latest` (the most recent data or initial value).
 * > **Mutate**: To directly set the resource's data on the client-side, often used for optimistic updates.
 * > **Refetch**: To manually trigger the `fetcher` function again, ignoring any cached state.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about usage and error handling</summary>
 *
 * > [!NOTE]
 * > When a resource is loading and its value is accessed (e.g., `resource()`), it will throw a `NotReadyErrorClass` if no `initialValue` was provided or if the resource has not resolved its first value yet. Always check `resource.loading()` or handle this error, often with a Suspense boundary or conditional rendering.
 *
 * > [!NOTE]
 * > If the `fetcher` function itself throws an error, this error will be caught and made available via `resource.error()`. The main accessor `resource()` will then re-throw this error when called.
 *
 * > [!NOTE]
 * > The `source` signal can be any reactive accessor. If its value is `null`, `undefined`, or `false`, the `fetcher` will not run, and the resource will reset to its `initialValue` if provided.
 *
 * > [!NOTE]
 * > `mutate(newValue)` updates the local state of the resource immediately. It does not automatically refetch data unless you call `refetch()` afterwards.
 * </details>
 *
 * @param fetcher - The function that fetches the data. It receives the source value (if a source is provided) and an info object containing the previous value and refetching status.
 * @param options - Resource options: `initialValue` (data to show while loading), `name` (for debugging), `source` (a reactive signal to trigger refetches).
 * *OR*
 * @param source - A reactive signal. The `fetcher` runs when this source provides a truthy value (not `null`, `undefined`, or `false`).
 * @param fetcher - The function that fetches the data, receiving the current `source` value.
 * @param options - Resource options: `initialValue`, `name`.
 *
 * @returns {ResourceReturnType<T>} A reactive accessor function for the resource's data. This accessor also has the following properties:
 *   - `loading`: An accessor `() => boolean` that is `true` while the resource is fetching.
 *   - `error`: An accessor `() => any` that holds the error if the last fetch failed.
 *   - `latest`: An accessor `() => T | undefined` that returns the most recently successfully fetched data, or `initialValue`.
 *   - `refetch: (info?: unknown) => Promise<T> | T | undefined | null`: A function to manually trigger a refetch.
 *   - `mutate: SetterType<T | undefined>`: A function to directly set the resource's data.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use `createResource`:
 *
 * @example
 * ### Example 1: Basic Data Fetching (No Source)
 * ```typescript
 * import { createResource, createEffect, NotReadyErrorClass } from "@in/teract/signal-core";
 *
 * const [posts, { loading, error, refetch }] = createResource(async () => {
 *   console.log("Fetching posts...");
 *   await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
 *   // In a real app, you'd fetch from an API:
 *   // const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
 *   // if (!response.ok) throw new Error("Failed to fetch posts");
 *   // return response.json();
 *   return [{ id: 1, title: "Sample Post 1" }, { id: 2, title: "Sample Post 2" }];
 * });
 *
 * createEffect(() => {
 *   if (loading()) {
 *     console.log("Posts are loading...");
 *   } else if (error()) {
 *     console.error("Error fetching posts:", error());
 *   } else {
 *     try {
 *       console.log("Fetched posts:", posts());
 *     } catch (e) {
 *       if (e instanceof NotReadyErrorClass) {
 *         console.log("Posts data is not ready yet (initial load).");
 *       } else {
 *         console.error("An unexpected error occurred:", e);
 *       }
 *     }
 *   }
 * });
 *
 * // To refetch manually:
 * // setTimeout(() => refetch(), 3000);
 * ```
 *
 * @example
 * ### Example 2: Fetching with a Reactive Source
 * ```typescript
 * import { createResource, createSignal, createEffect } from "@in/teract/signal-core";
 *
 * const [userId, setUserId] = createSignal(1);
 *
 * const [user, { loading: userLoading, error: userError }] = createResource(
 *   userId, // Source: re-fetches when userId changes
 *   async (id) => {
 *     console.log(`Fetching user with ID: ${id}...`);
 *     await new Promise(resolve => setTimeout(resolve, 1000));
 *     // const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
 *     // if (!response.ok) throw new Error(`Failed to fetch user ${id}`);
 *     // return response.json();
 *     if (id === 0) throw new Error("Invalid User ID 0");
 *     return { id, name: `User ${id}`, email: `user${id}@example.com` };
 *   },
 *   { initialValue: { id: 0, name: "Guest"} } // Optional initial value
 * );
 *
 * createEffect(() => {
 *   console.log(`Current User ID: ${userId()}`);
 *   if (userLoading()) {
 *     console.log("User data is loading...");
 *   } else if (userError()) {
 *     console.error("Error fetching user:", userError().message);
 *     console.log("Displaying user (from initialValue or last success):", user()); // Shows initialValue or last good value on error
 *   } else {
 *     console.log("Fetched user data:", user());
 *   }
 * });
 *
 * // Change userId to trigger a refetch
 * setTimeout(() => setUserId(2), 3000);
 * setTimeout(() => setUserId(0), 6000); // This will trigger an error
 * setTimeout(() => setUserId(3), 9000); // This will fetch again successfully
 * ```
 *
 * @example
 * ### Example 3: Using `initialValue` and `refetch`
 * ```typescript
 * import { createResource, createEffect } from "@in/teract/signal-core";
 *
 * let fetchCount = 0;
 * const [data, { loading, error, refetch, mutate }] = createResource(
 *   async (source, info) => {
 *     fetchCount++;
 *     console.log(`Fetching data (attempt ${fetchCount}). Refetching: ${info.refetching}, Previous value:`, info.value);
 *     await new Promise(resolve => setTimeout(resolve, 1000));
 *     if (fetchCount === 2) throw new Error("Simulated fetch error on attempt 2");
 *     return { message: `Data fetched successfully (attempt ${fetchCount})` };
 *   },
 *   { initialValue: { message: "Loading initial data..." } }
 * );
 *
 * createEffect(() => {
 *   console.log("Resource state:",
 *     loading() ? "Loading..." :
 *     error() ? `Error: ${error().message}` :
 *     data()?.message
 *   );
 * });
 *
 * // Manually refetch after 3 seconds
 * setTimeout(() => {
 *   console.log("Manually refetching...");
 *   refetch();
 * }, 3000);
 *
 * // Manually refetch again after 6 seconds (this one will fail)
 * setTimeout(() => {
 *   console.log("Manually refetching again (will fail)...");
 *   refetch("custom refetch info");
 * }, 6000);
 * ```
 *
 * @example
 * ### Example 4: Optimistic Updates with `mutate`
 * ```typescript
 * import { createResource, createSignal, createEffect } from "@in/teract/signal-core";
 *
 * const [itemId, setItemId] = createSignal("item1");
 *
 * const [itemDetails, { mutate, refetch, loading }] = createResource(
 *   itemId,
 *   async (id) => {
 *     console.log(`Fetching details for ${id}...`);
 *     await new Promise(resolve => setTimeout(resolve, 1500));
 *     return { id, name: `Details for ${id}`, lastFetched: new Date().toLocaleTimeString() };
 *   }
 * );
 *
 * createEffect(() => {
 *  try {
 *    const details = itemDetails();
 *    console.log("Item Details:", details, "Loading:", loading());
 *  } catch (e) {
 *      console.log("Item Details: Not Ready", "Loading:", loading());
 *  }
 * });
 *
 * function handleUpdateName(newName: string) {
 *   const currentId = itemId();
 *   // Optimistically update the local state
 *   mutate(prev => ({ ...prev, id: currentId, name: newName, lastFetched: "Updating..." }));
 *
 *   // Simulate API call to update the name on the server
 *   console.log(`Sending update for ${currentId} to server: ${newName}`);
 *   setTimeout(() => {
 *     console.log(`Server update for ${currentId} successful.`);
 *     // Refetch to get the conﬁrmed data from the server (or handle error)
 *     refetch().catch(err => console.error("Refetch after mutate failed:", err));
 *   }, 2000);
 * }
 *
 * setTimeout(() => handleUpdateName("Updated Item Name!"), 4000);
 * setTimeout(() => setItemId("item2"), 8000); // Switch item, triggers new fetch
 * ```
 *
 * @example
 * ### Example 5: Resource with no explicit source (always active)
 * ```typescript
 * import { createResource, createEffect } from "@in/teract/signal-core";
 *
 * const [config, { loading: configLoading, error: configError, refetch: refetchConfig }] = createResource(async () => {
 *   console.log("Fetching application configuration...");
 *   await new Promise(r => setTimeout(r, 500));
 *   return { theme: "dark", featureFlags: ["newDashboard", "betaFeature"] };
 * });
 *
 * createEffect(() => {
 *   if (configLoading()) {
 *     console.log("Loading config...");
 *   } else if (configError()) {
 *     console.error("Failed to load config:", configError());
 *   } else {
 *     console.log("App Config:", config());
 *   }
 * });
 *
 * // Config fetches on creation. Refetch if needed:
 * // setTimeout(refetchConfig, 5000);
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - **`initialValue`**: Provide an `initialValue` to avoid unnecessary loading states or UI flickers, especially for data that might already be available (e.g., from a cache or SSR).
 * - **Debounce/Throttle Source**: If your `source` signal changes very rapidly (e.g., from user input), consider debouncing or throttling it before passing it to `createResource` to prevent excessive fetching.
 * - **Selective Reactivity**: Access specific properties like `resource.loading` or `resource.error` if you only need to react to those states, rather than the data itself, to minimize re-renders.
 * - **`deferStream` Option**: For resources that might stream data, using `deferStream` (if available in your InSpatial version) can control when the fetcher starts processing.
 * - **Bundle API Calls**: If multiple resources depend on similar base data, consider a single higher-level resource or a mechanism to bundle API calls.
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Not Handling `NotReadyErrorClass`**: Forgetting to check `resource.loading()` or use a try-catch/Suspense boundary when accessing `resource()` before data is ready (and no `initialValue` is set) will lead to runtime errors.
 * - **No `source` for Reactive Updates**: If you expect the resource to refetch when some data changes, ensure that data is passed as a reactive `source` signal to `createResource`.
 * - **Mutating Fetched Data Directly**: Avoid directly mutating the object returned by `resource()`. Use `mutate()` for optimistic updates or refetch for server-synced changes.
 * - **Fetcher Side Effects**: The `fetcher` function should primarily focus on fetching data and be as pure as possible regarding external state modification. Other side effects should be handled in `createEffect`.
 * - **Infinite Refetch Loops**: If the `source` signal is updated within an effect that also depends on the resource itself, it can lead to infinite refetch loops. Ensure dependencies are correctly managed.
 * </details>
 *
 * @throws {NotReadyErrorClass} When `resource()` is accessed while `loading` is true and no `initialValue` has resolved.
 * @throws {any} Any error thrown by the `fetcher` function during the data fetching process will be available via `resource.error()` and re-thrown by `resource()`.
 *
 * ### 📝 Uncommon Knowledge
 * `createResource` is designed to integrate seamlessly with Suspense boundaries (`createSuspense`). When used within a Suspense context, `createResource` automatically communicates its loading state, allowing the Suspense component to show a fallback UI without manual `loading()` checks. This makes for cleaner and more declarative asynchronous UI patterns.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 * - ✅ Modern Browsers
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link createSignal} - For creating reactive sources or managing local state alongside resources.
 * - {@link createAsync} - A simpler primitive for handling one-off async computations without the full state management of `createResource`.
 * - {@link createSuspense} - For coordinating loading states of multiple resources and showing fallback UIs.
 * - {@link createErrorBoundary} - For catching errors that might occur during fetching or when using the resource data.
 * - {@link createEffect} - For reacting to changes in resource data, loading, or error states.
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
  let fetcherFn: InitialResourceFetcherType<T> | ResourceFetcherType<S, T>;
  let options: ResourceOptionsType<T, S>;

  const [trackFetcher, triggerFetcher] = createSignal<
    InitialResourceFetcherType<T> | ResourceFetcherType<S, T> | undefined
  >(undefined, { equals: false });

  // Normalize arguments
  if (
    arguments.length === 2 &&
    typeof sourceOrFetcher === "function" &&
    typeof fetcherOrOptions === "object"
  ) {
    source = () => true as ResourceSourceType<S>;
    fetcherFn = sourceOrFetcher as InitialResourceFetcherType<T>;
    options = fetcherOrOptions as ResourceOptionsType<T, S>;
  } else if (
    arguments.length >= 2 &&
    typeof sourceOrFetcher === "function" &&
    typeof fetcherOrOptions === "function"
  ) {
    source = sourceOrFetcher as AccessorType<ResourceSourceType<S>>;
    fetcherFn = fetcherOrOptions as ResourceFetcherType<S, T>;
    options = optionsArg ?? ({} as ResourceOptionsType<T, S>);
  } else {
    source = () => true as ResourceSourceType<S>;
    fetcherFn = sourceOrFetcher as InitialResourceFetcherType<T>;
    options = {} as ResourceOptionsType<T, S>;
  }
  triggerFetcher(() => fetcherFn); // Set the fetcher after normalization

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
    if (!currentFetcher) {
      // Guard against currentFetcher being undefined initially
      // This might happen if load() is called before triggerFetcher() has run.
      // Depending on desired behavior, you might queue this load or log an error.
      return;
    }
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
      (currentFetcher as ResourceFetcherType<S, T>)(
        src as S & ResourceFetcherInfoType<T>,
        ref
      )
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
      trackVal(); // This signal dependency ensures memo re-runs when resource state changes
      if (modified) return mutatedValue();

      const currentActualSource = explicitSource ? source() : true;

      if (!resolved && !errorVal) {
        if (currentActualSource == null || currentActualSource === false) {
          // Source is null/false, and we have no resolved value or error yet.
          // If there's an initialValue, it should have been returned by `state().latest` if this were the first run.
          // If not first run, this means source turned null/false, and we should not throw NotReady.
          // Instead, allow `state().latest` (which would be initialValue or last good value) to be returned.
          if (options.initialValue !== undefined || requested) {
            // Do nothing here, let state().latest pass through
          } else {
          throw new NotReadyErrorClass();
          }
        } else if (!requested) {
          // Source is valid, but we haven't started fetching yet (e.g. onMount behavior for non-source resources)
          throw new NotReadyErrorClass();
        } else {
          // Actively loading a valid source
          throw new NotReadyErrorClass();
        }
      }
      if (errorVal && !state().error) {
        // if load() errored but state hasn't updated yet via .catch
        throw errorVal;
      }
      return state().latest;
    },
    undefined,
    { name: __DEV__ ? `${options.name ?? "resource"}_memo` : undefined }
  );

  createRenderEffect(
    source, // Compute function: tracks the source
    (prevSourceValue) => {
      // Effect function
      const currentSourceValue = source(); // Get current source value that compute fn returned for this run
      setSourceVal(() => currentSourceValue); // Track the source value itself if needed elsewhere

      // Initial state: if source is initially null/false and we haven't requested anything, do nothing yet.
      if (
        prevSourceValue === undefined && // Check against the value passed by effect, not direct source()
        (currentSourceValue == null || currentSourceValue === false) &&
      !requested
    ) {
        return; // No cleanup, just don't proceed to load
    }

      if (currentSourceValue == null || currentSourceValue === false) {
        // If source becomes null/false, reset to initialValue and clear loading/error states
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
        requested = false; // Mark as not requested so it can re-trigger if source becomes valid
      currentPromise = undefined;
        trigger(undefined); // Notify dependents of state change
      } else if (prevSourceValue !== currentSourceValue || !requested) {
        // If source changes to a truthy value, or if it's the first time with a truthy source and not yet requested
      load();
      }
      // No return value here, or return a cleanup function if needed
    }
  );

  const refetch = (info?: unknown) => {
    const promise = load(info || true);
    return promise;
  };

  const mutate = (
    v: T | undefined | ((prev?: T) => T | undefined)
  ): T | undefined => {
    const val =
      typeof v === "function"
        ? (v as (prev?: T) => T | undefined)(state().latest) // Pass the latest successful state to mutator
        : v;
    modified = true;
    resolved = true; // Assume mutation makes it resolved with the new value
    errorVal = undefined; // Clear any previous error
    loading = false; // No longer loading
    currentPromise = undefined; // Cancel any ongoing fetch implication
    setMutatedValue(() => val); // Set the optimistically mutated value
    setState((prev) => ({ latest: val, error: undefined, loading: false })); // Update the main state
    trigger(undefined); // Notify dependents
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
  resourceReturn.latest = createMemo(
    () => {
      // This ensures that `latest` also respects optimistic updates from `mutate`
      if (modified) return mutatedValue();
      return state().latest;
    },
    undefined,
    {
    equals: false,
    name: __DEV__ ? `${options.name ?? "resource"}_latest` : undefined,
    }
  );
  resourceReturn.refetch = refetch;
  resourceReturn.mutate = mutate as SetterType<T | undefined>;

  return resourceReturn;
}

/**
 * # NotReadyErrorClass
 * @summary #### Signals that an asynchronous computation is not yet resolved.
 *
 * This error is thrown by reactive primitives like `createResource` or `createAsync`
 * when their value is accessed before the underlying asynchronous operation (e.g., a Promise)
 * has completed. It's a key part of how InSpatial Signal Core integrates with Suspense mechanisms.
 *
 * Think of it like asking a chef for your meal before it's cooked. The chef might politely
 * say, "It's not ready yet!" - this error is the programmatic equivalent.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Error
 * @class
 * @access public
 * @extends Error
 */
export class NotReadyErrorClass extends Error {}
