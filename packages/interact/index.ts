// Set development mode first
if (typeof (globalThis as any).__DEV__ === "undefined") {
  (globalThis as any).__DEV__ = true;
}

// Export signal core
export * from "./signal-core/index.ts";

// Export signal lite
export * from "./signal-lite/index.ts";

