import { currentTarget } from "./directive.ts";
import { DOMRenderer } from "./dom/src/render.ts";
import { GPURendererMini } from "./gpu/gpu.web.mini.ts";
import { NativeRenderer } from "./native/nst/native.ts";
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
  if (!currentTarget) {
    throw new Error(
      "Render target not set. Use setDirectiveRenderTargetProp to set the target."
    );
  }

  if (typeof type === "function") {
    // Handle functional components
    return type({ ...props, children });
  }

  switch (currentTarget) {
    case "dom":
      return DOMRenderer.getInstance().createElement(type, props, ...children);
    case "gpu":
      return GPURendererMini.getInstance().createElement(
        type,
        props,
        ...children
      );
    case "native":
      return NativeRenderer.getInstance().createElement(
        type,
        props,
        ...children
      );
    default:
      throw new Error(`Unknown render target: ${currentTarget}`);
  }
}

// Fragment implementation
export function Fragment({ children }: { children: any[] }): RenderNode {
  return {
    type: "fragment",
    props: { children },
    target: currentTarget || "dom", // Default to "dom" if no target is set
    element: null, // This will be handled by the renderer
  };
}

// Declare global JSX namespace
declare global {
  namespace JSX {
    interface Element extends RenderNode {}
    interface IntrinsicElements {
      [elemName: string]: Record<string, any>;
    }
  }
}
