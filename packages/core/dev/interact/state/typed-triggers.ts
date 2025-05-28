/**
 * # Typed Trigger Integration
 * @summary #### Strong typing for state and trigger integration
 * 
 * This module provides type-safe integration between InSpatial's state system
 * and the trigger system, with specialized support for different trigger categories.
 * 
 * @since 0.1.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import { type, validateState, TypeErrors } from "../../type/src/index.ts";
import { 
  TriggerCategoryEnum,
  TriggerEventDataType,
  RegisteredTriggerType
} from "../trigger/src/types.ts";
import { registerTrigger } from "../trigger/src/registry.ts";
import type { StateInstanceType, StateConfigType } from "./types.ts";
import { createState } from "./state.ts";

// ----------------------------------------------------------------------------
// Category-specific state interfaces
// ----------------------------------------------------------------------------

/**
 * Base interface for all trigger-compatible states
 */
export interface TriggerCompatibleState {
  /** Additional metadata for trigger handling */
  _triggers?: {
    /** Last trigger that updated this state */
    lastTrigger?: string;
    /** Timestamp of the last trigger update */
    lastUpdate?: number;
  };
}

/**
 * State interface for touch-related triggers
 */
export interface TouchTriggerState extends TriggerCompatibleState {
  /** Touch position information */
  touch?: {
    /** Current position */
    position: { x: number; y: number };
    /** Previous position */
    previous?: { x: number; y: number };
    /** Whether touch is active */
    active: boolean;
    /** Touch identifier */
    id?: number;
    /** Touch target element or object */
    target?: string;
  };
}

/**
 * State interface for sensor-related triggers
 */
export interface SensorTriggerState extends TriggerCompatibleState {
  /** Sensor reading data */
  sensor?: {
    /** Key-value pairs of sensor readings */
    readings: Record<string, number>;
    /** Last update timestamp */
    lastUpdated: string;
    /** Sensor accuracy level */
    accuracy?: 'low' | 'medium' | 'high';
    /** Whether sensor is active */
    active: boolean;
  };
}

/**
 * State interface for mouse-related triggers
 */
export interface MouseTriggerState extends TriggerCompatibleState {
  /** Mouse interaction data */
  mouse?: {
    /** Current position */
    position: { x: number; y: number };
    /** Previous position */
    previous?: { x: number; y: number };
    /** Which buttons are pressed */
    buttons: number[];
    /** Current hover target */
    hoverTarget?: string;
    /** Whether mouse is over the element */
    isOver: boolean;
  };
}

/**
 * State interface for keyboard-related triggers
 */
export interface KeyboardTriggerState extends TriggerCompatibleState {
  /** Keyboard interaction data */
  keyboard?: {
    /** Currently pressed keys */
    keys: string[];
    /** Current key modifiers */
    modifiers: {
      shift: boolean;
      ctrl: boolean;
      alt: boolean;
      meta: boolean;
    };
    /** Last key pressed */
    lastKey?: string;
  };
}

/**
 * State interface for gesture-related triggers
 */
export interface GestureTriggerState extends TriggerCompatibleState {
  /** Gesture interaction data */
  gesture?: {
    /** Current gesture type */
    type?: 'pinch' | 'rotate' | 'swipe' | 'tap' | 'pan';
    /** Gesture scale factor (for pinch) */
    scale?: number;
    /** Gesture rotation angle (for rotate) */
    rotation?: number;
    /** Gesture direction (for swipe) */
    direction?: 'left' | 'right' | 'up' | 'down';
    /** Gesture velocity */
    velocity?: { x: number; y: number };
    /** Whether gesture is active */
    active: boolean;
  };
}

/**
 * State interface for physics-related triggers
 */
export interface PhysicsTriggerState extends TriggerCompatibleState {
  /** Physics interaction data */
  physics?: {
    /** Collision data */
    collision?: {
      /** Collision point */
      point: { x: number; y: number; z: number };
      /** Collision normal */
      normal: { x: number; y: number; z: number };
      /** Collision force magnitude */
      force: number;
      /** Colliding object identifier */
      objectId: string;
    };
    /** Current velocity */
    velocity?: { x: number; y: number; z: number };
    /** Current acceleration */
    acceleration?: { x: number; y: number; z: number };
    /** Whether object is grounded */
    grounded?: boolean;
  };
}

/**
 * State interface for time-related triggers
 */
export interface TimeTriggerState extends TriggerCompatibleState {
  /** Time-related data */
  time?: {
    /** Current timer value */
    current: number;
    /** Timer start value */
    start: number;
    /** Timer end value */
    end?: number;
    /** Timer progress (0-1) */
    progress: number;
    /** Whether timer is running */
    running: boolean;
    /** Timer direction (increment or decrement) */
    direction: 'forward' | 'backward';
  };
}

