/**
 * # Signal-Trigger Integration
 * @summary #### Bidirectional connection between signals and triggers
 * 
 * This module provides robust integration between InSpatial's reactive signal system
 * and the trigger event system, allowing signals to react to triggers and triggers
 * to be activated based on signal changes.
 * 
 * @since 1.0.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import { 
  createSignal, 
  createEffect, 
  type AccessorType 
} from "../signal/src/signals.ts";

import {
  onCleanup
} from "../signal/src/core/owner.ts";

import { createTriggerInstance as defaultCreateTriggerInstance } from "../trigger/src/action.ts";
import { getRegisteredTrigger as defaultGetRegisteredTrigger } from "../trigger/src/registry.ts";
import { TriggerManagerClass } from "../trigger/src/action.ts";

import type {
  TriggerConfigType,
  TriggerInstanceType,
  RegisteredTriggerType
} from "../trigger/src/types.ts";

/**
 * Interface defining the options for trigger signals
 */
interface TriggerSignalOptions<TValue, TEvent> {
  /** Name or identifier of the trigger to connect to */
  trigger: string | RegisteredTriggerType<any, any>;
  /** Optional function to transform trigger event data into signal value */
  transform?: (eventData: TEvent[], currentValue: TValue) => TValue;
  /** Optional function to determine if the signal should update based on the event */
  condition?: (eventData: TEvent[], currentValue: TValue) => boolean;
}

/**
 * Interface for dependency injection in the trigger signal system
 */
interface TriggerDeps {
  /** Function to get registered triggers */
  getRegisteredTrigger?: typeof defaultGetRegisteredTrigger;
  /** Function to create trigger instances */
  createTriggerInstance?: typeof defaultCreateTriggerInstance;
}

/**
 * Interface for the controls returned by createTriggerSignal
 */
interface TriggerSignalControls {
  /** Disconnects the signal from the trigger */
  disconnect: () => void;
}

/**
 * # CreateTriggerSignal
 * @summary #### Creates a signal that updates when a trigger activates
 * 
 * The `createTriggerSignal` function creates a signal that updates its value when a specified trigger fires.
 * It's like setting up an automatic sensor that changes a value when it detects something.
 * 
 * @since 0.0.1
 * @category InSpatial State
 * @kind function
 * @access public
 * 
 * @param initialValue - The starting value for the signal
 * @param options - Configuration options including trigger, transform, and condition functions
 * @param deps - Optional dependencies for testing
 * 
 * @returns A tuple with the signal getter, setter, and control functions
 */
