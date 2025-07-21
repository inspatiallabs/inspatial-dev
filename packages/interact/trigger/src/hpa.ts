/**
 * @file hpa.ts (hierarchical-platform-adapter)
 * @description Enhanced platform adapter system with hierarchical platform types
 */

import {
  EventMessageType,
  PlatformType,
  NativeSubPlatformType,
  HierarchicalPlatformType,
} from "./types.ts";

// Don't import PlatformTriggerAdapterClass from bridge.ts to avoid circular dependency
// Instead, use the abstract class defined here that matches bridge.ts

/**
 * Platform capabilities interface
 */
export interface PlatformTriggerCapabilitiesType {
  supportsSpatial: boolean;
  supportsHandTracking: boolean;
  supportsEyeTracking: boolean;
  supportsFaceTracking: boolean;
  touchInputType: "direct" | "pointer" | "both";
  maxTouchPoints: number;
  hasDepthSensing: boolean;
}

/**
 * Abstract class for platform-specific adapters (must match bridge.ts definition)
 */
export abstract class PlatformTriggerAdapterClass {
  protected bridge: any | null = null;

  constructor(public readonly platformType: PlatformType) {}

  /**
   * Set the bridge reference
   */
  public setBridge(bridge: any): void {
    this.bridge = bridge;
  }

  /**
   * Connect adapter to a specific node and event
   */
  public abstract connectNode(nodeId: string, eventName: string): void;

  /**
   * Disconnect adapter from a node and event
   */
  public abstract disconnectNode(nodeId: string, eventName: string): void;

  /**
   * Handle an incoming message from the bridge
   */
  public abstract handleMessage(
    message: EventMessageType,
    mappedEventName: string
  ): Promise<void>;
}

/**
 * Enhanced native adapter supporting sub-platforms
 */
export class NativeTriggerAdapterClass extends PlatformTriggerAdapterClass {
  // Registry of specific platform adapters
  private subAdapters: Map<
    NativeSubPlatformType,
    SubPlatformTriggerAdapterClass
  > = new Map();

  // Current detected sub-platform
  private detectedPlatform: NativeSubPlatformType | null = null;

  // Registry of platform capabilities
  private capabilities: Map<
    NativeSubPlatformType,
    PlatformTriggerCapabilitiesType
  > = new Map();

  // Node to platform-specific view mapping
  private nodeViews: Map<string, any> = new Map();

  constructor() {
    super("native");
    this.initializePlatformTriggerCapabilitiesType();
    this.detectPlatform();
    this.initializeSubAdapters();
  }

  /**
   * Initialize capability definitions for each platform
   */
  private initializePlatformTriggerCapabilitiesType(): void {
    this.capabilities.set("ios", {
      supportsSpatial: false,
      supportsHandTracking: false,
      supportsEyeTracking: false,
      supportsFaceTracking: true,
      touchInputType: "direct",
      maxTouchPoints: 10,
      hasDepthSensing: false,
    });

    this.capabilities.set("visionos", {
      supportsSpatial: true,
      supportsHandTracking: true,
      supportsEyeTracking: true,
      supportsFaceTracking: true,
      touchInputType: "both",
      maxTouchPoints: 10,
      hasDepthSensing: true,
    });

    this.capabilities.set("android", {
      supportsSpatial: false,
      supportsHandTracking: false,
      supportsEyeTracking: false,
      supportsFaceTracking: false,
      touchInputType: "direct",
      maxTouchPoints: 10,
      hasDepthSensing: false,
    });

    this.capabilities.set("androidxr", {
      supportsSpatial: true,
      supportsHandTracking: true,
      supportsEyeTracking: false,
      supportsFaceTracking: false,
      touchInputType: "both",
      maxTouchPoints: 2,
      hasDepthSensing: true,
    });

    this.capabilities.set("horizonos", {
      supportsSpatial: true,
      supportsHandTracking: true,
      supportsEyeTracking: true,
      supportsFaceTracking: true,
      touchInputType: "pointer",
      maxTouchPoints: 0, // Uses hand tracking instead
      hasDepthSensing: true,
    });
  }

  /**
   * Initialize platform-specific sub-adapters
   */
  private initializeSubAdapters(): void {
    // Only initialize the adapter for the detected platform
    if (this.detectedPlatform) {
      const adapter = this.createSubAdapter(this.detectedPlatform);
      if (adapter) {
        this.subAdapters.set(this.detectedPlatform, adapter);
      }
    }
  }

