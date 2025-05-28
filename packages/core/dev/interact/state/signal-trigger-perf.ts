/**
 * # Signal-Trigger Performance Optimization
 * @summary #### Performance monitoring and optimization for signal-trigger integration
 * 
 * This module provides performance monitoring and optimization utilities for the
 * signal-trigger integration system, helping to diagnose and resolve performance
 * bottlenecks.
 * 
 * @since 0.1.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

/**
 * # SignalTriggerProfiler
 * @summary #### Performance profiling for signal-trigger integration
 * 
 * This class provides performance measurement and tracking for signal-trigger 
 * operations, helping to identify and resolve bottlenecks.
 * 
 * @example
 * ```typescript
 * // Create a profiler and wrap common operations
 * const profiler = new SignalTriggerProfiler();
 * 
 * // Track signal updates from triggers
 * profiler.trackOperation(
 *   "triggerSignalUpdate", 
 *   () => {
 *     // Your signal update logic here
 *     setValue(newValue);
 *   }
 * );
 * 
 * // Get performance report
 * const report = profiler.getReport();
 * console.log(report.averages);
 * ```
 */
export class SignalTriggerProfiler {
  private measurements: Record<string, number[]> = {};
  private enabled = true;
  private startTimes: Record<string, number> = {};
  private thresholds: Record<string, number> = {
    triggerSignalUpdate: 16, // 60fps threshold (ms)
    eventBusEmit: 5, // Maximum acceptable time for event emission (ms)
    signalConditionEvaluation: 2, // Maximum time for condition checks (ms)
    triggerActivation: 10, // Maximum time for trigger activation (ms)
  };

  // Default sample sizes for moving averages
  private sampleSizes: Record<string, number> = {
    triggerSignalUpdate: 100,
    eventBusEmit: 100,
    signalConditionEvaluation: 200,
    triggerActivation: 50,
  };

  /**
   * Create a new SignalTriggerProfiler
   * 
   * @param options Optional configuration
   */
  constructor(options?: {
    enabled?: boolean;
    customThresholds?: Record<string, number>;
    customSampleSizes?: Record<string, number>;
  }) {
    if (options) {
      if (options.enabled !== undefined) {
        this.enabled = options.enabled;
      }
      if (options.customThresholds) {
        this.thresholds = {
          ...this.thresholds,
          ...options.customThresholds,
        };
      }
      if (options.customSampleSizes) {
        this.sampleSizes = {
          ...this.sampleSizes,
          ...options.customSampleSizes,
        };
      }
    }
  }

  /**
   * Start timing an operation
   * 
   * @param operationName The name of the operation to time
   */
  public startTimer(operationName: string): void {
    if (!this.enabled) return;
    this.startTimes[operationName] = performance.now();
  }

