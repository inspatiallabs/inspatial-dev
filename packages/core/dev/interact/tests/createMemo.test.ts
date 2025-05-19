import {
  createEffect,
  createErrorBoundary,
  createMemo,
  createRoot,
  createSignal,
  flushSync,
  hasUpdated,
} from "../signal/src/index.ts";
import { test, expect } from "@inspatial/test";
import { fn } from "./test-setup.ts";

// Use cleanup array since test.afterEach isn't available
let cleanupFns: Array<() => void> = [];

// Cleanup after tests
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("should store and return value on read", () => {
  const [$x] = createSignal(1);
  const [$y] = createSignal(1);

  const $a = createMemo(() => $x() + $y());

  expect($a()).toBe(2);
  flushSync();

  // Try again to ensure state is maintained.
  expect($a()).toBe(2);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should update when dependency is updated", () => {
  const [$x, setX] = createSignal(1);
  const [$y, setY] = createSignal(1);

  const $a = createMemo(() => $x() + $y());

  setX(2);
  expect($a()).toBe(3);

  setY(2);
  expect($a()).toBe(4);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should update when deep dependency is updated", () => {
  const [$x, setX] = createSignal(1);
  const [$y] = createSignal(1);

  const $a = createMemo(() => $x() + $y());
  const $b = createMemo(() => $a());

  setX(2);
  expect($b()).toBe(3);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should update when deep computed dependency is updated", () => {
  const [$x, setX] = createSignal(10);
  const [$y] = createSignal(10);

  const $a = createMemo(() => $x() + $y());
  const $b = createMemo(() => $a());
  const $c = createMemo(() => $b());

  setX(20);
  expect($c()).toBe(30);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should only re-compute when needed", () => {
  const computed = fn();

  const [$x, setX] = createSignal(10);
  const [$y, setY] = createSignal(10);

  const $a = createMemo(() => computed($x() + $y()));

  expect(computed).not.toHaveBeenCalled();

  $a();
  expect(computed).toHaveBeenCalledTimes(1);
  expect(computed).toHaveBeenCalledWith(20);

  $a();
  expect(computed).toHaveBeenCalledTimes(1);

  setX(20);
  $a();
  expect(computed).toHaveBeenCalledTimes(2);

  setY(20);
  $a();
  expect(computed).toHaveBeenCalledTimes(3);

  $a();
  expect(computed).toHaveBeenCalledTimes(3);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should only re-compute whats needed", () => {
  const memoA = fn((n) => n);
  const memoB = fn((n) => n);

  const [$x, setX] = createSignal(10);
  const [$y, setY] = createSignal(10);

  const $a = createMemo(() => memoA($x()));
  const $b = createMemo(() => memoB($y()));
  const $c = createMemo(() => $a() + $b());

  expect(memoA).not.toHaveBeenCalled();
  expect(memoB).not.toHaveBeenCalled();

  $c();
  expect(memoA).toHaveBeenCalledTimes(1);
  expect(memoB).toHaveBeenCalledTimes(1);
  expect($c()).toBe(20);

  setX(20);
  flushSync();

  $c();
  expect(memoA).toHaveBeenCalledTimes(2);
  expect(memoB).toHaveBeenCalledTimes(1);
  expect($c()).toBe(30);

  setY(20);
  flushSync();

  $c();
  expect(memoA).toHaveBeenCalledTimes(2);
  expect(memoB).toHaveBeenCalledTimes(2);
  expect($c()).toBe(40);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should discover new dependencies", () => {
  const [$x, setX] = createSignal(1);
  const [$y, setY] = createSignal(0);

  const $c = createMemo(() => {
    if ($x()) {
      return $x();
    } else {
      return $y();
    }
  });

  expect($c()).toBe(1);

  setX(0);
  flushSync();
  expect($c()).toBe(0);

  setY(10);
  flushSync();
  expect($c()).toBe(10);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should accept equals option", () => {
  const [$x, setX] = createSignal(0);

  const $a = createMemo(() => $x(), 0, {
    // Skip even numbers.
    equals: (prev: number, next: number) => prev + 1 === next,
  });

  const effectA = fn();
  createRoot(() => createEffect($a, effectA));
  flushSync();

  expect($a()).toBe(0);
  expect(effectA).not.toHaveBeenCalled();

  setX(2);
  flushSync();
  expect($a()).toBe(2);
  expect(effectA).toHaveBeenCalledTimes(1);

  // no-change
  setX(3);
  flushSync();
  expect($a()).toBe(2);
  expect(effectA).toHaveBeenCalledTimes(1);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should use fallback if error is thrown during init", () => {
  createRoot(() => {
    createErrorBoundary(
      () => {
        const $a = createMemo(() => {
          if (1) throw Error();
          return "";
        }, "foo");

        expect($a()).toBe("foo");
      },
      () => {}
    )();
  });

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should detect which signal triggered it", () => {
  const [$x, setX] = createSignal(0);
  const [$y, setY] = createSignal(0);

  const $a = createMemo(() => {
    const uX = hasUpdated($x);
    const uY = hasUpdated($y);
    return uX && uY ? "both" : uX ? "x" : uY ? "y" : "neither";
  });
  createRoot(() => createEffect($a, () => {}));
  expect($a()).toBe("neither");
  flushSync();
  expect($a()).toBe("neither");

  setY(1);
  flushSync();
  expect($a()).toBe("y");

  setX(1);
  flushSync();
  expect($a()).toBe("x");

  setY(2);
  flushSync();
  expect($a()).toBe("y");

  setX(2);
  setY(3);
  flushSync();
  expect($a()).toBe("both");

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});
