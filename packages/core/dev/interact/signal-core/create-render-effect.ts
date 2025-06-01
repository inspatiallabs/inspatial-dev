import { EffectClass } from "./core.ts";
import type {
  ComputeFunctionType,
  EffectFunctionType,
  EffectOptionsType,
  NoInferType,
} from "./types.ts";

/**
 * @module @in/teract/signal-core/create-render-effect
 *
 * This module provides `createRenderEffect`, a specialized reactive effect that executes
 * synchronously during the rendering phase. It's designed for operations that need
 * to interact with the DOM immediately after it has been updated by reactive changes,
 * but before the browser has painted these changes to the screen.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateRenderEffect
 * @access public
 */

/**
 * # CreateRenderEffect
 * @summary #### Creates a reactive effect that runs synchronously during the render phase
 *
 * Think of `createRenderEffect` like a stage manager in a theater who quickly adjusts props
 * on stage right after the actors (reactive updates) have made their changes, but just before
 * the curtain (browser paint) rises for the audience. It ensures that certain DOM-related
 * tasks are done at the last possible moment before visibility.
 *
 * `createRenderEffect` is similar to `createEffect` but is scheduled to run synchronously
 * after reactive changes have been processed and the DOM has been updated, but before the
 * browser repaints. This is useful for reading or writing to the DOM when you need to
 * perform measurements or modifications that depend on the latest DOM state.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateRenderEffect
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - **Synchronous Execution**: Runs immediately after DOM updates, before browser paint.
 * - **DOM Interaction**: Ideal for tasks like measuring element sizes, focusing inputs, or manually manipulating the DOM based on the latest state.
 * - **Render Phase**: Tied closely to the rendering lifecycle of your application.
 * - **Dependency Tracking**: Like `createEffect`, it automatically tracks signal dependencies within its `compute` function.
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Solid understanding of `createEffect` and general reactive principles.
 * - Knowledge of the browser's DOM and rendering lifecycle.
 * - Awareness of the performance implications of synchronous DOM operations.
 *
 * ### 📚 Terminology
 * > **Render Phase**: The stage in an application's lifecycle where reactive data changes are translated into DOM updates.
 * > **Synchronous Effect**: An effect that blocks further execution (including browser paint) until it completes.
 * > **Layout Thrashing**: A performance issue caused by repeatedly reading and writing DOM properties that force the browser to recalculate layout.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about usage and performance</summary>
 *
 * > [!NOTE]
 * > `createRenderEffect` should be used sparingly. Most side effects (like data fetching or logging) are better suited for `createEffect`, which runs asynchronously and doesn't block rendering.
 *
 * > [!NOTE]
 * > Because it runs synchronously, long-running code inside a `createRenderEffect` can negatively impact performance and make your application feel unresponsive.
 *
 * > [!NOTE]
 * > Be cautious when reading and then writing to the DOM within the same `createRenderEffect` as this can lead to layout thrashing.
 * </details>
 *
 * @param compute - A function that tracks dependencies. Its return value is passed to the `effect` function.
 * @param effect - A function that receives the value from `compute` and performs side effects. This is where DOM interactions typically occur. It can return a cleanup function.
 * @param value - An optional initial value for the `compute` function's first run.
 * @param options - Configuration options for the effect, such as a `name` for debugging.
 *
 * @returns {void} - Render effects do not return a value directly; they are used for their side effects.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use `createRenderEffect`:
 *
 * @example
 * ### Example 1: Focusing an Input Element
 * ```typescript
 * import { createSignal, createRenderEffect } from "@in/teract/signal-core";
 *
 * const [showInput, setShowInput] = createSignal(false);
 * let inputRef: HTMLInputElement | null = null;
 *
 * // This effect runs after the input is rendered
 * createRenderEffect(() => {
 *   if (showInput() && inputRef) {
 *     console.log("Input is now visible, focusing it.");
 *     inputRef.focus();
 *   }
 * }, undefined); // No compute function needed if effect doesn't depend on computed value
 *
 * // Simulate rendering the input
 * // In a real app, this would be part of your view logic
 * function render() {
 *   if (showInput()) {
 *     // Pretend inputRef is assigned here when the input is created
 *     // inputRef = document.createElement('input');
 *     // document.body.appendChild(inputRef);
 *     console.log("Input element rendered.");
 *   } else if (inputRef) {
 *     // inputRef.remove();
 *     // inputRef = null;
 *     console.log("Input element removed.");
 *   }
 * }
 *
 * // Trigger rendering
 * setShowInput(true);
 * render(); // Simulate rendering cycle
 *
 * // Later...
 * // setShowInput(false);
 * // render();
 * ```
 *
 * @example
 * ### Example 2: Measuring Element Dimensions
 * ```typescript
 * import { createSignal, createRenderEffect, createEffect } from "@in/teract/signal-core";
 *
 * const [text, setText] = createSignal("Hello");
 * const [width, setWidth] = createSignal(0);
 * let paragraphRef: HTMLParagraphElement | null = null;
 *
 * // In a real app, paragraphRef would be set when the <p> element is created/mounted.
 * // For this example, let's assume it exists.
 * // paragraphRef = document.createElement('p');
 * // document.body.appendChild(paragraphRef);
 * // paragraphRef.style.display = 'inline-block'; // For accurate width measurement
 *
 * createRenderEffect(() => {
 *   const currentText = text(); // Depend on the text signal
 *   if (paragraphRef) {
 *     paragraphRef.textContent = currentText;
 *     // Measure width after text content has been updated in the DOM
 *     const newWidth = paragraphRef.offsetWidth;
 *     setWidth(newWidth);
 *     console.log(`Paragraph text: "${currentText}", Measured width: ${newWidth}px`);
 *   }
 * });
 *
 * createEffect(() => {
 *   console.log(`Reported width: ${width()}px`);
 * });
 *
 * setText("Hello World!"); // Triggers render effect, then width update, then log effect
 * // (Assuming paragraphRef is available and rendered)
 *
 * setText("A longer sentence to demonstrate width change.");
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - **Use Sparingly**: Prefer `createEffect` for most tasks. Only use `createRenderEffect` when synchronous DOM access before paint is strictly necessary.
 * - **Minimize Work**: Keep the code inside `createRenderEffect` as lean as possible. Avoid complex computations or multiple DOM read/writes.
 * - **Batch DOM Reads/Writes**: If you need to perform multiple DOM operations, try to batch reads together and then batch writes together to avoid layout thrashing.
 * - **Profile**: Use browser developer tools to profile the performance impact of your render effects if you suspect they are causing slowdowns.
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Using for Async Operations**: Never use `createRenderEffect` for data fetching or other asynchronous tasks. This will block rendering and make your app unresponsive. Use `createEffect` or `createResource` instead.
 * - **Complex Logic**: Heavy computations inside `createRenderEffect` can significantly degrade performance. Offload complex logic to `createMemo` or `createEffect`.
 * - **Ignoring Cleanup**: If your effect sets up event listeners or other resources that need cleanup, ensure you return a cleanup function, just like with `createEffect`.
 * - **Layout Thrashing**: Reading a DOM property (like `offsetWidth`) and then immediately writing another DOM property that affects layout (like `style.width`) in a loop or rapid succession can force multiple browser reflows.
 * </details>
 *
 * @throws {Error} Any error thrown by the `compute` or `effect` function.
 *
 * ### 📝 Uncommon Knowledge
 * `createRenderEffect` hooks into a specific point in the reactive update cycle that aligns closely with when UI frameworks might perform their final DOM patches before the browser renders. This gives it a unique capability for fine-tuned DOM interaction that standard effects, which run later and asynchronously, cannot provide. However, this power comes with the responsibility of understanding its synchronous, blocking nature.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js (Primarily for server-side rendering scenarios where DOM-like structures might be manipulated)
 * - ✅ Deno
 * - ✅ Bun
 * - ✅ Modern Browsers
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link createEffect} - For standard, asynchronous side effects.
 * - {@link createSignal} - For creating the reactive values that effects depend on.
 * - {@link createMemo} - For deriving computed values from signals.
 *
 * @external MDN Web Docs - Browser Rendering
 * {@link https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path Understanding the critical rendering path}
 */
export function createRenderEffect<Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Next>, Next>,
  effect: EffectFunctionType<NoInferType<Next>, Next>
): void;
export function createRenderEffect<Next, Init = Next>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect: EffectFunctionType<Next, Next>,
  value: Init,
  options?: EffectOptionsType
): void;
export function createRenderEffect<Next, Init>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect: EffectFunctionType<Next, Next>,
  value?: Init,
  options?: EffectOptionsType
): void {
  void new EffectClass(value as any, compute as any, effect, undefined, {
    render: true,
    ...(__DEV__ ? { ...options, name: options?.name ?? "effect" } : options),
  });
}
