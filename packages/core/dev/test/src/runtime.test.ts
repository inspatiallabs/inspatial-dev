// deno-lint-ignore-file
import {
  expect,
  test,
  runtime,
  TestingError,
  Promisable,
  Runner,
  OptionProp,
} from "./index.ts";
import { format, TestProps } from "./shared.ts";

/*#########################################(Basic Test Runner)#########################################*/
test("test runner is available", () => {
  expect(test).toBeDefined();
  expect(typeof test).toBe("function");
  expect(test.only).toBeDefined();
  expect(test.skip).toBeDefined();
  expect(test.todo).toBeDefined();
});

/*#########################################(Basic Boolean Test (Object Style))#########################################*/
test({
  name: "Boolean Test (Object Style)",
  fn: () => {
    expect(true).toBe(true);
  },
});

/*#########################################(Runtime Detection)#########################################*/
test("runtime detection", () => {
  expect(runtime).toBeOneOf(["deno", "bun", "node", "unknown"]);
});

/*#########################################(Test Execution Modes)#########################################*/
test("normal test mode executes", async () => {
  let wasExecuted = false;

  const testWasExecuted = new Promise<void>((resolve) => {
    const mockTest: Runner = Object.assign(
      async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => {
        const testFn =
          typeof nameOrConfig === "object" ? nameOrConfig.fn : fnOrUndefined!;
        await testFn();
        wasExecuted = true;
        resolve();
      },
      {
        only: async (
          nameOrConfig: string | TestProps,
          fnOrUndefined?: () => Promisable<void>
        ) => {},
        skip: async (
          nameOrConfig: string | TestProps,
          fnOrUndefined?: () => Promisable<void>
        ) => {},
        todo: async (
          nameOrConfig: string | TestProps,
          fnOrUndefined?: () => Promisable<void>
        ) => {},
      }
    );

    mockTest("test", () => {
      expect(true).toBe(true);
    });
  });

  await testWasExecuted;
  expect(wasExecuted).toBe(true);
});

