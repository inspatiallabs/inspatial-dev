import { removeFromArr } from "./utils.ts";
import { env } from "./env/index.ts";
import { DebugContext } from "./debug/index.ts";

// Type definitions
export type SignalEffectType<T = any> = () => T;
export type SignalEffectFunctionType<T = any> = (() => T) & {
  _id?: number;
  _pure?: boolean;
};
export type SignalComputeFunctionType<T, R> = (value: T) => R;
export type SignalDisposerFunctionType = (batch?: boolean) => void;
export type SignalCleanupFunctionType = (batch?: boolean) => void;

interface SignalInternal<T> {
  id: number;
  value: T;
  compute?: SignalComputeFunctionType<T, T>;
  disposeCtx: SignalDisposerFunctionType[] | null;
  userEffects: SignalEffectFunctionType[];
  signalEffects: SignalEffectFunctionType[];
}

// Global state
let sigID = 0;
let ticking = false;
let currentEffect: SignalEffectFunctionType | null = null;
let currentDisposers: SignalDisposerFunctionType[] | null = null;
let currentResolve: (() => void) | null = null;
let currentTick: Promise<void> | null = null;

let signalQueue = new Set<SignalEffectFunctionType[]>();
let effectQueue = new Set<SignalEffectFunctionType[]>();
let runQueue = new Set<SignalEffectFunctionType>();

// Scheduler part

function scheduleSignal(
  signalEffects: SignalEffectFunctionType[]
): Set<SignalEffectFunctionType[]> {
  return signalQueue.add(signalEffects);
}

function scheduleEffect(
  effects: SignalEffectFunctionType[]
): Set<SignalEffectFunctionType[]> {
  return effectQueue.add(effects);
}

function flushRunQueue(): void {
  for (const i of runQueue) i();
  runQueue.clear();
}

function sortQueue(
  a: SignalEffectFunctionType[],
  b: SignalEffectFunctionType[]
): number {
  return ((a as any)._id ?? 0) - ((b as any)._id ?? 0);
}

function flushQueue(
  queue: Set<SignalEffectFunctionType[]>,
  sorted?: boolean
): void {
  while (queue.size) {
    const queueArr = Array.from(queue);
    queue.clear();

    if (sorted && queueArr.length > 1) {
      queueArr.sort(sortQueue);
      const tempArr = [
        ...new Set(
          ([] as SignalEffectFunctionType[]).concat(...queueArr).reverse()
        ),
      ].reverse();
      runQueue = new Set(tempArr);
    } else if (queueArr.length > 10000) {
      let flattenedArr: SignalEffectFunctionType[] = [];
      for (let i = 0; i < queueArr.length; i += 10000) {
        flattenedArr = flattenedArr.concat(...queueArr.slice(i, i + 10000));
      }
      runQueue = new Set(flattenedArr);
    } else {
      runQueue = new Set(
        ([] as SignalEffectFunctionType[]).concat(...queueArr)
      );
    }
    flushRunQueue();
  }
}

function tick(): Promise<void> {
  if (!ticking) {
    ticking = true;
    currentResolve?.();
  }
  return currentTick!;
}

function nextTick(cb: () => void): Promise<void>;
function nextTick<T extends any[]>(
  cb: (...args: T) => void,
  ...args: T
): Promise<void>;
function nextTick<T extends any[]>(
  cb: (...args: T) => void,
  ...args: T
): Promise<void> {
  if (args.length) {
    const boundCb = () => cb(...args);
    return tick().finally(boundCb);
  }
  return tick().finally(cb as () => void);
}

function flushQueues(): Promise<void> | void {
  if (signalQueue.size || effectQueue.size) {
    flushQueue(signalQueue, true);
    signalQueue = new Set(signalQueue);
    flushQueue(effectQueue);
    effectQueue = new Set(effectQueue);
    return Promise.resolve().then(flushQueues);
  }
}

function tickHandler(resolve: (value: void | PromiseLike<void>) => void): void {
  currentResolve = resolve;
}

function resetTick(): void {
  ticking = false;
  currentTick = new Promise(tickHandler).then(flushQueues);
  currentTick.finally(resetTick);
}

// Signal part

function pure<T extends SignalEffectFunctionType>(cb: T): T {
  cb._pure = true;
  return cb;
}

