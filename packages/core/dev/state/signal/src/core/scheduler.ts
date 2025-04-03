import {
  EFFECT_PURE,
  EFFECT_RENDER,
  EFFECT_USER,
  STATE_CLEAN,
  STATE_DISPOSED
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
  enqueue<T extends ComputationClass | EffectClass>(type: number, node: T): void;
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
  enqueue<T extends ComputationClass | EffectClass>(type: number, node: T): void {
    this._queues[0].push(node as any);
    if (type) this._queues[type].push(node as any);
    schedule();
  }
  run(type: number) {
    if (this._queues[type].length) {
      if (type === EFFECT_PURE) {
        runPureQueue(this._queues[type] as ComputationClass[]);
        this._queues[type] = [];
      } else {
        const effects = this._queues[type] as EffectClass[];
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
function runTop(node: ComputationClass): void {
  const ancestors: ComputationClass[] = [];

  for (let current: OwnerClass | null = node; current !== null; current = current._parent) {
    if (current._state !== STATE_CLEAN) {
      ancestors.push(current as ComputationClass);
    }
  }

  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (ancestors[i]._state !== STATE_DISPOSED) ancestors[i]._updateIfNecessary();
  }
}

function runPureQueue(queue: ComputationClass[]) {
  for (let i = 0; i < queue.length; i++) {
    if (queue[i]._state !== STATE_CLEAN) runTop(queue[i]);
  }
}

function runEffectQueue(queue: EffectClass[]) {
  for (let i = 0; i < queue.length; i++) queue[i]._runEffect();
}
