import env from "../../../env/get.ts";
import {
  type SignalValueType,
  isSignal,
  type Signal,
  read,
  createSignal,
} from "../../../signal.ts";
import {
  type ComponentProps,
  type ComponentFunction,
  type ComponentContext,
  KEY_CTX,
  exposeComponent,
  getCurrentSelf,
} from "../../component/index.ts";
import { Fn } from "../fn/index.ts";
import type { RenderFunction } from "../render/index.ts";

export interface DynamicProps extends ComponentProps {
  is: SignalValueType<ComponentFunction>;
  ctx?: any;
}

export function _dynContainer(
  this: SignalValueType<ComponentFunction>,
  name: string,
  catchErr: any,
  ctx: any,
  props: ComponentProps,
  ...children: any[]
): RenderFunction {
  const self = getCurrentSelf();

  let syncRef: ((node: any) => void) | null = null;

  if (props.$ref) {
    if (isSignal(props.$ref)) {
      syncRef = function (node: any) {
        (props.$ref as Signal).value = node;
      };
    } else if (typeof props.$ref === "function") {
      syncRef = props.$ref;
    } else if (!env.isProduction()) {
      throw new Error(`Invalid $ref type: ${typeof props.$ref}`);
    }
  }

  let oldCtx: ComponentContext | null = null;
  props.$ref = (newInstance: any) => {
    if (oldCtx) {
      oldCtx.wrapper = null;
      oldCtx = null;
    }

    const newCtx = newInstance?.[KEY_CTX] as ComponentContext | undefined;
    if (newCtx) {
      if (newCtx.hasExpose) {
        const extraKeys = Object.getOwnPropertyDescriptors(newInstance);
        delete (extraKeys as any)[KEY_CTX];
        Object.defineProperties(self, extraKeys);
      }

      newCtx.wrapper = self;
      oldCtx = newCtx;
    }

    syncRef?.(newInstance);
  };

  let current: any = null;
  let renderFn: RenderFunction | null = null;

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
      renderFn = function (R: any) {
        return R.c(component, props, ...children);
      };

      return renderFn;
    },
    catchErr
  );
}

export function Dynamic(
  props: DynamicProps,
  ...children: any[]
): RenderFunction {
  const { is, ctx, ...restProps } = props;
  const newProps = { ...restProps, $ref: createSignal(undefined) };
  exposeComponent({
    current: newProps.$ref,
  });
  return _dynContainer.call(is, "Dynamic", null, ctx, newProps, ...children);
}
