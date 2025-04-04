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
 * Trigger categories enumeration
 */
export enum TriggerCategoryEnum {
  TOUCH = "Touch",
  SENSOR = "Sensor",
  MOUSE = "Mouse",
  KEYBOARD = "Keyboard",
  SCENE = "Scene",
  LOGIC = "Logic",
  AREA = "Area",
  GENERIC = "Generic",
  GESTURE = "Gesture",
  PHYSICS = "Physics",
  TIME = "Time",
  CUSTOM = "Custom",
}

/**
 * Trigger parameter definition
 */
export interface TriggerParameterDefinitionType {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "function";
  description: string;
  required: boolean;
  default?: any;
  options?: any[];
}

/**
 * Trigger definition type (metadata for registry)
 */
export interface TriggerDefinitionMetadataType {
  id: string;
  name: string;
  category: TriggerCategoryEnum;
  description: string;
  compatiblePlatforms: Array<PlatformType | HierarchicalPlatformType>;
  parameters?: TriggerParameterDefinitionType[];
  defaultConfig?: Record<string, any>;
  internal?: boolean;
}

/**
 * Represents a trigger registered with the system, primarily containing its name 
 * and the core action logic for state transitions.
 * @template S The type of the state object this trigger operates on.
 * @template P The type of the payload arguments the action accepts.
 */
export interface RegisteredTriggerType<S = any, P extends any[] = any[]> {
  /** Unique name identifying the trigger (e.g., "namespace:onEvent"). */
  name: string;
  /** 
   * The function performing the state transition.
   * Receives the current state and payload arguments.
   * Should return the new state object or void if no change occurred.
   */
  action: (state: S, ...payload: P) => S | void;
  // Optional: Could add metadata link or parameters definition here if needed later
  // metadataRef?: string; // Link back to TriggerDefinitionMetadataType.id
}

/**
 * Trigger instance type (represents an active trigger in the system)
 */
export interface TriggerInstanceType {
  execute: (...args: any[]) => undefined;
  id: string;
  type: string;
  enabled: boolean;
  params?: Record<string, any>;
  disable: () => void;
  enable: () => void;
  destroy: () => void;
  update: (newParams: Record<string, any>) => void;
  fire: (customPayload?: any) => void;
}

/**
 * Trigger configuration options (used when creating an instance)
 */
export interface TriggerConfigType {
  type: string;
  target?: any;
  nodeId?: string;
  action: (payload: any) => void;
  platform?: PlatformType | HierarchicalPlatformType;
  throttle?: number;
  debounce?: number;
  once?: boolean;
  condition?: (state: any) => boolean;
  fallbacks?: Record<HierarchicalPlatformType, Partial<TriggerConfigType>>;
  priority?: number;
  tags?: string[];
  id?: string;
  [key: string]: any;
}

/**
 * Event priority levels
 */
export enum TriggerEventPriorityEnum {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Event delivery status
 */
export enum TriggerEventDeliveryStatusEnum {
  QUEUED = "queued",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  FAILED = "failed",
  DROPPED = "dropped",
  CANCELLED = "cancelled",
}

/**
 * Severity levels for errors and logs
 */
export enum LogSeverityEnum {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  FATAL = "fatal",
}

/**
 * Error codes for specific error scenarios
 */
export enum ErrorCodeEnum {
  // General errors
  GENERAL_ERROR = "TRIGGER_GENERAL_ERROR",

  // Registration errors
  ADAPTER_ALREADY_REGISTERED = "TRIGGER_ADAPTER_ALREADY_REGISTERED",
  INVALID_ADAPTER = "TRIGGER_INVALID_ADAPTER",
  NODE_REGISTRATION_FAILED = "TRIGGER_NODE_REGISTRATION_FAILED",

  // Event handling errors
  EVENT_DISPATCH_FAILED = "TRIGGER_EVENT_DISPATCH_FAILED",
  EVENT_HANDLING_FAILED = "TRIGGER_EVENT_HANDLING_FAILED",
  EVENT_MAPPING_FAILED = "TRIGGER_EVENT_MAPPING_FAILED",

  // Message processing errors
  MESSAGE_PROCESSING_FAILED = "TRIGGER_MESSAGE_PROCESSING_FAILED",
  QUEUE_PROCESSING_FAILED = "TRIGGER_QUEUE_PROCESSING_FAILED",

  // Platform errors
  PLATFORM_DETECTION_FAILED = "TRIGGER_PLATFORM_DETECTION_FAILED",
  PLATFORM_SPECIFIC_ERROR = "TRIGGER_PLATFORM_SPECIFIC_ERROR",

  // Parameter validation errors
  INVALID_PARAMETER = "TRIGGER_INVALID_PARAMETER",
  MISSING_REQUIRED_PARAMETER = "TRIGGER_MISSING_REQUIRED_PARAMETER",
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
  status?: TriggerEventDeliveryStatusEnum;

  /**
   * Priority of the message
   */
  priority?: TriggerEventPriorityEnum;

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
