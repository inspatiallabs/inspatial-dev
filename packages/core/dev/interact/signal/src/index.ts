/**
 * This is the main entry point for the InSpatial state module.
 * 
 * This file exports all the public APIs from the signal package
 */

// Core exports
export {
  ComputationClass,
  ContextNotFoundErrorClass,
  NoOwnerErrorClass,
  NotReadyErrorClass,
  OwnerClass,
  QueueClass,
  flatten,
  flushSync,
  getContext,
  setContext,
  hasContext,
  createContext,
  createBoundary,
  createSuspense,
  getOwner,
  onCleanup,
  getObserver,
  isEqual,
  untrack,
  hasUpdated,
  isPending,
  latest,
  catchError,
  runWithObserver,
  SUPPORTS_PROXY
} from "./core/index.ts";

// Type exports
export type {
  ErrorHandlerType,
  SignalOptionsType,
  ContextType,
  ContextRecordType,
  DisposableType,
  IQueueType
} from "./core/index.ts";

// Export signals functionality
export { mapArray, repeat, type Maybe } from "./map.ts";
export * from "./signals.ts";

// Export store functionality
export * from "./store/index.ts";

// // --------------------------------------------------------------------------------------
// // TEST UTILITIES – Add missing matchers for the older @inspatial/test versions
// // --------------------------------------------------------------------------------------

// // Some of our internal tests rely on custom Jest-style matchers (e.g. `toThrowError`,
// // `toBeTypeOf`). Older versions of `@inspatial/test` may not expose these helpers. To keep
// // the production bundle lean **and** make the test-suite pass, we patch them in only when
// // running inside a test environment (inference: global `Deno` object is available).

// if (typeof globalThis !== "undefined" && (globalThis as any).expect) {
//   const _expect: any = (globalThis as any).expect;

//   // Quick helper to register a matcher if it doesn't already exist.
//   const ensureMatcher = (
//     name: string,
//     matcher: (...args: any[]) => { pass: boolean; message: () => string }
//   ) => {
//     if (typeof _expect[name] !== "function" && typeof _expect.extend === "function") {
//       _expect.extend({ [name]: matcher });
//     }
//   };

//   // `toThrowError` – verifies that the supplied function throws.
//   ensureMatcher("toThrowError", function (context: any, ...matcherArgs: any[]) {
//     // Delegate to built-in `toThrow` if it exists, otherwise inline minimal logic.
//     if (typeof (context as any).toThrow === "function") {
//       // Re-use existing matcher for consistency.
//       return (context as any).toThrow(...matcherArgs);
//     }

//     const valueUnderTest = context.value;
//     let pass = false;
//     try {
//       if (typeof valueUnderTest === "function") {
//         valueUnderTest();
//       }
//     } catch (_err) {
//       pass = true;
//     }
//     return {
//       pass: context.isNot ? !pass : pass,
//       message: () =>
//         context.isNot
//           ? pass
//             ? "Expected function not to throw, but it did."
//             : "Expected function not to throw and it didn't."
//           : pass
//           ? "Function threw as expected."
//           : "Expected function to throw, but it didn't.",
//     };
//   });

//   // `toBeTypeOf` – alias for existing `toBeType` matcher (if present).
//   ensureMatcher("toBeTypeOf", function (context: any, expectedType: string) {
//     if (typeof (context as any).toBeType === "function") {
//       return (context as any).toBeType(expectedType);
//     }
//     const actualType = typeof context.value;
//     const pass = actualType === expectedType;
//     return {
//       pass: context.isNot ? !pass : pass,
//       message: () =>
//         context.isNot
//           ? pass
//             ? `Expected value NOT to be of type ${expectedType}`
//             : `Value is not of type ${expectedType} as expected`
//           : pass
//           ? `Value is of type ${expectedType}`
//           : `Expected type ${expectedType} but got ${actualType}`,
//     };
//   });

//   (globalThis as any).expect.toThrowError ??= function (context: any, ...matcherArgs: any[]) {
//     // Delegate to built-in `toThrow` if it exists, otherwise inline minimal logic.
//     if (typeof (context as any).toThrow === "function") {
//       // Re-use existing matcher for consistency.
//       return (context as any).toThrow(...matcherArgs);
//     }

//     const valueUnderTest = context.value;
//     let pass = false;
//     try {
//       if (typeof valueUnderTest === "function") {
//         valueUnderTest();
//       }
//     } catch (_err) {
//       pass = true;
//     }
//     return {
//       pass: context.isNot ? !pass : pass,
//       message: () =>
//         context.isNot
//           ? pass
//             ? "Expected function not to throw, but it did."
//             : "Expected function not to throw and it didn't."
//           : pass
//           ? "Function threw as expected."
//           : "Expected function to throw, but it didn't.",
//     };
//   };

//   (globalThis as any).expect.toBeTypeOf ??= function (context: any, expectedType: string) {
//     if (typeof (context as any).toBeType === "function") {
//       return (context as any).toBeType(expectedType);
//     }
//     const actualType = typeof context.value;
//     const pass = actualType === expectedType;
//     return {
//       pass: context.isNot ? !pass : pass,
//       message: () =>
//         context.isNot
//           ? pass
//             ? `Expected value NOT to be of type ${expectedType}`
//             : `Value is not of type ${expectedType} as expected`
//           : pass
//           ? `Value is of type ${expectedType}`
//           : `Expected type ${expectedType} but got ${actualType}`,
//     };
//   };
// }
