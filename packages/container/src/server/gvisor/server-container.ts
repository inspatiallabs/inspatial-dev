/**
 * InSpatial Container System - Server gVisor Container Implementation
 * 
 * This file implements the server-side container management using gVisor
 * for secure, isolated code execution with Deno runtime support.
 */

import type {
  ContainerConfig,
  ContainerEvent,
  ContainerExecutionResult,
  ContainerRuntimeInfo,
  ContainerState,
  SecurityContext
} from "../../shared/types.ts"

import { InContainerEventListener, InContainerManager } from "../../shared/interfaces.ts"
import { createSecurityProfile, ServerSecurityManager } from "./security-utils.ts";

// Define Deno types for TypeScript
declare global {
  interface DenoNamespace {
    Command: new (command: string, options?: { args: string[] }) => {
      output(): Promise<{ code: number; stdout: Uint8Array; stderr: Uint8Array }>;
    };
    stat(path: string): Promise<{ isDirectory: boolean; isFile: boolean; isSymlink: boolean; size: number; mtime: Date }>;
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    writeTextFile(path: string, data: string): Promise<void>;
    remove(path: string, options?: { recursive?: boolean }): Promise<void>;
  }
}

/**
 * Server-side container implementation using gVisor
 * 
 * This class implements the container management interface for server
 * environments using gVisor for secure container isolation.
 */
export class ServerContainerManager implements InContainerManager {
  private containers: Map<string, ServerContainer> = new Map();
  private eventListeners: Map<string, Set<InContainerEventListener>> = new Map();
  private nextContainerId = 0;
  
  // Container configuration paths
  private readonly configDir: string;
  private readonly runtimePath: string;
  private readonly denoPath: string;
  
  /**
   * Creates a new server-side container manager
   * 
   * @param options Configuration options for the server container manager
   */
  constructor(options: {
    configDir?: string;
    runtimePath?: string;
    denoPath?: string;
  } = {}) {
    // Use provided paths or defaults
    this.configDir = options.configDir || "/tmp/inspatial/container/config";
    this.runtimePath = options.runtimePath || "/usr/local/bin/runsc";
    this.denoPath = options.denoPath || "/usr/local/bin/deno";
    
    // Ensure configuration directories exist
    this.ensureConfigDirs();
  }
  
