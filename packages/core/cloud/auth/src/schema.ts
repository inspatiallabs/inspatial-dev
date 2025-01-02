import type { StandardSchemaV1 } from "@standard-schema/spec";

// Define base schema types for auth subjects
export interface UserSchema extends StandardSchemaV1<any> {
  "~standard": {
    version: 1;
    vendor: "inspatial-auth";
    validate(
      value: unknown
    ): Promise<{ value: any } | { issues: StandardSchemaV1.Issue[] }>;
  };
  properties: Record<string, StandardSchemaV1>;
}

// Schema creation helper
export function createSubjectSchema(
  properties: Record<string, StandardSchemaV1>
): UserSchema {
  return {
    properties,
    "~standard": {
      version: 1,
      vendor: "inspatial-auth",
      async validate(value: unknown) {
        if (typeof value !== "object" || value === null) {
          return {
            issues: [
              {
                message: "Expected an object",
              },
            ],
          };
        }

        const issues: StandardSchemaV1.Issue[] = [];
        const result: Record<string, any> = {};

        for (const [key, schema] of Object.entries(properties)) {
          const propertyValue = (value as any)[key];
          const validation = await schema["~standard"].validate(propertyValue);

          if ("issues" in validation && validation.issues) {
            issues.push(
              ...validation.issues.map((issue) => ({
                ...issue,
                path: [{ key }, ...(issue.path || [])],
              }))
            );
          } else if ("value" in validation) {
            result[key] = validation.value;
          }
        }

        if (issues.length > 0) {
          return { issues };
        }

        return { value: result };
      },
    },
  };
}

// Validation error handler
export class ValidationError extends Error {
  constructor(public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(issues[0]?.message || "Validation failed");
    this.name = "ValidationError";
  }
}

// Validation helper
export async function validateSubject<T extends StandardSchemaV1>(
  schema: T,
  data: unknown
): Promise<StandardSchemaV1.InferOutput<T>> {
  const result = await schema["~standard"].validate(data);
  if ("issues" in result && result.issues) {
    throw new ValidationError(result.issues);
  }
  if ("value" in result) {
    return result.value;
  }
  throw new ValidationError([{ message: "Validation failed" }]);
}

// Common schema types
export const string = (
  message = "Expected string"
): StandardSchemaV1<string> => ({
  "~standard": {
    version: 1,
    vendor: "inspatial-auth",
    validate: (value) =>
      typeof value === "string" ? { value } : { issues: [{ message }] },
  },
});

export const email = (
  message = "Invalid email format"
): StandardSchemaV1<string> => ({
  "~standard": {
    version: 1,
    vendor: "inspatial-auth",
    validate: (value) => {
      if (typeof value !== "string") {
        return { issues: [{ message: "Expected string" }] };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? { value } : { issues: [{ message }] };
    },
  },
});
