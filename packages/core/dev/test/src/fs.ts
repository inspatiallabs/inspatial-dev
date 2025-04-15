/**
 * # Filesystem Mocking
 * @summary #### Tools for mocking file system operations in tests
 *
 * This module provides utilities for mocking Deno's file system operations
 * in tests, allowing for controlled testing of file operations without actual
 * file system access.
 *
 * @since 0.1.2
 * @category InSpatial Test
 * @module @inspatial/test/fs
 * @kind utilities
 * @access public
 */

import { mockFn } from "./mock/index.ts";

/**
 * Collection of mock file system functions
 */
export interface FsMocks {
  /** Mock for Deno.readTextFile */
  readTextFile: ReturnType<typeof mockFn>;
  /** Mock for Deno.writeTextFile */
  writeTextFile: ReturnType<typeof mockFn>;
  /** Mock for Deno.copyFile */
  copyFile: ReturnType<typeof mockFn>;
  /** Mock for Deno.remove */
  remove: ReturnType<typeof mockFn>;
  /** Mock for Deno.exists */
  exists: ReturnType<typeof mockFn>;
  /** Mock for Deno.exit */
  exit: ReturnType<typeof mockFn>;
  /** Restore original console functions */
  restore(): void;
}

/**
 * Options for file system mocking
 */
export interface FsMockOptions {
  /** Custom implementation for exists function */
  mockExists?: (path: string) => Promise<boolean>;
  /** Virtual file system content keyed by path */
  virtualFiles?: Record<string, string>;
}

/**
 * Collection of mock console functions
 */
export interface ConsoleMocks {
  /** Mock for console.log */
  log: ReturnType<typeof mockFn>;
  /** Mock for console.error */
  error: ReturnType<typeof mockFn>;
  /** Restore original console functions */
  restore(): void;
}

// Define RemoveOptions interface to match Deno.RemoveOptions
interface RemoveOptions {
  recursive?: boolean;
}

// Define minimal TypeScript interface for Deno namespace
interface DenoNamespace {
  readTextFile?: (path: string) => Promise<string>;
  writeTextFile?: (path: string, data: string) => Promise<void>;
  copyFile?: (from: string, to: string) => Promise<void>;
  remove?: (path: string, options?: RemoveOptions) => Promise<void>;
  exists?: (path: string) => Promise<boolean>;
  exit?: (code?: number) => never;
}

/**
 * Sets up mocks for Deno's file system functions
 *
 * @example
 * ```ts
 * import { setupFsMocks } from "@inspatial/test/fs";
 *
 * const mocks = setupFsMocks({
 *   virtualFiles: {
 *     "/path/to/file.json": '{"key": "value"}'
 *   }
 * });
 *
 * // Test code that uses Deno.readTextFile, etc.
 *
 * // Verify calls
 * assertEquals(mocks.readTextFile.calls.length, 1);
 *
 * // Clean up
 * mocks.restore();
 * ```
 *
 * @param options Options for configuring file system mocks
 * @returns Object containing mock functions and a restore function
 */
