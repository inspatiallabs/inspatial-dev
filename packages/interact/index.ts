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
  createEffect,
  computed as $,
  watch,
  isSignal,
  merge as $$,
  untrack,
  nextTick,
  peek,
  write,
  onDispose,
  tpl as t,
} from "./signal-lite/index.ts";
