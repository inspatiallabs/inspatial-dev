/** A guide to writing tests that describe how your code should behave
 * NOTE: BDD only works with the Deno Runtime with support for Bun and Node.js coming soon.
 *
 * This library helps you write tests that read like plain English, making it easier
 * for everyone on your team (including non-programmers) to understand what your
 * code should do.
 *
 * ##### Terminology: Behavior-Driven Development (BDD)
 * BDD is a way of writing tests that focus on describing how your code should behave
 * from a user's perspective, using simple, everyday language.
 *
 * ## Writing BDD Tests
 *
 * In BDD, we write tests using a simple pattern:
 * - Given: The starting situation
 * - When: Something happens
 * - Then: What should happen as a result
 *
 * Here's a simple example of testing a shopping cart:
 *
 * ```ts
 * import { test, expect } from "@inspatial/test";
 *
 * class ShoppingCart {
 *   items = [];
 *
 *   addItem(item) {
 *     this.items.push(item);
 *   }
 *
 *   getTotal() {
 *     return this.items.reduce((sum, item) => sum + item.price, 0);
 *   }
 * }
 *
 * test({
 *   name: "Shopping cart should calculate total correctly",
 *   fn: () => {
 *     // Given a shopping cart
 *     const cart = new ShoppingCart();
 *
 *     // When we add items
 *     cart.addItem({ name: "Book", price: 10 });
 *     cart.addItem({ name: "Pen", price: 2 });
 *
 *     // Then the total should be correct
 *     expect(cart.getTotal()).toBe(12);
 *   }
 * });
 * ```
 *
 * ##### NOTE: Writing Good Test Names
 * In BDD, test names should be complete sentences that describe the expected
 * behavior. They often start with "should" and focus on what the code does, not
 * how it does it.
 *
 * ## Using Feature Files
 *
 * For bigger projects, we can write our tests in special files called "feature
 * files" that use everyday language. Here's what they look like:
 *
 * ```gherkin
 * Feature: Shopping Cart
 *   As a customer
 *   I want to add items to my cart
 *   So that I can buy multiple items at once
 *
 *   Scenario: Adding items to cart
 *     Given an empty shopping cart
 *     When I add a book that costs $10
 *     And I add a pen that costs $2
 *     Then the total should be $12
 * ```
 *
 * And here's how we implement those tests:
 *
 * ```ts
 * import { test, expect } from "@inspatial/test";
 *
 * test({
 *   name: "Feature: Shopping Cart - Adding items",
 *   fn: () => {
 *     let cart;
 *
 *     // Given an empty shopping cart
 *     beforeEach(() => {
 *       cart = new ShoppingCart();
 *     });
 *
 *     // When I add items
 *     cart.addItem({ name: "Book", price: 10 });
 *     cart.addItem({ name: "Pen", price: 2 });
 *
 *     // Then the total should be correct
 *     expect(cart.getTotal()).toBe(12);
 *   }
 * });
 * ```
 *
 * ## The Three Amigos
 *
 * BDD works best when three types of team members work together:
 * 1. Business people (who know what the software needs to do)
 * 2. Developers (who write the code)
 * 3. Testers (who make sure it works correctly)
 *
 * When these three groups work together to write tests, they help ensure everyone
 * understands what needs to be built.
 *
 * ### Test Examples
 *
 * #### Using Assert Syntax
 * ```ts
 * import { test, assert } from "@inspatial/test";
 *
 * test({
 *   name: "Cart should handle empty state correctly",
 *   fn: () => {
 *     const cart = new ShoppingCart();
 *     assert.equal(cart.getTotal(), 0);
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from "@inspatial/test";
 *
 * test({
 *   name: "Cart should handle empty state correctly",
 *   fn: () => {
 *     const cart = new ShoppingCart();
 *     expect(cart.getTotal()).toBe(0);
 *   }
 * });
 * ```
 *
 * ##### NOTE: Choosing Test Styles
 * Both assert and expect styles work well for BDD. Choose the one that reads more
 * naturally to your team. The expect style is often preferred because it reads more
 * like plain English.
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
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
    ]
  | [
      options: Omit<ItDefinition<T>, "fn">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
    ]
  | [
      options: Omit<ItDefinition<T>, "fn" | "name">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
    ]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<ItDefinition<T>, "name" | "suite">,
    ]
  | [
      suite: TestSuite<T>,
      name: string,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
    ]
  | [
      suite: TestSuite<T>,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
    ]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<ItDefinition<T>, "fn" | "name" | "suite">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<ItDefinition<T>, "fn" | "suite">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<ItDefinition<T>, "fn" | "name" | "suite">,
      fn: (this: T, t: Deno.TestContext) => void | Promise<void>,
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

/** Registers an individual test case. */
export interface it {
  <T>(...args: ItArgs<T>): void;

  /** Registers an individual test case with only set to true. */
  only<T>(...args: ItArgs<T>): void;

  /** Registers an individual test case with ignore set to true. */
  ignore<T>(...args: ItArgs<T>): void;

  /**
   * Registers an individual test case with ignore set to true. Alias of
   * `.ignore()`.
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
 * Run some shared setup before each test in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeEach } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * beforeEach(() => {
 *  console.log("beforeEach");
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
 * @param fn The function to implement the shared setup behavior
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
      fn: () => void | undefined,
    ]
  | [options: Omit<DescribeDefinition<T>, "fn">, fn: () => void | undefined]
  | [
      options: Omit<DescribeDefinition<T>, "fn" | "name">,
      fn: () => void | undefined,
    ]
  | [suite: TestSuite<T>, name: string]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<DescribeDefinition<T>, "name" | "suite">,
    ]
  | [suite: TestSuite<T>, name: string, fn: () => void | undefined]
  | [suite: TestSuite<T>, fn: () => void | undefined]
  | [
      suite: TestSuite<T>,
      name: string,
      options: Omit<DescribeDefinition<T>, "fn" | "name" | "suite">,
      fn: () => void | undefined,
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<DescribeDefinition<T>, "fn" | "suite">,
      fn: () => void | undefined,
    ]
  | [
      suite: TestSuite<T>,
      options: Omit<DescribeDefinition<T>, "fn" | "name" | "suite">,
      fn: () => void | undefined,
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
 * Registers a test suite.
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
 * @typeParam T The self type of the test suite body.
 * @param args The test suite body.
 * @returns The test suite
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
 * import { describe, it, beforeAll } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 *
 * // Only this test suite will run
 * describe.only("example 2", () => {
 *   it("should pass too", () => {
 *     assertEquals(3 + 4, 7);
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
 * import { describe, it, beforeAll } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 *
 * describe.ignore("example 2", () => {
 *   it("should pass too", () => {
 *     assertEquals(3 + 4, 7);
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
 * import { describe, it, beforeAll } from "@inspatial/test/bdd";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 *
 * describe.skip("example 2", () => {
 *   it("should pass too", () => {
 *     assertEquals(3 + 4, 7);
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
