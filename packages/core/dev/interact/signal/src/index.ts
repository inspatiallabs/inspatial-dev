/**
 * This is the main entry point for the Interact - (InSpatial State x Trigger) module.
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
  SUPPORTS_PROXY,
} from "./core/index.ts";

// Type exports
export type {
  ErrorHandlerType,
  SignalOptionsType,
  ContextType,
  ContextRecordType,
  DisposableType,
  IQueueType,
} from "./core/index.ts";

// Export core store functionality
export { reconcile } from "./reconcile.ts";
export { mapArray, repeat, type Maybe } from "./map.ts";
export * from "./create-signal.ts";
export * from "./create-resource.ts";
export * from "./create-effect.ts";
export * from "./create-memo.ts";
export * from "./create-error-boundary.ts";
export * from "./create-async.ts";
export * from "./create-render-effect.ts";
export * from "./create-root.ts";
export { createProjection } from "./create-projection.ts";
export {
  unwrap,
  isWrappable,
  createStore,
  $RAW,
  $TRACK,
  $PROXY,
  $TARGET,
  type StoreType,
  type StoreSetterType,
  type StoreNodeType,
} from "./create-store.ts";
export { merge, omit, type Merge, type Omit } from "./utils.ts";

