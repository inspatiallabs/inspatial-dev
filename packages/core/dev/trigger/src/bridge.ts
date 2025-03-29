/**
 * @file bridge.ts
 * @description Cross-platform event system with hierarchical platform support
 */
import {
  EventMessageType,
  PlatformType,
  NativeSubPlatformType,
  TriggerEventRegistryType,
  HierarchicalPlatformType,
  EventHandlerType,
} from "./types.ts";

/**
 * TriggerBridgeClass - Provides a unified event system across platforms
 */
export class TriggerBridgeClass {
  private static instance: TriggerBridgeClass;

  // Event registry maps target platforms to node IDs to event names to handlers
  private eventRegistry: TriggerEventRegistryType = {};

  // Event message queue for batched processing
  private messageQueue: EventMessageType[] = [];

  // Processing status flag
  private isProcessingQueue: boolean = false;

  // Registry of platform adapters
  private adapters: Map<PlatformType, PlatformTriggerAdapterClass> = new Map();

  // Registry of event mappings between platform types
  private eventMappings: Record<string, Record<string, string>> = {
    // DOM to GPU/3D event mappings
    "dom:inreal": {
      click: "tap",
      mousedown: "pointerdown",
      mouseup: "pointerup",
      mousemove: "pointermove",
      touchstart: "pointerdown",
      touchend: "pointerup",
      touchmove: "pointermove",
    },
    // DOM to Native event mappings
    "dom:native": {
      click: "tap",
      mousedown: "touch",
      mouseup: "touchEnd",
      mousemove: "pan",
      touchstart: "touch",
      touchend: "touchEnd",
      touchmove: "pan",
    },
    // GPU/3D to DOM event mappings
    "inreal:dom": {
      tap: "click",
      pointerdown: "mousedown",
      pointerup: "mouseup",
      pointermove: "mousemove",
    },
    // GPU/3D to Native event mappings
    "inreal:native": {
      tap: "tap",
      pointerdown: "touch",
      pointerup: "touchEnd",
      pointermove: "pan",
    },
    // Native to DOM event mappings
    "native:dom": {
      tap: "click",
      touch: "mousedown",
      touchEnd: "mouseup",
      pan: "mousemove",
    },
    // Native to GPU/3D event mappings
    "native:inreal": {
      tap: "tap",
      touch: "pointerdown",
      touchEnd: "pointerup",
      pan: "pointermove",
    },
  };

