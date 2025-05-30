import { flushSync } from "./core/scheduler.ts";

let batchDepth = 0;

/**
 * Simple helper used by some higher-level utilities to know if they are
 * executing inside a batch scope.
 */
export function isBatching(): boolean {
  return batchDepth > 0;
}

// -------------------- Batch Utility --------------------
/**
 * `batch` allows changes made inside `fn` to be queued and flushed once, rather than
 * triggering intermediate reactive updates.  It simply increments an internal
 * depth counter; when depth returns to 0 we flush the global queue synchronously.
 * This mirrors SolidJS semantics sufficiently for our core tests.
 *
 * NOTE:  All internals already enqueue into `globalQueue`, so batching only needs
 * to defer the final `flush` until the outer‐most batch completes.
 */
export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      // ensure pending work is processed synchronously
      flushSync();
    }
  }
}
