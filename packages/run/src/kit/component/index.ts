import { collectDisposers, isSignal } from "@in/teract/signal-lite";
// import { hotEnabled, enableHMR } from "../../hmr/index.ts";
import {
  isProduction,
  removeFromArr,
  isThenable,
  isPrimitive,
} from "../../constant/index.ts";
import type { AnyFunction, Dispose } from "../type.ts";
import { Render } from "../control-flow/render/index.ts";
import { Fn } from "../control-flow/fn/index.ts";
import { For } from "../control-flow/for/index.ts";
import { If } from "../control-flow/if/index.ts";
import { _dynContainer, Dynamic } from "../control-flow/dynamic/index.ts";
import { _asyncContainer, Async } from "../control-flow/async/index.ts";

/*#################################(Types)#################################*/
export interface Context {
  run: <T extends AnyFunction>(
    fn: T,
    ...args: Parameters<T>
  ) => [ReturnType<T>, Dispose];
  render: any;
  dispose: Dispose;
  wrapper: any;
  hasExpose: boolean;
  self: any;
}

export interface ComponentInstance {
  [KEY_CTX]?: Context;
}

/*#################################(Constants)#################################*/
export const KEY_CTX: symbol = Symbol(isProduction ? "" : "K_Ctx");
export let currentCtx: Context | null = null;

/*#################################(Capture)#################################*/
function _captured<T extends AnyFunction>(
  this: T,
  capturedCtx: Context | null,
  ...args: Parameters<T>
): ReturnType<T> {
  const prevCtx = currentCtx;
  currentCtx = capturedCtx;

  try {
    return this(...args);
  } finally {
    currentCtx = prevCtx;
  }
}

/*#################################(Snapshot)#################################*/
export function capture<T extends AnyFunction>(fn: T): T {
  return ((...args: Parameters<T>) => {
    return _captured.call(fn, currentCtx, ...args);
  }) as T;
}

export function _runInSnapshot<T extends AnyFunction>(
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> {
  return fn(...args);
}

export function snapshot<T extends AnyFunction>(fn: T): T {
  return capture(fn);
}

/*#################################(Expose)#################################*/
function exposeReducer(
  descriptors: PropertyDescriptorMap,
  [key, value]: [string, any]
): PropertyDescriptorMap {
  if (isSignal(value)) {
    descriptors[key] = {
      get: value.get.bind(value),
      set: value.set.bind(value),
      enumerable: true,
      configurable: true,
    };
  } else {
    descriptors[key] = {
      value,
      enumerable: true,
      configurable: true,
    };
  }

  return descriptors;
}

export function expose(kvObj: Record<string, any>): void {
  if (!currentCtx || isPrimitive(kvObj)) {
    return;
  }

  const entries = Object.entries(kvObj);
  if (entries.length) {
    currentCtx.hasExpose = true;

    const descriptors = entries.reduce(exposeReducer, {});

    Object.defineProperties(currentCtx.self, descriptors);

    if (currentCtx.wrapper) {
      Object.defineProperties(currentCtx.wrapper, descriptors);
    }
  }
}

export function dispose(instance: ComponentInstance): void {
  const ctx = instance[KEY_CTX];
  if (!ctx) {
    return;
  }

  ctx.dispose();
}

export function getCurrentSelf(): any {
  return currentCtx?.self;
}

/*#################################(Component)#################################*/
export class Component implements ComponentInstance {
  [KEY_CTX]?: Context;

  constructor(
    tpl: AnyFunction,
    props: Record<string, any>,
    ...children: any[]
  ) {
    const ctx: Context = {
      run: null as any,
      render: null,
      dispose: null as any,
      wrapper: null,
      hasExpose: false,
      self: this,
    };

    const prevCtx = currentCtx;
    currentCtx = ctx;

    const disposers: Dispose[] = [];

    ctx.run = capture(function <T extends AnyFunction>(
      fn: T,
      ...args: Parameters<T>
    ): [ReturnType<T>, Dispose] {
      let result: ReturnType<T>;
      const cleanup = collectDisposers(
        [],
        function () {
          result = fn(...args);
        },
        function (batch?: boolean) {
          if (!batch) {
            removeFromArr(disposers, cleanup);
          }
        }
      );
      disposers.push(cleanup);
      return [result!, cleanup];
    });

    try {
      ctx.dispose = collectDisposers(
        disposers,
        function () {
          let renderFn = tpl(props, ...children);
          if (isThenable(renderFn)) {
            const { fallback, catch: catchErr, ..._props } = props;
            renderFn = _asyncContainer.call(
              renderFn,
              "Future",
              fallback,
              catchErr,
              _props,
              ...children
            );
          }
          ctx.render = renderFn;
        },
        () => {
          Object.defineProperty(this, KEY_CTX, {
            value: null,
            enumerable: false,
          });
        }
      );
    } catch (error) {
      for (let i of disposers) i(true);
      throw error;
    } finally {
      currentCtx = prevCtx;
    }

    Object.defineProperty(this, KEY_CTX, {
      value: ctx,
      enumerable: false,
      configurable: true,
    });
  }
}

const emptyProp = { $ref: null };

export const createComponent = (function () {
  function createComponentRaw(
    tpl: any,
    props?: Record<string, any>,
    ...children: any[]
  ): Component {
    if (isSignal(tpl)) {
      return new Component(
        _dynContainer.bind(tpl, "Signal", null, null),
        props ?? {},
        ...children
      );
    }
    const { $ref, ..._props } = props ?? emptyProp;
    const component = new Component(tpl, _props, ...children);
    if ($ref) {
      if (isSignal($ref)) {
        $ref.value = component;
      } else if (typeof $ref === "function") {
        $ref(component);
      } else if (!isProduction) {
        throw new Error(`Invalid $ref type: ${typeof $ref}`);
      }
    }
    return component;
  }

  // if (hotEnabled) {
  //   const builtins = new WeakSet([
  //     Fn,
  //     For,
  //     If,
  //     Dynamic,
  //     Async,
  //     Render,
  //     Component,
  //   ]);
  //   // deno-lint-ignore no-inner-declarations
  //   function makeDyn(tpl: any, handleErr: any) {
  //     return _dynContainer.bind(tpl, "Dynamic", handleErr, tpl);
  //   }
  //   return enableHMR({ builtins, makeDyn, Component, createComponentRaw });
  // }

  return createComponentRaw;
})();
