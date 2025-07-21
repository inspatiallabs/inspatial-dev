/**
 * @module @in/teract/signal-core/map
 *
 * This module provides advanced utilities for reactively transforming and rendering collections
 * of data. It includes `mapArray` for mapping over reactive lists (similar to `Array.prototype.map`
 * but for signals) and `repeat` for rendering a block of content a specific number of times.
 * These are often used as underlying helpers for control flow components in UI rendering (e.g., `<For>` or `<Repeat>` components).
 *
 * Think of these utilities as specialized chefs for lists. `mapArray` is like a chef who takes a list
 * of ingredients (your reactive array) and transforms each one according to a recipe (your mapping function),
 * efficiently updating only the dishes that changed if an ingredient is swapped. `repeat` is like a chef
 * who bakes a specified number of identical cookies, efficiently adding or removing cookies as the count changes.
 *
 * @example Basic mapArray Usage
 * ```typescript
 * import { createSignal, mapArray, createEffect } from "@in/teract/signal-core";
 *
 * const [users, setUsers] = createSignal([
 *   { id: 1, name: "Ben", active: true },
 *   { id: 2, name: "Carolina", active: false },
 * ]);
 *
 * const userNames = mapArray(
 *   users,
 *   (userSignal, indexSignal) => {
 *     // userSignal is an accessor for the current user object
 *     // indexSignal is an accessor for the current index
 *     return `${indexSignal() + 1}. ${userSignal().name.toUpperCase()}`;
 *   }
 * );
 *
 * createEffect(() => console.log("User Names:", userNames()));
 * // Initial output: User Names: [ "1. BEN", "2. CAROLINA" ]
 *
 * setUsers(prev => [...prev, { id: 3, name: "Alice", active: true }]);
 * // Output: User Names: [ "1. BEN", "2. CAROLINA", "3. ALICE" ]
 * ```
 *
 * @example Basic repeat Usage
 * ```typescript
 * import { createSignal, repeat, createEffect } from "@in/teract/signal-core";
 *
 * const [count, setCount] = createSignal(2);
 *
 * const repeatedItems = repeat(count, (index) => `Item #${index + 1}`);
 *
 * createEffect(() => console.log("Repeated:", repeatedItems()));
 * // Initial output: Repeated: [ "Item #1", "Item #2" ]
 *
 * setCount(3);
 * // Output: Repeated: [ "Item #1", "Item #2", "Item #3" ]
 * ```
 *
 * @features
 *  - **`mapArray`**: Reactively maps over an array signal, efficiently updating items.
 *  - **`repeat`**: Reactively renders a template a specified number of times.
 *  - **Keyed Updates (`mapArray`)**: Supports keyed iteration for optimized reordering and updates when array items change identity.
 *  - **Fallback Content**: Both utilities can render fallback content if the list is empty or count is zero.
 *  - **Reactive Indices**: `mapArray` provides a reactive accessor for the current item's index.
 *  - **Efficient DOM Reconciliation**: Designed to minimize DOM manipulations when used in rendering contexts.
 *
 * @see {@link createSignal} - For creating the reactive lists or counts that these utilities operate on.
 * @see {@link createEffect} - For observing the results of `mapArray` or `repeat`.
 * @access package
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 */

import { ComputationClass, compute, OwnerClass } from "./index.ts";
import { runWithOwner } from "./run-with-owner.ts";
import type { AccessorType } from "./types.ts";
import { $TRACK } from "./create-store.ts";

/**
 * # Maybe
 * @summary #### Type utility representing a value that might be T, or a falsy void/null/undefined/false.
 *
 * This type is often used in reactive contexts where a signal or accessor might not yet have a value,
 * or its value explicitly indicates absence or a non-ready state.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module MapUtils
 * @typedef {T | void | null | undefined | false} Maybe<T>
 * @template T The underlying type that might be present.
 */
export type Maybe<T> = T | void | null | undefined | false;

