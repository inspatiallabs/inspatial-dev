/**
 * @module @in/teract/signal-core/scheduler
 *
 * This module implements the reactive scheduler for InSpatial Signal Core. It orchestrates
 * when and how reactive computations (memos) and effects are executed in response to
 * signal changes. The scheduler ensures that updates are processed efficiently, batched
 * appropriately, and run in the correct order (e.g., computations before effects, render
 * effects at the right time).
 *
 * Think of the scheduler as an air traffic controller for reactive updates. When signals
 * change (planes wanting to land), the scheduler organizes them into queues based on their
 * type (e.g., urgent passenger flights vs. cargo, or pure computations vs. side effects).
 * It then processes these queues in a specific order, ensuring that dependencies are met
 * (e.g., ensuring a connecting flight has landed before a departure) and that everything
 * runs smoothly without collisions or unnecessary delays.
 *
 * @example Conceptual: How the scheduler works (not direct usage)
 * ```typescript
 * // // --- This is conceptual, you don't call scheduler directly like this ---
 * // import { createSignal, createMemo, createEffect } from "@in/teract/signal-core";
 *
 * // const [name, setName] = createSignal("Ben");
 *
 * // const greeting = createMemo(() => {
 * //   console.log("Memo: calculating greeting");
 * //   return `Hello, ${name()}!`;
 * // });
 *
 * // createEffect(() => {
 * //   console.log("Effect: displaying greeting");
 * //   console.log(greeting());
 * // });
 *
 * // // When setName is called, the scheduler does roughly this:
 * // // 1. `name` signal changes, marks `greeting` memo as dirty.
 * // // 2. `greeting` memo is enqueued in the pure computation queue.
 * // // 3. Scheduler flushes:
 * // //    a. Runs pure computation queue: `greeting` recomputes ("Memo: calculating greeting").
 * // //    b. `greeting`'s change marks the effect as dirty.
 * // //    c. Effect is enqueued in the user effect queue.
 * // //    d. Runs user effect queue: effect re-runs ("Effect: displaying greeting", logs new greeting).
 * // setName("Carolina");
 * // // --- End conceptual example ---
 * ```
 *
 * @features
 *  - **Update Batching**: Groups multiple signal changes into a single update cycle.
 *  - **Ordered Execution**: Ensures computations run before effects that depend on them.
 *  - **Queue Management**: Uses separate queues for pure computations, render effects, and user effects.
 *  - **Microtask Scheduling**: Leverages `queueMicrotask` for asynchronous flushing by default.
 *  - **Synchronous Flushing**: Provides `flushSync` for immediate, synchronous updates when needed.
 *  - **Cycle Prevention**: Helps in managing and preventing infinite update loops (though careful state design is still key).
 *  - **Clock System**: Uses an internal clock to timestamp updates and manage state transitions.
 *
 * @see {@link ComputationClass} - The base class for reactive nodes managed by the scheduler.
 * @see {@link EffectClass} - Represents effects whose execution is scheduled.
 * @see {@link createSignal} - Changes to signals trigger the scheduling process.
 * @see {@link createMemo} - Memos are computations scheduled for re-evaluation.
 * @see {@link createEffect} - Effects are scheduled to run after computations.
 * @access private
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 */
import {
  EFFECT_PURE,
  EFFECT_RENDER,
  EFFECT_USER,
  STATE_CLEAN,
  STATE_DISPOSED,
  STATE_CHECK,
  STATE_DIRTY,
} from "./constants.ts";
import type { ComputationClass, EffectClass } from "./core.ts";
import type { OwnerClass } from "./owner.ts";

let clock = 0;
/**
 * # getClock
 * @summary #### Retrieves the current global reactive clock time.
 *
 * The clock is an integer that increments after each batch of reactive updates has been processed
 * (specifically, after pure computations have run and before effects run).
 * It's used internally to timestamp nodes and determine if they are up-to-date.
 *
 * @returns {number} The current clock time.
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind function
 * @access package
 */
export function getClock() {
  return clock;
}

/**
 * # incrementClock
 * @summary #### Increments the global reactive clock.
 *
 * This is typically called by the scheduler after a round of pure computations has completed,
 * signifying a transition in the reactive update cycle.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind function
 * @access package
 */
export function incrementClock(): void {
  clock++;
}

let scheduled = false;

/**
 * # schedule
 * @summary #### Schedules a flush of the global reactive queue on the microtask queue.
 *
 * If a flush is not already scheduled and the global queue is not currently running,
 * this function schedules `flushSync` to be called via `queueMicrotask`.
 * This ensures that reactive updates are batched and processed asynchronously.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind function
 * @access private
 */
