/**
 * InSpatial Container System - Behavior Analysis Security System
 * 
 * This module provides behavioral analysis and anomaly detection for 
 * container operations, focusing on identifying suspicious patterns
 * and potential security violations.
 */

import { EventEmitter } from "node:events";

/**
 * Types of security events that can be monitored
 */
export enum SecurityEventType {
  FILE_ACCESS = "file_access",           // File read operations
  FILE_MODIFICATION = "file_modification", // File write/delete operations
  SYMLINK_OPERATION = "symlink_operation", // Symlink creation/following
  PERMISSION_CHANGE = "permission_change", // Chmod/chown operations
  MOUNT_OPERATION = "mount_operation",     // Mount/unmount operations
  HIGH_FREQUENCY_IO = "high_frequency_io", // Rapid file operations
  PATH_TRAVERSAL = "path_traversal",       // Suspicious path access patterns
  EXECUTION_ATTEMPT = "execution_attempt", // Attempts to execute files
}

/**
 * Security level for detected anomalies
 */
export enum SecurityLevel {
  INFO = "info",         // Informational, not necessarily a threat
  LOW = "low",           // Low risk activity
  MEDIUM = "medium",     // Potentially malicious activity
  HIGH = "high",         // Likely malicious activity
  CRITICAL = "critical", // Immediate threat requiring intervention
}

/**
 * Structure of a security event
 */
export interface SecurityEvent {
  type: SecurityEventType;         // Type of the security event
  level: SecurityLevel;            // Severity level
  timestamp: Date;                 // When the event occurred
  containerName: string;           // Name of the container
  userId: number;                  // User ID who triggered the event
  action: string;                  // Specific action (e.g., "read", "write")
  path?: string;                   // File path if applicable
  details: Record<string, any>;    // Additional context information
  message: string;                 // Human-readable description
}

/**
 * Rule configuration for behavioral analysis
 */
export interface BehaviorRule {
  id: string;                      // Unique identifier for the rule
  name: string;                    // Human-readable name
  description: string;             // Description of what the rule detects
  eventTypes: SecurityEventType[]; // Event types this rule applies to
  threshold?: number;              // Threshold for triggering (if applicable)
  timeWindow?: number;             // Time window in ms (if applicable)
  level: SecurityLevel;            // Default security level for violations
  enabled: boolean;                // Whether the rule is active
  evaluate: (context: RuleContext) => boolean; // Evaluation function
  message: (context: RuleContext) => string;   // Message generator function
}

/**
 * Context provided to rule evaluation functions
 */
export interface RuleContext {
  event: Omit<SecurityEvent, 'level' | 'message'>;  // Current event being evaluated
  history: SecurityEvent[];        // Recent related events
  state: Record<string, any>;      // Persistent state for this rule
}

/**
 * Configuration for the behavior analyzer
 */
export interface BehaviorAnalyzerConfig {
  historySize: number;             // Number of events to keep in history
  rules: BehaviorRule[];           // Rules to apply
  autoBlockThreshold?: SecurityLevel; // Auto-block when this level is reached
}

/**
 * Analyzes container behavior to detect security threats
 */
export class BehaviorAnalyzer extends EventEmitter {
  private config: BehaviorAnalyzerConfig;
  private eventHistory: Map<string, SecurityEvent[]> = new Map();
  private ruleStates: Map<string, Record<string, any>> = new Map();
  
  /**
   * Creates a new behavior analyzer
   * 
   * @param config Configuration for the analyzer
   */
  constructor(config: BehaviorAnalyzerConfig) {
    super();
    this.config = config;
  }
  
  /**
   * Processes a new security event
   * 
   * @param event The security event to analyze
   * @returns True if the event was flagged as suspicious
   */
  processEvent(event: Omit<SecurityEvent, 'level' | 'message'>): boolean {
    let isSuspicious = false;
    
    // Evaluate all enabled rules
    for (const rule of this.config.rules.filter(r => r.enabled && r.eventTypes.includes(event.type))) {
      // Prepare context for rule evaluation
      const context = this.prepareContext(rule, event);
      
      // Evaluate the rule
      if (rule.evaluate(context)) {
        // Rule triggered, create security event
        const securityEvent: SecurityEvent = {
          ...event,
          level: rule.level,
          message: rule.message(context)
        };
        
        // Emit the security event
        this.emit('security-event', securityEvent);
        
        // Check if auto-blocking is needed
        if (
          this.config.autoBlockThreshold && 
          this.getSecurityLevelValue(rule.level) >= this.getSecurityLevelValue(this.config.autoBlockThreshold)
        ) {
          this.emit('auto-block', {
            containerName: event.containerName,
            reason: securityEvent.message,
            event: securityEvent
          });
        }
        
        isSuspicious = true;
      }
    }
    
    // Add to history regardless of whether it was suspicious
    this.addToHistory(event);
    
    return isSuspicious;
  }
  
  /**
   * Adds the event to history
   */
  private addToHistory(event: Omit<SecurityEvent, 'level' | 'message'>): void {
    // Get container's history or create a new one
    let containerHistory = this.eventHistory.get(event.containerName);
    if (!containerHistory) {
      containerHistory = [];
      this.eventHistory.set(event.containerName, containerHistory);
    }
    
    // Add the event
    containerHistory.push({
      ...event,
      level: SecurityLevel.INFO,  // Default level for history entries
      message: `${event.action} on ${event.path || 'unknown'}`
    });
    
    // Trim history if needed
    if (containerHistory.length > this.config.historySize) {
      containerHistory.shift();
    }
  }
  
