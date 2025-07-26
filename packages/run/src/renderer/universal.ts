import {
  detectEnvironment,
  getRendererType,
  EnvironmentInfo,
} from "./environment.ts";
import { XRRenderer } from "./xr.ts";
import { NativeScriptRenderer } from "./nativescript.ts";

/**
 * Universal Renderer Configuration
 */
export interface UniversalRendererOptions {
  /** Force a specific renderer type instead of auto-detection */
  forceRenderer?: "dom" | "html" | "native" | "xr";
  /** Environment detection override */
  environment?: EnvironmentInfo;
  /** Renderer-specific options */
  rendererOptions?: any;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Create a universal renderer that automatically detects the environment
 * and chooses the appropriate renderer implementation
 */
export async function createUniversalRenderer(
  options: UniversalRendererOptions = {}
): Promise<any> {
  const {
    forceRenderer,
    environment,
    rendererOptions = {},
    debug = false,
  } = options;

  // Detect environment
  const env = environment || detectEnvironment();

  if (debug) {
    console.log("🌍 InSpatial Universal Renderer");
    console.log("📊 Environment detected:", env);
  }

  // Determine renderer type
  const rendererType = forceRenderer || getRendererType(env);

  if (debug) {
    console.log("🎨 Renderer type selected:", rendererType);
  }

  // Create appropriate renderer based on environment
  switch (rendererType) {
    case "dom": {
      // Import DOM renderer dynamically to avoid issues in non-DOM environments
      const { DOMRenderer } = await import("./dom.ts");
      const renderer = DOMRenderer({
        rendererID: "Universal-DOM",
        ...rendererOptions,
      });

      if (debug) {
        console.log("✅ DOM renderer created");
      }

      return renderer;
    }

    case "native": {
      // Create NativeScript renderer for native mobile apps
      const nativeRenderer = NativeScriptRenderer({
        rendererID: "Universal-NativeScript",
        ...rendererOptions,
      });

      if (debug) {
        console.log("✅ NativeScript renderer created");
      }

      return nativeRenderer;
    }

    case "xr": {
      // Create XR renderer for AndroidXR, VisionOS, and HorizonOS
      const xrRenderer = XRRenderer({
        rendererID: "Universal-XR",
        environment: env,
        ...rendererOptions,
      });

      if (debug) {
        console.log(`✅ XR renderer created for ${env.platform}`);
      }

      return xrRenderer;
    }

    case "html": {
      // Import HTML renderer for server-side environments
      const { HTMLRenderer } = await import("./html.ts");
      const renderer = HTMLRenderer({
        rendererID: "Universal-HTML",
        ...rendererOptions,
      });

      if (debug) {
        console.log("✅ HTML renderer created");
      }

      return renderer;
    }

    default: {
      // Fallback to DOM renderer (most capable, works everywhere)
      const { DOMRenderer } = await import("./dom.ts");
      const renderer = DOMRenderer({
        rendererID: "Universal-DOM-Fallback",
        ...rendererOptions,
      });

      if (debug) {
        console.log("✅ DOM renderer created (fallback)");
      }

      return renderer;
    }
  }
}

/**
 * Convenience function for quick universal renderer creation
 */
export function createRenderer(): Promise<any> {
  return createUniversalRenderer();
}

// Re-export environment utilities
export {
  detectEnvironment,
  getRendererType,
  supportsFeature,
} from "./environment.ts";

// Re-export individual renderers
export { DOMRenderer } from "./dom.ts";
export { HTMLRenderer } from "./html.ts";
export { AndroidXRRenderer } from "./android-xr.ts";
export { VisionOSRenderer } from "./vision-os.ts";
export { HorizonOSRenderer } from "./horizon-os.ts";
export { GenericXRRenderer } from "./generic-xr.ts";
export { XRRenderer } from "./xr.ts";
export { NativeScriptRenderer } from "./nativescript.ts";
