import { onDispose, createSignal } from "@in/teract/signal-lite";
import { removeFromArr } from "../../../constant/index.ts";
import {
  dispose,
  getCurrentSelf,
  type ComponentInstance,
} from "../../component/index.ts";
import { Fn } from "../../control-flow/fn/index.ts";
import { For } from "../../control-flow/for/index.ts";
import type { AnyFunction, Renderer } from "../../type.ts";

/*#################################(Types)#################################*/

/** Props interface for component functions */
interface ComponentProps {
  /** The renderer context */
  c: (component: any, props?: any, ...children: any[]) => any;
}

/** Props interface for Inlet component function */
interface InletProps {
  /** Function to normalize children arrays */
  normalizeChildren: (children: any[]) => any[];
}

/** Component function type that takes renderer context */
type ComponentFunction = (context: ComponentProps) => any;

/** Inlet component type that takes props and children */
type InletComponent = (
  props: any,
  ...children: any[]
) => (context: InletProps) => void;

/** Outlet component type that takes props and fallback */
type OutletComponent = (props: any, fallback?: any) => ComponentFunction;

/** Return type of createPortal function */
type PortalTuple = [InletComponent, OutletComponent];

/** Generic identity function */
function dumbFn<T>(value: T): T {
  return value;
}

/*#################################(Portal)#################################*/
export function createPortal(): PortalTuple {
  let currentOutlet: ComponentInstance | null = null;
  const nodes = createSignal<any[]>([]);

  /***************************(Outlet View)***************************/
  function outletView(R: Renderer): any {
    return R.c(For, { entries: nodes }, dumbFn);
  }

  /***************************(Inlet)***************************/
  function Inlet(_: any, ...children: any[]): (context: InletProps) => void {
    return function ({ normalizeChildren }: InletProps): void {
      const normalizedChildren = normalizeChildren(children);
      nodes.peek().push(...normalizedChildren);
      nodes.trigger();
      onDispose(function (): void {
        const arr = nodes.peek();
        for (let i of normalizedChildren) {
          removeFromArr(arr, i);
        }
        nodes.value = [...nodes.peek()];
      });
    };
  }

  /***************************(Outlet)***************************/
  function Outlet(_: any, fallback?: any): ComponentFunction {
    if (currentOutlet) dispose(currentOutlet);
    currentOutlet = getCurrentSelf();
    return function ({ c }: ComponentProps): any {
      return c(Fn, null, function (): AnyFunction | undefined {
        if (nodes.value.length) return outletView;
        return fallback;
      });
    };
  }

  return [Inlet, Outlet];
}
