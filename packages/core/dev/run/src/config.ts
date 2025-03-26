// deno-lint-ignore-file no-explicit-any
// @ts-ignore - Ignoring TS extension import error
import { RendererConfig, GPURendererType, NativeRendererType } from "../../renderer/src/types.ts";
// @ts-ignore - Ignoring TS extension import error
import { universalRenderer } from "../../renderer/src/render.ts";

/**
 * Configure the renderer system with specific options
 */
export function configureRenderers(config: Partial<RendererConfig>): void {
  universalRenderer.updateConfig(config);
}

/**
 * Change the GPU renderer implementation to use
 */
export function useGPURenderer(type: GPURendererType, options?: Record<string, any>): void {
  universalRenderer.updateConfig({
    gpuRendererType: type,
    gpuOptions: options
  });
}

/**
 * Change the Native renderer implementation to use
 */
export function useNativeRenderer(type: NativeRendererType, options?: Record<string, any>): void {
  universalRenderer.updateConfig({
    nativeRendererType: type,
    nativeOptions: options
  });
}

/**
 * Get a list of all available GPU renderer implementations
 */
export function getAvailableGPURenderers(): GPURendererType[] {
  return universalRenderer.getAvailableGPURendererTypes();
}

/**
 * Get a list of all available Native renderer implementations
 */
export function getAvailableNativeRenderers(): NativeRendererType[] {
  return universalRenderer.getAvailableNativeRendererTypes();
}

/**
 * Get the currently active GPU renderer type
 */
export function getCurrentGPURenderer(): GPURendererType {
  return universalRenderer.getGPURendererType();
}

/**
 * Get the currently active Native renderer type
 */
export function getCurrentNativeRenderer(): NativeRendererType {
  return universalRenderer.getNativeRendererType();
} 