// Declare global __DEV__ variable for TypeScript
declare global {
  var __DEV__: boolean;
}

// Set development mode first - make it available globally
if (typeof (globalThis as any).__DEV__ === "undefined") {
  (globalThis as any).__DEV__ = true;
}

// Import modules for namespaced exports
import * as SignalCore from "./signal-core/index.ts";
import * as SignalLite from "./signal-lite/index.ts";

// Export namespaced modules so users can choose which implementation to use
export { SignalCore, SignalLite };


// Signal Lite as the default signal implementation and starting point
export {
  createSignal,
  computed,
  watch,
  isSignal,
  merge,
  untrack,
  nextTick,
  peek,
  write,
  onDispose,
  createEffect
} from "./signal-lite/index.ts";

