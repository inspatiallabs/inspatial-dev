import {
  createAsync,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  flushSync,
  isPending,
  latest,
  resolve,
} from "../signal/src/index.ts";
import { test, expect, mockFn } from "@inspatial/test";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("diamond should not cause waterfalls on read", async () => {
  //
  //     s
  //    / \
  //   /   \
  //  b     c
  //   \   /
  //    \ /
  //     e
  //
  const [s, set] = createSignal(1);
  const effect = mockFn();
  const async1 = mockFn(() => Promise.resolve(s()));
  const async2 = mockFn(() => Promise.resolve(s()));

  createRoot(() => {
    const b = createAsync(() => async1());
    const c = createAsync(() => async2());
    createEffect(
      () => [b(), c()],
      (v) => effect(...v)
    );
  });

  expect(async1).toHaveBeenCalledTimes(1);
  expect(async2).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 0));
  expect(async1).toHaveBeenCalledTimes(1);
  expect(async2).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledWith(1, 1);
  set(2);
  expect(async1).toHaveBeenCalledTimes(1);
  expect(async2).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(1);
  flushSync();
  expect(async1).toHaveBeenCalledTimes(2);
  expect(async2).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledTimes(1);
  await new Promise((r) => setTimeout(r, 0));
  expect(async1).toHaveBeenCalledTimes(2);
  expect(async2).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledWith(2, 2);

  cleanupFns.push(() => flushSync());
});

test("should waterfall when dependent on another async with shared source", async () => {
  //
  //    s
  //   /|
  //  a |
  //   \|
  //    b
  //    |
  //    e
  //
  let a;
  const [s, set] = createSignal(1);
  const effect = mockFn();
  const async1 = mockFn(() => Promise.resolve(s()));
  const async2 = mockFn(() => Promise.resolve(s() + a()));

  createRoot(() => {
    a = createAsync(() => async1());
    const b = createAsync(() => async2());

    createEffect(
      () => b(),
      (v) => effect(v)
    );
  });

  expect(async1).toHaveBeenCalledTimes(1);
  expect(async2).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(0);
  await new Promise((r) => setTimeout(r, 0));
  expect(async1).toHaveBeenCalledTimes(1);
  expect(async2).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledWith(2);
  set(2);
  expect(async1).toHaveBeenCalledTimes(1);
  expect(async2).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledTimes(1);
  flushSync();
  expect(async1).toHaveBeenCalledTimes(2);
  expect(async2).toHaveBeenCalledTimes(3);
  expect(effect).toHaveBeenCalledTimes(1);
  await new Promise((r) => setTimeout(r, 0));
  expect(async1).toHaveBeenCalledTimes(2);
  expect(async2).toHaveBeenCalledTimes(4);
  expect(effect).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledWith(4);

  cleanupFns.push(() => flushSync());
});

test("should should show stale state with `isPending`", async () => {
  const [s, set] = createSignal(1);
  const async1 = mockFn(() => Promise.resolve(s()));
  const a = createRoot(() => createAsync(() => async1()));
  const b = createMemo(() => (isPending(a) ? "stale" : "not stale"));
  expect(b).toThrow();
  await new Promise((r) => setTimeout(r, 0));
  expect(b()).toBe("not stale");
  set(2);
  expect(b()).toBe("stale");
  flushSync();
  expect(b()).toBe("stale");
  await new Promise((r) => setTimeout(r, 0));
  expect(b()).toBe("not stale");

  cleanupFns.push(() => flushSync());
});

test("should get latest value with `latest`", async () => {
  const [s, set] = createSignal(1);
  const async1 = mockFn(() => Promise.resolve(s()));
  const a = createRoot(() => createAsync(() => async1()));
  const b = createMemo(() => latest(a));
  expect(b).toThrow();
  await new Promise((r) => setTimeout(r, 0));
  expect(b()).toBe(1);
  set(2);
  expect(b()).toBe(1);
  flushSync();
  expect(b()).toBe(1);
  await new Promise((r) => setTimeout(r, 0));
  expect(b()).toBe(2);

  cleanupFns.push(() => flushSync());
});

test("should resolve to a value with resolveAsync", async () => {
  const [s, set] = createSignal(1);
  const async1 = mockFn(() => Promise.resolve(s()));
  let value: number | undefined;
  createRoot(() => {
    const a = createAsync(() => async1());
    createEffect(
      () => {},
      () => {
        (async () => {
          value = await resolve(a);
        })();
      }
    );
  });
  expect(value).toBe(undefined);
  await new Promise((r) => setTimeout(r, 0));
  expect(value).toBe(1);
  set(2);
  expect(value).toBe(1);
  flushSync();
  expect(value).toBe(1);
  await new Promise((r) => setTimeout(r, 0));
  // doesn't update because not tracked
  expect(value).toBe(1);

  cleanupFns.push(() => flushSync());
});
