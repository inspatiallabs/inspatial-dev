/**
 * Converts a camelCase or PascalCase string to kebab-case (hyphenated lowercase)
 *
 * This function transforms strings by:
 * - Inserting hyphens between word boundaries
 * - Converting all characters to lowercase
 *
 * @param camel - The camelCase or PascalCase string to convert
 * @returns The hyphenated lowercase string
 *
 * @example
 * hyphenize("camelCase") // returns "camel-case"
 * hyphenize("PascalCase") // returns "pascal-case"
 * hyphenize("ABCTest") // returns "abc-test"
 **/
export default function hyphenize(camel: string): string {
  return camel
    .replace(/(([A-Z0-9])([A-Z0-9][a-z]))|(([a-z0-9]+)([A-Z]))/g, "$2$5-$3$6")
    .toLowerCase();
}
