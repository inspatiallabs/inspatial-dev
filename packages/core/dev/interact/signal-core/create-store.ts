/**
 * @module @in/teract/signal-core/create-store
 *
 * InSpatial Store provides reactive state management for complex objects and arrays.
 * Think of it like a smart object that can detect changes to any nested property
 * and automatically notify components that depend on those specific parts.
 *
 * @example Basic Usage
 * ```typescript
 * import { createStore } from "@in/teract/signal-core/create-store.ts";
 *
 * // Create a reactive store for a user profile
 * const [user, setUser] = createStore({
 *   name: "Ben",
 *   profile: { age: 25, location: "Berlin" },
 *   preferences: { theme: "dark", notifications: true }
 * });
 * ```
 *
 * @features
 * - **Fine-grained Reactivity**: Only updates when specific properties change
 * - **Nested Object Support**: Track changes deep within object hierarchies
 * - **Array Operations**: Built-in methods for push, splice, insert, remove
 * - **Path-based Updates**: Update nested values using property paths
 * - **Automatic Wrapping**: Converts plain objects into reactive proxies
 * - **Performance Optimized**: Minimal re-renders through precise change detection
 * - **TypeScript Support**: Full type safety for store operations
 * - **Batch Updates**: Efficient batching of multiple changes
 * - **Custom Equality**: Configure when changes should trigger updates
 *
 * @example Managing User Data
 * ```typescript
 * const [user, setUser] = createStore({
 *   personal: { name: "Ben", age: 25 },
 *   settings: { theme: "dark", language: "en" }
 * });
 *
 * // Update nested properties
 * setUser("personal", "age", 26);
 * setUser("settings", s => ({ ...s, theme: "light" }));
 * ```
 *
 * @example Todo List Management
 * ```typescript
 * const [todos, setTodos] = createStore({
 *   items: [],
 *   filter: "all",
 *   stats: { completed: 0, total: 0 }
 * });
 *
 * // Add a new todo
 * setTodos.push(["items"], {
 *   id: Date.now(),
 *   text: "Learn InSpatial",
 *   completed: false
 * });
 * ```
 *
 * @example E-commerce Cart
 * ```typescript
 * const [cart, setCart] = createStore({
 *   items: [],
 *   totals: { subtotal: 0, tax: 0, total: 0 },
 *   shipping: { address: "", method: "standard" }
 * });
 *
 * // Add product to cart
 * setCart.push(["items"], {
 *   productId: "abc123",
 *   quantity: 2,
 *   price: 29.99
 * });
 * ```
 *
 * @example Advanced Store Operations
 * ```typescript
 * // Complex nested updates
 * setStore(
 *   "user",
 *   "preferences",
 *   "notifications",
 *   n => ({ ...n, email: false })
 * );
 *
 * // Array operations
 * setStore.splice(["items"], 0, 1); // Remove first item
 * setStore.insert(["items"], 2, newItem); // Insert at index 2
 * ```
 *
 * @apiOptions
 * - **path**: Update values at specific property paths
 * - **push**: Add items to the end of arrays
 * - **splice**: Remove/insert items in arrays
 * - **insert**: Insert items at specific array indices
 * - **remove**: Remove items from arrays by value or matcher function
 *
 * @bestPractices
 * 1. **Use stores for complex state** - objects, arrays, nested structures
 * 2. **Prefer immutable updates** - always create new objects rather than mutating
 * 3. **Use helper methods** - push, splice, insert for array operations
 * 4. **Organize by feature** - group related state in the same store
 * 5. **Keep stores flat when possible** - avoid unnecessary nesting levels
 *
 * @see {@link createSignal} - For primitive reactive values
 * @see {@link createMemo} - For computed values from store data
 * @see {@link createEffect} - For reacting to store changes
 */

import { $RAW } from "./constants.ts";
import {
  ComputationClass,
  getObserver,
  isEqual,
  UNCHANGED,
  untrack,
} from "./core.ts";
import { batch, isBatching } from "./batch.ts";
import { flushSync } from "./scheduler.ts";
import { createSignal } from "./create-signal.ts";
import { getOwner } from "./owner.ts";

