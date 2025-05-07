/**
 * # State Persistence
 * @summary #### Store and retrieve state with multiple storage backends
 * 
 * This module provides functionality to persist state across sessions and devices
 * using various storage backends like localStorage, sessionStorage, or custom solutions.
 * 
 * @since 1.0.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import type { StateInstanceType, StorageAdapterType, PersistOptionsType } from "./types";

// Global registry of storage adapters
const adapters: Record<string, StorageAdapterType> = {};

/**
 * Register a storage adapter for state persistence
 * 
 * @param name The name to identify this storage adapter
 * @param adapter The storage adapter implementation
 */
export function registerStorageAdapter(name: string, adapter: StorageAdapterType): void {
  adapters[name] = adapter;
}

/**
 * Local storage adapter implementation
 */
const localStorageAdapter: StorageAdapterType = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },
  
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }
};

/**
 * Session storage adapter implementation
 */
const sessionStorageAdapter: StorageAdapterType = {
  async getItem(key: string): Promise<string | null> {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from sessionStorage:`, error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error writing to sessionStorage:`, error);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage:`, error);
    }
  },
  
  async clear(): Promise<void> {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error(`Error clearing sessionStorage:`, error);
    }
  }
};

/**
 * In-memory storage adapter implementation
 */
const memoryAdapter = (): StorageAdapterType => {
  const storage = new Map<string, string>();
  
  return {
    async getItem(key: string): Promise<string | null> {
      return storage.has(key) ? storage.get(key) as string : null;
    },
    
    async setItem(key: string, value: string): Promise<void> {
      storage.set(key, value);
    },
    
    async removeItem(key: string): Promise<void> {
      storage.delete(key);
    },
    
    async clear(): Promise<void> {
      storage.clear();
    }
  };
};

/**
 * IndexedDB storage adapter implementation
 */
const indexedDBAdapter = (dbName: string = 'InStateStore'): StorageAdapterType => {
  // Helper to open the database
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(dbName, 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('state')) {
            db.createObjectStore('state');
          }
        };
        
        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
        
        request.onerror = (event) => {
          reject(`Error opening IndexedDB: ${(event.target as IDBOpenDBRequest).error}`);
        };
      } catch (error) {
        reject(`Error setting up IndexedDB: ${error}`);
      }
    });
  };
  
  return {
    async getItem(key: string): Promise<string | null> {
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readonly');
          const store = transaction.objectStore('state');
          const request = store.get(key);
          
          request.onsuccess = () => {
            db.close();
            resolve(request.result || null);
          };
          
          request.onerror = () => {
            db.close();
            reject(`Error reading from IndexedDB: ${request.error}`);
          };
        });
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    
    async setItem(key: string, value: string): Promise<void> {
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readwrite');
          const store = transaction.objectStore('state');
          const request = store.put(value, key);
          
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          
          transaction.onerror = () => {
            db.close();
            reject(`Error writing to IndexedDB: ${transaction.error}`);
          };
        });
      } catch (error) {
        console.error(error);
      }
    },
    
    async removeItem(key: string): Promise<void> {
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readwrite');
          const store = transaction.objectStore('state');
          const request = store.delete(key);
          
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          
          transaction.onerror = () => {
            db.close();
            reject(`Error removing from IndexedDB: ${transaction.error}`);
          };
        });
      } catch (error) {
        console.error(error);
      }
    },
    
    async clear(): Promise<void> {
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('state', 'readwrite');
          const store = transaction.objectStore('state');
          const request = store.clear();
          
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          
          transaction.onerror = () => {
            db.close();
            reject(`Error clearing IndexedDB: ${transaction.error}`);
          };
        });
      } catch (error) {
        console.error(error);
      }
    }
  };
};

/**
 * InSpatialDB storage adapter implementation (placeholder for future integration)
 * 
 * This is a placeholder for the upcoming InSpatialDB integration.
 * The actual implementation will be added in a future release.
 */
const inspatialDBAdapter = (config: any = {}): StorageAdapterType => {
  // Create a fallback memory adapter for now
  const fallbackAdapter = memoryAdapter();
  
  // Return a wrapper that logs usage and delegates to memory adapter
  return {
    async getItem(key: string): Promise<string | null> {
      console.log(`[InSpatialDB Placeholder] getItem called for key: ${key}`);
      console.log('InSpatialDB integration coming soon - using memory storage for now');
      return fallbackAdapter.getItem(key);
    },
    
    async setItem(key: string, value: string): Promise<void> {
      console.log(`[InSpatialDB Placeholder] setItem called for key: ${key}`);
      console.log('InSpatialDB integration coming soon - using memory storage for now');
      return fallbackAdapter.setItem(key, value);
    },
    
    async removeItem(key: string): Promise<void> {
      console.log(`[InSpatialDB Placeholder] removeItem called for key: ${key}`);
      console.log('InSpatialDB integration coming soon - using memory storage for now');
      return fallbackAdapter.removeItem(key);
    },
    
    async clear(): Promise<void> {
      console.log(`[InSpatialDB Placeholder] clear called`);
      console.log('InSpatialDB integration coming soon - using memory storage for now');
      return fallbackAdapter.clear();
    }
  };
};

/**
 * Collection of built-in storage adapters
 */
export const StorageAdapters = {
  localStorage: localStorageAdapter,
  sessionStorage: sessionStorageAdapter,
  memory: memoryAdapter,
  indexedDB: indexedDBAdapter,
  inspatialDB: inspatialDBAdapter
};

// Register built-in adapters
registerStorageAdapter('localStorage', localStorageAdapter);
registerStorageAdapter('sessionStorage', sessionStorageAdapter);
registerStorageAdapter('memory', memoryAdapter());
registerStorageAdapter('indexedDB', indexedDBAdapter());
registerStorageAdapter('inspatialDB', inspatialDBAdapter());

/**
 * Setup persistence for a state instance
 * 
 * @param state The state instance to persist
 * @param options Persistence configuration options
 * @returns Cleanup function to disable persistence
 */
export function setupPersistence<T extends object>(
  state: StateInstanceType<T>,
  options: PersistOptionsType | boolean
): () => void {
  // Early return if persistence is explicitly disabled
  if (options === false) {
    return () => {};
  }
  
  // If options is true, use default options
  const config: PersistOptionsType = options === true ? {
    storage: 'localStorage',
    key: `inspatial_state_${state.meta.id}`,
    autoSave: true
  } : options;
  
  // Determine storage key
  const storageKey = config.key || `inspatial_state_${state.meta.id}`;
  
  // Get the storage adapter
  let adapter: StorageAdapterType;
  
  if (typeof config.storage === 'string') {
    // Use a named adapter
    adapter = adapters[config.storage];
    if (!adapter) {
      console.error(`Storage adapter "${config.storage}" not found. Using memory adapter.`);
      adapter = adapters['memory'];
    }
  } else if (config.adapter) {
    // Use a custom adapter
    adapter = config.adapter;
  } else {
    // Default to localStorage
    adapter = adapters['localStorage'];
  }
  
  // Load initial state
  const loadState = async () => {
    try {
      const stored = await adapter.getItem(storageKey);
      if (stored) {
        const parsedState = JSON.parse(stored);
        
        // Filter state based on include/exclude options
        let filteredState: Partial<T> = { ...parsedState };
        
        if (config.include && config.include.length > 0) {
          // Only include specified fields
          filteredState = {} as Partial<T>;
          
          config.include.forEach(key => {
            if (key in parsedState) {
              (filteredState as any)[key] = parsedState[key];
            }
          });
        } else if (config.exclude && config.exclude.length > 0) {
          // Exclude specified fields
          config.exclude.forEach(key => {
            if (key in filteredState) {
              delete (filteredState as any)[key];
            }
          });
        }
        
        // Update state with loaded values
        state.update(filteredState);
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  };
  
  // Automatically load state if not disabled
  if (config.autoSave !== false) {
    loadState();
  }
  
  // Function to save state
  const saveState = async () => {
    try {
      let stateToSave = state.get();
      
      // Filter state based on include/exclude options
      if (config.include && config.include.length > 0) {
        // Only include specified fields
        const partialState: Partial<T> = {};
        
        config.include.forEach(key => {
          if (key in stateToSave) {
            (partialState as any)[key] = stateToSave[key as keyof T];
          }
        });
        
        stateToSave = partialState as T;
      } else if (config.exclude && config.exclude.length > 0) {
        // Create a copy to avoid modifying the original
        stateToSave = { ...stateToSave };
        
        // Exclude specified fields
        config.exclude.forEach(key => {
          if (key in stateToSave) {
            delete (stateToSave as any)[key];
          }
        });
      }
      
      // Serialize and save
      const serialized = JSON.stringify(stateToSave);
      await adapter.setItem(storageKey, serialized);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };
  
  let saveTimeoutId: any;
  let saveInterval: any;
  
  // Function to debounce save operations
  const debouncedSave = () => {
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    
    saveTimeoutId = setTimeout(saveState, 100);
  };
  
  // Set up auto-save if enabled
  const unsubscribe = config.autoSave !== false ? 
    state.subscribe(debouncedSave) : 
    () => {};
  
  // Set up interval save if configured
  if (config.saveInterval && config.saveInterval > 0) {
    saveInterval = setInterval(saveState, config.saveInterval);
  }
  
  // Return a cleanup function
  return () => {
    unsubscribe();
    
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    
    if (saveInterval) {
      clearInterval(saveInterval);
    }
  };
}

/**
 * Clear persisted state for a specific key
 * 
 * @param key The storage key to clear
 * @param storageType The type of storage (defaults to localStorage)
 */
export async function clearPersistedState(
  key: string, 
  storageType: string = 'localStorage'
): Promise<void> {
  const adapter = adapters[storageType];
  if (!adapter) {
    console.error(`Storage adapter "${storageType}" not found.`);
    return;
  }
  
  await adapter.removeItem(key);
}

/**
 * Clear all persisted state for a specific storage type
 * 
 * @param storageType The type of storage to clear (defaults to localStorage)
 */
export async function clearAllPersistedState(storageType: string = 'localStorage'): Promise<void> {
  const adapter = adapters[storageType];
  if (!adapter) {
    console.error(`Storage adapter "${storageType}" not found.`);
    return;
  }
  
  if (adapter.clear) {
    await adapter.clear();
  } else {
    console.error(`Storage adapter "${storageType}" does not support clearing all state.`);
  }
}

/**
 * Setup InSpatialDB persistence for a state instance
 * 
 * This is a convenience function that configures persistence using the InSpatialDB adapter.
 * Currently uses a placeholder implementation that will be replaced in a future version.
 * 
 * @param state The state instance to persist
 * @param options InSpatialDB-specific configuration options
 * @returns Cleanup function to disable persistence
 */
export function setupInSpatialDBPersistence<T extends object>(
  state: StateInstanceType<T>,
  options: {
    key?: string;
    autoSave?: boolean;
    include?: string[];
    exclude?: string[];
    replication?: {
      enabled?: boolean;
      syncInterval?: number;
      priority?: 'low' | 'normal' | 'high';
    };
    conflictResolution?: 'clientWins' | 'serverWins' | 'lastWriteWins' | 'manual';
    encryption?: {
      enabled?: boolean;
      level?: 'standard' | 'high';
    };
    collections?: string[];
    indexes?: string[];
  }
): () => void {
  // Generate key if not provided
  const key = options.key || `inspatial:${state.meta.id}`;
  
  // Set up standard persistence with InSpatialDB adapter
  return setupPersistence(state, {
    storage: 'inspatialDB',
    key,
    autoSave: options.autoSave ?? true,
    include: options.include,
    exclude: options.exclude,
    inspatialDB: {
      replication: options.replication,
      conflictResolution: options.conflictResolution,
      encryption: options.encryption,
      collections: options.collections,
      indexes: options.indexes
    }
  });
} 