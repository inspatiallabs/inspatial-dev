/**
 * InSpatial Container System - Client WASM Container Implementation
 *
 * This file implements the client-side container management using WebAssembly
 * for lightweight code execution within the browser.
 */

import type {
  ContainerConfig,
  ContainerEvent,
  ContainerExecutionResult,
  ContainerRuntimeInfo,
  ContainerState,
  SecurityContext,
} from "../../shared/types.ts"

import {
  InContainerEventListener,
  InContainerManager,
} from "../../shared/interfaces.ts"

/**
 * Client-side WASM container implementation
 *
 * This class implements the container management interface for browser
 * environments using WebAssembly for code execution.
 */
export class ClientContainerManager implements InContainerManager {
  private containers: Map<string, ClientContainer> = new Map()
  private eventListeners: Map<string, Set<InContainerEventListener>> = new Map()
  private nextContainerId = 0

  /**
   * Creates a new client-side WASM container
   */
  async createContainer(
    config: ContainerConfig,
    securityContext: SecurityContext,
  ): Promise<string> {
    // Generate a unique container ID
    const containerId = `client-${Date.now()}-${this.nextContainerId++}`

    // Create and initialize the container
    const container = new ClientContainer(containerId, config)

    // Store the container
    this.containers.set(containerId, container)

    // Emit container created event
    this.emitEvent({
      type: "created",
      containerId,
      timestamp: Date.now(),
      details: { config },
    })

    return containerId
  }

  /**
   * Starts a previously created container
   */
  async startContainer(containerId: string): Promise<void> {
    const container = this.getContainer(containerId)
    await container.start()

    // Emit container started event
    this.emitEvent({
      type: "started",
      containerId,
      timestamp: Date.now(),
    })
  }

  /**
   * Suspends a running container
   */
  async suspendContainer(containerId: string): Promise<void> {
    const container = this.getContainer(containerId)
    await container.suspend()

    // Emit container suspended event
    this.emitEvent({
      type: "suspended",
      containerId,
      timestamp: Date.now(),
    })
  }

  /**
   * Resumes a previously suspended container
   */
  async resumeContainer(containerId: string): Promise<void> {
    const container = this.getContainer(containerId)
    await container.resume()

    // Emit container resumed event
    this.emitEvent({
      type: "resumed",
      containerId,
      timestamp: Date.now(),
    })
  }

  /**
   * Terminates a container, releasing all resources
   */
  async terminateContainer(containerId: string, force = false): Promise<void> {
    const container = this.getContainer(containerId)
    await container.terminate(force)

    // Remove the container from the registry
    this.containers.delete(containerId)

    // Emit container terminated event
    this.emitEvent({
      type: "terminated",
      containerId,
      timestamp: Date.now(),
      details: { force },
    })
  }

  /**
   * Executes a command within the container
   */
  async executeCommand(
    containerId: string,
    command: string,
    args: string[] = [],
  ): Promise<ContainerExecutionResult> {
    const container = this.getContainer(containerId)
    return container.executeCommand(command, args)
  }

  /**
   * Gets runtime information about a container
   */
  async getContainerInfo(containerId: string): Promise<ContainerRuntimeInfo> {
    const container = this.getContainer(containerId)
    return container.getRuntimeInfo()
  }

  /**
   * Lists all containers managed by this container manager
   */
  async listContainers(filters?: {
    states?: ContainerState["state"][]
    namePattern?: string
  }): Promise<ContainerRuntimeInfo[]> {
    const result: ContainerRuntimeInfo[] = []

    for (const container of this.containers.values()) {
      const info = await container.getRuntimeInfo()

      // Apply filters if provided
      if (filters) {
        // Filter by state
        if (filters.states && !filters.states.includes(info.state.state)) {
          continue
        }

        // Filter by name pattern
        if (
          filters.namePattern && !info.config.name.includes(filters.namePattern)
        ) {
          continue
        }
      }

      result.push(info)
    }

    return result
  }

  /**
   * Adds an event listener for container events
   */
  addEventListener(
    eventTypes: ContainerEvent["type"][],
    listener: InContainerEventListener,
  ): () => void {
    // Create a wrapper that filters by event type
    const wrappedListener: InContainerEventListener = (event) => {
      if (eventTypes.includes(event.type)) {
        listener(event)
      }
    }

    // Store the listener for each event type
    for (const eventType of eventTypes) {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, new Set())
      }

