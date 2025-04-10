// Instead of destructuring, use String.prototype.replace directly
const stringReplace = String.prototype.replace;

// escape
const ca = /[<>&\xA0]/g;

const esca: Record<string, string> = {
  "\xA0": "&#160;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

/**
 * Helper function that returns the HTML entity replacement for a matched character
 * Used as the replacement function in the escape process
 *
 * @param m - The matched character to be replaced
 * @returns The corresponding HTML entity from the esca mapping
 **/
const pe = (m: string): string => esca[m];

/**
 * Safely escape HTML entities such as `&`, `<`, `>` only.
 * @param {string} es the input to safely escape
 * @returns {string} the escaped input, and it **throws** an error if
 *  the input type is unexpected, except for boolean and numbers,
 *  converted as string.
 */
export const escapeHtml = (es: string): string =>
  stringReplace.call(es, ca, pe);
