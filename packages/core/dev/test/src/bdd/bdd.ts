/**
 * # Behavior-Driven Development (BDD)
 * @summary A human-friendly way to write tests that anyone can understand
 *
 * This module helps you write tests that read like plain English specifications,
 * making collaboration between developers, testers, and non-technical stakeholders easier.
 *
 * @since 0.1.0
 * @category InSpatial Test
 * @module @inspatial/test/bdd
 * @kind module
 * @access public
 *
 * ### 💡 What BDD Really Is
 *
 * BDD is about **communication and understanding** first, code second. It's a way to:
 *
 * - Write tests that even non-developers can read and validate
 * - Focus on *behavior* from the user's perspective
 * - Create living documentation that explains how your system works
 * - Encourage collaboration across different team roles
 *
 * > [!NOTE]
 * > BDD is a mindset, not a syntax. The functions in this module support the BDD approach,
 * > but true BDD happens in how you think about and write your tests, not which functions you use.
 *
 * ### 📚 Core Functions
 *
 * - **describe()**: Creates a group of related tests
 * - **it()**: Defines a single test case (what your code should do) it does the same thing as `test()`
 * - **beforeEach()**, **afterEach()**, etc.: Helpers for test setup and cleanup
 *
 * ### 🔄 BDD vs Traditional Testing
 *
 * | BDD Style | Traditional Style | When to Choose BDD |
 * |-----------|-------------------|-------------------|
 * | `describe("Calculator", () => { it("should add numbers", () => {}) })` | `test("Calculator adds numbers", () => {})` | When clarity and readability matter most |
 * | Nested organization | Flat organization | For complex features with many scenarios |
 * | Reads like specifications | Reads like test functions | When non-developers need to understand tests |
 * | Natural language descriptions | Technical descriptions | When tests serve as documentation |
 *
 * ### 🎮 Basic Usage
 *
 * ```typescript
 * import { describe, it, expect } from "@inspatial/test";
 *
 * // A group of related tests
 * describe("Shopping Cart", () => {
 *   // A specific behavior the code should have
 *   it("should calculate the total price correctly", () => {
 *     const cart = { items: [{ price: 10 }, { price: 5 }] };
 *     const total = cart.items.reduce((sum, item) => sum + item.price, 0);
 *     expect(total).toBe(15);
 *   });
 * });
 * ```
 *
 * ### 💫 BDD Philosophy
 *
 * > "The primary value of tests is not finding bugs but serving as living documentation."
 *
 * BDD tests should:
 *
 * - **Describe behavior** not implementation details
 * - Start with "**should**" to focus on expected outcomes
 * - Be **readable** by anyone, even without coding knowledge
 * - Serve as **specifications** that came before the code
 * - Foster **collaboration** between different roles
 *
 * ### 📝 Using Given-When-Then Pattern
 *
 * A powerful way to structure your tests is with the Given-When-Then pattern:
 *
 * ```typescript
 * import { test, expect } from "@inspatial/test";
 *
 * test("Shopping cart should calculate total correctly", () => {
 *   // Given a shopping cart with items
 *   const cart = new ShoppingCart();
 *   cart.addItem({ name: "Book", price: 10 });
 *   cart.addItem({ name: "Pen", price: 2 });
 *
 *   // When we calculate the total
 *   const total = cart.getTotal();
 *
 *   // Then it should equal the sum of item prices
 *   expect(total).toBe(12);
 * });
 * ```
 *
 * ### 🧩 Using Hooks for Setup and Teardown
 *
 * ```typescript
 * import { describe, it, beforeEach, afterAll, expect } from "@inspatial/test";
 * import { InSpatialORM } from "@inspatial/orm";
 *
 * describe("User database", () => {
 *   let orm;
 *
 *   // Runs before each test
 *   beforeEach(() => {
 *     orm = new InSpatialORM({
 *       db: new InSpatialDB({
 *         connection: {
 *           // connection details
 *         }
 *       })
 *     });
 *   });
 *
 *   // Runs after all tests complete
 *   afterAll(() => {
 *     orm.close();
 *   });
 *
 *   it("should add a user to the database", () => {
 *     const user = { name: "Ben", age: 24 };
 *     orm.createEntry("userEntry", user);
 *     expect(orm.getEntry("userEntry", { name: "Ben" })).toEqual(user);
 *   });
 * });
 * ```
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about best practices</summary>
 *
 * > [!NOTE]
 * > Write meaningful test names that describe expected behavior - starting with "should" is just a convention and not a requirement
 *
 * > [!NOTE]
 * > Focus on behavior rather than implementation details - test what the code does, not how it does it
 *
 * > [!NOTE]
 * > Remember that BDD is about communication - if another person can't understand your test, it's not good BDD
 * </details>
 *
 * ### ❌ Common Misconceptions
 * <details>
 * <summary>Click to see what doesn't define BDD</summary>
 *
 * - Using `describe()` and `it()` doesn't automatically make your tests BDD
 * - Using `expect()` vs `assert()` doesn't determine if you're doing BDD
 * - The testing framework you choose doesn't make your approach BDD
 *
 * BDD is about the intent, clarity, and communication value of your tests,
 * not the syntax or functions you use to write them.
 * </details>
 *
 * ### 🔧 Runtime Support
 * - ✅ Deno
 * - ⚠️ Bun (coming soon)
 * - ⚠️ Node.js (coming soon)
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link it} - Define individual test cases
 * - {@link describe} - Group related test cases
 * - {@link beforeEach} - Run code before each test
 * - {@link afterEach} - Run code after each test
 *
 * @module
 */