/**
 * State interface for logic-related triggers
 */
export interface LogicTriggerState extends TriggerCompatibleState {
  /** Logic-related data */
  logic?: {
    /** Current condition values */
    conditions: Record<string, boolean>;
    /** Current state machine state */
    state?: string;
    /** Previous state machine state */
    previousState?: string;
    /** Transition timestamp */
    transitionTime?: number;
  };
}

/**
 * State interface for area-related triggers
 */
export interface AreaTriggerState extends TriggerCompatibleState {
  /** Area interaction data */
  area?: {
    /** Whether entity is inside area */
    isInside: boolean;
    /** Time spent inside area */
    timeInside?: number;
    /** Entry timestamp */
    entryTime?: number;
    /** Exit timestamp */
    exitTime?: number;
    /** Distance to area center */
    distance?: number;
    /** Overlapping percentage (0-1) */
    overlap?: number;
  };
}

/**
 * Union type of all category-specific states
 */
export type CategoryState = 
  | TouchTriggerState
  | SensorTriggerState
  | MouseTriggerState
  | KeyboardTriggerState
  | GestureTriggerState
  | PhysicsTriggerState
  | TimeTriggerState
  | LogicTriggerState
  | AreaTriggerState;

/**
 * Map of trigger categories to their state interfaces
 */
export interface CategoryStateMap {
  [TriggerCategoryEnum.TOUCH]: TouchTriggerState;
  [TriggerCategoryEnum.SENSOR]: SensorTriggerState;
  [TriggerCategoryEnum.MOUSE]: MouseTriggerState;
  [TriggerCategoryEnum.KEYBOARD]: KeyboardTriggerState;
  [TriggerCategoryEnum.GESTURE]: GestureTriggerState;
  [TriggerCategoryEnum.PHYSICS]: PhysicsTriggerState;
  [TriggerCategoryEnum.TIME]: TimeTriggerState;
  [TriggerCategoryEnum.LOGIC]: LogicTriggerState;
  [TriggerCategoryEnum.AREA]: AreaTriggerState;
  [TriggerCategoryEnum.SCENE]: TriggerCompatibleState;
  [TriggerCategoryEnum.GENERIC]: TriggerCompatibleState;
  [TriggerCategoryEnum.CUSTOM]: TriggerCompatibleState;
}

// ----------------------------------------------------------------------------
// Type-safe trigger registration
// ----------------------------------------------------------------------------

/**
 * Register a typed trigger with payload validation
 * 
 * @param name Trigger name (typically in format "category:action")
 * @param category Trigger category
 * @param action State transition function
 * @param payloadSchema Optional schema for payload validation
 * @returns Registered trigger
 */
export function registerTypedTrigger<
  C extends keyof CategoryStateMap,
  S extends CategoryStateMap[C],
  P extends any[]
>(
  name: string,
  category: C,
  action: (state: S, ...payload: P) => Partial<S> | void,
  payloadSchema?: any
): RegisteredTriggerType<S, P> {
  // Create a wrapped action that performs validation
  const validatedAction = (state: S, ...payload: P): Partial<S> | void => {
    // Validate payload if schema is provided
    if (payloadSchema) {
      const validationResult = validateState(payloadSchema, payload);
      if (validationResult instanceof TypeErrors) {
        console.error(`Payload validation failed for trigger ${name}:`, validationResult);
        return;
      }
    }
    
    // Call the original action
    const result = action(state, ...payload);
    
    // Track trigger metadata if state has _triggers property
    if (result && typeof result === 'object') {
      return {
        ...result,
        _triggers: {
          ...(state._triggers || {}),
          lastTrigger: name,
          lastUpdate: Date.now()
        }
      };
    }
    
    return result;
  };
  
  // Register the trigger
  return registerTrigger(name, validatedAction as any) as RegisteredTriggerType<S, P>;
}

// ----------------------------------------------------------------------------
// Category-specific state factories
// ----------------------------------------------------------------------------

/**
 * Options for creating a category-specific state
 */
export interface CategoryStateOptions<T extends CategoryState> extends StateConfigType<T> {
  /** Category-specific options */
  categoryOptions?: {
    /** Whether to automatically track category-specific data */
    autoTrack?: boolean;
    /** Whether to validate against category interface */
    enforceInterface?: boolean;
  };
}

/**
 * Create a state optimized for a specific trigger category
 * 
 * @param category Trigger category
 * @param options Category-specific state options
 * @returns State instance specialized for the category
 */
