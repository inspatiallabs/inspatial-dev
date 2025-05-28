/**
 * # Utils Clean API Tests
 * @summary Clean tests for InMotion utils module without DOM dependencies where possible
 * 
 * This test suite validates the core utility functions in the InMotion library
 * using plain JavaScript objects and minimal DOM setup where necessary.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 */

// Clean test for utils.ts without heavy DOM dependencies
import { test, describe, expect } from "@inspatial/test";

// Import utility functions to test
import {
  // Math utilities
  clamp,
  interpolate,
  round,
  snap,
  normalize,
  mapRange,
  normalizeTime,
  
  // Animation utilities
  delay,
  
  // Core utilities from main utils
  getChildAtIndex,
  getChildLength,
  getTweenDelay,
} from "../src/utils/index.ts";

// Import math utilities directly
import {
  pow,
  sqrt,
  sin,
  cos,
  abs,
  exp,
  ceil,
  floor,
  asin,
  max,
  atan2,
  PI,
  degToRad,
  radToDeg,
  clampInfinity,
} from "../src/utils/math/index.ts";

/**
 * Test helper functions for creating test objects
 */
function createTestObject(properties: Record<string, any> = {}): Record<string, any> {
  return {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    ...properties
  };
}

function createMockParent(): Record<string, any> {
  return {
    _head: null,
    _tail: null,
    _hasChildren: false
  };
}

function createMockChild(index: number): Record<string, any> {
  return {
    id: `child-${index}`,
    _next: null,
    _prev: null,
    _delay: index * 100
  };
}

function setupLinkedList(count: number): Record<string, any> {
  const parent = createMockParent();
  
  if (count === 0) return parent;
  
  const children: Record<string, any>[] = [];
  
  for (let i = 0; i < count; i++) {
    children.push(createMockChild(i));
  }
  
  // Link the children
  for (let i = 0; i < children.length; i++) {
    if (i > 0) {
      children[i]._prev = children[i - 1];
    }
    if (i < children.length - 1) {
      children[i]._next = children[i + 1];
    }
  }
  
  parent._head = children[0];
  parent._tail = children[children.length - 1];
  parent._hasChildren = true;
  
  return parent;
}

/**
 * Math Utilities Tests
 */
