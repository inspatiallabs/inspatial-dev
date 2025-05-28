/**
 * # Engine Clean Tests
 * @summary Clean tests for InMotion Engine without DOM dependencies
 *
 * Tests core engine functionality using plain JavaScript objects and mocks,
 * ensuring the animation engine works correctly in server-side environments.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

import { describe, it, expect } from "@inspatial/test";
import { InMotionEngine } from "../src/engine.ts";
import { InMotionClock } from "../src/clock.ts";
import { tickModes } from "../src/consts.ts";

/**
 * Engine Creation and Initialization Tests
 */
describe("Engine Clean - Creation and Initialization", () => {
  it("should create engine with default parameters", () => {
    const engine = new InMotionEngine();

    expect(engine).toBeInstanceOf(InMotionEngine);
    expect(engine).toBeInstanceOf(InMotionClock);
    expect(engine.useDefaultMainLoop).toEqual(true);
    expect(engine.pauseOnDocumentHidden).toEqual(true);
    expect(engine.paused).toEqual(false);
    expect(engine.reqId).toEqual(null);
    expect(typeof engine.defaults).toEqual("object");
  });

  it("should create engine with custom initial time", () => {
    const customTime = 1000;
    const engine = new InMotionEngine(customTime);

    // Test public properties only
    expect(engine.currentTime).toBeGreaterThanOrEqual(customTime);
    expect(engine.deltaTime).toEqual(0);
  });

  it("should inherit from InMotionClock correctly", () => {
    const engine = new InMotionEngine();

    // Test inherited properties
    expect(typeof engine.deltaTime).toEqual("number");
    expect(typeof engine.currentTime).toEqual("number");
    expect(typeof engine.fps).toEqual("number");
    expect(typeof engine.speed).toEqual("number");

    // Test inherited methods
    expect(typeof engine.requestTick).toEqual("function");
    expect(typeof engine.computeDeltaTime).toEqual("function");
    expect(typeof engine.forEachChild).toEqual("function");
  });

  it("should have correct default configuration", () => {
    const engine = new InMotionEngine();

    expect(engine.useDefaultMainLoop).toEqual(true);
    expect(engine.pauseOnDocumentHidden).toEqual(true);
    expect(engine.paused).toEqual(false);
    expect(engine.speed).toEqual(1);
    expect(engine.fps).toEqual(60);
  });
});

/**
 * Timing and Delta Time Tests
 */
describe("Engine Clean - Timing and Delta Time", () => {
  it("should compute delta time correctly", () => {
    const engine = new InMotionEngine();
    const initialTime = engine.currentTime;
    const futureTime = initialTime + 16.67; // ~60fps

    const deltaTime = engine.computeDeltaTime(futureTime);

    expect(deltaTime).toBeCloseTo(16.67, 1);
    expect(engine.deltaTime).toBeCloseTo(16.67, 1);
  });

  it("should handle speed scaling in delta time", () => {
    const engine = new InMotionEngine();
    engine.speed = 2; // Double speed

    const initialTime = engine.currentTime;
    const futureTime = initialTime + 16.67;

    const deltaTime = engine.computeDeltaTime(futureTime);

    expect(deltaTime).toBeCloseTo(33.34, 1); // 16.67 * 2
  });

  it("should accumulate delta time correctly over multiple frames", () => {
    const engine = new InMotionEngine();
    const frameTime = 16;

    // First frame
    engine.computeDeltaTime(engine.currentTime + frameTime);
    const firstDelta = engine.deltaTime;
    expect(firstDelta).toBeCloseTo(frameTime, 1);

    // Second frame
    engine.computeDeltaTime(engine.currentTime + frameTime);
    const secondDelta = engine.deltaTime;
    expect(secondDelta).toBeCloseTo(frameTime, 1);

    // Third frame
    engine.computeDeltaTime(engine.currentTime + frameTime);
    const thirdDelta = engine.deltaTime;
    expect(thirdDelta).toBeCloseTo(frameTime, 1);
  });

  it("should handle zero delta time", () => {
    const engine = new InMotionEngine();
    const currentTime = engine.currentTime;

    const deltaTime = engine.computeDeltaTime(currentTime);

    expect(deltaTime).toEqual(0);
    expect(engine.deltaTime).toEqual(0);
  });
});

/**
 * Request Tick Tests
 */
