/**
 * Represents all possible JavaScript runtime environments
 */
export type JSRuntimeProp =
  | "deno"
  | "node"
  | "bun"
  | "browser"
  | "worker"
  | "cloudflare-worker"
  | "edge-runtime"
  | "webcontainer"
  | null;

/**
 * Runtime detection options
 */
export interface RuntimeDetectionOptions {
  /** Throw error instead of returning null for unknown runtime */
  strict?: boolean;
  /** Enable detailed runtime information */
  detailed?: boolean;
}

/**
 * Detailed runtime information
 */
export interface RuntimeInfo {
  /** The detected runtime environment */
  runtime: JSRuntimeProp;
  /** Runtime version if available */
  version?: string;
  /** Additional runtime-specific capabilities */

  capabilities: {
    hasFileSystem: boolean;
    hasNetwork: boolean;
    hasWebAPIs: boolean;
    isSecureContext: boolean;
  };
}

/**
 * Error thrown when runtime detection fails in strict mode
 */
export class RuntimeDetectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeDetectionError";
  }
}

/**
 * # DetectJSRuntime
 * #### A friendly tool that figures out which JavaScript environment your code is running in
 *
 * The `detectJSRuntime` function is like a detective that looks around to determine where your
 * JavaScript code is running. Think of it like asking "Where am I?" - are you in a web browser,
 * on a server, or somewhere else?
 *
 * @since 1.0.0
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Runtime Detection: Identifies the current JavaScript environment
 * - Capability Checking: Discovers what features are available
 * - Safety First: Can work in strict mode to prevent uncertainty
 *
 * ### 📚 Terminology
 * > **Runtime Environment**: The place where your JavaScript code runs and executes
 * > **Secure Context**: A protected environment that enables certain security-sensitive features
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about detection details</summary>
 *
 * > [!NOTE]
 * > The detection order matters - more specific environments are checked first
 *
 * > [!NOTE]
 * > Browser detection is intentionally last as it's the most generic environment
 * </details>
 *
 * ### 📝 Type Definitions
 * ```typescript
 * type JSRuntimeProp =
 *   | "deno"           // Deno runtime
 *   | "node"           // Node.js runtime
 *   | "bun"            // Bun runtime
 *   | "browser"        // Web browser
 *   | "worker"         // Web Worker
 *   | "cloudflare-worker" // Cloudflare Worker
 *   | "edge-runtime"   // Edge runtime (Vercel, Netlify)
 *   | "webcontainer"   // WebContainer
 *   | null;            // Unknown runtime
 *
 * interface RuntimeDetectionOptions {
 *   strict?: boolean;   // Throw error for unknown runtime
 *   detailed?: boolean; // Get extra runtime information
 * }
 *
 * interface RuntimeInfo {
 *   runtime: JSRuntimeProp;
 *   version?: string;
 *   capabilities: {
 *     hasFileSystem: boolean;    // Can access files
 *     hasNetwork: boolean;       // Can make network requests
 *     hasWebAPIs: boolean;       // Has browser-like APIs
 *     isSecureContext: boolean;  // Runs in secure context
 *   };
 * }
 * ```
 *
 * @param {RuntimeDetectionOptions} [options] - Customizes how the detection works
 *    - `strict`: Makes the function throw an error if it can't identify the runtime
 *    - `detailed`: Gets extra information about the runtime's capabilities
 *
 * ### 🎮 Usage
 *
 * @example
 * ### Example 1: Basic Runtime Check
 * ```typescript
 * import { detectJSRuntime } from '@inspatial/run/user-agent/runtime.ts';
 *
 * // Simple check to see where we're running
 * const runtime = detectJSRuntime();
 *
 * if (runtime === "browser") {
 *   console.log("Hello web browser!");
 * } else if (runtime === "node") {
 *   console.log("Hello Node.js!");
 * }
 * ```
 *
 * @example
 * ### Example 2: Detailed Runtime Information
 * ```typescript
 * import { detectJSRuntime } from '@inspatial/run/user-agent/runtime.ts';
 *
 * // Get detailed information about our environment
 * const info = detectJSRuntime({ detailed: true });
 *
 * console.log(`Running in: ${info.runtime}`);
 * console.log(`Version: ${info.version || 'unknown'}`);
 * console.log('Can access files:', info.capabilities.hasFileSystem);
 * console.log('Can make network requests:', info.capabilities.hasNetwork);
 * ```
 *
 * @example
 * ### Example 3: Strict Mode with Error Handling
 * ```typescript
 * import { detectJSRuntime, RuntimeDetectionError } from '@inspatial/run/user-agent/runtime.ts';
 *
 * try {
 *   // Use strict mode to ensure we know exactly where we're running
 *   const runtime = detectJSRuntime({ strict: true });
 *   console.log(`Safely running in ${runtime}`);
 * } catch (error) {
 *   if (error instanceof RuntimeDetectionError) {
 *     console.error("Couldn't determine the runtime:", error.message);
 *   }
 * }
 * ```
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 * - ✅ Browser
 * - ✅ Web Workers
 * - ✅ Edge Runtime
 *
 * @throws {RuntimeDetectionError}
 * Occurs when strict mode is enabled and the runtime cannot be determined
 *
 * @returns {JSRuntimeProp | RuntimeInfo}
 * Either the runtime name or detailed runtime information if detailed mode is enabled
 */
