/**
 * @file monitoring.ts
 * @description Performance monitoring and metrics for TriggerBridge
 */
import {
  EventSystemStatsType,
  PlatformType,
  TriggerEventDeliveryStatusType,
  LogSeverityEnum,
  ErrorCodeEnum,
} from "./types.ts";
import { errorLogger } from "./errors.ts";
import { triggerConfigManager } from "./config.ts";

/**
 * Event metric structure
 */
interface TriggerEventMetricType {
  timestamp: number;
  platform: PlatformType;
  eventName: string;
  deliveryTime?: number;
  queueTime?: number;
  handlerTime?: number;
  status: TriggerEventDeliveryStatusType;
  messageId: string;
  sourceNode: string;
  destinationNode?: string;
  error?: string;
}

/**
 * System health indicators
 */
export interface TriggerSystemHealthType {
  queueHealth: "good" | "warning" | "critical";
  errorRate: "good" | "warning" | "critical";
  latency: "good" | "warning" | "critical";
  overall: "good" | "warning" | "critical";
}

/**
 * Performance monitoring system
 */
export class TriggerPerformanceMonitorClass {
  private static instance: TriggerPerformanceMonitorClass;

  // Runtime metrics
  private metricsEnabled: boolean = true;
  private metrics: TriggerEventMetricType[] = [];
  private maximumMetricsLength: number = 1000;

  // Aggregate statistics
  private stats: EventSystemStatsType = {
    totalEventsProcessed: 0,
    eventsByPlatform: {
      dom: 0,
      native: 0,
      inreal: 0,
    },
    eventsByName: {},
    totalErrors: 0,
    averageProcessingTime: 0,
    maxQueueSize: 0,
    currentQueueSize: 0,
  };

  // Running sums for calculating averages
  private totalProcessingTime: number = 0;

  // Event timers for in-progress events
  private eventTimers: Map<
    string,
    {
      start: number;
      queueStart?: number;
      handlerStart?: number;
    }
  > = new Map();

  // Performance buffers for detecting trends
  private queueSizeBuffer: number[] = [];
  private processingTimeBuffer: number[] = [];
  private errorBuffer: boolean[] = [];
  private bufferMaxLength: number = 100;

  /**
   * Get the singleton instance
   */
  public static getInstance(): TriggerPerformanceMonitorClass {
    if (!TriggerPerformanceMonitorClass.instance) {
      TriggerPerformanceMonitorClass.instance =
        new TriggerPerformanceMonitorClass();
    }
    return TriggerPerformanceMonitorClass.instance;
  }

  /**
   * Initialize the monitor with configuration
   */
  private constructor() {
    const config = triggerConfigManager.getConfig();
    this.metricsEnabled = config.performance.enableMonitoring;
    this.resetStats();
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalEventsProcessed: 0,
      eventsByPlatform: {
        dom: 0,
        native: 0,
        inreal: 0,
      },
      eventsByName: {},
      totalErrors: 0,
      averageProcessingTime: 0,
      maxQueueSize: 0,
      currentQueueSize: 0,
    };

