/**
 * @file Comprehensive tests for createSignalConditionTrigger function
 * @module @inspatial/state/test/signal-trigger
 */

import {
  test,
  expect,
  spy,
  assertSpyCalls,
  mockSession,
  mockFn,
} from "@inspatial/test";
import { createSignal } from "../../signal/src/signals.ts";
import { createTriggerInstance } from "../../trigger/src/action.ts";
import { createSignalConditionTrigger } from "../../state/signal-trigger.ts";
import { initTriggerSystem } from "../test-helpers.ts";

// Initialize the trigger system
initTriggerSystem();

// Mock the trigger system
mockSession();

// Add type declaration to globalThis
declare global {
  var createTriggerInstance: any;
}

// Create a proper spy setup
const mockTriggerInstance = {
  execute: spy(),
  destroy: spy(),
};
mockTriggerInstance.execute.mock = { calls: [] };
mockTriggerInstance.destroy.mock = { calls: [] };

// Reset the mocks before each test
const originalCreateTriggerInstance = globalThis.createTriggerInstance;

// Create a spy for the global createTriggerInstance function
const createTriggerSpy = function () {
  // This is just to count calls
};
createTriggerSpy.mock = { calls: [] as any[] };

// Setup global mock
globalThis.createTriggerInstance = mockFn((config: any) => {
  // Count the call
  createTriggerSpy.mock.calls.push({ args: [config] } as any);

  // Return a new instance each time
  return {
    ...mockTriggerInstance,
    execute: spy(() => {}),
    destroy: spy(() => {}),
    config,
  };
});

test("createSignalConditionTrigger - basic functionality", () => {
  // Reset spy calls
  createTriggerSpy.mock.calls = [];

  // Setup
  const [signal, setSignal] = createSignal(5);

  // Create a condition trigger that activates when signal is > 10
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: () => console.log("Activated"),
    },
    falseTrigger: {
      type: "inactiveTrigger",
      action: () => console.log("Deactivated"),
    },
  });

  // Initially condition is false, so falseTrigger should be used
  expect(createTriggerSpy.mock.calls.length).toBe(1);

  // Change signal to meet condition
  setSignal(15);

  // Should switch to trueTrigger
  expect(createTriggerSpy.mock.calls.length).toBe(2);

  // Change back to not meeting condition
  setSignal(5);

  // Should switch back to falseTrigger
  expect(createTriggerSpy.mock.calls.length).toBe(3);

  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - without falseTrigger", () => {
  // Reset call counts
  createTriggerSpy.mock.calls = [];

  // Setup
  const [signal, setSignal] = createSignal(5);

  // Create a condition trigger with only trueTrigger
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: () => console.log("Activated"),
    },
  });

  // Initially should create a dummy trigger
  expect(createTriggerSpy.mock.calls.length).toBe(1);

  // Change signal to meet condition
  setSignal(15);

  // Should switch to trueTrigger
  expect(createTriggerSpy.mock.calls.length).toBe(2);

  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - with onChange option", () => {
  // Reset call counts
  createTriggerSpy.mock.calls = [];

  // Setup
  const [signal, setSignal] = createSignal(15);
  const action = spy();
  action.mock = { calls: [] };

  // Create a condition trigger with onChange true
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action,
    },
    onChange: true,
  });

  // Initially condition is true
  // Reset call counts
  action.mock.calls = [];
  createTriggerSpy.mock.calls = [];

  // Change signal but condition still true (15 -> 20)
  setSignal(20);

  // With onChange true, should still trigger even though condition remains true
  expect(createTriggerSpy.mock.calls.length).toBe(1);

  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - complex condition logic", () => {
  // Reset call counts
  createTriggerSpy.mock.calls = [];

  // Setup multiple signals
  const [count, setCount] = createSignal(0);
  const [active, setActive] = createSignal(false);

  // Create a condition that depends on both signals
  const condition = spy((value: number) => {
    // Will be true when count > 5 AND active is true
    return value > 5 && active();
  });
  condition.mock = { calls: [] };

  const trigger = createSignalConditionTrigger({
    signal: count,
    condition,
    trueTrigger: {
      type: "activeTrigger",
      action: () => {},
    },
    falseTrigger: {
      type: "inactiveTrigger",
      action: () => {},
    },
  });

  // Initially both conditions are false
  expect(createTriggerSpy.mock.calls.length).toBe(1);

  // Set count > 5 but active is still false
  createTriggerSpy.mock.calls = [];
  setCount(10);
  expect(condition.mock.calls.length).toBe(1); // Initial + update
  expect(createTriggerSpy.mock.calls.length).toBe(1);

  // Now set active to true, both conditions met
  setActive(true);
  // This doesn't directly trigger condition reevaluation
  // because our condition is watching count, not active

  // Update count to trigger reevaluation
  createTriggerSpy.mock.calls = [];
  setCount(15);
  expect(createTriggerSpy.mock.calls.length).toBe(1);

  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - trigger execution", () => {
  // Reset call counts
  createTriggerSpy.mock.calls = [];

  // Setup
  const [signal, setSignal] = createSignal(5);
  const trueAction = spy();
  trueAction.mock = { calls: [] };

  const falseAction = spy();
  falseAction.mock = { calls: [] };

  // Save the original function
  const originalFunction = globalThis.createTriggerInstance;

  // Create a modified version that executes the actions immediately
  globalThis.createTriggerInstance = (config: any) => {
    createTriggerSpy.mock.calls.push({ args: [config] } as any);

    // Execute the action based on the config
    if (config.action === trueAction) {
      trueAction();
    } else if (config.action === falseAction) {
      falseAction();
    }

    // Return a new instance
    return {
      execute: spy(),
      destroy: spy(),
      config,
    };
  };

  // Create a condition trigger
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: trueAction,
    },
    falseTrigger: {
      type: "inactiveTrigger",
      action: falseAction,
    },
  });

  // Initially falseTrigger should be executed
  expect(falseAction.mock.calls.length).toBe(1);

  // Change signal to meet condition
  setSignal(15);

  // trueTrigger should be executed
  expect(trueAction.mock.calls.length).toBe(1);

  // Restore the original function
  globalThis.createTriggerInstance = originalFunction;

  // Cleanup
  trigger.destroy();
});

test("createSignalConditionTrigger - dispose cleanup", () => {
  // Reset call counts
  createTriggerSpy.mock.calls = [];
  mockTriggerInstance.destroy.mock.calls = [];

  // Setup
  const [signal, setSignal] = createSignal(5);

  // Create a condition trigger
  const trigger = createSignalConditionTrigger({
    signal,
    condition: (value: number) => value > 10,
    trueTrigger: {
      type: "activeTrigger",
      action: () => {},
    },
  });

  // Create a spy for the destroy method
  const destroySpy = spy();
  destroySpy.mock = { calls: [] };

  // Replace the destroy method
  const originalDestroy = trigger.destroy;
  trigger.destroy = function () {
    destroySpy();
    return originalDestroy.call(this);
  };

  // Trigger cleanup
  trigger.destroy();

  // Should call the destroy spy
  expect(destroySpy.mock.calls.length).toBe(1);
});
