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
  const [store] = createStore(fn, initialValue);
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
      compute(owner, () => {
        // Run the function to establish dependencies and apply projection
        fn(store);
        
        // Return a computation that makes the store observable
        return new ComputationClass(store, null, {
          equals: false, // Never consider equal to force updates
          unobserved: undefined, // Keep alive
        });
      }, null);
      
      // Create a computation for the store itself to track access
      return new ComputationClass(store, null, {
        equals: false, // Force updates
      });
    },
    {
      // Configuration to ensure the computation runs eagerly and tracks properly
      name: "projection",
      equals: false, // Force updates
      unobserved: undefined, // Keep alive
    }
  );
  
  // Wrap the setter functions to ensure the projection is applied before setting
  const wrappedSet = Object.assign(
    (v: any) => {
      // Read the computation to track dependencies
      comp.read();
      return set(v);
    },
    {
      path: (...args: [...PathSegmentType[], any]) => {
        comp.read();
        return set.path(...args);
      },
      push: (path: PathSegmentType[], ...items: any[]) => {
        comp.read();
        return set.push(path, ...items);
      },
      splice: (
        path: PathSegmentType[],
        start: number,
        deleteCount?: number,
        ...items: any[]
      ) => {
        comp.read();
        return set.splice(path, start, deleteCount, ...items);
      },
      insert: (path: PathSegmentType[], index: number, ...items: any[]) => {
        comp.read();
        return set.insert(path, index, ...items);
      },
      remove: (
        path: PathSegmentType[],
        itemOrMatcher: any | ((item: any, index: number) => boolean)
      ) => {
        comp.read();
        return set.remove(path, itemOrMatcher);
      },
    }
  );
  
  // We need to ensure the projection is initially run
  if (getObserver()) {
    comp.read();
  }
  
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