      this.eventListeners.get(eventType)!.add(wrappedListener)
    }

    // Return function to remove the listener
    return () => {
      for (const eventType of eventTypes) {
        const listeners = this.eventListeners.get(eventType)
        if (listeners) {
          listeners.delete(wrappedListener)
        }
      }
    }
  }

  /**
   * Emits a container event to all registered listeners
   */
  private emitEvent(event: ContainerEvent): void {
    // Get listeners for this event type
    const typeListeners = this.eventListeners.get(event.type) || new Set()

    // Get listeners for all events
    const allListeners = this.eventListeners.get("stateChanged") || new Set()

    // Combine listeners
    const listeners = new Set([...typeListeners, ...allListeners])

    // Invoke all listeners
    for (const listener of listeners) {
      try {
        listener(event)
      } catch (error) {
        console.error("Error in container event listener:", error)
      }
    }
  }

  /**
   * Gets a container by ID, throwing if not found
   */
  private getContainer(containerId: string): ClientContainer {
    const container = this.containers.get(containerId)
    if (!container) {
      throw new Error(`Container not found: ${containerId}`)
    }
    return container
  }
}

/**
 * Client-side container implementation using WebAssembly
 */
class ClientContainer {
  private id: string
  private config: ContainerConfig
  private state: ContainerState = { state: "creating" }
  private startTime: number = Date.now()
  private endTime?: number
  private wasmInstance?: WebAssembly.Instance
  private wasmMemory?: WebAssembly.Memory
  private stats = {
    cpuUsage: 0,
    memoryUsage: 0,
    networkIn: 0,
    networkOut: 0,
  }

  constructor(id: string, config: ContainerConfig) {
    this.id = id
    this.config = config
  }

  /**
   * Starts the container
   */
  async start(): Promise<void> {
    if (this.state.state !== "creating" && this.state.state !== "suspended") {
      throw new Error(`Cannot start container in state: ${this.state.state}`)
    }

    this.state = { state: "running" }

    // Initialize WebAssembly environment
    await this.initializeWasmRuntime()
  }

  /**
   * Suspends the container
   */
  async suspend(): Promise<void> {
    if (this.state.state !== "running") {
      throw new Error(`Cannot suspend container in state: ${this.state.state}`)
    }

    this.state = { state: "suspended" }

    // Serialize container state to enable later resumption
    await this.serializeState()
  }

  /**
   * Resumes the container
   */
  async resume(): Promise<void> {
    if (this.state.state !== "suspended") {
      throw new Error(`Cannot resume container in state: ${this.state.state}`)
    }

    this.state = { state: "resuming" }

    // Restore container state
    await this.restoreState()

    this.state = { state: "running" }
  }

  /**
   * Terminates the container
   */
  async terminate(force: boolean): Promise<void> {
    if (
      this.state.state === "terminated" || this.state.state === "terminating"
    ) {
      return // Already terminated or terminating
    }

    this.state = { state: "terminating" }

    try {
      // Clean up WebAssembly resources
      await this.cleanupWasmResources()

      this.state = { state: "terminated" }
      this.endTime = Date.now()
    } catch (error) {
      if (force) {
        // Force termination despite errors
        this.state = { state: "terminated" }
        this.endTime = Date.now()
      } else {
        this.state = { state: "failed" }
        throw error
      }
    }
  }

  /**
   * Executes a command within the container
   */
  async executeCommand(
    command: string,
    args: string[] = [],
  ): Promise<ContainerExecutionResult> {
    if (this.state.state !== "running") {
      throw new Error(`Cannot execute command in state: ${this.state.state}`)
    }

    try {
      const startTime = performance.now()

      // Execute the command in the WASM environment
      const result = await this.executeInWasm(command, args)

      const executionTime = performance.now() - startTime

      return {
        success: true,
        containerId: this.id,
        output: result.output,
        exitCode: result.exitCode,
        stats: {
          executionTime,
          cpuTime: result.cpuTime,
          peakMemoryUsage: result.memoryUsage,
        },
      }
    } catch (error) {
      return {
        success: false,
        containerId: this.id,
        error: error instanceof Error ? error.message : String(error),
        stats: {
          executionTime: 0,
          cpuTime: 0,
          peakMemoryUsage: 0,
        },
      }
    }
  }

