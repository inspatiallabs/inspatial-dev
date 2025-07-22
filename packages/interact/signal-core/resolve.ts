/**
 * @module @in/teract/signal-core/resolve
 *
 * This module provides the `resolve` utility function, which is designed to bridge the reactive
 * world of InSpatial signals with the asynchronous world of Promises. It allows you to take a
 * reactive expression (a function that might depend on signals, memos, or resources) and get a
 * Promise that resolves with the first stable, non-loading value produced by that expression.
 *
 * Think of `resolve` as a patient waiter. You give the waiter an order (your reactive function `fn`).
 * If the kitchen (your reactive system, potentially involving async operations like `createResource`)
 * says "it's not ready yet" (throws `NotReadyErrorClass`), the waiter patiently waits and checks again later.
 * Once the kitchen confirms the order is ready (your function `fn` returns a value without throwing
 * `NotReadyErrorClass`), the waiter brings you your food (the Promise resolves with the value).
 * If something else goes wrong in the kitchen (any other error), the waiter informs you of the problem
 * (the Promise rejects).
 *
 * @example Basic Usage with an Asynchronous Resource
 * ```typescript
 * import { createSignal, createResource } from "@in/teract/signal-core";
 * import { resolve } from "@in/teract/signal-core/resolve.ts";
 *
 * const [userId, setUserId] = createSignal(1);
 * const [userResource] = createResource(userId, async (id) => {
 *   console.log(`Fetching user ${id}...`);
 *   await new Promise(r => setTimeout(r, 1000)); // Simulate delay
 *   if (id === 0) throw new Error("Invalid user ID");
 *   return { id, name: `User ${id}` };
 * });
 *
 * async function main() {
 *   try {
 *     console.log("Attempting to resolve userResource...");
 *     // The resolve function will wait until userResource() stops throwing NotReadyErrorClass
 *     const resolvedUser = await resolve(() => userResource());
 *     console.log("Resolved user:", resolvedUser);
 *
 *     // Change the source and resolve again
 *     setUserId(2);
 *     console.log("Attempting to resolve updated userResource...");
 *     const resolvedUser2 = await resolve(() => userResource());
 *     console.log("Resolved user 2:", resolvedUser2);
 *
 *     // Example with an error
 *     setUserId(0);
 *     console.log("Attempting to resolve userResource that will error...");
 *     await resolve(() => userResource());
 *   } catch (error) {
 *     console.error("Caught error during resolve:", error.message);
 *   }
 * }
 *
 * main();
 * ```
 *
 * @features
 *  - **Reactive to Promise Bridge**: Converts a reactive expression into a Promise.
 *  - **Handles Loading States**: Automatically waits for `NotReadyErrorClass` to stop being thrown before resolving.
 *  - **Error Propagation**: Rejects the Promise if the reactive expression throws any error other than `NotReadyErrorClass`.
 *  - **Automatic Cleanup**: Creates and disposes of a temporary reactive root and effect to monitor the expression.
 *  - **Single Resolution**: Resolves with the *first* successfully computed value. It does not continuously update if the reactive expression changes after resolution.
 *
 * @see {@link createResource} - Often used with `resolve` to await the loading of asynchronous data.
 * @see {@link createAsync} - Another primitive that `resolve` can be useful for.
 * @see {@link NotReadyErrorClass} - The specific error `resolve` waits for.
 * @access public
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 */
import { createInteractiveRoot } from "./create-root.ts";
import { createEffect } from "./create-effect.ts";
import { NotReadyErrorClass } from "./create-resource.ts";

