/**
 * An extended {@link https://jsr.io/@std/expect/doc/~/expect | expect} that defines additional matchers.
 * @module
 */
// Imports
import {
  type Async,
  expect as _expect,
  type Expected,
  fn,
} from "jsr:@std/expect@1";
import {
  assert,
  assertEquals,
  AssertAssertionErrorProp,
  type AssertionError as _AssertionError,
  assertIsError,
  assertMatch,
  assertNotEquals,
  assertNotStrictEquals,
  assertObjectMatch,
  assertStrictEquals,
} from "./assert.ts";
import type {
  Arg,
  Arrayable,
  callback,
  Nullable,
  record,
  TypeOf,
} from "@inspatial/util";
import type { testing } from "./runtime.ts";
import { STATUS_CODE as Status } from "jsr:/@std/http@1/status";

/**
 * The ExtendedExpected interface defines the available assertion methods.
 */
export interface ExtendedExpected<IsAsync = false> extends Expected<IsAsync> {
  /**
   * Asserts a function to throw an error.
   *
   * Unlike the epoynmous method from `@std/expect`, this matcher accepts a second argument that can be either a string or a regular expression when the first argument is a Error class or instance.
   * In this case, the behavior is the same as {@link assertIsError} where you can both check the error type and message.
   *
   * ```ts ignore
   * import { expect } from "@inspatial/test"
   * const throws = () => { throw new Error("Expected error") }
   * expect(throws).toThrow(Error)
   * expect(throws).toThrow("Expected error")
   * expect(throws).toThrow(Error, /Expected/)
   * ```
   *
   * @experimental This method may be renamed to `toThrow()` directly without being marked as breaking change.
   */
  // deno-lint-ignore no-explicit-any
  toThrow: <E extends Error = Error>(
    error?: string | RegExp | E | (new (...args: any[]) => E),
    message?: string | RegExp
  ) => void;
  /**
   * Asserts a value matches the given predicate.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect("foo").toSatisfy((value:string) => value.length > 1)
   * ```
   */
  toSatisfy: (evaluate: callback) => unknown;
  /**
   * Asserts a value is of a given type (using `typeof` operator).
   * Note that `null` is not considered of type `"object"` unless `nullable` option is set to `true`.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect("foo").toBeType("string")
   * expect({}).toBeType("object")
   * expect(null).toBeType("object", { nullable: true })
   * expect(null).not.toBeType("object")
   * ```
   */
  toBeType: (type: string, options?: { nullable?: boolean }) => unknown;
  /**
   * Asserts a property matches a given descriptor (using `Object.getOwnPropertyDescriptor`).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * const foo = Object.defineProperties({}, { bar: { value: true, writable: false, enumerable: true } })
   * expect(foo).toHaveDescribedProperty("bar", { writable: false, enumerable: true })
   * ```
   */
  toHaveDescribedProperty: (
    key: PropertyKey,
    expected: PropertyDescriptor
  ) => unknown;
  /**
   * Asserts a writable property is immutable (i.e. setting its value does not throw but does not change its value either).
   *
   * Note that it will actually proceed to assign `testValue` and restore it to original value after test.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * const foo = new (class {
   *   #bar = true
   *   get bar() {
   *     return this.#bar
   *   }
   *   set bar(_:unknown) {
   *     return
   *   }
   * })()
   * expect(foo).toHaveImmutableProperty("bar")
   * ```
   */
  toHaveImmutableProperty: (key: PropertyKey, testValue?: unknown) => unknown;
  /**
   * Assert an object is iterable (checking `Symbol.iterator` presence).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect([]).toBeIterable()
   * expect(new Map()).toBeIterable()
   * expect(new Set()).toBeIterable()
   * ```
   */
  toBeIterable: () => unknown;
  /**
   * Assert an object is sealed (using `Object.isSealed`).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect(Object.seal({})).toBeSealed()
   * ```
   */
  toBeSealed: () => unknown;
  /**
   * Assert an object is frozen (using `Object.isFrozen`).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect(Object.freeze({})).toBeFrozen()
   * ```
   */
  toBeFrozen: () => unknown;
  /**
   * Assert an object is extensible (using `Object.isExtensible`).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect(Object.preventExtensions({})).not.toBeExtensible()
   * ```
   */
  toBeExtensible: () => unknown;
  /**
   * Asserts an object is a shallow copy (i.e. its content is identical but reference is not).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * const foo = { bar: true }
   * expect({...foo}).toBeShallowCopyOf(foo)
   * ```
   */
  toBeShallowCopyOf: (expected?: Iterable<unknown> | record) => unknown;
  /**
   * Asserts an iterable is empty.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect([]).toBeEmpty()
   * expect(new Map()).toBeEmpty()
   * expect(new Set()).toBeEmpty()
   * ```
   */
  toBeEmpty: () => unknown;
  /**
   * Asserts an iterable to be sorted.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect([1, 2, 3]).toBeSorted()
   * ```
   */
  toBeSorted: (compare?: Arg<Array<unknown>["sort"]>) => unknown;
  /**
   * Asserts an iterable to be reverse sorted.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect([3, 2, 1]).toBeReverseSorted()
   * ```
   */
  toBeReverseSorted: (compare?: Arg<Array<unknown>["sort"]>) => unknown;
  /**
   * Asserts a value is one of expected value.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect("foo").toBeOneOf(["foo", "bar"])
   * ```
   */
  toBeOneOf: (values: Iterable<unknown>) => unknown;
  /**
   * Asserts a number is with a given range.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect(Math.PI).toBeWithin([3, 4])
   * ```
   */
  toBeWithin: (range: [number, number], exclusive?: boolean) => unknown;
  /**
   * Asserts a number to be finite.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect(1).toBeFinite()
   * expect(Infinity).not.toBeFinite()
   * ```
   */
  toBeFinite: () => unknown;
  /**
   * Asserts a string to be parseable JSON.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect('{"foo":"bar"}').toBeParseableJSON()
   * ```
   */
  toBeParseableJSON: (reviver?: Arg<JSON["parse"], 1>) => unknown;
  /**
   * Asserts a string is a valid email address (using https://pdw.ex-parrot.com/Mail-RFC822-Address.html).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect("foo@example.com").toBeEmail()
   * expect("foo+bar@example.com").toBeEmail()
   * ```
   */
  toBeEmail(): () => unknown;
  /**
   * Asserts a string is a valid url (using `URL`).
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect("https://xr.new").toBeUrl()
   * ```
   */
  toBeUrl(): () => unknown;
  /**
   * Asserts a string is a valid base64 string.
   *
   * ```ts
   * import { expect } from "@inspatial/test"
   * expect(btoa("foo")).toBeBase64()
   * ```
   */
  toBeBase64: () => unknown;
  /**
   * Asserts a response to have a given status code.
   *
   * Note that `Response.body.cancel()` is automatically called to prevent leaks.
   * If you need to perform more assertions on a response, it is advised use separate matchers instead.
   *
   * ```ts
   * import { expect, Status } from "@inspatial/test"
   * expect(new Response(null, { status: Status.OK })).toRespondWithStatus(Status.OK)
   * expect(new Response(null, { status: Status.OK })).toRespondWithStatus([Status.OK, Status.Created])
   * expect(new Response(null, { status: Status.OK })).toRespondWithStatus("2XX")
   * ```
   */
  toRespondWithStatus: (
    status:
      | Arrayable<number>
      | "informational"
      | "1XX"
      | "successful"
      | "2XX"
      | "redirect"
      | "3XX"
      | "client_error"
      | "4XX"
      | "server_error"
      | "5XX"
  ) => unknown;
  /**
   * Asserts a string is hashed by specified algorithm.
   *
   * Algorithm may be either lowercase or uppercase, and contains dashes or not (e.g. `sha256`, `SHA256` and `SHA-256` will all be treated as the same).
   * Will throw if an unknown algorithm is specified.
   *
   * Please note that it only checks whether it could be a valid output of specified hash algorithm.
   *
   * ```ts
   * import { expect, Status } from "@inspatial/test"
   * expect("$2a$12$lpGSoVPZ8erLDF93Sqyic.U73v0/w0owPb3dIP9goO7iC5Wp/I8OG").toBeHashed("bcrypt")
   * ```
   */
  toBeHashed: (algorithm: string) => unknown;
  /**
   * Asserts a value is a valid date (using `Date`).
   *
   * ```ts
   * import { expect, Status } from "@inspatial/test"
   * expect("2024-07-13T20:30:57.958Z").toBeDate()
   * expect(new Date()).toBeDate()
   * ```
   */
  toBeDate: () => unknown;
  /**
   * Asserts a date is before another date.
   *
   * ```ts
   * import { expect, Status } from "@inspatial/test"
   * expect(new Date(Date.now() - 5000)).toBePast()
   * ```
   */
  toBePast: (date?: number | string | Date) => unknown;
  /**
   * Asserts a date is after another date.
   *
   * ```ts
   * import { expect, Status } from "@inspatial/test"
   * expect(new Date(Date.now() + 5000)).toBeFuture()
   * ```
   */
  toBeFuture: (date?: number | string | Date) => unknown;
  /** The negation object that allows chaining negated assertions. */
  not: IsAsync extends true
    ? Async<ExtendedExpected<true>>
    : ExtendedExpected<false>;
  /** The object that allows chaining assertions with async functions that are expected to resolve to a value. */
  resolves: Async<ExtendedExpected<true>>;
  /** The object that allows chaining assertions with async functions that are expected to throw an error. */
  rejects: Async<ExtendedExpected<true>>;
}