import { AssertionError, getAssertionState } from "../assert.ts";
import {
  type DescribeDefinition,
  globalSanitizersState,
  type HookNames,
  type ItDefinition,
  type TestSuite,
  TestSuiteInternal,
} from "./test-suite.ts";
export type { DescribeDefinition, ItDefinition, TestSuite };

/** The arguments for an ItFunction. */
export type ItArgs<T> =
  | [options: ItDefinition<T>]
  | [name: string, options: Omit<ItDefinition<T>, "name">]
  | [name: string, fn: (this: T, t: Deno.TestContext) => void | Promise<void>]
  | [fn: (this: T, t: Deno.TestContext) => void | Promise<void>]
  | [
      name: string,
      options: Omit<ItDefinition<T>, "fn" | "name">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ]
  | [
      options: Omit<ItDefinition<T>, "fn">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ]
  | [
      options: Omit<ItDefinition<T>, "fn" | "name">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<ItDefinition<T>, "name" | "suite">
    ]
  | [
      suite: TestSuite<T>,
      name: string,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ]
  | [
      suite: TestSuite<T>,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<ItDefinition<T>, "fn" | "name" | "suite">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<ItDefinition<T>, "fn" | "suite">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<ItDefinition<T>, "fn" | "name" | "suite">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>
    ];

/** Generates an ItDefinition from ItArgs. */
function itDefinition<T>(...args: ItArgs<T>): ItDefinition<T> {
  let [suiteOptionsOrNameOrFn, optionsOrNameOrFn, optionsOrFn, fn] = args;
  let suite: TestSuite<T> | undefined = undefined;
  let name: string;
  let options:
    | ItDefinition<T>
    | Omit<ItDefinition<T>, "fn">
    | Omit<ItDefinition<T>, "name">
    | Omit<ItDefinition<T>, "fn" | "name">;
  if (
    typeof suiteOptionsOrNameOrFn === "object" &&
    typeof (suiteOptionsOrNameOrFn as TestSuite<T>).symbol === "symbol"
  ) {
    suite = suiteOptionsOrNameOrFn as TestSuite<T>;
  } else {
    fn = optionsOrFn as typeof fn;
    optionsOrFn = optionsOrNameOrFn as typeof optionsOrFn;
    optionsOrNameOrFn = suiteOptionsOrNameOrFn as typeof optionsOrNameOrFn;
  }
  if (typeof optionsOrNameOrFn === "string") {
    name = optionsOrNameOrFn;
    if (typeof optionsOrFn === "function") {
      fn = optionsOrFn;
      options = {};
    } else {
      options = optionsOrFn!;
      if (!fn) fn = (options as Omit<ItDefinition<T>, "name">).fn;
    }
  } else if (typeof optionsOrNameOrFn === "function") {
    fn = optionsOrNameOrFn;
    name = fn.name;
    options = {};
  } else {
    options = optionsOrNameOrFn!;
    if (typeof optionsOrFn === "function") {
      fn = optionsOrFn;
    } else {
      fn = (options as ItDefinition<T>).fn;
    }
    name = (options as ItDefinition<T>).name ?? fn.name;
  }

  return {
    ...(suite !== undefined ? { suite } : {}),
    ...options,
    name,
    fn,
  };
}

