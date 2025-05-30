import {
  createSignal,
  createEffect,
  createRoot,
  flushSync,
} from "../../signal/src/index.ts";
import { test, expect, describe, it, mockFn } from "@inspatial/test";

// Setup cleanup for tests
let cleanupFns: (() => void)[] = [];

// Cleanup after each test
const afterEach = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  flushSync();
};

describe("CreateSignal Tests", () => {
  afterEach();

  it("should store and return value on read", () => {
    const [$x] = createSignal(1);
    expect($x).toBeInstanceOf(Function);
    expect($x()).toBe(1);
  });

  it("should update signal via setter", () => {
    const [$x, setX] = createSignal(1);
    setX(2);
    expect($x()).toBe(2);
  });

  it("should update signal via update function", () => {
    const [$x, setX] = createSignal(1);
    setX((n: number) => n + 1);
    expect($x()).toBe(2);
  });

  it("should accept equals option", () => {
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
  });

  it("should update signal with functional value", () => {
    const [$x, setX] = createSignal<() => number>(() => () => 10);
    expect($x()()).toBe(10);
    setX(() => () => 20);
    expect($x()()).toBe(20);
  });

  it("should handle different data types", () => {
    // Test string signal
    const [text, setText] = createSignal("hello");
    expect(text()).toBe("hello");
    setText("world");
    expect(text()).toBe("world");

    // Test boolean signal
    const [flag, setFlag] = createSignal(false);
    expect(flag()).toBe(false);
    setFlag(true);
    expect(flag()).toBe(true);

    // Test array signal
    const [items, setItems] = createSignal([1, 2, 3]);
    expect(items()).toEqual([1, 2, 3]);
    setItems([4, 5, 6]);
    expect(items()).toEqual([4, 5, 6]);
  });

  // IMPORTANT: Add advanced signal scenarios to test edge cases

  it("should handle complex object signals", () => {
    const [user, setUser] = createSignal({
      name: "John",
      age: 30,
      settings: { theme: "dark" },
    });

    expect(user().name).toBe("John");
    expect(user().settings.theme).toBe("dark");

    setUser((prev) => ({
      ...prev,
      name: "Jane",
      settings: { ...prev.settings, theme: "light" },
    }));

    expect(user().name).toBe("Jane");
    expect(user().settings.theme).toBe("light");
  });

  it("should handle rapid signal updates", () => {
    createRoot(() => {
      const [counter, setCounter] = createSignal(0);
      const effect = mockFn();

      createEffect(() => {
        effect(counter());
      });

      flushSync();
      expect(effect).toHaveBeenCalledTimes(1);

      // Rapid updates should batch properly
      for (let i = 1; i <= 10; i++) {
        setCounter(i);
      }

      flushSync();
      expect(effect).toHaveBeenCalledTimes(11); // Initial + 10 updates
      expect(effect).toHaveBeenLastCalledWith(10);
    });
  });

  it("should handle custom equality with complex objects", () => {
    const [state, setState] = createSignal(
      { id: 1, name: "test", version: 1 },
      {
        // Only update if version changes
        equals: (prev, next) => prev.version === next.version,
      }
    );

    expect(state().name).toBe("test");

    // Same version - should not update
    setState({ id: 1, name: "changed", version: 1 });
    expect(state().name).toBe("test"); // Should remain unchanged

    // Different version - should update
    setState({ id: 1, name: "changed", version: 2 });
    expect(state().name).toBe("changed");
    expect(state().version).toBe(2);
  });
});
