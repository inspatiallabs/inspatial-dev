/**
 * @file action.ts
 * @description Trigger Action API for creating and managing triggers
 */

// @ts-ignore - Ignoring TS extension import error
import type { TriggerBridgeClass } from "./bridge.ts";
// @ts-ignore - Ignoring TS extension import error
import { triggerRegistry, getRegisteredTrigger, getTriggerMetadata, registerTrigger } from "./registry.ts";
// @ts-ignore - Ignoring TS extension import error
import { triggerMonitoringInstance } from "./monitoring.ts";
// @ts-ignore - Ignoring TS extension import error
import { errorLogger, type TriggerErrorClass as _TriggerErrorClass } from "./errors.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  ErrorCodeEnum,
  TriggerEventDeliveryStatusEnum,
} from "./types.ts";
// @ts-ignore - Ignoring TS extension import error
import type {
  TriggerInstanceType,
  TriggerConfigType,
  PlatformType,
  HierarchicalPlatformType,
  RegisteredTriggerType,
  TriggerDefinitionMetadataType,
  TriggerCategoryEnum as _TriggerCategoryEnum
} from "./types.ts";

/**
 * Trigger management class
 */
export class TriggerManagerClass {
  private static instance: TriggerManagerClass;
  private bridge: TriggerBridgeClass;
  private activeTriggers: Map<string, TriggerInstanceType> = new Map();

  // Timers for delayed triggers (like onWait)
  private triggerTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Throttle and debounce trackers
  private throttledTriggers: Map<
    string,
    { lastFired: number; throttleTime: number }
  > = new Map();
  private debouncedTriggers: Map<
    string,
    { timerId: ReturnType<typeof setTimeout>; debounceTime: number }
  > = new Map();

  // Track one-time triggers
  private firedOnceTriggers: Set<string> = new Set();

  private constructor(bridge: TriggerBridgeClass) {
    this.bridge = bridge;
  }

