// Imports
import type { OptionProp, Promisable, Runner, TestProps } from "./shared.ts";
import { format } from "./shared.ts";
import { noop } from "./noop.ts";
let node: any = null;

/*#########################################(RUNTIME)#########################################*/

/**
 * InSpatial Test can run in different environments, which are like different places where your code can execute.
 *
 * InSpatial supports the following environments:
 *
 * 1. **Deno**: A modern runtime for JavaScript and TypeScript, similar to Node.js, but with some differences.
 * 2. **Bun**: A fast JavaScript runtime that aims to be a drop-in replacement for Node.js.
 * 3. **Node.js**: A popular runtime that allows you to run JavaScript on the server side.
 *
 * Depending on where you run your tests, the code will automatically detect the environment and use the appropriate tools.
 * This makes it flexible and easy to use in different setups.
 *  InSpatial gives you two ways to check if your code is working correctly:
 *
 */
let runtime = "unknown";

if ((globalThis as any).Deno) {
  runtime = "deno";
} else if ((globalThis as any).Bun) {
  runtime = "bun";
} else if ((globalThis as any).process?.versions?.node) {
  runtime = "node";
  node = import("node:test");
}

export { runtime };

/*#########################################(DENO)#########################################*/
/** Deno test */
export function createDenoTest(): Runner {
  const test = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: nameOrConfig.fn,
          ...nameOrConfig.options,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: fnOrUndefined!,
        ...options,
      })
    );
  };

  test.only = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: nameOrConfig.fn,
          ...nameOrConfig.options,
          only: true,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: fnOrUndefined!,
        ...options,
        only: true,
      })
    );
  };

  test.skip = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: nameOrConfig.fn,
          ...nameOrConfig.options,
          ignore: true,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: fnOrUndefined!,
        ...options,
        ignore: true,
      })
    );
  };

  test.todo = (
    nameOrConfig: string | TestProps,
    _fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    const todoFn = () => Promise.resolve();
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: todoFn,
          ...nameOrConfig.options,
          ...options,
          ignore: true,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: todoFn,
        ...options,
        ignore: true,
      })
    );
  };

  return test;
}

export const denoTest = createDenoTest();
/*#########################################(BUN)#########################################*/
// deno-lint-ignore no-explicit-any
const bun = (globalThis as any).Bun;

/** Bun test runner. */
export function createBunTest(): Runner {
  const test = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun
          .jest(caller())
          .test(
            format(nameOrConfig.name),
            nameOrConfig.fn,
            nameOrConfig.options
          )
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test(format(nameOrConfig), fnOrUndefined!, options)
    );
  };

  test.only = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun
          .jest(caller())
          .test.only(format(nameOrConfig.name), nameOrConfig.fn, {
            ...nameOrConfig.options,
            only: true,
          })
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test.only(format(nameOrConfig), fnOrUndefined!, {
        ...options,
        only: true,
      })
    );
  };

  test.skip = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun
          .jest(caller())
          .test.skip(format(nameOrConfig.name), nameOrConfig.fn, {
            ...nameOrConfig.options,
            skip: true,
          })
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test.skip(format(nameOrConfig), fnOrUndefined!, {
        ...options,
        skip: true,
      })
    );
  };

  test.todo = (
    nameOrConfig: string | TestProps,
    _fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    const todoFn = () => Promise.resolve();
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun.jest(caller()).test.todo(format(nameOrConfig.name), todoFn, {
          ...nameOrConfig.options,
          ...options,
          todo: true,
        })
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test.todo(format(nameOrConfig), todoFn, {
        ...options,
        todo: true,
      })
    );
  };

  return test;
}

export const bunTest = createBunTest();

/** Retrieve caller test file. */
function caller() {
  const Trace = Error as unknown as {
    prepareStackTrace: (error: Error, stack: CallSite[]) => unknown;
  };
  const _ = Trace.prepareStackTrace;
  Trace.prepareStackTrace = (_, stack) => stack;
  const { stack } = new Error();
  Trace.prepareStackTrace = _;
  const caller = (stack as unknown as CallSite[])[2];
  return caller.getFileName().replaceAll("\\", "/");
}

/** V8 CallSite (subset). */
type CallSite = { getFileName: () => string };

/*#########################################(NODE)#########################################*/