  /**
   * Stop timing an operation and record the result
   * 
   * @param operationName The name of the operation
   * @returns The duration in milliseconds
   */
  public stopTimer(operationName: string): number {
    if (!this.enabled || !this.startTimes[operationName]) return 0;
    
    const endTime = performance.now();
    const startTime = this.startTimes[operationName];
    const duration = endTime - startTime;
    
    this.recordMeasurement(operationName, duration);
    delete this.startTimes[operationName];
    
    // Check against threshold and log warnings if exceeded
    const threshold = this.thresholds[operationName];
    if (threshold && duration > threshold) {
      console.warn(
        `[SignalTriggerProfiler] Operation "${operationName}" exceeded threshold: ` +
        `${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
    
    return duration;
  }

  /**
   * Track an operation and measure its performance
   * 
   * @param operationName The name of the operation
   * @param operation The function to track
   * @returns The result of the operation
   */
  public trackOperation<T>(operationName: string, operation: () => T): T {
    if (!this.enabled) return operation();
    
    this.startTimer(operationName);
    try {
      return operation();
    } finally {
      this.stopTimer(operationName);
    }
  }

  /**
   * Record a performance measurement
   * 
   * @param operationName The name of the operation
   * @param duration The duration in milliseconds
   */
  public recordMeasurement(operationName: string, duration: number): void {
    if (!this.enabled) return;
    
    if (!this.measurements[operationName]) {
      this.measurements[operationName] = [];
    }
    
    const sampleSize = this.sampleSizes[operationName] || 100;
    const measurements = this.measurements[operationName];
    
    // Add the new measurement
    measurements.push(duration);
    
    // Limit the array size to maintain a moving average
    if (measurements.length > sampleSize) {
      measurements.shift(); // Remove oldest measurement
    }
  }

  /**
   * Get a performance report with statistics
   * 
   * @returns Performance statistics
   */
  public getReport(): {
    averages: Record<string, number>;
    maxValues: Record<string, number>;
    sampleCounts: Record<string, number>;
    exceedsThreshold: string[];
  } {
    const averages: Record<string, number> = {};
    const maxValues: Record<string, number> = {};
    const sampleCounts: Record<string, number> = {};
    const exceedsThreshold: string[] = [];
    
    for (const [operation, measurements] of Object.entries(this.measurements)) {
      if (measurements.length === 0) continue;
      
      // Calculate average
      const sum = measurements.reduce((acc, val) => acc + val, 0);
      const avg = sum / measurements.length;
      averages[operation] = avg;
      
      // Find maximum value
      maxValues[operation] = Math.max(...measurements);
      
      // Record sample count
      sampleCounts[operation] = measurements.length;
      
      // Check if average exceeds threshold
      const threshold = this.thresholds[operation];
      if (threshold && avg > threshold) {
        exceedsThreshold.push(operation);
      }
    }
    
    return {
      averages,
      maxValues,
      sampleCounts,
      exceedsThreshold,
    };
  }

  /**
   * Reset all measurements
   */
  public reset(): void {
    this.measurements = {};
    this.startTimes = {};
  }

  /**
   * Enable or disable profiling
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

/**
 * # OptimizedEventQueue
 * @summary #### High-performance event queue for signal-trigger integration
 * 
 * This class provides an optimized event queue for processing trigger events,
 * with options for synchronous processing of high-priority events and batch
 * processing of lower-priority events.
 * 
 * @example
 * ```typescript
 * // Create an optimized event queue
 * const queue = new OptimizedEventQueue();
 * 
 * // Add events to the queue
 * queue.enqueue({
 *   type: "uiUpdate",
 *   payload: { component: "menu", visible: true },
 *   priority: "high" // Process immediately
 * });
 * 
 * // Start processing the queue
 * queue.startProcessing();
 * 
 * // Later, stop processing
 * queue.stopProcessing();
 * ```
 */
export class OptimizedEventQueue {
  private queue: Array<{
    type: string;
    payload: any;
    priority: "high" | "normal" | "low";
    timestamp: number;
  }> = [];
  private isProcessing = false;
  private processingInterval: number | null = null;
  private syncProcessing = true;
  private batchSize = 10;
  private processCallback: ((events: Array<{ type: string; payload: any }>) => void) | null = null;

  /**
   * Create a new OptimizedEventQueue
   * 
   * @param options Optional configuration
   */
  constructor(options?: {
    synchronousProcessing?: boolean;
    batchSize?: number;
    processCallback?: (events: Array<{ type: string; payload: any }>) => void;
  }) {
    if (options) {
      if (options.synchronousProcessing !== undefined) {
        this.syncProcessing = options.synchronousProcessing;
      }
      if (options.batchSize) {
        this.batchSize = options.batchSize;
      }
      if (options.processCallback) {
        this.processCallback = options.processCallback;
      }
    }
  }

  /**
   * Add an event to the queue
   * 
   * @param event The event to queue
   */
  public enqueue(event: {
    type: string;
    payload: any;
    priority?: "high" | "normal" | "low";
  }): void {
    const priority = event.priority || "normal";
    const queuedEvent = {
      type: event.type,
      payload: event.payload,
      priority,
      timestamp: Date.now(),
    };
    
    // Process high-priority events immediately if sync processing is enabled
    if (priority === "high" && this.syncProcessing) {
      this.processEvent(queuedEvent);
      return;
    }
    
    // Otherwise, add to queue
    this.queue.push(queuedEvent);
    
    // If we're not actively processing, start processing
    if (!this.isProcessing && this.syncProcessing) {
      this.processNextBatch();
    }
  }

  /**
   * Start processing the queue at regular intervals
   * 
   * @param intervalMs The interval between processing batches (default: 16ms for ~60fps)
   */
  public startProcessing(intervalMs = 16): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Use requestAnimationFrame for UI-related events when available
    if (typeof requestAnimationFrame !== 'undefined' && intervalMs === 16) {
      const processFrame = () => {
        this.processNextBatch();
        if (this.isProcessing) {
          requestAnimationFrame(processFrame);
        }
      };
      requestAnimationFrame(processFrame);
    } else {
      // Fallback to setInterval for non-browser environments or custom intervals
      this.processingInterval = setInterval(() => {
        this.processNextBatch();
      }, intervalMs) as unknown as number;
    }
  }

  /**
   * Stop processing the queue
   */
  public stopProcessing(): void {
    this.isProcessing = false;
    if (this.processingInterval !== null) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Process the next batch of events
   */
  private processNextBatch(): void {
    if (this.queue.length === 0) return;
    
    // Sort by priority and timestamp
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = 
        priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by timestamp (oldest first)
      return a.timestamp - b.timestamp;
    });
    
    // Process batch
    const batch = this.queue.splice(0, this.batchSize);
    batch.forEach(event => this.processEvent(event));
  }

  /**
   * Process a single event
   * 
   * @param event The event to process
   */
  private processEvent(event: {
    type: string;
    payload: any;
    priority: "high" | "normal" | "low";
    timestamp: number;
  }): void {
    if (this.processCallback) {
      this.processCallback([{ type: event.type, payload: event.payload }]);
    }
  }

  /**
   * Check if the queue has any events
   */
  public hasEvents(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Get the current queue length
   */
  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear all events from the queue
   */
  public clear(): void {
    this.queue = [];
  }
}

/**
 * # optimizeUpdateTrigger
 * @summary #### Optimizes trigger updates to minimize recreation
 * 
 * This function optimizes the trigger update process by analyzing what properties
 * have changed and avoiding full trigger recreation when possible.
 * 
 * @param triggerInstance The trigger instance to update
 * @param updates The updates to apply
 * @returns The updated trigger instance
 * 
 * @example
 * ```typescript
 * // Update a trigger without full recreation
 * const updatedTrigger = optimizeUpdateTrigger(
 *   existingTrigger,
 *   { throttle: 100, debounce: null } // Only update these properties
 * );
 * ```
 */
export function optimizeUpdateTrigger<T extends Record<string, any>>(
  triggerInstance: T,
  updates: Partial<T>
): T {
  // Critical properties that require full recreation
  const criticalProperties = [
    'type',
    'target',
    'platform',
    'nodeId'
  ];
  
  // Check if any critical properties are being updated
  const hasCriticalChanges = Object.keys(updates).some(
    key => criticalProperties.includes(key)
  );
  
  if (hasCriticalChanges) {
    // For critical changes, let the normal update flow handle recreation
    return { ...triggerInstance, ...updates };
  }
  
  // For non-critical changes, apply directly without recreation
  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'action' && typeof value === 'function') {
      // Special handling for action functions
      triggerInstance[key] = value;
    } else if (key === 'throttle') {
      // Update throttle without recreating
      if (triggerInstance['_throttleData']) {
        triggerInstance['_throttleData'].throttleTime = value as number;
      } else {
        triggerInstance['_throttleData'] = { 
          lastFired: 0, 
          throttleTime: value as number 
        };
      }
    } else if (key === 'debounce') {
      // Update debounce without recreating
      if (value === null || value === undefined) {
        // Remove debounce
        delete triggerInstance['_debounceData'];
      } else if (triggerInstance['_debounceData']) {
        triggerInstance['_debounceData'].debounceTime = value as number;
      } else {
        triggerInstance['_debounceData'] = { 
          timerId: null,
          debounceTime: value as number 
        };
      }
    } else {
      // Apply other updates directly
      triggerInstance[key] = value;
    }
  });
  
  return triggerInstance;
}

/**
 * # createGlobalProfiler
 * @summary #### Creates a global profiler for signal-trigger operations
 * 
 * This function creates and returns a singleton instance of the SignalTriggerProfiler
 * for consistent performance monitoring across the application.
 * 
 * @returns The global SignalTriggerProfiler instance
 * 
 * @example
 * ```typescript
 * // Get the global profiler
 * const profiler = createGlobalProfiler();
 * 
 * // Use it to track operations
 * const result = profiler.trackOperation("importantTask", () => {
 *   // Do something performance-sensitive
 *   return computeResult();
 * });
 * ```
 */
export function createGlobalProfiler(): SignalTriggerProfiler {
  // Use a global variable to store the singleton instance
  const global = globalThis as any;
  
  if (!global.__signalTriggerProfiler) {
    global.__signalTriggerProfiler = new SignalTriggerProfiler({
      // Only enable in development by default
      enabled: typeof __DEV__ !== 'undefined' ? __DEV__ : false
    });
  }
  
  return global.__signalTriggerProfiler;
}

// Initialize the global profiler
export const globalProfiler = createGlobalProfiler(); 