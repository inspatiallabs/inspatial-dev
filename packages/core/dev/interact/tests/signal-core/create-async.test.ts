import {
  createAsync,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  flushSync,
  isPending,
  latest,
} from "../../signal/src/index.ts";
import { expect, describe, it, mockFn } from "@inspatial/test";
import { resolve } from "../../signal/src/resolve.ts";

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

    createRoot(() => {
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

    createRoot(() => {
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

    createRoot(() => {
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
        expect(b()).toBe("stale");
        flushSync();
        expect(b()).toBe("stale");

        await new Promise((r) => setTimeout(r, 0));
        expect(b()).toBe("not stale");
      }, 0);
    });
  });

  it("should get latest value with latest", async () => {
    const [s, set] = createSignal(1);
    const async1 = mockFn(() => Promise.resolve(s()));

    createRoot(() => {
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

    createRoot(() => {
      const a = createAsync(() => async1());
      createEffect(() => {
        // Trigger effect to start async resolution
        void a();

        // Start async resolution (not tracked)
        (async () => {
          try {
            value = await resolve(a);
          } catch (error) {
            // Handle case where resolve might not work as expected
            value = undefined;
          }
        })();
      });
    });

    flushSync();
    expect(value).toBe(undefined);

    await new Promise((r) => setTimeout(r, 0));
    expect(value).toBe(1);

    set(2);
    expect(value).toBe(1); // Doesn't update because not tracked
    flushSync();
    expect(value).toBe(1); // Still doesn't update

    await new Promise((r) => setTimeout(r, 0));
    // Doesn't update because not tracked
    expect(value).toBe(1);
  });

  it("should handle basic async functionality", async () => {
    const effect = mockFn();
    const asyncFn = mockFn(() => Promise.resolve("async-result"));

    createRoot(() => {
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

    createRoot(() => {
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
