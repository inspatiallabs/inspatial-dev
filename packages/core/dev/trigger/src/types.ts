/**
 * @file types.ts
 * @description Type definitions for the TriggerBridge system
 */

// Basic platform types
export type PlatformType = "dom" | "native" | "inreal";

// Native sub-platform types
export type NativeSubPlatformType =
  | "ios"
  | "visionos"
  | "android"
  | "androidxr"
  | "horizonos";

// Combined hierarchical platform type
export type HierarchicalPlatformType =
  | PlatformType
  | `${Extract<PlatformType, "native">}:${NativeSubPlatformType}`;

/**
 * Event priority levels
 */
export enum TriggerEventPriorityType {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Event delivery status
 */
export enum TriggerEventDeliveryStatusType {
  QUEUED = "queued",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  FAILED = "failed",
  DROPPED = "dropped",
  CANCELLED = "cancelled",
}

/**
 * Base event data interface
 */
export interface BaseTriggerEventDataType {
  /**
   * Original timestamp of the event
   */
  timestamp: number;

  /**
   * Original source of the event
   */
  originalSource?: string;

  /**
   * Type of the event
   */
  type: string;

  /**
   * Whether the event is cancelable
   */
  cancelable?: boolean;

  /**
   * Whether the event was cancelled
   */
  cancelled?: boolean;

  /**
   * Whether the event bubbles
   */
  bubbles?: boolean;

  /**
   * Custom data associated with the event
   */
  [key: string]: any;
}

/**
 * Mouse event data interface
 */
export interface MouseTriggerEventDataType extends BaseTriggerEventDataType {
  type:
    | "click"
    | "mousedown"
    | "mouseup"
    | "mousemove"
    | "mouseover"
    | "mouseout";
  clientX: number;
  clientY: number;
  screenX?: number;
  screenY?: number;
  button?: number;
  buttons?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Touch event data interface
 */
export interface TouchTriggerEventDataType extends BaseTriggerEventDataType {
  type: "touchstart" | "touchend" | "touchmove" | "touchcancel";
  touches: Array<{
    identifier: number;
    clientX: number;
    clientY: number;
    screenX?: number;
    screenY?: number;
  }>;
  changedTouches?: Array<{
    identifier: number;
    clientX: number;
    clientY: number;
    screenX?: number;
    screenY?: number;
  }>;
}

/**
 * Keyboard event data interface
 */
export interface KeyboardTriggerEventDataType extends BaseTriggerEventDataType {
  type: "keydown" | "keyup" | "keypress";
  key: string;
  code: string;
  keyCode?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  repeat?: boolean;
}

/**
 * Spatial event data interface
 */
export interface SpatialTriggerEventDataType extends BaseTriggerEventDataType {
  type: "tap" | "pinch" | "pan" | "rotate" | "spatialgesture";
  position?: {
    x: number;
    y: number;
    z: number;
  };
  normal?: {
    x: number;
    y: number;
    z: number;
  };
  direction?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  scale?: number;
  handedness?: "left" | "right" | "both";
  fingers?: number;
  distance?: number;
}

/**
 * Union type of all event data types
 */
export type TriggerEventDataType =
  | BaseTriggerEventDataType
  | MouseTriggerEventDataType
  | TouchTriggerEventDataType
  | KeyboardTriggerEventDataType
  | SpatialTriggerEventDataType;

/**
 * Enhanced event message structure
 */
export interface EventMessageType {
  /**
   * Unique identifier for the message
   */
  id: string;

  /**
   * Source platform type
   */
  sourceTarget: PlatformType;

  /**
   * Source node identifier
   */
  sourceNodeId: string;

  /**
   * Destination platform type (if specified)
   */
  destinationTarget?: PlatformType;

  /**
   * Destination node identifier (if specified)
   */
  destinationNodeId?: string;

  /**
   * Name of the event
   */
  eventName: string;

  /**
   * Event payload data
   */
  payload: TriggerEventDataType;

  /**
   * Timestamp when the message was created
   */
  timestamp: number;

  /**
   * Current status of the message
   */
  status?: TriggerEventDeliveryStatusType;

  /**
   * Priority of the message
   */
  priority?: TriggerEventPriorityType;

  /**
   * Additional metadata for the message
   */
  metadata?: Record<string, any>;

  /**
   * Number of retry attempts for the message
   */
  retryCount?: number;

  /**
   * Maximum number of retry attempts allowed
   */
  maxRetries?: number;

  /**
   * Time when the message was last processed
   */
  lastProcessed?: number;

