/**
 * @file errors.ts
 * @description Error handling utilities and custom error classes for TriggerBridge
 */

/**
 * Severity levels for errors and logs
 */
export enum LogSeverityEnum {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  FATAL = "fatal"
}

/**
 * Error codes for specific error scenarios
 */
export enum ErrorCodeEnum {
  // General errors
  GENERAL_ERROR = "TRIGGER_GENERAL_ERROR",
  
  // Registration errors
  ADAPTER_ALREADY_REGISTERED = "TRIGGER_ADAPTER_ALREADY_REGISTERED",
  INVALID_ADAPTER = "TRIGGER_INVALID_ADAPTER",
  NODE_REGISTRATION_FAILED = "TRIGGER_NODE_REGISTRATION_FAILED",
  
  // Event handling errors
  EVENT_DISPATCH_FAILED = "TRIGGER_EVENT_DISPATCH_FAILED",
  EVENT_HANDLING_FAILED = "TRIGGER_EVENT_HANDLING_FAILED",
  EVENT_MAPPING_FAILED = "TRIGGER_EVENT_MAPPING_FAILED",
  
  // Message processing errors
  MESSAGE_PROCESSING_FAILED = "TRIGGER_MESSAGE_PROCESSING_FAILED",
  QUEUE_PROCESSING_FAILED = "TRIGGER_QUEUE_PROCESSING_FAILED",
  
  // Platform errors
  PLATFORM_DETECTION_FAILED = "TRIGGER_PLATFORM_DETECTION_FAILED",
  PLATFORM_SPECIFIC_ERROR = "TRIGGER_PLATFORM_SPECIFIC_ERROR",
  
  // Parameter validation errors
  INVALID_PARAMETER = "TRIGGER_INVALID_PARAMETER",
  MISSING_REQUIRED_PARAMETER = "TRIGGER_MISSING_REQUIRED_PARAMETER"
}

/**
 * Base error class for TriggerBridge errors
 */
export class TriggerErrorClass extends Error {
  readonly code: ErrorCodeEnum;
  readonly severity: LogSeverityEnum;
  readonly timestamp: number;
  readonly context?: Record<string, any>;

  constructor(
    message: string, 
    code: ErrorCodeEnum = ErrorCodeEnum.GENERAL_ERROR,
    severity: LogSeverityEnum = LogSeverityEnum.ERROR,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = "TriggerErrorClass";
    this.code = code;
    this.severity = severity;
    this.timestamp = Date.now();
    this.context = context;
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, TriggerErrorClass.prototype);
  }

  /**
   * Format the error for logging
   */
  formatForLogging(): string {
    return `[${new Date(this.timestamp).toISOString()}] [${this.severity}] [${this.code}] ${this.message}`;
  }
}

/**
 * Error thrown when an event cannot be dispatched
 */
export class EventDispatchErrorClass extends TriggerErrorClass {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      ErrorCodeEnum.EVENT_DISPATCH_FAILED,
      LogSeverityEnum.ERROR,
      context
    );
    this.name = "EventDispatchErrorClass";
    
    // Ensures proper prototype chain
    Object.setPrototypeOf(this, EventDispatchErrorClass.prototype);
  }
}

/**
 * Error thrown when an event handler fails
 */
export class EventHandlerErrorClass extends TriggerErrorClass {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      ErrorCodeEnum.EVENT_HANDLING_FAILED,
      LogSeverityEnum.ERROR,
      context
    );
    this.name = "EventHandlerErrorClass";
    
    // Ensures proper prototype chain
    Object.setPrototypeOf(this, EventHandlerErrorClass.prototype);
  }
}

/**
 * Error thrown when a parameter is invalid
 */
export class ParameterValidationErrorClass extends TriggerErrorClass {
  constructor(
    message: string,
    paramName: string,
    receivedValue: any
  ) {
    super(
      message,
      ErrorCodeEnum.INVALID_PARAMETER,
      LogSeverityEnum.WARNING,
      { paramName, receivedValue }
    );
    this.name = "ParameterValidationErrorClass";
    
    // Ensures proper prototype chain
    Object.setPrototypeOf(this, ParameterValidationErrorClass.prototype);
  }
}

/**
 * Error thrown when platform-specific operations fail
 */
export class PlatformErrorClass extends TriggerErrorClass {
  readonly platform: string;
  
  constructor(
    message: string,
    platform: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      ErrorCodeEnum.PLATFORM_SPECIFIC_ERROR,
      LogSeverityEnum.ERROR,
      context
    );
    this.name = "PlatformErrorClass";
    this.platform = platform;
    
    // Ensures proper prototype chain
    Object.setPrototypeOf(this, PlatformErrorClass.prototype);
  }
}

/**
 * A centralized error logging system
 */
export class ErrorLoggerClass {
  private static instance: ErrorLoggerClass;
  private logHandlers: Array<(error: TriggerErrorClass) => void> = [];
  private shouldThrow: boolean = false;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ErrorLoggerClass {
    if (!ErrorLoggerClass.instance) {
      ErrorLoggerClass.instance = new ErrorLoggerClass();
    }
    return ErrorLoggerClass.instance;
  }
  
