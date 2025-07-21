/**
 * # Trigger State Integration Tests
 * @file trigger-state.test.ts
 * @description Tests for the integration between triggers and state management systems
 * 
 * These tests verify the correct behavior of trigger state interactions
 * and proper import functionality between modules.
 */

// Import test setup including __DEV__ global
// @ts-ignore - Ignoring TS extension import error
import { 
  describe, 
  it, 
  expect, 
  beforeEach, 
  afterEach,
  createTestTriggerRegistry,
  cleanupTestTriggers
} from "./test-setup.ts";

// Import from state.ts to test its exports work correctly
// @ts-ignore - Ignoring TS extension import error
import { activateTrigger, RegisteredTriggerType, TriggerInstanceType } from "../../trigger/src/state.ts";

// Also import these directly to compare functionality
// @ts-ignore - Ignoring TS extension import error
import { registerTrigger, getRegisteredTrigger, hasTrigger } from "../../trigger/src/registry.ts";
// @ts-ignore - Ignoring TS extension import error
import { createTrigger as createTriggerOriginal } from "../../trigger/src/action.ts";

describe("Trigger State Integration", () => {
  // Track registered triggers for cleanup
  const testTriggerNames = createTestTriggerRegistry();

  afterEach(() => {
    // Clean up test triggers
    cleanupTestTriggers(testTriggerNames);
    testTriggerNames.length = 0;
  });

  describe("State Module Exports", () => {
    it("should properly export activateTrigger from action.ts", () => {
      // Arrange
      const triggerName = "test:stateExportTrigger";
      const testTrigger: RegisteredTriggerType = {
        name: triggerName,
        action: (state: any) => ({ ...state, activated: true })
      };
      registerTrigger(testTrigger);
      testTriggerNames.push(triggerName);
      
      const initialState = { activated: false };
      
      // Act
      const newState = activateTrigger(triggerName, initialState);
      
      // Assert
      expect(newState).toEqual({ activated: true });
    });
    
    it("should properly export types used by triggers", () => {
      // These are TypeScript compile-time checks to ensure the types are exported correctly
      
      // Arrange & Act
      // Create variables with the exported types to confirm they work at runtime
      const triggerDefinition: RegisteredTriggerType = {
        name: "test:typesExportTest",
        action: (state: any) => state
      };
      
      // Assert
      // If the types are exported correctly, this should compile without error
      expect(typeof triggerDefinition.name).toBe("string");
      expect(typeof triggerDefinition.action).toBe("function");
    });
  });
  
  describe("State-Trigger Integration", () => {
    it("should handle state modifications through triggers", () => {
      // Arrange
      const triggerName = "test:stateModification";
      const initialState = { 
        counter: 0,
        items: ["apple"]
      };
      
      // Creating a trigger that can modify different parts of state
      const testTrigger: RegisteredTriggerType = {
        name: triggerName,
        action: (state: any, action: string, value: any) => {
          switch (action) {
            case "increment":
              return { ...state, counter: state.counter + value };
            case "addItem":
              return { ...state, items: [...state.items, value] };
            case "reset":
              return { counter: 0, items: [] };
            default:
              return state;
          }
        }
      };
      registerTrigger(testTrigger);
      testTriggerNames.push(triggerName);
      
      // Act - Perform a series of state modifications
      let currentState = initialState;
      
      // Increment counter
      currentState = activateTrigger(triggerName, currentState, "increment", 5);
      expect(currentState.counter).toBe(5);
      
      // Add an item
      currentState = activateTrigger(triggerName, currentState, "addItem", "banana");
      expect(currentState.items).toEqual(["apple", "banana"]);
      
      // Reset the state
      currentState = activateTrigger(triggerName, currentState, "reset");
      
      // Assert final state
      expect(currentState).toEqual({ counter: 0, items: [] });
    });
    
    it("should return the original state when trigger action returns undefined", () => {
      // Arrange
      const triggerName = "test:undefinedReturn";
      const initialState = { untouched: true };
      
      const testTrigger: RegisteredTriggerType = {
        name: triggerName,
        action: (state: any) => {
          // Function with side effect but no return value
          console.log("This trigger has side effects only");
          // Implicitly returns undefined
        }
      };
      registerTrigger(testTrigger);
      testTriggerNames.push(triggerName);
      
      // Act
      const newState = activateTrigger(triggerName, initialState);
      
      // Assert
      expect(newState).toBe(initialState); // Should be the same object reference
    });
    
    it("should throw errors for missing triggers", () => {
      // Arrange - No trigger registered
      const nonExistentTrigger = "test:doesNotExist";
      const initialState = { data: "important" };
      
      // Act & Assert
      expect(() => activateTrigger(nonExistentTrigger, initialState)).toThrow();
    });
  });
  
  describe("Error Handling", () => {
    it("should throw specific error if trigger action throws", () => {
      // Arrange
      const triggerName = "test:errorThrowingTrigger";
      const errorMessage = "Intentional error for testing";
      
      const testTrigger: RegisteredTriggerType = {
        name: triggerName,
        action: (state: any) => {
          throw new Error(errorMessage);
        }
      };
      registerTrigger(testTrigger);
      testTriggerNames.push(triggerName);
      
      // Act & Assert
      expect(() => activateTrigger(triggerName, {})).toThrow();
    });
  });
  
  describe("Edge Cases", () => {
    it("should handle null or undefined state", () => {
      // Arrange
      const triggerName = "test:nullStateTrigger";
      
      const testTrigger: RegisteredTriggerType = {
        name: triggerName,
        action: (state: any) => {
          return { created: true };
        }
      };
      registerTrigger(testTrigger);
      testTriggerNames.push(triggerName);
      
      // Act & Assert - Test with null state
      const nullState = null;
      const resultFromNull = activateTrigger(triggerName, nullState as any);
      expect(resultFromNull).toEqual({ created: true });
      
      // Act & Assert - Test with undefined state
      const undefinedState = undefined;
      const resultFromUndefined = activateTrigger(triggerName, undefinedState as any);
      expect(resultFromUndefined).toEqual({ created: true });
    });
    
    it("should handle circular references in state", () => {
      // Arrange
      const triggerName = "test:circularRefTrigger";
      
      const testTrigger: RegisteredTriggerType = {
        name: triggerName,
        action: (state: any) => {
          return { ...state, additional: "data" };
        }
      };
      registerTrigger(testTrigger);
      testTriggerNames.push(triggerName);
      
      // Create a state with circular reference
      const circularState: any = { name: "circular" };
      circularState.self = circularState; // Create circular reference
      
      // Act
      const newState = activateTrigger(triggerName, circularState);
      
      // Assert - Check only non-circular properties
      expect(newState.name).toBe("circular");
      expect(newState.additional).toBe("data");
      // Just check that a self-reference exists, not its exact value
      expect(newState.self).toBeDefined();
    });
  });
}); 