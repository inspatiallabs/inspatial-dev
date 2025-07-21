/**
 * InSpatial Container System - Container Connection Adapter
 *
 * This file implements a container-specific adapter for the WebSocket
 * connection manager, providing container-specific message handling
 * and integration with the container system.
 */

import { WebSocketConnectionManager } from "./connection-manager.ts";
import { MessagePriority } from "./connection-types.ts";
import type { ContainerConfig, SecurityContext } from "../shared/types.ts";

/**
 * Container message types
 */
export enum ContainerMessageType {
  STATE_SYNC = "state_sync",
  STATE_UPDATE = "state_update",
  COMMAND_EXECUTE = "command_execute",
  COMMAND_RESULT = "command_result",
  CONTAINER_EVENT = "container_event",
  CONTAINER_CREATED = "container_created",
  CONTAINER_STARTED = "container_started",
  CONTAINER_SUSPENDED = "container_suspended",
  CONTAINER_RESUMED = "container_resumed",
  CONTAINER_TERMINATED = "container_terminated",
  AUTHENTICATION = "authentication",
  ERROR = "error"
}

/**
 * Container connection adapter options
 */
interface ContainerConnectionOptions {
  url: string;
  securityContext: SecurityContext;
  protocols?: string[];
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
}

/**
 * Container-specific adapter for WebSocket connections
 * 
 * This class adapts the WebSocketConnectionManager to provide
 * container-specific functionality and message handling.
 */
export class ContainerConnectionAdapter {
  private connection: WebSocketConnectionManager;
  private securityContext: SecurityContext;
  private authenticated: boolean = false;
  private containers: Set<string> = new Set();
  private pendingCommands: Map<string, (result: any) => void> = new Map();
  private eventListeners: Map<string, Set<(event: any) => void>> = new Map();
  
  /**
   * Creates a new container connection adapter
   */
  constructor(options: ContainerConnectionOptions) {
    this.securityContext = options.securityContext;
    
    // Create WebSocket connection manager
    this.connection = new WebSocketConnectionManager({
      url: options.url,
      protocols: options.protocols,
      reconnectDelay: options.reconnectDelay,
      maxReconnectDelay: options.maxReconnectDelay,
      reconnectAttempts: options.reconnectAttempts,
      heartbeatInterval: options.heartbeatInterval,
      messageTimeout: options.messageTimeout,
      // No auth token yet, will authenticate after connection
    });
    
    // Set up event handlers
    this.setupEventHandlers();
  }
  
  /**
   * Connects to the container server
   */
  async connect(): Promise<boolean> {
    // Connect to server
    const connected = await this.connection.connect();
    
    if (connected) {
      // Authenticate with server
      return this.authenticate();
    }
    
    return false;
  }
  
  /**
   * Disconnects from the container server
   */
  disconnect(): void {
    this.connection.disconnect();
    this.authenticated = false;
  }
  
  /**
   * Checks if connected to the container server
   */
  isConnected(): boolean {
    return this.connection.isConnected() && this.authenticated;
  }
  
