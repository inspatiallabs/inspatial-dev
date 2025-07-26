/**
 * Supported JavaScript runtimes
 */
type Runtime = "deno" | "node" | "bun" | "browser";

/**
 * Interface for environment access across different runtimes
 */
interface EnvironmentProvider {
  get(key: string): string | undefined;
}

/**
 * Validation constraint options
 */
interface ValidationConstraints {
  min?: number;
  max?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean;
  enum?: readonly string[];
}

/**
 * Enhanced environment variable configuration with validation
 */
interface EnvConfigWithValidation<T = string> extends EnvConfig<T> {
  constraints?: ValidationConstraints;
}

/**
 * Configuration schema for bulk loading
 */
interface ConfigSchema {
  [key: string]: EnvConfigWithValidation<any>;
}

/**
 * Result of bulk configuration loading
 */
type ConfigResult<T extends ConfigSchema> = {
  [K in keyof T]: T[K] extends EnvConfigWithValidation<infer U> ? U : never;
};

/**
 * Type for environment variable configuration
 */
interface EnvConfig<T = string> {
  key: string;
  required?: boolean;
  default?: T;
  transform?: (value: string) => T;
}

/**
 * Error thrown when environment variables are missing
 */
export class EnvironmentVariableError extends Error {
  readonly envs: ReadonlySet<string>;

  constructor(envs: Set<string>) {
    const message =
      envs.size === 1
        ? `Environment variable required: ${Array.from(envs)[0]}`
        : `Environment variables required: ${Array.from(envs).join(", ")}`;

    super(message);
    this.name = "EnvironmentVariableError";
    this.envs = envs;
  }

  override toString(): string {
    return `${this.name}\n  ${Array.from(this.envs).join("\n  ")}`;
  }
}

/**
 * Runtime-specific environment providers
 */
const runtimeProviders: Record<Runtime, () => EnvironmentProvider> = {
  node: () => ({
    get: (key: string) => (globalThis as any).process?.env[key],
  }),
  deno: () => ({
    get: (key: string) => (globalThis as any).Deno?.env.get(key),
  }),
  bun: () => ({
    get: (key: string) => (globalThis as any).Bun?.env[key],
  }),
  browser: () => ({
    get: (key: string) => {
      // In browser, try to get from import.meta.env first
      try {
        const importMetaEnv = (globalThis as any).import?.meta?.env;
        if (importMetaEnv && key in importMetaEnv) {
          const value = importMetaEnv[key];
          // Convert boolean values to strings for consistency
          return typeof value === 'boolean' ? String(value) : value;
        }
      } catch {
        // Ignore import.meta access errors
      }
      
      // Fallback: try to access process.env if it exists (some bundlers provide it)
      try {
        return (globalThis as any).process?.env?.[key];
      } catch {
        // No environment variables available in pure browser environment
        return undefined;
      }
    },
  }),
};

/**
 * Detect current runtime
 */
function detectRuntime(): Runtime | undefined {
  // Check for browser environment first (has window or import.meta but no server runtimes)
  const hasWindow = typeof (globalThis as any).window === "object";
  const hasImportMeta = typeof (globalThis as any).import?.meta === "object";
  const hasProcess = typeof (globalThis as any).process?.env === "object";
  const hasDeno = typeof (globalThis as any).Deno?.env?.get === "function";
  const hasBun = typeof (globalThis as any).Bun?.env === "object";
  
  // If we have Deno/Node/Bun specific APIs, detect those first
  if (hasDeno) return "deno";
  if (hasProcess && !hasWindow) return "node"; // Node.js without DOM
  if (hasBun) return "bun";
  
  // If we have browser indicators or process.env in a browser context, it's browser
  if (hasWindow || hasImportMeta || (hasProcess && hasWindow)) {
    return "browser";
  }
  
  // Default to browser for unknown environments
  return "browser";
}

/**
 * Runtime information interface
 */
interface RuntimeInfo {
  name: Runtime;
  version?: string;
  platform?: string;
  supportsImportMeta: boolean;
  supportsProcessEnv: boolean;
  permissions?: {
    env: boolean;
    read?: boolean;
    write?: boolean;
  };
}

/**
 * Get detailed runtime information
 */
