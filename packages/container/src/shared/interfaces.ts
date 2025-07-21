/**
 * InSpatial Container System - Core Interfaces
 *
 * This file defines the interface contracts for the hybrid container system.
 * These interfaces define the behavior expected from both client and server
 * implementations.
 */

import type {
  ContainerConfig,
  ContainerEvent,
  ContainerExecutionResult,
  ContainerRuntimeInfo,
  ContainerState,
  SecurityContext,
} from "./types.ts"

/**
 * Event listener for container events
 */
export interface InContainerEventListener {
  (event: ContainerEvent): void
}

/**
 * Core container management interface
 *
 * This interface defines the contract for container lifecycle management
 * in both client and server environments.
 */
export interface InContainerManager {
  /**
   * Creates a new container with the specified configuration
   *
   * @param config The container configuration
   * @param securityContext Security context for container execution
   * @returns Promise resolving to container ID if creation is successful
   */
  createContainer(
    config: ContainerConfig,
    securityContext: SecurityContext,
  ): Promise<string>

  /**
   * Starts a previously created container
   *
   * @param containerId The ID of the container to start
   * @returns Promise resolving when container is successfully started
   */
  startContainer(containerId: string): Promise<void>

  /**
   * Suspends a running container, preserving its state
   *
   * @param containerId The ID of the container to suspend
   * @returns Promise resolving when container is successfully suspended
   */
  suspendContainer(containerId: string): Promise<void>

  /**
   * Resumes a previously suspended container
   *
   * @param containerId The ID of the container to resume
   * @returns Promise resolving when container is successfully resumed
   */
  resumeContainer(containerId: string): Promise<void>

  /**
   * Terminates a container, releasing all resources
   *
   * @param containerId The ID of the container to terminate
   * @param force Whether to force termination if container is unresponsive
   * @returns Promise resolving when container is successfully terminated
   */
  terminateContainer(containerId: string, force?: boolean): Promise<void>

  /**
   * Executes a command within a running container
   *
   * @param containerId The ID of the target container
   * @param command The command to execute
   * @param args Command arguments
   * @returns Promise resolving to execution result
   */
  executeCommand(
    containerId: string,
    command: string,
    args?: string[],
  ): Promise<ContainerExecutionResult>

  /**
   * Gets runtime information about a container
   *
   * @param containerId The ID of the container
   * @returns Promise resolving to container runtime information
   */
  getContainerInfo(containerId: string): Promise<ContainerRuntimeInfo>

  /**
   * Lists all containers managed by this container manager
   *
   * @param filters Optional filters to apply (e.g., by state, name)
   * @returns Promise resolving to array of container info objects
   */
  listContainers(filters?: {
    states?: ContainerState["state"][]
    namePattern?: string
  }): Promise<ContainerRuntimeInfo[]>

  /**
   * Adds an event listener for container events
   *
   * @param eventTypes Types of events to listen for
   * @param listener Callback function invoked when matching events occur
   * @returns Function that removes the event listener when called
   */
  addEventListener(
    eventTypes: ContainerEvent["type"][],
    listener: InContainerEventListener,
  ): () => void
}

/**
 * Interface for state synchronization between client and server
 */
export interface InStateSynchronizer {
  /**
   * Initializes state synchronization for a container
   *
   * @param containerId Container ID to synchronize state for
   * @returns Promise resolving when synchronization is initialized
   */
  initializeSync(containerId: string): Promise<void>

  /**
   * Updates local state and synchronizes with remote
   *
   * @param containerId Container ID
   * @param stateId Identifier for the state being updated
   * @param statePatch Delta patch to apply to current state
   * @returns Promise resolving to true if synchronization succeeded
   */
  updateState(
    containerId: string,
    stateId: string,
    statePatch: Record<string, unknown>,
  ): Promise<boolean>

  /**
   * Gets current state value
   *
   * @param containerId Container ID
   * @param stateId Identifier for the state
   * @returns Promise resolving to current state value
   */
  getState<T>(containerId: string, stateId: string): Promise<T>

  /**
   * Resolves a conflict between client and server states
   *
   * @param containerId Container ID
   * @param stateId Identifier for the conflicted state
   * @param resolution Resolution strategy or explicit state value
   * @returns Promise resolving when conflict is resolved
   */
  resolveConflict(
    containerId: string,
    stateId: string,
    resolution: "clientWins" | "serverWins" | Record<string, unknown>,
  ): Promise<void>

