

/**
 * Extension System for InSpatial Type
 * 
 * This module provides a pluggable extension system for adding custom 
 * validation rules and keywords to InSpatial Type. The extension system
 * allows you to create reusable validation patterns and integrate them
 * seamlessly with the type validation system.
 * 
 * Key features:
 * - Register custom validation rules
 * - Add new keywords to the type system
 * - Share validations across your application
 * - Extend the core type system without modifying it
 * 
 * @example
 * ```typescript
 * // Register a built-in extension
 * registerTypeExtension(emailTypeExtension());
 * 
 * // Create and register a custom validator
 * const urlValidator = {
 *   name: "url",
 *   description: "Validates URLs",
 *   keywords: ["url"],
 *   validate: (value) => {
 *     if (typeof value !== "string") {
 *       return { valid: false, message: "URL must be a string" };
 *     }
 *     try {
 *       new URL(value);
 *       return value;
 *     } catch {
 *       return { valid: false, message: "Invalid URL format" };
 *     }
 *   }
 * };
 * 
 * registerTypeExtension(urlValidator);
 * 
 * // Use in validation
 * const result = validateTypeExtension("url", "https://xr.new");
 * ```
 */

/**
 * Options for type validation
 * 
 * Configuration options for customizing validation behavior.
 */
export interface InTypeValidationOptions {
  /** Whether to return detailed error messages */
  detailed?: boolean;

  /** Maximum number of errors to collect */
  maxErrors?: number;

  /** Custom error messages */
  messages?: Record<string, string>;

  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Result of type validation
 * 
 * The standardized format for validation results, including
 * success or failure information and error details.
 */
export interface InTypeValidationResult<T = any> {
  /** Whether validation was successful */
  valid: boolean;

  /** Validated and possibly transformed value */
  value?: T;

  /** Error message if validation failed */
  message?: string;

  /** Detailed error information */
  errors?: Array<{
    path?: string | string[];
    code?: string;
    message: string;
    expected?: string;
    actual?: string;
  }>;
}

/**
 * Interface for validation extensions
 * 
 * The contract that all validation extensions must implement.
 * This ensures consistent behavior across different validators.
 */
export interface InTypeValidationExtension {
  /** Name of the extension */
  name: string;

  /** Description of what the extension does */
  description: string;

  /** Keywords this extension provides */
  keywords: string[];

  /**
   * Validation function
   * @param value The value to validate
   * @param options Any options for the validation
   * @returns Valid value or error object
   */
  validate: (
    value: any,
    options?: InTypeValidationOptions
  ) => InTypeValidationResult | any;
}

/**
 * InTypeExtension - Registry for validation extensions
 * 
 * A singleton registry that manages all validation extensions.
 * This class provides methods for registering, retrieving, and
 * managing extensions and their keywords.
 */
export class InTypeExtension {
  private static instance: InTypeExtension;
  private extensions: Map<string, InTypeValidationExtension>;
  private keywordMap: Map<string, InTypeValidationExtension>;

  private constructor() {
    this.extensions = new Map();
    this.keywordMap = new Map();
  }

  /**
   * Get the Extension instance
   * 
   * Follows the singleton pattern to ensure a single shared registry
   * across the application.
   * 
   * @returns The InTypeExtension singleton instance
   */
  public static init(): InTypeExtension {
    if (!InTypeExtension.instance) {
      InTypeExtension.instance = new InTypeExtension();
    }
    return InTypeExtension.instance;
  }

  /**
   * Register a validation extension
   * 
   * Adds a new validation extension to the registry and maps its
   * keywords for lookup. Throws an error if the extension name or
   * any of its keywords are already registered.
   * 
   * @param extension The extension to register
   * @throws Error if the extension or keywords already exist
   */
  public register(extension: InTypeValidationExtension): void {
    if (this.extensions.has(extension.name)) {
      throw new Error(`Extension "${extension.name}" is already registered`);
    }

    this.extensions.set(extension.name, extension);

    // Map keywords to this extension
    for (const keyword of extension.keywords) {
      if (this.keywordMap.has(keyword)) {
        throw new Error(
          `Keyword "${keyword}" is already registered by extension "${
            this.keywordMap.get(keyword)?.name
          }"`
        );
      }

      this.keywordMap.set(keyword, extension);
    }
  }

  /**
   * Get an extension by name
   * 
   * Retrieves a registered extension by its name.
   * 
   * @param name Extension name
   * @returns The extension or undefined if not found
   */
  public getExtension(name: string): InTypeValidationExtension | undefined {
    return this.extensions.get(name);
  }

  /**
   * Get an extension by keyword
   * 
   * Finds the extension that registered a particular keyword.
   * 
   * @param keyword Keyword to look up
   * @returns The extension or undefined if not found
   */
  public getExtensionByKeyword(
    keyword: string
  ): InTypeValidationExtension | undefined {
    return this.keywordMap.get(keyword);
  }

  /**
   * Check if a keyword is registered
   * 
   * Tests whether a keyword is available for validation.
   * 
   * @param keyword Keyword to check
   * @returns True if the keyword is registered
   */
  public hasKeyword(keyword: string): boolean {
    return this.keywordMap.has(keyword);
  }

