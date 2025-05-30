import { STATE_DIRTY } from "./constants.ts";
import { ComputationClass, createBoundary, flatten } from "./core.ts";
import { EagerComputationClass, type EffectClass } from "./effect.ts";
import { LOADING_BIT } from "./flags.ts";
import { QueueClass } from "./scheduler.ts";

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
