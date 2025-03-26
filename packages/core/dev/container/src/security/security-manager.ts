/**
 * InSpatial Container System - Security Manager
 * 
 * This module provides the central security management for the container system,
 * integrating various security features including behavioral analysis, isolation levels,
 * and security policy enforcement.
 */

import { FsSecurityMonitor, FsSecurityMonitorConfig } from "./fs-monitor.ts";
import { SecurityLevel } from "./behavior-analyzer.ts";
import { MemoryFileSystem } from "../fs/vfs/memory-fs.ts";
import { EventEmitter } from "node:events";

/**
 * Isolation level for the container
 */
export enum IsolationLevel {
  STANDARD = "standard",   // Basic isolation with fundamental capabilities
  ENHANCED = "enhanced",   // Stricter isolation with reduced capabilities
  MAXIMUM = "maximum"      // Highest security with minimal capabilities
}

/**
 * Security profile for container configuration
 */
export interface SecurityProfile {
  isolationLevel: IsolationLevel;
  allowedPaths: string[];
  readonlyPaths: string[];
  forbiddenPaths: string[];
  allowNetwork: boolean;
  allowDynamicCode: boolean;
  allowedHosts: string[];
  resourceLimits: {
    maxMemory?: number;
    maxDisk?: number;
    maxCpu?: number;
  };
  behaviorMonitoring: {
    enabled: boolean;
    autoBlockThreshold?: SecurityLevel;
    customRules?: any[];
  };
}

/**
 * Default security profiles for different isolation levels
 */
const DEFAULT_SECURITY_PROFILES: Record<IsolationLevel, SecurityProfile> = {
  [IsolationLevel.STANDARD]: {
    isolationLevel: IsolationLevel.STANDARD,
    allowedPaths: ["*"],
    readonlyPaths: [
      "/bin",
      "/sbin",
      "/usr/bin",
      "/usr/sbin",
      "/etc"
    ],
    forbiddenPaths: [
      "/etc/passwd",
      "/etc/shadow",
      "/proc",
      "/sys",
      "/dev"
    ],
    allowNetwork: true,
    allowDynamicCode: true,
    allowedHosts: ["*"],
    resourceLimits: {
      maxMemory: 1024 * 1024 * 1024, // 1GB
      maxDisk: 10 * 1024 * 1024 * 1024, // 10GB
      maxCpu: 1.0 // 1 CPU core
    },
    behaviorMonitoring: {
      enabled: true,
      autoBlockThreshold: SecurityLevel.CRITICAL
    }
  },
  
  [IsolationLevel.ENHANCED]: {
    isolationLevel: IsolationLevel.ENHANCED,
    allowedPaths: [
      "/home",
      "/tmp",
      "/var/tmp",
      "/usr/bin",
      "/usr/lib",
      "/bin",
      "/lib"
    ],
    readonlyPaths: [
      "/bin",
      "/sbin",
      "/usr/bin",
      "/usr/sbin",
      "/etc",
      "/lib",
      "/usr/lib"
    ],
    forbiddenPaths: [
      "/etc/passwd",
      "/etc/shadow",
      "/proc",
      "/sys",
      "/dev",
      "/var/log",
      "/var/run"
    ],
    allowNetwork: true,
    allowDynamicCode: false,
    allowedHosts: [],  // Needs explicit configuration
    resourceLimits: {
      maxMemory: 512 * 1024 * 1024, // 512MB
      maxDisk: 5 * 1024 * 1024 * 1024, // 5GB
      maxCpu: 0.5 // 0.5 CPU core
    },
    behaviorMonitoring: {
      enabled: true,
      autoBlockThreshold: SecurityLevel.HIGH
    }
  },
  
  [IsolationLevel.MAXIMUM]: {
    isolationLevel: IsolationLevel.MAXIMUM,
    allowedPaths: [
      "/home",
      "/tmp"
    ],
    readonlyPaths: [
      "/bin",
      "/sbin",
      "/usr/bin",
      "/usr/sbin",
      "/etc",
      "/lib",
      "/usr/lib"
    ],
    forbiddenPaths: [
      "/etc",
      "/proc",
      "/sys",
      "/dev",
      "/var",
      "/usr/local",
      "/root"
    ],
    allowNetwork: false,
    allowDynamicCode: false,
    allowedHosts: [],
    resourceLimits: {
      maxMemory: 256 * 1024 * 1024, // 256MB
      maxDisk: 1 * 1024 * 1024 * 1024, // 1GB
      maxCpu: 0.25 // 0.25 CPU core
    },
    behaviorMonitoring: {
      enabled: true,
      autoBlockThreshold: SecurityLevel.MEDIUM
    }
  }
};

/**
 * Configuration for the security manager
 */
export interface SecurityManagerConfig {
  containerName: string;
  isolationLevel: IsolationLevel;
  customProfile?: Partial<SecurityProfile>;
}

/**
 * Security incident with severity and details
 */
export interface SecurityIncident {
  id: string;
  timestamp: Date;
  level: SecurityLevel;
  containerName: string;
  type: string;
  message: string;
  details: Record<string, any>;
  resolved: boolean;
  mitigationTaken?: string;
}

/**
 * Central security manager for the container system
 */
export class SecurityManager extends EventEmitter {
  private containerName: string;
  private profile: SecurityProfile;
  private fsMonitor: FsSecurityMonitor | null = null;
  private incidents: SecurityIncident[] = [];
  private isContainerBlocked: boolean = false;
  private nextIncidentId: number = 1;
  
  /**
   * Creates a new security manager
   * 
   * @param config Security manager configuration
   */
  constructor(config: SecurityManagerConfig) {
    super();
    this.containerName = config.containerName;
    
    // Initialize security profile
    const baseProfile = DEFAULT_SECURITY_PROFILES[config.isolationLevel];
    this.profile = { ...baseProfile, ...config.customProfile };
    
    // Set up event listeners for container security events
    this.setupEventListeners();
  }
  
