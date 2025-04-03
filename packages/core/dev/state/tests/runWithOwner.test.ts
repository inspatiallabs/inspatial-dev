import {
  createErrorBoundary,
  createRenderEffect,
  createRoot,
  flushSync,
  getOwner,
  OwnerClass,
  runWithOwner
} from "../signal/src/index.ts";
import { test, expect, mockFn, afterEach } from "../../../dev/test/src/index.ts";
// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach(fn => fn());
  flushSync();
});

test("should scope function to current scope", () => {
  let owner!: OwnerClass | null;

  createRoot(() => {
    owner = getOwner()!;
    owner._context = { foo: 1 };
  });

  runWithOwner(owner, () => {
    expect(getOwner()!._context?.foo).toBe(1);
  });
  
  cleanupFns.push(() => flushSync());
});

test("should return value", () => {
  expect(runWithOwner(null, () => 100)).toBe(100);
  
  cleanupFns.push(() => flushSync());
});

test("should handle errors", () => {
  const error = new Error(),
    handler = mockFn();

  let owner!: OwnerClass | null;
  const b = createErrorBoundary(
    () => {
      owner = getOwner();
    },
    err => handler(err)
  );
  b();

  runWithOwner(owner, () => {
    createRenderEffect(
      () => {
        throw error;
      },
      () => {}
    );
  });

  b();
  flushSync();
  expect(handler).toHaveBeenCalledWith(error);
  
  cleanupFns.push(() => flushSync());
});