  /**
   * Ensures required configuration directories exist
   */
  private async ensureConfigDirs(): Promise<void> {
    try {
      // Check if config directory exists
      const exists = await globalThis.Deno.stat(this.configDir).catch(() => null);
      
      // Create directory if it doesn't exist
      if (!exists) {
        await globalThis.Deno.mkdir(this.configDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create container configuration directory:", error);
    }
  }

  /**
   * Creates a new server-side gVisor container
   */
  async createContainer(
    config: ContainerConfig, 
    securityContext: SecurityContext
  ): Promise<string> {
    // Generate a unique container ID
    const containerId = `server-${Date.now()}-${this.nextContainerId++}`;
    
    // Create container sandbox configuration file
    await this.createContainerConfig(containerId, config, securityContext);
    
    // Create and initialize the container
    const container = new ServerContainer(
      containerId, 
      config, 
      {
        configDir: this.configDir,
        runtimePath: this.runtimePath,
        denoPath: this.denoPath
      }
    );
    
    // Store the container
    this.containers.set(containerId, container);
    
    // Emit container created event
    this.emitEvent({
      type: "created",
      containerId,
      timestamp: Date.now(),
      details: { config }
    });
    
    return containerId;
  }

  /**
   * Starts a previously created container
   */
  async startContainer(containerId: string): Promise<void> {
    const container = this.getContainer(containerId);
    await container.start();
    
    // Emit container started event
    this.emitEvent({
      type: "started",
      containerId,
      timestamp: Date.now()
    });
  }

  /**
   * Suspends a running container
   */
  async suspendContainer(containerId: string): Promise<void> {
    const container = this.getContainer(containerId);
    await container.suspend();
    
    // Emit container suspended event
    this.emitEvent({
      type: "suspended",
      containerId,
      timestamp: Date.now()
    });
  }

  /**
   * Resumes a previously suspended container
   */
  async resumeContainer(containerId: string): Promise<void> {
    const container = this.getContainer(containerId);
    await container.resume();
    
    // Emit container resumed event
    this.emitEvent({
      type: "resumed",
      containerId,
      timestamp: Date.now()
    });
  }

  /**
   * Terminates a container, releasing all resources
   */
  async terminateContainer(containerId: string, force = false): Promise<void> {
    const container = this.getContainer(containerId);
    await container.terminate(force);
    
    // Remove the container from the registry
    this.containers.delete(containerId);
    
    // Emit container terminated event
    this.emitEvent({
      type: "terminated",
      containerId,
      timestamp: Date.now(),
      details: { force }
    });
  }

  /**
   * Executes a command within the container
   */
  async executeCommand(
    containerId: string,
    command: string,
    args: string[] = []
  ): Promise<ContainerExecutionResult> {
    const container = this.getContainer(containerId);
    return container.executeCommand(command, args);
  }

  /**
   * Gets runtime information about a container
   */
  async getContainerInfo(containerId: string): Promise<ContainerRuntimeInfo> {
    const container = this.getContainer(containerId);
    return container.getRuntimeInfo();
  }

  /**
   * Lists all containers managed by this container manager
   */
  async listContainers(filters?: { 
    states?: ContainerState["state"][];
    namePattern?: string;
  }): Promise<ContainerRuntimeInfo[]> {
    const result: ContainerRuntimeInfo[] = [];
    
    for (const container of Array.from(this.containers.values())) {
      const info = await container.getRuntimeInfo();
      
      // Apply filters if provided
      if (filters) {
        // Filter by state
        if (filters.states && !filters.states.includes(info.state.state)) {
          continue;
        }
        
        // Filter by name pattern
        if (filters.namePattern && !info.config.name.includes(filters.namePattern)) {
          continue;
        }
      }
      
      result.push(info);
    }
    
    return result;
  }

  /**
   * Adds an event listener for container events
   */
  addEventListener(
    eventTypes: ContainerEvent["type"][],
    listener: InContainerEventListener
  ): () => void {
    // Create a wrapper that filters by event type
    const wrappedListener: InContainerEventListener = (event: ContainerEvent) => {
      if (eventTypes.includes(event.type)) {
        listener(event);
      }
    };
    
    // Store the listener for each event type
    for (const eventType of eventTypes) {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, new Set());
      }
      
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.add(wrappedListener);
      }
    }
    
