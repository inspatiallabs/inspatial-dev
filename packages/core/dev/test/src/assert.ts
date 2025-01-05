/*#############################################(DOCUMENTATION)#############################################*/
/**
 * # Assert
 *
 * In testing, `assert` is a tool that helps you check if your code works correctly.
 * Think of it like a safety net that catches problems before they reach your users.
 *
 * ## Getting Started
 *
 * First, import what you need:
 * ```ts
 * import { test, assert } from "@inspatial/test";
 * ```
 *
 * ## Basic Testing
 *
 * There are two main ways to write tests: using `assert` or using `expect`.
 * But we are going to focus on `assert` in this documentation.
 *
 * ### Using Assert
 * ```ts
 * test({
 *   name: "check if numbers add correctly",
 *   fn: () => {
 *     const result = 2 + 2;
 *     assertEquals(result, 4);
 *   }
 * });
 * ```
 *
 * ## Main Features
 *
 * ### Checking Values (Assertions)
 *
 * - `assertEquals(actual, expected)`: Check if two things are equal
 * - `assertNotEquals(actual, expected)`: Check if two things are different
 * - `assertExists(value)`: Check if something exists (not null/undefined)
 * - `assertMatch(text, pattern)`: Check if text matches a pattern
 *
 * ### Comparing Numbers
 *
 * - `assertGreater(a, b)`: Check if a is bigger than b
 * - `assertLess(a, b)`: Check if a is smaller than b
 * - `assertGreaterOrEqual(a, b)`: Check if a is bigger or equal to b
 * - `assertLessOrEqual(a, b)`: Check if a is smaller or equal to b
 *
 * ### Working with Objects
 *
 * - `assertInstanceOf(object, type)`: Check if something is a specific type
 * - `assertObjectMatch(actual, expected)`: Check if objects have matching properties
 *
 * ### Testing Errors
 *
 * - `assertThrows(fn)`: Check if code throws an error
 * - `assertRejects(fn)`: Check if a promise fails
 *
 * ### Special Cases
 *
 * - `assertFail()`: Make a test fail on purpose
 * - `assertUnimplemented()`: Mark code as not finished
 * - `assertUnreachable()`: Mark code that should never run
 *
 * ##### NOTE: Writing Good Tests
 * - Give your tests clear names that explain what they check
 * - Test one thing at a time
 * - Use descriptive variable names
 * - Add helpful error messages
 *
 * ##### Terminology: Common Testing Terms
 * - **Test**: A piece of code that checks if another piece of code works correctly
 * - **Assert**: To check if something is true
 * - **Expect**: See {@link module:expect|Expect Module} for another way to write tests that reads more like English
 * - **Mock**: See {@link module:mock|Mock Module} for creating fake versions of things for testing
 *
 * ## Examples
 *
 * ### Testing a Simple Function
 * ```ts
 * function add(a: number, b: number): number {
 *   return a + b;
 * }
 *
 * test({
 *   name: "add function should work correctly",
 *   fn: () => {
 *     assertEquals(add(2, 2), 4);
 *     assertEquals(add(-1, 1), 0);
 *     assertEquals(add(0, 0), 0);
 *   }
 * });
 * ```
 *
 * ### Testing Error Cases
 * ```ts
 * function divide(a: number, b: number): number {
 *   if (b === 0) throw new Error("Cannot divide by zero");
 *   return a / b;
 * }
 *
 * test({
 *   name: "divide function should handle errors",
 *   fn: () => {
 *     // Test normal case
 *     assertEquals(divide(10, 2), 5);
 *
 *     // Test error case
 *     assertThrows(
 *       () => divide(10, 0),
 *       Error,
 *       "Cannot divide by zero"
 *     );
 *   }
 * });
 * ```
 *
 * ### Testing Async Code
 * ```ts
 * async function fetchUser(id: string) {
 *   if (!id) throw new Error("ID required");
 *   return { id, name: "Test User" };
 * }
 *
 * test({
 *   name: "fetchUser should work with valid ID",
 *   fn: async () => {
 *     const user = await fetchUser("123");
 *     assertEquals(user.name, "Test User");
 *
 *     await assertRejects(
 *       () => fetchUser(""),
 *       Error,
 *       "ID required"
 *     );
 *   }
 * });
 * ```
 *
 * @module
 */

/*#############################################(IMPORTS)#############################################*/
import {
  format,
  buildMessage,
  diff,
  differenceString,
} from "jsr:@inspatial/util@^0.0.7";
import { stripAnsiCode, red } from "jsr:@inspatial/theme@^0.0.2/color";

/*#############################################(TYPES)#############################################*/
/**
 * A type that represents any class or constructor.
 * Think of it as a blueprint for creating things.
 *
 * Example:
 * ```ts
 * import { AssertAnyConstructorProp } from '@inspatial/test';
 *
 * class Animal {}
 * class Dog {}
 *
 * // This can be any class
 * function createThing(ClassType: AssertAnyConstructorProp) {
 *   return new ClassType();
 * }
 *
 * createThing(Animal);
 * createThing(Dog);
 * ```
 */
export type AssertAnyConstructorProp = new (...args: any[]) => any;

/**
 * A type for anything that works like a list (has a length and numbered items).
 * This could be an array, string, or any other list-like thing.
 *
 * Example:
 * ```ts
 * import { AssertArrayLikeArgProp } from '@inspatial/test';
 *
 * function countItems(list: AssertArrayLikeArgProp) {
 *   return list.length;
 * }
 *
 * countItems([1, 2, 3]);       // Works with arrays
 * countItems("hello");         // Works with strings
 * ```
 */
export type AssertArrayLikeArgProp<T> = ArrayLike<T> & object;

/**
 * The type of error that happens when a test check fails.
 * This helps you identify when and why a test didn't work.
 *
 * Example:
 * ```ts
 * import { AssertAssertionErrorProp } from '@inspatial/test';
 *
 * try {
 *   // Test something
 *   if (2 + 2 !== 4) {
 *     throw new AssertAssertionErrorProp("Math is broken!");
 *   }
 * } catch (error) {
 *   if (error instanceof AssertAssertionErrorProp) {
 *     console.log("A test failed!");
 *   }
 * }
 * ```
 */
export type AssertAssertionErrorProp = AssertionError;

/**
 * Values that JavaScript considers as "false-like".
 * These are: false, 0, "", null, undefined
 *
 * Example:
 * ```ts
 * import { AssertFalsyProp } from '@inspatial/test';
 *
 * function checkIfEmpty(value: AssertFalsyProp) {
 *   if (!value) {
 *     console.log("Value is empty or false-like");
 *   }
 * }
 *
 * checkIfEmpty("");        // Works
 * checkIfEmpty(0);        // Works
 * checkIfEmpty(false);    // Works
 * checkIfEmpty(null);     // Works
 * checkIfEmpty(undefined);// Works
 * ```
 */
export type AssertFalsyProp = false | 0 | 0n | "" | null | undefined;

/**
 * Gets the type of thing a class creates.
 * Helps you work with the result of creating a new thing from a class.
 *
 * Example:
 * ```ts
 * import { AssertGetConstructorTypeProp } from '@inspatial/test';
 *
 * class Player {
 *   name: string = "Player 1";
 *   score: number = 0;
 * }
 *
 * // This will be the type of a Player instance
 * type PlayerInstance = AssertGetConstructorTypeProp<typeof Player>;
 *
 * // Now TypeScript knows this has name and score
 * const player: PlayerInstance = new Player();
 * ```
 */