export function setupFsMocks(options: FsMockOptions = {}): FsMocks {
  // Save original methods if they exist in global context
  let originalFunctions: Record<string, any> = {};

  try {
    const deno = (globalThis as any).Deno as DenoNamespace;
    if (typeof deno !== "undefined") {
      originalFunctions = {
        readTextFile: deno.readTextFile,
        writeTextFile: deno.writeTextFile,
        copyFile: deno.copyFile,
        remove: deno.remove,
        exists: deno.exists,
        exit: deno.exit,
      };
    }
  } catch {
    // Deno namespace might not be available
  }

  // Create mocks for file operations
  const virtualFiles = options.virtualFiles || {};

  const readTextFileSpy = mockFn(async (path: string) => {
    if (virtualFiles[path]) {
      return virtualFiles[path];
    }
    // Return empty JSON if file doesn't exist in virtual filesystem
    return "{}";
  });

  const writeTextFileSpy = mockFn(async (path: string, content: string) => {
    if (typeof virtualFiles === "object") {
      virtualFiles[path] = content;
    }
    return Promise.resolve();
  });

  const copyFileSpy = mockFn(async (from: string, to: string) => {
    if (typeof virtualFiles === "object" && virtualFiles[from]) {
      virtualFiles[to] = virtualFiles[from];
    }
    return Promise.resolve();
  });

  const removeSpy = mockFn(async (path: string) => {
    if (typeof virtualFiles === "object" && path in virtualFiles) {
      delete virtualFiles[path];
    }
    return Promise.resolve();
  });

  const existsSpy = mockFn(
    options.mockExists ||
      ((path: string) =>
        Promise.resolve(
          typeof virtualFiles === "object" && path in virtualFiles
        ))
  );

  const exitSpy = mockFn(() => {
    throw new Error("Exit called");
  });

  // Replace global Deno functions with our spies if available
  try {
    const deno = (globalThis as any).Deno as DenoNamespace;
    if (typeof deno !== "undefined") {
      Object.defineProperties(deno, {
        readTextFile: {
          value: readTextFileSpy,
          configurable: true,
          writable: true,
        },
        writeTextFile: {
          value: writeTextFileSpy,
          configurable: true,
          writable: true,
        },
        copyFile: { value: copyFileSpy, configurable: true, writable: true },
        remove: { value: removeSpy, configurable: true, writable: true },
        exists: { value: existsSpy, configurable: true, writable: true },
        exit: { value: exitSpy, configurable: true, writable: true },
      });
    }
  } catch {
    // Can't replace in some environments
  }

  // Return both the spies and a restore function
  return {
    readTextFile: readTextFileSpy,
    writeTextFile: writeTextFileSpy,
    copyFile: copyFileSpy,
    remove: removeSpy,
    exists: existsSpy,
    exit: exitSpy,
    restore: () => {
      try {
        const deno = (globalThis as any).Deno as DenoNamespace;
        if (
          typeof deno !== "undefined" &&
          Object.keys(originalFunctions).length
        ) {
          Object.defineProperties(deno, {
            readTextFile: {
              value: originalFunctions.readTextFile,
              configurable: true,
              writable: true,
            },
            writeTextFile: {
              value: originalFunctions.writeTextFile,
              configurable: true,
              writable: true,
            },
            copyFile: {
              value: originalFunctions.copyFile,
              configurable: true,
              writable: true,
            },
            remove: {
              value: originalFunctions.remove,
              configurable: true,
              writable: true,
            },
            exists: {
              value: originalFunctions.exists,
              configurable: true,
              writable: true,
            },
            exit: {
              value: originalFunctions.exit,
              configurable: true,
              writable: true,
            },
          });
        }
      } catch {
        // Can't restore in some environments
      }
    },
  };
}

/**
 * Sets up mocks for console functions
 *
 * @example
 * ```ts
 * import { setupConsoleMocks } from "@inspatial/test/fs";
 *
 * const consoleMocks = setupConsoleMocks();
 *
 * // Test code that uses console.log, etc.
 * console.log("Test message");
 *
 * // Verify calls
 * assertEquals(consoleMocks.log.calls.length, 1);
 * assertEquals(consoleMocks.log.calls[0].args[0], "Test message");
 *
 * // Clean up
 * consoleMocks.restore();
 * ```
 *
 * @returns Object containing mock console functions and a restore function
 */
export function setupConsoleMocks(): ConsoleMocks {
  // Save original console methods
  const originalLog = console.log;
  const originalError = console.error;

  // Create mocks for console methods
  const logSpy = mockFn((...args: any[]): void => {
    // Implement a simple console log that does nothing but tracks calls
  });

  const errorSpy = mockFn((...args: any[]): void => {
    // Implement a simple console error that does nothing but tracks calls
  });

  // Replace console methods with our spies
  console.log = logSpy as typeof console.log;
  console.error = errorSpy as typeof console.error;

  // Return both the spies and a restore function
  return {
    log: logSpy as typeof console.log,
    error: errorSpy as typeof console.error,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
    },
  };
}

/**
 * Combined setup for both file system and console mocks
 *
 * @example
 * ```ts
 * import { setupMocks } from "@inspatial/test/fs";
 *
 * const mocks = setupMocks();
 *
 * // Test code that uses Deno.readTextFile and console.log
 *
 * // Verify calls
 * assertEquals(mocks.fs.readTextFile.calls.length, 1);
 * assertEquals(mocks.console.log.calls.length, 1);
 *
 * // Clean up
 * mocks.restore();
 * ```
 *
 * @param options Options for configuring the mocks
 * @returns Object containing both file system and console mocks with a combined restore function
 */
export function setupMocks(options: FsMockOptions = {}): {
  fs: FsMocks;
  console: ConsoleMocks;
  restore: () => void;
} {
  const fsMocks = setupFsMocks(options);
  const consoleMocks = setupConsoleMocks();

  return {
    fs: fsMocks,
    console: consoleMocks,
    restore: () => {
      fsMocks.restore();
      consoleMocks.restore();
    },
  };
}