/**
 * # It Function
 * @summary Creates and registers an individual test case
 *
 * This function defines a single test case (spec) in the BDD style. It represents
 * a specific behavior that your code should exhibit.
 *
 * @since 1.0.0
 * @category InSpatial Test
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Test cases should test one specific behavior
 * - Test names should describe the expected behavior, usually starting with "should"
 * - Each test is isolated from others to prevent side effects
 *
 * ### 📝 Type Definitions
 * ```typescript
 * interface ItDefinition<T> {
 *   name: string;           // Name of the test case
 *   fn: Function;           // Test function to execute
 *   ignore?: boolean;       // Whether to skip this test
 *   only?: boolean;         // Whether to run only this test
 *   permissions?: string;   // Permissions required by the test
 * }
 * ```
 *
 * @typeParam T - The self type of the function to implement the test case
 * @param args - Variable arguments to define the test case
 *
 * ### 🎮 Usage
 *
 * #### Basic Usage
 * ```typescript
 * import { it, expect } from "@inspatial/test";
 *
 * it("should add two numbers correctly", () => {
 *   expect(2 + 2).toBe(4);
 * });
 * ```
 *
 * #### With Test Context
 * ```typescript
 * import { it, expect } from "@inspatial/test";
 *
 * it("should support async operations", async (t) => {
 *   // t is the test context with methods like t.step()
 *   const result = await Promise.resolve(42);
 *   expect(result).toBe(42);
 * });
 * ```
 *
 * #### With Options Object
 * ```typescript
 * import { it, expect } from "@inspatial/test";
 *
 * it({
 *   name: "should perform secure operations",
 *   permissions: "allow-net",
 *   fn: () => {
 *     // Test code that requires network permissions
 *     expect(true).toBe(true);
 *   }
 * });
 * ```
 *
 * #### Within a Test Suite
 * ```typescript
 * import { describe, it, expect } from "@inspatial/test";
 *
 * describe("Calculator", () => {
 *   it("should add correctly", () => {
 *     expect(2 + 2).toBe(4);
 *   });
 *
 *   it("should subtract correctly", () => {
 *     expect(5 - 3).toBe(2);
 *   });
 * });
 * ```
 *
 * @example
 * ### Basic Test Case
 * ```typescript
 * import { it, expect } from "@inspatial/test";
 *
 * it("should validate email format", () => {
 *   const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 *
 *   expect(isValidEmail("test@example.com")).toBe(true);
 *   expect(isValidEmail("invalid-email")).toBe(false);
 * });
 * ```
 *
 * @throws {Error}
 * If you try to register a test case after tests have started running.
 *
 * @see {@link describe} - For grouping related test cases
 * @see {@link beforeEach} - For setup before each test
 * @see {@link afterEach} - For cleanup after each test
 */
export interface it {
  <T>(...args: ItArgs<T>): void;

  /**
   * # Only Modifier
   * @summary Registers a test case that will be the only one executed
   *
   * When you need to focus on a specific test case during development or debugging,
   * use the `only` modifier to run just that test while skipping all others.
   *
   * @typeParam T - The self type of the function to implement the test case
   * @param args - Variable arguments to define the test case
   *
   * @example
   * ```typescript
   * import { describe, it } from "@inspatial/test";
   *
   * describe("Calculator", () => {
   *   // This test will be skipped
   *   it("should add correctly", () => {
   *     // Test code
   *   });
   *
   *   // Only this test will run
   *   it.only("should subtract correctly", () => {
   *     // Test code
   *   });
   * });
   * ```
   */
  only<T>(...args: ItArgs<T>): void;

