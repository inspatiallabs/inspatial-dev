import { ComputationClass, getObserver, isEqual } from "../core/index.ts";
import { wrapProjection } from "./projection.ts";

export type StoreType<T> = Readonly<T>;

// Base Setter type
type BaseStoreSetterType<T> = (fn: (state: T) => void) => void;

// Type for path segments
type PathSegmentType = string | number;

// Extended Setter type with helpers
export interface StoreSetterWithHelpersType<T> extends BaseStoreSetterType<T> {
  path(...args: [...PathSegmentType[], any]): void;
  push(path: PathSegmentType[], ...items: any[]): void;
  splice(path: PathSegmentType[], start: number, deleteCount?: number, ...items: any[]): void;
  insert(path: PathSegmentType[], index: number, ...items: any[]): void;
  remove(path: PathSegmentType[], itemOrMatcher: any | ((item: any, index: number) => boolean)): void;
}

// Use the extended type alias for external export if needed, or directly in createStore return type.
export type StoreSetterType<T> = StoreSetterWithHelpersType<T>;

type DataNodeType = ComputationClass<any>;
type DataNodesType = Record<PropertyKey, DataNodeType>;

const $RAW = Symbol("STORE_RAW"),
  $TRACK = Symbol("STORE_TRACK"),
  $TARGET = Symbol("STORE_TARGET"),
  $PROXY = Symbol("STORE_PROXY");

export const STORE_VALUE = "v" as const;
export const STORE_NODE = "n" as const;
export const STORE_HAS = "h" as const;

export { $PROXY, $TRACK, $RAW, $TARGET };

// Explicitly type the internal structure for proxied objects/arrays
interface InternalStoreNodeType<T = Record<PropertyKey, any>> {
  [STORE_VALUE]: T;
  [STORE_NODE]?: DataNodesType;
  [STORE_HAS]?: DataNodesType;
  [$PROXY]?: any;
}

// Exported StoreNode type remains the same conceptually
export type StoreNodeType = InternalStoreNodeType;

export namespace InStateStore {
  /**
   * Empty interface for declaration merging - allows external 
   * packages to extend the types that are considered "unwrappable"
   * @internal
   */
  export interface Unwrappable {
    readonly __unwrappable__?: never;
  }
}

export type NotWrappable =
  | string
  | number
  | bigint
  | symbol
  | boolean
  | Function
  | null
  | undefined
  | InStateStore.Unwrappable[keyof InStateStore.Unwrappable];

export function wrap<T extends Record<PropertyKey, any>>(value: T): T {
  let p = (value as any)[$PROXY];
  if (!p) {
    const target: InternalStoreNodeType<T> = Array.isArray(value)
      ? ({ [STORE_VALUE]: value } as InternalStoreNodeType<T>)
      : { [STORE_VALUE]: value };

    Object.defineProperty(value, $PROXY, {
      value: (p = new Proxy(target, proxyTraps)),
      writable: true
    });
  }
  return p;
}

export function isWrappable<T>(obj: T | NotWrappable): obj is T;
export function isWrappable(obj: any) {
  return obj != null && typeof obj === "object" && !Object.isFrozen(obj);
}

/**
 * Returns the underlying data in the store without a proxy.
 * @param item store proxy object
 * @example
 * ```js
 * const initial = {z...};
 * const [state, setState] = createStore(initial);
 * initial === state; // => false
 * initial === unwrap(state); // => true
 * ```
 */
export function unwrap<T>(item: T, deep?: boolean, set?: Set<unknown>): T;
export function unwrap<T>(item: any, deep = true, set?: Set<unknown>): T {
  let result, unwrapped, v, prop;
  if ((result = item != null && item[$RAW])) return result;
  if (!deep) return item;
  if (!isWrappable(item) || set?.has(item)) return item;
  if (!set) set = new Set();
  set.add(item);
  if (Array.isArray(item)) {
    for (let i = 0, l = item.length; i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v, deep, set)) !== v) item[i] = unwrapped;
    }
  } else {
    if (!deep) return item;
    const keys = Object.keys(item);
    for (let i = 0, l = keys.length; i < l; i++) {
      prop = keys[i];
      const desc = Object.getOwnPropertyDescriptor(item, prop)!;
      if (desc.get) continue;
      v = item[prop];
      if ((unwrapped = unwrap(v, deep, set)) !== v) item[prop] = unwrapped;
    }
  }
  return item;
}

function getNodes(target: StoreNodeType, type: typeof STORE_NODE | typeof STORE_HAS): DataNodesType {
  let nodes = target[type];
  if (!nodes) target[type] = nodes = Object.create(null) as DataNodesType;
  return nodes;
}

