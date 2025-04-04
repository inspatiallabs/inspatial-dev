/*#############################################(IMPORTS)#############################################*/

import { backTrace } from "./backtrace.ts";
import {
  farthestPoint,
  FarthestPointProp,
  farthestPointAssertion,
} from "./farthest-point.ts";
import { sameStart } from "./same-start.ts";

/*#############################################(TYPES)#############################################*/
//#region DiffTypeProp
/** Ways that lines in a diff can be different. */
export type DiffTypeProp = "removed" | "common" | "added";
//#endregion DiffTypeProp

//#region DiffResultProp
/**
 * Represents the result of a diff operation.
 *
 * @typeParam T The type of the value in the diff result.
 */
export interface DiffResultProp<T> {
  /** The type of the diff. */
  type: DiffTypeProp;
  /** The value of the diff. */
  value: T;
  /** The details of the diff. */
  details?: DiffResultProp<T>[];
}
//#endregion DiffResultProp

/*#############################################(CONSTANTS)#############################################*/

const COMMON = 2;

/*#############################################(DIFF)#############################################*/
//#region diff
/**
 * Renders the differences between the actual and expected values.
 *
 * @typeParam T The type of elements in the arrays.
 *
 * @param A Actual value
 * @param B Expected value
 *
 * @returns An array of differences between the actual and expected values.
 *
 * @example Usage
 * ```ts
 * import { diff } from "@inspatial/util";
 * import { assertEquals } from "@inspatial/test";
 *
 * const a = [1, 2, 3];
 * const b = [1, 2, 4];
 *
 * assertEquals(diff(a, b), [
 *   { type: "common", value: 1 },
 *   { type: "common", value: 2 },
 *   { type: "removed", value: 3 },
 *   { type: "added", value: 4 },
 * ]);
 * ```
 */
export function diff<T>(A: T[], B: T[]): DiffResultProp<T>[] {
  const prefixCommon = sameStart(A, B);
  A = A.slice(prefixCommon.length);
  B = B.slice(prefixCommon.length);
  const swapped = B.length > A.length;
  [A, B] = swapped ? [B, A] : [A, B];
  const M = A.length;
  const N = B.length;
  if (!M && !N && !prefixCommon.length) return [];
  if (!N) {
    return [
      ...prefixCommon.map((value) => ({ type: "common", value })),
      ...A.map((value) => ({ type: swapped ? "added" : "removed", value })),
    ] as DiffResultProp<T>[];
  }
  const offset = N;
  const delta = M - N;
  const length = M + N + 1;
  const fp: FarthestPointProp[] = Array.from({ length }, () => ({
    y: -1,
    id: -1,
  }));

  /**
   * Note: this buffer is used to save memory and improve performance. The first
   * half is used to save route and the last half is used to save diff type.
   */
  const routes = new Uint32Array((M * N + length + 1) * 2);
  const diffTypesPtrOffset = routes.length / 2;
  let ptr = 0;

  function snake<T>(
    k: number,
    A: T[],
    B: T[],
    slide?: FarthestPointProp,
    down?: FarthestPointProp
  ): FarthestPointProp {
    const M = A.length;
    const N = B.length;
    const fp = farthestPoint(
      k,
      M,
      routes,
      diffTypesPtrOffset,
      ptr,
      slide,
      down
    );
    ptr = fp.id;
    while (fp.y + k < M && fp.y < N && A[fp.y + k] === B[fp.y]) {
      const prev = fp.id;
      ptr++;
      fp.id = ptr;
      fp.y += 1;
      routes[ptr] = prev;
      routes[ptr + diffTypesPtrOffset] = COMMON;
    }
    return fp;
  }

  let currentFp = fp[delta + offset];
  farthestPointAssertion(currentFp);
  let p = -1;
  while (currentFp.y < N) {
    p = p + 1;
    for (let k = -p; k < delta; ++k) {
      const index = k + offset;
      fp[index] = snake(k, A, B, fp[index - 1], fp[index + 1]);
    }
    for (let k = delta + p; k > delta; --k) {
      const index = k + offset;
      fp[index] = snake(k, A, B, fp[index - 1], fp[index + 1]);
    }
    const index = delta + offset;
    fp[delta + offset] = snake(delta, A, B, fp[index - 1], fp[index + 1]);
    currentFp = fp[delta + offset];
    farthestPointAssertion(currentFp);
  }
  return [
    ...prefixCommon.map((value) => ({ type: "common", value })),
    ...backTrace(A, B, currentFp, swapped, routes, diffTypesPtrOffset),
  ] as DiffResultProp<T>[];
}