  /**
   * # Ignore Modifier
   * @summary Registers a test case that will be skipped
   *
   * Use the `ignore` modifier to temporarily skip a test case without removing it.
   * This is useful when a test is broken or when working on a feature that's not
   * yet complete.
   *
   * @typeParam T - The self type of the function to implement the test case
   * @param args - Variable arguments to define the test case
   *
   * @example
   * ```typescript
   * import { describe, it } from "@inspatial/test";
   *
   * describe("Calculator", () => {
   *   it("should add correctly", () => {
   *     // This test will run
   *   });
   *
   *   it.ignore("should divide correctly", () => {
   *     // This test will be skipped
   *   });
   * });
   * ```
   */
  ignore<T>(...args: ItArgs<T>): void;

  /**
   * # Skip Modifier
   * @summary Alias of `.ignore()` that registers a test case to be skipped
   *
   * Functions identically to `it.ignore()` but with a more intuitive name for
   * those familiar with other test frameworks.
   *
   * @typeParam T - The self type of the function to implement the test case
   * @param args - Variable arguments to define the test case
   *
   * @example
   * ```typescript
   * import { describe, it } from "@inspatial/test";
   *
   * describe("Calculator", () => {
   *   it("should add correctly", () => {
   *     // This test will run
   *   });
   *
   *   it.skip("should divide correctly", () => {
   *     // This test will be skipped
   *   });
   * });
   * ```
   */
  skip<T>(...args: ItArgs<T>): void;
}

/**
 * Registers an individual test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function to implement the test case
 * @param args The test case
 */
export function it<T>(...args: ItArgs<T>) {
  if (TestSuiteInternal.runningCount > 0) {
    throw new Error(
      "Cannot register new test cases after already registered test cases start running"
    );
  }
  const assertionState = getAssertionState();
  const options = itDefinition(...args);
  const { suite } = options;
  const testSuite = suite
    ? TestSuiteInternal.suites.get(suite.symbol)
    : TestSuiteInternal.current;

  if (!TestSuiteInternal.started) TestSuiteInternal.started = true;
  if (testSuite) {
    TestSuiteInternal.addStep(testSuite, options);
  } else {
    const {
      name,
      fn,
      ignore,
      only,
      permissions,
      sanitizeExit = globalSanitizersState.sanitizeExit,
      sanitizeOps = globalSanitizersState.sanitizeOps,
      sanitizeResources = globalSanitizersState.sanitizeResources,
    } = options;
    const opts: Deno.TestDefinition = {
      name,
      async fn(t) {
        TestSuiteInternal.runningCount++;
        try {
          await fn.call({} as T, t);
        } finally {
          TestSuiteInternal.runningCount--;
        }

        if (assertionState.checkAssertionErrorState()) {
          throw new AssertionError(
            "Expected at least one assertion to be called but received none"
          );
        }

        if (assertionState.checkAssertionCountSatisfied()) {
          throw new AssertionError(
            `Expected at least ${assertionState.assertionCount} assertion to be called, ` +
              `but received ${assertionState.assertionTriggeredCount}`
          );
        }

        assertionState.resetAssertionState();
      },
    };
    if (ignore !== undefined) {
      opts.ignore = ignore;
    }
    if (only !== undefined) {
      opts.only = only;
    }
    if (permissions !== undefined) {
      opts.permissions = permissions;
    }
    if (sanitizeExit !== undefined) {
      opts.sanitizeExit = sanitizeExit;
    }
    if (sanitizeOps !== undefined) {
      opts.sanitizeOps = sanitizeOps;
    }
    if (sanitizeResources !== undefined) {
      opts.sanitizeResources = sanitizeResources;
    }
    TestSuiteInternal.registerTest(opts);
  }
}

/**
 * Only execute this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   it.only("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
it.only = function itOnly<T>(...args: ItArgs<T>): void {
  const options = itDefinition(...args);
  return it({
    ...options,
    only: true,
  });
};

/**
 * Ignore this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   it.ignore("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
it.ignore = function itIgnore<T>(...args: ItArgs<T>): void {
  const options = itDefinition(...args);
  return it({
    ...options,
    ignore: true,
  });
};

/** Skip this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   it.skip("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
it.skip = function itSkip<T>(...args: ItArgs<T>): void {
  it.ignore(...args);
};

/**
 * Alias of {@linkcode it}
 *
 * Registers an individual test case.
 *
 * @example Usage
 * ```ts
 * import { test } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * test("a test case", () => {
 *   // test case
 *   assertEquals(2 + 2, 4);
 * });
 * ```
 *
 * @typeParam T The self type of the function to implement the test case
 * @param args The test case
 */