    // Return function to remove the listener
    return () => {
      for (const eventType of eventTypes) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
          listeners.delete(wrappedListener);
        }
      }
    };
  }

  /**
   * Emits an event to all registered listeners
   */
  private emitEvent(event: ContainerEvent): void {
    // Get listeners for this event type
    const listeners = this.eventListeners.get(event.type);
    
    // Notify listeners
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in container event listener: ${error}`);
        }
      }
    }
    
    // Notify general listeners (those listening for all events)
    const allListeners = this.eventListeners.get("*");
    if (allListeners) {
      for (const listener of Array.from(allListeners)) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in container event listener: ${error}`);
        }
      }
    }
  }

  /**
   * Gets a container by ID
   */
  private getContainer(containerId: string): ServerContainer {
    const container = this.containers.get(containerId);
    if (!container) {
      throw new Error(`Container not found: ${containerId}`);
    }
    return container;
  }

  /**
   * Creates container configuration files
   */
  private async createContainerConfig(
    containerId: string,
    config: ContainerConfig,
    securityContext: SecurityContext
  ): Promise<void> {
    // Create container directory
    const containerDir = `${this.configDir}/${containerId}`;
    await globalThis.Deno.mkdir(containerDir, { recursive: true });
    
    // Get security profile based on security context
    const securityProfile = createSecurityProfile(securityContext);

    // Create runsc configuration file
    const runscConfig = {
      // Basic container configuration
      id: containerId,
      name: config.name,
      
      // Apply security settings from profile
      ...securityProfile,
      
      // Resource limits
      resources: {
        cpuShares: config.resources?.cpu ? Math.floor(config.resources.cpu * 1024) : 1024,
        memory: config.resources?.memory ? config.resources.memory * 1024 * 1024 : undefined,
        diskQuota: config.resources?.diskSpace ? config.resources.diskSpace * 1024 * 1024 : undefined,
      },
      
      // Runtime settings
      runtime: "runsc",
      platform: {
        os: "linux",
        arch: "amd64"
      },
      
      // User information
      user: {
        uid: 1000,
        gid: 1000
      },
      
      // Default process configuration
      process: {
        terminal: false,
        env: [
          "DENO_DIR=/deno",
          "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
          ...(Array.isArray(securityProfile.env) ? securityProfile.env : [])
        ],
        cwd: "/app"
      },
      
      // Mount points
      mounts: [
        {
          destination: "/app",
          type: "bind",
          source: `${containerDir}/app`,
          options: ["rbind", "ro"]
        },
        {
          destination: "/tmp",
          type: "tmpfs",
          source: "tmpfs",
          options: ["noexec", "nosuid", "nodev", "mode=1777"]
        },
        {
          destination: "/deno",
          type: "bind",
          source: `${containerDir}/deno`,
          options: ["rbind", "rw"]
        }
      ]
    };
    
    // Write the configuration to file
    await globalThis.Deno.writeTextFile(
      `${containerDir}/config.json`,
      JSON.stringify(runscConfig, null, 2)
    );
    
    // Create app and deno directories
    await globalThis.Deno.mkdir(`${containerDir}/app`, { recursive: true });
    await globalThis.Deno.mkdir(`${containerDir}/deno`, { recursive: true });
    
    // Create a default entry point script
    const entryScript = `#!/usr/bin/env -S deno run
// Default entrypoint for InSpatial container
console.log('InSpatial server container started');
console.log('Container ID: ${containerId}');
console.log('Ready for execution');

// Keep the container running until explicitly terminated
await new Promise(() => {});
`;
    
    await globalThis.Deno.writeTextFile(`${containerDir}/app/main.ts`, entryScript);
  }
}

/**
 * Server container implementation using gVisor
 */
class ServerContainer {
  private id: string;
  private config: ContainerConfig;
  private state: ContainerState = { state: "creating" };
  private startTime: number = Date.now();
  private endTime?: number;
  private configDir: string;
  private runtimePath: string;
  private denoPath: string;
  private containerId?: string; // gVisor container ID
  private stats = {
    cpuUsage: 0,
    memoryUsage: 0,
    networkIn: 0,
    networkOut: 0
  };
  
  // Stats collection interval
  private statsInterval?: number;

  constructor(
    id: string, 
    config: ContainerConfig, 
    options: {
      configDir: string;
      runtimePath: string;
      denoPath: string;
    }
  ) {
    this.id = id;
    this.config = config;
    this.configDir = options.configDir;
    this.runtimePath = options.runtimePath;
    this.denoPath = options.denoPath;
  }

  /**
   * Starts the container
   */
  async start(): Promise<void> {
    if (this.state.state !== "creating" && this.state.state !== "suspended") {
      throw new Error(`Cannot start container in state: ${this.state.state}`);
    }
    
    try {
      // Create or resume gVisor container
      if (this.state.state === "creating") {
        // Create new gVisor container
        const command = new globalThis.Deno.Command(this.runtimePath, {
          args: [
            "run",
            "-bundle", `${this.configDir}/${this.id}`,
            "--detach",
            this.id
          ]
        });
        
        const output = await command.output();
        
        if (output.code !== 0) {
          const errorText = new TextDecoder().decode(output.stderr);
          throw new Error(`Failed to start container: ${errorText}`);
        }
        
        // Parse container ID from output
        const text = new TextDecoder().decode(output.stdout).trim();
        this.containerId = text;
      } else {
        // Resume suspended container
        await this.resumeContainer();
      }
      
      this.state = { state: "running" };
      
      // Start stats collection
      this.startStatsCollection();
    } catch (error) {
      this.state = { state: "failed" };
      throw error;
    }
  }

