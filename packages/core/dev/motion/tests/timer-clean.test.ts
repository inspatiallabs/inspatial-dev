// Clean test for Timer functionality without any DOM or DOM-related structures
import { test, describe, expect } from "@inspatial/test";
import { createTimer } from "../src/timer.ts";

/**
 * # InMotion Timer System - Clean API Tests
 * @summary Tests Timer class functionality using plain parameters without DOM dependencies
 *
 * This test suite validates the core Timer class functionality without requiring
 * DOM structures. It ensures that all timing logic, state management, and callback
 * mechanisms work correctly with plain JavaScript parameters.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @module timer-clean
 * @kind test
 * @access public
 *
 * ### 💡 Core Concepts
 * - Tests timer creation and initialization
 * - Validates time property calculations and state management
 * - Ensures playback control methods work correctly
 * - Tests loop and iteration logic
 * - Validates callback system without DOM rendering
 *
 * ### 📚 Terminology
 * > **Timer**: Base class for all time-based animations and timelines
 * > **Iteration**: A single cycle of the timer's duration
 * > **Loop**: Multiple iterations of the timer
 * > **Seek**: Moving the timer to a specific time position
 *
 * ### ⚠️ Important Notes
 * > [!NOTE]
 * > These tests use .seek() to control time rather than real-time playback
 * >
 * > [!NOTE]
 * > Timer is the base class for animations, so these tests validate core timing logic
 */

/**
 * Creates a callback tracking system for testing
 * @returns Object with callback function and counter
 */
function setupCallbackTracking(): {
  callback: () => void;
  count: number;
  getCount: () => number;
  reset: () => void;
} {
  let callbackCount = 0;
  
  return {
    callback: () => { callbackCount++; },
    count: callbackCount,
    getCount: () => callbackCount,
    reset: () => { callbackCount = 0; }
  };
}

/**
 * Creates timer parameters with callback tracking
 * @param callbackName - Name of the callback to track
 * @param callbackFunc - Function to call
 * @returns Timer parameters object
 */
function setupTimerCallback(
  callbackName: string,
  callbackFunc: () => void
): Record<string, any> {
  const parameters: Record<string, any> = {
    duration: 100,
    autoplay: false,
  };
  parameters[callbackName] = callbackFunc;
  return parameters;
}

