// Imports
import type { Nullable, Promisable } from "@inspatial/util";
export type { Nullable, Promisable };
import { highlight } from "./highlight.ts";

/*#########################################(PROPS)#########################################*/

/** InSpatial Test Properties for an object style test runner */
export interface TestProps {
  /** The name of the test */
  name: string;

  /** The function to pass to the test */
  fn: () => Promisable<void>;

  /** The options for the test */
  options?: OptionProp & {
    /** Only run this test */
    only?: boolean;

    /** Skip this test */
    skip?: boolean;

    /** Todo this test */
    todo?: boolean;
  };
}
/*#########################################(OPTIONS)#########################################*/
/** InSpatial Test options. */
export type OptionProp = {
  permissions?: Deno.TestDefinition["permissions"];
  sanitizeResources?: Deno.TestDefinition["sanitizeResources"];
  sanitizeOps?: Deno.TestDefinition["sanitizeOps"];
  sanitizeExit?: Deno.TestDefinition["sanitizeExit"];
  env?: Record<string, string>;
  [key: PropertyKey]: unknown;
};

/*#########################################(METHODS)#########################################*/
/** InSpatial Test runner method. */
export type RunnerMethod = (
  name: string,
  fn: () => Promisable<void>,
  options?: OptionProp
) => Promise<void>;

/*#########################################(TEST RUNNER MODIFIERS)#########################################*/

/** InSpatial Test runner. */
export interface Runner {
  (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void>;
  only: (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ) => Promise<void>;
  skip: (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ) => Promise<void>;
  todo: (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ) => Promise<void>;
}

/*#########################################(MODE)#########################################*/
/** InSpatial Test runner mode. */
export type mode = "test" | "skip" | "only" | "todo";

/*#########################################(FORMAT)#########################################*/
/** Format InSpatial test name. */
export function format(name: string): string {
  return highlight(name, { underline: true });
}