export type AssertGetConstructorTypeProp<T extends AssertAnyConstructorProp> =
  InstanceType<T>;

/*#############################################(ASSERTION ERROR)#############################################*/
//#region AssertionError
/**
 * This class represents an error that occurs when an assertion fails.
 *
 * An assertion is a statement that a condition is true. If the condition is false,
 * an `AssertionError` is thrown. This is useful in testing or debugging to ensure
 * that your code behaves as expected.
 *
 * ### Usage
 *
 * You can create a new `AssertionError` by providing a message that describes the error.
 * Optionally, you can also provide additional options for the error.
 *
 * ```typescript
 * const error = new AssertionError("This is an assertion error");
 * ```
 *
 * ##### NOTE:
 * The `options` parameter is still unstable and may change in future releases.
 *
 * ##### Terminology:
 * **Assertion**: A statement that a condition is true. Used to verify that code behaves as expected.
 */
export class AssertionError extends Error {
  /**
   * Constructs a new instance of `AssertionError`.
   *
   * @param message - The error message that explains why the assertion failed.
   * @param options - Additional options for the error. This is optional and may change in the future.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AssertionError";
  }
}

/*#############################################(ASSERT)#############################################*/
//#region assert
/**
 * The `assert` function checks if something is true.
 * If it's not true, it stops your code and tells you there's a problem.
 *
 * ##### NOTE:
 * This is useful when you want to make sure certain conditions are met in your code.
 *
 * ##### Terminology:
 * `AssertionError`: This is a special kind of error that happens when something you expected to be true is not.
 *
 * Example:
 * ```ts
 * import { assert } from '@inspatial/test';
 *
 * const userAge = 25;
 * assert(userAge > 0, "Age must be positive");
 * ```
 *
 * ### Test Examples
 *
 * ```ts
 * import { test, assert } from "@inspatial/test";
 *
 * // Test using assert syntax
 * test({
 *   name: "assert should not throw for true expression",
 *   fn: () => {
 *     const isValid = true;
 *     assert(isValid, "This should not throw");
 *   }
 * });
 *
 * ```
 *
 * @param expr - This is what you want to check is true. It can be anything.
 * @param msg - This is the message to show if the check fails. It's optional.
 */
export function assert(expr: unknown, msg = ""): asserts expr {
  if (!expr) {
    throw new AssertionError(msg);
  }
}

/*#############################################(ASSERT EQUAL)#############################################*/
//#region assertEqual

type KeyedCollection = Set<unknown> | Map<unknown, unknown>;
function isKeyedCollection(x: unknown): x is KeyedCollection {
  return x instanceof Set || x instanceof Map;
}

function prototypesEqual(a: object, b: object) {
  const pa = Object.getPrototypeOf(a);
  const pb = Object.getPrototypeOf(b);
  return (
    pa === pb ||
    (pa === Object.prototype && pb === null) ||
    (pa === null && pb === Object.prototype)
  );
}

function isBasicObjectOrArray(obj: object) {
  const proto = Object.getPrototypeOf(obj);
  return (
    proto === null || proto === Object.prototype || proto === Array.prototype
  );
}

// Slightly faster than Reflect.ownKeys in V8 as of 12.9.202.13-rusty (2024-10-28)
function ownKeys(obj: object) {
  return [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj),
  ];
}

function getKeysDeep(obj: object) {
  const keys = new Set<string | symbol>();

  while (obj !== Object.prototype && obj !== Array.prototype && obj != null) {
    for (const key of ownKeys(obj)) {
      keys.add(key);
    }
    obj = Object.getPrototypeOf(obj);
  }

  return keys;
}

// deno-lint-ignore no-explicit-any
const Temporal: any =
  (globalThis as any).Temporal ?? new Proxy({}, { get: () => {} });

/** A non-exhaustive list of prototypes that can be accurately fast-path compared with `String(instance)` */
const stringComparablePrototypes = new Set<unknown>(
  [
    Intl.Locale,
    RegExp,
    Temporal.Duration,
    Temporal.Instant,
    Temporal.PlainDate,
    Temporal.PlainDateTime,
    Temporal.PlainTime,
    Temporal.PlainYearMonth,
    Temporal.PlainMonthDay,
    Temporal.ZonedDateTime,
    URL,
    URLSearchParams,
  ]
    .filter((x) => x != null)
    .map((x) => x.prototype)
);

function isPrimitive(x: unknown) {
  return (
    typeof x === "string" ||
    typeof x === "number" ||
    typeof x === "boolean" ||
    typeof x === "bigint" ||
    typeof x === "symbol" ||
    x == null
  );
}

type TypedArray = Pick<Uint8Array | BigUint64Array, "length" | number>;
const TypedArray = Object.getPrototypeOf(Uint8Array);
function compareTypedArrays(a: TypedArray, b: TypedArray) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < b.length; i++) {
    if (!sameValueZero(a[i], b[i])) return false;
  }
  return true;
}

/** Check both strict equality (`0 == -0`) and `Object.is` (`NaN == NaN`) */
function sameValueZero(a: unknown, b: unknown) {
  return a === b || Object.is(a, b);
}

/**
 * Checks if two things are equal.
 *
 * This function helps you verify if two values are the same. It's useful when you want to make sure that a value matches what you expect.
 *
 * ##### Terminology:
 * **Equal**: In this context, it means that two values are the same in terms of their content or structure.
 *
 * ### Test Example
 *
 * #### Using Assert Syntax
 *
 * ```ts
 * import { test, assertEqual } from '@inspatial/test';
 * test({
 *   name: "Check if two strings are equal",
 *   fn: () => {
 *     const firstName = "Ben";
 *     const lastName = "Emma";
 *     assertEqual(firstName, firstName); // This will pass
 *     assertEqual(firstName, lastName);  // This will fail
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 *
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Check if two numbers are equal",
 *   fn: () => {
 *     const number1 = 42;
 *     const number2 = 42;
 *     expect(number1).toEqual(number2); // This will pass
 *   }
 * });
 * ```
 *
 * @param a - The first value you want to compare
 * @param b - The second value you want to compare
 * @returns `true` if the values are equal, otherwise `false`
 */
export function assertEqual(a: unknown, b: unknown): boolean {
  const seen = new Map<unknown, unknown>();
  return (function compare(a: unknown, b: unknown): boolean {
    if (sameValueZero(a, b)) return true;
    if (isPrimitive(a) || isPrimitive(b)) return false;

    if (a instanceof Date && b instanceof Date) {
      return Object.is(a.getTime(), b.getTime());
    }
    if (a && typeof a === "object" && b && typeof b === "object") {
      if (!prototypesEqual(a, b)) {
        return false;
      }
      if (a instanceof TypedArray) {
        return compareTypedArrays(a as TypedArray, b as TypedArray);
      }
      if (a instanceof WeakMap) {
        throw new TypeError("cannot compare WeakMap instances");
      }
      if (a instanceof WeakSet) {
        throw new TypeError("cannot compare WeakSet instances");
      }
      if (a instanceof WeakRef) {
        return compare(a.deref(), (b as WeakRef<WeakKey>).deref());
      }
      if (seen.get(a) === b) {
        return true;
      }
      if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }
      seen.set(a, b);
      if (isKeyedCollection(a) && isKeyedCollection(b)) {
        if (a.size !== b.size) {
          return false;
        }

        const aKeys = [...a.keys()];
        const primitiveKeysFastPath = aKeys.every(isPrimitive);
        if (primitiveKeysFastPath) {
          if (a instanceof Set) {
            return a.symmetricDifference(b).size === 0;
          }

          for (const key of aKeys) {
            if (
              !b.has(key) ||
              !compare(a.get(key), (b as Map<unknown, unknown>).get(key))
            ) {
              return false;
            }
          }
          return true;
        }

        let unmatchedEntries = a.size;

        for (const [aKey, aValue] of a.entries()) {
          for (const [bKey, bValue] of b.entries()) {
            /* Given that Map keys can be references, we need
             * to ensure that they are also deeply equal */

            if (!compare(aKey, bKey)) continue;

            if (
              (aKey === aValue && bKey === bValue) ||
              compare(aValue, bValue)
            ) {
              unmatchedEntries--;
              break;
            }
          }
        }

        return unmatchedEntries === 0;
      }

      let keys: Iterable<string | symbol>;

      if (isBasicObjectOrArray(a)) {
        // fast path
        keys = ownKeys({ ...a, ...b });
      } else if (stringComparablePrototypes.has(Object.getPrototypeOf(a))) {
        // medium path
        return String(a) === String(b);
      } else {
        // slow path
        keys = getKeysDeep(a).union(getKeysDeep(b));
      }

      for (const key of keys) {
        type Key = keyof typeof a;
        if (!compare(a[key as Key], b[key as Key])) {
          return false;
        }
        if ((key in a && !(key in b)) || (key in b && !(key in a))) {
          return false;
        }
      }
      return true;
    }
    return false;
  })(a, b);
}

