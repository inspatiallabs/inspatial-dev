import { createSignal } from "../../signal.ts";
import { isPrimitive } from "../../utils.js";
import { env } from "../../env/index.ts";

// Extend ImportMeta interface to include hot property
declare global {
  interface ImportMeta {
    hot?: {
      accept(): void;
      dispose(callback: (data: any) => void): void;
      invalidate?(reason: string): void;
      data?: any;
    };
    webpackHot?: any;
  }
}

export const hotReloadEnabler =
  !env.isProduction() && !!(/* @inspatial webpack */ (import.meta as any).hot);

export const KEY_HMRWRAP = Symbol("K_HMRWRAP");
export const KEY_HMRWRAPPED = Symbol("K_HMRWARPPED");

const toString = Object.prototype.toString;

interface HotReloadOptions {
  builtins: Set<Function>;
  makeDyn: (fn: Function, errorHandler: Function) => any;
  Component: new (...args: any[]) => any;
  createComponentRaw: (tpl: any, props?: any, ...children: any[]) => any;
}

interface HotModuleData {
  [KEY_HMRWRAP]?: any;
}

interface HotModule {
  data?: HotModuleData;
  accept(): void;
  dispose(callback: (data: HotModuleData) => void): void;
  invalidate?(reason: string): void;
}

interface SetupOptions {
  data?: HotModuleData;
  current: Promise<any>;
  accept(): void;
  dispose(callback: (data: HotModuleData) => void): void;
  invalidate(reason: string): void;
}

interface WrappedFunction extends Function {
  [KEY_HMRWRAP]?: any;
  [KEY_HMRWRAPPED]?: boolean;
  hot?: boolean;
  value?: Function;
}

function compareVal(origVal: any, newVal: any): boolean {
  return (
    toString.call(origVal) !== toString.call(newVal) ||
    String(origVal) !== String(newVal)
  );
}

function createHotReloader(fn: any): any {
  if (typeof fn !== "function") {
    return fn;
  }
  const wrapped = fn.bind(null);
  (wrapped as WrappedFunction)[KEY_HMRWRAPPED] = true;
  return wrapped;
}

function wrapComponent(fn: Function): any {
  const wrapped = createSignal(fn, createHotReloader) as any;
  Object.defineProperty(fn, KEY_HMRWRAP, {
    value: wrapped,
    enumerable: false,
  });
  wrapped.name = fn.name;
  wrapped.hot = false;
  return wrapped;
}

function handleError(
  err: Error,
  _: any,
  { name, hot }: { name: string; hot: boolean }
): void {
  if (hot) {
    console.error(`[InSpatial]: Error while rendering <${name}>:\n `, err);
  } else {
    throw err;
  }
}

export function enableHotReload({
  builtins,
  makeDyn,
  Component,
  createComponentRaw,
}: HotReloadOptions) {
  // Use the global debug instance for HMR logging
  const globalDebug = (globalThis as any).debug;
  if (globalDebug?.info) {
    globalDebug.info('hmr', "InSpatial Hot Reload enabled");
  } else {
    console.info("InSpatial Hot Reload enabled.");
  }
  return function (tpl: any, props?: any, ...children: any[]): any {
    let hotLevel = 0;

    if (typeof tpl === "function" && !builtins.has(tpl)) {
      const wrappedFn = tpl as WrappedFunction;
      if (wrappedFn[KEY_HMRWRAP]) {
        tpl = wrappedFn[KEY_HMRWRAP];
        hotLevel = 2;
      } else if (!wrappedFn[KEY_HMRWRAPPED]) {
        tpl = wrapComponent(tpl);
        hotLevel = 1;
      }
    }

    if (hotLevel) {
      return new Component(makeDyn(tpl, handleError), props ?? {}, ...children);
    }

    return createComponentRaw(tpl, props, ...children);
  };
}

async function update(
  this: any,
  newModule: Promise<any>,
  invalidate: (reason: string) => void
): Promise<void> {
  const resolvedNewModule = await newModule;
  if (!resolvedNewModule) {
    return;
  }
  const oldModule = Object.entries(await this);
  for (let [key, origVal] of oldModule) {
    const newVal = resolvedNewModule[key];

    if (
      typeof origVal === "function" &&
      typeof newVal === "function" &&
      (key === "default" || key[0].toUpperCase() === key[0])
    ) {
      let wrapped = (origVal as WrappedFunction)[KEY_HMRWRAP];
      if (wrapped) {
        wrapped.hot = true;
      } else {
        wrapped = wrapComponent(origVal as Function);
      }
      if (typeof newVal === "function") {
        Object.defineProperty(newVal, KEY_HMRWRAP, {
          value: wrapped,
          enumerable: false,
        });
      }
      wrapped.value = newVal;
    } else {
      let invalid = false;

      if ((isPrimitive(origVal) || isPrimitive(newVal)) && origVal !== newVal) {
        invalid = true;
      } else {
        invalid = compareVal(origVal, newVal);
        if (!invalid) {
          console.warn(
            `[InSpatial]: Export "${key}" does not seem to have changed. Refresh the page manually if neessary.`
          );
        }
      }

      if (invalid) {
        invalidate(`[InSpatial]: Non Hot Reload export "${key}" changed.`);
      }
    }
  }
}

function onDispose(this: any, data: HotModuleData): void {
  data[KEY_HMRWRAP] = this;
}

export function setup({
  data,
  current,
  accept,
  dispose,
  invalidate,
}: SetupOptions): void {
  if (data?.[KEY_HMRWRAP]) {
    update.call(data[KEY_HMRWRAP], current, invalidate);
  }
  dispose(onDispose.bind(current));
  accept();
}
