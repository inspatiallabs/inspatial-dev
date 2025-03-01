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
  target: Extract<DirectiveRenderTargetProp, "dom">;
  element: Node;
}

export interface GPUNode extends BaseNode {
  target: Extract<DirectiveRenderTargetProp, "gpu">;
  geometry?: GPUBuffer;
  material?: GPUShaderModule;
  pipeline?: GPURenderPipeline;
  bindGroup?: GPUBindGroup;
  vertices?: Float32Array;
  indices?: Uint16Array;
  uniforms?: GPUBuffer;
  children?: GPUNode[];
}

export interface NativeNode extends BaseNode {
  target: Extract<DirectiveRenderTargetProp, "native">;
  view: any; // NativeScript View type
  children?: NativeNode[];
}

export type RenderNode = DOMNode | GPUNode | NativeNode;