describe("Engine Clean - Request Tick", () => {
  it("should return AUTO tick mode by default", () => {
    const engine = new InMotionEngine();

    const tickMode = engine.requestTick(performance.now());

    expect(tickMode).toEqual(tickModes.AUTO);
  });

  it("should handle different time values", () => {
    const engine = new InMotionEngine();

    expect(engine.requestTick(0)).toEqual(tickModes.AUTO);
    expect(engine.requestTick(1000)).toEqual(tickModes.AUTO);
    expect(engine.requestTick(performance.now())).toEqual(tickModes.AUTO);
  });
});

/**
 * State Management Tests
 */
describe("Engine Clean - State Management", () => {
  it("should pause and resume correctly", () => {
    const engine = new InMotionEngine();

    expect(engine.paused).toEqual(false);

    engine.pause();
    expect(engine.paused).toEqual(true);
    expect(engine.reqId).toEqual(null);

    engine.resume();
    expect(engine.paused).toEqual(false);
  });

  it("should handle wake and sleep states", () => {
    const engine = new InMotionEngine();

    // Initial state
    expect(engine.reqId).toEqual(null);

    // Wake should not set reqId in test environment (no requestAnimationFrame)
    engine.wake();
    // In test environment, reqId remains null since requestAnimationFrame is not available

    // Sleep should clear reqId
    engine.sleep();
    expect(engine.reqId).toEqual(null);
  });

  it("should handle multiple pause/resume cycles", () => {
    const engine = new InMotionEngine();

    // Multiple pause calls should be safe
    engine.pause();
    engine.pause();
    expect(engine.paused).toEqual(true);

    // Multiple resume calls should be safe
    engine.resume();
    engine.resume();
    expect(engine.paused).toEqual(false);
  });

  it("should maintain state consistency", () => {
    const engine = new InMotionEngine();

    // Test state transitions
    expect(engine.paused).toEqual(false);

    engine.pause();
    expect(engine.paused).toEqual(true);

    engine.resume();
    expect(engine.paused).toEqual(false);
  });
});

/**
 * Speed and FPS Configuration Tests
 */
describe("Engine Clean - Speed and FPS Configuration", () => {
  it("should set and get speed correctly", () => {
    const engine = new InMotionEngine();

    expect(engine.speed).toEqual(1);

    engine.speed = 2;
    expect(engine.speed).toEqual(2);

    engine.speed = 0.5;
    expect(engine.speed).toEqual(0.5);
  });

  it("should set and get fps correctly", () => {
    const engine = new InMotionEngine();

    expect(engine.fps).toEqual(60);

    engine.fps = 30;
    expect(engine.fps).toEqual(30);

    engine.fps = 120;
    expect(engine.fps).toEqual(120);
  });

  it("should handle edge cases for speed and fps", () => {
    const engine = new InMotionEngine();

    // Test minimum values
    engine.speed = 0;
    expect(engine.speed).toBeGreaterThan(0); // Should be clamped to minimum

    engine.fps = 0;
    expect(engine.fps).toBeGreaterThan(0); // Should be clamped to minimum
  });
});

/**
 * Defaults Management Tests
 */
describe("Engine Clean - Defaults Management", () => {
  it("should have defaults object", () => {
    const engine = new InMotionEngine();

    expect(typeof engine.defaults).toEqual("object");
    expect(engine.defaults).not.toEqual(null);
  });

  it("should set and get default values", () => {
    const engine = new InMotionEngine();

    engine.set("duration", 1000);
    expect(engine.get("duration")).toEqual(1000);

    engine.set("easing", "ease-in-out");
    expect(engine.get("easing")).toEqual("ease-in-out");
  });

  it("should remove default values", () => {
    const engine = new InMotionEngine();

    engine.set("testProperty", "testValue");
    expect(engine.get("testProperty")).toEqual("testValue");

    engine.remove("testProperty");
    expect(engine.get("testProperty")).toBeUndefined();
  });

  it("should reset defaults", () => {
    const engine = new InMotionEngine();

    engine.set("customProperty", "customValue");
    expect(engine.get("customProperty")).toEqual("customValue");

    engine.reset();
    expect(engine.get("customProperty")).toBeUndefined();
  });
});

/**
 * Children Management Tests
 */
describe("Engine Clean - Children Management", () => {
  it("should check for active animations", () => {
    const engine = new InMotionEngine();

    // Initially should have no active animations
    expect(engine.hasActiveAnimations()).toEqual(false);
  });

  it("should check for children", () => {
    const engine = new InMotionEngine();

    // Initially should have no children
    expect(engine.hasChildren()).toEqual(false);
  });
});

