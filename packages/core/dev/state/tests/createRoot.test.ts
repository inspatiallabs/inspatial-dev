import {
  ComputationClass,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  flushSync,
  getOwner,
  onCleanup,
  type AccessorType,
  type SignalType,
} from "../signal/src/index.ts";
import { test, expect, mockFn } from "../../../dev/test/src/index.ts";

// Use cleanup array since test.afterEach isn't available
let cleanupFns: Array<() => void> = [];

// Cleanup after tests
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("should dispose of inner computations", () => {
  let $x: SignalType<number>;
  let $y: AccessorType<number>;

  const memo = mockFn(() => $x[0]() + 10);

  createRoot((dispose) => {
    $x = createSignal(10);
    $y = createMemo(memo);
    $y();
    dispose();
  });

  expect($y!).toThrow();
  expect(memo).toHaveBeenCalledTimes(1);

  flushSync();

  $x![1](50);
  flushSync();

  expect($y!).toThrow();
  expect(memo).toHaveBeenCalledTimes(1);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should return result", () => {
  const result = createRoot((dispose) => {
    dispose();
    return 10;
  });

  expect(result).toBe(10);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should create new tracking scope", () => {
  const [$x, setX] = createSignal(0);
  const effect = fn();

  const stopEffect = createRoot((dispose) => {
    createEffect(
      () => {
        $x();
        createRoot(() => void createEffect($x, effect));
      },
      () => {}
    );

    return dispose;
  });
  flushSync();

  expect(effect).toHaveBeenCalledWith(0, undefined);
  expect(effect).toHaveBeenCalledTimes(1);

  stopEffect();

  setX(10);
  flushSync();
  expect(effect).not.toHaveBeenCalledWith(10);
  expect(effect).toHaveBeenCalledTimes(1);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should not be reactive", () => {
  let $x: SignalType<number>;

  const root = mockFn();

  createRoot(() => {
    $x = createSignal(0);
    $x[0]();
    root();
  });

  expect(root).toHaveBeenCalledTimes(1);

  $x![1](1);
  flushSync();
  expect(root).toHaveBeenCalledTimes(1);

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should hold parent tracking", () => {
  createRoot(() => {
    const parent = getOwner();
    createRoot(() => {
      expect(getOwner()!._parent).toBe(parent);
    });
  });

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should not observe", () => {
  const [$x] = createSignal(0);
  createRoot(() => {
    $x();
    const owner = getOwner() as Computation;
    expect(owner._sources).toBeUndefined();
    expect(owner._observers).toBeUndefined();
  });

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});

test("should not throw if dispose called during active disposal process", () => {
  createRoot((dispose) => {
    onCleanup(() => dispose());
    dispose();
  });

  // Add cleanup for this test
  cleanupFns.push(() => flushSync());
});
