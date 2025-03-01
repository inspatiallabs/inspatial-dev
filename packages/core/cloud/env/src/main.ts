/**
 * Supported JavaScript runtimes
 */
type Runtime = "deno" | "node" | "bun";

/**
 * Interface for environment access across different runtimes
 */
interface EnvironmentProvider {
  get(key: string): string | undefined;
}

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
};

/**
 * Detect current runtime
 */
function detectRuntime(): Runtime | undefined {
  if (typeof (globalThis as any).process?.env === "object") return "node";
  if (typeof (globalThis as any).Deno?.env?.get === "function") return "deno";
  if (typeof (globalThis as any).Bun?.env === "object") return "bun";
  return undefined;
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

  constructor(runtime?: Runtime) {
    const detectedRuntime = runtime ?? detectRuntime();
    if (!detectedRuntime) {
      throw new Error("Unsupported JavaScript runtime");
    }
    this.provider = runtimeProviders[detectedRuntime]();
  }

  /**
   * Get an environment variable
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
    const value = this.provider.get(key);

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
   */
  assertAndThrow(): void {
    if (this.missingVars.size === 0) return;
    throw new EnvironmentVariableError(this.missingVars);
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
export const env = new EnvManager();


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