function getRuntimeInfo(): RuntimeInfo | undefined {
  const runtime = detectRuntime();
  if (!runtime) return undefined;

  const info: RuntimeInfo = {
    name: runtime,
    supportsImportMeta: typeof (globalThis as any).import?.meta !== "undefined",
    supportsProcessEnv: typeof (globalThis as any).process?.env === "object",
  };

  switch (runtime) {
    case "node":
      info.version = (globalThis as any).process?.version;
      info.platform = (globalThis as any).process?.platform;
      info.permissions = { env: true };
      break;

    // deno-lint-ignore no-case-declarations
    case "deno":
      info.version = (globalThis as any).Deno?.version?.deno;
      info.platform = (globalThis as any).Deno?.build?.os;
      // Check Deno permissions
      const denoPermissions = (globalThis as any).Deno?.permissions;
      if (denoPermissions) {
        try {
          info.permissions = {
            env: true, // We'll assume env access since we're using Deno.env
          };
        } catch {
          info.permissions = { env: false };
        }
      }
      break;

    case "bun":
      info.version = (globalThis as any).Bun?.version;
      info.platform = (globalThis as any).process?.platform;
      info.permissions = { env: true };
      break;
  }

  return info;
}

/**
 * # Environment (ENV) Manager
 * #### A cross-runtime environment variable management system for JavaScript applications
 *
 * The Environment Manager is like a universal translator for your application's settings. Think of it
 * as a helpful assistant that can read configuration values (environment variables) across different
 * JavaScript environments (Node.js, Deno, or Bun), making sure your app has all the settings it needs
 * to run properly.
 *
 * @since 0.0.1
 * @category InSpatial Run
 * @module @inspatial/env
 * @access public
 *
 * ### 💡 Core Concepts
 * - Environment variables are like configuration settings for your app
 * - Cross-runtime support means your code works everywhere
 * - Type-safe configuration with built-in validation
 * - Helpful error reporting when required settings are missing
 *
 * ### 📚 Terminology
 * > **Runtime**: The environment where your JavaScript code runs (Node.js, Deno, or Bun)
 * > **Environment Variables**: Configuration values stored outside your code
 *
 * ### 📝 Type Definitions
 * ```typescript
 * type Runtime = "deno" | "node" | "bun";
 *
 * interface EnvConfig<T = string> {
 *   key: string;           // The name of the environment variable
 *   required?: boolean;    // Whether the variable must be present
 *   default?: T;          // A fallback value if not found
 *   transform?: (value: string) => T;  // Convert the value to another type
 * }
 * ```
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@inspatial/env
 *
 * # npm
 * npm install @inspatial/env
 * ```
 *
 * #### Examples
 * @example
 * ### Example 1: Basic Usage
 * ```typescript
 * import { env } from '@inspatial/env';
 *
 * // Read a simple environment variable
 * const apiKey = env.get('API_KEY');
 *
 * // Read with a default value
 * const port = env.get('PORT', '3000');
 * ```
 *
 * @example
 * ### Example 2: Type-Safe Configuration
 * ```typescript
 * import { env } from '@inspatial/env';
 *
 * // Get a number value
 * const port = env.getEnv({
 *   key: 'PORT',
 *   default: '3000',
 *   transform: (value) => parseInt(value, 10)
 * });
 *
 * // Required values with validation
 * const apiKey = env.getEnv({
 *   key: 'API_KEY',
 *   required: true
 * });
 *
 * // Check for any missing required variables
 * env.assertAndThrow();
 * ```
 *
 * ### ⚡ Performance Tips
 * - Use `getEnv` with configuration options for better type safety
 * - Clear missing variables when reusing the EnvManager instance
 * - Cache frequently accessed values instead of reading repeatedly
 *
 * ### ❌ Common Mistakes
 * - Forgetting to check for required variables with `assertAndThrow()`
 * - Not providing default values for optional variables
 * - Incorrect type transformations
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * @throws {EnvironmentVariableError}
 * Occurs when required environment variables are missing
 */
export class EnvManager {
  private readonly provider: EnvironmentProvider;
  private readonly missingVars = new Set<string>();
  private readonly cache = new Map<string, string | undefined>();
  private cacheEnabled = true;
  private readonly runtimeInfo: RuntimeInfo | undefined;

  constructor(runtime?: Runtime) {
    const detectedRuntime = runtime ?? detectRuntime();
    // Always default to browser if runtime detection fails
    const finalRuntime = detectedRuntime || "browser";
    this.provider = runtimeProviders[finalRuntime]();
    this.runtimeInfo = getRuntimeInfo();
  }

