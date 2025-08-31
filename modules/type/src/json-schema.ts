//TODO: Replace with ArkType new JSON Schema implementation

/**
 * JSON Schema Compatibility for InSpatial Type
 * 
 * This module provides bidirectional conversion between InSpatial Type definitions
 * and JSON Schema. This enables interoperability with other systems and tools
 * that support the JSON Schema standard.
 * 
 * Key features:
 * - Convert InSpatial Type definitions to JSON Schema
 * - Convert JSON Schema to InSpatial Type definitions
 * - Support for multiple JSON Schema draft versions
 * - Preserve constraints during conversion
 * 
 * @example
 * ```typescript
 * // Define a type
 * const UserType = type({
 *   id: "string",
 *   name: "string",
 *   age: "number|>0",
 *   email: "string",
 *   isAdmin: "boolean?",
 *   roles: "string[]"
 * });
 * 
 * // Convert to JSON Schema
 * const jsonSchema = toJsonSchema(UserType, {
 *   title: "User Schema",
 *   description: "Schema for user data"
 * });
 * 
 * // Convert back to InSpatial Type
 * const regeneratedType = fromJsonSchema(jsonSchema);
 * ```
 */

// JSON Schema draft versions
/**
 * JSON Schema draft versions
 * 
 * Enum representing the supported JSON Schema draft versions
 * for schema generation and parsing.
 */
export enum JsonSchemaDraft {
  /** JSON Schema Draft 7 */
  DRAFT_07 = "draft-07",
  
  /** JSON Schema Draft 2019-09 */
  DRAFT_2019_09 = "draft-2019-09",
  
  /** JSON Schema Draft 2020-12 */
  DRAFT_2020_12 = "draft-2020-12",
}

/**
 * Options for JSON Schema conversion
 * 
 * Configuration options for customizing the output
 * of JSON Schema conversion.
 */
export interface JsonSchemaOptions {
  /** JSON Schema draft version to use */
  draft?: JsonSchemaDraft;
  
  /** Schema ID (for $id field) */
  id?: string;
  
  /** Schema title */
  title?: string;
  
  /** Schema description */
  description?: string;
}

/**
 * InTypeJsonSchema - JSON Schema conversion utilities
 * 
 * A singleton class that handles conversion between InSpatial Type
 * and JSON Schema formats. This class provides methods for converting
 * type definitions in both directions.
 */
export class InTypeJsonSchema {
  private static instance: InTypeJsonSchema;

  private constructor() {}

  /**
   * Get the instance
   * 
   * Follows the singleton pattern to ensure a single shared instance
   * across the application.
   * 
   * @returns The InTypeJsonSchema singleton instance
   */
  public static init(): InTypeJsonSchema {
    if (!InTypeJsonSchema.instance) {
      InTypeJsonSchema.instance = new InTypeJsonSchema();
    }
    return InTypeJsonSchema.instance;
  }

  /**
   * Convert ArkType to JSON Schema
   * 
   * Transforms an InSpatial Type schema definition into a
   * valid JSON Schema object.
   * 
   * @param typeSchema InSpatial Type schema
   * @param options JSON Schema options
   * @returns A JSON Schema object
   */
  public fromArkType(
    typeSchema: any,
    options: JsonSchemaOptions = {}
  ): Record<string, any> {
    const draft = options.draft || JsonSchemaDraft.DRAFT_2020_12;

    const jsonSchema: Record<string, any> = {
      $schema: `https://json-schema.org/${draft}/schema`,
    };

    if (options.id) {
      jsonSchema.$id = options.id;
    }

    if (options.title) {
      jsonSchema.title = options.title;
    }

    if (options.description) {
      jsonSchema.description = options.description;
    }

    // Convert schema based on type
    if (typeof typeSchema === "string") {
      // Handle string patterns like "string", "number", "string[]", etc.
      return this.convertStringPattern(typeSchema, jsonSchema);
    } else if (typeof typeSchema === "object") {
      // Handle object schemas
      return this.convertObjectSchema(typeSchema, jsonSchema);
    } else {
      throw new Error(`Unsupported schema type: ${typeof typeSchema}`);
    }
  }