function isPure(cb: SignalEffectFunctionType): boolean {
  return !!cb._pure;
}

function disposeRaw(this: SignalDisposerFunctionType[]): void {
  for (const i of this) i(true);
  this.length = 0;
}

function disposeWithCallback(
  this: SignalCleanupFunctionType,
  disposeRaw: () => void,
  batch?: boolean
): void {
  this(batch);
  disposeRaw.call([]);
}

function disposeWithUpstream(
  this: SignalDisposerFunctionType,
  prevDisposers: SignalDisposerFunctionType[],
  batch?: boolean
): void {
  if (!batch) {
    removeFromArr(prevDisposers, this);
  }
  this(batch);
}

function createDisposer(
  disposers: SignalDisposerFunctionType[],
  prevDisposers: SignalDisposerFunctionType[] | null,
  cleanup?: SignalCleanupFunctionType
): SignalDisposerFunctionType {
  let _cleanup: SignalDisposerFunctionType = disposeRaw.bind(disposers);

  if (cleanup) {
    _cleanup = disposeWithCallback.bind(cleanup, _cleanup);
  }

  if (prevDisposers) {
    _cleanup = disposeWithUpstream.bind(_cleanup, prevDisposers);
    prevDisposers.push(_cleanup);
  }

  return _cleanup;
}

function collectDisposers<T>(
  disposers: SignalDisposerFunctionType[],
  fn: () => T,
  cleanup?: SignalCleanupFunctionType
): SignalDisposerFunctionType {
  const prevDisposers = currentDisposers;
  const _dispose = createDisposer(disposers, prevDisposers, cleanup);
  currentDisposers = disposers;
  try {
    fn();
  } finally {
    currentDisposers = prevDisposers;
  }
  return _dispose;
}

function _onDispose(cb: SignalCleanupFunctionType): SignalCleanupFunctionType {
  const disposers = currentDisposers!;
  function cleanup(batch?: boolean): void {
    if (!batch) {
      removeFromArr(disposers, cleanup);
    }
    cb(batch);
  }
  disposers.push(cleanup);
  return cleanup;
}

function onDispose(
  cb: SignalCleanupFunctionType
): SignalCleanupFunctionType | void {
  if (currentDisposers) {
    if (!env.isProduction() && typeof cb !== "function") {
      throw new TypeError(
        `Callback must be a function but got ${Object.prototype.toString.call(
          cb
        )}`
      );
    }
    return _onDispose(cb);
  }
  return cb;
}

function createEffect<T extends any[]>(
  effect: (...args: T) => SignalCleanupFunctionType | void,
  ...args: T
): SignalDisposerFunctionType {
  let cleanup: SignalCleanupFunctionType | undefined;
  let cancelled = false;
  const _dispose = watch(function () {
    if (typeof cleanup === "function") cleanup();
    cleanup = effect(...args) || undefined;
  });
  const cancelEffect = function (): void {
    if (cancelled) {
      return;
    }
    cancelled = true;
    if (typeof cleanup === "function") cleanup();
    _dispose();
  };
  onDispose(cancelEffect);
  return cancelEffect;
}

function _frozen<T extends any[], R>(
  this: (...args: T) => R,
  capturedDisposers: SignalDisposerFunctionType[] | null,
  capturedEffects: SignalEffectFunctionType | null,
  ...args: T
): R {
  const prevDisposers = currentDisposers;
  const prevEffect = currentEffect;

  currentDisposers = capturedDisposers;
  currentEffect = capturedEffects;

  try {
    return this(...args);
  } finally {
    currentDisposers = prevDisposers;
    currentEffect = prevEffect;
  }
}

function freeze<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R {
  return _frozen.bind(fn, currentDisposers, currentEffect) as (...args: T) => R;
}

function untrack<T>(fn: () => T): T {
  const prevDisposers = currentDisposers;
  const prevEffect = currentEffect;

  currentDisposers = null;
  currentEffect = null;

  try {
    return fn();
  } finally {
    currentDisposers = prevDisposers;
    currentEffect = prevEffect;
  }
}

// Global debug context (set by renderer)
let globalDebugCtx: DebugContext | null = null;

export function setSignalDebugContext(ctx: DebugContext | null): void {
  globalDebugCtx = ctx;
}