  /**
   * Sets up event listeners
   */
  private setupEventListeners(): void {
    // Listen for container-blocked events
    globalThis.addEventListener('container-blocked', (e: any) => {
      if (e.detail?.containerName === this.containerName) {
        this.handleContainerBlocked(e.detail);
      }
    });
  }
  
  /**
   * Initializes the file system security monitor
   * 
   * @param fs The file system to monitor
   */
  initializeFsMonitor(fs: MemoryFileSystem): void {
    if (this.profile.behaviorMonitoring.enabled) {
      const config: FsSecurityMonitorConfig = {
        containerName: this.containerName,
        enableBehaviorAnalysis: true,
        autoBlockThreshold: this.profile.behaviorMonitoring.autoBlockThreshold,
        customRules: this.profile.behaviorMonitoring.customRules,
        sensitiveDirectories: this.profile.forbiddenPaths,
        trackReads: true,
        trackWrites: true,
        trackMetadataChanges: true
      };
      
      this.fsMonitor = new FsSecurityMonitor(fs, config);
    }
  }
  
  /**
   * Handles a container blocked event
   */
  private handleContainerBlocked(data: any): void {
    // Record the incident
    const incident: SecurityIncident = {
      id: `INC-${this.containerName}-${this.nextIncidentId++}`,
      timestamp: data.timestamp || new Date(),
      level: SecurityLevel.CRITICAL,
      containerName: this.containerName,
      type: 'container-blocked',
      message: data.reason,
      details: data.event || {},
      resolved: false,
      mitigationTaken: 'Container execution suspended'
    };
    
    this.incidents.push(incident);
    this.isContainerBlocked = true;
    
    // Emit incident event
    this.emit('security-incident', incident);
  }
  
  /**
   * Checks if a file path is allowed by the security profile
   * 
   * @param path The file path to check
   * @param write Whether write access is requested
   * @returns True if the path is allowed, false otherwise
   */
  isPathAllowed(path: string, write: boolean = false): boolean {
    if (!path) return false;
    
    // Check if the path is in the forbidden list
    for (const forbiddenPath of this.profile.forbiddenPaths) {
      if (path === forbiddenPath || path.startsWith(`${forbiddenPath}/`)) {
        return false;
      }
    }
    
    // For write access, check readonly paths
    if (write) {
      for (const readonlyPath of this.profile.readonlyPaths) {
        if (path === readonlyPath || path.startsWith(`${readonlyPath}/`)) {
          return false;
        }
      }
    }
    
    // Check if the path is in the allowed list
    if (this.profile.allowedPaths.includes('*')) {
      return true;
    }
    
    for (const allowedPath of this.profile.allowedPaths) {
      if (path === allowedPath || path.startsWith(`${allowedPath}/`)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Checks if network access is allowed by the security profile
   * 
   * @param host The host to connect to
   * @param port The port to connect to
   * @returns True if network access is allowed, false otherwise
   */
  isNetworkAllowed(host: string, port: number): boolean {
    if (!this.profile.allowNetwork) {
      return false;
    }
    
    // Check if any host is allowed
    if (this.profile.allowedHosts.includes('*')) {
      return true;
    }
    
    // Check if the specific host is allowed
    return this.profile.allowedHosts.includes(host);
  }
  
  /**
   * Checks if dynamic code execution is allowed by the security profile
   * 
   * @returns True if dynamic code execution is allowed, false otherwise
   */
  isDynamicCodeAllowed(): boolean {
    return this.profile.allowDynamicCode;
  }
  
  /**
   * Records a security incident
   * 
   * @param level Severity level of the incident
   * @param type Type of incident
   * @param message Human-readable description
   * @param details Additional details about the incident
   * @returns The created incident
   */
  recordIncident(
    level: SecurityLevel, 
    type: string, 
    message: string, 
    details: Record<string, any> = {}
  ): SecurityIncident {
    const incident: SecurityIncident = {
      id: `INC-${this.containerName}-${this.nextIncidentId++}`,
      timestamp: new Date(),
      level,
      containerName: this.containerName,
      type,
      message,
      details,
      resolved: false
    };
    
    this.incidents.push(incident);
    
    // Emit incident event
    this.emit('security-incident', incident);
    
    // If the incident is critical, block the container
    if (level === SecurityLevel.CRITICAL) {
      this.blockContainer(incident.id, message);
    }
    
    return incident;
  }
  
  /**
   * Blocks a container due to a security incident
   * 
   * @param incidentId ID of the incident that triggered the block
   * @param reason Reason for blocking the container
   */
  blockContainer(incidentId: string, reason: string): void {
    if (this.isContainerBlocked) {
      return; // Already blocked
    }
    
    // Find the incident and update it
    const incident = this.incidents.find(i => i.id === incidentId);
    if (incident) {
      incident.mitigationTaken = 'Container execution suspended';
    }
    
    this.isContainerBlocked = true;
    
    // Emit container blocked event
    this.emit('container-blocked', {
      containerName: this.containerName,
      reason,
      incidentId,
      timestamp: new Date()
    });
  }
  
  /**
   * Gets all recorded security incidents
   * 
   * @returns Array of security incidents
   */
  getIncidents(): SecurityIncident[] {
    return [...this.incidents];
  }
  
  /**
   * Gets the current security profile
   * 
   * @returns The active security profile
   */
  getProfile(): SecurityProfile {
    return { ...this.profile };
  }
  
  /**
   * Checks if the container is currently blocked
   * 
   * @returns True if the container is blocked, false otherwise
   */
  isBlocked(): boolean {
    return this.isContainerBlocked;
  }
} 