function schedule() {
  if (scheduled) return;
  scheduled = true;
  if (!globalQueue._running) queueMicrotask(flushSync);
}

/**
 * # IQueueType
 * @summary #### Interface defining the contract for a reactive update queue.
 *
 * This interface specifies the methods that a queue implementation within the InSpatial
 * reactive scheduler must provide. It handles enqueuing computations and effects,
 * running different types of queues, flushing all pending updates, and managing child queues.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind interface
 * @access package
 */
export interface IQueueType {
  /**
   * Enqueues a reactive node (computation or effect) into the appropriate queue based on its type.
   * @param {number} type - The type of the node (e.g., `EFFECT_PURE`, `EFFECT_RENDER`, `EFFECT_USER`).
   * @param {T} node - The computation or effect node to enqueue.
   * @template T - The type of the reactive node.
   */
  enqueue<T extends ComputationClass | EffectClass>(
    type: number,
    node: T
  ): void;

  /**
   * Runs all items in the queue of the specified type.
   * @param {number} type - The type of queue to run.
   * @returns {boolean | void} `true` if there were items processed or more items to process, otherwise `false` or `void`.
   */
  run(type: number): boolean | void;

  /**
   * Flushes all pending updates in all queues, processing them in the correct order.
   */
  flush(): void;

  /**
   * Adds a child queue to this queue. Child queues are also processed during a flush operation.
   * @param {IQueueType} child - The child queue to add.
   */
  addChild(child: IQueueType): void;

  /**
   * Removes a child queue from this queue.
   * @param {IQueueType} child - The child queue to remove.
   */
  removeChild(child: IQueueType): void;

  /**
   * The clock time when this queue was created or last significantly reset.
   */
  created: number;
}

/**
 * # QueueClass
 * @summary #### Default implementation of a reactive update queue.
 *
 * Manages three distinct queues: one for pure computations (`EFFECT_PURE`), one for render
 * effects (`EFFECT_RENDER`), and one for user effects (`EFFECT_USER`). It handles enqueuing
 * nodes, running the queues in the correct order, and flushing all updates.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind class
 * @access package
 *
 * @implements {IQueueType}
 */
export class QueueClass implements IQueueType {
  _running: boolean = false;
  _queues: [ComputationClass[], EffectClass[], EffectClass[]] = [[], [], []];
  _children: IQueueType[] = [];
  created = clock;

  /**
   * @inheritdoc
   */
  enqueue<T extends ComputationClass | EffectClass>(
    type: number,
    node: T
  ): void {
    if (false && __DEV__) {
      console.log(
        `[SCHEDULER ENQUEUE] Attempting to enqueue node with type: ${type}`
      );
    }

    // Queue 0 is for pure computations only
    if (type === EFFECT_PURE || !type) {
      // For pure computations, avoid duplicates to prevent cycles
      if (!this._queues[0].includes(node as ComputationClass)) {
        this._queues[0].push(node as any);
        if (false && __DEV__) {
          console.log(
            `[SCHEDULER ENQUEUE] Added node to queue 0, new size: ${this._queues[0].length}`
          );
        }
      }
    } else {
      // For effects, prevent duplicates to enable proper batching.
      // Multiple signal changes should result in only one effect execution per flush.
      if (!this._queues[type].includes(node as EffectClass)) {
        this._queues[type].push(node as any);
        if (false && __DEV__) {
          console.log(
            `[SCHEDULER ENQUEUE] Added effect to queue ${type}, new size: ${this._queues[type].length}`
          );
        }
      } else if (false && __DEV__) {
        console.log(
          `[SCHEDULER ENQUEUE] Effect already in queue ${type}, skipping duplicate for batching`
        );
      }
    }

    schedule();
  }

  /**
   * @inheritdoc
   */
  run(type: number): boolean {
    if (false && __DEV__) {
      console.log(
        `[SCHEDULER RUN] Running queue ${type} with ${this._queues[type].length} items`
      );
    }

    const queue = this._queues[type];
    if (queue.length === 0) return false;

    // Process all items in the queue
    const items = queue.splice(0);
    for (const item of items) {
      if (false && __DEV__) {
        console.log(
          `[SCHEDULER RUN] Executing item in queue ${type}, is effect: ${!!(
            item as any
          )._effect}`
        );
      }

      // Effects need to call _runEffect(), computations call _updateIfNecessary().
      if ((item as any)._effect) {
        // This is an effect, call _runEffect directly
        if (item._state !== STATE_DISPOSED) {
          (item as any)._runEffect();
        }
      } else {
        // This is a computation/memo, call _updateIfNecessary
        item._updateIfNecessary();
      }
    }

    // Return true if there are more items to process
    return this._queues[type].length > 0;
  }

