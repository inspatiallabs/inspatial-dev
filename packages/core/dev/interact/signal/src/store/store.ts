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

  // Handle special cases
  if (!value || typeof value !== 'object') {
    return value;
  }

  // Handle custom classes by preserving their prototype chain
  const isCustomClass = value && value.constructor && value.constructor !== Object && value.constructor !== Array;
  const isArray = originalArrayIsArray(value);
  
  const target: InternalStoreNodeType<T> = isArray
    ? ({ [STORE_VALUE]: value, [$TARGET_IS_ARRAY]: true } as InternalStoreNodeType<T>)
    : { [STORE_VALUE]: value };

  // Mark the target as an array if needed with both techniques for backward compatibility
  if (isArray) {
    // Use a regular property for compatibility with older code
    (target as any).isArray = true;
  }
  
  // Store the original prototype and constructor for custom classes
  if (isCustomClass) {
    const proto = Object.getPrototypeOf(value);
    (target as any).originalPrototype = proto;
    (target as any).originalConstructor = value.constructor;
    
    // For custom classes, copy all properties including prototype inherited ones
    // This ensures we have access to everything on the class instance
    const instanceProperties: Record<string, any> = {};
    const instanceMethods: Record<string, Function> = {};
    
    // Helper function to store property
    const storeProperty = (obj: any, prop: string) => {
      // Skip special properties and functions
      if (prop === '$PROXY' || prop === '$RAW' || prop === 'constructor') return;
        
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!descriptor) return;
      
      // If it's a getter/setter, add a special accessor
      if (descriptor.get || descriptor.set) {
        // Will be handled through prototype chain
        return;
      }
      
      try {
        // Store by type
        const propValue = obj[prop];
        if (typeof propValue === 'function') {
          instanceMethods[prop] = propValue;
        } else {
          instanceProperties[prop] = propValue;
        }
      } catch (e) {
        // Ignore errors accessing properties
      }
    };
    
    // First get all own properties from the instance
    Object.getOwnPropertyNames(value).forEach(prop => 
      storeProperty(value, prop)
    );
    
    // Then collect inherited properties
    let currentProto = proto;
    while (currentProto && currentProto !== Object.prototype && currentProto !== Array.prototype) {
      Object.getOwnPropertyNames(currentProto).forEach(prop => {
        // Skip already stored properties
        if (prop in instanceMethods || prop in instanceProperties) return;
        
        storeProperty(currentProto, prop);
      });
      currentProto = Object.getPrototypeOf(currentProto);
    }
    
    // Store collected properties and methods
    (target as any).instanceProperties = instanceProperties;
    (target as any).instanceMethods = instanceMethods;
  }

  // Create proxy
  p = new Proxy(target, proxyTraps);
  
  // Store reference back to proxy
  Object.defineProperty(value, $PROXY, {
    value: p,
    writable: true,
    configurable: true
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
  // If there's an active observer, track access to the object itself
  const observer = getObserver();
  if (!observer) return;
  
  // Get or create the tracking nodes
  const nodes = getNodes(target, STORE_NODE);
  const trackNode = getNode(nodes, $TRACK, undefined, false);
  
  // Track the access to the object itself
  trackNode.read();
  
  const storeValue = target[STORE_VALUE];
  
  // Additional tracking for arrays
  if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY] || Array.isArray(storeValue)) {
    // For arrays, we need to track length and also iterate properties
    const lengthNode = getNode(nodes, 'length', storeValue.length);
    lengthNode.read();
    
    // Optionally track access to array items based on current use case
    if (Array.isArray(storeValue) && storeValue.length > 0) {
      for (let i = 0; i < storeValue.length; i++) {
        // This creates tracking nodes for all array items
        const itemNode = getNode(nodes, i.toString(), storeValue[i]);
        // We don't read from this node now, it'll be read on direct access
      }
    }
  }
  
  // For custom classes, ensure we're tracking all properties correctly
  if ((target as any).originalPrototype && 
      (target as any).instanceProperties) {
    // Track all instance properties
    Object.keys((target as any).instanceProperties).forEach(key => {
      const propNode = getNode(nodes, key, (target as any).instanceProperties[key]);
      // We don't read here, will be read on direct access
    });
  }
}