  /**
   * Convert simple string patterns to JSON Schema
   * 
   * Handles the conversion of string type patterns to their
   * JSON Schema equivalents.
   * 
   * @param pattern The string pattern to convert
   * @param jsonSchema The JSON Schema object being built
   * @returns The updated JSON Schema object
   * @private
   */
  private convertStringPattern(
    pattern: string,
    jsonSchema: Record<string, any>
  ): Record<string, any> {
    // Basic types
    if (pattern === "string") {
      jsonSchema.type = "string";
    } else if (pattern === "number") {
      jsonSchema.type = "number";
    } else if (pattern === "integer") {
      jsonSchema.type = "integer";
    } else if (pattern === "boolean") {
      jsonSchema.type = "boolean";
    } else if (pattern === "null") {
      jsonSchema.type = "null";
    } else if (pattern === "any" || pattern === "unknown") {
      // For "any" or "unknown", no type constraint in JSON Schema
    } else if (pattern === "undefined") {
      // No direct equivalent in JSON schema, using null as closest approximation
      jsonSchema.type = "null";
    } else if (pattern.endsWith("[]")) {
      // Array type
      const itemType = pattern.slice(0, -2);
      jsonSchema.type = "array";
      jsonSchema.items = this.convertStringPattern(itemType, {});
    } else if (pattern.includes("|")) {
      // Union type
      const types = pattern.split("|");
      jsonSchema.anyOf = types.map((t) => this.convertStringPattern(t, {}));
    } else if (pattern.startsWith(">")) {
      // Number greater than
      const value = parseFloat(pattern.slice(1));
      jsonSchema.type = "number";
      jsonSchema.exclusiveMinimum = value;
    } else if (pattern.startsWith(">=")) {
      // Number greater than or equal
      const value = parseFloat(pattern.slice(2));
      jsonSchema.type = "number";
      jsonSchema.minimum = value;
    } else if (pattern.startsWith("<")) {
      // Number less than
      const value = parseFloat(pattern.slice(1));
      jsonSchema.type = "number";
      jsonSchema.exclusiveMaximum = value;
    } else if (pattern.startsWith("<=")) {
      // Number less than or equal
      const value = parseFloat(pattern.slice(2));
      jsonSchema.type = "number";
      jsonSchema.maximum = value;
    }

    return jsonSchema;
  }

  /**
   * Convert object schemas to JSON Schema
   * 
   * Handles the conversion of object type definitions to their
   * JSON Schema equivalents, including property types and
   * required fields tracking.
   * 
   * @param typeSchema The object schema to convert
   * @param jsonSchema The JSON Schema object being built
   * @returns The updated JSON Schema object
   * @private
   */
  private convertObjectSchema(
    typeSchema: Record<string, any>,
    jsonSchema: Record<string, any>
  ): Record<string, any> {
    jsonSchema.type = "object";
    jsonSchema.properties = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(typeSchema)) {
      if (typeof value === "string") {
        const isOptional = key.endsWith("?");
        const propName = isOptional ? key.slice(0, -1) : key;

        jsonSchema.properties[propName] = this.convertStringPattern(value, {});

        if (!isOptional) {
          required.push(propName);
        }
      } else if (typeof value === "object") {
        const isOptional = key.endsWith("?");
        const propName = isOptional ? key.slice(0, -1) : key;

        jsonSchema.properties[propName] = this.convertObjectSchema(value, {});

        if (!isOptional) {
          required.push(propName);
        }
      }
    }

    if (required.length > 0) {
      jsonSchema.required = required;
    }

