import { type } from "./index.ts";
import { ArkErrors, ArkError } from "npm:arktype@^2.1.10";

/*#############################(Classes)#############################*/
/**
 * TypeErrorsClass - Collection of validation errors with enhanced instanceof checking
 * 
 * This class extends ArkType's error handling to ensure consistent behavior
 * across different validation scenarios. It implements Symbol.hasInstance
 * to enable the instanceof operator to work with various error formats.
 * 
 * When a type validation fails, it returns an instance compatible with this class.
 * The error object contains detailed information about validation failures.
 * 
 * TypeErrors instances are array-like and include:
 * - Individual validation errors for each issue found
 * - Path information showing where each error occurred
 * - Methods to format errors for display or logging
 * 
 * @example
 * ```typescript
 * const UserType = type({
 *   name: "string",
 *   age: "number|>0"
 * });
 * 
 * const result = UserType({ name: 123, age: -5 });
 * 
 * if (result instanceof TypeErrors) {
 *   console.error("Validation failed:", result.summary);
 *   // Outputs: "Validation failed: At path: name - must be a string (was number)"
 * }
 * ```
 */
export class TypeErrorsClass {
  /**
   * Custom instanceof implementation for TypeErrors
   * 
   * This method detects if an object is a validation error by checking
   * for properties that indicate error information. It handles:
   * - Direct instances of ArkErrors
   * - Objects with error-specific properties
   * - Array-like collections of errors
   * - Extension validation results
   * 
   * @param instance - The object to check
   * @returns boolean - True if the object is a validation error
   */
  static [Symbol.hasInstance](instance: any): boolean {
    return Boolean(
      instance &&
        // Direct instanceof check
        (instance instanceof ArkErrors ||
          // Constructor name check
          instance?.constructor?.name === "ArkErrors" ||
          // Check arkKind special property
          instance[" arkKind"] === "errors" ||
          // Array-like with error properties
          (Array.isArray(instance) &&
            ("summary" in instance ||
              "throw" in instance ||
              "count" in instance)) ||
          // Check for general error-like shape
          (typeof instance === "object" &&
            // Has error count or messages property
            ("count" in instance ||
              "messages" in instance ||
              "errors" in instance ||
              // Validation result with error indicator
              ("valid" in instance && instance.valid === false) ||
              // Has summary method or property
              "summary" in instance)))
    );
  }
}

/**
 * TypeErrorClass - Individual validation error with enhanced instanceof checking
 * 
 * This class represents a single validation error that occurred during type checking.
 * It provides detailed information about what went wrong, including:
 * - The validation rule that failed
 * - The path to the invalid value
 * - The expected type or value format
 * - The actual value that was provided
 * 
 * TypeErrorClass implements Symbol.hasInstance to ensure instanceof checks work
 * properly with different error implementations.
 * 
 * @example
 * ```typescript
 * const result = UserType({ name: 123 });
 * 
 * if (result instanceof TypeErrors) {
 *   // Access individual errors
 *   result.forEach(error => {
 *     if (error instanceof TypeError) {
 *       console.error(`${error.path}: ${error.message}`);
 *     }
 *   });
 * }
 * ```
 */
export class TypeErrorClass {
  /**
   * Custom instanceof implementation for TypeError
   * 
   * This method detects if an object is an individual validation error
   * by checking for error-specific properties.
   * 
   * @param instance - The object to check
   * @returns boolean - True if the object is a validation error
   */
  static [Symbol.hasInstance](instance: any): boolean {
    return Boolean(
      instance &&
        // Direct instanceof check
        (instance instanceof ArkError ||
          // Constructor name check
          instance?.constructor?.name === "ArkError" ||
          // Check arkKind special property
          instance[" arkKind"] === "error" ||
          // Common error properties
          (typeof instance === "object" &&
            "code" in instance &&
            "message" in instance) ||
          // Standard error indicators
          (typeof instance === "object" &&
            "name" in instance &&
            "message" in instance))
    );
  }
}

/*#############################(Exports)#############################*/
/**
 * Configure the type.errors property to use our TypeErrorsClass
 * 
 * This ensures that type.errors is available for instanceof checks
 * in a way that's compatible with ArkType's original implementation.
 */
Object.defineProperty(type, "errors", {
  configurable: true,
  enumerable: true,
  get: () => TypeErrorsClass,
});
