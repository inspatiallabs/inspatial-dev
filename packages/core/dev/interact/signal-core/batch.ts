/**
 * @module @in/teract/signal-core/is-batching
 *
 * This module provides utilities (`isBatching` and `batch`) to manage and optimize the
 * execution of reactive updates. It allows multiple changes to signals or stores to be
 * grouped together, deferring the actual re-computation of effects and memos until the
 * entire batch of changes is complete. This prevents unnecessary intermediate updates
 * and improves performance.
 *
 * Think of it like making multiple changes to a document before hitting "Save". Instead of
 * saving (and potentially triggering notifications or auto-processes) after every single keystroke,
 * `batch` lets you make all your edits, and then all the consequences (reactive updates)
 * happen once at the end.
 *
 * @example Basic Batching
 * ```typescript
 * import { createSignal, createEffect, batch, isBatching } from "@in/teract/signal-core";
 *
 * const [firstName, setFirstName] = createSignal("Ben");
 * const [lastName, setLastName] = createSignal("Smith");
 *
 * createEffect(() => {
 *   console.log(`Full Name: ${firstName()} ${lastName()}, Batching: ${isBatching()}`);
 * });
 *
 * // Without batch, effect runs twice:
 * // setFirstName("Carolina"); // Logs: Full Name: Carolina Smith, Batching: false
 * // setLastName("Jones");    // Logs: Full Name: Carolina Jones, Batching: false
 *
 * console.log("Starting batch update...");
 * batch(() => {
 *   console.log("Inside batch, isBatching():", isBatching()); // true
 *   setFirstName("Michael"); // Update queued
 *   setLastName("Davis");    // Update queued
 *   console.log("Updates queued, effect has not run yet for these changes.");
 * }); // Effect runs once here: Logs: Full Name: Michael Davis, Batching: false
 * console.log("Batch update finished.");
 * ```
 *
 * @features
 *  - **`batch(fn)`**: Groups multiple signal/store updates within `fn` to be processed as a single atomic operation.
 *  - **`isBatching()`**: Returns `true` if currently executing within a `batch` scope, `false` otherwise.
 *  - **Performance Optimization**: Reduces redundant computations by deferring effects until all batched changes are applied.
 *  - **Synchronous Flushing**: Ensures all batched updates are processed synchronously when the outermost batch completes.
 *  - **Nested Batches**: Correctly handles nested calls to `batch`, only flushing updates when the outermost batch concludes.
 *
 * @see {@link createSignal} - Signals whose updates can be batched.
 * @see {@link createStore} - Stores whose updates can be batched.
 * @see {@link createEffect} - Effects whose execution is deferred by batching.
 * @see {@link flushSync} - The underlying mechanism used by `batch` to process queued updates.
 */

import { flushSync } from "./scheduler.ts";

let batchDepth = 0;

/**
 * # isBatching
 * @summary #### Checks if the current code execution is within a `batch` operation.
 *
 * This function returns `true` if the current execution context is inside a callback
 * passed to the `batch` function. It's useful for utilities or effects that might
 * behave differently depending on whether updates are being batched.
 *
 * Imagine you have a team of workers. `isBatching()` is like asking, "Are we currently
 * in a coordinated work session (a batch), or is everyone working independently?"
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Batching
 * @kind function
 * @access public
 *
 * @returns {boolean} `true` if currently inside a `batch` scope, `false` otherwise.
 *
 * @example
 * ```typescript
 * import { batch, isBatching, createSignal, createEffect } from "@in/teract/signal-core";
 *
 * const [value, setValue] = createSignal(0);
 *
 * createEffect(() => {
 *   console.log(`Effect running. Batching status: ${isBatching()}. Value: ${value()}`);
 * });
 *
 * console.log("Before batch:", isBatching()); // false
 *
 * batch(() => {
 *   console.log("Inside batch (1):", isBatching()); // true
 *   setValue(1);
 *   batch(() => {
 *     console.log("Inside nested batch (2):", isBatching()); // true
 *     setValue(2);
 *   });
 *   console.log("Exiting nested batch, still in batch (1):", isBatching()); // true
 * });
 *
 * console.log("After batch:", isBatching()); // false
 * // Effect will log once with Value: 2, and Batching status: false (as effects run after batch completes)
 * ```
 */
export function isBatching(): boolean {
  return batchDepth > 0;
}