/*#############################################(ASSERT EQUALS)#############################################*/
//#region assertEquals
/**
 * This function checks if two values are the same.
 *
 * It is useful for making sure that the value you have is what you expect it to be.
 *
 * ### Example
 *
 * ```ts
 * import { assertEquals } from '@inspatial/test';
 *
 * const sum = 2 + 2;
 * assertEquals(sum, 4, "2 + 2 should equal 4");
 * ```
 *
 * ##### NOTE:
 * If the values are not the same, an error will be thrown with a message explaining the difference.
 *
 * ##### Terminology:
 * - **Assertion**: A statement that a condition is true. If it is not true, an error is thrown.
 *
 * ### Test Example
 *
 * #### Using Assert Syntax
 *
 * ```ts
 * import { test, assertEquals } from '@inspatial/test';
 *
 * test({
 *   name: "testing with assert syntax",
 *   fn: () => {
 *     const result = 3 + 3;
 *     assertEquals(result, 6, "3 + 3 should equal 6");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 *
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "testing with expect syntax",
 *   fn: () => {
 *     const result = 5 + 5;
 *     expect(result).toBe(10);
 *   }
 * });
 * ```
 *
 * @param actual - The value you have
 * @param expected - The value you want
 * @param msg - The message to show if the values are not the same
 */
export function assertEquals<T>(actual: T, expected: T, msg?: string) {
  if (assertEqual(actual, expected)) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  let message = `Values are not equal${msgSuffix}`;

  const actualString = format(actual);
  const expectedString = format(expected);
  const stringDiff = typeof actual === "string" && typeof expected === "string";
  const diffResult = stringDiff
    ? differenceString(actual as string, expected as string)
    : diff(actualString.split("\n"), expectedString.split("\n"));
  const diffMsg = buildMessage(diffResult, { stringDiff }).join("\n");
  message = `${message}\n${diffMsg}`;
  throw new AssertionError(message);
}

/*#############################################(ASSERT IS ERROR)#############################################*/
//#region assertIsError
/**
 * This function checks if a given value is an error. It is useful when you want to test if your code correctly handles errors.
 *
 * ### How to Use
 *
 * You can use `assertIsError` to verify that a value is an error object. Optionally, you can specify the type of error and check if the error message matches a specific string or pattern.
 *
 * ### Parameters
 *
 * - `error`: The value you want to check. It can be anything.
 * - `ErrorClass` (optional): The specific type of error you expect. For example, `TypeError` or `ReferenceError`.
 * - `msgMatches` (optional): A string or pattern to match against the error message.
 * - `msg` (optional): A custom message to display if the check fails.
 *
 * ### What It Does
 *
 * - If `error` is not an instance of `Error`, it throws an `AssertionError`.
 * - If `ErrorClass` is provided and `error` is not an instance of it, it throws an `AssertionError`.
 * - If `msgMatches` is provided and the error message does not match, it throws an `AssertionError`.
 *
 * ##### NOTE:
 * The `AssertionError` is a special error that indicates a failed test condition.
 *
 * ### Test Example
 *
 * #### Using Assert Syntax
 * ```ts
 * import { test, assert } from '@inspatial/test';
 *
 * test({
 *   name: 'should throw an error',
 *   fn: () => {
 *     try {
 *       throw new Error("Oops!");
 *     } catch (error) {
 *       assertIsError(error);
 *     }
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: 'should throw an error',
 *   fn: () => {
 *     try {
 *       throw new Error("Oops!");
 *     } catch (error) {
 *       expect(() => assertIsError(error)).not.toThrow();
 *     }
 *   }
 * });
 * ```
 */
export function assertIsError<E extends Error = Error>(
  error: unknown,
  // deno-lint-ignore no-explicit-any
  ErrorClass?: abstract new (...args: any[]) => E,
  msgMatches?: string | RegExp,
  msg?: string
): asserts error is E {
  const msgSuffix = msg ? `: ${msg}` : ".";
  if (!(error instanceof Error)) {
    throw new AssertionError(
      `Expected "error" to be an Error object${msgSuffix}`
    );
  }
  if (ErrorClass && !(error instanceof ErrorClass)) {
    msg = `Expected error to be instance of "${ErrorClass.name}", but was "${error?.constructor?.name}"${msgSuffix}`;
    throw new AssertionError(msg);
  }
  let msgCheck;
  if (typeof msgMatches === "string") {
    msgCheck = stripAnsiCode(error.message).includes(stripAnsiCode(msgMatches));
  }
  if (msgMatches instanceof RegExp) {
    msgCheck = msgMatches.test(stripAnsiCode(error.message));
  }

  if (msgMatches && !msgCheck) {
    msg = `Expected error message to include ${
      msgMatches instanceof RegExp
        ? msgMatches.toString()
        : JSON.stringify(msgMatches)
    }, but got ${JSON.stringify(error?.message)}${msgSuffix}`;
    throw new AssertionError(msg);
  }
}

/*#############################################(ASSERT MATCH)#############################################*/
//#region assertMatch
/**
 * This function checks if a given text matches a specified pattern.
 *
 * The `assertMatch` function is used to verify that a string (text) fits a particular pattern defined by a regular expression.
 * If the text does not match the pattern, it throws an error with a message.
 *
 * ### Parameters
 * - `actual`: The text you want to check.
 * - `expected`: The pattern you expect the text to match, defined as a regular expression.
 * - `msg` (optional): A custom message to include if the text does not match the pattern.
 *
 * ### How It Works
 * The function uses the `test` method of the regular expression to check if the text matches the pattern.
 * If it doesn't match, it throws an `AssertionError` with a message that includes the actual text, the expected pattern, and any custom message provided.
 *
 * ### Test Example
 *
 * #### Using Assert Syntax
 * ```ts
 * import { test, assertMatch } from '@inspatial/test';
 *
 * test({
 *   name: "should match valid email",
 *   fn: () => {
 *     const email = "user@example.com";
 *     assertMatch(email, /^.+@.+\..+$/, "Should be a valid email");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "should match valid email",
 *   fn: () => {
 *     const email = "user@example.com";
 *     expect(email).toMatch(/^.+@.+\..+$/, "Should be a valid email");
 *   }
 * });
 */