    this.totalProcessingTime = 0;
    this.metrics = [];
    this.eventTimers.clear();
    this.queueSizeBuffer = [];
    this.processingTimeBuffer = [];
    this.errorBuffer = [];
  }

  /**
   * Track the start of event processing
   */
  public trackEventStart(
    messageId: string,
    platform: PlatformType,
    eventName: string,
    sourceNode: string
  ): void {
    if (!this.metricsEnabled) return;

    this.eventTimers.set(messageId, {
      start: performance.now(),
    });
  }

  /**
   * Track when an event enters the queue
   */
  public trackEventQueued(messageId: string, currentQueueSize: number): void {
    if (!this.metricsEnabled) return;

    const timer = this.eventTimers.get(messageId);
    if (timer) {
      timer.queueStart = performance.now();
    }

    // Update queue statistics
    this.stats.currentQueueSize = currentQueueSize;
    if (currentQueueSize > this.stats.maxQueueSize) {
      this.stats.maxQueueSize = currentQueueSize;
    }

    // Add to queue size buffer for trend analysis
    this.queueSizeBuffer.push(currentQueueSize);
    if (this.queueSizeBuffer.length > this.bufferMaxLength) {
      this.queueSizeBuffer.shift();
    }
  }

  /**
   * Track when an event handler starts executing
   */
  public trackHandlerStart(messageId: string): void {
    if (!this.metricsEnabled) return;

    const timer = this.eventTimers.get(messageId);
    if (timer) {
      timer.handlerStart = performance.now();
    }
  }

  /**
   * Track the completion of event processing
   */
  public trackEventCompletion(
    messageId: string,
    platform: PlatformType,
    eventName: string,
    status: TriggerEventDeliveryStatusType,
    sourceNode: string,
    destinationNode?: string,
    error?: string
  ): void {
    if (!this.metricsEnabled) return;

    const endTime = performance.now();
    const timer = this.eventTimers.get(messageId);

    if (!timer) {
      // This should not happen - log as error
      errorLogger.warning(
        `No timer found for message ${messageId}`,
        ErrorCodeEnum.GENERAL_ERROR
      );
      return;
    }

    // Calculate timing metrics
    const queueTime = timer.queueStart
      ? timer.handlerStart
        ? timer.handlerStart - timer.queueStart
        : endTime - timer.queueStart
      : undefined;

    const handlerTime = timer.handlerStart
      ? endTime - timer.handlerStart
      : undefined;

    const totalTime = endTime - timer.start;

    // Update aggregate statistics
    this.stats.totalEventsProcessed++;
    this.stats.eventsByPlatform[platform]++;

    if (!this.stats.eventsByName[eventName]) {
      this.stats.eventsByName[eventName] = 0;
    }
    this.stats.eventsByName[eventName]++;

    if (status === TriggerEventDeliveryStatusType.FAILED) {
      this.stats.totalErrors++;
      this.errorBuffer.push(true);
    } else {
      this.errorBuffer.push(false);
    }

    // Track processing time for averages
    this.totalProcessingTime += totalTime;
    this.stats.averageProcessingTime =
      this.totalProcessingTime / this.stats.totalEventsProcessed;

    // Add to processing time buffer
    this.processingTimeBuffer.push(totalTime);
    if (this.processingTimeBuffer.length > this.bufferMaxLength) {
      this.processingTimeBuffer.shift();
    }

    // Remove from active timers
    this.eventTimers.delete(messageId);

    // Keep only the last N metrics
    if (this.metricsEnabled) {
      const metric: TriggerEventMetricType = {
        timestamp: Date.now(),
        platform,
        eventName,
        deliveryTime: totalTime,
        queueTime,
        handlerTime,
        status,
        messageId,
        sourceNode,
        destinationNode,
        error,
      };

      this.metrics.push(metric);

      if (this.metrics.length > this.maximumMetricsLength) {
        this.metrics.shift();
      }

      // Log performance warning if processing took too long
      const config = triggerConfigManager.getConfig();
      if (totalTime > config.performance.slowOperationThreshold) {
        errorLogger.warning(
          `Slow event processing: ${eventName} took ${totalTime.toFixed(2)}ms`,
          ErrorCodeEnum.GENERAL_ERROR,
          { messageId, platform, eventName, totalTime }
        );
      }
    }
  }

  /**
   * Get current system statistics
   */
  public getStats(): EventSystemStatsType {
    return { ...this.stats };
  }

  /**
   * Get detailed metrics for recent events
   */
  public getDetailedMetrics(): TriggerEventMetricType[] {
    return [...this.metrics];
  }

  /**
   * Get system health assessment
   */
  public getSystemHealth(): TriggerSystemHealthType {
    // Calculate health indicators

    // Queue health based on recent queue sizes
    const avgQueueSize =
      this.queueSizeBuffer.length > 0
        ? this.queueSizeBuffer.reduce((sum, size) => sum + size, 0) /
          this.queueSizeBuffer.length
        : 0;

    const queueHealthPercent = Math.min(
      100,
      (avgQueueSize / this.stats.maxQueueSize) * 100
    );
    const queueHealth =
      queueHealthPercent > 80
        ? "critical"
        : queueHealthPercent > 50
          ? "warning"
          : "good";

    // Error rate based on recent errors
    const errorRate =
      this.errorBuffer.length > 0
        ? this.errorBuffer.filter((isError) => isError).length /
          this.errorBuffer.length
        : 0;

    const errorHealth =
      errorRate > 0.1 ? "critical" : errorRate > 0.05 ? "warning" : "good";

    // Latency based on recent processing times
    const avgLatency =
      this.processingTimeBuffer.length > 0
        ? this.processingTimeBuffer.reduce((sum, time) => sum + time, 0) /
          this.processingTimeBuffer.length
        : 0;

    const config = triggerConfigManager.getConfig();
    const latencyThreshold = config.performance.slowOperationThreshold;

    const latencyHealth =
      avgLatency > latencyThreshold * 1.5
        ? "critical"
        : avgLatency > latencyThreshold * 0.8
          ? "warning"
          : "good";

    // Overall health is the worst of all indicators
    const healthValues = [queueHealth, errorHealth, latencyHealth];
    const overall = healthValues.includes("critical")
      ? "critical"
      : healthValues.includes("warning")
        ? "warning"
        : "good";

    return {
      queueHealth,
      errorRate: errorHealth,
      latency: latencyHealth,
      overall,
    };
  }

  /**
   * Enable or disable metrics collection
   */
  public setMetricsEnabled(enabled: boolean): void {
    this.metricsEnabled = enabled;

    // If disabling, clear existing metrics to save memory
    if (!enabled) {
      this.metrics = [];
      this.eventTimers.clear();
    }
  }

  /**
   * Log current system status
   */
  public logSystemStatus(): void {
    const health = this.getSystemHealth();
    const stats = this.getStats();

    const severityMap = {
      good: LogSeverityEnum.INFO,
      warning: LogSeverityEnum.WARNING,
      critical: LogSeverityEnum.ERROR,
    };

    errorLogger.info(
      `TriggerBridge Status: Health=${health.overall}, Events=${stats.totalEventsProcessed}, Errors=${stats.totalErrors}, AvgTime=${stats.averageProcessingTime.toFixed(2)}ms`,
      { health, stats }
    );
  }
}

/**
 * Singleton instance
 */
export const triggerPerformanceMonitor =
  TriggerPerformanceMonitorClass.getInstance();
