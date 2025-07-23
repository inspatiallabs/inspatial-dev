// import { createSignal, type Signal } from "@in/teract/signal-lite";
// import { isProduction, isPrimitive } from "../constant/index.ts";
// import type { Component } from "../kit/component/index.ts";
// import type { AnyFunction } from "../kit/type.ts";

// /*#################################(Types)#################################*/

// /** Extend ImportMeta to include hot property */
// declare global {
//   interface ImportMeta {
//     hot?: {
//       accept?: () => void;
//       dispose?: (callback: (data: any) => void) => void;
//       invalidate?: (reason: string) => void;
//     };
//   }
// }

// /** HMR wrapper symbol key */
// export const KEY_HMRWRAP = Symbol("K_HMRWRAP");

// /** HMR wrapped symbol key */
// export const KEY_HMRWRAPPED = Symbol("K_HMRWARPPED");

// /** Hot module replacement enabled flag */
// export const hotEnabled =
//   !isProduction && !!(/* @InSpatial webpack */ import.meta.hot);

// /** Function with HMR wrapper property */
// interface HMRFunction {
//   (...args: any[]): any;
//   [KEY_HMRWRAP]?: HMRSignal;
//   [KEY_HMRWRAPPED]?: boolean;
//   name?: string;
//   bind?: Function["bind"];
// }

// /** HMR Signal with additional properties */
// interface HMRSignal extends Signal<AnyFunction> {
//   name?: string;
//   hot?: boolean;
// }

// /** Error context for HMR error handling */
// interface ErrorContext {
//   name: string;
//   hot: boolean;
// }

// /** HMR configuration options */
// interface HMRConfig {
//   builtins: WeakSet<AnyFunction>;
//   makeDyn: (template: any, handleError: AnyFunction) => AnyFunction;
//   Component: typeof Component;
//   createComponentRaw: (
//     template: any,
//     props?: any,
//     ...children: any[]
//   ) => Component;
// }

// /** HMR module update data */
// interface HMRModuleData {
//   [KEY_HMRWRAP]?: any;
//   [key: string]: any;
// }

// /** HMR setup parameters */
// interface HMRSetupParams {
//   data: HMRModuleData;
//   current: any;
//   accept: () => void;
//   dispose: (callback: (data: any) => void) => void;
//   invalidate: (reason: string) => void;
// }

// /** Component creation function type */
// type CreateComponentFunction = (
//   template: any,
//   props?: any,
//   ...children: any[]
// ) => Component;

// /*#################################(Utilities)#################################*/

// const toString = Object.prototype.toString;

// function compareVal(origVal: any, newVal: any): boolean {
//   return (
//     toString.call(origVal) !== toString.call(newVal) ||
//     String(origVal) !== String(newVal)
//   );
// }

// function makeHMR(fn: AnyFunction): HMRFunction {
//   if (typeof fn !== "function") {
//     return fn;
//   }
//   const wrapped = fn.bind(null) as HMRFunction;
//   wrapped[KEY_HMRWRAPPED] = true;
//   return wrapped;
// }

// function wrapComponent(fn: HMRFunction): HMRSignal {
//   const wrapped = createSignal(fn, makeHMR) as HMRSignal;
//   Object.defineProperty(fn, KEY_HMRWRAP, {
//     value: wrapped,
//     enumerable: false,
//   });
//   wrapped.name = fn.name;
//   wrapped.hot = false;
//   return wrapped;
// }

// function handleError(err: any, _: any, { name, hot }: ErrorContext): void {
//   if (hot) {
//     console.error(
//       `[InSpatial HMR] Error happened when rendering <${name}>:\n`,
//       err
//     );
//   } else {
//     throw err;
//   }
// }

// /*#################################(HMR Core)#################################*/

// export function enableHMR({
//   builtins,
//   makeDyn,
//   Component,
//   createComponentRaw,
// }: HMRConfig): CreateComponentFunction {
//   console.info("InSpatial Ran Hot Module Replacement.");
//   return function (tpl: any, props?: any, ...children: any[]): Component {
//     let hotLevel = 0;

//     if (typeof tpl === "function" && !builtins.has(tpl)) {
//       const hmrTpl = tpl as HMRFunction;
//       if (hmrTpl[KEY_HMRWRAP]) {
//         tpl = hmrTpl[KEY_HMRWRAP];
//         hotLevel = 2;
//       } else if (!hmrTpl[KEY_HMRWRAPPED]) {
//         tpl = wrapComponent(hmrTpl);
//         hotLevel = 1;
//       }
//     }

//     if (hotLevel) {
//       return new Component(makeDyn(tpl, handleError), props ?? {}, ...children);
//     }

//     return createComponentRaw(tpl, props, ...children);
//   };
// }

// async function update(
//   this: any,
//   newModule: any,
//   invalidate: (reason: string) => void
// ): Promise<void> {
//   newModule = await newModule;
//   if (!newModule) {
//     return;
//   }
//   const oldModule = Object.entries(await this);
//   for (let [key, origVal] of oldModule) {
//     const newVal = newModule[key];

//     if (
//       typeof origVal === "function" &&
//       typeof newVal === "function" &&
//       (key === "default" || key[0].toUpperCase() === key[0])
//     ) {
//       const origFunc = origVal as HMRFunction;
//       let wrapped = origFunc[KEY_HMRWRAP];
//       if (wrapped) {
//         (wrapped as HMRSignal).hot = true;
//       } else {
//         wrapped = wrapComponent(origFunc);
//       }
//       if (typeof newVal === "function") {
//         Object.defineProperty(newVal, KEY_HMRWRAP, {
//           value: wrapped,
//           enumerable: false,
//         });
//       }
//       wrapped.value = newVal;
//     } else {
//       let invalid = false;

//       if ((isPrimitive(origVal) || isPrimitive(newVal)) && origVal !== newVal) {
//         invalid = true;
//       } else {
//         invalid = compareVal(origVal, newVal);
//         if (!invalid) {
//           console.warn(
//             `[InSpatial HMR] Export "${key}" does not seem to have changed. Refresh the page manually if neessary.`
//           );
//         }
//       }

//       if (invalid) {
//         invalidate(`[InSpatial HMR] Non HMR-able export "${key}" changed.`);
//       }
//     }
//   }
// }

// function onDispose(this: any, data: HMRModuleData): void {
//   data[KEY_HMRWRAP] = this;
// }

// export function setup({
//   data,
//   current,
//   accept,
//   dispose,
//   invalidate,
// }: HMRSetupParams): void {
//   if (data?.[KEY_HMRWRAP]) {
//     update.call(data[KEY_HMRWRAP], current, invalidate);
//   }
//   dispose(onDispose.bind(current));
//   accept();
// }
