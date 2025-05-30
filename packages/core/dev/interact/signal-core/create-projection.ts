import { createStore } from "./create-store.ts";
import { ComputationClass, compute, getObserver, untrack } from "./core.ts";
import type { StoreType, StoreSetterType } from "./create-store.ts";
import { createEffect } from "./create-effect.ts";
import { flushSync } from "./scheduler.ts";
import { getOwner, OwnerClass } from "./owner.ts";
import { EagerComputationClass } from "./effect.ts";

// Define PathSegmentType locally as it's not exported from store.ts
type PathSegmentType = string | number;

/**
 * Creates a projection store that applies the given function to the initialValue
 * A projection is a store that is derived from a transformation function
 *
 * @param fn - The projection function that transforms the state
 * @param initialValue - Initial state for the projection
 * @returns A readonly store derived from the projection function
 */
export function createProjection<T extends object>(
  fn: (draft: T) => void,
  initialValue: T = {} as T
): StoreType<T> {
  // Create the base store
  const [store, setStore] = createStore<T>(initialValue);

  // Create a flag to track the first run
  let isInitialRun = true;

  // Track the previous dependencies
  const runProjection = () => {
    // Use untrack to avoid circular dependencies and feedback loops
    untrack(() => {
      // Apply the projection function to update the store
      setStore((draft) => {
        fn(draft);
      });
    });
  };

  // Apply the projection initially
  runProjection();
  isInitialRun = false;

  // Setup an effect to track dependencies of the projection function
  createEffect(() => {
    // Create a dummy state to track dependencies only
    const dummyState = {} as T;

    // Run the function to track its dependencies
    fn(dummyState);

    // When dependencies change, run the projection to update the store
    if (!isInitialRun) {
      // Ensure synchronous updates
      flushSync(() => {
        runProjection();
      });
    }

    return undefined; // Return value doesn't matter
  });

  // Return readonly store
  return store;
}

/**
 * Wraps a store with a projection that runs the provided function on each access
 * This ensures that the projection function is always applied when the store is accessed
 */
export function wrapProjection<
  T extends object = Record<string | number | symbol, never>
>(
  fn: (store: T) => void,
  store: StoreType<T>,
  set: StoreSetterType<T>
): [get: StoreType<T>, set: StoreSetterType<T>] {
  const owner = getOwner() as OwnerClass;

  // Force the projection to run initially
  untrack(() => {
    fn(store as T);
  });

  // Create a tracking computation that runs the projection function
  // This makes sure the projection is updated when dependencies change
  const comp = new EagerComputationClass(
    undefined,
    (_prev?: ComputationClass<any>) => {
      // We need to run the projection function with tracking
      // This will track any dependencies used in the projection
      const computation = compute(
        owner,
        () => {
          // Apply projection function to the store
          fn(store as T);

          // Return a new computation that will force tracking of the store
          return new ComputationClass(store, null, {
            equals: false, // Never consider equal
            unobserved: undefined, // Keep alive
          });
        },
        null
      );

      return computation;
    },
    {
      // Configuration to ensure the computation runs eagerly and tracks properly
      name: "projection",
      equals: false, // Force updates
      unobserved: undefined, // Keep alive
    }
  );

  // Force initial evaluation to ensure the projection is applied
  comp.read();

  // Wrap the setter functions to ensure the projection is applied after setting
  const wrappedSet = Object.assign(
    (v: any) => {
      const result = set(v);
      // Re-run the projection after each setter call and flush updates
      flushSync(() => {
        comp.read();
      });
      return result;
    },
    {
      path: (...args: [...PathSegmentType[], any]) => {
        const result = set.path(...args);
        flushSync(() => comp.read());
        return result;
      },
      push: (path: PathSegmentType[], ...items: any[]) => {
        const result = set.push(path, ...items);
        flushSync(() => comp.read());
        return result;
      },
      splice: (
        path: PathSegmentType[],
        start: number,
        deleteCount?: number,
        ...items: any[]
      ) => {
        const result = set.splice(path, start, deleteCount, ...items);
        flushSync(() => comp.read());
        return result;
      },
      insert: (path: PathSegmentType[], index: number, ...items: any[]) => {
        const result = set.insert(path, index, ...items);
        flushSync(() => comp.read());
        return result;
      },
      remove: (
        path: PathSegmentType[],
        itemOrMatcher: any | ((item: any, index: number) => boolean)
      ) => {
        const result = set.remove(path, itemOrMatcher);
        flushSync(() => comp.read());
        return result;
      },
    }
  );

  return [store, wrappedSet];
}
