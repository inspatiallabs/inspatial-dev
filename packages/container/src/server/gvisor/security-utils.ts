/**
 * InSpatial Container System - Security Utilities for Server Containers
 * 
 * This file provides security utilities for server-side gVisor containers,
 * implementing security profiles and permission management.
 */

import type { SecurityContext } from "../../shared/types.ts";
import { InSecurityManager } from "../../shared/interfaces.ts";

/**
 * Default capabilities for standard isolation level
 */
const STANDARD_CAPABILITIES = [
  "CAP_CHOWN",
  "CAP_DAC_OVERRIDE",
  "CAP_FSETID",
  "CAP_FOWNER",
  "CAP_MKNOD",
  "CAP_NET_RAW",
  "CAP_SETGID",
  "CAP_SETUID",
  "CAP_SETFCAP",
  "CAP_SETPCAP",
  "CAP_NET_BIND_SERVICE",
  "CAP_SYS_CHROOT",
  "CAP_KILL",
  "CAP_AUDIT_WRITE"
];

/**
 * Enhanced security capabilities (more restrictive)
 */
const ENHANCED_CAPABILITIES = [
  "CAP_CHOWN",
  "CAP_DAC_OVERRIDE",
  "CAP_FSETID",
  "CAP_FOWNER",
  "CAP_NET_BIND_SERVICE",
  "CAP_SETGID",
  "CAP_SETUID",
  "CAP_KILL"
];

/**
 * Maximum security capabilities (minimal set)
 */
const MAXIMUM_CAPABILITIES = [
  "CAP_CHOWN",
  "CAP_DAC_OVERRIDE",
  "CAP_SETGID",
  "CAP_SETUID"
];

/**
 * Security manager for server containers
 */
export class ServerSecurityManager implements InSecurityManager {
  // Track security violations by container
  private securityViolations: Map<string, Array<{
    timestamp: number;
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  }>> = new Map();
  
  // Active monitoring processes
  private activeMonitoring: Map<string, boolean> = new Map();
  
  /**
   * Validates security context for container operations
   */
  async validateOperation(
    securityContext: SecurityContext,
    operation: "create" | "start" | "suspend" | "resume" | "terminate" | "execute",
    containerId?: string
  ): Promise<boolean> {
    // If no permissions are specified, default to allowing basic operations
    if (!securityContext.permissions || securityContext.permissions.length === 0) {
      const defaultAllowed = ["create", "start", "suspend", "resume", "terminate"];
      return defaultAllowed.includes(operation);
    }
    
    // Check if the requested operation is in the permissions list
    return securityContext.permissions.includes(operation);
  }
  
  /**
   * Creates security configuration for container isolation
   */
  async createContainerSecurity(
    securityContext: SecurityContext
  ): Promise<Record<string, unknown>> {
    // Determine isolation level
    const isolationLevel = securityContext.isolationLevel || "standard";
    
    // Select capabilities based on isolation level
    let capabilities: string[];
    let seccompProfile: string;
    let apparmorProfile: string;
    let noNewPrivileges: boolean;
    let readonlyRootfs: boolean;
    
    switch (isolationLevel) {
      case "maximum":
        capabilities = MAXIMUM_CAPABILITIES;
        seccompProfile = "maximum";
        apparmorProfile = "runtime/maximum";
        noNewPrivileges = true;
        readonlyRootfs = true;
        break;
        
      case "enhanced":
        capabilities = ENHANCED_CAPABILITIES;
        seccompProfile = "enhanced";
        apparmorProfile = "runtime/enhanced";
        noNewPrivileges = true;
        readonlyRootfs = true;
        break;
        
      case "standard":
      default:
        capabilities = STANDARD_CAPABILITIES;
        seccompProfile = "default";
        apparmorProfile = "runtime/default";
        noNewPrivileges = false;
        readonlyRootfs = false;
        break;
    }
    
    return {
      capabilities,
      seccompProfile,
      apparmorProfile,
      noNewPrivileges,
      readonlyRootfs,
      user: {
        uid: 1000,
        gid: 1000
      },
      noNewNamespaces: isolationLevel === "maximum",
      maskProcfs: isolationLevel !== "standard",
      disableNetworking: isolationLevel === "maximum",
      env: {
        DENO_DISABLE_UNSTABLE: isolationLevel === "maximum" ? "1" : "0"
      }
    };
  }
  
