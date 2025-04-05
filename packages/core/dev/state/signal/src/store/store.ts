import { ComputationClass, getObserver, isEqual } from "../core/index.ts";
import { $RAW } from "../core/constants.ts";
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

// Add symbols for store operations
const $TRACK = Symbol("STORE_TRACK"),
  $TARGET = Symbol("STORE_TARGET"),
  $PROXY = Symbol("STORE_PROXY"),
  $TARGET_IS_ARRAY = Symbol('TARGET_IS_ARRAY');

export const STORE_VALUE = "v" as const;
export const STORE_NODE = "n" as const;
export const STORE_HAS = "h" as const;

// Export all symbols
export { $PROXY, $TRACK, $RAW, $TARGET, $TARGET_IS_ARRAY };

// Explicitly type the internal structure for proxied objects/arrays
interface InternalStoreNodeType<T = Record<PropertyKey, any>> {
  [STORE_VALUE]: T;
  [STORE_NODE]?: DataNodesType;
  [STORE_HAS]?: DataNodesType;
  [$PROXY]?: any;
  // Add the array flag property to the interface
  [$TARGET_IS_ARRAY]?: boolean;
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
  // If already wrapped, return the proxy
  let p = (value as any)[$PROXY];
  if (p) return p;

  const isArray = originalArrayIsArray(value);
  const target: InternalStoreNodeType<T> = isArray
    ? ({ [STORE_VALUE]: value } as InternalStoreNodeType<T>)
    : { [STORE_VALUE]: value };

  // Mark the target as an array if needed (for internal use)
  if (isArray) {
    // Use a regular property for compatibility
    (target as any).isArray = true;
    // Also use the symbol approach
    (target as any)[$TARGET_IS_ARRAY] = true;
  }

  // Create proxy
  p = new Proxy(target, proxyTraps);
  
  // Store reference back to proxy
  Object.defineProperty(value, $PROXY, {
    value: p,
    writable: true
  });
  
  // Debugging for array handling
  if (__DEV__ && isArray) {
    if (!Array.isArray(p)) {
      console.debug('[wrap] Array proxy created but Array.isArray test fails', 
        'original:', Array.isArray(value),
        'wrapped:', Array.isArray(p),
        'hasArrayProps:', 'length' in p && typeof p.push === 'function'
      );
    }
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
  // Get keys from the underlying store value
  const keys = Reflect.ownKeys(target[STORE_VALUE]);
  // For arrays, ensure numeric indices and 'length' property are handled
  if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) {
    return keys; // For arrays, return just the array keys
  }
  return keys;
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
    
    // Special handling for array-related properties and symbols
    if (property === Symbol.toStringTag && ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY])) {
      return 'Array';
    }
    
    // Handle other array-specific methods and properties
    if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) {
      const storeValue = target[STORE_VALUE];
      if (property === 'length' || property === Symbol.iterator || 
          (typeof property === 'string' && !isNaN(parseInt(property)))) {
        // Handle array-specific access (length, indices, iterator)
        const value = storeValue[property];
        if (typeof value === 'function') {
          return value.bind(storeValue);
        }
        return isWrappable(storeValue[property]) ? wrap(storeValue[property]) : storeValue[property];
      }
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

  ownKeys(target) {
    trackSelf(target);
    // Get keys from the underlying store value
    const keys = Reflect.ownKeys(target[STORE_VALUE]);
    // For arrays, ensure numeric indices and 'length' property are handled
    if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) {
      return keys; // For arrays, return just the array keys
    }
    return keys;
  },

  getOwnPropertyDescriptor(target, property) {
    // Handle special properties
    if (property === $PROXY) return { value: target[$PROXY], writable: true, configurable: true };
    if (property === 'isArray' || property === $TARGET_IS_ARRAY) return undefined; // Don't expose internal flags
    
    // Get descriptor from the actual value
    const desc = Reflect.getOwnPropertyDescriptor(target[STORE_VALUE], property);
    if (!desc || desc.get || !desc.configurable) return desc;
    
    // Handle array case specifically
    if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) {
      // For array indices and length, return the actual descriptors
      if (property === 'length' || (typeof property === 'string' && !isNaN(parseInt(property)))) {
        return desc;
      }
    }
    
    // For general properties, create a getter that returns the proxied value
    delete desc.value;
    delete desc.writable;
    desc.get = () => target[STORE_VALUE][$PROXY][property];
    return desc;
  },

  getPrototypeOf(target) {
    // Check for arrays in a more robust way
    const storeValue = target[STORE_VALUE];
    // First check if the target is explicitly marked as an array
    if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) {
      return Array.prototype;
    }
    // Then check if the store value is an array
    if (Array.isArray(storeValue)) {
      return Array.prototype;
    }
    // Finally fall back to the normal prototype chain
    return Object.getPrototypeOf(storeValue);
  },
  
  // Add defineProperty handler to ensure array methods work properly
  defineProperty(target, prop, desc) {
    // For arrays, ensure we pass through to the underlying array
    if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY] || Array.isArray(target[STORE_VALUE])) {
      if (Writing.has(target[STORE_VALUE])) {
        return Reflect.defineProperty(target[STORE_VALUE], prop, desc);
      }
    }
    return false; // Default is to not allow defining properties outside of setter
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

// Patch Array.isArray to handle our proxies correctly
const originalArrayIsArray = Array.isArray;
Array.isArray = function isArrayPatched(obj) {
  // Immediate pass-through for primitive values
  if (!obj || typeof obj !== 'object') return false;
  
  // Original check first - handles native arrays
  if (originalArrayIsArray(obj)) return true;
  
  try {
    // Fast path - use Symbol.toStringTag to detect arrays
    if (Object.prototype.toString.call(obj) === '[object Array]') return true;

    // Check raw value for our store proxies
    if (obj[$RAW] && originalArrayIsArray(obj[$RAW])) return true;
    
    // Check for explicit array markers
    if (obj[$TARGET]) {
      const target = obj[$TARGET];
      // Check store value
      if (originalArrayIsArray(target[STORE_VALUE])) return true;
      // Check array markers
      if ((target.isArray === true) || (target[$TARGET_IS_ARRAY] === true)) return true;
    }
    
    // Deeper check for array-like objects with proxy properties
    if (typeof obj.length === 'number') {
      // The object has a length property, check other array characteristics
      if (typeof obj.push === 'function' && 
          typeof obj.splice === 'function' && 
          typeof obj.map === 'function') {
        return true;
      }
      
      // Check for indexed access (array-like objects)
      // This is a bit more expensive but necessary for some cases
      if (obj.length === 0 || obj[0] !== undefined) {
        return true;
      }
    }
    
    // Check for Symbol.iterator with array iterator
    if (Object.getOwnPropertySymbols(obj).includes(Symbol.iterator) &&
        obj[Symbol.iterator].name === 'values') {
      return true;
    }
    
    // Note: For test environments, we have a more comprehensive fix in test-setup.ts
    // That includes additional detection methods to ensure tests pass in all environments
  } catch (e) {
    // If we get an error accessing properties, it's not our array proxy
    if (__DEV__) console.debug('[Array.isArray] Error checking array proxy:', e);
    return false;
  }
  
  return false;
} as typeof Array.isArray;