  /**
   * Create a platform-specific sub-adapter
   */
  private createSubAdapter(
    platform: NativeSubPlatformType
  ): SubPlatformTriggerAdapterClass | null {
    switch (platform) {
      case "ios":
        return new IOSTriggerAdapterClass(this);
      case "visionos":
        return new VisionOSTriggerAdapterClass(this);
      case "android":
        return new AndroidTriggerAdapterClass(this);
      case "androidxr":
        return new AndroidXRTriggerAdapterClass(this);
      case "horizonos":
        return new HorizonOSTriggerAdapterClass(this);
      default:
        console.warn(
          `[HierarchicalNativeAdapter] No adapter available for ${platform}`
        );
        return null;
    }
  }

  /**
   * Detect the current native platform
   */
  private detectPlatform(): void {
    // Simple platform detection based on global objects
    // In a real implementation, this would use more robust detection
    if (typeof window !== "undefined") {
      // Running in a web context
      const ua = navigator.userAgent.toLowerCase();

      if (ua.includes("iphone") || ua.includes("ipad")) {
        if (ua.includes("visionos")) {
          this.detectedPlatform = "visionos";
        } else {
          this.detectedPlatform = "ios";
        }
      } else if (ua.includes("android")) {
        if (
          ua.includes("quest") ||
          ua.includes("oculus") ||
          ua.includes("xr")
        ) {
          this.detectedPlatform = "androidxr";
        } else {
          this.detectedPlatform = "android";
        }
      } else if (typeof (window as any)._HORIZONOS_ !== "undefined") {
        this.detectedPlatform = "horizonos";
      }
    }

    console.log(
      `[HierarchicalNativeAdapter] Detected platform: ${this.detectedPlatform}`
    );
  }

  /**
   * Get the current platform capabilities
   */
  public getCurrentCapabilities(): PlatformTriggerCapabilitiesType | null {
    if (!this.detectedPlatform) return null;
    return this.capabilities.get(this.detectedPlatform) || null;
  }

  /**
   * Get the detected sub-platform type
   */
  public getDetectedPlatform(): NativeSubPlatformType | null {
    return this.detectedPlatform;
  }

  /**
   * Get the hierarchical platform identifier
   */
  public getHierarchicalPlatformType(): HierarchicalPlatformType {
    if (this.detectedPlatform) {
      return `native:${this.detectedPlatform}` as HierarchicalPlatformType;
    }
    return "native";
  }

  /**
   * Register a native view with a node ID
   */
  public registerView(nodeId: string, view: any): void {
    this.nodeViews.set(nodeId, view);

    // Also register with the appropriate sub-adapter
    if (this.detectedPlatform) {
      const subAdapter = this.subAdapters.get(this.detectedPlatform);
      if (subAdapter) {
        subAdapter.registerView(nodeId, view);
      }
    }
  }

  /**
   * Connect adapter to a specific node and event
   * Delegates to the appropriate sub-adapter
   */
  public connectNode(nodeId: string, eventName: string): void {
    const view = this.nodeViews.get(nodeId);
    if (!view) {
      console.warn(
        `[HierarchicalNativeAdapter] No view registered for node ${nodeId}`
      );
      return;
    }

    // Delegate to the detected platform's adapter
    if (this.detectedPlatform) {
      const subAdapter = this.subAdapters.get(this.detectedPlatform);
      if (subAdapter) {
        subAdapter.connectNode(nodeId, eventName, view);
      } else {
        console.warn(
          `[HierarchicalNativeAdapter] No sub-adapter available for ${this.detectedPlatform}`
        );
      }
    } else {
      console.warn(
        `[HierarchicalNativeAdapter] No platform detected, cannot connect node ${nodeId}`
      );
    }
  }

  /**
   * Disconnect adapter from a node and event
   * Delegates to the appropriate sub-adapter
   */
  public disconnectNode(nodeId: string, eventName: string): void {
    // Delegate to the detected platform's adapter
    if (this.detectedPlatform) {
      const subAdapter = this.subAdapters.get(this.detectedPlatform);
      if (subAdapter) {
        subAdapter.disconnectNode(nodeId, eventName);
      }
    }
  }

