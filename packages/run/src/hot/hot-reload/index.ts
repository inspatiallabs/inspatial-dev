import { createSignal } from "../../signal.ts";
import { isPrimitive } from "../../utils.ts";
import { env } from "../../env/index.ts";

// Hot module replacement interfaces for type safety
interface HotModuleReplacement {
  accept(): void;
  dispose(callback: (data: any) => void): void;
  invalidate?(reason: string): void;
  data?: any;
}

interface ExtendedImportMeta {
  hot?: HotModuleReplacement;
  webpackHot?: any;
}

export const hotReloadEnabler =
  !env.isProduction() &&
  !!(/* @inspatial webpack */ (import.meta as ExtendedImportMeta).hot);

export const KEY_HOTWRAP = Symbol("K_HOTWRAP");
export const KEY_HOTWRAPPED = Symbol("K_HOTWARPPED");

const toString = Object.prototype.toString;

interface HotReloadOptions {
  builtins: Set<Function>;
  makeDyn: (fn: Function, errorHandler: Function) => any;
  Component: new (...args: any[]) => any;
  createComponentRaw: (tpl: any, props?: any, ...children: any[]) => any;
}

interface HotModuleData {
  [KEY_HOTWRAP]?: any;
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
  [KEY_HOTWRAP]?: any;
  [KEY_HOTWRAPPED]?: boolean;
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
  (wrapped as WrappedFunction)[KEY_HOTWRAPPED] = true;
  return wrapped;
}

function wrapComponent(fn: Function): any {
  const wrapped = createSignal(fn as any, createHotReloader) as any;
  Object.defineProperty(fn, KEY_HOTWRAP, {
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
  // Use the global debug instance for HOT logging
  const globalDebug = (globalThis as any).debug;
  if (globalDebug?.info) {
    globalDebug.info("hot", "InSpatial Hot Reload enabled");
  } else {
    console.info("InSpatial Hot Reload enabled.");
  }
  return function (tpl: any, props?: any, ...children: any[]): any {
    let hotLevel = 0;

    if (typeof tpl === "function" && !builtins.has(tpl)) {
      const wrappedFn = tpl as WrappedFunction;
      if (wrappedFn[KEY_HOTWRAP]) {
        tpl = wrappedFn[KEY_HOTWRAP];
        hotLevel = 2;
      } else if (!wrappedFn[KEY_HOTWRAPPED]) {
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
      let wrapped = (origVal as WrappedFunction)[KEY_HOTWRAP];
      if (wrapped) {
        wrapped.hot = true;
      } else {
        wrapped = wrapComponent(origVal as Function);
      }
      if (typeof newVal === "function") {
        Object.defineProperty(newVal, KEY_HOTWRAP, {
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
  data[KEY_HOTWRAP] = this;
}

export function setup({
  data,
  current,
  accept,
  dispose,
  invalidate,
}: SetupOptions): void {
  if (data?.[KEY_HOTWRAP]) {
    update.call(data[KEY_HOTWRAP], current, invalidate);
  }
  dispose(onDispose.bind(current));
  accept();
}
