// Type definition for HTML element constructor
export type HTMLElementConstructor = new (ownerDocument?: any, localName?: string) => any;

// Map to store HTML element classes keyed by tag name (both lowercase and uppercase)
export const htmlClasses = new Map<string, HTMLElementConstructor>();

/**
 * Register HTML element classes for specified tag names
 * @param {string|string[]} names - Tag name or array of tag names to register
 * @param {HTMLElementConstructor} Class - The HTML element class to register
 */
export const registerHTMLClass = (names: string | string[], Class: HTMLElementConstructor): void => {
  // Ensure names is treated as an array of strings
  const nameArray = Array.isArray(names) ? names : [names];
  
  for (const name of nameArray) {
    htmlClasses.set(name, Class);
    htmlClasses.set(name.toUpperCase(), Class);
  }
};

/**
 * Simplified alias for registerHTMLClass
 * @param {string|string[]} names - Tag name or array of tag names to register
 * @param {HTMLElementConstructor} Class - The HTML element class to register
 */
export const register = registerHTMLClass;
