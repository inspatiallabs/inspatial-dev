/**
 * Tests for differential state synchronization
 */

import { test, expect } from "@inspatial/test";
import { spy } from "../../../test/src/mock/mock.ts";
import { DifferentialStateSynchronizer } from "./differential-sync.ts";

test("DifferentialStateSynchronizer can initialize sync for a container", async () => {
  // Create a mock connection manager
  const mockConnectionManager = {
    sendMessage: spy(),
    addEventListener: spy(),
  };

  // Create synchronizer
  const synchronizer = new DifferentialStateSynchronizer(mockConnectionManager);

  // Initialize sync for a container
  const containerId = "test-container-123";
  await synchronizer.initializeSync(containerId);

  // Verify state is initialized (indirectly by checking we can get state)
  const state = await synchronizer
    .getState(containerId, "test-state")
    .catch(() => null);
  expect(state).toBe(null); // Should throw because state doesn't exist yet
});

test("DifferentialStateSynchronizer can update and retrieve state", async () => {
  // Create a mock connection manager
  const mockConnectionManager = {
    sendMessage: spy(),
    addEventListener: spy(),
  };

  // Create synchronizer
  const synchronizer = new DifferentialStateSynchronizer(mockConnectionManager);

  try {
    // Initialize sync for a container
    const containerId = "test-container-123";
    await synchronizer.initializeSync(containerId);

    // Update state
    const stateId = "test-state";
    const stateValue = {
      counter: 1,
      message: "Hello World",
      nested: {
        value: true,
      },
    };

    const updateResult = await synchronizer.updateState(
      containerId,
      stateId,
      stateValue
    );
    expect(updateResult).toBe(true);

    // Retrieve state
    const retrievedState = await synchronizer.getState(containerId, stateId);
    expect(retrievedState).toEqual(stateValue);

    // Update state again with a patch
    const statePatch = {
      counter: 2,
      nested: {
        value: false,
        newValue: "added",
      },
    };

    await synchronizer.updateState(containerId, stateId, statePatch);

    // Retrieve updated state
    const updatedState = await synchronizer.getState(containerId, stateId);
    expect(updatedState).toEqual({
      counter: 2, // Updated
      message: "Hello World", // Unchanged
      nested: {
        value: false, // Updated
        newValue: "added", // Added
      },
    });
  } finally {
    // Clean up to prevent timer leaks
    await synchronizer.terminateSync("test-container-123");
  }
});

test("DifferentialStateSynchronizer can resolve conflicts", async () => {
  // Create a mock connection manager
  const mockConnectionManager = {
    sendMessage: spy(),
    addEventListener: spy(),
  };

  // Create synchronizer
  const synchronizer = new DifferentialStateSynchronizer(mockConnectionManager);

  try {
    // Initialize sync for a container
    const containerId = "test-container-123";
    await synchronizer.initializeSync(containerId);

    // Set initial state
    const stateId = "conflict-state";
    const initialState = { value: 1, name: "initial" };

    await synchronizer.updateState(containerId, stateId, initialState);

    // Resolve conflict with explicit state
    const manualResolution = { value: 100, name: "resolved", extra: true };
    await synchronizer.resolveConflict(containerId, stateId, manualResolution);

    // Verify state was updated
    const resolvedState = await synchronizer.getState(containerId, stateId);
    expect(resolvedState).toEqual(manualResolution);
  } finally {
    // Clean up to prevent timer leaks
    await synchronizer.terminateSync("test-container-123");
  }
});

test("DifferentialStateSynchronizer can terminate sync", async () => {
  // Create a mock connection manager
  const mockConnectionManager = {
    sendMessage: spy(),
    addEventListener: spy(),
  };

  // Create synchronizer
  const synchronizer = new DifferentialStateSynchronizer(mockConnectionManager);

  // Initialize sync for a container
  const containerId = "test-container-123";
  await synchronizer.initializeSync(containerId);

  // Set some state
  const stateId = "test-state";
  await synchronizer.updateState(containerId, stateId, { value: 42 });

  // Terminate sync
  await synchronizer.terminateSync(containerId);

  // Verify state is removed (should throw when trying to access)
  try {
    await synchronizer.getState(containerId, stateId);
    // Should not reach here
    expect(true).toBe(false);
  } catch (error: unknown) {
    expect((error as Error).message).toContain("not found");
  }
});

test("DifferentialStateSynchronizer can handle reconnection", async () => {
  // Create a mock connection manager with reconnect capability
  const mockConnectionManager = {
    sendMessage: spy(),
    addEventListener: spy(),
    events: {} as Record<string, Function>,
    // Simple event emitter implementation
    emit(event: string, ...args: any[]) {
      const handler = this.events[event];
      if (handler) handler(...args);
    },
  };

  // Override addEventListener to capture the handler
  mockConnectionManager.addEventListener = spy(
    (event: string, handler: Function) => {
      mockConnectionManager.events[event] = handler;
      return undefined;
    }
  );

  // Create synchronizer
  const synchronizer = new DifferentialStateSynchronizer(mockConnectionManager);

  try {
    // Initialize sync for a container
    const containerId = "test-container-123";
    await synchronizer.initializeSync(containerId);

    // Update some state
    await synchronizer.updateState(containerId, "state1", { value: 1 });
    await synchronizer.updateState(containerId, "state2", { value: 2 });

    // Mock a disconnection and reconnection
    mockConnectionManager.emit("disconnected");
    mockConnectionManager.emit("connected");
    
    // Small delay to allow any pending timers to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    // Verify sync messages were sent on reconnection
    expect(mockConnectionManager.sendMessage.calls.length).toBeGreaterThan(0);
  } finally {
    // Clean up to prevent timer leaks
    await synchronizer.terminateSync("test-container-123");
    
    // Wait for any remaining timers to clean up
    await new Promise(resolve => setTimeout(resolve, 150));
  }
});
