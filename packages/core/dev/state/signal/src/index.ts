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