/** Error thrown when an assertion fails. */
let AssertionError: typeof _AssertionError;

// AssertionError is not exported by `@std/expect` (and it differs from `@std/assert`) which is why we retrieve it this way
try {
  _expect(null).toBe(true);
} catch (error: unknown) {
  if (error instanceof Error) {
    AssertionError = error.constructor as typeof _AssertionError;
  }
}

/** Process callback and format result to match {@link Expected} result interface. */
function process(
  not: boolean,
  evaluate: callback,
  message = ""
): { message: () => string; pass: boolean } {
  let pass = true;
  try {
    evaluate();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === AssertionError.name) {
        pass = false;
        message += message
          ? `${error.message.charAt(0).toLocaleLowerCase()}${error.message.substring(1)}`
          : error.message;
      } else {
        pass = not;
        message = error.message;
      }
    }
  }
  message = message
    .replaceAll("{!NOT} ", not ? "NOT " : "")
    .replaceAll("{NOT} ", not ? "" : "NOT")
    .replace(/,\s*$/, "")
    .trim();
  return { message: () => message, pass };
}

/** Asserts a value is iterable. */
function isIterable(value: testing): asserts value is Iterable<unknown> {
  assertNotEquals(value, null);
  if (typeof value[Symbol.iterator] !== "function") {
    throw new TypeError("Value is not iterable");
  }
}

