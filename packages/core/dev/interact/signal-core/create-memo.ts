import { ComputationClass, compute as executeComputation } from "./core.ts";
import type {
  AccessorType,
  ComputeFunctionType,
  MemoOptionsType,
  NoInferType,
} from "./types.ts";

/**
 * # CreateMemo
 * @summary #### Creates a reactive computed value that automatically updates when its dependencies change
 *
 * Think of `createMemo` like a formula in a spreadsheet cell. Just like how a cell with
 * "=A1+B1" automatically recalculates when A1 or B1 changes, memos automatically recompute
 * their value when the signals they depend on change.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateMemo
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Memos are computed values derived from other reactive values
 * - They only recompute when their dependencies actually change
 * - Results are cached until dependencies change (memoization)
 * - They're perfect for expensive calculations based on reactive data
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive signals and how to create them
 * - Basic knowledge of pure functions and memoization
 * - Familiarity with computed properties in reactive systems
 *
 * ### 📚 Terminology
 * > **Memo**: A computed reactive value that caches its result
 * > **Memoization**: Caching the result of expensive function calls
 * > **Dependency**: A signal or memo that this memo reads from
 * > **Pure Function**: A function that always returns the same output for the same input
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * > [!NOTE]
 * > Memo functions should be pure - avoid side effects like API calls or DOM updates
 *
 * > [!NOTE]
 * > Use custom equality functions to optimize when expensive recalculations happen
 *
 * > [!NOTE]
 * > Memos are lazy - they only compute when their value is actually accessed
 * </details>
 *
 * @param compute - Pure function that calculates the memo's value from dependencies
 * @param value - Optional initial value before first computation
 * @param options - Configuration options for memo behavior
 *
 * @returns AccessorType<T> - Function that returns the computed value and tracks dependencies
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use memos in real applications:
 *
 * @example
 * ### Example 1: Shopping Cart Total
 * ```typescript
 * import { createSignal, createMemo } from "@in/teract/signal-core";
 *
 * // Create signals for cart items
 * const [items, setItems] = createSignal([
 *   { name: "Book", price: 15, quantity: 2 },
 *   { name: "Pen", price: 3, quantity: 5 }
 * ]);
 *
 * // Memo that calculates total cost automatically
 * const totalCost = createMemo(() => {
 *   return items().reduce((sum, item) => {
 *     return sum + (item.price * item.quantity);
 *   }, 0);
 * });
 *
 * console.log(totalCost()); // 45 (15*2 + 3*5)
 *
 * // Add another item - total automatically updates
 * setItems(prev => [...prev, { name: "Notebook", price: 8, quantity: 1 }]);
 * console.log(totalCost()); // 53 (45 + 8*1)
 * ```
 *
 * @example
 * ### Example 2: User Display Name with Formatting
 * ```typescript
 * import { createSignal, createMemo } from "@in/teract/signal-core";
 *
 * const [firstName, setFirstName] = createSignal("Ben");
 * const [lastName, setLastName] = createSignal("Smith");
 * const [title, setTitle] = createSignal("Dr.");
 *
 * // Memo that formats the full display name
 * const displayName = createMemo(() => {
 *   const first = firstName();
 *   const last = lastName();
 *   const prefix = title();
 *
 *   if (prefix) {
 *     return `${prefix} ${first} ${last}`;
 *   }
 *   return `${first} ${last}`;
 * });
 *
 * console.log(displayName()); // "Dr. Ben Smith"
 *
 * setTitle(""); // Remove title
 * console.log(displayName()); // "Ben Smith"
 *
 * setFirstName("Carolina");
 * console.log(displayName()); // "Carolina Smith"
 * ```
 *
 * @example
 * ### Example 3: Filtered and Sorted Data
 * ```typescript
 * import { createSignal, createMemo } from "@in/teract/signal-core";
 *
 * const [users, setUsers] = createSignal([
 *   { name: "Ben", age: 25, active: true },
 *   { name: "Carolina", age: 30, active: false },
 *   { name: "Alice", age: 28, active: true },
 *   { name: "Bob", age: 35, active: true }
 * ]);
 *
 * const [filterActive, setFilterActive] = createSignal(true);
 * const [sortBy, setSortBy] = createSignal("name");
 *
 * // Memo that filters and sorts users
 * const processedUsers = createMemo(() => {
 *   let result = users();
 *
 *   // Filter by active status
 *   if (filterActive()) {
 *     result = result.filter(user => user.active);
 *   }
 *
 *   // Sort by selected field
 *   const sortField = sortBy();
 *   result = [...result].sort((a, b) => {
 *     if (a[sortField] < b[sortField]) return -1;
 *     if (a[sortField] > b[sortField]) return 1;
 *     return 0;
 *   });
 *
 *   return result;
 * });
 *
 * console.log(processedUsers());
 * // [{ name: "Alice", age: 28, active: true }, { name: "Ben", age: 25, active: true }, ...]
 *
 * setSortBy("age");
 * console.log(processedUsers());
 * // [{ name: "Ben", age: 25, active: true }, { name: "Alice", age: 28, active: true }, ...]
 * ```
 *
 * @example
 * ### Example 4: Expensive Calculation with Custom Equality
 * ```typescript
 * import { createSignal, createMemo } from "@in/teract/signal-core";
 *
 * const [dataSet, setDataSet] = createSignal([1, 2, 3, 4, 5]);
 *
 * // Expensive calculation that we want to minimize
 * const expensiveStats = createMemo(() => {
 *   console.log("Computing expensive statistics...");
 *   const data = dataSet();
 *
 *   return {
 *     sum: data.reduce((a, b) => a + b, 0),
 *     average: data.reduce((a, b) => a + b, 0) / data.length,
 *     max: Math.max(...data),
 *     min: Math.min(...data)
 *   };
 * }, undefined, {
 *   name: "expensive-stats",
 *   // Only recompute if the calculated values actually change
 *   equals: (prev, next) => {
 *     return prev.sum === next.sum &&
 *            prev.average === next.average &&
 *            prev.max === next.max &&
 *            prev.min === next.min;
 *   }
 * });
 *
 * console.log(expensiveStats()); // Logs "Computing..." then the stats
 * console.log(expensiveStats()); // Uses cached result, no "Computing..." log
 *
 * setDataSet([2, 3, 4, 5, 6]); // Different numbers but same stats
 * console.log(expensiveStats()); // Computes, but equality check prevents updates
 * ```
 *
 * @example
 * ### Example 5: Chained Memos for Complex Pipelines
 * ```typescript
 * import { createSignal, createMemo } from "@in/teract/signal-core";
 *
 * const [rawData, setRawData] = createSignal("Ben,25,Engineer;Carolina,30,Designer;Alice,28,Developer");
 *
 * // First memo: parse raw data
 * const parsedData = createMemo(() => {
 *   return rawData().split(';').map(row => {
 *     const [name, age, role] = row.split(',');
 *     return { name, age: parseInt(age), role };
 *   });
 * });
 *
 * // Second memo: filter adults
 * const adults = createMemo(() => {
 *   return parsedData().filter(person => person.age >= 18);
 * });
 *
 * // Third memo: group by role
 * const groupedByRole = createMemo(() => {
 *   const groups = {};
 *   adults().forEach(person => {
 *     if (!groups[person.role]) {
 *       groups[person.role] = [];
 *     }
 *     groups[person.role].push(person);
 *   });
 *   return groups;
 * });
 *
 * console.log(groupedByRole());
 * // { Engineer: [{ name: "Ben", age: 25, role: "Engineer" }], Designer: [...], Developer: [...] }
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Use memos for expensive calculations, not simple property access
 * - Custom equality functions can prevent unnecessary recalculations
 * - Chain memos to break complex computations into reusable pieces
 * - Memos are lazy - they only compute when accessed, not when dependencies change
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Side effects**: Don't perform API calls or DOM updates in memo functions
 * - **Mutating data**: Always return new objects/arrays, don't modify existing ones
 * - **Over-memoization**: Don't create memos for simple property access
 * - **Forgetting dependencies**: Make sure to access all signals the memo should react to
 * </details>
 *
 * @throws {Error} Any error thrown by the compute function during calculation
 *
 * @returns {AccessorType<T>} Function that returns the computed value and registers dependency tracking
 *
 * ### 📝 Uncommon Knowledge
 * Memos implement "lazy evaluation" - they don't actually run their computation
 * until someone asks for their value. This means you can create complex dependency
 * graphs without performance penalties until the values are actually needed.
 * It's like having a smart assistant who only does work when you ask for results.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link createSignal} - For creating reactive primitive values that memos can depend on
 * - {@link createEffect} - For performing side effects when memo values change
 * - {@link createStore} - For managing complex reactive objects
 *
 * @external GitHub
 * {@link https://github.com/inspatiallabs/inspatial-core GitHub Repository}
 * Source code and issue tracking
 */