export function createTriggerSignal<TValue, TEvent = any>(
  initialValue: TValue,
  options: TriggerSignalOptions<TValue, TEvent>,
  deps: Partial<TriggerDeps> = {}
): [() => TValue, (value: TValue) => void, TriggerSignalControls] {
  const {
    getRegisteredTrigger = defaultGetRegisteredTrigger,
    createTriggerInstance = defaultCreateTriggerInstance
  } = deps;
  
  // Create the signal with initial value
  const [value, setValue] = createSignal<any>(initialValue as any);

  const { trigger: triggerName, transform, condition } = options;

  // Determine the trigger name based on input type
  const triggerNameToUse = typeof triggerName === 'string' 
    ? triggerName 
    : (triggerName as RegisteredTriggerType<any, any>).name;
  
  // Get registered trigger if it's a string name
  const registeredTrigger = typeof triggerName === 'string'
    ? getRegisteredTrigger(triggerName)
    : triggerName;
    
  if (!registeredTrigger) {
    console.error(`Trigger "${triggerName}" not found for signal`);
    return [value as () => TValue, setValue as (value: TValue) => void, { disconnect: () => {} }];
  }

  // Track disconnection state
  let isDisconnected = false;

  // Create a handler for the trigger event
  const handler = (eventData: TEvent) => {
    // Don't process events if disconnected
    if (isDisconnected) {
      return;
    }

    // Get the current value
    const currentValue = value() as TValue;

    // Apply condition if provided
    if (condition) {
      // Handle array data for condition functions
      const eventDataArr = Array.isArray(eventData) ? eventData : [eventData];
      
      // Check if the condition passes
      if (!condition(eventDataArr, currentValue)) {
        return; // Skip if condition doesn't pass
      }
      
      // If condition passes and no transform, we directly set the first item
      // from event data if it's an array, otherwise the event data itself
      if (!transform) {
        if (Array.isArray(eventData) && eventData.length > 0) {
          setValue(eventData[0] as any);
        } else {
          setValue(eventData as any);
        }
        return;
      }
    }

    // Apply transform if provided
    if (transform) {
      // Handle array data for transform functions
      const eventDataForTransform = Array.isArray(eventData) ? eventData : [eventData];
      
      // Apply the transformation
      const transformedValue = transform(eventDataForTransform, currentValue);
      setValue(transformedValue as any);
      return;
    }

    // If no condition or transform, just set the event data
    setValue(eventData as any);
  };

  // Create a trigger configuration directly
  const triggerConfig: TriggerConfigType = {
    type: typeof triggerName === 'string' ? triggerName : triggerName.name,
    action: handler
  };

  // Create an instance of the trigger with our handler
  const triggerInstance = defaultCreateTriggerInstance(triggerConfig);

  // Return the signal and disconnect function
  return [
    value as () => TValue,
    setValue as (value: TValue) => void,
    {
      disconnect: () => {
        isDisconnected = true;
        if (triggerInstance) {
          triggerInstance.destroy();
        }
      }
    }
  ];
}

// Support dependency injection for tests
// This is used by the test suite to override dependencies
(createTriggerSignal as any).__deps = {
  getRegisteredTrigger: defaultGetRegisteredTrigger,
  createTriggerInstance: defaultCreateTriggerInstance
};

// Allow resetting dependencies for testing
export function _resetDependencies() {
  (createTriggerSignal as any).__deps = {
    getRegisteredTrigger: defaultGetRegisteredTrigger,
    createTriggerInstance: defaultCreateTriggerInstance
  };
}

/**
 * # createSignalConditionTrigger
 * @summary #### Creates a trigger with condition based on signal values
 * 
 * This function creates a trigger that only activates when a signal-based 
 * condition is met, ensuring tight integration between the reactive state 
 * system and the trigger system.
 * 
 * @param config Configuration for the signal-condition trigger
 * @returns A trigger instance with enhanced lifecycle management
 * 
 * @example
 * ### Example 1: UI-Based Conditional Actions
 * ```typescript
 * // Signal for UI state
 * const [isMenuOpen, setMenuOpen] = createSignal(false);
 * 
 * // Create a conditional trigger based on the signal
 * const menuTrigger = createSignalConditionTrigger({
 *   signal: isMenuOpen,
 *   condition: (isOpen) => isOpen === true,
 *   trueTrigger: {
 *     type: "onMenuOpened",
 *     action: () => {
 *       // Play sound, animate, etc.
 *       playSound("menu-open.mp3");
 *       fadeInElement("menu-container");
 *     }
 *   },
 *   falseTrigger: {
 *     type: "onMenuClosed",
 *     action: () => {
 *       // Clean up, reset state, etc.
 *       fadeOutElement("menu-container");
 *     }
 *   }
 * });
 * 
 * // Later in UI code
 * button.onClick(() => {
 *   setMenuOpen(prev => !prev);
 *   // The trigger will automatically fire based on the new signal value
 * });
 * ```
 * 
 * @example
 * ### Example 2: Game State Conditional Triggers
 * ```typescript
 * // Game state signal
 * const [playerHealth, setPlayerHealth] = createSignal(100);
 * 
 * // Create conditional triggers based on health thresholds
 * const lowHealthTrigger = createSignalConditionTrigger({
 *   signal: playerHealth,
 *   condition: (health) => health < 30,
 *   trueTrigger: {
 *     type: "onLowHealth",
 *     action: () => {
 *       // Show low health warning, play heartbeat sound
 *       playHeartbeatSound();
 *       showHealthWarning();
 *     }
 *   },
 *   falseTrigger: {
 *     type: "onHealthRecovered",
 *     action: () => {
 *       // Remove warnings
 *       hideHealthWarning();
 *       stopHeartbeatSound();
 *     }
 *   },
 *   onChange: false // Only trigger when crossing the threshold
 * });
 * ```
 */
