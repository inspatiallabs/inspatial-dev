import { createStore } from "./create-store.ts";
import { ComputationClass, untrack } from "./core.ts";
import type { StoreType, StoreSetterType } from "./create-store.ts";
import { createMemo } from "./create-memo.ts";
import { getOwner, OwnerClass } from "./owner.ts";

// Define PathSegmentType locally as it's not exported from store.ts
type PathSegmentType = string | number;

/**
 * # CreateProjection
 * @summary #### Creates a reactive store that automatically updates based on external signal dependencies
 *
 * A projection is a store that is derived from a transformation function that can read from
 * external signals. Think of it like a spreadsheet cell that automatically updates when the
 * cells it references change. The projection function defines how to transform external state
 * into the projection store's state.
 *
 * @since 0.1.0
 * @category InSpatial Interact
 * @module CreateProjection
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Projections automatically track external signal dependencies
 * - They avoid self-tracking to prevent circular updates
 * - Updates are batched and efficient for UI rendering
 * - Ideal for selection patterns and derived state
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of signals and stores
 * - Knowledge of reactive programming concepts
 * - Familiarity with InSpatial's reactivity system
 *
 * ### 📚 Terminology
 * > **Projection**: A reactive store that derives its state from external signals
 * > **Self-tracking**: When a projection accidentally tracks its own store (causes loops)
 * > **Selection Pattern**: Using projections to track which items are selected in a list
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * > [!NOTE]
 * > Projection functions should only read from external signals, not modify the draft
 *
 * > [!NOTE]
 * > Avoid reading from the projection's own store within the projection function
 * </details>
 *
 * @param fn - The projection function that reads external signals and updates the draft
 * @param initialValue - Initial state for the projection store
 * @returns A readonly store that updates automatically when dependencies change
 *
 * ### 🎮 Usage
 *
 * @example
 * ### Example 1: Basic Selection Tracking
 * ```typescript
 * import { createSignal } from "@inspatial/interact/signal-core/create-signal.ts";
 * import { createProjection } from "@inspatial/interact/signal-core/create-projection.ts";
 *
 * // External signal for selected item
 * const [selectedId, setSelectedId] = createSignal(0);
 *
 * // Projection that tracks which items are selected
 * const selectionState = createProjection((draft) => {
 *   const selected = selectedId(); // Read external signal
 *
 *   // Clear previous selection
 *   Object.keys(draft).forEach(key => {
 *     if (draft[key]) draft[key] = false;
 *   });
 *
 *   // Set new selection
 *   if (selected !== undefined) {
 *     draft[selected] = true;
 *   }
 * }, {});
 *
 * // Usage: selectionState[0] will be true when selectedId() === 0
 * console.log(selectionState[0]); // true initially
 *
 * setSelectedId(5);
 * console.log(selectionState[0]); // false
 * console.log(selectionState[5]); // true
 * ```
 *
 * @example
 * ### Example 2: Multi-Source Projection
 * ```typescript
 * // Multiple external signals
 * const [user, setUser] = createSignal({ name: "Ben", role: "admin" });
 * const [permissions, setPermissions] = createSignal(["read", "write"]);
 *
 * // Projection combining multiple sources
 * const userState = createProjection((draft) => {
 *   const currentUser = user();
 *   const userPermissions = permissions();
 *
 *   draft.displayName = currentUser.name;
 *   draft.isAdmin = currentUser.role === "admin";
 *   draft.canWrite = userPermissions.includes("write");
 *   draft.summary = `${currentUser.name} (${currentUser.role})`;
 * }, {});
 *
 * // userState automatically updates when user or permissions change
 * console.log(userState.summary); // "Ben (admin)"
 * ```
 *
 * ### 📝 Uncommon Knowledge
 * Projections are stateless computations disguised as stateful stores.
 * The "store" is just a reactive cache - the real state lives in the external signals.
 * This is why projections are perfect for derived UI state but shouldn't be used for
 * primary application state.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 */
export function createProjection<T extends object>(
  fn: (draft: T) => void,
  initialValue: T = {} as T
): StoreType<T> {
  // Create the base store for holding the projection state
  const [store, setStore] = createStore<T>(initialValue);

  // Keep track of the current draft state outside of reactive context
  // This prevents self-tracking by not reading from the store inside the memo
  let currentDraft: T = JSON.parse(JSON.stringify(initialValue));

  // Create a memo that tracks external dependencies and updates the store
  const projectionMemo = createMemo(() => {
    // Create a working copy of the current draft for the projection function to modify
    // This copy can be read from (for self-references) without creating store dependencies
    const workingDraft = JSON.parse(JSON.stringify(currentDraft)) as T;

    // Run the projection function which will:
    // 1. Track any external signals it reads (good - we want this)
    // 2. Modify the workingDraft (good - no dependencies created)
    // 3. Read from workingDraft for self-references (good - no store dependencies)
    fn(workingDraft);

    // Update our tracking copy
    currentDraft = workingDraft;

    // Update the store with the new state using untrack to avoid feedback loops
    untrack(() => {
      setStore((draft) => {
        // Clear existing properties
        for (const key in draft) {
          delete (draft as any)[key];
        }
        // Apply new properties
        Object.assign(draft, workingDraft);
      });
    });

    // Return a unique value to ensure the memo runs when dependencies change
    return Symbol("projection-update");
  });

  // Force initial evaluation to set up dependencies
  projectionMemo();

  // Return readonly store
  return store;
}

