import {
  ComputationClass,
  getObserver,
  isEqual,
  UNCHANGED,
} from "./core/index.ts";
import { $RAW } from "./core/constants.ts";
import { flushSync as immediateFlushSync } from "./core/scheduler.ts";
import { StoreNodeClass } from "./store-node.ts";

export type StoreType<T> = Readonly<T>;

// Base Setter type
type BaseStoreSetterType<T> = (fn: (state: T) => void) => void;

// Type for path segments
type PathSegmentType = string | number;

// Extended Setter type with helpers
export interface StoreSetterWithHelpersType<T> extends BaseStoreSetterType<T> {
  path(...args: [...PathSegmentType[], any]): void;
  push(path: PathSegmentType[], ...items: any[]): void;
  splice(
    path: PathSegmentType[],
    start: number,
    deleteCount?: number,
    ...items: any[]
  ): void;
  insert(path: PathSegmentType[], index: number, ...items: any[]): void;
  remove(
    path: PathSegmentType[],
    itemOrMatcher: any | ((item: any, index: number) => boolean)
  ): void;
}

// Use the extended type alias for external export if needed, or directly in createStore return type.
export type StoreSetterType<T> = StoreSetterWithHelpersType<T>;

type DataNodeType = ComputationClass<any>;
type DataNodesType = Record<PropertyKey, DataNodeType>;