export function createCategoryState<
  C extends keyof CategoryStateMap,
  T extends CategoryStateMap[C]
>(
  category: C,
  options: CategoryStateOptions<T>
): StateInstanceType<T> {
  // Generate ID if not provided
  const id = options.id || `${String(category).toLowerCase()}-${Date.now()}`;
  
  // Create base state configuration
  const config: StateConfigType<T> = {
    id,
    initialState: options.initialState,
    type: options.type,
    persist: options.persist,
    triggers: options.triggers
  };
  
  // Create the state
  const state = createState<T>(config);
  
  // Create category-specific helpers depending on the category
  switch (category) {
    case TriggerCategoryEnum.TOUCH:
      // Add touch-specific helpers
      (state as any).onTap = (handler: (x: number, y: number) => void) => {
        // Implementation would connect to a tap trigger
      };
      break;
      
    case TriggerCategoryEnum.MOUSE:
      // Add mouse-specific helpers
      (state as any).onHover = (handler: (isOver: boolean) => void) => {
        // Implementation would connect to a hover trigger
      };
      break;
      
    // Add more category-specific enhancements here
  }
  
  return state;
}

/**
 * Create a touch-optimized state with specialized methods
 * 
 * @param options State options
 * @returns Touch-optimized state instance
 */
export function createTouchState<T extends TouchTriggerState>(
  options: CategoryStateOptions<T>
): StateInstanceType<T> & {
  onTap: (handler: (x: number, y: number) => void) => () => void;
  onSwipe: (handler: (direction: 'left' | 'right' | 'up' | 'down') => void) => () => void;
  onPinch: (handler: (scale: number, center: { x: number, y: number }) => void) => () => void;
} {
  // Create the base state
  const state = createCategoryState(TriggerCategoryEnum.TOUCH, options);
  
  // Add touch-specific methods
  const enhancedState = state as StateInstanceType<T> & {
    onTap: (handler: (x: number, y: number) => void) => () => void;
    onSwipe: (handler: (direction: 'left' | 'right' | 'up' | 'down') => void) => () => void;
    onPinch: (handler: (scale: number, center: { x: number, y: number }) => void) => () => void;
  };
  
  // Implement touch-specific methods
  enhancedState.onTap = (handler) => {
    // Implementation would connect to a tap trigger
    const tapTrigger = registerTrigger(
      'touch:tap',
      (state: T, x: number, y: number) => {
        // Update state
        const updatedState: Partial<T> = {
          touch: {
            ...state.touch,
            position: { x, y },
            active: true
          }
        } as any;
        
        // Call handler
        handler(x, y);
        
        return updatedState;
      }
    );
    
    return enhancedState.connectTrigger(tapTrigger as any);
  };
  
  enhancedState.onSwipe = (handler) => {
    // Implementation would connect to a swipe trigger
    const swipeTrigger = registerTrigger(
      'touch:swipe',
      (state: T, direction: 'left' | 'right' | 'up' | 'down') => {
        // Call handler
        handler(direction);
        
        return {
          touch: {
            ...state.touch,
            active: true
          }
        } as any;
      }
    );
    
    return enhancedState.connectTrigger(swipeTrigger as any);
  };
  
  enhancedState.onPinch = (handler) => {
    // Implementation would connect to a pinch trigger
    const pinchTrigger = registerTrigger(
      'touch:pinch',
      (state: T, scale: number, center: { x: number, y: number }) => {
        // Call handler
        handler(scale, center);
        
        return {
          touch: {
            ...state.touch,
            position: center,
            active: true
          }
        } as any;
      }
    );
    
    return enhancedState.connectTrigger(pinchTrigger as any);
  };
  
  return enhancedState;
}

// ----------------------------------------------------------------------------
// InSpatialDB integration for trigger history
// ----------------------------------------------------------------------------

/**
 * Options for trigger-aware persistence
 */
export interface TriggerAwarePersistenceOptions {
  /** Storage mechanism to use */
  storage: string;
  /** Storage key */
  key: string;
  /** Whether to record trigger history */
  recordHistory?: boolean;
  /** Maximum history entries to keep */
  maxHistoryEntries?: number;
  /** Which trigger categories to record */
  includedCategories?: TriggerCategoryEnum[];
  /** Standard persistence options */
  autoSave?: boolean;
  /** Fields to include */
  include?: string[];
  /** Fields to exclude */
  exclude?: string[];
  /** InSpatialDB specific options */
  inspatialDB?: Record<string, any>;
}

/**
 * Setup InSpatialDB persistence with trigger history tracking
 * 
 * @param state The state to persist
 * @param options Persistence options
 * @returns Cleanup function
 */