  /**
   * Enable or disable caching
   *
   * @param enabled - Whether to enable caching
   *
   * @example
   * ```ts
   * env.setCaching(false); // Disable caching for testing
   * env.setCaching(true);  // Re-enable caching
   * ```
   */
  setCaching(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  /**
   * Clear the environment variable cache
   *
   * @example
   * ```ts
   * env.clearCache(); // Force re-read of all env vars
   * ```
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Preload multiple environment variables into cache
   *
   * @param keys - Array of environment variable keys to preload
   *
   * @example
   * ```ts
   * // Preload commonly used variables
   * env.preload(['NODE_ENV', 'PORT', 'API_KEY', 'DATABASE_URL']);
   * ```
   */
  preload(keys: string[]): void {
    for (const key of keys) {
      if (!this.cache.has(key)) {
        const value = this.provider.get(key);
        this.cache.set(key, value);
      }
    }
  }

  /**
   * Get an environment variable (with caching)
   *
   * @example
   * ```ts
   * env.get('FOO'); // 'bar'
   * env.get('FOO', 'default'); // 'bar'
   * env.get('BAR'); // undefined
   * env.get('BAR', 'default'); // 'default'
   * ```
   */
  get(key: string, defaultValue?: string): string | undefined {
    let value: string | undefined;

    // Check cache first if enabled
    if (this.cacheEnabled && this.cache.has(key)) {
      value = this.cache.get(key);
    } else {
      // Read from provider and cache if enabled
      value = this.provider.get(key);
      if (this.cacheEnabled) {
        this.cache.set(key, value);
      }
    }

    if (value === undefined) {
      if (defaultValue === undefined) {
        this.missingVars.add(key);
        return undefined;
      }
      return defaultValue;
    }

    return value;
  }

  /**
   * Get an environment variable with configuration options
   *
   * @example
   * ```ts
   * // Required string
   * const apiKey = getEnv({ key: 'API_KEY', required: true });
   *
   * // Optional with default
   * const port = getEnv({ key: 'PORT', default: '3000' });
   *
   * // With transformation
   * const port = getEnv({
   *   key: 'PORT',
   *   default: '3000',
   *   transform: (value) => parseInt(value, 10)
   * });
   * ```
   */
  getEnv<T = string>(config: EnvConfig<T>): T | undefined {
    const value = this.provider.get(config.key);

    if (value === undefined) {
      if (config.required) {
        this.missingVars.add(config.key);
      }
      return config.default as T | undefined;
    }

    if (config.transform) {
      return config.transform(value);
    }

    return value as unknown as T;
  }

  /**
   * Check if any required environment variables are missing
   * Enhanced with helpful error messages and suggestions
   */
  assertAndThrow(): void {
    if (this.missingVars.size === 0) return;

    const report = this.getValidationReport();
    let errorMessage = report.summary + "\n\n";

    errorMessage += "Missing variables:\n";
    for (const missing of report.missing) {
      errorMessage += `  • ${missing}\n`;
    }

    if (report.suggestions.length > 0) {
      errorMessage += "\nSuggestions:\n";
      for (const suggestion of report.suggestions) {
        errorMessage += `  💡 ${suggestion}\n`;
      }
    }

    errorMessage +=
      "\nℹ️  Use env.debug() to see all available environment variables";

    const error = new EnvironmentVariableError(this.missingVars);
    error.message = errorMessage;
    throw error;
  }

  /**
   * Get all missing environment variables
   */
  get missingEnvironmentVariables(): ReadonlySet<string> {
    return this.missingVars;
  }

  /**
   * Clear the list of missing environment variables
   */
  clearMissingVariables(): void {
    this.missingVars.clear();
  }

  /**
   * Check if the current environment is production
   *
   * @example
   * ```ts
   * if (env.isProduction()) {
   *   console.log('Running in production mode');
   * }
   * ```
   */
  isProduction(): boolean {
    // Check multiple sources for production indicators
    const nodeEnv = this.get("NODE_ENV");
    const viteMode = this.get("MODE");
    const denoEnv = this.get("DENO_ENV");

    // Handle import.meta.env in browser/vite environments  
    // Check for PROD first (explicit production flag)
    const importMetaProd = this.get("PROD");
    if (importMetaProd === "true") {
      return true;
    }
    
    // Check for DEV (explicit development flag)
    const importMetaDev = this.get("DEV");
    if (importMetaDev === "true") {
      return false;
    }

    // Check explicit production settings
    if (nodeEnv === "production" || viteMode === "production" || denoEnv === "production") {
      return true;
    }

    // Check explicit non-production settings
    if (nodeEnv === "development" || viteMode === "development" || denoEnv === "development") {
      return false;
    }
    if (nodeEnv === "test" || viteMode === "test" || denoEnv === "test") {
      return false;
    }

    // For browser environments with no explicit settings, default to development
    // This is safer for hot reload and development features
    if (this.runtimeInfo?.name === "browser") {
      return false;
    }

    // For server environments with no explicit settings, default to production
    return true;
  }

  /**
   * Check if the current environment is development
   *
   * @example
   * ```ts
   * if (env.isDevelopment()) {
   *   console.log('Running in development mode');
   * }
   * ```
   */
  isDevelopment(): boolean {
    // If explicitly production, return false
    if (this.isProduction()) return false;

    const nodeEnv = this.get("NODE_ENV");
    const viteMode = this.get("MODE");
    const denoEnv = this.get("DENO_ENV");

    // Handle import.meta.env in browser/vite environments
    const importMetaEnv =
      typeof globalThis !== "undefined" &&
      (globalThis as any).import?.meta?.env?.DEV;

    return (
      importMetaEnv === true ||
      nodeEnv === "development" ||
      viteMode === "development" ||
      denoEnv === "development" ||
      // Default to development if no explicit mode is set
      (!nodeEnv && !viteMode && !denoEnv && !importMetaEnv)
    );
  }

  /**
   * Check if the current environment is test
   *
   * @example
   * ```ts
   * if (env.isTest()) {
   *   console.log('Running in test mode');
   * }
   * ```
   */
  isTest(): boolean {
    const nodeEnv = this.get("NODE_ENV");
    const viteMode = this.get("MODE");
    const denoEnv = this.get("DENO_ENV");

    return nodeEnv === "test" || viteMode === "test" || denoEnv === "test";
  }

  /**
   * Get the current environment mode
   *
   * @returns The current mode: 'production', 'development', or 'test'
   *
   * @example
   * ```ts
   * const mode = env.getMode();
   * console.log(`Running in ${mode} mode`);
   * ```
   */
  getMode(): "production" | "development" | "test" {
    if (this.isTest()) return "test";
    if (this.isProduction()) return "production";
    return "development";
  }

  /**
   * Get an environment variable as a boolean
   *
   * @param key - Environment variable name
   * @param defaultValue - Default value if not found
   * @returns Boolean value or undefined
   *
   * @example
   * ```ts
   * const debug = env.getBool('DEBUG_MODE', false);
   * const enabled = env.getBool('FEATURE_ENABLED'); // undefined if not set
   * ```
   */
  getBool(key: string, defaultValue?: boolean): boolean | undefined {
    const value = this.get(key);

    if (value === undefined) {
      return defaultValue;
    }

    // Handle common boolean representations
    const normalized = value.toLowerCase().trim();
    if (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "on"
    ) {
      return true;
    }
    if (
      normalized === "false" ||
      normalized === "0" ||
      normalized === "no" ||
      normalized === "off" ||
      normalized === ""
    ) {
      return false;
    }

    // If value exists but isn't a recognized boolean, treat as truthy
    return Boolean(value);
  }

  /**
   * Get an environment variable as an integer
   *
   * @param key - Environment variable name
   * @param defaultValue - Default value if not found or invalid
   * @returns Integer value or undefined
   *
   * @example
   * ```ts
   * const port = env.getInt('PORT', 3000);
   * const timeout = env.getInt('TIMEOUT_MS'); // undefined if not set
   * ```
   */
  getInt(key: string, defaultValue?: number): number | undefined {
    const value = this.get(key);

    if (value === undefined) {
      return defaultValue;
    }

    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get an environment variable as a float
   *
   * @param key - Environment variable name
   * @param defaultValue - Default value if not found or invalid
   * @returns Float value or undefined
   *
   * @example
   * ```ts
   * const rate = env.getFloat('RATE_LIMIT', 1.5);
   * const ratio = env.getFloat('ASPECT_RATIO'); // undefined if not set
   * ```
   */
  getFloat(key: string, defaultValue?: number): number | undefined {
    const value = this.get(key);

    if (value === undefined) {
      return defaultValue;
    }

    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get an environment variable as an array
   *
   * @param key - Environment variable name
   * @param defaultValue - Default value if not found
   * @param separator - Separator to split on (default: ',')
   * @returns Array of strings or undefined
   *
   * @example
   * ```ts
   * const hosts = env.getArray('ALLOWED_HOSTS', ['localhost']);
   * const tags = env.getArray('TAGS', [], '|'); // Custom separator
   * ```
   */
  getArray(
    key: string,
    defaultValue?: string[],
    separator: string = ","
  ): string[] | undefined {
    const value = this.get(key);

    if (value === undefined) {
      return defaultValue;
    }

    if (value.trim() === "") {
      return [];
    }

    return value
      .split(separator)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * Get an environment variable as parsed JSON
   *
   * @param key - Environment variable name
   * @param defaultValue - Default value if not found or invalid JSON
   * @returns Parsed JSON value or undefined
   *
   * @example
   * ```ts
   * const config = env.getJson<{api: string}>('CONFIG', {api: 'default'});
   * const settings = env.getJson('SETTINGS'); // undefined if not set or invalid
   * ```
   */
  getJson<T = any>(key: string, defaultValue?: T): T | undefined {
    const value = this.get(key);

    if (value === undefined) {
      return defaultValue;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Get an environment variable as a URL
   *
   * @param key - Environment variable name
   * @param defaultValue - Default value if not found or invalid URL
   * @returns URL object or undefined
   *
   * @example
   * ```ts
   * const apiUrl = env.getUrl('API_URL', new URL('http://localhost:3000'));
   * const dbUrl = env.getUrl('DATABASE_URL'); // undefined if not set or invalid
   * ```
   */
  getUrl(key: string, defaultValue?: URL): URL | undefined {
    const value = this.get(key);

    if (value === undefined) {
      return defaultValue;
    }

    try {
      return new URL(value);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Built-in validators for common patterns
   */
  static validators = {
    email: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    url: (value: string): boolean => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    https: (value: string): boolean => {
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    },
    ip: (value: string): boolean =>
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        value
      ),
    port: (value: number): boolean =>
      Number.isInteger(value) && value >= 1 && value <= 65535,
    positive: (value: number): boolean => value > 0,
    nonNegative: (value: number): boolean => value >= 0,
  };

  /**
   * Get an environment variable with validation constraints
   *
   * @param config - Configuration with validation constraints
   * @returns Validated value or undefined
   *
   * @example
   * ```ts
   * // Validate port range
   * const port = env.getValidated({
   *   key: 'PORT',
   *   transform: (v) => parseInt(v, 10),
   *   default: 3000,
   *   constraints: { min: 1000, max: 65535 }
   * });
   *
   * // Validate email format
   * const email = env.getValidated({
   *   key: 'ADMIN_EMAIL',
   *   required: true,
   *   constraints: { validate: EnvManager.validators.email }
   * });
   * ```
   */
  getValidated<T = string>(config: EnvConfigWithValidation<T>): T | undefined {
    const value = this.getEnv(config);

    if (value === undefined) {
      return value;
    }

    const { constraints } = config;
    if (!constraints) {
      return value;
    }

    // Validate numeric constraints
    if (typeof value === "number") {
      if (constraints.min !== undefined && value < constraints.min) {
        this.missingVars.add(`${config.key} (min: ${constraints.min})`);
        return config.default as T | undefined;
      }
      if (constraints.max !== undefined && value > constraints.max) {
        this.missingVars.add(`${config.key} (max: ${constraints.max})`);
        return config.default as T | undefined;
      }
    }

    // Validate pattern
    if (
      constraints.pattern &&
      typeof value === "string" &&
      !constraints.pattern.test(value)
    ) {
      this.missingVars.add(`${config.key} (pattern mismatch)`);
      return config.default as T | undefined;
    }

    // Validate enum
    if (constraints.enum && !constraints.enum.includes(value as string)) {
      this.missingVars.add(
        `${config.key} (allowed: ${constraints.enum.join(", ")})`
      );
      return config.default as T | undefined;
    }

    // Custom validation
    if (constraints.validate && !constraints.validate(value)) {
      this.missingVars.add(`${config.key} (validation failed)`);
      return config.default as T | undefined;
    }

    return value;
  }

  /**
   * Enhanced convenience methods with validation
   */

  /**
   * Get an integer with range validation
   */
  getIntValidated(
    key: string,
    defaultValue?: number,
    constraints?: Pick<ValidationConstraints, "min" | "max">
  ): number | undefined {
    return this.getValidated({
      key,
      transform: (v) => parseInt(v, 10),
      default: defaultValue,
      constraints,
    });
  }

  /**
   * Get a float with range validation
   */
  getFloatValidated(
    key: string,
    defaultValue?: number,
    constraints?: Pick<ValidationConstraints, "min" | "max">
  ): number | undefined {
    return this.getValidated({
      key,
      transform: (v) => parseFloat(v),
      default: defaultValue,
      constraints,
    });
  }

  /**
   * Get a string with pattern or enum validation
   */
  getStringValidated(
    key: string,
    defaultValue?: string,
    constraints?: Pick<ValidationConstraints, "pattern" | "enum" | "validate">
  ): string | undefined {
    return this.getValidated({
      key,
      default: defaultValue,
      constraints,
    });
  }

  /**
   * Get information about the current JavaScript runtime
   *
   * @returns Runtime information object
   *
   * @example
   * ```ts
   * const runtime = env.getRuntime();
   * console.log(`Running on ${runtime.name} ${runtime.version}`);
   * console.log(`Supports import.meta: ${runtime.supportsImportMeta}`);
   * ```
   */
  getRuntime(): RuntimeInfo | undefined {
    return this.runtimeInfo;
  }

  /**
   * Check if running in a specific runtime
   *
   * @param runtime - Runtime name to check
   * @returns Whether currently running in the specified runtime
   *
   * @example
   * ```ts
   * if (env.isRuntime('deno')) {
   *   console.log('Running in Deno!');
   * }
   * ```
   */
  isRuntime(runtime: Runtime): boolean {
    return this.runtimeInfo?.name === runtime;
  }

  /**
   * Get environment variable with runtime-aware fallbacks
   * This method intelligently checks import.meta.env, process.env, etc.
   * based on the current runtime
   *
   * @param key - Environment variable name
   * @param defaultValue - Default value if not found
   * @returns Environment variable value with runtime fallbacks
   *
   * @example
   * ```ts
   * // Checks import.meta.env.VITE_API_URL, then process.env.VITE_API_URL, etc.
   * const apiUrl = env.getRuntimeAware('VITE_API_URL');
   * ```
   */
  getRuntimeAware(key: string, defaultValue?: string): string | undefined {
    let value: string | undefined;

    // Try import.meta.env first (for Vite/build tools)
    if (this.runtimeInfo?.supportsImportMeta) {
      try {
        const importMetaEnv = (globalThis as any).import?.meta?.env;
        if (importMetaEnv && key in importMetaEnv) {
          value = importMetaEnv[key];
        }
      } catch {
        // Ignore import.meta access errors
      }
    }

    // Fallback to regular environment variable access
    if (value === undefined) {
      value = this.get(key);
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get cache statistics and information
   *
   * @returns Object with cache information
   *
   * @example
   * ```ts
   * const stats = env.getCacheInfo();
   * console.log(`Cache has ${stats.size} entries, enabled: ${stats.enabled}`);
   * ```
   */
  getCacheInfo(): { enabled: boolean; size: number; keys: string[] } {
    return {
      enabled: this.cacheEnabled,
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if a key is cached
   *
   * @param key - Environment variable key
   * @returns Whether the key is in cache
   */
  isCached(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Load multiple environment variables based on a configuration schema
   *
   * @param schema - Object defining the configuration structure
   * @returns Object with loaded and validated configuration values
   *
   * @example
   * ```ts
   * const config = env.loadConfig({
   *   port: {
   *     key: 'PORT',
   *     transform: (v) => parseInt(v, 10),
   *     default: 3000,
   *     constraints: { min: 1000, max: 65535 }
   *   },
   *   apiKey: {
   *     key: 'API_KEY',
   *     required: true
   *   },
   *   debug: {
   *     key: 'DEBUG_MODE',
   *     transform: (v) => v.toLowerCase() === 'true',
   *     default: false
   *   },
   *   allowedHosts: {
   *     key: 'ALLOWED_HOSTS',
   *     transform: (v) => v.split(',').map(h => h.trim()),
   *     default: ['localhost']
   *   }
   * });
   *
   * console.log(config.port);         // number
   * console.log(config.apiKey);       // string
   * console.log(config.debug);        // boolean
   * console.log(config.allowedHosts); // string[]
   * ```
   */
  loadConfig<T extends ConfigSchema>(schema: T): ConfigResult<T> {
    const result = {} as ConfigResult<T>;

    for (const [configKey, envConfig] of Object.entries(schema)) {
      if (envConfig.constraints) {
        // Use validated method if constraints are specified
        result[configKey as keyof T] = this.getValidated(envConfig) as any;
      } else {
        // Use regular method
        result[configKey as keyof T] = this.getEnv(envConfig) as any;
      }
    }

    return result;
  }

  /**
   * Load configuration with automatic preloading of all required keys
   *
   * @param schema - Configuration schema
   * @returns Loaded configuration object
   *
   * @example
   * ```ts
   * // Automatically preloads all keys for better performance
   * const config = env.loadConfigWithPreload({
   *   database: { key: 'DATABASE_URL', required: true },
   *   redis: { key: 'REDIS_URL', required: true },
   *   port: { key: 'PORT', transform: (v) => parseInt(v), default: 3000 }
   * });
   * ```
   */
  loadConfigWithPreload<T extends ConfigSchema>(schema: T): ConfigResult<T> {
    // Extract all environment variable keys
    const keys = Object.values(schema).map((config) => config.key);

    // Preload all keys
    this.preload(keys);

    // Load configuration
    return this.loadConfig(schema);
  }

  /**
   * Debug: Log all environment variables and their sources
   *
   * @param filter - Optional filter to only show variables matching pattern
   *
   * @example
   * ```ts
   * env.debug(); // Log all variables
   * env.debug(/^API_/); // Log only variables starting with API_
   * ```
   */
  debug(filter?: RegExp): void {
    const runtime = this.getRuntime();
    console.group(
      `🔧 Environment Debug Info - ${runtime?.name || "unknown"} ${
        runtime?.version || ""
      }`
    );

    console.log("📊 Runtime Info:", {
      name: runtime?.name,
      version: runtime?.version,
      platform: runtime?.platform,
      supportsImportMeta: runtime?.supportsImportMeta,
      supportsProcessEnv: runtime?.supportsProcessEnv,
    });

    console.log("💾 Cache Info:", this.getCacheInfo());

    console.log("🌍 Environment Variables:");

    // Get all environment variables
    const allVars = new Map<
      string,
      { value: string | undefined; source: string }
    >();

    // Check process.env if available
    if (runtime?.supportsProcessEnv) {
      const processEnv = (globalThis as any).process?.env || {};
      for (const [key, value] of Object.entries(processEnv)) {
        if (!filter || filter.test(key)) {
          allVars.set(key, { value: value as string, source: "process.env" });
        }
      }
    }

    // Check import.meta.env if available
    if (runtime?.supportsImportMeta) {
      try {
        const importMetaEnv = (globalThis as any).import?.meta?.env || {};
        for (const [key, value] of Object.entries(importMetaEnv)) {
          if (!filter || filter.test(key)) {
            const existing = allVars.get(key);
            if (existing) {
              allVars.set(key, {
                value: value as string,
                source: `${existing.source}, import.meta.env`,
              });
            } else {
              allVars.set(key, {
                value: value as string,
                source: "import.meta.env",
              });
            }
          }
        }
      } catch {
        // Ignore import.meta access errors
      }
    }

    // Sort and display
    const sortedVars = Array.from(allVars.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    for (const [key, { value, source }] of sortedVars) {
      const displayValue =
        value && value.length > 50 ? `${value.substring(0, 47)}...` : value;
      console.log(`  ${key}: "${displayValue}" (${source})`);
    }

    if (this.missingVars.size > 0) {
      console.log(
        "❌ Missing Required Variables:",
        Array.from(this.missingVars)
      );
    }

    console.groupEnd();
  }

  /**
   * Get a validation report instead of throwing errors
   *
   * @returns Validation report with missing variables and suggestions
   *
   * @example
   * ```ts
   * const report = env.getValidationReport();
   * if (!report.isValid) {
   *   console.log('Missing variables:', report.missing);
   *   console.log('Suggestions:', report.suggestions);
   * }
   * ```
   */
  getValidationReport(): {
    isValid: boolean;
    missing: string[];
    suggestions: string[];
    summary: string;
  } {
    const missing = Array.from(this.missingVars);
    const suggestions: string[] = [];

    // Generate suggestions for common typos and patterns
    for (const missingVar of missing) {
      const cleanVar = missingVar.replace(/ \(.*\)$/, ""); // Remove validation constraints

      // Common suggestions
      if (cleanVar.includes("_")) {
        const camelCase = cleanVar
          .split("_")
          .map((word, i) =>
            i === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("");
        suggestions.push(`Try "${camelCase}" instead of "${cleanVar}"`);
      }

      if (cleanVar.toUpperCase() !== cleanVar) {
        suggestions.push(
          `Try "${cleanVar.toUpperCase()}" (uppercase) instead of "${cleanVar}"`
        );
      }

      // Common env var suggestions
      const commonVars = [
        "NODE_ENV",
        "PORT",
        "HOST",
        "DATABASE_URL",
        "API_KEY",
        "DEBUG",
      ];
      const similar = commonVars.find(
        (common) =>
          common.toLowerCase().includes(cleanVar.toLowerCase()) ||
          cleanVar.toLowerCase().includes(common.toLowerCase())
      );
      if (similar) {
        suggestions.push(`Did you mean "${similar}"?`);
      }

      // Suggest checking .env files
      if (!this.get(cleanVar)) {
        suggestions.push(`Check if "${cleanVar}" is defined in your .env file`);
      }
    }

    const isValid = missing.length === 0;
    const summary = isValid
      ? "✅ All environment variables are valid"
      : `❌ ${missing.length} required environment variable${
          missing.length === 1 ? "" : "s"
        } missing`;

    return {
      isValid,
      missing,
      suggestions: [...new Set(suggestions)], // Remove duplicates
      summary,
    };
  }
}

/**
 * # Environment (ENV) Variable
 * #### A pre-configured environment variable manager ready for immediate use
 *
 * The `env` constant gives you a ready-to-use environment manager. Think of it like having a
 * personal assistant already hired and trained to help you access your application's settings.
 *
 * @since 0.0.1
 * @category InSpatial Run
 * @module @inspatial/env
 * @kind constant
 * @access public
 *
 * ### 💡 Core Concepts
 * - Pre-configured instance for immediate use
 * - Automatically detects your JavaScript runtime
 * - Shared instance across your application
 *
 * ### 📚 Terminology
 * > **Singleton**: A design pattern where only one instance of something exists in your entire
 *   application - like having just one settings manager for your whole app
 *
 * ### 🎮 Usage
 *
 * @example
 * ### Example 1: Quick Access to Environment Variables
 * ```typescript
 * import { env } from '@inspatial/env';
 *
 * // Read a simple configuration value
 * const serverUrl = env.get('SERVER_URL');
 *
 * // Use it in your application
 * console.log(`Connecting to: ${serverUrl}`);
 * ```
 *
 * @example
 * ### Example 2: Type-Safe Configuration with Validation
 * ```typescript
 * import { env } from '@inspatial/env';
 *
 * // Get and validate multiple settings at once
 * const port = env.getEnv({
 *   key: 'PORT',
 *   transform: (v) => parseInt(v, 10),
 *   default: 3000
 * });
 *
 * const apiKey = env.getEnv({
 *   key: 'API_KEY',
 *   required: true
 * });
 *
 * // Check if all required variables are present
 * env.assertAndThrow();
 * ```
 *
 * ### ❌ Common Mistakes
 * - Trying to create multiple instances instead of using this shared one
 * - Forgetting to call assertAndThrow() after checking required variables
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 */
export const env: EnvManager = new EnvManager();

/**
 * # GetEnv
 * #### A friendly helper function that fetches environment variables with type safety
 *
 * The `getEnv` function is like a personal assistant that helps you retrieve configuration settings
 * (environment variables) from your system. Think of it like looking up a contact in your phone book -
 * you provide the name (key) and some preferences (config), and it returns the information you need.
 *
 * @since 0.0.1
 * @category InSpatial Run
 * @module @inspatial/env
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Simple wrapper around the default environment manager
 * - Type-safe environment variable access
 * - Optional value transformation
 * - Default value support
 *
 * ### 📚 Terminology
 * > **Environment Variable**: A configuration setting stored outside your code, like a system-wide
 *   setting on your computer
 * > **Type Safety**: Making sure your data is in the correct format (like making sure a number is
 *   actually a number)
 *
 * ### 📝 Type Definitions
 * ```typescript
 * interface EnvConfig<T = string> {
 *   key: string;           // The name of your environment variable
 *   required?: boolean;    // Is this setting mandatory?
 *   default?: T;          // Fallback value if not found
 *   transform?: (value: string) => T;  // Convert the value to another type
 * }
 * ```
 *
 * @typeParam T - The type you want your environment variable converted to (defaults to string)
 *
 * @param {EnvConfig<T>} config - Specifies how to fetch and process your environment variable
 *    Think of this as your "instructions" for getting the value:
 *    - What variable to look for (key)
 *    - Whether it's required
 *    - What to use if it's not found (default)
 *    - How to convert it to the right type (transform)
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@inspatial/env
 *
 * # npm
 * npm install @inspatial/env
 * ```
 *
 * @example
 * ### Example 1: Basic String Value
 * ```typescript
 * import { getEnv } from '@inspatial/env';
 *
 * // Get a simple API key
 * const apiKey = getEnv({
 *   key: 'API_KEY',
 *   required: true
 * });
 *
 * // Use the API key
 * console.log(apiKey); // Output: "your-api-key-value"
 * ```
 *
 * @example
 * ### Example 2: Number with Default Value
 * ```typescript
 * import { getEnv } from '@inspatial/env';
 *
 * // Get server port, converting it to a number
 * const port = getEnv({
 *   key: 'PORT',
 *   default: '3000',
 *   transform: (value) => parseInt(value, 10)
 * });
 *
 * console.log(port); // Output: 3000 (as a number)
 * ```
 *
 * @example
 * ### Example 3: Boolean Configuration
 * ```typescript
 * import { getEnv } from '@inspatial/env';
 *
 * // Check if we're in debug mode
 * const isDebug = getEnv({
 *   key: 'DEBUG_MODE',
 *   default: 'false',
 *   transform: (value) => value.toLowerCase() === 'true'
 * });
 *
 * if (isDebug) {
 *   console.log('Debug mode is enabled');
 * }
 * ```
 *
 * ### ❌ Common Mistakes
 * - Forgetting to handle undefined returns for non-required variables
 * - Not providing a default value for optional settings
 * - Using incorrect transform functions for type conversion
 *
 * @returns {T | undefined}
 * Returns either:
 * - The environment variable value (converted to type T if transform is provided)
 * - The default value if specified and the variable isn't found
 * - undefined if the variable isn't found and no default is provided
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 */
export function getEnv<T = string>(config: EnvConfig<T>): T | undefined {
  return env.getEnv(config);
}

export default env;
