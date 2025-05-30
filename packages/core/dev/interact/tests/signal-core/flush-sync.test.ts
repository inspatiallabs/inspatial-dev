import {
  createEffect,
  createRoot,
  createSignal,
  flushSync,
} from "../../signal/src/index.ts";
import { expect, describe, it, mockFn } from "@inspatial/test";

// Setup cleanup for tests
let cleanupFns: (() => void)[] = [];

// Cleanup after each test
const afterEach = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  flushSync();
};

describe("FlushSync Tests", () => {
  afterEach();

  it("should batch updates", () => {
    const [x, setX] = createSignal(10);
    const effect = mockFn();

    createRoot(() => {
      createEffect(() => {
        effect(x());
      });
    });

    flushSync();
    expect(effect).toHaveBeenCalledTimes(1);

    setX(20);
    setX(30);
    setX(40);

    expect(effect).toHaveBeenCalledTimes(1); // Still 1 because batched
    flushSync();
    expect(effect).toHaveBeenCalledTimes(2); // Now 2 after flush
  });

  it("should wait for queue to flush", () => {
    const [x, setX] = createSignal(10);
    const effect = mockFn();

    createRoot(() => {
      createEffect(() => {
        effect(x());
      });
    });

    flushSync();
    expect(effect).toHaveBeenCalledTimes(1);

    setX(20);
    flushSync();
    expect(effect).toHaveBeenCalledTimes(2);

    setX(30);
    flushSync();
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it("should not fail if called while flushing", () => {
    const [a, setA] = createSignal(10);
    const effect = mockFn();

    createRoot(() => {
      createEffect(() => {
        effect(a());
        flushSync(); // Call flushSync inside effect
      });
    });

    flushSync();
    expect(effect).toHaveBeenCalledTimes(1);

    setA(20);
    flushSync();
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