    return jsonSchema;
  }

  /**
   * Convert JSON Schema to ArkType
   * 
   * Transforms a JSON Schema object into an InSpatial Type
   * schema definition.
   * 
   * @param jsonSchema JSON Schema object
   * @returns An InSpatial Type schema definition
   */
  public toArkType(jsonSchema: Record<string, any>): any {
    if (jsonSchema.type === "string") {
      return "string";
    } else if (jsonSchema.type === "number") {
      let numType = "number";

      // Add constraints if present
      if ("minimum" in jsonSchema) {
        numType += `|>=${jsonSchema.minimum}`;
      } else if ("exclusiveMinimum" in jsonSchema) {
        numType += `|>${jsonSchema.exclusiveMinimum}`;
      }

      if ("maximum" in jsonSchema) {
        numType += `|<=${jsonSchema.maximum}`;
      } else if ("exclusiveMaximum" in jsonSchema) {
        numType += `|<${jsonSchema.exclusiveMaximum}`;
      }

      return numType;
    } else if (jsonSchema.type === "integer") {
      return "integer";
    } else if (jsonSchema.type === "boolean") {
      return "boolean";
    } else if (jsonSchema.type === "null") {
      return "null";
    } else if (jsonSchema.type === "array") {
      if (jsonSchema.items) {
        const itemType = this.toArkType(jsonSchema.items);
        return `${itemType}[]`;
      }
      return "any[]";
    } else if (jsonSchema.type === "object") {
      const result: Record<string, any> = {};

      if (jsonSchema.properties) {
        const required = jsonSchema.required || [];

        for (const [key, value] of Object.entries(jsonSchema.properties)) {
          const isRequired = required.includes(key);
          const propKey = isRequired ? key : `${key}?`;

          if (typeof value === "object" && value !== null) {
            result[propKey] = this.toArkType(value);
          }
        }
      }

      return result;
    } else if (jsonSchema.anyOf || jsonSchema.oneOf) {
      const schemas = jsonSchema.anyOf || jsonSchema.oneOf;
      const types = schemas.map((schema: any) => this.toArkType(schema));
      return types.join("|");
    }

    return "any";
  }
}

/**
 * Convert InSpatial Type to JSON Schema
 * 
 * Convenience function to convert an InSpatial Type schema
 * definition to a JSON Schema object.
 * 
 * @param typeSchema InSpatial Type schema definition
 * @param options JSON Schema conversion options
 * @returns A JSON Schema object
 * 
 * @example
 * ```typescript
 * // Define an InSpatial Type
 * const UserType = type({
 *   id: "string",
 *   name: "string",
 *   age: "number|>0",
 *   roles: "string[]"
 * });
 * 
 * // Convert to JSON Schema
 * const schema = toJsonSchema(UserType, {
 *   title: "User",
 *   description: "A user in the system"
 * });
 * ```
 */
export function toJsonSchema(
  typeSchema: any,
  options: JsonSchemaOptions = {}
): Record<string, any> {
  return InTypeJsonSchema.init().fromArkType(typeSchema, options);
}

/**
 * Convert JSON Schema to InSpatial Type
 * 
 * Convenience function to convert a JSON Schema object
 * to an InSpatial Type schema definition.
 * 
 * @param jsonSchema JSON Schema object
 * @returns An InSpatial Type schema definition
 * 
 * @example
 * ```typescript
 * // JSON Schema input
 * const schema = {
 *   type: "object",
 *   properties: {
 *     id: { type: "string" },
 *     name: { type: "string" },
 *     age: { type: "number", minimum: 0 },
 *     roles: { type: "array", items: { type: "string" } }
 *   },
 *   required: ["id", "name", "age"]
 * };
 * 
 * // Convert to InSpatial Type
 * const UserType = fromJsonSchema(schema);
 * ```
 */
export function fromJsonSchema(jsonSchema: Record<string, any>): any {
  return InTypeJsonSchema.init().toArkType(jsonSchema);
}
