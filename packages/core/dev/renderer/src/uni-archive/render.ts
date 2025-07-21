// /**
//  * @file universal-renderer.ts
//  * @description Main renderer class that coordinates rendering across different targets
//  */

// // deno-lint-ignore-file no-explicit-any
// import {
//   DirectiveRenderTargetProp,
//   RenderNode,
//   RendererConfig,
//   GPURendererType,
//   NativeRendererType,
// } from "./types.ts";
// import { RendererInterface } from "./interfaces.ts";
// import { RendererRegistry } from "./registry.ts";
// import { directiveHandler } from "./directive.ts";

// /**
//  * UniversalRenderer - Main renderer class that coordinates rendering across different targets
//  * Provides a unified API for all rendering operations across DOM, GPU, and Native targets
//  */
// export class UniversalRenderer {
//   private static instance: UniversalRenderer;
//   private config: RendererConfig;

//   // Cache for renderer instances
//   private rendererInstances = new Map<string, RendererInterface>();

//   /**
//    * Private constructor for singleton pattern
//    */
//   private constructor(config?: RendererConfig) {
//     this.config = {
//       gpuRendererType: "inreal",
//       nativeRendererType: "nativescript",
//       ...config,
//     };

//     // Initialize the renderers asynchronously
//     this.initializeAllRenderers();
//   }

//   /**
//    * Initialize all renderers in the background
//    */
//   private async initializeAllRenderers(): Promise<void> {
//     // Start with DOM renderer as it's most commonly used
//     this.getRenderer("dom").catch((err) =>
//       console.warn("Failed to initialize DOM renderer:", err)
//     );

//     // Initialize GPU and Native renderers in the background
//     Promise.all([
//       this.getRenderer("gpu").catch((err) =>
//         console.warn("Failed to initialize GPU renderer:", err)
//       ),
//       this.getRenderer("native").catch((err) =>
//         console.warn("Failed to initialize Native renderer:", err)
//       ),
//     ]);
//   }

//   /**
//    * Returns the singleton instance of UniversalRenderer
//    */
//   public static init(config?: RendererConfig): UniversalRenderer {
//     if (!UniversalRenderer.instance) {
//       UniversalRenderer.instance = new UniversalRenderer(config);
//     } else if (config) {
//       // Update config if provided
//       UniversalRenderer.instance.updateConfig(config);
//     }
//     return UniversalRenderer.instance;
//   }

//   /**
//    * Updates the renderer configuration
//    */
//   public updateConfig(config: Partial<RendererConfig>): void {
//     this.config = {
//       ...this.config,
//       ...config,
//     };
//   }

//   /**
//    * Sets the current rendering target
//    */
//   public setTarget(target: DirectiveRenderTargetProp): void {
//     directiveHandler.setTarget(target);
//   }

//   /**
//    * Gets the current rendering target
//    */
//   public getTarget(): DirectiveRenderTargetProp {
//     return directiveHandler.getTarget();
//   }

//   /**
//    * Gets the current GPU renderer type
//    */
//   public getGPURendererType(): GPURendererType {
//     return this.config.gpuRendererType || "inreal";
//   }

//   /**
//    * Gets the current Native renderer type
//    */
//   public getNativeRendererType(): NativeRendererType {
//     return this.config.nativeRendererType || "nativescript";
//   }

//   /**
//    * Sets the GPU renderer type
//    */
//   public setGPURendererType(type: GPURendererType): void {
//     this.config.gpuRendererType = type;
//   }

//   /**
//    * Sets the Native renderer type
//    */
//   public setNativeRendererType(type: NativeRendererType): void {
//     this.config.nativeRendererType = type;
//   }

//   /**
//    * Creates an element using the appropriate renderer for the current target
//    */
//   public async createElement(
//     type: string | Function,
//     props: any,
//     ...children: any[]
//   ): Promise<RenderNode> {
//     // Get the appropriate renderer for the current target
//     const renderer = await this.getRenderer(this.getTarget());

//     try {
//       // Use the renderer to create the element
//       const node = await renderer.createElement(type, props, ...children);

//       // Tag node with the renderer type that created it
//       if (node.target === "gpu" && this.config.gpuRendererType) {
//         (node as any).rendererType = this.config.gpuRendererType;
//       } else if (node.target === "native" && this.config.nativeRendererType) {
//         (node as any).rendererType = this.config.nativeRendererType;
//       }

//       return node;
//     } catch (error) {
//       console.error(
//         `Error creating element with ${this.getTarget()} renderer:`,
//         error
//       );
//       throw error;
//     }
//   }

//   /**
//    * Renders a node using the appropriate renderer based on the node's target
//    */
//   public async render(node: RenderNode, container: any): Promise<void> {
//     let rendererType;

//     // Use the specific renderer type that created the node if available
//     if (node.target === "gpu" && "rendererType" in node) {
//       rendererType = (node as any).rendererType;
//     } else if (node.target === "native" && "rendererType" in node) {
//       rendererType = (node as any).rendererType;
//     }

//     // Get the appropriate renderer
//     const renderer = await this.getRenderer(
//       node.target,
//       rendererType || this.config.gpuRendererType,
//       rendererType || this.config.nativeRendererType
//     );

//     try {
//       // Use the renderer to render the node
//       await renderer.render(node, container);
//     } catch (error) {
//       console.error(`Error rendering with ${node.target} renderer:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get a renderer instance by target and type
//    */
//   public async getRenderer(
//     target: DirectiveRenderTargetProp,
//     gpuType?: GPURendererType,
//     nativeType?: NativeRendererType
//   ): Promise<RendererInterface> {
//     const gpuRendererType = gpuType || this.config.gpuRendererType || "inreal";
//     const nativeRendererType =
//       nativeType || this.config.nativeRendererType || "nativescript";

//     // Create cache key for this renderer combination
//     const cacheKey = `${target}:${
//       target === "gpu"
//         ? gpuRendererType
//         : target === "native"
//         ? nativeRendererType
//         : ""
//     }`;

//     // If we already have this renderer in the cache, return it
//     if (this.rendererInstances.has(cacheKey)) {
//       return this.rendererInstances.get(cacheKey)!;
//     }

//     // Get the renderer from the registry
//     const renderer = await RendererRegistry.getRenderer(
//       target,
//       gpuRendererType,
//       nativeRendererType
//     );

//     // Cache the renderer instance
//     this.rendererInstances.set(cacheKey, renderer);

//     return renderer;
//   }

//   /**
//    * Get a list of all registered GPU renderer types
//    */
//   public getAvailableGPURendererTypes(): GPURendererType[] {
//     return RendererRegistry.getRegisteredGPURendererTypes();
//   }

//   /**
//    * Get a list of all registered Native renderer types
//    */
//   public getAvailableNativeRendererTypes(): NativeRendererType[] {
//     return RendererRegistry.getRegisteredNativeRendererTypes();
//   }
// }

// /**
//  * Singleton instance of the UniversalRenderer
//  */
// export const universalRenderer = UniversalRenderer.init();
