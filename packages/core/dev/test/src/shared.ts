// Imports
import { Promisable } from "../../util/src/types.ts"
import { highlight } from "./highlight.ts";

/*#########################################(PROPS)#########################################*/

/** InSpatial Test Properties definition for an object style test runner */
export interface TestProps {
  /** The name of the test */
  name: string;

  /** The function to pass to the test can be async or sync
   *
   * @example (Sync)
   * ```ts
   * test({
   *   fn: () => {
   *     ...
   *   }
   * })
   * ```
   *
   * @example (Async)
   * ```ts
   * test({
   *   async fn() {
   *     ...
   *   }
   * })
   * ```
   */
  fn: () => Promisable<void>;

  /**
   * Options for configuring test behavior
   * @property {boolean} only - When true, only this test will be run
   * @property {boolean} skip - When true, this test will be skipped
   * @property {boolean} todo - When true, marks this test as planned for future implementation
   * @property {Deno.TestDefinition["permissions"]} permissions - Controls what system features the test can access
   * @property {boolean} sanitizeResources - Checks if test properly closes resources like files and connections
   * @property {boolean} sanitizeOps - Checks if test completes all async operations
   * @property {boolean} sanitizeExit - Checks if test tries to exit unexpectedly
   * @property {Record<string, string>} env - Custom environment variables for this test
   */
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
/** InSpatial Test types. */
export type { Nullable, Promisable } from "../../util/src/index.ts";


/**
 * Configuration options for running tests on InSpatial.
 */
export type OptionProp = {
  /** Controls what system features the test can access */
  permissions?: Deno.TestDefinition["permissions"];

  /** Checks if the test properly closes all resources it opens (like files or network connections) */
  sanitizeResources?: Deno.TestDefinition["sanitizeResources"];

  /** Checks if the test properly completes all async operations it starts */
  sanitizeOps?: Deno.TestDefinition["sanitizeOps"];

  /** Checks if the test tries to exit the process unexpectedly */
  sanitizeExit?: Deno.TestDefinition["sanitizeExit"];

  /** Custom environment variables to use while running the test */
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
