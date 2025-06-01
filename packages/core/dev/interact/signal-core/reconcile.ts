/**
 * @module @in/teract/signal-core/reconcile
 *
 * This module provides the `reconcile` utility, a powerful function for efficiently
 * updating complex reactive state (like stores created with `createStore`) with new data.
 * It intelligently merges the new data into the existing state, minimizing mutations and
 * preserving the identity of objects and array elements when a key is provided.
 *
 * Think of `reconcile` as a meticulous librarian organizing a bookshelf. When new books (new data)
 * arrive, instead of replacing the entire shelf (the whole store), the librarian carefully compares
 * the new books with the existing ones. If a book is the same (based on a key like its ISBN),
 * they might just update its details (properties). If it's a new book, they add it. If an old book
 * is no longer in the new set, they remove it. This process is much more efficient than rebuilding
 * the entire shelf from scratch every time.
 *
 * @example Basic Reconciliation of a Store
 * ```typescript
 * import { createStore } from "@in/teract/signal-core/create-store.ts";
 * import { reconcile } from "@in/teract/signal-core/reconcile.ts";
 * import { createEffect } from "@in/teract/signal-core/create-effect.ts";
 *
 * const [user, setUser] = createStore({
 *   id: 1,
 *   name: "Ben",
 *   profile: { age: 30, active: true },
 *   tags: ["developer", "typescript"]
 * });
 *
 * createEffect(() => {
 *   console.log("User Name:", user.name);
 *   console.log("User Age:", user.profile.age);
 *   console.log("User Tags:", user.tags.join(", "));
 * });
 *
 * // New data arrives
 * const updatedUserData = {
 *   id: 1, // Same ID
 *   name: "Ben Smith", // Name changed
 *   profile: { age: 31, active: true }, // Age changed
 *   tags: ["developer", "signals", "reactive"], // Tags changed
 *   newProperty: "added"
 * };
 *
 * // Reconcile the store with the new data, using 'id' as the key for the top-level object
 * setUser(reconcile(updatedUserData, "id"));
 * // Output will show that effects depending on user.name, user.profile.age, and user.tags re-run,
 * // but effects only depending on user.profile.active (which didn't change) might not.
 * // The store will now also have user.newProperty.
 * ```
 *
 * @features
 *  - **Fine-Grained Updates**: Modifies only the parts of the store that have actually changed.
 *  - **Key-Based Reconciliation**: For arrays of objects, it can use a key to identify items, allowing for efficient updates, additions, removals, and reordering while preserving item identity.
 *  - **Type Transition Handling**: Manages changes where a property might switch between being an array and an object (or vice-versa).
 *  - **Preserves Object Identity**: When objects are reconciled (especially with keys), their underlying reactive proxies can be preserved, minimizing cascading updates.
 *  - **Integration with `createStore`**: Designed to be used as an updater function with the setter returned by `createStore`.
 *
 * @see {@link createStore} - The primary way to create reactive stores that `reconcile` operates on.
 * @see {@link $PROXY} - Symbol used internally for managing reactive proxies.
 * @access public
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 */
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
  type StoreNodeType,
  $TARGET_IS_ARRAY,
} from "./create-store.ts";