export function setupTriggerAwareInSpatialDBPersistence<T extends TriggerCompatibleState>(
  state: StateInstanceType<T>,
  options: TriggerAwarePersistenceOptions
): () => void {
  // Create a history tracking state
  const historyState = createState({
    id: `${state.meta.id}-history`,
    initialState: {
      stateId: state.meta.id,
      entries: [],
      lastUpdated: null
    }
  });
  
  // Subscribe to state changes to record history
  let unsubscribe: (() => void) | null = null;
  
  if (options.recordHistory) {
    unsubscribe = state.subscribe((currentState) => {
      // Get trigger info
      const triggerInfo = currentState._triggers;
      
      if (triggerInfo?.lastTrigger) {
        // Record history entry
        historyState.update(history => {
          const entries = [...history.entries];
          
          // Add new entry
          entries.push({
            timestamp: Date.now(),
            triggerId: triggerInfo.lastTrigger,
            stateDelta: {/* Compute delta */},
            stateSnapshot: currentState
          });
          
          // Limit history size
          if (options.maxHistoryEntries && entries.length > options.maxHistoryEntries) {
            entries.splice(0, entries.length - options.maxHistoryEntries);
          }
          
          return {
            entries,
            lastUpdated: new Date().toISOString()
          };
        });
      }
    });
  }
  
  // Set up InSpatialDB persistence for both states
  // Just a placeholder - would use the actual implementation from persistence.ts
  const mainCleanup = () => {
    console.log(`[InSpatialDB] Would persist state: ${state.meta.id}`);
  };
  
  const historyCleanup = () => {
    console.log(`[InSpatialDB] Would persist history: ${historyState.meta.id}`);
  };
  
  // Return combined cleanup
  return () => {
    if (unsubscribe) unsubscribe();
    mainCleanup();
    historyCleanup();
  };
}

// ----------------------------------------------------------------------------
// Type utilities for trigger integration
// ----------------------------------------------------------------------------

/**
 * Check if a state is compatible with a specific trigger category
 * 
 * @param state The state to check
 * @param category The trigger category
 * @returns Whether the state is compatible with the category
 */
export function isCompatibleWithCategory<T extends object>(
  state: StateInstanceType<T>, 
  category: TriggerCategoryEnum
): boolean {
  const currentState = state.get();
  
  switch (category) {
    case TriggerCategoryEnum.TOUCH:
      return 'touch' in currentState;
      
    case TriggerCategoryEnum.MOUSE:
      return 'mouse' in currentState;
      
    case TriggerCategoryEnum.KEYBOARD:
      return 'keyboard' in currentState;
      
    case TriggerCategoryEnum.SENSOR:
      return 'sensor' in currentState;
      
    // Add more categories as needed
      
    default:
      // Generic categories are always compatible
      return true;
  }
}

/**
 * Get the required state interface for a trigger category
 * 
 * @param category The trigger category
 * @returns Type schema for the category
 */
export function getCategoryTypeSchema(category: TriggerCategoryEnum): any {
  switch (category) {
    case TriggerCategoryEnum.TOUCH:
      return type({
        touch: {
          position: { x: "number", y: "number" },
          active: "boolean"
        }
      });
      
    case TriggerCategoryEnum.MOUSE:
      return type({
        mouse: {
          position: { x: "number", y: "number" },
          buttons: "number[]",
          isOver: "boolean"
        }
      });
      
    // Add more category schemas
      
    default:
      return type({});
  }
}

/**
 * Create typed actions from trigger definitions
 * 
 * @param state The state instance
 * @param actionDefinitions Map of action names to action functions
 * @returns Object with typed action methods
 */
export function createTypedActions<
  T extends object,
  A extends Record<string, (...args: any[]) => Partial<T> | void>
>(
  state: StateInstanceType<T>,
  actionDefinitions: A
): { [K in keyof A]: (...args: Parameters<A[K]>) => void } {
  const actions = {} as { [K in keyof A]: (...args: Parameters<A[K]>) => void };
  
  // Create a trigger for each action
  for (const actionName in actionDefinitions) {
    const actionFn = actionDefinitions[actionName];
    
    // Register a trigger for this action
    const trigger = registerTrigger(
      `action:${String(actionName)}`,
      (state: T, ...args: any[]) => actionFn(state, ...args)
    );
    
    // Connect the trigger to the state
    state.connectTrigger(trigger as any);
    
    // Create an action method
    actions[actionName] = ((...args: any[]) => {
      trigger.action(state.get(), ...args);
    }) as any;
  }
  
  return actions;
} 