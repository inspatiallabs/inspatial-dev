import { hotReloadEnabler } from "../../../hmr/index.ts";
import { type ComponentFunction, snapshotComponent } from "../../component/index.ts";

export async function _lazyLoad<T>(
  this: { cache: ComponentFunction | null },
  loader: () => Promise<T>,
  symbol?: keyof T | "default",
  ...args: any[]
): Promise<any> {
  const run = snapshotComponent();
  if (!this.cache) {
    const result = await loader();
    if (
      (symbol === undefined || symbol === null) &&
      typeof result === "function"
    ) {
      this.cache = result as any;
    } else {
      this.cache = (result as any)[symbol ?? "default"] as any;
    }

    if (hotReloadEnabler) {
      const component = this.cache;
      this.cache = function (...componentArgs: any[]) {
        return function (R: any) {
          return R.c(component, ...componentArgs);
        };
      };
    }
  }

  return run.apply(null, [this.cache, ...args] as any);
}

export function lazy<T>(
  loader: () => Promise<T>,
  symbol?: keyof T | "default"
): ComponentFunction {
  return _lazyLoad.bind({ cache: null }, loader, symbol as any);
}
