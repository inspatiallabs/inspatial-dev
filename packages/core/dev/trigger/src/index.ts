/**
 * @module @inspatial/trigger
 *
 * The InSpatial Trigger Bridge provides a unified event system that works seamlessly across
 * different platforms (Web, Native, and 3D environments). It allows events to propagate
 * between platforms with automatic mapping and transformation.
 *
 * @example Basic Usage
 * ```typescript
 * import { TriggerBridge, DomTriggerAdapter } from "@inspatial/trigger";
 *
 * // Initialize the system with DOM support
 * const bridge = initTriggerBridge(true);
 *
 * // Get the DOM adapter
 * const domTriggerAdapter = bridge.getAdapter("dom") as DomTriggerAdapter;
 *
 * // Register a DOM element
 * domTriggerAdapter.registerElement("button1", document.getElementById("myButton"));
 *
 * // Register an event handler
 * bridge.registerEventHandler("dom", "button1", "click", (eventData) => {
 *   console.log("Button clicked:", eventData);
 * });
 * ```
 *
 * @features
 * - Cross-platform event routing between DOM, Native, and 3D/AR/VR environments
 * - Hierarchical platform support for fine-grained platform targeting
 * - Event mapping and transformation between different platform event systems
 * - Bidirectional event linking between nodes on different platforms
 * - Batched event processing to prevent UI blocking
 * - Platform capability detection for adaptive experiences
 * - Standardized event message format across all platforms
 * - Extensible adapter system for adding new platforms
 * - Performance monitoring and system health tracking
 * - Advanced error handling and validation
 * - Configurable behavior for different environments
 *
 * @example Cross-Platform Event Linking
 * ```typescript
 * import { TriggerBridge, DomTriggerAdapter, InRealTriggerAdapter } from "@inspatial/trigger";
 *
 * // Initialize with multiple platform support
 * const bridge = initTriggerBridge(true, false, myInRealEngine);
 *
 * // Get adapters
 * const domTriggerAdapter = bridge.getAdapter("dom") as DomTriggerAdapter;
 * const inrealTriggerAdapter = bridge.getAdapter("inreal") as InRealTriggerAdapter;
 *
 * // Register elements
 * domTriggerAdapter.registerElement("webButton", document.getElementById("myButton"));
 * inrealTriggerAdapter.registerObject("3dButton", my3DButton);
 *
 * // Create bidirectional event link
 * bridge.createEventLink(
 *   { target: "dom", nodeId: "webButton" },
 *   { target: "inreal", nodeId: "3dButton" },
 *   [["click", "tap"]]
 * );
 * ```
 *
 * @bestPractices
 * 1. Register all nodes before setting up event handlers
 * 2. Use hierarchical platform types for platform-specific behavior
 * 3. Create bidirectional links for synchronized UI elements
 * 4. Check platform capabilities before using platform-specific features
 * 5. Set custom event mappings for non-standard events
 * 6. Monitor system health with the performance monitoring tools
 * 7. Configure the system for your specific requirements
 */

// Re-export all components directly

// Core components with class name exports and backward compatibility types
export {
  TriggerBridgeClass,
  TriggerBridgeClass as TriggerBridge,
  PlatformTriggerAdapterClass,
  PlatformTriggerAdapterClass as PlatformTriggerAdapter,
  DomTriggerAdapterClass,
  DomTriggerAdapterClass as DomTriggerAdapter,
  InRealTriggerAdapterClass,
  InRealTriggerAdapterClass as InRealTriggerAdapter,
  triggerBridge,
  initTriggerBridge,
} from "./bridge.ts";

// Native Hierarchical adapters
export {
  NativeTriggerAdapterClass,
  NativeTriggerAdapterClass as NativeTriggerAdapter,
  SubPlatformTriggerAdapterClass,
  SubPlatformTriggerAdapterClass as SubPlatformTriggerAdapter,
  IOSTriggerAdapterClass,
  IOSTriggerAdapterClass as IOSTriggerAdapter,
  VisionOSTriggerAdapterClass,
  VisionOSTriggerAdapterClass as VisionOSTriggerAdapter,
  AndroidTriggerAdapterClass,
  AndroidTriggerAdapterClass as AndroidTriggerAdapter,
  AndroidXRTriggerAdapterClass,
  AndroidXRTriggerAdapterClass as AndroidXRTriggerAdapter,
  HorizonOSTriggerAdapterClass,
  HorizonOSTriggerAdapterClass as HorizonOSTriggerAdapter,
  createNativeTriggerAdapter,
} from "./hpa.ts";

// Error handling
export {
  TriggerErrorClass,
  TriggerErrorClass as TriggerError,
  EventDispatchErrorClass,
  EventDispatchErrorClass as EventDispatchError,
  EventHandlerErrorClass,
  EventHandlerErrorClass as EventHandlerError,
  PlatformErrorClass,
  PlatformErrorClass as PlatformError,
  ParameterValidationErrorClass,
  ParameterValidationErrorClass as ParameterValidationError,
  ErrorLoggerClass,
  ErrorLoggerClass as ErrorLogger,
  errorLogger,
  LogSeverityEnum,
  LogSeverityEnum as LogSeverity,
  ErrorCodeEnum,
  ErrorCodeEnum as ErrorCode,
  TriggerValidatorClass,
  withRetry,
} from "./errors.ts";

// Configuration
export {
  TriggerConfigManagerClass,
  TriggerConfigManagerClass as TriggerConfigManager,
  triggerConfigManager,
  defaultConfig,
  type TriggerBridgeConfigType,
  type TriggerBridgeConfigType as TriggerBridgeConfig,
} from "./config.ts";

// Performance monitoring
export {
  TriggerPerformanceMonitorClass,
  TriggerPerformanceMonitorClass as PerformanceMonitor,
  triggerPerformanceMonitor,
  type TriggerSystemHealthType,
  type TriggerSystemHealthType as SystemHealth,
} from "./monitoring.ts";

// Re-export types
export type { PlatformTriggerCapabilitiesType } from "./hpa.ts";
export type {
  PlatformType,
  NativeSubPlatformType,
  HierarchicalPlatformType,
  EventMessageType,
  EventHandlerType,
  TriggerNodeInfoType,
  TriggerNodeInfoType as NodeInfo,
  TriggerEventRegistryType,
  TriggerEventRegistryType as TriggerEventRegistry,
  TriggerEventPriorityType,
  TriggerEventPriorityType as TriggerEventPriority,
  TriggerEventDeliveryStatusType,
  TriggerEventDeliveryStatusType as TriggerEventDeliveryStatus,
  BaseTriggerEventDataType,
  BaseTriggerEventDataType as BaseTriggerEventData,
  MouseTriggerEventDataType,
  MouseTriggerEventDataType as MouseTriggerEventData,
  TouchTriggerEventDataType,
  TouchTriggerEventDataType as TouchTriggerEventData,
  KeyboardTriggerEventDataType,
  KeyboardTriggerEventDataType as KeyboardTriggerEventData,
  SpatialTriggerEventDataType,
  SpatialTriggerEventDataType as SpatialTriggerEventData,
  TriggerEventDataType,
  TriggerEventDataType as TriggerEventData,
  EventMappingType,
  EventMappingType as EventMapping,
  TriggerEventSubscriptionType,
  TriggerEventSubscriptionType as EventSubscription,
  PlatformTriggerAdapterType,
  PlatformTriggerAdapterType as PlatformTriggerAdapterClassInterface,
  EventSystemStatsType,
  EventSystemStatsType as EventSystemStats,
  TriggerBridgeType,
} from "./types.ts";
