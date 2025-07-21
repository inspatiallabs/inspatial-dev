/**
 * InSpatial Container System - WebSocket Connection Manager
 *
 * This file implements a robust WebSocket connection manager for
 * client-server communication with automatic reconnection,
 * message queueing, and event handling.
 */

import { InConnectionManager } from "../shared/interfaces.ts";
import {
  ConnectionOptions,
  ConnectionState,
  EventListener,
  MessagePriority,
  WebSocketMessage
} from "./connection-types.ts";

/**
 * WebSocket Connection Manager implementation
 * 
 * Handles reliable WebSocket connections between client and server
 * with automatic reconnection, message queueing, and priority delivery.
 */
export class WebSocketConnectionManager implements InConnectionManager {
  private ws: WebSocket | null = null;
  private url: string;
  private protocols?: string[];
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectDelay: number;
  private maxReconnectDelay: number;
  private reconnectAttempts: number;
  private currentAttempt = 0;
  private heartbeatInterval: number;
  private messageTimeout: number;
  private messageQueue: Map<MessagePriority, WebSocketMessage[]> = new Map();
  private sentMessages: Map<string, { message: WebSocketMessage, timeout: number }> = new Map();
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private heartbeatTimer?: number;
  private reconnectTimer?: number;
  private processQueueTimer?: number;
  private authToken?: string;
  private lastMessageId = 0;

  /**
   * Creates a new WebSocket connection manager
   */
  constructor(options: ConnectionOptions) {
    this.url = options.url;
    this.protocols = options.protocols;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.maxReconnectDelay = options.maxReconnectDelay || 30000;
    this.reconnectAttempts = options.reconnectAttempts || Infinity;
    this.heartbeatInterval = options.heartbeatInterval || 15000;
    this.messageTimeout = options.messageTimeout || 10000;
    this.authToken = options.authToken;

    // Initialize message queue for each priority level
    this.messageQueue.set(MessagePriority.CRITICAL, []);
    this.messageQueue.set(MessagePriority.HIGH, []);
    this.messageQueue.set(MessagePriority.NORMAL, []);
    this.messageQueue.set(MessagePriority.LOW, []);
  }

  /**
   * Establishes connection to server or accepts client connection
   * @param endpoint Optional connection endpoint if not specified in constructor
   */
  async connect(endpoint?: string): Promise<boolean> {
    if (endpoint) {
      this.url = endpoint;
    }

    if (this.state === ConnectionState.CONNECTED) {
      return true;
    }

    if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.RECONNECTING) {
      // Wait for connection to establish
      return new Promise((resolve) => {
        const checkConnected = () => {
          if (this.state === ConnectionState.CONNECTED) {
            resolve(true);
          } else if (this.state === ConnectionState.DISCONNECTED) {
            resolve(false);
          } else {
            setTimeout(checkConnected, 100);
          }
        };
        checkConnected();
      });
    }

    // Clear any existing timers
    this.clearTimers();

    // Update state
    this.state = ConnectionState.CONNECTING;
    this.currentAttempt = 0;

