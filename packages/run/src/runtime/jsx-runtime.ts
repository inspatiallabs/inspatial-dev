import { wrap as wrapDev } from "./jsx-dev-runtime.ts";
import { nop } from "../utils.ts";
import { env } from "../env/index.ts";

interface JSXRenderer {
  c: (tag: any, props: any, ...children: any[]) => any;
  f: any;
  isNode: (node: any) => boolean;
}

interface JSXProps {
  children?: any;
  key?: any;
  [key: string]: any;
}

type JSXFunction = (tag: any, props: JSXProps, key?: any) => any;

let jsx: JSXFunction = nop;
let jsxs: JSXFunction = nop;
let Fragment: any = "<>";
let currentRenderer: JSXRenderer | null = null;

// Global renderer context for direct JSX usage
function setGlobalRenderer(renderer: JSXRenderer): JSXRenderer {
  currentRenderer = renderer;

  // Make renderer available globally as R for JSX compilation
  const globalObj =
    typeof globalThis !== "undefined"
      ? globalThis
      : ((typeof window !== "undefined" ? window : {}) as any);

  globalObj.R = renderer;

  return renderer;
}

function getGlobalRenderer(): JSXRenderer | null {
  return currentRenderer;
}

function wrap(R: JSXRenderer) {
  // Set the global renderer so JSX can work without explicit renderer passing
  setGlobalRenderer(R);

  jsx = function (tag: any, props: JSXProps, key?: any): any {
    const renderer = currentRenderer || R;
    if (key !== undefined && key !== null) {
      props.key = key;
    }
    if (props && "children" in props) {
      const children = props.children;
      if (Array.isArray(children) && !renderer.isNode(children)) {
        return renderer.c(tag, props, ...props.children);
      } else {
        return renderer.c(tag, props, props.children);
      }
    } else {
      return renderer.c(tag, props);
    }
  };

  jsxs = function (tag: any, props: JSXProps, key?: any): any {
    const renderer = currentRenderer || R;
    if (key !== undefined && key !== null) {
      props.key = key;
    }
    return renderer.c(tag, props, ...props.children);
  };

  Fragment = R.f;

  if (!env.isProduction()) {
    wrapDev(R);
  }

  return {
    jsx,
    jsxs,
    Fragment,
  };
}

// Export functions that work with global renderer context
function createElementWithGlobalRenderer(
  tag: any,
  props: JSXProps,
  ...children: any[]
): any {
  if (!currentRenderer) {
    throw new Error(
      "No global renderer set. Make sure to call setGlobalRenderer() or wrap() first."
    );
  }
  return currentRenderer.c(tag, props, ...children);
}

interface JSXRuntime {
  wrap: typeof wrap;
  setGlobalRenderer: typeof setGlobalRenderer;
  getGlobalRenderer: typeof getGlobalRenderer;
  default: JSXRuntime;
  jsx: JSXFunction;
  jsxs: JSXFunction;
  Fragment: any;
  c: typeof createElementWithGlobalRenderer;
}

const _default: JSXRuntime = {
  wrap,
  setGlobalRenderer,
  getGlobalRenderer,
  get default() {
    return _default;
  },
  get jsx() {
    return jsx;
  },
  get jsxs() {
    return jsxs;
  },
  get Fragment() {
    return Fragment;
  },
  get c() {
    return createElementWithGlobalRenderer;
  },
};

export default _default;
export {
  wrap,
  setGlobalRenderer,
  getGlobalRenderer,
  createElementWithGlobalRenderer as c,
  jsx,
  jsxs,
  Fragment,
};