/** The extra Prev generic parameter separates inference of the compute input
 * parameter type from inference of the compute return type, so that the effect
 * return type is always used as the memo Accessor's return type. */
export function createMemo<Next extends Prev, Prev = Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Prev>, Next>
): AccessorType<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  compute: ComputeFunctionType<Init | Prev, Next>,
  value: Init,
  options?: MemoOptionsType<Next>
): AccessorType<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  compute: ComputeFunctionType<Init | Prev, Next>,
  value?: Init,
  options?: MemoOptionsType<Next>
): AccessorType<Next> {
  /** Ensure options object exists to avoid null checks */
  const memoOptions = options || {};

  /** CRITICAL FIX: Create the computation node that will reactively recompute */
  const node = new ComputationClass<Next>(
    value as any,
    compute as any /** Pass the user's compute function directly */,
    memoOptions
  );

  if (false && __DEV__) {
    console.log(
      `[CREATE_MEMO] Created memo with _compute: ${!!node._compute}, name: ${
        node._name
      }`
    );
  }

  /** Explicitly set the equals function to ensure proper change detection */
  if (memoOptions.equals !== undefined) {
    node._equals = memoOptions.equals;
  }

  /** Return the memo accessor */
  return () => {
    /** Use read() for proper reactive dependency tracking */
    const result = node.read();
    if (false && __DEV__) {
      console.log(
        `[MEMO READ] Memo read returned: ${result}, node._value: ${node._value}, node._state: ${node._state}`
      );
    }
    return result;
  };
}
