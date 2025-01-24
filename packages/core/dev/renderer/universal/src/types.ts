// deno-lint-ignore-file no-explicit-any

export type DirectiveRenderTargetProp = "dom" | "gpu" | "native";
export type DirectiveProp = Record<string, any>;
export type Child = Node | string | number | boolean | null | undefined;
export type Children = Child[];

export interface BaseNode {
  type: string;
  props: Record<string, any>;
  target: DirectiveRenderTargetProp;
}

export interface DOMNode extends BaseNode {
  target: "dom";
  element: Node;
}

export interface GPUNode extends BaseNode {
  target: "gpu";
  geometry?: any;
  material?: any;
  children?: GPUNode[];
}

export interface NativeNode extends BaseNode {
  target: "native";
  view: any;
}

export type RenderNode = DOMNode | GPUNode | NativeNode;