export type SignalValueType<T> = T | Signal<T>;

export class Signal<T = any> {
  private _!: SignalInternal<T>;

  constructor(value: T, compute?: SignalComputeFunctionType<T, T>) {
    if (!env.isProduction() && new.target !== Signal) {
      throw new Error("Signal must not be extended!");
    }

    // eslint-disable-next-line no-plusplus
    const id = sigID++;
    const userEffects: SignalEffectFunctionType[] = [];
    const signalEffects: SignalEffectFunctionType[] = [];
    const disposeCtx = currentDisposers;

    (userEffects as any)._id = id;
    (signalEffects as any)._id = id;

    const internal: SignalInternal<T> = {
      id,
      value,
      compute,
      disposeCtx,
      userEffects,
      signalEffects,
    };

    Object.defineProperty(this, "_", {
      value: internal,
      writable: false,
      enumerable: false,
      configurable: false,
    });

    if (compute) {
      watch(pure(this.set.bind(this, value)));
    } else if (isSignal(value)) {
      (value as any).connect(pure(this.set.bind(this, value)));
    }
    
    // Track signal creation
    globalDebugCtx?.trackSignal('create', id, value);
  }

  static ensure<T>(val: SignalValueType<T>): Signal<T> {
    if (isSignal(val)) {
      return val;
    }
    return createSignal(val as T);
  }

  static ensureAll<T extends SignalValueType<any>[]>(...vals: T): Signal<any>[] {
    return vals.map(this.ensure);
  }

  get value(): T {
    return this.get();
  }

  set value(val: T) {
    this.set(val);
    // Track signal update
    globalDebugCtx?.trackSignal('update', this._.id, val);
  }

  get connected(): boolean {
    const { userEffects, signalEffects } = this._;
    return !!(userEffects.length || signalEffects.length);
  }

  touch(): void {
    this.connect(currentEffect);
  }

  get(): T {
    this.connect(currentEffect);
    return this._.value;
  }

  set(val: SignalValueType<T>): void {
    const { compute, value } = this._;
    const newVal = compute ? peek(compute(read(val))) : read(val);
    if (value !== newVal) {
      this._.value = newVal;
      this.trigger();
    }
  }

  peek(): T {
    return this._.value;
  }

  poke(val: T): void {
    this._.value = val;
  }

  trigger(): void {
    const { userEffects, signalEffects } = this._;
    scheduleSignal(signalEffects);
    scheduleEffect(userEffects);
    tick();
  }

  refresh(): void {
    const { compute, value } = this._;
    if (compute) {
      const val = peek(compute(value));
      if (value !== val) {
        this._.value = val;
        this.trigger();
      }
    }
  }

  connect(effect?: SignalEffectFunctionType | null, runImmediate = true): void {
    if (!effect) {
      return;
    }
    const { userEffects, signalEffects, disposeCtx } = this._;
    const effects = isPure(effect) ? signalEffects : userEffects;
    if (!effects.includes(effect)) {
      effects.push(effect);
      if (currentDisposers && currentDisposers !== disposeCtx) {
        _onDispose(function () {
          removeFromArr(effects, effect);
          if (runQueue.size) {
            runQueue.delete(effect);
          }
        });
      }
    }
    if (runImmediate && currentEffect !== effect) {
      effect();
    }
  }

  hasValue(): boolean {
    const val = this.get();
    return val !== undefined && val !== null;
  }

  inverse(): Signal<boolean> {
    return createSignal(this, function (i: T): boolean {
      return !i;
    });
  }

  nullishThen<U>(val: SignalValueType<U>): Signal<T | U> {
    return createSignal(this, function (i: T): T | U {
      const _val = read(val);
      return i === undefined || i === null ? _val : i;
    });
  }

  and<U>(val: SignalValueType<U>): Signal<T | U> {
    return createSignal(this, function (i: T): T | U {
      const _val = read(val);
      return (i && _val) as T | U;
    });
  }

  andNot<U>(val: SignalValueType<U>): Signal<T | boolean> {
    return createSignal(this, function (i: T): T | boolean {
      const _val = read(val);
      return i && !_val;
    });
  }

  inverseAnd<U>(val: SignalValueType<U>): Signal<boolean | U> {
    return createSignal(this, function (i: T): boolean | U {
      const _val = read(val);
      return !i && _val;
    });
  }