/**
 * # resolve
 * @summary #### Returns a Promise that resolves with the first successfully computed value of a reactive expression.
 *
 * The `resolve` function takes a reactive expression (typically a function that reads signals,
 * memos, or resources like those from `createResource`) and returns a Promise. This Promise
 * will resolve with the value of the expression once it computes successfully without
 * throwing a `NotReadyErrorClass`. This is particularly useful for scenarios where you need
 * to await the completion of an asynchronous reactive operation before proceeding with
 * non-reactive code (e.g., in an async function or when interfacing with external systems).
 *
 * Internally, `resolve` sets up a temporary reactive scope (`createInteractiveRoot` and `createEffect`)
 * to monitor the provided function `fn`. If `fn` throws `NotReadyErrorClass` (indicating that
 * an underlying asynchronous operation is still in progress), the effect simply waits for the
 * next reactive update. Once `fn` executes and returns a value without throwing `NotReadyErrorClass`,
 * the Promise resolves with that value, and the temporary reactive scope is cleaned up.
 * If `fn` throws any other type of error, the Promise is rejected with that error.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module ResolveUtils
 * @kind function
 * @access public
 *
 * @template T - The expected type of the resolved value.
 *
 * @param {() => T} fn - A reactive expression (a function) to be resolved. This function will be executed
 *   within a reactive effect. It should read signals or resources that might be in a loading state.
 *
 * @returns {Promise<T>} A Promise that resolves with the value returned by `fn` once it successfully
 *   computes (i.e., does not throw `NotReadyErrorClass`). The Promise rejects if `fn` throws any other error.
 *
 * ### 💡 Core Concepts
 * - **Asynchronous Bridging**: Connects reactive, potentially asynchronous computations to standard Promise-based workflows.
 * - **Loading State Aware**: Specifically designed to handle `NotReadyErrorClass` thrown by resources like `createResource` or `createAsync` during their loading phase.
 * - **Single Value Resolution**: The Promise resolves with the *first* value that `fn` computes successfully. It does not track subsequent changes to the reactive expression after resolution.
 * - **Automatic Cleanup**: Manages the lifecycle of its internal reactive scope, ensuring no memory leaks.
 *
 * ### 🎯 Prerequisites
 * - Understanding of JavaScript Promises (`async/await`).
 * - Familiarity with InSpatial signals and how they drive reactivity.
 * - Knowledge of `createResource` or `createAsync` and how they indicate loading states (often via `NotReadyErrorClass`).
 *
 * ### 📚 Terminology
 * > **Reactive Expression**: The function `fn` passed to `resolve`, which typically reads one or more reactive values (signals, memos, resources).
 * > **`NotReadyErrorClass`**: A specific error type used within InSpatial's reactive system to signal that an asynchronous value is still loading and not yet available.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about behavior and use cases</summary>
 *
 * > [!NOTE]
 * > `resolve` is ideal for situations where you need to get a snapshot of a reactive value once it becomes available, especially if that value depends on asynchronous operations. For continuous reaction to changes, use `createEffect` directly.
 *
 * > [!NOTE]
 * > If the reactive expression `fn` never stops throwing `NotReadyErrorClass` (e.g., a resource that never loads successfully and has no fallback or initial value), the Promise returned by `resolve` will never resolve.
 *
 * > [!NOTE]
 * > The function `fn` is executed within an effect, so it will adhere to the standard reactive update cycle. Changes to signals read by `fn` will cause the internal effect to re-run until a stable value is obtained or a non-`NotReadyErrorClass` error occurs.
 * </details>
 *
 * ### 🎮 Usage
 * @example
 * ### Example 1: Resolving a `createResource` value
 * ```typescript
 * import { createSignal, createResource, resolve, NotReadyErrorClass } from "@in/teract/signal-core";
 *
 * const [dataId, setDataId] = createSignal("data1");
 * const [resource] = createResource(dataId, async (id) => {
 *   console.log(`Simulating fetch for ${id}...`);
 *   await new Promise(r => setTimeout(r, 500));
 *   if (id === "error") throw new Error("Simulated fetch error");
 *   return `Fetched data for ${id}`;
 * });
 *
 * async function loadAndLogData() {
 *   try {
 *     console.log("Waiting for resource to resolve...");
 *     const data = await resolve(() => resource());
 *     console.log("Resolved data:", data);
 *   } catch (e) {
 *     if (e instanceof NotReadyErrorClass) {
 *       console.error("This should not happen if resolve works correctly for NotReadyErrorClass.");
 *     } else {
 *       console.error("Failed to resolve resource:", e.message);
 *     }
 *   }
 * }
 *
 * loadAndLogData(); // Will log "Fetched data for data1"
 *
 * setTimeout(async () => {
 *   setDataId("data2");
 *   console.log("Changed ID, waiting for new resource data...");
 *   const data2 = await resolve(() => resource()); // Resolve will wait for the new fetch
 *   console.log("Resolved data 2:", data2);
 * }, 1000);
 *
 * setTimeout(async () => {
 *   setDataId("error");
 *   console.log("Changed ID to cause an error...");
 *   try {
 *     await resolve(() => resource());
 *   } catch (e) {
 *     console.error("Caught expected error for ID 'error':", e.message);
 *   }
 * }, 2000);
 * ```
 *
 * @example
 * ### Example 2: Resolving a simple signal (resolves immediately)
 * ```typescript
 * import { createSignal, resolve } from "@in/teract/signal-core";
 *
 * const [count, setCount] = createSignal(10);
 *
 * async function getCountOnceReady() {
 *   const resolvedCount = await resolve(() => count());
 *   console.log("Resolved count:", resolvedCount); // Output: Resolved count: 10
 * }
 *
 * getCountOnceReady();
 * ```
 *
 * @throws {any} Rejects with any error thrown by `fn` other than `NotReadyErrorClass`.
 */
export function resolve<T>(fn: () => T): Promise<T> {
  return new Promise((res, rej) => {
    createInteractiveRoot((dispose) => {
      createEffect(() => {
        try {
          const result = fn();
          // If fn() doesn't throw (especially NotReadyErrorClass), resolve and cleanup.
          res(result);
          dispose();
        } catch (err) {
          if (err instanceof NotReadyErrorClass) {
            // It's not ready yet, so we don't resolve or reject.
            // The effect will re-run when the underlying async op completes.
            return;
          }
          // For any other error, reject the promise and cleanup.
          rej(err);
          dispose();
        }
      });
    });
  });
}
