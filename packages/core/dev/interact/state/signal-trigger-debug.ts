/**
 * # Signal-Trigger Debugging
 * @summary #### Debugging tools for signal-trigger integration
 * 
 * This module provides debugging tools for the signal-trigger integration system,
 * helping developers identify issues and understand the internal state of the system.
 * 
 * @since 0.1.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import { 
  RegisteredTriggerType,
  TriggerInstanceType,
  TriggerEventDeliveryStatusEnum 
} from "../trigger/src/types.ts";

import { AccessorType, SetterType } from "../signal/src/signals.ts";
import { StateEventBus } from "./signal-trigger.ts";
import { SignalTriggerProfiler } from "./signal-trigger-perf.ts";

/**
 * # SignalTriggerDebugger
 * @summary #### Debugging utility for signal-trigger integration
 * 
 * This class provides tools for debugging signal-trigger interactions,
 * including visualization, logging, and interactive inspection.
 * 
 * @example
 * ```typescript
 * // Create a debugger and trace a signal-trigger interaction
 * const debugger = new SignalTriggerDebugger();
 * 
 * // Monitor a signal
 * debugger.traceSignal(mySignal, "menuOpenState");
 * 
 * // Monitor a trigger
 * debugger.traceTrigger(myTrigger, "menuToggleTrigger");
 * 
 * // View signal-trigger interaction flow
 * debugger.showInteractions();
 * ```
 */
export class SignalTriggerDebugger {
  // Track all signals being monitored
  private monitoredSignals: Map<string, {
    accessor: AccessorType<any>;
    setter: SetterType<any> | null;
    value: any;
    updates: Array<{
      prev: any;
      next: any;
      timestamp: number;
      source: string | null;
    }>;
  }> = new Map();

  // Track all triggers being monitored
  private monitoredTriggers: Map<string, {
    trigger: TriggerInstanceType;
    activations: Array<{
      timestamp: number;
      payload: any;
      target: string | null;
    }>;
  }> = new Map();

  // Track all event buses being monitored
  private monitoredEventBuses: Map<string, {
    bus: StateEventBus<any>;
    events: Array<{
      type: string;
      data: any;
      timestamp: number;
      handled: boolean;
    }>;
  }> = new Map();

  // Track interactions between signals and triggers
  private interactions: Array<{
    sourceType: 'signal' | 'trigger' | 'eventBus';
    sourceId: string;
    targetType: 'signal' | 'trigger' | 'eventBus';
    targetId: string;
    timestamp: number;
    data: any;
  }> = [];

  // Is the debugger active?
  private active = true;

  // Maximum history length
  private maxHistoryLength = 100;

  // Performance profiler
  private profiler: SignalTriggerProfiler;

  /**
   * Create a new SignalTriggerDebugger
   * 
   * @param options Optional configuration
   */
  constructor(options?: {
    active?: boolean;
    maxHistoryLength?: number;
    profiler?: SignalTriggerProfiler;
  }) {
    if (options) {
      if (options.active !== undefined) {
        this.active = options.active;
      }
      if (options.maxHistoryLength !== undefined) {
        this.maxHistoryLength = options.maxHistoryLength;
      }
      if (options.profiler) {
        this.profiler = options.profiler;
      }
    }

    // Create a default profiler if none was provided
    if (!this.profiler) {
      this.profiler = new SignalTriggerProfiler({
        enabled: this.active
      });
    }
  }

