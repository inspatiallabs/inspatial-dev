/*#############################(IMPORT)#############################*/
import {
  ArkErrors,
  ArkError,
  Hkt,
  ark,
  configure,
  declare,
  define,
  generic,
  keywords,
  match,
  scope,
  type,
  Ark,
  ArkConfig,
  ArkSchemaConfig,
  ArkSchemaScopeConfig,
  ArkAmbient,
  BoundModule,
  Generic,
  JsonSchema,
  KeywordConfig,
  Module,
  Scope,
  Submodule,
  distill,
  inferred,
  Type,
} from "npm:arktype@^2.1.10";

import { TypeErrorsClass, TypeErrorClass } from "./error.ts";
import { SchemaRegistry, typeRef } from "./schema-registry.ts";
import {
  InTypeJsonSchema,
  toJsonSchema,
  fromJsonSchema,
  JsonSchemaDraft,
} from "./json-schema.ts";
import {
  InTypeExtension,
  registerTypeExtension,
  validateTypeExtension,
  emailTypeExtension,
  urlTypeExtension,
} from "./extension.ts";
import {
  InTypePipeline,
  createTypePipeline,
  tryPipe,
  stringToNumber,
  parseJson,
  stringifyJson,
} from "./pipeline.ts";
import {
  InTypePerformance,
  memoizeTypeValidation,
  runTypeBenchmark,
  compareTypeBenchmarks,
} from "./performance.ts";

/*#############################(EXPORT FUNCTIONS (Ark))#############################*/
/**
 * Core type validation functions
 * 
 * These functions provide the primary interface for defining and using types
 * in your application. They build on ArkType's core capabilities with
 * enhanced features specific to InSpatial.
 */
export {
  /** 
   * Direct access to the underlying ArkType implementation
   * Use this if you need low-level access to ArkType's functionality
   */
  ark as inspatialType,
  
  /** @internal Original ArkErrors class, used internally */
  ArkErrors as _TypeErrors,
  
  /** @internal Original ArkError class, used internally */
  ArkError as _TypeError,
  
  /**
   * Configure global type options
   * 
   * @example
   * ```typescript
   * const config = configureType({
   *   keywords: {
   *     string: "a text value",
   *     "string.email": {
   *       actual: (value) => `"${value}" is not a valid email address`
   *     }
   *   }
   * });
   * ```
   */
  configure as configureType,
  
  /**
   * Declare a named type
   * 
   * @example
   * ```typescript
   * declareType("User", {
   *   name: "string",
   *   age: "number|>0"
   * });
   * ```
   */
  declare as declareType,
  
  /**
   * Create a custom type definition
   * 
   * @example
   * ```typescript
   * const Email = defineType("string", {
   *   pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
   * });
   * ```
   */
  define as defineType,
  
  /**
   * Create generic type definitions
   * 
   * @example
   * ```typescript
   * const List = genericType("T", (T) => type({
   *   items: `${T}[]`,
   *   count: "number"
   * }));
   * 
   * const StringList = List("string");
   * ```
   */
  generic as genericType,
  
  /**
   * Access built-in keywords for type definitions
   * 
   * @example
   * ```typescript
   * const keywords = keywordsType();
   * console.log(Object.keys(keywords));
   * ```
   */
  keywords as keywordsType,
  
  /**
   * Pattern match against type definitions
   * 
   * @example
   * ```typescript
   * const stringify = matchType({
   *   "string | number | boolean | null": (v) => String(v),
   *   "bigint": (n) => `${n}n`,
   *   "default": () => "unknown"
   * });
   * ```
   */
  match as matchType,
  
  /**
   * Create an isolated scope for types
   * 
   * @example
   * ```typescript
   * const myScope = scopeType({
   *   id: "string",
   *   user: {
   *     name: "string",
   *     id: "id"
   *   }
   * });
   * ```
   */
  scope as scopeType,
  
  /**
   * Define and create a type validator
   * 
   * The core function for defining types and creating validators.
   * 
   * @example
   * ```typescript
   * const UserType = type({
   *   name: "string",
   *   age: "number|>0"
   * });
   * 
   * const result = UserType({ name: "Ben", age: 24 });
   * ```
   */
  type,
  
  /**
   * Higher-kinded type utilities
   * For advanced type system features
   */
  Hkt as TypeHkt,
  
  /**
   * Collection of validation errors with enhanced instanceof checking
   * 
   * @example
   * ```typescript
   * if (result instanceof TypeErrors) {
   *   console.error("Validation failed:", result.summary);
   * }
   * ```
   */
  TypeErrorsClass as TypeErrors,
  
  /**
   * Individual validation error with enhanced instanceof checking
   */
  TypeErrorClass as TypeError,

  /**
   * Schema Registry - Global registry for type schemas
   * 
   * @example
   * ```typescript
   * const registry = SchemaRegistry.init();
   * registry.register("User", UserType, "models");
   * ```
   */
  SchemaRegistry,
  
  /**
   * Create a reference to a registered schema
   * 
   * @example
   * ```typescript
   * const User = typeRef("User", "models");
   * const validUser = User({ name: "Ben", age: 24 });
   * ```
   */
  typeRef,

  /**
   * JSON Schema compatibility utilities
   * For JSON Schema conversion options
   */
  InTypeJsonSchema,
  
  /**
   * Convert InSpatial Type to JSON Schema
   * 
   * @example
   * ```typescript
   * const jsonSchema = toJsonSchema(UserType, {
   *   title: "User Schema",
   *   description: "Schema for user data"
   * });
   * ```
   */
  toJsonSchema,
  
  /**
   * Convert JSON Schema to InSpatial Type
   * 
   * @example
   * ```typescript
   * const UserType = fromJsonSchema(jsonSchemaObject);
   * ```
   */
  fromJsonSchema,
  
  /**
   * JSON Schema draft versions
   * Enum of supported draft versions
   */
  JsonSchemaDraft,

  /**
   * Extension system for custom validators
   * For creating and managing extensions
   */
  InTypeExtension,
  
  /**
   * Register a custom validation extension
   * 
   * @example
   * ```typescript
   * registerTypeExtension(emailTypeExtension());
   * ```
   */
  registerTypeExtension,
  
  /**
   * Validate using a registered keyword
   * 
   * @example
   * ```typescript
   * const validEmail = validateTypeExtension("email", "user@example.com");
   * ```
   */
  validateTypeExtension,
  
  /**
   * Built-in email address validator
   * 
   * @example
   * ```typescript
   * registerTypeExtension(emailTypeExtension());
   * ```
   */
  emailTypeExtension,
  
  /**
   * Built-in URL validator
   * 
   * @example
   * ```typescript
   * registerTypeExtension(urlTypeExtension());
   * ```
   */
  urlTypeExtension,

  /**
   * Pipeline system for type transformations
   * For creating and managing transformation pipelines
   */
  InTypePipeline,
  
  /**
   * Create a new pipeline starting with an input type
   * 
   * @example
   * ```typescript
   * const jsonProcessor = createTypePipeline("string")
   *   .pipe((input) => JSON.parse(input), "object");
   * ```
   */
  createTypePipeline,
  
  /**
   * Try to execute a pipeline with error handling
   * 
   * @example
   * ```typescript
   * const result = tryPipe(jsonProcessor, '{"name":"Ben"}');
   * ```
   */
  tryPipe,
  
  /**
   * Create a transformation that converts strings to numbers
   * 
   * @example
   * ```typescript
   * const parser = createTypePipeline("string")
   *   .pipe(stringToNumber(), "number");
   * ```
   */
  stringToNumber,
  
  /**
   * Create a transformation that parses JSON
   * 
   * @example
   * ```typescript
   * const jsonParser = createTypePipeline("string")
   *   .pipe(parseJson(), "object");
   * ```
   */
  parseJson,
  
  /**
   * Create a transformation that stringifies to JSON
   * 
   * @example
   * ```typescript
   * const stringifier = createTypePipeline("object")
   *   .pipe(stringifyJson(), "string");
   * ```
   */
  stringifyJson,

  /**
   * Performance optimization utilities
   * For optimizing type validation performance
   */
  InTypePerformance,
  
  /**
   * Memoize a validation result for better performance
   * 
   * @example
   * ```typescript
   * const validatedUser = memoizeTypeValidation(UserType, userData);
   * ```
   */
  memoizeTypeValidation,
  
  /**
   * Run a performance benchmark
   * 
   * @example
   * ```typescript
   * const benchmark = runTypeBenchmark("validation", () => UserType(data), 1000);
   * ```
   */
  runTypeBenchmark,
  
  /**
   * Compare performance of different implementations
   * 
   * @example
   * ```typescript
   * const results = compareTypeBenchmarks({
   *   direct: () => UserType(data),
   *   memoized: () => memoizeTypeValidation(UserType, data)
   * }, 1000);
   * ```
   */
  compareTypeBenchmarks,
};