export function detectJSRuntime(
  options: RuntimeDetectionOptions & { detailed: true }
): RuntimeInfo;
export function detectJSRuntime(
  options?: RuntimeDetectionOptions
): JSRuntimeProp;
export function detectJSRuntime(
  options: RuntimeDetectionOptions = {}
): JSRuntimeProp | RuntimeInfo {
  const { strict = false, detailed = false } = options;

  // Helper function to check for secure context
  const isSecureContext = (): boolean => {
    try {
      return !!(globalThis as any).isSecureContext;
    } catch {
      return false;
    }
  };

  // Helper to check web APIs
  const hasWebAPIs = (): boolean => {
    return (
      "window" in globalThis ||
      "document" in globalThis ||
      "WorkerGlobalScope" in globalThis
    );
  };

  // Detect runtime and gather info
  let runtime: JSRuntimeProp = null;
  let version: string | undefined;

  const capabilities = {
    hasFileSystem: false,
    hasNetwork: false,
    hasWebAPIs: hasWebAPIs(),
    isSecureContext: isSecureContext(),
  };

  // Deno detection
  if ("Deno" in globalThis) {
    runtime = "deno";
    version = (globalThis as any).Deno.version?.deno;
    capabilities.hasFileSystem = true;
    capabilities.hasNetwork = true;
  }
  // Node.js detection
  else if (
    "process" in globalThis &&
    (globalThis as any).process?.versions?.node
  ) {
    runtime = "node";
    version = (globalThis as any).process.versions.node;
    capabilities.hasFileSystem = true;
    capabilities.hasNetwork = true;
  }
  // Bun detection
  else if ("Bun" in globalThis) {
    runtime = "bun";
    version = (globalThis as any).Bun.version;
    capabilities.hasFileSystem = true;
    capabilities.hasNetwork = true;
  }
  // Cloudflare Worker detection
  else if ("WorkerGlobalScope" in globalThis && "CF_WORKER" in globalThis) {
    runtime = "cloudflare-worker";
    capabilities.hasNetwork = true;
  }
  // Edge Runtime detection (Vercel Edge, Netlify Edge, etc)
  else if ("EdgeRuntime" in globalThis) {
    runtime = "edge-runtime";
    capabilities.hasNetwork = true;
  }
  // WebContainer detection
  else if ("WebContainer" in globalThis) {
    runtime = "webcontainer";
    capabilities.hasFileSystem = true;
    capabilities.hasNetwork = true;
  }
  // Web Worker detection
  else if ("WorkerGlobalScope" in globalThis && "importScripts" in globalThis) {
    runtime = "worker";
    capabilities.hasNetwork = true;
  }
  // Browser detection (should be last as it's the most generic)
  else if ("document" in globalThis) {
    runtime = "browser";
    capabilities.hasNetwork = true;
  }

  // Handle unknown runtime in strict mode
  if (runtime === null && strict) {
    throw new RuntimeDetectionError(
      "Unable to detect JavaScript runtime environment"
    );
  }

  // Return detailed info if requested
  if (detailed) {
    return {
      runtime,
      version,
      capabilities,
    };
  }

  return runtime;
}