  /**
   * Trace changes to a signal
   * 
   * @param signal The signal to trace [get, set] tuple
   * @param id A unique identifier for this signal
   * @returns A cleanup function to stop tracing
   */
  public traceSignal<T>(
    signal: [AccessorType<T>, SetterType<T>],
    id: string
  ): () => void {
    if (!this.active) return () => {};

    const [accessor, setter] = signal;
    const originalValue = accessor();

    // Create a monitored entry
    this.monitoredSignals.set(id, {
      accessor,
      setter,
      value: originalValue,
      updates: []
    });

    // Create a wrapped setter to track changes
    const wrappedSetter: SetterType<T> = ((value: any) => {
      const prevValue = accessor();
      
      // Check if it's a function update or direct value
      let nextValue: T;
      if (typeof value === 'function') {
        nextValue = (value as (prev: T) => T)(prevValue);
      } else {
        nextValue = value as T;
      }

      // Record the update
      const update = {
        prev: prevValue,
        next: nextValue,
        timestamp: Date.now(),
        source: this.getActiveCallSource()
      };

      // Limit history size
      const signalInfo = this.monitoredSignals.get(id)!;
      signalInfo.updates.push(update);
      if (signalInfo.updates.length > this.maxHistoryLength) {
        signalInfo.updates.shift();
      }

      // Update current value
      signalInfo.value = nextValue;

      // Call the original setter
      this.profiler.trackOperation('signal_update', () => {
        return setter(nextValue as any);
      });

      return nextValue;
    }) as SetterType<T>;

    // Return a cleanup function
    return () => {
      this.monitoredSignals.delete(id);
    };
  }

  /**
   * Trace activations of a trigger
   * 
   * @param trigger The trigger to trace
   * @param id A unique identifier for this trigger
   * @returns A cleanup function to stop tracing
   */
  public traceTrigger(
    trigger: TriggerInstanceType,
    id: string
  ): () => void {
    if (!this.active) return () => {};

    // Create a monitored entry
    this.monitoredTriggers.set(id, {
      trigger,
      activations: []
    });

    // Store the original fire method
    const originalFire = trigger.fire;

    // Replace with our wrapped version
    trigger.fire = (payload: any) => {
      // Record the activation
      const activation = {
        timestamp: Date.now(),
        payload,
        target: null // Will be filled if we can determine it
      };

      // Add to history
      const triggerInfo = this.monitoredTriggers.get(id)!;
      triggerInfo.activations.push(activation);
      if (triggerInfo.activations.length > this.maxHistoryLength) {
        triggerInfo.activations.shift();
      }

      // Call the original fire method
      this.profiler.trackOperation('trigger_activation', () => {
        return originalFire.call(trigger, payload);
      });
    };

    // Return a cleanup function
    return () => {
      if (trigger && trigger.fire) {
        trigger.fire = originalFire;
      }
      this.monitoredTriggers.delete(id);
    };
  }

  /**
   * Trace events on an EventBus
   * 
   * @param eventBus The event bus to trace
   * @param id A unique identifier for this event bus
   * @returns A cleanup function to stop tracing
   */
  public traceEventBus<EventMap extends Record<string, any[]>>(
    eventBus: StateEventBus<EventMap>,
    id: string
  ): () => void {
    if (!this.active) return () => {};

    // Create a monitored entry
    this.monitoredEventBuses.set(id, {
      bus: eventBus,
      events: []
    });

    // Store the original emit method
    const originalEmit = eventBus.emit;

    // Replace with our wrapped version
    eventBus.emit = <K extends keyof EventMap>(
      event: K,
      ...args: EventMap[K]
    ): void => {
      // Record the event
      const eventRecord = {
        type: String(event),
        data: args,
        timestamp: Date.now(),
        handled: false
      };

      // Add to history
      const busInfo = this.monitoredEventBuses.get(id)!;
      busInfo.events.push(eventRecord);
      if (busInfo.events.length > this.maxHistoryLength) {
        busInfo.events.shift();
      }

      // Call the original emit method
      this.profiler.trackOperation('eventbus_emit', () => {
        return originalEmit.call(eventBus, event, ...args);
      });

      // Mark as handled after emission
      eventRecord.handled = true;
    };

    // Return a cleanup function
    return () => {
      const bus = this.monitoredEventBuses.get(id)?.bus;
      if (bus && lens.emit) {
        lens.emit = originalEmit;
      }
      this.monitoredEventBuses.delete(id);
    };
  }

