/**
 * # StateManager
 * @summary #### Singleton manager for tracking all state instances
 *
 * The `StateManager` provides a central registry for all state instances in the application.
 * It tracks both global and local states, manages state dependencies, and handles batched updates.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial State x Trigger)
 * @module @in/teract
 * @kind class
 * @access public
 */

import type { StateInstanceType } from "./types.ts";

/**
 * StateManager singleton for tracking and controlling state instances
 */
export class StateManagerClass {
  private static instance: StateManagerClass;

  /** Map of all global states by ID */
  private globalStates = new Map<string, StateInstanceType<any>>();

  /** Pending updates for batch processing */
  private pendingUpdates = new Map<
    string,
    Array<(state: any) => Partial<any>>
  >();

  /** Whether we're currently in a batch update cycle */
  private isBatching = false;

  /** Whether the manager is paused (e.g., for time-travel debugging) */
  private isPaused = false;

  /** Transaction ID for the current batch */
  private currentTransactionId: string | null = null;

  private constructor() {
    // Initialize with default settings
  }

  /**
   * Get the singleton instance of StateManager
   */
  public static getInstance(): StateManagerClass {
    if (!StateManagerClass.instance) {
      StateManagerClass.instance = new StateManagerClass();
    }
    return StateManagerClass.instance;
  }

  /**
   * Register a state instance with the manager
   *
   * @param id Unique identifier for the state
   * @param state The state instance to register
   * @param isGlobal Whether this is a global state
   */
  public registerState<T extends object>(
    id: string,
    state: StateInstanceType<T>,
    isGlobal: boolean
  ): void {
    if (isGlobal) {
      if (this.globalStates.has(id)) {
        console.warn(
          `Global state with ID '${id}' already exists. Overwriting.`
        );
      }
      this.globalStates.set(id, state);
    }

    // Log registration in development mode
    if (__DEV__) {
      console.debug(
        `[StateManager] Registered ${
          isGlobal ? "global" : "local"
        } state: ${id}`
      );
    }
  }

  /**
   * Get a global state instance by ID
   *
   * @param id The ID of the global state to retrieve
   */
  public getGlobalState<T extends object = any>(
    id: string
  ): StateInstanceType<T> | undefined {
    return this.globalStates.get(id) as StateInstanceType<T> | undefined;
  }

  /**
   * Check if a global state with the given ID exists
   *
   * @param id The ID to check
   */
  public hasGlobalState(id: string): boolean {
    return this.globalStates.has(id);
  }

  /**
   * Unregister a state instance
   *
   * @param id The state ID to unregister
   * @param isGlobal Whether this is a global state
   */
  public unregisterState(id: string, isGlobal: boolean): void {
    if (isGlobal) {
      this.globalStates.delete(id);
    }

    // Log unregistration in development mode
    if (__DEV__) {
      console.debug(
        `[StateManager] Unregistered ${
          isGlobal ? "global" : "local"
        } state: ${id}`
      );
    }
  }

  /**
   * Begin a batch update transaction
   */
  public beginBatch(): string {
    if (this.isBatching) {
      // If already batching, just return the current transaction ID
      return this.currentTransactionId!;
    }

    this.isBatching = true;
    this.currentTransactionId = `batch-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return this.currentTransactionId;
  }

  /**
   * Add an update to the current batch
   *
   * @param stateId The ID of the state to update
   * @param update The update function to apply
   */
  public addToBatch<T extends object>(
    stateId: string,
    update: (state: T) => Partial<T>
  ): void {
    if (!this.isBatching) {
      throw new Error("Cannot add to batch: No active batch transaction");
    }

    if (!this.pendingUpdates.has(stateId)) {
      this.pendingUpdates.set(stateId, []);
    }

    this.pendingUpdates.get(stateId)!.push(update as any);
  }

  /**
   * Commit all pending batch updates
   */
  public commitBatch(): void {
    if (!this.isBatching) {
      console.warn("No active batch to commit");
      return;
    }

    // Apply all pending updates
    for (const [stateId, updates] of this.pendingUpdates.entries()) {
      const state = this.globalStates.get(stateId);
      if (state) {
        state.batch(updates);
      } else {
        console.warn(
          `Cannot apply batch updates: State '${stateId}' not found`
        );
      }
    }

    // Reset batch state
    this.pendingUpdates.clear();
    this.isBatching = false;
    this.currentTransactionId = null;
  }

  /**
   * Discard the current batch without applying updates
   */
  public cancelBatch(): void {
    this.pendingUpdates.clear();
    this.isBatching = false;
    this.currentTransactionId = null;
  }

  /**
   * Pause all state updates (for debugging)
   */
  public pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume state updates
   */
  public resume(): void {
    this.isPaused = false;
  }

  /**
   * Check if state updates are paused
   */
  public isPauseActive(): boolean {
    return this.isPaused;
  }

  /**
   * Get all registered global states
   */
  public getAllGlobalStates(): Map<string, StateInstanceType<any>> {
    return new Map(this.globalStates);
  }
}

// Export singleton instance
export const StateManager = StateManagerClass.getInstance();
