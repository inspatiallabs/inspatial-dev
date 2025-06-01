import { compute } from "./core.ts";
import { OwnerClass } from "./owner.ts";

/**
 * @module @in/teract/signal-core/create-root
 *
 * This module provides `createRoot`, a utility for creating isolated reactive scopes.
 * Think of it as creating a separate, independent garden plot for your reactive plants (signals, effects, memos).
 * Anything planted within this plot will grow and react on its own, without affecting other plots,
 * and can be entirely uprooted (disposed of) when no longer needed.
 *
 * @example Basic Usage
 * ```typescript
 * import { createRoot, createSignal, createEffect } from "@in/teract/signal-core";
 *
 * // Create a reactive root
 * const dispose = createRoot(disposeFn => {
 *   const [name, setName] = createSignal("Ben");
 *   createEffect(() => console.log("Name is:", name()));
 *   setName("Carolina"); // Effect runs
 *
 *   // disposeFn can be called to clean up this entire scope
 *   // setTimeout(disposeFn, 5000);
 *   return disposeFn; // Often, the dispose function is returned to be called later
 * });
 *
 * // Sometime later, if you want to clean up everything created inside the root:
 * // dispose();
 * ```
 *
 * @features
 * - **Isolation**: Creates a new, independent reactive scope.
 * - **Manual Disposal**: Provides a `dispose` function to clean up all computations within the root.
 * - **Context Management**: Each root has its own context, preventing clashes between different parts of an application.
 * - **Memory Management**: Essential for preventing memory leaks by ensuring reactive computations are cleaned up.
 * - **Server-Side Rendering**: Useful for managing reactive state per request in SSR environments.
 * - **Component Teardown**: Can be tied to component lifecycles to dispose of reactivity when a component unmounts.
 * - **Dynamic Scopes**: Allows for creating and destroying reactive sub-systems on the fly.
 * - **Error Handling**: Errors within a root can be contained without affecting other roots.
 * - **Testing**: Facilitates testing reactive components in isolation.
 *
 * @example Isolating Reactive Logic
 * ```typescript
 * // rootA.ts
 * createRoot(() => {
 *   const [counterA, setCounterA] = createSignal(0);
 *   createEffect(() => console.log("Counter A:", counterA()));
 *   setCounterA(1);
 * });
 *
 * // rootB.ts (independent of rootA)
 * createRoot(() => {
 *   const [counterB, setCounterB] = createSignal(100);
 *   createEffect(() => console.log("Counter B:", counterB()));
 *   setCounterB(101);
 * });
 * ```
 *
 * @example Manual Cleanup for Long-Lived Applications
 * ```typescript
 * const stopAppSection = createRoot(dispose => {
 *   // ... setup signals, effects, resources for a specific app section
 *   const [data, setData] = createSignal("Initial data");
 *   createEffect(() => console.log("Section data:", data()));
 *
 *   // Return the dispose function to be called when this section is no longer needed
 *   return dispose;
 * });
 *
 * // Later, when the application section is closed or removed:
 * // stopAppSection(); // This cleans up all reactivity within that root.
 * ```
 *
 * @bestPractices
 * 1. Use `createRoot` for any top-level reactive scope or long-running reactive system.
 * 2. Always call the `dispose` function when the root is no longer needed to prevent memory leaks.
 * 3. Tie `dispose` calls to the lifecycle of your components or application modules.
 * 4. Avoid creating roots unnecessarily; often, reactivity can be managed within an existing root.
 * 5. `createRoot` is especially important in non-DOM environments or long-lived server processes.
 *
 * @see {@link createSignal} - For creating reactive values within a root.
 * @see {@link createEffect} - For creating side effects that are managed by a root.
 * @see {@link onCleanup} - For registering cleanup logic within the current root.
 */
