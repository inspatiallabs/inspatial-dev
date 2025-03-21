// @ts-nocheck
/*
 * Tests for the InSpatial Type performance utilities
 */
import { expect, test } from "../../../../../core/dev/test/src/index.ts";

import {
  type,
  InTypePerformance,
  memoizeTypeValidation,
  runTypeBenchmark,
  compareTypeBenchmarks,
  InTypeBenchmarkResult
} from "../index.ts";

// Helper to reset the performance singleton between tests
function resetPerformanceInstance() {
  // Access the private instance and reset it
  // This is a bit hacky, but necessary for testing a singleton
  const instance = InTypePerformance['instance'];
  if (instance) {
    // Clear the cache
    instance['cache'] = new Map();
  }
}

test("Performance System - singleton initialization", () => {
  resetPerformanceInstance();
  
  const instance1 = InTypePerformance.init();
  const instance2 = InTypePerformance.init();
  
  // Should return the same instance
  expect(instance1).toBe(instance2);
  
  // Should be an instance of InTypePerformance
  expect(instance1).toBeInstanceOf(InTypePerformance);
});

test("Performance System - memoize validator results", () => {
  resetPerformanceInstance();
  
  const performance = InTypePerformance.init();
  
  // Create a test validation function that will be memoized
  const stringValidator = "string";
  
  // Initial validation (should cache result)
  const result1 = performance.memoize(stringValidator, "hello");
  expect(result1).toBe("hello");
  
  // Repeat validation (should use cached result)
  const result2 = performance.memoize(stringValidator, "hello");
  expect(result2).toBe("hello");
  
  // Different value (should not use cached result)
  const result3 = performance.memoize(stringValidator, "world");
  expect(result3).toBe("world");
  
  // Invalid value (should cache error result)
  const result4 = performance.memoize(stringValidator, 123);
  expect(result4).not.toBe(123);
  
  // Repeat invalid value (should use cached error result)
  const result5 = performance.memoize(stringValidator, 123);
  expect(result5).toEqual(result4);
});

test("Performance System - clearCache clears all cache entries", () => {
  resetPerformanceInstance();
  
  const performance = InTypePerformance.init();
  
  // Add some cache entries
  performance.memoize("string", "hello");
  performance.memoize("number", 42);
  
  // Get initial cache stats
  const initialStats = performance.getCacheStats();
  expect(initialStats.validators).toBeGreaterThan(0);
  expect(initialStats.totalEntries).toBeGreaterThan(0);
  
  // Clear the cache
  performance.clearCache();
  
  // Get updated cache stats
  const updatedStats = performance.getCacheStats();
  expect(updatedStats.validators).toBe(0);
  expect(updatedStats.totalEntries).toBe(0);
});

test("Performance System - clearCache with specific validator", () => {
  resetPerformanceInstance();
  
  const performance = InTypePerformance.init();
  
  // Add some cache entries
  performance.memoize("string", "hello");
  performance.memoize("number", 42);
  
  // Get initial cache stats
  const initialStats = performance.getCacheStats();
  expect(initialStats.validators).toBe(2);
  
  // Clear only the string validator cache
  performance.clearCache("string");
  
  // Get updated cache stats
  const updatedStats = performance.getCacheStats();
  expect(updatedStats.validators).toBe(1); // Only number validator remains
});

test("Performance System - getCacheStats returns correct stats", () => {
  resetPerformanceInstance();
  
  const performance = InTypePerformance.init();
  
  // Initial stats should be empty
  const emptyStats = performance.getCacheStats();
  expect(emptyStats.validators).toBe(0);
  expect(emptyStats.totalEntries).toBe(0);
  
  // Add some cache entries
  performance.memoize("string", "hello");
  performance.memoize("string", "world");
  performance.memoize("number", 42);
  
  // Get updated stats
  const stats = performance.getCacheStats();
  expect(stats.validators).toBe(2); // string and number
  expect(stats.totalEntries).toBe(3); // 2 string entries + 1 number entry
});

test("Performance System - benchmark measures function execution time", () => {
  resetPerformanceInstance();
  
  const performance = InTypePerformance.init();
  
  // Create a simple test function
  const fn = () => {
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += i;
    }
    return sum;
  };
  
  // Run the benchmark
  const result = performance.benchmark("test-benchmark", fn, 10);
  
  // Check result structure
  expect(result).toBeDefined();
  expect(result.name).toBe("test-benchmark");
  expect(result.iterations).toBe(10);
  expect(typeof result.totalTime).toBe("number");
  expect(typeof result.avgTime).toBe("number");
  expect(typeof result.opsPerSecond).toBe("number");
  
  // Times should be positive
  expect(result.totalTime).toBeGreaterThan(0);
  expect(result.avgTime).toBeGreaterThan(0);
  expect(result.opsPerSecond).toBeGreaterThan(0);
});