export type StoreType<T> = Readonly<T>;

/** Base Setter type */
type BaseStoreSetterType<T> = (fn: (state: T) => void) => void;

/** Type for path segments */
type PathSegmentType = string | number;

/** Extended Setter type with helpers */
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

/** Use the extended type alias for external export if needed, or directly in createStore return type. */
export type StoreSetterType<T> = StoreSetterWithHelpersType<T>;

type DataNodeType = ComputationClass<any>;
type DataNodesType = Record<PropertyKey, DataNodeType>;

/** Add symbols for store operations */
const $TRACK = Symbol("STORE_TRACK"),
  $TARGET = Symbol("STORE_TARGET"),
  $PROXY = Symbol("STORE_PROXY"),
  $TARGET_IS_ARRAY = Symbol("TARGET_IS_ARRAY");

/** Store reference to original Array.isArray for reliable detection */
const originalArrayIsArray = Array.isArray;

export const STORE_VALUE = "v" as const;
export const STORE_NODE = "n" as const;
export const STORE_HAS = "h" as const;

/** Export all symbols */
export { $PROXY, $TRACK, $RAW, $TARGET, $TARGET_IS_ARRAY };

/** Explicitly type the internal structure for proxied objects/arrays */
interface InternalStoreNodeType<T = Record<PropertyKey, any>> {
  [STORE_VALUE]: T;
  [STORE_NODE]?: DataNodesType;
  [STORE_HAS]?: DataNodesType;
  [$PROXY]?: any;
  /** Add the array flag property to the interface */
  [$TARGET_IS_ARRAY]?: boolean;
}

/** Exported StoreNode type remains the same conceptually */
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
  /** If already wrapped, return the proxy */
  let p = (value as any)[$PROXY];
  if (p) return p;

  /** Handle special cases */
  if (!value || typeof value !== "object") {
    return value;
  }

  /** Handle custom classes by preserving their prototype chain */
  const isCustomClass =
    value &&
    value.constructor &&
    value.constructor !== Object &&
    value.constructor !== Array;

  /** Use standard detector for arrays */
  const isArray = Array.isArray(value);

  const target: InternalStoreNodeType<T> = isArray
    ? ({
        [STORE_VALUE]: value,
        [$TARGET_IS_ARRAY]: true,
      } as InternalStoreNodeType<T>)
    : { [STORE_VALUE]: value };

  /** **CRITICAL ARRAY FIX**: For arrays, set up proper prototype chain */
  if (isArray) {
    /** Use a regular property for compatibility with older code */
    (target as any).isArray = true;

    /** **KEY FIX**: Set the prototype of the target to Array.prototype */
    /** This makes the proxy inherit Array methods and behavior */
    Object.setPrototypeOf(target, Array.prototype);

    /** Copy array-specific properties to the target */
    Object.defineProperty(target, "length", {
      get() {
        return this[STORE_VALUE].length;
      },
      set(value) {
        this[STORE_VALUE].length = value;
      },
      enumerable: false,
      configurable: true,
    });
  }

  /** Store the original prototype and constructor for custom classes */
  if (isCustomClass) {
    const proto = Object.getPrototypeOf(value);
    (target as any).originalPrototype = proto;
    (target as any).originalConstructor = value.constructor;

    /** For custom classes, copy all properties including prototype inherited ones */
    /** This ensures we have access to everything on the class instance */
    const instanceProperties: Record<string, any> = {};
    const instanceMethods: Record<string, Function> = {};

    /** Helper function to store property */
    const storeProperty = (obj: any, prop: string) => {
      /** Skip special properties and functions */
      if (prop === "$PROXY" || prop === "$RAW" || prop === "constructor")
        return;

      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!descriptor) return;

      /** If it's a getter/setter, add a special accessor */
      if (descriptor.get || descriptor.set) {
        /** Will be handled through prototype chain */
        return;
      }

      try {
        /** Store by type */
        const propValue = obj[prop];
        if (typeof propValue === "function") {
          instanceMethods[prop] = propValue;
        } else {
          instanceProperties[prop] = propValue;
        }
      } catch (e) {
        /** Ignore errors accessing properties */
      }
    };

    /** First get all own properties from the instance */
    Object.getOwnPropertyNames(value).forEach((prop) =>
      storeProperty(value, prop)
    );

    /** Then collect inherited properties */
    let currentProto = proto;
    while (
      currentProto &&
      currentProto !== Object.prototype &&
      currentProto !== Array.prototype
    ) {
      Object.getOwnPropertyNames(currentProto).forEach((prop) => {
        /** Skip already stored properties */
        if (prop in instanceMethods || prop in instanceProperties) return;

        storeProperty(currentProto, prop);
      });
      currentProto = Object.getPrototypeOf(currentProto);
    }

    /** Store collected properties and methods */
    (target as any).instanceProperties = instanceProperties;
    (target as any).instanceMethods = instanceMethods;
  }

  /** **CRITICAL ARRAY FIX**: Create proxy with enhanced traps for arrays */
  p = new Proxy(target, isArray ? arrayProxyTraps : proxyTraps);

  /** Store reference back to proxy */
  Object.defineProperty(value, $PROXY, {
    value: p,
    writable: true,
    configurable: true,
  });

  /** Debugging for array handling */
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
  return (nodes[property] = new ComputationClass(value, null, {
    equals,
    // Prevent node deletion when there are no observers
    // Store nodes should persist for the lifetime of the store
    unobserved: undefined,
  }));
}