/**
 * # mapArray
 * @summary #### Reactively transforms a list of items, updating only what changes.
 *
 * `mapArray` is like a smart version of JavaScript's `Array.prototype.map` for reactive lists (signals).
 * It takes a signal containing an array and a mapping function. This mapping function receives an
 * accessor for each item and an accessor for its index, and should return the transformed item.
 * `mapArray` efficiently updates the resulting array of transformed items, only re-mapping items
 * that have changed or when the list structure (adds/removes/reorders) is modified.
 *
 * This is highly optimized for rendering lists in UIs, as it tries to minimize DOM changes by
 * re-using existing elements when possible, especially with keyed items.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module MapUtils
 * @kind function
 * @access public
 *
 * @template Item The type of items in the input list.
 * @template MappedItem The type of items in the output (mapped) list.
 *
 * @param {AccessorType<Maybe<readonly Item[]>>} list - An accessor to a signal containing the array of items to map. The array can be `null`, `undefined`, or `false` to represent an empty or non-existent list.
 * @param {(value: AccessorType<Item>, index: AccessorType<number>) => MappedItem} map - A function that transforms each item. It receives:
 *   - `value`: An accessor function that returns the current item.
 *   - `index`: An accessor function that returns the current item's reactive index.
 *   It should return the mapped item.
 * @param {object} [options] - Optional parameters for `mapArray`.
 * @param {boolean | ((item: Item) => any)} [options.keyed] - If `true`, uses strict equality (`===`) on items for keyed diffing. If a function is provided, it will be used to extract a unique key from each item for more stable reordering and updates. Defaults to `false` (non-keyed).
 * @param {AccessorType<any>} [options.fallback] - An accessor to a fallback content to render if the input `list` is empty (or `null`/`undefined`/`false`).
 *
 * @returns {AccessorType<MappedItem[]>} An accessor to a signal containing the array of mapped items.
 *
 * ### 💡 Core Concepts
 * - **Reactive Transformation**: Updates the mapped list automatically when the source list or its items change.
 * - **Efficient Updates**: Only re-maps items that change. With `keyed` mode, it can efficiently handle reorders.
 * - **Reactive Item & Index**: The mapping function receives accessors for item and index, allowing fine-grained reactivity within the map callback itself if needed.
 * - **Keyed Mode**: Using `options.keyed` (especially with a key-deriving function) allows `mapArray` to track items by a unique ID. This means if items are reordered, their corresponding mapped representations (e.g., DOM elements) can be reordered too, rather than being destroyed and recreated.
 * - **Fallback**: Provides a way to render alternative content when the list is empty.
 *
 * ### 🎮 Usage
 * @example
 * ### Example 1: Simple List of Strings
 * ```typescript
 * import { createSignal, mapArray, createEffect } from "@in/teract/signal-core";
 *
 * const [tags, setTags] = createSignal(["typescript", "reactive", "signals"]);
 *
 * const mappedTags = mapArray(tags, (tag, index) => {
 *   return `Tag ${index() + 1}: ${tag().toUpperCase()}`;
 * });
 *
 * createEffect(() => console.log(mappedTags()));
 * // Output: [ "Tag 1: TYPESCRIPT", "Tag 2: REACTIVE", "Tag 3: SIGNALS" ]
 *
 * setTags(currentTags => [currentTags[0], "solidjs", currentTags[2]]);
 * // Output: [ "Tag 1: TYPESCRIPT", "Tag 2: SOLIDJS", "Tag 3: SIGNALS" ] (only second item re-mapped)
 * ```
 *
 * @example
 * ### Example 2: Keyed List of Objects for Stable Rendering
 * ```typescript
 * import { createSignal, mapArray, createEffect } from "@in/teract/signal-core";
 *
 * interface User { id: number; name: string; online: boolean; }
 * const [users, setUsers] = createSignal<User[]>([
 *   { id: 1, name: "Ben", online: true },
 *   { id: 2, name: "Carolina", online: false },
 *   { id: 3, name: "Alice", online: true },
 * ]);
 *
 * const userPills = mapArray(
 *   users,
 *   (userAcc, indexAcc) => {
 *     // Create reactive elements based on user data
 *     // In a real UI, this would return JSX or DOM elements
 *     console.log(`Mapping user ID: ${userAcc().id} at index ${indexAcc()}`);
 *     return {
 *       id: userAcc().id,
 *       display: `${userAcc().name} (${userAcc().online ? 'Online' : 'Offline'})`
 *     };
 *   },
 *   { keyed: (user) => user.id } // Use user.id as the key
 * );
 *
 * createEffect(() => console.log("User Pills:", JSON.stringify(userPills())));
 *
 * // Reorder users: Without a key, all items might re-render.
 * // With `keyed: user => user.id`, mapArray can potentially reorder existing DOM elements.
 * setTimeout(() => {
 *   setUsers(current => [current[2], current[0], current[1]]);
 *   // Mapping logs will show efficient updates/reorders if console.log is inside map fn
 * }, 1000);
 * ```
 *
 * @example
 * ### Example 3: List with Fallback Content
 * ```typescript
 * import { createSignal, mapArray, createEffect } from "@in/teract/signal-core";
 *
 * const [items, setItems] = createSignal<string[]>([]);
 *
 * const renderedItems = mapArray(
 *   items,
 *   (item) => `<li>${item()}</li>`,
 *   { fallback: () => "<p>No items available.</p>" }
 * );
 *
 * createEffect(() => {
 *   // In a real app, you'd inject this into the DOM
 *   console.log(Array.isArray(renderedItems()) ? renderedItems().join("") : renderedItems());
 * });
 * // Output: <p>No items available.</p>
 *
 * setItems(["Apple", "Banana"]);
 * // Output: <li>Apple</li><li>Banana</li>
 * ```
 */