function ownKeys(target: StoreNodeType) {
  trackSelf(target);
  
  const storeValue = target[STORE_VALUE];
  
  // For arrays, we need to track length and also set up tracking for array indices
  if ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY] || Array.isArray(storeValue)) {
    // Get all keys including numeric indices for arrays
    return Reflect.ownKeys(storeValue);
  }
  
  // For objects, get keys normally
  return Reflect.ownKeys(storeValue);
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
    
    // Get the underlying store value
    const storeValue = target[STORE_VALUE];
    
    // Handle custom class properties - check in order:
    
    // 1. Check for stored instance methods
    if ((target as any).instanceMethods && 
        property in (target as any).instanceMethods) {
      return (target as any).instanceMethods[property].bind(storeValue);
    }
    
    // 2. Check for stored instance properties
    if ((target as any).instanceProperties && 
        property in (target as any).instanceProperties && 
        property !== $PROXY && property !== $RAW) {
      return (target as any).instanceProperties[property];
    }
    
    // 3. Handle array-specific methods and properties
    if (((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) &&
        (property === 'length' || property === Symbol.iterator ||
        typeof property === 'string' && !isNaN(parseInt(property, 10)))) {
      if (property === 'length') {
        // Track length property access for reactivity
        getObserver() && getNode(getNodes(target, STORE_NODE), 'length', storeValue.length).read();
        return storeValue.length;
      }
      
      // For array methods, bind to the original array
      const value = storeValue[property];
      if (typeof value === 'function') {
        return value.bind(storeValue);
      }
      
      // For array indices, return wrapped values
      return isWrappable(value) ? wrap(value) : value;
    }
    
    // 4. Check for properties on the prototype chain
    if ((target as any).originalPrototype && 
        property in (target as any).originalPrototype && 
        !(property in storeValue)) {
      const proto = (target as any).originalPrototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, property);
      if (descriptor?.get) {
        return descriptor.get.call(storeValue);
      }
      const value = proto[property];
      if (typeof value === 'function') {
        return value.bind(storeValue);
      }
      return value;
    }
    
    // 5. Check for properties on the original object using descriptor
    const descriptor = Object.getOwnPropertyDescriptor(storeValue, property);
    if (descriptor?.get) {
      return descriptor.get.call(receiver);
    }
    
    // 6. Standard property tracking logic
    const nodes = getNodes(target, STORE_NODE);
    let tracked = nodes[property];
    
    // Handle property access during a write operation
    if (Writing.has(storeValue)) {
      const value = tracked ? tracked._value : storeValue[property];
      return isWrappable(value) ? (Writing.add(value[$RAW] || value), wrap(value)) : value;
    }
    
    let value = tracked ? nodes[property].read() : storeValue[property];
    
    if (!tracked) {
      if (typeof value === "function") {
        // If the function is on the prototype, bind it to the original
        if (!storeValue.hasOwnProperty(property)) {
          return value.bind(storeValue);
        }
        // Return regular functions as-is
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
      
      // Unwrap value for actual storage
      const unwrappedValue = unwrap(value, false);
      
      // Update the underlying object
      setProperty(storeValue, property, unwrappedValue);
      
      // Also update the original getter/setter target if this is a class
      if ((target as any).originalPrototype) {
        try {
          const descriptor = Object.getOwnPropertyDescriptor((target as any).originalPrototype, property);
          if (descriptor?.set) {
            // If there's a setter on the prototype, call it
            descriptor.set.call(storeValue, unwrappedValue);
          }
        } catch (e) {
          // Ignore errors trying to use setters
        }
      }
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
    
    // First check if it's explicitly marked as an array
    if ((target as any).isArray || target[$TARGET_IS_ARRAY]) {
      return Array.prototype;
    }
    
    // Then check for original array
    if (originalArrayIsArray(storeValue)) {
      return Array.prototype;
    }
    
    // Then check for custom class with stored original prototype
    if ((target as any).originalPrototype) {
      return (target as any).originalPrototype;
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

  // Make the actual change to the state
  if (deleting) delete state[property];
  else state[property] = value;

  // Access the internal target via the proxy reference stored on the raw state object
  const target = (state as any)[$PROXY]?.[$TARGET] as InternalStoreNodeType | undefined;
  if (!target) return;

  // Notify all tracking systems about the change

  // 1. Update STORE_HAS signal for 'in' operator tracking
  const hasNodes = target[STORE_HAS];
  if (hasNodes?.[property]) {
    hasNodes[property].write(!deleting);
  }

  // 2. Update STORE_NODE signal for direct property access tracking
  const nodes = target[STORE_NODE];
  if (nodes?.[property]) {
    const wrappedValue = isWrappable(value) ? wrap(value) : value;
    // Explicitly re-write even if equal to ensure notifications happen
    nodes[property].write(wrappedValue);
  }

  // 3. Special handling for arrays - update length tracking
  if (len !== undefined && Array.isArray(state) && state.length !== len && nodes?.length) {
    // Notify length changes for arrays
    nodes.length.write(state.length);
  }

  // 4. Notify the general tracking for object/array-level changes
  if (nodes?.[$TRACK]) {
    // Force notification for the entire object
    nodes[$TRACK].write(undefined);
  }
  
  // 5. For custom classes, update any stored instance properties
  if ((target as any).instanceProperties && typeof property === 'string') {
    (target as any).instanceProperties[property] = value;
    
    // If modifying a class, we need to trigger self-tracking
    // because the test expects the entire object to be tracked
    if ((target as any).originalPrototype) {
      if (nodes?.[$TRACK]) {
        nodes[$TRACK].write(undefined);
      }
    }
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
  if (originalArrayIsArray(obj)) {
    return true;
  }
  
  // If not an object, it can't be an array
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  try {
    // Case 1: Our proxied array with $TARGET
    if (obj[$TARGET]) {
      const target = obj[$TARGET];
      
      // Check for explicit array flags first
      if (target[$TARGET_IS_ARRAY] === true || (target as any).isArray === true) {
        return true;
      }
      
      // Check if the store value is an array
      const storeValue = target[STORE_VALUE];
      if (storeValue && originalArrayIsArray(storeValue)) {
        return true;
      }
    }
    
    // Case 2: Raw value access
    if (obj[$RAW] && originalArrayIsArray(obj[$RAW])) {
      return true;
    }
    
    // Case 3: Check if it has array methods (as a fallback)
    if ('length' in obj && 
        typeof obj.length === 'number' && 
        typeof obj.push === 'function' && 
        typeof obj.splice === 'function' && 
        typeof obj.indexOf === 'function' && 
        typeof obj.concat === 'function' &&
        Symbol.iterator in obj) {
      // It has all the critical array methods and properties
      return true;
    }
    
    // Case 4: Special check for toString tag (last resort)
    if (Object.prototype.toString.call(obj) === '[object Array]') {
      return true;
    }
    
  } catch (e) {
    // Ignore errors accessing properties
  }
  
  // Default to false
  return false;
};