export function test<T>(...args: ItArgs<T>) {
  it(...args);
}

/**
 * Only execute this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, test } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   test("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   test.only("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
test.only = function itOnly<T>(...args: ItArgs<T>): void {
  it.only(...args);
};

/**
 * Ignore this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, test } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   test("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   test.ignore("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
test.ignore = function itIgnore<T>(...args: ItArgs<T>): void {
  it.ignore(...args);
};

/** Skip this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, test } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   test("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   test.skip("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
test.skip = function itSkip<T>(...args: ItArgs<T>): void {
  it.ignore(...args);
};

function addHook<T>(name: HookNames, fn: (this: T) => void | Promise<void>) {
  if (!TestSuiteInternal.current) {
    if (TestSuiteInternal.started) {
      throw new Error(
        "Cannot add global hooks after a global test is registered"
      );
    }
    TestSuiteInternal.current = new TestSuiteInternal({
      name: "global",
      [name]: fn,
    });
  } else {
    TestSuiteInternal.setHook(TestSuiteInternal.current!, name, fn);
  }
}

/**
 * Run some shared setup before all of the tests in the group.
 * Useful for async setup in `describe` blocks. Outside them,
 * top-level initialization code should be used instead.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * beforeAll(() => {
 *  console.log("beforeAll");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the setup behavior.
 */
export function beforeAll<T>(fn: (this: T) => void | Promise<void>) {
  addHook("beforeAll", fn);
}

/**
 * Alias of {@linkcode beforeAll}
 *
 * Run some shared setup before all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, before } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * before(() => {
 *  console.log("before");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the setup behavior.
 */
export function before<T>(fn: (this: T) => void | Promise<void>) {
  beforeAll(fn);
}

/**
 * Run some shared teardown after all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, afterAll } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * afterAll(() => {
 *  console.log("afterAll");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the teardown behavior.
 */
export function afterAll<T>(fn: (this: T) => void | Promise<void>) {
  addHook("afterAll", fn);
}

/**
 * Alias of {@linkcode afterAll}.
 *
 * Run some shared teardown after all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, after } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * after(() => {
 *  console.log("after");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the teardown behavior.
 */
export function after<T>(fn: (this: T) => void | Promise<void>) {
  afterAll(fn);
}

