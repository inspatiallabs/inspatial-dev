/**
 * # Mock Function Adapter
 * @summary #### Provides mock function capabilities with TypeScript support
 *
 * @since 0.1.2
 * @category InSpatial Theme
 * @module @inspatial/theme/font
 * @kind test
 * @access private
 */

/**
 * Structure for tracking function calls
 */
export interface MockCall {
  args: any[];
}

/**
 * Interface for mock functions with implementation and call tracking
 */
export interface MockFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mock: {
    calls: MockCall[];
    results: Array<{ value: ReturnType<T> }>;
    mockImplementation: (fn: T) => MockFunction<T>;
  };
}

/**
 * Simplified MockFn alternative to @inspatial/test.mockFn 
 */
export function createMockFunction<
  T extends (...args: any[]) => any
>(): MockFunction<T> {
  let implementation: T | undefined;
  const calls: MockCall[] = [];
  const results: Array<{ value: ReturnType<T> }> = [];

  // Create the function with the correct type
  const mockFn = function (...args: Parameters<T>): ReturnType<T> {
    calls.push({ args });

    let result;
    if (implementation) {
      result = implementation(...args);
    }

    results.push({ value: result as ReturnType<T> });
    return result as ReturnType<T>;
  } as MockFunction<T>;

  // Add mock property for tracking
  mockFn.mock = {
    calls,
    results,
    mockImplementation: (fn: T): MockFunction<T> => {
      implementation = fn;
      return mockFn;
    },
  };

  // Add implementation setter directly on the function
  mockFn.mockImplementation = (fn: T): MockFunction<T> => {
    implementation = fn;
    return mockFn;
  };

  return mockFn;
}

/**
 * Create a set of mock functions for testing
 * @param fns List of function names to mock
 * @returns An object containing all mock functions
 */
export function createMocks<T extends string>(
  fns: T[]
): Record<T, MockFunction<any>> {
  return fns.reduce((acc, name) => {
    acc[name] = createMockFunction();
    return acc;
  }, {} as Record<T, MockFunction<any>>);
}
