// /**
//  * @file types.ts
//  * @description Core types for the coordinated renderer system
//  */

// // deno-lint-ignore-file no-explicit-any

// /**
//  * Rendering targets supported by the system
//  */
// export type DirectiveRenderTargetProp = "dom" | "gpu" | "native";

// /**
//  * GPU renderer types supported by the system
//  */
// export type GPURendererType = "inreal" | "three" | "babylon";

// /**
//  * Native renderer types supported by the system
//  */
// export type NativeRendererType = "nativescript" | "lynx";

// /**
//  * Configuration for the universal renderer
//  */
// export interface RendererConfig {
//   /**
//    * Type of GPU renderer to use (defaults to "inreal")
//    */
//   gpuRendererType?: GPURendererType;

//   /**
//    * Type of Native renderer to use (defaults to "nativescript")
//    */
//   nativeRendererType?: NativeRendererType;

//   /** Options to pass to the GPU renderer */
//   gpuOptions?: Record<string, any>;

//   /** Options to pass to the Native renderer */
//   nativeOptions?: Record<string, any>;
// }

// /**
//  * Base node interface for all render nodes
//  */
// export interface RenderNode {
//   /**
//    * The rendering target for this node
//    */
//   target: DirectiveRenderTargetProp;

//   /**
//    * The renderer-specific node representation
//    */
//   node: any;

//   /**
//    * Node children
//    */
//   children?: RenderNode[];

//   /**
//    * Node properties
//    */
//   props?: any;

//   /**
//    * The type of element
//    */
//   type?: string;
// }

// /**
//  * Event handler interface
//  */
// export interface EventHandler {
//   (event: any): void;
// }

// /**
//  * Event registry for mapping event handlers
//  */
// export interface EventRegistry {
//   [key: string]: {
//     [eventName: string]: EventHandler;
//   };
// }

// /**
//  * Directive interface for controlling rendering behavior
//  */
// export interface Directive {
//   target: DirectiveRenderTargetProp;
//   [key: string]: any;
// }

// /**
//  * Render target options
//  */
// export type DirectiveProp = Record<string, any>;
// export type Child = any | string | number | boolean | null | undefined;
// export type Children = Child[];

// /**
//  * DOM-specific node interface
//  */
// export interface DOMNode extends RenderNode {
//   target: Extract<DirectiveRenderTargetProp, "dom">;
//   element: any; // DOM node
// }

// /**
//  * GPU-specific node interface
//  */
// export interface GPUNode extends RenderNode {
//   target: Extract<DirectiveRenderTargetProp, "gpu">;
//   geometry?: GPUBuffer;
//   material?: GPUShaderModule;
//   texture?: GPUTexture;
// }

// /**
//  * Native-specific node interface
//  */
// export interface NativeNode extends RenderNode {
//   target: Extract<DirectiveRenderTargetProp, "native">;
//   view: any; // Native View type
// }

// // WebGPU types for type safety
// type GPUBuffer = any;
// type GPUShaderModule = any;
// type GPUTexture = any;
// type GPURenderPipeline = any;
// type GPUBindGroup = any;
