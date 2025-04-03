import { createSignal, flushSync } from "../signal/src/index.ts";
import { test, expect } from "../../test/src/index.ts";
// Use test.each for setup/teardown since test.afterEach isn't available
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("should store and return value on read", () => {
  const [$x] = createSignal(1);
  expect($x).toBeInstanceOf(Function);
  expect($x()).toBe(1);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should update signal via setter", () => {
  const [$x, setX] = createSignal(1);
  setX(2);
  expect($x()).toBe(2);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should update signal via update function", () => {
  const [$x, setX] = createSignal(1);
  setX((n: number) => n + 1);
  expect($x()).toBe(2);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should accept equals option", () => {
  const [$x, setX] = createSignal(1, {
    // Skip even numbers.
    equals: (prev: number, next: number) => prev + 1 === next,
  });

  setX(11);
  expect($x()).toBe(11);

  setX(12);
  expect($x()).toBe(11);

  setX(13);
  expect($x()).toBe(13);

  setX(14);
  expect($x()).toBe(13);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should update signal with functional value", () => {
  const [$x, setX] = createSignal<() => number>(() => () => 10);
  expect($x()()).toBe(10);
  setX(() => () => 20);
  expect($x()()).toBe(20);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should create signal derived from another signal", () => {
  const [$x, setX] = createSignal(1);
  const [$y, setY] = createSignal(() => $x() + 1);
  expect($y()).toBe(2);
  setY(1);
  expect($y()).toBe(1);
  setX(2);
  expect($y()).toBe(3);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});
