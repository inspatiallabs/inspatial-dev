import {
  createEffect,
  createSignal,
  flushSync,
  getObserver,
  runWithObserver,
  type ComputationClass
} from "../signal/src/index.ts";
import { test, expect, mockFn, afterEach } from "@inspatial/test";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach(fn => fn());
  flushSync();
});

test("should return value", () => {
  let observer!: ComputationClass | null;

  createEffect(
    () => {
      observer = getObserver()!;
    },
    () => {}
  );
  expect(runWithObserver(observer!, () => 100)).toBe(100);
  
  cleanupFns.push(() => flushSync());
});

test("should add dependencies to no deps", () => {
  let count = 0;

  const [a, setA] = createSignal(0);
  createEffect(
    () => getObserver()!,
    o => {
      runWithObserver(o, () => {
        a();
        count++;
      });
    }
  );
  expect(count).toBe(0);
  flushSync();
  expect(count).toBe(1);
  setA(1);
  flushSync();
  expect(count).toBe(2);
  
  cleanupFns.push(() => flushSync());
});

test("should add dependencies to existing deps", () => {
  let count = 0;

  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);
  createEffect(
    () => (a(), getObserver()!),
    o => {
      runWithObserver(o, () => {
        b();
        count++;
      });
    }
  );
  expect(count).toBe(0);
  flushSync();
  expect(count).toBe(1);
  setB(1);
  flushSync();
  expect(count).toBe(2);
  setA(1);
  flushSync();
  expect(count).toBe(3);
  
  cleanupFns.push(() => flushSync());
});
