// Clean test for Eases functionality without any DOM or DOM-related structures
import { test, describe, expect } from "@inspatial/test";
import { 
  none, 
  cubicBezier, 
  steps, 
  eases, 
  parseEasings,
  easeTypes,
  parseEaseString
} from "../src/eases.ts";

/**
 * # InMotion Eases System - Clean API Tests
 * @summary Tests easing functions and parsing logic using pure mathematical calculations
 *
 * This test suite validates the core easing functionality without requiring
 * DOM structures. It ensures that all easing functions produce mathematically
 * correct output values and that the parsing system works correctly.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @module eases-clean
 * @kind test
 * @access public
 *
 * ### 💡 Core Concepts
 * - Tests basic easing function behavior (input/output validation)
 * - Validates mathematical correctness of easing curves
 * - Tests easing function factories and parameter handling
 * - Verifies string parsing and lookup mechanisms
 * - Ensures boundary conditions are handled correctly
 *
 * ### 🎯 Prerequisites
 * Before running these tests:
 * - Easing functions should accept time values between 0 and 1
 * - All easing functions should return values in expected ranges
 * - Factory functions should create valid easing functions
 * - String parsing should handle various input formats
 *
 * ### 📚 Terminology
 * > **Easing Function**: A mathematical function that maps time (0-1) to progress (usually 0-1)
 * > **Cubic Bezier**: A parametric curve defined by four control points
 * > **Factory Function**: A function that creates and returns other functions with specific parameters
 * > **Time Parameter (t)**: Input value representing animation progress (0 = start, 1 = end)
 */
