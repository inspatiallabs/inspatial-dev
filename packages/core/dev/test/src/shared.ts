// Imports
import type { Nullable, Promisable } from "@inspatial/util";
export type { Nullable, Promisable };
import { highlight } from "./highlight.ts";

/** Test options. */
export type options = {
  permissions?: Deno.TestDefinition["permissions"];
  sanitizeResources?: Deno.TestDefinition["sanitizeResources"];
  sanitizeOps?: Deno.TestDefinition["sanitizeOps"];
  sanitizeExit?: Deno.TestDefinition["sanitizeExit"];
  env?: Record<string, string>;
  [key: PropertyKey]: unknown;
};

/** Test runner method. */
export type RunnerMethod = (
  name: string,
  fn: () => Promisable<unknown>,
  options?: options
) => Promisable<unknown>;

/** Test runner. */
export type Runner = RunnerMethod & {
  only: RunnerMethod;
  skip: RunnerMethod;
  todo: RunnerMethod;
};

/** Test runner mode. */
export type mode = "test" | "skip" | "only" | "todo";

/** Format test name. */
export function format(name: string): string {
  return highlight(name, { underline: true });
}
