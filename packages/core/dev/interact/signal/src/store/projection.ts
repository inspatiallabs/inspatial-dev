import { createStore } from "./store.ts";
import {
  ComputationClass,
  compute,
  getOwner,
  OwnerClass,
  getObserver,
} from "../core/index.ts";
import type { StoreType, StoreSetterType } from "./store.ts";
import { EagerComputationClass } from "../core/effect.ts";

// Define PathSegmentType locally as it's not exported from store.ts
type PathSegmentType = string | number;

/**
 * Creates a projection store that applies the given function to the initialValue
 * A projection is a store that is derived from a transformation function
 */
export function createProjection<T extends object>(
  fn: (draft: T) => void,
  initialValue: T = {} as T
): StoreType<T> {
  // Create a basic store with the initial value
  const [store, setStore] = createStore<T>(initialValue);
  
  // Apply the function once initially to setup the store
  setStore(draft => {
    fn(draft);
  });
  
  // Setup reactive tracking with a computation
  const owner = getOwner() as OwnerClass;
  if (owner) {
    // Create an eager computation that will re-run whenever dependencies change
    compute(owner, () => {
      // Apply the projection function to update the store when dependencies change
      setStore(draft => {
        fn(draft);
      });
      
      // This ensures the computation stays active and tracks properly
      return store;
    }, null);
  }
  
  return store;
}

/**
 * Wraps a store with a projection that runs the provided function on each access
 * This ensures that the projection function is always applied when the store is accessed
 */
export function wrapProjection<
  T extends object = Record<string | number | symbol, never>,
>(
  fn: (store: T) => void,
  store: StoreType<T>,
  set: StoreSetterType<T>
): [get: StoreType<T>, set: StoreSetterType<T>] {
  const owner = getOwner() as OwnerClass;
  
  // Create a tracking computation that runs the projection function
  // This makes sure the projection is updated when dependencies change
  const comp = new EagerComputationClass(
    undefined,
    (_prev?: ComputationClass<any>) => {
      // We need to run the projection function with tracking
      // This will track any dependencies used in the projection
      const computation = compute(owner, () => {
        // Apply projection function to the store
        fn(store as T);
        
        // Return a new computation that will force tracking of the store
        return new ComputationClass(store, null, {
          equals: false, // Never consider equal
          unobserved: undefined, // Keep alive
        });
      }, null);
      
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
  
  // Wrap the setter functions to ensure the projection is applied before setting
  const wrappedSet = Object.assign(
    (v: any) => {
      const result = set(v);
      // Re-run the projection after each setter call
      comp.read();
      return result;
    },
    {
      path: (...args: [...PathSegmentType[], any]) => {
        const result = set.path(...args);
        comp.read();
        return result;
      },
      push: (path: PathSegmentType[], ...items: any[]) => {
        const result = set.push(path, ...items);
        comp.read();
        return result;
      },
      splice: (
        path: PathSegmentType[],
        start: number,
        deleteCount?: number,
        ...items: any[]
      ) => {
        const result = set.splice(path, start, deleteCount, ...items);
        comp.read();
        return result;
      },
      insert: (path: PathSegmentType[], index: number, ...items: any[]) => {
        const result = set.insert(path, index, ...items);
        comp.read();
        return result;
      },
      remove: (
        path: PathSegmentType[],
        itemOrMatcher: any | ((item: any, index: number) => boolean)
      ) => {
        const result = set.remove(path, itemOrMatcher);
        comp.read();
        return result;
      },
    }
  );
  
  return [store, wrappedSet];
}

// function wrap(source: any, node: any, wrapped: any) {
//   if (wrapped.has(source)) return wrapped.get(source);
//   const wrap = new Proxy(source, {
//     get(target, property) {
//       node.read();
//       const v = target[property];
//       return isWrappable(v) ? wrap(v, node, wrapped) : v;
//     },
//     set() {
//       throw new Error("Projections are readonly");
//     },
//     deleteProperty() {
//       throw new Error("Projections are readonly");
//     },
//   });
//   wrapped.set(source, wrap);
//   return wrap;
// }