export function assertMatch(actual: string, expected: RegExp, msg?: string) {
  if (expected.test(actual)) return;
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${actual}" to match: "${expected}"${msgSuffix}`;
  throw new AssertionError(msg);
}

/*#############################################(ASSERT NOT EQUALS)#############################################*/
//#region assertNotEquals
/**
 * This function checks if two values are not the same.
 *
 * It compares two values and throws an error if they are equal.
 * This is useful when you want to ensure that two values are different.
 *
 * ### Test Example
 *
 * #### Using Assert Syntax
 * ```ts
 * import { test, assertNotEquals } from '@inspatial/test';
 *
 * test({
 *   name: "Players should be different",
 *   fn: () => {
 *     const player1 = "Mario";
 *     const player2 = "Luigi";
 *     assertNotEquals(player1, player2, "Players should be different");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Players should be different",
 *   fn: () => {
 *     const player1 = "Mario";
 *     const player2 = "Luigi";
 *     expect(player1).not.toEqual(player2);
 *   }
 * });
 * ```
 *
 * ##### NOTE:
 * If the two values are the same, the function will throw an error.
 *
 * ##### Terminology:
 * **Assertion**: A statement that a condition is true. In programming, it's used to check if a condition holds.
 */
export function assertNotEquals<T>(actual: T, expected: T, msg?: string) {
  if (!assertEqual(actual, expected)) {
    return;
  }
  const actualString = format(actual);
  const expectedString = format(expected);
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(
    `Expected actual: ${actualString} not to be: ${expectedString}${msgSuffix}`
  );
}

/*#############################################(ASSERT EXISTS)#############################################*/
//#region assertExists
/**
 * This function, `assertExists`, checks if a value is present, meaning it is not `null` or `undefined`.
 *
 * When you have a value that you expect to be there, you can use this function to make sure it actually is.
 * If the value is missing, it will throw an error with a message you can provide.
 *
 * ### Example Usage
 *
 * ```ts
 * import { assertExists } from '@inspatial/test';
 * import { getUser } from '@inspatial/auth';
 *
 * const user = getUser();
 * assertExists(user, "User should exist");
 * ```
 *
 * ##### NOTE:
 * If the value is `null` or `undefined`, an `AssertionError` will be thrown.
 *
 * ### Test Example
 *
 * #### Using the Assert Syntax
 * ```ts
 * import { test, assertExists } from '@inspatial/test';
 *
 * test({
 *   name: "should assert existence of a non-null value",
 *   fn: () => {
 *     const value = "Hello";
 *     assertExists(value, "Value should exist");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "should expect existence of a non-null value",
 *   fn: () => {
 *     const value = "Hello";
 *     expect(value).not.toBeNull();
 *     expect(value).not.toBeUndefined();
 *   }
 * });
 * ```
 */
export function assertExists<T>(
  actual: T,
  msg?: string
): asserts actual is NonNullable<T> {
  if (actual === undefined || actual === null) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    msg = `Expected actual: "${actual}" to not be null or undefined${msgSuffix}`;
    throw new AssertionError(msg);
  }
}

/*#############################################(ASSERT FALSE)#############################################*/
//#region assertFalse
/**
 * This function, `assertFalse`, checks if a given expression is false.
 *
 * If the expression is true, it throws an error with an optional message.
 *
 * ### Test Example
 *
 * #### Using the assertFalse Syntax
 * ```ts
 * import { assertFalse } from '@inspatial/test';
 *
 * test({
 *   name: "should assert false",
 *   fn: () => {
 *     const isGameOver = false;
 *     assertFalse(isGameOver, "Game should not be over");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { expect } from '@inspatial/test';
 *
 * test({
 *   name: "should assert false with expect",
 *   fn: () => {
 *     const isGameOver = false;
 *     expect(isGameOver).toBeFalsy();
 *   }
 * });
 * ```
 *
 * ##### NOTE:
 * The function will throw an error if the expression is true.
 *
 * @param expr - The expression you want to check is false.
 * @param msg - The message to show if the check fails (optional).
 */
export function assertFalse(
  expr: unknown,
  msg = ""
): asserts expr is AssertFalsyProp {
  if (expr) {
    throw new AssertionError(msg);
  }
}

/*#############################################(ASSERT NOT STRICTLY EQUALS)#############################################*/
//#region assertNotStrictEquals
/**
 * This function, `assertNotStrictEquals`, checks if two values are not strictly equal.
 *
 * In JavaScript, strict equality means that the values are equal in both type and value.
 * This function is useful when you want to ensure that two values are different.
 *
 * ### Test Example
 *
 * #### Using the `assertNotStrictEquals` Syntax
 * ```ts
 * import { assertNotStrictEquals } from '@inspatial/test';
 *
 * const player1 = "Mario";
 * const player2 = "Luigi";
 * assertNotStrictEquals(player1, player2, "Players should be different");
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { expect } from '@inspatial/test';
 *
 * const player1 = "Mario";
 * const player2 = "Luigi";
 * expect(player1).not.toBe(player2);
 * ```
 *
 * ##### NOTE:
 * The `assertNotStrictEquals` function will throw an error if the two values are strictly equal.
 *
 * ##### Terminology: Strict Equality
 * Strict equality (`===`) checks if two values are equal in both type and value.
 */
export function assertNotStrictEquals<T>(actual: T, expected: T, msg?: string) {
  if (!Object.is(actual, expected)) {
    return;
  }

  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(
    `Expected "actual" to not be strictly equal to: ${format(
      actual
    )}${msgSuffix}\n`
  );
}

/*#############################################(ASSERT OBJECT MATCH)#############################################*/
//#region assertObjectMatch
/**
 * This function checks if two objects are equal by comparing their properties.
 *
 * The `assertObjectMatch` function is useful when you want to ensure that two objects have the same properties and values.
 *
 * ##### NOTE:
 * The function compares the properties of the objects, not their references. This means that two different objects with the same properties and values will be considered equal.
 *
 * ##### Terminology:
 * **Intersection**: In this context, it refers to the common properties between two objects.
 *
 * ### Test Example
 *
 * #### Using the assertObjectMatch Function
 * ```ts
 * import { test, assertObjectMatch } from '@inspatial/test';
 *
 * test({
 *   name: "Objects should match",
 *   fn: () => {
 *     const player1 = { name: "Mario" };
 *     const player2 = { name: "Mario" };
 *     assertObjectMatch(player1, player2, "Players should be equal");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Objects should match using expect",
 *   fn: () => {
 *     const player1 = { name: "Mario" };
 *     const player2 = { name: "Mario" };
 *     expect(player1).toEqual(player2);
 *   }
 * });
 * ```
 *
 * @param actual - The first object to compare.
 * @param expected - The second object to compare.
 * @param msg - An optional message to display if the objects are not equal.
 */
export function assertObjectMatch(
  // deno-lint-ignore no-explicit-any
  actual: Record<PropertyKey, any>,
  expected: Record<PropertyKey, unknown>,
  msg?: string
): void {
  return assertEquals(
    // get the intersection of "actual" and "expected"
    // side effect: all the instances' constructor field is "Object" now.
    filter(actual, expected),
    // set (nested) instances' constructor field to be "Object" without changing expected value.
    filter(expected, expected),
    msg
  );
}

type loose = Record<PropertyKey, unknown>;

function isObject(val: unknown): boolean {
  return typeof val === "object" && val !== null;
}

