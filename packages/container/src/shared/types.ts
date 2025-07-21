/**
 * InSpatial Container System - Core Types
 *
 * This file defines the foundational type interfaces for the hybrid container system
 * that combines client-side WebAssembly with server-side gVisor containers.
 */

import { type, Type } from "@inspatial/type"

/**
 * Container execution environment types
 */
export const ContainerEnvironmentType = type({
  type: "'client' | 'server'",
})

/**
 * Container lifecycle states
 */
export const ContainerStateType = type({
  state:
    "'creating' | 'running' | 'suspended' | 'resuming' | 'terminating' | 'terminated' | 'failed'",
})

/**
 * Container configuration options
 */
export const ContainerConfigType = type({
  name: "string",
  environment: ContainerEnvironmentType,
  "resources?": {
    "cpu?": "number", // CPU cores or vCPUs
    "memory?": "number", // Memory in MB
    "diskSpace?": "number", // Disk space in MB
  },
  "timeout?": "number", // Execution timeout in milliseconds
  "metadata?": "Record<string, string>", // User-defined metadata
})

/**
 * Container runtime information
 */
export const ContainerRuntimeInfoType = type({
  id: "string", // Unique container ID
  config: ContainerConfigType,
  state: ContainerStateType,
  startTime: "number", // Unix timestamp when container was created
  "endTime?": "number", // Unix timestamp when container was terminated
  "stats?": {
    "cpuUsage?": "number", // CPU usage percentage
    "memoryUsage?": "number", // Memory usage in MB
    "networkIn?": "number", // Network bytes received
    "networkOut?": "number", // Network bytes sent
  },
})

/**
 * Container execution result
 */
export const ContainerExecutionResultType = type({
  success: "boolean",
  containerId: "string",
  "error?": "string",
  "output?": "string",
  "exitCode?": "number",
  stats: {
    "executionTime?": "number", // Execution time in milliseconds
    "cpuTime?": "number", // CPU time used in milliseconds
    "peakMemoryUsage?": "number", // Peak memory usage in MB
  },
})

/**
 * State synchronization priority levels
 */
export const SyncPriorityType = type({
  priority: "'critical' | 'high' | 'normal' | 'low'",
})

/**
 * State synchronization direction
 */
export const SyncDirectionType = type({
  direction: "'clientToServer' | 'serverToClient' | 'bidirectional'",
})

/**
 * State synchronization configuration
 */
export const StateSyncConfigType = type({
  stateId: "string",
  priority: SyncPriorityType,
  direction: SyncDirectionType,
  "conflictStrategy?":
    "'clientWins' | 'serverWins' | 'lastWriteWins' | 'manual'",
})

/**
 * Container event type definitions
 */
export const ContainerEventType = type({
  type:
    "'created' | 'started' | 'suspended' | 'resumed' | 'terminated' | 'failed' | 'stateChanged'",
  containerId: "string",
  timestamp: "number",
  "details?": "Record<string, unknown>", // Event-specific details
})

/**
 * Security context for container execution
 */
export const SecurityContextType: Type<any> = type({
  userId: "string",
  "permissions?": "string[]",
  "securityTokens?": "Record<string, string>",
  "isolationLevel?": "'standard' | 'enhanced' | 'maximum'",
})

// TypeScript interfaces derived from the runtime validators
export type ContainerEnvironment = typeof ContainerEnvironmentType.infer
export type ContainerState = typeof ContainerStateType.infer
export type ContainerConfig = typeof ContainerConfigType.infer
export type ContainerRuntimeInfo = typeof ContainerRuntimeInfoType.infer
export type ContainerExecutionResult = typeof ContainerExecutionResultType.infer
export type SyncPriority = typeof SyncPriorityType.infer
export type SyncDirection = typeof SyncDirectionType.infer
export type StateSyncConfig = typeof StateSyncConfigType.infer
export type ContainerEvent = typeof ContainerEventType.infer
export type SecurityContext = typeof SecurityContextType.infer
