/**
 * InSpatial Container System - Differential State Synchronization
 *
 * This file implements the differential state synchronization system
 * that enables efficient state updates between client and server.
 */

import { InStateSynchronizer } from "../shared/interfaces.ts"
import type { StateSyncConfig } from "../shared/types.ts"

/**
 * State change record structure
 */
interface StateChange {
  stateId: string
  timestamp: number
  version: number
  patch: Record<string, unknown>
  source: "client" | "server"
}

/**
 * State metadata
 */
interface StateMetadata {
  stateId: string
  version: number
  lastSyncedVersion: number
  lastModified: number
  syncConfig: StateSyncConfig
}

/**
 * Simple implementation of JsonPatch operations
 */
class JsonPatchUtil {
  /**
   * Applies a JSON patch to an object
   */
  static applyPatch<T extends Record<string, unknown>>(
    target: T,
    patch: Record<string, unknown>,
  ): T {
    // Make a copy of the target to avoid direct mutation
    const result = { ...target } as Record<string, unknown>

    // Apply each change in the patch
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null) {
        // Null values are used to indicate deletion
        delete result[key]
      } else {
        // For nested objects, recursively apply the patch
        if (
          typeof value === "object" && !Array.isArray(value) &&
          typeof result[key] === "object" && !Array.isArray(result[key])
        ) {
          result[key] = JsonPatchUtil.applyPatch(
            result[key] as Record<string, unknown>,
            value as Record<string, unknown>,
          )
        } else {
          // For primitive values or arrays, simply replace
          result[key] = value
        }
      }
    })

    return result as T
  }

  /**
   * Creates a patch representing the difference between two objects
   */
  static createPatch<T extends Record<string, unknown>>(
    oldObj: T,
    newObj: T,
  ): Record<string, unknown> {
    const patch: Record<string, unknown> = {}

    // Find keys that exist in the new object but not in the old (additions)
    // or that have different values (modifications)
    Object.keys(newObj).forEach((key) => {
      const oldValue = oldObj[key]
      const newValue = newObj[key]

      // If the key doesn't exist in the old object or values are different
      if (!(key in oldObj) || !JsonPatchUtil.areEqual(oldValue, newValue)) {
        // For nested objects, create a nested patch
        if (
          typeof newValue === "object" && !Array.isArray(newValue) &&
          typeof oldValue === "object" && !Array.isArray(oldValue)
        ) {
          patch[key] = JsonPatchUtil.createPatch(
            oldValue as Record<string, unknown>,
            newValue as Record<string, unknown>,
          )
        } else {
          // For primitive values or arrays, store the new value
          patch[key] = newValue
        }
      }
    })

    // Find keys that exist in the old object but not in the new (deletions)
    Object.keys(oldObj).forEach((key) => {
      if (!(key in newObj)) {
        patch[key] = null // Mark for deletion
      }
    })

    return patch
  }

  /**
   * Checks if two values are equal
   */
  static areEqual(a: unknown, b: unknown): boolean {
    // Handle primitive types
    if (a === b) return true

    // Handle null/undefined
    if (a == null || b == null) return false

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((val, index) => JsonPatchUtil.areEqual(val, b[index]))
    }

    // Handle objects
    if (typeof a === "object" && typeof b === "object") {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)

      if (keysA.length !== keysB.length) return false

      return keysA.every((key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        JsonPatchUtil.areEqual((a as any)[key], (b as any)[key])
      )
    }

    return false
  }
}

/**
 * Differential state synchronization implementation
 */
export class DifferentialStateSynchronizer implements InStateSynchronizer {
  // Container state storage
  private containerStates: Map<string, Map<string, Record<string, unknown>>> =
    new Map()

  // State metadata storage
  private stateMetadata: Map<string, Map<string, StateMetadata>> = new Map()

  // Change history for conflict resolution
  private changeHistory: Map<string, Map<string, StateChange[]>> = new Map()

  // Pending changes to be synchronized
  private pendingChanges: Map<string, Map<string, StateChange>> = new Map()

  // Map to track timers for proper cleanup
  private timers: Map<string, Map<string, unknown>> = new Map()

  // Connection manager for client-server communication
  private connectionManager: any // Replace with actual connection manager

  /**
   * Creates a new differential state synchronizer
   */
  constructor(connectionManager: any) {
    this.connectionManager = connectionManager

    // Set up event handlers for connection status changes
    this.setupConnectionHandlers()
  }

