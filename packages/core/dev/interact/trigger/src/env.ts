export const __DEV__ = typeof Deno !== "undefined"
  ? (Deno.env.get("NODE_ENV") ?? "development") !== "production"
  : true;

// Inject into global scope so it is accessible without imports
// deno-lint-ignore no-explicit-any
(globalThis as any).__DEV__ = __DEV__; 