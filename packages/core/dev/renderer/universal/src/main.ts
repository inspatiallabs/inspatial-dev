import { currentTarget } from "./directive.ts";
import { DOMRenderer } from "./dom.ts";
import { GPURenderer } from "./gpu.ts";
import { NativeRenderer } from "./native.ts";
import {
  DirectiveRenderTargetProp,
  DOMNode,
  GPUNode,
  NativeNode,
  RenderNode,
} from "./types.ts";

// Type guards
export function isDOMNode(node: RenderNode): node is DOMNode {
  return node.target === "dom";
}

export function isGPUNode(node: RenderNode): node is GPUNode {
  return node.target === "gpu";
}

export function isNativeNode(node: RenderNode): node is NativeNode {
  return node.target === "native";
}

// Event Delegation System with type safety
type DelegatedEventHandler = {
  handler: EventListener;
  element: HTMLElement;
};

const _delegatedEvents = new Map<string, Set<DelegatedEventHandler>>();

export function setDirectiveRenderTargetProp(
  target: DirectiveRenderTargetProp
): void {
  currentTarget = target;
}

// Main JSX factory function
export function render(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): RenderNode {
  switch (currentTarget) {
    case "dom":
      return DOMRenderer.getInstance().createElement(type, props, ...children);
    case "gpu":
      return GPURenderer.getInstance().createElement(type, props);
    case "native":
      return NativeRenderer.getInstance().createElement(type, props);
    default:
      throw new Error(`Unknown render target: ${currentTarget}`);
  }
}

// Fragment implementation
export function Fragment({ children }: { children: any[] }): RenderNode {
  const fragment = document.createDocumentFragment();
  children.flat().forEach((child) => {
    if (child != null) {
      fragment.appendChild(DOMRenderer.getInstance().parseChild(child));
    }
  });

  return {
    type: "fragment",
    props: {},
    target: "dom",
    element: fragment,
  };
}

// Export for JSX
export { render as jsx, render as jsxDEV, render as jsxs };

// Declare global JSX namespace
declare global {
  namespace JSX {
    interface Element extends RenderNode {}
    interface IntrinsicElements {
      [elemName: string]: Record<string, any>;
    }
  }
}