// Add symbols for store operations
const $TRACK = Symbol("STORE_TRACK"),
  $TARGET = Symbol("STORE_TARGET"),
  $PROXY = Symbol("STORE_PROXY"),
  $TARGET_IS_ARRAY = Symbol("TARGET_IS_ARRAY");

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
  if (!value || typeof value !== "object") {
    return value;
  }

  // Handle custom classes by preserving their prototype chain
  const isCustomClass =
    value &&
    value.constructor &&
    value.constructor !== Object &&
    value.constructor !== Array;

  // Use standard detector for arrays
  const isArray = Array.isArray(value);

  const target: InternalStoreNodeType<T> = isArray
    ? ({
        [STORE_VALUE]: value,
        [$TARGET_IS_ARRAY]: true,
      } as InternalStoreNodeType<T>)
    : { [STORE_VALUE]: value };

  // Mark the target as an array if needed with both techniques for backward compatibility
  if (isArray) {
    // Use a regular property for compatibility with older code
    (target as any).isArray = true;

    // Special Symbol.toStringTag to ensure [].toString.call() works
    Object.defineProperty(target[STORE_VALUE], Symbol.toStringTag, {
      value: "Array",
      configurable: true,
      enumerable: false,
      writable: true,
    });
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
      if (prop === "$PROXY" || prop === "$RAW" || prop === "constructor")
        return;

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
        if (typeof propValue === "function") {
          instanceMethods[prop] = propValue;
        } else {
          instanceProperties[prop] = propValue;
        }
      } catch (e) {
        // Ignore errors accessing properties
      }
    };

    // First get all own properties from the instance
    Object.getOwnPropertyNames(value).forEach((prop) =>
      storeProperty(value, prop)
    );

    // Then collect inherited properties
    let currentProto = proto;
    while (
      currentProto &&
      currentProto !== Object.prototype &&
      currentProto !== Array.prototype
    ) {
      Object.getOwnPropertyNames(currentProto).forEach((prop) => {
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
    configurable: true,
  });

  // Debugging for array handling
  if (__DEV__ && isArray) {
    if (!Array.isArray(p)) {
      console.debug(
        "[wrap] Array proxy created but Array.isArray test fails",
        "original:",
        Array.isArray(value),
        "wrapped:",
        Array.isArray(p),
        "hasArrayProps:",
        "length" in p && typeof p.push === "function"
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

function getNodes(
  target: StoreNodeType,
  type: typeof STORE_NODE | typeof STORE_HAS
): DataNodesType {
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
  // Use StoreNodeClass instead of ComputationClass for proper observer tracking
  return (nodes[property] = new StoreNodeClass(value, equals));
}

function proxyDescriptor(target: StoreNodeType, property: PropertyKey) {
  if (property === $PROXY)
    return { value: target[$PROXY], writable: true, configurable: true };
  
  const storeValue = target[STORE_VALUE];
  const desc = Reflect.getOwnPropertyDescriptor(storeValue, property);
  if (!desc) return desc;
  
  // For array length property, return the exact descriptor from the underlying array
  if (property === 'length' && Array.isArray(storeValue)) {
    return desc;
  }
  
  // For non-configurable properties, return as-is
  if (!desc.configurable) return desc;
  
  // For getters, return as-is
  if (desc.get) return desc;
  
  // Only modify configurable data properties to use proxy getter
  const modifiedDesc = { ...desc };
  delete modifiedDesc.value;
  delete modifiedDesc.writable;
  modifiedDesc.get = () => target[STORE_VALUE][$PROXY][property];
  return modifiedDesc;
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
  if (
    (target as any).isArray ||
    (target as any)[$TARGET_IS_ARRAY] ||
    Array.isArray(storeValue)
  ) {
    // For arrays, we need to track length and also iterate properties
    const lengthNode = getNode(nodes, "length", storeValue.length);
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
  if ((target as any).originalPrototype && (target as any).instanceProperties) {
    // Track all instance properties
    Object.keys((target as any).instanceProperties).forEach((key) => {
      const propNode = getNode(
        nodes,
        key,
        (target as any).instanceProperties[key]
      );
      // We don't read here, will be read on direct access
    });
  }
}

function ownKeys(target: StoreNodeType) {
  trackSelf(target);

  const storeValue = target[STORE_VALUE];

  // For arrays, we need to track length and also set up tracking for array indices
  if (
    (target as any).isArray ||
    (target as any)[$TARGET_IS_ARRAY] ||
    Array.isArray(storeValue)
  ) {
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
    if (
      property === Symbol.toStringTag &&
      ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY])
    ) {
      return "Array";
    }

    // Get the underlying store value
    const storeValue = target[STORE_VALUE];

    // CRITICAL FIX: Track property access BEFORE custom class handling
    const observer = getObserver();
    const nodes = getNodes(target, STORE_NODE);

    // Handle custom class properties with proper tracking
    if ((target as any).originalPrototype) {
      // For methods in instanceMethods
      if (
        (target as any).instanceMethods &&
        property in (target as any).instanceMethods
      ) {
        // Track method access if there's an observer
        if (observer) {
          const node = getNode(
            nodes,
            property,
            (target as any).instanceMethods[property]
          );
          node.read();
        }
        return (target as any).instanceMethods[property].bind(storeValue);
      }

      // For properties in instanceProperties
      if (
        (target as any).instanceProperties &&
        property in (target as any).instanceProperties &&
        property !== $PROXY &&
        property !== $RAW
      ) {
        // Get the current value directly from the instance for up-to-date access
        try {
          // Check if the property exists and return the current value
          if (property in storeValue) {
            const value = storeValue[property];
            // Track the property access
            if (observer) {
              const node = getNode(nodes, property, value);
              node.read();
            }
            return isWrappable(value) ? wrap(value) : value;
          }

          // Fall back to stored properties with tracking
          const storedValue = (target as any).instanceProperties[property];
          if (observer) {
            const node = getNode(nodes, property, storedValue);
            node.read();
          }
          return storedValue;
        } catch (e) {
          // If accessing fails, return stored value as fallback
          const fallbackValue = (target as any).instanceProperties[property];
          if (observer) {
            const node = getNode(nodes, property, fallbackValue);
            node.read();
          }
          return fallbackValue;
        }
      }

      // Check for properties on prototype chain with getters
      const proto = (target as any).originalPrototype;
      if (property in proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, property);
        if (descriptor?.get) {
          const value = descriptor.get.call(storeValue);
          if (observer) {
            const node = getNode(nodes, property, value);
            node.read();
          }
          return value;
        }

        // Handle class methods from prototype
        const value = proto[property];
        if (typeof value === "function") {
          return value.bind(storeValue);
        }
      }
    }

    // Handle array-specific methods and properties
    if (
      ((target as any).isArray || (target as any)[$TARGET_IS_ARRAY]) &&
      (property === "length" ||
        property === Symbol.iterator ||
        (typeof property === "string" && !isNaN(parseInt(property, 10))))
    ) {
      if (property === "length") {
        // Track length property access for reactivity
        if (observer) {
          getNode(nodes, "length", storeValue.length).read();
        }
        return storeValue.length;
      }

      // For array methods, bind to the original array
      const value = storeValue[property];
      if (typeof value === "function") {
        return value.bind(storeValue);
      }

      // For array indices, return wrapped values with tracking
      if (observer) {
        const node = getNode(nodes, property, value);
        node.read();
      }
      return isWrappable(value) ? wrap(value) : value;
    }

    // Check for properties on the original object using descriptor
    const descriptor = Object.getOwnPropertyDescriptor(storeValue, property);
    if (descriptor?.get) {
      return descriptor.get.call(receiver);
    }

    // Standard property tracking logic
    let tracked = nodes[property];

    // Handle property access during a write operation
    if (Writing.has(storeValue)) {
      // CRITICAL FIX: Even during writes, we need to ensure nodes exist for tracking
      if (!tracked && observer) {
        tracked = getNode(nodes, property, storeValue[property]);
      }
      const value = tracked ? tracked._value : storeValue[property];
      return isWrappable(value)
        ? (Writing.add(value[$RAW] || value), wrap(value))
        : value;
    }

    // CRITICAL FIX: Always ensure we call read() on the node when there's an observer
    if (observer) {
      // Get or create the node and read from it
      const node = getNode(nodes, property, storeValue[property]);
      const value = node.read();
      return isWrappable(value) ? wrap(value) : value;
    }

    // No observer, just return the value
    let value = tracked ? tracked._value : storeValue[property];

    if (!tracked) {
      if (typeof value === "function") {
        // If the function is on the prototype, bind it to the original
        if (!storeValue.hasOwnProperty(property)) {
          return value.bind(storeValue);
        }
        // Return regular functions as-is
        return value;
      }
    }

    return isWrappable(value) ? wrap(value) : value;
  },

  has(target, property) {
    if (
      property === $RAW ||
      property === $PROXY ||
      property === $TRACK ||
      property === $TARGET ||
      property === STORE_HAS ||
      property === STORE_NODE
    )
      return true;
    const observer = getObserver();
    const desc = Object.getOwnPropertyDescriptor(target[STORE_VALUE], property);
    if (
      observer &&
      (typeof desc?.value !== "function" || target.hasOwnProperty(property))
    ) {
      const nodes = getNodes(target, STORE_HAS);
      const node = getNode(nodes, property, desc?.value !== undefined);
      node.read();
    }
    return desc?.value !== undefined;
  },

  set(target, property, value) {
    const storeValue = target[STORE_VALUE];
    if (property === $PROXY || property === $RAW || property === $TARGET)
      return true;

    // Debug logging
    if (__DEV__) {
      console.log(`[PROXY SET] property: ${String(property)}, value: ${value}`);
    }

    // Check for custom class property
    if (
      (target as any).originalPrototype &&
      (target as any).instanceProperties
    ) {
      if (property in (target as any).instanceProperties) {
        (target as any).instanceProperties[property] = value;
      }
    }

    const unwrappedValue = unwrap(value, false);
    const prev = storeValue[property];
    if (isEqual(prev, unwrappedValue)) return true;

    const isUndefined = value === undefined;
    if (isUndefined && !(property in storeValue)) return true;

    if (isUndefined) {
      delete storeValue[property];
    } else {
      storeValue[property] = unwrappedValue;
    }

    // CRITICAL FIX: Manually trigger node updates for all tracked properties
    let nodes = target[STORE_NODE];
    if (__DEV__) {
      console.log(`[PROXY SET] nodes exists: ${!!nodes}`);
      if (nodes) {
        console.log(
          `[PROXY SET] node for ${String(property)} exists: ${!!nodes[
            property
          ]}`
        );
      }
    }

    if (nodes) {
      const node = nodes[property];
      if (node) {
        // Manually write the value and notify subscribers
        if (__DEV__) {
          console.log(
            `[PROXY SET] Calling write on node for ${String(property)}`
          );
        }
        node.write(
          isWrappable(unwrappedValue) ? wrap(unwrappedValue) : unwrappedValue
        );
      }
    }

    // Also update HAS nodes if property was added/removed
    let hasNodes = target[STORE_HAS];
    if (hasNodes) {
      const hasNode = hasNodes[property];
      if (hasNode) {
        hasNode.write(!isUndefined);
      }
    }

    // CRITICAL FIX: Ensure synchronous effect execution
    try {
      if (batchDepth > 0) {
        pendingFlush = true;
      } else {
        immediateFlushSync();
      }
    } catch (e) {
      if (__DEV__) {
        console.error("Error during flushSync after store update:", e);
      }
    }

    return true;
  },

  deleteProperty(target, property) {
    const storeValue = target[STORE_VALUE];
    const prev = storeValue[property];
    const isUndefined = prev === undefined;
    if (isUndefined && !(property in storeValue)) return true;

    delete storeValue[property];

    // Update nodes
    let nodes = target[STORE_NODE];
    if (nodes && nodes[property]) {
      nodes[property].write(undefined);
    }

    let hasNodes = target[STORE_HAS];
    if (hasNodes && hasNodes[property]) {
      hasNodes[property].write(false);
    }

    // Ensure synchronous effect execution
    try {
      if (batchDepth > 0) {
        pendingFlush = true;
      } else {
        immediateFlushSync();
      }
    } catch (e) {
      if (__DEV__) {
        console.error("Error during flushSync after delete:", e);
      }
    }

    return true;
  },

  ownKeys(target) {
    return ownKeys(target);
  },

  getOwnPropertyDescriptor(target, property) {
    return proxyDescriptor(target, property);
  },

  getPrototypeOf(target) {
    // For custom classes, return the original prototype
    if ((target as any).originalPrototype) {
      return (target as any).originalPrototype;
    }

    // For regular objects/arrays, return the prototype of the value
    return Object.getPrototypeOf(target[STORE_VALUE]);
  },

  defineProperty(target, prop, desc) {
    const storeValue = target[STORE_VALUE];
    return Object.defineProperty(storeValue, prop, desc) as any as boolean;
  },
};

function getAtPath(
  state: any,
  path: PathSegmentType[]
): { parent: any; key: PathSegmentType } | null {
  if (!path.length) return null;

  let current = state;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    current = current[segment];
    if (!current || typeof current !== "object") {
      return null;
    }
  }

  return {
    parent: current,
    key: path[path.length - 1],
  };
}

// Add batch control variables at the top
let batchDepth = 0;
let pendingFlush = false;

// Export batch function
export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    const result = fn();
    return result;
  } finally {
    batchDepth--;
    if (batchDepth === 0 && pendingFlush) {
      pendingFlush = false;
      immediateFlushSync();
    }
  }
}