  /**
   * List all registered extensions
   * 
   * Returns an array of all registered extensions.
   * 
   * @returns Array of validation extensions
   */
  public listExtensions(): InTypeValidationExtension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * List all registered keywords
   * 
   * Returns an array of all registered keywords across all extensions.
   * 
   * @returns Array of validation keywords
   */
  public listKeywords(): string[] {
    return Array.from(this.keywordMap.keys());
  }

  /**
   * Unregister an extension
   * 
   * Removes an extension and all its keywords from the registry.
   * 
   * @param name Extension name
   * @returns True if the extension was found and removed
   */
  public unregister(name: string): boolean {
    const extension = this.extensions.get(name);

    if (!extension) {
      return false;
    }

    // Remove from extensions map
    this.extensions.delete(name);

    // Remove keywords
    for (const keyword of extension.keywords) {
      this.keywordMap.delete(keyword);
    }

    return true;
  }

  /**
   * Validate a value using a registered keyword
   * 
   * Finds the extension for the given keyword and uses it
   * to validate the provided value.
   * 
   * @param keyword The keyword to use for validation
   * @param value The value to validate
   * @param options Optional validation options
   * @returns Valid value or error object
   * @throws Error if no extension is registered for the keyword
   */
  public validate(keyword: string, value: any, options?: any): any {
    const extension = this.keywordMap.get(keyword);

    if (!extension) {
      throw new Error(`No extension registered for keyword "${keyword}"`);
    }

    return extension.validate(value, options);
  }
}

/**
 * Create an email validation extension
 * 
 * Built-in extension for validating email addresses.
 * Uses a regex pattern to check if a string is a valid email.
 * 
 * @returns An extension for email validation
 * 
 * @example
 * ```typescript
 * registerTypeExtension(emailTypeExtension());
 * 
 * // Later use it for validation
 * const email = validateTypeExtension("email", "user@example.com");
 * ```
 */
export function emailTypeExtension(): InTypeValidationExtension {
  return {
    name: "email",
    description: "Validates email addresses",
    keywords: ["email"],
    validate(value: any): any {
      if (typeof value !== "string") {
        return {
          valid: false,
          message: "Email must be a string",
        };
      }

      // Simple email regex validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(value)) {
        return {
          valid: false,
          message: "Invalid email format",
        };
      }

      return value;
    },
  };
}

/**
 * Create a URL validation extension
 * 
 * Built-in extension for validating URLs.
 * Uses the URL constructor to verify that a string is a valid URL.
 * 
 * @returns An extension for URL validation
 * 
 * @example
 * ```typescript
 * registerTypeExtension(urlTypeExtension());
 * 
 * // Later use it for validation
 * const url = validateTypeExtension("url", "https://xr.new");
 * ```
 */
export function urlTypeExtension(): InTypeValidationExtension {
  return {
    name: "url",
    description: "Validates URLs",
    keywords: ["url"],
    validate(value: any): any {
      if (typeof value !== "string") {
        return {
          valid: false,
          message: "URL must be a string",
        };
      }

      try {
        // Use URL constructor for validation
        new URL(value);
        return value;
      } catch (_error) {
        return {
          valid: false,
          message: "Invalid URL format",
        };
      }
    },
  };
}

/**
 * Register an extension with the extension registry
 * 
 * Registers a validation extension to make its keywords available
 * for use throughout the application.
 * 
 * @param extension The extension to register
 * @throws Error if the extension or any of its keywords are already registered
 * 
 * @example
 * ```typescript
 * const passwordValidator = {
 *   name: "password",
 *   description: "Validates password strength",
 *   keywords: ["password"],
 *   validate: (value) => {
 *     if (typeof value !== "string") {
 *       return { valid: false, message: "Password must be a string" };
 *     }
 *     
 *     if (value.length < 8) {
 *       return { valid: false, message: "Password must be at least 8 characters" };
 *     }
 *     
 *     return value;
 *   }
 * };
 * 
 * registerTypeExtension(passwordValidator);
 * ```
 */
export function registerTypeExtension(
  extension: InTypeValidationExtension
): void {
  InTypeExtension.init().register(extension);
}

/**
 * Validate using a registered keyword
 * 
 * Validates a value using a registered extension keyword.
 * Returns the validated value on success or an error object on failure.
 * 
 * @param keyword The keyword to use for validation
 * @param value The value to validate
 * @param options Optional validation options
 * @returns Valid value or error object
 * @throws Error if no extension is registered for the keyword
 * 
 * @example
 * ```typescript
 * // Validate an email
 * const validEmail = validateTypeExtension("email", "user@example.com");
 * // Returns: "user@example.com"
 * 
 * const invalidEmail = validateTypeExtension("email", "invalid");
 * // Returns: { valid: false, message: "Invalid email format" }
 * ```
 */
export function validateTypeExtension(
  keyword: string,
  value: any,
  options?: any
): any {
  return InTypeExtension.init().validate(keyword, value, options);
}