  /**
   * Initializes state synchronization for a container
   */
  async initializeSync(containerId: string): Promise<void> {
    // Initialize container state storage
    this.containerStates.set(containerId, new Map())
    this.stateMetadata.set(containerId, new Map())
    this.changeHistory.set(containerId, new Map())
    this.pendingChanges.set(containerId, new Map())

    // Send initialization message to server
    console.log(`Initializing state sync for container ${containerId}`)
  }

  /**
   * Updates local state and synchronizes with remote
   */
  async updateState(
    containerId: string,
    stateId: string,
    statePatch: Record<string, unknown>,
  ): Promise<boolean> {
    // Get container state maps
    const containerStates = this.getContainerStates(containerId)
    const metadata = this.getStateMetadata(containerId)

    // Get or initialize state
    let currentState = containerStates.get(stateId) || {}
    let stateMetadata = metadata.get(stateId)

    if (!stateMetadata) {
      // If this is a new state, create metadata
      stateMetadata = {
        stateId,
        version: 0,
        lastSyncedVersion: 0,
        lastModified: Date.now(),
        syncConfig: {
          stateId,
          priority: { priority: "normal" },
          direction: { direction: "bidirectional" },
        },
      }
      metadata.set(stateId, stateMetadata)
    }

    // Apply the patch to the current state
    const newState = JsonPatchUtil.applyPatch(currentState, statePatch)

    // Update version and timestamp
    stateMetadata.version++
    stateMetadata.lastModified = Date.now()

    // Store the updated state
    containerStates.set(stateId, newState)

    // Record the change
    this.recordChange(
      containerId,
      stateId,
      statePatch,
      stateMetadata.version,
      "client",
    )

    // Synchronize with server based on sync direction
    if (stateMetadata.syncConfig.direction.direction !== "serverToClient") {
      await this.syncStateWithServer(
        containerId,
        stateId,
        stateMetadata.version,
      )
    }

    return true
  }

  /**
   * Gets current state value
   */
  async getState<T>(containerId: string, stateId: string): Promise<T> {
    const containerStates = this.getContainerStates(containerId)
    const state = containerStates.get(stateId)

    if (!state) {
      throw new Error(`State ${stateId} not found for container ${containerId}`)
    }

    return state as unknown as T
  }

  /**
   * Resolves a conflict between client and server states
   */
  async resolveConflict(
    containerId: string,
    stateId: string,
    resolution: "clientWins" | "serverWins" | Record<string, unknown>,
  ): Promise<void> {
    const containerStates = this.getContainerStates(containerId)
    const metadata = this.getStateMetadata(containerId)
    const stateMetadata = metadata.get(stateId)

    if (!stateMetadata) {
      throw new Error(`State ${stateId} not found for container ${containerId}`)
    }

    if (resolution === "clientWins") {
      // Client state wins - just update the server with our version
      await this.syncStateWithServer(
        containerId,
        stateId,
        stateMetadata.version,
      )
    } else if (resolution === "serverWins") {
      // Server state wins - fetch the latest from server
      await this.fetchStateFromServer(containerId, stateId)
    } else {
      // Explicit state provided - replace local state
      containerStates.set(stateId, resolution)

      // Update version and timestamp
      stateMetadata.version++
      stateMetadata.lastModified = Date.now()

      // Sync with server
      await this.syncStateWithServer(
        containerId,
        stateId,
        stateMetadata.version,
      )
    }
  }

  /**
   * Closes synchronization channel and cleans up resources
   */
  async terminateSync(containerId: string): Promise<void> {
    // Clear all timers for this container
    const containerTimers = this.timers.get(containerId);
    if (containerTimers) {
      // Clear each timer
      for (const timerId of Array.from(containerTimers.values())) {
        clearTimeout(timerId as number);
      }
      this.timers.delete(containerId);
    }

    // Clean up state storage
    this.containerStates.delete(containerId)
    this.stateMetadata.delete(containerId)
    this.changeHistory.delete(containerId)
    this.pendingChanges.delete(containerId)

    console.log(`Terminating state sync for container ${containerId}`)
  }

