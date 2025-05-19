/**
 * # createState
 * @summary #### Universal state management API for InSpatial applications
 * 
 * The `createState` function is the primary API for creating reactive state in InSpatial applications.
 * It unifies simple reactive state with trigger-based state flows, providing a clean developer
 * experience for both basic and complex use cases.
 * 
 * @since 1.0.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind function
 * @access public
 */

import { createSignal, createMemo, createEffect, createRoot } from "../signal/src/signals.ts";
import { StateManager } from "./manager.ts";
import type { StateConfigType, StateOptionsType, StateInstanceType } from "./types.ts";
import { connectTriggerToState } from "./bridge.ts";
import { getRegisteredTrigger } from "../trigger/src/registry.ts";
import type { RegisteredTriggerType } from "../trigger/src/types.ts";
import { isTypeError, validateState, registerStateSchema, createTypeValidator } from "./validation.ts";

// Define __DEV__ if not defined (for development mode detection)
declare const __DEV__: boolean;

/**
 * Generate a unique ID for state instances
 */
function generateId(): string {
  return `state-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Determine if a state should be global based on name and options
 */
function shouldBeGlobal(id: string, options?: StateOptionsType): boolean {
  // If explicit option is provided, use that
  if (options?.global !== undefined) {
    return options.global;
  }
  
  // Otherwise, use the naming convention: _prefixed are local, others are global
  return !id.startsWith("_");
}

/**
 * Create a new state instance with the given configuration
 * 
 * @param config The state configuration
 * @param options Additional options for state creation
 */
export function createState<T extends object>(
  config: StateConfigType<T>,
  options?: StateOptionsType
): StateInstanceType<T> {
  // Generate ID if not provided
  const id = config.id || generateId();
  
  // Determine if this state should be global
  const isGlobal = shouldBeGlobal(id, options);
  
  // Check for existing global state with this ID
  if (isGlobal && StateManager.hasGlobalState(id)) {
    if (__DEV__) {
      console.warn(`Global state with ID '${id}' already exists. Returning existing instance.`);
    }
    return StateManager.getGlobalState<T>(id)!;
  }
  
  // Handle type validation configuration
  if (config.type) {
    const shouldValidate = options?.validateType !== false; // Default to true if not specified
    
    // If validation is enabled and the state is global, register its schema
    if (shouldValidate && isGlobal && config.id) {
      registerStateSchema(config.id, config.type);
    }
    
    // If validation is enabled but the type doesn't have a validate method, add one
    if (shouldValidate && !config.type.validate) {
      config = {
        ...config,
        type: {
          ...config.type,
          validate: createTypeValidator(config.type)
        }
      };
    }
  }
  
  // Create root reactive scope
  return createRoot((dispose: () => void) => {
    // Create the reactive signal with initial state
    const [getInternalState, setInternalState] = createSignal<T>(
      config.initialState as any,
      { equals: options?.equals }
    );
    
    // Track initial state for reset capability
    const initialState = { ...config.initialState };
    
    // Create subscription list
    const subscribers = new Set<(state: T) => void>();
    
    // Store created timestamp
    const createdAt = Date.now();
    
    // Action registry - will be populated by connected triggers
    const actions: Record<string, (...args: any[]) => void> = {};
    
    // Connected triggers registry
    const connectedTriggers = new Map<string, () => void>();
    
    // Track nested batch depth and batch context state
    let _batchDepth = 0;
    let _batchingNextState: T | null = null;
    
    // Define core state update function
    const updateState = (newState: Partial<T> | ((prevState: T) => Partial<T>)) => {
      if (StateManager.isPauseActive()) return;
      
      if (typeof newState === "function") {
        // Functional update
        setInternalState((prev: T) => ({
          ...prev,
          ...(newState as Function)(prev)
        }));
      } else {
        // Object update
        setInternalState((prev: T) => ({
          ...prev,
          ...newState
        }));
      }
      
      // Notify subscribers only when not in a nested batch
      if (_batchDepth === 0) {
        subscribers.forEach(listener => listener(getInternalState()));
      }
    };
    
    // Create the state instance with additional internal properties for batch integration
    const stateInstance: StateInstanceType<T> & { 
      _batchDepth: number;
      _batchingNextState: T | null;
    } = {
      // Core state access
      getState: () => getInternalState(),
      get: () => getInternalState(),
      
      setState: updateState,
      update: updateState,
      
      // Reset to initial state
      reset: () => {
        setInternalState((_: T) => ({ ...initialState }));
        subscribers.forEach(listener => listener(getInternalState()));
      },
      
      // Subscribe to state changes
      subscribe: (listener: (state: T) => void) => {
        subscribers.add(listener);
        
        // Return unsubscribe function
        return () => {
          subscribers.delete(listener);
        };
      },
      
      // Action container
      action: actions,
      
      // Connect a trigger to this state
      connectTrigger: <P extends any[]>(
        trigger: RegisteredTriggerType<T, P>,
        triggerOptions?: {
          transform?: (payload: P) => P;
          condition?: (state: T, ...payload: P) => boolean;
        }
      ) => {
        // Use the bridge function to connect
        const disconnect = connectTriggerToState(
          stateInstance,
          trigger,
          triggerOptions
        );
        
        // Store disconnect function
        const triggerName = trigger.name;
        connectedTriggers.set(triggerName, disconnect);
        
        // Return disconnect function
        return disconnect;
      },
      
      // Batch updates
      batch: (updates: Array<(state: T) => Partial<T>>) => {
        if (StateManager.isPauseActive()) return;

        _batchDepth++;

        try {
          // Initialize a working copy of state for the batch operation
          _batchingNextState = { ...getInternalState() };
          
          // Apply each update function sequentially
          for (const update of updates) {
            // Call the update function and get partial update
            const partialUpdate = update(_batchingNextState);
            
            // Apply the partial update to our working state copy
            // This ensures each subsequent updater sees the effects of previous updates
            if (partialUpdate && typeof partialUpdate === 'object') {
              _batchingNextState = { ..._batchingNextState, ...partialUpdate };
            }
          }
          
          // Finally apply the combined update
          setInternalState(() => _batchingNextState!);
        } finally {
          _batchDepth--;
          _batchingNextState = null;
        }

        // Notify subscribers once at the end of the batch
        subscribers.forEach(listener => listener(getInternalState()));
      },
      
      // Cleanup resources
      destroy: () => {
        // Disconnect all triggers
        connectedTriggers.forEach(disconnect => disconnect());
        connectedTriggers.clear();
        
        // Clear subscribers
        subscribers.clear();
        
        // Unregister from manager
        StateManager.unregisterState(id, isGlobal);
        
        // Call dispose function from createRoot
        dispose();
      },
      
      // Metadata
      meta: {
        id,
        isGlobal,
        name: options?.name,
        createdAt
      },

      // Expose internal properties for trigger-state integration
      _batchDepth,
      _batchingNextState
    };
    
    // Register with StateManager
    StateManager.registerState(id, stateInstance, isGlobal);
    
    // Set up type validation if enabled
    if (config.type && options?.validateType !== false) {
      // Add validation on state changes
      const unsubscribe = stateInstance.subscribe((state: T) => {
        try {
          // Use InSpatial Type system for validation
          const result = validateState(config.type, state);
          
          if (isTypeError(result) && __DEV__) {
            console.error(`State validation failed for '${id}'`, {
              errors: result,
              state: state
            });
          }
        } catch (error) {
          if (__DEV__) {
            console.error(`State validation error for '${id}'`, error);
          }
        }
      });
      
      // Clean up validation when state is destroyed
      createEffect(() => {
        return () => unsubscribe();
      });
    }
    
    // Connect initial triggers if provided
    if (config.triggers) {
      if (Array.isArray(config.triggers)) {
        // Handle array of trigger names
        config.triggers.forEach((triggerName: string) => {
          const trigger = getRegisteredTrigger(triggerName);
          if (trigger) {
            stateInstance.connectTrigger(trigger as any);
          } else if (__DEV__) {
            console.warn(`Trigger '${triggerName}' not found in registry`);
          }
        });
      } else {
        // Handle object of categorized triggers
        Object.entries(config.triggers).forEach(([category, triggers]) => {
          if (typeof triggers === 'object' && triggers !== null) {
            Object.entries(triggers as Record<string, any>).forEach(([name, triggerConfig]) => {
              // Construct full trigger name
              const fullTriggerName = `${category}:${name}`;
              const trigger = getRegisteredTrigger(fullTriggerName);
              
              if (trigger) {
                stateInstance.connectTrigger(trigger as any, triggerConfig as any);
              } else if (__DEV__) {
                console.warn(`Trigger '${fullTriggerName}' not found in registry`);
              }
            });
          }
        });
      }
    }
    
    // Setup persistence if configured
    if (config.persist) {
      // Implementation of persistence would go here
      // This is a placeholder for Phase 2
      if (__DEV__) {
        console.debug(`State persistence configured for '${id}' but not implemented yet`);
      }
    }
    
    // Return the state instance
    return stateInstance;
  });
} 