  inverseAndNot(val: SignalValueType<any>): Signal<boolean> {
    return createSignal(this, function (i: T): boolean {
      const _val = read(val);
      return !i && !_val;
    });
  }

  or<U>(val: SignalValueType<U>): Signal<T | U> {
    return createSignal(this, function (i: T): T | U {
      const _val = read(val);
      return (i || _val) as T | U;
    });
  }

  orNot<U>(val: SignalValueType<U>): Signal<T | boolean> {
    return createSignal(this, function (i: T): T | boolean {
      const _val = read(val);
      return i || !_val;
    });
  }

  inverseOr<U>(val: SignalValueType<U>): Signal<boolean | U> {
    return createSignal(this, function (i: T): boolean | U {
      const _val = read(val);
      return !i || _val;
    });
  }

  inverseOrNot(val: SignalValueType<any>): Signal<boolean> {
    return createSignal(this, function (i: T): boolean {
      const _val = read(val);
      return !i || !_val;
    });
  }

  eq(val: SignalValueType<any>): Signal<boolean> {
    return createSignal(this, function (i: T): boolean {
      return i === read(val);
    });
  }

  neq<U>(val: SignalValueType<U>): Signal<boolean> {
    return createSignal(this, function (i: T): boolean {
      return (i as any) !== read(val);
    });
  }

  gt(val: SignalValueType<T>): Signal<boolean> {
    return createSignal(this, function (i: T): boolean {
      return i > read(val);
    });
  }

  lt(val: SignalValueType<T>): Signal<boolean> {
    return createSignal(this, function (i: T): boolean {
      return i < read(val);
    });
  }

  toJSON(): T {
    return this.get();
  }

  *[Symbol.iterator](): Generator<any, void, unknown> {
    yield* this.get() as any;
  }

  [Symbol.toPrimitive](
    hint: "string" | "number" | "default"
  ): string | number | boolean {
    const val = this.get();
    switch (hint) {
      case "string":
        return String(val);
      case "number":
        return Number(val);
      default:
        if (Object(val) !== val) {
          return val as any;
        }
        return !!val;
    }
  }
}

function createSignal<T>(value: T): Signal<T>;
function createSignal<T, R>(
  value: Signal<T>,
  compute: SignalComputeFunctionType<T, R>
): Signal<R>;
function createSignal<T, R>(
  value: T,
  compute?: SignalComputeFunctionType<T, R>
): Signal<T> | Signal<R> {
  return new Signal(value, compute as any);
}

Object.defineProperties(createSignal, {
  ensure: {
    value: Signal.ensure.bind(Signal),
    enumerable: true,
  },
  ensureAll: {
    value: Signal.ensureAll.bind(Signal),
    enumerable: true,
  },
});

function isSignal<T = any>(val: unknown): val is Signal<T> {
  return val instanceof Signal;
}

function watch<T>(
  effect: SignalEffectFunctionType<T>
): SignalDisposerFunctionType {
  const prevEffect = currentEffect;
  currentEffect = effect;
  const _dispose = collectDisposers([], effect);
  currentEffect = prevEffect;

  return _dispose;
}

function peek<T>(val: SignalValueType<T>): T {
  let unwrapped: any = val;
  while (isSignal(unwrapped)) {
    unwrapped = unwrapped.peek();
  }
  return unwrapped;
}

function poke<T>(val: SignalValueType<T>, newVal: T): T {
  if (isSignal(val)) {
    val.poke(newVal);
    return newVal;
  }
  return newVal;
}

function touch(...vals: SignalValueType<any>[]): void {
  for (const i of vals) {
    if (isSignal(i)) {
      i.touch();
    }
  }
}

function read<T>(val: SignalValueType<T>): T {
  if (isSignal(val)) {
    return peek(val.get());
  }
  return val as T;
}

function readAll<T extends SignalValueType<any>[]>(
  ...vals: T
): { [K in keyof T]: T[K] extends SignalValueType<infer U> ? U : T[K] } {
  return vals.map(read) as any;
}

function _write<T>(val: Signal<T>, newVal: T | ((prev: T) => T)): T {
  if (typeof newVal === "function") {
    newVal = (newVal as (prev: T) => T)(peek(val));
  }
  val.value = newVal;
  return peek(val);
}