  /**
   * Records a state change for history and pending sync
   */
  private recordChange(
    containerId: string,
    stateId: string,
    patch: Record<string, unknown>,
    version: number,
    source: "client" | "server",
  ): void {
    // Get change history for this state
    const containerHistory = this.getChangeHistory(containerId)
    let stateHistory = containerHistory.get(stateId)

    if (!stateHistory) {
      stateHistory = []
      containerHistory.set(stateId, stateHistory)
    }

    // Create change record
    const change: StateChange = {
      stateId,
      timestamp: Date.now(),
      version,
      patch,
      source,
    }

    // Add to history
    stateHistory.push(change)

    // Limit history size
    if (stateHistory.length > 50) {
      stateHistory.shift()
    }

    // If change is from client, add to pending changes
    if (source === "client") {
      const pendingContainer = this.getPendingChanges(containerId)
      pendingContainer.set(stateId, change)
    }
  }

  /**
   * Synchronizes a state with the server
   */
  private async syncStateWithServer(
    containerId: string,
    stateId: string,
    version: number,
  ): Promise<void> {
    console.log(
      `Syncing state ${stateId} version ${version} for container ${containerId}`,
    )

    // Get or create timer map for this container
    let containerTimers = this.timers.get(containerId);
    if (!containerTimers) {
      containerTimers = new Map();
      this.timers.set(containerId, containerTimers);
    }

    // Clear any existing timer for this state
    const existingTimer = containerTimers.get(stateId);
    if (existingTimer) {
      clearTimeout(existingTimer as number);
    }

    // Simulate server acknowledgement
    const timerId = setTimeout(() => {
      const metadata = this.getStateMetadata(containerId)
      const stateMetadata = metadata.get(stateId)

      if (stateMetadata && stateMetadata.version === version) {
        stateMetadata.lastSyncedVersion = version

        // Remove from pending changes if version matches
        const pendingContainer = this.getPendingChanges(containerId)
        const pendingChange = pendingContainer.get(stateId)

        if (pendingChange && pendingChange.version === version) {
          pendingContainer.delete(stateId)
        }
      }

      // Clean up the timer reference
      const timerMap = this.timers.get(containerId);
      if (timerMap) {
        timerMap.delete(stateId);
      }
    }, 100);

    // Store the timer ID
    containerTimers.set(stateId, timerId);
  }

  /**
   * Fetches the latest state from the server
   */
  private async fetchStateFromServer(
    containerId: string,
    stateId: string,
  ): Promise<void> {
    console.log(
      `Fetching state ${stateId} from server for container ${containerId}`,
    )
  }

  /**
   * Sets up handlers for connection status changes
   */
  private setupConnectionHandlers(): void {
    // In a real implementation, this would register for connection events
    this.connectionManager.addEventListener("disconnected", () => {
      console.log("Connection lost, queueing changes for later sync");
    });
    
    this.connectionManager.addEventListener("connected", this.handleReconnection);
  }

  /**
   * Handles reconnection by synchronizing pending changes
   */
  private handleReconnection = async (): Promise<void> => {
    console.log("Connection restored, synchronizing pending changes");
    
    // Synchronize all pending changes
    for (const [containerId, pendingContainer] of Array.from(this.pendingChanges.entries())) {
      for (const [stateId, change] of Array.from(pendingContainer.entries())) {
        // Ensure we're sending a message to sync
        this.connectionManager.sendMessage({
          type: "sync_state",
          containerId,
          stateId,
          version: change.version,
          patch: change.patch
        });
        
        // Also call the normal sync method
        await this.syncStateWithServer(containerId, stateId, change.version);
      }
    }
  }

  /**
   * Gets container states, initializing if needed
   */
  private getContainerStates(
    containerId: string,
  ): Map<string, Record<string, unknown>> {
    let containerStates = this.containerStates.get(containerId)

    if (!containerStates) {
      containerStates = new Map()
      this.containerStates.set(containerId, containerStates)
    }

    return containerStates
  }

  /**
   * Gets state metadata, initializing if needed
   */
  private getStateMetadata(containerId: string): Map<string, StateMetadata> {
    let metadata = this.stateMetadata.get(containerId)

    if (!metadata) {
      metadata = new Map()
      this.stateMetadata.set(containerId, metadata)
    }

    return metadata
  }

  /**
   * Gets change history, initializing if needed
   */
  private getChangeHistory(containerId: string): Map<string, StateChange[]> {
    let history = this.changeHistory.get(containerId)

    if (!history) {
      history = new Map()
      this.changeHistory.set(containerId, history)
    }

    return history
  }

  /**
   * Gets pending changes, initializing if needed
   */
  private getPendingChanges(containerId: string): Map<string, StateChange> {
    let pending = this.pendingChanges.get(containerId)

    if (!pending) {
      pending = new Map()
      this.pendingChanges.set(containerId, pending)
    }

    return pending
  }
}
