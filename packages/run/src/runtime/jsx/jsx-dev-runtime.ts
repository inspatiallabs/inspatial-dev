import { isSignal, type Signal } from "@in/teract/signal-lite";
import type {
  JSXProps,
  DebugInfo,
  JSXRenderer,
  JSXDEVFunction,
  JSXDevRuntime,
  JSXDevRuntimeDefault,
} from "./types.ts";

/*#################################(JSX DEV Runtime)#################################*/

/** No-operation function */
function nop(): void {}

let jsxDEV: JSXDEVFunction = nop as any;
let Fragment: string = "<>";

function wrap(R: JSXRenderer): JSXDevRuntime {
  jsxDEV = function (
    tag: any,
    props: JSXProps,
    key?: string | number | null,
    ...args: any[]
  ): any {
    try {
      if (key !== undefined && key !== null) {
        props.key = key;
      }
      if (Object.hasOwn(props, "children")) {
        const { children } = props;
        if (Array.isArray(children) && !R.isNode(children)) {
          return R.c(tag, props, ...children);
        } else {
          return R.c(tag, props, children);
        }
      } else {
        return R.c(tag, props);
      }
    } catch (e) {
      let tagName: string = "Unknown";

      if (typeof tag === "function") {
        tagName = tag.name || "Anonymous";
      } else if (isSignal(tag)) {
        const signalTag = tag as Signal<any>;
        tagName = (signalTag as any).name || signalTag.peek()?.name || "Signal";
      } else if (typeof tag === "string") {
        tagName = tag;
      }

      const [, dbgInfo] = args as [any, DebugInfo?];
      if (dbgInfo) {
        const { fileName, lineNumber, columnNumber } = dbgInfo;
        console.error(
          `Error happened while rendering <${tagName}> in (${fileName}:${lineNumber}:${columnNumber}):\n`,
          e
        );
      } else {
        console.error(`Error happened while rendering <${tagName}>:\n`, e);
      }
      throw e;
    }
  };

  Fragment = R.f;

  return {
    jsxDEV,
    Fragment,
  };
}

const _default: JSXDevRuntimeDefault = {
  wrap,
  get default(): JSXDevRuntimeDefault {
    return _default;
  },
  get jsxDEV(): JSXDEVFunction {
    return jsxDEV;
  },
  get Fragment(): string {
    return Fragment;
  },
};

export default _default;
export { wrap, jsxDEV, Fragment };
