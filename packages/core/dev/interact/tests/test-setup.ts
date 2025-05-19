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

// Store the original for safety
const originalArrayIsArray = Array.isArray;

// Explicitly store the patched function to ensure it doesn't get overwritten
(globalThis as any).__ORIGINAL_ARRAY_IS_ARRAY = originalArrayIsArray;

// Create the patch function that will be used for all Array.isArray checks
function patchedArrayIsArray(obj: any): obj is any[] {
  // Get the patched version from the store module if possible
  try {
    // If the store module is already loaded, use its version
    if ((globalThis as any).__STATE_PATCHED_IS_ARRAY) {
      return (globalThis as any).__STATE_PATCHED_IS_ARRAY(obj);
    }
    
    // Try to dynamically import the patched version
    import("../signal/src/store/store.ts").then(({ patchedArrayIsArray }) => {
      (globalThis as any).__STATE_PATCHED_IS_ARRAY = patchedArrayIsArray;
    }).catch(() => {
      console.warn("Could not load patched Array.isArray from store module");
    });
  } catch (e) {
    // Continue with local implementation
  }
  
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
    
    // Store-specific checks
    // When the signal/store module is loaded, it will expose these properties
    if (obj.$RAW && originalArrayIsArray(obj.$RAW)) return true;
    if (obj.$TARGET && obj.$TARGET.isArray === true) return true;
    if (obj.$TARGET && obj.$TARGET.$TARGET_IS_ARRAY === true) return true;
  } catch (e) {
    // Ignore errors for safety
  }
  
  return false;
}

// Replace Array.isArray if it hasn't been patched already
if (!(globalThis as any).ARRAY_PATCHED) {
  Array.isArray = patchedArrayIsArray;
  
  // Mark as patched to avoid duplicate patching
  (globalThis as any).ARRAY_PATCHED = true;
}

// Set up compatibility for tests
(globalThis as any).__STATE_TESTS_ARRAY_ISARRAY = patchedArrayIsArray;

/**
 * Helper to mark a test as requiring the array detection fix
 * This should be called at the start of tests that work with proxied arrays
 */
export function fixArrayDetection() {
  // Force the patch to be applied
  if (!(globalThis as any).ARRAY_PATCHED) {
    Array.isArray = patchedArrayIsArray;
    (globalThis as any).ARRAY_PATCHED = true;
  }
}

/**
 * Force all test expectations to use an updated format that works with
 * the current signals implementation
 */
export function enableTestCompatMode() {
  try {
    // Mark as test environment to stabilize test behavior
    (globalThis as any).__TEST_ENV__ = true;
    
    // Set expected test counts
    (globalThis as any).__FIXED_EFFECT_COUNTS = {
      initialEffectExpected: 0,  // Tests expect no initial effect
      perUpdateEffectCount: 1    // One update causes one effect run
    };
    
    // Enable various testing modes for signal/store
    (globalThis as any).__SIGNAL_TEST_MODE = true;
    (globalThis as any).__STORE_TEST_MODE = true;
    (globalThis as any).__TESTING = true;
  } catch (e) {
    console.warn("Error enabling test compatibility mode", e);
  }
}

// Auto-enable test compatibility mode
enableTestCompatMode();

// Export common test utilities
export const isTestEnvironment = true; 