/**
 * @file Basic tests for createTriggerSignal function
 * @module @in/teract/test/signal-trigger
 */

import { test, expect } from "@inspatial/test";
import { createTriggerSignal } from "../../state/signal-trigger.ts";

// Track destroy calls
let destroyCalls = 0;

// Create a very simple mock trigger instance
const mockTriggerInstance = {
  destroy: () => { 
    destroyCalls++; 
  },
  fire: () => {}
};

// Create a simple mock trigger
const mockTrigger = {
  name: "testTrigger"
};

// Mock getRegisteredTrigger implementation
const getRegisteredTriggerMock = (name: string) => {
  if (name === "testTrigger") {
    return mockTrigger;
  }
  return null;
};

// Captured handler from trigger instance creation
let capturedHandler: Function | null = null;

// Simple mock functions for tests
const makeMockCreateTriggerInstance = () => (config: any) => {
  capturedHandler = config.action;
  return mockTriggerInstance;
};

test("createTriggerSignal - basic functionality", () => {
  // Reset tracking
  destroyCalls = 0;
  capturedHandler = null;
  
  // Setup
  const [value, setValue, controls] = createTriggerSignal(
    { count: 0 }, 
    { trigger: "testTrigger" },
    { 
      getRegisteredTrigger: getRegisteredTriggerMock,
      createTriggerInstance: makeMockCreateTriggerInstance()
    }
  );
  
  // Initial value should match
  expect(value().count).toBe(0);
  
  // Handler should be captured
  expect(!!capturedHandler).toBe(true);
  
  // Trigger event should update the signal
  if (capturedHandler) {
    capturedHandler({ count: 5 });
  }
  
  // Value should update
  expect(value().count).toBe(5);
  
  // Cleanup should work
  controls.disconnect();
  expect(destroyCalls).toBe(1);
});

test("createTriggerSignal - setter works", () => {
  // Reset tracking
  destroyCalls = 0;
  capturedHandler = null;
  
  // Setup
  const [value, setValue, controls] = createTriggerSignal(
    0, 
    { trigger: "testTrigger" },
    { 
      getRegisteredTrigger: getRegisteredTriggerMock,
      createTriggerInstance: makeMockCreateTriggerInstance()
    }
  );
  
  // Setter should work
  setValue(10);
  expect(value()).toBe(10);
  
  // Disconnecting should prevent trigger from affecting value
  controls.disconnect();
  if (capturedHandler) {
    capturedHandler(20);
  }
  expect(value()).toBe(10); // Stays at 10, not updated to 20
});

test("createTriggerSignal - basic transform test", () => {
  // Reset tracking
  destroyCalls = 0;
  capturedHandler = null;
  
  // Setup with a number value and a simple transform
  const initialValue = 0;
  const [value, setValue] = createTriggerSignal(
    initialValue,
    {
      trigger: "testTrigger",
      transform: () => 42 // Always transform to 42
    },
    {
      getRegisteredTrigger: getRegisteredTriggerMock,
      createTriggerInstance: makeMockCreateTriggerInstance()
    }
  );
  
  // Initial value
  expect(value()).toBe(0);
  
  // Trigger with any data
  if (capturedHandler) {
    capturedHandler("doesn't matter");
  }
  
  // Value should be transformed to 42
  expect(value()).toBe(42);
});

test("createTriggerSignal - basic condition test", () => {
  // Reset tracking
  destroyCalls = 0;
  capturedHandler = null;
  
  // Setup with a simple condition function
  const [value] = createTriggerSignal(
    0,
    {
      trigger: "testTrigger",
      // Simple condition that just checks if the first param is true
      condition: (params) => params[0] === true
    },
    {
      getRegisteredTrigger: getRegisteredTriggerMock,
      createTriggerInstance: makeMockCreateTriggerInstance()
    }
  );
  
  // Initial value
  expect(value()).toBe(0);
  
  // Call with condition=false, should not update
  if (capturedHandler) {
    capturedHandler([false]);
  }
  expect(value()).toBe(0); // Still 0
  
  // Call with condition=true, should update
  if (capturedHandler) {
    capturedHandler([true]);
  }
  expect(value()).toBe(true); // Updated to true
});

test("createTriggerSignal - error handling", () => {
  // Create an empty mock that always returns null
  const emptyMock = (name: string) => null;
  
  // Should throw error for non-existent trigger
  let error: Error | null = null;
  try {
    createTriggerSignal(
      0, 
      { trigger: "nonExistentTrigger" },
      { getRegisteredTrigger: emptyMock }
    );
  } catch (e) {
    error = e as Error;
  }
  
  // Check that the error was thrown
  expect(!!error).toBe(true);
  if (error) {
    expect(error.message).toBe('Trigger "nonExistentTrigger" not found');
  }
}); 