  /**
   * Closes synchronization channel and cleans up resources
   *
   * @param containerId Container ID
   * @returns Promise resolving when synchronization is terminated
   */
  terminateSync(containerId: string): Promise<void>
}

/**
 * Interface for container security operations
 */
export interface InSecurityManager {
  /**
   * Validates security context for container operations
   *
   * @param securityContext Security context to validate
   * @param operation Operation being attempted
   * @param containerId Optional container ID if operation is on existing container
   * @returns Promise resolving to true if operation is allowed
   */
  validateOperation(
    securityContext: SecurityContext,
    operation:
      | "create"
      | "start"
      | "suspend"
      | "resume"
      | "terminate"
      | "execute",
    containerId?: string,
  ): Promise<boolean>

  /**
   * Creates security configuration for container isolation
   *
   * @param securityContext User security context
   * @returns Promise resolving to container-specific security configuration
   */
  createContainerSecurity(
    securityContext: SecurityContext,
  ): Promise<Record<string, unknown>>

  /**
   * Monitors container for security violations
   *
   * @param containerId Container ID to monitor
   * @returns Promise resolving to a function that stops monitoring
   */
  monitorContainer(containerId: string): Promise<() => void>

  /**
   * Analyzes container behavior for anomalies
   *
   * @param containerId Container ID to analyze
   * @param timeWindow Time window for analysis in milliseconds
   * @returns Promise resolving to analysis result
   */
  analyzeContainerBehavior(
    containerId: string,
    timeWindow?: number,
  ): Promise<{
    anomalyScore: number
    findings: Array<{
      type: string
      severity: "low" | "medium" | "high" | "critical"
      description: string
    }>
  }>
}

/**
 * Interface for connection management between client and server
 */
export interface InConnectionManager {
  /**
   * Establishes connection to server or accepts client connection
   * 
   * @param endpoint Connection endpoint
   * @param options Additional connection options
   * @returns Promise resolving when connection is established
   */
  connect(
    endpoint?: string,
    options?: {
      protocols?: string[];
      headers?: Record<string, string>;
      reconnectStrategy?: "none" | "immediate" | "exponential";
      maxReconnectAttempts?: number;
    }
  ): Promise<boolean>;

  /**
   * Disconnects from server or client
   * 
   * @param options Disconnection options
   */
  disconnect(
    options?: {
      code?: number;
      reason?: string;
    }
  ): void;

  /**
   * Sends a message over the connection
   * 
   * @param message The message to send
   * @param priority Optional message priority
   * @returns Promise resolving to message ID when sent
   */
  sendMessage(message: any, priority?: any): Promise<string>;

  /**
   * Adds an event listener for connection events
   * 
   * @param event The event type to listen for
   * @param listener Function to call when event occurs
   * @returns Function to remove the listener
   */
  addEventListener(event: string, listener: (event: any) => void): () => void;

  /**
   * Checks if currently connected
   */
  isConnected(): boolean;
}

/**
 * Interface for virtual file system operations
 */
export interface InVirtualFileSystem {
  /**
   * Reads file content
   *
   * @param path File path
   * @returns Promise resolving to file content
   */
  readFile(path: string): Promise<Uint8Array>

  /**
   * Writes content to file
   *
   * @param path File path
   * @param content File content
   * @returns Promise resolving when write is complete
   */
  writeFile(path: string, content: Uint8Array): Promise<void>

  /**
   * Deletes a file
   *
   * @param path File path
   * @returns Promise resolving when deletion is complete
   */
  deleteFile(path: string): Promise<void>

  /**
   * Lists directory contents
   *
   * @param path Directory path
   * @returns Promise resolving to array of directory entries
   */
  readDirectory(path: string): Promise<
    Array<{
      name: string
      isDirectory: boolean
      size?: number
      modified?: number
    }>
  >

  /**
   * Creates a directory
   *
   * @param path Directory path
   * @returns Promise resolving when directory creation is complete
   */
  createDirectory(path: string): Promise<void>

  /**
   * Checks if file or directory exists
   *
   * @param path Path to check
   * @returns Promise resolving to true if path exists
   */
  exists(path: string): Promise<boolean>

  /**
   * Syncs local file system with remote
   *
   * @returns Promise resolving when synchronization is complete
   */
  syncFiles(): Promise<void>
}
