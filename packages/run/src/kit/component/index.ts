import {
  collectDisposers,
  freeze,
  isSignal,
  type Signal,
  type SignalDisposerFunctionType,
} from "../../signal.ts";
import {
  hotReloadEnabler,
  enableHotReload,
} from "../../hmr/hot-reload/index.ts";
import { removeFromArr, isThenable, isPrimitive } from "../../utils.ts";
import { env } from "../../env/index.ts";
import type { DebugContext } from "../../debug/index.ts";
import { List, If, Fn } from "../control-flow/index.ts";
import { _asyncContainer, Async } from "../control-flow/async/index.ts";
import { _dynContainer, Dynamic } from "../control-flow/dynamic/index.ts";
import { Render, type RenderFunction } from "../control-flow/render/index.ts";

// Type definitions
export type ComponentFunction<P = any> = (props: P, ...children: any[]) => any;
export type ComponentTemplate<P = any> = ComponentFunction<P>;
export type ComponentProps = Record<string, any> & {
  $ref?: Signal<any> | ((instance: any) => void);
};
export type { RenderFunction } from "../control-flow/render/index.ts";

export interface ComponentContext {
  run:
    | ((
        fn: (...args: any[]) => any,
        ...args: any[]
      ) => [any, SignalDisposerFunctionType])
    | null;
  render: RenderFunction | null;
  disposeComponent: SignalDisposerFunctionType | null;
  wrapper: any;
  hasExpose: boolean;
  self: any;
}

export const KEY_CTX: symbol = Symbol(env.isProduction() ? "" : "K_Ctx");

let currentCtx: ComponentContext | null = null;

// Global debug context (set by renderer)
let globalDebugCtx: DebugContext | null = null;

export function setComponentDebugContext(ctx: DebugContext | null): void {
  globalDebugCtx = ctx;
}

function _captureComponentd<T extends any[], R>(
  this: (...args: T) => R,
  captureComponentdCtx: ComponentContext | null,
  ...args: T
): R {
  const prevCtx = currentCtx;
  currentCtx = captureComponentdCtx;

  try {
    return this(...args);
  } finally {
    currentCtx = prevCtx;
  }
}

export function captureComponent<T extends any[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  return _captureComponentd.bind(freeze(fn), currentCtx) as any;
}

function _runInSnapshot<T extends any[], R>(
  fn: (...args: T) => R,
  ...args: T
): R {
  return fn(...args);
}

export function snapshotComponent(): <T extends any[], R>(
  fn: (...args: T) => R,
  ...args: T
) => R {
  return captureComponent(_runInSnapshot);
}

function exposeComponentReducer(
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

export function exposeComponent(kvObj: Record<string, any>): void {
  if (!currentCtx || isPrimitive(kvObj)) {
    return;
  }

  const entries = Object.entries(kvObj);
  if (entries.length) {
    currentCtx.hasExpose = true;

    const descriptors = entries.reduce(exposeComponentReducer, {});

    Object.defineProperties(currentCtx.self, descriptors);

    if (currentCtx.wrapper) {
      Object.defineProperties(currentCtx.wrapper, descriptors);
    }
  }
}

export function disposeComponent(instance: any): void {
  const ctx = instance[KEY_CTX] as ComponentContext | undefined;
  if (!ctx) {
    return;
  }

  ctx.disposeComponent!();
}

export function getCurrentSelf(): any {
  return currentCtx?.self;
}

export function getCurrentRun(): ComponentContext["run"] | null {
  return currentCtx?.run ?? null;
}

export class Component {
  constructor(
    tpl: ComponentTemplate,
    props?: ComponentProps,
    ...children: any[]
  ) {
    const ctx: ComponentContext = {
      run: null,
      render: null,
      disposeComponent: null,
      wrapper: null,
      hasExpose: false,
      self: this,
    };
    
    // Track component mounting
    const componentName = typeof tpl === 'function' ? tpl.name || 'Anonymous' : String(tpl);
    globalDebugCtx?.trackComponent('mount', componentName);

    const prevCtx = currentCtx;
    currentCtx = ctx;

    const disposeComponentrs: SignalDisposerFunctionType[] = [];

    ctx.run = captureComponent(function (
      fn: (...args: any[]) => any,
      ...args: any[]
    ) {
      let result: any;
      const cleanup = collectDisposers(
        [],
        function () {
          result = fn(...args);
        },
        function (batch?: boolean) {
          if (!batch) {
            removeFromArr(disposeComponentrs, cleanup);
          }
        }
      );
      disposeComponentrs.push(cleanup);
      return [result, cleanup];
    });

    try {
      ctx.disposeComponent = collectDisposers(
        disposeComponentrs,
        function () {
          let renderFn = tpl(props, ...children);
          if (isThenable(renderFn)) {
            const { fallback, catch: catchErr, ..._props } = props || {};
            renderFn = _asyncContainer.call(
              renderFn as Promise<any>,
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
      for (let i of disposeComponentrs) i(true);
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

const emptyProp: ComponentProps = { $ref: undefined };

export const createComponent = (function () {
  function createComponentRaw(
    tpl: ComponentTemplate,
    props?: ComponentProps,
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
        ($ref as Signal).value = component; // Fixed: was 'node' but should be 'component'
      } else if (typeof $ref === "function") {
        $ref(component);
      } else if (!env.isProduction()) {
        throw new Error(`Invalid $ref type: ${typeof $ref}`);
      }
    }
    return component;
  }

  if (hotReloadEnabler) {
    const builtins = new Set<Function>([
      Fn,
      List,
      If,
      Dynamic,
      Async,
      Render,
      Component,
    ]);

    const makeDyn = (tpl: Function, handleErr?: Function): any => {
      return _dynContainer.bind(tpl as any, "Dynamic", handleErr, tpl);
    };

    return enableHotReload({
      builtins,
      makeDyn,
      Component,
      createComponentRaw,
    });
  }

  return createComponentRaw;
})();