/**
 * # BeforeEach Hook
 * @summary Runs setup code before each test in the suite
 *
 * This hook lets you run setup code that should execute before each test case.
 * Use it to prepare a fresh testing environment for each individual test.
 *
 * @since 1.0.0
 * @category InSpatial Test
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Creates a fresh testing environment for each test
 * - Prevents test interdependencies and isolates test cases
 * - Runs in order from the outermost suite to the innermost
 * - Should contain setup logic only, not assertions
 *
 * @typeParam T - The self type of the hook function
 * @param fn - The function to implement the shared setup behavior
 *
 * ### 🎮 Usage
 *
 * #### Basic Usage
 * ```typescript
 * import { describe, it, beforeEach, expect } from "@inspatial/test";
 *
 * describe("Counter", () => {
 *   let counter;
 *
 *   // This runs before each test to ensure a fresh counter
 *   beforeEach(() => {
 *     counter = { value: 0 };
 *   });
 *
 *   it("should increment correctly", () => {
 *     counter.value += 1;
 *     expect(counter.value).toBe(1);
 *   });
 *
 *   it("should decrement correctly", () => {
 *     counter.value -= 1;
 *     expect(counter.value).toBe(-1);
 *   });
 * });
 * ```
 *
 * #### With Async Operations
 * ```typescript
 * import { describe, it, beforeEach, expect } from "@inspatial/test";
 *
 * describe("Database", () => {
 *   let db;
 *
 *   beforeEach(async () => {
 *     db = await Database.connect();
 *     await db.clear(); // Clear any existing data
 *   });
 *
 *   it("should insert a record", async () => {
 *     await db.insert({ id: 1, name: "Test" });
 *     const record = await db.findById(1);
 *     expect(record.name).toBe("Test");
 *   });
 * });
 * ```
 *
 * #### Nested Hooks
 * ```typescript
 * import { describe, it, beforeEach, expect } from "@inspatial/test";
 *
 * describe("User management", () => {
 *   let system;
 *
 *   beforeEach(() => {
 *     system = new System();
 *   });
 *
 *   describe("Admin operations", () => {
 *     let admin;
 *
 *     // This runs after the outer beforeEach
 *     beforeEach(() => {
 *       admin = system.createAdmin();
 *     });
 *
 *     it("should allow creating users", () => {
 *       const user = admin.createUser("test");
 *       expect(user.createdBy).toBe("admin");
 *     });
 *   });
 * });
 * ```
 *
 * @example
 * ### Real-world Example
 * ```typescript
 * import { describe, it, beforeEach, afterEach, expect } from "@inspatial/test";
 * import { UserService } from "./user-service";
 * import { DatabaseMock } from "./test-utils";
 *
 * describe("UserService", () => {
 *   let userService;
 *   let dbMock;
 *
 *   // Setup fresh test environment before each test
 *   beforeEach(() => {
 *     // Create a clean database mock
 *     dbMock = new DatabaseMock();
 *
 *     // Seed with test data
 *     dbMock.seed([
 *       { id: 1, username: "alice", isActive: true },
 *       { id: 2, username: "bob", isActive: false }
 *     ]);
 *
 *     // Create a fresh instance of the service for testing
 *     userService = new UserService(dbMock);
 *   });
 *
 *   it("should find active users", async () => {
 *     const users = await userService.findActiveUsers();
 *     expect(users.length).toBe(1);
 *     expect(users[0].username).toBe("alice");
 *   });
 *
 *   it("should activate a user", async () => {
 *     await userService.activateUser(2);
 *     const bob = await userService.findById(2);
 *     expect(bob.isActive).toBe(true);
 *   });
 * });
 * ```
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about best practices</summary>
 *
 * > [!NOTE]
 * > Keep beforeEach functions focused on setup only, not assertions
 *
 * > [!NOTE]
 * > Tests should be independent - don't let one test affect another
 *
 * > [!NOTE]
 * > Consider using afterEach for cleanup if your setup allocates resources
 * </details>
 *
 * @see {@link afterEach} - For cleanup after each test
 * @see {@link beforeAll} - For one-time setup before all tests
 * @see {@link describe} - For grouping related tests
 */
export function beforeEach<T>(fn: (this: T) => void | Promise<void>) {
  addHook("beforeEach", fn);
}

/**
 * Run some shared teardown after each test in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, afterEach } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * afterEach(() => {
 *  console.log("afterEach");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the shared teardown behavior
 */
export function afterEach<T>(fn: (this: T) => void | Promise<void>) {
  addHook("afterEach", fn);
}

/** The arguments for a DescribeFunction. */
export type DescribeArgs<T> =
  | [options: DescribeDefinition<T>]
  | [name: string]
  | [name: string, options: Omit<DescribeDefinition<T>, "name">]
  | [name: string, fn: () => void | undefined]
  | [fn: () => void | undefined]
  | [
      name: string,
      options: Omit<DescribeDefinition<T>, "fn" | "name">,
      fn: () => void | undefined
    ]
  | [options: Omit<DescribeDefinition<T>, "fn">, fn: () => void | undefined]
  | [
      options: Omit<DescribeDefinition<T>, "fn" | "name">,
      fn: () => void | undefined
    ]
  | [suite: TestSuite<T>, name: string]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<DescribeDefinition<T>, "name" | "suite">
    ]
  | [suite: TestSuite<T>, name: string, fn: () => void | undefined]
  | [suite: TestSuite<T>, fn: () => void | undefined]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<DescribeDefinition<T>, "fn" | "name" | "suite">,
      fn: () => void | undefined
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<DescribeDefinition<T>, "fn" | "suite">,
      fn: () => void | undefined
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<DescribeDefinition<T>, "fn" | "name" | "suite">,
      fn: () => void | undefined
    ];

