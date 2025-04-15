/**
 * Tests for WebSocket Connection Manager
 */

import { test, expect } from "@inspatial/test";
import { spy } from "../../../test/src/mock/mock.ts";
import { WebSocketConnectionManager } from "./connection-manager.ts";
import { MessagePriority } from "./connection-types.ts";

// Create a mock WebSocket class for testing
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  readyState = MockWebSocket.CONNECTING;
  binaryType: BinaryType = "arraybuffer";
  url: string;
  protocols?: string[];
  
  onopen: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  
  sentMessages: any[] = [];
  private timeoutIds: number[] = [];
  
  constructor(url: string, protocols?: string[]) {
    this.url = url;
    this.protocols = protocols;
    
    // Simulate connection after 10ms
    const timeoutId = setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen({ type: "open" });
      }
    }, 10) as unknown as number;
    
    this.timeoutIds.push(timeoutId);
  }
  
  send(data: string | ArrayBuffer): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error("WebSocket not open");
    }
    
    this.sentMessages.push(data);
  }
  
  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSING;
    
    // Simulate closing after 10ms
    const timeoutId = setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose({ 
          type: "close", 
          code: code || 1000, 
          reason: reason || "", 
          wasClean: true 
        });
      }
    }, 10) as unknown as number;
    
    this.timeoutIds.push(timeoutId);
  }
  
  // Helper to simulate incoming messages
  simulateMessage(data: any): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error("WebSocket not open");
    }
    
    if (this.onmessage) {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      this.onmessage({ 
        type: "message", 
        data: jsonString
      });
    }
  }
  
  // Helper to simulate errors
  simulateError(error: any): void {
    if (this.onerror) {
      this.onerror({ 
        type: "error", 
        error 
      });
    }
  }
  
  // Clean up all timeouts
  cleanup(): void {
    for (const id of this.timeoutIds) {
      clearTimeout(id);
    }
    this.timeoutIds = [];
  }
}

// Set up the test environment
function setupTestEnvironment() {
  // Store original WebSocket
  const originalWebSocket = globalThis.WebSocket;
  const mockSockets: MockWebSocket[] = [];
  
  // Replace with mock and track created instances
  (globalThis as any).WebSocket = function(url: string, protocols?: string[]) {
    const socket = new MockWebSocket(url, protocols);
    mockSockets.push(socket);
    return socket;
  };
  
  // Copy static properties
  (globalThis.WebSocket as any).CONNECTING = MockWebSocket.CONNECTING;
  (globalThis.WebSocket as any).OPEN = MockWebSocket.OPEN;
  (globalThis.WebSocket as any).CLOSING = MockWebSocket.CLOSING;
  (globalThis.WebSocket as any).CLOSED = MockWebSocket.CLOSED;
  
  return {
    restore: () => {
      // Clean up all mock sockets
      for (const socket of mockSockets) {
        socket.cleanup();
      }
      (globalThis as any).WebSocket = originalWebSocket;
    }
  };
}

test("WebSocketConnectionManager can connect and disconnect", async () => {
  const testEnv = setupTestEnvironment();
  
  try {
    // Create connection manager
    const connectionManager = new WebSocketConnectionManager({
      url: "wss://test.example.com/socket",
      reconnectDelay: 100,
      heartbeatInterval: 1000,
      messageTimeout: 500
    });
    
    // Add event listener for connected event
    const connectedHandler = spy();
    connectionManager.addEventListener("connected", connectedHandler);
    
    // Connect
    const connected = await connectionManager.connect();
    
    // Verify connection was successful
    expect(connected).toBe(true);
    expect(connectedHandler.calls.length).toBe(1);
    expect(connectionManager.isConnected()).toBe(true);
    
    // Add event listener for disconnected event
    const disconnectedHandler = spy();
    connectionManager.addEventListener("disconnected", disconnectedHandler);
    
    // Disconnect
    connectionManager.disconnect();
    
    // Verify disconnection
    expect(connectionManager.isConnected()).toBe(false);
    expect(disconnectedHandler.calls.length).toBe(1);
    
    // Short delay to ensure all events have processed
    await new Promise(resolve => setTimeout(resolve, 20));
  } finally {
    testEnv.restore();
  }
});