export function mapArray<Item, MappedItem>(
  list: AccessorType<Maybe<readonly Item[]>>,
  map: (value: AccessorType<Item>, index: AccessorType<number>) => MappedItem,
  options?: {
    keyed?: boolean | ((item: Item) => any);
    fallback?: AccessorType<any>;
  }
): AccessorType<MappedItem[]> {
  const keyFn =
    typeof options?.keyed === "function" ? options.keyed : undefined;
  return updateKeyedMap.bind({
    _owner: new OwnerClass(),
    _len: 0,
    _list: list,
    _items: [],
    _map: map,
    _mappings: [],
    _nodes: [],
    _key: keyFn,
    _rows: keyFn || options?.keyed === false ? [] : undefined,
    _indexes: map.length > 1 ? [] : undefined,
    _fallback: options?.fallback,
  });
}

/**
 * @summary Internal helper function that performs the keyed/non-keyed mapping logic.
 * It's bound to a `MapData` context object.
 * @internal
 */
function updateKeyedMap<Item, MappedItem>(
  this: MapData<Item, MappedItem>
): any[] {
  const newItems = this._list() || [],
    newLen = newItems.length;
  (newItems as any)[$TRACK]; // top level tracking

  runWithOwner(this._owner, () => {
    let i: number,
      j: number,
      mapper = this._rows
        ? () => {
            this._rows![j] = new ComputationClass(newItems[j], null);
            this._indexes &&
              (this._indexes![j] = new ComputationClass(j, null));
            return this._map(
              ComputationClass.prototype.read.bind(this._rows![j]),
              this._indexes
                ? ComputationClass.prototype.read.bind(this._indexes![j])
                : (undefined as any)
            );
          }
        : this._indexes
        ? () => {
            const item = newItems[j];
            this._indexes![j] = new ComputationClass(j, null);
            return this._map(
              () => item,
              ComputationClass.prototype.read.bind(this._indexes![j])
            );
          }
        : () => {
            const item = newItems[j];
            return (this._map as (value: () => Item) => MappedItem)(() => item);
          };

    // fast path for empty arrays
    if (newLen === 0) {
      if (this._len !== 0) {
        this._owner.dispose(false);
        this._nodes = [];
        this._items = [];
        this._mappings = [];
        this._len = 0;
        this._rows && (this._rows = []);
        this._indexes && (this._indexes = []);
      }
      if (this._fallback && !this._mappings[0]) {
        // create fallback
        this._mappings[0] = compute<MappedItem>(
          (this._nodes[0] = new OwnerClass()),
          this._fallback,
          null
        );
      }
    }
    // fast path for new create
    else if (this._len === 0) {
      // dispose previous fallback
      if (this._nodes[0]) this._nodes[0].dispose();
      this._mappings = new Array(newLen);

      for (j = 0; j < newLen; j++) {
        this._items[j] = newItems[j];
        this._mappings[j] = compute<MappedItem>(
          (this._nodes[j] = new OwnerClass()),
          mapper,
          null
        );
      }

      this._len = newLen;
    } else {
      let start: number,
        end: number,
        newEnd: number,
        item: Item,
        key: any,
        newIndices: Map<Item, number>,
        newIndicesNext: number[],
        temp: MappedItem[] = new Array(newLen),
        tempNodes: OwnerClass[] = new Array(newLen),
        tempRows: ComputationClass<Item>[] | undefined = this._rows
          ? new Array(newLen)
          : undefined,
        tempIndexes: ComputationClass<number>[] | undefined = this._indexes
          ? new Array(newLen)
          : undefined;

      // skip common prefix
      for (
        start = 0, end = Math.min(this._len, newLen);
        start < end &&
        (this._items[start] === newItems[start] ||
          (this._rows &&
            compare(this._key, this._items[start], newItems[start])));
        start++
      ) {
        if (this._rows) this._rows[start].write(newItems[start]);
      }

      // common suffix
      for (
        end = this._len - 1, newEnd = newLen - 1;
        end >= start &&
        newEnd >= start &&
        (this._items[end] === newItems[newEnd] ||
          (this._rows &&
            compare(this._key, this._items[end], newItems[newEnd])));
        end--, newEnd--
      ) {
        temp[newEnd] = this._mappings[end];
        tempNodes[newEnd] = this._nodes[end];
        tempRows && (tempRows[newEnd] = this._rows![end]);
        tempIndexes && (tempIndexes[newEnd] = this._indexes![end]);
      }

      // 0) prepare a map of all indices in newItems, scanning backwards so we encounter them in natural order
      newIndices = new Map<Item, number>();
      newIndicesNext = new Array(newEnd + 1);
      for (j = newEnd; j >= start; j--) {
        item = newItems[j];
        key = this._key ? this._key(item) : item;
        i = newIndices.get(key)!;
        newIndicesNext[j] = i === undefined ? -1 : i;
        newIndices.set(key, j);
      }

      // 1) step through all old items and see if they can be found in the new set; if so, save them in a temp array and mark them moved; if not, exit them
      for (i = start; i <= end; i++) {
        item = this._items[i];
        key = this._key ? this._key(item) : item;
        j = newIndices.get(key)!;
        if (j !== undefined && j !== -1) {
          temp[j] = this._mappings[i];
          tempNodes[j] = this._nodes[i];
          tempRows && (tempRows[j] = this._rows![i]);
          tempIndexes && (tempIndexes[j] = this._indexes![i]);
          j = newIndicesNext[j];
          newIndices.set(key, j);
        } else this._nodes[i].dispose();
      }

      // 2) set all the new values, pulling from the temp array if copied, otherwise entering the new value
      for (j = start; j < newLen; j++) {
        if (j in temp) {
          this._mappings[j] = temp[j];
          this._nodes[j] = tempNodes[j];
          if (tempRows) {
            this._rows![j] = tempRows[j];
            this._rows![j].write(newItems[j]);
          }
          if (tempIndexes) {
            this._indexes![j] = tempIndexes[j];
            this._indexes![j].write(j);
          }
        } else {
          this._mappings[j] = compute<MappedItem>(
            (this._nodes[j] = new OwnerClass()),
            mapper,
            null
          );
        }
      }

      // 3) in case the new set is shorter than the old, set the length of the mapped array
      this._mappings = this._mappings.slice(0, (this._len = newLen));

      // 4) save a copy of the mapped items for the next update
      this._items = newItems.slice(0);
    }
  });

  return this._mappings;
}

