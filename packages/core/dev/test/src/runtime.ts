// Imports
import type { OptionProp, Promisable, Runner, TestProps } from "./shared.ts";
import { format } from "./shared.ts";
import * as node from "node:test";
import { noop } from "./noop.ts";

/*#########################################(RUNTIME)#########################################*/

/** The InSpatial Test Runtime Environment e.g Deno, Bun, or Node */
let runtime = "unknown";

if ((globalThis as any).Deno) {
  runtime = "deno";
} else if ((globalThis as any).Bun) {
  runtime = "bun";
} else if ((globalThis as any).process?.versions?.node) {
  runtime = "node";
}

export { runtime };

/*#########################################(DENO)#########################################*/
/** Deno test */
export function createDenoTest(): Runner {
  const test = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: nameOrConfig.fn,
          ...nameOrConfig.options,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: fnOrUndefined!,
        ...options,
      })
    );
  };

  test.only = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: nameOrConfig.fn,
          ...nameOrConfig.options,
          only: true,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: fnOrUndefined!,
        ...options,
        only: true,
      })
    );
  };

  test.skip = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: nameOrConfig.fn,
          ...nameOrConfig.options,
          ignore: true,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: fnOrUndefined!,
        ...options,
        ignore: true,
      })
    );
  };

  test.todo = (
    nameOrConfig: string | TestProps,
    _fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    const todoFn = () => Promise.resolve();
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        globalThis.Deno.test({
          name: format(nameOrConfig.name),
          fn: todoFn,
          ...nameOrConfig.options,
          ...options,
          ignore: true,
        })
      );
    }
    return Promise.resolve(
      globalThis.Deno.test({
        name: format(nameOrConfig),
        fn: todoFn,
        ...options,
        ignore: true,
      })
    );
  };

  return test;
}

export const denoTest = createDenoTest();
/*#########################################(BUN)#########################################*/
// deno-lint-ignore no-explicit-any
const bun = (globalThis as any).Bun;

/** Bun test runner. */
export function createBunTest(): Runner {
  const test = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun
          .jest(caller())
          .test(
            format(nameOrConfig.name),
            nameOrConfig.fn,
            nameOrConfig.options
          )
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test(format(nameOrConfig), fnOrUndefined!, options)
    );
  };

  test.only = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun
          .jest(caller())
          .test.only(format(nameOrConfig.name), nameOrConfig.fn, {
            ...nameOrConfig.options,
            only: true,
          })
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test.only(format(nameOrConfig), fnOrUndefined!, {
        ...options,
        only: true,
      })
    );
  };

  test.skip = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun
          .jest(caller())
          .test.skip(format(nameOrConfig.name), nameOrConfig.fn, {
            ...nameOrConfig.options,
            skip: true,
          })
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test.skip(format(nameOrConfig), fnOrUndefined!, {
        ...options,
        skip: true,
      })
    );
  };

  test.todo = (
    nameOrConfig: string | TestProps,
    _fnOrUndefined?: () => Promisable<void>,
    options?: OptionProp
  ): Promise<void> => {
    const todoFn = () => Promise.resolve();
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(
        bun.jest(caller()).test.todo(format(nameOrConfig.name), todoFn, {
          ...nameOrConfig.options,
          ...options,
          todo: true,
        })
      );
    }
    return Promise.resolve(
      bun.jest(caller()).test.todo(format(nameOrConfig), todoFn, {
        ...options,
        todo: true,
      })
    );
  };

  return test;
}

export const bunTest = createBunTest();

/** Retrieve caller test file. */
function caller() {
  const Trace = Error as unknown as {
    prepareStackTrace: (error: Error, stack: CallSite[]) => unknown;
  };
  const _ = Trace.prepareStackTrace;
  Trace.prepareStackTrace = (_, stack) => stack;
  const { stack } = new Error();
  Trace.prepareStackTrace = _;
  const caller = (stack as unknown as CallSite[])[2];
  return caller.getFileName().replaceAll("\\", "/");
}

/** V8 CallSite (subset). */
type CallSite = { getFileName: () => string };

/*#########################################(NODE)#########################################*/

/** Node test runner. */
export function createNodeTest(): Runner {
  const test = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      // Converts test function to Node's expected format
      const testFn = (_t: any) => nameOrConfig.fn();
      return Promise.resolve(node.test(format(nameOrConfig.name), testFn));
    }
    // Converts test function to Node's expected format
    const testFn = (_t: any) => fnOrUndefined!();
    return Promise.resolve(node.test(format(nameOrConfig), testFn));
  };

  test.only = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      const testFn = (_t: any) => nameOrConfig.fn();
      return Promise.resolve(node.test.only(format(nameOrConfig.name), testFn));
    }
    const testFn = (_t: any) => fnOrUndefined!();
    return Promise.resolve(node.test.only(format(nameOrConfig), testFn));
  };

  test.skip = (
    nameOrConfig: string | TestProps,
    fnOrUndefined?: () => Promisable<void>
  ): Promise<void> => {
    if (typeof nameOrConfig === "object") {
      const testFn = (_t: any) => nameOrConfig.fn();
      return Promise.resolve(node.test.skip(format(nameOrConfig.name), testFn));
    }
    const testFn = (_t: any) => fnOrUndefined!();
    return Promise.resolve(node.test.skip(format(nameOrConfig), testFn));
  };

  test.todo = (
    nameOrConfig: string | TestProps,
    _fnOrUndefined?: () => Promisable<void>,
    _options?: OptionProp
  ): Promise<void> => {
    const todoFn = (_t: any) => Promise.resolve();
    if (typeof nameOrConfig === "object") {
      return Promise.resolve(node.test.todo(format(nameOrConfig.name), todoFn));
    }
    return Promise.resolve(node.test.todo(format(nameOrConfig), todoFn));
  };

  return test;
}

export const nodeTest = createNodeTest();

/*#########################################(TESTING)#########################################*/

export type testing = any;

/** TestingError can be used to test expected error behaviours in tests. */
export class TestingError extends Error {}

/** Throws back an error (can be used where statements are not allowed in syntax). */
export function throws(error: Error | string): never {
  if (typeof error === "string") {
    error = new TestingError(error);
  }
  throw error;
}

/** InSpatial Test  */
let test = noop as Runner;
switch (runtime) {
  case "deno":
    test = denoTest;
    break;
  case "bun":
    test = bunTest;
    break;
  case "node":
    test = nodeTest;
    break;
}

export { test };
