/*#############################################(DOCUMENTATION)#############################################*/
/**
 * # Mocking
 *
 * In testing, `mock` is a tool that helps you check how your functions are used
 * and control their outputs. Think of it like a security camera (spy) that watches
 * your functions or a stunt double (stub) that stands in for them during tests.
 *
 * ## Introduction to Function Watching (Spy)
 *
 * Sometimes you want to make sure one function is correctly using another function.
 * Think of it like a security camera - you can see when someone enters a room,
 * what they did there, and when they left.
 *
 * ##### Terminology: (Spy)
 * A spy in testing is like a security camera for your functions. It lets you see when a
 * function was used, what information was given to it, and what it gave back
 * without changing what the function does
 *
 * Let's look at a simple example. We'll create two functions:
 * 1. A multiply function that multiplies two numbers
 * 2. A square function that should use multiply to square a number
 *
 * We want to make sure the square function is actually using multiply:
 *
 * ```ts
 * import { test, assertSpyCall, assertSpyCalls, spy, assertEquals } from "@inspatial/test";
 *
 * // Simple function to multiply two numbers
 * function multiply(a: number, b: number): number {
 *   return a * b;
 * }
 *
 * // Function to square a number using multiply
 * function square(multiplyFn: (a: number, b: number) => number, value: number): number {
 *   return multiplyFn(value, value);
 * }
 *
 * test({
 *   name: "square function should use multiply to calculate square of a number",
 *   fn: () => {
 *     // Create a spy to watch the multiply function
 *     const multiplySpyProp = spy(multiply);
 *
 *     // Try squaring the number 5
 *     const result = square(multiplySpyProp, 5);
 *
 *     // Check if we got the right answer (5 × 5 = 25)
 *     assertEquals(result, 25);
 *
 *     // Check if multiply was used correctly
 *     assertSpyCall(multiplySpyProp, 0, {  // 0 means "first time it was called"
 *       args: [5, 5],     // Was it called with 5 and 5?
 *       returned: 25,     // Did it return 25?
 *     });
 *
 *     // Check if multiply was called exactly once
 *     assertSpyCalls(multiplySpyProp, 1);
 *   }
 * });
 * ```
 *
 * ##### NOTE: A Simpler Way
 * In the real world, you might not want to pass functions around like we did above.
 * Here's a more common way to do it:
 *
 * ```ts
 * import { test, assertSpyCall, assertSpyCalls, spy, assertEquals } from "@inspatial/test";
 *
 * function multiply(a: number, b: number): number {
 *   return a * b;
 * }
 *
 * // Put our function in an object so we can watch it easily
 * const mathTools = { multiply };
 *
 * function square(value: number): number {
 *   // Use multiply from our object
 *   return mathTools.multiply(value, value);
 * }
 *
 * test({
 *   name: "square function should use multiply to calculate square of a number",
 *   fn: () => {
 *     // Create a spy to watch the multiply function in our object
 *     using multiplySpyProp = spy(mathTools, "multiply");
 *
 *     // Try squaring the number 5
 *     const result = square(5);
 *
 *     // Check if we got 25 (5 × 5)
 *     assertEquals(result, 25);
 *
 *     // Make sure multiply was used correctly
 *     assertSpyCall(multiplySpyProp, 0, {
 *       args: [5, 5],
 *       returned: 25,
 *     });
 *
 *     // Make sure multiply was used exactly once
 *     assertSpyCalls(multiplySpyProp, 1);
 *   }
 * });
 * ```
 *
 * ##### NOTE: The `using` Keyword
 * When we spy on a function inside an object (like we did with `mathTools.multiply`),
 * we use the `using` keyword. This makes sure everything gets cleaned up properly
 * after our test is done.
 *
 * ### Test Examples
 *
 * #### Using Assert Syntax
 * ```ts
 * test({
 *   name: "check function calls with assert",
 *   fn: () => {
 *     const myFunction = spy(() => "hello");
 *     myFunction();
 *     assertSpyCalls(myFunction, 1);
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * test({
 *   name: "check function calls with expect",
 *   fn: () => {
 *     const myFunction = spy(() => "hello");
 *     myFunction();
 *     expect(myFunction).toHaveBeenCalledTimes(1);
 *   }
 * });
 * ```
 *
 * ## Replacing Functions for Testing (Stub)
 *
 * Sometimes you need to test code that uses unpredictable functions (like getting
 * random numbers or current weather). This can make testing tricky - how do you
 * know what to expect if the function gives different results each time?
 *
 * ##### Terminology: Stub
 * A stub is like a stunt double for your function. Instead of using the real
 * function (which might be unpredictable), you replace it with a fake version
 * that does exactly what you want for your test.
 *
 * Let's look at an example. Say we have a function that multiplies a number by
 * a random number between -10 and 10:
 *
 * ```ts
 * import {
 *   test,
 *   assertEquals,
 *   assertSpyCall,
 *   assertSpyCalls,
 *   returnsNext,
 *   stub
 * } from "@inspatial/test";
 *
 * // Function to get a random number between min and max
 * function getRandomNumber(min: number, max: number): number {
 *   return min + Math.floor(Math.random() * (max - min));
 * }
 *
 * // Store our function where we can easily replace it for testing
 * const mathHelpers = { getRandomNumber };
 *
 * // Function that uses our random number generator
 * function multiplyByRandom(value: number): number {
 *   return value * mathHelpers.getRandomNumber(-10, 10);
 * }
 *
 * test({
 *   name: "should multiply numbers correctly with both positive and negative random numbers",
 *   fn: () => {
 *     // Replace getRandomNumber with our stunt double
 *     // First it will return -3, then it will return 3
 *     using numberStubProp = stub(
 *       mathHelpers,           // object containing our function
 *       "getRandomNumber",     // name of function to replace
 *       returnsNext([-3, 3])   // values it should return
 *     );
 *
 *     // Test with negative random number (-3)
 *     const firstResult = multiplyByRandom(5);  // should be 5 × -3
 *     assertEquals(firstResult, -15);
 *
 *     // Test with positive random number (3)
 *     const secondResult = multiplyByRandom(5); // should be 5 × 3
 *     assertEquals(secondResult, 15);
 *
 *     // Check first time getRandomNumber was called
 *     assertSpyCall(numberStubProp, 0, {           // 0 means first call
 *       args: [-10, 10],    // Was it called with -10 and 10?
 *       returned: -3,       // Did it return -3?
 *     });
 *
 *     // Check second time getRandomNumber was called
 *     assertSpyCall(numberStubProp, 1, {           // 1 means second call
 *       args: [-10, 10],    // Was it called with -10 and 10?
 *       returned: 3,        // Did it return 3?
 *     });
 *
 *     // Make sure it was called exactly twice
 *     assertSpyCalls(numberStubProp, 2);
 *   }
 * });
 * ```
 *
 * ##### NOTE: When to Use Stub
 * StubProps are great for testing functions that normally:
 * - Generate random numbers
 * - Get the current time
 * - Make network requests
 * - Read files
 * - Or do anything else that might give different results each time
 *
 * ##### NOTE: returnsNext Function
 * The returnsNext function lets you create a stub that returns different values
 * each time it's called. Just pass it an array of values, and it will return
 * them one by one in order.
 *
 * ### Test Examples
 *
 * #### Using Assert Syntax
 * ```ts
 * test({
 *   name: "test using assert",
 *   fn: () => {
 *     const helpers = { getData: () => Math.random() };
 *     using dataStubProp = stub(helpers, "getData", returnsNext([1, 2, 3]));
 *
 *     assertEquals(helpers.getData(), 1);
 *     assertEquals(helpers.getData(), 2);
 *     assertSpyCalls(dataStubProp, 2);
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * test({
 *   name: "test using expect",
 *   fn: () => {
 *     const helpers = { getData: () => Math.random() };
 *     using dataStubProp = stub(helpers, "getData", returnsNext([1, 2, 3]));
 *
 *     expect(helpers.getData()).toBe(1);
 *     expect(helpers.getData()).toBe(2);
 *     expect(dataStubProp).toHaveBeenCalledTimes(2);
 *   }
 * });
 * ```
 *
 * ## Faking Time
 *
 * ### Testing Time-Based Code
 *
 * Have you ever written code that needs to wait for something? Like showing a
 * message after 5 seconds, or checking something every minute? Testing this kind
 * of code can be tricky. You don't want your tests to actually wait around -
 * that would make them very slow!
 *
 * ##### Terminology: FakeTime
 * FakeTime is like a magical remote control for time in your tests. It lets you
 * fast-forward through time without actually waiting.
 *
 * Here's a simple example. Let's say we want to test a function that does
 * something every second:
 *
 * ```ts
 * import { test, assertSpyCalls, spy, FakeTime } from "@inspatial/test";
 *
 * // This function calls the callback every second
 * function doSomethingEverySec(callback: () => void): number {
 *   return setInterval(callback, 1000);  // 1000 means 1 second
 * }
 *
 * test({
 *   name: "should call the callback every second",
 *   fn: () => {
 *     // Create our time controller
 *     using time = new FakeTime();
 *
 *     // Create a function we can watch
 *     const callback = spy();
 *
 *     // Start our repeating task
 *     const timerId = doSomethingEverySec(callback);
 *
 *     // At the start, nothing should have happened yet
 *     assertSpyCalls(callback, 0);
 *
 *     // Fast forward 1 second
 *     time.tick(1000);
 *     // Now it should have been called once
 *     assertSpyCalls(callback, 1);
 *
 *     // Fast forward 2 more seconds
 *     time.tick(2000);
 *     // It should have been called two more times
 *     assertSpyCalls(callback, 3);
 *
 *     // Clean up when we're done
 *     clearInterval(timerId);
 *   }
 * });
 * ```
 *
 * ##### NOTE: What FakeTime Controls
 * When you create a FakeTime, it takes control of these time-related things in
 * your code:
 * - The current time (Date)
 * - Waiting for something (setTimeout)
 * - Stopping the wait (clearTimeout)
 * - Doing something repeatedly (setInterval)
 * - Stopping the repeated task (clearInterval)
 *
 * ##### NOTE: Using tick()
 * The tick() function lets you jump forward in time. Just tell it how many
 * milliseconds to move forward (1000 milliseconds = 1 second).
 *
 * ### Test Examples
 *
 * #### Using Assert Syntax
 * ```ts
 * test({
 *   name: "test delayed action using assert",
 *   fn: () => {
 *     using time = new FakeTime();
 *     const callback = spy();
 *
 *     setTimeout(callback, 1000);
 *     assertSpyCalls(callback, 0);
 *
 *     time.tick(1000);
 *     assertSpyCalls(callback, 1);
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * test({
 *   name: "test delayed action using expect",
 *   fn: () => {
 *     using time = new FakeTime();
 *     const callback = spy();
 *
 *     setTimeout(callback, 1000);
 *     expect(callback).toHaveBeenCalledTimes(0);
 *
 *     time.tick(1000);
 *     expect(callback).toHaveBeenCalledTimes(1);
 *   }
 * });
 *
 * @module
 */

