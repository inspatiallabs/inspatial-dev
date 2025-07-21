/**
 * Transformation Pipeline System for InSpatial Type
 *
 * This module provides a powerful pipeline system for transforming and
 * validating data in a type-safe manner. Pipelines allow you to chain
 * operations together, with validation at each step to ensure data
 * integrity throughout the transformation process.
 *
 * Key features:
 * - Chain multiple transformation steps
 * - Validate data between each step
 * - Handle errors gracefully
 * - Built-in common transformers
 * - Array operations like map and filter
 *
 * @example
 * ```typescript
 * // Create a pipeline that processes JSON data
 * const userProcessor = createTypePipeline("string")
 *   .pipe(
 *     // Parse JSON string to object
 *     (input) => JSON.parse(input),
 *     "object"
 *   )
 *   .pipe(
 *     // Add timestamp
 *     (obj) => ({ ...obj, processedAt: Date.now() }),
 *     { name: "string", processedAt: "number" }
 *   );
 *
 * // Use the pipeline
 * const result = userProcessor.execute('{"name":"Ben"}');
 * // Result: { name: "Ben", processedAt: 1629384789012 }
 * ```
 */

import { type, TypeErrors } from "./index.ts";

/**
 * Pipeline step function type
 *
 * Represents a single transformation step in a pipeline.
 * Takes input of type TIn and produces output of type TOut.
 */
export type InTypePipelineStep<TIn, TOut> = (input: TIn) => TOut;

/**
 * Pipeline configuration options
 *
 * Configuration options for customizing pipeline behavior.
 */
export interface InTypePipelineOptions {
  /** Whether to throw on validation errors */
  throwOnError?: boolean;

  /** Custom error handler */
  errorHandler?: (error: Error) => void;

  /** Whether to cache validation results */
  cache?: boolean;

  /** Maximum number of steps to execute */
  maxSteps?: number;
}

/**
 * Result of a type transformation
 *
 * The result of executing a pipeline, including success
 * status and either the result or error information.
 */
export interface InTypeTransformResult<T> {
  /** Whether the transformation was successful */
  success: boolean;

  /** Transformed value if successful */
  result?: T;

  /** Error if transformation failed */
  error?: Error;

  /** Steps executed in the transformation */
  steps?: number;

  /** Time taken for the transformation in ms */
  time?: number;
}

/**
 * InTypePipeline - Type-safe transformation pipeline
 *
 * A class that represents a chain of type-validated transformation steps.
 * Each step in the pipeline transforms the input value and validates it
 * against a specified type before passing it to the next step.
 *
 * @template T The output type of the pipeline
 */
export class InTypePipeline<T> {
  private steps: Array<InTypePipelineStep<any, any>>;
  private lastType: any;

  /**
   * Create a new pipeline with an initial type
   *
   * Initializes a new empty pipeline with the specified initial type.
   *
   * @param initialType The initial type for the pipeline
   */
  constructor(initialType: any) {
    this.steps = [];
    this.lastType = initialType;
  }

  /**
   * Add a transformation step to the pipeline
   *
   * Adds a transformation function to the pipeline and validates its output
   * against the specified type. This creates a new pipeline with the output
   * type of the transformation as its type parameter.
   *
   * @param transform The transformation function
   * @param outputType The type to validate the output against
   * @returns A new pipeline with the output type
   *
   * @example
   * ```typescript
   * const stringToNumber = createTypePipeline("string")
   *   .pipe(
   *     (str) => parseInt(str, 10),
   *     "number"
   *   );
   * ```
   */
  public pipe<U>(
    transform: InTypePipelineStep<T, U>,
    outputType: any
  ): InTypePipeline<U> {
    const validatedTransform = (input: T): U => {
      // Apply the transformation
      const result = transform(input);

      // Validate the result against the output type
      const validator = type(outputType);
      const validated = validator(result);

      // If validation failed, throw an error
      if (validated instanceof TypeErrors) {
        throw new Error(
          `Pipeline validation failed: ${(validated as any).summary}`
        );
      }

      // Return the validated output
      return validated as U;
    };

    this.steps.push(validatedTransform);
    this.lastType = outputType;

    return this as unknown as InTypePipeline<U>;
  }

  /**
   * Add a map step to transform array elements
   *
   * Applies a mapping function to each element of an array input,
   * and validates each result against the specified element type.
   *
   * @param mapFn The mapping function for array elements
   * @param elementType The type to validate each element against
   * @returns A new pipeline with an array output type
   *
   * @example
   * ```typescript
   * const doubleNumbers = createTypePipeline("number[]")
   *   .map(
   *     (n) => n * 2,
   *     "number"
   *   );
   * ```
   */
  public map<U>(
    mapFn: (item: any) => U,
    elementType: any
  ): InTypePipeline<U[]> {
    return this.pipe(
      (input: T) => (input as any[]).map(mapFn),
      `${elementType}[]`
    );
  }

  /**
   * Add a filter step to remove array elements
   *
   * Filters elements of an array input based on the provided predicate.
   *
   * @param filterFn The filter predicate
   * @returns A new pipeline with the same type
   *
   * @example
   * ```typescript
   * const positiveNumbers = createTypePipeline("number[]")
   *   .filter((n) => n > 0);
   * ```
   */
  public filter(filterFn: (item: any) => boolean): InTypePipeline<T> {
    // Cast the result to the proper type to maintain the pipeline chain
    return this.pipe(
      (input: T) => (input as any[]).filter(filterFn) as unknown as T,
      this.lastType
    );
  }