  /**
   * Prepares the context for rule evaluation
   */
  private prepareContext(rule: BehaviorRule, event: Omit<SecurityEvent, 'level' | 'message'>): RuleContext {
    // Get container's history
    const containerHistory = this.eventHistory.get(event.containerName) || [];
    
    // Get rule state or create a new one
    let ruleState = this.ruleStates.get(rule.id);
    if (!ruleState) {
      ruleState = {};
      this.ruleStates.set(rule.id, ruleState);
    }
    
    // Return the context
    return {
      event,
      history: containerHistory.filter(e => rule.eventTypes.includes(e.type)),
      state: ruleState
    };
  }
  
  /**
   * Converts a security level to a numeric value for comparison
   */
  private getSecurityLevelValue(level: SecurityLevel): number {
    switch (level) {
      case SecurityLevel.INFO: return 0;
      case SecurityLevel.LOW: return 1;
      case SecurityLevel.MEDIUM: return 2;
      case SecurityLevel.HIGH: return 3;
      case SecurityLevel.CRITICAL: return 4;
      default: return 0;
    }
  }
}

/**
 * Default rules for the behavior analyzer
 */
export const defaultRules: BehaviorRule[] = [
  {
    id: "path-traversal-attempt",
    name: "Path Traversal Attempt",
    description: "Detects attempts to access files outside of the container's allowed paths",
    eventTypes: [SecurityEventType.FILE_ACCESS, SecurityEventType.FILE_MODIFICATION],
    level: SecurityLevel.HIGH,
    enabled: true,
    evaluate: (context) => {
      const path = context.event.path || "";
      // Check for path traversal patterns
      return path.includes("../") || path.includes("..\\") || 
             path.includes("/etc/passwd") || path.includes("/etc/shadow") ||
             path.includes("/proc/") || path.includes("/sys/") ||
             path.includes("/dev/");
    },
    message: (context) => 
      `Potential path traversal attempt detected: ${context.event.action} on ${context.event.path}`
  },
  
  {
    id: "high-frequency-file-access",
    name: "High Frequency File Access",
    description: "Detects unusually high frequency of file operations that may indicate a scan or data exfiltration",
    eventTypes: [SecurityEventType.FILE_ACCESS],
    threshold: 50,
    timeWindow: 10000, // 10 seconds
    level: SecurityLevel.MEDIUM,
    enabled: true,
    evaluate: (context) => {
      const now = Date.now();
      const recentEvents = context.history.filter(
        e => now - e.timestamp.getTime() < 10000 // 10 seconds
      );
      return recentEvents.length >= 50;
    },
    message: (context) => 
      `High frequency file access detected: ${context.history.length} operations in 10 seconds`
  },
  
  {
    id: "permission-escalation-attempt",
    name: "Permission Escalation Attempt",
    description: "Detects attempts to modify file permissions to gain higher privileges",
    eventTypes: [SecurityEventType.PERMISSION_CHANGE],
    level: SecurityLevel.HIGH,
    enabled: true,
    evaluate: (context) => {
      // Check for attempts to make files executable or setuid
      const details = context.event.details;
      if (!details.newMode) return false;
      
      // Check if making executable
      const isExecutable = (details.newMode & 0o111) !== 0;
      // Check if setting setuid/setgid
      const isSetuid = (details.newMode & 0o4000) !== 0;
      const isSetgid = (details.newMode & 0o2000) !== 0;
      
      return isExecutable && (isSetuid || isSetgid);
    },
    message: (context) => 
      `Potential permission escalation attempt: changing mode to ${context.event.details.newMode?.toString(8)} on ${context.event.path}`
  },
  
  {
    id: "suspicious-symlink-creation",
    name: "Suspicious Symlink Creation",
    description: "Detects creation of symbolic links that may be used for attacks",
    eventTypes: [SecurityEventType.SYMLINK_OPERATION],
    level: SecurityLevel.MEDIUM,
    enabled: true,
    evaluate: (context) => {
      const target = context.event.details.target || "";
      // Check if symlink points to sensitive locations
      return target.startsWith("/etc/") || 
             target.startsWith("/root/") ||
             target.startsWith("/var/") ||
             target.startsWith("/usr/") ||
             target.startsWith("/bin/") ||
             target.startsWith("/sbin/");
    },
    message: (context) => 
      `Suspicious symlink creation detected: ${context.event.path} -> ${context.event.details.target}`
  },
  
  {
    id: "mount-manipulation",
    name: "Mount Manipulation",
    description: "Detects attempts to manipulate mount points to gain access to host files",
    eventTypes: [SecurityEventType.MOUNT_OPERATION],
    level: SecurityLevel.CRITICAL,
    enabled: true,
    evaluate: (context) => {
      const source = context.event.details.source || "";
      const target = context.event.details.target || "";
      
      // Check for suspicious mount operations
      return source.startsWith("/dev/") || 
             source.startsWith("/proc/") ||
             source.startsWith("/sys/") ||
             target.startsWith("/etc/") ||
             target.includes("passwd") ||
             target.includes("shadow");
    },
    message: (context) => 
      `Suspicious mount operation detected: ${context.event.details.source} -> ${context.event.details.target}`
  }
]; 