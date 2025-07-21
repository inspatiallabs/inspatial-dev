import { compute } from "./core.ts";
import type { OwnerClass } from "./owner.ts";

/**
 * # runWithOwner
 * @summary #### Executes a function within a specific reactive ownership context, untracked by the current scope.
 *
 * The `runWithOwner` function is an advanced utility that allows you to execute a given function (`run`)
 * as if it were running directly under a specified `owner` (a reactive scope). Any reactive primitives
 * (signals, effects, memos) created or any `onCleanup` functions registered inside the `run` function
 * will belong to this explicitly provided `owner`.
 *
 * Importantly, the execution of the `run` function itself is **untracked** by any outer reactive
 * computation. This means that changes to signals read inside `run` will not cause the surrounding
 * effect or memo (where `runWithOwner` might have been called) to re-execute based on those reads.
 * The primary purpose is to control ownership, not to establish new reactive dependencies for the
 * calling scope.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module OwnerUtils
 * @kind function
 * @access public
 *
 * @template T - The return type of the `run` function.
 *
 * @param {OwnerClass | null} owner - The `OwnerClass` instance (or `null` for a top-level, unowned context)
 *   that will become the current owner during the execution of the `run` function. Reactive computations
 *   created inside `run` will be children of this owner.
 * @param {() => T} run - The function to execute within the specified ownership context.
 *
 * @returns {T} The value returned by the `run` function.
 *
 * ### 💡 Core Concepts
 * - **Ownership Context**: In InSpatial's reactive system, every reactive primitive and cleanup function belongs to an `OwnerClass`. This owner is responsible for managing its lifecycle, especially disposal.
 * - **Explicit Control**: `runWithOwner` gives you direct control over this ownership, bypassing the default behavior where new computations inherit the current owner.
 * - **Untracked Execution**: The function execution is managed by `compute(owner, run, null)`, where `null` as the third argument means there's no observer, hence no dependency tracking for the caller's scope.
 * - **Use Cases**: Useful for scenarios like dynamically creating reactive sub-systems that need to be managed by a specific parent owner, or for utility functions that create reactive components and need to assign them to a passed-in owner.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn about appropriate usage</summary>
 *
 * > [!CAUTION]
 * > `runWithOwner` is an advanced feature. In most common reactive programming scenarios, InSpatial's implicit owner management is sufficient and more straightforward. Use this function only when you have a clear and specific reason to override the default ownership behavior.
 *
 * > [!NOTE]
 * > While the `run` function executes under the specified `owner`, any signals *read* from within `run` will still establish dependencies for any *new* effects or memos created *inside* `run` under that new owner. However, these reads will not create dependencies for the *calling* scope of `runWithOwner`.
 *
 * > [!NOTE]
 * > Passing `null` as the `owner` will cause the `run` function to execute in a top-level, unowned context. Computations created here will not be automatically cleaned up by any parent scope unless explicitly managed.
 * </details>
 *
 * ### 🎮 Usage
 * @example
 * ### Example 1: Assigning an effect to a different root
 * ```typescript
 * import { createRoot, createSignal, createEffect, runWithOwner, getOwner, onCleanup } from "@in/teract/signal-core";
 *
 * const root1 = createRoot(dispose => ({ dispose, owner: getOwner() }));
 * const root2 = createRoot(dispose => ({ dispose, owner: getOwner() }));
 *
 * runWithOwner(root1.owner, () => {
 *   const [name, setName] = createSignal("Root 1 Signal");
 *   createEffect(() => {
 *     // This effect belongs to root1
 *     console.log(`Effect in root1 owner: ${getOwner() === root1.owner}, reads: ${name()}`);
 *     onCleanup(() => console.log("Root 1 effect cleanup"));
 *
 *     // Now, let's create an effect that belongs to root2
 *     runWithOwner(root2.owner, () => {
 *       const [data, setData] = createSignal("Data for root2");
 *       createEffect(() => {
 *         // This effect belongs to root2
 *         console.log(`Effect in root2 owner: ${getOwner() === root2.owner}, reads: ${data()}`);
 *         onCleanup(() => console.log("Root 2 effect cleanup"));
 *       });
 *       setData("Updated data for root2"); // Triggers root2's effect
 *     });
 *   });
 *   setName("Updated Root 1 Signal"); // Triggers root1's effect
 * });
 *
 * // dispose root2 after a short delay
 * setTimeout(() => {
 *   console.log("Disposing root2...");
 *   root2.dispose(); // Only "Root 2 effect cleanup" should log
 * }, 100);
 *
 * // dispose root1 later
 * setTimeout(() => {
 *   console.log("Disposing root1...");
 *   root1.dispose(); // Only "Root 1 effect cleanup" should log
 * }, 200);
 * ```
 *
 */
export function runWithOwner<T>(owner: OwnerClass | null, run: () => T): T {
  return compute(owner, run, null);
}
