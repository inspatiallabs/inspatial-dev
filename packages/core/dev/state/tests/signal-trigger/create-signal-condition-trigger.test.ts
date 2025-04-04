/**
 * @file Comprehensive tests for createSignalConditionTrigger function
 * @module @inspatial/state/test/signal-trigger
 */

import { test, expect, spy, assertSpyCalls, mockSession, mockFn } from "@inspatial/test";
import { createSignalConditionTrigger } from "../../core/signal-trigger.ts";
import { createSignal } from "../../signal/src/signals.ts";
import { createTriggerInstance } from "../../trigger/src/action.ts";

// Mock the trigger system
mockSession();

// Add type declaration to globalThis
declare global {
  var createTriggerInstance: any;
}

// Mock createTriggerInstance
const mockTriggerInstance = {
  execute: spy(),
  destroy: spy(),
};

// Create a spy for the global createTriggerInstance function
const createTriggerInstanceSpy = spy();
const originalCreateTriggerInstance = globalThis.createTriggerInstance;
globalThis.createTriggerInstance = mockFn(() => {
  createTriggerInstanceSpy();
  return { ...mockTriggerInstance };
});

test("createSignalConditionTrigger - basic functionality", () => {
  // Setup
  const [signal, setSignal] = createSignal(5);
  
  // Create a condition trigger that activates when signal is > 10
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: () => console.log("Activated")
    },
    falseTrigger: {
      type: "inactiveTrigger",
      action: () => console.log("Deactivated")
    }
  });
  
  // Initially condition is false, so falseTrigger should be used
  assertSpyCalls(createTriggerInstanceSpy, 1);
  
  // Change signal to meet condition
  setSignal(15);
  
  // Should switch to trueTrigger
  assertSpyCalls(createTriggerInstanceSpy, 2);
  
  // Change back to not meeting condition
  setSignal(5);
  
  // Should switch back to falseTrigger
  assertSpyCalls(createTriggerInstanceSpy, 3);
  
  // Cleanup
  trigger.destroy();
  assertSpyCalls(mockTriggerInstance.destroy, 1);
});

test("createSignalConditionTrigger - without falseTrigger", () => {
  // Reset call counts
  createTriggerInstanceSpy.mock.calls = [];
  
  // Setup
  const [signal, setSignal] = createSignal(5);
  
  // Create a condition trigger with only trueTrigger
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: () => console.log("Activated")
    }
  });
  
  // Initially should create a dummy trigger
  assertSpyCalls(createTriggerInstanceSpy, 1);
  
  // Change signal to meet condition
  setSignal(15);
  
  // Should switch to trueTrigger
  assertSpyCalls(createTriggerInstanceSpy, 2);
  
  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - with onChange option", () => {
  // Reset call counts
  createTriggerInstanceSpy.mock.calls = [];
  
  // Setup
  const [signal, setSignal] = createSignal(15);
  const action = spy();
  
  // Create a condition trigger with onChange true
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action
    },
    onChange: true
  });
  
  // Initially condition is true
  // Reset call counts
  action.mock.calls = [];
  createTriggerInstanceSpy.mock.calls = [];
  
  // Change signal but condition still true (15 -> 20)
  setSignal(20);
  
  // With onChange true, should still trigger even though condition remains true
  assertSpyCalls(createTriggerInstanceSpy, 1);
  
  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - complex condition logic", () => {
  // Reset call counts
  createTriggerInstanceSpy.mock.calls = [];
  
  // Setup multiple signals
  const [count, setCount] = createSignal(0);
  const [active, setActive] = createSignal(false);
  
  // Create a condition that depends on both signals
  const condition = spy((value: number) => {
    // Will be true when count > 5 AND active is true
    return value > 5 && active(); 
  });
  
  const trigger = createSignalConditionTrigger({
    signal: count,
    condition,
    trueTrigger: {
      type: "activeTrigger",
      action: () => {}
    },
    falseTrigger: {
      type: "inactiveTrigger",
      action: () => {}
    }
  });
  
  // Initially both conditions are false
  assertSpyCalls(createTriggerInstanceSpy, 1);
  
  // Set count > 5 but active is still false
  createTriggerInstanceSpy.mock.calls = [];
  setCount(10);
  assertSpyCalls(condition, 2); // Initial + update
  assertSpyCalls(createTriggerInstanceSpy, 1);
  
  // Now set active to true, both conditions met
  setActive(true);
  // This doesn't directly trigger condition reevaluation
  // because our condition is watching count, not active
  
  // Update count to trigger reevaluation
  createTriggerInstanceSpy.mock.calls = [];
  setCount(15);
  assertSpyCalls(createTriggerInstanceSpy, 1);
  
  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - trigger execution", () => {
  // Setup
  const [signal, setSignal] = createSignal(5);
  const trueAction = spy();
  const falseAction = spy();
  
  // Create a condition trigger
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: trueAction
    },
    falseTrigger: {
      type: "inactiveTrigger",
      action: falseAction
    }
  });
  
  // Reset the mock createTriggerInstance
  const originalCreateTriggerInstance = globalThis.createTriggerInstance;
  globalThis.createTriggerInstance = (config: any) => {
    // Create the trigger but also execute it immediately for testing
    const instance = { 
      ...mockTriggerInstance,
      execute: spy(),
      config
    };
    
    if (config.action === trueAction) {
      trueAction();
    } else if (config.action === falseAction) {
      falseAction();
    }
    
    return instance;
  };
  
  // Initially falseTrigger should be executed
  assertSpyCalls(falseAction, 1);
  
  // Change signal to meet condition
  setSignal(15);
  
  // trueTrigger should be executed
  assertSpyCalls(trueAction, 1);
  
  // Restore the original function
  globalThis.createTriggerInstance = originalCreateTriggerInstance;
  
  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - dispose cleanup", () => {
  // Setup
  const [signal, setSignal] = createSignal(5);
  
  // Create a condition trigger
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: () => {}
    }
  });
  
  // Verify destroy is called during cleanup
  const originalDestroy = trigger.destroy;
  const destroySpy = spy(originalDestroy);
  trigger.destroy = destroySpy;
  
  // Reset call counts
  mockTriggerInstance.destroy.mock.calls = [];
  
  // Trigger cleanup
  trigger.destroy();
  
  // Should call the original destroy method
  assertSpyCalls(destroySpy, 1);
  assertSpyCalls(mockTriggerInstance.destroy, 1);
}); 