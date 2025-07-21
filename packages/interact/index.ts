// Set development mode first
if (typeof (globalThis as any).__DEV__ === "undefined") {
  (globalThis as any).__DEV__ = true;
}

// Export core state
export * from "./state/index.ts";

// Export signal core
export * from "./signal-core/index.ts";

// Export signal (lite)
export * from "./signal-lite/index.ts";

// Export trigger system
export * from "./trigger/src/index.ts";
