import { STATE_DIRTY } from "./constants.ts";
import { ComputationClass, createBoundary, flatten, EagerComputationClass, type EffectClass } from "./core.ts";
import { LOADING_BIT } from "./flags.ts";
import { QueueClass } from "./scheduler.ts";

/**
 * # SuspenseQueueClass
 * @summary #### Manages the scheduling and state of suspense effects.
 *
 * This class extends the base `QueueClass` to provide specialized handling for effects
 * operating within a `createSuspense` boundary. It tracks loading states of child
 * computations and signals when a fallback UI should be displayed.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateSuspense
 * @class
 * @access private
 */
export class SuspenseQueueClass extends QueueClass {
  _nodes: Set<EffectClass> = new Set();
  _fallback = false;
  _signal = new ComputationClass(false, null);
  override run(type: number): boolean {
    if (type && this._fallback) return false;
    return super.run(type);
  }
  _update(node: EffectClass) {
    if (node._stateFlags & LOADING_BIT) {
      this._nodes.add(node);
      if (!this._fallback) {
        this._fallback = true;
        this._signal.write(true);
      }
    } else {
      this._nodes.delete(node);
      if (this._nodes.size === 0) {
        this._fallback = false;
        this._signal.write(false);
      }
    }
  }
}

/**
 * # LiveComputationClass
 * @summary #### A specialized computation class for suspense boundaries.
 *
 * This class extends `EagerComputationClass` (which itself extends `EffectClass`)
 * to integrate with the `SuspenseQueueClass`. It ensures that changes in the loading state
 * of the computation are correctly communicated to the suspense queue, triggering fallback
 * UI updates when necessary.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateSuspense
 * @class
 * @access private
 *
 * @typeParam T - The type of value the computation will hold.
 */
class LiveComputationClass<T> extends EagerComputationClass<T> {
  override write(value: T, flags = 0): T {
    const currentFlags = this._stateFlags;
    const dirty = this._state === STATE_DIRTY;
    super.write(value, flags);
    if (dirty && (flags & LOADING_BIT) !== (currentFlags & LOADING_BIT)) {
      (this._queue as SuspenseQueueClass)._update?.(this as any);
    }
    return this._value as T;
  }
}