  /**
   * Handle an incoming message from the bridge
   * Delegates to the appropriate sub-adapter
   */
  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string
  ): Promise<void> {
    const view = this.nodeViews.get(message.destinationNodeId!);
    if (!view) {
      console.warn(
        `[HierarchicalNativeAdapter] Cannot find view for node ${message.destinationNodeId}`
      );
      return;
    }

    // Delegate to the detected platform's adapter
    if (this.detectedPlatform) {
      const subAdapter = this.subAdapters.get(this.detectedPlatform);
      if (subAdapter) {
        await subAdapter.handleMessage(message, mappedEventName, view);
      } else {
        console.warn(
          `[HierarchicalNativeAdapter] No sub-adapter available for ${this.detectedPlatform}`
        );
      }
    } else {
      console.warn(
        `[HierarchicalNativeAdapter] No platform detected, cannot handle message`
      );
    }
  }

  /**
   * Dispatch an event through the bridge
   */
  public dispatchEvent(
    nodeId: string,
    eventName: string,
    eventData: any
  ): void {
    if (!this.bridge) return;

    // Create the hierarchical platform identifier
    const platformIdentifier = this.getHierarchicalPlatformType();

    // Dispatch the event through the bridge
    this.bridge.dispatchEvent(
      "native",
      nodeId,
      eventName,
      eventData,
      undefined,
      undefined,
      platformIdentifier
    );
  }
}

/**
 * Base class for platform-specific sub-adapters
 */
export abstract class SubPlatformTriggerAdapterClass {
  // Map of node IDs to native views
  protected views: Map<string, any> = new Map();

  // Map of node IDs to event listeners
  protected listeners: Map<string, Map<string, any>> = new Map();

  constructor(protected parent: NativeTriggerAdapterClass) {}

  /**
   * Register a view with a node ID
   */
  public registerView(nodeId: string, view: any): void {
    this.views.set(nodeId, view);
  }

  /**
   * Connect to native view events
   */
  public abstract connectNode(
    nodeId: string,
    eventName: string,
    view: any
  ): void;

  /**
   * Disconnect from native view events
   */
  public abstract disconnectNode(nodeId: string, eventName: string): void;

  /**
   * Handle an incoming message from the bridge
   */
  public abstract handleMessage(
    message: EventMessageType,
    mappedEventName: string,
    view: any
  ): Promise<void>;

  /**
   * Map generic event name to platform-specific event name
   */
  protected mapEventName(
    eventName: string,
    mappings: Record<string, string>
  ): string {
    return mappings[eventName] || eventName;
  }
}

/**
 * iOS-specific adapter implementation
 */
export class IOSTriggerAdapterClass extends SubPlatformTriggerAdapterClass {
  // iOS event mappings
  private eventMappings: Record<string, string> = {
    tap: "touchUpInside",
    longpress: "longPress",
    swipe: "swipeGesture",
    pan: "panGesture",
  };

  /**
   * Map generic event name to iOS-specific event name
   */
  protected mapToPlatformEvent(eventName: string): string {
    return this.eventMappings[eventName] || eventName;
  }

  /**
   * Map iOS-specific event name to generic event name
   */
  protected mapFromPlatformEvent(platformEventName: string): string {
    for (const [generic, platform] of Object.entries(this.eventMappings)) {
      if (platform === platformEventName) {
        return generic;
      }
    }
    return platformEventName;
  }

  /**
   * Connect to iOS view events
   */
  public connectNode(nodeId: string, eventName: string, view: any): void {
    // Map to platform-specific event name
    const platformEventName = this.mapToPlatformEvent(eventName);

    // Initialize listener maps if needed
    if (!this.listeners.has(nodeId)) {
      this.listeners.set(nodeId, new Map());
    }

    const nodeListeners = this.listeners.get(nodeId)!;

    // Remove existing listener if any
    if (nodeListeners.has(platformEventName)) {
      this.removeEventListener(
        view,
        platformEventName,
        nodeListeners.get(platformEventName)
      );
    }

    // Create and store new listener
    const listener = (args: any) => {
      // Extract data from iOS event
      const eventData = this.extractEventData(platformEventName, args, view);

      // Dispatch through parent adapter
      this.parent.dispatchEvent(nodeId, eventName, eventData);
    };

    // Add listener to view using iOS-specific method
    this.addEventListener(view, platformEventName, listener);
    nodeListeners.set(platformEventName, listener);
  }

  /**
   * Add event listener using iOS-specific method
   */
  private addEventListener(view: any, eventName: string, listener: any): void {
    // iOS-specific event binding
    if (typeof view.addTarget === "function") {
      view.addTarget(listener, "action", eventName);
    } else {
      view.addEventListener(eventName, listener);
    }
  }

