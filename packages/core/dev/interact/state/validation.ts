/**
 * # Type Validation for InSpatial State
 * @summary #### Integration with InSpatial Type system
 * 
 * Provides type validation capabilities for state objects using the InSpatial
 * Type system, ensuring runtime type safety.
 * 
 * @since 0.1.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import { 
  type, 
  TypeErrors, 
  memoizeTypeValidation,
  toJsonSchema,
  SchemaRegistry
} from "../../type/src/index.ts";
import type { StateConfigType, StateOptionsType } from "./types.ts";

// Type guard to check if a value is a Type Error
export function isTypeError(value: any): value is TypeErrors {
  return value instanceof TypeErrors;
}

/**
 * Create a validator function from an InSpatial Type definition
 * 
 * @param typeDefinition The InSpatial Type definition to use for validation
 * @returns A validation function that returns true if valid, or TypeErrors if invalid
 */
export function createTypeValidator(typeDefinition: any) {
  return (value: any) => {
    // Use memoization for better performance
    const result = memoizeTypeValidation(typeDefinition, value);
    
    if (isTypeError(result)) {
      return result;
    }
    
    return true;
  };
}

/**
 * Register a state schema with the SchemaRegistry
 * 
 * @param id The ID of the state
 * @param schema The state schema definition
 * @param category Optional category for organizing schemas (default: "state")
 */
export function registerStateSchema(id: string, schema: any, category: string = "state") {
  SchemaRegistry.init().register(id, schema, category);
}

/**
 * Get a JSON Schema representation of a state type
 * 
 * @param stateType The InSpatial Type definition
 * @param options Additional options for JSON Schema generation
 * @returns A JSON Schema object
 */
export function getStateJsonSchema(stateType: any, options?: any) {
  return toJsonSchema(stateType, options);
}

/**
 * Validate state against its type definition
 * 
 * @param stateType The InSpatial Type definition
 * @param state The state object to validate
 * @returns The validated state object or TypeErrors if invalid
 */
export function validateState(stateType: any, state: any) {
  return stateType(state);
}

/**
 * Create a standard set of type validators for common state patterns
 */
export const StateTypes = {
  /**
   * Create a type for a counter state
   */
  Counter: type({
    count: "number"
  }),
  
  /**
   * Create a type for a toggle state
   */
  Toggle: type({
    enabled: "boolean"
  }),
  
  /**
   * Create a type for a list state
   */
  List: <T extends string>(itemType: T) => type({
    items: `${itemType}[]` as any,
    selectedIndex: "number|null"
  }),
  
  /**
   * Create a type for a form state
   */
  Form: <T extends Record<string, string>>(fields: T) => {
    const fieldSchema: Record<string, any> = {};
    const errorsSchema: Record<string, any> = {};
    
    // Create schema for each field and corresponding error
    Object.entries(fields).forEach(([key, fieldType]) => {
      fieldSchema[key] = fieldType;
      errorsSchema[key] = "string|null";
    });
    
    return type({
      fields: fieldSchema,
      errors: errorsSchema,
      dirty: "boolean",
      submitted: "boolean"
    });
  },
  
  /**
   * Create a type for a user state
   */
  User: type({
    id: "string|null",
    name: "string|null",
    email: "string|null",
    authenticated: "boolean",
    roles: "string[]"
  }),
  
  /**
   * Create a type for a pagination state
   */
  Pagination: type({
    page: "number>0",
    limit: "number>0",
    total: "number>=0" as any,
    loading: "boolean"
  }),
  
  /**
   * Create a type for a notification state
   */
  Notification: type({
    items: "object[]",
    unread: "number>=0" as any
  }),
  
  /**
   * Create a type for a theme state
   */
  Theme: type({
    mode: "'light'|'dark'|'system'",
    primaryColor: "string",
    secondaryColor: "string"
  })
}; 