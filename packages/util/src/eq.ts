/*##############################################(EQ)##############################################*/

/**
 * Wraps a mathematical expression in LaTeX inline math delimiters
 * @param exp - The mathematical expression to be wrapped
 * @returns The expression wrapped in LaTeX inline math delimiters (\( \))
 * @example
 * eq('x^2') // Returns '\( x^2 \)'
 */
export function eq(exp: string): string {
  return `\\( ${exp} \\)`;
}