/** Node test runner. */
export function createNodeTest(): Runner {
  const test = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      // Converts test function to Node's expected format
      const testFn = (_t: any) => nameOrConfig.fn();
      return Promise.resolve(node.test(format(nameOrConfig.name), testFn));
    }
    // Converts test function to Node's expected format
    const testFn = (_t: any) => fnOrUndefined!();
    return Promise.resolve(node.test(format(nameOrConfig), testFn));
  };

  test.only = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      const testFn = (_t: any) => nameOrConfig.fn();
      return Promise.resolve(node.test.only(format(nameOrConfig.name), testFn));
    }
    const testFn = (_t: any) => fnOrUndefined!();
    return Promise.resolve(node.test.only(format(nameOrConfig), testFn));
  };

  test.skip = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      const testFn = (_t: any) => nameOrConfig.fn();
      return Promise.resolve(node.test.skip(format(nameOrConfig.name), testFn));
    }
    const testFn = (_t: any) => fnOrUndefined!();
    return Promise.resolve(node.test.skip(format(nameOrConfig), testFn));
  };

  test.todo = (
    nameOrConfig: string | TestProps,
    _fnOrUndefined?: () => Promisable<void>,
    _options?: OptionProp
  ): Promise<void> => {
    const todoFn = (_t: any) => Promise.resolve();
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(node.test.todo(format(nameOrConfig.name), todoFn));
    }
    return Promise.resolve(node.test.todo(format(nameOrConfig), todoFn));
  };

  return test;
}

export const nodeTest = createNodeTest();

/*#########################################(TESTING)#########################################*/

export type testing = any;

/** TestingError can be used to test expected error behaviours in tests. */
export class TestingError extends Error {}

/** Throws back an error (can be used where statements are not allowed in syntax). */
export function throws(error: Error | string): never {
  if (typeof error === "string") {
    error = new TestingError(error);
  }
  throw error;
}

