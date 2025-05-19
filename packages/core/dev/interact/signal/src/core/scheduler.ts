import {
  EFFECT_PURE,
  EFFECT_RENDER,
  EFFECT_USER,
  STATE_CLEAN,
  STATE_DISPOSED,
} from "./constants.ts";
import type { ComputationClass } from "./core.ts";
import type { EffectClass } from "./effect.ts";
import type { OwnerClass } from "./owner.ts";

let clock = 0;
export function getClock() {
  return clock;
}
export function incrementClock(): void {
  clock++;
}

let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  if (!globalQueue._running) queueMicrotask(flushSync);
}

export interface IQueueType {
  enqueue<T extends ComputationClass | EffectClass>(
    type: number,
    node: T
  ): void;
  run(type: number): boolean | void;
  flush(): void;
  addChild(child: IQueueType): void;
  removeChild(child: IQueueType): void;
  created: number;
}

export class QueueClass implements IQueueType {
  _running: boolean = false;
  _queues: [ComputationClass[], EffectClass[], EffectClass[]] = [[], [], []];
  _children: IQueueType[] = [];
  created = clock;
  enqueue<T extends ComputationClass | EffectClass>(
    type: number,
    node: T
  ): void {
    // Always ensure the node is in queue 0 (for pure computations)
    if (!this._queues[0].includes(node as ComputationClass)) {
      this._queues[0].push(node as any);
    }

    // For effects, also add to the appropriate queue type
    if (type && !this._queues[type].includes(node as EffectClass)) {
      this._queues[type].push(node as any);
    }

    schedule();
  }

  run(type: number) {
    if (this._queues[type].length) {
      if (type === EFFECT_PURE) {
        runPureQueue(this._queues[type] as ComputationClass[]);
        this._queues[type] = [];
      } else {
        // Critical fix: Safe copy of effects array to prevent mutation issues during execution
        const effects = [...this._queues[type]] as EffectClass[];
        this._queues[type] = [];
        runEffectQueue(effects);
      }
    }

    let rerun = false;
    for (let i = 0; i < this._children.length; i++) {
      rerun = this._children[i].run(type) || rerun;
    }

    // Check if we need to run again (if more effects were enqueued during execution)
    if (type === EFFECT_PURE && this._queues[type].length) {
      return true;
    }

    return rerun;
  }

  flush() {
    if (this._running) return;
    this._running = true;

    try {
      // Run pure computations until all are processed
      let runAgain = true;
      while (runAgain) {
        runAgain = !!this.run(EFFECT_PURE);
      }

      incrementClock();
      scheduled = false;

      // Run render effects
      this.run(EFFECT_RENDER);

      // Run user effects
      this.run(EFFECT_USER);
    } finally {
      this._running = false;
    }
  }

  addChild(child: IQueueType) {
    this._children.push(child);
  }

  removeChild(child: IQueueType) {
    const index = this._children.indexOf(child);
    if (index >= 0) this._children.splice(index, 1);
  }
}

export const globalQueue = new QueueClass();

/**
 * By default, changes are batched on the microtask queue which is an async process. You can flush
 * the queue synchronously to get the latest updates by calling `flushSync()`.
 *
 * @param fn Optional function to execute before flushing the queue
 * @returns The result of fn if provided, otherwise undefined
 */
export function flushSync<T>(fn?: () => T): T | undefined {
  // Track if we need to run a function before flushing
  let result: T | undefined;

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
 * Helper to flush all queues with safety checks
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
 * When re-executing nodes, we want to be extra careful to avoid double execution of nested owners
 * In particular, it is important that we check all of our parents to see if they will rerun
 * See tests/createEffect: "should run parent effect before child effect" and "should run parent
 * memo before child effect"
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

function runPureQueue(queue: ComputationClass[]) {
  // Process each computation node in sequence
  for (let i = 0; i < queue.length; i++) {
    // Only process nodes still needing updates
    if (queue[i]._state !== STATE_CLEAN && queue[i]._state !== STATE_DISPOSED) {
      runTop(queue[i]);
    }
  }
}

function runEffectQueue(queue: EffectClass[]) {
  // Process each effect node in sequence
  for (let i = 0; i < queue.length; i++) {
    // Only run effects that haven't been disposed
    if (queue[i]._state !== STATE_DISPOSED) {
      queue[i]._runEffect();
    }
  }
}

// -------------------- Batch Utility --------------------
/**
 * `batch` allows changes made inside `fn` to be queued and flushed once, rather than
 * triggering intermediate reactive updates.  It simply increments an internal
 * depth counter; when depth returns to 0 we flush the global queue synchronously.
 * This mirrors SolidJS semantics sufficiently for our core tests.
 *
 * NOTE:  All internals already enqueue into `globalQueue`, so batching only needs
 * to defer the final `flush` until the outer‐most batch completes.
 */
let _batchDepth = 0;
export function batch<T>(fn: () => T): T {
  _batchDepth++;
  try {
    return fn();
  } finally {
    _batchDepth--;
    if (_batchDepth === 0) {
      // ensure pending work is processed synchronously
      flushSync();
    }
  }
}

/**
 * Simple helper used by some higher-level utilities to know if they are
 * executing inside a batch scope.
 */
export function isBatching(): boolean {
  return _batchDepth > 0;
}