function filter(a: loose, b: loose): loose {
  const seen = new WeakMap();
  return filterObject(a, b);

  function filterObject(a: loose, b: loose): loose {
    // Prevent infinite loop with circular references with same filter
    if (seen.has(a) && seen.get(a) === b) {
      return a;
    }

    try {
      seen.set(a, b);
    } catch (err) {
      if (err instanceof TypeError) {
        throw new TypeError(
          `Cannot assertObjectMatch ${a === null ? null : `type ${typeof a}`}`
        );
      }
    }

    // Filter keys and symbols which are present in both actual and expected
    const filtered = {} as loose;
    const keysA = Reflect.ownKeys(a);
    const keysB = Reflect.ownKeys(b);
    const entries = keysA
      .filter((key) => keysB.includes(key))
      .map((key) => [key, a[key as string]]) as Array<[string, unknown]>;

    if (keysA.length && keysB.length && !entries.length) {
      // If both objects are not empty but don't have the same keys or symbols,
      // returns the entries in object a.
      for (const key of keysA) {
        filtered[key] = a[key];
      }

      return filtered;
    }

    for (const [key, value] of entries) {
      // On regexp references, keep value as it to avoid loosing pattern and flags
      if (value instanceof RegExp) {
        filtered[key] = value;
        continue;
      }

      const subset = (b as loose)[key];

      // On array references, build a filtered array and filter nested objects inside
      if (Array.isArray(value) && Array.isArray(subset)) {
        filtered[key] = filterArray(value, subset);
        continue;
      }

      // On nested objects references, build a filtered object recursively
      if (isObject(value) && isObject(subset)) {
        // When both operands are maps, build a filtered map with common keys and filter nested objects inside
        if (value instanceof Map && subset instanceof Map) {
          filtered[key] = new Map(
            [...value]
              .filter(([k]) => subset.has(k))
              .map(([k, v]) => {
                const v2 = subset.get(k);
                if (isObject(v) && isObject(v2)) {
                  return [k, filterObject(v as loose, v2 as loose)];
                }

                return [k, v];
              })
          );
          continue;
        }

        // When both operands are set, build a filtered set with common values
        if (value instanceof Set && subset instanceof Set) {
          filtered[key] = value.intersection(subset);
          continue;
        }

        filtered[key] = filterObject(value as loose, subset as loose);
        continue;
      }

      filtered[key] = value;
    }

    return filtered;
  }

  function filterArray(a: unknown[], b: unknown[]): unknown[] {
    // Prevent infinite loop with circular references with same filter
    if (seen.has(a) && seen.get(a) === b) {
      return a;
    }

    seen.set(a, b);

    const filtered: unknown[] = [];
    const count = Math.min(a.length, b.length);

    for (let i = 0; i < count; ++i) {
      const value = a[i];
      const subset = b[i];

      // On regexp references, keep value as it to avoid loosing pattern and flags
      if (value instanceof RegExp) {
        filtered.push(value);
        continue;
      }

      // On array references, build a filtered array and filter nested objects inside
      if (Array.isArray(value) && Array.isArray(subset)) {
        filtered.push(filterArray(value, subset));
        continue;
      }

      // On nested objects references, build a filtered object recursively
      if (isObject(value) && isObject(subset)) {
        // When both operands are maps, build a filtered map with common keys and filter nested objects inside
        if (value instanceof Map && subset instanceof Map) {
          const map = new Map(
            [...value]
              .filter(([k]) => subset.has(k))
              .map(([k, v]) => {
                const v2 = subset.get(k);
                if (isObject(v) && isObject(v2)) {
                  return [k, filterObject(v as loose, v2 as loose)];
                }

                return [k, v];
              })
          );
          filtered.push(map);
          continue;
        }

        // When both operands are set, build a filtered set with common values
        if (value instanceof Set && subset instanceof Set) {
          filtered.push(value.intersection(subset));
          continue;
        }

        filtered.push(filterObject(value as loose, subset as loose));
        continue;
      }

      filtered.push(value);
    }

    return filtered;
  }
}

/*#############################################(ASSERT STRICTLY EQUALS)#############################################*/
//#region assertStrictEquals
/**
 * This function checks if two values are exactly the same.
 *
 * The `assertStrictEquals` function is used to compare two values to see if they are strictly equal.
 * Strict equality means that the values are the same in both type and value.
 * If they are not equal, an error is thrown with a message explaining the difference.
 *
 * ##### NOTE:
 * Strict equality is different from regular equality.
 * Regular equality (`==`) allows for type conversion, while strict equality (`===`) does not.
 *
 * ##### Terminology:
 * **Strictly equal**: This means that two values are the same in both type and value, without any type conversion.
 *
 * ### Test Example
 *
 * #### Using the assertStrictEquals Function
 * ```ts
 * import { test, assertStrictEquals } from '@inspatial/test';
 *
 * test({
 *   name: "Players should be equal",
 *   fn: () => {
 *     const player1 = "Mario";
 *     const player2 = "Mario";
 *     assertStrictEquals(player1, player2, "Players should be equal");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Players should be equal",
 *   fn: () => {
 *     const player1 = "Mario";
 *     const player2 = "Mario";
 *     expect(player1).toBe(player2);
 *   }
 * });
 * ```
 *
 * @param actual - The actual value you want to check.
 * @param expected - The expected value you want to compare against.
 * @param msg - An optional message to display if the values are not equal.
 * @throws {AssertionError} Throws an error if the values are not strictly equal.
 */
export function assertStrictEquals<T>(
  actual: unknown,
  expected: T,
  msg?: string
): asserts actual is T {
  if (Object.is(actual, expected)) {
    return;
  }

  const msgSuffix = msg ? `: ${msg}` : ".";
  let message: string;

  const actualString = format(actual);
  const expectedString = format(expected);

  if (actualString === expectedString) {
    const withOffset = actualString
      .split("\n")
      .map((l) => `    ${l}`)
      .join("\n");
    message = `Values have the same structure but are not reference-equal${msgSuffix}\n\n${red(
      withOffset
    )}\n`;
  } else {
    const stringDiff =
      typeof actual === "string" && typeof expected === "string";
    const diffResult = stringDiff
      ? differenceString(actual as string, expected as string)
      : diff(actualString.split("\n"), expectedString.split("\n"));
    const diffMsg = buildMessage(diffResult, { stringDiff }).join("\n");
    message = `Values are not strictly equal${msgSuffix}\n${diffMsg}`;
  }

  throw new AssertionError(message);
}

/*#############################################(ASSERT ALMOST EQUALS)#############################################*/
//#region assertAlmostEquals
/**
 * This function checks if two numbers are almost equal.
 *
 * When you have two numbers that should be the same, but might have tiny differences due to calculations,
 * you can use this function to check if they are "close enough" to be considered equal.
 *
 * @param actual - The number you have.
 * @param expected - The number you want.
 * @param tolerance - The maximum difference allowed between the numbers. If not provided, a small default value is used.
 * @param msg - A message to show if the numbers are not close enough. This is optional.
 *
 * ##### NOTE:
 * The `tolerance` is a small number that defines how close the two numbers need to be. If not specified,
 * it defaults to a very small value based on the `expected` number.
 *
 * ### Test Example
 *
 * #### Using the assertAlmostEquals Function
 * ```ts
 * import { test, assertAlmostEquals } from '@inspatial/test';
 *
 * test({
 *   name: "Numbers are almost equal",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 25.00001;
 *     assertAlmostEquals(player1, player2, 0.0001, "Players should be equal");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Numbers are almost equal",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 25.00001;
 *     expect(player1).toBeCloseTo(player2, 0.0001);
 *   }
 * });
 * ```
 */
