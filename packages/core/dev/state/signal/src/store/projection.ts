import { createStore } from "./store.ts";
import {
  ComputationClass,
  compute,
  getOwner,
  OwnerClass,
} from "../core/index.ts";
import type { StoreType, StoreSetterType } from "./store.ts";
import { EagerComputationClass } from "../core/effect.ts";

// Define PathSegmentType locally as it's not exported from store.ts
type PathSegmentType = string | number;

export function createProjection<T extends object>(
  fn: (draft: T) => void,
  initialValue: T = {} as T
): StoreType<T> {
  const [store] = createStore(fn, initialValue);
  return store;
}

export function wrapProjection<
  T extends object = Record<string | number | symbol, never>,
>(
  fn: (store: T) => void,
  store: StoreType<T>,
  set: StoreSetterType<T>
): [get: StoreType<T>, set: StoreSetterType<T>] {
  const owner = getOwner() as OwnerClass;
  const comp = new EagerComputationClass(
    undefined,
    (_prev?: ComputationClass<any>) => {
      compute(owner, () => fn(store), null);
      return new ComputationClass(store, null);
    }
  );
  return [
    store,
    Object.assign(
      (v: any) => {
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
    ),
  ];
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
