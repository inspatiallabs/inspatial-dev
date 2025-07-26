import { env } from "../../env/get.ts";
import {
  createFilter,
  type FilterPattern,
  DEFAULT_INCLUDE_PATTERNS,
} from "../utils.ts";

// Cross-runtime path utilities
const pathUtils = {
  join: (...segments: string[]): string => {
    // Simple cross-runtime path joining
    return segments.join("/").replace(/\/+/g, "/");
  },
};

interface RequireLike {
  resolve(id: string): string;
}

// Cross-runtime require resolution (for webpack compatibility)
function createCrossRuntimeRequire(basePath: string): RequireLike {
  if (
    typeof (globalThis as any).Deno !== "undefined" &&
    (globalThis as any).Deno.realPathSync
  ) {
    // Deno environment - provide basic require-like functionality
    return {
      resolve: (id: string): string => {
        // For Deno, return the module ID as-is or resolve relative to base
        if (id.startsWith("@")) {
          return id; // Package imports
        }
        return new URL(id, `file://${basePath}/`).pathname;
      },
    };
  } else if (
    typeof (globalThis as any).require !== "undefined" &&
    (globalThis as any).require.resolve
  ) {
    // Node.js environment - use native require
    // Use dynamic import or require.resolve to avoid eval warnings
    try {
      const moduleObj = (globalThis as any).require("module");
      if (moduleObj && moduleObj.createRequire) {
        return moduleObj.createRequire(basePath);
      }
    } catch {
      // Fallback if module access fails
    }
    return (globalThis as any).require;
  } else {
    // Fallback for other environments
    return {
      resolve: (id: string): string => id,
    };
  }
}

interface WebpackCompiler {
  context: string;
  options: {
    mode?: string;
    module?: {
      rules?: WebpackRule[];
    };
  };
}

interface WebpackRule {
  test: ((filepath: string) => boolean) | RegExp;
  use: Array<{
    loader: string;
    options?: any;
  }>;
}

interface InSpatialPluginOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  importSource?: string;
  enabled?: boolean;
  [key: string]: any; // For additional loader options
}

export class InSpatial {
  private importSource: string;
  private include?: FilterPattern;
  private exclude?: FilterPattern;
  private loaderOpts: any;
  private enabled?: boolean;

  /**
   * @param opts Configuration options
   */
  constructor(opts: InSpatialPluginOptions = {}) {
    const {
      include,
      exclude,
      importSource = "@inspatial/run/hmr",
      enabled,
      ...loaderOpts
    } = opts;

    this.importSource = importSource;
    this.include = include;
    this.exclude = exclude;
    this.loaderOpts = { importSource, ...loaderOpts };
    this.enabled = enabled;
  }

  apply(compiler: WebpackCompiler): void {
    // Use webpack mode if available, fallback to centralized env detection
    const webpackMode = compiler.options.mode;
    const enabled =
      this.enabled ??
      (webpackMode ? webpackMode !== "production" : !env.isProduction());
    if (!enabled) return;

    const contextPath = pathUtils.join(compiler.context, "index.js");
    const requireFn = createCrossRuntimeRequire(contextPath);
    const importSourcePath = requireFn.resolve(this.importSource);

    this.loaderOpts.importSourcePath = importSourcePath;

    const filter = createFilter(
      this.include || DEFAULT_INCLUDE_PATTERNS,
      this.exclude
    );

    const test = (filepath: string): boolean => {
      if (filepath === importSourcePath) {
        return true;
      }
      return filter(filepath);
    };

    const rule: WebpackRule = {
      test,
      use: [
        {
          loader: "@inspatial/run/hmr",
          options: this.loaderOpts,
        },
      ],
    };

    compiler.options.module ??= {};
    compiler.options.module.rules ??= [];
    compiler.options.module.rules.unshift(rule);
  }
}
