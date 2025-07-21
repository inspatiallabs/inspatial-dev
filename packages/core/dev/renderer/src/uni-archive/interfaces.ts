// /**
//  * @file interfaces.ts
//  * @description Core interfaces for the coordinated renderer system
//  */

// // deno-lint-ignore-file no-explicit-any
// import { DirectiveRenderTargetProp, RenderNode } from "./types.ts";

// /**
//  * Common interface that all renderers must implement
//  */
// export interface RendererInterface {
//   /**
//    * The rendering target this renderer implements
//    */
//   readonly target: DirectiveRenderTargetProp;

//   /**
//    * Creates an element node for the given type and properties
//    */
//   createElement(
//     type: string | Function,
//     props: any,
//     ...children: any[]
//   ): Promise<RenderNode>;

//   /**
//    * Renders a node to the specified container
//    */
//   render(node: RenderNode, container: any): Promise<void>;

//   /**
//    * Updates an existing node
//    */
//   updateNode(node: RenderNode, newProps: any): Promise<void>;

//   /**
//    * Removes a node from its container
//    */
//   removeNode(node: RenderNode): Promise<void>;

//   /**
//    * Adds an event listener to a node
//    */
//   addEventListener(
//     node: RenderNode,
//     eventName: string,
//     handler: (event: any) => void
//   ): Promise<void>;

//   /**
//    * Removes an event listener from a node
//    */
//   removeEventListener(
//     node: RenderNode,
//     eventName: string,
//     handler: (event: any) => void
//   ): Promise<void>;
// }

// /**
//  * DOM-specific renderer interface
//  */
// export interface DOMRendererInterface extends RendererInterface {
//   readonly target: Extract<DirectiveRenderTargetProp, "dom">;

//   /**
//    * Sets the document context for the renderer
//    */
//   setDocumentContext(document: any): void;

//   /**
//    * Gets the document context for the renderer
//    */
//   getDocumentContext(): any;
// }

// /**
//  * GPU-specific renderer interface
//  */
// export interface GPURendererInterface extends RendererInterface {
//   readonly target: Extract<DirectiveRenderTargetProp, "gpu">;

//   /**
//    * Initializes the GPU context
//    */
//   initContext(canvas: any, options?: any): Promise<void>;

//   /**
//    * Resizes the rendering context
//    */
//   resize(width: number, height: number): void;

//   /**
//    * Starts the rendering loop
//    */
//   startRenderLoop(): void;

//   /**
//    * Stops the rendering loop
//    */
//   stopRenderLoop(): void;
// }

// /**
//  * Native-specific renderer interface
//  */
// export interface NativeRendererInterface extends RendererInterface {
//   readonly target: Extract<DirectiveRenderTargetProp, "native">;

//   /**
//    * Initializes the native context
//    */
//   initContext(rootView: any, options?: any): Promise<void>;

//   /**
//    * Gets the native context
//    */
//   getNativeContext(): any;
// }