  /**
   * Gets runtime information about the container
   */
  async getRuntimeInfo(): Promise<ContainerRuntimeInfo> {
    return {
      id: this.id,
      config: this.config,
      state: this.state,
      startTime: this.startTime,
      endTime: this.endTime,
      stats: this.stats,
    }
  }

  /**
   * Initializes the WebAssembly runtime
   */
  private async initializeWasmRuntime(): Promise<void> {
    // Create WebAssembly memory
    this.wasmMemory = new WebAssembly.Memory({
      initial: 10, // Initial size in pages (64KB per page)
      maximum: 100, // Maximum size in pages
    })

    // In a real implementation, we would fetch and compile the WASM module
    // For now, we'll simulate with a placeholder
    this.wasmInstance = await this.createMockWasmInstance()

    // Initialize the WASM environment
    const initResult = await this.callWasmFunction("initialize", [])
    if (!initResult.success) {
      throw new Error(`Failed to initialize WASM runtime: ${initResult.error}`)
    }
  }

  /**
   * Creates a mock WebAssembly instance for development
   */
  private async createMockWasmInstance(): Promise<WebAssembly.Instance> {
    // This is a placeholder for actual WASM module instantiation
    // In a real implementation, this would load and compile WASM modules

    // For development, create a mock instance with the expected exports
    const mockExports = {
      memory: this.wasmMemory,
      initialize: () => 0, // Success
      execute: (cmdPtr: number, argsPtr: number) => 0, // Success
      getOutput: (bufferPtr: number, bufferLen: number) => 0, // Written bytes
      getError: (bufferPtr: number, bufferLen: number) => 0, // Written bytes
      getExitCode: () => 0, // Exit code
      suspend: () => 0, // Success
      resume: () => 0, // Success
      cleanup: () => 0, // Success
    }

    return { exports: mockExports } as unknown as WebAssembly.Instance
  }

  /**
   * Serializes container state for later restoration
   */
  private async serializeState(): Promise<void> {
    // In a real implementation, this would serialize the container state
    // to IndexedDB or another storage mechanism
    console.log(`Serializing state for container ${this.id}`)
  }

  /**
   * Restores container state after suspension
   */
  private async restoreState(): Promise<void> {
    // In a real implementation, this would restore the container state
    // from IndexedDB or another storage mechanism
    console.log(`Restoring state for container ${this.id}`)
  }

  /**
   * Cleans up WebAssembly resources
   */
  private async cleanupWasmResources(): Promise<void> {
    if (this.wasmInstance) {
      // Call cleanup function if available
      await this.callWasmFunction("cleanup", [])

      // Clear references to allow garbage collection
      this.wasmInstance = undefined
      this.wasmMemory = undefined
    }
  }

  /**
   * Executes a command in the WebAssembly environment
   */
  private async executeInWasm(
    command: string,
    args: string[],
  ): Promise<{
    output: string
    exitCode: number
    cpuTime: number
    memoryUsage: number
  }> {
    // In a real implementation, this would:
    // 1. Encode command and args as strings in WASM memory
    // 2. Call the WASM execute function
    // 3. Read back the result from WASM memory

    // For now, return a mock result
    return {
      output: `Executed command: ${command} ${args.join(" ")}`,
      exitCode: 0,
      cpuTime: 15,
      memoryUsage: 1024,
    }
  }

  /**
   * Helper to call a WebAssembly function
   */
  private async callWasmFunction(
    name: string,
    args: any[],
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.wasmInstance) {
      return {
        success: false,
        error: "WASM instance not initialized",
      }
    }

    try {
      // Get the function from exports
      const func = this.wasmInstance.exports[name] as Function
      if (typeof func !== "function") {
        return {
          success: false,
          error: `Function ${name} not found in WASM exports`,
        }
      }

      // Call the function
      const result = func(...args)

      return {
        success: true,
        result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
}