test("WebSocketConnectionManager can send and receive messages", async () => {
  const testEnv = setupTestEnvironment();
  
  try {
    // Create connection manager
    const connectionManager = new WebSocketConnectionManager({
      url: "wss://test.example.com/socket",
      reconnectDelay: 100
    });
    
    // Set up message handler
    const messageHandler = spy();
    connectionManager.addEventListener("message", messageHandler);
    
    // Connect
    await connectionManager.connect();
    
    // Send a message
    const messageId = await connectionManager.sendMessage({
      type: "test_message",
      data: { hello: "world" }
    });
    
    // Get the WebSocket instance
    const wsInstance = (connectionManager as any).ws as MockWebSocket;
    
    // Verify message was sent
    expect(wsInstance.sentMessages.length).toBe(1);
    const sentMessage = JSON.parse(wsInstance.sentMessages[0] as string);
    expect(sentMessage.payload.type).toBe("test_message");
    expect(sentMessage.payload.data.hello).toBe("world");
    
    // Simulate receiving a message
    wsInstance.simulateMessage({
      id: "server-123",
      type: "response",
      data: { status: "success" }
    });
    
    // Verify message was received
    expect(messageHandler.calls.length).toBe(1);
    expect(messageHandler.calls[0].args[0].message.type).toBe("response");
    
    // Simulate acknowledgement
    wsInstance.simulateMessage({
      type: "ack",
      id: messageId
    });
    
    // Short delay to ensure all events have processed
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Disconnect to clean up
    connectionManager.disconnect();
  } finally {
    testEnv.restore();
  }
});

test("WebSocketConnectionManager handles reconnection", async () => {
  const testEnv = setupTestEnvironment();
  
  try {
    // Create connection manager with short reconnect delay
    const connectionManager = new WebSocketConnectionManager({
      url: "wss://test.example.com/socket",
      reconnectDelay: 50,
      reconnectAttempts: 3
    });
    
    // Add event listeners
    const connectedHandler = spy();
    const disconnectedHandler = spy();
    const reconnectingHandler = spy();
    
    connectionManager.addEventListener("connected", connectedHandler);
    connectionManager.addEventListener("disconnected", disconnectedHandler);
    connectionManager.addEventListener("reconnecting", reconnectingHandler);
    
    // Connect
    await connectionManager.connect();
    
    // Get the WebSocket instance
    const wsInstance = (connectionManager as any).ws as MockWebSocket;
    
    // Simulate connection loss
    wsInstance.close(1006, "Connection lost");
    
    // Give time for reconnection attempt
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify reconnection attempt was made
    expect(reconnectingHandler.calls.length).toBeGreaterThan(0);
    expect(disconnectedHandler.calls.length).toBe(1);
    
    // After reconnection attempt, should be connected again
    // Since our mock automatically connects
    expect(connectedHandler.calls.length).toBe(2);  // Initial + reconnect
    
    // Clean up
    connectionManager.disconnect();
    
    // Short delay to ensure all events have processed
    await new Promise(resolve => setTimeout(resolve, 20));
  } finally {
    testEnv.restore();
  }
});

test("WebSocketConnectionManager handles message timeouts", async () => {
  const testEnv = setupTestEnvironment();
  
  try {
    // Create connection manager with very short timeouts to ensure the test runs quickly
    const connectionManager = new WebSocketConnectionManager({
      url: "wss://test.example.com/socket",
      messageTimeout: 20  // Even shorter timeout for testing
    });
    
    // Add event listeners
    const timeoutHandler = spy();
    connectionManager.addEventListener("message_timeout", timeoutHandler);
    
    // Connect
    await connectionManager.connect();
    
    // Send message that will timeout
    const messageId = await connectionManager.sendMessage({
      type: "test_message",
      data: "This will timeout"
    }, MessagePriority.NORMAL);
    
    // Wait long enough for the timeout to occur
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify timeout handler was called at least once
    // Note: It may be called multiple times due to retries
    expect(timeoutHandler.calls.length).toBeGreaterThan(0);
    
    // Check that the message ID in the timeout event matches our sent message
    if (timeoutHandler.calls.length > 0) {
      expect(timeoutHandler.calls[0].args[0].messageId).toBe(messageId);
    }
    
    // Clean up
    connectionManager.disconnect();
    
    // Short delay to ensure all events have processed
    await new Promise(resolve => setTimeout(resolve, 20));
  } finally {
    testEnv.restore();
  }
}); 