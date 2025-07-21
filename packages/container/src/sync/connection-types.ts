/**
 * InSpatial Container System - Connection Types
 *
 * This file defines shared types and enums for the WebSocket connection
 * system used for container communication.
 */

/**
 * Message priority levels
 */
export enum MessagePriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  id: string;
  type: string;
  priority: MessagePriority;
  payload: any;
  timestamp: number;
  attempt: number;
}

/**
 * Options for WebSocket connection
 */
export interface ConnectionOptions {
  url: string;
  protocols?: string[];
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
  binaryType?: BinaryType;
  authToken?: string;
}

/**
 * Event listener type
 */
export type EventListener = (event: any) => void;

/**
 * Connection state enumeration
 */
export enum ConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
} 