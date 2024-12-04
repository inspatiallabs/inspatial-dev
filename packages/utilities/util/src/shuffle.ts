/*##############################################(SHUFFLE-UTIL)##############################################*/

/**
 * A simple utility function that shuffles items in an array.
 * @example shuffle([1, 2, 3, 4, 5])
 * @returns [3, 1, 4, 5, 2]
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}