  /**
   * Monitors container for security violations
   */
  async monitorContainer(containerId: string): Promise<() => void> {
    // Initialize security violations array if not exists
    if (!this.securityViolations.has(containerId)) {
      this.securityViolations.set(containerId, []);
    }
    
    // Start monitoring
    this.activeMonitoring.set(containerId, true);
    
    // Simulate monitoring process
    this.startBackgroundMonitoring(containerId);
    
    // Return function to stop monitoring
    return () => {
      this.activeMonitoring.set(containerId, false);
    };
  }
  
  /**
   * Analyzes container behavior for anomalies
   */
  async analyzeContainerBehavior(
    containerId: string,
    timeWindow?: number
  ): Promise<{
    anomalyScore: number;
    findings: Array<{
      type: string;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
    }>;
  }> {
    // Get violations for this container
    const violations = this.securityViolations.get(containerId) || [];
    
    // Filter by time window if specified
    const filteredViolations = timeWindow 
      ? violations.filter(v => (Date.now() - v.timestamp) <= timeWindow)
      : violations;
    
    // Calculate anomaly score based on violation count and severity
    let anomalyScore = 0;
    if (filteredViolations.length > 0) {
      // Calculate weighted score based on severity
      const severityWeights = {
        low: 0.1,
        medium: 0.3,
        high: 0.7,
        critical: 1.0
      };
      
      const totalWeight = filteredViolations.reduce(
        (sum, v) => sum + severityWeights[v.severity],
        0
      );
      
      // Normalize to 0-1 range
      anomalyScore = Math.min(totalWeight / 5, 1);
    }
    
    return {
      anomalyScore,
      findings: filteredViolations
    };
  }
  
  /**
   * Starts background monitoring of a container (simulation)
   */
  private startBackgroundMonitoring(containerId: string): void {
    // In a real implementation, this would use kernel monitoring tools,
    // auditd, seccomp logging, or gVisor internal monitoring
    
    // For now, just record a simulated monitoring start event
    const violations = this.securityViolations.get(containerId) || [];
    violations.push({
      timestamp: Date.now(),
      type: "monitoring",
      severity: "low",
      description: "Container security monitoring started"
    });
    
    this.securityViolations.set(containerId, violations);
  }
  
  /**
   * Records a security violation for a container
   */
  recordViolation(
    containerId: string,
    type: string,
    severity: "low" | "medium" | "high" | "critical",
    description: string
  ): void {
    const violations = this.securityViolations.get(containerId) || [];
    
    violations.push({
      timestamp: Date.now(),
      type,
      severity,
      description
    });
    
    this.securityViolations.set(containerId, violations);
  }
}

/**
 * Creates a security profile configuration based on security context
 */
export function createSecurityProfile(
  securityContext: SecurityContext
): Record<string, unknown> {
  // Create security manager instance
  const securityManager = new ServerSecurityManager();
  
  // Create and return security configuration synchronously
  const isolationLevel = securityContext.isolationLevel || "standard";
  
  // Select capabilities based on isolation level
  let capabilities: string[];
  
  switch (isolationLevel) {
    case "maximum":
      capabilities = MAXIMUM_CAPABILITIES;
      break;
    case "enhanced":
      capabilities = ENHANCED_CAPABILITIES;
      break;
    case "standard":
    default:
      capabilities = STANDARD_CAPABILITIES;
      break;
  }
  
  return {
    securitySettings: {
      network: isolationLevel === "maximum" ? "none" : "host",
      hostNetwork: isolationLevel === "standard",
      hostPID: false,
      hostIPC: false,
      privileged: false,
      capabilities,
      seccompProfile: isolationLevel === "standard" ? "default" : 
                     (isolationLevel === "enhanced" ? "enhanced" : "maximum"),
      apparmorProfile: `runtime/${isolationLevel}`,
      noNewPrivileges: isolationLevel !== "standard",
      readonlyRootfs: isolationLevel !== "standard"
    },
    env: [
      isolationLevel === "maximum" ? "DENO_NO_PROMPT=1" : "",
      isolationLevel === "maximum" ? "DENO_NO_UPDATE_CHECK=1" : "",
      isolationLevel === "maximum" ? "DENO_DISABLE_UNSTABLE=1" : ""
    ].filter(Boolean)
  };
} 