  /**
   * @inheritdoc
   */
  flush() {
    if (this._running) return;
    this._running = true;

    if (false && __DEV__) {
      console.log(
        `[SCHEDULER] Starting flush, queues: [${this._queues[0].length}, ${this._queues[1].length}, ${this._queues[2].length}]`
      );
    }

    try {
      // Run pure computations until all are processed
      let runAgain = true;
      while (runAgain) {
        runAgain = !!this.run(EFFECT_PURE);
      }

      incrementClock();

      // Run render effects
      this.run(EFFECT_RENDER);

      // Run user effects in a loop like pure computations.
      // This ensures effects enqueued during effect execution get processed.
      runAgain = true;
      while (runAgain) {
        runAgain = !!this.run(EFFECT_USER);
      }

      // Reset scheduled flag AFTER all effects have run.
      // This prevents issues where effects enqueue new effects during execution.
      scheduled = false;
    } finally {
      this._running = false;
      if (false && __DEV__) {
        console.log(
          `[SCHEDULER] Flush completed, queues: [${this._queues[0].length}, ${this._queues[1].length}, ${this._queues[2].length}]`
        );
      }
    }
  }

  /**
   * @inheritdoc
   */
  addChild(child: IQueueType) {
    this._children.push(child);
  }

  /**
   * @inheritdoc
   */
  removeChild(child: IQueueType) {
    const index = this._children.indexOf(child);
    if (index >= 0) this._children.splice(index, 1);
  }
}

/**
 * The global instance of the reactive update queue used by the InSpatial Signal Core.
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind const
 * @type {QueueClass}
 */
export const globalQueue = new QueueClass();

/**
 * # flushSync
 * @summary #### Synchronously flushes all pending reactive updates.
 *
 * By default, changes to signals are batched and processed asynchronously on the microtask queue.
 * `flushSync` allows you to force all pending updates (computations and effects) to run immediately
 * and synchronously. This can be useful in tests or when integrating with non-reactive code that
 * needs to observe the results of reactive changes immediately.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module SchedulerUtils
 * @kind function
 * @access public
 *
 * @template T - The return type of the optional function `fn`.
 * @param {() => T} [fn] - An optional function to execute *before* flushing the queue. Any reactive
 *   changes triggered by this function will be included in the synchronous flush.
 * @returns {T | undefined} The result of `fn` if it was provided, otherwise `undefined`.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn about usage and implications</summary>
 *
 * > [!CAUTION]
 * > Overuse of `flushSync` can negate the performance benefits of asynchronous batching and potentially
 * > lead to layout thrashing or unresponsive UIs if used excessively within event handlers or render paths.
 * > Prefer allowing the default microtask scheduling unless synchronous updates are strictly necessary.
 *
 * > [!NOTE]
 * > If `fn` is provided and it throws an error, `flushSync` will still attempt to flush the reactive queues
 * > before re-throwing the original error. This ensures a consistent state as much as possible.
 *
 * > [!NOTE]
 * > `flushSync` can detect and warn about potential infinite loops if it runs too many times consecutively during a single flush operation (in development mode).
 * </details>
 *
 * @example
 * ### Example 1: Basic Synchronous Flush
 * ```typescript
 * import { createSignal, createEffect, flushSync } from "@in/teract/signal-core";
 *
 * const [name, setName] = createSignal("Initial");
 *
 * createEffect(() => {
 *   console.log("Name is now:", name());
 * });
 *
 * console.log("Before setName and flushSync");
 * setName("Updated Name");
 * console.log("After setName, before flushSync. Effect has not run yet.");
 * flushSync(); // Forces the effect to run immediately
 * console.log("After flushSync. Effect has run.");
 *
 * // Output order:
 * // Before setName and flushSync
 * // Name is now: Initial (from initial effect run, if any, or if root not immediately flushed)
 * // After setName, before flushSync. Effect has not run yet.
 * // Name is now: Updated Name
 * // After flushSync. Effect has run.
 * ```
 *
 * @example
 * ### Example 2: Flushing after multiple batched updates
 * ```typescript
 * import { createSignal, createEffect, batch, flushSync } from "@in/teract/signal-core";
 *
 * const [firstName, setFirstName] = createSignal("Ben");
 * const [lastName, setLastName] = createSignal("Lyam");
 *
 * createEffect(() => {
 *   console.log(`Full Name: ${firstName()} ${lastName()}`);
 * });
 *
 * batch(() => {
 *   setFirstName("Carolina");
 *   setLastName("Smith");
 *   // Effect does not run here due to batching
 *   console.log("Inside batch, after setting names.");
 * });
 * console.log("Outside batch, before flushSync. Effect still hasn't run for batched changes.");
 * flushSync(); // Effect runs once with both "Carolina" and "Smith"
 * console.log("After flushSync.");
 * ```
 */
