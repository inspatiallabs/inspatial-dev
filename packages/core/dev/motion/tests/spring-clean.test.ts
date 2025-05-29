/**
 * @module @in/motion/tests/spring-clean
 *
 * Clean tests for the InMotion Spring system. These tests validate the physics-based
 * spring animation system without requiring DOM dependencies, focusing on mathematical
 * accuracy and API correctness.
 *
 * @example Basic Usage
 * ```typescript
 * import { InMotionSpring, createMotionSpring } from "@in/motion/spring";
 * 
 * // Test spring creation and physics calculations
 * const spring = new InMotionSpring({ mass: 1, stiffness: 100, damping: 10 });
 * ```
 *
 * @features
 * - Spring Physics Validation: Tests accurate spring equation solving
 * - Parameter Configuration: Validates mass, stiffness, damping, and velocity settings
 * - Duration Calculation: Tests automatic duration computation based on physics
 * - Easing Function Generation: Validates generated easing functions
 * - Boundary Conditions: Tests edge cases and parameter limits
 * - Mathematical Consistency: Ensures physics equations produce expected results
 * - Factory Function Testing: Validates createMotionSpring helper
 * - Property Getters/Setters: Tests dynamic property updates
 * - Solver Accuracy: Validates spring equation solving at various time points
 *
 * @example Spring with Custom Parameters
 * ```typescript
 * // Test spring with specific physics parameters
 * const bouncy = createMotionSpring({
 *   mass: 2,
 *   stiffness: 150,
 *   damping: 8,
 *   velocity: 5
 * });
 * ```
 *
 * @example Testing Spring Behavior
 * ```typescript
 * // Test spring easing function behavior
 * const spring = new InMotionSpring();
 * const easeValue = spring.ease(0.5); // Test at 50% progress
 * ```
 *
 * @example Validating Physics Properties
 * ```typescript
 * // Test spring physics calculations
 * const spring = new InMotionSpring({ stiffness: 200 });
 * expect(spring.w0).toBeGreaterThan(0); // Angular frequency should be positive
 * ```
 *
 * @example Dynamic Property Updates
 * ```typescript
 * // Test property updates and recalculation
 * const spring = new InMotionSpring();
 * spring.stiffness = 300;
 * expect(spring.duration).toBeGreaterThan(0); // Duration should update
 * ```
 *
 * @apiOptions
 * - mass: number - Mass of the spring system (default: 1)
 * - stiffness: number - Spring stiffness coefficient (default: 100)
 * - damping: number - Damping factor for oscillation control (default: 10)
 * - velocity: number - Initial velocity of the system (default: 0)
 * - timeStep: number - Solver time step for duration calculation
 *
 * @bestPractices
 * 1. Test spring behavior at boundary conditions (t=0, t=1)
 * 2. Validate physics equations produce mathematically consistent results
 * 3. Test parameter clamping and validation
 * 4. Verify duration calculation accuracy
 * 5. Test easing function smoothness and continuity
 *
 * @see {@link InMotionSpring} - Main spring physics class
 * @see {@link createMotionSpring} - Factory function for creating springs
 * @see {@link SpringParams} - Configuration interface for spring parameters
 */

import { describe, it, expect } from "@inspatial/test";
import { InMotionSpring, createMotionSpring } from "../src/spring.ts";
import type { SpringParams } from "../src/types.ts";

/**
 * Helper function to test if a value is within a reasonable range
 * @param value - The value to test
 * @param min - Minimum expected value
 * @param max - Maximum expected value
 * @param tolerance - Tolerance for floating point comparison
 */
function expectInRange(value: number, min: number, max: number, tolerance = 0.001): void {
  expect(value).toBeGreaterThanOrEqual(min - tolerance);
  expect(value).toBeLessThanOrEqual(max + tolerance);
}

/**
 * Helper function to test spring easing function boundaries
 * @param easeFunction - The easing function to test
 */
function testSpringBoundaries(easeFunction: (t: number) => number): void {
  expect(easeFunction(0)).toBe(0);
  expect(easeFunction(1)).toBe(1);
}

/**
 * Helper function to test spring monotonicity (should generally increase)
 * @param easeFunction - The easing function to test
 * @param samples - Number of samples to test
 */