/** Asserts a value is of a given type. */
function isType(value: testing, type: "string"): asserts value is string;
function isType(value: testing, type: "number"): asserts value is number;
function isType(value: testing, type: "bigint"): asserts value is bigint;
function isType(value: testing, type: "boolean"): asserts value is boolean;
function isType(value: testing, type: "symbol"): asserts value is symbol;
function isType(value: testing, type: "undefined"): asserts value is undefined;
function isType(
  value: testing,
  type: "object",
  options?: { nullable: true }
): asserts value is Nullable<record>;
function isType(
  value: testing,
  type: "object",
  options: { nullable: false }
): asserts value is record;
function isType(value: testing, type: "function"): asserts value is callback;
function isType(value: testing, type: TypeOf, { nullable = false } = {}) {
  switch (type) {
    case "string":
      if (typeof value !== "string")
        throw new TypeError(`Value is not of type "${type}"`);
      break;
    case "number":
      if (typeof value !== "number")
        throw new TypeError(`Value is not of type "${type}"`);
      break;
    case "boolean":
      if (typeof value !== "boolean")
        throw new TypeError(`Value is not of type "${type}"`);
      break;
    case "undefined":
      if (typeof value !== "undefined")
        throw new TypeError(`Value is not of type "${type}"`);
      break;
    case "object":
      if (typeof value !== "object")
        throw new TypeError(`Value is not of type "${type}"`);
      if (!nullable && value === null) throw new TypeError(`Value is null`);
      break;
    case "function":
      if (typeof value !== "function")
        throw new TypeError(`Value is not of type "${type}"`);
      break;
    case "symbol":
      if (typeof value !== "symbol")
        throw new TypeError(`Value is not of type "${type}"`);
      break;
    case "bigint":
      if (typeof value !== "bigint")
        throw new TypeError(`Value is not of type "${type}"`);
      break;
    default:
      throw new TypeError(`Invalid type "${type}"`);
  }
}
_expect.extend({
  toThrow(context, error, message) {
    // deno-lint-ignore no-explicit-any
    type ErrorConstructor = new (...args: any[]) => Error;
    if (typeof context.value === "function") {
      try {
        context.value = context.value();
      } catch (error) {
        context.value = error;
      }
    }
    if (
      message !== undefined &&
      (typeof error === "string" || error instanceof RegExp)
    ) {
      throw new TypeError(
        "First argument must be an Error class or instance when second argument is a string or RegExp"
      );
    }
    return process(
      context.isNot,
      () => {
        const expect = {
          class: undefined as ErrorConstructor | undefined,
          message: undefined as string | RegExp | undefined,
        };
        if (error instanceof Error) {
          expect.class = error.constructor as ErrorConstructor;
          expect.message = error.message;
        }
        if (error instanceof Function) {
          expect.class = error as ErrorConstructor;
        }
        if (typeof error === "string" || error instanceof RegExp) {
          expect.message = error;
        }
        if (message) {
          expect.message = message;
        }
        assertIsError(context.value, expect.class, expect.message);
      },
      context.isNot ? `Expected to NOT throw ${error}` : ""
    );
  },
  toSatisfy(context, predicate) {
    return process(
      context.isNot,
      () => {
        assert(predicate(context.value));
      },
      "Expected value to {!NOT} satisfy predicate"
    );
  },
  toBeType(context, type, { nullable = false } = {}) {
    return process(
      context.isNot,
      () => {
        try {
          isType(context.value, type, { nullable });
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new AssertionError(error.message);
          }
          throw new Error(`Assertion failed: ${error}`);
        }
      },
      `Expected value to {!NOT} be of type "${type}"${!nullable ? " and not null but " : ""}`
    );
  },
  toHaveDescribedProperty(context, key, expected) {
    return process(
      context.isNot,
      () => {
        isType(context.value, "object", { nullable: false });
        const descriptor = Object.getOwnPropertyDescriptor(context.value, key);
        if (!descriptor) {
          throw new ReferenceError(
            `Property "${String(key)}" does not exist on object`
          );
        }
        assertObjectMatch(descriptor, expected);
      },
      `Property "${String(key)}" does {!NOT} match provided descriptor, `
    );
  },
  toHaveImmutableProperty(context, key, testValue = Symbol()) {
    return process(
      context.isNot,
      () => {
        const value = context.value as Nullable<record>;
        if (
          value === null ||
          (typeof value !== "function" && typeof value !== "object")
        ) {
          throw new TypeError("Cannot be processed as value is not indexed");
        }
        const current = value[key];
        try {
          value[key] = testValue;
          assertStrictEquals(value[key], current);
        } finally {
          value[key] = current;
        }
      },
      `Expected property "${String(key)}" to {!NOT} be immutable, previous and current `
    );
  },
  toBeIterable(context) {
    return process(
      context.isNot,
      () => {
        try {
          isIterable(context.value);
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new AssertionError(error.message);
          }
          throw new Error(`Assertion failed: ${error}`);
        }
      },
      `Expected value to {!NOT} be iterable, `
    );
  },
  toBeSealed(context) {
    return process(
      context.isNot,
      () => {
        assert(Object.isSealed(context.value));
      },
      `Expected value to {!NOT} be sealed`
    );
  },
  toBeFrozen(context) {
    return process(
      context.isNot,
      () => {
        assert(Object.isFrozen(context.value));
      },
      `Expected value to {!NOT} be frozen`
    );
  },
  toBeExtensible(context) {
    return process(
      context.isNot,
      () => {
        assert(Object.isExtensible(context.value));
      },
      `Expected value to {!NOT} be extensible`
    );
  },
  toBeShallowCopyOf(context, expected) {
    return process(
      context.isNot,
      () => {
        assertEquals(context.value, expected);
        assertNotStrictEquals(
          context.value,
          expected,
          `Detected same-reference`
        );
      },
      `Expected value to {!NOT} be a shallow copy, `
    );
  },
  toBeEmpty(context) {
    return process(
      context.isNot,
      () => {
        isIterable(context.value);
        assertStrictEquals([...context.value].length, 0);
      },
      `Expected value to {!NOT} be empty, `
    );
  },
  toBeSorted(context, compare) {
    return process(
      context.isNot,
      () => {
        const value = context.value;
        isIterable(value);
        assertEquals([...value], [...value].sort(compare));
      },
      `Expected value to {!NOT} be sorted, `
    );
  },
  toBeReverseSorted(context, compare) {
    return process(
      context.isNot,
      () => {
        isIterable(context.value);
        assertEquals(
          [...context.value],
          [...context.value].sort(compare).reverse()
        );
      },
      `Expected value to {!NOT} be reverse sorted, `
    );
  },
  toBeOneOf(context, values) {
    return process(
      context.isNot,
      () => {
        assert([...values].includes(context.value));
      },
      `Expected value "${context.value}" to {!NOT} be one of expected values`
    );
  },
  toBeWithin(context, range, exclusive) {
    return process(
      context.isNot,
      () => {
        const value = context.value;
        const [min, max] = range;
        isType(value, "number");
        isType(min, "number");
        isType(max, "number");
        exclusive
          ? assert(value > min && value < max)
          : assert(value >= min && value <= max);
      },
      `Expected value to {!NOT} be within range ${exclusive ? `]${range[0]}, ${range[1]}[` : `[${range[0]}, ${range[1]}]`}, `
    );
  },
  toBeFinite(context) {
    return process(
      context.isNot,
      () => {
        isType(context.value, "number");
        assert(Number.isFinite(context.value));
      },
      `Expected value to {!NOT} be finite, `
    );
  },
  toBeParseableJSON(context, reviver) {
    return process(
      context.isNot,
      () => {
        try {
          JSON.parse(`${context.value}`, reviver);
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new AssertionError(error.message);
          }
          throw new Error(`Assertion failed: ${error}`);
        }
      },
      `Expected value to {!NOT} be parseable JSON, `
    );
  },
  toBeEmail(context) {
    return process(
      context.isNot,
      () => {
        // https://pdw.ex-parrot.com/Mail-RFC822-Address.html
        assertMatch(
          `${context.value}`,
          // deno-lint-ignore no-control-regex
          /(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)|(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*:(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)(?:,\s*(?:(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \x00-\x19]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*))*)?;\s*)/
        );
      },
      `Expected "${context.value}" to {!NOT} be a valid email`
    );
  },
  toBeUrl(context) {
    return process(
      context.isNot,
      () => {
        assert(URL.canParse(`${context.value}`));
      },
      `Expected "${context.value}" to {!NOT} be a valid URL`
    );
  },
  toBeBase64(context) {
    return process(
      context.isNot,
      () => {
        try {
          atob(`${context.value}`);
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new AssertionError(error.message);
          }
          throw new Error(`Assertion failed: ${error}`);
        }
      },
      `Expected "${context.value}" to {!NOT} be a valid base64 string`
    );
  },
  toRespondWithStatus(context, code) {
    return process(context.isNot, () => {
      if (!(context.value instanceof Response)) {
        throw new TypeError("Value is not a Response object");
      }
      let ok = false;
      let message = "";
      const status = context.value.status;
      switch (code) {
        case "1XX":
        case "informational":
          ok = status >= 100 && status < 200;
          message = `"${code}" (100-199) but got ${status}`;
          break;
        case "2XX":
        case "successful":
          ok = status >= 200 && status < 300;
          message = `"${code}" (200-299) but got ${status}`;
          break;
        case "3XX":
        case "redirect":
          ok = status >= 300 && status < 400;
          message = `"${code}" (300-399) but got ${status}`;
          break;
        case "4XX":
        case "client_error":
          ok = status >= 400 && status < 500;
          message = `"${code}" (400-499) but got ${status}`;
          break;
        case "5XX":
        case "server_error":
          ok = status >= 500 && status < 600;
          message = `"${code}" (500-599) but got ${status}`;
          break;
        default: {
          const codes = [code].flat();
          ok = codes.includes(status);
          message = `[${codes.join(", ")}] but got ${status}`;
        }
      }
      try {
        if (context.isNot && ok === context.isNot) {
          throw new TypeError(
            `Expected response status to {!NOT} be ${message}`
          );
        }
        if (context.isNot || ok === context.isNot) {
          throw new AssertionError(
            `Expected response status to {!NOT} be ${message}`
          );
        }
      } finally {
        context.value.body?.cancel();
      }
    });
  },
  toBeHashed(context, algorithm) {
    return process(
      context.isNot,
      () => {
        isType(context.value, "string");
        algorithm = algorithm.toLocaleLowerCase().replace("-", "");
        const algorithms = {
          bcrypt: 0,
          md5: 32,
          sha0: 40,
          sha1: 40,
          sha224: 56,
          sha256: 64,
          sha384: 96,
          sha512: 128,
          "sha512/224": 56,
          "sha512/256": 64,
        } as record<number>;
        if (algorithms[algorithm]) {
          assertStrictEquals(context.value.length, algorithms[algorithm]);
          if (!/^[a-z0-9]+$/i.test(context.value)) {
            throw new TypeError("Value contains non-hexadecimal characters");
          }
          return;
        }
        if (algorithm === "bcrypt") {
          assertMatch(context.value, /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/);
          return;
        }
        throw new RangeError(`Algorithm "${algorithm}" is unknown`);
      },
      `Expected value to {!NOT} be hashed by ${algorithm}, `
    );
  },
  toBeDate(context) {
    return process(
      context.isNot,
      () => {
        assert(
          Number.isFinite(
            new Date(context.value as number | string | Date).getTime()
          )
        );
      },
      `Expected value to {!NOT} be a date, `
    );
  },
  toBePast(context, ref = new Date()) {
    return process(
      context.isNot,
      () => {
        const date = new Date(context.value as number | string | Date);
        if (date > ref) {
          throw new AssertionError(
            `${date.toISOString()} is after ${ref.toISOString()}`
          );
        }
      },
      `Expected value to {!NOT} be in the past, `
    );
  },
  toBeFuture(context, ref = new Date()) {
    return process(
      context.isNot,
      () => {
        const date = new Date(context.value as number | string | Date);
        if (date < ref) {
          throw new AssertionError(
            `${date.toISOString()} is before ${ref.toISOString()}`
          );
        }
      },
      `Expected value to {!NOT} be in the future, `
    );
  },
});