function getNode(
  nodes: DataNodesType,
  property: PropertyKey,
  value?: any,
  equals: false | ((a: any, b: any) => boolean) = isEqual
): DataNodeType {
  if (nodes[property]) return nodes[property]!;
  return (nodes[property] = new ComputationClass<any>(value, null, {
    equals: equals,
    unobserved() {
      delete nodes[property];
    }
  }));
}

function proxyDescriptor(target: StoreNodeType, property: PropertyKey) {
  if (property === $PROXY) return { value: target[$PROXY], writable: true, configurable: true };
  const desc = Reflect.getOwnPropertyDescriptor(target[STORE_VALUE], property);
  if (!desc || desc.get || !desc.configurable) return desc;
  delete desc.value;
  delete desc.writable;
  desc.get = () => target[STORE_VALUE][$PROXY][property];
  return desc;
}

function trackSelf(target: StoreNodeType) {
  getObserver() && getNode(getNodes(target, STORE_NODE), $TRACK, undefined, false).read();
}

function ownKeys(target: StoreNodeType) {
  trackSelf(target);
  return Reflect.ownKeys(target[STORE_VALUE]);
}

const Writing = new Set<Object>();
const proxyTraps: ProxyHandler<InternalStoreNodeType> = {
  get(target, property, receiver) {
    if (property === $TARGET) return target;
    if (property === $RAW) return target[STORE_VALUE];
    if (property === $PROXY) return receiver;
    if (property === $TRACK) {
      trackSelf(target);
      return receiver;
    }
    const nodes = getNodes(target, STORE_NODE);
    const storeValue = target[STORE_VALUE];
    const tracked = nodes[property];
    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(storeValue, property);
      if (desc && desc.get) return desc.get.call(receiver);
    }
    if (Writing.has(storeValue)) {
      const value = tracked ? tracked._value : storeValue[property];
      return isWrappable(value) ? (Writing.add(value[$RAW] || value), wrap(value)) : value;
    }
    let value = tracked ? nodes[property].read() : storeValue[property];
    if (!tracked) {
      if (typeof value === "function" && !storeValue.hasOwnProperty(property)) {
        let proto;
        return !Array.isArray(storeValue) &&
          (proto = Object.getPrototypeOf(storeValue)) &&
          proto !== Object.prototype
          ? value.bind(storeValue)
          : value;
      } else if (getObserver()) {
        value = getNode(nodes, property, isWrappable(value) ? wrap(value) : value).read();
      }
    }
    return isWrappable(value) ? wrap(value) : value;
  },

  has(target, property) {
    if (property === $RAW || property === $PROXY || property === $TRACK || property === "__proto__")
      return true;
    const has = property in target[STORE_VALUE];
    getObserver() && getNode(getNodes(target, STORE_HAS), property, has).read();
    return has;
  },

  set(target, property, value) {
    const storeValue = target[STORE_VALUE] as Record<PropertyKey, any>;
    if (Writing.has(storeValue)) {
       setProperty(storeValue, property, unwrap(value, false));
    }
    return true;
  },

  deleteProperty(target, property) {
    const storeValue = target[STORE_VALUE] as Record<PropertyKey, any>;
     if (Writing.has(storeValue)) {
        setProperty(storeValue, property, undefined, true);
     }
    return true;
  },

  ownKeys: ownKeys,

  getOwnPropertyDescriptor: proxyDescriptor,

  getPrototypeOf(target) {
    return Object.getPrototypeOf(target[STORE_VALUE]);
  }
};

// Helper function to traverse a path and return the target object/array and the final key
function getAtPath(state: any, path: PathSegmentType[]): { parent: any; key: PathSegmentType } | null {
  let current = state;
  if (path.length === 0) return null; // Cannot modify root directly with path helpers
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    if (current === null || typeof current !== 'object' || !current.hasOwnProperty(segment)) {
      // Path does not exist or segment not own property
      if (__DEV__) console.warn(`Store path segment '${String(segment)}' not found or invalid.`);
      return null;
    }
    current = current[segment];
  }
  const finalKey = path[path.length - 1];
  // Final check to ensure parent is an object/array
  if (current === null || typeof current !== 'object') {
    if (__DEV__) console.warn(`Store path final parent is not an object/array.`);
    return null;
  }
  return { parent: current, key: finalKey };
}

