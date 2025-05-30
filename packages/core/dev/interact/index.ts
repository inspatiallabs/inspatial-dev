/**
 * Interact - (InSpatial State x Trigger)
 * 
 * A universal state management system for cross-platform applications
 */

// Set development mode
if (typeof globalThis.__DEV__ === 'undefined') {
  globalThis.__DEV__ = true;
}

// Export core state management
export * from './state/index.ts';

// Export signal management
export * from './signal-core/index.ts';

// Export trigger system
export * from './trigger/src/index.ts'; 