export function createSignalConditionTrigger<T>(
  config: {
    signal: AccessorType<T>,
    condition: (value: T) => boolean,
    trueTrigger: TriggerConfigType,
    falseTrigger?: TriggerConfigType,
    onChange?: boolean
  }
): TriggerInstanceType {
  // Initial check
  let lastValue = config.signal();
  let isConditionMet = config.condition(lastValue);
  
  // Create active trigger based on initial condition
  const initialTriggerConfig = isConditionMet 
    ? config.trueTrigger
    : config.falseTrigger;
  
  // If no trigger config for initial state, create a dummy
  const dummyTriggerConfig: TriggerConfigType = {
    type: "dummy",
    action: () => {}
  };
  
  const activeTrigger = initialTriggerConfig 
    ? defaultCreateTriggerInstance(initialTriggerConfig)
    : defaultCreateTriggerInstance(dummyTriggerConfig);
  
  // Store active config reference for later cleanup
  let activeConfig = initialTriggerConfig;
  
  // Handle trigger switching function
  const switchTrigger = (newConditionResult: boolean) => {
    // Only act if the condition changed or if we want to respond to every change
    if (newConditionResult !== isConditionMet || config.onChange) {
      // Determine the new trigger config
      const newTriggerConfig = newConditionResult
        ? config.trueTrigger
        : config.falseTrigger;
      
      // If we have a new valid config, make the switch
      if (newTriggerConfig) {
        // Cleanup current trigger if it exists
        if (activeConfig) {
          activeTrigger.destroy();
        }
        
        // Create new trigger
        const newTrigger = defaultCreateTriggerInstance(newTriggerConfig);
        
        // Copy all properties from new trigger to our existing reference
        Object.entries(newTrigger).forEach(([key, value]) => {
          (activeTrigger as any)[key] = value;
        });
        
        // Update active config reference
        activeConfig = newTriggerConfig;
      }
      
      // Update state
      isConditionMet = newConditionResult;
    }
  };
  
  // Set up effect to watch for signal changes
  createEffect(
    () => config.signal(),
    (newValue) => {
      // Check condition with new value
      const newConditionResult = config.condition(newValue);
      
      // Handle trigger switching
      switchTrigger(newConditionResult);
      
      // Update value reference
      lastValue = newValue;
    }
  );
  
  // Create a destroy method that also cleans up the effect
  const originalDestroy = activeTrigger.destroy;
  activeTrigger.destroy = () => {
    // Call original destroy
    if (originalDestroy && typeof originalDestroy === 'function') {
      originalDestroy.call(activeTrigger);
    }
    
    // Note: Effect cleanup is handled automatically by the signal system
  };
  
  return activeTrigger;
}

