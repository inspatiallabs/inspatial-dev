import {
  createSignal,
  isSignal,
  read,
  type Signal,
} from "@in/teract/signal-lite";
import {
  type ComponentInstance,
  type Context,
  currentCtx,
  expose,
  KEY_CTX,
} from "../../component/index.ts";
import { isProduction } from "../../../constant/index.ts";
import type { Renderer } from "../../type.ts";
import { Fn } from "../fn/index.ts";

/*#################################(Types)#################################*/
export interface DynamicProps {
  is: any;
  ctx?: any;
  $ref?: Signal<any> | ((node: any) => void);
  [key: string]: any;
}

/*#################################(Dynamic Container)#################################*/

export function _dynContainer(
  this: any,
  name: string,
  catchErr: any,
  ctx: any,
  { $ref, ...props }: DynamicProps,
  ...children: any[]
): any {
  const self = currentCtx!.self;

  let syncRef: ((node: any) => void) | null = null;

  if ($ref) {
    if (isSignal($ref)) {
      syncRef = function (node: any) {
        $ref.value = node;
      };
    } else if (typeof $ref === "function") {
      syncRef = $ref;
    } else if (!isProduction) {
      throw new Error(`Invalid $ref type: ${typeof $ref}`);
    }
  }

  let oldCtx: Context | null = null;
  props.$ref = (newInstance: ComponentInstance) => {
    if (oldCtx) {
      oldCtx.wrapper = null;
      oldCtx = null;
    }

    const newCtx = newInstance?.[KEY_CTX];
    if (newCtx) {
      if (newCtx.hasExpose) {
        const extraKeys = Object.getOwnPropertyDescriptors(newInstance);
        delete extraKeys[KEY_CTX];
        Object.defineProperties(self, extraKeys);
      }

      newCtx.wrapper = self;
      oldCtx = newCtx;
    }

    syncRef?.(newInstance);
  };

  let current: any = null;
  let renderFn: any = null;

  return Fn(
    { name, ctx },
    () => {
      const component = read(this);
      if (current === component) {
        return renderFn;
      }

      if (component === undefined || component === null) {
        return (current = renderFn = null);
      }

      current = component;
      renderFn = function (R: Renderer) {
        return R.c(component, props, ...children);
      };

      return renderFn;
    },
    catchErr
  );
}

/*#################################(Dynamic)#################################*/
export function Dynamic(
  { is, ctx, ...props }: DynamicProps,
  ...children: any[]
): any {
  props.$ref = createSignal(null);
  expose({
    current: () => props.$ref,
  });
  return _dynContainer.call(
    is,
    "Dynamic",
    null,
    ctx,
    { ...props, is },
    ...children
  );
}
