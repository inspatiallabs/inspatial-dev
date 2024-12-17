// Imports
import type { runner } from "./shared.ts";

/** Deno test runner. */
export const test = Object.assign(function () {}, {
  only: function () {},
  skip: function () {},
  todo: function () {},
}) as runner;
