import {
  EFFECT_PURE,
  EFFECT_RENDER,
  EFFECT_USER,
  STATE_CLEAN,
  STATE_DISPOSED
} from "./constants.js";
import type { Computation } from "./core.js";
import type { Effect } from "./effect.js";
import type { Owner } from "./owner.js";

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

export interface IQueue {
  enqueue<T extends Computation | Effect>(type: number, node: T): void;
  run(type: number): boolean | void;
  flush(): void;
  addChild(child: IQueue): void;
  removeChild(child: IQueue): void;
  created: number;
}

export class Queue implements IQueue {
  _running: boolean = false;
  _queues: [Computation[], Effect[], Effect[]] = [[], [], []];
  _children: IQueue[] = [];
  created = clock;
  enqueue<T extends Computation | Effect>(type: number, node: T): void {
    this._queues[0].push(node as any);
    if (type) this._queues[type].push(node as any);
    schedule();
  }
  run(type: number) {
    if (this._queues[type].length) {
      if (type === EFFECT_PURE) {
        runPureQueue(this._queues[type]);
        this._queues[type] = [];
      } else {
        const effects = this._queues[type] as Effect[];
        this._queues[type] = [];
        runEffectQueue(effects);
      }
    }
    let rerun = false;
    for (let i = 0; i < this._children.length; i++) {
      rerun = this._children[i].run(type) || rerun;
    }
    if (type === EFFECT_PURE && this._queues[type].length) return true;
  }
  flush() {
    if (this._running) return;
    this._running = true;
    try {
      while (this.run(EFFECT_PURE)) {}
      incrementClock();
      scheduled = false;
      this.run(EFFECT_RENDER);
      this.run(EFFECT_USER);
    } finally {
      this._running = false;
    }
  }
  addChild(child: IQueue) {
    this._children.push(child);
  }
  removeChild(child: IQueue) {
    const index = this._children.indexOf(child);
    if (index >= 0) this._children.splice(index, 1);
  }
}

export const globalQueue = new Queue();

/**
 * By default, changes are batched on the microtask queue which is an async process. You can flush
 * the queue synchronously to get the latest updates by calling `flushSync()`.
 */
export function flushSync(): void {
  let count = 0;
  while (scheduled) {
    if (__DEV__ && ++count === 1e5) throw new Error("Potential Infinite Loop Detected.");
    globalQueue.flush();
  }
}

/**
 * When re-executing nodes, we want to be extra careful to avoid double execution of nested owners
 * In particular, it is important that we check all of our parents to see if they will rerun
 * See tests/createEffect: "should run parent effect before child effect" and "should run parent
 * memo before child effect"
 */
function runTop(node: Computation): void {
  const ancestors: Computation[] = [];

  for (let current: Owner | null = node; current !== null; current = current._parent) {
    if (current._state !== STATE_CLEAN) {
      ancestors.push(current as Computation);
    }
  }

  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (ancestors[i]._state !== STATE_DISPOSED) ancestors[i]._updateIfNecessary();
  }
}

function runPureQueue(queue: Computation[]) {
  for (let i = 0; i < queue.length; i++) {
    if (queue[i]._state !== STATE_CLEAN) runTop(queue[i]);
  }
}

function runEffectQueue(queue: Effect[]) {
  for (let i = 0; i < queue.length; i++) queue[i]._runEffect();
}