/**
 * # StateLens
 * @summary #### Type-safe event bus for state-trigger communication
 * 
 * This class provides a centralized, type-safe communication channel between
 * the state system and trigger system, allowing for loosely coupled interactions.
 * 
 * @example
 * ### Example 1: Basic Event Communication
 * ```typescript
 * // Define your event types with strong typing
 * interface GameEvents {
 *   "player:move": [{ x: number, y: number }];
 *   "game:state": [{ status: 'idle' | 'playing' | 'paused' }];
 * }
 * 
 * // Create the event bus
 * const bus = createStateLens<GameEvents>();
 * 
 * // Listen for events
 * lens.on("player:move", (position) => {
 *   console.log(`Player moved to ${position.x}, ${position.y}`);
 * });
 * 
 * // Emit events
 * lens.emit("player:move", { x: 10, y: 20 });
 * ```
 * 
 * @example
 * ### Example 2: Connecting Signals to Events
 * ```typescript
 * // Create a signal that updates from events
 * const [gameState, controls] = lens.toSignal(
 *   "game:state", 
 *   { status: 'idle' }
 * );
 * 
 * // Use in reactive context
 * createEffect(() => {
 *   const state = gameState();
 *   updateUI(state.status);
 * });
 * 
 * // Connect a signal to emit events
 * const [playerPosition, setPlayerPosition] = createSignal({ x: 0, y: 0 });
 * lens.fromSignal("player:move", playerPosition);
 * 
 * // When the signal changes, it emits the event automatically
 * setPlayerPosition({ x: 5, y: 10 });
 * ```
 * 
 * @example
 * ### Example 3: Connecting Triggers to Events
 * ```typescript
 * // Connect a trigger to emit events
 * lens.fromTrigger(
 *   "player:move",
 *   { type: "onPlayerMove", target: "player" },
 *   (eventData) => ({ x: eventData.x, y: eventData.y })
 * );
 * 
 * // Create a trigger that activates from events
 * const { trigger } = lens.toTrigger("game:state", {
 *   type: "onGameStateChange",
 *   once: false
 * });
 * ```
 */
export class StateLens<
  EventMap extends Record<string, any[]> = Record<string, any[]>