/**
 * # CreateSuspense
 * @summary #### Orchestrates loading states and fallback UIs for asynchronous operations.
 *
 * `createSuspense` allows you to declaratively manage what your users see while data is being
 * fetched or other asynchronous tasks are running. When a reactive computation inside `createSuspense`
 * signals that it's not ready (e.g., by throwing a `NotReadyErrorClass` from `createResource`),
 * `createSuspense` catches this and displays your specified `fallback` content. Once all computations
 * inside are ready, it switches to rendering the main content.
 *
 * Imagine you're ordering food at a restaurant. `createSuspense` is like the waiter who tells you,
 * "Your main course is being prepared (fallback: `() => "Preparing your order..."`). In the meantime,
 * would you like some breadsticks (main content: `fn` tries to access food, suspends)?"
 * When your food is ready, they bring it out.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateSuspense
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - **Suspense Boundary**: Defines a region in your UI where loading states are managed.
 * - **Fallback UI**: Content shown when computations within the boundary are not yet ready.
 * - **Asynchronous Coordination**: Works with async primitives like `createResource` that signal loading by throwing `NotReadyErrorClass`.
 * - **Resumption**: Automatically switches from fallback to main content when all pending operations complete.
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of `createResource` or other async primitives that integrate with Suspense (i.e., throw `NotReadyErrorClass` when loading).
 * - Basic knowledge of how loading states are typically handled in UIs.
 *
 * ### 📚 Terminology
 * > **Suspense**: A mechanism for managing loading states of asynchronous operations in a declarative way.
 * > **Fallback**: The UI content displayed while the main content is loading.
 * > **`NotReadyErrorClass`**: A special error class thrown by async primitives like `createResource` to signal to `createSuspense` that they are still loading. `createSuspense` catches this error specifically.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about behavior and usage</summary>
 *
 * > [!NOTE]
 * > `createSuspense` relies on its child computations (often `createResource` or `createAsync`) throwing a `NotReadyErrorClass` to trigger the fallback. If the async operation doesn't do this, suspense won't activate.
 *
 * > [!NOTE]
 * > The `fn` (main content function) is re-executed when the loading state changes. Ensure it's idempotent or handles re-execution gracefully.
 *
 * > [!NOTE]
 * > `createSuspense` itself returns an accessor. You need to call this accessor (e.g., `MySuspendedComponent()`) to get the current content (either main or fallback).
 * </details>
 *
 * @param fn - A function that returns the main content. This function will typically contain calls to `createResource` or other async operations. If these operations are loading, they should throw `NotReadyErrorClass` to trigger suspense.
 * @param fallback - A function that returns the fallback content to be displayed while the main content is loading.
 * @returns {AccessorType<any>} An accessor function. When called, it returns either the result of `fn()` if all async operations within it are complete, or the result of `fallback()` if any are still loading.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use `createSuspense`:
 *
 * @example
 * ### Example 1: Suspending a Single Resource
 * ```typescript
 * import { createSuspense, createResource, createEffect } from "@in/teract/signal-core";
 *
 * const [data, { refetch }] = createResource(async () => {
 *   console.log("Fetching data...");
 *   await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
 *   return { message: "Data loaded successfully!" };
 * });
 *
 * const MyComponent = createSuspense(
 *   () => {
 *     const result = data(); // Accessing resource; will throw NotReadyErrorClass if loading
 *     return `<div>${result.message}</div>`;
 *   },
 *   () => `<div>Loading, please wait...</div>`
 * );
 *
 * createEffect(() => {
 *   // In a real app, you would render MyComponent() to the DOM
 *   // e.g., document.getElementById('app').innerHTML = MyComponent();
 *   console.log(MyComponent());
 * });
 *
 * // To see suspense in action again after initial load:
 * // setTimeout(() => refetch(), 4000);
 * ```
 *
 * @example
 * ### Example 2: Nested Suspense Boundaries
 * ```typescript
 * import { createSuspense, createResource, createEffect, createSignal } from "@in/teract/signal-core";
 *
 * const [userId, setUserId] = createSignal(1);
 *
 * const [userProfileResource] = createResource(userId, async (id) => {
 *   await new Promise(r => setTimeout(r, 1000));
 *   return { name: `User ${id}`, bio: "Loves reactive programming." };
 * });
 *
 * const [userPostsResource] = createResource(userId, async (id) => {
 *   await new Promise(r => setTimeout(r, 2500));
 *   return [{ title: `Post 1 by User ${id}` }, { title: `Post 2 by User ${id}` }];
 * });
 *
 * const UserPosts = createSuspense(
 *   () => {
 *     const posts = userPostsResource();
 *     return `<ul>${posts.map(p => `<li>${p.title}</li>`).join("")}</ul>`;
 *   },
 *   () => `<p>Loading posts...</p>`
 * );
 *
 * const UserProfilePage = createSuspense(
 *   () => {
 *     const profile = userProfileResource();
 *     return `<div>
 *       <h1>${profile.name}</h1>
 *       <p>${profile.bio}</p>
 *       <h2>Posts:</h2>
 *       ${UserPosts()}
 *     </div>`;
 *   },
 *   () => `<div>Loading user profile page...</div>`
 * );
 *
 * createEffect(() => console.log(UserProfilePage()));
 * setTimeout(() => setUserId(2), 4000); // Change user, triggers all resources to refetch
 * ```
 *
 * @example
 * ### Example 3: Suspense with createAsync (Conceptual)
 * ```typescript
 * import { createSuspense, createAsync, createEffect, NotReadyErrorClass } from "@in/teract/signal-core";
 *
 * const asyncData = createAsync(async () => {
 *   await new Promise(resolve => setTimeout(resolve, 1500));
 *   // For createAsync to work with suspense, it must throw NotReadyErrorClass when loading.
 *   // This is typically handled internally by createAsync if no initial value is provided.
 *   return "Async data is here!";
 * });
 *
 * const AsyncComponent = createSuspense(
 *   () => `<div>${asyncData()}</div>`,
 *   () => `<div>Loading async data...</div>`
 * );
 *
 * createEffect(() => console.log(AsyncComponent()));
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance and UX</summary>
 *
 * - **Granular Fallbacks**: Use `createSuspense` around the smallest logical parts of your UI that depend on async data. This provides a better user experience than large, coarse-grained loading states.
 * - **Avoid Overuse**: Not every async operation needs a suspense boundary. Sometimes, a simple loading signal within the component is sufficient.
 * - **Lightweight Fallbacks**: Ensure your fallback components are very lightweight and render quickly. They shouldn't trigger their own complex logic or async operations.
 * - **Transitions**: Consider using UI transitions (e.g., fade-ins) when content switches from fallback to main, to make the experience smoother.
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Async Operations Not Throwing `NotReadyErrorClass`**: If the async computations inside `fn` don't throw `NotReadyErrorClass` (or an equivalent error that suspense is configured to catch), the fallback will never be shown.
 * - **Trying to Catch Regular Errors**: `createSuspense` is specifically for loading states. Use `createErrorBoundary` to catch actual runtime errors from your components or data fetching logic.
 * - **Complex Logic in Fallback**: Fallback components should be simple. Putting complex reactive logic or further async calls in a fallback can lead to confusing behavior.
 * </details>
 *
 * ### 📝 Uncommon Knowledge
 * `createSuspense` works by leveraging JavaScript's error handling (`try...catch` internally) in a specific way. When `createResource` (or a similar primitive) is loading, it throws a special `NotReadyErrorClass`. `createSuspense` is designed to catch this specific error, render the fallback, and then re-try rendering the main content when the underlying resource signals it's ready (typically by no longer throwing).
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js (for SSR scenarios, though client-side hydration might be needed for full interactivity)
 * - ✅ Deno
 * - ✅ Bun
 * - ✅ Modern Browsers
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link createResource} - The primary way to fetch data that integrates with `createSuspense`.
 * - {@link NotReadyErrorClass} - The error that signals a loading state to `createSuspense`.
 * - {@link createErrorBoundary} - For handling actual errors, often used in conjunction with `createSuspense`.
 * - {@link ComputationClass} - The underlying reactive primitive used by `createSuspense`.
 */
export function createSuspense(fn: () => any, fallback: () => any) {
  const queue = new SuspenseQueueClass();
  const tree = createBoundary(() => {
    const child = new ComputationClass(null, fn);
    return new LiveComputationClass(null, () => flatten(child.wait()));
  }, queue);
  const equality = new ComputationClass(
    null,
    () => queue._signal.read() || queue._fallback
  );
  const comp = new ComputationClass(null, () =>
    equality.read() ? fallback() : tree.read()
  );
  return comp.read.bind(comp);
}
