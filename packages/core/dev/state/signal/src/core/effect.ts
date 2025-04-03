import { EFFECT_PURE, STATE_CLEAN, STATE_DIRTY } from "./constants.ts";
import {
  ComputationClass,
  compute,
  getObserver,
  UNCHANGED,
  type SignalOptionsType,
} from "./core.ts";
import type { ErrorHandlerType } from "./error.ts";
import { getClock, globalQueue } from "./scheduler.ts";
import { onCleanup } from "./owner.ts";

/**
 * Effects are the leaf nodes of reactive graph. When their sources change, they are
 * automatically added to the queue of effects to re-execute, which will cause them to fetch their
 * sources and recompute
 */
export class EffectClass extends ComputationClass<any> {
  _fn: (prev?: any) => any;
  _effect: (value: any, prev?: any) => (() => void) | void;
  _queueType: number;
  _errorEffect: ErrorHandlerType | undefined;

  constructor(
    initialValue: unknown,
    fn: (prev?: any) => any,
    effect: (value: any, prev?: any) => (() => void) | void,
    error?: ErrorHandlerType,
    options?: SignalOptionsType<any> & { render?: boolean; type?: number }
  ) {
    super(initialValue, null, options);
    this._fn = fn;
    this._effect = effect;
    this._errorEffect = error;
    this._queueType = options?.type || (options?.render ? 1 : 2);
    if (!options?.render)
      this._queue = options?.type ? globalQueue : this._parent!._queue;
    this._notify(STATE_DIRTY);
  }

  override _notify(state: number, skipQueue?: boolean) {
    super._notify(state);
    if (!skipQueue && this._state >= STATE_DIRTY) {
      this._queue.enqueue(this._queueType, this);
    }
  }

  override _updateIfNecessary(): void {
    if (this._state !== STATE_CLEAN) super._updateIfNecessary();
  }

  _runEffect(): void {
    if (this._state === STATE_CLEAN) return;
    const owner = this._parent;
    let disposer: (() => void) | void = undefined;
    try {
      const prevValue = this._value;
      const result = compute(owner, this._fn, this);
      if (result !== UNCHANGED) {
        this.emptyDisposal();
        disposer = compute(this, () => this._effect(result, prevValue), this);
        this._value = result;
      }
    } catch (error: unknown) {
      this.emptyDisposal();
      if (this._errorEffect)
        compute(owner, () => this._errorEffect!(error, this), null);
      else this.handleError(error);
      this._value = undefined;
    }
    if (disposer) onCleanup(disposer);
    this._state = STATE_CLEAN;
  }
}

export class EagerComputationClass<T> extends EffectClass {
  _nextSourceTime = -1;
  override _value: T | undefined = undefined;
  _prevSource: ComputationClass<T> | undefined = undefined;
  _defer: boolean;

  constructor(
    initialValue: T | undefined,
    fn: (prev: ComputationClass<T> | undefined) => ComputationClass<T>,
    options?: SignalOptionsType<T> & { defer?: boolean }
  ) {
    // Create an unbound method first
    const runEffect = function (this: EagerComputationClass<T>) {
      return this._runEffect();
    };

    // Call super with the function
    super(initialValue, fn as any, runEffect, undefined, options);

    // Bind the method to this instance after super is called
    Object.defineProperty(runEffect, "name", { value: "_runEffect" });

    this._defer = !!options?.defer;
  }

  override _notify(state: number, skipQueue?: boolean) {
    if (this._state >= state) return;

    // defer notification if specified in options or if we are already notified
    // to run and we were previously clean.
    if (skipQueue || (this._state === STATE_CLEAN && this._defer)) {
      this._state = state;
    } else {
      super._notify(state, false);
    }
  }

  override _runEffect() {
    // We track ourselves because we want our value to update when this Effect runs
    const observer = getObserver();
    // Register this computation with the current observer to ensure proper dependency tracking
    if (observer) {
      observer._sources?.push(this);
      if (!this._observers) this._observers = [];
      this._observers.push(observer);
    }

    // If we are running the effect, that means our state must be dirty
    if (this._state === STATE_CLEAN) return;

    const prevSource = this._prevSource;
    const prevValue = this._value;

    try {
      let nextSource = this._fn(prevSource) as ComputationClass<T>;

      if (nextSource !== this._prevSource) {
        // remove prev source if it exists and is not the same as the next source
        if (this._prevSource) {
          const index = this._prevSource._observers?.indexOf(this) ?? -1;
          if (index > -1) this._prevSource._observers!.splice(index, 1);
        }

        this._prevSource = nextSource;
        this._nextSourceTime = getClock();

        // add next source if it exists
        if (nextSource) {
          if (!nextSource._observers) nextSource._observers = [];
          nextSource._observers.push(this);
        }
      }

      if (this._nextSourceTime > this._time || this._state === STATE_DIRTY) {
        const nextValue = nextSource.wait();
        if (this._equals === false || !this._equals(prevValue!, nextValue)) {
          this.write(nextValue);
        }
      }
    } catch (e) {
      this.write(e as any, 1);
    }

    this._state = STATE_CLEAN;

    // Untrack ourselves because we are done running the effect
    compute(null, () => {}, null);
  }

  override read() {
    this._updateIfNecessary();
    return super.read();
  }

  override wait() {
    this._updateIfNecessary();
    return super.wait();
  }

  override loading() {
    this._updateIfNecessary();
    return super.loading();
  }
}

export class ProjectionComputation extends ComputationClass {
  constructor(compute: () => void) {
    super(null, compute);
    if (__DEV__ && !this._parent)
      console.warn(
        "Eager Computations created outside a reactive context will never be disposed"
      );
  }
  override _notify(state: number, skipQueue?: boolean): void {
    if (this._state >= state && !this._forceNotify) return;

    if (this._state === STATE_CLEAN && !skipQueue)
      this._queue.enqueue(EFFECT_PURE, this);

    super._notify(state, true);
  }
}
