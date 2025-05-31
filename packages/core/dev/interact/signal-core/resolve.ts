import { NotReadyErrorClass } from "./error.ts";
import { createRoot } from "./create-root.ts";
import { createEffect } from "./create-effect.ts";

/**
 * Returns a promise of the resolved value of a reactive expression.
 * The promise resolves with the first value successfully computed by fn
 * (i.e., without throwing NotReadyErrorClass).
 * @param fn a reactive expression to resolve
 */
export function resolve<T>(fn: () => T): Promise<T> {
  return new Promise((res, rej) => {
    createRoot((dispose) => {
      createEffect(() => {
        try {
          const result = fn();
          // If fn() doesn't throw (especially NotReadyErrorClass), resolve and cleanup.
          res(result);
          dispose();
        } catch (err) {
          if (err instanceof NotReadyErrorClass) {
            // It's not ready yet, so we don't resolve or reject.
            // The effect will re-run when the underlying async op completes.
            return;
          }
          // For any other error, reject the promise and cleanup.
          rej(err);
          dispose();
        }
      });
    });
  });
}