// ---------------------------------------------------------------------------
// Compatibility aliases for older test suites --------------------------------
// These simply forward to already-implemented matchers so we don't duplicate
// logic and we retain consistent error messaging.

_expect.extend({
  // Alias for `toThrow`
  toThrowError(context: any, ...args: unknown[]) {
    // Re-use the main implementation via direct call
    // @ts-ignore accessing private matcher map
    return (_expect as any).matchers.toThrow(context, ...args);
  },

  // Alias for `toBeType` with slightly different naming used in legacy tests
  toBeTypeOf(context: any, typeExpected: string) {
    // @ts-ignore private matcher access
    return (_expect as any).matchers.toBeType(context, typeExpected, {
      nullable: false,
    });
  },
});

/**
 * A friendly testing helper that lets you check if things work the way you want.
 *
 * @example
 * ```ts
 * import { test, expect } from '@inspatial/test'
 * // for dead or unwanted code removal (tree-shaking) use:
 * import { test, expect } from '@inspatial/test/expect';
 *
 * // Check if numbers are equal
 * test({
 *   name: "...",
 *   fn: () => {
 *     expect(2 + 2).toBe(4)
 *   }
 * })
 *
 * // Check if arrays contain the same items
 * test({
 *   name: "...",
 *   fn: () => {
 *     expect(['apple', 'banana']).toEqual(['apple', 'banana'])
 *   }
 * })
 *
 * // Check if something is true
 * test({
 *   name: "...",
 *   fn: () => {
 *     expect(true).toBe(true)
 *   }
 * })
 *
 * // Check if a string contains text
 * test({
 *   name: "...",
 *   fn: () => {
 *     expect('hello world').toContain('hello')
 *   }
 * })
 *
 * // Check if something throws an error
 * test({
 *   name: "...",
 *   fn: () => {
 *     expect(() => {
 *       throw new Error('Oops!')
 *     }).toThrow('Oops!')
 *   }
 * })
 *
 * // Check if something is not equal
 * test({
 *   name: "...",
 *   fn: () => {
 *     expect(123).not.toBe(456)
 *   }
 * })
 * ```
 *
 * The `expect` function is like a helper that takes what you want to test
 * and gives you ways to check if it's correct. Think of it like asking questions:
 *
 * - "Is this equal to that?" → .toBe()
 * - "Does this contain that?" → .toContain()
 * - "Is this true?" → .toBeTruthy()
 *
 * You can also check if something is NOT true by adding .not:
 * ```ts
 * test({
 *   name: "...",
 *   async fn () => {
 *     expect(123).not.toBe(456) // "123 should NOT be 456"
 *   }
 * })
 * ```
 *
 * For checking things that take time (like loading data), you can use await:
 * ```ts
 * test({
 *   name: "...",
 *   async fn() {
 *     await expect(fetchData()).resolves.toBe('some data')
 *   }
 * })
 * ```
 */
const expect = _expect as unknown as ((
  ...args: Parameters<typeof _expect>
) => ExtendedExpected) & { [K in keyof typeof _expect]: (typeof _expect)[K] };

export { AssertionError, expect, fn, Status };
export type {
  _AssertionError,
  AssertAssertionErrorProp,
  _expect,
  Arg,
  Arrayable,
  Async,
  callback,
  Expected,
  Nullable,
  record,
  TypeOf,
};