  /**
   * Remove event listener using iOS-specific method
   */
  private removeEventListener(
    view: any,
    eventName: string,
    listener: any
  ): void {
    // iOS-specific event removal
    if (typeof view.removeTarget === "function") {
      view.removeTarget(listener, "action", eventName);
    } else {
      view.removeEventListener(eventName, listener);
    }
  }

  /**
   * Disconnect from iOS view events
   */
  public disconnectNode(nodeId: string, eventName: string): void {
    const view = this.views.get(nodeId);
    const listeners = this.listeners.get(nodeId);

    if (!view || !listeners) return;

    // Map to platform-specific event name
    const platformEventName = this.mapToPlatformEvent(eventName);

    if (listeners.has(platformEventName)) {
      this.removeEventListener(
        view,
        platformEventName,
        listeners.get(platformEventName)
      );
      listeners.delete(platformEventName);
    }
  }

  /**
   * Extract data from iOS-specific events
   */
  protected extractEventData(
    platformEventName: string,
    args: any,
    view: any
  ): any {
    // Base event data
    const data: any = {
      eventName: this.mapFromPlatformEvent(platformEventName),
      platformEventName,
      platform: "ios",
      timestamp: Date.now(),
      object: {
        id: view.id || "",
        className: view.className || "",
      },
    };

    // Touch events
    if (
      platformEventName === "touchUpInside" ||
      platformEventName === "longPress"
    ) {
      if (args.touches && args.touches.length > 0) {
        const touch = args.touches[0];
        data.position = {
          x: touch.locationInView.x,
          y: touch.locationInView.y,
        };
      }
    }

    // Gesture events
    if (
      platformEventName === "swipeGesture" ||
      platformEventName === "panGesture"
    ) {
      if (args.direction !== undefined) {
        data.direction = args.direction;
      }

      if (args.translation) {
        data.translation = {
          x: args.translation.x,
          y: args.translation.y,
        };
      }

      if (args.velocity) {
        data.velocity = {
          x: args.velocity.x,
          y: args.velocity.y,
        };
      }
    }

    return data;
  }

  /**
   * Handle incoming messages from other platforms
   */
  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string,
    view: any
  ): Promise<void> {
    // Map the event name to platform-specific event
    const platformEventName = this.mapToPlatformEvent(mappedEventName);

    // Simulate the iOS-specific event
    await this.simulateEvent(view, platformEventName, message.payload);
  }

  /**
   * Simulate an iOS-specific event
   */
  private async simulateEvent(
    view: any,
    platformEventName: string,
    payload: any
  ): Promise<void> {
    console.log(`[IOSAdapter] Simulating iOS event ${platformEventName}`);

    // Example for touchUpInside event
    if (
      platformEventName === "touchUpInside" &&
      typeof view.sendActionsForControlEvents === "function"
    ) {
      // This is a placeholder - in real code you would use the actual UIControlEventTouchUpInside constant
      const UIControlEventTouchUpInside = 1 << 6; // Example value
      view.sendActionsForControlEvents(UIControlEventTouchUpInside);
    }
    // Other iOS event simulations would be implemented here
  }
}

/**
 * VisionOS-specific adapter implementation
 */
export class VisionOSTriggerAdapterClass extends SubPlatformTriggerAdapterClass {
  // VisionOS event mappings
  private eventMappings: Record<string, string> = {
    tap: "indirectTap",
    gaze: "eyeFocus",
    pinch: "pinchGesture",
    spatial: "spatialTap",
    hover: "hoverGesture",
  };

  /**
   * Map generic event name to VisionOS-specific event name
   */
  protected mapToPlatformEvent(eventName: string): string {
    return this.eventMappings[eventName] || eventName;
  }

  /**
   * Map VisionOS-specific event name to generic event name
   */
  protected mapFromPlatformEvent(platformEventName: string): string {
    for (const [generic, platform] of Object.entries(this.eventMappings)) {
      if (platform === platformEventName) {
        return generic;
      }
    }
    return platformEventName;
  }

  /**
   * Connect to VisionOS view events
   */
  public connectNode(nodeId: string, eventName: string, view: any): void {
    // Map to platform-specific event name
    const platformEventName = this.mapToPlatformEvent(eventName);

    // Initialize listener maps if needed
    if (!this.listeners.has(nodeId)) {
      this.listeners.set(nodeId, new Map());
    }

    const nodeListeners = this.listeners.get(nodeId)!;

    // Remove existing listener if any
    if (nodeListeners.has(platformEventName)) {
      this.removeEventListener(
        view,
        platformEventName,
        nodeListeners.get(platformEventName)
      );
    }

    // Create and store new listener
    const listener = (args: any) => {
      // Extract data from VisionOS event
      const eventData = this.extractEventData(platformEventName, args, view);

      // Dispatch through parent adapter
      this.parent.dispatchEvent(nodeId, eventName, eventData);
    };

    // Add listener to view using VisionOS-specific method
    this.addEventListener(view, platformEventName, listener);
    nodeListeners.set(platformEventName, listener);
  }