/*###############################################(IMPORTS)###############################################*/
import {
  assertEquals,
  assertIsError,
  assertRejects,
  AssertionError,
} from "../assert.ts";

/*###############################################(IS TEST SPY)###############################################*/
//#region isTestSpy
/**
 * Checks if a function is a spy.
 *
 * @typeParam Self The self type of the function.
 * @typeParam Args The arguments type of the function.
 * @typeParam Return The return type of the function.
 * @param func The function to check
 * @return `true` if the function is a spy, `false` otherwise.
 */
export function isTestSpy<Self, Args extends unknown[], Return>(
  func: ((this: Self, ...args: Args) => Return) | unknown
): func is SpyProp<Self, Args, Return> {
  const spy = func as SpyProp<Self, Args, Return>;
  return (
    typeof spy === "function" &&
    typeof spy.original === "function" &&
    typeof spy.restoredTest === "boolean" &&
    typeof spy.restoreTest === "function" &&
    Array.isArray(spy.calls)
  );
}
//#endregion isTestSpy

/*###############################################(TEST SESSIONS)###############################################*/
//#region testSessions
// deno-lint-ignore no-explicit-any
export const testSessions: Set<SpyProp<any, any[], any>>[] = [];
//#endregion testSessions

/*###############################################(GET TEST SESSION)###############################################*/
//#region getTestSession
// deno-lint-ignore no-explicit-any
function getTestSession(): Set<SpyProp<any, any[], any>> {
  if (testSessions.length === 0) testSessions.push(new Set());
  return testSessions.at(-1)!;
}
//#endregion getTestSession

/*###############################################(REGISTER MOCK)###############################################*/
//#region registerMock
// deno-lint-ignore no-explicit-any
export function registerMock(spy: SpyProp<any, any[], any>) {
  const session = getTestSession();
  session.add(spy);
}
//#endregion registerMock

/*###############################################(UNREGISTER MOCK)###############################################*/
//#region unregisterMock
// deno-lint-ignore no-explicit-any
export function unregisterMock(spy: SpyProp<any, any[], any>) {
  const session = getTestSession();
  session.delete(spy);
}
//#endregion unregisterMock

/*###############################################(MOCK ERROR)###############################################*/
//#region MockError
/**
 * An error related to spying on a function or instance method.
 *
 * @example Usage
 * ```ts
 * import { MockError, spy } from "@inspatial/test/mock";
 * import { assertThrows } from "@inspatial/test/assert";
 *
 * assertThrows(() => {
 *   spy({} as any, "no-such-method");
 * }, MockError);
 * ```
 */