describe("Eases Clean API Tests", () => {

  /**
   * Helper function to test if a value is within expected range
   * @param value - The value to test
   * @param min - Minimum expected value
   * @param max - Maximum expected value
   * @param tolerance - Acceptable tolerance for floating point comparison
   */
  function expectInRange(value: number, min: number, max: number, tolerance = 0.001): void {
    expect(value).toBeGreaterThanOrEqual(min - tolerance);
    expect(value).toBeLessThanOrEqual(max + tolerance);
  }

  /**
   * Helper function to test easing function boundary conditions
   * @param easingFn - The easing function to test
   * @param expectedStart - Expected value at t=0 (default: 0)
   * @param expectedEnd - Expected value at t=1 (default: 1)
   */
  function testEasingBoundaries(
    easingFn: (t: number) => number, 
    expectedStart = 0, 
    expectedEnd = 1
  ): void {
    expect(easingFn(0)).toBeCloseTo(expectedStart, 3);
    expect(easingFn(1)).toBeCloseTo(expectedEnd, 3);
  }

  /**
   * Helper function to test easing function monotonicity (for standard easing)
   * @param easingFn - The easing function to test
   * @param samples - Number of samples to test (default: 10)
   */
  function testEasingMonotonicity(easingFn: (t: number) => number, samples = 10): void {
    let prevValue = easingFn(0);
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const currentValue = easingFn(t);
      // For standard easing, values should generally increase (allowing for small floating point errors)
      expect(currentValue).toBeGreaterThanOrEqual(prevValue - 0.001);
      prevValue = currentValue;
    }
  }

  test("Should provide none (linear) easing function", () => {
    // Test that none function returns input unchanged
    expect(none(0)).toBe(0);
    expect(none(0.5)).toBe(0.5);
    expect(none(1)).toBe(1);
    expect(none(0.25)).toBe(0.25);
    expect(none(0.75)).toBe(0.75);
    
    // Test edge cases
    expect(none(-0.1)).toBe(-0.1);
    expect(none(1.1)).toBe(1.1);
  });

  test("Should create cubic bezier easing functions", () => {
    // Test default cubic bezier (should be linear)
    const defaultBezier = cubicBezier();
    testEasingBoundaries(defaultBezier);
    expect(defaultBezier(0.5)).toBeCloseTo(0.5, 2);

    // Test ease-in cubic bezier
    const easeIn = cubicBezier(0.42, 0, 1, 1);
    testEasingBoundaries(easeIn);
    expect(easeIn(0.5)).toBeLessThan(0.5); // Should be slower at start

    // Test ease-out cubic bezier
    const easeOut = cubicBezier(0, 0, 0.58, 1);
    testEasingBoundaries(easeOut);
    expect(easeOut(0.5)).toBeGreaterThan(0.5); // Should be faster at start

    // Test ease-in-out cubic bezier
    const easeInOut = cubicBezier(0.42, 0, 0.58, 1);
    testEasingBoundaries(easeInOut);
  });

  test("Should create steps easing functions", () => {
    // Test default steps (10 steps, end)
    const defaultSteps = steps();
    testEasingBoundaries(defaultSteps);
    
    // Test specific number of steps
    const fiveSteps = steps(5);
    expect(fiveSteps(0)).toBe(0);
    expect(fiveSteps(0.1)).toBe(0);
    expect(fiveSteps(0.2)).toBeCloseTo(0.2, 3);
    expect(fiveSteps(0.4)).toBeCloseTo(0.4, 3);
    expect(fiveSteps(0.6)).toBeCloseTo(0.6, 3);
    expect(fiveSteps(0.8)).toBeCloseTo(0.8, 3);
    expect(fiveSteps(1)).toBe(1);

    // Test steps from start
    const stepsFromStart = steps(4, true);
    expect(stepsFromStart(0)).toBe(0);
    expect(stepsFromStart(0.1)).toBe(0.25);
    expect(stepsFromStart(0.24)).toBe(0.25);
    expect(stepsFromStart(0.26)).toBe(0.5);
    expect(stepsFromStart(1)).toBe(1);
  });

  test("Should provide comprehensive easing functions collection", () => {
    // Test that eases object exists and has expected properties
    expect(eases).toBeDefined();
    expect(typeof eases).toBe("object");

    // Test basic easing functions exist
    expect(eases.linear).toBeDefined();
    expect(eases.irregular).toBeDefined();
    expect(eases.steps).toBeDefined();
    expect(eases.cubicBezier).toBeDefined();

    // Test power easing functions
    expect(eases.in).toBeDefined();
    expect(eases.out).toBeDefined();
    expect(eases.inOut).toBeDefined();
    expect(eases.outIn).toBeDefined();

    // Test specific easing functions
    expect(eases.inQuad).toBeDefined();
    expect(eases.outQuad).toBeDefined();
    expect(eases.inCubic).toBeDefined();
    expect(eases.outCubic).toBeDefined();
    expect(eases.inSine).toBeDefined();
    expect(eases.outSine).toBeDefined();
    expect(eases.inBack).toBeDefined();
    expect(eases.outBack).toBeDefined();
    expect(eases.inElastic).toBeDefined();
    expect(eases.outElastic).toBeDefined();
  });

  test("Should handle power easing functions correctly", () => {
    // Test in power easing
    const inQuad = eases.inQuad as (t: number) => number;
    testEasingBoundaries(inQuad);
    expect(inQuad(0.5)).toBeLessThan(0.5); // Should be slower at start
    testEasingMonotonicity(inQuad);

    // Test out power easing
    const outQuad = eases.outQuad as (t: number) => number;
    testEasingBoundaries(outQuad);
    expect(outQuad(0.5)).toBeGreaterThan(0.5); // Should be faster at start
    testEasingMonotonicity(outQuad);

    // Test inOut power easing
    const inOutQuad = eases.inOutQuad as (t: number) => number;
    testEasingBoundaries(inOutQuad);
    testEasingMonotonicity(inOutQuad);
  });

  test("Should handle trigonometric easing functions correctly", () => {
    // Test sine easing
    const inSine = eases.inSine as (t: number) => number;
    testEasingBoundaries(inSine);
    expect(inSine(0.5)).toBeLessThan(0.5); // Should be slower at start
    testEasingMonotonicity(inSine);

    const outSine = eases.outSine as (t: number) => number;
    testEasingBoundaries(outSine);
    expect(outSine(0.5)).toBeGreaterThan(0.5); // Should be faster at start
    testEasingMonotonicity(outSine);

    // Test circular easing
    const inCirc = eases.inCirc as (t: number) => number;
    testEasingBoundaries(inCirc);
    testEasingMonotonicity(inCirc);

    const outCirc = eases.outCirc as (t: number) => number;
    testEasingBoundaries(outCirc);
    testEasingMonotonicity(outCirc);
  });

  test("Should handle exponential easing functions correctly", () => {
    const inExpo = eases.inExpo as (t: number) => number;
    testEasingBoundaries(inExpo);
    expect(inExpo(0.5)).toBeLessThan(0.1); // Should be very slow at start
    testEasingMonotonicity(inExpo);

    const outExpo = eases.outExpo as (t: number) => number;
    testEasingBoundaries(outExpo);
    expect(outExpo(0.5)).toBeGreaterThan(0.9); // Should be very fast at start
    testEasingMonotonicity(outExpo);
  });

  test("Should handle bounce easing functions correctly", () => {
    const inBounce = eases.inBounce as (t: number) => number;
    testEasingBoundaries(inBounce);
    // Bounce easing may not be strictly monotonic due to bouncing effect
    
    const outBounce = eases.outBounce as (t: number) => number;
    testEasingBoundaries(outBounce);
    
    const inOutBounce = eases.inOutBounce as (t: number) => number;
    testEasingBoundaries(inOutBounce);
  });

  test("Should handle back easing functions with parameters", () => {
    // Test back easing factory functions
    const inBack = eases.inBack as (overshoot?: number) => (t: number) => number;
    expect(typeof inBack).toBe("function");
    
    // Test default back easing
    const defaultInBack = inBack();
    testEasingBoundaries(defaultInBack);
    expect(defaultInBack(0.5)).toBeLessThan(0); // Should go negative (overshoot)
    
    // Test custom overshoot parameter
    const customInBack = inBack(2.5);
    testEasingBoundaries(customInBack);
    expect(customInBack(0.5)).toBeLessThan(defaultInBack(0.5)); // More overshoot
  });

  test("Should handle elastic easing functions with parameters", () => {
    // Test elastic easing factory functions
    const inElastic = eases.inElastic as (amplitude?: number, period?: number) => (t: number) => number;
    expect(typeof inElastic).toBe("function");
    
    // Test default elastic easing
    const defaultInElastic = inElastic();
    testEasingBoundaries(defaultInElastic);
    
    // Test custom amplitude and period
    const customInElastic = inElastic(2, 0.5);
    testEasingBoundaries(customInElastic);
  });

  test("Should parse easing strings correctly", () => {
    // Test function-based easing
    const linearFn = (t: number) => t;
    expect(parseEasings(linearFn)).toBe(linearFn);
    
    // Test string-based easing
    const parsedLinear = parseEasings("linear");
    expect(typeof parsedLinear).toBe("function");
    expect(parsedLinear(0.5)).toBeCloseTo(0.5, 3);
    
    // Test invalid easing string (should return none)
    const invalidEasing = parseEasings("invalidEasing");
    expect(invalidEasing(0.5)).toBe(0.5); // Should default to linear
    
    // Test undefined/null easing (should return none)
    const undefinedEasing = parseEasings(undefined as any);
    expect(undefinedEasing(0.5)).toBe(0.5);
  });

  test("Should handle easing string parsing with parameters", () => {
    // Create a mock eases object for testing parseEaseString
    // Note: Using type assertion because cubicBezier has 4 params but EasesFactory only supports 2
    const mockEases = {
      linear: () => (t: number) => t,
      cubicBezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
        // Simplified cubic bezier implementation for testing
        return t * t * (3 - 2 * t); // Smoothstep approximation
      },
      inBack: (overshoot = 1.70158) => (t: number) => t * t * ((overshoot + 1) * t - overshoot)
    } as Record<string, any>; // Type assertion to bypass strict typing
    const mockLookups: Record<string, (t: number) => number> = {};
    
    // Test simple string parsing
    const linearResult = parseEaseString("linear", mockEases, mockLookups);
    expect(typeof linearResult).toBe("function");
    
    // Test parameterized string parsing
    const backResult = parseEaseString("inBack(2.5)", mockEases, mockLookups);
    expect(typeof backResult).toBe("function");
    
    // Test caching behavior
    const cachedResult = parseEaseString("linear", mockEases, mockLookups);
    expect(cachedResult).toBe(mockLookups.linear);
  });

  test("Should provide easing type modifiers", () => {
    expect(easeTypes).toBeDefined();
    expect(easeTypes.in).toBeDefined();
    expect(easeTypes.out).toBeDefined();
    expect(easeTypes.inOut).toBeDefined();
    expect(easeTypes.outIn).toBeDefined();
    
    // Test that easing types are functions
    expect(typeof easeTypes.in).toBe("function");
    expect(typeof easeTypes.out).toBe("function");
    expect(typeof easeTypes.inOut).toBe("function");
    expect(typeof easeTypes.outIn).toBe("function");
  });

  test("Should apply easing type modifiers correctly", () => {
    // Create a simple test easing function (quadratic)
    const quadIn = (t: number) => t * t;
    
    // Test 'in' modifier (should be unchanged)
    const inResult = easeTypes.in(quadIn);
    expect(inResult(0.5)).toBeCloseTo(0.25, 3);
    
    // Test 'out' modifier (should invert the curve)
    const outResult = easeTypes.out(quadIn);
    expect(outResult(0.5)).toBeCloseTo(0.75, 3);
    
    // Test 'inOut' modifier (should combine in and out)
    const inOutResult = easeTypes.inOut(quadIn);
    expect(inOutResult(0.25)).toBeCloseTo(0.125, 3); // First half uses 'in'
    expect(inOutResult(0.75)).toBeCloseTo(0.875, 3); // Second half uses 'out'
    
    // Test 'outIn' modifier (should be opposite of inOut)
    const outInResult = easeTypes.outIn(quadIn);
    expect(outInResult(0.25)).toBeCloseTo(0.375, 3); // First half uses 'out'
    expect(outInResult(0.75)).toBeCloseTo(0.625, 3); // Second half uses 'in'
  });

  test("Should handle edge cases and boundary conditions", () => {
    // Test various easing functions with edge case inputs
    const testFunctions = [
      eases.inQuad as (t: number) => number,
      eases.outQuad as (t: number) => number,
      eases.inSine as (t: number) => number,
      eases.outSine as (t: number) => number
    ];
    
    testFunctions.forEach((easingFn, index) => {
      // Test negative input (should handle gracefully)
      const negativeResult = easingFn(-0.1);
      expect(typeof negativeResult).toBe("number");
      expect(isNaN(negativeResult)).toBe(false);
      
      // Test input greater than 1 (should handle gracefully)
      const overResult = easingFn(1.1);
      expect(typeof overResult).toBe("number");
      expect(isNaN(overResult)).toBe(false);
      
      // Test exactly 0 and 1
      expect(easingFn(0)).toBeCloseTo(0, 3);
      expect(easingFn(1)).toBeCloseTo(1, 3);
    });
  });

  test("Should maintain mathematical consistency across easing families", () => {
    // Test that in/out pairs are mathematical inverses
    const inQuad = eases.inQuad as (t: number) => number;
    const outQuad = eases.outQuad as (t: number) => number;
    
    // For any t, out(t) should equal 1 - in(1-t)
    const testValues = [0.1, 0.3, 0.5, 0.7, 0.9];
    testValues.forEach(t => {
      const outValue = outQuad(t);
      const expectedValue = 1 - inQuad(1 - t);
      expect(outValue).toBeCloseTo(expectedValue, 3);
    });
  });

  test("Should handle factory function parameters correctly", () => {
    // Test steps factory with different parameters
    const steps5 = eases.steps as (steps: number, fromStart?: boolean) => (t: number) => number;
    const fiveSteps = steps5(5);
    expect(fiveSteps(0.3)).toBeCloseTo(0.2, 3);
    expect(fiveSteps(0.7)).toBeCloseTo(0.6, 3);
    
    // Test cubic bezier factory
    const bezierFactory = eases.cubicBezier as (x1: number, y1: number, x2: number, y2: number) => (t: number) => number;
    const customBezier = bezierFactory(0.25, 0.46, 0.45, 0.94);
    testEasingBoundaries(customBezier);
    testEasingMonotonicity(customBezier);
  });

}); 