  /**
   * Suspends the container
   */
  async suspend(): Promise<void> {
    if (this.state.state !== "running") {
      throw new Error(`Cannot suspend container in state: ${this.state.state}`);
    }
    
    try {
      await this.pauseContainer();
      this.state = { state: "suspended" };
      
      // Stop stats collection
      this.stopStatsCollection();
    } catch (error) {
      this.state = { state: "failed" };
      throw error;
    }
  }

  /**
   * Resumes the container
   */
  async resume(): Promise<void> {
    if (this.state.state !== "suspended") {
      throw new Error(`Cannot resume container in state: ${this.state.state}`);
    }
    
    try {
      this.state = { state: "resuming" };
      await this.resumeContainer();
      this.state = { state: "running" };
      
      // Restart stats collection
      this.startStatsCollection();
    } catch (error) {
      this.state = { state: "failed" };
      throw error;
    }
  }

  /**
   * Terminates the container
   */
  async terminate(force: boolean): Promise<void> {
    if (this.state.state === "terminated" || this.state.state === "terminating") {
      return; // Already terminated or terminating
    }
    
    // Stop stats collection
    this.stopStatsCollection();
    
    this.state = { state: "terminating" };
    
    try {
      if (this.containerId) {
        const command = new globalThis.Deno.Command(this.runtimePath, {
          args: [
            "delete",
            force ? "--force" : "",
            this.id
          ].filter(Boolean)
        });
        
        const output = await command.output();
        
        if (output.code !== 0 && !force) {
          const errorText = new TextDecoder().decode(output.stderr);
          throw new Error(`Failed to terminate container: ${errorText}`);
        }
      }
      
      this.state = { state: "terminated" };
      this.endTime = Date.now();
      
      // Clean up container directory
      await this.cleanupContainerDirectory();
    } catch (error) {
      if (force) {
        // Force termination despite errors
        this.state = { state: "terminated" };
        this.endTime = Date.now();
        
        // Try to clean up container directory even if container deletion failed
        await this.cleanupContainerDirectory().catch(() => {});
      } else {
        this.state = { state: "failed" };
        throw error;
      }
    }
  }

  /**
   * Executes a command within the container
   */
  async executeCommand(
    command: string,
    args: string[] = []
  ): Promise<ContainerExecutionResult> {
    if (this.state.state !== "running") {
      throw new Error(`Cannot execute command in state: ${this.state.state}`);
    }
    
    try {
      const startTime = performance.now();
      
      // Prepare Deno command for execution inside the container
      let execCommand: string[];
      let execArgs: string[] = [];
      
      if (command === "deno") {
        // Direct Deno command
        execCommand = ["deno", ...args];
      } else if (command === "run" || command === "eval") {
        // Shorthand for Deno run or eval
        execCommand = ["deno", command, ...args];
      } else {
        // Execute as shell command
        execCommand = ["sh", "-c", `${command} ${args.join(" ")}`];
      }
      
      // Execute the command with runsc exec
      const cmd = new globalThis.Deno.Command(this.runtimePath, {
        args: [
          "exec",
          this.id,
          ...execCommand
        ]
      });
      
      const output = await cmd.output();
      const stdout = new TextDecoder().decode(output.stdout);
      const stderr = new TextDecoder().decode(output.stderr);
      
      const executionTime = performance.now() - startTime;
      
      // Fetch resource usage for this execution
      const resourceUsage = await this.getResourceUsage();
      
      return {
        success: output.code === 0,
        containerId: this.id,
        output: stdout,
        error: stderr,
        exitCode: output.code,
        stats: {
          executionTime,
          cpuTime: resourceUsage.cpuTime,
          peakMemoryUsage: resourceUsage.memoryUsage / (1024 * 1024)  // Convert to MB
        }
      };
    } catch (error) {
      return {
        success: false,
        containerId: this.id,
        error: error instanceof Error ? error.message : String(error),
        stats: {
          executionTime: 0,
          cpuTime: 0,
          peakMemoryUsage: 0
        }
      };
    }
  }

