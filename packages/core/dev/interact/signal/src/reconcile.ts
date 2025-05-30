import {
  $PROXY,
  $TARGET,
  $TRACK,
  isWrappable,
  STORE_HAS,
  STORE_NODE,
  STORE_VALUE,
  unwrap,
  wrap,
  StoreNodeType,
  $TARGET_IS_ARRAY,
} from "./create-store.ts";

/**
 * Applies updates from the 'next' value to the 'state' value
 * Handles complex reconciliation between arrays, objects, and type transitions
 */
function applyState(
  next: any,
  state: any,
  keyFn: (item: NonNullable<any>) => any
) {
  const target = state?.[$TARGET] as StoreNodeType | undefined;
  if (!target) return;
  const previous = target[STORE_VALUE];
  if (next === previous) return;
  
  // Handle type transitions between objects and arrays
  const prevIsArray = Array.isArray;(previous);
  const nextIsArray = Array.isArray;(next);
  
  // If types are different (object <-> array), we need special handling
  if (prevIsArray !== nextIsArray) {
    // Create a full replacement by swapping the state with the new value
    Object.defineProperty(next, $PROXY, {
      value: (previous as any)[$PROXY],
      writable: true,
    });
    (previous as any)[$PROXY] = null;
    target[STORE_VALUE] = next;
    
    // Update the array type flag if needed
    if (Array.isArray(next)) {
      (target as any).isArray = true;
      (target as any)[$TARGET_IS_ARRAY] = true;
      
      // Ensure array prototype for proper array method access
      Object.setPrototypeOf(next, Array.prototype);
      
      // Make sure length property is properly set and configurable
      if (!('length' in next)) {
        Object.defineProperty(next, 'length', { 
          value: 0, 
          writable: true, 
          configurable: true,
          enumerable: false 
        });
      }
    } else {
      delete (target as any).isArray;
      delete (target as any)[$TARGET_IS_ARRAY];
      
      // Reset prototype to Object prototype for non-arrays
      Object.setPrototypeOf(next, Object.prototype);
    }
    
    // Notify all nodes of the complete change
    if (target[STORE_NODE]) {
      for (const key in target[STORE_NODE]) {
        if (key in next) {
          const value = next[key];
          target[STORE_NODE][key]?.write(isWrappable(value) ? wrap(value) : value);
        } else {
          // If the key doesn't exist, write undefined
          target[STORE_NODE][key]?.write(undefined);
        }
      }
    }
    
    // Update 'has' observers
    if (target[STORE_HAS]) {
      for (const key in target[STORE_HAS]) {
        target[STORE_HAS][key]?.write(key in next);
      }
    }
    
    // Always trigger the main tracker
    if (target[STORE_NODE]?.[$TRACK]) {
      target[STORE_NODE][$TRACK].write(undefined);
    }
    
    return;
  }

  // swap the values
  Object.defineProperty(next, $PROXY, {
    value: (previous as any)[$PROXY],
    writable: true,
  });
  (previous as any)[$PROXY] = null;
  target[STORE_VALUE] = next;

  // merge array contents specifically
  if (Array.isArray(previous)) {
    let changed = false;
    if (next.length && previous.length && next[0] && keyFn(next[0]) != null) {
      let i, j, start, end, newEnd, item, keyVal;
      let newIndicesNext: number[] = [];

      for (
        start = 0, end = Math.min(previous.length, next.length);
        start < end &&
        (previous[start] === next[start] ||
          (previous[start] &&
            next[start] &&
            keyFn(previous[start]) === keyFn(next[start])));
        start++
      ) {
        applyState(next[start], wrap(previous[start]), keyFn);
      }

      const temp = new Array(next.length),
        newIndices = new Map();

      for (
        end = previous.length - 1, newEnd = next.length - 1;
        end >= start &&
        newEnd >= start &&
        (previous[end] === next[newEnd] ||
          (previous[end] &&
            next[newEnd] &&
            keyFn(previous[end]) === keyFn(next[newEnd])));
        end--, newEnd--
      ) {
        temp[newEnd] = previous[end];
      }

      if (start > newEnd || start > end) {
        for (j = start; j <= newEnd; j++) {
          changed = true;
          target[STORE_NODE]?.[j]?.write(wrap(next[j]));
        }

        for (; j < next.length; j++) {
          changed = true;
          const wrapped = wrap(temp[j]);
          target[STORE_NODE]?.[j]?.write(wrapped);
          applyState(next[j], wrapped, keyFn);
        }

        changed && target[STORE_NODE]?.[$TRACK]?.write(void 0);
        previous.length !== next.length &&
          target[STORE_NODE]?.length?.write(next.length);
        return;
      }

      newIndicesNext = new Array(newEnd + 1);

      for (j = newEnd; j >= start; j--) {
        item = next[j];
        keyVal = item ? keyFn(item) : item;
        i = newIndices.get(keyVal);
        newIndicesNext[j] = i === undefined ? -1 : i;
        newIndices.set(keyVal, j);
      }

      for (i = start; i <= end; i++) {
        item = previous[i];
        keyVal = item ? keyFn(item) : item;
        j = newIndices.get(keyVal);

        if (j !== undefined && j !== -1) {
          temp[j] = previous[i];
          j = newIndicesNext[j];
          newIndices.set(keyVal, j);
        }
      }

      for (j = start; j < next.length; j++) {
        if (j in temp) {
          const wrapped = wrap(temp[j]);
          target[STORE_NODE]?.[j]?.write(wrapped);
          applyState(next[j], wrapped, keyFn);
        } else target[STORE_NODE]?.[j]?.write(wrap(next[j]));
      }
      if (start < next.length) changed = true;
    } else if (previous.length && next.length) {
      for (let i = 0, len = next.length; i < len; i++) {
        isWrappable(previous[i]) &&
          applyState(next[i], wrap(previous[i]), keyFn);
      }
    }

    if (previous.length !== next.length) {
      changed = true;
      target[STORE_NODE]?.length?.write(next.length);
    }
    changed && target[STORE_NODE]?.[$TRACK]?.write(void 0);
    return;
  }

  // values
  let nodes = target[STORE_NODE];
  if (nodes) {
    const keys = Object.keys(nodes);
    for (let i = 0, len = keys.length; i < len; i++) {
      const node = nodes[keys[i]];
      const previousValue = unwrap(previous[keys[i]], false);
      const nextValue = unwrap(next[keys[i]], false);
      if (previousValue === nextValue) continue;
      if (
        !previousValue ||
        !isWrappable(previousValue) ||
        (keyFn(previousValue) != null &&
          keyFn(previousValue) !== keyFn(nextValue))
      )
        node.write(isWrappable(nextValue) ? wrap(nextValue) : nextValue);
      else applyState(nextValue, wrap(previousValue), keyFn);
    }
  }

  // has
  if ((nodes = target[STORE_HAS])) {
    const keys = Object.keys(nodes);
    for (let i = 0, len = keys.length; i < len; i++) {
      nodes[keys[i]].write(keys[i] in next);
    }
  }
}

