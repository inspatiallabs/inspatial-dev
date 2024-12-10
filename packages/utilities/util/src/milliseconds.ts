/**
 * Represents time units for duration calculations
 * @typedef {("ms"|"s"|"m"|"h"|"d")} Unit
 */
type Unit = "ms" | "s" | "m" | "h" | "d";

/**
 * Represents a duration string in the format "number unit" or "numberunit"
 * @example "30 s" or "30s" for 30 seconds
 * @example "24 h" or "24h" for 24 hours
 */
export type Duration = `${number} ${Unit}` | `${number}${Unit}`;

/**
 * Converts a human-readable duration string or number to milliseconds
 * @param {Duration | number} d - Duration string (e.g., "30s", "1 h") or milliseconds as number
 * @returns {number} The duration in milliseconds
 * @throws {Error} If the duration string format is invalid
 * @example
 * milliseconds("1 s")    // returns 1000
 * milliseconds("1m")     // returns 60000
 * milliseconds("2 h")    // returns 7200000
 * milliseconds(1000)     // returns 1000
 */
export function milliseconds(d: Duration | number): number {
  if (typeof d === "number") {
    return d;
  }
  const match = d.match(/^(\d+)\s?(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Unable to parse window size: ${d}`);
  }
  const time = Number.parseInt(match[1]);
  const unit = match[2] as Unit;

  switch (unit) {
    case "ms":
      return time;
    case "s":
      return time * 1000;
    case "m":
      return time * 1000 * 60;
    case "h":
      return time * 1000 * 60 * 60;
    case "d":
      return time * 1000 * 60 * 60 * 24;

    default:
      throw new Error(`Unable to parse window size: ${d}`);
  }
}