/**
 * # CreateRoot
 * @summary #### Creates a new non-tracked reactive context with manual disposal
 *
 * `createRoot` establishes an independent reactive environment. Imagine you're setting up a new
 * smart home system. `createRoot` is like installing the main control hub for that system.
 * All the smart devices (signals, effects, memos) you connect to this hub will operate within
 * its sphere of influence. When you no longer need that particular smart home setup (e.g., you move),
 * you can use the `dispose` function provided by `createRoot` to cleanly shut down and unplug everything
 * connected to that hub, ensuring no lingering processes or memory usage.
 *
 * This is crucial for managing the lifecycle of reactive computations, preventing memory leaks,
 * and isolating different parts of your application or different instances of reactive components.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateRoot
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - **Reactive Scope**: `createRoot` defines a boundary. All signals, effects, and memos created inside the function passed to `createRoot` belong to this scope.
 * - **Ownership**: The root "owns" all reactive computations created within it. This ownership is key for cleanup.
 * - **Manual Disposal**: It provides a `dispose` function. Calling this function cleans up all computations created within that root, stopping effects and releasing memory.
 * - **No Tracking**: The root itself is not tracked by any outer reactive scope. It stands alone or as a top-level entry point for reactivity.
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of basic reactive programming (signals, effects).
 * - Awareness of memory management concepts in JavaScript (though `createRoot` helps simplify this).
 *
 * ### 📚 Terminology
 * > **Root**: A top-level reactive scope that owns and manages a set of reactive computations.
 * > **Dispose**: The act of cleaning up a reactive scope, stopping its effects, and freeing associated resources.
 * > **Non-tracked Context**: The environment created by `createRoot` does not become a dependency of any outer reactive computation.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about disposal and usage</summary>
 *
 * > [!NOTE]
 * > The `dispose` function provided by `createRoot` is essential. Forgetting to call it for roots that are no longer needed can lead to memory leaks, as effects and other computations might continue to exist and hold references.
 *
 * > [!NOTE]
 * > `createRoot` is often used at the entry point of an application or a major component to manage its entire reactive lifecycle.
 *
 * > [!NOTE]
 * > If the function passed to `createRoot` takes an argument, that argument will be the `dispose` function. This allows you to call `dispose` from within the root's setup logic if needed, though it's more common to return it and call it externally.
 * </details>
 *
 * @param init - A function that sets up the reactive computations for this root. It can optionally accept a `dispose` function as its first argument, which can be called to clean up the root and all its computations.
 * @typeParam T - The type of the value returned by the `init` function.
 *
 * @returns {T} The value returned by the `init` function. Often, this is the `dispose` function itself, or an object containing it, so that the root can be cleaned up later.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use `createRoot`:
 *
 * @example
 * ### Example 1: Basic Root Creation and Disposal
 * ```typescript
 * import { createRoot, createSignal, createEffect, onCleanup } from "@in/teract/signal-core";
 *
 * const disposeRoot = createRoot(dispose => {
 *   const [message, setMessage] = createSignal("Hello from the root!");
 *
 *   createEffect(() => {
 *     console.log(message());
 *     onCleanup(() => console.log("Effect cleaned up!"));
 *   });
 *
 *   setMessage("Updated message!"); // Effect runs
 *
 *   // The `dispose` function passed to `createRoot` is returned here
 *   return dispose;
 * });
 *
 * // ...sometime later in your application lifecycle...
 * console.log("Disposing the root...");
 * disposeRoot(); // This will run cleanup functions and stop effects inside the root.
 * // Output will include: "Effect cleaned up!"
 * ```
 *
 * @example
 * ### Example 2: Root for a UI Component (Conceptual)
 * ```typescript
 * // Imagine this is part of a UI component's lifecycle
 * function MyComponent() {
 *   let disposeComponentReactivity: () => void;
 *
 *   function onMount() {
 *     disposeComponentReactivity = createRoot(dispose => {
 *       const [count, setCount] = createSignal(0);
 *       const intervalId = setInterval(() => setCount(c => c + 1), 1000);
 *
 *       createEffect(() => {
 *         // Update DOM with count.value
 *         console.log("Component Count:", count());
 *       });
 *
 *       onCleanup(() => {
 *         clearInterval(intervalId);
 *         console.log("Component timer cleared and effects stopped.");
 *       });
 *       return dispose; // Return the dispose function for the root
 *     });
 *   }
 *
 *   function onUnmount() {
 *     if (disposeComponentReactivity) {
 *       console.log("Component unmounting, disposing reactivity...");
 *       disposeComponentReactivity();
 *     }
 *   }
 *
 *   // Simulate component lifecycle
 *   onMount();
 *   setTimeout(() => onUnmount(), 3500); // Unmount after 3.5 seconds
 * }
 *
 * MyComponent();
 * ```
 *
 * @example
 * ### Example 3: Root without explicit dispose in callback
 * ```typescript
 * import { createRoot, createSignal, createEffect } from "@in/teract/signal-core";
 *
 * // The init function doesn't take `dispose` as an argument here.
 * // The root will exist until the program ends, or if `createRoot` itself returned a dispose function
 * // (which it does implicitly if its callback doesn't use the dispose arg and doesn't return one).
 * createRoot(() => {
 *   const [timer, setTimer] = createSignal(0);
 *   setInterval(() => setTimer(t => t + 1), 500);
 *   createEffect(() => console.log("Global Timer (no explicit dispose):", timer()));
 *   // This root and its effects will run indefinitely unless the program stops
 *   // or if createRoot returned a dispose function that gets called.
 * });
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance and memory</summary>
 *
 * - **Dispose Unused Roots**: The most critical performance aspect of `createRoot` is ensuring that the `dispose` function is called when the reactive scope is no longer needed. Failure to do so will lead to memory leaks as computations remain active.
 * - **Granularity**: Use `createRoot` to manage distinct sections of your application or lifecycles of major components. Avoid creating too many fine-grained roots if a single parent root can manage a larger scope effectively.
 * - **Server-Side Rendering (SSR)**: In SSR, it's common to create a root for each request and dispose of it after the request is handled to ensure no state leaks between requests.
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Forgetting to Dispose**: The most common mistake is not calling the `dispose` function returned by `createRoot`. This leads to memory leaks as signals and effects within the root are never cleaned up.
 * - **Nested Roots without Purpose**: While possible, nesting `createRoot` calls should be done with a clear understanding of why a new independent scope is needed. Often, `onCleanup` within an existing root is sufficient for managing sub-lifecycles.
 * - **Returning Values from `init` Carelessly**: If the `init` function returns a value, that value is passed through by `createRoot`. Ensure you are intentionally returning something (often the `dispose` function or an object containing it) and not accidentally shadowing the `dispose` capability.
 * </details>
 *
 * ### 📝 Uncommon Knowledge
 * `createRoot` is the foundational mechanism for InSpatial's ownership and disposal system. Every reactive computation (signal, effect, memo) implicitly belongs to an `OwnerClass` (the root). This hierarchical ownership allows the system to efficiently clean up entire trees of reactive nodes when a root is disposed, a concept vital for robust, leak-free reactive applications.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 * - ✅ Modern Browsers
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link onCleanup} - For registering specific cleanup logic within the current root's scope.
 * - {@link createSignal} - To create reactive primitives that will be owned by the root.
 * - {@link createEffect} - To create side effects that will be managed and disposed of by the root.
 * - {@link OwnerClass} - The underlying class that `createRoot` uses to manage the reactive scope.
 */
export function createRoot<T>(
  init: ((dispose: () => void) => T) | (() => T)
): T {
  const owner = new OwnerClass();
  return compute(
    owner,
    !init.length ? (init as () => T) : () => init(() => owner.dispose()),
    null
  );
}