function proxyDescriptor(target: StoreNodeType, property: PropertyKey) {
  if (property === $PROXY)
    return { value: target[$PROXY], writable: true, configurable: true };

  const storeValue = target[STORE_VALUE];
  const desc = Reflect.getOwnPropertyDescriptor(storeValue, property);
  if (!desc) return desc;

  // CRITICAL FIX: For array length property, we need special handling
  // This handles the case where an object was converted to an array via reconcile
  if (property === "length") {
    if (Array.isArray(storeValue)) {
      // For arrays, return the exact descriptor from the underlying array
      return desc;
    } else {
      // For non-arrays that somehow have a length property, return undefined
      // This prevents the proxy descriptor mismatch error
      return undefined;
    }
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

    // **ARRAY DETECTION FIX**: Expose array markers for patchedArrayIsArray
    if (property === $TARGET_IS_ARRAY) {
      return (target as any)[$TARGET_IS_ARRAY] === true;
    }

    // Legacy array marker support
    if (property === "isArray") {
      return (target as any).isArray === true;
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
    if (false && __DEV__) {
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

    if (nodes) {
      const node = nodes[property];
      if (node) {
        // Manually write the value and notify subscribers
        if (false && __DEV__) {
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

    // CRITICAL FIX: Use correct flush function and handle batching properly
    if (!isBatching()) {
      flushSync();
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

    // CRITICAL FIX: Use correct flush function
    if (!isBatching()) {
      flushSync();
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

const arrayProxyTraps: ProxyHandler<InternalStoreNodeType> = {
  ...proxyTraps,

  // Override getPrototypeOf to return Array.prototype for array detection
  getPrototypeOf(target) {
    return Array.prototype;
  },

  // Override get to handle array methods properly
  get(target, property, receiver) {
    // Delegate to standard proxy trap first
    const result = proxyTraps.get!(target, property, receiver);

    // For array methods, ensure they're bound to the proxy
    if (
      typeof result === "function" &&
      Array.prototype.hasOwnProperty(property)
    ) {
      return result.bind(receiver);
    }

    return result;
  },

  // CRITICAL FIX: Override getOwnPropertyDescriptor for arrays
  getOwnPropertyDescriptor(target, property) {
    // For array-specific properties, handle them directly
    const storeValue = target[STORE_VALUE];

    if (Array.isArray(storeValue)) {
      // For arrays, delegate to the underlying array's descriptor
      const desc = Reflect.getOwnPropertyDescriptor(storeValue, property);
      if (desc) {
        // For length property and array indices, return the exact descriptor
        if (
          property === "length" ||
          (typeof property === "string" && /^\d+$/.test(property))
        ) {
          return desc;
        }
      }
    }

    // For all other properties, use the regular proxy descriptor logic
    return proxyDescriptor(target, property);
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

  // CRITICAL FIX: Use correct flush function and handle batching properly
  if (!isBatching()) {
    flushSync();
  }
}

/** Export fixed createStore function that properly handles effects */

/**
 * # CreateStore
 * @summary #### Creates a reactive store for managing complex objects and arrays
 *
 * Think of `createStore` like a smart filing cabinet that automatically notifies you when
 * specific files change. Unlike regular objects, stores can track changes to deeply nested
 * properties and only update the parts of your application that actually depend on those changes.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateStore
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Stores provide fine-grained reactivity for complex data structures
 * - Changes are tracked at the property level, not the entire object
 * - Nested objects and arrays are automatically wrapped to become reactive
 * - Path-based updates allow precise modification of deeply nested values
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive signals and basic reactivity concepts
 * - Familiarity with JavaScript objects and arrays
 * - Knowledge of immutable update patterns
 *
 * ### 📚 Terminology
 * > **Store**: A reactive proxy wrapper around objects and arrays
 * > **Path**: A sequence of property keys to access nested values
 * > **Setter**: Function that updates store values with helper methods
 * > **Fine-grained Reactivity**: Only updating components that depend on changed properties
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * > [!NOTE]
 * > Store setters should always create new objects rather than mutating existing ones
 *
 * > [!NOTE]
 * > Use helper methods (push, splice, insert) for array operations to maintain reactivity
 *
 * > [!NOTE]
 * > Stores automatically wrap nested objects, but manual wrapping may be needed for dynamic content
 * </details>
 *
 * @param store - Initial store value (object or array) to make reactive
 * @param fn - Optional initialization function that receives the store for setup
 *
 * @returns A tuple containing [getter, setter] where:
 * - **getter**: Reactive proxy that tracks property access
 * - **setter**: Function with helper methods for updating store values
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use stores in real applications:
 *
 * @example
 * ### Example 1: User Profile Store
 * ```typescript
 * import { createStore } from "@in/teract/signal-core/create-store.ts";
 * import { createEffect } from "@in/teract/signal-core/create-effect.ts";
 *
 * // Create a store for user profile data
 * const [user, setUser] = createStore({
 *   personal: {
 *     name: "Ben",
 *     age: 25,
 *     email: "ben@example.com"
 *   },
 *   preferences: {
 *     theme: "dark",
 *     notifications: true,
 *     language: "en"
 *   }
 * });
 *
 * // React to specific changes - only runs when name changes
 * createEffect(() => {
 *   console.log(`Welcome, ${user.personal.name}!`);
 * });
 *
 * // Update nested properties - triggers the effect above
 * setUser("personal", "name", "Carolina");
 *
 * // Update preferences - does NOT trigger the name effect
 * setUser("preferences", "theme", "light");
 * ```
 *
 * @example
 * ### Example 2: Shopping Cart with Array Operations
 * ```typescript
 * import { createStore } from "@in/teract/signal-core/create-store.ts";
 *
 * // Create a shopping cart store
 * const [cart, setCart] = createStore({
 *   items: [],
 *   totals: {
 *     subtotal: 0,
 *     tax: 0,
 *     total: 0
 *   },
 *   checkout: {
 *     step: "cart",
 *     payment: null
 *   }
 * });
 *
 * // Add items using the push helper
 * setCart.push(["items"], {
 *   id: "book-1",
 *   name: "JavaScript Guide",
 *   price: 29.99,
 *   quantity: 1
 * });
 *
 * setCart.push(["items"], {
 *   id: "pen-1",
 *   name: "Blue Pen",
 *   price: 2.50,
 *   quantity: 3
 * });
 *
 * // Update quantity using path notation
 * setCart("items", 0, "quantity", 2);
 *
 * // Remove an item using the remove helper
 * setCart.remove(["items"], item => item.id === "pen-1");
 *
 * console.log(cart.items.length); // 1 (only the book remains)
 * ```
 *
 * @example
 * ### Example 3: Todo List with Advanced Operations
 * ```typescript
 * import { createStore } from "@in/teract/signal-core/create-store.ts";
 * import { createMemo } from "@in/teract/signal-core/create-memo.ts";
 *
 * // Create a comprehensive todo list store
 * const [todos, setTodos] = createStore({
 *   items: [
 *     { id: 1, text: "Learn InSpatial", completed: false, priority: "high" },
 *     { id: 2, text: "Build an app", completed: false, priority: "medium" }
 *   ],
 *   filter: "all", // "all", "active", "completed"
 *   stats: {
 *     total: 0,
 *     completed: 0,
 *     remaining: 0
 *   }
 * });
 *
 * // Computed values based on store state
 * const filteredTodos = createMemo(() => {
 *   const filter = todos.filter;
 *   const items = todos.items;
 *
 *   if (filter === "active") return items.filter(t => !t.completed);
 *   if (filter === "completed") return items.filter(t => t.completed);
 *   return items;
 * });
 *
 * // Add a new todo
 * setTodos.push(["items"], {
 *   id: Date.now(),
 *   text: "Write documentation",
 *   completed: false,
 *   priority: "high"
 * });
 *
 * // Toggle completion status
 * setTodos("items", 0, "completed", true);
 *
 * // Update filter
 * setTodos("filter", "completed");
 *
 * console.log(filteredTodos()); // Only completed todos
 * ```
 *
 * @example
 * ### Example 4: Form Data with Validation
 * ```typescript
 * import { createStore } from "@in/teract/signal-core/create-store.ts";
 * import { createMemo } from "@in/teract/signal-core/create-memo.ts";
 *
 * // Create a form store with validation
 * const [form, setForm] = createStore({
 *   data: {
 *     email: "",
 *     password: "",
 *     confirmPassword: "",
 *     terms: false
 *   },
 *   errors: {
 *     email: null,
 *     password: null,
 *     confirmPassword: null,
 *     terms: null
 *   },
 *   meta: {
 *     isSubmitting: false,
 *     isValid: false,
 *     touchedFields: new Set()
 *   }
 * });
 *
 * // Validation computed values
 * const isValidEmail = createMemo(() => {
 *   const email = form.data.email;
 *   return email.includes("@") && email.includes(".");
 * });
 *
 * const isValidPassword = createMemo(() => {
 *   return form.data.password.length >= 8;
 * });
 *
 * const passwordsMatch = createMemo(() => {
 *   return form.data.password === form.data.confirmPassword;
 * });
 *
 * // Update form field
 * function updateField(field: string, value: any) {
 *   setForm("data", field, value);
 *
 *   // Mark field as touched
 *   setForm("meta", "touchedFields", prev => new Set([...prev, field]));
 *
 *   // Update validation
 *   if (field === "email") {
 *     setForm("errors", "email", !isValidEmail() ? "Invalid email" : null);
 *   }
 * }
 *
 * // Example usage
 * updateField("email", "user@example.com");
 * updateField("password", "secretpassword123");
 * ```
 *
 * @example
 * ### Example 5: Game State with Nested Updates
 * ```typescript
 * import { createStore } from "@in/teract/signal-core/create-store.ts";
 *
 * // Create a game state store
 * const [game, setGame] = createStore({
 *   player: {
 *     name: "Ben",
 *     level: 1,
 *     health: 100,
 *     mana: 50,
 *     inventory: {
 *       items: [
 *         { id: "sword", name: "Iron Sword", damage: 10 },
 *         { id: "potion", name: "Health Potion", heal: 25 }
 *       ],
 *       gold: 100
 *     },
 *     stats: {
 *       strength: 10,
 *       magic: 8,
 *       defense: 7
 *     }
 *   },
 *   world: {
 *     currentMap: "forest",
 *     position: { x: 0, y: 0 },
 *     weather: "sunny"
 *   },
 *   ui: {
 *     activePanel: "inventory",
 *     notifications: []
 *   }
 * });
 *
 * // Player takes damage
 * function takeDamage(amount: number) {
 *   setGame("player", "health", health => Math.max(0, health - amount));
 * }
 *
 * // Player levels up
 * function levelUp() {
 *   setGame("player", player => ({
 *     ...player,
 *     level: player.level + 1,
 *     health: 100, // Full heal on level up
 *     mana: 50 + (player.level * 5) // Increase max mana
 *   }));
 * }
 *
 * // Add item to inventory
 * function addItem(item: any) {
 *   setGame.push(["player", "inventory", "items"], item);
 * }
 *
 * // Move player
 * function movePlayer(dx: number, dy: number) {
 *   setGame("world", "position", pos => ({
 *     x: pos.x + dx,
 *     y: pos.y + dy
 *   }));
 * }
 *
 * // Example usage
 * takeDamage(15); // Health: 85
 * addItem({ id: "shield", name: "Wooden Shield", defense: 5 });
 * movePlayer(1, 0); // Move right
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Use path-based updates for deep nested changes to avoid unnecessary re-wrapping
 * - Batch multiple store updates using the batch() function
 * - Prefer helper methods (push, splice) over manual array manipulation
 * - Keep store structure relatively flat when possible for better performance
 * - Use memo functions to compute derived state rather than storing computed values
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Direct mutation**: Don't modify store values directly, always use setters
 * - **Incorrect array methods**: Use store helpers instead of native array methods
 * - **Deep nesting**: Avoid excessively deep object hierarchies in stores
 * - **Storing computed values**: Use memos instead of storing derived state
 * - **Missing immutability**: Always create new objects when updating nested values
 * </details>
 *
 * ### 📝 Uncommon Knowledge
 * `Stores use Proxy objects under the hood, which means they can intercept property
 * access and modification. This is more powerful than simple observation because it
 * can detect when properties are added or deleted, not just when they change values.
 * The fine-grained nature means that accessing user.name only creates a dependency
 * on the name property, not the entire user object.`
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 * - ✅ Modern Browsers (Proxy support required)
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link createSignal} - For primitive reactive values
 * - {@link createMemo} - For computed values derived from store data
 * - {@link createEffect} - For reacting to store changes
 * - {@link batch} - For batching multiple store updates
 *
 * @throws {Error} If trying to wrap non-object values or encountering circular references
 *
 * @returns {[StoreType<T>, StoreSetterType<T>]} A tuple containing the reactive store getter and setter with helper methods
 */
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

export function patchedArrayIsArray(obj: any): obj is any[] {
  // Null/undefined check
  if (obj == null) return false;

  // First check: Native Array.isArray for unwrapped arrays
  if (originalArrayIsArray(obj)) return true;

  // Second check: For store proxies, check if the underlying value is an array
  if (typeof obj === "object") {
    // Check for store proxy symbols indicating this is a wrapped array
    if (obj[$TARGET_IS_ARRAY] === true) return true;

    // Check for legacy array marker
    if ((obj as any).isArray === true) return true;

    // Check if the underlying raw value is an array
    if (obj[$RAW] != null && originalArrayIsArray(obj[$RAW])) return true;

    // Check if the proxy target contains an array
    if (
      obj[$TARGET] &&
      obj[$TARGET][STORE_VALUE] &&
      originalArrayIsArray(obj[$TARGET][STORE_VALUE])
    )
      return true;
  }

  return false;
}

// **GLOBAL FIX**: Override Array.isArray to recognize store arrays
// This is necessary because native Array.isArray does internal checks that proxies can't satisfy
if (typeof globalThis !== "undefined") {
  globalThis.Array.isArray = function isArray(obj: any): obj is any[] {
    return patchedArrayIsArray(obj);
  };
} else if (typeof window !== "undefined") {
  window.Array.isArray = function isArray(obj: any): obj is any[] {
    return patchedArrayIsArray(obj);
  };
}
