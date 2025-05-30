import { EagerComputationClass } from "./effect.ts";
import { NotReadyErrorClass } from "./error.ts";
import { createRoot } from "./create-root.ts";

/**
 * Returns a promise of the resolved value of a reactive expression
 * @param fn a reactive expression to resolve
 */
export function resolve<T>(fn: () => T): Promise<T> {
  return new Promise((res, rej) => {
    createRoot((dispose) => {
      new EagerComputationClass(undefined, () => {
        try {
          res(fn());
        } catch (err) {
          if (err instanceof NotReadyErrorClass) throw err;
          rej(err);
        }
        dispose();
      });
    });
  });
}
