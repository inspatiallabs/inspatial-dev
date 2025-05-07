/**
 * # Trigger Creation and Activation Tests
 * @file trigger-creation.test.ts
 * @description Tests for trigger creation and activation functionality
 * 
 * These tests verify the correct behavior of trigger creation and activation functions.
 */

import { describe, it, expect, beforeEach, afterEach } from "../../../test/src/index.ts";

import {
  createTrigger,
  activateTrigger,
  registerTrigger
} from "../../trigger/src/action.ts";

import {
  RegisteredTriggerType
} from "../../trigger/src/types.ts";

describe("Trigger Creation and Activation", () => {
  // Track registered triggers for cleanup
  const testTriggerNames: string[] = [];

  afterEach(() => {
    // Clean up test triggers
    // @ts-ignore: Accessing internal registry for cleanup
    for (const name of testTriggerNames) {
      // @ts-ignore: Accessing private registry
      delete globalThis.__TRIGGER_STATE_ACTIONS__?.[name];
    }
    testTriggerNames.length = 0;
  });

  describe("createTrigger", () => {
    it("should create a trigger with name and action", () => {
      // Arrange
      const triggerName = "test:onCreate";
      
      // Act
      const trigger = createTrigger({
        name: triggerName,
        action: (state: any) => ({ ...state, triggered: true })
      });
      testTriggerNames.push(triggerName);
      
      // Assert
      expect(trigger).toBeDefined();
      expect(trigger.name).toBe(triggerName);
      expect(typeof trigger.action).toBe("function");
    });
    
    it("should register the trigger in the registry", () => {
      // Arrange
      const triggerName = "test:onCreateRegister";
      
      // Act
      const trigger = createTrigger({
        name: triggerName,
        action: (state: any) => ({ ...state, registered: true })
      });
      testTriggerNames.push(triggerName);
      
      // Assert
      // @ts-ignore: Accessing internal registry
      const registeredTriggers = globalThis.__TRIGGER_STATE_ACTIONS__ || {};
      expect(registeredTriggers[triggerName]).toBeDefined();
    });
    
    it("should throw an error for invalid trigger name", () => {
      // Act & Assert
      expect(() => 
        createTrigger({
          name: "",
          action: (state: any) => state
        })
      ).toThrow();
    });
  });
  
  describe("activateTrigger", () => {
    it("should apply the trigger action to the state", () => {
      // Arrange
      const triggerName = "test:onActivate";
      const initialState = { value: 1 };
      
      // Create and register the trigger
      createTrigger({
        name: triggerName,
        action: (state: any, amount: number) => ({ 
          ...state, 
          value: state.value + amount 
        })
      });
      testTriggerNames.push(triggerName);
      
      // Act
      const newState = activateTrigger(triggerName, initialState, 5);
      
      // Assert
      expect(newState).toEqual({ value: 6 });
    });
    
    it("should return the unchanged state if the trigger doesn't modify it", () => {
      // Arrange
      const triggerName = "test:onActivateNoChange";
      const initialState = { untouched: true };
      
      // Create and register the trigger
      createTrigger({
        name: triggerName,
        action: (state: any) => {
          // This trigger doesn't return anything, it just has a side effect
          console.log("Trigger activated");
        }
      });
      testTriggerNames.push(triggerName);
      
      // Act
      const newState = activateTrigger(triggerName, initialState);
      
      // Assert
      expect(newState).toBe(initialState); // Same object reference
    });
    
    it("should throw an error for unknown trigger", () => {
      // Act & Assert
      expect(() => 
        activateTrigger("unknown:trigger", {})
      ).toThrow();
    });
    
    it("should pass additional arguments to the trigger action", () => {
      // Arrange
      const triggerName = "test:onActivateWithArgs";
      const initialState = { items: [] };
      
      // Create and register the trigger
      createTrigger({
        name: triggerName,
        action: (state: any, item: string, count: number) => ({
          ...state,
          items: [...state.items, { name: item, quantity: count }]
        })
      });
      testTriggerNames.push(triggerName);
      
      // Act
      const newState = activateTrigger(triggerName, initialState, "apple", 3);
      
      // Assert
      expect(newState).toEqual({
        items: [{ name: "apple", quantity: 3 }]
      });
    });
  });
  
  describe("Create and Activate Integration", () => {
    it("should create and activate a trigger in sequence", () => {
      // Arrange
      const triggerName = "test:createAndActivate";
      const initialState = { processed: false };
      
      // Act - Create trigger
      const trigger = createTrigger({
        name: triggerName,
        action: (state: any) => ({ ...state, processed: true })
      });
      testTriggerNames.push(triggerName);
      
      // Act - Activate trigger
      const newState = activateTrigger(triggerName, initialState);
      
      // Assert
      expect(newState).toEqual({ processed: true });
    });
    
    it("should handle multiple activations correctly", () => {
      // Arrange
      const triggerName = "test:multiActivate";
      const initialState = { count: 0 };
      
      // Create trigger that increments count
      createTrigger({
        name: triggerName,
        action: (state: any) => ({ ...state, count: state.count + 1 })
      });
      testTriggerNames.push(triggerName);
      
      // Act - Activate multiple times
      let state = initialState;
      for (let i = 0; i < 5; i++) {
        state = activateTrigger(triggerName, state);
      }
      
      // Assert
      expect(state).toEqual({ count: 5 });
    });
  });
}); 