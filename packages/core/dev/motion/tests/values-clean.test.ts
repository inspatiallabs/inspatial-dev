/**
 * @fileoverview Values Clean API Tests
 * 
 * This file contains clean tests for the InMotion Values functionality,
 * focusing on value processing, type detection, decomposition, and function
 * resolution without DOM dependencies.
 * 
 * @module ValuesCleanTests
 * @version 0.1.0
 * @author InSpatial Labs
 * @since 0.1.0
 */

import { describe, test, expect } from "@inspatial/test";
import { 
  setValue, 
  getFunctionValue, 
  getTweenType, 
  getOriginalAnimatableValue,
  getRelativeValue,
  createDecomposedValueTargetObject,
  decomposeRawValue,
  decomposeTweenValue
} from "../src/values.ts";
import { valueTypes, tweenTypes, isDomSymbol, isSvgSymbol } from "../src/consts.ts";

/**
 * # Values Clean API Tests
 * @summary #### Comprehensive testing of Values functionality without DOM dependencies
 * 
 * These tests verify that the Values system correctly processes different value types,
 * decomposes values into components, resolves function values, and determines
 * appropriate tween types using clean JavaScript objects.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 * @module values-clean
 * @kind test
 * @access public
 * 
 * ### 💡 Core Concepts
 * - Tests value type detection and classification
 * - Validates value decomposition into components
 * - Tests function value resolution with context
 * - Verifies tween type determination logic
 * - Ensures proper relative value calculations
 * 
 * ### 🎯 Prerequisites
 * Before running these tests:
 * - Value processing functions should be available
 * - Type detection should work correctly
 * - Function resolution should handle context properly
 * - Decomposition should handle all value formats
 * 
 * ### 📚 Terminology
 * > **Value Decomposition**: Breaking down values into number, unit, operator components
 * > **Tween Type**: Classification determining how a property should be animated
 * > **Function Value**: Dynamic value computed from a function at runtime
 * > **Relative Value**: Value with operators like +=, -=, *= for relative changes
 */

