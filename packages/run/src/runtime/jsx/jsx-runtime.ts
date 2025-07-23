import { isProduction } from "../../constant/index.ts";
import { wrap as wrapDev } from "./jsx-dev-runtime.ts";
import type {
  JSXProps,
  JSXRenderer,
  JSXFunction,
  JSXSFunction,
  JSXProdRuntime,
  JSXProdRuntimeDefault,
} from "./types.ts";

/*#################################(JSX Runtime)#################################*/

/** No-operation function */
function nop(): void {}

let jsx: JSXFunction = nop as any;
let jsxs: JSXSFunction = nop as any;
let Fragment: string = "<>";

function wrap(R: JSXRenderer): JSXProdRuntime {
  jsx = function (
    tag: any,
    props: JSXProps,
    key?: string | number | null
  ): any {
    if (key !== undefined && key !== null) {
      props.key = key;
    }
    if (Object.hasOwn(props, "children")) {
      const children = props.children;
      if (Array.isArray(children) && !R.isNode(children)) {
        return R.c(tag, props, ...props.children);
      } else {
        return R.c(tag, props, props.children);
      }
    } else {
      return R.c(tag, props);
    }
  };

  jsxs = function (
    tag: any,
    props: JSXProps,
    key?: string | number | null
  ): any {
    if (key !== undefined && key !== null) {
      props.key = key;
    }
    return R.c(tag, props, ...props.children);
  };

  Fragment = R.f;

  if (!isProduction) {
    wrapDev(R);
  }

  return {
    jsx,
    jsxs,
    Fragment,
  };
}

const _default: JSXProdRuntimeDefault = {
  wrap,
  get default(): JSXProdRuntimeDefault {
    return _default;
  },
  get jsx(): JSXFunction {
    return jsx;
  },
  get jsxs(): JSXSFunction {
    return jsxs;
  },
  get Fragment(): string {
    return Fragment;
  },
};

export default _default;
export { wrap, jsx, jsxs, Fragment };