export function assertAlmostEquals(
  actual: number,
  expected: number,
  tolerance?: number,
  msg?: string
) {
  if (Object.is(actual, expected)) {
    return;
  }
  const delta = Math.abs(expected - actual);
  if (tolerance === undefined) {
    tolerance = isFinite(expected) ? Math.abs(expected * 1e-7) : 1e-7;
  }
  if (delta <= tolerance) {
    return;
  }

  const msgSuffix = msg ? `: ${msg}` : ".";
  const f = (n: number) => (Number.isInteger(n) ? n : n.toExponential());
  throw new AssertionError(
    `Expected actual: "${f(actual)}" to be close to "${f(expected)}": \
  delta "${f(delta)}" is greater than "${f(tolerance)}"${msgSuffix}`
  );
}

/*#############################################(ASSERT ARRAY INCLUDES)#############################################*/
//#region assertArrayIncludes
/**
 * This function, `assertArrayIncludes`, checks if all elements of one array are present in another array.
 *
 * It is useful when you want to ensure that a list contains certain values.
 * If any of the expected values are not found in the actual array, an error is thrown.
 *
 * ### Test Example
 *
 * #### Using the assertArrayIncludes Function
 * ```ts
 * import { test, assertArrayIncludes } from '@inspatial/test';
 *
 * test({
 *   name: "should include all expected values",
 *   fn: () => {
 *     const items = [1, 2, 3];
 *     assertArrayIncludes(items, [2], "2 should be in the array");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "should include all expected values",
 *   fn: () => {
 *     const items = [1, 2, 3];
 *     expect(items).toInclude([2]);
 *   }
 * });
 * ```
 *
 * ##### NOTE:
 * The function will throw an `AssertionError` if any of the expected values are missing from the actual array.
 *
 * ##### Terminology: AssertionError
 * An `AssertionError` is an error thrown when an assertion fails. An assertion is a statement that a condition is true.
 */
export function assertArrayIncludes<T>(
  actual: AssertArrayLikeArgProp<T>,
  expected: AssertArrayLikeArgProp<T>,
  msg?: string
) {
  const missing: unknown[] = [];
  for (let i = 0; i < expected.length; i++) {
    let found = false;
    for (let j = 0; j < actual.length; j++) {
      if (assertEqual(expected[i], actual[j])) {
        found = true;
        break;
      }
    }
    if (!found) {
      missing.push(expected[i]);
    }
  }
  if (missing.length === 0) {
    return;
  }

  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${format(actual)}" to include: "${format(
    expected
  )}"${msgSuffix}\nmissing: ${format(missing)}`;
  throw new AssertionError(msg);
}

/*#############################################(ASSERT GREATER)#############################################*/
//#region assertGreater
/**
 * This function checks if one value is greater than another.
 *
 * The `assertGreater` function is used to compare two values. If the first value is not greater than the second, it throws an error. This is useful for testing conditions where one value should be larger than another.
 *
 * @param actual - The value you expect to be greater.
 * @param expected - The value you expect to be smaller.
 * @param msg - An optional message to display if the assertion fails.
 *
 * ##### NOTE:
 * The function will throw an error if `actual` is not greater than `expected`.
 *
 * ### Test Example
 *
 * #### Using the assertGreater Function
 * ```ts
 * import { test, assertGreater } from '@inspatial/test';
 *
 * test({
 *   name: "Player1 should be greater than Player2",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 20;
 *     assertGreater(player1, player2, "Player1 should be greater than Player2");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Player1 should be greater than Player2",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 20;
 *     expect(player1).toBeGreaterThan(player2);
 *   }
 * });
 * ```
 */
export function assertGreater<T>(actual: T, expected: T, msg?: string) {
  if (actual > expected) return;

  const actualString = format(actual);
  const expectedString = format(expected);
  throw new AssertionError(msg ?? `Expect ${actualString} > ${expectedString}`);
}

/*#############################################(ASSERT GREATER OR EQUAL)#############################################*/
//#region assertGreaterOrEqual
/**
 * This function checks if one value is greater than or equal to another value.
 *
 * It is useful when you want to ensure that a number or comparable value is not less than a certain threshold.
 *
 * ##### NOTE:
 * If the first value is not greater than or equal to the second, an error is thrown.
 *
 * ### Test Example
 *
 * #### Using the assertGreaterOrEqual Function
 * ```ts
 * import { test, assertGreaterOrEqual } from '@inspatial/test';
 *
 * test({
 *   name: "Player1 should be greater than or equal to Player2",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 20;
 *     assertGreaterOrEqual(player1, player2, "Player1 should be greater than or equal to Player2");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Player1 should be greater than or equal to Player2",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 20;
 *     expect(player1).toBeGreaterThanOrEqual(player2);
 *   }
 * });
 * ```
 *
 * @param actual - The value you have.
 * @param expected - The value you want to compare against.
 * @param msg - An optional message to display if the assertion fails.
 */
export function assertGreaterOrEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual >= expected) return;

  const actualString = format(actual);
  const expectedString = format(expected);
  throw new AssertionError(
    msg ?? `Expect ${actualString} >= ${expectedString}`
  );
}

/*#############################################(ASSERT INSTANCE OF)#############################################*/
//#region assertInstanceOf
/**
 * This function checks if a given value is an instance of a specific type.
 *
 * It is useful for verifying that an object is created from a particular class or constructor.
 *
 * ##### NOTE:
 * If the value is not an instance of the expected type, an error is thrown.
 *
 * ##### Terminology:
 * **Instance**: An object created from a class or constructor.
 *
 * ### Test Example
 *
 * #### Using the assertInstanceOf Function
 * ```ts
 * import { test, assertInstanceOf } from '@inspatial/test';
 *
 * test({
 *   name: "Should be an instance of Date",
 *   fn: () => {
 *     const today = new Date();
 *     assertInstanceOf(today, Date, "Should be a date");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Should be an instance of Date",
 *   fn: () => {
 *     const today = new Date();
 *     expect(today).toBeInstanceOf(Date);
 *   }
 * });
 * ```
 *
 * @param actual - The value you want to check.
 * @param expectedType - The type you expect the value to be an instance of.
 * @param msg - An optional message to display if the check fails.
 */
export function assertInstanceOf<
  T extends abstract new (...args: any[]) => any,
>(
  actual: unknown,
  expectedType: T,
  msg = ""
): asserts actual is InstanceType<T> {
  if (actual instanceof expectedType) return;

  const msgSuffix = msg ? `: ${msg}` : ".";
  const expectedTypeStr = expectedType.name;

  let actualTypeStr = "";
  if (actual === null) {
    actualTypeStr = "null";
  } else if (actual === undefined) {
    actualTypeStr = "undefined";
  } else if (typeof actual === "object") {
    actualTypeStr = actual.constructor?.name ?? "Object";
  } else {
    actualTypeStr = typeof actual;
  }

  if (expectedTypeStr === actualTypeStr) {
    msg = `Expected object to be an instance of "${expectedTypeStr}"${msgSuffix}`;
  } else if (actualTypeStr === "function") {
    msg = `Expected object to be an instance of "${expectedTypeStr}" but was not an instanced object${msgSuffix}`;
  } else {
    msg = `Expected object to be an instance of "${expectedTypeStr}" but was "${actualTypeStr}"${msgSuffix}`;
  }

  throw new AssertionError(msg);
}

