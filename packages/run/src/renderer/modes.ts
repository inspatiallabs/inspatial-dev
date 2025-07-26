import {
  detectEnvironment,
  type EnvironmentInfo,
} from "./environment.ts";
import { createDebugContext, type DebugMode, type DebugContext } from "../debug/index.ts";

/**
 * Render Mode Configuration
 */
export interface RenderModeOptions {
  /** Primary render mode - determines the rendering strategy */
  mode?: 'browser' | 'xr' | 'native' | 'server' | 'auto';
  /** Target within the mode for fine-grained control */
  target?: 'interactive' | 'static' | 'ssr' | 'auto';
  /** Platform preference (auto-detected if not specified) */
  platform?: 'android' | 'ios' | 'web' | 'desktop' | 'auto';
  /** Environment detection override */
  environment?: EnvironmentInfo;
  /** Renderer-specific options */
  rendererOptions?: any;
  /** Debug mode - true, false, or configuration */
  debug?: DebugMode;
}

/**
 * Create a renderer using the mode-based API
 * Provides smart defaults and automatic fallbacks
 */
export async function createRenderer(options: RenderModeOptions = {}): Promise<any> {
  const {
    mode = 'auto',
    target = 'auto',
    platform = 'auto',
    environment,
    rendererOptions = {},
    debug = false,
  } = options;

  // Create debug context
  const debugCtx = createDebugContext(debug);

  // Detect environment if not provided
  const env = environment || detectEnvironment();
  
  // Auto-log environment detection
  debugCtx?.logEnvironment(env);

  // Determine the actual mode to use
  const resolvedMode = mode === 'auto' ? autoDetectMode(env) : mode;
  
  // Auto-log mode selection
  debugCtx?.logModeSelection(mode, resolvedMode, mode === 'auto' ? 'auto-detected' : undefined);

  // Create renderer based on resolved mode
  let renderer;
  switch (resolvedMode) {
    case 'browser':
      renderer = await createBrowserRenderer({ target, env, rendererOptions, debugCtx });
      break;

    case 'xr':
      renderer = await createXRRenderer({ platform, env, rendererOptions, debugCtx });
      break;

    case 'native':
      renderer = await createNativeRenderer({ platform, env, rendererOptions, debugCtx });
      break;

    case 'server':
      renderer = await createServerRenderer({ env, rendererOptions, debugCtx });
      break;

    default:
      // Ultimate fallback: DOM renderer (works in most environments)
      debugCtx?.debug.warn('renderer', `Unknown mode "${resolvedMode}", falling back to browser mode`);
      renderer = await createBrowserRenderer({ target: 'auto', env, rendererOptions, debugCtx });
  }

  // Attach debug context to renderer and global systems
  if (debugCtx && renderer) {
    renderer._debugCtx = debugCtx;
    
    // Set debug context globally for signals and components
    const { setSignalDebugContext } = await import("../signal.ts");
    const { setComponentDebugContext } = await import("../kit/component/index.ts");
    
    setSignalDebugContext(debugCtx);
    setComponentDebugContext(debugCtx);
    
    // Also make it available globally for HMR and other systems
    (globalThis as any).debug = debugCtx.debug;
  }

  return renderer;
}

/**
 * Auto-detect the best mode based on environment
 */
function autoDetectMode(env: EnvironmentInfo): string {
  // XR environments get XR mode
  if (env.type === 'androidxr' || env.type === 'visionos' || env.type === 'horizonos') {
    return 'xr';
  }

  // Native mobile environments
  if (env.type === 'nativescript' || env.type === 'react-native') {
    return 'native';
  }

  // Server-side environments without DOM
  if ((env.type === 'node' || env.type === 'deno' || env.type === 'bun') && !env.features.hasDOM) {
    return 'server';
  }

  // Default to browser mode for most cases (DOM, SSR with DOM, electron, web workers, etc.)
  return 'browser';
}

/**
 * Create browser-mode renderer (DOM/HTML smart selection)
 */
async function createBrowserRenderer({ target, env, rendererOptions, debugCtx }: any): Promise<any> {
  // Smart target detection within browser mode
  let resolvedTarget = target;
  if (target === 'auto') {
    // If we're in SSR context or explicitly want static, use HTML
    if (env.type === 'node' || env.type === 'deno' || env.type === 'bun') {
      resolvedTarget = 'static';
    } else {
      resolvedTarget = 'interactive';
    }
  }

  if (resolvedTarget === 'static' || resolvedTarget === 'ssr') {
    // Use HTML renderer for static/SSR
    const { HTMLRenderer } = await import("./html.ts");
    const renderer = HTMLRenderer({
      rendererID: 'Browser-Static',
      ...rendererOptions,
    });

    debugCtx?.logRendererCreation('Browser-Static', renderer);
    return renderer;
  } else {
    // Use DOM renderer for interactive (DEFAULT for browser mode)
    const { DOMRenderer } = await import("./dom.ts");
    const renderer = DOMRenderer({
      rendererID: 'Browser-Interactive',
      ...rendererOptions,
    });

    debugCtx?.logRendererCreation('Browser-Interactive', renderer);
    return renderer;
  }
}

/**
 * Create XR-mode renderer (WebXR default with platform fallbacks)
 */
async function createXRRenderer({ platform, env, rendererOptions, debugCtx }: any): Promise<any> {
  const { XRRenderer } = await import("./xr.ts");
  
  // XR mode defaults to WebXR (GenericXR) unless specific platform detected
  const renderer = XRRenderer({
    rendererID: 'XR-Mode',
    environment: env,
    ...rendererOptions,
  });

  debugCtx?.logRendererCreation(`XR-${env.type || 'WebXR'}`, renderer);
  return renderer;
}

/**
 * Create native-mode renderer
 */
async function createNativeRenderer({ platform, env, rendererOptions, debugCtx }: any): Promise<any> {
  const { NativeScriptRenderer } = await import("./nativescript.ts");
  
  const renderer = NativeScriptRenderer({
    rendererID: 'Native-Mode',
    ...rendererOptions,
  });

  debugCtx?.logRendererCreation('Native-NativeScript', renderer);
  return renderer;
}

/**
 * Create server-mode renderer (HTML for SSR)
 */
async function createServerRenderer({ env, rendererOptions, debugCtx }: any): Promise<any> {
  const { HTMLRenderer } = await import("./html.ts");
  
  const renderer = HTMLRenderer({
    rendererID: 'Server-SSR',
    ...rendererOptions,
  });

  debugCtx?.logRendererCreation('Server-SSR', renderer);
  return renderer;
}

// Re-export types for convenience
export type { EnvironmentInfo } from "./environment.ts"; 