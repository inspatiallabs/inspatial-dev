/**
 * List of known two-part top-level domains (TLDs)
 * @private
 */

const twoPartTlds = [
  "co.uk",
  "co.jp",
  "co.kr",
  "co.nz",
  "co.za",
  "co.in",
  "com.au",
  "com.br",
  "com.cn",
  "com.mx",
  "com.tw",
  "net.au",
  "org.uk",
  "ne.jp",
  "ac.uk",
  "gov.uk",
  "edu.au",
  "gov.au",
];

/**
 * Checks if two domains match by comparing their relevant parts.
 * Handles both single-part and two-part top-level domains (TLDs) correctly.
 *
 * @param a - First domain to compare
 * @param b - Second domain to compare
 * @returns boolean indicating if domains match
 *
 * @example
 * // Single-part top-level domains (TLDs) examples
 * isDomainMatch("example.com", "example.com") // true
 * isDomainMatch("sub.example.com", "example.com") // true
 * isDomainMatch("different.com", "example.com") // false
 *
 * @example
 * // Two-part top-level domains (TLDs) examples
 * isDomainMatch("example.co.uk", "example.co.uk") // true
 * isDomainMatch("sub.example.co.uk", "example.co.uk") // true
 * isDomainMatch("different.co.uk", "example.co.uk") // false
 */
export function isDomainMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const partsA = a.split(".");
  const partsB = b.split(".");
  const hasTwoPartTld = twoPartTlds.some(
    (tld) => a.endsWith("." + tld) || b.endsWith("." + tld)
  );
  const numParts = hasTwoPartTld ? -3 : -2;
  const min = Math.min(partsA.length, partsB.length, numParts);
  const tailA = partsA.slice(min).join(".");
  const tailB = partsB.slice(min).join(".");
  return tailA === tailB;
}