/**
 * # Batch
 * @summary #### Groups multiple reactive updates to be processed as a single operation.
 *
 * The `batch` function takes a callback (`fn`). Any signal or store updates made inside
 * this callback are queued. Reactive computations (effects, memos) that depend on these
 * changing signals/stores will not re-run immediately after each individual update.
 * Instead, all queued updates are flushed and all dependent computations are re-run
 * synchronously only once, after the `fn` has completed and the outermost `batch` scope ends.
 *
 * This is like telling a group of painters to prepare multiple spots on a wall (making individual
 * signal changes) but to only start painting the final picture (running effects) once all
 * preparations are done. This prevents them from repainting sections multiple times if several
 * preparatory steps affect the same area.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Batching
 * @kind function
 * @access public
 *
 * @typeParam T - The return type of the function `fn`.
 * @param {() => T} fn - A function containing one or more signal/store updates.
 * @returns {T} The value returned by the function `fn`.
 *
 * ### 💡 Core Concepts
 * - **Update Coalescing**: Prevents multiple effect runs for rapid, successive changes to the same or related signals.
 * - **Synchronous Execution**: When the batch completes, all necessary effects are run synchronously within the same microtask.
 * - **Nesting**: `batch` calls can be nested. Updates are only flushed when the outermost batch completes.
 * - **Performance**: Improves performance by reducing the number of times reactive computations need to run.
 *
 * ### 🎮 Usage
 * #### Examples
 * @example
 * ### Example 1: Basic Batching of Signal Updates
 * ```typescript
 * import { createSignal, createEffect, batch } from "@in/teract/signal-core";
 *
 * const [name, setName] = createSignal("Anonymous");
 * const [age, setAge] = createSignal(0);
 * const [status, setStatus] = createSignal("Offline");
 *
 * createEffect(() => {
 *   console.log(`User: ${name()}, Age: ${age()}, Status: ${status()}`);
 * });
 *
 * // Without batch, the effect would run 3 times.
 * // With batch, it runs only once after all changes.
 * batch(() => {
 *   setName("Ben");
 *   setAge(30);
 *   setStatus("Online");
 * });
 * // Output: User: Ben, Age: 30, Status: Online (logged once)
 * ```
 *
 * @example
 * ### Example 2: Nested Batches
 * ```typescript
 * import { createSignal, createEffect, batch } from "@in/teract/signal-core";
 *
 * const [a, setA] = createSignal(1);
 * const [b, setB] = createSignal(10);
 *
 * createEffect(() => console.log(`a: ${a()}, b: ${b()}`), undefined);
 *
 * batch(() => {
 *   setA(2); // Queued
 *   console.log("Outer batch: a set to 2");
 *
 *   batch(() => {
 *     setB(20); // Queued
 *     console.log("Inner batch: b set to 20");
 *     setA(3); // Queued, overwrites previous setA(2) for this batch
 *     console.log("Inner batch: a set to 3");
 *   });
 *
 *   console.log("Exited inner batch, still in outer batch.");
 *   setB(30); // Queued, overwrites previous setB(20) for this batch
 * });
 * // Effect logs once: "a: 3, b: 30"
 * ```
 *
 * @example
 * ### Example 3: Batching Store Updates
 * ```typescript
 * import { createStore, createEffect, batch } from "@in/teract/signal-core";
 *
 * const [user, setUser] = createStore({ name: "Guest", role: "User" });
 *
 * createEffect(() => {
 *   console.log(`Store User: ${user.name}, Role: ${user.role}`);
 * });
 *
 * batch(() => {
 *   setUser("name", "AdminUser");
 *   setUser("role", "Administrator");
 *   // Other store operations can also be batched here
 *   // e.g., setUser.path("profile", "age", 42);
 * });
 * // Effect logs once: "Store User: AdminUser, Role: Administrator"
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance benefits</summary>
 *
 * - **Reduce Computations**: Batching is most effective when multiple signals that are dependencies of the same effect(s) are updated together. It consolidates what would have been several separate effect executions into one.
 * - **UI Updates**: In UI frameworks, batching can prevent multiple re-renders of a component if several pieces of its state change in quick succession.
 * - **Complex State Transitions**: When a single user action should result in multiple state changes that logically form one transaction, `batch` ensures these are applied atomically from the perspective of reactive effects.
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Async Operations Inside Batch**: While `batch` itself is synchronous, if the batched function `fn` contains asynchronous operations (e.g., `await fetch(...)`), the batch will complete *before* the async operation resolves. Reactive updates triggered by the async operation's resolution will not be part of the original batch. `batch` only defers synchronous effects from synchronous signal/store updates made within its scope.
 * - **Expecting `isBatching()` to be true in Effects**: Effects run *after* a batch completes. So, `isBatching()` will typically be `false` inside an effect callback, even if the updates that triggered the effect were batched.
 * </details>
 */
export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      // ensure pending work is processed synchronously
      flushSync();
    }
  }
}