/*#############################(EXPORT TYPE (Ark))#############################*/
/**
 * Core type definitions exported from ArkType
 * These provide the TypeScript interfaces for working with InSpatial Type
 */
export type {
  /*********************(Core)*********************/
  /** Core type for the InSpatial Type system */
  Ark as InSpatialType,
  
  /** Configuration for types */
  ArkConfig as ConfigType,
  
  /** Schema configuration options */
  ArkSchemaConfig as SchemaConfig,
  
  /** Configuration for type scopes */
  ArkSchemaScopeConfig as SchemaScopeConfig,
  
  /** Ambient type configuration */
  ArkAmbient as AmbientType,

  /*********************(Modules)*********************/
  /** Bound module type */
  BoundModule,
  
  /** Generic type definition */
  Generic,
  
  /** JSON Schema type */
  JsonSchema,
  
  /** Keyword configuration */
  KeywordConfig,
  
  /** Module type */
  Module as ModuleType,
  
  /** Type definition */
  Type,
  
  /** Scope type */
  Scope as ScopeType,
  
  /** Submodule type */
  Submodule as SubmoduleType,
  
  /** Distill type */
  distill as DistillType,
  
  /** Inferred type */
  inferred as InferredType,
};

/*#############################(EXPORT TYPE (InSpatial Type))#############################*/
/**
 * Extension system types
 * Types for creating and using custom validators
 */
export type {
  /** Custom type extension definition */
  InTypeValidationExtension,
  
  /** Options for validation extensions */
  InTypeValidationOptions,
  
  /** Result from validation extension */
  InTypeValidationResult,
} from "./extension.ts";

/**
 * Pipeline system types
 * Types for creating and using transformation pipelines
 */
export type {
  /** Individual step in a transformation pipeline */
  InTypePipelineStep,
  
  /** Options for pipeline operations */
  InTypePipelineOptions,
  
  /** Result from pipeline transformations */
  InTypeTransformResult,
} from "./pipeline.ts";

/**
 * Performance system types
 * Types for benchmarking and optimization
 */
export type { 
  /** Result from performance benchmarks */
  InTypeBenchmarkResult 
} from "./performance.ts";