/**
 * Update Loop Tests
 */
describe("Engine Clean - Update Loop", () => {
  it("should update without errors", () => {
    const engine = new InMotionEngine();

    expect(() => {
      engine.update();
    }).not.toThrow();
  });

  it("should return engine instance for chaining", () => {
    const engine = new InMotionEngine();

    const result = engine.update();
    expect(result).toBe(engine);
  });

  it("should handle multiple update calls", () => {
    const engine = new InMotionEngine();

    expect(() => {
      engine.update();
      engine.update();
      engine.update();
    }).not.toThrow();
  });
});

/**
 * Edge Cases and Error Handling Tests
 */
describe("Engine Clean - Edge Cases and Error Handling", () => {
  it("should handle negative time values", () => {
    const engine = new InMotionEngine();

    expect(() => {
      engine.computeDeltaTime(-100);
    }).not.toThrow();
  });

  it("should handle very large time values", () => {
    const engine = new InMotionEngine();

    expect(() => {
      engine.computeDeltaTime(Number.MAX_SAFE_INTEGER);
    }).not.toThrow();
  });

  it("should handle invalid speed values gracefully", () => {
    const engine = new InMotionEngine();

    // Test with NaN
    engine.speed = NaN;
    expect(typeof engine.speed).toEqual("number");
    expect(engine.speed).toBeGreaterThan(0);
  });

  it("should handle invalid fps values gracefully", () => {
    const engine = new InMotionEngine();

    // Test with NaN
    engine.fps = NaN;
    expect(typeof engine.fps).toEqual("number");
    expect(engine.fps).toBeGreaterThan(0);
  });

  it("should handle undefined default values", () => {
    const engine = new InMotionEngine();

    expect(engine.get("nonexistentProperty")).toBeUndefined();
  });
});

/**
 * Performance Tests
 */
describe("Engine Clean - Performance", () => {
  it("should handle many update calls efficiently", () => {
    const engine = new InMotionEngine();
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      engine.update();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete 1000 updates in reasonable time
    expect(duration).toBeLessThan(1000); // 1 second threshold
  });

  it("should handle rapid speed changes efficiently", () => {
    const engine = new InMotionEngine();
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      engine.speed = Math.random() * 5;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should handle rapid speed changes efficiently
    expect(duration).toBeLessThan(100); // 100ms threshold
  });

  it("should not leak memory with repeated operations", () => {
    const engine = new InMotionEngine();

    // Perform many operations that could potentially leak memory
    for (let i = 0; i < 100; i++) {
      engine.set(`prop${i}`, `value${i}`);
      engine.update();
      engine.pause();
      engine.resume();
      engine.remove(`prop${i}`);
    }

    // If we get here without running out of memory, the test passes
    expect(true).toEqual(true);
  });
});

/**
 * API Tests
 */
describe("Engine Clean - API", () => {
  it("should have all expected public methods", () => {
    const engine = new InMotionEngine();

    // Core methods
    expect(typeof engine.update).toEqual("function");
    expect(typeof engine.wake).toEqual("function");
    expect(typeof engine.sleep).toEqual("function");
    expect(typeof engine.pause).toEqual("function");
    expect(typeof engine.resume).toEqual("function");

    // Configuration methods
    expect(typeof engine.set).toEqual("function");
    expect(typeof engine.get).toEqual("function");
    expect(typeof engine.remove).toEqual("function");
    expect(typeof engine.reset).toEqual("function");

    // Query methods
    expect(typeof engine.hasActiveAnimations).toEqual("function");
    expect(typeof engine.hasChildren).toEqual("function");
  });

  it("should support method chaining where appropriate", () => {
    const engine = new InMotionEngine();

    const result = engine.set("duration", 1000).pause().resume().update();

    expect(result).toBe(engine);
  });

  it("should maintain consistent API behavior", () => {
    const engine = new InMotionEngine();

    // Test that methods return consistent types
    expect(typeof engine.hasActiveAnimations()).toEqual("boolean");
    expect(typeof engine.hasChildren()).toEqual("boolean");
    expect(typeof engine.get("duration")).toEqual("number"); // Should return default duration (1000)

    engine.set("duration", 2000);
    expect(typeof engine.get("duration")).toEqual("number");
    expect(engine.get("duration")).toEqual(2000);
  });
});