  /**
   * Record an interaction between signals, triggers, and event buses
   * 
   * @param interaction The interaction details
   */
  public recordInteraction(interaction: {
    sourceType: 'signal' | 'trigger' | 'eventBus';
    sourceId: string;
    targetType: 'signal' | 'trigger' | 'eventBus';
    targetId: string;
    data?: any;
  }): void {
    if (!this.active) return;

    this.interactions.push({
      ...interaction,
      timestamp: Date.now(),
      data: interaction.data || null
    });

    // Limit history size
    if (this.interactions.length > this.maxHistoryLength) {
      this.interactions.shift();
    }
  }

  /**
   * Generate a visualization of the current state
   * 
   * @returns Object containing the current debug state
   */
  public getState(): {
    signals: Record<string, any>;
    triggers: Record<string, any>;
    eventBuses: Record<string, any>;
    interactions: any[];
    performance: any;
  } {
    const signals: Record<string, any> = {};
    const triggers: Record<string, any> = {};
    const eventBuses: Record<string, any> = {};

    // Compile signal state
    this.monitoredSignals.forEach((info, id) => {
      signals[id] = {
        currentValue: info.value,
        updateCount: info.updates.length,
        lastUpdate: info.updates.length > 0 
          ? info.updates[info.updates.length - 1] 
          : null,
        history: info.updates
      };
    });

    // Compile trigger state
    this.monitoredTriggers.forEach((info, id) => {
      triggers[id] = {
        type: info.trigger.type,
        enabled: info.trigger.enabled,
        activationCount: info.activations.length,
        lastActivation: info.activations.length > 0
          ? info.activations[info.activations.length - 1]
          : null,
        history: info.activations
      };
    });

    // Compile event bus state
    this.monitoredEventBuses.forEach((info, id) => {
      eventBuses[id] = {
        eventCount: info.events.length,
        lastEvent: info.events.length > 0
          ? info.events[info.events.length - 1]
          : null,
        history: info.events
      };
    });

    return {
      signals,
      triggers,
      eventBuses,
      interactions: this.interactions,
      performance: this.profiler.getReport()
    };
  }