/**
 * # repeat
 * @summary #### Reactively renders a block of content a specified number of times.
 *
 * `repeat` is a utility for scenarios where you need to render a template or execute a mapping
 * function a dynamic number of times, based on a reactive count. It's efficient because it
 * only creates or disposes of items at the beginning or end of the list as the count changes.
 *
 * This is useful for rendering lists where the items themselves don't have unique identities
 * or when you simply need to repeat a visual element (e.g., a series of placeholder boxes).
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module MapUtils
 * @kind function
 * @access public
 *
 * @template MappedItem The type of item returned by the mapping function.
 *
 * @param {AccessorType<number>} count - An accessor to a signal representing how many times the `map` function should be called.
 * @param {(index: number) => MappedItem} map - A function that is called for each repetition. It receives the current zero-based `index` and should return the content to be rendered for that repetition.
 * @param {object} [options] - Optional parameters for `repeat`.
 * @param {AccessorType<number | undefined>} [options.from] - An accessor to an optional starting offset for the indices passed to the `map` function. Defaults to `0`.
 * @param {AccessorType<any>} [options.fallback] - An accessor to fallback content to render if `count` is `0`.
 *
 * @returns {AccessorType<MappedItem[]>} An accessor to a signal containing the array of items generated by the `map` function.
 *
 * ### 💡 Core Concepts
 * - **Count-Based Repetition**: Renders based on a numeric count signal.
 * - **Efficient Updates**: Adds/removes items from the end of the list as count changes.
 * - **Index Mapping**: The `map` function receives the current iteration index.
 * - **Offset Support**: `options.from` allows starting the index from a value other than 0.
 * - **Fallback**: Can display alternative content when count is zero.
 *
 * ### 🎮 Usage
 * @example
 * ### Example 1: Repeating a Simple Element
 * ```typescript
 * import { createSignal, repeat, createEffect } from "@in/teract/signal-core";
 *
 * const [starCount, setStarCount] = createSignal(3);
 *
 * // Creates an array of star strings
 * const stars = repeat(starCount, (index) => `Star ${index + 1} ⭐`);
 *
 * createEffect(() => console.log(stars().join(", ")));
 * // Output: Star 1 ⭐, Star 2 ⭐, Star 3 ⭐
 *
 * setStarCount(1);
 * // Output: Star 1 ⭐
 * ```
 *
 * @example
 * ### Example 2: Repeating with an Offset and Fallback
 * ```typescript
 * import { createSignal, repeat, createEffect } from "@in/teract/signal-core";
 *
 * const [pageNumber, setPageNumber] = createSignal(2); // Current page
 * const itemsPerPage = 3;
 *
 * // Simulate repeating items for the current page with an offset
 * const pageItems = repeat(
 *   () => itemsPerPage, // Count is fixed at itemsPerPage
 *   (index) => `Item with actual index: ${index}`,
 *   {
 *     from: () => (pageNumber() - 1) * itemsPerPage, // Calculate starting index based on page
 *     fallback: () => "No items on this page (or count is zero)"
 *   }
 * );
 *
 * createEffect(() => console.log(`Page ${pageNumber()}:`, pageItems()));
 * // Output for pageNumber=2: Page 2: [ "Item with actual index: 3", "Item with actual index: 4", "Item with actual index: 5" ]
 *
 * setPageNumber(1);
 * // Output for pageNumber=1: Page 1: [ "Item with actual index: 0", "Item with actual index: 1", "Item with actual index: 2" ]
 *
 * // const [emptyCount, setEmptyCount] = createSignal(0);
 * // const emptyRepeated = repeat(emptyCount, (i) => i, { fallback: () => "List is empty!" });
 * // createEffect(() => console.log(emptyRepeated())); // Output: List is empty!
 * ```
 */
