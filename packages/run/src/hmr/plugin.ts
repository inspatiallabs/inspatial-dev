/**
 * @module @inspatial/run/hmr
 *
 * Hot Module Replacement (HMR) plugin for InSpatial applications with universal build tool support.
 * Provides seamless development experience by automatically injecting HMR setup code into your
 * JSX, TSX, and MDX files during development builds.
 *
 * @features
 * - Universal support for Vite and Rollup build tools
 * - Automatic HMR injection for JSX/TSX/MDX files
 * - Configurable file filtering with include/exclude patterns
 * - Development-only operation with production build detection
 * - Customizable import source for HMR setup module
 * - Intelligent injection prevention (avoids double-injection)
 * - Environment-aware enabling based on NODE_ENV
 * - TypeScript-first with comprehensive type safety
 * - Integration with InSpatial's reactive HMR system
 *
 * @apiOptions
 * - include: string[] - File patterns to include for HMR injection
 * - exclude: string[] - File patterns to exclude from HMR injection
 * - importSource: string - Module path for HMR setup functionality
 * - enabled: boolean - Whether to enable HMR injection (auto-detected if not specified)
 *
 * @bestPractices
 * 1. Use specific include patterns to avoid processing unnecessary files
 * 2. Exclude test files and story files from HMR injection
 * 3. Let the plugin auto-detect production environment for optimal performance
 * 4. Use custom import sources for specialized HMR setups
 * 5. Configure file patterns to match your project structure
 *
 * @see {@link HMRPluginOptionsType} - Configuration options interface
 * @see {@link HMRPluginReturnType} - Plugin return type interface
 * @see {@link RollupTransformResultType} - Transform result type
 */

import { createFilter } from "npm:@rollup/pluginutils@^5.2.0";
import { isProduction } from "../constant/index.ts";

/**
 * # HMRPluginOptionsType
 * @summary #### Configuration options for the InSpatial HMR plugin
 *
 * Defines all available configuration options for customizing the HMR plugin behavior.
 * These options control which files are processed, where the HMR setup code comes from,
 * and whether the plugin is enabled.
 *
 * @since 0.0.1
 * @category InSpatial Run
 * @module @inspatial/run/hmr
 * @kind interface
 * @access public
 *
 * ### 💡 Core Concepts
 * - File filtering controls which files get HMR injection
 * - Import source determines where HMR setup code comes from
 * - Enabling can be automatic (based on NODE_ENV) or manual
 * - All options are optional with sensible defaults
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of glob patterns for file matching
 * - Knowledge of your build tool (Vite or Rollup)
 * - Familiarity with module import paths
 *
 * ### 📚 Terminology
 * > **Glob Pattern**: File path patterns using wildcards (* and **)
 * > **Import Source**: The module path that provides HMR setup functionality
 * > **File Filter**: Logic that determines which files should be processed
 */
interface HMRPluginOptionsType {
  /** File patterns to include for HMR injection */
  include?: string[];

  /** File patterns to exclude from HMR injection */
  exclude?: string[];

  /** Module path for HMR setup functionality */
  importSource?: string;

  /** Whether to enable HMR injection (auto-detected if not specified) */
  enabled?: boolean;
}

/**
 * # RollupTransformResultType
 * @summary #### Result object returned by Rollup transform functions
 *
 * Represents the result of a code transformation operation in Rollup/Vite.
 * Contains the transformed code and optional source map information.
 *
 * @since 0.0.1
 * @category InSpatial Run
 * @module @inspatial/run/hmr
 * @kind interface
 * @access public
 */
interface RollupTransformResultType {
  /** The transformed code */
  code: string;

  /** Source map for the transformation (null if not generated) */
  map: any | null;
}

/**
 * # HMRPluginReturnType
 * @summary #### Plugin object returned by the HMR plugin factory
 *
 * Defines the structure of the plugin object that integrates with Vite and Rollup.
 * Contains all the hooks and metadata needed for the build tool integration.
 *
 * @since 0.0.1
 * @category InSpatial Run
 * @module @inspatial/run/hmr
 * @kind interface
 * @access public
 */
interface HMRPluginReturnType {
  /** Plugin name identifier */
  name: string;

  /** Vite-specific hint for when to apply this plugin */
  apply?: string;

  /**
   * Rollup buildStart hook
   * Called when the build process starts
   */
  buildStart?: (inputOptions: any, outputOptions?: any) => void;

  /**
   * Rollup/Vite transform hook
   * Called to transform individual modules
   */
  transform?: (code: string, id: string) => RollupTransformResultType | null;
}

/** Marker comments for HMR injection boundaries */
const BEGIN = "/* ---- BEGIN INSPATIAL HMR INJECT ---- */";
const END = "/* ----  END INSPATIAL HMR INJECT  ---- */";