  /**
   * Add a step to apply a validator
   *
   * Validates the input against the specified type without
   * transforming it.
   *
   * @param validatorType The type to validate against
   * @returns A new pipeline with the validated type
   *
   * @example
   * ```typescript
   * const validateUser = createTypePipeline("any")
   *   .validate({
   *     name: "string",
   *     age: "number|>0"
   *   });
   * ```
   */
  public validate<U = T>(validatorType: any): InTypePipeline<U> {
    return this.pipe((input: T) => input as unknown as U, validatorType);
  }

  /**
   * Execute the pipeline with input data
   *
   * Processes the input through all steps in the pipeline,
   * validating it against the initial type and then
   * applying each transformation step in sequence.
   *
   * @param input Input data to process
   * @returns The transformed and validated output
   * @throws Error if validation fails at any step
   *
   * @example
   * ```typescript
   * const result = userProcessor.execute('{"name":"Ben"}');
   * ```
   */
  public execute(input: any): T {
    let result = input;

    // Validate initial input
    const initialValidator = type(this.lastType);
    const initialValidation = initialValidator(input);

    if (initialValidation instanceof TypeErrors) {
      throw new Error(
        `Initial validation failed: ${(initialValidation as any).summary}`
      );
    }

    // Use the validated value from the validator, not the original input
    result = initialValidation;

    // Process through each step
    for (const step of this.steps) {
      try {
        result = step(result);
      } catch (error) {
        throw new Error(
          `Pipeline step failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return result as T;
  }

  /**
   * Execute the pipeline with error handling
   *
   * Processes the input through all steps in the pipeline,
   * catching any errors that occur and returning them in
   * a result object instead of throwing.
   *
   * @param input Input data to process
   * @returns An object with success status and either result or error
   *
   * @example
   * ```typescript
   * const result = userProcessor.tryExecute('{"name":"Ben"}');
   * if (result.success) {
   *   console.log(result.result);
   * } else {
   *   console.error(result.error);
   * }
   * ```
   */
  public tryExecute(
    input: any
  ): { success: true; result: T } | { success: false; error: Error } {
    try {
      const result = this.execute(input);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

/**
 * Create a new pipeline starting with an input type
 *
 * A factory function that creates a new pipeline with the specified input type.
 * This is the recommended way to start building a pipeline.
 *
 * @param inputType The input type for the pipeline
 * @returns A new pipeline instance
 *
 * @example
 * ```typescript
 * const stringPipeline = createTypePipeline("string");
 * ```
 */
export function createTypePipeline<T>(inputType: any): InTypePipeline<T> {
  return new InTypePipeline<T>(inputType);
}

/**
 * Try to execute a pipeline with error handling
 *
 * A helper function that executes a pipeline and handles errors,
 * returning them in a result object instead of throwing.
 *
 * @param pipeline The pipeline to execute
 * @param input Input data for the pipeline
 * @returns An object with success status and either result or error
 *
 * @example
 * ```typescript
 * const result = tryPipe(userProcessor, '{"name":"Ben"}');
 * if (result.success) {
 *   console.log(result.result);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function tryPipe<T>(
  pipeline: InTypePipeline<T>,
  input: any
): { success: true; result: T } | { success: false; error: Error } {
  return pipeline.tryExecute(input);
}

/**
 * Create a transformation that converts strings to numbers
 *
 * A pre-built transformation function that converts string values to numbers.
 * Throws an error if the string cannot be converted to a valid number.
 *
 * @returns A transformation function for use in pipelines
 *
 * @example
 * ```typescript
 * const parser = createTypePipeline("string")
 *   .pipe(stringToNumber(), "number");
 * ```
 */
export function stringToNumber(): InTypePipelineStep<string, number> {
  return (input: string) => {
    const num = Number(input);
    if (isNaN(num)) {
      throw new Error(`Cannot convert "${input}" to a number`);
    }
    return num;
  };
}

/**
 * Create a transformation that parses JSON
 *
 * A pre-built transformation function that parses JSON strings.
 * Throws an error if the input is not valid JSON.
 *
 * @returns A transformation function for use in pipelines
 *
 * @example
 * ```typescript
 * const jsonParser = createTypePipeline("string")
 *   .pipe(parseJson(), "object");
 * ```
 */
export function parseJson<T>(): InTypePipelineStep<string, T> {
  return (input: string) => {
    try {
      return JSON.parse(input) as T;
    } catch (error) {
      throw new Error(
        `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}

/**
 * Create a transformation that stringifies to JSON
 *
 * A pre-built transformation function that converts objects to JSON strings.
 * Throws an error if the input cannot be stringified.
 *
 * @returns A transformation function for use in pipelines
 *
 * @example
 * ```typescript
 * const jsonStringifier = createTypePipeline("object")
 *   .pipe(stringifyJson(), "string");
 * ```
 */
export function stringifyJson<T>(): InTypePipelineStep<T, string> {
  return (input: T) => {
    try {
      return JSON.stringify(input);
    } catch (error) {
      throw new Error(
        `Failed to stringify: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}
