/*##############################################(RANGE-UTIL)##############################################*/
/**
 * a helper function that returns an array of numbers from start to end
 * @example range(1, 5) => [1, 2, 3, 4, 5]
 */
export function range(
  start: number,
  end?: number,
  step?: number,
  inclusive = false
): number[] {
  if (typeof end == "undefined") {
    // one param defined
    end = start;
    start = 0;
  }

  if (inclusive) {
    ++end;
  }

  if (typeof step == "undefined") {
    step = 1;
  }

  if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
    return [];
  }

  const result: number[] = [];
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    result.push(i);
  }

  return result;
}
