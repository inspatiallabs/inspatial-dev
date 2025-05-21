/**
 * Animation Test Helper
 * 
 * Provides utilities to make animations predictable and synchronous in test environments.
 */

// Add _frameCallbacks property to globalThis for TypeScript
declare global {
  interface Window {
    _frameCallbacks?: Map<number, FrameRequestCallback>;
  }
  var _frameCallbacks: Map<number, FrameRequestCallback> | undefined;
}

let isTestEnvironment = true;

/**
 * Makes all animations complete immediately for testing purposes
 */
export function setupTestAnimations() {
  // Force all animations to complete immediately
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const frameCallbacks = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  
  // Make the callbacks map accessible globally for flushAnimationFrames
  globalThis._frameCallbacks = frameCallbacks;
  
  // Replace requestAnimationFrame with an immediate execution version for tests
  globalThis.requestAnimationFrame = function(callback: FrameRequestCallback): number {
    const id = ++frameId;
    
    // Store the callback
    frameCallbacks.set(id, callback);
    
    // Execute immediately for tests
    if (isTestEnvironment) {
      setTimeout(() => {
        const cb = frameCallbacks.get(id);
        if (cb) {
          frameCallbacks.delete(id);
          cb(performance.now());
        }
      }, 0);
    }
    
    return id;
  };
  
  // Update cancelAnimationFrame to work with our implementation
  globalThis.cancelAnimationFrame = function(id: number): void {
    frameCallbacks.delete(id);
  };
  
  // Helper to make promises complete faster in tests
  const originalThen = Promise.prototype.then;
  Promise.prototype.then = function<T, TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    // Call the original then method
    const result = originalThen.call(this, onfulfilled, onrejected) as Promise<TResult1 | TResult2>;
    
    // Force microtasks to run immediately in test environment
    if (isTestEnvironment && typeof queueMicrotask === 'function') {
      queueMicrotask(() => {
        // This forces the promise chain to settle faster
      });
    }
    
    return result;
  };
  
  return function cleanup() {
    // Restore original functions if needed
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    Promise.prototype.then = originalThen;
    frameCallbacks.clear();
  };
}

/**
 * Helper to process all pending animation frames now
 */
export function flushAnimationFrames() {
  // Keep processing until there are no more callbacks
  // This handles cases where callbacks schedule more callbacks
  const frameCallbacks = globalThis._frameCallbacks || new Map();
  let iterations = 0;
  const maxIterations = 100; // Safety to prevent infinite loops
  
  while (frameCallbacks.size > 0 && iterations < maxIterations) {
    iterations++;
    const allCallbacks = [...frameCallbacks.entries()];
    frameCallbacks.clear();
    
    // Process all current callbacks with a timestamp
    const now = performance.now();
    for (const [id, callback] of allCallbacks) {
      try {
        callback(now);
      } catch (e) {
        console.error("Error in animation frame callback:", e);
      }
    }
  }
  
  if (iterations >= maxIterations) {
    console.warn("flushAnimationFrames reached maximum iterations, possible infinite loop");
  }
}

/**
 * Forces all currently pending animations to complete immediately
 */
export function flushAnimations() {
  return new Promise<void>(resolve => {
    // Execute any pending animation frames
    requestAnimationFrame(() => {
      // And then one more time to be sure
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * Waits for all animations and promises to settle
 * This is useful in tests to make sure animations have completed
 * @param timeout Maximum time to wait in milliseconds
 */
export async function waitForAnimations(timeout = 100): Promise<void> {
  // First, flush any pending animation frames
  await flushAnimations();
  
  // Wait a small amount of time to allow any animations to progress
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // Flush animation frames again to ensure all animations have completed
  await flushAnimations();
  
  // Wait for microtasks to complete
  await Promise.resolve();
  
  // Flush a few more times to ensure everything is complete
  for (let i = 0; i < 5; i++) {
    await flushAnimations();
    await new Promise(resolve => setTimeout(resolve, 0));
    await Promise.resolve();
  }
}

/**
 * Creates a test-friendly version of the animation frame loop
 * that executes immediately rather than waiting for actual frame timing
 */
export function createSyncAnimationRunner() {
  return {
    /**
     * Runs a single animation frame immediately
     */
    tick: () => {
      return new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve());
      });
    },
    
    /**
     * Runs multiple animation frames immediately
     */
    tickMultiple: (count: number) => {
      return new Promise<void>(async resolve => {
        for (let i = 0; i < count; i++) {
          await new Promise<void>(r => requestAnimationFrame(() => r()));
        }
        resolve();
      });
    }
  };
}
