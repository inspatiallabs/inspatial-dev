/**
 * @file Comprehensive tests for createTriggerSignal function
 * @module @inspatial/state/test/signal-trigger
 */

import { test, expect, spy, assertSpyCalls, mockSession } from "../../../test/src/index.ts";
import { createTriggerSignal } from "../../core/signal-trigger.ts";
import { createSignal } from "../../signal/src/signals.ts";
import { getRegisteredTrigger } from "../../trigger/src/registry.ts";
import { TriggerManagerClass } from "../../trigger/src/action.ts";

// Mock the trigger system
mockSession();

// Mock the getRegisteredTrigger function
const mockTrigger = {
  name: "testTrigger",
  execute: spy(),
};

// Create a spy for the getRegisteredTrigger function
const getRegisteredTriggerSpy = spy(() => mockTrigger);
// Use type assertion to avoid globalThis index signature error
(globalThis as any).getRegisteredTrigger = getRegisteredTriggerSpy;

test("createTriggerSignal - basic functionality", () => {
  // Setup
  const initialValue = { count: 0 };
  const [value, setValue, controls] = createTriggerSignal(initialValue, {
    trigger: "testTrigger",
  });
  
  // Initial value should match
  const initialValueResult = value();
  const initialCountMatches = initialValueResult.count === initialValue.count;
  expect(initialCountMatches).toBe(true);
  
  // Trigger event should update the signal
  const eventData = { count: 5 };
  mockTrigger.execute.mock.calls[0].args[0](eventData);
  
  // Value should update
  const updatedValue = value();
  const updatedCountMatches = updatedValue.count === eventData.count;
  expect(updatedCountMatches).toBe(true);
  
  // Setter should work
  const newValue = { count: 10 };
  setValue(newValue);
  const afterSetValue = value();
  const afterSetCountMatches = afterSetValue.count === newValue.count;
  expect(afterSetCountMatches).toBe(true);
  
  // Cleanup should work
  controls.disconnect();
  
  // After disconnect, trigger should not affect the signal
  mockTrigger.execute.mock.calls[0].args[0]({ count: 15 });
  const finalValue = value();
  const finalCountMatches = finalValue.count === newValue.count;
  expect(finalCountMatches).toBe(true);
});

test("createTriggerSignal - with transform function", () => {
  // Setup
  const initialValue = { x: 0, y: 0 };
  
  // Use a transform function that's not a spy to avoid type issues
  const transformCalls: Array<{ event: any; currentValue: any }> = [];
  const transform = (event: any, currentValue: any) => {
    transformCalls.push({ event, currentValue });
    return { 
      x: event.x + 10, 
      y: event.y + 10 
    };
  };
  
  const [value, setValue, controls] = createTriggerSignal(initialValue, {
    trigger: "testTrigger",
    transform,
  });
  
  // Trigger event should use transform function
  const eventData = { x: 5, y: 5 };
  mockTrigger.execute.mock.calls[0].args[0](eventData);
  
  // Transform should be called
  const transformCalled = transformCalls.length === 1;
  expect(transformCalled).toBe(true);
  
  // Value should be transformed
  const transformedValue = value();
  const xMatches = transformedValue.x === 15;
  expect(xMatches).toBe(true);
  const yMatches = transformedValue.y === 15;
  expect(yMatches).toBe(true);
  
  // Cleanup
  controls.disconnect();
});

test("createTriggerSignal - with condition function", () => {
  // Setup
  const initialValue = 0;
  // Use a custom function instead of a spy for condition to avoid type issues
  const conditionCalls: number[] = [];
  const condition = (event: any, currentValue: any) => {
    conditionCalls.push(event);
    return event > 5; // Only update if event value is greater than 5
  };
  
  const [value, setValue, controls] = createTriggerSignal(initialValue, {
    trigger: "testTrigger",
    condition,
  });
  
  // Trigger event that doesn't meet condition
  mockTrigger.execute.mock.calls[0].args[0](3);
  
  // Condition should be called
  const conditionCalledOnce = conditionCalls.length === 1;
  expect(conditionCalledOnce).toBe(true);
  const firstArgMatches = conditionCalls[0] === 3;
  expect(firstArgMatches).toBe(true);
  
  // Value should not change
  const valueUnchanged = value() === 0;
  expect(valueUnchanged).toBe(true);
  
  // Trigger event that meets condition
  mockTrigger.execute.mock.calls[0].args[0](10);
  
  // Condition should be called again
  const conditionCalledTwice = conditionCalls.length === 2;
  expect(conditionCalledTwice).toBe(true);
  const secondArgMatches = conditionCalls[1] === 10;
  expect(secondArgMatches).toBe(true);
  
  // Value should update
  const valueUpdated = value() === 10;
  expect(valueUpdated).toBe(true);
  
  // Cleanup
  controls.disconnect();
});