  /**
   * Log the current state to the console
   */
  public logState(): void {
    const state = this.getState();
    console.group('Signal-Trigger Debugger State');
    
    console.group('Signals');
    Object.entries(state.signals).forEach(([id, info]) => {
      console.log(`Signal: ${id}`, info);
    });
    console.groupEnd();
    
    console.group('Triggers');
    Object.entries(state.triggers).forEach(([id, info]) => {
      console.log(`Trigger: ${id}`, info);
    });
    console.groupEnd();
    
    console.group('Event Buses');
    Object.entries(state.eventBuses).forEach(([id, info]) => {
      console.log(`EventBus: ${id}`, info);
    });
    console.groupEnd();
    
    console.group('Interactions');
    state.interactions.forEach((interaction, index) => {
      console.log(`Interaction ${index}:`, interaction);
    });
    console.groupEnd();
    
    console.group('Performance');
    console.log('Performance Report:', state.performance);
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Clear all history and reset the debugger
   */
  public reset(): void {
    this.monitoredSignals.forEach(info => {
      info.updates = [];
    });
    
    this.monitoredTriggers.forEach(info => {
      info.activations = [];
    });
    
    this.monitoredEventBuses.forEach(info => {
      info.events = [];
    });
    
    this.interactions = [];
    this.profiler.reset();
  }

  /**
   * Enable or disable the debugger
   */
  public setActive(active: boolean): void {
    this.active = active;
    this.profiler.setEnabled(active);
  }

  /**
   * Get the calling source from the stack trace
   * 
   * @returns Source file and line number, or null if unavailable
   */
  private getActiveCallSource(): string | null {
    try {
      // Create an error to get the stack trace
      const err = new Error();
      const stack = err.stack || '';
      
      // Parse the stack to find the caller
      const lines = stack.split('\n');
      
      // Find the first line that's not from this file
      const callerLine = lines.find(line => 
        !line.includes('signal-trigger-debug.ts') &&
        !line.includes('SignalTriggerDebugger')
      );
      
      if (callerLine) {
        // Extract file and line info
        const match = callerLine.match(/at\s+([^\s]+)\s+\(([^:]+):(\d+):(\d+)\)/);
        if (match) {
          const [, fn, file, line] = match;
          return `${fn} (${file}:${line})`;
        }
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }
}

/**
 * # createGlobalDebugger
 * @summary #### Creates a global debugger for signal-trigger interactions
 * 
 * This function creates and returns a singleton instance of the SignalTriggerDebugger
 * for consistent debugging across the application.
 * 
 * @returns The global SignalTriggerDebugger instance
 * 
 * @example
 * ```typescript
 * // Get the global debugger
 * const debugger = createGlobalDebugger();
 * 
 * // Use it to trace a signal
 * debugger.traceSignal(mySignal, "playerPosition");
 * ```
 */
export function createGlobalDebugger(): SignalTriggerDebugger {
  // Use a global variable to store the singleton instance
  const global = globalThis as any;
  
  if (!global.__signalTriggerDebugger) {
    global.__signalTriggerDebugger = new SignalTriggerDebugger({
      // Only enable in development by default
      active: typeof __DEV__ !== 'undefined' ? __DEV__ : false
    });
  }
  
  return global.__signalTriggerDebugger;
}

// Initialize the global debugger
export const globalDebugger = createGlobalDebugger();

/**
 * # SignalTriggerInspector
 * @summary #### Utility for inspecting and visualizing signal-trigger relations
 * 
 * This class provides tools for visualizing the signal-trigger dependency graph
 * and helps users understand the flow of data and events.
 * 
 * @example
 * ```typescript
 * // Create an inspector and generate a dependency graph
 * const inspector = new SignalTriggerInspector();
 * 
 * // Register your signals and triggers
 * inspector.registerSignal(mySignal, "playerHealth");
 * inspector.registerTrigger(myTrigger, "damageEvent");
 * 
 * // Define relationships
 * inspector.addRelation({
 *   sourceId: "damageEvent",
 *   sourceType: "trigger",
 *   targetId: "playerHealth",
 *   targetType: "signal",
 *   description: "Updates player health when damage is taken"
 * });
 * 
 * // Generate visual dependency graph
 * const graphData = inspector.generateGraph();
 * ```
 */
export class SignalTriggerInspector {
  private signals: Map<string, {
    accessor: AccessorType<any>;
    setter?: SetterType<any>;
    metadata?: Record<string, any>;
  }> = new Map();

  private triggers: Map<string, {
    instance: TriggerInstanceType;
    metadata?: Record<string, any>;
  }> = new Map();

  private eventBuses: Map<string, {
    instance: StateEventBus<any>;
    metadata?: Record<string, any>;
  }> = new Map();

  private relations: Array<{
    sourceId: string;
    sourceType: 'signal' | 'trigger' | 'eventBus';
    targetId: string;
    targetType: 'signal' | 'trigger' | 'eventBus';
    relationKind: 'updates' | 'activates' | 'emits' | 'consumes' | 'other';
    description?: string;
    metadata?: Record<string, any>;
  }> = [];

  /**
   * Register a signal for tracking
   * 
   * @param signal The signal to track [get, set] tuple
   * @param id A unique identifier for this signal
   * @param metadata Optional metadata about the signal
   */
  public registerSignal<T>(
    signal: [AccessorType<T>, SetterType<T>],
    id: string,
    metadata?: Record<string, any>
  ): void {
    const [accessor, setter] = signal;
    this.signals.set(id, {
      accessor,
      setter,
      metadata
    });
  }

  /**
   * Register a trigger for tracking
   * 
   * @param trigger The trigger to track
   * @param id A unique identifier for this trigger
   * @param metadata Optional metadata about the trigger
   */
  public registerTrigger(
    trigger: TriggerInstanceType,
    id: string,
    metadata?: Record<string, any>
  ): void {
    this.triggers.set(id, {
      instance: trigger,
      metadata
    });
  }

  /**
   * Register an event bus for tracking
   * 
   * @param eventBus The event bus to track
   * @param id A unique identifier for this event bus
   * @param metadata Optional metadata about the event bus
   */
  public registerEventBus<EventMap extends Record<string, any[]>>(
    eventBus: StateEventBus<EventMap>,
    id: string,
    metadata?: Record<string, any>
  ): void {
    this.eventBuses.set(id, {
      instance: eventBus,
      metadata
    });
  }

  /**
   * Add a relation between elements
   * 
   * @param relation The relation details
   */
  public addRelation(relation: {
    sourceId: string;
    sourceType: 'signal' | 'trigger' | 'eventBus';
    targetId: string;
    targetType: 'signal' | 'trigger' | 'eventBus';
    relationKind: 'updates' | 'activates' | 'emits' | 'consumes' | 'other';
    description?: string;
    metadata?: Record<string, any>;
  }): void {
    // Validate that source and target exist
    const sourceExists = this.elementExists(relation.sourceId, relation.sourceType);
    const targetExists = this.elementExists(relation.targetId, relation.targetType);
    
    if (!sourceExists) {
      console.warn(`Source ${relation.sourceType} with ID ${relation.sourceId} does not exist`);
    }
    
    if (!targetExists) {
      console.warn(`Target ${relation.targetType} with ID ${relation.targetId} does not exist`);
    }
    
    // Add the relation even if elements don't exist yet (they might be registered later)
    this.relations.push(relation);
  }

  /**
   * Generate a dependency graph
   * 
   * @returns Graph data for visualization
   */
  public generateGraph(): {
    nodes: Array<{
      id: string;
      type: 'signal' | 'trigger' | 'eventBus';
      data: any;
    }>;
    edges: Array<{
      source: string;
      target: string;
      kind: string;
      description?: string;
    }>;
  } {
    const nodes: Array<{
      id: string;
      type: 'signal' | 'trigger' | 'eventBus';
      data: any;
    }> = [];
    
    // Add signals
    this.signals.forEach((info, id) => {
      nodes.push({
        id,
        type: 'signal',
        data: {
          value: info.accessor(),
          metadata: info.metadata || {}
        }
      });
    });
    
    // Add triggers
    this.triggers.forEach((info, id) => {
      nodes.push({
        id,
        type: 'trigger',
        data: {
          type: info.instance.type,
          enabled: info.instance.enabled,
          metadata: info.metadata || {}
        }
      });
    });
    
    // Add event buses
    this.eventBuses.forEach((info, id) => {
      nodes.push({
        id,
        type: 'eventBus',
        data: {
          metadata: info.metadata || {}
        }
      });
    });
    
    // Add relations as edges
    const edges = this.relations.map(relation => ({
      source: relation.sourceId,
      target: relation.targetId,
      kind: relation.relationKind,
      description: relation.description
    }));
    
    return { nodes, edges };
  }

  /**
   * Clear all registered elements and relations
   */
  public clear(): void {
    this.signals.clear();
    this.triggers.clear();
    this.eventBuses.clear();
    this.relations = [];
  }

  /**
   * Check if an element exists
   * 
   * @param id The element ID
   * @param type The element type
   * @returns True if the element exists
   */
  private elementExists(
    id: string,
    type: 'signal' | 'trigger' | 'eventBus'
  ): boolean {
    switch (type) {
      case 'signal':
        return this.signals.has(id);
      case 'trigger':
        return this.triggers.has(id);
      case 'eventBus':
        return this.eventBuses.has(id);
      default:
        return false;
    }
  }
}

// Create a named export
export const createInspector = () => new SignalTriggerInspector(); 