export class MockError extends Error {
  /**
   * Construct MockError
   *
   * @param message The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "MockError";
  }
}
//#endregion MockError

/*###############################################(SPY CALL)###############################################*/
//#region SpyCallProp
/** Call information recorded by a spy. */
export interface SpyCallProp<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> {
  /** Arguments passed to a function when called. */
  args: Args;
  /** The value that was returned by a function. */
  returned?: Return;
  /** The error value that was thrown by a function. */
  error?: Error;
  /** The instance that a method was called on. */
  self?: Self;
}
//#endregion SpyCallProp

/*###############################################(SPY)###############################################*/
//#region SpyProp
/** A function or instance method wrapper that records all calls made to it. */
export interface SpyProp<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> {
  mock: any
  (this: Self, ...args: Args): Return;
  /** The function that is being spied on. */
  original: (this: Self, ...args: Args) => Return;
  /** Information about calls made to the function or instance method. */
  calls: SpyCallProp<Self, Args, Return>[];
  /** Whether or not the original instance method has been restoredTest. */
  restoredTest: boolean;
  /** If spying on an instance method, this restoreTests the original instance method. */
  restoreTest(): void;
}
//#endregion SpyProp

/*###############################################(METHOD SPY)###############################################*/
//#region MethodSpyProp
/** An instance method wrapper that records all calls made to it. */
export interface MethodSpyProp<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> extends SpyProp<Self, Args, Return>,
    Disposable {}
//#endregion MethodSpyProp

/*###############################################(FUNCTION SPY)###############################################*/
//#region functionSpyProp
/** Wraps a function with a SpyProp. */
function functionSpyProp<Self, Args extends unknown[], Return>(
  func?: (this: Self, ...args: Args) => Return
): SpyProp<Self, Args, Return> {
  const original =
    func ?? ((() => {}) as (this: Self, ...args: Args) => Return);
  const calls: SpyCallProp<Self, Args, Return>[] = [];
  const spy = function (this: Self, ...args: Args): Return {
    const call: SpyCallProp<Self, Args, Return> = { args };
    if (this) call.self = this;
    try {
      call.returned = original.apply(this, args);
    } catch (error) {
      call.error = error as Error;
      calls.push(call);
      throw error;
    }
    calls.push(call);
    return call.returned;
  } as SpyProp<Self, Args, Return>;
  Object.defineProperties(spy, {
    original: {
      enumerable: true,
      value: original,
    },
    calls: {
      enumerable: true,
      value: calls,
    },
    restoredTest: {
      enumerable: true,
      get: () => false,
    },
    restoreTest: {
      enumerable: true,
      value: () => {
        throw new MockError(
          "Cannot restoreTest: function cannot be restoredTest"
        );
      },
    },
  });
  return spy;
}
//#endregion functionSpyProp

/*###############################################(MOCK SESSION)###############################################*/
//#region mockSession
/**
 * Creates a session that tracks all mocks created before it's restoredTest.
 * If a callback is provided, it restoreTests all mocks created within it.
 *
 * @example Usage
 * ```ts
 * import { mockSession, restoreTest, stub } from "@inspatial/test/mock";
 * import { assertEquals, assertNotEquals } from "@inspatial/test/assert";
 *
 * const setTimeout = globalThis.setTimeout;
 * const id = mockSession();
 *
 * stub(globalThis, "setTimeout");
 *
 * assertNotEquals(globalThis.setTimeout, setTimeout);
 *
 * restoreTest(id);
 *
 * assertEquals(globalThis.setTimeout, setTimeout);
 * ```
 *
 * @returns The id of the created session.
 */
export function mockSession(): number;
/**
 * Creates a session that tracks all mocks created before it's restoredTest.
 * If a callback is provided, it restoreTests all mocks created within it.
 *
 * @example Usage
 * ```ts
 * import { mockSession, restoreTest, stub } from "@inspatial/test/mock";
 * import { assertEquals, assertNotEquals } from "@inspatial/test/assert";
 *
 * const setTimeout = globalThis.setTimeout;
 * const session = mockSession(() => {
 *   stub(globalThis, "setTimeout");
 *   assertNotEquals(globalThis.setTimeout, setTimeout);
 * });
 *
 * session();
 *
 * assertEquals(globalThis.setTimeout, setTimeout); // stub is restoredTest
 * ```
 *
 * @typeParam Self The self type of the function.
 * @typeParam Args The arguments type of the function.
 * @typeParam Return The return type of the function.
 * @param func The function to be used for the created session.
 * @returns The function to execute the session.
 */
export function mockSession<Self, Args extends unknown[], Return>(
  func: (this: Self, ...args: Args) => Return
): (this: Self, ...args: Args) => Return;
export function mockSession<Self, Args extends unknown[], Return>(
  func?: (this: Self, ...args: Args) => Return
): number | ((this: Self, ...args: Args) => Return) {
  if (func) {
    return function (this: Self, ...args: Args): Return {
      const id = testSessions.length;
      testSessions.push(new Set());
      try {
        return func.apply(this, args);
      } finally {
        restoreTest(id);
      }
    };
  } else {
    testSessions.push(new Set());
    return testSessions.length - 1;
  }
}
//#endregion mockSession

/*###############################################(MOCK SESSION ASYNC)###############################################*/
//#region mockSessionAsync
/**
 * Creates an async session that tracks all mocks created before the promise resolves.
 *
 * @example Usage
 * ```ts
 * import { mockSessionAsync, restoreTest, stub } from "@inspatial/test/mock";
 * import { assertEquals, assertNotEquals } from "@inspatial/test/assert";
 *
 * const setTimeout = globalThis.setTimeout;
 * const session = mockSessionAsync(async () => {
 *   stub(globalThis, "setTimeout");
 *   assertNotEquals(globalThis.setTimeout, setTimeout);
 * });
 *
 * await session();
 *
 * assertEquals(globalThis.setTimeout, setTimeout); // stub is restoredTest
 * ```
 * @typeParam Self The self type of the function.
 * @typeParam Args The arguments type of the function.
 * @typeParam Return The return type of the function.
 * @param func The function.
 * @returns The return value of the function.
 */
export function mockSessionAsync<Self, Args extends unknown[], Return>(
  func: (this: Self, ...args: Args) => Promise<Return>
): (this: Self, ...args: Args) => Promise<Return> {
  return async function (this: Self, ...args: Args): Promise<Return> {
    const id = testSessions.length;
    testSessions.push(new Set());
    try {
      return await func.apply(this, args);
    } finally {
      restoreTest(id);
    }
  };
}
//#endregion mockSessionAsync

/*###############################################(restoreTest)###############################################*/
//#region restoreTest
/**
 * restoreTests all mocks registered in the current session that have not already been restoredTest.
 * If an id is provided, it will restoreTest all mocks registered in the session associed with that id that have not already been restoredTest.
 *
 * @example Usage
 * ```ts
 * import { mockSession, restoreTest, stub } from "@inspatial/test/mock";
 * import { assertEquals, assertNotEquals } from "@inspatial/test/assert";
 *
 * const setTimeout = globalThis.setTimeout;
 *
 * stub(globalThis, "setTimeout");
 *
 * assertNotEquals(globalThis.setTimeout, setTimeout);
 *
 * restoreTest();
 *
 * assertEquals(globalThis.setTimeout, setTimeout);
 * ```
 *
 * @param id The id of the session to restoreTest. If not provided, all mocks registered in the current session are restoredTest.
 */
export function restoreTest(id?: number) {
  id ??= (testSessions.length || 1) - 1;
  while (id < testSessions.length) {
    const session = testSessions.pop();
    if (session) {
      for (const value of session) {
        value.restoreTest();
      }
    }
  }
}
//#endregion restoreTest

/*###############################################(METHOD SPY)###############################################*/
//#region methodSpy
/** Wraps an instance method with a SpyProp. */
function methodSpy<Self, Args extends unknown[], Return>(
  self: Self,
  property: keyof Self
): MethodSpyProp<Self, Args, Return> {
  if (typeof self[property] !== "function") {
    throw new MockError("Cannot spy: property is not an instance method");
  }
  if (isTestSpy(self[property])) {
    throw new MockError("Cannot spy: already spying on instance method");
  }

  const propertyDescriptor = Object.getOwnPropertyDescriptor(self, property);
  if (propertyDescriptor && !propertyDescriptor.configurable) {
    throw new MockError("Cannot spy: non-configurable instance method");
  }

  const original = self[property] as unknown as (
    this: Self,
    ...args: Args
  ) => Return;
  const calls: SpyCallProp<Self, Args, Return>[] = [];
  let restoredTest = false;
  const spy = function (this: Self, ...args: Args): Return {
    const call: SpyCallProp<Self, Args, Return> = { args };
    if (this) call.self = this;
    try {
      call.returned = original.apply(this, args);
    } catch (error) {
      call.error = error as Error;
      calls.push(call);
      throw error;
    }
    calls.push(call);
    return call.returned;
  } as MethodSpyProp<Self, Args, Return>;
  Object.defineProperties(spy, {
    original: {
      enumerable: true,
      value: original,
    },
    calls: {
      enumerable: true,
      value: calls,
    },
    dTest: {
      enumerable: true,
      get: () => restoredTest,
    },
    restoreTest: {
      enumerable: true,
      value: () => {
        if (restoredTest) {
          throw new MockError(
            "Cannot restoreTest: instance method already restoredTest"
          );
        }
        if (propertyDescriptor) {
          Object.defineProperty(self, property, propertyDescriptor);
        } else {
          delete self[property];
        }
        restoredTest = true;
        unregisterMock(spy);
      },
    },
    [Symbol.dispose]: {
      value: () => {
        spy.restoreTest();
      },
    },
  });

  Object.defineProperty(self, property, {
    configurable: true,
    enumerable: propertyDescriptor?.enumerable ?? false,
    writable: propertyDescriptor?.writable ?? false,
    value: spy,
  });

  registerMock(spy);
  return spy;
}
//#endregion methodSpy

/*###############################################(CONSTRUCTOR SPY)###############################################*/
//#region constructorSpy
/** A constructor wrapper that records all calls made to it. */
export interface ConstructorSpyProp<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
> {
  /** Construct an instance. */
  new (...args: Args): Self;
  /** The function that is being spied on. */
  original: new (...args: Args) => Self;
  /** Information about calls made to the function or instance method. */
  calls: SpyCallProp<Self, Args, Self>[];
  /** Whether or not the original instance method has been restoredTest. */
  restoredTest: boolean;
  /** If spying on an instance method, this restoreTests the original instance method. */
  restoreTest(): void;
}

/** Wraps a constructor with a SpyProp. */
function constructorSpy<Self, Args extends unknown[]>(
  constructor: new (...args: Args) => Self
): ConstructorSpyProp<Self, Args> {
  const original = constructor;
  const calls: SpyCallProp<Self, Args, Self>[] = [];
  // @ts-ignore TS2509: Can't know the type of `original` statically.
  const spy = class extends original {
    // deno-lint-ignore constructor-super
    constructor(...args: Args) {
      const call: SpyCallProp<Self, Args, Self> = { args };
      try {
        super(...args);
        call.returned = this as unknown as Self;
      } catch (error) {
        call.error = error as Error;
        calls.push(call);
        throw error;
      }
      calls.push(call);
    }
    static readonly name = original.name;
    static readonly original = original;
    static readonly calls = calls;
    static readonly restoredTest = false;
    static restoreTest() {
      throw new MockError(
        "Cannot restoreTest: constructor cannot be restoredTest"
      );
    }
  } as ConstructorSpyProp<Self, Args>;
  return spy;
}
//#endregion constructorSpy

/*###############################################(GET PARAMETERS FROM PROP)###############################################*/
//#region getParametersFromProp
/**
 * Utility for extracting the arguments type from a property
 *
 * @internal
 */
export type GetParametersFromProp<
  Self,
  Prop extends keyof Self,
> = Self[Prop] extends (...args: infer Args) => unknown ? Args : unknown[];
//#endregion getParametersFromProp

/*###############################################(GET RETURN FROM PROP)###############################################*/
//#region getReturnFromProp
/**
 * Utility for extracting the return type from a property
 *
 * @internal
 */
export type GetReturnFromProp<
  Self,
  Prop extends keyof Self,
> = Self[Prop] extends (...args: any[]) => infer Return ? Return : unknown; // deno-lint-ignore no-explicit-any
//#endregion getReturnFromProp

/*###############################################(SPY LIKE)###############################################*/
//#region spyLike
/** SpyPropLink object type. */
export type SpyLikeProp<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> = SpyProp<Self, Args, Return> | ConstructorSpyProp<Self, Args>;
//#endregion spyLike

/*###############################################(SPY)###############################################*/
//#region spy
/** Creates a spy function.
 *
 * @example Usage
 * ```ts
 * import {
 *   assertSpyCall,
 *   assertSpyCalls,
 *   spy,
 * } from "@inspatial/test/mock";
 *
 * const func = spy();
 *
 * func();
 * func(1);
 * func(2, 3);
 *
 * assertSpyCalls(func, 3);
 *
 * // asserts each call made to the spy function.
 * assertSpyCall(func, 0, { args: [] });
 * assertSpyCall(func, 1, { args: [1] });
 * assertSpyCall(func, 2, { args: [2, 3] });
 * ```
 *
 * @typeParam Self The self type of the function.
 * @typeParam Args The arguments type of the function.
 * @typeParam Return The return type of the function.
 * @returns The spy function.
 */
export function spy<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  Return = undefined,
>(): SpyProp<Self, Args, Return>;
//#endregion spy

/*###############################################(SPY WITH IMPLEMENTATION)###############################################*/
//#region spyWithImplementation
/**
 * Create a spy function with the given implementation.
 *
 * @example Usage
 * ```ts
 * import {
 *   assertSpyCall,
 *   assertSpyCalls,
 *   spy,
 * } from "@inspatial/test/mock";
 *
 * const func = spy((a: number, b: number) => a + b);
 *
 * func(3, 4);
 * func(5, 6);
 *
 * assertSpyCalls(func, 2);
 *
 * // asserts each call made to the spy function.
 * assertSpyCall(func, 0, { args: [3, 4], returned: 7 });
 * assertSpyCall(func, 1, { args: [5, 6], returned: 11 });
 * ```
 *
 * @typeParam Self The self type of the function to wrap
 * @typeParam Args The arguments type of the function to wrap
 * @typeParam Return The return type of the function to wrap
 * @param func The function to wrap
 * @returns The wrapped function.
 */
export function spy<Self, Args extends unknown[], Return>(
  func: (this: Self, ...args: Args) => Return
): SpyProp<Self, Args, Return>;
//#endregion spyWithImplementation

/*###############################################(SPY CONSTRUCTOR)###############################################*/
//#region spyConstructor
/**
 * Create a spy constructor.
 *
 * @example Usage
 * ```ts
 * import {
 *   assertSpyCall,
 *   assertSpyCalls,
 *   spy,
 * } from "@inspatial/test/mock";
 *
 * class Foo {
 *   constructor(value: string) {}
 * };
 *
 * const Constructor = spy(Foo);
 *
 * new Constructor("foo");
 * new Constructor("bar");
 *
 * assertSpyCalls(Constructor, 2);
 *
 * // asserts each call made to the spy function.
 * assertSpyCall(Constructor, 0, { args: ["foo"] });
 * assertSpyCall(Constructor, 1, { args: ["bar"] });
 * ```
 *
 * @typeParam Self The type of the instance of the class.
 * @typeParam Args The arguments type of the constructor
 * @param constructor The constructor to spy.
 * @returns The wrapped constructor.
 */
export function spy<Self, Args extends unknown[]>(
  constructor: new (...args: Args) => Self
): ConstructorSpyProp<Self, Args>;
//#endregion spyConstructor

/*###############################################(SPY METHOD)###############################################*/
//#region spyMethod
/**
 * Wraps a instance method with a SpyProp.
 *
 * @example Usage
 * ```ts
 * import {
 *   assertSpyCall,
 *   assertSpyCalls,
 *   spy,
 * } from "@inspatial/test/mock";
 *
 * const obj = {
 *   method(a: number, b: number): number {
 *     return a + b;
 *   },
 * };
 *
 * const methodSpy = spy(obj, "method");
 *
 * obj.method(1, 2);
 * obj.method(3, 4);
 *
 * assertSpyCalls(methodSpy, 2);
 *
 * // asserts each call made to the spy function.
 * assertSpyCall(methodSpy, 0, { args: [1, 2], returned: 3 });
 * assertSpyCall(methodSpy, 1, { args: [3, 4], returned: 7 });
 * ```
 *
 * @typeParam Self The type of the instance to spy the method of.
 * @typeParam Prop The property to spy.
 * @param self The instance to spy.
 * @param property The property of the method to spy.
 * @returns The spy function.
 */
export function spy<Self, Prop extends keyof Self>(
  self: Self,
  property: Prop
): MethodSpyProp<
  Self,
  GetParametersFromProp<Self, Prop>,
  GetReturnFromProp<Self, Prop>
>;
//#endregion spyMethod

/*###############################################(SPY)###############################################*/
//#region spy
export function spy<Self, Args extends unknown[], Return>(
  funcOrConstOrSelf?:
    | ((this: Self, ...args: Args) => Return)
    | (new (...args: Args) => Self)
    | Self,
  property?: keyof Self
): SpyLikeProp<Self, Args, Return> {
  if (!funcOrConstOrSelf) {
    return functionSpyProp<Self, Args, Return>();
  } else if (property !== undefined) {
    return methodSpy<Self, Args, Return>(funcOrConstOrSelf as Self, property);
  } else if (funcOrConstOrSelf.toString().startsWith("class")) {
    return constructorSpy<Self, Args>(
      funcOrConstOrSelf as new (...args: Args) => Self
    );
  } else {
    return functionSpyProp<Self, Args, Return>(
      funcOrConstOrSelf as (this: Self, ...args: Args) => Return
    );
  }
}
//#endregion spy

/*###############################################(STUB)###############################################*/
//#region stub
/** An instance method replacement that records all calls made to it. */
export interface StubProp<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> extends MethodSpyProp<Self, Args, Return> {
  /** The function that is used instead of the original. */
  fake: (this: Self, ...args: Args) => Return;
}
//#endregion stub

/*###############################################(STUB)###############################################*/
//#region stub

/**
 * Replaces an instance method with a StubProp with empty implementation.
 *
 * @example Usage
 * ```ts
 * import { stub, assertSpyCalls } from "@inspatial/test/mock";
 *
 * const obj = {
 *   method() {
 *     // some inconventient feature for testing
 *   },
 * };
 *
 * const methodStub = stub(obj, "method");
 *
 * for (const _ of Array(5)) {
 *   obj.method();
 * }
 *
 * assertSpyCalls(methodStub, 5);
 * ```

 *
 * @typeParam Self The self type of the instance to replace a method of.
 * @typeParam Prop The property of the instance to replace.
 * @param self The instance to replace a method of.
 * @param property The property of the instance to replace.
 * @returns The stub function which replaced the original.
 */

//#endregion stub
/*###############################################(STUB)###############################################*/
//#region stub
export function stub<Self, Prop extends keyof Self>(
  self: Self,
  property: Prop
): StubProp<
  Self,
  GetParametersFromProp<Self, Prop>,
  GetReturnFromProp<Self, Prop>
>;
/**
 * Replaces an instance method with a StubProp with the given implementation.
 *
 * @example Usage
 * ```ts
 * import { stub } from "@inspatial/test/mock";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * const obj = {
 *   method(): number {
 *     return Math.random();
 *   },
 * };
 *
 * const methodStub = stub(obj, "method", () => 0.5);
 *
 * assertEquals(obj.method(), 0.5);
 * ```
 *
 * @typeParam Self The self type of the instance to replace a method of.
 * @typeParam Prop The property of the instance to replace.
 * @param self The instance to replace a method of.
 * @param property The property of the instance to replace.
 * @param func The fake implementation of the function.
 * @returns The stub function which replaced the original.
 */
export function stub<Self, Prop extends keyof Self>(
  self: Self,
  property: Prop,
  func: (
    this: Self,
    ...args: GetParametersFromProp<Self, Prop>
  ) => GetReturnFromProp<Self, Prop>
): StubProp<
  Self,
  GetParametersFromProp<Self, Prop>,
  GetReturnFromProp<Self, Prop>
>;
export function stub<Self, Args extends unknown[], Return>(
  self: Self,
  property: keyof Self,
  func?: (this: Self, ...args: Args) => Return
): StubProp<Self, Args, Return> {
  if (self[property] !== undefined && typeof self[property] !== "function") {
    throw new MockError("Cannot stub: property is not an instance method");
  }
  if (isTestSpy(self[property])) {
    throw new MockError("Cannot stub: already spying on instance method");
  }

  const propertyDescriptor = Object.getOwnPropertyDescriptor(self, property);
  if (propertyDescriptor && !propertyDescriptor.configurable) {
    throw new MockError("Cannot stub: non-configurable instance method");
  }

  const fake = func ?? ((() => {}) as (this: Self, ...args: Args) => Return);

  const original = self[property] as unknown as (
    this: Self,
    ...args: Args
  ) => Return;
  const calls: SpyCallProp<Self, Args, Return>[] = [];
  let restoredTest = false;
  const stub = function (this: Self, ...args: Args): Return {
    const call: SpyCallProp<Self, Args, Return> = { args };
    if (this) call.self = this;
    try {
      call.returned = fake.apply(this, args);
    } catch (error) {
      call.error = error as Error;
      calls.push(call);
      throw error;
    }
    calls.push(call);
    return call.returned;
  } as StubProp<Self, Args, Return>;
  Object.defineProperties(stub, {
    original: {
      enumerable: true,
      value: original,
    },
    fake: {
      enumerable: true,
      value: fake,
    },
    calls: {
      enumerable: true,
      value: calls,
    },
    restoredTest: {
      enumerable: true,
      get: () => restoredTest,
    },
    restoreTest: {
      enumerable: true,
      value: () => {
        if (restoredTest) {
          throw new MockError(
            "Cannot restoreTest: instance method already restoredTest"
          );
        }
        if (propertyDescriptor) {
          Object.defineProperty(self, property, propertyDescriptor);
        } else {
          delete self[property];
        }
        restoredTest = true;
        unregisterMock(stub);
      },
    },
    [Symbol.dispose]: {
      value: () => {
        stub.restoreTest();
      },
    },
  });

  Object.defineProperty(self, property, {
    configurable: true,
    enumerable: propertyDescriptor?.enumerable ?? false,
    writable: propertyDescriptor?.writable ?? false,
    value: stub,
  });

  registerMock(stub);
  return stub;
}
//#endregion stub

/*###############################################(ASSERT SPY CALLS)###############################################*/
//#region assertSpyCalls
/**
 * Asserts that a spy is called as much as expected and no more.
 *
 * @example Usage
 * ```ts
 * import { assertSpyCalls, spy } from "@inspatial/test/mock";
 *
 * const func = spy();
 *
 * func();
 * func();
 *
 * assertSpyCalls(func, 2);
 * ```
 *
 * @typeParam Self The self type of the spy function.
 * @typeParam Args The arguments type of the spy function.
 * @typeParam Return The return type of the spy function.
 * @param spy The spy to check
 * @param expectedCalls The number of the expected calls.
 */
export function assertSpyCalls<Self, Args extends unknown[], Return>(
  spy: SpyLikeProp<Self, Args, Return>,
  expectedCalls: number
) {
  try {
    assertEquals(spy.calls.length, expectedCalls);
  } catch (e) {
    assertIsError(e);
    let message =
      spy.calls.length < expectedCalls
        ? "SpyProp not called as much as expected:\n"
        : "SpyProp called more than expected:\n";
    message += e.message.split("\n").slice(1).join("\n");
    throw new AssertionError(message);
  }
}
//#endregion assertSpyCalls

/*###############################################(EXPECTED SPY CALL)###############################################*/
//#region ExpectedSpyCallProp
/** Call information recorded by a spy. */
export interface ExpectedSpyCallProp<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
  // deno-lint-ignore no-explicit-any
  Return = any,
> {
  /** Arguments passed to a function when called. */
  args?: [...Args, ...unknown[]];
  /** The instance that a method was called on. */
  self?: Self;
  /**
   * The value that was returned by a function.
   * If you expect a promise to reject, expect error instead.
   */
  returned?: Return;
  /** The expected thrown error. */
  error?: {
    /** The class for the error that was thrown by a function. */
    // deno-lint-ignore no-explicit-any
    Class?: new (...args: any[]) => Error;
    /** Part of the message for the error that was thrown by a function. */
    msgIncludes?: string;
  };
}

function getSpyCall<Self, Args extends unknown[], Return>(
  spy: SpyLikeProp<Self, Args, Return>,
  callIndex: number
): SpyCallProp {
  if (spy.calls.length < callIndex + 1) {
    throw new AssertionError("SpyProp not called as much as expected");
  }
  return spy.calls[callIndex]!;
}
//#endregion getSpyCall

/*###############################################(ASSERT SPY CALL)###############################################*/
//#region assertSpyCall
/**
 * Asserts that a spy is called as expected.
 *
 * @example Usage
 * ```ts
 * import { assertSpyCall, spy } from "@inspatial/test/mock";
 *
 * const func = spy((a: number, b: number) => a + b);
 *
 * func(3, 4);
 * func(5, 6);
 *
 * // asserts each call made to the spy function.
 * assertSpyCall(func, 0, { args: [3, 4], returned: 7 });
 * assertSpyCall(func, 1, { args: [5, 6], returned: 11 });
 * ```
 *
 * @typeParam Self The self type of the spy function.
 * @typeParam Args The arguments type of the spy function.
 * @typeParam Return The return type of the spy function.
 * @param spy The spy to check
 * @param callIndex The index of the call to check
 * @param expected The expected spy call.
 */
export function assertSpyCall<Self, Args extends unknown[], Return>(
  spy: SpyLikeProp<Self, Args, Return>,
  callIndex: number,
  expected?: ExpectedSpyCallProp<Self, Args, Return>
) {
  const call = getSpyCall(spy, callIndex);
  if (expected) {
    if (expected.args) {
      try {
        assertEquals(call.args, expected.args);
      } catch (e) {
        assertIsError(e);
        throw new AssertionError(
          "SpyProp not called with expected args:\n" +
            e.message.split("\n").slice(1).join("\n")
        );
      }
    }

    if ("self" in expected) {
      try {
        assertEquals(call.self, expected.self);
      } catch (e) {
        assertIsError(e);
        let message = expected.self
          ? "SpyProp not called as method on expected self:\n"
          : "SpyProp not expected to be called as method on object:\n";
        message += e.message.split("\n").slice(1).join("\n");
        throw new AssertionError(message);
      }
    }

    if ("returned" in expected) {
      if ("error" in expected) {
        throw new TypeError(
          "Do not expect error and return, only one should be expected"
        );
      }
      if (call.error) {
        throw new AssertionError(
          "SpyProp call did not return expected value, an error was thrown."
        );
      }
      try {
        assertEquals(call.returned, expected.returned);
      } catch (e) {
        assertIsError(e);
        throw new AssertionError(
          "SpyProp call did not return expected value:\n" +
            e.message.split("\n").slice(1).join("\n")
        );
      }
    }

    if ("error" in expected) {
      if ("returned" in call) {
        throw new AssertionError(
          "SpyProp call did not throw an error, a value was returned."
        );
      }
      assertIsError(
        call.error,
        expected.error?.Class,
        expected.error?.msgIncludes
      );
    }
  }
}
//#endregion assertSpyCall

/*###############################################(ASSERT SPY CALL ASYNC)###############################################*/
//#region assertSpyCallAsync
/**
 * Asserts that an async spy is called as expected.
 *
 * @example Usage
 * ```ts
 * import { assertSpyCallAsync, spy } from "@inspatial/test/mock";
 *
 * const func = spy((a: number, b: number) => new Promise((resolve) => {
 *   setTimeout(() => resolve(a + b), 100)
 * }));
 *
 * await func(3, 4);
 * await func(5, 6);
 *
 * // asserts each call made to the spy function.
 * await assertSpyCallAsync(func, 0, { args: [3, 4], returned: 7 });
 * await assertSpyCallAsync(func, 1, { args: [5, 6], returned: 11 });
 * ```
 *
 * @typeParam Self The self type of the spy function.
 * @typeParam Args The arguments type of the spy function.
 * @typeParam Return The return type of the spy function.
 * @param spy The spy to check
 * @param callIndex The index of the call to check
 * @param expected The expected spy call.
 */
export async function assertSpyCallAsync<Self, Args extends unknown[], Return>(
  spy: SpyLikeProp<Self, Args, Promise<Return>>,
  callIndex: number,
  expected?: ExpectedSpyCallProp<Self, Args, Promise<Return> | Return>
) {
  const expectedSync = expected && { ...expected };
  if (expectedSync) {
    delete expectedSync.returned;
    delete expectedSync.error;
  }
  assertSpyCall(spy, callIndex, expectedSync);
  const call = getSpyCall(spy, callIndex);

  if (call.error) {
    throw new AssertionError(
      "SpyProp call did not return a promise, an error was thrown."
    );
  }
  if (call.returned !== Promise.resolve(call.returned)) {
    throw new AssertionError(
      "SpyProp call did not return a promise, a value was returned."
    );
  }

  if (expected) {
    if ("returned" in expected) {
      if ("error" in expected) {
        throw new TypeError(
          "Do not expect error and return, only one should be expected"
        );
      }
      let expectedResolved;
      try {
        expectedResolved = await expected.returned;
      } catch {
        throw new TypeError(
          "Do not expect rejected promise, expect error instead"
        );
      }

      let resolved;
      try {
        resolved = await call.returned;
      } catch {
        throw new AssertionError("SpyProp call returned promise was rejected");
      }

      try {
        assertEquals(resolved, expectedResolved);
      } catch (e) {
        assertIsError(e);
        throw new AssertionError(
          "SpyProp call did not resolve to expected value:\n" +
            e.message.split("\n").slice(1).join("\n")
        );
      }
    }

    if ("error" in expected) {
      await assertRejects(
        () => Promise.resolve(call.returned),
        expected.error?.Class ?? Error,
        expected.error?.msgIncludes ?? ""
      );
    }
  }
}
//#endregion assertSpyCallAsync

/*###############################################(ASSERT SPY CALL ARG)###############################################*/
//#region assertSpyCallArg
/**
 * Asserts that a spy is called with a specific arg as expected.
 *
 * @example Usage
 * ```ts
 * import { assertSpyCallArg, spy } from "@inspatial/test/mock";
 *
 * const func = spy((a: number, b: number) => a + b);
 *
 * func(3, 4);
 * func(5, 6);
 *
 * // asserts each call made to the spy function.
 * assertSpyCallArg(func, 0, 0, 3);
 * assertSpyCallArg(func, 0, 1, 4);
 * assertSpyCallArg(func, 1, 0, 5);
 * assertSpyCallArg(func, 1, 1, 6);
 * ```
 *
 * @typeParam Self The self type of the spy function.
 * @typeParam Args The arguments type of the spy function.
 * @typeParam Return The return type of the spy function.
 * @typeParam ExpectedArg The expected type of the argument for the spy to be called.
 * @param spy The spy to check.
 * @param callIndex The index of the call to check.
 * @param argIndex The index of the arguments to check.
 * @param expected The expected argument.
 * @returns The actual argument.
 */
export function assertSpyCallArg<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArg,
>(
  spy: SpyLikeProp<Self, Args, Return>,
  callIndex: number,
  argIndex: number,
  expected: ExpectedArg
): ExpectedArg {
  const call = getSpyCall(spy, callIndex);
  const arg = call?.args[argIndex];
  assertEquals(arg, expected);
  return arg as ExpectedArg;
}
//#endregion assertSpyCallArg

/*###############################################(ASSERT SPY CALL ARGS)###############################################*/
//#region assertSpyCallArgs

/**
 * Asserts that an spy is called with a specific range of args as expected.
 * If a start and end index is not provided, the expected will be compared against all args.
 * If a start is provided without an end index, the expected will be compared against all args from the start index to the end.
 * The end index is not included in the range of args that are compared.
 *
 * @example Usage
 * ```ts
 * import { assertSpyCallArgs, spy } from "@inspatial/test/mock";
 *
 * const func = spy((a: number, b: number) => a + b);
 *
 * func(3, 4);
 * func(5, 6);
 *
 * // asserts each call made to the spy function.
 * assertSpyCallArgs(func, 0, [3, 4]);
 * assertSpyCallArgs(func, 1, [5, 6]);
 * ```
 *
 * @typeParam Self The self type of the spy function.
 * @typeParam Args The arguments type of the spy function.
 * @typeParam Return The return type of the spy function.
 * @typeParam ExpectedArgs The expected type of the arguments for the spy to be called.
 * @param spy The spy to check.
 * @param callIndex The index of the call to check.
 * @param expected The expected arguments.
 * @returns The actual arguments.
 */
export function assertSpyCallArgs<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArgs extends unknown[],
>(
  spy: SpyLikeProp<Self, Args, Return>,
  callIndex: number,
  expected: ExpectedArgs
): ExpectedArgs;
//#endregion assertSpyCallArgs

/*###############################################(ASSERT SPY CALL ARGS)###############################################*/
//#region assertSpyCallArgs
/**
 * Asserts that an spy is called with a specific range of args as expected.
 * If a start and end index is not provided, the expected will be compared against all args.
 * If a start is provided without an end index, the expected will be compared against all args from the start index to the end.
 * The end index is not included in the range of args that are compared.
 *
 * @example Usage
 * ```ts
 * import { assertSpyCallArgs, spy } from "@inspatial/test/mock";
 *
 * const func = spy((...args) => {});
 *
 * func(0, 1, 2, 3, 4, 5);
 *
 * assertSpyCallArgs(func, 0, 3, [3, 4, 5]);
 * ```
 *
 * @typeParam Self The self type of the spy function.
 * @typeParam Args The arguments type of the spy function.
 * @typeParam Return The return type of the spy function.
 * @typeParam ExpectedArgs The expected type of the arguments for the spy to be called.
 * @param spy The spy to check.
 * @param callIndex The index of the call to check.
 * @param argsStart The start index of the arguments to check. If not specified, it checks the arguments from the beignning.
 * @param expected The expected arguments.
 * @returns The actual arguments.
 */
export function assertSpyCallArgs<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArgs extends unknown[],
>(
  spy: SpyLikeProp<Self, Args, Return>,
  callIndex: number,
  argsStart: number,
  expected: ExpectedArgs
): ExpectedArgs;
//#endregion assertSpyCallArgs

/*###############################################(ASSERT SPY CALL ARGS)###############################################*/
//#region assertSpyCallArgs
/**
 * Asserts that an spy is called with a specific range of args as expected.
 * If a start and end index is not provided, the expected will be compared against all args.
 * If a start is provided without an end index, the expected will be compared against all args from the start index to the end.
 * The end index is not included in the range of args that are compared.
 *
 * @example Usage
 * ```ts
 * import { assertSpyCallArgs, spy } from "@inspatial/test/mock";
 *
 * const func = spy((...args) => {});
 *
 * func(0, 1, 2, 3, 4, 5);
 *
 * assertSpyCallArgs(func, 0, 3, 4, [3]);
 * ```
 *
 * @typeParam Self The self type of the spy function.
 * @typeParam Args The arguments type of the spy function.
 * @typeParam Return The return type of the spy function.
 * @typeParam ExpectedArgs The expected type of the arguments for the spy to be called.
 * @param spy The spy to check
 * @param callIndex The index of the call to check
 * @param argsStart The start index of the arguments to check. If not specified, it checks the arguments from the beignning.
 * @param argsEnd The end index of the arguments to check. If not specified, it checks the arguments until the end.
 * @param expected The expected arguments.
 * @returns The actual arguments
 */
export function assertSpyCallArgs<
  Self,
  Args extends unknown[],
  Return,
  ExpectedArgs extends unknown[],
>(
  spy: SpyLikeProp<Self, Args, Return>,
  callIndex: number,
  argsStart: number,
  argsEnd: number,
  expected: ExpectedArgs
): ExpectedArgs;
export function assertSpyCallArgs<
  ExpectedArgs extends unknown[],
  Args extends unknown[],
  Return,
  Self,
>(
  spy: SpyLikeProp<Self, Args, Return>,
  callIndex: number,
  argsStart?: number | ExpectedArgs,
  argsEnd?: number | ExpectedArgs,
  expected?: ExpectedArgs
): ExpectedArgs {
  const call = getSpyCall(spy, callIndex);
  if (!expected) {
    expected = argsEnd as ExpectedArgs;
    argsEnd = undefined;
  }
  if (!expected) {
    expected = argsStart as ExpectedArgs;
    argsStart = undefined;
  }
  const args =
    typeof argsEnd === "number"
      ? call.args.slice(argsStart as number, argsEnd)
      : typeof argsStart === "number"
        ? call.args.slice(argsStart)
        : call.args;
  assertEquals(args, expected);
  return args as ExpectedArgs;
}
//#endregion assertSpyCallArgs

/*###############################################(RETURNS)###############################################*/
//#region returns
/**
 * Creates a function that returns the instance the method was called on.
 *
 * @example Usage
 * ```ts
 * import { returnsThis } from "@inspatial/test/mock";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * const func = returnsThis();
 * const obj = { func };
 * assertEquals(obj.func(), obj);
 * ```
 *
 * @typeParam Self The self type of the returned function.
 * @typeParam Args The arguments type of the returned function.
 * @returns A function that returns the instance the method was called on.
 */
export function returnsThis<
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
>(): (this: Self, ...args: Args) => Self {
  return function (this: Self): Self {
    return this;
  };
}
//#endregion returns

/*###############################################(RETURNS)###############################################*/
//#region returnsTestArg
/**
 * Creates a function that returns one of its arguments.
 *
 * @example Usage
 * ```ts
 * import { returnsTestArg } from "@inspatial/test/mock";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * const func = returnsTestArg(1);
 * assertEquals(func(1, 2, 3), 2);
 * ```
 *
 * @typeParam Arg The type of returned argument.
 * @typeParam Self The self type of the returned function.
 * @param idx The index of the arguments to use.
 * @returns A function that returns one of its arguments.
 */
export function returnsTestArg<
  Arg,
  // deno-lint-ignore no-explicit-any
  Self = any,
>(idx: number): (this: Self, ...args: Arg[]) => Arg | undefined {
  return function (...args: Arg[]): Arg | undefined {
    return args[idx];
  };
}

/**
 * Creates a function that returns its arguments or a subset of them. If end is specified, it will return arguments up to but not including the end.
 *
 * @example Usage
 * ```ts
 * import { returnsTestArgs } from "@inspatial/test/mock";
 * import { assertEquals } from "@inspatial/test/assert";
 *
 * const func = returnsTestArgs();
 * assertEquals(func(1, 2, 3), [1, 2, 3]);
 * ```
 *
 * @typeParam Args The arguments type of the returned function
 * @typeParam Self The self type of the returned function
 * @param start The start index of the arguments to return. Default is 0.
 * @param end The end index of the arguments to return.
 * @returns A function that returns its arguments or a subset of them.
 */
export function returnsTestArgs<
  Args extends unknown[],
  // deno-lint-ignore no-explicit-any
  Self = any,
>(start = 0, end?: number): (this: Self, ...args: Args) => Args {
  return function (this: Self, ...args: Args): Args {
    return args.slice(start, end) as Args;
  };
}
//#endregion returnsTestArgs

/*###############################################(RETURNS)###############################################*/
//#region returnsNext
/**
 * Creates a function that returns the iterable values. Any iterable values that are errors will be thrown.
 *
 * @example Usage
 * ```ts
 * import { returnsNext } from "@inspatial/test/mock";
 * import { assertEquals, assertThrows } from "@inspatial/test/assert";
 *
 * const func = returnsNext([1, 2, new Error("foo"), 3]);
 * assertEquals(func(), 1);
 * assertEquals(func(), 2);
 * assertThrows(() => func(), Error, "foo");
 * assertEquals(func(), 3);
 * ```
 *
 * @typeParam Return The type of each item of the iterable
 * @typeParam Self The self type of the returned function
 * @typeParam Args The arguments type of the returned function
 * @param values The iterable values
 * @return A function that returns the iterable values
 */
export function returnsNext<
  Return,
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
>(values: Iterable<Return | Error>): (this: Self, ...args: Args) => Return {
  const gen = (function* returnsValue() {
    yield* values;
  })();
  let calls = 0;
  return function () {
    const next = gen.next();
    if (next.done) {
      throw new MockError(
        `Not expected to be called more than ${calls} time(s)`
      );
    }
    calls++;
    const { value } = next;
    if (value instanceof Error) throw value;
    return value;
  };
}
//#endregion returnsNext

/*###############################################(RETURNS)###############################################*/
//#region resolvesNext
/**
 * Creates a function that resolves the awaited iterable values. Any awaited iterable values that are errors will be thrown.
 *
 * @example Usage
 * ```ts
 * import { resolvesNext } from "@inspatial/test/mock";
 * import { assertEquals, assertRejects } from "@inspatial/test/assert";
 *
 * const func = resolvesNext([1, 2, new Error("foo"), 3]);
 * assertEquals(await func(), 1);
 * assertEquals(await func(), 2);
 * assertRejects(() => func(), Error, "foo");
 * assertEquals(await func(), 3);
 * ```
 *
 * @typeParam Return The type of each item of the iterable
 * @typeParam Self The self type of the returned function
 * @typeParam Args The type of arguments of the returned function
 * @param iterable The iterable to use
 * @returns A function that resolves the awaited iterable values
 */
export function resolvesNext<
  Return,
  // deno-lint-ignore no-explicit-any
  Self = any,
  // deno-lint-ignore no-explicit-any
  Args extends unknown[] = any[],
>(
  iterable:
    | Iterable<Return | Error | Promise<Return | Error>>
    | AsyncIterable<Return | Error | Promise<Return | Error>>
): (this: Self, ...args: Args) => Promise<Return> {
  const gen = (async function* returnsValue() {
    yield* iterable;
  })();
  let calls = 0;
  return async function () {
    const next = await gen.next();
    if (next.done) {
      throw new MockError(
        `Not expected to be called more than ${calls} time(s)`
      );
    }
    calls++;
    const { value } = next;
    if (value instanceof Error) throw value;
    return value;
  };
}
//#endregion resolvesNext


// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
// Copyright 2019 Allain Lalonde. All rights reserved. ISC License.
// deno-lint-ignore-file no-explicit-any ban-types

/**
 * This module contains a function to mock functions for testing and assertions.
 *
 * ```ts
 * import { fn, expect } from "@std/expect";
 *
 * Deno.test("example", () => {
 *   const mockFn = fn((a: number, b: number) => a + b);
 *   const result = mockFn(1, 2);
 *   expect(result).toEqual(3);
 *   expect(mockFn).toHaveBeenCalledWith(1, 2);
 *   expect(mockFn).toHaveBeenCalledTimes(1);
 * });
 * ```
 *
 * @module
 */

/*###############################################(MOCKFN)###############################################*/
const MOCK_SYMBOL = Symbol.for("@MOCK");

type MockCall = {
  args: any[];
  returned?: any;
  thrown?: any;
  timestamp: number;
  returns: boolean;
  throws: boolean;
};
/**
 * Returns the calls made to a mock function.
 * @param f The mock function to get the calls from.
 * @returns The calls made to the mock function.
 */
export function getMockCalls(f: any): MockCall[] {
  const mockInfo = f[MOCK_SYMBOL];
  if (!mockInfo) {
    throw new Error("Received function must be a mock or spy function");
  }

  return [...mockInfo.calls];
}

/**
 * Creates a mock function that can be used for testing and assertions.
 *
 * @param stubs Functions to be used as stubs for different calls.
 * @returns A mock function that keeps track of calls and returns values based on the provided stubs.
 *
 * @example Usage
 * ```ts no-assert
 * import { mockFn, expect } from "@inspatial/test/mock";
 *
 * test("example", () => {
 *   const mockFn = mockFn(
 *     (a: number, b: number) => a + b,
 *     (a: number, b: number) => a - b
 *   );
 *   const result = mockFn(1, 2);
 *   expect(result).toEqual(3);
 *   expect(mockFn).toHaveBeenCalledWith(1, 2);
 *   expect(mockFn).toHaveBeenCalledTimes(1);
 *
 *   const result2 = mockFn(3, 2);
 *   expect(result2).toEqual(1);
 *   expect(mockFn).toHaveBeenCalledWith(3, 2);
 *   expect(mockFn).toHaveBeenCalledTimes(2);
 * });
 * ```
 */
export function mockFn(...stubs: Function[]): Function {
  const calls: MockCall[] = [];

  const f = (...args: any[]) => {
    const stub = stubs.length === 1
      // keep reusing the first
      ? stubs[0]
      // pick the exact mock for the current call
      : stubs[calls.length];

    try {
      const returned = stub ? stub(...args) : undefined;
      calls.push({
        args,
        returned,
        timestamp: Date.now(),
        returns: true,
        throws: false,
      });
      return returned;
    } catch (err) {
      calls.push({
        args,
        timestamp: Date.now(),
        returns: false,
        thrown: err,
        throws: true,
      });
      throw err;
    }
  };

  Object.defineProperty(f, MOCK_SYMBOL, {
    value: { calls },
    writable: false,
  });

  return f;
}
