// Define the global variables
declare global {
  var __DEV__: boolean | undefined;
  var __TEST__: boolean | undefined;
}

// Always define __DEV__ as true
globalThis.__DEV__ = true;

// Define __TEST__ if it's not already defined
if (typeof globalThis.__TEST__ === "undefined") {
  globalThis.__TEST__ = true;
}

export {};