/*#########################################(Test Options Handling)#########################################*/
test("test options are properly handled", () => {
  const options = {
    permissions: { read: true, write: false },
    sanitizeResources: true,
    sanitizeOps: true,
    env: { TEST_ENV: "true" },
  };

  const mockTest: Runner = Object.assign(
    (
      nameOrConfig: string | TestProps,
      fnOrUndefined?: () => Promisable<void>,
      testOptions?: OptionProp
    ) => {
      if (typeof nameOrConfig === "object") {
        expect(nameOrConfig.options).toEqual(options);
      } else {
        expect(testOptions).toEqual(options);
      }
      return Promise.resolve();
    },
    {
      only: (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => Promise.resolve(),
      skip: (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => Promise.resolve(),
      todo: (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => Promise.resolve(),
    }
  );
  return mockTest("test with options", () => {}, options);
});

/*#########################################(Test Name Formatting)#########################################*/
test("test name formatting handles special characters", () => {
  const testNames = [
    "Test with `code`",
    "Test with multiple `code` blocks",
    "Test with *asterisks*",
    "Test with [brackets]",
  ];

  testNames.forEach((name) => {
    expect(name).toBeType("string");
    expect(() => format(name)).not.toThrow();
  });
});

/*#########################################(Async Test Support)#########################################*/
test("async test support with promises", async () => {
  const asyncOperation = () =>
    new Promise<string>((resolve) =>
      setTimeout(() => resolve("completed"), 100)
    );
  const result = await asyncOperation();
  expect(result).toBe("completed");
});

test("async test support with async/await", async () => {
  const asyncOperation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return "completed";
  };
  const result = await asyncOperation();
  expect(result).toBe("completed");
});

/*#########################################(Error Handling)#########################################*/
test("test handles synchronous errors", () => {
  expect(() => {
    throw new TestingError("Sync error");
  }).toThrow(TestingError);
});

/*#########################################(Asynchronous Error Handling)#########################################*/
test("test handles asynchronous errors", async () => {
  const asyncError = () => Promise.reject(new TestingError("Async error"));
  await expect(asyncError()).rejects.toBeInstanceOf(TestingError);
});

/*#########################################(Skip and Todo Functionality)#########################################*/
test.skip("skipped test is properly handled", () => {
  throw new Error("This test should be skipped");
});

test.todo("todo test with implementation", () => {
  // This implementation should not run
  throw new Error("This should not execute");
});

test.todo("todo test without implementation");

/*#########################################(Test Runner State)#########################################*/
test("test runner maintains correct state", () => {
  const testQueue: string[] = [];

  const mockTest: Runner = Object.assign(
    (
      nameOrConfig: string | TestProps,
      fnOrUndefined?: () => Promisable<void>
    ) => {
      if (typeof nameOrConfig === "object") {
        testQueue.push(nameOrConfig.name);
      } else {
        testQueue.push(nameOrConfig);
      }
      return Promise.resolve();
    },
    {
      only: (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => {
        const name =
          typeof nameOrConfig === "object" ? nameOrConfig.name : nameOrConfig;
        testQueue.push(`only: ${name}`);
        return Promise.resolve();
      },
      skip: (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => {
        const name =
          typeof nameOrConfig === "object" ? nameOrConfig.name : nameOrConfig;
        testQueue.push(`skip: ${name}`);
        return Promise.resolve();
      },
      todo: (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => {
        const name =
          typeof nameOrConfig === "object" ? nameOrConfig.name : nameOrConfig;
        testQueue.push(`todo: ${name}`);
        return Promise.resolve();
      },
    }
  );

  mockTest("test1", () => {});
  mockTest.only("test2", () => {});
  mockTest.skip("test3", () => {});
  mockTest.todo("test4");

  expect(testQueue).toEqual([
    "test1",
    "only: test2",
    "skip: test3",
    "todo: test4",
  ]);
});

/*#########################################(Runtime-Specific Features)#########################################*/
if (runtime === "deno") {
  test("deno-specific features", () => {
    // Test Deno-specific functionality
    expect(globalThis.Deno).toBeDefined();
  });
} else if (runtime === "bun") {
  test("bun-specific features", () => {
    // Test Bun-specific functionality
    const globalWithBun = globalThis as typeof globalThis & {
      Bun?: unknown;
    };
    expect(globalWithBun.Bun).toBeDefined();
  });
} else if (runtime === "node") {
  test("node-specific features", () => {
    const globalWithProcess = globalThis as typeof globalThis & {
      process?: {
        versions?: {
          node?: string;
        };
      };
    };
    expect(globalWithProcess.process?.versions?.node).toBeDefined();
  });
}

/*#########################################(Resource Cleanup)#########################################*/
test("test ensures proper resource cleanup", async () => {
  let cleanupCalled = false;
  const cleanup = () => {
    cleanupCalled = true;
  };

  try {
    // Simulate test with cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));
  } finally {
    cleanup();
  }

  expect(cleanupCalled).toBe(true);
});

/*#########################################(Concurrent Test Execution)#########################################*/
test("concurrent test execution is handled properly", async () => {
  const results: number[] = [];
  const concurrentTests = 5;

  const mockTest: Runner = Object.assign(
    async (
      nameOrConfig: string | TestProps,
      fnOrUndefined?: () => Promisable<void>
    ) => {
      if (typeof nameOrConfig === "object") {
        await nameOrConfig.fn();
      } else {
        await fnOrUndefined!();
      }
    },
    {
      only: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => {
        if (typeof nameOrConfig === "object") {
          await nameOrConfig.fn();
        } else {
          await fnOrUndefined!();
        }
      },
      skip: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => {
        if (typeof nameOrConfig === "object") {
          await nameOrConfig.fn();
        } else {
          await fnOrUndefined!();
        }
      },
      todo: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>
      ) => {
        if (typeof nameOrConfig === "object") {
          await nameOrConfig.fn();
        } else {
          await fnOrUndefined?.();
        }
      },
    }
  );

  const runTest = async (index: number) => {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
    results.push(index);
  };

  const testPromises = Array.from({ length: concurrentTests }, (_, i) =>
    mockTest(`concurrent test ${i}`, () => runTest(i))
  );

  await Promise.all(testPromises);

  expect(results.length).toBe(concurrentTests);
  expect(new Set(results).size).toBe(concurrentTests);
});

/*#########################################(Test Reporting)#########################################*/
test("test reporting captures all relevant information", async () => {
  const testReports: Array<{
    name: string;
    status: "pass" | "fail" | "skip";
    duration: number;
    error?: Error;
  }> = [];

  const mockTest: Runner = Object.assign(
    async (
      nameOrConfig: string | TestProps,
      fnOrUndefined?: () => Promisable<void>
    ) => {
      const startTime = performance.now();
      const testName =
        typeof nameOrConfig === "object" ? nameOrConfig.name : nameOrConfig;
      const testFn =
        typeof nameOrConfig === "object" ? nameOrConfig.fn : fnOrUndefined!;

      try {
        await testFn();
        testReports.push({
          name: testName,
          status: "pass",
          duration: performance.now() - startTime,
        });
      } catch (error) {
        testReports.push({
          name: testName,
          status: "fail",
          duration: performance.now() - startTime,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },
    {
      only: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>,
        options?: OptionProp
      ) => {
        const testName =
          typeof nameOrConfig === "object" ? nameOrConfig.name : nameOrConfig;
        testReports.push({
          name: testName,
          status: "pass",
          duration: 0,
        });
      },
      skip: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>,
        options?: OptionProp
      ) => {
        const testName =
          typeof nameOrConfig === "object" ? nameOrConfig.name : nameOrConfig;
        testReports.push({
          name: testName,
          status: "skip",
          duration: 0,
        });
      },
      todo: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>,
        options?: OptionProp
      ) => {
        const testName =
          typeof nameOrConfig === "object" ? nameOrConfig.name : nameOrConfig;
        testReports.push({
          name: testName,
          status: "skip",
          duration: 0,
        });
      },
    }
  );

  // Run various test scenarios
  await mockTest("passing test", () => {
    expect(true).toBe(true);
  });

  await mockTest("failing test", () => {
    expect(true).toBe(false);
  }).catch(() => {}); // Catch error to continue execution

  await mockTest.skip("skipped test", () => {});
  await mockTest.todo("todo test");

  // Verify report contents
  expect(testReports.length).toBe(4);
  expect(testReports.filter((r) => r.status === "pass").length).toBe(1);
  expect(testReports.filter((r) => r.status === "fail").length).toBe(1);
  expect(testReports.filter((r) => r.status === "skip").length).toBe(2);

  // Verify report structure
  testReports.forEach((report) => {
    expect(report).toHaveProperty("name");
    expect(report).toHaveProperty("status");
    expect(report).toHaveProperty("duration");
    if (report.status === "fail") {
      expect(report).toHaveProperty("error");
      expect(report.error).toBeInstanceOf(Error);
    }
  });
});

/*#########################################(Test Environment Setup and Teardown)#########################################*/
test("test environment is properly set up and torn down", async () => {
  const environmentState = {
    setup: false,
    teardown: false,
    testRun: false,
  };

  const mockTest: Runner = Object.assign(
    async (
      nameOrConfig: string | TestProps,
      fnOrUndefined?: () => Promisable<void>
    ) => {
      // Extract test function based on input type
      const testFn =
        typeof nameOrConfig === "object" ? nameOrConfig.fn : fnOrUndefined!;

      // Setup phase
      environmentState.setup = true;

      try {
        await testFn();
        environmentState.testRun = true;
      } finally {
        // Teardown phase
        environmentState.teardown = true;
      }
    },
    {
      only: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>,
        options?: OptionProp
      ) => {
        const testFn =
          typeof nameOrConfig === "object" ? nameOrConfig.fn : fnOrUndefined!;
        environmentState.setup = true;
        try {
          await testFn();
          environmentState.testRun = true;
        } finally {
          environmentState.teardown = true;
        }
      },
      skip: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>,
        options?: OptionProp
      ) => {
        // Skip implementations maintain state tracking for consistency
        environmentState.setup = true;
        environmentState.teardown = true;
      },
      todo: async (
        nameOrConfig: string | TestProps,
        fnOrUndefined?: () => Promisable<void>,
        options?: OptionProp
      ) => {
        // Todo implementations maintain state tracking for consistency
        environmentState.setup = true;
        environmentState.teardown = true;
      },
    }
  );

  await mockTest("environment test", () => {
    expect(environmentState.setup).toBe(true);
    expect(environmentState.teardown).toBe(false);
  });

  expect(environmentState.setup).toBe(true);
  expect(environmentState.testRun).toBe(true);
  expect(environmentState.teardown).toBe(true);
});

// test("test runner prevents memory leaks", async () => {
//   const initialMemory = performance.memory?.usedJSHeapSize;
//   const iterations = 1000;
//   const largeArray = new Array(1000000).fill(0);

//   const mockTest: Runner = Object.assign(
//     async (name: string, fn: () => Promisable<void>) => {
//       await fn();
//     },
//     {
//       only: async () => {},
//       skip: async () => {},
//       todo: async () => {},
//     }
//   );

//   for (let i = 0; i < iterations; i++) {
//     await mockTest(`memory test ${i}`, () => {
//       const tempArray = [...largeArray];
//       expect(tempArray.length).toBe(largeArray.length);
//     });
//   }

//   // Force garbage collection if available
//   if (globalThis.gc) {
//     globalThis.gc();
//   }

//   const finalMemory = performance.memory?.usedJSHeapSize;

//   // Allow for some memory overhead, but ensure it's not growing unbounded
//   if (initialMemory && finalMemory) {
//     const memoryIncrease = finalMemory - initialMemory;
//     const maxAllowedIncrease = 50 * 1024 * 1024; // 50MB
//     expect(memoryIncrease).toBeLessThan(maxAllowedIncrease);
//   }
// });

// Test Reporting and Logging

// Performance Testing
// test("test runner maintains acceptable execution speed", async () => {
//   const startTime = performance.now();
//   const iterations = 1000;

//   const mockTest: Runner = Object.assign(
//     async (name: string, fn: () => Promisable<void>) => {
//       await fn();
//     },
//     {
//       only: async () => {},
//       skip: async () => {},
//       todo: async () => {},
//     }
//   );

//   for (let i = 0; i < iterations; i++) {
//     await mockTest(`performance test ${i}`, () => {
//       expect(true).toBe(true);
//     });
//   }

//   const endTime = performance.now();
//   const averageExecutionTime = (endTime - startTime) / iterations;

//   // Expect each test to execute in less than 1ms on average
//   expect(averageExecutionTime).toBeLessThan(1);
// });

// File System Integration Testing
// test("file system operations are handled correctly", async () => {
//   const testFileName = "test-file.txt";
//   const testContent = "Test content";

//   // Test file writing
//   await Deno.writeTextFile(testFileName, testContent);

//   // Test file reading
//   const readContent = await Deno.readTextFile(testFileName);
//   expect(readContent).toBe(testContent);

//   // Test file deletion
//   await Deno.remove(testFileName);

//   // Verify file was deleted
//   await expect(Deno.stat(testFileName)).rejects.toThrow();
// });

// Concurrent Test Execution

/******TODO: Add more tests for the runtime.ts file. */
// Memory Leak Detection
