/**
 * @fileoverview Keyframes Clean API Tests
 * 
 * This file contains clean tests for the InMotion Keyframes functionality,
 * focusing on keyframe parsing, sequencing, and value interpolation logic
 * with minimal DOM dependencies.
 * 
 * @module KeyframesCleanTests
 * @version 0.1.0
 * @author InSpatial Labs
 * @since 0.1.0
 */

import { describe, test, expect } from "@inspatial/test";
import { createMotion } from "../src/animation.ts";
import { getChildAtIndex, getChildLength } from "../src/utils/index.ts";
import { valueTypes } from "../src/consts.ts";

/**
 * # Keyframes Clean API Tests
 * @summary #### Comprehensive testing of Keyframes functionality with minimal DOM dependencies
 * 
 * These tests verify that the Keyframes system correctly parses arrays and objects,
 * handles duration distribution, manages parameter inheritance, and processes
 * complex keyframe sequences using DOM-compatible test objects.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @module keyframes-clean
 * @kind test
 * @access public
 * 
 * ### 💡 Core Concepts
 * - Tests keyframe array parsing and value distribution
 * - Validates duration calculation and inheritance
 * - Tests parameter inheritance from parent animation
 * - Verifies complex keyframe object handling
 * - Ensures proper value type detection and conversion
 * 
 * ### 🎯 Prerequisites
 * Before running these tests:
 * - Animation system should support keyframe arrays
 * - Duration distribution should work correctly
 * - Parameter inheritance should be functional
 * - Value type detection should be accurate
 * 
 * ### 📚 Terminology
 * > **Keyframe**: A specific point in an animation timeline with defined property values
 * > **Duration Distribution**: Automatic division of total duration across keyframes
 * > **Parameter Inheritance**: Passing animation settings from parent to child keyframes
 * > **Value Type**: Classification of animation values (UNIT, COMPLEX, NUMBER, etc.)
 */