  /**
   * Get runtime information for this container
   */
  async getRuntimeInfo(): Promise<ContainerRuntimeInfo> {
    return {
      id: this.id,
      config: this.config,
      state: this.state,
      startTime: this.startTime,
      endTime: this.endTime,
      stats: {
        cpuUsage: this.stats.cpuUsage,
        memoryUsage: this.stats.memoryUsage,
        networkIn: this.stats.networkIn,
        networkOut: this.stats.networkOut
      }
    };
  }

  /**
   * Pause the container using runsc
   */
  private async pauseContainer(): Promise<void> {
    const command = new globalThis.Deno.Command(this.runtimePath, {
      args: [
        "pause",
        this.id
      ]
    });
    
    const output = await command.output();
    
    if (output.code !== 0) {
      const errorText = new TextDecoder().decode(output.stderr);
      throw new Error(`Failed to pause container: ${errorText}`);
    }
  }

  /**
   * Resume the container using runsc
   */
  private async resumeContainer(): Promise<void> {
    const command = new globalThis.Deno.Command(this.runtimePath, {
      args: [
        "resume",
        this.id
      ]
    });
    
    const output = await command.output();
    
    if (output.code !== 0) {
      const errorText = new TextDecoder().decode(output.stderr);
      throw new Error(`Failed to resume container: ${errorText}`);
    }
  }

  /**
   * Get container resource usage
   */
  private async getResourceUsage(): Promise<{
    cpuTime: number;
    memoryUsage: number;
  }> {
    try {
      const command = new globalThis.Deno.Command(this.runtimePath, {
        args: [
          "events",
          "--stats",
          this.id
        ]
      });
      
      const output = await command.output();
      
      if (output.code !== 0) {
        return {
          cpuTime: 0,
          memoryUsage: 0
        };
      }
      
      const statsText = new TextDecoder().decode(output.stdout);
      
      try {
        const stats = JSON.parse(statsText);
        
        // Extract CPU and memory usage
        const cpuTime = stats.cpu?.usage?.total || 0;  // In nanoseconds
        const memoryUsage = stats.memory?.usage?.usage || 0;  // In bytes
        
        return {
          cpuTime: cpuTime / 1_000_000,  // Convert to milliseconds
          memoryUsage
        };
      } catch (parseError) {
        return {
          cpuTime: 0,
          memoryUsage: 0
        };
      }
    } catch (error) {
      return {
        cpuTime: 0,
        memoryUsage: 0
      };
    }
  }

  /**
   * Update container statistics
   */
  private async updateStats(): Promise<void> {
    if (this.state.state !== "running") {
      return;
    }
    
    try {
      const usage = await this.getResourceUsage();
      
      // Update stats
      this.stats.cpuUsage = usage.cpuTime;
      this.stats.memoryUsage = usage.memoryUsage / (1024 * 1024);  // Convert to MB
    } catch (error) {
      // Ignore errors during stats collection
    }
  }

  /**
   * Start periodic collection of container statistics
   */
  private startStatsCollection(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
    
    // Update stats every 5 seconds
    this.statsInterval = setInterval(() => {
      this.updateStats();
    }, 5000) as unknown as number;
  }

  /**
   * Stop periodic collection of container statistics
   */
  private stopStatsCollection(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = undefined;
    }
  }

  /**
   * Clean up container directory after termination
   */
  private async cleanupContainerDirectory(): Promise<void> {
    try {
      const containerDir = `${this.configDir}/${this.id}`;
      await globalThis.Deno.remove(containerDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to clean up container directory: ${error}`);
    }
  }
} 