/**
 * @file action.ts
 * @description Trigger Action API for creating and managing triggers
 */

import { TriggerBridgeClass } from "./bridge.ts";
import { triggerRegistry, getRegisteredTrigger, getTriggerMetadata, registerTrigger as registerTriggerInRegistry } from "./registry.ts";
import { triggerPerformanceMonitor } from "./monitoring.ts";
import { errorLogger, TriggerErrorClass } from "./errors.ts";
import {
  TriggerInstanceType,
  TriggerConfigType,
  PlatformType,
  HierarchicalPlatformType,
  TriggerEventDeliveryStatusEnum,
  ErrorCodeEnum,
  RegisteredTriggerType,
  TriggerDefinitionMetadataType,
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
    const chainId = `chain-${Date.now()}`;

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
    const conditionalId = `conditional-${Date.now()}`;

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
    triggerPerformanceMonitor.trackEventCompletion(
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
      triggerPerformanceMonitor.trackEventStart(
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
            triggerPerformanceMonitor.trackEventCompletion(
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
        triggerPerformanceMonitor.trackEventCompletion(
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
        triggerPerformanceMonitor.trackEventCompletion(
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
  
  // Return the definition object, ready for registration
  return {
    name: config.name,
    action: config.action
  };
}

/**
 * Activates a registered trigger by name, executing its action.
 * This is the core function called internally when `state.action.triggerName()` is invoked.
 *
 * @template S The type of the state object.
 * @template P The types of the payload arguments.
 * @param triggerName The unique name of the trigger to activate.
 * @param currentState The current state object to pass to the trigger's action.
 * @param payload The arguments to pass to the trigger's action.
 * @returns The new state returned by the trigger's action, or the original state if the trigger is not found or the action returns void.
 * @throws {TriggerErrorClass} If the trigger is not found in the registry.
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

    const newState = triggerDefinition.action(currentState, ...payload);

    // @ts-ignore __DEV__ expected
    if (__DEV__) {
      // Optional: Add monitoring end call here
      console.log(`[Trigger] Completed trigger: ${triggerName}`);
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