/**
 * # WrapProjection
 * @summary #### Wraps an existing store with projection functionality
 *
 * This function takes an existing store and wraps it with projection behavior,
 * ensuring the projection function runs whenever dependencies change or the store is modified.
 *
 * @since 0.1.0
 * @category InSpatial Interact
 * @module CreateProjection
 * @kind function
 * @access public
 *
 * @param fn - The projection function to apply to the store
 * @param store - The existing store to wrap
 * @param set - The store setter function
 * @returns A tuple of [wrapped store, wrapped setter] with projection behavior
 *
 * ### 🎮 Usage
 *
 * @example
 * ### Example 1: Wrapping Existing Store
 * ```typescript
 * // Existing store
 * const [myStore, setMyStore] = createStore({ items: [] });
 *
 * // External signal
 * const [filter, setFilter] = createSignal("all");
 *
 * // Wrap with projection
 * const [projectedStore, projectedSetter] = wrapProjection(
 *   (draft) => {
 *     const currentFilter = filter();
 *     draft.filteredItems = draft.items.filter(item =>
 *       currentFilter === "all" || item.category === currentFilter
 *     );
 *   },
 *   myStore,
 *   setMyStore
 * );
 *
 * // projectedStore.filteredItems updates automatically when filter changes
 * ```
 */
export function wrapProjection<
  T extends object = Record<string | number | symbol, never>
>(
  fn: (store: T) => void,
  store: StoreType<T>,
  set: StoreSetterType<T>
): [get: StoreType<T>, set: StoreSetterType<T>] {
  // Get initial state to maintain our own copy
  let currentState: T = JSON.parse(JSON.stringify(store));

  // Create a memo that tracks dependencies and applies the projection
  const projectionMemo = createMemo(() => {
    // Create working copy from our maintained state
    const workingState = JSON.parse(JSON.stringify(currentState)) as T;

    // Apply projection function to the working copy
    // The function will track any external signals it reads
    fn(workingState);

    // Update our maintained state
    currentState = workingState;

    // Update the actual store using correct mutation pattern
    untrack(() => {
      set((draft) => {
        // Clear existing properties
        for (const key in draft) {
          delete (draft as any)[key];
        }
        // Apply new properties
        Object.assign(draft, workingState);
      });
    });

    // Return a unique value to ensure the memo runs when dependencies change
    return Symbol("wrap-projection-update");
  });

  // Force initial evaluation
  projectionMemo();

  // Create wrapped setter that re-applies projection after modifications
  const wrappedSet = Object.assign(
    (v: any) => {
      const result = set(v);
      // Update our maintained state to match the new store state
      currentState = JSON.parse(JSON.stringify(store));
      // Re-evaluate projection after store update
      projectionMemo();
      return result;
    },
    {
      path: (...args: [...PathSegmentType[], any]) => {
        const result = set.path(...args);
        currentState = JSON.parse(JSON.stringify(store));
        projectionMemo();
        return result;
      },
      push: (path: PathSegmentType[], ...items: any[]) => {
        const result = set.push(path, ...items);
        currentState = JSON.parse(JSON.stringify(store));
        projectionMemo();
        return result;
      },
      splice: (
        path: PathSegmentType[],
        start: number,
        deleteCount?: number,
        ...items: any[]
      ) => {
        const result = set.splice(path, start, deleteCount, ...items);
        currentState = JSON.parse(JSON.stringify(store));
        projectionMemo();
        return result;
      },
      insert: (path: PathSegmentType[], index: number, ...items: any[]) => {
        const result = set.insert(path, index, ...items);
        currentState = JSON.parse(JSON.stringify(store));
        projectionMemo();
        return result;
      },
      remove: (
        path: PathSegmentType[],
        itemOrMatcher: any | ((item: any, index: number) => boolean)
      ) => {
        const result = set.remove(path, itemOrMatcher);
        currentState = JSON.parse(JSON.stringify(store));
        projectionMemo();
        return result;
      },
    }
  );

  return [store, wrappedSet];
}