/**
 * Reconciles a store state with a new value
 * @param value - The new value to reconcile with the state
 * @param key - A key function or property name to identify objects for reconciliation
 * @returns A function that updates the state using the given value
 */
export function reconcile<T extends U, U>(
  value: T,
  key: string | ((item: NonNullable<any>) => any)
) {
  return (state: U) => {
    const keyFn =
      typeof key === "string" ? (item: NonNullable<any>) => item[key] : key;
    
    // Identity check for objects with keys
    if (key && key !== '') {
      // Check if the key is completely missing from the values
      if (isWrappable(value) && typeof value === 'object' && value !== null && 
          Object.keys(value as Record<string, any>).length === 0) {
        throw new Error("Cannot reconcile with an empty object when identity key is required");
      }
      
      // Check state has the key property
      if (isWrappable(state) && keyFn(state) !== undefined && 
          isWrappable(value) && keyFn(value) === undefined) {
        throw new Error("Cannot reconcile when target state is missing the identity key");
      }
      
      // Check if both have keys but they don't match
      if (isWrappable(value) && isWrappable(state) && 
          keyFn(value) !== undefined && keyFn(state) !== undefined && 
          keyFn(value) !== keyFn(state)) {
        throw new Error("Cannot reconcile states with different identity");
      }
    }
    
    applyState(value, state, keyFn);
    return state as T;
  };
}