/**
 * # InspatialHMR
 * @summary #### Creates a build plugin that automatically injects HMR setup code into development builds
 *
 * The `inspatialHMR` function creates a build tool plugin that automatically injects Hot Module
 * Replacement setup code into your JSX, TSX, and MDX files during development. Think of it like
 * a helpful assistant that quietly adds the necessary plumbing for live code updates while you're
 * developing, but stays out of the way during production builds.
 *
 * The plugin works by detecting when you're in development mode and automatically injecting a small
 * snippet of code that connects your components to InSpatial's HMR system. This code only runs
 * when HMR is available (like in Vite dev server) and gracefully falls back to page refresh if
 * more advanced HMR isn't supported.
 *
 * @since 0.0.1
 * @category InSpatial Run
 * @module @inspatial/run/hmr
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Automatically detects development vs production environment
 * - Only processes files matching your include/exclude patterns
 * - Injects HMR setup code that connects to import.meta.hot
 * - Works universally with both Vite and Rollup build systems
 * - Prevents duplicate injection by checking for existing markers
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - A Vite or Rollup-based build setup
 * - JSX/TSX/MDX files in your project
 * - Understanding of your project's file structure
 * - Development environment with HMR support
 *
 * ### 📚 Terminology
 * > **Hot Module Replacement (HMR)**: Technology that updates modules in-place without full page refresh
 * > **Build Plugin**: Code that extends build tools with custom transformation logic
 * > **Code Injection**: Programmatically adding code to files during the build process
 * > **Development Mode**: Build configuration optimized for development with fast rebuilds
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about HMR behavior</summary>
 *
 * > [!NOTE]
 * > The plugin automatically disables itself in production builds to avoid injecting development-only code
 *
 * > [!NOTE]
 * > HMR injection only happens once per file - subsequent transforms skip files that already have the markers
 *
 * > [!NOTE]
 * > If import.meta.hot is not available, the injected code gracefully falls back to location.reload()
 * </details>
 *
 * @param options - Configuration options for the HMR plugin behavior
 * @returns A build plugin object that can be used with Vite or Rollup
 *
 * ### 🎮 Usage Examples
 *
 * Basic Vite setup: Configure your vite.config.ts with InspatialHMR() in the plugins array.
 * The plugin will automatically enable HMR for .jsx, .tsx, and .mdx files during development.
 *
 * Custom file patterns: Use the include and exclude options to specify exactly which files
 * should receive HMR injection. For example, include only component directories or exclude
 * test files and stories.
 *
 * Environment-specific configuration: Combine with environment variables to enable HMR
 * in different contexts like Storybook or custom development environments.
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Mistake 1**: Including too many file patterns that slow down the build
 * - **Mistake 2**: Forgetting to exclude test files, causing unnecessary processing
 * - **Mistake 3**: Manually enabling in production, which adds unnecessary code to bundles
 * - **Mistake 4**: Using wrong import source that doesn't exist in your project
 * </details>
 *
 * @throws {Error}
 * Errors are rare but may occur if the import source module cannot be resolved during runtime.
 * The plugin itself won't throw during build - it will just skip transformation if there are issues.
 *
 * @returns {HMRPluginReturnType | undefined}
 * Returns a plugin object for Vite/Rollup integration, or undefined if disabled (e.g., in production).
 * The plugin object contains hooks for buildStart and transform that handle the HMR injection logic.
 *
 * ### 📝 Uncommon Knowledge
 * HMR plugins don't actually implement hot reloading - they just prepare your code to work with
 * the HMR system that's already built into your dev server. The magic happens when your dev
 * server detects file changes and coordinates with the injected HMR code to update modules in place.
 *
 * ### 🔧 Runtime Support
 * - ✅ Vite (recommended)
 * - ✅ Rollup
 * - ✅ Build tools that support Rollup plugins
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link HMRPluginOptionsType} - Configuration options for the plugin
 * - {@link HMRPluginReturnType} - Return type of the plugin function
 *
 * #### External Resources
 * @external Vite HMR API
 * {@link https://vitejs.dev/guide/api-hmr.html Vite HMR Documentation}
 * Official Vite documentation for HMR API
 *
 * @external Rollup Plugin Development
 * {@link https://rollupjs.org/plugin-development/ Rollup Plugin Guide}
 * Guide for developing Rollup plugins
 */
export function InspatialHMR(
  options: HMRPluginOptionsType = {}
): HMRPluginReturnType | undefined {
  const {
    include = ["**/*.jsx", "**/*.tsx", "**/*.mdx"],
    exclude,
    importSource = "@inspatial/run/hmr",
  } = options;

  const filter = createFilter(include, exclude);

  const enabled = options.enabled ?? !isProduction;
  if (!enabled) return;

  // Vite-specific hint (pre-serve only for Vite; for plain Rollup we check `command`)
  const apply = "serve";
  let isBuild = false; // Rollup build detection flag

  const snippet = `${BEGIN}
if (import.meta.hot) {
	import("${importSource}").then(({setup}) => setup({
		data: import.meta.hot.data,
		current: import(/* @vite-ignore */import.meta.url),
		accept() { import.meta.hot.accept() },
		dispose(cb) {	import.meta.hot.dispose(cb)	},
		invalidate(reason) {
			if (import.meta.hot.invalidate) {
				import.meta.hot.invalidate(reason)
			} else {
				location.reload()
			}
		}
	}))
}
${END}
`;

  return {
    name: "inspatial-hmr",
    apply,

    /** Rollup-only: record whether we are running a production build */
    buildStart(inputOptions: any) {
      // inputOptions is undefined in Vite; OK
      if (inputOptions) {
        // rollup passes build metadata via this.meta
        // @ts-expect-error - this.meta.watchMode is not typed but exists in Rollup
        isBuild = this.meta.watchMode === false; // equals "rollup -c" build
      }
    },

    transform(code: string, id: string): RollupTransformResultType | null {
      if (!filter(id)) return null; // wrong file type
      if (isBuild) return null; // production build – skip
      if (code.includes(BEGIN)) return null; // already injected

      return {
        code: `${code}\n\n${snippet}`,
        map: null,
      };
    },
  };
}