  /**
   * Add event listener using VisionOS-specific method
   */
  private addEventListener(view: any, eventName: string, listener: any): void {
    // VisionOS-specific event binding
    if (
      typeof view.addSpatialEventHandler === "function" &&
      (eventName === "spatialTap" || eventName === "eyeFocus")
    ) {
      view.addSpatialEventHandler(eventName, listener);
    } else {
      view.addEventListener(eventName, listener);
    }
  }

  /**
   * Remove event listener using VisionOS-specific method
   */
  private removeEventListener(
    view: any,
    eventName: string,
    listener: any
  ): void {
    // VisionOS-specific event removal
    if (
      typeof view.removeSpatialEventHandler === "function" &&
      (eventName === "spatialTap" || eventName === "eyeFocus")
    ) {
      view.removeSpatialEventHandler(eventName, listener);
    } else {
      view.removeEventListener(eventName, listener);
    }
  }

  /**
   * Disconnect from VisionOS view events
   */
  public disconnectNode(nodeId: string, eventName: string): void {
    const view = this.views.get(nodeId);
    const listeners = this.listeners.get(nodeId);

    if (!view || !listeners) return;

    // Map to platform-specific event name
    const platformEventName = this.mapToPlatformEvent(eventName);

    if (listeners.has(platformEventName)) {
      this.removeEventListener(
        view,
        platformEventName,
        listeners.get(platformEventName)
      );
      listeners.delete(platformEventName);
    }
  }

  /**
   * Extract data from VisionOS-specific events
   */
  protected extractEventData(
    platformEventName: string,
    args: any,
    view: any
  ): any {
    // Base event data
    const data: any = {
      eventName: this.mapFromPlatformEvent(platformEventName),
      platformEventName,
      platform: "visionos",
      timestamp: Date.now(),
      object: {
        id: view.id || "",
        className: view.className || "",
      },
    };

    // Spatial tap events
    if (
      platformEventName === "spatialTap" ||
      platformEventName === "indirectTap"
    ) {
      if (args.location) {
        data.position = {
          x: args.location.x,
          y: args.location.y,
          z: args.location.z || 0,
        };
      }
    }

    // Eye tracking events
    if (platformEventName === "eyeFocus") {
      data.gazeDuration = args.duration || 0;

      if (args.worldPosition) {
        data.worldPosition = {
          x: args.worldPosition.x,
          y: args.worldPosition.y,
          z: args.worldPosition.z,
        };
      }
    }

    // Gesture events
    if (
      platformEventName === "pinchGesture" ||
      platformEventName === "hoverGesture"
    ) {
      data.gestureState = args.state || "unknown";

      if (args.handedness) {
        data.handedness = args.handedness; // "left", "right"
      }

      if (args.handPosition) {
        data.handPosition = {
          x: args.handPosition.x,
          y: args.handPosition.y,
          z: args.handPosition.z,
        };
      }
    }

    return data;
  }

  /**
   * Handle incoming messages from other platforms
   */
  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string,
    view: any
  ): Promise<void> {
    // Map the event name to platform-specific event
    const platformEventName = this.mapToPlatformEvent(mappedEventName);

    // Simulate the VisionOS-specific event
    await this.simulateEvent(view, platformEventName, message.payload);
  }

  /**
   * Simulate a VisionOS-specific event
   */
  private async simulateEvent(
    view: any,
    platformEventName: string,
    payload: any
  ): Promise<void> {
    console.log(
      `[VisionOSAdapter] Simulating VisionOS event ${platformEventName}`
    );

    // Example for spatial tap event
    if (
      platformEventName === "spatialTap" &&
      typeof view.simulateSpatialTap === "function"
    ) {
      const position = payload.position || { x: 0, y: 0, z: 0 };
      view.simulateSpatialTap(position);
    }
    // Other VisionOS event simulations would be implemented here
  }
}

/**
 * Android-specific adapter implementation
 */
export class AndroidTriggerAdapterClass extends SubPlatformTriggerAdapterClass {
  // Android event mappings
  private eventMappings: Record<string, string> = {
    tap: "onClick",
    longpress: "onLongClick",
    swipe: "onSwipe",
    pan: "onScroll",
  };

