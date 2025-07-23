import { hotEnabled } from "../../../hmr/main.ts";
import { _runInSnapshot, snapshot } from "../../component/index.ts";
import type { Renderer, AnyFunction } from "../../type.ts";

/*#################################(Types)#################################*/
export interface LazyCache<T = any> {
  cache: T | null;
}

/*#################################(Lazy Load)#################################*/
export async function _lazyLoad<T = any>(
  this: LazyCache<T>,
  loader: () => Promise<any>,
  symbol: string | null | undefined,
  ...args: any[]
): Promise<any> {
  const run = snapshot(_runInSnapshot);
  if (!this.cache) {
    const result = await loader();
    if (
      (symbol === undefined || symbol === null) &&
      typeof result === "function"
    ) {
      this.cache = result as T;
    } else {
      this.cache = result[symbol ?? "default"];
    }

    if (hotEnabled) {
      const component = this.cache as any;
      this.cache = function (...args: any[]) {
        return function (R: Renderer) {
          return R.c(component, ...args);
        };
      } as T;
    }
  }

  return run(this.cache as AnyFunction, ...args);
}

/*#################################(Lazy)#################################*/
export function lazy<T = any>(
  loader: () => Promise<any>,
  symbol?: string | null
): (...args: any[]) => Promise<any> {
  return _lazyLoad.bind({ cache: null } as LazyCache<T>, loader, symbol);
}
