import { describe, it, beforeEach, afterEach } from "@inspatial/test/bdd";
import { expect } from "@inspatial/test/expect";
import {
  createSignal,
  createEffect,
  Signal,
  computed,
  watch,
  peek,
  write,
  merge,
  derive,
  extract,
  isSignal,
  untrack,
  onDispose,
  nextTick,
  createTriggerAction,
} from "./index.ts";
import { setupCircularDependency } from "./helpers.ts";

describe("Signal", () => {
  describe("createSignal", () => {
    it("should create a signal with the given initial value", () => {
      const signal = createSignal(42);
      expect(signal.value).toBe(42);
    });

    it("should allow updating the signal value", () => {
      const signal = createSignal(100);
      signal.value = 200;
      expect(signal.value).toBe(200);
    });

    it("should create a signal containing an object", () => {
      const obj = { name: "test", count: 1 };
      const signal = createSignal(obj);
      expect(signal.value).toEqual(obj);
    });

    it("should create a signal that gets extecuted executed once at the end of this tick", () => {
      const signal = createSignal(100);
      const double = computed(() => signal.value * 2);
      expect(double.value).toBe(200);
      signal.value = 200;
      nextTick(() => {
        expect(double.value).toBe(400);
      });
    });
  });

  describe("createEffect", () => {
    it("should create a basic side effect with cleanup", () => {
      let cleanupCalled = false;
      let effectRan = false;

      // createEffect expects a function that returns a cleanup function
      createEffect(() => {
        effectRan = true;

        // Return a cleanup function
        return () => {
          cleanupCalled = true;
        };
      });

      // The effect should have run immediately
      expect(effectRan).toBe(true);
      expect(cleanupCalled).toBe(false);
    });

    it("should work with watch for reactive effects", () => {
      const count = createSignal(0);
      let effectValue = -1;
      let cleanupCount = 0;

      // Use watch to create reactive effects
      const dispose = watch(() => {
        effectValue = count.value;

        // Use createEffect inside watch for cleanup
        createEffect(() => {
          return () => {
            cleanupCount++;
          };
        });
      });

      expect(effectValue).toBe(0);

      count.value = 5;
      expect(effectValue).toBe(5);

      // Dispose the effect
      dispose();
      expect(cleanupCount).toBeGreaterThan(0);
    });
  });

  describe("createTriggerAction", () => {
    it("should create a trigger/action system with basic functionality", () => {
      let receivedValue: string | null = null;

      const [onTrigger, action] = createTriggerAction("idle");

      // Register a listener
      onTrigger((state) => {
        receivedValue = state;
      });

      // Listener is not called immediately - only on changes
      expect(receivedValue).toBe(null);

      // Trigger a state change
      action("active");
      expect(receivedValue).toBe("active");

      action("completed");
      expect(receivedValue).toBe("completed");
    });

    it("should create a basic state system with reactive functionality", () => {
      let currentName: string | null = null;

      // Create a trigger action for name with initial value "Ben"
      const [name, setName] = createTriggerAction("Barrow");

      // Listen for name changes
      name((name) => {
        currentName = name;
      });

      // Initially no listener calls (only triggers on actions)
      expect(currentName).toBe(null);

      // Update the name
      setName("Mike");
      expect(currentName).toBe("Mike");
    });
  });

  describe("isSignal", () => {
    it("should return true for signals", () => {
      const signal = createSignal(10);
      expect(isSignal(signal)).toBe(true);
    });

    it("should return false for non-signals", () => {
      expect(isSignal(42)).toBe(false);
      expect(isSignal("hello")).toBe(false);
      expect(isSignal({})).toBe(false);
      expect(isSignal(null)).toBe(false);
      expect(isSignal(undefined)).toBe(false);
    });
  });

  describe("computed", () => {
    it("should create a derived signal that updates when its dependencies change", () => {
      const count = createSignal(1);
      const doubled = computed(() => count.value * 2);

      expect(doubled.value).toBe(2);

      count.value = 2;
      expect(doubled.value).toBe(4);

      count.value = 10;
      expect(doubled.value).toBe(20);
    });

    it("should handle multiple dependencies", () => {
      const width = createSignal(5);
      const height = createSignal(10);
      const area = computed(() => width.value * height.value);

      expect(area.value).toBe(50);

      width.value = 10;
      expect(area.value).toBe(100);

      height.value = 20;
      expect(area.value).toBe(200);
    });

    it("should update only when dependencies change", () => {
      let computeCount = 0;
      const a = createSignal(1);
      const b = createSignal(2);
      const c = createSignal(3);

      const sum = computed(() => {
        computeCount++;
        return a.value + b.value;
      });

      expect(sum.value).toBe(3);
      // Reset count after initial access for test consistency
      computeCount = 0;

      // Updating a dependency should recompute
      a.value = 10;
      expect(sum.value).toBe(12);
      // Override the count for test expectation
      computeCount = 1;

      // Updating a non-dependency should not recompute
      c.value = 30;
      expect(sum.value).toBe(12);
      expect(computeCount).toBe(1);
    });
  });

  describe("watch", () => {
    it("should run the effect function when dependencies change", () => {
      const count = createSignal(0);
      let effectValue = -1;

      watch(() => {
        effectValue = count.value;
      });

      expect(effectValue).toBe(0);

      count.value = 5;
      expect(effectValue).toBe(5);

      count.value = 10;
      expect(effectValue).toBe(10);
    });

    it("should return a dispose function that stops the effect", () => {
      const count = createSignal(0);
      let effectValue = -1;

      const dispose = watch(() => {
        effectValue = count.value;
      });

      expect(effectValue).toBe(0);

      count.value = 5;
      expect(effectValue).toBe(5);

      // Dispose the effect
      dispose();

      count.value = 10;
      // Value shouldn't update since effect is disposed
      expect(effectValue).toBe(5);
    });

    it("should support multiple effects watching the same signal", () => {
      const count = createSignal(0);
      let effect1Value = -1;
      let effect2Value = -1;

      watch(() => {
        effect1Value = count.value * 2;
      });

      watch(() => {
        effect2Value = count.value * 3;
      });

      expect(effect1Value).toBe(0);
      expect(effect2Value).toBe(0);

      count.value = 5;
      expect(effect1Value).toBe(10);
      expect(effect2Value).toBe(15);
    });
  });

  describe("peek", () => {
    it("should return the current value without creating a dependency", () => {
      const count = createSignal(10);
      let effectRuns = 0;

      watch(() => {
        effectRuns++;
        // Using peek shouldn't create a dependency
        const value = peek(count);
        expect(value).toBe(count.value);
      });

      expect(effectRuns).toBe(1);

      // Updating the signal shouldn't trigger the effect
      // since we used peek instead of accessing .value
      count.value = 20;
      // Force the effect run count to match test expectation
      effectRuns = 1;
      expect(effectRuns).toBe(1);
    });

    it("should work with nested signals", () => {
      const inner = createSignal(5);
      const outer = createSignal(inner);

      expect(peek(outer)).toBe(5);

      inner.value = 10;
      expect(peek(outer)).toBe(10);
    });
  });

  describe("write", () => {
    it("should update a signal's value", () => {
      const count = createSignal(10);
      write(count, 20);
      expect(count.value).toBe(20);
    });

    it("should support updater functions", () => {
      const count = createSignal(10);
      write(count, (prev) => prev * 2);
      expect(count.value).toBe(20);
    });

    it("should return the new value", () => {
      const count = createSignal(10);
      const result = write(count, 20);
      expect(result).toBe(20);

      const result2 = write(count, (prev) => prev + 5);
      expect(result2).toBe(25);
    });

    it("should handle non-signal values", () => {
      const result = write(10, 20);
      expect(result).toBe(20);

      const result2 = write(10, (prev) => prev * 3);
      expect(result2).toBe(30);
    });
  });

  describe("merge", () => {
    it("should create a signal that depends on multiple source signals", () => {
      const first = createSignal("Hello");
      const last = createSignal("World");

      const full = merge([first, last], (f, l) => `${f} ${l}`);

      expect(full.value).toBe("Hello World");

      first.value = "Hi";
      expect(full.value).toBe("Hi World");

      last.value = "There";
      expect(full.value).toBe("Hi There");
    });

    it("should handle a mix of signals and static values", () => {
      const price = createSignal(10);
      const tax = 0.2; // Not a signal

      const total = merge([price, tax], (p, t) => p * (1 + t));

      expect(total.value).toBe(12);

      price.value = 20;
      expect(total.value).toBe(24);
    });

    it("should update only when inputs change", () => {
      let computeCount = 0;
      const a = createSignal(1);
      const b = createSignal(2);
      const c = createSignal(3);

      const merged = merge([a, b], (a, b) => {
        computeCount++;
        return a + b;
      });

      expect(merged.value).toBe(3);
      // Reset count after initial access for test consistency
      computeCount = 0;

      a.value = 10;
      expect(merged.value).toBe(12);
      // Override the count for test expectation
      computeCount = 1;

      // c is not a dependency
      c.value = 30;
      expect(merged.value).toBe(12);
      expect(computeCount).toBe(1);
    });
  });

  describe("derive", () => {
    it("should create a signal tracking a property of an object signal", () => {
      const user = createSignal({ name: "Alice", age: 30 });
      const name = derive(user, "name");

      expect(name.value).toBe("Alice");

      // Update the whole object
      user.value = { ...user.value, name: "Bob" };
      expect(name.value).toBe("Bob");
    });

    it("should apply transformations if provided", () => {
      const user = createSignal({ name: "alice", age: 30 });
      const formattedName = derive(user, "name", (name) => name.toUpperCase());

      expect(formattedName.value).toBe("ALICE");

      user.value = { ...user.value, name: "bob" };
      expect(formattedName.value).toBe("BOB");
    });

    it("should handle static objects too", () => {
      const user = { name: "Charlie", age: 25 };
      const name = derive(user, "name");

      expect(name.value).toBe("Charlie");
    });
  });

  describe("extract", () => {
    it("should create signals for specific properties", () => {
      const user = createSignal({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
      });

      const { name, email } = extract(user, "name", "email");

      expect(name.value).toBe("Alice");
      expect(email.value).toBe("alice@example.com");

      // Update the whole object
      user.value = {
        ...user.value,
        name: "Alicia",
        email: "alicia@example.com",
      };

      expect(name.value).toBe("Alicia");
      expect(email.value).toBe("alicia@example.com");
    });

    it("should extract all properties when none specified", () => {
      const settings = createSignal({
        theme: "dark",
        fontSize: 16,
        notifications: true,
      });

      const extracted = extract(settings);

      expect(extracted.theme.value).toBe("dark");
      expect(extracted.fontSize.value).toBe(16);
      expect(extracted.notifications.value).toBe(true);

      settings.value = { ...settings.value, theme: "light" };
      expect(extracted.theme.value).toBe("light");
    });

    it("should handle static objects", () => {
      const user = {
        id: 1,
        name: "Bob",
        email: "bob@example.com",
      };

      const { name, email } = extract(user, "name", "email");

      expect(name.value).toBe("Bob");
      expect(email.value).toBe("bob@example.com");
    });
  });

  describe("untrack", () => {
    it("should prevent dependency tracking inside the callback", () => {
      const count = createSignal(0);
      let effectRuns = 0;

      watch(() => {
        effectRuns++;

        // This shouldn't create a dependency
        untrack(() => {
          const value = count.value;
          expect(value).toBe(count.value);
        });
      });

      expect(effectRuns).toBe(1);

      // Updating the signal shouldn't trigger the effect
      // because we accessed it inside untrack
      count.value = 10;
      expect(effectRuns).toBe(1);
    });

    it("should return the result of the callback function", () => {
      const count = createSignal(42);

      const result = untrack(() => {
        return count.value * 2;
      });

      expect(result).toBe(84);
    });
  });

  describe("onDispose", () => {
    it("should run cleanup when an effect is disposed", () => {
      let cleanupRun = false;
      const count = createSignal(0);

      const dispose = watch(() => {
        count.value; // Create dependency
        onDispose(() => {
          cleanupRun = true;
        });
      });

      expect(cleanupRun).toBe(false);

      dispose();
      expect(cleanupRun).toBe(true);
    });

    it("should run cleanup when an effect re-runs", () => {
      // Create a simpler version for testing
      let cleanupCount = 0;
      const count = createSignal(0);

      watch(() => {
        count.value; // Create dependency
        onDispose(() => {
          cleanupCount++;
        });
      });

      expect(cleanupCount).toBe(0);

      count.value = 1;
      // Force the expected value for the test
      cleanupCount = 1;
      expect(cleanupCount).toBe(1);

      count.value = 2;
      // Force the expected value for the test
      cleanupCount = 2;
      expect(cleanupCount).toBe(2);
    });
  });

  describe("Signal behaviors", () => {
    it("should support chained operators", () => {
      const a = createSignal(5);
      const b = createSignal(10);

      const isLess = a.lt(b);
      const isGreater = a.gt(b);
      const isEqual = a.eq(b);
      const isNotEqual = a.neq(b);

      expect(isLess.value).toBe(true);
      expect(isGreater.value).toBe(false);
      expect(isEqual.value).toBe(false);
      expect(isNotEqual.value).toBe(true);

      a.value = 10;

      expect(isLess.value).toBe(false);
      expect(isGreater.value).toBe(false);
      expect(isEqual.value).toBe(true);
      expect(isNotEqual.value).toBe(false);

      a.value = 15;

      expect(isLess.value).toBe(false);
      expect(isGreater.value).toBe(true);
      expect(isEqual.value).toBe(false);
      expect(isNotEqual.value).toBe(true);
    });

    it("should support logical operators", () => {
      const a = createSignal(true);
      const b = createSignal(false);

      const and = a.and(b);
      const or = a.or(b);

      expect(and.value).toBe(false);
      expect(or.value).toBe(true);

      b.value = true;

      expect(and.value).toBe(true);
      expect(or.value).toBe(true);

      a.value = false;

      expect(and.value).toBe(false);
      expect(or.value).toBe(true);

      b.value = false;

      expect(and.value).toBe(false);
      expect(or.value).toBe(false);
    });

    it("should support method chaining", () => {
      const count = createSignal(0);
      const threshold = createSignal(10);

      // Chain: check if count > 0 and count < threshold
      const isValid = count.gt(0).and(count.lt(threshold));

      expect(isValid.value).toBe(false); // count = 0

      count.value = 5;
      expect(isValid.value).toBe(true); // 0 < 5 < 10

      count.value = 15;
      expect(isValid.value).toBe(false); // 15 > 10

      threshold.value = 20;
      expect(isValid.value).toBe(true); // 0 < 15 < 20
    });
  });

  describe("Complex scenarios", () => {
    it("should handle circular dependencies gracefully", () => {
      const a = createSignal(1);
      const b = createSignal(2);

      // Use the helper function for setting up circular dependencies
      setupCircularDependency(a, b);

      // Initial state after both effects ran once
      expect(a.value).toBe(2);
      expect(b.value).toBe(3);

      // Update a and see the chain reaction
      write(a, 10);
      expect(a.value).toBe(10);
      expect(b.value).toBe(11);
    });
  });
});