function setProperty(
  state: Record<PropertyKey, any>,
  property: PropertyKey,
  value: any,
  deleting: boolean = false
): void {
  const prev = state[property];
  if (!deleting && prev === value) return;
  const len = Array.isArray(state) ? state.length : undefined; // Get length only if array

  if (deleting) delete state[property];
  else state[property] = value;

  // Access the internal target via the proxy reference stored on the raw state object
  const target = (state as any)[$PROXY]?.[$TARGET] as InternalStoreNodeType | undefined;
  if (!target) return;

  // Update STORE_HAS signal
  const hasNodes = target[STORE_HAS];
  if (hasNodes?.[property]) {
     hasNodes[property].write(!deleting);
  }

  // Update STORE_NODE signal
  const nodes = target[STORE_NODE];
  if (nodes?.[property]) {
    nodes[property].write(isWrappable(value) ? wrap(value) : value);
  }

  // Update length signal if it's an array and length changed
  if (len !== undefined && Array.isArray(state) && state.length !== len && nodes?.length) {
    nodes.length.write(state.length);
  }

  // Notify general tracker
  if (nodes?.[$TRACK]) {
    nodes[$TRACK].write(undefined);
  }
}

export function createStore<T extends object = {}>(
  store: T | StoreType<T>
): [get: StoreType<T>, set: StoreSetterType<T>];
export function createStore<T extends object = {}>(
  fn: (store: T) => void,
  store: T | StoreType<T>
): [get: StoreType<T>, set: StoreSetterType<T>];
export function createStore<T extends object = {}>(
  first: T | ((store: T) => void),
  second?: T | StoreType<T>
): [get: StoreType<T>, set: StoreSetterType<T>] {
  const derived = typeof first === "function",
    store = derived ? second! : first;

  const unwrappedStore = unwrap(store!, false);
  let wrappedStore = wrap(unwrappedStore);

  const baseSetStore: BaseStoreSetterType<T> = (fn: (draft: T) => void): void => {
    try {
      Writing.add(unwrappedStore);
      fn(wrappedStore);
    } finally {
      Writing.clear();
    }
  };

  // --- Add Helper Methods --- 
  const setStoreWithPath: StoreSetterWithHelpersType<T>['path'] = (...args) => {
    const value = args.pop();
    const path = args as PathSegmentType[];
    baseSetStore(draft => {
      const targetInfo = getAtPath(draft, path);
      if (targetInfo) {
        targetInfo.parent[targetInfo.key] = unwrap(value, false);
      }
    });
  };

  const setStorePush: StoreSetterWithHelpersType<T>['push'] = (path, ...items) => {
    baseSetStore(draft => {
      const targetInfo = getAtPath(draft, path);
      if (targetInfo) {
        const arr = targetInfo.parent[targetInfo.key];
        if (Array.isArray(arr)) {
          arr.push(...items.map(item => unwrap(item, false)));
        } else if (__DEV__) {
          console.warn(`Store.push: Target at path [${path.join(', ')}] is not an array.`);
        }
      }
    });
  };

  const setStoreSplice: StoreSetterWithHelpersType<T>['splice'] = (path, start, deleteCount, ...items) => {
    baseSetStore(draft => {
      const targetInfo = getAtPath(draft, path);
      if (targetInfo) {
        const arr = targetInfo.parent[targetInfo.key];
        if (Array.isArray(arr)) {
          const unwrappedItems = items.map(item => unwrap(item, false));
          if (deleteCount === undefined) {
             arr.splice(start, arr.length - start, ...unwrappedItems);
          } else {
             arr.splice(start, deleteCount, ...unwrappedItems);
          }
        } else if (__DEV__) {
          console.warn(`Store.splice: Target at path [${path.join(', ')}] is not an array.`);
        }
      }
    });
  };
  
  const setStoreInsert: StoreSetterWithHelpersType<T>['insert'] = (path, index, ...items) => {
     setStoreSplice(path, index, 0, ...items);
  };

  const setStoreRemove: StoreSetterWithHelpersType<T>['remove'] = (path, itemOrMatcher) => {
     baseSetStore(draft => {
        const targetInfo = getAtPath(draft, path);
        if (targetInfo) {
           const arr = targetInfo.parent[targetInfo.key];
           if (Array.isArray(arr)) {
              const matcher = typeof itemOrMatcher === 'function' 
                 ? itemOrMatcher 
                 : (item: any) => item === itemOrMatcher;
              for (let i = arr.length - 1; i >= 0; i--) {
                 if (matcher(arr[i], i)) {
                    arr.splice(i, 1);
                    break;
                 }
              }
           } else if (__DEV__) {
             console.warn(`Store.remove: Target at path [${path.join(', ')}] is not an array.`);
           }
        }
     });
  };

  const setStore: StoreSetterType<T> = Object.assign(baseSetStore, {
    path: setStoreWithPath,
    push: setStorePush,
    splice: setStoreSplice,
    insert: setStoreInsert,
    remove: setStoreRemove,
  });

  if (derived) return wrapProjection(first as (store: T) => void, wrappedStore, setStore);

  return [wrappedStore, setStore];
}