> {
  private listeners: Partial<{
    [K in keyof EventMap]: Array<(...args: EventMap[K]) => void>
  }> = {};
  
  private signalSubscriptions: Map<string, { effect: any }> = new Map();
  private triggerSubscriptions: Map<string, TriggerInstanceType> = new Map();
  
  /**
   * Listen for a specific event
   * 
   * @param event The event name to listen for
   * @param callback The callback function to execute when the event is emitted
   * @returns A function to remove the listener
   */
  public on<K extends keyof EventMap>(
    event: K, 
    callback: (...args: EventMap[K]) => void
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event]!.push(callback);
    
    // Return function to remove the listener
    return () => {
      const callbacks = this.listeners[event];
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Emit an event
   * 
   * @param event The event name to emit
   * @param args The arguments to pass to the event listeners
   */
  public emit<K extends keyof EventMap>(
    event: K, 
    ...args: EventMap[K]
  ): void {
    const callbacks = this.listeners[event];
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in StateLens listener for "${String(event)}":`, error);
        }
      });
    }
  }
  
  /**
   * Create a subscription that emits events when a signal changes
   * 
   * @param event The event name to emit
   * @param signal The signal to watch for changes
   * @param transform Optional function to transform the signal value to event args
   * @returns A function to disconnect the subscription
   */
  public fromSignal<K extends keyof EventMap, T>(
    event: K,
    signal: AccessorType<T>,
    transform?: (value: T) => EventMap[K]
  ): () => void {
    // Create effect to watch signal and emit events
    createEffect(
      () => signal(),
      (value) => {
        const eventArgs = transform 
          ? transform(value) 
          : [value] as unknown as EventMap[K];
          
        this.emit(event, ...eventArgs);
      }
    );
    
    // Register subscription
    const subscriptionId = `signal:${String(event)}:${Date.now()}`;
    
    return () => {
      // Effect cleanup is handled automatically by the signal system
      this.signalSubscriptions.delete(subscriptionId);
    };
  }
  
  /**
   * Create a subscription that emits events when a trigger activates
   * 
   * @param event The event name to emit
   * @param triggerConfig The trigger configuration
   * @param transform Optional function to transform the trigger data to event args
   * @returns A function to disconnect the subscription
   */
  public fromTrigger<K extends keyof EventMap>(
    event: K,
    triggerConfig: TriggerConfigType,
    transform?: (eventData: any) => EventMap[K]
  ): () => void {
    // Create action handler that emits events
    const actionHandler = (eventData: any) => {
      const eventArgs = transform 
        ? transform(eventData)
        : [eventData] as unknown as EventMap[K];
        
      this.emit(event, ...eventArgs);
    };
    
    // Create trigger with our action handler
    const trigger = defaultCreateTriggerInstance({
      ...triggerConfig,
      type: triggerConfig.type || "event",
      action: actionHandler
    });
    
    // Register subscription
    const subscriptionId = `trigger:${String(event)}:${Date.now()}`;
    this.triggerSubscriptions.set(subscriptionId, trigger);
    
    return () => {
      if (trigger) {
        trigger.destroy();
      }
      this.triggerSubscriptions.delete(subscriptionId);
    };
  }
  
  /**
   * Create a signal that updates based on events
   * 
   * @param event The event name to listen for
   * @param initialValue The initial value for the signal
   * @param transform Optional function to transform the event args to signal value
   * @returns A tuple containing the signal accessor and control API
   */
  public toSignal<K extends keyof EventMap, T>(
    event: K,
    initialValue: T,
    transform?: (...args: EventMap[K]) => T
  ): [AccessorType<T>, { disconnect: () => void }] {
    // Create the signal
    const [value, setValue] = createSignal<T>(initialValue as Exclude<T, Function>);
    
    // Listen for events and update the signal
    const unsubscribe = this.on(event, (...args: EventMap[K]) => {
      const newValue = transform 
        ? transform(...args)
        : args[0] as unknown as T;
        
      setValue(() => newValue as Exclude<T, Function>);
    });
    
    return [value, { disconnect: unsubscribe }];
  }
  
  /**
   * Create a trigger that activates based on events
   * 
   * @param event The event name to listen for
   * @param triggerConfig The trigger configuration (without action)
   * @returns An object containing the trigger instance and disconnect function
   */
  public toTrigger<K extends keyof EventMap>(
    event: K,
    triggerConfig: Omit<TriggerConfigType, 'action'>
  ): { trigger: TriggerInstanceType, disconnect: () => void } {
    // Create trigger with empty action (will be fired manually)
    const trigger = defaultCreateTriggerInstance({
      ...triggerConfig,
      type: triggerConfig.type || "event",
      action: () => {} // Placeholder
    });
    
    // Listen for events and manually fire the trigger
    const unsubscribe = this.on(event, (...args: EventMap[K]) => {
      trigger.fire(args.length === 1 ? args[0] : args);
    });
    
    return { 
      trigger, 
      disconnect: () => {
        unsubscribe();
        trigger.destroy();
      }
    };
  }
  
  /**
   * Clean up all subscriptions
   */
  public destroy(): void {
    // Clean up signal subscriptions
    this.signalSubscriptions.clear();
    
    // Clean up trigger subscriptions
    this.triggerSubscriptions.forEach(trigger => {
      if (trigger && typeof trigger.destroy === 'function') {
        trigger.destroy();
      }
    });
    this.triggerSubscriptions.clear();
    
    // Clear all listeners
    this.listeners = {};
  }
}

/**
 * # createStateLens
 * @summary #### Creates a lens for bidirectional state flow between signals and triggers
 * 
 * This function creates a specialized event bus that acts as a lens, focusing on
 * and transforming state between the signal system and trigger system, allowing
 * for type-safe, loosely coupled state interactions.
 * 
 * @returns A new StateLens instance configured as a state lens
 * 
 * @example
 * ```typescript
 * // Define your state flow types
 * interface AppState {
 *   "ui:update": [{ component: string, visible: boolean }];
 *   "data:loaded": [{ items: any[], timestamp: number }];
 * }
 * 
 * // Create the state lens
 * const lens = createStateLens<AppState>();
 * 
 * // Create a signal that updates when data is loaded
 * const [items, { disconnect }] = lens.toSignal(
 *   "data:loaded", 
 *   [],
 *   (data) => data.items
 * );
 * 
 * // Connect a trigger to the lens
 * lens.fromTrigger("ui:update", {
 *   type: "onUIStateChange",
 *   target: "mainMenu"
 * });
 * ```
 */
export function createStateLens<
  EventMap extends Record<string, any[]> = Record<string, any[]>
>(): StateLens<EventMap> {
  return new StateLens<EventMap>();
} 