/*#############################################(UNESCAPE STRING)#############################################*/
//#region unescapeString

/**
 * This function, `unescapeString`, transforms special characters in a string
 * into their visible escape sequences. This is useful for displaying or
 * processing strings with invisible characters.
 *
 * @param string - The input string that may contain invisible characters.
 * @returns A new string with invisible characters replaced by their escape sequences.
 *
 * ##### NOTE:
 * This function does not remove line breaks but converts them to visible sequences.
 *
 * @example
 * ```ts
 * import { unescapeString } from "@inspatial/util";
 * import { test, assertEquals, expect } from "@inspatial/test";
 *
 * test({
 *   name: "unescapeString with assert",
 *   fn: () => {
 *     assertEquals(unescapeString("Hello\nWorld"), "Hello\\n\nWorld");
 *   }
 * });
 *
 * test({
 *   name: "unescapeString with expect",
 *   fn: () => {
 *     expect(unescapeString("Hello\nWorld")).toBe("Hello\\n\nWorld");
 *   }
 * });
 * ```
 */
export function unescapeString(string: string): string {
  return string
    .replaceAll("\b", "\\b")
    .replaceAll("\f", "\\f")
    .replaceAll("\t", "\\t")
    .replaceAll("\v", "\\v")
    .replaceAll(/\r\n|\r|\n/g, (str) =>
      str === "\r" ? "\\r" : str === "\n" ? "\\n\n" : "\\r\\n\r\n"
    );
}