function write<T>(val: SignalValueType<T>, newVal: T | ((prev: T) => T)): T {
  if (isSignal(val)) {
    return _write(val, newVal);
  }
  if (typeof newVal === "function") {
    return (newVal as (prev: T) => T)(val as T);
  }
  return newVal;
}

function listen<T>(vals: SignalValueType<T>[], cb: SignalEffectFunctionType): void {
  for (const val of vals) {
    if (isSignal(val)) {
      val.connect(cb);
    }
  }
}

function computed<T>(fn: () => T): Signal<T> {
  return createSignal(null as any, fn as any);
}

const $ = computed;

function _merged<T extends any[], R>(
  this: (...args: T) => R,
  vals: SignalValueType<any>[]
): R {
  return this(...(readAll(...vals) as T));
}

function merge<T extends SignalValueType<any>[], R>(
  vals: T,
  handler: (
    ...args: { [K in keyof T]: T[K] extends SignalValueType<infer U> ? U : T[K] }
  ) => R
): Signal<R> {
  return $(_merged.bind(handler, vals)) as Signal<R>;
}

function tpl(
  strs: TemplateStringsArray,
  ...exprs: SignalValueType<any>[]
): Signal<string> {
  const raw = { raw: strs };
  return createSignal(null as any, function (): string {
    return String.raw(raw, ...exprs);
  });
}

function not<T>(val: SignalValueType<T>): Signal<boolean> {
  return createSignal(null as any, function (): boolean {
    return !read(val);
  });
}

function connect<T>(
  sigs: Signal<T>[],
  effect: SignalEffectFunctionType,
  runImmediate = true
): void {
  for (const sig of sigs) {
    sig.connect(effect, false);
  }
  if (runImmediate) {
    const prevEffect = currentEffect;
    currentEffect = effect;
    try {
      effect();
    } finally {
      currentEffect = prevEffect;
    }
  }
}

function bind<T>(
  handler: (val: T) => void,
  val: SignalValueType<T> | (() => T)
): void {
  if (isSignal(val)) {
    val.connect(function () {
      handler(val.peek());
    });
  } else if (typeof val === "function") {
    watch(function () {
      handler((val as () => T)());
    });
  } else {
    handler(val as T);
  }
}

function createTriggerAction<T>(
  val: SignalValueType<T>,
  compute?: SignalComputeFunctionType<T, T>
): [(cb: (val: T) => void) => void, (newVal: T) => void] {
  const actionSignal = isSignal(val)
    ? compute
      ? createSignal(val, compute)
      : val
    : createSignal(val as T);
  function onAction(cb: (val: T) => void): void {
    actionSignal.connect(function () {
      cb(actionSignal.peek());
    }, false);
  }
  function trigger(newVal: T): void {
    actionSignal.value = newVal;
    actionSignal.trigger();
  }
  return [onAction, trigger];
}

function derive<T, K extends keyof T, R>(
  sig: SignalValueType<T>,
  key: K,
  compute?: SignalComputeFunctionType<T[K], R>
): Signal<T[K] | R> {
  if (isSignal(sig)) {
    const derivedSig = createSignal(null as any, compute as any) as Signal<
      T[K] | R
    >;
    let disposer: SignalDisposerFunctionType | null = null;

    const _dispose = function (): void {
      disposer?.();
    };

    sig.connect(
      pure(function () {
        _dispose();
        const newVal = peek(sig);
        if (!newVal) {
          return;
        }

        untrack(function () {
          disposer = watch(function () {
            derivedSig.value = read(newVal[key] as any);
          });
        });
      })
    );

    onDispose(_dispose);

    return derivedSig;
  } else {
    return createSignal((sig as T)[key]) as Signal<T[K] | R>;
  }
}

function extract<T extends Record<string, any>, K extends keyof T>(
  sig: SignalValueType<T>,
  ...extractions: K[]
): { [P in K]: Signal<T[P]> } {
  if (!extractions.length) {
    extractions = Object.keys(peek(sig)) as K[];
  }

  return extractions.reduce(function (mapped, i) {
    mapped[i] = createSignal(sig as any, function (val: T): T[K] {
      return val && peek(val[i]);
    });
    return mapped;
  }, {} as { [P in K]: Signal<T[P]> });
}