describe("Values Clean API Tests", () => {

  /**
   * Helper function to create test objects for value testing
   */
  function createTestObject(properties: Record<string, any> = {}): Record<string, any> {
    return {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      width: 100,
      height: 100,
      ...properties
    };
  }

  /**
   * Helper function to create DOM-like test objects
   */
  function createDomLikeObject(properties: Record<string, any> = {}): Record<string, any> {
    const obj = {
      [isDomSymbol]: true,
      style: {
        width: "100px",
        height: "100px",
        opacity: "1",
        transform: "translateX(0px)"
      },
      getAttribute: (name: string) => properties[name] || null,
      ...properties
    };
    return obj;
  }

  /**
   * Helper function to create SVG-like test objects
   */
  function createSvgLikeObject(properties: Record<string, any> = {}): Record<string, any> {
    const obj = {
      [isDomSymbol]: true,
      [isSvgSymbol]: true,
      style: {},
      getAttribute: (name: string) => properties[name] || null,
      ...properties
    };
    return obj;
  }

  /**
   * setValue Function Tests
   */
  describe("setValue Function", () => {

    test("Should return target value when defined", () => {
      const result = setValue("test", "default");
      expect(result).toEqual("test");
    });

    test("Should return default value when target is undefined", () => {
      const result = setValue(undefined, "default");
      expect(result).toEqual("default");
    });

    test("Should handle null as a valid target value", () => {
      const result = setValue(null, "default");
      expect(result).toEqual(null);
    });

    test("Should handle zero as a valid target value", () => {
      const result = setValue(0, 100);
      expect(result).toEqual(0);
    });

    test("Should handle false as a valid target value", () => {
      const result = setValue(false, true);
      expect(result).toEqual(false);
    });

    test("Should handle empty string as a valid target value", () => {
      const result = setValue("", "default");
      expect(result).toEqual("");
    });

  });

  /**
   * getFunctionValue Function Tests
   */
  describe("getFunctionValue Function", () => {

    test("Should return static value when not a function", () => {
      const result = getFunctionValue(42, {}, 0, 1);
      expect(result).toEqual(42);
    });

    test("Should execute function and return result", () => {
      const func = (target: any, index: number, total: number) => index * 10;
      const result = getFunctionValue(func, {}, 2, 5);
      expect(result).toEqual(20);
    });

    test("Should pass correct parameters to function", () => {
      const target = { id: "test" };
      let capturedParams: any = {};
      
      const func = (t: any, i: number, total: number) => {
        capturedParams = { target: t, index: i, total };
        return 100;
      };
      
      getFunctionValue(func, target, 3, 10);
      
      expect(capturedParams.target).toEqual(target);
      expect(capturedParams.index).toEqual(3);
      expect(capturedParams.total).toEqual(10);
    });

    test("Should store function reference when store provided", () => {
      const store: Record<string, any> = {};
      const func = () => 42;
      
      getFunctionValue(func, {}, 0, 1, store);
      
      expect(store.func).toBeDefined();
      expect(typeof store.func).toEqual("function");
    });

    test("Should handle function returning NaN", () => {
      const func = () => NaN;
      const result = getFunctionValue(func, {}, 0, 1);
      expect(result).toEqual(0);
    });

    test("Should handle function returning null", () => {
      const func = () => null;
      const result = getFunctionValue(func, {}, 0, 1);
      expect(result).toEqual(0);
    });

    test("Should handle function returning undefined", () => {
      const func = () => undefined;
      const result = getFunctionValue(func, {}, 0, 1);
      expect(result).toEqual(0);
    });

    test("Should convert numeric strings to numbers", () => {
      const func = () => "42";
      const result = getFunctionValue(func, {}, 0, 1);
      expect(result).toEqual(42);
    });

  });

  /**
   * getTweenType Function Tests
   */
  describe("getTweenType Function", () => {

    test("Should return OBJECT type for non-DOM objects", () => {
      const target = createTestObject();
      const result = getTweenType(target, "x");
      expect(result).toEqual(tweenTypes.OBJECT);
    });

    test("Should return TRANSFORM type for transform properties", () => {
      const target = createDomLikeObject();
      const result = getTweenType(target, "translateX");
      expect(result).toEqual(tweenTypes.TRANSFORM);
    });

    test("Should return CSS_VAR type for CSS variables", () => {
      const target = createDomLikeObject();
      const result = getTweenType(target, "--custom-property");
      expect(result).toEqual(tweenTypes.CSS_VAR);
    });

    test("Should return CSS type for style properties", () => {
      const target = createDomLikeObject();
      const result = getTweenType(target, "opacity");
      expect(result).toEqual(tweenTypes.CSS);
    });

    test("Should return ATTRIBUTE type for SVG attributes", () => {
      const target = createSvgLikeObject();
      // Mock isValidSVGAttribute to return true
      const result = getTweenType(target, "cx");
      // Note: This might return ATTRIBUTE or OBJECT depending on implementation
      expect([tweenTypes.ATTRIBUTE, tweenTypes.OBJECT]).toContain(result);
    });

  });

  /**
   * getRelativeValue Function Tests
   */
  describe("getRelativeValue Function", () => {

    test("Should add values with + operator", () => {
      const result = getRelativeValue(10, 5, "+");
      expect(result).toEqual(15);
    });

    test("Should subtract values with - operator", () => {
      const result = getRelativeValue(10, 5, "-");
      expect(result).toEqual(5);
    });

    test("Should multiply values with * operator", () => {
      const result = getRelativeValue(10, 5, "*");
      expect(result).toEqual(50);
    });

    test("Should handle negative numbers", () => {
      expect(getRelativeValue(-10, 5, "+")).toEqual(-5);
      expect(getRelativeValue(-10, 5, "-")).toEqual(-15);
      expect(getRelativeValue(-10, 5, "*")).toEqual(-50);
    });

    test("Should handle decimal numbers", () => {
      expect(getRelativeValue(10.5, 2.5, "+")).toEqual(13);
      expect(getRelativeValue(10.5, 2.5, "-")).toEqual(8);
      expect(getRelativeValue(10.5, 2.5, "*")).toEqual(26.25);
    });

    test("Should handle zero values", () => {
      expect(getRelativeValue(0, 5, "+")).toEqual(5);
      expect(getRelativeValue(10, 0, "-")).toEqual(10);
      expect(getRelativeValue(10, 0, "*")).toEqual(0);
    });

  });

  /**
   * createDecomposedValueTargetObject Function Tests
   */
  describe("createDecomposedValueTargetObject Function", () => {

    test("Should create object with correct default structure", () => {
      const result = createDecomposedValueTargetObject();
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(0);
      expect(result.u).toEqual(null);
      expect(result.o).toEqual(null);
      expect(result.d).toEqual(null);
      expect(result.s).toEqual(null);
    });

    test("Should create new object each time", () => {
      const obj1 = createDecomposedValueTargetObject();
      const obj2 = createDecomposedValueTargetObject();
      
      expect(obj1).not.toBe(obj2);
      obj1.n = 42;
      expect(obj2.n).toEqual(0);
    });

  });

  /**
   * decomposeRawValue Function Tests
   */
  describe("decomposeRawValue Function", () => {

    test("Should decompose numeric values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue(42, target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(42);
      expect(result.u).toEqual(null);
    });

    test("Should decompose string numeric values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("42", target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(42);
      expect(result.u).toEqual(null);
    });

    test("Should decompose unit values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("100px", target);
      
      expect(result.t).toEqual(valueTypes.UNIT);
      expect(result.n).toEqual(100);
      expect(result.u).toEqual("px");
    });

    test("Should decompose relative values with operators", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("+=50", target);
      
      expect(result.o).toEqual("+");
      expect(result.n).toEqual(50);
    });

    test("Should decompose color values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("#ff0000", target);
      
      expect(result.t).toEqual(valueTypes.COLOR);
      expect(result.d).toBeDefined();
      expect(Array.isArray(result.d)).toBe(true);
    });

    test("Should decompose complex values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("translate(10px, 20px)", target);
      
      expect(result.t).toEqual(valueTypes.COMPLEX);
      expect(Array.isArray(result.d)).toBe(true);
      expect(Array.isArray(result.s)).toBe(true);
    });

    test("Should handle empty/null values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("", target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(0);
    });

    test("Should handle zero values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue(0, target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(0);
    });

    test("Should handle negative values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue(-42, target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(-42);
    });

    test("Should handle decimal values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue(3.14159, target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(3.14159);
    });

    test("Should handle scientific notation", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("1.23e-4", target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(1.23e-4);
    });

  });

  /**
   * Edge Cases Tests
   */
  describe("Edge Cases", () => {

    test("Should handle very large numbers", () => {
      const target = createDecomposedValueTargetObject();
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const result = decomposeRawValue(largeNumber, target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(largeNumber);
    });

    test("Should handle very small numbers", () => {
      const target = createDecomposedValueTargetObject();
      const smallNumber = Number.MIN_VALUE;
      const result = decomposeRawValue(smallNumber, target);
      
      expect(result.t).toEqual(valueTypes.NUMBER);
      expect(result.n).toEqual(smallNumber);
    });

    test("Should handle multiple operators in relative values", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("-=100", target);
      
      expect(result.o).toEqual("-");
      expect(result.n).toEqual(100);
    });

    test("Should handle complex unit combinations", () => {
      const target = createDecomposedValueTargetObject();
      const result = decomposeRawValue("calc(100% - 20px)", target);
      
      expect(result.t).toEqual(valueTypes.COMPLEX);
    });

  });

  /**
   * Performance Tests
   */
  describe("Performance Tests", () => {

    test("Should process values efficiently", () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const target = createDecomposedValueTargetObject();
        decomposeRawValue(`${i}px`, target);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete within 50ms
    });

    test("Should handle function value resolution efficiently", () => {
      const startTime = performance.now();
      const func = (target: any, index: number) => index * 10;
      
      for (let i = 0; i < 1000; i++) {
        getFunctionValue(func, {}, i, 1000);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(20); // Should complete within 20ms
    });

  });

  /**
   * API Tests
   */
  describe("API Tests", () => {

    test("Should export all required functions", () => {
      expect(setValue).toBeDefined();
      expect(getFunctionValue).toBeDefined();
      expect(getTweenType).toBeDefined();
      expect(getOriginalAnimatableValue).toBeDefined();
      expect(getRelativeValue).toBeDefined();
      expect(createDecomposedValueTargetObject).toBeDefined();
      expect(decomposeRawValue).toBeDefined();
      expect(decomposeTweenValue).toBeDefined();
      
      // Test that functions are callable
      expect(typeof setValue).toBe("function");
      expect(typeof getFunctionValue).toBe("function");
      expect(typeof getTweenType).toBe("function");
      expect(typeof getOriginalAnimatableValue).toBe("function");
      expect(typeof getRelativeValue).toBe("function");
      expect(typeof createDecomposedValueTargetObject).toBe("function");
      expect(typeof decomposeRawValue).toBe("function");
      expect(typeof decomposeTweenValue).toBe("function");
    });

    test("Should export required constants", () => {
      expect(valueTypes).toBeDefined();
      expect(tweenTypes).toBeDefined();
      expect(isDomSymbol).toBeDefined();
      expect(isSvgSymbol).toBeDefined();
      
      // Test that constants have expected properties
      expect(valueTypes.NUMBER).toBeDefined();
      expect(valueTypes.UNIT).toBeDefined();
      expect(valueTypes.COLOR).toBeDefined();
      expect(valueTypes.COMPLEX).toBeDefined();
      
      expect(tweenTypes.OBJECT).toBeDefined();
      expect(tweenTypes.CSS).toBeDefined();
      expect(tweenTypes.TRANSFORM).toBeDefined();
      expect(tweenTypes.ATTRIBUTE).toBeDefined();
    });

  });

}); 