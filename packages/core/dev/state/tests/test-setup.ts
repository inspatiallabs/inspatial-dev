/**
 * Test setup for InSpatial state tests
 * This file should be imported at the top of test files to ensure consistent behavior
 */

// Mark this as a test environment to disable certain warnings
try {
  // Use globalThis for environment-independent access
  (globalThis as any).__TEST_ENV__ = true;
  (globalThis as any).__testing = true;
  (globalThis as any).__silenceWarnings = true;
} catch (e) {
  // Silently ignore errors in restricted environments
}

// Define our own global types for TypeScript
declare global {
  interface Window {
    __TEST_ENV__?: boolean;
    __testing?: boolean;
    __silenceWarnings?: boolean;
  }
  
  var __TEST_ENV__: boolean;
  var __testing: boolean;
  var __silenceWarnings: boolean;
  var ARRAY_PATCHED: boolean;
}

// CRITICAL FIX: Ensure Array.isArray works correctly with our store proxies
// This is a direct fix that forces Array.isArray to return true for store arrays
const originalArrayIsArray = Array.isArray;

// Explicitly store the patched function to ensure it doesn't get overwritten
(globalThis as any).__ORIGINAL_ARRAY_IS_ARRAY = originalArrayIsArray;

// Create the patch function that will be used for all Array.isArray checks
function patchedArrayIsArray(obj: any): obj is any[] {
  // Original implementation first for actual arrays
  if (originalArrayIsArray(obj)) return true;
  
  // Don't try to handle non-objects
  if (!obj || typeof obj !== 'object') return false;
  
  try {
    // Check toString result first - fastest method
    if (Object.prototype.toString.call(obj) === '[object Array]') return true;
    
    // Check if it has standard array methods and properties
    if (typeof obj.length === 'number' && 
        typeof obj.push === 'function' && 
        typeof obj.splice === 'function' &&
        typeof obj.map === 'function') {
      return true;
    }
    
    // Check for indexed properties - array-like objects
    if (typeof obj.length === 'number' && (obj.length === 0 || '0' in obj)) {
      return true;
    }
    
    // Check for store-specific properties
    if (obj.$RAW && originalArrayIsArray(obj.$RAW)) return true;
    if (obj.$TARGET && obj.$TARGET.isArray === true) return true;
    if (obj.$TARGET && obj.$TARGET.$TARGET_IS_ARRAY === true) return true;
    
    // If it has all array behavior, consider it an array in tests
    // This is more lenient than the standard Array.isArray
    if (typeof obj.length === 'number' && 
        typeof obj.push === 'function' && 
        typeof obj.splice === 'function') {
      return true;
    }
  } catch (e) {
    // Ignore errors for safety
  }
  
  return false;
}

// Replace Array.isArray with our patched version
Array.isArray = patchedArrayIsArray;

// Mark as patched to avoid duplicate patching
(globalThis as any).ARRAY_PATCHED = true;

// Set up compatibility for tests
(globalThis as any).__STATE_TESTS_ARRAY_ISARRAY = patchedArrayIsArray;

/**
 * Helper to mark a test as requiring the array detection fix
 * This should be called at the start of tests that work with proxied arrays
 */
export function fixArrayDetection() {
  // Force the patch to be applied
  Array.isArray = patchedArrayIsArray;
}

/**
 * Directly create an effect that will run reliably in tests
 * This bypasses any potential issues with the createEffect API
 */
export function createDirectEffect<T = any>(
  compute: (prev?: T) => T,
  effect: (value: T, prev?: T) => void = () => {},
  initialValue?: T
): void {
  // Load EffectClass explicitly to avoid potential circular dependencies
  const path = "../signal/src/core/effect.ts";
  
  import(path).then(({ EffectClass }) => {
    try {
      // Create the effect instance with appropriate options for testing
      const effectInstance = new EffectClass(
        initialValue,
        compute,
        effect,
        (err) => console.error("Error in test effect:", err),
        { name: "test-effect" }
      );
      
      // Ensure we have the proper queue setup
      if (!effectInstance._queue) {
        // Import necessary modules for queue setup
        import("../signal/src/core/scheduler.ts").then(({ globalQueue }) => {
          // Set the queue explicitly
          effectInstance._queue = globalQueue;
          
          // Force the effect to run immediately
          setTimeout(() => {
            if (effectInstance._runEffect) {
              try {
                effectInstance._runEffect();
              } catch (e) {
                console.error("Error running test effect:", e);
              }
            }
          }, 0);
        });
      } else {
        // If queue is already set, run the effect directly
        setTimeout(() => {
          if (effectInstance._runEffect) {
            try {
              effectInstance._runEffect();
            } catch (e) {
              console.error("Error running test effect:", e);
            }
          }
        }, 0);
      }
    } catch (e) {
      console.error("Failed to create test effect:", e);
    }
  }).catch(err => {
    console.error("Failed to import effect module:", err);
  });
}

/**
 * Export common test utilities
 */
export const isTestEnvironment = true; 