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

  // Handle custom classes by preserving their prototype chain
  const isCustomClass = value && value.constructor && value.constructor !== Object && value.constructor !== Array;
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
  
  // Store the original prototype and constructor for custom classes
  if (isCustomClass) {
    const proto = Object.getPrototypeOf(value);
    (target as any).originalPrototype = proto;
    (target as any).originalConstructor = value.constructor;
    
    // Store instance properties separately to ensure they're accessible
    (target as any).instanceProperties = Object.getOwnPropertyNames(value)
      .filter(prop => typeof value[prop] !== 'function')
      .reduce((props, prop) => {
        props[prop] = value[prop];
        return props;
      }, {} as Record<string, any>);
      
    // Store instance methods to ensure they're properly bound
    (target as any).instanceMethods = Object.getOwnPropertyNames(value)
      .filter(prop => typeof value[prop] === 'function')
      .reduce((methods, prop) => {
        methods[prop] = value[prop];
        return methods;
      }, {} as Record<string, Function>);
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
    
    // Handle custom class properties
    if ((target as any).instanceProperties && property in (target as any).instanceProperties) {
      return (target as any).instanceProperties[property];
    }
    
    // Handle custom class methods
    if ((target as any).instanceMethods && property in (target as any).instanceMethods) {
      return (target as any).instanceMethods[property].bind(target[STORE_VALUE]);
    }
    
    const nodes = getNodes(target, STORE_NODE);
    const storeValue = target[STORE_VALUE];
    const tracked = nodes[property];
    
    // Handle getters on the original object
    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(storeValue, property);
      if (desc && desc.get) return desc.get.call(receiver);
    }
    
    // Handle custom class methods and properties
    if (Writing.has(storeValue)) {
      const value = tracked ? tracked._value : storeValue[property];
      return isWrappable(value) ? (Writing.add(value[$RAW] || value), wrap(value)) : value;
    }
    
    let value = tracked ? nodes[property].read() : storeValue[property];
    
    if (!tracked) {
      if (typeof value === "function") {
        // If it's a method on the prototype, bind it to the original object
        if (!storeValue.hasOwnProperty(property)) {
          // Check if this is a prototype method on a custom class or array
          let proto = Object.getPrototypeOf(storeValue);
          
          // For custom classes or arrays, bind methods to the original object
          if (proto && 
              (proto !== Object.prototype || 
               Array.isArray(storeValue) || 
               (target as any).isArray || 
               (target as any)[$TARGET_IS_ARRAY])) {
            return value.bind(storeValue);
          }
          
          // Also check the originalPrototype for custom classes
          if ((target as any).originalPrototype && 
              property in (target as any).originalPrototype) {
            return value.bind(storeValue);
          }
        }
        // Otherwise treat as a regular value
        return value;
      } else if (getObserver()) {
        // Track property access for reactivity
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
      // For custom classes, we need to update the instance properties as well
      if ((target as any).instanceProperties && typeof property === 'string') {
        (target as any).instanceProperties[property] = value;
      }
      setProperty(storeValue, property, unwrap(value, false));
    }
    return true;
  },

  deleteProperty(target, property) {
    const storeValue = target[STORE_VALUE] as Record<PropertyKey, any>;
     if (Writing.has(storeValue)) {
        // Also delete from instanceProperties if this is a custom class
        if ((target as any).instanceProperties && typeof property === 'string') {
          delete (target as any).instanceProperties[property];
        }
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
    if (!desc) return desc;
    
    // Handle array case specifically
    if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY] || Array.isArray(target[STORE_VALUE])) {
      // For arrays, we need to ensure the length property is configurable to avoid proxy errors
      if (property === 'length') {
        // Create a configurable descriptor for the length property
        return {
          value: target[STORE_VALUE].length,
          writable: true,
          enumerable: false,
          configurable: true
        };
      }
      
      // For array indices, return the actual descriptors but ensure they're configurable
      if (typeof property === 'string' && !isNaN(parseInt(property))) {
        return {
          ...desc,
          configurable: true
        };
      }
    }
    
    // For getter properties, return as-is
    if (desc.get) return desc;
    
    // For regular properties, create a getter that returns the proxied value
    return {
      configurable: true,
      enumerable: desc.enumerable,
      get: () => target[STORE_VALUE][$PROXY][property]
    };
  },

  getPrototypeOf(target) {
    // Check for arrays in a more robust way
    const storeValue = target[STORE_VALUE];
    
    // First check if the target is explicitly marked as an array
    if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) {
      return Array.prototype;
    }
    
    // Then check if we have a custom class with stored original prototype
    if ((target as any).originalPrototype) {
      return (target as any).originalPrototype;
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

  // Handle initialization if a function was provided
  if (derived) {
    try {
      Writing.add(unwrappedStore);
      (first as Function)(wrappedStore);
    } finally {
      Writing.clear();
    }
  }

  // Specialized function to handle signals 
  const extractSignalValue = (input: any): any => {
    if (!input) return input;
    
    // Direct signal value property access
    if (input && typeof input === 'object' && 'value' in input && 
        typeof input.value !== 'function' && input.value !== undefined) {
      return input.value;
    }
    
    // Try to call the signal as a function to get its value
    if (typeof input === 'function') {
      try {
        const result = input();
        if (result !== undefined) {
          return result;
        }
      } catch {}
    }
    
    // Handle $RAW property for store signals
    if (input && typeof input === 'object' && '$RAW' in input) {
      return input.$RAW || input;
    }
    
    return input;
  };

  const baseSetStore: BaseStoreSetterType<T> = (fn: (draft: T) => void): void => {
    try {
      Writing.add(unwrappedStore);
      
      // Handle the case where fn is actually a signal or a value to set directly
      if (typeof fn !== 'function') {
        const value = extractSignalValue(fn);
        
        if (value && typeof value === 'object') {
          // Apply object fields to our store
          Object.keys(value).forEach(key => {
            if (key in unwrappedStore) {
              (wrappedStore as any)[key] = value[key];
            }
          });
        } else if (value !== undefined) {
          // For primitive values, try to set it to the first property
          const firstKey = Object.keys(unwrappedStore)[0];
          if (firstKey) {
            (wrappedStore as any)[firstKey] = value;
          }
        }
      } else {
        // Regular function case
        fn(wrappedStore);
      }
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
        // Check if the value is a signal and use its value
        if (value !== null && typeof value === 'object' && '$RAW' in value) {
          targetInfo.parent[targetInfo.key] = value.value || value;
        } else {
          targetInfo.parent[targetInfo.key] = unwrap(value, false);
        }
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

// Add this at the end of the file to ensure proper Array.isArray behavior
// This patch must be applied globally for store arrays to work correctly
// The original Array.isArray is saved for internal use
const originalArrayIsArray = Array.isArray;

// Export it for other modules to access
export { originalArrayIsArray };

// Override Array.isArray to handle our store proxies
Array.isArray = function isArrayPatched(obj): obj is any[] {
  // First try the original method
  if (originalArrayIsArray(obj)) return true;
  
  // Handle our proxy objects
  if (obj && typeof obj === 'object') {
    // Check if it's a proxy with our special properties
    const target = obj[$TARGET];
    if (target) {
      // Check if it's marked as an array
      if (target.isArray || target[$TARGET_IS_ARRAY]) {
        return true;
      }
      // Check if the underlying value is an array
      if (originalArrayIsArray(target[STORE_VALUE])) {
        return true;
      }
    }
    
    // Check if it has array-like properties
    if (obj[$RAW] && originalArrayIsArray(obj[$RAW])) {
      return true;
    }
    
    // Enhanced detection: Look for array behavior
    try {
      // Check for array properties and methods
      if (typeof obj.length === 'number' && 
          typeof obj.push === 'function' && 
          typeof obj.splice === 'function' &&
          typeof obj.map === 'function') {
        return true;
      }
      
      // Check for array's Symbol.toStringTag
      if (Object.prototype.toString.call(obj) === '[object Array]') {
        return true;
      }
      
      // Check for array iterator
      if (typeof obj[Symbol.iterator] === 'function' && 
          !Object.prototype.propertyIsEnumerable.call(obj, 'length')) {
        return true;
      }
    } catch (e) {
      // Safely handle any access errors
    }
  }
  
  // Default to the original result
  return false;
};