/*#############################################(ASSERT LESS)#############################################*/
//#region assertLess
/**
 * Checks if something is less than a certain value.
 *
 * Example:
 * ```ts
 * import { assertLess } from '@inspatial/test';
 *
 * const player1 = 25;
 * const player2 = 30;
 * assertLess(player1, player2, "Player1 should be less than Player2");
 * ```
 */
export function assertLess<T>(actual: T, expected: T, msg?: string) {
  if (actual < expected) return;

  const actualString = format(actual);
  const expectedString = format(expected);
  throw new AssertionError(msg ?? `Expect ${actualString} < ${expectedString}`);
}

/*#############################################(ASSERT LESS OR EQUAL)#############################################*/
//#region assertLessOrEqual
/**
 * This function checks if one value is less than or equal to another value.
 *
 * It is useful when you want to ensure that a number or comparable value is not greater than a certain threshold.
 *
 * ##### NOTE:
 * If the first value is not less than or equal to the second, an error is thrown.
 *
 * ### Test Example
 *
 * #### Using the assertLessOrEqual Function
 * ```ts
 * import { test, assertLessOrEqual } from '@inspatial/test';
 *
 * test({
 *   name: "Player1 should be less than or equal to Player2",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 30;
 *     assertLessOrEqual(player1, player2, "Player1 should be less than or equal to Player2");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Player1 should be less than or equal to Player2",
 *   fn: () => {
 *     const player1 = 25;
 *     const player2 = 30;
 *     expect(player1).toBeLessThanOrEqual(player2);
 *   }
 * });
 * ```
 *
 * @param actual - The value you have.
 * @param expected - The value you want to compare against.
 * @param msg - An optional message to display if the assertion fails.
 */
export function assertLessOrEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual <= expected) return;

  const actualString = format(actual);
  const expectedString = format(expected);
  throw new AssertionError(
    msg ?? `Expect ${actualString} <= ${expectedString}`
  );
}

/*#############################################(ASSERT NOT INSTANCE OF)#############################################*/
//#region assertNotInstanceOf
/**
 * This function checks if a given object is not an instance of a specific type.
 *
 * It is useful for verifying that an object is not created from a particular class or constructor.
 *
 * ##### NOTE:
 * If the object is an instance of the specified type, an error is thrown.
 *
 * ##### Terminology:
 * **Instance**: An object created from a class or constructor.
 *
 * ### Test Example
 *
 * #### Using the assertNotInstanceOf Function
 * ```ts
 * import { test, assertNotInstanceOf } from '@inspatial/test';
 *
 * test({
 *   name: "Player should not be an instance of Player class",
 *   fn: () => {
 *     const player = new Player();
 *     assertNotInstanceOf(player, Player, "Player should not be an instance of Player");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Player should not be an instance of Player class",
 *   fn: () => {
 *     const player = new Player();
 *     expect(player).not.toBeInstanceOf(Player);
 *   }
 * });
 * ```
 *
 * @param actual - The thing you want to check
 * @param unexpectedType - What type you think it shouldn't be
 * @param msg - Message to show if it's the wrong type
 */