/**
 *
 * # InSpatial Test
 *
 * A universal testing framework that works seamlessly across Deno,
 * Node.js, and Bun runtimes. Write tests once, run them anywhere - from
 * mobile to desktop, and 3D/spatial environments!
 *
 * ## Key Features
 *
 * ### Core Testing Features
 * - 🌍 Cross-platform support (Deno, Node.js, Bun)
 * - 📝 Multiple test syntax styles (Function and Object)
 * - 🎯 Support for both `assert` and `expect` assertions
 * - ⚡ Async/await support out of the box
 * - 🎨 Beautiful test output with syntax highlighting
 * - 🔄 Runtime auto-detection
 * - 🔒 Type-safe with full TypeScript support
 *
 * ### XR and Spatial Testing
 * - 🎮 XR (AR/VR/MR) Testing Support
 * - 🌐 3D Environment Testing
 * - 🎨 Visual Regression Testing for 3D
 * - 📊 Spatial Computing Metrics
 *
 * ### Advanced Testing Tools
 * - 🧪 Test Doubles (Mocks, Stubs, Spies)
 * - 🤖 AI-Powered CI/CD Test Agent
 * - 🧩 BDD (Behavior Driven Development)
 * - 📸 Snapshot Testing
 * - 📈 Benchmarking
 *
 * ## Getting Started
 *
 * Import the test tools you need:
 * ```ts
 * import { test, expect, assert } from "@inspatial/test";
 * ```
 *
 * ## Writing Tests
 *
 * ### Object Style (Recommended)
 * ```ts
 * test({
 *   name: "3D object transformation",
 *   fn: async () => {
 *     const cube = await create3DObject("cube");
 *     cube.rotate(45, "y");
 *
 *     expect(cube.rotation.y).toBe(45);
 *     expect(cube.isVisible).toBe(true);
 *   },
 *   options: {
 *     environment: "xr",
 *     visualRegression: true
 *   }
 * });
 * ```
 *
 * ### Function Style
 * ```ts
 * test("AR marker detection", async () => {
 *   const marker = await scanARMarker();
 *   expect(marker.confidence).toBeGreaterThan(0.9);
 * });
 * ```
 *
 * ## Two Ways to Test (Expect & Assert)
 *
 * ### 1. Using Expect (Recommended)
 * Reads like natural language:
 * ```ts
 * test({
 *   name: "check number properties",
 *   fn: () => {
 *     const number = 5;
 *     expect(number).toBe(5);
 *     expect(number).toBeGreaterThan(3);
 *     expect(number).toBeLessThan(10);
 *   }
 * });
 * ```
 *
 * ### 2. Using Assert
 * More direct statements:
 * ```ts
 * test({
 *   name: "check number properties",
 *   fn: () => {
 *     const number = 5;
 *     assertEquals(number, 5);
 *     assertGreater(number, 3);
 *     assertLess(number, 10);
 *   }
 * });
 * ```
 *
 * ## Advanced Features
 *
 * ### XR Testing
 * ```ts
 * test({
 *   name: "VR interaction test",
 *   fn: async () => {
 *     const controller = await getVRController();
 *     await controller.triggerPress();
 *
 *     expect(virtualObject.wasGrabbed).toBe(true);
 *     await expect(scene).toMatchSpatialSnapshot();
 *   },
 *   options: {
 *     xrMode: "VR",
 *     spatialTracking: true
 *   }
 * });
 * ```
 *
 * ### Visual Regression Testing
 * ```ts
 * test({
 *   name: "3D model appearance",
 *   fn: async () => {
 *     const model = await load3DModel("character.glb");
 *     await expect(model).toMatchVisualSnapshot({
 *       threshold: 0.1,
 *       angles: ["front", "side", "top"]
 *     });
 *   }
 * });
 * ```
 *
 * ### BDD Style Testing
 * ```ts
 * describe("VR Environment", () => {
 *   it("should handle user interactions", async () => {
 *     given("a virtual button")
 *       .when("user presses the button")
 *       .then("the action should trigger");
 *   });
 * });
 * ```
 *
 * ### Test Modifiers
 * ```ts
 * // Focus on specific tests
 * test.only("critical XR feature", () => {
 *   // Only this test will run
 * });
 *
 * // Skip tests
 * test.skip("not ready yet", () => {
 *   // This test will be skipped
 * });
 *
 * // Mark as todo
 * test.todo("implement hand tracking tests");
 * ```
 *
 * ## Configuration Options
 *
 * ```ts
 * test({
 *   name: "complex XR scenario",
 *   fn: async () => {
 *     // Test code
 *   },
 *   options: {
 *     // XR specific options
 *     xrMode: "AR" | "VR" | "MR",
 *     spatialTracking: true,
 *     visualRegression: {
 *       threshold: 0.1,
 *       ignoreAreas: ["background"]
 *     },
 *
 *     // General options
 *     timeout: 10000,
 *     permissions: {
 *       xr: true,
 *       camera: true,
 *       sensors: true
 *     },
 *
 *     // Resource management
 *     sanitizeResources: true,
 *     sanitizeOps: false
 *   }
 * });
 * ```
 *
 * ##### NOTE: Environment Support
 * The test runner automatically detects your runtime environment and available
 * XR capabilities, adjusting its behavior accordingly.
 *
 * ##### NOTE: Visual Testing
 * Visual regression tests for 3D content consider multiple angles and can be
 * configured with different comparison thresholds.
 *
 * ##### Terminology: XR Testing
 * - **Spatial Tracking**: Monitoring position and orientation in 3D space
 * - **Visual Regression**: Comparing 3D scenes visually across changes
 * - **XR Modes**: Different extended reality environments (AR/VR/MR)
 *
 * ## Additional Tools
 *
 * - {@link module:expect|Expect API}: Natural language assertions
 * - {@link module:assert|Assert API}: Direct assertions
 * - {@link module:xr|XR Testing}: Extended reality testing tools
 * - {@link module:spatial|Spatial Testing}: 3D environment testing
 * - {@link module:visual|Visual Testing}: Visual regression tools
 * - {@link module:bdd|BDD}: Behavior-driven development support
 *
 * @example
 * // Complete XR test example
 * test({
 *   name: "full XR interaction flow",
 *   fn: async () => {
 *     const world = await createXRWorld();
 *     const user = await simulateXRUser();
 *
 *     await user.grab(world.getObject("cube"));
 *     await user.move({ x: 1, y: 0, z: 0 });
 *     await user.release();
 *
 *     expect(world.getObject("cube").position.x).toBe(1);
 *     await expect(world).toMatchSpatialSnapshot();
 *   },
 *   options: {
 *     xrMode: "VR",
 *     spatialTracking: true,
 *     visualRegression: true
 *   }
 * });
 *
 * @see {@link TestProps} for complete configuration options
 * @see {@link XROptions} for XR-specific options
 * @module
 */
let test = noop as Runner;
switch (runtime) {
  case "deno":
    test = denoTest;
    break;
  case "bun":
    test = bunTest;
    break;
  case "node":
    test = nodeTest;
    break;
}

export { test };