function setProperty(
  state: Record<PropertyKey, any>,
  property: PropertyKey,
  value: any,
  deleting: boolean = false
): void {
  if (!deleting && state[property] === value) return;

  const unwrapped = unwrap(value, false);
  const prev = state[property];
  const isEqual_ = isEqual(prev, unwrapped);

  if (isEqual_ && !deleting) return;

  const isUndefined = value === undefined;
  if (isUndefined || deleting) {
    delete state[property];
  } else {
    state[property] = unwrapped;
  }

  // Get the proxy target if state is wrapped
  const proxy = state[$PROXY];
  if (proxy) {
    const target = proxy[$TARGET];
    if (target) {
      // Update the nodes if they exist
      const nodes = target[STORE_NODE];
      if (nodes && nodes[property]) {
        nodes[property].write(
          deleting || isUndefined
            ? undefined
            : isWrappable(unwrapped)
            ? wrap(unwrapped)
            : unwrapped
        );
      }

      // Update HAS nodes
      const hasNodes = target[STORE_HAS];
      if (hasNodes && hasNodes[property]) {
        hasNodes[property].write(!(deleting || isUndefined));
      }
    }
  }

  // CRITICAL FIX: Check if we're in a batch
  if (batchDepth > 0) {
    pendingFlush = true;
  } else {
    // Ensure synchronous effect execution
    try {
      immediateFlushSync();
    } catch (e) {
      if (__DEV__) {
        console.error("Error during flushSync after store update:", e);
      }
    }
  }
}

