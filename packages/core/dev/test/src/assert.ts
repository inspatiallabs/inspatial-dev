/*#############################################(IMPORTS)#############################################*/
import type {
  AnyConstructor,
  ArrayLikeArg,
  Falsy,
  GetConstructorType,
} from "@std/assert";

import * as stdAssert from "@std/assert";

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
export type AssertAnyConstructorProp = AnyConstructor;

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
export type AssertArrayLikeArgProp = ArrayLikeArg;

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
export type AssertFalsyProp = Falsy;

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
export type AssertGetConstructorTypeProp = GetConstructorType;

/*#############################################(ASSERTION ERROR)#############################################*/
//#region AssertionError
export class AssertionError extends Error {
  /** Constructs a new instance.
   *
   * @param message The error message.
   * @param options Additional options. This argument is still unstable. It may change in the future release.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AssertionError";
  }
}

/*#############################################(ASSERT)#############################################*/
//#region assert
/**
 * Checks if something is true. If it's not, it stops your code and tells you there's a problem.
 *
 * Example:
 * ```ts
 * import { assert } from '@inspatial/test';
 *
 * const userAge = 25;
 * assert(userAge > 0, "Age must be positive");
 * ```
 * @param expr - What you want to check is true
 * @param msg - The message to show if the check fails
 */
export function assert(expr: unknown, msg = ""): asserts expr {
  if (!expr) {
    throw new AssertionError(msg);
  }
}

/*#############################################(ASSERT EQUALS)#############################################*/
//#region assertEquals
/**
 * Checks if two things are the same. Great for making sure values match what you expect.
 *
 * Example:
 * ```ts
 * import { assertEquals } from '@inspatial/test';
 *
 * const sum = 2 + 2;
 * assertEquals(sum, 4, "2 + 2 should equal 4");
 * ```
 * @param actual - What you got
 * @param expected - What you wanted
 * @param msg - The message to show if they don't match
 */
export function assertEquals<T>(actual: T, expected: T, msg?: string): void {
  return stdAssert.assertEquals(actual, expected, msg);
}

/*#############################################(ASSERT IS ERROR)#############################################*/
//#region assertIsError
/**
 * Checks if something is an error. Useful when testing error handling.
 *
 * Example:
 * ```ts
 * import { assertIsError } from '@inspatial/test';
 *
 * try {
 *   throw new Error("Oops!");
 * } catch (error) {
 *   assertIsError(error);
 * }
 * ```
 */
export function assertIsError(error: Error): void {
  return stdAssert.assertIsError(error);
}

/*#############################################(ASSERT MATCH)#############################################*/
//#region assertMatch
/**
 * Checks if text matches a pattern.
 *
 * Example:
 * ```ts
 * import { assertMatch } from '@inspatial/test';
 *
 * const email = "user@example.com";
 * assertMatch(email, /^.+@.+\..+$/, "Should be a valid email");
 * ```
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
 * Checks if two things are different.
 *
 * Example:
 * ```ts
 * import { assertNotEquals } from '@inspatial/test';
 *
 * const player1 = "Mario";
 * const player2 = "Luigi";
 * assertNotEquals(player1, player2, "Players should be different");
 * ```
 */
export function assertNotEquals<T>(actual: T, expected: T, msg?: string): void {
  return stdAssert.assertNotEquals(actual, expected, msg);
}

/*#############################################(ASSERT EXISTS)#############################################*/
//#region assertExists
/**
 * Checks if a value exists (is not null or undefined).
 *
 * Example:
 * ```ts
 * import { assertExist } from '@inspatial/test';
 * import { getUser } from '@inspatial/auth';
 *
 * const user = getUser();
 * assertExists(user, "User should exist");
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
 * Checks if something is false.
 *
 * Example:
 * ```ts
 * import { assertFalse } from '@inspatial/test';
 *
 * const isGameOver = false;
 * assertFalse(isGameOver, "Game should not be over");
 * ```
 *
 * @param expr - What you want to check is false
 * @param msg -  The message to show if the check fails (optional)
 */
export function assertFalse(expr: unknown, msg = ""): asserts expr is Falsy {
  if (expr) {
    throw new AssertionError(msg);
  }
}

/*#############################################(ASSERT NOT STRICTLY EQUALS)#############################################*/
//#region assertNotStrictEquals
/**
 * Checks if two things are not strictly equal.
 *
 * Example:
 * ```ts
 * import { assertNotStrictEquals } from '@inspatial/test';
 *
 * const player1 = "Mario";
 * const player2 = "Luigi";
 * assertNotStrictEquals(player1, player2, "Players should be different");
 * ```
 */
export function assertNotStrictEquals(
  actual: unknown,
  expected: unknown,
  msg?: string
): void {
  return stdAssert.assertNotStrictEquals(actual, expected, msg);
}

/*#############################################(ASSERT OBJECT MATCH)#############################################*/
//#region assertObjectMatch
/**
 * Checks if two objects are equal.
 *
 * Example:
 * ```ts
 * import { assertObjectMatch } from '@inspatial/test';
 *
 * const player1 = { name: "Mario" };
 * const player2 = { name: "Mario" };
 * assertObjectMatch(player1, player2, "Players should be equal");
 * ```
 */
export function assertObjectMatch(
  actual: unknown,
  expected: unknown,
  msg?: string
): void {
  return stdAssert.assertObjectMatch(actual, expected, msg);
}

/*#############################################(ASSERT STRICTLY EQUALS)#############################################*/
//#region assertStrictEquals
/**
 * Checks if two things are strictly equal.
 *
 * Example:
 * ```ts
 * import { assertStrictEquals } from '@inspatial/test';
 *
 * const player1 = "Mario";
 * const player2 = "Mario";
 * assertStrictEquals(player1, player2, "Players should be equal");
 * ```
 */
export function assertStrictEquals(
  actual: unknown,
  expected: unknown,
  msg?: string
): void {
  return stdAssert.assertStrictEquals(actual, expected, msg);
}

/*#############################################(ASSERT ALMOST EQUALS)#############################################*/
//#region assertAlmostEquals
/**
 * Checks if two numbers are almost equal.
 *
 * Example:
 * ```ts
 * import { assertAlmostEquals } from '@inspatial/test';
 *
 * const player1 = 25;
 * const player2 = 25.00001;
 * assertAlmostEquals(player1, player2, "Players should be equal");
 * ```
 * @param actual - What you got
 * @param expected - What you wanted
 * @param tolerance - The maximum difference allowed (optional)
 * @param msg - The message to show if they don't match (optional)
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
 * Checks if an array includes a certain value.
 *
 * Example:
 * ```ts
 * import { assertArrayIncludes } from '@inspatial/test';
 *
 * const items = [1, 2, 3];
 * assertArrayIncludes(items, 2, "2 should be in the array");
 * ```
 */
export function assertArrayIncludes(
  array: unknown[],
  item: unknown,
  msg?: string
): void {
  return stdAssert.assertArrayIncludes(array, item, msg);
}

/*#############################################(ASSERT GREATER)#############################################*/
//#region assertGreater
/**
 * Checks if something is greater than a certain value.
 *
 * Example:
 * ```ts
 * import { assertGreater } from '@inspatial/test';
 *
 * const player1 = 25;
 * const player2 = 20;
 * assertGreater(player1, player2, "Player1 should be greater than Player2");
 * ```
 */
export function assertGreater(
  actual: number,
  expected: number,
  msg?: string
): void {
  return stdAssert.assertGreater(actual, expected, msg);
}

/*#############################################(ASSERT GREATER OR EQUAL)#############################################*/
//#region assertGreaterOrEqual
/**
 * Checks if something is greater than or equal to a certain value.
 *
 * Example:
 * ```ts
 * import { assertGreaterOrEqual } from '@inspatial/test';
 *
 * const player1 = 25;
 * const player2 = 20;
 * assertGreaterOrEqual(player1, player2, "Player1 should be greater than or equal to Player2");
 * ```
 */
export function assertGreaterOrEqual(
  actual: number,
  expected: number,
  msg?: string
): void {
  return stdAssert.assertGreaterOrEqual(actual, expected, msg);
}

/*#############################################(ASSERT INSTANCE OF)#############################################*/
//#region assertInstanceOf
/**
 * Checks if something is a specific type of thing.
 * For example, checking if a date is really a Date, or if a number is really a Number.
 *
 * Example:
 * ```ts
 * import { assertInstanceOf } from '@inspatial/test';
 *
 * // Creating some things to check
 * const today = new Date();
 * const number = 42;
 *
 * // These work fine
 * assertInstanceOf(today, Date, "Should be a date");
 *
 * // These will show an error
 * assertInstanceOf(number, Date, "Numbers aren't dates!");
 * assertInstanceOf(null, Date, "null isn't a date!");
 * assertInstanceOf(undefined, Date, "undefined isn't a date!");
 * ```
 *
 * @param actual - The thing you want to check
 * @param expectedType - What type you think it should be
 * @param msg - Message to show if it's not the right type
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
export function assertLess(
  actual: number,
  expected: number,
  msg?: string
): void {
  return stdAssert.assertLess(actual, expected, msg);
}

/*#############################################(ASSERT LESS OR EQUAL)#############################################*/
//#region assertLessOrEqual
/**
 * Checks if something is less than or equal to a certain value.
 *
 * Example:
 * ```ts
 * import { assertLessOrEqual } from '@inspatial/test';
 *
 * const player1 = 25;
 * const player2 = 30;
 * assertLessOrEqual(player1, player2, "Player1 should be less than or equal to Player2");
 * ```
 */
export function assertLessOrEqual(
  actual: number,
  expected: number,
  msg?: string
): void {
  return stdAssert.assertLessOrEqual(actual, expected, msg);
}

/*#############################################(ASSERT NOT INSTANCE OF)#############################################*/
//#region assertNotInstanceOf
/**
 * Checks if an instance is not of a certain type.
 *
 * Example:
 * ```ts
 * import { assertNotInstanceOf } from '@inspatial/test';
 *
 * const player = new Player();
 * assertNotInstanceOf(player, Player, "player should not be an instance of Player");
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
 * Checks if text does not match a pattern.
 *
 * Example:
 * ```ts
 * import { assertNotMatch } from '@inspatial/test';
 *
 * const email = "user@example.com";
 * assertNotMatch(email, /^.+@.+\..+$/, "Should not be a valid email");
 * ```
 * @param actual - What you got
 * @param expected - What you wanted
 * @param msg - The message to show if they don't match (optional)
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
 * Checks if a function rejects a certain value.
 *
 * Example:
 * ```ts
 * import { assertRejects } from '@inspatial/test';
 *
 * function isEven(n: number): boolean {
 *   return n % 2 === 0;
 * }
 *
 * assertRejects(isEven, 1, "isEven should reject odd numbers");
 * ```
 *
 * @param fn - The function to check
 * @param errorClassOrMsg - The error class or message to expect
 * @param msgIncludes - The message to expect (optional)
 * @param msg - The message to show if the check fails (optional)
 */
export function assertRejects<E extends Error = Error>(
  fn: () => PromiseLike<unknown>,
  // deno-lint-ignore no-explicit-any
  ErrorClass: abstract new (...args: any[]) => E,
  msgIncludes?: string,
  msg?: string
): Promise<E>;
export async function assertRejects<E extends Error = Error>(
  fn: () => PromiseLike<unknown>,
  errorClassOrMsg?: // deno-lint-ignore no-explicit-any
  (abstract new (...args: any[]) => E) | string,
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
 * Checks if a string includes a certain substring.
 *
 * Example:
 * ```ts
 * import { assertStringIncludes } from '@inspatial/test';
 *
 * const email = "user@example.com";
 * assertStringIncludes(email, "@", "Should contain '@'");
 * ```
 *
 * @param actual - What you got
 * @param expected - What you wanted
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
 * Checks if a function throws a certain error.
 *
 * Example:
 * ```ts
 * import { assertThrows } from '@inspatial/test';
 *
 * function isEven(n: number): boolean {
 *   if (n % 2 !== 0) {
 *     throw new Error("Odd number");
 *   }
 *   return true;
 * }
 *
 * assertThrows(isEven, 1, "isEven should throw an error for odd numbers");
 * ```
 *
 * @param fn - The function to check
 * @param errorClassOrMsg - The error class or message to expect
 * @param msgIncludes - The message to expect (optional)
 * @param msg - The message to show if the check fails (optional)
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
 * Example:
 * ```ts
 * import { assertEqual } from '@inspatial/test';
 *
 * const firstName = "Ben";
 * const lastName = "Emma";
 *
 * assertEqual(firstName, lastName); // false
 * assertEqual(firstName, firstName); // true
 * ```
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

/*#############################################(ASSERT FAIL)#############################################*/
//#region assertFail
/**
 * Fails a test.
 *
 * Example:
 * ```ts
 * import { assertFail } from '@inspatial/test';
 *
 * assertFail("This test must fail");
 * ```
 *
 * @param msg - The message to show if the check fails (optional)
 */
export function assertFail(msg?: string): never {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Failed assertion${msgSuffix}`);
}

/*#############################################(ASSERT UNIMPLEMENTED)#############################################*/
//#region assertUnimplemented
/**
 * Unimplements a function: throws an error if the function is not implemented.
 *
 * Example:
 * ```ts
 * import { assertUnimplemented } from '@inspatial/test';
 *
 * assertUnimplemented("This function is not implemented");
 * ```
 *
 * @param msg - The message to show if the check fails (optional)
 */
export function assertUnimplemented(msg?: string): never {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Unimplemented${msgSuffix}`);
}

/*#############################################(ASSERT UNREACHABLE)#############################################*/
//#region assertUnreachable
/**
 * Unreachable code: throws an error if the code is unreachable.
 *
 * Example:
 * ```ts
 * import { assertUnreachable } from '@inspatial/test';
 *
 * assertUnreachable("This code should never be reached");
 * ```
 *
 * @param msg - The message to show if the check fails (optional)
 */
export function assertUnreachable(msg?: string): never {
  const msgSuffix = msg ? `: ${msg}` : ".";
  throw new AssertionError(`Unreachable${msgSuffix}`);
}