test("createTriggerSignal - error handling", () => {
  // Replace the mock function temporarily
  const originalGetRegisteredTrigger = (globalThis as any).getRegisteredTrigger;
  (globalThis as any).getRegisteredTrigger = spy(() => null);
  
  let error: Error | null = null;
  try {
    createTriggerSignal(0, { trigger: "nonExistentTrigger" });
  } catch (e) {
    error = e as Error;
  }
  
  // Check that the error was thrown
  const errorWasThrown = error !== null;
  expect(errorWasThrown).toBe(true);
  if (error) {
    const errorMessageMatches = error.message === 'Trigger "nonExistentTrigger" not found';
    expect(errorMessageMatches).toBe(true);
  }
  
  // Restore the original function
  (globalThis as any).getRegisteredTrigger = originalGetRegisteredTrigger;
});

test("createTriggerSignal - throttle option", () => {
  // Mock timers
  const originalSetTimeout = globalThis.setTimeout;
  const setTimeoutCalls: any[] = [];
  const mockSetTimeout = (fn: Function, delay: number) => {
    setTimeoutCalls.push({ fn, delay });
    // Immediately execute the function instead of waiting
    fn();
    return 1;
  };
  
  // Use type assertion to avoid setTimeout compatibility issues
  (globalThis as any).setTimeout = mockSetTimeout;
  
  // Setup with throttle
  const [value, setValue, controls] = createTriggerSignal(0, {
    trigger: "testTrigger",
    throttle: 100,
  });
  
  // Trigger multiple times in quick succession
  mockTrigger.execute.mock.calls[0].args[0](1);
  mockTrigger.execute.mock.calls[0].args[0](2);
  mockTrigger.execute.mock.calls[0].args[0](3);
  
  // Should use setTimeout
  const setTimeoutCalledOnce = setTimeoutCalls.length === 1;
  expect(setTimeoutCalledOnce).toBe(true);
  
  // Value should only update once with the latest value due to throttling
  const valueMatchesLatest = value() === 3;
  expect(valueMatchesLatest).toBe(true);
  
  // Restore setTimeout
  (globalThis as any).setTimeout = originalSetTimeout;
  
  // Cleanup
  controls.disconnect();
});

test("createTriggerSignal - debounce option", () => {
  // Mock timers
  const originalSetTimeout = globalThis.setTimeout;
  const setTimeoutCalls: any[] = [];
  const mockSetTimeout = (fn: Function, delay: number) => {
    setTimeoutCalls.push({ fn, delay });
    // Immediately execute the function instead of waiting
    fn();
    return 1;
  };
  
  // Use type assertion to avoid setTimeout compatibility issues
  (globalThis as any).setTimeout = mockSetTimeout;
  
  // Setup with debounce
  const [value, setValue, controls] = createTriggerSignal(0, {
    trigger: "testTrigger",
    debounce: 100,
  });
  
  // Trigger multiple times in quick succession
  mockTrigger.execute.mock.calls[0].args[0](1);
  mockTrigger.execute.mock.calls[0].args[0](2);
  mockTrigger.execute.mock.calls[0].args[0](3);
  
  // Should use setTimeout
  const setTimeoutCalledThreeTimes = setTimeoutCalls.length === 3;
  expect(setTimeoutCalledThreeTimes).toBe(true);
  
  // Value should update to the last triggered value
  const valueMatchesLastEvent = value() === 3;
  expect(valueMatchesLastEvent).toBe(true);
  
  // Restore setTimeout
  (globalThis as any).setTimeout = originalSetTimeout;
  
  // Cleanup
  controls.disconnect();
});

test("createTriggerSignal - integration with signal system", () => {
  // Setup
  const [dependency, setDependency] = createSignal("initial");
  
  // Use a regular function instead of a spy to avoid type issues
  const transformCalls: Array<{ event: any[]; currentValue: string }> = [];
  const transform = (event: any[], currentValue: string) => {
    transformCalls.push({ event, currentValue });
    return `${event[0]}-${dependency()}`; // Depend on another signal
  };
  
  const [value, setValue, controls] = createTriggerSignal("start", {
    trigger: "testTrigger",
    transform,
  });
  
  // Trigger with initial dependency value
  mockTrigger.execute.mock.calls[0].args[0]("event");
  const initialValueMatches = value() === "event-initial";
  expect(initialValueMatches).toBe(true);
  
  // Change dependency
  setDependency("updated");
  
  // Trigger again with updated dependency
  mockTrigger.execute.mock.calls[0].args[0]("newEvent");
  const updatedValueMatches = value() === "newEvent-updated";
  expect(updatedValueMatches).toBe(true);
  
  // Cleanup
  controls.disconnect();
}); 