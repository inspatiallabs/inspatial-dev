import {
  ContextNotFoundErrorClass,
  createContext,
  createInteractiveRoot,
  getContext,
  hasContext,
  NoOwnerErrorClass,
  setContext,
  flushSync,
} from "../../signal-core/index.ts";
import { test, expect, describe, it } from "@inspatial/test";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("should create context", () => {
  const context = createContext(1);

  expect(context.id).toBeDefined();
  expect(context.defaultValue).toEqual(1);

  createInteractiveRoot(() => {
    setContext(context);
    expect(getContext(context)).toEqual(1);
  });

  cleanupFns.push(() => flushSync());
});

test("should forward context across roots", () => {
  const context = createContext(1);
  createInteractiveRoot(() => {
    setContext(context, 2);
    createInteractiveRoot(() => {
      expect(getContext(context)).toEqual(2);
      createInteractiveRoot(() => {
        expect(getContext(context)).toEqual(2);
      });
    });
  });

  cleanupFns.push(() => flushSync());
});

test("should not expose context on parent when set in child", () => {
  const context = createContext(1);
  createInteractiveRoot(() => {
    createInteractiveRoot(() => {
      setContext(context, 4);
    });

    expect(getContext(context)).toEqual(1);
  });

  cleanupFns.push(() => flushSync());
});

test("should return true if context has been provided", () => {
  const context = createContext();
  createInteractiveRoot(() => {
    setContext(context, 1);
    expect(hasContext(context)).toBeTruthy();
  });

  cleanupFns.push(() => flushSync());
});

test("should return false if context has not been provided", () => {
  const context = createContext();
  createInteractiveRoot(() => {
    expect(hasContext(context)).toBeFalsy();
  });

  cleanupFns.push(() => flushSync());
});

test("should throw error when trying to get context outside owner", () => {
  const context = createContext();
  expect(() => getContext(context)).toThrow(NoOwnerErrorClass);

  cleanupFns.push(() => flushSync());
});

test("should throw error when trying to set context outside owner", () => {
  const context = createContext();
  expect(() => setContext(context)).toThrow(NoOwnerErrorClass);

  cleanupFns.push(() => flushSync());
});

test("should throw error when trying to get context without setting it first", () => {
  const context = createContext();
  expect(() => createInteractiveRoot(() => getContext(context))).toThrow(
    ContextNotFoundErrorClass
  );

  cleanupFns.push(() => flushSync());
});