  /**
   * Initialize singleton instance
   */
  public static init(bridge: TriggerBridgeClass): TriggerManagerClass {
    if (!TriggerManagerClass.instance) {
      TriggerManagerClass.instance = new TriggerManagerClass(bridge);
    }
    return TriggerManagerClass.instance;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TriggerManagerClass {
    if (!TriggerManagerClass.instance) {
      throw new Error(
        "TriggerManagerClass not initialized. Call init() first."
      );
    }
    return TriggerManagerClass.instance;
  }

  /**
   * Create a trigger instance
   */
  public createTrigger(config: TriggerConfigType): TriggerInstanceType {
    // Validate trigger type exists
    const triggerDef = triggerRegistry.getTriggerType(config.type);
    if (!triggerDef) {
      throw errorLogger.error(
        `Unknown trigger type: ${config.type}`,
        ErrorCodeEnum.INVALID_PARAMETER
      );
    }

    // Generate ID if not provided
    const triggerId =
      config.id ||
      `trigger-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Detect platform from target if not specified
    const platform =
      config.platform || this.detectPlatformFromTarget(config.target);

    // Check compatibility
    if (
      !triggerRegistry.isTriggerCompatibleWithPlatform(config.type, platform)
    ) {
      // Check for fallbacks
      if (
        config.fallbacks &&
        config.fallbacks[platform as HierarchicalPlatformType]
      ) {
        const fallbackConfig = {
          ...config,
          ...config.fallbacks[platform as HierarchicalPlatformType],
        };
        return this.createTrigger(fallbackConfig);
      }

      // No fallback available
      errorLogger.warning(
        `Trigger type ${config.type} is not compatible with platform ${platform}. Trigger will be created but may not work.`,
        ErrorCodeEnum.GENERAL_ERROR,
        { triggerId, type: config.type, platform }
      );
    }

    // Register the node with adapter if needed
    const nodeId =
      config.nodeId || this.registerTargetWithAdapter(config.target, platform);

    // Create wrapped action handler with trigger features
    const wrappedAction = this.createActionWrapper(
      triggerId,
      config,
      platform,
      nodeId
    );

    // Register with bridge
    this.bridge.registerEventHandler(
      platform,
      nodeId,
      config.type,
      wrappedAction
    );

    // Create trigger instance object
    const triggerInstance: TriggerInstanceType = {
      id: triggerId,
      type: config.type,
      enabled: true,
      params: { ...config },
      execute: (_args: any[]) => undefined, // Simple mock function implementation with underscore for unused param

      // Management methods
      disable: () => this.disableTrigger(triggerId),
      enable: () => this.enableTrigger(triggerId),
      destroy: () => this.destroyTrigger(triggerId),
      update: (newParams: Record<string, any>) => this.updateTrigger(triggerId, newParams),
      fire: (payload: any) => this.fireTrigger(triggerId, payload),
    };

    // Store in active triggers
    this.activeTriggers.set(triggerId, triggerInstance);

    // Handle special trigger types
    this.setupSpecialTriggerBehaviors(triggerInstance, config);

    return triggerInstance;
  }

  /**
   * Create a chain of triggers that execute sequentially
   */
  public createTriggerSequence(
    configs: TriggerConfigType[]
  ): TriggerInstanceType {
    // Implementation details would go here
    // This is a simplified placeholder
    const _chainId = `chain-${Date.now()}`; // Prefix with underscore to indicate intentionally unused

    // Create individual triggers but connect them
    const triggers = configs.map((config) => this.createTrigger(config));

    // Simple mock implementation that returns the first trigger
    // A full implementation would be more complex
    return triggers[0];
  }

  /**
   * Create a group of triggers that can be managed together
   */
  public createTriggerGroup(configs: TriggerConfigType[]): {
    triggers: TriggerInstanceType[];
    enableAll: () => void;
    disableAll: () => void;
    destroyAll: () => void;
  } {
    const triggers = configs.map((config) => this.createTrigger(config));

    return {
      triggers,
      enableAll: () => triggers.forEach((trigger) => trigger.enable()),
      disableAll: () => triggers.forEach((trigger) => trigger.disable()),
      destroyAll: () => triggers.forEach((trigger) => trigger.destroy()),
    };
  }

  /**
   * Create a conditional trigger that changes based on a condition
   */
  public createConditionalTrigger(config: {
    condition: (state: any) => boolean;
    trueTrigger: TriggerConfigType;
    falseTrigger: TriggerConfigType;
  }): TriggerInstanceType {
    // Implementation details would go here
    // This is a simplified placeholder
    const _conditionalId = `conditional-${Date.now()}`; // Prefix with underscore to indicate intentionally unused

    // Simple implementation - just create trueTrigger for now
    return this.createTrigger(config.trueTrigger);
  }

  /**
   * Disable a trigger
   */
  public disableTrigger(triggerId: string): void {
    const trigger = this.activeTriggers.get(triggerId);
    if (!trigger) return;

    trigger.enabled = false;

    // Clear any timers
    if (this.triggerTimers.has(triggerId)) {
      clearTimeout(this.triggerTimers.get(triggerId));
      this.triggerTimers.delete(triggerId);
    }

    // Clear any debounce timers
    if (this.debouncedTriggers.has(triggerId)) {
      clearTimeout(this.debouncedTriggers.get(triggerId)!.timerId);
    }
  }

  /**
   * Enable a trigger
   */
  public enableTrigger(triggerId: string): void {
    const trigger = this.activeTriggers.get(triggerId);
    if (!trigger) return;

    trigger.enabled = true;

    // Restart special trigger behaviors if needed
    if (trigger.type === "onWait" && trigger.params) {
      this.setupWaitTrigger(trigger, trigger.params as TriggerConfigType);
    }
  }

  /**
   * Destroy a trigger
   */
  public destroyTrigger(triggerId: string): void {
    const trigger = this.activeTriggers.get(triggerId);
    if (!trigger) return;

    // Disable first
    this.disableTrigger(triggerId);

    // Unregister from bridge
    if (trigger.params) {
      const platform = trigger.params.platform;
      const nodeId = trigger.params.nodeId;
      if (platform && nodeId) {
        this.bridge.unregisterEventHandler(platform, nodeId, trigger.type);
      }
    }

    // Remove from active triggers
    this.activeTriggers.delete(triggerId);

    // Clean up other collections
    this.firedOnceTriggers.delete(triggerId);
    this.throttledTriggers.delete(triggerId);
    this.debouncedTriggers.delete(triggerId);
  }

  /**
   * Update a trigger's configuration
   */
  public updateTrigger(
    triggerId: string,
    newParams: Record<string, any>
  ): void {
    const trigger = this.activeTriggers.get(triggerId);
    if (!trigger || !trigger.params) return;

    // Store old values for reference
    const oldParams = { ...trigger.params };

    // Update params
    trigger.params = { ...trigger.params, ...newParams };

    // Check if we need to re-register due to critical changes
    const criticalChanges = ["type", "target", "platform", "nodeId"].some(
      (key) => key in newParams && newParams[key] !== oldParams[key]
    );

    if (criticalChanges) {
      // Re-create the trigger with new params
      const newTrigger = this.createTrigger(
        trigger.params as TriggerConfigType
      );

      // Copy the ID to maintain reference
      newTrigger.id = triggerId;

      // Destroy old trigger registration
      this.destroyTrigger(triggerId);

      // Store updated trigger
      this.activeTriggers.set(triggerId, newTrigger);
    }

    // Update throttle/debounce if changed
    if (
      "throttle" in newParams &&
      trigger.params.throttle !== oldParams.throttle
    ) {
      if (this.throttledTriggers.has(triggerId)) {
        this.throttledTriggers.set(triggerId, {
          lastFired: this.throttledTriggers.get(triggerId)!.lastFired,
          throttleTime: trigger.params.throttle,
        });
      }
    }

    if (
      "debounce" in newParams &&
      trigger.params.debounce !== oldParams.debounce
    ) {
      if (this.debouncedTriggers.has(triggerId)) {
        // Clear existing timer
        clearTimeout(this.debouncedTriggers.get(triggerId)!.timerId);
        this.debouncedTriggers.delete(triggerId);
        // New timer will be created on next event
      }
    }
  }

  /**
   * Manually fire a trigger
   */
  public fireTrigger(triggerId: string, customPayload?: any): void {
    const trigger = this.activeTriggers.get(triggerId);
    if (!trigger || !trigger.enabled || !trigger.params) return;

    // Create a synthetic event message
    const payload = customPayload || { triggered: true, manual: true };

    // Execute the action
    if (trigger.params.action) {
      trigger.params.action(payload);
    }

    // Log performance data
    triggerMonitoringInstance.trackEventCompletion(
      triggerId,
      trigger.params.platform as PlatformType,
      trigger.type,
      TriggerEventDeliveryStatusEnum.DELIVERED, // Status
      trigger.params.nodeId || "unknown",
      undefined,
      undefined
    );
  }

  /**
   * Create action wrapper with trigger features
   */
  private createActionWrapper(
    triggerId: string,
    config: TriggerConfigType,
    platform: PlatformType | HierarchicalPlatformType,
    nodeId: string
  ): (eventData: any) => void {
    const originalAction = config.action;

    return (eventData: any) => {
      const trigger = this.activeTriggers.get(triggerId);

      // Skip if trigger disabled or was destroyed
      if (!trigger || !trigger.enabled) return;

      // Track performance at start
      triggerMonitoringInstance.trackEventStart(
        triggerId,
        platform as PlatformType,
        config.type,
        nodeId
      );

      // Skip if once-only and already fired
      if (config.once && this.firedOnceTriggers.has(triggerId)) {
        return;
      }

      // Check condition
      if (config.condition && !config.condition(eventData)) {
        return;
      }

      // Handle throttling
      if (config.throttle && this.throttledTriggers.has(triggerId)) {
        const { lastFired, throttleTime } =
          this.throttledTriggers.get(triggerId)!;
        const now = Date.now();

        if (now - lastFired < throttleTime) {
          return;
        }

        // Update last fired time
        this.throttledTriggers.set(triggerId, { lastFired: now, throttleTime });
      } else if (config.throttle) {
        // Initialize throttle tracking
        this.throttledTriggers.set(triggerId, {
          lastFired: Date.now(),
          throttleTime: config.throttle,
        });
      }

      // Handle debouncing
      if (config.debounce) {
        // Clear existing timer
        if (this.debouncedTriggers.has(triggerId)) {
          clearTimeout(this.debouncedTriggers.get(triggerId)!.timerId);
        }

        // Set new timer
        const timerId = setTimeout(() => {
          // Only execute if still active
          if (
            this.activeTriggers.has(triggerId) &&
            this.activeTriggers.get(triggerId)!.enabled
          ) {
            originalAction(eventData);

            // Mark as fired if once-only
            if (config.once) {
              this.firedOnceTriggers.add(triggerId);
            }

            // Track completion
            triggerMonitoringInstance.trackEventCompletion(
              triggerId,
              platform as PlatformType,
              config.type,
              TriggerEventDeliveryStatusEnum.DELIVERED,
              nodeId
            );
          }

          // Remove from debounced triggers
          this.debouncedTriggers.delete(triggerId);
        }, config.debounce);

        // Store timer
        this.debouncedTriggers.set(triggerId, {
          timerId,
          debounceTime: config.debounce,
        });

        return;
      }

      // Execute action
      try {
        originalAction(eventData);

        // Mark as fired if once-only
        if (config.once) {
          this.firedOnceTriggers.add(triggerId);
        }

        // Track completion
        triggerMonitoringInstance.trackEventCompletion(
          triggerId,
          platform as PlatformType,
          config.type,
          TriggerEventDeliveryStatusEnum.DELIVERED,
          nodeId
        );
      } catch (error) {
        // Log error
        errorLogger.error(
          `Error executing trigger action for ${config.type}: ${(error as Error).message}`,
          ErrorCodeEnum.EVENT_HANDLING_FAILED,
          { triggerId, type: config.type, nodeId }
        );

        // Track error
        triggerMonitoringInstance.trackEventCompletion(
          triggerId,
          platform as PlatformType,
          config.type,
          TriggerEventDeliveryStatusEnum.FAILED,
          nodeId,
          undefined,
          (error as Error).message
        );
      }
    };
  }

  /**
   * Setup special trigger behaviors
   */
  private setupSpecialTriggerBehaviors(
    trigger: TriggerInstanceType,
    config: TriggerConfigType
  ): void {
    // Handle special trigger types
    switch (trigger.type) {
      case "onWait":
        this.setupWaitTrigger(trigger, config);
        break;
      case "onStart":
        // Fire immediately for onStart triggers
        setTimeout(() => {
          this.fireTrigger(trigger.id, { type: "start" });
        }, 0);
        break;
      // Handle other special cases
    }

    // Setup throttling
    if (config.throttle) {
      this.throttledTriggers.set(trigger.id, {
        lastFired: 0, // Never fired yet
        throttleTime: config.throttle,
      });
    }
  }

  /**
   * Setup wait trigger behavior
   */
  private setupWaitTrigger(
    trigger: TriggerInstanceType,
    config: TriggerConfigType
  ): void {
    if (!trigger.enabled) return;

    const duration = config.duration || 1000;

    // Clear any existing timer
    if (this.triggerTimers.has(trigger.id)) {
      clearTimeout(this.triggerTimers.get(trigger.id));
    }

    // Set new timer
    const timerId = setTimeout(() => {
      if (trigger.enabled) {
        this.fireTrigger(trigger.id, { waited: true, duration });
      }
      this.triggerTimers.delete(trigger.id);
    }, duration);

    this.triggerTimers.set(trigger.id, timerId);
  }

  /**
   * Detect platform from target
   */
  private detectPlatformFromTarget(
    target: any
  ): PlatformType | HierarchicalPlatformType {
    if (!target) return "dom"; // Default

    // Handle DOM elements
    if (typeof window !== "undefined" && target instanceof HTMLElement) {
      return "dom";
    }

    // Handle native views - this is simplified and would need actual detection
    if (target && typeof target === "object" && "nativeTag" in target) {
      return "native";
    }

    // Handle InReal objects
    if (target && typeof target === "object" && "isInRealObject" in target) {
      return "inreal";
    }

    // Default fallback
    return "dom";
  }

  /**
   * Register target with appropriate adapter
   */
  private registerTargetWithAdapter(
    target: any,
    platform: PlatformType | HierarchicalPlatformType
  ): string {
    if (!target) return `auto-${Date.now()}`;

    // Extract base platform
    const basePlatform = platform.includes(":")
      ? (platform.split(":")[0] as PlatformType)
      : (platform as PlatformType);

    // Get adapter
    const adapter = this.bridge.getAdapter(basePlatform);
    if (!adapter) {
      return `unregistered-${Date.now()}`;
    }

    // Generate node ID
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Register with appropriate adapter method
    switch (basePlatform) {
      case "dom":
        if (typeof (adapter as any).registerElement === "function") {
          (adapter as any).registerElement(nodeId, target);
        }
        break;
      case "native":
        if (typeof (adapter as any).registerView === "function") {
          (adapter as any).registerView(nodeId, target);
        }
        break;
      case "inreal":
        if (typeof (adapter as any).registerObject === "function") {
          (adapter as any).registerObject(nodeId, target);
        }
        break;
    }

    return nodeId;
  }
}

// Initialize with bridge
export const initTriggerManager = (
  bridge: TriggerBridgeClass
): TriggerManagerClass => {
  return TriggerManagerClass.init(bridge);
};

// Convenience functions that use the singleton
export const createTriggerInstance = (
  config: TriggerConfigType
): TriggerInstanceType => {
  return TriggerManagerClass.getInstance().createTrigger(config);
};

export const createTriggerSequence = (
  configs: TriggerConfigType[]
): TriggerInstanceType => {
  return TriggerManagerClass.getInstance().createTriggerSequence(configs);
};

export const createTriggerGroup = (configs: TriggerConfigType[]) => {
  return TriggerManagerClass.getInstance().createTriggerGroup(configs);
};

export const createConditionalTrigger = (config: {
  condition: (state: any) => boolean;
  trueTrigger: TriggerConfigType;
  falseTrigger: TriggerConfigType;
}): TriggerInstanceType => {
  return TriggerManagerClass.getInstance().createConditionalTrigger(config);
};

// --- Core Trigger Definition and Activation --- 

/**
 * Defines a new trigger, returning an object containing its name and action.
 * This definition can then be registered using `registerTrigger`.
 *
 * @template S The type of the state the trigger operates on.
 * @template P The types of the payload arguments the action accepts.
 * @param config Object containing the trigger name and action function.
 * @returns A RegisteredTriggerType object.
 */
export function createTrigger<S = any, P extends any[] = any[]>(
  config: Pick<RegisteredTriggerType<S, P>, 'name' | 'action'>
): RegisteredTriggerType<S, P> {
  // Basic validation
  if (!config || typeof config.name !== 'string' || !config.name) {
     throw new Error('Invalid trigger config: name is required.');
  }
  if (typeof config.action !== 'function') {
     throw new Error(`Invalid trigger config for "${config.name}": action must be a function.`);
  }
  
  // Build the definition object
  const definition: RegisteredTriggerType<S, P> = {
    name: config.name,
    action: config.action,
  } as RegisteredTriggerType<S, P>;

  // Auto-register so that tests and callers can immediately activate it
  try {
    registerTrigger(definition);
  } catch (err) {
    // Ignore duplicate registrations silently in createTrigger context
  }

  return definition;
}

/**
 * # ActivateTrigger
 * @summary #### Executes a registered trigger and updates the application state
 * 
 * The `activateTrigger` function locates a trigger in the registry by name and executes its action
 * with the current state and provided payload. Think of it like pressing a button on a remote control
 * that's already been programmed - you provide the button name (trigger) and it performs the specific
 * action associated with that button.
 * 
 * @since 1.0.0   
 * @category InSpatial State
 * @module @inspatial/state/trigger
 * @kind function
 * @access public
 * 
 * ### 💡 Core Concepts
 * - Triggers are state transition mechanisms that respond to events or manual activation
 * - Each trigger has a unique name and an action function that knows how to update the state
 * - When activated, the trigger's action receives the current state and optional payload parameters
 * - The function safely handles state transitions and provides appropriate error handling
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - The trigger must already be registered in the system using `registerTrigger`
 * - You need to know the exact name of the trigger you want to activate
 * 
 * ### 📚 Terminology
 * > **Trigger**: A named function that can modify application state in response to an activation.
 * > **State Transition**: The process of transforming the current state to a new state based on specific logic.
 * 
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 * 
 * > [!NOTE]
 * > This function is primarily called internally by the state management system when
 * > triggers are invoked via `state.action.triggerName()`. You rarely need to call this directly.
 * 
 * > [!NOTE]
 * > If the trigger's action returns `undefined`, the original state is returned unchanged.
 * </details>
 * 
 * @param {string} triggerName - Identifies which registered trigger to activate (e.g., "player:jump" or "ui:showMenu")
 *    Must match exactly with a name in the trigger registry.
 * 
 * @param {S} currentState - The current application state that will be passed to the trigger's action
 *    This state object will be the foundation for any modifications made by the trigger.
 * 
 * @param {...P} payload - Additional arguments to pass to the trigger's action function
 *    Can include any data needed for the trigger to perform its state transition correctly.
 * 
 * ### 🎮 Usage
 * 
 * @example
 * ### Example 1: Basic Trigger Activation
 * ```typescript
 * // First, we need to register a trigger that defines a state transition
 * import { registerTrigger, activateTrigger } from "@inspatial/state/trigger";
 * 
 * // Let's create a simple trigger that increments a counter in our state
 * registerTrigger({
 *   name: "counter:increment",
 *   action: (state, amount = 1) => {
 *     // Return a new state with the counter increased by the specified amount
 *     return { ...state, counter: (state.counter || 0) + amount };
 *   }
 * });
 * 
 * // Now we can activate this trigger with our current state
 * const initialState = { counter: 5 };
 * 
 * // Activate the trigger to increment by the default amount (1)
 * const newState = activateTrigger("counter:increment", initialState);
 * console.log(newState); // Output: { counter: 6 }
 * 
 * // We can also pass custom arguments to the trigger action
 * const newStateWithCustomIncrement = activateTrigger("counter:increment", initialState, 3);
 * console.log(newStateWithCustomIncrement); // Output: { counter: 8 }
 * ```
 * 
 * @example
 * ### Example 2: Handling Complex State Transitions
 * ```typescript
 * // Let's create a trigger for managing a shopping cart
 * registerTrigger({
 *   name: "cart:addItem",
 *   action: (state, item) => {
 *     // Check if the item is valid
 *     if (!item || !item.id) {
 *       console.warn("Attempted to add invalid item to cart");
 *       return state; // Return unchanged state for invalid items
 *     }
 *     
 *     // Create a new items array with the new item added
 *     const existingItems = state.cart?.items || [];
 *     const newItems = [...existingItems, item];
 *     
 *     // Calculate the new total price
 *     const totalPrice = newItems.reduce((sum, item) => sum + (item.price || 0), 0);
 *     
 *     // Return the new state with updated cart
 *     return {
 *       ...state,
 *       cart: {
 *         ...state.cart,
 *         items: newItems,
 *         totalPrice,
 *         itemCount: newItems.length
 *       }
 *     };
 *   }
 * });
 * 
 * // Initial state with an empty cart
 * const appState = {
 *   user: { id: "user123", name: "Alice" },
 *   cart: { items: [], totalPrice: 0, itemCount: 0 }
 * };
 * 
 * // Add a product to the cart
 * const newState = activateTrigger("cart:addItem", appState, { 
 *   id: "prod-101", 
 *   name: "Wireless Headphones", 
 *   price: 59.99 
 * });
 * 
 * console.log(newState.cart);
 * // Output: { 
 * //   items: [{ id: "prod-101", name: "Wireless Headphones", price: 59.99 }], 
 * //   totalPrice: 59.99, 
 * //   itemCount: 1 
 * // }
 * ```
 * 
 * @example
 * ### Example 3: Error Handling When Trigger Doesn't Exist
 * ```typescript
 * // Try to activate a trigger that hasn't been registered
 * try {
 *   const state = { data: "important" };
 *   const newState = activateTrigger("nonexistent:trigger", state);
 * } catch (error) {
 *   console.error("Expected error:", error.message);
 *   // Output: Expected error: Trigger named "nonexistent:trigger" not found in registry.
 * }
 * ```
 * 
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 * 
 * - Keep your trigger actions lightweight and focused on state transitions
 * - For expensive operations, consider using async actions with promises
 * - When handling large state objects, use immutable update patterns for better performance
 * </details>
 * 
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 * 
 * - Activating triggers that haven't been registered yet
 * - Modifying the state object directly inside trigger actions instead of returning a new one
 * - Forgetting to handle potential errors when the trigger isn't found
 * </details>
 * 
 * @throws {Error}
 * Throws an error if the specified trigger name is not found in the registry.
 * This often happens when you try to activate a trigger before registering it.
 * 
 * @returns {S}
 * The new state after the trigger's action has been applied. If the action returns
 * undefined (no changes), the original state is returned instead.
 * 
 * ### 📝 Uncommon Knowledge
 * `When designing state transitions, think of your state as a directed graph where triggers
 * are the edges connecting different state nodes. This mental model helps build more predictable
 * and testable application behavior.`
 * 
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 * 
 * ### 🔗 Related Resources
 * 
 * #### Internal References
 * - {@link createTrigger} - Function for creating trigger definitions
 * - {@link registerTrigger} - Function for registering triggers with the system
 * - {@link TriggerConfigType} - Type definition for trigger configuration
 */
export function activateTrigger<S = any, P extends any[] = any[]>(
  triggerName: string,
  currentState: S,
  ...payload: P
): S {
  const triggerDefinition = getRegisteredTrigger(triggerName);

  if (!triggerDefinition) {
    // Use TriggerErrorClass once errors.ts is refactored
    throw new Error(
      `Trigger named "${triggerName}" not found in registry.`
      // ErrorCodeEnum.TRIGGER_NOT_FOUND (use enum later)
    );
  }

  try {
    // @ts-ignore __DEV__ expected
    if (__DEV__) {
      // Optional: Add monitoring start call here
      console.log(`[Trigger] Activating trigger: ${triggerName}`, { payload });
    }

    // Performance monitoring start
    triggerMonitoringInstance.trackEventStart(
      triggerName,
      "dom" as any,
      triggerName,
      "manual"
    );

    let newState: S;
    try {
      newState = triggerDefinition.action(currentState, ...payload);
      // Performance monitoring completion (success)
      triggerMonitoringInstance.trackEventCompletion(
        triggerName,
        "dom" as any,
        triggerName,
        TriggerEventDeliveryStatusEnum.DELIVERED,
        "manual"
      );
    } catch (err) {
      // Track failed execution
      triggerMonitoringInstance.trackEventCompletion(
        triggerName,
        "dom" as any,
        triggerName,
        TriggerEventDeliveryStatusEnum.FAILED,
        "manual",
        undefined,
        (err as Error).message
      );
      throw err;
    }

    // Return the new state if the action provided one, otherwise return the original state
    return newState === undefined ? currentState : newState;

  } catch (error) {
    // Use TriggerErrorClass and logger once refactored
    console.error(`Error executing action for trigger "${triggerName}":`, error);
    // Re-throw or handle error based on strategy
    throw new Error(`Execution failed for trigger "${triggerName}"`); 
    // Potentially wrap original error: throw new TriggerErrorClass(..., error);
  }
}

// --- Existing Action Class (potentially deprecated or refactored later) --- 

/**
 * Represents a configured trigger action instance.
 * NOTE: This class might be refactored or replaced by the createState mechanism.
 */
export class TriggerActionClass {
  private config: TriggerConfigType;
  private instanceId: string;
  private triggerDefinition: TriggerDefinitionMetadataType | undefined;
  private isEnabled: boolean = true;
  private actionHandler: (...args: any[]) => any;
  private conditionHandler?: (state: any) => boolean;
  private throttledAction?: (...args: any[]) => any;
  private debouncedAction?: (...args: any[]) => any;

  constructor(config: TriggerConfigType) {
    this.config = { ...config }; 
    this.instanceId = config.id || `trigger_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    this.triggerDefinition = getTriggerMetadata(config.type); // Get metadata

    if (!this.triggerDefinition) {
        // @ts-ignore __DEV__ expected
        if (__DEV__) console.warn(`No metadata found for trigger type "${config.type}" used by instance ${this.instanceId}.`);
    }

    // Validate config against definition parameters (if definition exists)
    // this.validateConfigParameters();

    this.actionHandler = this.config.action; 
    this.conditionHandler = this.config.condition;

    // Apply throttling/debouncing if configured
    // this.setupThrottlingDebouncing();

    // Optional: Register instance with a lifecycle manager?
  }
  
  public fire(...payload: any[]): void {
     if (!this.isEnabled) return;

     // Check condition if it exists
     if (this.conditionHandler) {
        // Need a way to get the relevant state here!
        // This highlights the coupling needed with createState
        // const currentState = getStateForTriggerInstance(this.instanceId); 
        // if (!this.conditionHandler(currentState)) return;
        console.warn("Trigger condition checking requires state access - not implemented in standalone action.");
     }

     // Use throttled/debounced handler if available, otherwise direct handler
     const handler = this.throttledAction || this.debouncedAction || this.actionHandler;
     
     try {
         // This action signature is different from RegisteredTriggerType!
         handler(...payload);
     } catch (error) {
        console.error(`Error firing action for trigger instance ${this.instanceId} (type: ${this.config.type}):`, error);
        // Handle error based on strategy
     }
     
     if (this.config.once) {
         this.disable();
         // Optional: Schedule for destruction?
     }
  }
  
  public disable(): void {
     this.isEnabled = false;
     // Optional: Update lifecycle manager
  }
  
  public enable(): void {
     this.isEnabled = true;
     // Optional: Update lifecycle manager
  }
  
  public update(newConfig: Partial<TriggerConfigType>): void {
      // Merge new config, re-validate, update throttling/debouncing
      this.config = { ...this.config, ...newConfig };
      // Re-validate, re-setup throttling etc.
      // this.validateConfigParameters();
      // this.setupThrottlingDebouncing();
      console.warn("TriggerAction update logic needs careful implementation.");
  }
  
  public destroy(): void {
      this.disable();
      // Remove listeners, cleanup resources
      // Optional: Unregister from lifecycle manager
      console.log(`Trigger instance ${this.instanceId} destroyed.`);
  }
  
  // --- Private helper methods --- 
  
  private validateConfigParameters(): void {
      if (!this.triggerDefinition?.parameters) return;
      // Implementation to validate this.config against triggerDefinition.parameters
      // Throw TriggerErrorClass on validation failure
  }

  private setupThrottlingDebouncing(): void {
      // Clear existing wrappers
      this.throttledAction = undefined;
      this.debouncedAction = undefined;

      if (this.config.throttle && this.config.throttle > 0) {
          // Apply throttle (requires a throttle utility function)
          // this.throttledAction = throttleUtility(this.actionHandler, this.config.throttle);
      } else if (this.config.debounce && this.config.debounce > 0) {
          // Apply debounce (requires a debounce utility function)
          // this.debouncedAction = debounceUtility(this.actionHandler, this.config.debounce);
      }
  }
  
}

// Example (Conceptual - This class might be deprecated)
/*
const myAction = new TriggerActionClass({
   type: "player:onDamage", // Links to metadata (but not action logic!)
   action: (damageAmount) => { console.log(`Standalone action received damage: ${damageAmount}`); },
   throttle: 100
});
myAction.fire(10);
*/