  // Hierarchical platform mappings
  private hierarchicalMappings: Record<string, Record<string, string>> = {};

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Set up queue processing interval
    setInterval(() => {
      if (this.messageQueue.length > 0 && !this.isProcessingQueue) {
        this.processQueue();
      }
    }, 10); // Process queue every 10ms if needed
  }

  /**
   * Get the singleton instance
   */
  public static init(): TriggerBridgeClass {
    if (!TriggerBridgeClass.instance) {
      TriggerBridgeClass.instance = new TriggerBridgeClass();
    }
    return TriggerBridgeClass.instance;
  }

  /**
   * Register a platform adapter
   */
  public registerTriggerExtension(adapter: PlatformTriggerAdapterClass): void {
    this.adapters.set(adapter.platformType, adapter);
    adapter.setBridge(this);
    console.log(`[TriggerBridge] Registered ${adapter.platformType} adapter`);
  }

  /**
   * Get a platform adapter
   */
  public getAdapter(
    platform: PlatformType
  ): PlatformTriggerAdapterClass | undefined {
    return this.adapters.get(platform);
  }

  /**
   * Register an event handler
   *
   * @param target - The platform target (can be hierarchical)
   * @param nodeId - The node ID to attach the event to
   * @param eventName - The event name
   * @param handler - The event handler function
   */
  public registerEventHandler(
    target: PlatformType | HierarchicalPlatformType,
    nodeId: string,
    eventName: string,
    handler: EventHandlerType
  ): void {
    // Get the base platform type for registry
    const basePlatform = this.getBasePlatform(target);

    // Initialize registry structure if needed
    if (!this.eventRegistry[basePlatform]) {
      this.eventRegistry[basePlatform] = {};
    }

    if (!this.eventRegistry[basePlatform][nodeId]) {
      this.eventRegistry[basePlatform][nodeId] = {};
    }

    // Store the handler
    this.eventRegistry[basePlatform][nodeId][eventName] = handler;

    // Connect with platform adapter if available
    const adapter = this.adapters.get(basePlatform);
    if (adapter) {
      adapter.connectNode(nodeId, eventName);
    }
  }

  /**
   * Unregister an event handler
   *
   * @param target - The platform target
   * @param nodeId - The node ID
   * @param eventName - The event name
   */
  public unregisterEventHandler(
    target: PlatformType | HierarchicalPlatformType,
    nodeId: string,
    eventName: string
  ): void {
    // Get the base platform type for registry
    const basePlatform = this.getBasePlatform(target);

    if (
      this.eventRegistry[basePlatform] &&
      this.eventRegistry[basePlatform][nodeId] &&
      this.eventRegistry[basePlatform][nodeId][eventName]
    ) {
      delete this.eventRegistry[basePlatform][nodeId][eventName];

      // Disconnect from platform adapter if available
      const adapter = this.adapters.get(basePlatform);
      if (adapter) {
        adapter.disconnectNode(nodeId, eventName);
      }
    }
  }

  /**
   * Create a message object
   */
  private createMessage(
    sourcePlatform: PlatformType | HierarchicalPlatformType,
    sourceNodeId: string,
    eventName: string,
    payload: any,
    destinationPlatform?: PlatformType | HierarchicalPlatformType,
    destinationNodeId?: string
  ): EventMessageType {
    // Extract base platform types for compatibility
    const sourceBase = this.getBasePlatform(sourcePlatform);
    const destinationBase = destinationPlatform
      ? this.getBasePlatform(destinationPlatform)
      : undefined;

    return {
      id: `${sourceBase}-${sourceNodeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceTarget: sourceBase,
      sourceNodeId,
      destinationTarget: destinationBase,
      destinationNodeId,
      eventName,
      payload,
      timestamp: Date.now(),
      // Add hierarchical platform information
      sourceHierarchicalPlatform:
        sourcePlatform !== sourceBase
          ? (sourcePlatform as HierarchicalPlatformType)
          : undefined,
      destinationHierarchicalPlatform:
        destinationPlatform !== destinationBase
          ? (destinationPlatform as HierarchicalPlatformType)
          : undefined,
    };
  }

  /**
   * Dispatch an event through the queue
   */
  public dispatchEvent(
    sourcePlatform: PlatformType | HierarchicalPlatformType,
    sourceNodeId: string,
    eventName: string,
    eventData: any,
    destinationPlatform?: PlatformType | HierarchicalPlatformType,
    destinationNodeId?: string
  ): void {
    // Create a standardized message
    const message = this.createMessage(
      sourcePlatform,
      sourceNodeId,
      eventName,
      eventData,
      destinationPlatform,
      destinationNodeId
    );

    // Add to the queue
    this.messageQueue.push(message);
  }

  /**
   * Process the message queue in batches
   */
  private async processQueue(): Promise<void> {
    if (this.messageQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;

    // Process in batches to prevent UI blocking
    const batch = this.messageQueue.splice(
      0,
      Math.min(10, this.messageQueue.length)
    );

    for (const message of batch) {
      await this.processMessage(message);
    }

    // Check if more processing is needed
    if (this.messageQueue.length > 0) {
      setTimeout(() => this.processQueue(), 0);
    } else {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(message: EventMessageType): Promise<void> {
    // If specific destination is set, route directly
    if (message.destinationTarget && message.destinationNodeId) {
      // Determine if we need to use hierarchical mapping
      let mappedEventName: string;

      if (
        message.sourceHierarchicalPlatform &&
        message.destinationHierarchicalPlatform
      ) {
        // Use hierarchical mapping if available
        mappedEventName = this.mapHierarchicalEvent(
          message.sourceHierarchicalPlatform,
          message.destinationHierarchicalPlatform,
          message.eventName
        );
      } else {
        // Use standard mapping
        mappedEventName = this.mapEvent(
          message.sourceTarget,
          message.destinationTarget,
          message.eventName
        );
      }

      // Find handler and execute
      this.executeHandler(
        message.destinationTarget,
        message.destinationNodeId,
        mappedEventName,
        message.payload
      );

      // Notify adapter if available
      const adapter = this.adapters.get(message.destinationTarget);
      if (adapter) {
        await adapter.handleMessage(message, mappedEventName);
      }
    } else {
      // Execute local handler if exists
      this.executeHandler(
        message.sourceTarget,
        message.sourceNodeId,
        message.eventName,
        message.payload
      );
    }
  }

  /**
   * Execute a registered handler for a specific event
   */
  private executeHandler(
    target: PlatformType,
    nodeId: string,
    eventName: string,
    eventData: any
  ): void {
    if (
      this.eventRegistry[target] &&
      this.eventRegistry[target][nodeId] &&
      this.eventRegistry[target][nodeId][eventName]
    ) {
      try {
        // Call the handler with the event data
        const handler = this.eventRegistry[target][nodeId][eventName];
        handler(eventData);
      } catch (error) {
        console.error(
          `[TriggerBridge] Error executing handler for ${target}:${nodeId}:${eventName}`,
          error
        );
      }
    }
  }

  /**
   * Map an event from one platform to another
   */
  public mapEvent(
    fromTarget: PlatformType,
    toTarget: PlatformType,
    fromEventName: string
  ): string {
    const mappingKey = `${fromTarget}:${toTarget}`;

    if (
      this.eventMappings[mappingKey] &&
      this.eventMappings[mappingKey][fromEventName]
    ) {
      return this.eventMappings[mappingKey][fromEventName];
    }

    // Return the original event name if no mapping exists
    return fromEventName;
  }

  /**
   * Map an event with hierarchical platform information
   */
  public mapHierarchicalEvent(
    fromPlatform: HierarchicalPlatformType,
    toPlatform: HierarchicalPlatformType,
    fromEventName: string
  ): string {
    // Check for direct hierarchical mapping
    const hierarchicalMappingKey = `${fromPlatform}:${toPlatform}`;

    if (
      this.hierarchicalMappings[hierarchicalMappingKey] &&
      this.hierarchicalMappings[hierarchicalMappingKey][fromEventName]
    ) {
      return this.hierarchicalMappings[hierarchicalMappingKey][fromEventName];
    }

    // Fall back to base platform mapping
    const fromBase = this.getBasePlatform(fromPlatform);
    const toBase = this.getBasePlatform(toPlatform);

    return this.mapEvent(fromBase, toBase, fromEventName);
  }

  /**
   * Forward an event from one node to another
   */
  public forwardEvent(
    fromTarget: PlatformType | HierarchicalPlatformType,
    toTarget: PlatformType | HierarchicalPlatformType,
    fromNodeId: string,
    toNodeId: string,
    fromEventName: string,
    eventData: any
  ): void {
    // Create and dispatch the message
    this.dispatchEvent(
      fromTarget,
      fromNodeId,
      fromEventName,
      eventData,
      toTarget,
      toNodeId
    );
  }

  /**
   * Create a bi-directional event forwarding between two nodes
   */
  public createEventLink(
    nodeA: { target: PlatformType | HierarchicalPlatformType; nodeId: string },
    nodeB: { target: PlatformType | HierarchicalPlatformType; nodeId: string },
    eventPairs: [string, string][]
  ): void {
    // For each event pair, set up bi-directional forwarding
    for (const [eventA, eventB] of eventPairs) {
      // Create a handler for A that forwards to B
      this.registerEventHandler(
        nodeA.target,
        nodeA.nodeId,
        eventA,
        (eventData) => {
          this.forwardEvent(
            nodeA.target,
            nodeB.target,
            nodeA.nodeId,
            nodeB.nodeId,
            eventA,
            eventData
          );
        }
      );

      // Create a handler for B that forwards to A
      this.registerEventHandler(
        nodeB.target,
        nodeB.nodeId,
        eventB,
        (eventData) => {
          this.forwardEvent(
            nodeB.target,
            nodeA.target,
            nodeB.nodeId,
            nodeA.nodeId,
            eventB,
            eventData
          );
        }
      );
    }
  }

  /**
   * Add or update an event mapping between base platforms
   */
  public setEventMapping(
    fromTarget: PlatformType,
    toTarget: PlatformType,
    fromEvent: string,
    toEvent: string
  ): void {
    const mappingKey = `${fromTarget}:${toTarget}`;

    if (!this.eventMappings[mappingKey]) {
      this.eventMappings[mappingKey] = {};
    }

    this.eventMappings[mappingKey][fromEvent] = toEvent;
  }

  /**
   * Set a hierarchical platform-specific event mapping
   */
  public setHierarchicalEventMapping(
    fromPlatform: HierarchicalPlatformType,
    toPlatform: HierarchicalPlatformType,
    fromEvent: string,
    toEvent: string
  ): void {
    const mappingKey = `${fromPlatform}:${toPlatform}`;

    if (!this.hierarchicalMappings[mappingKey]) {
      this.hierarchicalMappings[mappingKey] = {};
    }

    this.hierarchicalMappings[mappingKey][fromEvent] = toEvent;

    // Also set the base mapping for compatibility
    const fromBase = this.getBasePlatform(fromPlatform);
    const toBase = this.getBasePlatform(toPlatform);

    this.setEventMapping(fromBase, toBase, fromEvent, toEvent);
  }

  /**
   * Extract the base platform from a hierarchical platform identifier
   */
  private getBasePlatform(
    platform: PlatformType | HierarchicalPlatformType
  ): PlatformType {
    if (typeof platform === "string" && platform.includes(":")) {
      return platform.split(":")[0] as PlatformType;
    }
    return platform as PlatformType;
  }

  /**
   * Extract the sub-platform from a hierarchical platform identifier
   */
  private getSubPlatform(
    platform: HierarchicalPlatformType
  ): NativeSubPlatformType | null {
    if (platform.includes(":")) {
      return platform.split(":")[1] as NativeSubPlatformType;
    }
    return null;
  }
}

/**
 * Abstract class for platform-specific adapters
 */
export abstract class PlatformTriggerAdapterClass {
  protected bridge: TriggerBridgeClass | null = null;

  constructor(public readonly platformType: PlatformType) {}

  /**
   * Set the bridge reference
   */
  public setBridge(bridge: TriggerBridgeClass): void {
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
 * DOM Platform Adapter Implementation
 */
export class DomTriggerAdapterClass extends PlatformTriggerAdapterClass {
  private nodeElements: Map<string, HTMLElement> = new Map();
  private nodeListeners: Map<string, Map<string, (event: Event) => void>> =
    new Map();

  constructor() {
    super("dom");
  }

  /**
   * Register a DOM element with a node ID
   */
  public registerElement(nodeId: string, element: HTMLElement): void {
    this.nodeElements.set(nodeId, element);
  }

  /**
   * Connect to DOM events for a node
   */
  public connectNode(nodeId: string, eventName: string): void {
    const element = this.nodeElements.get(nodeId);
    if (!element) {
      console.warn(
        `[DomTriggerAdapter] No element registered for node ${nodeId}`
      );
      return;
    }

    // Initialize listener maps if needed
    if (!this.nodeListeners.has(nodeId)) {
      this.nodeListeners.set(nodeId, new Map());
    }

    const nodeListeners = this.nodeListeners.get(nodeId)!;

    // Remove existing listener if any
    if (nodeListeners.has(eventName)) {
      element.removeEventListener(eventName, nodeListeners.get(eventName)!);
    }

    // Create and store the new listener
    const listener = (event: Event) => {
      if (!this.bridge) return;

      // Extract relevant data from DOM event
      const eventData = this.extractEventData(event);

      // Dispatch to the bridge
      this.bridge.dispatchEvent("dom", nodeId, eventName, eventData);
    };

    // Add the listener to the element
    element.addEventListener(eventName, listener);
    nodeListeners.set(eventName, listener);
  }

  /**
   * Disconnect from DOM events
   */
  public disconnectNode(nodeId: string, eventName: string): void {
    const element = this.nodeElements.get(nodeId);
    const nodeListeners = this.nodeListeners.get(nodeId);

    if (element && nodeListeners && nodeListeners.has(eventName)) {
      element.removeEventListener(eventName, nodeListeners.get(eventName)!);
      nodeListeners.delete(eventName);
    }
  }

  /**
   * Extract relevant data from DOM events
   */
  private extractEventData(event: Event): any {
    const data: any = {
      type: event.type,
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      timeStamp: event.timeStamp,
    };

    // Handle specific event types
    if (event instanceof MouseEvent) {
      data.clientX = event.clientX;
      data.clientY = event.clientY;
      data.button = event.button;
    } else if (event instanceof KeyboardEvent) {
      data.key = event.key;
      data.code = event.code;
      data.ctrlKey = event.ctrlKey;
      data.shiftKey = event.shiftKey;
      data.altKey = event.altKey;
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      data.touches = Array.from(event.touches).map((touch) => ({
        identifier: touch.identifier,
        clientX: touch.clientX,
        clientY: touch.clientY,
      }));
    }

    return data;
  }

  /**
   * Handle messages from other platforms
   */
  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string
  ): Promise<void> {
    const element = this.nodeElements.get(message.destinationNodeId!);
    if (!element) {
      console.warn(
        `[DomTriggerAdapter] Cannot find element for node ${message.destinationNodeId}`
      );
      return;
    }

    // Handle specific event types
    switch (mappedEventName) {
      case "click":
        this.simulateClick(element, message.payload);
        break;
      case "mousedown":
      case "mouseup":
      case "mousemove":
        this.simulateMouseEvent(element, mappedEventName, message.payload);
        break;
      default:
        // For other events, dispatch a custom event
        this.dispatchCustomEvent(element, mappedEventName, message.payload);
    }
  }

  /**
   * Simulate a click event
   */
  private simulateClick(element: HTMLElement, payload: any): void {
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: payload.clientX ?? 0,
      clientY: payload.clientY ?? 0,
      button: payload.button ?? 0,
    });

    element.dispatchEvent(clickEvent);
  }

  /**
   * Simulate mouse events
   */
  private simulateMouseEvent(
    element: HTMLElement,
    eventType: string,
    payload: any
  ): void {
    const mouseEvent = new MouseEvent(eventType, {
      bubbles: true,
      cancelable: true,
      clientX: payload.clientX ?? 0,
      clientY: payload.clientY ?? 0,
      button: payload.button ?? 0,
    });

    element.dispatchEvent(mouseEvent);
  }

  /**
   * Dispatch a custom event
   */
  private dispatchCustomEvent(
    element: HTMLElement,
    eventType: string,
    payload: any
  ): void {
    const customEvent = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      detail: payload,
    });

    element.dispatchEvent(customEvent);
  }
}

/**
 * InReal Platform Adapter Implementation
 */
export class InRealTriggerAdapterClass extends PlatformTriggerAdapterClass {
  private sceneObjects: Map<string, any> = new Map();
  private objectListeners: Map<string, Map<string, (event: any) => void>> =
    new Map();

  constructor(private engine: any) {
    super("inreal");
  }

  /**
   * Register a 3D object with a node ID
   */
  public registerObject(nodeId: string, object: any): void {
    this.sceneObjects.set(nodeId, object);
  }

  /**
   * Connect to 3D object events
   */
  public connectNode(nodeId: string, eventName: string): void {
    const object = this.sceneObjects.get(nodeId);
    if (!object) {
      console.warn(
        `[InRealTriggerAdapter] No object registered for node ${nodeId}`
      );
      return;
    }

    // Initialize listener maps if needed
    if (!this.objectListeners.has(nodeId)) {
      this.objectListeners.set(nodeId, new Map());
    }

    const listeners = this.objectListeners.get(nodeId)!;

    // Remove existing listener if any
    if (listeners.has(eventName)) {
      object.removeEventListener(eventName, listeners.get(eventName)!);
    }

    // Create and store new listener
    const listener = (event: any) => {
      if (!this.bridge) return;

      // Extract data from 3D event
      const eventData = this.extract3DEventData(event, object);

      // Dispatch to bridge
      this.bridge.dispatchEvent("inreal", nodeId, eventName, eventData);
    };

    // Add listener to 3D object
    object.addEventListener(eventName, listener);
    listeners.set(eventName, listener);
  }

  /**
   * Disconnect from 3D object events
   */
  public disconnectNode(nodeId: string, eventName: string): void {
    const object = this.sceneObjects.get(nodeId);
    const listeners = this.objectListeners.get(nodeId);

    if (object && listeners && listeners.has(eventName)) {
      object.removeEventListener(eventName, listeners.get(eventName)!);
      listeners.delete(eventName);
    }
  }

  /**
   * Extract data from 3D events
   */
  private extract3DEventData(event: any, object: any): any {
    // Basic event data
    const data: any = {
      type: event.type,
      timestamp: Date.now(),
    };

    // Extract 3D-specific properties
    if (object.position) {
      data.position = {
        x: object.position.x,
        y: object.position.y,
        z: object.position.z,
      };
    }

    // Extract event-specific data
    if (event.position) {
      data.eventPosition = {
        x: event.position.x,
        y: event.position.y,
        z: event.position.z,
      };
    }

    if (event.normal) {
      data.normal = {
        x: event.normal.x,
        y: event.normal.y,
        z: event.normal.z,
      };
    }

    return data;
  }

  /**
   * Handle messages from other platforms
   */
  public async handleMessage(
    message: EventMessageType,
    mappedEventName: string
  ): Promise<void> {
    const object = this.sceneObjects.get(message.destinationNodeId!);
    if (!object) {
      console.warn(
        `[InRealTriggerAdapter] Cannot find object for node ${message.destinationNodeId}`
      );
      return;
    }

    switch (mappedEventName) {
      case "pointerdown":
      case "pointerup":
      case "pointermove":
        this.simulate3DPointerEvent(object, mappedEventName, message.payload);
        break;
      case "tap":
        this.simulate3DTap(object, message.payload);
        break;
      default:
        console.log(
          `[InRealTriggerAdapter] Handling ${mappedEventName} for node ${message.destinationNodeId}`
        );
      // Would implement more specialized handling here
    }
  }

  /**
   * Simulate 3D pointer events
   */
  private simulate3DPointerEvent(
    object: any,
    eventType: string,
    payload: any
  ): void {
    // This would use InReal Engines APIs in a real implementation
    console.log(`[InRealTriggerAdapter] Simulating ${eventType} on 3D object`);

    // Example: create a synthetic event object
    const syntheticEvent = {
      type: eventType,
      target: object,
      position: payload.position || { x: 0, y: 0, z: 0 },
    };

    // Dispatch event through InReal's event system
    if (typeof object.dispatchEvent === "function") {
      object.dispatchEvent(syntheticEvent);
    }
  }

  /**
   * Simulate a tap/click on a 3D object
   */
  private simulate3DTap(object: any, payload: any): void {
    // Similar to pointer events but specific to taps
    this.simulate3DPointerEvent(object, "tap", payload);
  }
}

/**
 * Create and export a singleton instance
 */
export const triggerBridge = TriggerBridgeClass.init();

/**
 * Helper function to initialize the entire system
 *
 * This synchronous version initializes only what's directly available,
 * skipping dynamic imports for better compatibility.
 */
export function initTriggerBridge(
  domTriggerAdapter?: boolean,
  nativeAdapter?: boolean,
  inrealEngine?: any
): TriggerBridgeClass {
  const bridge = TriggerBridgeClass.init();

  // Register DOM adapter if requested
  if (
    domTriggerAdapter &&
    typeof window !== "undefined" &&
    typeof document !== "undefined"
  ) {
    const adapter = new DomTriggerAdapterClass();
    bridge.registerTriggerExtension(adapter);
  }

  // For the native adapter, caller needs to import and pass it directly
  // This avoids dynamic import issues in different environments

  // Register InReal adapter if engine provided
  if (inrealEngine) {
    const adapter = new InRealTriggerAdapterClass(inrealEngine);
    bridge.registerTriggerExtension(adapter);
  }

  console.log("[TriggerBridge] System initialized");

  return bridge;
}

/**
 * Example usage:
 *
 * // Initialize the bridge
 * const bridge = initTriggerBridge(true, false, inrealEngine);
 *
 * // If you need to use the hierarchical native adapter:
 * // import { createNativeTriggerAdapter } from "./hpa.ts";
 * // const nativeAdapter = createNativeTriggerAdapter();
 * // bridge.registerTriggerExtension(nativeAdapter);
 *
 * // Set up platform-specific event mappings
 * bridge.setHierarchicalEventMapping(
 *   'dom',
 *   'native:visionos',
 *   'click',
 *   'spatialTap'
 * );
 *
 * // Get adapters
 * const domTriggerAdapter = bridge.getAdapter('dom') as DomTriggerAdapterClass;
 * // const nativeAdapter = bridge.getAdapter('native') as HierarchicalNativeAdapter;
 *
 * // Register elements/views
 * if (domTriggerAdapter) {
 *   domTriggerAdapter.registerElement('button1', document.getElementById('myButton')!);
 * }
 *
 * // if (nativeAdapter) {
 * //   nativeAdapter.registerView('spatialButton', mySpatialButton);
 * // }
 *
 * // Create event links with hierarchical platform types
 * bridge.createEventLink(
 *   { target: 'dom', nodeId: 'button1' },
 *   { target: 'native:visionos', nodeId: 'spatialButton' },
 *   [['click', 'spatialTap']]
 * );
 */
