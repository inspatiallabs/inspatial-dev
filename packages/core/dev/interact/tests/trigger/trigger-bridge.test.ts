/**
 * # Trigger Bridge Tests
 * @file trigger-bridge.test.ts
 * @description Tests for the trigger bridge system
 * 
 * These tests verify the correct behavior of the trigger bridge system, which acts as the
 * event propagation mechanism between different platforms.
 */

import { describe, it, expect, beforeEach, afterEach } from "@inspatial/test";

import { 
  TriggerBridge, 
  initTriggerBridge,
  initTriggerSystem
} from "../../trigger/src/index.ts";

// Mock adapter for testing
class MockAdapterClass {
  platformType = "mock" as const;
  messages: any[] = [];
  connected: Record<string, Set<string>> = {};
  bridge: any = null;

  setBridge(bridge: any): void {
    this.bridge = bridge;
  }

  connectNode(nodeId: string, eventName: string): void {
    if (!this.connected[nodeId]) {
      this.connected[nodeId] = new Set();
    }
    this.connected[nodeId].add(eventName);
  }

  disconnectNode(nodeId: string, eventName: string): void {
    if (this.connected[nodeId]) {
      this.connected[nodeId].delete(eventName);
    }
  }

  async handleMessage(message: any, mappedEventName: string): Promise<void> {
    this.messages.push({
      original: message,
      mappedName: mappedEventName
    });
  }

  // Helper method to simulate an event
  simulateEvent(nodeId: string, eventName: string, data: any = {}): void {
    if (!this.bridge) return;
    
    this.bridge.dispatchEvent(
      this.platformType,
      nodeId,
      eventName,
      {
        timestamp: Date.now(),
        ...data
      }
    );
  }
}

describe("Trigger Bridge", () => {
  let mockAdapter: MockAdapterClass;
  let bridge: any;

  beforeEach(() => {
    mockAdapter = new MockAdapterClass();
    bridge = initTriggerBridge(false, false, null);
    bridge.registerTriggerExtension(mockAdapter);
  });
  
  afterEach(() => {
    // Reset adapter and bridge
    mockAdapter.messages = [];
    mockAdapter.connected = {};
    mockAdapter.bridge = null;
    bridge = null;
  });
  
  describe("Event Registration and Dispatch", () => {
    it("should register an event handler", () => {
      // Arrange
      const nodeId = "test-node-1";
      const eventName = "test-event";
      let eventReceived = false;
      
      // Act
      bridge.registerEventHandler(
        "mock", 
        nodeId, 
        eventName, 
        () => { eventReceived = true; }
      );
      
      // Assert
      expect(mockAdapter.connected[nodeId]).toBeDefined();
      expect(mockAdapter.connected[nodeId].has(eventName)).toBe(true);
    });
    
    it("should dispatch an event and call the handler", () => {
      // Arrange
      const nodeId = "test-node-2";
      const eventName = "test-event";
      let eventData: any = null;
      
      // Register handler
      bridge.registerEventHandler(
        "mock", 
        nodeId, 
        eventName, 
        (data: any) => { eventData = data; }
      );
      
      // Act
      mockAdapter.simulateEvent(nodeId, eventName, { value: 42 });
      
      // Assert
      expect(eventData).toBeDefined();
      expect(eventData.value).toBe(42);
    });
    
    it("should unregister an event handler", () => {
      // Arrange
      const nodeId = "test-node-3";
      const eventName = "test-event";
      let eventCount = 0;
      
      // Register handler
      bridge.registerEventHandler(
        "mock", 
        nodeId, 
        eventName, 
        () => { eventCount++; }
      );
      
      // Verify registration
      mockAdapter.simulateEvent(nodeId, eventName);
      expect(eventCount).toBe(1);
      
      // Act - Unregister
      bridge.unregisterEventHandler("mock", nodeId, eventName);
      
      // Try to trigger again
      mockAdapter.simulateEvent(nodeId, eventName);
      
      // Assert
      expect(eventCount).toBe(1); // Still 1, not increased
      expect(mockAdapter.connected[nodeId].has(eventName)).toBe(false);
    });
  });
  
  describe("Event Mapping", () => {
    it("should map events between different names", () => {
      // Arrange
      const nodeId = "test-node-4";
      const sourceEvent = "source-event";
      const targetEvent = "target-event";
      let receivedEvent = "";
      
      // Register handler for target event
      bridge.registerEventHandler(
        "mock", 
        nodeId, 
        targetEvent,
        (data: any) => { receivedEvent = data.original; }
      );
      
      // Set up mapping
      bridge.setEventMapping("mock", "mock", sourceEvent, targetEvent);
      
      // Act
      mockAdapter.simulateEvent(nodeId, sourceEvent, { original: sourceEvent });
      
      // Assert
      expect(receivedEvent).toBe(sourceEvent);
    });
    
    it("should transform event data during mapping if provided", () => {
      // Arrange
      const nodeId = "test-node-5";
      const sourceEvent = "transform-source";
      const targetEvent = "transform-target";
      let receivedData: any = null;
      
      // Register handler for target event
      bridge.registerEventHandler(
        "mock", 
        nodeId, 
        targetEvent,
        (data: any) => { receivedData = data; }
      );
      
      // Set up mapping with transformation
      // @ts-ignore: We know transform is supported
      bridge.setEventMapping("mock", "mock", sourceEvent, targetEvent, (data: any) => {
        return {
          ...data,
          value: data.value * 2,
          transformed: true
        };
      });
      
      // Act
      mockAdapter.simulateEvent(nodeId, sourceEvent, { value: 10 });
      
      // Assert
      expect(receivedData).toBeDefined();
      expect(receivedData.value).toBe(20); // Doubled
      expect(receivedData.transformed).toBe(true);
    });
  });
  
  describe("System Integration", () => {
    it("should initialize all components in a full trigger system", () => {
      // Arrange
      // Reset adapter for this test
      mockAdapter = new MockAdapterClass();
      
      // Act - Initialize the full system
      const system = initTriggerSystem({
        domAdapter: false,
        nativeAdapter: false,
        config: {
          adapters: {
            mock: mockAdapter
          }
        }
      });
      
      // Assert
      expect(system).toBeDefined();
      expect(system.bridge).toBeDefined();
      expect(system.createTrigger).toBeDefined();
      expect(system.triggerRegistry).toBeDefined();
      expect(system.triggerCategories).toBeDefined();
      
      // Check if our mock adapter was registered
      expect(system.bridge.getAdapter("mock")).toBeDefined();
    });
  });
  
  describe("Error Handling", () => {
    it("should handle errors in event handlers", () => {
      // Arrange
      const nodeId = "test-node-6";
      const eventName = "error-event";
      let errorOccurred = false;
      
      // Register a handler that throws
      bridge.registerEventHandler(
        "mock", 
        nodeId, 
        eventName, 
        () => {
          throw new Error("Test error");
        }
      );
      
      try {
        // Act
        mockAdapter.simulateEvent(nodeId, eventName);
      } catch (e) {
        errorOccurred = true;
      }
      
      // Assert - System should continue working
      expect(errorOccurred).toBe(false); // The error should be caught
      
      // Register a new handler to verify the system still works
      let newHandlerCalled = false;
      bridge.registerEventHandler(
        "mock", 
        nodeId, 
        "new-event", 
        () => { newHandlerCalled = true; }
      );
      mockAdapter.simulateEvent(nodeId, "new-event");
      
      expect(newHandlerCalled).toBe(true);
    });
  });
}); 