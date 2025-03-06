// deno-lint-ignore-file no-explicit-any
// @ts-ignore - Ignoring TS extension import error
import { InSpatialDOM } from "./dom/src/dom.ts";
export type DirectiveRenderTargetProp = "dom" | "gpu" | "native";
export type DirectiveProp = Record<string, any>;
export type Child = Node | string | number | boolean | null | undefined;
export type Children = Child[];

// WebGPU type definitions
// These are placeholders until proper WebGPU types are available
type GPUBuffer = any;
type GPUShaderModule = any;
type GPURenderPipeline = any;
type GPUBindGroup = any;

// const { parseHTML } = InSpatialDOM;
// const { document, Node, Element, DocumentFragment } = parseHTML("");

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