  /**
   * Sends a state update for a container
   */
  async sendStateUpdate(
    containerId: string,
    stateId: string,
    version: number,
    patch: Record<string, unknown>
  ): Promise<boolean> {
    // Ensure we're connected and authenticated
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        return false;
      }
    }
    
    // Send state update message
    await this.connection.sendMessage({
      type: ContainerMessageType.STATE_UPDATE,
      containerId,
      stateId,
      version,
      patch
    }, MessagePriority.NORMAL);
    
    return true;
  }
  
  /**
   * Executes a command on a remote container
   */
  async executeCommand(
    containerId: string,
    command: string,
    args: string[] = []
  ): Promise<any> {
    // Ensure we're connected and authenticated
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error("Not connected to container server");
      }
    }
    
    // Create a unique command ID
    const commandId = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a promise that will resolve when we get the command result
    const resultPromise = new Promise((resolve, reject) => {
      // Set timeout for command execution
      const timeout = setTimeout(() => {
        this.pendingCommands.delete(commandId);
        reject(new Error("Command execution timed out"));
      }, 30000);
      
      // Store resolver
      this.pendingCommands.set(commandId, (result) => {
        clearTimeout(timeout);
        
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      });
    });
    
    // Send command execution message
    await this.connection.sendMessage({
      type: ContainerMessageType.COMMAND_EXECUTE,
      containerId,
      commandId,
      command,
      args
    }, MessagePriority.HIGH);
    
    // Wait for result
    return resultPromise;
  }
  
  /**
   * Adds an event listener for container events
   */
  addEventListener(eventType: string, listener: (event: any) => void): () => void {
    // Get or create listener set
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    listeners.add(listener);
    
    // Return function to remove listener
    return () => {
      if (this.eventListeners.has(eventType)) {
        this.eventListeners.get(eventType)!.delete(listener);
      }
    };
  }
  
  /**
   * Registers a container with the adapter
   */
  registerContainer(containerId: string): void {
    this.containers.add(containerId);
  }
  
  /**
   * Unregisters a container from the adapter
   */
  unregisterContainer(containerId: string): void {
    this.containers.delete(containerId);
  }
  
  /**
   * Sets up event handlers for the connection
   */
  private setupEventHandlers(): void {
    // Connected event
    this.connection.addEventListener("connected", async () => {
      // Authenticate when connected
      if (!this.authenticated) {
        await this.authenticate();
      }
      
      // Re-emit connected event
      this.emitEvent("connected", {});
    });
    
    // Disconnected event
    this.connection.addEventListener("disconnected", (event: { reason?: string; code?: number }) => {
      this.authenticated = false;
      
      // Re-emit disconnected event
      this.emitEvent("disconnected", event);
    });
    
    // Message event
    this.connection.addEventListener("message", (event: { message: any }) => {
      this.handleMessage(event.message);
    });
    
    // Error event
    this.connection.addEventListener("error", (event: { error: any }) => {
      // Re-emit error event
      this.emitEvent("error", event);
    });
  }
  
  /**
   * Handles an incoming message
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case ContainerMessageType.AUTHENTICATION:
        this.handleAuthenticationResponse(message);
        break;
        
      case ContainerMessageType.COMMAND_RESULT:
        this.handleCommandResult(message);
        break;
        
      case ContainerMessageType.CONTAINER_EVENT:
        this.handleContainerEvent(message);
        break;
        
      case ContainerMessageType.STATE_UPDATE:
        this.handleStateUpdate(message);
        break;
        
      case ContainerMessageType.ERROR:
        this.handleErrorMessage(message);
        break;
        
      default:
        // Re-emit message event for unknown message types
        this.emitEvent("message", { message });
        break;
    }
  }
  
  /**
   * Handles an authentication response message
   */
  private handleAuthenticationResponse(message: any): void {
    if (message.success) {
      this.authenticated = true;
      this.emitEvent("authenticated", {});
    } else {
      this.authenticated = false;
      this.emitEvent("authentication_failed", { reason: message.reason });
    }
  }
  
  /**
   * Handles a command result message
   */
  private handleCommandResult(message: any): void {
    const { commandId, result } = message;
    
    // Resolve the pending command
    if (this.pendingCommands.has(commandId)) {
      const resolve = this.pendingCommands.get(commandId)!;
      this.pendingCommands.delete(commandId);
      resolve(result);
    }
  }
  
  /**
   * Handles a container event message
   */
  private handleContainerEvent(message: any): void {
    const { containerId, event } = message;
    
    // Check if we're tracking this container
    if (this.containers.has(containerId)) {
      // Emit container event
      this.emitEvent("container_event", { containerId, event });
      
      // Emit specific event
      if (event.type) {
        this.emitEvent(event.type, { containerId, event });
      }
    }
  }
  
  /**
   * Handles a state update message
   */
  private handleStateUpdate(message: any): void {
    const { containerId, stateId, version, patch } = message;
    
    // Check if we're tracking this container
    if (this.containers.has(containerId)) {
      // Emit state update event
      this.emitEvent("state_update", { containerId, stateId, version, patch });
    }
  }
  
  /**
   * Handles an error message
   */
  private handleErrorMessage(message: any): void {
    this.emitEvent("server_error", { 
      error: message.error,
      code: message.code,
      containerId: message.containerId
    });
  }
  
  /**
   * Authenticates with the container server
   */
  private async authenticate(): Promise<boolean> {
    try {
      // Send authentication message
      const messageId = await this.connection.sendMessage({
        type: ContainerMessageType.AUTHENTICATION,
        userId: this.securityContext.userId,
        permissions: this.securityContext.permissions,
        securityTokens: this.securityContext.securityTokens
      }, MessagePriority.CRITICAL);
      
      // Wait for authentication response
      return new Promise((resolve) => {
        // Set a timeout for authentication
        const timeout = setTimeout(() => {
          this.authenticated = false;
          resolve(false);
        }, 10000);
        
        // Set up event listener for authentication
        const removeListener = this.addEventListener("authenticated", () => {
          clearTimeout(timeout);
          removeListener();
          resolve(true);
        });
        
        // Set up event listener for authentication failure
        const removeFailListener = this.addEventListener("authentication_failed", () => {
          clearTimeout(timeout);
          removeFailListener();
          resolve(false);
        });
      });
    } catch (error) {
      console.error("Authentication error:", error);
      this.authenticated = false;
      return false;
    }
  }
  
  /**
   * Emits an event to all registered listeners
   */
  private emitEvent(event: string, data: any): void {
    // Call specific event listeners
    if (this.eventListeners.has(event)) {
      for (const listener of Array.from(this.eventListeners.get(event)!)) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      }
    }
    
    // Call wildcard listeners
    if (this.eventListeners.has("*")) {
      for (const listener of Array.from(this.eventListeners.get("*")!)) {
        try {
          listener({ ...data, event });
        } catch (error) {
          console.error(`Error in wildcard event listener for "${event}":`, error);
        }
      }
    }
  }
} 