export function repeat(
  count: AccessorType<number>,
  map: (index: number) => any,
  options?: {
    from?: AccessorType<number | undefined>;
    fallback?: AccessorType<any>;
  }
): AccessorType<any[]> {
  return updateRepeat.bind({
    _owner: new OwnerClass(),
    _len: 0,
    _offset: 0,
    _count: count,
    _map: map,
    _nodes: [],
    _mappings: [],
    _from: options?.from,
    _fallback: options?.fallback,
  });
}

/**
 * @summary Internal helper function that performs the repeat logic.
 * It's bound to a `RepeatData` context object.
 * @internal
 */
function updateRepeat<MappedItem>(this: RepeatData<MappedItem>): any[] {
  const newLen = this._count();
  const from = this._from?.() || 0;
  runWithOwner(this._owner, () => {
    if (newLen === 0) {
      if (this._len !== 0) {
        this._owner.dispose(false);
        this._nodes = [];
        this._mappings = [];
        this._len = 0;
      }
      if (this._fallback && !this._mappings[0]) {
        // create fallback
        this._mappings[0] = compute<MappedItem>(
          (this._nodes[0] = new OwnerClass()),
          this._fallback,
          null
        );
      }
      return;
    }
    const to = from + newLen;
    const prevTo = this._offset + this._len;

    // remove fallback
    if (this._len === 0 && this._nodes[0]) this._nodes[0].dispose();

    // clear the end
    for (let i = to; i < prevTo; i++) this._nodes[i - this._offset].dispose();

    if (this._offset < from) {
      // clear beginning
      let i = this._offset;
      while (i < from && i < this._len) this._nodes[i++].dispose();
      // shift indexes
      this._nodes.splice(0, from - this._offset);
      this._mappings.splice(0, from - this._offset);
    } else if (this._offset > from) {
      // shift indexes
      let i = prevTo - this._offset - 1;
      let difference = this._offset - from;
      this._nodes.length = this._mappings.length = newLen;
      while (i >= difference) {
        this._nodes[i] = this._nodes[i - difference];
        this._mappings[i] = this._mappings[i - difference];
        i--;
      }
      for (let i = 0; i < difference; i++) {
        this._mappings[i] = compute<MappedItem>(
          (this._nodes[i] = new OwnerClass()),
          () => this._map(i + from),
          null
        );
      }
    }

    for (let i = prevTo; i < to; i++) {
      this._mappings[i - from] = compute<MappedItem>(
        (this._nodes[i - from] = new OwnerClass()),
        () => this._map(i),
        null
      );
    }
    this._mappings = this._mappings.slice(0, newLen);
    this._offset = from;
    this._len = newLen;
  });
  return this._mappings;
}