  /**
   * Error that occurred during processing (if any)
   */
  error?: Error | string;

  /**
   * Hierarchical platform information for source
   */
  sourceHierarchicalPlatform?: HierarchicalPlatformType;

  /**
   * Hierarchical platform information for destination
   */
  destinationHierarchicalPlatform?: HierarchicalPlatformType;
}

/**
 * Event handler function signature with strongly typed event data
 */
export type EventHandlerType<
  T extends TriggerEventDataType = TriggerEventDataType,
> = (eventData: T) => void | Promise<void>;

/**
 * Node information for linking
 */
export interface TriggerNodeInfoType {
  /**
   * Platform target (can be hierarchical)
   */
  target: PlatformType | HierarchicalPlatformType;

  /**
   * Node identifier
   */
  nodeId: string;

  /**
   * Display name for debugging
   */
  displayName?: string;
}

/**
 * Event mapping definition
 */
export interface EventMappingType {
  /**
   * Source event name
   */
  from: string;

  /**
   * Destination event name
   */
  to: string;

  /**
   * Optional transformer function for event data
   */
  transform?: (data: TriggerEventDataType) => TriggerEventDataType;
}

/**
 * Event subscription information
 */
export interface TriggerEventSubscriptionType {
  /**
   * Target platform
   */
  target: PlatformType | HierarchicalPlatformType;

  /**
   * Node ID
   */
  nodeId: string;

  /**
   * Event name
   */
  eventName: string;

  /**
   * Handler function
   */
  handler: EventHandlerType;

  /**
   * Subscription ID
   */
  id: string;
}

/**
 * Registry structure for events
 */
export interface TriggerEventRegistryType {
  [target: string]: {
    [nodeId: string]: {
      [eventName: string]: EventHandlerType;
    };
  };
}

/**
 * Platform adapter interface
 */
export interface PlatformTriggerAdapterType {
  /**
   * Platform type this adapter handles
   */
  readonly platformType: PlatformType;

  /**
   * Set the bridge reference
   */
  setBridge(bridge: any): void;

  /**
   * Connect adapter to a specific node and event
   */
  connectNode(nodeId: string, eventName: string): void;

  /**
   * Disconnect adapter from a node and event
   */
  disconnectNode(nodeId: string, eventName: string): void;

  /**
   * Handle an incoming message from the bridge
   */
  handleMessage(
    message: EventMessageType,
    mappedEventName: string
  ): Promise<void>;
}

/**
 * Statistics for the event system
 */
export interface EventSystemStatsType {
  /**
   * Total events processed
   */
  totalEventsProcessed: number;

  /**
   * Total events by platform type
   */
  eventsByPlatform: Record<PlatformType, number>;

  /**
   * Total events by event name
   */
  eventsByName: Record<string, number>;

  /**
   * Total errors encountered
   */
  totalErrors: number;

  /**
   * Average processing time in milliseconds
   */
  averageProcessingTime: number;

  /**
   * Maximum queue size reached
   */
  maxQueueSize: number;

  /**
   * Current queue size
   */
  currentQueueSize: number;
}

/**
 * Bridge system interface
 */
export interface TriggerBridgeType {
  /**
   * Register a platform adapter
   */
  registerTriggerExtension(adapter: PlatformTriggerAdapterType): void;

  /**
   * Get a platform adapter
   */
  getAdapter(platform: PlatformType): PlatformTriggerAdapterType | undefined;

  /**
   * Register an event handler
   */
  registerEventHandler<T extends TriggerEventDataType>(
    target: PlatformType | HierarchicalPlatformType,
    nodeId: string,
    eventName: string,
    handler: EventHandlerType<T>
  ): TriggerEventSubscriptionType;

  /**
   * Unregister an event handler
   */
  unregisterEventHandler(
    target: PlatformType | HierarchicalPlatformType,
    nodeId: string,
    eventName: string
  ): void;

  /**
   * Dispatch an event
   */
  dispatchEvent<T extends TriggerEventDataType>(
    sourcePlatform: PlatformType | HierarchicalPlatformType,
    sourceNodeId: string,
    eventName: string,
    eventData: T,
    destinationPlatform?: PlatformType | HierarchicalPlatformType,
    destinationNodeId?: string
  ): string;

  /**
   * Set an event mapping
   */
  setEventMapping(
    fromTarget: PlatformType,
    toTarget: PlatformType,
    fromEvent: string,
    toEvent: string
  ): void;

  /**
   * Get system statistics
   */
  getStats(): EventSystemStatsType;
}
