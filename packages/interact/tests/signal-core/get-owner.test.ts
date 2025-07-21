import {
  createEffect,
  createRoot,
  getOwner,
  untrack,
  flushSync,
} from "../../signal-core/index.ts";
import { test, expect } from "@inspatial/test";

// Setup cleanup for tests
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("should return current owner", () => {
  createRoot(() => {
    const owner = getOwner();
    expect(owner).toBeDefined();
    createEffect(
      () => {
        expect(getOwner()).toBeDefined();
        expect(getOwner()).not.toBe(owner);
      },
      () => {}
    );
  });

  cleanupFns.push(() => flushSync());
});

test("should return parent scope from inside untrack", () => {
  createRoot(() => {
    untrack(() => {
      expect(getOwner()).toBeDefined();
    });
  });

  cleanupFns.push(() => flushSync());
});
