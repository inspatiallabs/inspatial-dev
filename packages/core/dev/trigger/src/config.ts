/**
 * @file config.ts
 * @description Configuration system for TriggerBridge
 */
import { LogSeverityEnum } from "./errors.ts";

/**
 * Configuration options for TriggerBridge
 */
export interface TriggerBridgeConfigType {
  /**
   * Queue processing options
   */
  queue: {
    /**
     * Maximum number of messages to process in a single batch
     */
    batchSize: number;
    
    /**
     * Base interval in milliseconds between processing batches
     */
    processingInterval: number;
    
    /**
     * Maximum queue size before messages start getting dropped
     */
    maxQueueSize: number;
    
    /**
     * Whether to prioritize critical events over other events
     */
    enablePrioritization: boolean;
    
    /**
     * Maximum delay in milliseconds to wait for more events before processing
     */
    maxBatchDelay: number;
  };
  
  /**
   * Error handling options
   */
  errors: {
    /**
     * Minimum severity level to log
     */
    logLevel: LogSeverityEnum;
    
    /**
     * Whether to throw errors after logging
     */
    throwErrors: boolean;
    
    /**
     * Maximum number of retries for operations that may fail
     */
    maxRetries: number;
    
    /**
     * Base delay in milliseconds between retries
     */
    retryDelay: number;
  };
  
  /**
   * Performance monitoring options
   */
  performance: {
    /**
     * Whether to enable performance monitoring
     */
    enableMonitoring: boolean;
    
    /**
     * Duration threshold in milliseconds for logging slow operations
     */
    slowOperationThreshold: number;
    
    /**
     * Whether to log detailed performance metrics
     */
    detailedMetrics: boolean;
  };
  
  /**
   * Adapter options
   */
  adapters: {
    /**
     * Whether to automatically initialize available platform adapters
     */
    autoInitialize: boolean;
    
    /**
     * Whether to detect and load native adapters dynamically
     */
    dynamicAdapterLoading: boolean;
  };
  
  /**
   * Debug options
   */
  debug: {
    /**
     * Whether to enable verbose logging
     */
    verbose: boolean;
    
    /**
     * Whether to trace event flows through the system
     */
    traceEvents: boolean;
    
    /**
     * Whether to log all dispatched events
     */
    logAllEvents: boolean;
    
    /**
     * Whether to log all event mappings
     */
    logEventMappings: boolean;
  };
}

/**
 * Default configuration values
 */
export const defaultConfig: TriggerBridgeConfigType = {
  queue: {
    batchSize: 10,
    processingInterval: 10,
    maxQueueSize: 1000,
    enablePrioritization: true,
    maxBatchDelay: 100,
  },
  errors: {
    logLevel: LogSeverityEnum.WARNING,
    throwErrors: false,
    maxRetries: 3,
    retryDelay: 100,
  },
  performance: {
    enableMonitoring: true,
    slowOperationThreshold: 100,
    detailedMetrics: false,
  },
  adapters: {
    autoInitialize: true,
    dynamicAdapterLoading: true,
  },
  debug: {
    verbose: false,
    traceEvents: false,
    logAllEvents: false,
    logEventMappings: false,
  },
};

/**
 * Configuration manager for TriggerBridge
 */
export class TriggerConfigManagerClass {
  private static instance: TriggerConfigManagerClass;
  private config: TriggerBridgeConfigType;
  
  private constructor() {
    this.config = { ...defaultConfig };
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): TriggerConfigManagerClass {
    if (!TriggerConfigManagerClass.instance) {
      TriggerConfigManagerClass.instance = new TriggerConfigManagerClass();
    }
    return TriggerConfigManagerClass.instance;
  }
  
  /**
   * Update the configuration
   */
  public updateConfig(partialConfig: Partial<TriggerBridgeConfigType>): void {
    this.config = this.mergeConfigs(this.config, partialConfig);
  }
  
  /**
   * Get the current configuration
   */
  public getConfig(): TriggerBridgeConfigType {
    return { ...this.config };
  }
  
  /**
   * Get a specific configuration section
   */
  public getSection<K extends keyof TriggerBridgeConfigType>(
    section: K
  ): TriggerBridgeConfigType[K] {
    return { ...this.config[section] };
  }
  
  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): void {
    this.config = { ...defaultConfig };
  }
  
  /**
   * Merge configurations, with source overriding target
   */
  private mergeConfigs(
    target: TriggerBridgeConfigType,
    source: Partial<TriggerBridgeConfigType>
  ): TriggerBridgeConfigType {
    const result = { ...target };
    
    if (!source) return result;
    
    // Merge each section
    Object.keys(source).forEach((key) => {
      const k = key as keyof TriggerBridgeConfigType;
      if (
        source[k] &&
        typeof source[k] === 'object' &&
        !Array.isArray(source[k])
      ) {
        result[k] = {
          ...result[k],
          ...source[k],
        };
      } else if (source[k] !== undefined) {
        (result as any)[k] = source[k];
      }
    });
    
    return result;
  }
}

/**
 * Singleton instance of TriggerConfigManager
 */
export const triggerConfigManager = TriggerConfigManagerClass.getInstance();

// For backward compatibility
export type TriggerBridgeConfig = TriggerBridgeConfigType; 