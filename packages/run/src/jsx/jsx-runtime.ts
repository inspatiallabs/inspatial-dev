// deno-lint-ignore-file no-explicit-any
import { RenderNode } from "../../../renderer/src/types.ts";
import { documentContext } from "../../../renderer/src/dom/document-context.ts";
import { universalRenderer } from "../../../renderer/src/render.ts";

// Fragment implementation
export function Fragment(props: any) {
  return props.children;
}

// createElement implementation
export function createElement(type: any, props: any, ...children: any[]) {
  return {
    type,
    props: { ...props, children: children.length === 1 ? children[0] : children }
  };
}

// Type guards for RenderNode types
function isRenderNode(node: any): node is RenderNode {
  return node && typeof node === "object" && "target" in node;
}

/**
 * JSX factory function for jsx-runtime
 */
export function jsx(type: any, props: any) {
  if (isRenderNode(type)) {
    throw new Error("RenderNode cannot be used as a JSX element type");
  }

  // Handle children separately
  const { children, ...rest } = props || {};
  
  // Process JSX
  return createElement(type, rest, children);
}

export const jsxs = jsx;
export const jsxDEV = jsx;

// Setup document context if we're in a browser environment
// deno-lint-ignore no-explicit-any
if (typeof (globalThis as any).document !== "undefined") {
  // deno-lint-ignore no-explicit-any
  documentContext.setDocument((globalThis as any).document);
}

// Export universalRenderer for convenience
export { universalRenderer };
