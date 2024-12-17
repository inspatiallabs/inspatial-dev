// Imports
import type { options, Promisable, runner } from "./shared.ts";
import { format } from "./shared.ts";
import * as node from "node:test";
import { noop } from "./noop.ts";

/*#########################################(RUNTIME)#########################################*/

/** Current runtime name. */
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
export const denoTest = Object.assign(
  function (name: string, fn: () => Promisable<void>, options?: options) {
    return globalThis.Deno.test({ name: format(name), fn, ...options });
  },
  {
    only: function (
      name: string,
      fn: () => Promisable<void>,
      options?: options
    ) {
      return globalThis.Deno.test.only({ name: format(name), fn, ...options });
    },
    skip: function (
      name: string,
      fn: () => Promisable<void>,
      options?: options
    ) {
      return globalThis.Deno.test.ignore({
        name: format(name),
        fn,
        ...options,
      });
    },
    todo: function (
      name: string,
      fn: () => Promisable<void>,
      options?: options
    ) {
      return globalThis.Deno.test.ignore({
        name: format(name),
        fn,
        ...options,
      });
    },
  }
) as runner;

/*#########################################(BUN)#########################################*/
// deno-lint-ignore no-explicit-any
const bun = (globalThis as any).Bun;

/** Bun test runner. */
export const bunTest = Object.assign(
  function (name: string, fn: () => Promisable<void>) {
    return bun.jest(caller()).test(format(name), fn);
  },
  {
    only: function (name: string, fn: () => Promisable<void>) {
      return bun.jest(caller()).test.only(format(name), fn);
    },
    skip: function (name: string, fn: () => Promisable<void>) {
      return bun.jest(caller()).test.skip(format(name), fn);
    },
    todo: function (name: string, fn: () => Promisable<void>) {
      return bun.jest(caller()).test.todo(format(name), fn);
    },
  }
) as runner;

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
export const nodeTest = Object.assign(
  function (name: string, fn: () => Promisable<void>) {
    return node.test(format(name), fn);
  },
  {
    only: function (name: string, fn: () => Promisable<void>) {
      return node.test.only(format(name), fn);
    },
    skip: function (name: string, fn: () => Promisable<void>) {
      return node.test.skip(format(name), fn);
    },
    todo: function (name: string, fn: () => Promisable<void>) {
      return node.test.todo(format(name), fn);
    },
  }
) as runner;

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

let test = noop as runner;
switch (runtime) {
  case "deno":
    ({ test } = await denoTest);
    break;
  case "bun":
    ({ test } = await bunTest);
    break;
  case "node":
    ({ test } = await nodeTest);
    break;
}
export { test };