/** Generates a DescribeDefinition from DescribeArgs. */
function describeDefinition<T>(
  ...args: DescribeArgs<T>
): DescribeDefinition<T> {
  let [suiteOptionsOrNameOrFn, optionsOrNameOrFn, optionsOrFn, fn] = args;
  let suite: TestSuite<T> | undefined = undefined;
  let name: string;
  let options:
    | DescribeDefinition<T>
    | Omit<DescribeDefinition<T>, "fn">
    | Omit<DescribeDefinition<T>, "name">
    | Omit<DescribeDefinition<T>, "fn" | "name">;
  if (
    typeof suiteOptionsOrNameOrFn === "object" &&
    typeof (suiteOptionsOrNameOrFn as TestSuite<T>).symbol === "symbol"
  ) {
    suite = suiteOptionsOrNameOrFn as TestSuite<T>;
  } else {
    fn = optionsOrFn as typeof fn;
    optionsOrFn = optionsOrNameOrFn as typeof optionsOrFn;
    optionsOrNameOrFn = suiteOptionsOrNameOrFn as typeof optionsOrNameOrFn;
  }
  if (typeof optionsOrNameOrFn === "string") {
    name = optionsOrNameOrFn;
    if (typeof optionsOrFn === "function") {
      fn = optionsOrFn;
      options = {};
    } else {
      options = optionsOrFn ?? {};
      if (fn === undefined) {
        fn = (options as Omit<DescribeDefinition<T>, "name">).fn;
      }
    }
  } else if (typeof optionsOrNameOrFn === "function") {
    fn = optionsOrNameOrFn;
    name = fn.name;
    options = {};
  } else {
    options = optionsOrNameOrFn ?? {};
    if (typeof optionsOrFn === "function") {
      fn = optionsOrFn;
    } else {
      fn = (options as DescribeDefinition<T>).fn;
    }
    name = (options as DescribeDefinition<T>).name ?? fn?.name ?? "";
  }

  if (suite === undefined) {
    suite = options.suite;
  }
  if (suite === undefined && TestSuiteInternal.current) {
    const { symbol } = TestSuiteInternal.current;
    suite = { symbol };
  }

  return {
    ...options,
    suite: suite!,
    name,
    fn: fn!,
  };
}

/** Registers a test suite. */
export interface describe {
  <T>(...args: DescribeArgs<T>): TestSuite<T>;

  /** Registers a test suite with only set to true. */
  only<T>(...args: DescribeArgs<T>): TestSuite<T>;

  /** Registers a test suite with ignore set to true. */
  ignore<T>(...args: DescribeArgs<T>): TestSuite<T>;

  /** Registers a test suite with ignore set to true. Alias of `.ignore()`. */
  skip<T>(...args: ItArgs<T>): void;
}