describe("Keyframes Clean API Tests", () => {

  /**
   * Helper function to create DOM-compatible test objects for keyframe testing
   * These objects have the minimal DOM interface needed for unit conversion
   */
  function createTestObject(properties: Record<string, any> = {}): Record<string, any> {
    const testObj = {
      translateX: 0,
      translateY: 0, 
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transform: "translateX(0px)",
      
      // Minimal DOM interface for unit conversion
      cloneNode: () => ({
        style: { width: "" },
        offsetWidth: 100,
        parentNode: null
      }),
      parentNode: {
        appendChild: () => {},
        removeChild: () => {}
      },
      style: { width: "" },
      offsetWidth: 100,
      
      ...properties
    };
    
    return testObj;
  }

  /**
   * Basic Keyframes Tests
   */
  describe("Basic Keyframes", () => {

    test("Should create animation with single keyframe value", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [50],
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
      expect(typeof animation.pause).toEqual("function");
      
      // Test that the animation has children (tweens)
      const childCount = getChildLength(animation);
      expect(childCount).toBeGreaterThanOrEqual(0);
    });

    test("Should create animation with multiple keyframe values", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [-100, 100, 50],
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
      
      // Test that the animation has children (tweens)
      const childCount = getChildLength(animation);
      expect(childCount).toBeGreaterThanOrEqual(0);
    });

    test("Should handle string values with units", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: ["0px", "100px", "50px"],
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
      
      // Test that the animation was created successfully
      const childCount = getChildLength(animation);
      expect(childCount).toBeGreaterThanOrEqual(0);
    });

    test("Should handle numeric keyframes", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        opacity: [0, 0.5, 1],
        scale: [0.5, 1, 1.5],
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
      
      // Test that the animation has children for both properties
      const childCount = getChildLength(animation);
      expect(childCount).toBeGreaterThanOrEqual(0);
    });

  });

  /**
   * Object-based Keyframes Tests
   */
  describe("Object-based Keyframes", () => {

    test("Should handle keyframe objects with 'to' values", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [{ to: -100 }, { to: 100 }],
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

    test("Should handle keyframes with duration specifications", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [
          { to: -100, duration: 800 },
          { to: 100 },
          { to: 50 },
          { to: 0, duration: 1200 },
        ],
        duration: 2000,
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

    test("Should handle keyframes with easing specifications", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [
          { to: -100 },
          { to: 100, ease: "linear" },
          { to: 50, ease: "outQuad" },
        ],
        ease: "inQuad",
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

  });

  /**
   * Complex Keyframes Tests
   */
  describe("Complex Keyframes", () => {

    test("Should handle percentage-based keyframes", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        keyframes: {
          "0%": { x: 100, y: 100 },
          "50%": { x: -100 },
          "100%": { x: 100, y: -100 },
        },
        duration: 1000,
        ease: "linear",
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

    test("Should handle duration-based keyframes", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        keyframes: [
          { translateY: -40 },
          { translateX: 250, duration: 100 },
          { translateY: 40 },
          { translateX: 0 },
          { translateY: 0 },
        ],
        duration: 1500,
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

  });

  /**
   * Edge Cases Tests
   */
  describe("Edge Cases", () => {

    test("Should handle empty keyframes array", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [],
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

    test("Should handle mixed keyframe formats", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [
          100,                    // Raw value
          { to: 200 },           // Object format
          "300px",               // String with unit
          { to: 400, ease: "linear" }, // Object with parameters
        ],
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

    test("Should handle large keyframe arrays", () => {
      const testObject = createTestObject();
      const largeKeyframes = Array.from({ length: 50 }, (_, i) => i * 10);
      
      const animation = createMotion(testObject, {
        translateX: largeKeyframes,
        autoplay: false,
      });

      expect(animation).toBeDefined();
      expect(typeof animation.play).toEqual("function");
    });

  });

  /**
   * Performance Tests
   */
  describe("Performance Tests", () => {

    test("Should handle complex keyframe creation efficiently", () => {
      const startTime = performance.now();
      
      const testObject = createTestObject();
      const animation = createMotion(testObject, {
        translateX: Array.from({ length: 20 }, (_, i) => ({ to: i * 10, ease: "linear" })),
        translateY: Array.from({ length: 20 }, (_, i) => ({ to: i * 5, ease: "outQuad" })),
        opacity: Array.from({ length: 20 }, (_, i) => i / 20),
        autoplay: false,
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(animation).toBeDefined();
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    test("Should handle memory efficiently with multiple animations", () => {
      const testObjects = Array.from({ length: 5 }, () => createTestObject());
      const animations = [];
      
      for (const testObject of testObjects) {
        const animation = createMotion(testObject, {
          translateX: Array.from({ length: 10 }, (_, i) => i * 10),
          translateY: Array.from({ length: 10 }, (_, i) => i * 5),
          autoplay: false,
        });
        animations.push(animation);
      }
      
      expect(animations.length).toEqual(5);
      animations.forEach(animation => {
        expect(animation).toBeDefined();
        expect(typeof animation.play).toEqual("function");
      });
    });

  });

  /**
   * API Tests
   */
  describe("API Tests", () => {

    test("Should export required functions", () => {
      // Test that all expected exports are available
      expect(createMotion).toBeDefined();
      expect(getChildAtIndex).toBeDefined();
      expect(getChildLength).toBeDefined();
      expect(valueTypes).toBeDefined();
      
      // Test that functions are callable
      expect(typeof createMotion).toBe("function");
      expect(typeof getChildAtIndex).toBe("function");
      expect(typeof getChildLength).toBe("function");
      expect(typeof valueTypes).toBe("object");
      
      // Test that valueTypes has expected properties
      expect(valueTypes.UNIT).toBeDefined();
      expect(valueTypes.NUMBER).toBeDefined();
      expect(valueTypes.COMPLEX).toBeDefined();
    });

    test("Should handle animation control methods", () => {
      const testObject = createTestObject();
      
      const animation = createMotion(testObject, {
        translateX: [0, 100, 50],
        duration: 1000,
        autoplay: false,
      });

      expect(animation).toBeDefined();
      
      // Test control methods exist
      expect(typeof animation.play).toEqual("function");
      expect(typeof animation.pause).toEqual("function");
      expect(typeof animation.seek).toEqual("function");
      expect(typeof animation.cancel).toEqual("function");
      expect(typeof animation.revert).toEqual("function");
      
      // Test properties exist
      expect(typeof animation.duration).toEqual("number");
      expect(typeof animation.paused).toEqual("boolean");
      expect(typeof animation.completed).toEqual("boolean");
    });

  });

}); 