// /**
//  * @file registry.ts
//  * @description Registry for renderer implementations
//  */

// // deno-lint-ignore-file no-explicit-any
// import {
//   DirectiveRenderTargetProp,
//   GPURendererType,
//   NativeRendererType,
// } from "./types.ts";
// import {
//   RendererInterface,
//   DOMRendererInterface,
//   GPURendererInterface,
//   NativeRendererInterface,
// } from "./interfaces.ts";

// /**
//  * Factory function types for creating renderers
//  */
// type DOMRendererFactory = () => Promise<DOMRendererInterface>;
// type GPURendererFactory = () => Promise<GPURendererInterface>;
// type NativeRendererFactory = () => Promise<NativeRendererInterface>;

// /**
//  * Registry for renderer implementations
//  * Manages registration and retrieval of renderers for different targets
//  */
// export class RendererRegistry {
//   // Static registries for different types of renderers
//   private static domRendererFactory: DOMRendererFactory | null = null;
//   private static gpuRendererFactories = new Map<
//     GPURendererType,
//     GPURendererFactory
//   >();
//   private static nativeRendererFactories = new Map<
//     NativeRendererType,
//     NativeRendererFactory
//   >();

//   /**
//    * Register a DOM renderer factory
//    */
//   public static registerDOMRenderer(factory: DOMRendererFactory): void {
//     RendererRegistry.domRendererFactory = factory;
//   }

//   /**
//    * Register a GPU renderer factory
//    */
//   public static registerGPURenderer(
//     type: GPURendererType,
//     factory: GPURendererFactory
//   ): void {
//     RendererRegistry.gpuRendererFactories.set(type, factory);
//   }

//   /**
//    * Register a Native renderer factory
//    */
//   public static registerNativeRenderer(
//     type: NativeRendererType,
//     factory: NativeRendererFactory
//   ): void {
//     RendererRegistry.nativeRendererFactories.set(type, factory);
//   }

//   /**
//    * Get a renderer instance for the specified target
//    */
//   public static async getRenderer(
//     target: DirectiveRenderTargetProp,
//     gpuRendererType?: GPURendererType,
//     nativeRendererType?: NativeRendererType
//   ): Promise<RendererInterface> {
//     switch (target) {
//       case "dom":
//         return await RendererRegistry.getDOMRenderer();
//       case "gpu":
//         return await RendererRegistry.getGPURenderer(
//           gpuRendererType || "inreal"
//         );
//       case "native":
//         return await RendererRegistry.getNativeRenderer(
//           nativeRendererType || "nativescript"
//         );
//       default:
//         throw new Error(`Unsupported render target: ${target}`);
//     }
//   }

//   /**
//    * Get the registered DOM renderer instance
//    */
//   private static async getDOMRenderer(): Promise<DOMRendererInterface> {
//     if (!RendererRegistry.domRendererFactory) {
//       throw new Error("No DOM renderer registered");
//     }

//     try {
//       return await RendererRegistry.domRendererFactory();
//     } catch (error) {
//       console.error("Failed to create DOM renderer:", error);
//       throw error;
//     }
//   }

//   /**
//    * Get a registered GPU renderer instance
//    */
//   private static async getGPURenderer(
//     type: GPURendererType
//   ): Promise<GPURendererInterface> {
//     const factory = RendererRegistry.gpuRendererFactories.get(type);
//     if (!factory) {
//       throw new Error(`No GPU renderer registered for type: ${type}`);
//     }

//     try {
//       return await factory();
//     } catch (error) {
//       console.error(`Failed to create GPU renderer (${type}):`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get a registered Native renderer instance
//    */
//   private static async getNativeRenderer(
//     type: NativeRendererType
//   ): Promise<NativeRendererInterface> {
//     const factory = RendererRegistry.nativeRendererFactories.get(type);
//     if (!factory) {
//       throw new Error(`No Native renderer registered for type: ${type}`);
//     }

//     try {
//       return await factory();
//     } catch (error) {
//       console.error(`Failed to create Native renderer (${type}):`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get a list of all registered GPU renderer types
//    */
//   public static getRegisteredGPURendererTypes(): GPURendererType[] {
//     return Array.from(RendererRegistry.gpuRendererFactories.keys());
//   }

//   /**
//    * Get a list of all registered Native renderer types
//    */
//   public static getRegisteredNativeRendererTypes(): NativeRendererType[] {
//     return Array.from(RendererRegistry.nativeRendererFactories.keys());
//   }
// }
