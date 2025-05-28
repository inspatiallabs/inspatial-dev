// Clean test for Sequence functionality without any DOM or DOM-related structures
import { test, describe, expect } from "@inspatial/test";
import { inSequence } from "../src/sequence.ts";

/**
 * # InMotion Sequence System - Clean API Tests
 * @summary Tests sequence generation logic using pure mathematical calculations
 *
 * This test suite validates the core sequence functionality without requiring
 * DOM structures. It ensures that sequence functions generate correct progressive
 * values for multiple targets and handle various configuration options properly.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @module sequence-clean
 * @kind test
 * @access public
 *
 * ### 💡 Core Concepts
 * - Tests sequence value generation for multiple targets
 * - Validates grid-based sequencing for 2D layouts
 * - Tests different starting positions (first, center, last)
 * - Verifies easing integration with sequence timing
 * - Ensures proper handling of numeric and string values
 *
 * ### 🎯 Prerequisites
 * Before running these tests:
 * - Sequence functions should generate progressive values
 * - Grid sequencing should work for both x and y axes
 * - String values with units should be preserved
 * - Easing functions should integrate correctly
 *
 * ### 📚 Terminology
 * > **Sequence Function**: A function that generates progressive values for animation targets
 * > **Grid Sequencing**: Organizing targets in a 2D grid for sequential animation
 * > **From Position**: Starting point for sequence calculation (first, center, last, or index)
 * > **Distributor**: Internal function that calculates sequence values for each target
 */