test("Performance System - compare benchmarks different implementations", () => {
  resetPerformanceInstance();
  
  const performance = InTypePerformance.init();
  
  // Create test functions with different performance characteristics
  const fastFn = () => {
    let sum = 0;
    for (let i = 0; i < 100; i++) {
      sum += i;
    }
    return sum;
  };
  
  const slowFn = () => {
    let sum = 0;
    for (let i = 0; i < 10000; i++) {
      sum += i;
    }
    return sum;
  };
  
  // Compare the functions
  const results = performance.compare({
    fast: fastFn,
    slow: slowFn
  }, 5);
  
  // Check result structure
  expect(Array.isArray(results)).toBe(true);
  expect(results.length).toBe(2);
  
  // Results should be sorted by performance (fastest first)
  expect(results[0].name).toBe("fast");
  expect(results[1].name).toBe("slow");
  
  // Check that the fast function is actually faster
  expect(results[0].avgTime).toBeLessThan(results[1].avgTime);
});

test("Performance System - getFastest returns the fastest implementation", () => {
  resetPerformanceInstance();
  
  const performance = InTypePerformance.init();
  
  // Create test functions with different performance characteristics
  const implementations = {
    fast: () => {
      let sum = 0;
      for (let i = 0; i < 100; i++) {
        sum += i;
      }
      return sum;
    },
    medium: () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    },
    slow: () => {
      let sum = 0;
      for (let i = 0; i < 10000; i++) {
        sum += i;
      }
      return sum;
    }
  };
  
  // Get the fastest implementation
  const fastest = performance.getFastest(implementations, 5);
  
  // Check result structure
  expect(fastest).toBeDefined();
  expect(fastest.name).toBe("fast");
  expect(fastest.fn).toBe(implementations.fast);
  expect(fastest.result).toBeDefined();
  expect(fastest.result.name).toBe("fast");
});

test("Performance System - memoizeTypeValidation helper function", () => {
  // Reset the instance to ensure clean slate
  resetPerformanceInstance();
  
  // Use the helper function
  const result1 = memoizeTypeValidation("string", "hello");
  expect(result1).toBe("hello");
  
  // Should use cached result
  const result2 = memoizeTypeValidation("string", "hello");
  expect(result2).toBe("hello");
  
  // Check cache stats
  const stats = InTypePerformance.init().getCacheStats();
  expect(stats.validators).toBe(1);
  expect(stats.totalEntries).toBe(1);
});

test("Performance System - runTypeBenchmark helper function", () => {
  resetPerformanceInstance();
  
  // Simple function to benchmark
  const fn = () => {
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += i;
    }
    return sum;
  };
  
  // Run the benchmark
  const result = runTypeBenchmark("test-benchmark", fn, 10);
  
  // Check result structure
  expect(result).toBeDefined();
  expect(result.name).toBe("test-benchmark");
  expect(result.iterations).toBe(10);
  expect(typeof result.totalTime).toBe("number");
  expect(typeof result.avgTime).toBe("number");
  expect(typeof result.opsPerSecond).toBe("number");
});

test("Performance System - compareTypeBenchmarks helper function", () => {
  resetPerformanceInstance();
  
  // Create test functions
  const implementations = {
    fast: () => {
      let sum = 0;
      for (let i = 0; i < 100; i++) {
        sum += i;
      }
      return sum;
    },
    slow: () => {
      let sum = 0;
      for (let i = 0; i < 10000; i++) {
        sum += i;
      }
      return sum;
    }
  };
  
  // Compare implementations
  const results = compareTypeBenchmarks(implementations, 5);
  
  // Check result structure
  expect(Array.isArray(results)).toBe(true);
  expect(results.length).toBe(2);
  
  // Results should be sorted by performance (fastest first)
  expect(results[0].name).toBe("fast");
  expect(results[1].name).toBe("slow");
});

test("Performance System - benchmark with complex validation", () => {
  resetPerformanceInstance();
  
  // Create a complex object validator
  const ComplexObjectType = type({
    name: "string",
    age: "number",
    email: "string",
    address: {
      street: "string",
      city: "string",
      zipCode: "string"
    },
    tags: "string[]"
  });
  
  // Create a valid test object
  const validObject = {
    name: "Ben Emma",
    age: 24,
    email: "ben@inspatiallabs.com",
    address: {
      street: "B3N Avenue",
      city: "Media City",
      zipCode: "12345"
    },
    tags: ["developer", "javascript", "typescript"]
  };
  
  // Benchmark direct validation vs memoized validation
  const directValidation = () => {
    return ComplexObjectType(validObject);
  };
  
  const memoizedValidation = () => {
    return memoizeTypeValidation(ComplexObjectType, validObject);
  };
  
  // Compare both approaches - just make sure they run successfully
  const directResult = directValidation();
  const memoizedResult = memoizedValidation();
  
  // Both approaches should validate the object
  expect(directResult).toBeTruthy();
  expect(memoizedResult).toBeTruthy();
  
  // Validate they both return a similar shape by checking some properties
  expect(directResult.name).toBe(validObject.name);
  expect(memoizedResult.name).toBe(validObject.name);
  
  // Run benchmarks separately to avoid timing issues
  const nonMemoizedTime = runTypeBenchmark("nonMemoized", directValidation, 1);
  expect(nonMemoizedTime).toBeTruthy();
  
  // First memoized call (should perform validation)
  memoizeTypeValidation(ComplexObjectType, validObject);
  
  // Second memoized call (should use cache)
  const memoizedTime = runTypeBenchmark("memoized", () => {
    return memoizeTypeValidation(ComplexObjectType, validObject);
  }, 1);
  expect(memoizedTime).toBeTruthy();
  
  // We don't need to compare timing in tests as it's not reliable across environments
  // Just ensure both benchmarks ran successfully
}); 