function derivedExtract<T extends Record<string, any>, K extends keyof T>(
  sig: SignalValueType<T>,
  ...extractions: K[]
): { [P in K]: Signal<T[P]> } {
  if (!extractions.length) {
    extractions = Object.keys(peek(sig)) as K[];
  }

  return extractions.reduce(function (mapped, i) {
    mapped[i] = derive(sig, i);
    return mapped;
  }, {} as { [P in K]: Signal<T[P]> });
}

function makeReactive<T extends Record<string, any>>(obj: T): T {
  return Object.defineProperties(
    {},
    Object.entries(obj).reduce(function (descriptors, [key, value]) {
      if (isSignal(value)) {
        descriptors[key] = {
          get: value.get.bind(value),
          set: value.set.bind(value),
          enumerable: true,
          configurable: false,
        };
      } else {
        descriptors[key] = {
          value,
          enumerable: true,
        };
      }

      return descriptors;
    }, {} as PropertyDescriptorMap)
  ) as T;
}

function onCondition<T>(
  sig: SignalValueType<T>,
  _compute?: SignalComputeFunctionType<boolean, boolean>
): (condition: SignalValueType<T>) => Signal<boolean> {
  let currentVal: T | null = null;
  let conditionMap = new Map<T, Signal<boolean>[]>();
  let conditionValMap = new Map<SignalValueType<T>, Signal<boolean>>();

  if (isSignal(sig)) {
    sig.connect(
      pure(function () {
        const newVal = peek(sig);
        if (currentVal !== newVal) {
          const prevMatchSet = conditionMap.get(currentVal!);
          const newMatchSet = conditionMap.get(newVal);

          currentVal = newVal;

          if (prevMatchSet) {
            for (const i of prevMatchSet) i.value = false;
          }
          if (newMatchSet) {
            for (const i of newMatchSet) i.value = true;
          }
        }
      })
    );
  }

  if (currentDisposers) {
    _onDispose(function () {
      conditionMap = new Map();
      conditionValMap = new Map();
    });
  }

  function match(condition: SignalValueType<T>): Signal<boolean> {
    let currentCondition = peek(condition);
    let matchSet = conditionMap.get(currentCondition);
    if (isSignal(condition)) {
      let matchSig = conditionValMap.get(condition);
      if (!matchSig) {
        matchSig = createSignal(currentCondition === currentVal);
        conditionValMap.set(condition, matchSig);

        condition.connect(function () {
          currentCondition = peek(condition);
          if (matchSet) {
            removeFromArr(matchSet, matchSig!);
          }
          matchSet = conditionMap.get(currentCondition);
          if (!matchSet) {
            matchSet = [];
            conditionMap.set(currentCondition, matchSet);
          }
          matchSet.push(matchSig!);
          matchSig!.value = currentCondition === currentVal;
        });

        if (currentDisposers) {
          _onDispose(function () {
            conditionValMap.delete(condition);
            if (matchSet!.length === 1) conditionMap.delete(currentCondition);
            else removeFromArr(matchSet!, matchSig!);
          });
        }
      }
      return matchSig;
    } else {
      if (!matchSet) {
        matchSet = [];
        conditionMap.set(currentCondition, matchSet);
      }
      let matchSig = conditionValMap.get(currentCondition);
      if (!matchSig) {
        matchSig = createSignal(currentCondition === currentVal);
        conditionValMap.set(currentCondition, matchSig);
        matchSet.push(matchSig);

        if (currentDisposers) {
          _onDispose(function () {
            conditionValMap.delete(currentCondition);
            if (matchSet!.length === 1) {
              conditionMap.delete(currentCondition);
            } else {
              removeFromArr(matchSet!, matchSig!);
            }
          });
        }
      }
      return matchSig;
    }
  }

  return match;
}

resetTick();

export {
  createSignal,
  isSignal,
  computed,
  $,
  connect,
  bind,
  createTriggerAction,
  derive,
  extract,
  derivedExtract,
  makeReactive,
  tpl,
  not,
  watch,
  peek,
  poke,
  touch,
  read,
  readAll,
  merge,
  write,
  listen,
  scheduleEffect as schedule,
  tick,
  nextTick,
  collectDisposers,
  onCondition,
  onDispose,
  createEffect,
  untrack,
  freeze,
};