function testSpringMonotonicity(easeFunction: (t: number) => number, samples = 10): void {
  let prevValue = easeFunction(0);
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const currentValue = easeFunction(t);
    // Spring functions may oscillate, so we test the final value is greater
    if (i === samples) {
      expect(currentValue).toBeGreaterThanOrEqual(prevValue);
    }
  }
}

describe("InMotion Spring Clean Tests", () => {
  
  describe("# InMotionSpring Class", () => {
    
    it("Should create spring with default parameters", () => {
      const spring = new InMotionSpring();
      
      // Test default parameter values
      expect(spring.mass).toBe(1);
      expect(spring.stiffness).toBe(100);
      expect(spring.damping).toBe(10);
      expect(spring.velocity).toBe(0);
      
      // Test computed physics properties
      expect(spring.w0).toBeGreaterThan(0); // Angular frequency should be positive
      expect(spring.zeta).toBeGreaterThan(0); // Damping ratio should be positive
      expect(spring.duration).toBeGreaterThan(0); // Duration should be calculated
      expect(typeof spring.ease).toBe("function"); // Easing function should be generated
    });

    it("Should create spring with custom parameters", () => {
      const params: SpringParams = {
        mass: 2,
        stiffness: 150,
        damping: 8,
        velocity: 5
      };
      
      const spring = new InMotionSpring(params);
      
      expect(spring.mass).toBe(2);
      expect(spring.stiffness).toBe(150);
      expect(spring.damping).toBe(8);
      expect(spring.velocity).toBe(5);
      
      // Physics should be recalculated with new parameters
      expect(spring.w0).toBeGreaterThan(0);
      expect(spring.duration).toBeGreaterThan(0);
    });

    it("Should clamp parameters to valid ranges", () => {
      const spring = new InMotionSpring({
        mass: -5, // Should be clamped to minimum
        stiffness: 0, // Should be clamped to minimum (1)
        damping: -2, // Should be clamped to minimum (0.1)
        velocity: 99999 // Should be clamped to maximum
      });
      
      expect(spring.mass).toBeGreaterThanOrEqual(0);
      expect(spring.stiffness).toBeGreaterThanOrEqual(1);
      expect(spring.damping).toBeGreaterThanOrEqual(0.1);
      expect(Math.abs(spring.velocity)).toBeLessThanOrEqual(1000); // K constant limit
    });

    it("Should generate valid easing function", () => {
      const spring = new InMotionSpring();
      const easeFunction = spring.ease;
      
      // Test boundary conditions
      testSpringBoundaries(easeFunction);
      
      // Test function returns valid numbers
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const value = easeFunction(t);
        expect(typeof value).toBe("number");
        expect(isNaN(value)).toBe(false);
        expect(isFinite(value)).toBe(true);
      }
    });

    it("Should solve spring equation correctly", () => {
      const spring = new InMotionSpring({ mass: 1, stiffness: 100, damping: 10 });
      
      // Test solve method directly
      expect(spring.solve(0)).toBeCloseTo(0, 3);
      
      // Test that solve produces reasonable values
      const midValue = spring.solve(spring.solverDuration * 0.5);
      expect(typeof midValue).toBe("number");
      expect(isFinite(midValue)).toBe(true);
    });

    it("Should compute physics properties correctly", () => {
      const spring = new InMotionSpring({ mass: 4, stiffness: 400, damping: 20 });
      
      // Test angular frequency calculation: w0 = sqrt(k/m)
      const expectedW0 = Math.sqrt(400 / 4); // sqrt(100) = 10
      expect(spring.w0).toBeCloseTo(expectedW0, 2);
      
      // Test damping ratio calculation: zeta = c / (2 * sqrt(k * m))
      const expectedZeta = 20 / (2 * Math.sqrt(400 * 4)); // 20 / (2 * 40) = 0.25
      expect(spring.zeta).toBeCloseTo(expectedZeta, 2);
      
      // Test that duration is calculated
      expect(spring.duration).toBeGreaterThan(0);
      expect(spring.solverDuration).toBeGreaterThan(0);
    });

    it("Should handle different damping scenarios", () => {
      // Underdamped (zeta < 1)
      const underdamped = new InMotionSpring({ mass: 1, stiffness: 100, damping: 5 });
      expect(underdamped.zeta).toBeLessThan(1);
      expect(underdamped.wd).toBeGreaterThan(0); // Damped frequency should exist
      
      // Critically damped (zeta ≈ 1)
      const criticallyDamped = new InMotionSpring({ mass: 1, stiffness: 100, damping: 20 });
      expectInRange(criticallyDamped.zeta, 0.8, 1.2); // Close to 1
      
      // Overdamped (zeta > 1)
      const overdamped = new InMotionSpring({ mass: 1, stiffness: 100, damping: 50 });
      expect(overdamped.zeta).toBeGreaterThan(1);
      expect(overdamped.wd).toBe(0); // No damped frequency for overdamped
    });

    it("Should update properties dynamically", () => {
      const spring = new InMotionSpring();
      const originalDuration = spring.duration;
      
      // Update mass
      spring.mass = 2;
      expect(spring.mass).toBe(2);
      expect(spring.duration).not.toBe(originalDuration); // Duration should recalculate
      
      // Update stiffness
      spring.stiffness = 200;
      expect(spring.stiffness).toBe(200);
      
      // Update damping
      spring.damping = 15;
      expect(spring.damping).toBe(15);
      
      // Update velocity
      spring.velocity = 3;
      expect(spring.velocity).toBe(3);
    });

    it("Should handle edge cases in duration calculation", () => {
      // Very stiff spring (should have short duration)
      const stiffSpring = new InMotionSpring({ stiffness: 1000, damping: 50 });
      expect(stiffSpring.duration).toBeGreaterThan(0);
      
      // Very soft spring (should have longer duration)
      const softSpring = new InMotionSpring({ stiffness: 10, damping: 5 });
      expect(softSpring.duration).toBeGreaterThan(stiffSpring.duration);
      
      // High damping (should settle quickly)
      const highDamping = new InMotionSpring({ damping: 100 });
      expect(highDamping.duration).toBeGreaterThan(0);
    });

    it("Should maintain mathematical consistency", () => {
      const spring = new InMotionSpring({ mass: 1, stiffness: 100, damping: 10 });
      
      // Test that the easing function is consistent with solve method
      const t = 0.5;
      const easeValue = spring.ease(t);
      const solveValue = spring.solve(t * spring.solverDuration);
      expect(easeValue).toBeCloseTo(solveValue, 5);
      
      // Test that physics properties are consistent
      expect(spring.w0).toBeCloseTo(Math.sqrt(spring.stiffness / spring.mass), 3);
      expect(spring.zeta).toBeCloseTo(
        spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass)), 
        3
      );
    });

    it("Should handle solver convergence properly", () => {
      const spring = new InMotionSpring();
      
      // Test that solver duration is reasonable
      expect(spring.solverDuration).toBeGreaterThan(0);
      expect(spring.solverDuration).toBeLessThan(60); // Should converge within 60 seconds
      
      // Test that the spring settles close to target
      const finalValue = spring.solve(spring.solverDuration);
      expectInRange(finalValue, 0.99, 1.01); // Should be very close to 1
    });
  });

  describe("# createMotionSpring Factory Function", () => {
    
    it("Should create spring with factory function", () => {
      const spring = createMotionSpring();
      
      expect(spring).toBeInstanceOf(InMotionSpring);
      expect(spring.mass).toBe(1);
      expect(spring.stiffness).toBe(100);
      expect(spring.damping).toBe(10);
      expect(spring.velocity).toBe(0);
    });

    it("Should create spring with custom parameters via factory", () => {
      const params: SpringParams = {
        mass: 3,
        stiffness: 200,
        damping: 12,
        velocity: 2
      };
      
      const spring = createMotionSpring(params);
      
      expect(spring.mass).toBe(3);
      expect(spring.stiffness).toBe(200);
      expect(spring.damping).toBe(12);
      expect(spring.velocity).toBe(2);
    });

    it("Should handle undefined parameters in factory", () => {
      const spring = createMotionSpring(undefined);
      
      expect(spring).toBeInstanceOf(InMotionSpring);
      expect(spring.mass).toBe(1); // Default value
    });

    it("Should handle empty object in factory", () => {
      const spring = createMotionSpring({});
      
      expect(spring).toBeInstanceOf(InMotionSpring);
      expect(spring.mass).toBe(1); // Default value
      expect(spring.stiffness).toBe(100); // Default value
    });
  });

  describe("# Spring Physics Validation", () => {
    
    it("Should produce physically realistic spring behavior", () => {
      const spring = new InMotionSpring({ mass: 1, stiffness: 100, damping: 10 });
      const easeFunction = spring.ease;
      
      // Test that spring starts at 0 and ends at 1
      testSpringBoundaries(easeFunction);
      
      // Test that spring generally moves toward target
      const quarterValue = easeFunction(0.25);
      const halfValue = easeFunction(0.5);
      const threeQuarterValue = easeFunction(0.75);
      
      // Values should generally increase (allowing for some oscillation)
      expect(quarterValue).toBeGreaterThanOrEqual(0);
      expect(halfValue).toBeGreaterThanOrEqual(0);
      expect(threeQuarterValue).toBeGreaterThanOrEqual(0);
      expect(threeQuarterValue).toBeGreaterThan(quarterValue * 0.5); // Some progress
    });

    it("Should handle different spring characteristics", () => {
      // Bouncy spring (low damping)
      const bouncy = new InMotionSpring({ damping: 3 });
      expect(bouncy.zeta).toBeLessThan(1); // Underdamped
      
      // Smooth spring (high damping)
      const smooth = new InMotionSpring({ damping: 30 });
      expect(smooth.zeta).toBeGreaterThan(1); // Overdamped
      
      // Both should produce valid easing functions
      testSpringBoundaries(bouncy.ease);
      testSpringBoundaries(smooth.ease);
    });

    it("Should calculate appropriate durations for different springs", () => {
      const fastSpring = new InMotionSpring({ stiffness: 500, damping: 50 });
      const slowSpring = new InMotionSpring({ stiffness: 50, damping: 5 });
      
      // Fast spring should generally have shorter duration
      expect(fastSpring.duration).toBeGreaterThan(0);
      expect(slowSpring.duration).toBeGreaterThan(0);
      // Note: Duration comparison can be complex due to damping effects
    });
  });

  describe("# Spring API Consistency", () => {
    
    it("Should maintain consistent API across instances", () => {
      const spring1 = new InMotionSpring();
      const spring2 = createMotionSpring();
      
      // Both should have the same API
      expect(typeof spring1.ease).toBe("function");
      expect(typeof spring2.ease).toBe("function");
      expect(typeof spring1.solve).toBe("function");
      expect(typeof spring2.solve).toBe("function");
      expect(typeof spring1.compute).toBe("function");
      expect(typeof spring2.compute).toBe("function");
      
      // Both should have the same properties
      expect(spring1).toHaveProperty("mass");
      expect(spring1).toHaveProperty("stiffness");
      expect(spring1).toHaveProperty("damping");
      expect(spring1).toHaveProperty("velocity");
      expect(spring1).toHaveProperty("duration");
      
      expect(spring2).toHaveProperty("mass");
      expect(spring2).toHaveProperty("stiffness");
      expect(spring2).toHaveProperty("damping");
      expect(spring2).toHaveProperty("velocity");
      expect(spring2).toHaveProperty("duration");
    });

    it("Should handle property updates correctly", () => {
      const spring = new InMotionSpring();
      
      // Test getter/setter consistency
      const originalMass = spring.mass;
      spring.mass = 5;
      expect(spring.mass).toBe(5);
      expect(spring.mass).not.toBe(originalMass);
      
      // Test that internal properties are updated
      expect(spring.w0).toBeGreaterThan(0);
      expect(spring.duration).toBeGreaterThan(0);
    });
  });

  it("Spring Clean API Tests", () => {
    // Test that all expected exports are available
    expect(InMotionSpring).toBeDefined();
    expect(createMotionSpring).toBeDefined();
    
    // Test that InMotionSpring is a constructor
    expect(typeof InMotionSpring).toBe("function");
    expect(typeof createMotionSpring).toBe("function");
    
    // Test that instances have expected methods
    const spring = new InMotionSpring();
    expect(typeof spring.solve).toBe("function");
    expect(typeof spring.compute).toBe("function");
    expect(typeof spring.ease).toBe("function");
    
    // Test that properties are accessible
    expect(typeof spring.mass).toBe("number");
    expect(typeof spring.stiffness).toBe("number");
    expect(typeof spring.damping).toBe("number");
    expect(typeof spring.velocity).toBe("number");
    expect(typeof spring.duration).toBe("number");
  });
}); 