    try {
      // Establish connection
      await this.establishConnection();
      return true;
    } catch (error) {
      console.error("Failed to connect:", error);
      this.state = ConnectionState.DISCONNECTED;
      this.emitEvent("error", { error });
      return false;
    }
  }

  /**
   * Disconnects from the WebSocket server
   */
  disconnect(): void {
    this.clearTimers();

    if (this.ws) {
      // Remove all event listeners to prevent reconnection
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;

      // Close the connection
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, "Disconnected by client");
      }
      this.ws = null;
    }

    this.state = ConnectionState.DISCONNECTED;
    this.emitEvent("disconnected", { reason: "client_disconnect" });
  }

  /**
   * Sends a message to the server
   * 
   * @param message The message to send
   * @param priority Message priority
   * @returns Promise that resolves with the message ID when sent
   */
  async sendMessage(message: any, priority: MessagePriority = MessagePriority.NORMAL): Promise<string> {
    // Create WebSocket message
    const wsMessage: WebSocketMessage = {
      id: this.generateMessageId(),
      type: message.type || "message",
      priority,
      payload: message,
      timestamp: Date.now(),
      attempt: 0,
    };

    // If connected, try to send immediately
    if (this.state === ConnectionState.CONNECTED && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage(wsMessage);
    } else {
      // Queue message for later
      this.queueMessage(wsMessage);
      
      // Try to reconnect if disconnected
      if (this.state === ConnectionState.DISCONNECTED) {
        this.reconnect();
      }
    }

    return wsMessage.id;
  }

  /**
   * Adds an event listener
   * 
   * @param event Event type
   * @param listener Event listener function
   * @returns Function to remove the listener
   */
  addEventListener(event: string, listener: EventListener): () => void {
    // Get or create listener set
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    const listeners = this.eventListeners.get(event)!;
    listeners.add(listener);
    
    // Return a function to remove the listener
    return () => {
      if (this.eventListeners.has(event)) {
        this.eventListeners.get(event)!.delete(listener);
      }
    };
  }

  /**
   * Checks if a connection exists to the server
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED &&
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Establishes a WebSocket connection
   */
  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let url = this.url;
        
        // Add auth token if provided
        if (this.authToken) {
          const separator = url.includes('?') ? '&' : '?';
          url = `${url}${separator}token=${encodeURIComponent(this.authToken)}`;
        }
        
        // Create WebSocket
        this.ws = new WebSocket(url, this.protocols);
        
        // Set binary type
        this.ws.binaryType = 'arraybuffer';

        // Set up event handlers
        this.ws.onopen = () => {
          this.state = ConnectionState.CONNECTED;
          this.currentAttempt = 0;
          this.emitEvent("connected", {});
          this.startHeartbeat();
          this.processQueue();
          resolve();
        };

        this.ws.onclose = (event) => {
          if (this.state !== ConnectionState.DISCONNECTED) {
            this.handleDisconnection(event);
          }
          reject(new Error(`Connection closed: ${event.code} ${event.reason}`));
        };

        this.ws.onerror = (event) => {
          this.emitEvent("error", { error: event });
          if (this.state !== ConnectionState.DISCONNECTED) {
            this.handleDisconnection(event);
          }
          reject(new Error("WebSocket error"));
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        this.state = ConnectionState.DISCONNECTED;
        reject(error);
      }
    });
  }

  /**
   * Handles a WebSocket message from the server
   */
  private handleMessage(event: MessageEvent): void {
    try {
      let message;
      
      // Parse message data
      if (typeof event.data === 'string') {
        message = JSON.parse(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        // Handle binary data if needed
        const decoder = new TextDecoder();
        message = JSON.parse(decoder.decode(event.data));
      } else {
        console.warn("Unsupported message format", event.data);
        return;
      }

      // Handle acknowledgements
      if (message.type === 'ack' && message.id) {
        this.handleAcknowledgement(message.id);
        return;
      }
      
      // Handle heartbeat
      if (message.type === 'heartbeat') {
        this.sendMessage({ type: 'heartbeat_ack' }, MessagePriority.CRITICAL);
        return;
      }
      
      // Acknowledge the message
      if (message.id) {
        this.sendAcknowledgement(message.id);
      }
      
      // Emit the message event
      this.emitEvent("message", { message: message.payload || message });
      
      // Emit specific event based on message type
      if (message.type) {
        this.emitEvent(message.type, { message: message.payload || message });
      }
    } catch (error) {
      console.error("Error handling message:", error, event.data);
      this.emitEvent("error", { error, raw: event.data });
    }
  }

  /**
   * Handles a disconnection event
   */
  private handleDisconnection(event: Event | CloseEvent): void {
    // Clear timers
    this.clearTimers();
    
    // Set state
    this.state = ConnectionState.DISCONNECTED;
    this.ws = null;

    // Emit disconnected event
    const reason = (event as CloseEvent).reason || "unknown";
    const code = (event as CloseEvent).code || 0;
    this.emitEvent("disconnected", { reason, code, event });

    // Reconnect automatically
    this.reconnect();
  }

  /**
   * Attempts to reconnect to the server
   */
  private reconnect(): void {
    if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.RECONNECTING) {
      return;
    }

    // Check if we've exceeded the maximum retry attempts
    if (this.currentAttempt >= this.reconnectAttempts) {
      this.emitEvent("max_reconnect_attempts", { attempts: this.currentAttempt });
      return;
    }

    this.state = ConnectionState.RECONNECTING;
    this.currentAttempt++;

    // Calculate backoff delay
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.currentAttempt - 1),
      this.maxReconnectDelay
    );

    // Emit reconnecting event
    this.emitEvent("reconnecting", { attempt: this.currentAttempt, delay });

    // Set reconnect timer
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.establishConnection();
      } catch (error) {
        // Reconnection failed, try again
        this.reconnect();
      }
    }, delay) as unknown as number;
  }

  /**
   * Starts the heartbeat to keep the connection alive
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.state === ConnectionState.CONNECTED) {
        this.sendMessage({ type: 'heartbeat' }, MessagePriority.CRITICAL)
          .catch(() => {
            // If heartbeat fails, check connection
            if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
              this.handleDisconnection({ type: 'heartbeat_timeout' } as Event);
            }
          });
      }
    }, this.heartbeatInterval) as unknown as number;
  }

  /**
   * Clears the heartbeat timer
   */
  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  /**
   * Clears all timers
   */
  private clearTimers(): void {
    this.clearHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    
    if (this.processQueueTimer) {
      clearTimeout(this.processQueueTimer);
      this.processQueueTimer = undefined;
    }
    
    // Clear message timeouts
    for (const entry of Array.from(this.sentMessages.values())) {
      clearTimeout(entry.timeout);
    }
    this.sentMessages.clear();
  }

  /**
   * Queues a message for sending
   */
  private queueMessage(message: WebSocketMessage): void {
    const queue = this.messageQueue.get(message.priority)!;
    queue.push(message);
    
    // Start processing queue immediately if not already in progress
    if (!this.processQueueTimer && this.state === ConnectionState.CONNECTED) {
      this.processQueue();
    }
  }

  /**
   * Processes the message queue
   */
  private processQueue(): void {
    // Clear existing timer
    if (this.processQueueTimer) {
      clearTimeout(this.processQueueTimer);
      this.processQueueTimer = undefined;
    }
    
    // Check if we're connected
    if (this.state !== ConnectionState.CONNECTED || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Process messages in order of priority
    let sentCount = 0;
    const priorities = [
      MessagePriority.CRITICAL,
      MessagePriority.HIGH,
      MessagePriority.NORMAL,
      MessagePriority.LOW
    ];
    
    for (const priority of priorities) {
      const queue = this.messageQueue.get(priority)!;
      
      while (queue.length > 0 && sentCount < 10) {
        const message = queue.shift()!;
        this.sendWebSocketMessage(message);
        sentCount++;
      }
      
      // If we've sent enough messages, break out
      if (sentCount >= 10) {
        break;
      }
    }
    
    // Schedule next processing if there are messages left
    const hasRemainingMessages = priorities.some(p => this.messageQueue.get(p)!.length > 0);
    
    if (hasRemainingMessages) {
      this.processQueueTimer = setTimeout(() => this.processQueue(), 50) as unknown as number;
    }
  }

  /**
   * Sends a WebSocket message to the server
   */
  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.queueMessage(message);
      return;
    }
    
    try {
      message.attempt++;
      
      // Send message
      this.ws.send(JSON.stringify(message));
      
      // Set timeout for acknowledgement
      const timeout = setTimeout(() => {
        // Always emit timeout event first
        this.emitEvent("message_timeout", { messageId: message.id, message });
        
        // Remove from sent messages
        this.sentMessages.delete(message.id);
        
        // Requeue if not critical and has not exceeded attempt limit
        if (message.priority !== MessagePriority.CRITICAL && message.attempt < 3) {
          // Create a copy to avoid potential reference issues
          const messageCopy = { ...message };
          this.queueMessage(messageCopy);
        }
      }, this.messageTimeout) as unknown as number;
      
      // Store message in sent messages
      this.sentMessages.set(message.id, { message, timeout });
    } catch (error) {
      console.error("Error sending message:", error);
      this.emitEvent("error", { error, message });
      
      // Queue message again
      this.queueMessage(message);
    }
  }

  /**
   * Handles an acknowledgement from the server
   */
  private handleAcknowledgement(messageId: string): void {
    const sent = this.sentMessages.get(messageId);
    if (sent) {
      clearTimeout(sent.timeout);
      this.sentMessages.delete(messageId);
      this.emitEvent("message_acknowledged", { messageId, message: sent.message });
    }
  }

  /**
   * Sends an acknowledgement for a received message
   */
  private sendAcknowledgement(messageId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ack', id: messageId }));
    }
  }

  /**
   * Generates a unique message ID
   */
  private generateMessageId(): string {
    this.lastMessageId++;
    return `${Date.now()}-${this.lastMessageId}`;
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