export function assertNotInstanceOf<A, T>(
  actual: A,
  // deno-lint-ignore no-explicit-any
  unexpectedType: abstract new (...args: any[]) => T,
  msg?: string
): asserts actual is Exclude<A, T> {
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected object to not be an instance of "${typeof unexpectedType}"${msgSuffix}`;
  assertFalse(actual instanceof unexpectedType, msg);
}

/*#############################################(ASSERT NOT MATCH)#############################################*/
//#region assertNotMatch
/**
 * This function checks if a given string does not match a specified pattern.
 *
 * It is useful for ensuring that a string does not fit a particular pattern defined by a regular expression.
 *
 * ##### NOTE:
 * If the string matches the pattern, an error is thrown.
 *
 * ### Test Example
 *
 * #### Using the assertNotMatch Function
 * ```ts
 * import { test, assertNotMatch } from '@inspatial/test';
 *
 * test({
 *   name: "Email should not match the pattern",
 *   fn: () => {
 *     const email = "user@example.com";
 *     assertNotMatch(email, /^.+@.+\..+$/, "Should not be a valid email");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Email should not match the pattern",
 *   fn: () => {
 *     const email = "user@example.com";
 *     expect(email).not.toMatch(/^.+@.+\..+$/);
 *   }
 * });
 * ```
 */
export function assertNotMatch(actual: string, expected: RegExp, msg?: string) {
  if (!expected.test(actual)) return;
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${actual}" to not match: "${expected}"${msgSuffix}`;
  throw new AssertionError(msg);
}

/*#############################################(ASSERT REJECTS)#############################################*/
//#region assertRejects
/**
 * This function, `assertRejects`, checks if a function that returns a promise rejects with a specific error.
 *
 * When you have a function that should fail, you can use this to make sure it does.
 * If the function doesn't reject, or if it rejects with the wrong error, an error is thrown.
 *
 * ##### NOTE:
 * This is useful for testing functions that are supposed to fail under certain conditions.
 *
 * ##### Terminology:
 * **Reject**: In programming, when a promise fails, it is said to "reject".
 *
 * ### Test Example
 *
 * #### Using the assertRejects Syntax
 * ```ts
 * import { test, assertRejects } from '@inspatial/test';
 *
 * test({
 *   name: "should reject with an error",
 *   fn: async () => {
 *     const failingFunction = async () => {
 *       throw new Error("Failure!");
 *     };
 *     await assertRejects(failingFunction, Error, "Failure!");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "should reject with an error",
 *   fn: async () => {
 *     const failingFunction = async () => {
 *       throw new Error("Failure!");
 *     };
 *     await expect(failingFunction).rejects.toThrow("Failure!");
 *   }
 * });
 * ```
 *
 * @param fn - The function that should return a promise and reject.
 * @param errorClassOrMsg - The error class or message you expect.
 * @param msgIncludes - A part of the error message you expect (optional).
 * @param msg - A custom message to show if the check fails (optional).
 */
export async function assertRejects<E extends Error = Error>(
  fn: () => PromiseLike<unknown>,
  errorClassOrMsg?: (abstract new (...args: any[]) => E) | string,
  msgIncludesOrMsg?: string,
  msg?: string
): Promise<E | Error | unknown> {
  // deno-lint-ignore no-explicit-any
  let ErrorClass: (abstract new (...args: any[]) => E) | undefined;
  let msgIncludes: string | undefined;
  let err;

  if (typeof errorClassOrMsg !== "string") {
    if (
      errorClassOrMsg === undefined ||
      errorClassOrMsg.prototype instanceof Error ||
      errorClassOrMsg.prototype === Error.prototype
    ) {
      ErrorClass = errorClassOrMsg;
      msgIncludes = msgIncludesOrMsg;
    }
  } else {
    msg = errorClassOrMsg;
  }
  let doesThrow = false;
  let isPromiseReturned = false;
  const msgSuffix = msg ? `: ${msg}` : ".";
  try {
    const possiblePromise = fn();
    if (
      possiblePromise &&
      typeof possiblePromise === "object" &&
      typeof possiblePromise.then === "function"
    ) {
      isPromiseReturned = true;
      await possiblePromise;
    } else {
      throw new Error();
    }
  } catch (error) {
    if (!isPromiseReturned) {
      throw new AssertionError(
        `Function throws when expected to reject${msgSuffix}`
      );
    }
    if (ErrorClass) {
      if (!(error instanceof Error)) {
        throw new AssertionError(`A non-Error object was rejected${msgSuffix}`);
      }
      assertIsError(error, ErrorClass, msgIncludes, msg);
    }
    err = error;
    doesThrow = true;
  }
  if (!doesThrow) {
    throw new AssertionError(`Expected function to reject${msgSuffix}`);
  }
  return err;
}

/*#############################################(ASSERT STRING INCLUDES)#############################################*/
//#region assertStringIncludes
/**
 * This function checks if a string contains a specific substring.
 *
 * It is useful when you want to ensure that a string includes certain text.
 * If the substring is not found, an error is thrown with an optional message.
 *
 * ##### NOTE:
 * The function will throw an `AssertionError` if the substring is not found.
 *
 * ### Test Example
 *
 * #### Using the assertStringIncludes Function
 * ```ts
 * import { test, assertStringIncludes } from '@inspatial/test';
 *
 * test({
 *   name: "Email should contain '@'",
 *   fn: () => {
 *     const email = "user@example.com";
 *     assertStringIncludes(email, "@", "Should contain '@'");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Email should contain '@'",
 *   fn: () => {
 *     const email = "user@example.com";
 *     expect(email).toContain("@");
 *   }
 * });
 * ```
 *
 * @param actual - The string you have.
 * @param expected - The substring you want to find.
 * @param msg - The message to show if it doesn't contain the expected substring (optional)
 */
export function assertStringIncludes(
  actual: string,
  expected: string,
  msg?: string
) {
  if (actual.includes(expected)) return;
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${actual}" to contain: "${expected}"${msgSuffix}`;
  throw new AssertionError(msg);
}

/*#############################################(ASSERT THROWS)#############################################*/
//#region assertThrows
/**
 * This function checks if a function throws a specific error.
 *
 * It is useful for testing functions that should fail under certain conditions.
 * If the function does not throw, or if it throws the wrong error, an error is thrown.
 *
 * ##### NOTE:
 * This is useful for testing functions that are supposed to fail under certain conditions.
 *
 * ##### Terminology:
 * **Throw**: In programming, when a function fails, it is said to "throw" an error.
 *
 * ### Test Example
 *
 * #### Using the assertThrows Function
 * ```ts
 * import { test, assertThrows } from '@inspatial/test';
 *
 * test({
 *   name: "Function should throw an error",
 *   fn: () => {
 *     function isEven(n: number): boolean {
 *       if (n % 2 !== 0) {
 *         throw new Error("Odd number");
 *       }
 *       return true;
 *     }
 *     assertThrows(() => isEven(1), Error, "isEven should throw an error for odd numbers");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "Function should throw an error",
 *   fn: () => {
 *     function isEven(n: number): boolean {
 *       if (n % 2 !== 0) {
 *         throw new Error("Odd number");
 *       }
 *       return true;
 *     }
 *     expect(() => isEven(1)).toThrow("Odd number");
 *   }
 * });
 * ```
 *
 * @param fn - The function to check.
 * @param errorClassOrMsg - The error class or message to expect.
 * @param msgIncludes - The message to expect (optional).
 * @param msg - The message to show if the check fails (optional).
 */
export function assertThrows<E extends Error = Error>(
  fn: () => unknown,
  // deno-lint-ignore no-explicit-any
  ErrorClass: abstract new (...args: any[]) => E,
  msgIncludes?: string,
  msg?: string
): E;
export function assertThrows<E extends Error = Error>(
  fn: () => unknown,
  errorClassOrMsg?: // deno-lint-ignore no-explicit-any
  (abstract new (...args: any[]) => E) | string,
  msgIncludesOrMsg?: string,
  msg?: string
): E | Error | unknown {
  // deno-lint-ignore no-explicit-any
  let ErrorClass: (abstract new (...args: any[]) => E) | undefined;
  let msgIncludes: string | undefined;
  let err;

  if (typeof errorClassOrMsg !== "string") {
    if (
      errorClassOrMsg === undefined ||
      errorClassOrMsg?.prototype instanceof Error ||
      errorClassOrMsg?.prototype === Error.prototype
    ) {
      ErrorClass = errorClassOrMsg;
      msgIncludes = msgIncludesOrMsg;
    } else {
      msg = msgIncludesOrMsg;
    }
  } else {
    msg = errorClassOrMsg;
  }
  let doesThrow = false;
  const msgSuffix = msg ? `: ${msg}` : ".";
  try {
    fn();
  } catch (error) {
    if (ErrorClass) {
      if (error instanceof Error === false) {
        throw new AssertionError(`A non-Error object was thrown${msgSuffix}`);
      }
      assertIsError(error, ErrorClass, msgIncludes, msg);
    }
    err = error;
    doesThrow = true;
  }
  if (!doesThrow) {
    msg = `Expected function to throw${msgSuffix}`;
    throw new AssertionError(msg);
  }
  return err;
}

/*#############################################(ASSERT FAIL)#############################################*/
//#region assertFail
/**
 * This function fails a test by throwing an error.
 *
 * It is useful when you want to explicitly fail a test with a specific message.
 *
 * ##### NOTE:
 * The function will always throw an `AssertionError`.
 *
 * ### Test Example
 *
 * #### Using the assertFail Function
 * ```ts
 * import { test, assertFail } from '@inspatial/test';
 *
 * test({
 *   name: "This test should fail",
 *   fn: () => {
 *     assertFail("This test must fail");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "This test should fail",
 *   fn: () => {
 *     expect(() => assertFail("This test must fail")).toThrow("This test must fail");
 *   }
 * });
 * ```
 *
 * @param msg - The message to show if the check fails (optional).
 */
export function assertFail(msg?: string): never {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Failed assertion${msgSuffix}`);
}

/*#############################################(ASSERT UNIMPLEMENTED)#############################################*/
//#region assertUnimplemented
/**
 * This function throws an error to indicate that a function is not implemented.
 *
 * It is useful for marking parts of your code that are not yet complete.
 *
 * ##### NOTE:
 * The function will always throw an `AssertionError`.
 *
 * ### Test Example
 *
 * #### Using the assertUnimplemented Function
 * ```ts
 * import { test, assertUnimplemented } from '@inspatial/test';
 *
 * test({
 *   name: "This function is not implemented",
 *   fn: () => {
 *     assertUnimplemented("This function is not implemented");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "This function is not implemented",
 *   fn: () => {
 *     expect(() => assertUnimplemented("This function is not implemented")).toThrow("Unimplemented");
 *   }
 * });
 * ```
 *
 * @param msg - The message to show if the check fails (optional).
 */
export function assertUnimplemented(msg?: string): never {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Unimplemented${msgSuffix}`);
}

/*#############################################(ASSERT UNREACHABLE)#############################################*/
//#region assertUnreachable
/**
 * This function throws an error to indicate that a piece of code should never be reached.
 *
 * It is useful for marking code paths that should be impossible to reach.
 *
 * ##### NOTE:
 * The function will always throw an `AssertionError`.
 *
 * ### Test Example
 *
 * #### Using the assertUnreachable Function
 * ```ts
 * import { test, assertUnreachable } from '@inspatial/test';
 *
 * test({
 *   name: "This code should never be reached",
 *   fn: () => {
 *     assertUnreachable("This code should never be reached");
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from '@inspatial/test';
 *
 * test({
 *   name: "This code should never be reached",
 *   fn: () => {
 *     expect(() => assertUnreachable("This code should never be reached")).toThrow("Unreachable");
 *   }
 * });
 * ```
 *
 * @param msg - The message to show if the check fails (optional).
 */
export function assertUnreachable(msg?: string): never {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Unreachable${msgSuffix}`);
}
