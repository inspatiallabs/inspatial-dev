import {
  createAsync,
  createEffect,
  createMemo,
  createInteractiveRoot,
  createSignal,
  flushSync,
  isPending,
  latest,
  resolve,
} from "../../signal-core/index.ts";
import { expect, describe, it, mockFn } from "@inspatial/test";

// Setup cleanup for tests
let cleanupFns: (() => void)[] = [];

// Cleanup after each test
const afterEach = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  flushSync();
};

describe("CreateAsync Tests", () => {
  afterEach();

  it("diamond should not cause waterfalls on read", async () => {
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

    createInteractiveRoot(() => {
      const b = createAsync(() => async1());
      const c = createAsync(() => async2());
      createEffect(() => {
        const bValue = b();
        const cValue = c();
        effect(bValue, cValue);
      });
    });

    flushSync();
    expect(async1).toHaveBeenCalledTimes(1);
    expect(async2).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(0);

    await new Promise((r) => setTimeout(r, 0));
    expect(async1).toHaveBeenCalledTimes(1);
    expect(async2).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledWith(1, 1);

    set(2);
    flushSync();
    expect(async1).toHaveBeenCalledTimes(2);
    expect(async2).toHaveBeenCalledTimes(2);

    await new Promise((r) => setTimeout(r, 0));
    expect(async1).toHaveBeenCalledTimes(2);
    expect(async2).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith(2, 2);
  });

  it("should waterfall when dependent on another async with shared source", async () => {
    //
    //    s
    //   /|
    //  a |
    //   \|
    //    b
    //    |
    //    e
    //
    let a: (() => number | undefined) | undefined;
    const [s, set] = createSignal(1);
    const effect = mockFn();
    const async1 = mockFn(() => Promise.resolve(s()));
    const async2 = mockFn(() => Promise.resolve(s() + (a?.() || 0)));

    createInteractiveRoot(() => {
      a = createAsync(() => async1());
      const b = createAsync(() => async2());

      createEffect(() => {
        const bValue = b();
        effect(bValue);
      });
    });

    flushSync();
    expect(async1).toHaveBeenCalledTimes(1);
    expect(async2).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(0);

    await new Promise((r) => setTimeout(r, 0));
    expect(async1).toHaveBeenCalledTimes(1);
    expect(async2).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledWith(2);

    set(2);
    flushSync();
    expect(async1).toHaveBeenCalledTimes(2);
    expect(async2).toHaveBeenCalledTimes(3);

    await new Promise((r) => setTimeout(r, 0));
    expect(async1).toHaveBeenCalledTimes(2);
    expect(async2).toHaveBeenCalledTimes(4);
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith(4);
  });

  it("should show stale state with isPending", async () => {
    const [s, set] = createSignal(1);
    const async1 = mockFn(() => Promise.resolve(s()));

    createInteractiveRoot(() => {
      const a = createAsync(() => async1());
      const b = createMemo(() => (isPending(a) ? "stale" : "not stale"));

      // Initially should throw (no value yet)
      try {
        b();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Expected behavior - async not resolved yet
        expect(error).toBeDefined();
      }

      // After resolution
      setTimeout(async () => {
        await new Promise((r) => setTimeout(r, 0));
        expect(b()).toBe("not stale");

        set(2);
        flushSync(); // Flush the batch from createAsync's setIsLoading(true)
        expect(b()).toBe("stale");
        flushSync(); // This flush might be redundant now, but harmless
        expect(b()).toBe("stale");

        await new Promise((r) => setTimeout(r, 0));
        expect(b()).toBe("not stale");
      }, 0);
    });
  });

  it("should get latest value with latest", async () => {
    const [s, set] = createSignal(1);
    const async1 = mockFn(() => Promise.resolve(s()));

    createInteractiveRoot(() => {
      const a = createAsync(() => async1());
      const b = createMemo(() => latest(a));

      // Initially should throw (no value yet)
      try {
        b();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Expected behavior - async not resolved yet
        expect(error).toBeDefined();
      }

      // After resolution
      setTimeout(async () => {
        await new Promise((r) => setTimeout(r, 0));
        expect(b()).toBe(1);

        set(2);
        expect(b()).toBe(1); // Should still be old value
        flushSync();
        expect(b()).toBe(1); // Should still be old value

        await new Promise((r) => setTimeout(r, 0));
        expect(b()).toBe(2); // Now should be new value
      }, 0);
    });
  });

  it("should resolve to a value with resolve", async () => {
    const [s, set] = createSignal(1);
    const async1 = mockFn(() => Promise.resolve(s()));
    let value: number | undefined;
    let newValue: number | undefined;

    const root = createInteractiveRoot(async (dispose) => {
      const a = createAsync(() => async1());

      // Initial resolution
      value = await resolve(() => a());

      // Change the signal and resolve again
      set(2);
      // Need to ensure createAsync's internal effect runs and settles
      await new Promise((r) => setTimeout(r, 0)); // Allow microtask queue to process
      newValue = await resolve(() => a());

      dispose(); // Cleanup the root
    });

    await root; // Wait for the root's async function to complete

    expect(value).toBe(1);
    expect(newValue).toBe(2);
    // Check how many times the underlying async function was called
    // It should be called once for the initial value, and once after set(2)
    expect(async1).toHaveBeenCalledTimes(2);
  });

  it("should handle basic async functionality", async () => {
    const effect = mockFn();
    const asyncFn = mockFn(() => Promise.resolve("async-result"));

    createInteractiveRoot(() => {
      const asyncSignal = createAsync(() => asyncFn());

      createEffect(() => {
        const value = asyncSignal();
        if (value !== undefined) {
          effect(value);
        }
      });
    });

    flushSync();
    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(0);

    await new Promise((r) => setTimeout(r, 0));
    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledWith("async-result");
  });

  it("should handle async with signal dependencies", async () => {
    const [input, setInput] = createSignal("initial");
    const effect = mockFn();
    const asyncFn = mockFn((value: string) =>
      Promise.resolve(`async-${value}`)
    );

    createInteractiveRoot(() => {
      const asyncSignal = createAsync(() => asyncFn(input()));

      createEffect(() => {
        const value = asyncSignal();
        if (value !== undefined) {
          effect(value);
        }
      });
    });

    flushSync();
    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(asyncFn).toHaveBeenCalledWith("initial");

    await new Promise((r) => setTimeout(r, 0));
    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledWith("async-initial");

    setInput("changed");
    flushSync();
    expect(asyncFn).toHaveBeenCalledTimes(2);
    expect(asyncFn).toHaveBeenCalledWith("changed");

    await new Promise((r) => setTimeout(r, 0));
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith("async-changed");
  });
});