/**
 * # applyState
 * @summary #### Internal helper function that recursively applies updates from a `next` value to a `state` proxy.
 *
 * This function is the core workhorse of the `reconcile` utility. It traverses the `state`
 * and `next` data structures, comparing them property by property or item by item (for arrays).
 * It handles:
 * - Simple value updates.
 * - Updates to nested objects (by recursively calling itself).
 * - Efficient updates to arrays, including additions, removals, and reordering (especially when a `keyFn` is provided).
 * - Transitions where a property changes type (e.g., from an object to an array).
 *
 * It directly mutates the underlying `STORE_VALUE` of the `state` proxy and triggers
 * notifications on the corresponding reactive nodes (`STORE_NODE`, `STORE_HAS`) to ensure
 * that the InSpatial reactive system picks up the changes.
 *
 * @internal
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module ReconcileUtils
 *
 * @param next - The new data to apply to the state.
 * @param state - The current reactive state (typically a proxy wrapper around the actual data).
 * @param keyFn - A function that returns a unique key for an item, used for keyed reconciliation of arrays.
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
  const prevIsArray = Array.isArray(previous);
  const nextIsArray = Array.isArray(next);

  // If types are different (object <-> array), we need special handling
  if (prevIsArray !== nextIsArray) {
    // CRITICAL FIX: For type transitions, completely replace the value
    // This is cleaner than trying to preserve the old proxy with mismatched traps

    // First, notify all existing nodes that the value is changing
    if (target[STORE_NODE]) {
      for (const key in target[STORE_NODE]) {
        const node = target[STORE_NODE][key];
        if (node === target[STORE_NODE][$TRACK]) {
          // Always notify the track node of the type change
          node?.write(undefined);
        } else if (key in next) {
          const value = next[key];
          node?.write(isWrappable(value) ? wrap(value) : value);
        } else {
          // If the key doesn't exist in the new value, write undefined
          node?.write(undefined);
        }
      }
    }

    // Update HAS nodes
    if (target[STORE_HAS]) {
      for (const key in target[STORE_HAS]) {
        target[STORE_HAS][key]?.write(key in next);
      }
    }

    // Replace the entire store value and update the target structure
    target[STORE_VALUE] = next;

    // Update array-specific properties
    if (nextIsArray) {
      (target as any).isArray = true;
      (target as any)[$TARGET_IS_ARRAY] = true;
    } else {
      delete (target as any).isArray;
      delete (target as any)[$TARGET_IS_ARRAY];
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
 * # reconcile
 * @summary #### Returns a function that efficiently updates a store state with new data.
 *
 * The `reconcile` function is a higher-order function. You call it with the new data (`value`)
 * and a `key` (either a property name string or a key-deriving function). It then returns
 * another function, which is the actual updater function that you pass to a store's setter
 * (e.g., the `setUser` in `const [user, setUser] = createStore(...)`).
 *
 * This returned updater function, when called by the store's setter, will intelligently merge
 * the `value` (provided to `reconcile`) into the current store state.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module ReconcileUtils
 * @kind function
 * @access public
 *
 * @template T The type of the new value being reconciled. It should generally match or be a superset of U.
 * @template U The type of the existing store state.
 *
 * @param {T} value - The new data to reconcile with the store state. This data will be merged into the existing state.
 * @param {string | ((item: NonNullable<any>) => any)} key - A key to identify items for reconciliation, especially within arrays.
 *   - If a `string` is provided, it's treated as the property name that holds the unique key for objects (e.g., "id").
 *   - If a `function` is provided, it will be called with each item to derive its unique key.
 *   Using a key helps `reconcile` preserve object identity and efficiently update, add, remove, or reorder items in arrays.
 *   If the top-level value being reconciled is not an array or if items don't have unique keys, this might be less critical or an empty string can be used for non-keyed reconciliation of objects.
 *
 * @returns {(state: U) => T} A function that takes the current store state (`state`) and returns the reconciled state (`T`). This function is intended to be used with a store's setter.
 *
 * ### 💡 Core Concepts
 * - **Higher-Order Function**: `reconcile` itself doesn't update the store; it *returns a function that does*.
 * - **Keyed Updates**: The `key` parameter is crucial for efficiently reconciling arrays of objects. It allows `reconcile` to understand which items are new, which have been removed, which have been reordered, and which just need their properties updated.
 * - **Preserving Identity**: By using keys, `reconcile` can often update existing objects/array items in place rather than creating new ones. This is important for performance and for maintaining stable references in the UI.
 * - **Granular Reactivity**: Because `reconcile` makes fine-grained changes, only the parts of your application that depend on the *actually changed* data will re-render or re-compute.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn about usage details and potential pitfalls</summary>
 *
 * > [!NOTE]
 * > When using `reconcile` with arrays of objects, providing a stable `key` (like an item's unique ID) is highly recommended for optimal performance and correct behavior, especially if items can be added, removed, or reordered.
 *
 * > [!NOTE]
 * > If the `key` (e.g., "id") is missing from the new `value` or the existing `state` when reconciling objects that are expected to be identifiable, `reconcile` will throw an error. Ensure your data consistently includes the specified key.
 *
 * > [!NOTE]
 * > If `reconcile` detects that the identity of an object has changed based on the `key` (e.g., an object that was `{ id: 1, name: "A" }` is now `{ id: 2, name: "A" }` in the same logical position), it will treat it as a replacement, not an update, to ensure data integrity.
 * </details>
 *
 * ### 🎮 Usage
 * @example
 * ### Example 1: Reconciling an Array of Objects with a Key
 * ```typescript
 * import { createStore, reconcile, createEffect } from "@in/teract/signal-core";
 *
 * interface Task { id: number; text: string; completed: boolean; }
 * const [tasks, setTasks] = createStore<Task[]>([
 *   { id: 1, text: "Learn Signals", completed: true },
 *   { id: 2, text: "Build App", completed: false },
 * ]);
 *
 * createEffect(() => {
 *   console.log("Tasks:");
 *   tasks.forEach(task => console.log(`  ID: ${task.id}, Text: ${task.text}, Done: ${task.completed}`))
 * });
 *
 * // New data arrives (task 2 updated, task 3 added, task 1 implicitly removed if not present)
 * const updatedTasks = [
 *   { id: 2, text: "Build Awesome App", completed: true }, // Updated
 *   { id: 3, text: "Deploy App", completed: false },      // New
 * ];
 *
 * // Use reconcile with "id" as the key
 * setTimeout(() => {
 *   setTasks(reconcile(updatedTasks, "id"));
 * }, 1000);
 * // Output will show Task 1 gone, Task 2 updated, Task 3 added.
 * // If Task 1 were { id: 1, text: "Learn Signals ADVANCED", completed: true }, it would be updated.
 * ```
 *
 * @example
 * ### Example 2: Reconciling a Nested Object Structure
 * ```typescript
 * import { createStore, reconcile, createEffect } from "@in/teract/signal-core";
 *
 * const [settings, setSettings] = createStore({
 *   user: { name: "Alex", theme: "dark" },
 *   notifications: { email: true, sms: false }
 * });
 *
 * createEffect(() => console.log("Theme:", settings.user.theme, "SMS Notifications:", settings.notifications.sms));
 *
 * const newSettings = {
 *   user: { name: "Alex", theme: "light" }, // Theme changed
 *   notifications: { email: true, sms: true }, // SMS changed
 *   newFeature: { enabled: true } // New top-level property
 * };
 *
 * // For nested objects where the top-level keys are sufficient, key can be less critical or an empty string.
 * // However, if `user` itself had an ID and could be swapped, a key for `user` would be useful.
 * setTimeout(() => {
 *  setSettings(reconcile(newSettings, "")); // Using empty string for non-keyed top-level reconciliation
 * }, 1000);
 * // Output will reflect changes to theme and SMS, and newFeature will be added.
 * ```
 *
 * @throws {Error} If `key` is provided and an object is missing this key, or if identities mismatch based on the key.
 */
export function reconcile<T extends U, U>(
  value: T,
  key: string | ((item: NonNullable<any>) => any)
) {
  return (state: U) => {
    const keyFn =
      typeof key === "string" ? (item: NonNullable<any>) => item[key] : key;

    // Identity check for objects with keys
    if (key && key !== "") {
      // Check if the key is completely missing from the values
      if (
        isWrappable(value) &&
        typeof value === "object" &&
        value !== null &&
        Object.keys(value as Record<string, any>).length === 0
      ) {
        throw new Error(
          "Cannot reconcile with an empty object when identity key is required"
        );
      }

      // Check state has the key property
      if (
        isWrappable(state) &&
        keyFn(state) !== undefined &&
        isWrappable(value) &&
        keyFn(value) === undefined
      ) {
        throw new Error(
          "Cannot reconcile when target state is missing the identity key"
        );
      }

      // Check if both have keys but they don't match
      if (
        isWrappable(value) &&
        isWrappable(state) &&
        keyFn(value) !== undefined &&
        keyFn(state) !== undefined &&
        keyFn(value) !== keyFn(state)
      ) {
        throw new Error("Cannot reconcile states with different identity");
      }
    }

    applyState(value, state, keyFn);
    return state as T;
  };
}
