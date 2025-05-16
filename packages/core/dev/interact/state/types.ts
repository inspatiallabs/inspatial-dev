/**
 * # Types for InSpatial State
 * 
 * Core type definitions for the universal state management system.
 */

import type { RegisteredTriggerType } from "../trigger/src/types";

/**
 * Configuration options for persistence
 */
export interface PersistOptionsType {
  /** Storage mechanism to use (default: "localStorage") */
  storage: string;
  
  /** Key to use for storage */
  key: string;
  
  /** Custom storage adapter (when not using a named adapter) */
  adapter?: StorageAdapterType;
  
  /** Fields to include in persistence (if not specified, all fields are included) */
  include?: string[];
  
  /** Fields to exclude from persistence */
  exclude?: string[];
  
  /** Whether to automatically save on state changes */
  autoSave?: boolean;
  
  /** Interval for auto-saving (in milliseconds) */
  saveInterval?: number;
  
  /** Server configuration for remote persistence */
  server?: Record<string, any>;
  
  /**
   * InCloud-specific [InSpatial Cloud] options (placeholder for future implementation)
   * Future properties may include:
   * - replication: { enabled: boolean, syncInterval: number }
   * - conflictResolution: 'clientWins' | 'serverWins' | 'lastWriteWins'
   * - encryption: { enabled: boolean, level: 'standard' | 'high' }
   * - collections: string[] - specific collections to sync with
   */
  inCloud?: Record<string, any>;
}

/**
 * Configuration for state instance
 */
export interface StateConfigType<T extends object = {}> {
  /** Unique identifier for the state (auto-generated if not provided) */
  id?: string;
  
  /** Type schema for validation (optional) */
  type?: any;
  
  /** Initial state values */
  initialState: T;
  
  /** Trigger definitions or names to connect */
  triggers?: string[] | Record<string, any>;
  
  /** Persistence configuration */
  persist?: PersistOptionsType;
}

/**
 * Additional options for state creation
 */
export interface StateOptionsType {
  /** Whether this state should be global (default: false for _prefixed, true otherwise) */
  global?: boolean;
  
  /** Custom equality function for state updates */
  equals?: (a: any, b: any) => boolean;
  
  /** Debug name for the state */
  name?: string;
  
  /** Whether to track state history (for debugging/time-travel) */
  trackHistory?: boolean;
  
  /** Whether to enable dev tools integration */
  devTools?: boolean;
  
  /** Whether to enable type validation for this state */
  validateType?: boolean;
}

/**
 * State instance returned by createState
 */
export interface StateInstanceType<T extends object = {}> {
  /** Get the current state value */
  getState: () => T;
  
  /** Shorter alias for getState */
  get: () => T;
  
  /** Update the state partially or with a function */
  setState: (newState: Partial<T> | ((prevState: T) => Partial<T>)) => void;
  
  /** Shorter alias for setState with more intuitive name */
  update: (newState: Partial<T> | ((prevState: T) => Partial<T>)) => void;
  
  /** Reset state to initial values */
  reset: () => void;
  
  /** Subscribe to state changes */
  subscribe: (listener: (state: T) => void) => () => void;
  
  /** Generated actions from connected triggers */
  action: Record<string, (...args: any[]) => void>;
  
  /** Connect a trigger to this state */
  connectTrigger: <P extends any[]>(
    trigger: RegisteredTriggerType<T, P>,
    options?: {
      transform?: (payload: P) => P;
      condition?: (state: T, ...payload: P) => boolean;
    }
  ) => () => void;
  
  /** Perform multiple updates in a batch */
  batch: (updates: Array<(state: T) => Partial<T>>) => void;
  
  /** Destroy the state and clean up resources */
  destroy: () => void;
  
  /** Get state metadata */
  meta: {
    id: string;
    isGlobal: boolean;
    name?: string;
    createdAt: number;
  };
}

/**
 * Enhanced state instance with StateQL template literal support
 */
export interface StateQLInstanceType<T extends object = {}> extends StateInstanceType<T> {
  /** Update state using template literals */
  update: ((newState: Partial<T> | ((prevState: T) => Partial<T>)) => void) & 
           ((strings: TemplateStringsArray, ...values: any[]) => void);
}

/**
 * Storage adapter interface for persistence
 */
export interface StorageAdapterType {
  /** Store a value with the given key */
  setItem(key: string, value: string): Promise<void> | void;
  
  /** Retrieve a value by key */
  getItem(key: string): Promise<string | null> | string | null;
  
  /** Remove a value by key */
  removeItem(key: string): Promise<void> | void;
  
  /** Clear all stored values */
  clear?(): Promise<void> | void;
}

/**
 * Options for creating a computed property
 */
export interface ComputedOptionsType<T> {
  /** Debug name for the computed value */
  name?: string;
  
  /** Custom equality function */
  equals?: (prev: T, next: T) => boolean;
  
  /** Whether to defer computation until first access */
  defer?: boolean;
}

/**
 * Options for creating a derived state
 */
export interface DerivedStateOptionsType<T extends object> extends StateOptionsType {
  /** Whether to update the derived state automatically on source changes */
  autoUpdate?: boolean;
  
  /** Custom ID for the derived state */
  id?: string;
  
  /** Whether to persist the derived state */
  persist?: boolean;
  
  /** Frequency to update the derived state (in milliseconds) */
  updateInterval?: number;
  
  /** Additional base configuration for derived state */
  config?: Partial<StateConfigType<T>>;
}

// Shorter aliases for better DX
export type StateConfig<T extends object = {}> = StateConfigType<T>;
export type StateInstance<T extends object = {}> = StateInstanceType<T>;
export type StateQLInstance<T extends object = {}> = StateQLInstanceType<T>;
export type PersistOptions = PersistOptionsType;
export type StateOptions = StateOptionsType; 