export function flushSync<T>(fn?: () => T): T | undefined {
  // Track if we need to run a function before flushing
  let result: T | undefined;

  // If we're in a test environment, make sure to set flags appropriately
  const isTestEnv =
    typeof globalThis !== "undefined" &&
    ((globalThis as any).__TEST_ENV__ === true ||
      (globalThis as any).__silenceWarnings === true);

  if (isTestEnv) {
    // Force scheduled to true to ensure we always flush in tests
    scheduled = true;
  }

  // If a function is provided, run it first
  if (fn) {
    try {
      result = fn();
    } catch (error) {
      // Even if the function throws, make sure we flush
      flushAllQueues();
      // Re-throw the original error
      throw error;
    }
  }

  // Now flush the queue
  flushAllQueues();

  // Return the result from fn (if it was provided)
  return result;
}

/**
 * # flushAllQueues
 * @summary #### Helper function to repeatedly flush the global queue until it's empty.
 *
 * This function continuously calls `globalQueue.flush()` as long as the `scheduled` flag is true.
 * It includes a safeguard in development mode to warn about potential infinite loops if the flush
 * operation repeats too many times.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind function
 * @access private
 */
function flushAllQueues(): void {
  let count = 0;

  // Run until there are no more scheduled updates
  while (scheduled) {
    if (__DEV__ && ++count >= 1000) {
      console.warn("Potential Infinite Loop Detected in flushSync.");
      break;
    }
    globalQueue.flush();
  }
}

/**
 * # runTop
 * @summary #### Ensures a computation and its ancestors are updated before the computation itself runs.
 *
 * When a computation (`node`) is scheduled to run, `runTop` traverses up its owner chain,
 * updating any dirty or check-state ancestors first. This ensures that when `node` finally
 * re-evaluates, all its dependencies have their most current values.
 * This top-down update order is crucial for maintaining consistency in the reactive graph.
 *
 * @param {ComputationClass} node - The computation node to prepare for execution.
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind function
 * @access private
 */
function runTop(node: ComputationClass): void {
  const ancestors: ComputationClass[] = [];

  for (
    let current: OwnerClass | null = node;
    current !== null;
    current = current._parent
  ) {
    if (current._state !== STATE_CLEAN) {
      ancestors.push(current as ComputationClass);
    }
  }

  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (ancestors[i]._state !== STATE_DISPOSED) {
      ancestors[i]._updateIfNecessary();
    }
  }
}

/**
 * # runPureQueue
 * @summary #### Processes all computation nodes in the pure computation queue.
 *
 * Iterates through the provided `queue` of `ComputationClass` nodes.
 * For each node that is not clean or disposed, it calls `runTop` to ensure
 * its dependencies are up-to-date before the node itself is (implicitly) updated
 * by `runTop` calling `_updateIfNecessary` on it.
 *
 * @param {ComputationClass[]} queue - The queue of pure computations to process.
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind function
 * @access private
 */
function runPureQueue(queue: ComputationClass[]) {
  // Process each computation node in sequence
  for (let i = 0; i < queue.length; i++) {
    // Only process nodes still needing updates
    if (queue[i]._state !== STATE_CLEAN && queue[i]._state !== STATE_DISPOSED) {
      runTop(queue[i]);
    }
  }
}

/**
 * # runEffectQueue
 * @summary #### Executes all effects in the provided effect queue.
 *
 * Iterates through the `queue` of `EffectClass` nodes and calls `_runEffect()`
 * on each effect that has not been disposed. This is where the side-effecting
 * parts of the reactive system are executed.
 *
 * @param {EffectClass[]} queue - The queue of effects to process.
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @kind function
 * @access private
 */
function runEffectQueue(queue: EffectClass[]) {
  if (false && __DEV__) {
    console.log(
      `[SCHEDULER] Running effect queue with ${queue.length} effects`
    );
  }

  for (let i = 0; i < queue.length; i++) {
    const effect = queue[i];

    if (false && __DEV__) {
      console.log(
        `[SCHEDULER] Processing effect ${i}: state=${effect._state}, disposed=${
          effect._state === STATE_DISPOSED
        }`
      );
    }

    if (effect._state !== STATE_DISPOSED) {
      if (false && __DEV__) {
        console.log(`[SCHEDULER] Running effect ${i} (_runEffect)`);
      }
      effect._runEffect();
    }
  }

  if (false && __DEV__) {
    console.log(`[SCHEDULER] Finished running effect queue`);
  }
}
