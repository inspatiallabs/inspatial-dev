import { createEffect, createRoot, createSignal, flushSync } from "../signal/src/index.ts";
import { test, expect, spy } from "@inspatial/test";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach(fn => fn());
  flushSync();
});

test("should batch updates", () => {
  const [$x, setX] = createSignal(10);
  const effect = spy();

  createRoot(() => createEffect($x, effect));
  flushSync();

  setX(20);
  setX(30);
  setX(40);

  expect(effect).toHaveBeenCalledTimes(1);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(2);
  
  cleanupFns.push(() => flushSync());
});

test("should wait for queue to flush", () => {
  const [$x, setX] = createSignal(10);
  const $effect = spy();

  createRoot(() => createEffect($x, $effect));
  flushSync();

  expect($effect).toHaveBeenCalledTimes(1);

  setX(20);
  flushSync();
  expect($effect).toHaveBeenCalledTimes(2);

  setX(30);
  flushSync();
  expect($effect).toHaveBeenCalledTimes(3);
  
  cleanupFns.push(() => flushSync());
});

test("should not fail if called while flushing", () => {
  const [$a, setA] = createSignal(10);

  const effect = spy(() => {
    flushSync();
  });

  createRoot(() => createEffect($a, effect));
  flushSync();

  expect(effect).toHaveBeenCalledTimes(1);

  setA(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(2);
  
  cleanupFns.push(() => flushSync());
});
