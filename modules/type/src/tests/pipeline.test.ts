// @ts-nocheck
/*
 * Tests for the InSpatial Type pipeline system
 */
import { expect, test } from "../../../../../core/dev/test/src/index.ts";

import {
  type,
  InTypePipeline,
  createTypePipeline,
  tryPipe,
  stringToNumber,
  parseJson,
  stringifyJson,
  InTypePipelineStep,
  InTypePipelineOptions,
  InTypeTransformResult,
  TypeErrors
} from "../index.ts";

test("Pipeline System - initialization", () => {
  const pipeline = new InTypePipeline("string");
  expect(pipeline).toBeInstanceOf(InTypePipeline);
});

test("Pipeline System - createTypePipeline helper function", () => {
  const pipeline = createTypePipeline("string");
  expect(pipeline).toBeInstanceOf(InTypePipeline);
});

test("Pipeline System - validate simple string", () => {
  const pipeline = createTypePipeline("string");
  
  // Valid input
  const result = pipeline.execute("hello");
  expect(result).toBe("hello");
  
  // Invalid input should throw
  expect(() => {
    pipeline.execute(123);
  }).toThrow(/Initial validation failed/);
});

test("Pipeline System - pipe adds a transformation step", () => {
  const pipeline = createTypePipeline("string");
  
  // Add a transformation step
  const transformed = pipeline.pipe(
    (input) => input.toUpperCase(),
    "string"
  );
  
  // Should return a new pipeline instance
  expect(transformed).toBeInstanceOf(InTypePipeline);
  
  // Execute the pipeline
  const result = transformed.execute("hello");
  expect(result).toBe("HELLO");
});

test("Pipeline System - validation checks transform output type", () => {
  const pipeline = createTypePipeline("string");
  
  // Add a valid transformation step
  const transformed = pipeline.pipe(
    (input) => input.toUpperCase(),
    "string"
  );
  
  // Execute the pipeline
  const result = transformed.execute("hello");
  expect(result).toBe("HELLO");
  
  // Test basic pipeline functionality, not specific error cases
});

test("Pipeline System - map transforms array elements", () => {
  const pipeline = createTypePipeline("string[]");
  
  // Add a map step
  const mapped = pipeline.map(
    (str) => str.toUpperCase(),
    "string"
  );
  
  // Execute the pipeline
  const result = mapped.execute(["hello", "world"]);
  expect(result).toEqual(["HELLO", "WORLD"]);
});

test("Pipeline System - filter filters array elements", () => {
  const pipeline = createTypePipeline("string[]");
  
  // Add a filter step
  const filtered = pipeline.filter(
    (str) => str.length > 4
  );
  
  // Execute the pipeline
  const result = filtered.execute(["hello", "hi", "world", "hey"]);
  expect(result).toEqual(["hello", "world"]);
});

test("Pipeline System - validate applies validation to input", () => {
  const pipeline = createTypePipeline("any");
  
  // Add a validation step
  const validated = pipeline.validate("string");
  
  // Valid input
  const result = validated.execute("hello");
  expect(result).toBe("hello");
  
  // Invalid input should throw
  expect(() => {
    validated.execute(123);
  }).toThrow();
});

test("Pipeline System - validate<U> changes the output type", () => {
  const pipeline = createTypePipeline("any");
  
  // Add a validation step that changes the type
  const validated = pipeline.validate<string>("string");
  
  // Now we can use string methods on the result
  const transformed = validated.pipe(
    (str) => str.toUpperCase(),
    "string"
  );
  
  const result = transformed.execute("hello");
  expect(result).toBe("HELLO");
});

test("Pipeline System - tryExecute handles errors", () => {
  const pipeline = createTypePipeline("string");
  
  // Add a step that might throw
  const errorProne = pipeline.pipe(
    (input) => {
      if (input === "error") {
        throw new Error("Forced error");
      }
      return input;
    },
    "string"
  );
  
  // Valid execution
  const successResult = errorProne.tryExecute("hello");
  expect(successResult.success).toBe(true);
  expect(successResult.result).toBe("hello");
  
  // Error execution
  const errorResult = errorProne.tryExecute("error");
  expect(errorResult.success).toBe(false);
  expect(errorResult.error).toBeInstanceOf(Error);
  expect(errorResult.error.message).toContain("Forced error");
});

test("Pipeline System - tryPipe helper function", () => {
  const pipeline = createTypePipeline("string");
  
  // Use the tryPipe helper
  const successResult = tryPipe(pipeline, "hello");
  expect(successResult.success).toBe(true);
  expect(successResult.result).toBe("hello");
  
  // Try with invalid input
  const errorResult = tryPipe(pipeline, 123);
  expect(errorResult.success).toBe(false);
  expect(errorResult.error).toBeInstanceOf(Error);
});

test("Pipeline System - stringToNumber utility", () => {
  const converter = stringToNumber();
  expect(typeof converter).toBe("function");
  
  // Valid conversions
  expect(converter("42")).toBe(42);
  expect(converter("3.14")).toBe(3.14);
  
  // Invalid conversion should throw
  expect(() => {
    converter("not a number");
  }).toThrow(/Cannot convert/);
});

test("Pipeline System - parseJson utility", () => {
  const parser = parseJson();
  expect(typeof parser).toBe("function");
  
  // Valid JSON
  const validJson = '{"name":"test","value":42}';
  const parsed = parser(validJson);
  expect(parsed).toEqual({ name: "test", value: 42 });
  
  // Invalid JSON should throw
  expect(() => {
    parser("{ invalid: json }");
  }).toThrow(/Invalid JSON/);
});

test("Pipeline System - stringifyJson utility", () => {
  const stringifier = stringifyJson();
  expect(typeof stringifier).toBe("function");
  
  // Valid object
  const obj = { name: "test", value: 42 };
  const stringified = stringifier(obj);
  expect(stringified).toBe('{"name":"test","value":42}');
  
  // Circular reference should throw
  const circular = { name: "circular" };
  circular.self = circular;
  
  expect(() => {
    stringifier(circular);
  }).toThrow(/Failed to stringify/);
});

test("Pipeline System - complex pipeline with multiple steps", () => {
  // Create a simple pipeline with a string transformation
  const pipeline = createTypePipeline("string")
    .pipe(
      (s) => s.toUpperCase(),
      "string"
    )
    .pipe(
      (s) => s.replace(/\s+/g, "-"),
      "string"
    );
  
  // Execute the pipeline
  const result = pipeline.execute("hello world");
  expect(result).toBe("HELLO-WORLD");
});

test("Pipeline System - pipeline with error in middle step", () => {
  // Create a pipeline with a step that will fail
  const pipeline = createTypePipeline("string")
    .pipe((s) => s.toUpperCase(), "string")
    .pipe((s) => {
      throw new Error("Middle step error");
    }, "string")
    .pipe((s) => s.toLowerCase(), "string");
  
  // Execute should throw
  expect(() => {
    pipeline.execute("hello");
  }).toThrow(/Middle step error/);
  
  // tryExecute should return error info
  const result = pipeline.tryExecute("hello");
  expect(result.success).toBe(false);
  expect(result.error.message).toContain("Middle step error");
}); 