  /**
   * Add a log handler
   */
  public addLogHandler(handler: (error: TriggerErrorClass) => void): void {
    this.logHandlers.push(handler);
  }
  
  /**
   * Set whether errors should be thrown after logging
   */
  public setShouldThrow(shouldThrow: boolean): void {
    this.shouldThrow = shouldThrow;
  }
  
  /**
   * Log an error
   */
  public logError(error: TriggerErrorClass): void {
    // Log to console by default
    console.error(error.formatForLogging());
    
    // Pass to registered handlers
    for (const handler of this.logHandlers) {
      try {
        handler(error);
      } catch (e) {
        console.error("Error in log handler:", e);
      }
    }
    
    // Optionally rethrow
    if (this.shouldThrow) {
      throw error;
    }
  }
  
  /**
   * Create and log an error
   */
  public error(
    message: string,
    code: ErrorCodeEnum = ErrorCodeEnum.GENERAL_ERROR,
    context?: Record<string, any>
  ): TriggerErrorClass {
    const error = new TriggerErrorClass(message, code, LogSeverityEnum.ERROR, context);
    this.logError(error);
    return error;
  }
  
  /**
   * Create and log a warning
   */
  public warning(
    message: string,
    code: ErrorCodeEnum = ErrorCodeEnum.GENERAL_ERROR,
    context?: Record<string, any>
  ): TriggerErrorClass {
    const error = new TriggerErrorClass(message, code, LogSeverityEnum.WARNING, context);
    this.logError(error);
    return error;
  }
  
  /**
   * Log a message with info severity
   */
  public info(message: string, context?: Record<string, any>): void {
    const error = new TriggerErrorClass(message, ErrorCodeEnum.GENERAL_ERROR, LogSeverityEnum.INFO, context);
    this.logError(error);
  }
  
  /**
   * Log a message with debug severity
   */
  public debug(message: string, context?: Record<string, any>): void {
    const error = new TriggerErrorClass(message, ErrorCodeEnum.GENERAL_ERROR, LogSeverityEnum.DEBUG, context);
    this.logError(error);
  }
}

/**
 * Singleton instance of ErrorLogger
 */
export const errorLogger = ErrorLoggerClass.getInstance();

/**
 * Parameter validation utilities
 */
export class TriggerValidatorClass {
  /**
   * Validate that a value is not null or undefined
   */
  static required<T>(value: T | null | undefined, paramName: string): T {
    if (value === null || value === undefined) {
      throw new ParameterValidationErrorClass(
        `Parameter '${paramName}' is required, but received ${value}`,
        paramName,
        value
      );
    }
    return value;
  }
  
  /**
   * Validate that a string is not empty
   */
  static nonEmptyString(value: string | null | undefined, paramName: string): string {
    const stringValue = this.required(value, paramName);
    if (typeof stringValue !== 'string' || stringValue.trim() === '') {
      throw new ParameterValidationErrorClass(
        `Parameter '${paramName}' must be a non-empty string, but received '${stringValue}'`,
        paramName,
        stringValue
      );
    }
    return stringValue;
  }
  
  /**
   * Validate that a value is one of a set of allowed values
   */
  static oneOf<T>(value: T, allowedValues: T[], paramName: string): T {
    if (!allowedValues.includes(value)) {
      throw new ParameterValidationErrorClass(
        `Parameter '${paramName}' must be one of [${allowedValues.join(', ')}], but received '${value}'`,
        paramName,
        value
      );
    }
    return value;
  }
  
  /**
   * Validate that a function exists
   */
  static isFunction(value: any, paramName: string): Function {
    if (typeof value !== 'function') {
      throw new ParameterValidationErrorClass(
        `Parameter '${paramName}' must be a function, but received ${typeof value}`,
        paramName,
        value
      );
    }
    return value;
  }
}

/**
 * Retry utility for operations that may fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retryCount: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      // Type assertion for error to use its properties
      const err = error as Error;
      lastError = err;
      
      // Log the retry attempt
      errorLogger.warning(
        `Operation failed (attempt ${attempt + 1}/${retryCount}): ${err.message}`,
        ErrorCodeEnum.GENERAL_ERROR,
        { error: err, attempt, retryCount }
      );
      
      // Wait before retry if not the last attempt
      if (attempt < retryCount - 1) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
        const delay = delayMs * Math.pow(2, attempt) * jitter;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error("Operation failed after retries");
}

/**
 * Performance monitoring utilities
 */
export class TriggerPerformanceMonitorClass {
  private static timers: Map<string, number> = new Map();
  
  /**
   * Start a performance measurement
   */
  static startTimer(key: string): void {
    this.timers.set(key, performance.now());
  }
  
  /**
   * End a performance measurement and log the result
   */
  static endTimer(key: string): number {
    const startTime = this.timers.get(key);
    if (startTime === undefined) {
      errorLogger.warning(`Timer '${key}' was never started`, ErrorCodeEnum.GENERAL_ERROR);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(key);
    
    // Log if duration exceeds threshold
    if (duration > 100) {
      errorLogger.warning(
        `Operation '${key}' took ${duration.toFixed(2)}ms to complete`,
        ErrorCodeEnum.GENERAL_ERROR,
        { operationKey: key, durationMs: duration }
      );
    }
    
    return duration;
  }
} 