import { isSignal } from "../signal.ts";
import { nop } from "../utils.ts";

interface DebugInfo {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

interface JSXRenderer {
  c: (tag: any, props: any, ...children: any[]) => any;
  f: any;
  isNode: (node: any) => boolean;
}

let jsxDEV: (tag: any, props: any, key?: any, ...args: any[]) => any = nop;
let Fragment: any = "<>";

function wrap(R: JSXRenderer) {
  jsxDEV = function (tag: any, props: any, key?: any, ...args: any[]): any {
    try {
      if (key !== undefined && key !== null) {
        props.key = key;
      }
      if (props && "children" in props) {
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
      let tagName: string = "unknown";
      if (typeof tag === "function") {
        tagName = tag.name || "AnonymousComponent";
      } else if (isSignal(tag)) {
        tagName =
          (tag as any).name || (tag as any).peek()?.name || "SignalComponent";
      } else if (typeof tag === "string") {
        tagName = tag;
      }

      const [, dbgInfo] = args;
      if (dbgInfo && typeof dbgInfo === "object") {
        const { fileName, lineNumber, columnNumber } = dbgInfo as DebugInfo;
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

interface JSXDevRuntime {
  wrap: typeof wrap;
  default: JSXDevRuntime;
  jsxDEV: typeof jsxDEV;
  Fragment: any;
}

const _default: JSXDevRuntime = {
  wrap,
  get default() {
    return _default;
  },
  get jsxDEV() {
    return jsxDEV;
  },
  get Fragment() {
    return Fragment;
  },
};

export default _default;
export { wrap, jsxDEV, Fragment };
