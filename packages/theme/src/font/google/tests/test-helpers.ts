/**
 * # Google Font Test Helpers
 * @summary #### Common test helper functions for Google Font tests
 *
 * This file contains helper functions and mock implementations
 * shared across Google Font test suites.
 *
 * @since 0.1.2
 * @category InSpatial Theme
 * @module @inspatial/theme/font
 * @kind test
 * @access private
 */

// Import mock adapter to create proper mock functions with correct types
// @ts-ignore: Allow importing .ts files in Deno
import { createMockFunction } from "./mock-adapter.ts";

// Create common mock functions with proper types
export const mockReadTextFile = createMockFunction();
export const mockWriteTextFile = createMockFunction();
export const mockCopyFile = createMockFunction();
export const mockRemove = createMockFunction();
export const mockExists = createMockFunction();
export const mockExit = createMockFunction();

// Export mockConsoleLog for tests to access
export const mockConsoleLog = createMockFunction();
export const mockConsoleError = createMockFunction();

/**
 * Sets up common mocks for console output and file operations
 * @param options Custom implementation options
 * @returns A cleanup function that restores original console methods
 */
export function setupMocks(options: {
  mockExists?: (path: string) => Promise<boolean>;
} = {}) {
  // Original console functions
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  // Setup console mocks
  console.log = mockConsoleLog;
  console.error = mockConsoleError;
  
  // Setup custom implementation for mockExists if provided
  if (options.mockExists) {
    mockExists.mockImplementation(options.mockExists);
  } else {
    // Default implementation
    mockExists.mockImplementation(() => Promise.resolve(false));
  }
  
  // Setup default implementations for other mocks
  mockReadTextFile.mockImplementation(() => Promise.resolve("{}"));
  mockWriteTextFile.mockImplementation(() => Promise.resolve());
  mockCopyFile.mockImplementation(() => Promise.resolve());
  mockRemove.mockImplementation(() => Promise.resolve());
  mockExit.mockImplementation(() => { throw new Error("Exit called"); });
  
  // Return cleanup function
  return () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  };
} 