// Export fixed createStore function that properly handles effects
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
  let unwrappedStore: T;
  let initFn: ((store: T) => void) | undefined;

  if (typeof first === "function") {
    initFn = first as (store: T) => void;
    unwrappedStore = (second !== undefined ? unwrap(second) : {}) as T;
  } else {
    unwrappedStore = unwrap(first) as T;
  }

  // Wrap the store to create a proxy
  const wrappedStore = wrap(unwrappedStore) as StoreType<T>;

  // CRITICAL FIX: Recursively wrap all nested objects
  function deepWrapStore(obj: any, visited = new WeakSet()): void {
    if (!obj || typeof obj !== "object" || visited.has(obj)) return;
    visited.add(obj);

    // Get the raw value if it's already wrapped
    const raw = obj[$RAW] || obj;

    // Iterate through all properties
    for (const key of Object.keys(raw)) {
      const value = raw[key];
      if (isWrappable(value)) {
        // Wrap the value and assign it back
        raw[key] = wrap(value);
        // Recursively wrap nested objects
        deepWrapStore(raw[key], visited);
      }
    }
  }

  // Apply deep wrapping after creating the proxy
  deepWrapStore(unwrappedStore);

  // If there's an init function, run it to set initial values
  if (initFn) {
    Writing.add(unwrappedStore);
    initFn(wrappedStore as T);
    Writing.delete(unwrappedStore);
  }

  const extractSignalValue = (input: any): any => {
    if (
      input &&
      typeof input === "object" &&
      typeof input.peek === "function"
    ) {
      try {
        const value = input.peek();
        return extractSignalValue(value);
      } catch (e) {
        return input;
      }
    }
    return input;
  };

  const baseSetStore: BaseStoreSetterType<T> = (
    fn: (draft: T) => void
  ): void => {
    // Batch all updates within a single setStore call
    batch(() => {
      Writing.add(unwrappedStore);
      try {
        fn(wrappedStore as T);
      } finally {
        Writing.delete(unwrappedStore);
      }
    });
  };

  const setStoreWithPath: StoreSetterWithHelpersType<T>["path"] = (...args) => {
    const path = args.slice(0, -1) as PathSegmentType[];
    const value = extractSignalValue(args[args.length - 1]);

    baseSetStore((draft) => {
      const target = getAtPath(draft, path);
      if (target) {
        setProperty(target.parent, target.key, value);
      }
    });
  };

  const setStorePush: StoreSetterWithHelpersType<T>["push"] = (
    path,
    ...items
  ) => {
    baseSetStore((draft) => {
      const target = getAtPath(draft, path);
      if (target && Array.isArray(target.parent[target.key])) {
        target.parent[target.key].push(...items.map(extractSignalValue));
      }
    });
  };

  const setStoreSplice: StoreSetterWithHelpersType<T>["splice"] = (
    path,
    start,
    deleteCount,
    ...items
  ) => {
    baseSetStore((draft) => {
      const target = getAtPath(draft, path);
      if (target && Array.isArray(target.parent[target.key])) {
        if (deleteCount === undefined) {
          target.parent[target.key].splice(start);
        } else {
          target.parent[target.key].splice(
            start,
            deleteCount,
            ...items.map(extractSignalValue)
          );
        }
      }
    });
  };

  const setStoreInsert: StoreSetterWithHelpersType<T>["insert"] = (
    path,
    index,
    ...items
  ) => {
    setStoreSplice(path, index, 0, ...items);
  };

  const setStoreRemove: StoreSetterWithHelpersType<T>["remove"] = (
    path,
    itemOrMatcher
  ) => {
    baseSetStore((draft) => {
      const target = getAtPath(draft, path);
      if (target && Array.isArray(target.parent[target.key])) {
        const arr = target.parent[target.key];
        if (typeof itemOrMatcher === "function") {
          const index = arr.findIndex(itemOrMatcher);
          if (index !== -1) {
            arr.splice(index, 1);
          }
        } else {
          const index = arr.indexOf(itemOrMatcher);
          if (index !== -1) {
            arr.splice(index, 1);
          }
        }
      }
    });
  };

  // Create the enhanced setter with helper methods
  const setStore = Object.assign(baseSetStore, {
    path: setStoreWithPath,
    push: setStorePush,
    splice: setStoreSplice,
    insert: setStoreInsert,
    remove: setStoreRemove,
  }) as StoreSetterWithHelpersType<T>;

  return [wrappedStore, setStore];
}

// Store the original Array.isArray before patching
const originalArrayIsArray = Array.isArray;

export function patchedArrayIsArray(obj: any): obj is any[] {
  return (
    obj != null &&
    (originalArrayIsArray(obj) ||
      (typeof obj === "object" &&
        ((obj as any).isArray === true ||
          (obj as any)[$TARGET_IS_ARRAY] === true ||
          (obj[$RAW] != null && originalArrayIsArray(obj[$RAW])))))
  );
}
