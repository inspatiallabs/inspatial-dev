import type { StandardSchemaV1 as v1 } from "npm:@standard-schema/spec@1.0.0-beta.4";
import { Prettify } from "@inspatial/util";

export type SubjectSchema = Record<string, v1>;

export type SubjectPayload<T extends SubjectSchema> = Prettify<
  {
    [type in keyof T & string]: {
      type: string & type;
      properties: v1.InferOutput<T[type]>;
    };
  }[keyof T & string]
>;

export function createSubjects<
  Schema extends SubjectSchema = Record<string, never>,
>(types: Schema): Schema {
  return {
    ...types,
  } as Schema;
}