describe("Timer Clean API Tests", () => {
  
  test("Should create timer with default parameters", () => {
    const timer = createTimer({
      autoplay: false // Ensure timer stays paused
    });
    
    expect(timer).toBeDefined();
    expect(timer.duration).toBeGreaterThan(0);
    expect(timer.paused).toBe(true);
    expect(timer.began).toBe(false);
    expect(timer.completed).toBe(false);
    expect(timer.currentTime).toBe(0);
    expect(timer.progress).toBe(0);
  });

  test("Should create timer with custom parameters", () => {
    const timer = createTimer({
      duration: 500,
      delay: 50,
      loop: 3, // This creates 4 total iterations (loop + 1)
      autoplay: false
    });
    
    expect(timer.duration).toBe(2000); // 500 * 4 iterations
    expect(timer.iterationDuration).toBe(500);
    expect(timer.iterationCount).toBe(4); // loop + 1
    // Test delay behavior through currentTime (which includes delay in its calculation)
    expect(timer.currentTime).toBe(-50); // Should start at negative delay value
  });

  test("Should handle currentTime property correctly", () => {
    const timer = createTimer({
      duration: 100,
      autoplay: false
    });
    
    // Test initial state
    expect(timer.currentTime).toBe(0);
    
    // Test setting currentTime
    timer.currentTime = 50;
    expect(timer.currentTime).toBe(50);
    expect(timer.progress).toBeCloseTo(0.5, 2);
    
    // Test boundary conditions
    timer.currentTime = 150; // Beyond duration
    expect(timer.currentTime).toBe(100); // Should clamp to duration
    expect(timer.progress).toBe(1);
  });

  test("Should calculate progress correctly", () => {
    const timer = createTimer({
      duration: 200,
      autoplay: false
    });
    
    timer.seek(0);
    expect(timer.progress).toBe(0);
    
    timer.seek(50);
    expect(timer.progress).toBeCloseTo(0.25, 2);
    
    timer.seek(100);
    expect(timer.progress).toBeCloseTo(0.5, 2);
    
    timer.seek(200);
    expect(timer.progress).toBe(1);
  });

  test("Should handle iteration properties with loops", () => {
    const timer = createTimer({
      duration: 100,
      loop: 2, // 3 total iterations (loop + 1)
      autoplay: false
    });
    
    expect(timer.iterationCount).toBe(3);
    expect(timer.duration).toBe(300); // 100 * 3
    
    // Test first iteration
    timer.seek(50);
    expect(timer.currentIteration).toBe(0);
    expect(timer.iterationProgress).toBeCloseTo(0.5, 2);
    
    // Test second iteration
    timer.seek(150);
    expect(timer.currentIteration).toBe(1);
    expect(timer.iterationProgress).toBeCloseTo(0.5, 2);
    
    // Test final iteration
    timer.seek(250);
    expect(timer.currentIteration).toBe(2);
    expect(timer.iterationProgress).toBeCloseTo(0.5, 2);
  });

  test("Should execute onBegin callback correctly", () => {
    const tracking = setupCallbackTracking();
    const timer = createTimer(setupTimerCallback("onBegin", tracking.callback));
    
    expect(tracking.getCount()).toBe(0);
    
    // Seek to start should trigger onBegin
    timer.seek(1);
    expect(tracking.getCount()).toBe(1);
    
    // Additional seeks should not trigger onBegin again
    timer.seek(50);
    expect(tracking.getCount()).toBe(1);
  });

  test("Should execute onComplete callback correctly", () => {
    const tracking = setupCallbackTracking();
    const timer = createTimer(setupTimerCallback("onComplete", tracking.callback));
    
    expect(tracking.getCount()).toBe(0);
    
    // Seek to middle should not trigger onComplete
    timer.seek(50);
    expect(tracking.getCount()).toBe(0);
    
    // Seek to end should trigger onComplete
    timer.seek(100);
    expect(tracking.getCount()).toBe(1);
  });

  test("Should execute onUpdate callback during seek", () => {
    const tracking = setupCallbackTracking();
    const timer = createTimer(setupTimerCallback("onUpdate", tracking.callback));
    
    expect(tracking.getCount()).toBe(0);
    
    // Each seek should trigger onUpdate
    timer.seek(25);
    expect(tracking.getCount()).toBe(1);
    
    timer.seek(50);
    expect(tracking.getCount()).toBe(2);
    
    timer.seek(75);
    expect(tracking.getCount()).toBe(3);
  });

  test("Should handle pause and resume correctly", () => {
    const timer = createTimer({
      duration: 100,
      autoplay: false
    });
    
    expect(timer.paused).toBe(true);
    
    timer.resume();
    expect(timer.paused).toBe(false);
    
    timer.pause();
    expect(timer.paused).toBe(true);
  });

  test("Should handle reset correctly", () => {
    const timer = createTimer({
      duration: 100,
      autoplay: false
    });
    
    // Advance timer
    timer.seek(75);
    expect(timer.currentTime).toBe(75);
    expect(timer.began).toBe(true);
    
    // Reset should restore initial state
    timer.reset();
    expect(timer.currentTime).toBe(0);
    expect(timer.began).toBe(false);
    expect(timer.completed).toBe(false);
    expect(timer.paused).toBe(true);
  });

  test("Should handle reverse playback", () => {
    const timer = createTimer({
      duration: 100,
      autoplay: false
    });
    
    expect(timer.reversed).toBe(false);
    
    timer.reverse();
    expect(timer.reversed).toBe(true);
    
    // Test that seeking works in reverse
    timer.seek(25);
    expect(timer.currentTime).toBe(25);
  });

  test("Should handle infinite loops correctly", () => {
    const timer = createTimer({
      duration: 100,
      loop: true, // Infinite loop
      autoplay: false
    });
    
    expect(timer.iterationCount).toBe(Infinity); // iterationCount is not clamped
    expect(timer.duration).toBe(Number.MAX_SAFE_INTEGER); // duration is clamped
    
    // Should still handle iterations correctly
    timer.seek(150);
    expect(timer.currentIteration).toBe(1);
    expect(timer.iterationProgress).toBeCloseTo(0.5, 2);
  });

  test("Should handle timer completion state", () => {
    const timer = createTimer({
      duration: 100,
      autoplay: false
    });
    
    expect(timer.completed).toBe(false);
    
    // Seek to end
    timer.seek(100);
    expect(timer.completed).toBe(true);
    
    // Reset should clear completed state
    timer.reset();
    expect(timer.completed).toBe(false);
  });

  test("Should handle delay correctly", () => {
    const timer = createTimer({
      duration: 100,
      delay: 50,
      autoplay: false
    });
    
    // With delay, currentTime starts negative
    expect(timer.currentTime).toBe(-50);
    
    // Seek past delay
    timer.seek(25); // 25ms after delay start
    expect(timer.currentTime).toBe(25);
    
    // Seek to actual animation start
    timer.seek(50); // End of delay, start of animation
    expect(timer.currentTime).toBe(50);
  });

  test("Should handle multiple callbacks in sequence", () => {
    const beginTracking = setupCallbackTracking();
    const updateTracking = setupCallbackTracking();
    const completeTracking = setupCallbackTracking();
    
    const timer = createTimer({
      duration: 100,
      autoplay: false,
      onBegin: beginTracking.callback,
      onUpdate: updateTracking.callback,
      onComplete: completeTracking.callback
    });
    
    // Initial state
    expect(beginTracking.getCount()).toBe(0);
    expect(updateTracking.getCount()).toBe(0);
    expect(completeTracking.getCount()).toBe(0);
    
    // Seek to start
    timer.seek(1);
    expect(beginTracking.getCount()).toBe(1);
    expect(updateTracking.getCount()).toBe(1);
    expect(completeTracking.getCount()).toBe(0);
    
    // Seek to middle
    timer.seek(50);
    expect(beginTracking.getCount()).toBe(1); // Should not increase
    expect(updateTracking.getCount()).toBe(2);
    expect(completeTracking.getCount()).toBe(0);
    
    // Seek to end
    timer.seek(100);
    expect(beginTracking.getCount()).toBe(1);
    expect(updateTracking.getCount()).toBe(3);
    expect(completeTracking.getCount()).toBe(1);
  });

}); 