/**
 * @summary Internal comparison helper, potentially used by keyed mapping if a `_key` function is provided.
 * @internal
 */
function compare<Item>(
  key: ((i: any) => any) | undefined,
  a: Item,
  b: Item
): boolean {
  return key ? key(a) === key(b) : true;
}

/**
 * # RepeatData
 * @summary #### Internal interface describing the context object for `updateRepeat`.
 * @internal
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module MapUtils
 * @interface
 * @template MappedItem The type of item returned by the mapping function.
 */
interface RepeatData<MappedItem = any> {
  _owner: OwnerClass;
  _len: number;
  _count: AccessorType<number>;
  _map: (index: number) => MappedItem;
  _mappings: MappedItem[];
  _nodes: OwnerClass[];
  _offset: number;
  _from?: AccessorType<number | undefined>;
  _fallback?: AccessorType<any>;
}

/**
 * # MapData
 * @summary #### Internal interface describing the context object for `updateKeyedMap`.
 * @internal
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module MapUtils
 * @interface
 * @template Item The type of items in the input list.
 * @template MappedItem The type of items in the output (mapped) list.
 */
interface MapData<Item = any, MappedItem = any> {
  _owner: OwnerClass;
  _len: number;
  _list: AccessorType<Maybe<readonly Item[]>>;
  _items: Item[];
  _mappings: MappedItem[];
  _nodes: OwnerClass[];
  _map: (value: AccessorType<any>, index: AccessorType<number>) => any;
  _key: ((i: any) => any) | undefined;
  _rows?: ComputationClass<Item>[];
  _indexes?: ComputationClass<number>[];
  _fallback?: AccessorType<any>;
}