const WHITESPACE_SYMBOLS = /([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/;

/*#############################################(TOKENIZE STRING)#############################################*/
//#region tokenizeString

/**
 * This function, `tokenizeString`, breaks a string into smaller parts called tokens.
 * It can split based on words or lines, depending on the `wordDiff` parameter.
 *
 * @param string - The string to be split into tokens.
 * @param wordDiff - If true, splits the string into words. Default is false, which splits by lines.
 * @returns An array of tokens derived from the input string.
 *
 * ##### Terminology:
 * **Token**: A small piece of a string, like a word or a line.
 *
 * @example
 * ```ts
 * import { tokenizeString } from "@inspatial/util";
 * import { test, assertEquals, expect } from "@inspatial/test";
 *
 * test({
 *   name: "tokenizeString with assert",
 *   fn: () => {
 *     assertEquals(tokenizeString("Hello\nWorld"), ["Hello\n", "World"]);
 *   }
 * });
 *
 * test({
 *   name: "tokenizeString with expect",
 *   fn: () => {
 *     expect(tokenizeString("Hello\nWorld")).toEqual(["Hello\n", "World"]);
 *   }
 * });
 * ```
 */
export function tokenizeString(string: string, wordDiff = false): string[] {
  if (wordDiff) {
    return string.split(WHITESPACE_SYMBOLS).filter((token) => token);
  }
  const tokens: string[] = [];
  const lines = string.split(/(\n|\r\n)/).filter((line) => line);

  for (const [i, line] of lines.entries()) {
    if (i % 2) {
      tokens[tokens.length - 1] += line;
    } else {
      tokens.push(line);
    }
  }
  return tokens;
}

//#endregion tokenizeString

/*#############################################(CREATE DETAILED DIFF)#############################################*/
//#region createDetailedDiff

/**
 * This function, `createDetailedDiff`, refines the differences between tokens
 * by merging spaces with surrounding word differences for a cleaner display.
 *
 * @param line - The current line being processed.
 * @param tokens - The tokens representing word differences.
 * @returns An array of refined diff results.
 *
 * ##### NOTE:
 * This function helps in making the diff output more readable by merging spaces.
 *
 * @example
 * ```ts
 * import { createDetailedDiff } from "@inspatial/util";
 * import { test, assertEquals, expect } from "@inspatial/test";
 *
 * const tokens = [
 *   { type: "added", value: "a" },
 *   { type: "removed", value: "b" },
 *   { type: "common", value: "c" },
 * ] as const;
 *
 * test({
 *   name: "createDetailedDiff with assert",
 *   fn: () => {
 *     assertEquals(
 *       createDetailedDiff({ type: "added", value: "a" }, [...tokens]),
 *       [{ type: "added", value: "a" }, { type: "common", value: "c" }]
 *     );
 *   }
 * });
 *
 * test({
 *   name: "createDetailedDiff with expect",
 *   fn: () => {
 *     expect(
 *       createDetailedDiff({ type: "added", value: "a" }, [...tokens])
 *     ).toEqual([{ type: "added", value: "a" }, { type: "common", value: "c" }]);
 *   }
 * });
 * ```
 */
export function createDetailedDiff(
  line: DiffResultProp<string>,
  tokens: DiffResultProp<string>[]
): DiffResultProp<string>[] {
  return tokens
    .filter(({ type }) => type === line.type || type === "common")
    .map((result, i, t) => {
      const token = t[i - 1];
      if (
        result.type === "common" &&
        token &&
        token.type === t[i + 1]?.type &&
        /\s+/.test(result.value)
      ) {
        return {
          ...result,
          type: token.type,
        };
      }
      return result;
    });
}

const NON_WHITESPACE_REGEXP = /\S/;

/*#############################################(DIFFERENCE STRING)#############################################*/
//#region differenceString

/**
 * This function, `differenceString`, identifies and displays the differences
 * between two strings. It shows what was added, removed, or unchanged.
 *
 * @param A - The first string to compare.
 * @param B - The second string to compare.
 * @returns An array of objects showing the differences between the two strings.
 *
 * ##### NOTE:
 * This function is inspired by a popular library for string differences.
 *
 * @example
 * ```ts
 * import { differenceString } from "@inspatial/util";
 * import { test, assertEquals, expect } from "@inspatial/test";
 *
 * test({
 *   name: "differenceString with assert",
 *   fn: () => {
 *     assertEquals(differenceString("Hello!", "Hello"), [
 *       {
 *         type: "removed",
 *         value: "Hello!\n",
 *         details: [
 *           { type: "common", value: "Hello" },
 *           { type: "removed", value: "!" },
 *           { type: "common", value: "\n" }
 *         ]
 *       },
 *       {
 *         type: "added",
 *         value: "Hello\n",
 *         details: [
 *           { type: "common", value: "Hello" },
 *           { type: "common", value: "\n" }
 *         ]
 *       }
 *     ]);
 *   }
 * });
 *
 * test({
 *   name: "differenceString with expect",
 *   fn: () => {
 *     expect(differenceString("Hello!", "Hello")).toEqual([
 *       {
 *         type: "removed",
 *         value: "Hello!\n",
 *         details: [
 *           { type: "common", value: "Hello" },
 *           { type: "removed", value: "!" },
 *           { type: "common", value: "\n" }
 *         ]
 *       },
 *       {
 *         type: "added",
 *         value: "Hello\n",
 *         details: [
 *           { type: "common", value: "Hello" },
 *           { type: "common", value: "\n" }
 *         ]
 *       }
 *     ]);
 *   }
 * });
 * ```
 */
export function differenceString(
  A: string,
  B: string
): DiffResultProp<string>[] {
  const diffResult = diff(
    tokenizeString(`${unescapeString(A)}\n`),
    tokenizeString(`${unescapeString(B)}\n`)
  );

  const added: DiffResultProp<string>[] = [];
  const removed: DiffResultProp<string>[] = [];
  for (const result of diffResult) {
    if (result.type === "added") {
      added.push(result);
    }
    if (result.type === "removed") {
      removed.push(result);
    }
  }

  const hasMoreRemovedLines = added.length < removed.length;
  const aLines = hasMoreRemovedLines ? added : removed;
  const bLines = hasMoreRemovedLines ? removed : added;
  for (const a of aLines) {
    let tokens = [] as Array<DiffResultProp<string>>;
    let b: undefined | DiffResultProp<string>;
    while (bLines.length) {
      b = bLines.shift();
      const tokenized = [
        tokenizeString(a.value, true),
        tokenizeString(b!.value, true),
      ] as [string[], string[]];
      if (hasMoreRemovedLines) tokenized.reverse();
      tokens = diff(tokenized[0], tokenized[1]);
      if (
        tokens.some(
          ({ type, value }) =>
            type === "common" && NON_WHITESPACE_REGEXP.test(value)
        )
      ) {
        break;
      }
    }
    a.details = createDetailedDiff(a, tokens);
    if (b) {
      b.details = createDetailedDiff(b, tokens);
    }
  }

  return diffResult;
}

//#endregion differenceString