describe("Sequence Clean API Tests", () => {

  /**
   * Helper function to create mock targets for testing
   * @param count - Number of targets to create
   * @returns Array of mock target objects
   */
  function createMockTargets(count: number): Array<Record<string, any>> {
    return Array.from({ length: count }, (_, i) => ({ id: i, x: 0, y: 0 }));
  }

  /**
   * Helper function to test sequence values across multiple targets
   * @param sequenceFunc - The sequence function to test
   * @param targetCount - Number of targets to test with
   * @returns Array of generated values
   */
  function testSequenceValues(
    sequenceFunc: (target?: any, index?: number, total?: number) => any,
    targetCount: number
  ): any[] {
    const targets = createMockTargets(targetCount);
    return targets.map((target, index) => 
      sequenceFunc(target, index, targetCount)
    );
  }

  test("Should create basic numeric sequence", () => {
    /** Creates a sequence function for numeric values */
    const seq = inSequence([0, 100]);
    
    /** Test sequence distribution across multiple targets */
    const targets = createMockTargets(5);
    
    /** Verify progressive value distribution from start to end */
    expect(seq(targets[0], 0, 5)).toBeCloseTo(0, 2);    // First target gets start value
    expect(seq(targets[1], 1, 5)).toBeCloseTo(25, 2);   // Progressive interpolation
    expect(seq(targets[2], 2, 5)).toBeCloseTo(50, 2);   // Middle value
    expect(seq(targets[3], 3, 5)).toBeCloseTo(75, 2);   // Progressive interpolation
    expect(seq(targets[4], 4, 5)).toBeCloseTo(100, 2);  // Last target gets end value
  });

  test("Should handle single value sequences", () => {
    /** Creates a sequence from a single value (0 to value) */
    const seq = inSequence(50);
    
    /** Test sequence distribution for single value */
    const targets = createMockTargets(3);
    
    /** Verify sequence goes from 0 to the specified value */
    expect(seq(targets[0], 0, 3)).toBeCloseTo(0, 2);   // Start at 0
    expect(seq(targets[1], 1, 3)).toBeCloseTo(25, 2);  // Middle value
    expect(seq(targets[2], 2, 3)).toBeCloseTo(50, 2);  // End at specified value
  });

  test("Should handle string values with units", () => {
    /** Creates a sequence with string values containing units */
    const seq = inSequence(["0px", "100px"]);
    
    /** Test string interpolation with units */
    const targets = createMockTargets(3);
    
    /** Verify string values interpolate correctly with units preserved */
    expect(seq(targets[0], 0, 3)).toBe("0px");   // Start value with unit
    expect(seq(targets[1], 1, 3)).toBe("50px");  // Interpolated middle value
    expect(seq(targets[2], 2, 3)).toBe("100px"); // End value with unit
  });

  test("Should handle 'from' parameter correctly", () => {
    /** Test different 'from' parameter values */
    
    /** Default behavior (from: "last") - normal order */
    const seqDefault = inSequence([0, 100]);
    const targets = createMockTargets(3);
    
    expect(seqDefault(targets[0], 0, 3)).toBeCloseTo(0, 2);   // Start value
    expect(seqDefault(targets[2], 2, 3)).toBeCloseTo(100, 2); // End value
    
    /** From "first" - reversed order */
    const seqFirst = inSequence([0, 100], { from: "first" });
    
    expect(seqFirst(targets[0], 0, 3)).toBeCloseTo(100, 2); // First gets end value
    expect(seqFirst(targets[1], 1, 3)).toBeCloseTo(50, 2);  // Middle value
    expect(seqFirst(targets[2], 2, 3)).toBeCloseTo(0, 2);   // Last gets start value
    
    /** From "center" - center-based distribution */
    const seqCenter = inSequence([0, 100], { from: "center" });
    const targets5 = createMockTargets(5);
    
    expect(seqCenter(targets5[0], 0, 5)).toBeCloseTo(50, 2);  // Edge
    expect(seqCenter(targets5[2], 2, 5)).toBeCloseTo(100, 2); // Center gets max
    expect(seqCenter(targets5[4], 4, 5)).toBeCloseTo(50, 2);  // Edge
  });

  test("Should handle reversed sequences", () => {
    // Test normal sequence
    const normal = inSequence([0, 100]);
    const normalValues = testSequenceValues(normal, 4);
    
    // Test reversed sequence
    const reversed = inSequence([0, 100], { reversed: true });
    const reversedValues = testSequenceValues(reversed, 4);
    
    expect(reversedValues).toHaveLength(4);
    
    // Reversed should be opposite of normal
    expect(reversedValues[0]).toBeCloseTo(100, 2);   // First gets end value
    expect(reversedValues[3]).toBeCloseTo(0, 2);     // Last gets start value
    
    // Values should be in descending order when reversed
    for (let i = 0; i < reversedValues.length - 1; i++) {
      expect(reversedValues[i]).toBeGreaterThanOrEqual(reversedValues[i + 1]);
    }
  });

  test("Should handle grid-based sequencing", () => {
    // Test 2x2 grid with x-axis sequencing
    const gridX = inSequence([0, 100], { 
      grid: [2, 2], 
      axis: "x",
      from: "first"
    });
    
    const gridXValues = testSequenceValues(gridX, 4);
    expect(gridXValues).toHaveLength(4);
    
    // In a 2x2 grid with x-axis:
    // [0,1] -> col 0,1 -> values should be based on column position
    // [2,3] -> col 0,1 -> values should be based on column position
    expect(gridXValues[0]).toBeCloseTo(gridXValues[2], 2); // Same column
    expect(gridXValues[1]).toBeCloseTo(gridXValues[3], 2); // Same column
    
    // Test 2x2 grid with y-axis sequencing
    const gridY = inSequence([0, 100], { 
      grid: [2, 2], 
      axis: "y",
      from: "first"
    });
    
    const gridYValues = testSequenceValues(gridY, 4);
    expect(gridYValues).toHaveLength(4);
    
    // In a 2x2 grid with y-axis:
    // Values should be based on row position
    expect(gridYValues[0]).toBeCloseTo(gridYValues[1], 2); // Same row
    expect(gridYValues[2]).toBeCloseTo(gridYValues[3], 2); // Same row
  });

  test("Should handle start parameter", () => {
    // Test with numeric start value
    const withStart = inSequence([10, 50], { start: 100 });
    const startValues = testSequenceValues(withStart, 3);
    
    expect(startValues).toHaveLength(3);
    // All values should be offset by the start value (100)
    expect(startValues[0]).toBeCloseTo(100, 2); // 100 + 0 (start value)
    expect(startValues[2]).toBeCloseTo(140, 2); // 100 + 40 (start + diff)
    
    // Test with string start value
    const withStringStart = inSequence([0, 10], { start: "5" });
    const stringStartValues = testSequenceValues(withStringStart, 2);
    
    expect(stringStartValues[0]).toBeCloseTo(5, 2); // 5 + 0
    expect(stringStartValues[1]).toBeCloseTo(15, 2);  // 5 + 10
  });

  test("Should handle easing functions", () => {
    // Test with linear easing (should be same as no easing)
    const linear = inSequence([0, 100], { ease: "linear" });
    const linearValues = testSequenceValues(linear, 4);
    
    // Test with ease-in (should start slower)
    const easeIn = inSequence([0, 100], { ease: "inQuad" });
    const easeInValues = testSequenceValues(easeIn, 4);
    
    expect(linearValues).toHaveLength(4);
    expect(easeInValues).toHaveLength(4);
    
    // Both should have same start and end values
    expect(linearValues[0]).toBeCloseTo(easeInValues[0], 2);
    expect(linearValues[3]).toBeCloseTo(easeInValues[3], 2);
    
    // Middle values should be different due to easing
    expect(linearValues[1]).not.toBeCloseTo(easeInValues[1], 1);
  });

  test("Should handle modifier functions", () => {
    // Test with modifier that doubles the value
    const withModifier = inSequence([0, 50], { 
      modifier: (value: number) => value * 2 
    });
    
    const modifiedValues = testSequenceValues(withModifier, 3);
    
    expect(modifiedValues).toHaveLength(3);
    expect(modifiedValues[0]).toBeCloseTo(0, 2);   // 0 * 2
    expect(modifiedValues[2]).toBeCloseTo(100, 2); // 50 * 2
    
    // Test with modifier that adds offset
    const withOffset = inSequence([0, 10], { 
      modifier: (value: number) => value + 1000 
    });
    
    const offsetValues = testSequenceValues(withOffset, 2);
    expect(offsetValues[0]).toBeCloseTo(1000, 2); // 0 + 1000
    expect(offsetValues[1]).toBeCloseTo(1010, 2); // 10 + 1000
  });

  test("Should handle edge cases", () => {
    // Test with single target
    const singleTarget = inSequence([0, 100]);
    const singleValue = testSequenceValues(singleTarget, 1);
    
    expect(singleValue).toHaveLength(1);
    expect(singleValue[0]).toBeCloseTo(100, 2); // Should get end value
    
    // Test with zero targets (edge case)
    const zeroValues = testSequenceValues(singleTarget, 0);
    expect(zeroValues).toHaveLength(0);
    
    // Test with very large grid
    const largeGrid = inSequence([0, 100], { grid: [10, 10] });
    const largeGridValues = testSequenceValues(largeGrid, 100);
    expect(largeGridValues).toHaveLength(100);
    
    // Test with non-numeric string values
    const nonNumericStrings = inSequence(["red", "blue"]);
    const stringValues = testSequenceValues(nonNumericStrings, 2);
    expect(stringValues[0]).toBe("red");   // Should return the first string
    expect(stringValues[1]).toBe("blue");  // Should return the second string
  });

  test("Should handle complex grid scenarios", () => {
    // Test 3x3 grid with center starting point
    const centerGrid = inSequence([0, 100], { 
      grid: [3, 3], 
      from: "center",
      axis: "x"
    });
    
    const centerValues = testSequenceValues(centerGrid, 9);
    expect(centerValues).toHaveLength(9);
    
    // Center column (indices 1, 4, 7) should have the maximum value
    expect(centerValues[1]).toBeCloseTo(100, 2);
    expect(centerValues[4]).toBeCloseTo(100, 2);
    expect(centerValues[7]).toBeCloseTo(100, 2);
    
    // Test asymmetric grid
    const asymmetricGrid = inSequence([0, 50], { 
      grid: [4, 2], 
      axis: "y"
    });
    
    const asymmetricValues = testSequenceValues(asymmetricGrid, 8);
    expect(asymmetricValues).toHaveLength(8);
    
    // First row (indices 0-3) should have same values
    expect(asymmetricValues[0]).toBeCloseTo(asymmetricValues[1], 2);
    expect(asymmetricValues[0]).toBeCloseTo(asymmetricValues[2], 2);
    expect(asymmetricValues[0]).toBeCloseTo(asymmetricValues[3], 2);
    
    // Second row (indices 4-7) should have same values
    expect(asymmetricValues[4]).toBeCloseTo(asymmetricValues[5], 2);
    expect(asymmetricValues[4]).toBeCloseTo(asymmetricValues[6], 2);
    expect(asymmetricValues[4]).toBeCloseTo(asymmetricValues[7], 2);
  });

  test("Should maintain mathematical consistency", () => {
    // Test that sequence values are mathematically consistent
    const sequence = inSequence([0, 100], { from: "first" });
    const values = testSequenceValues(sequence, 10);
    
    // Values should be evenly distributed in descending order
    const step = 100 / 9; // 9 intervals between 10 values
    for (let i = 0; i < values.length; i++) {
      const expectedValue = 100 - (i * step); // Descending from 100 to 0
      expect(values[i]).toBeCloseTo(expectedValue, 1);
    }
    
    // Test with negative values
    const negativeSequence = inSequence([-50, 50], { from: "first" });
    const negativeValues = testSequenceValues(negativeSequence, 5);
    
    expect(negativeValues[0]).toBeCloseTo(100, 2);  // First gets calculated end value
    expect(negativeValues[4]).toBeCloseTo(0, 2);    // Last gets calculated start value
    expect(negativeValues[2]).toBeCloseTo(50, 2);   // Middle value
  });

  test("Should handle function-based start values", () => {
    // Test with function that returns different start values per target
    const functionStart = inSequence([0, 10], { 
      start: (target: any, index: number) => index * 100 
    });
    
    const functionValues = testSequenceValues(functionStart, 3);
    
    expect(functionValues).toHaveLength(3);
    // Function start values work by providing a base value that gets added to the sequence progression
    // For index 0: start=0, progression=0, result = 0 + 0 * 10 = 0
    // For index 1: start=100, progression=0.5, result = 100 + 0.5 * 10 = 105  
    // For index 2: start=200, progression=1, result = 200 + 1 * 10 = 210
    expect(functionValues[0]).toBeCloseTo(0, 2);   // 0 + 0 * 10
    expect(functionValues[1]).toBeCloseTo(105, 2); // 100 + 0.5 * 10
    expect(functionValues[2]).toBeCloseTo(210, 2); // 200 + 1 * 10
  });

}); 