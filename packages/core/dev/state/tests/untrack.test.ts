import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  flushSync,
  onCleanup,
  untrack
} from "../signal/src/index.ts";
import { test, expect, mockFn } from "../../../dev/test/src/index.ts";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach(fn => fn());
  flushSync();
});

test("should not create dependency", () => {
  const effect = mockFn();
  const memo = mockFn();

  const [$x, setX] = createSignal(10);

  const $a = createMemo(() => $x() + 10);
  const $b = createMemo(() => {
    memo();
    return untrack($a) + 10;
  });

  createRoot(() =>
    createEffect(
      () => {
        effect();
        expect(untrack($x)).toBe(10);
        expect(untrack($a)).toBe(20);
        expect(untrack($b)).toBe(30);
      },
      () => {}
    )
  );
  flushSync();

  expect(effect).toHaveBeenCalledTimes(1);
  expect(memo).toHaveBeenCalledTimes(1);

  setX(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(1);
  expect(memo).toHaveBeenCalledTimes(1);
  
  cleanupFns.push(() => flushSync());
});

test("should not affect deep dependency being created", () => {
  const effect = mockFn();
  const memo = mockFn();

  const [$x, setX] = createSignal(10);
  const [$y, setY] = createSignal(10);
  const [$z, setZ] = createSignal(10);

  const $a = createMemo(() => {
    memo();
    return $x() + untrack($y) + untrack($z) + 10;
  });

  createRoot(() =>
    createEffect(
      () => {
        effect();
        expect(untrack($x)).toBe(10);
        expect(untrack($a)).toBe(40);
      },
      () => {}
    )
  );
  flushSync();

  expect(effect).toHaveBeenCalledTimes(1);
  expect($a()).toBe(40);
  expect(memo).toHaveBeenCalledTimes(1);

  setX(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(1);
  expect($a()).toBe(50);
  expect(memo).toHaveBeenCalledTimes(2);

  setY(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(1);
  expect($a()).toBe(50);
  expect(memo).toHaveBeenCalledTimes(2);

  setZ(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(1);
  expect($a()).toBe(50);
  expect(memo).toHaveBeenCalledTimes(2);
  
  cleanupFns.push(() => flushSync());
});

test("should track owner across peeks", () => {
  const [$x, setX] = createSignal(0);

  const childCompute = mockFn();
  const childDispose = mockFn();

  function createChild() {
    const $a = createMemo(() => $x() * 2);
    createRoot(() =>
      createEffect(
        () => {
          childCompute($a());
          onCleanup(childDispose);
        },
        () => {}
      )
    );
  }

  const dispose = createRoot(dispose => {
    untrack(() => createChild());
    return dispose;
  });
  flushSync();

  setX(1);
  flushSync();
  expect(childCompute).toHaveBeenCalledWith(2);
  expect(childDispose).toHaveBeenCalledTimes(1);

  dispose();
  expect(childDispose).toHaveBeenCalledTimes(2);

  setX(2);
  flushSync();
  expect(childCompute).not.toHaveBeenCalledWith(4);
  expect(childDispose).toHaveBeenCalledTimes(2);
  
  cleanupFns.push(() => flushSync());
});
