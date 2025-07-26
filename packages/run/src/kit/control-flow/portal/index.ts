import { createSignal, onDispose } from "../../../signal.ts";
import { removeFromArr } from "../../../utils.ts";
import { disposeComponent, getCurrentSelf } from "../../component/index.ts";
import { Fn } from "../fn/index.ts";
import { List } from "../list/index.ts";

function dumbFn(_: any): any {
  return _;
}

type ComponentFunction = (props?: any, ...children: any[]) => any;
type InletFunction = (
  props: any,
  ...children: any[]
) => ({
  normalizeChildren,
}: {
  normalizeChildren: (children: any[]) => any[];
}) => void;
type OutletFunction = (
  props: any,
  fallback?: ComponentFunction
) => ({ c }: { c: any }) => any;

function createPortal(): [InletFunction, OutletFunction] {
  let currentOutlet: any = null;
  const nodes = createSignal<any[]>([]);

  function outletView(R: any): any {
    return R.c(List, { each: nodes }, dumbFn);
  }

  function Inlet(
    _: any,
    ...children: any[]
  ): ({
    normalizeChildren,
  }: {
    normalizeChildren: (children: any[]) => any[];
  }) => void {
    return function ({
      normalizeChildren,
    }: {
      normalizeChildren: (children: any[]) => any[];
    }) {
      const normalizedChildren = normalizeChildren(children);
      nodes.peek().push(...normalizedChildren);
      nodes.trigger();
      onDispose(function () {
        const arr = nodes.peek();
        for (const i of normalizedChildren) {
          removeFromArr(arr, i);
        }
        nodes.value = [...nodes.peek()];
      });
    };
  }

  function Outlet(
    _: any,
    fallback?: ComponentFunction
  ): ({ c }: { c: any }) => any {
    if (currentOutlet) disposeComponent(currentOutlet);
    currentOutlet = getCurrentSelf();
    return function ({ c }: { c: any }) {
      return c(Fn, null, function () {
        if (nodes.value.length) return outletView;
        return fallback;
      });
    };
  }

  return [Inlet, Outlet];
}

export { createPortal };
