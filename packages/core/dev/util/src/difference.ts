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
//#endregion DiffType

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

/*#############################################(FUNCTIONS)#############################################*/

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