  // Implementation would be similar to iOS and VisionOS adapters
  // but with Android-specific event handling

  protected mapToPlatformEvent(eventName: string): string {
    return this.eventMappings[eventName] || eventName;
  }

  protected mapFromPlatformEvent(platformEventName: string): string {
    for (const [generic, platform] of Object.entries(this.eventMappings)) {
      if (platform === platformEventName) {
        return generic;
      }
    }
    return platformEventName;
  }

  public connectNode(nodeId: string, eventName: string, view: any): void {
    // Android-specific implementation
    // Similar structure to iOS and VisionOS adapters
  }

  public disconnectNode(nodeId: string, eventName: string): void {
    // Android-specific implementation
  }

  protected extractEventData(
    platformEventName: string,
    args: any,
    view: any
  ): any {
    // Android-specific implementation
    return {};
  }

  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string,
    view: any
  ): Promise<void> {
    // Android-specific implementation
  }
}

/**
 * AndroidXR-specific adapter implementation
 */
export class AndroidXRTriggerAdapterClass extends SubPlatformTriggerAdapterClass {
  // AndroidXR event mappings
  private eventMappings: Record<string, string> = {
    tap: "onRayClick",
    controller: "onControllerEvent",
    spatialgesture: "onSpatialGesture",
  };

  // Implementation would be similar to other adapters
  // but with AndroidXR-specific event handling

  protected mapToPlatformEvent(eventName: string): string {
    return this.eventMappings[eventName] || eventName;
  }

  protected mapFromPlatformEvent(platformEventName: string): string {
    for (const [generic, platform] of Object.entries(this.eventMappings)) {
      if (platform === platformEventName) {
        return generic;
      }
    }
    return platformEventName;
  }

  public connectNode(nodeId: string, eventName: string, view: any): void {
    // AndroidXR-specific implementation
  }

  public disconnectNode(nodeId: string, eventName: string): void {
    // AndroidXR-specific implementation
  }

  protected extractEventData(
    platformEventName: string,
    args: any,
    view: any
  ): any {
    // AndroidXR-specific implementation
    return {};
  }

  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string,
    view: any
  ): Promise<void> {
    // AndroidXR-specific implementation
  }
}

/**
 * HorizonOS-specific adapter implementation
 */
export class HorizonOSTriggerAdapterClass extends SubPlatformTriggerAdapterClass {
  // HorizonOS event mappings
  private eventMappings: Record<string, string> = {
    tap: "onPinchTap",
    handgesture: "onHandGesture",
    pointing: "onRayCastPointing",
    grab: "onGrabGesture",
  };

  // Implementation would be similar to other adapters
  // but with HorizonOS-specific event handling

  protected mapToPlatformEvent(eventName: string): string {
    return this.eventMappings[eventName] || eventName;
  }

  protected mapFromPlatformEvent(platformEventName: string): string {
    for (const [generic, platform] of Object.entries(this.eventMappings)) {
      if (platform === platformEventName) {
        return generic;
      }
    }
    return platformEventName;
  }

  public connectNode(nodeId: string, eventName: string, view: any): void {
    // HorizonOS-specific implementation
  }

  public disconnectNode(nodeId: string, eventName: string): void {
    // HorizonOS-specific implementation
  }

  protected extractEventData(
    platformEventName: string,
    args: any,
    view: any
  ): any {
    // HorizonOS-specific implementation
    return {};
  }

  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string,
    view: any
  ): Promise<void> {
    // HorizonOS-specific implementation
  }
}

/**
 * Extensions to the TriggerBridge
 */
export interface TriggerBridgeExtensions {
  // Allow using hierarchical platform types in event dispatching
  dispatchEvent(
    sourceTarget: PlatformType,
    sourceNodeId: string,
    eventName: string,
    eventData: any,
    destinationTarget?: PlatformType,
    destinationNodeId?: string,
    hierarchicalPlatform?: HierarchicalPlatformType
  ): void;

  // Add or update an event mapping with hierarchical platform types
  setHierarchicalEventMapping(
    fromTarget: HierarchicalPlatformType,
    toTarget: HierarchicalPlatformType,
    fromEvent: string,
    toEvent: string
  ): void;
}

/**
 * Factory function to create a hierarchical native adapter
 */
export function createNativeTriggerAdapter(): NativeTriggerAdapterClass {
  return new NativeTriggerAdapterClass();
}