/**
 * # Describe Function
 * @summary Creates and registers a test suite grouping related test cases
 *
 * This function creates a logical grouping of test cases that all relate to
 * a common subject or feature. It helps organize your tests into a readable
 * hierarchy.
 *
 * @since 1.0.0
 * @category InSpatial Test
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Test suites provide structure and organization for related test cases
 * - They can be nested to create a hierarchy of tests
 * - Each suite can have its own setup and teardown hooks
 * - Test suites can be skipped or focused for selective test execution
 *
 * ### 📝 Type Definitions
 * ```typescript
 * interface DescribeDefinition<T> {
 *   name: string;           // Name of the test suite
 *   fn: Function;           // Suite function to execute
 *   ignore?: boolean;       // Whether to skip this suite
 *   only?: boolean;         // Whether to run only this suite
 *   suite?: TestSuite<T>;   // Parent suite
 *   beforeAll?: Function;   // Setup before all tests
 *   afterAll?: Function;    // Teardown after all tests
 *   beforeEach?: Function;  // Setup before each test
 *   afterEach?: Function;   // Teardown after each test
 * }
 * ```
 *
 * @typeParam T - The self type of the test suite body
 * @param args - Variable arguments to define the test suite
 * @returns The test suite object that can be used to create nested suites
 *
 * ### 🎮 Usage
 *
 * #### Basic Usage
 * ```typescript
 * import { describe, it, expect } from "@inspatial/test";
 *
 * describe("Calculator", () => {
 *   it("should add numbers correctly", () => {
 *     expect(2 + 2).toBe(4);
 *   });
 *
 *   it("should subtract numbers correctly", () => {
 *     expect(5 - 3).toBe(2);
 *   });
 * });
 * ```
 *
 * #### Nested Suites
 * ```typescript
 * import { describe, it, expect } from "@inspatial/test";
 *
 * describe("Calculator", () => {
 *   describe("Basic operations", () => {
 *     it("should add correctly", () => {
 *       expect(2 + 2).toBe(4);
 *     });
 *
 *     it("should subtract correctly", () => {
 *       expect(5 - 3).toBe(2);
 *     });
 *   });
 *
 *   describe("Advanced operations", () => {
 *     it("should calculate square root", () => {
 *       expect(Math.sqrt(9)).toBe(3);
 *     });
 *   });
 * });
 * ```
 *
 * #### With Hooks
 * ```typescript
 * import { describe, it, beforeEach, afterAll, expect } from "@inspatial/test";
 *
 * describe("Database operations", () => {
 *   let db;
 *
 *   beforeEach(() => {
 *     db = connectToTestDatabase();
 *   });
 *
 *   afterAll(() => {
 *     db.disconnect();
 *   });
 *
 *   it("should insert a record", () => {
 *     const result = db.insert({ id: 1, name: "Test" });
 *     expect(result.success).toBe(true);
 *   });
 * });
 * ```
 *
 * @example
 * ### Feature Testing
 * ```typescript
 * import { describe, it, expect } from "@inspatial/test";
 *
 * // Testing a user authentication feature
 * describe("User authentication", () => {
 *   const auth = new AuthService();
 *
 *   describe("Login", () => {
 *     it("should succeed with valid credentials", async () => {
 *       const result = await auth.login("user@example.com", "correct-password");
 *       expect(result.success).toBe(true);
 *       expect(result.token).toBeDefined();
 *     });
 *
 *     it("should fail with invalid credentials", async () => {
 *       const result = await auth.login("user@example.com", "wrong-password");
 *       expect(result.success).toBe(false);
 *       expect(result.error).toBe("Invalid credentials");
 *     });
 *   });
 *
 *   describe("Registration", () => {
 *     it("should create a new user account", async () => {
 *       const result = await auth.register("new@example.com", "secure-password");
 *       expect(result.success).toBe(true);
 *       expect(result.userId).toBeDefined();
 *     });
 *   });
 * });
 * ```
 *
 * @throws {Error}
 * If you try to register a test suite after tests have started running.
 *
 * @see {@link it} - For defining individual test cases
 * @see {@link beforeEach} - For setup before each test
 * @see {@link afterEach} - For cleanup after each test
 */
export function describe<T>(...args: DescribeArgs<T>): TestSuite<T> {
  if (TestSuiteInternal.runningCount > 0) {
    throw new Error(
      "Cannot register new test suites after already registered test cases start running"
    );
  }
  const options = describeDefinition(...args);
  if (!TestSuiteInternal.started) TestSuiteInternal.started = true;
  const { symbol } = new TestSuiteInternal(options);
  return { symbol };
}

/**
 * Only execute this test suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@inspatial/test";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     expect(2 + 2).toBe(4);
 *   });
 * });
 *
 * // Only this test suite will run
 * describe.only("example 2", () => {
 *   it("should pass too", () => {
 *     expect(3 + 4).toBe(7);
 *   });
 * });
 * ```
 *
 * @param args The test suite body
 */
describe.only = function describeOnly<T>(
  ...args: DescribeArgs<T>
): TestSuite<T> {
  const options = describeDefinition(...args);
  return describe({
    ...options,
    only: true,
  });
};

/**
 * Ignore the test suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@inspatial/test";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     expect(2 + 2).toBe(4);
 *   });
 * });
 *
 * describe.ignore("example 2", () => {
 *   it("should pass too", () => {
 *     expect(3 + 4).toBe(7);
 *   });
 * });
 * ```
 *
 * @param args The test suite body
 */
describe.ignore = function describeIgnore<T>(
  ...args: DescribeArgs<T>
): TestSuite<T> {
  const options = describeDefinition(...args);
  return describe({
    ...options,
    ignore: true,
  });
};

/**
 * Skip the test suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@inspatial/test";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     expect(2 + 2).toBe(4);
 *   });
 * });
 *
 * describe.skip("example 2", () => {
 *   it("should pass too", () => {
 *     expect(3 + 4).toBe(7);
 *   });
 * });
 * ```
 *
 * @param args The test suite body
 */
describe.skip = function describeSkip<T>(
  ...args: DescribeArgs<T>
): TestSuite<T> {
  return describe.ignore(...args);
};