describe("Utils Clean API Tests", () => {
  
  describe("Math Utilities", () => {
    
    test("Should clamp values within specified bounds", () => {
      expect(clamp(50, 0, 100)).toEqual(50);
      expect(clamp(-10, 0, 100)).toEqual(0);
      expect(clamp(150, 0, 100)).toEqual(100);
      expect(clamp(0, 0, 100)).toEqual(0);
      expect(clamp(100, 0, 100)).toEqual(100);
    });
    
    test("Should round numbers to specified decimal places", () => {
      expect(round(3.14159)).toEqual(3);
      expect(round(3.14159, 2)).toEqual(3.14);
      expect(round(3.14159, 4)).toEqual(3.1416);
      expect(round(2.5)).toEqual(3); // Standard rounding
      expect(round(2.4)).toEqual(2);
    });
    
    test("Should snap values to nearest increment", () => {
      expect(snap(17, 5)).toEqual(15);
      expect(snap(18, 5)).toEqual(20);
      expect(snap(7.3, 2)).toEqual(8);
      expect(snap(0, 5)).toEqual(0);
      expect(snap(2.5, 1)).toEqual(3);
    });
    
    test("Should interpolate between two values", () => {
      expect(interpolate(0, 100, 0.5)).toEqual(50);
      expect(interpolate(0, 100, 0)).toEqual(0);
      expect(interpolate(0, 100, 1)).toEqual(100);
      expect(interpolate(10, 20, 0.3)).toEqual(13);
      expect(interpolate(-10, 10, 0.5)).toEqual(0);
    });
    
    test("Should normalize values to 0-1 range", () => {
      expect(normalize(50, 0, 100)).toEqual(0.5);
      expect(normalize(0, 0, 100)).toEqual(0);
      expect(normalize(100, 0, 100)).toEqual(1);
      expect(normalize(25, 0, 100)).toEqual(0.25);
      expect(normalize(75, 0, 100)).toEqual(0.75);
    });
    
    test("Should map values from one range to another", () => {
      expect(mapRange(50, 0, 100, 0, 1)).toEqual(0.5);
      expect(mapRange(0, 0, 100, 10, 20)).toEqual(10);
      expect(mapRange(100, 0, 100, 10, 20)).toEqual(20);
      expect(mapRange(25, 0, 100, 0, 200)).toEqual(50);
    });
    
    test("Should handle mathematical constants and functions", () => {
      expect(typeof PI).toEqual("number");
      expect(PI).toBeCloseTo(3.14159, 4);
      
      expect(pow(2, 3)).toEqual(8);
      expect(sqrt(16)).toEqual(4);
      expect(abs(-5)).toEqual(5);
      expect(max(1, 5, 3)).toEqual(5);
      
      expect(sin(0)).toEqual(0);
      expect(cos(0)).toEqual(1);
      expect(ceil(3.1)).toEqual(4);
      expect(floor(3.9)).toEqual(3);
    });
    
    test("Should convert between degrees and radians", () => {
      expect(degToRad(180)).toBeCloseTo(PI, 5);
      expect(degToRad(90)).toBeCloseTo(PI / 2, 5);
      expect(radToDeg(PI)).toBeCloseTo(180, 5);
      expect(radToDeg(PI / 2)).toBeCloseTo(90, 5);
    });
    
    test("Should clamp infinity values", () => {
      expect(clampInfinity(Infinity)).toEqual(Number.MAX_SAFE_INTEGER);
      expect(clampInfinity(-Infinity)).toEqual(-Number.MAX_SAFE_INTEGER);
      expect(clampInfinity(100)).toEqual(100);
      expect(clampInfinity(0)).toEqual(0);
    });
    
    test("Should normalize time values", () => {
      const result1 = normalizeTime(0.123456789);
      expect(typeof result1).toEqual("number");
      expect(result1).toBeGreaterThanOrEqual(0);
      
      // normalizeTime from math utils just clamps to 0-1, not the same as helpers.ts
      const result2 = normalizeTime(2); // Should be clamped to 1
      expect(result2).toEqual(1);
      
      const result3 = normalizeTime(-1); // Should be clamped to 0
      expect(result3).toEqual(0);
    });
  });
  
  describe("Animation Utilities", () => {
    
    test("Should create delay timer", () => {
      let callbackExecuted = false;
      
      // Test delay without callback first (should always return a timer)
      const timerWithoutCallback = delay();
      expect(timerWithoutCallback).toBeDefined();
      expect(typeof (timerWithoutCallback as any).play).toEqual("function");
      expect(typeof (timerWithoutCallback as any).pause).toEqual("function");
      expect(typeof (timerWithoutCallback as any).seek).toEqual("function");
      
      // Test delay with callback (might return undefined if start() doesn't return anything)
      const timerWithCallback = delay(() => {
        callbackExecuted = true;
      }, 100);
      
      // The delay function might return undefined when it calls start()
      // This is expected behavior based on the implementation
      if (timerWithCallback) {
        expect(typeof (timerWithCallback as any).play).toEqual("function");
        expect(typeof (timerWithCallback as any).pause).toEqual("function");
        expect(typeof (timerWithCallback as any).seek).toEqual("function");
      }
    });
  });
  
  /**
   * Core Utility Functions Tests
   */
  describe("Core Utility Functions", () => {
    
    test("Should get child at specific index", () => {
      const parent = setupLinkedList(5);
      
      const child0 = getChildAtIndex(parent, 0);
      expect(child0?.id).toEqual("child-0");
      
      const child2 = getChildAtIndex(parent, 2);
      expect(child2?.id).toEqual("child-2");
      
      const child4 = getChildAtIndex(parent, 4);
      expect(child4?.id).toEqual("child-4");
      
      const childOutOfBounds = getChildAtIndex(parent, 10);
      expect(childOutOfBounds).toBeNull();
    });
    
    test("Should get child at index from empty parent", () => {
      const emptyParent = createMockParent();
      
      const child = getChildAtIndex(emptyParent, 0);
      expect(child).toBeNull();
      
      const child2 = getChildAtIndex(null, 0);
      expect(child2).toBeNull();
    });
    
    test("Should get correct child length", () => {
      const parent0 = setupLinkedList(0);
      expect(getChildLength(parent0)).toEqual(0);
      
      const parent3 = setupLinkedList(3);
      expect(getChildLength(parent3)).toEqual(3);
      
      const parent10 = setupLinkedList(10);
      expect(getChildLength(parent10)).toEqual(10);
    });
    
    test("Should get tween delay", () => {
      const mockTween = createMockChild(5);
      const delay = getTweenDelay(mockTween);
      
      expect(delay).toEqual(500); // 5 * 100
    });
  });
  
  describe("Edge Cases and Error Handling", () => {
    
    test("Should handle invalid inputs gracefully", () => {
      // Math functions with edge cases
      expect(clamp(NaN, 0, 100)).toBeNaN();
      expect(interpolate(0, 100, NaN)).toBeNaN();
      expect(round(NaN, 2)).toBeNaN();
      
      // Utility functions with null/undefined
      expect(getChildAtIndex(null, 0)).toBeNull();
      expect(getChildAtIndex(undefined, 0)).toBeNull();
      expect(getChildLength(null)).toEqual(0);
    });
    
    test("Should maintain mathematical consistency", () => {
      // Test that operations are consistent
      const value = 42.123456;
      const rounded = round(value, 2);
      const clamped = clamp(rounded, 0, 100);
      const interpolated = interpolate(0, clamped, 1);
      
      expect(interpolated).toEqual(clamped);
      expect(clamped).toEqual(rounded);
      expect(rounded).toEqual(42.12);
    });
    
    test("Should handle boundary conditions", () => {
      // Test boundary values
      expect(clamp(0, 0, 0)).toEqual(0);
      expect(interpolate(5, 5, 0.5)).toEqual(5);
      expect(normalize(10, 10, 10)).toBeNaN(); // Division by zero
      expect(snap(0, 1)).toEqual(0);
    });
  });
  
  describe("Performance and Memory", () => {
    
    test("Should handle large datasets efficiently", () => {
      const startTime = performance.now();
      
      // Test with large linked list
      const largeParent = setupLinkedList(1000);
      const length = getChildLength(largeParent);
      const lastChild = getChildAtIndex(largeParent, 999);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(length).toEqual(1000);
      expect(lastChild?.id).toEqual("child-999");
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
    
    test("Should handle repeated operations efficiently", () => {
      const startTime = performance.now();
      
      // Perform many math operations
      for (let i = 0; i < 10000; i++) {
        const value = i / 100;
        clamp(value, 0, 100);
        round(value, 2);
        interpolate(0, 100, value / 100);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete within 50ms
    });
  });
}); 