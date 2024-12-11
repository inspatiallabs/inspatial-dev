/*##############################################(FORMAT-TIME-UTIL)##############################################*/

interface TimeFormatOptions {
  showHours?: boolean;
  showMilliseconds?: boolean;
  padZeros?: boolean;
}

/**
 * Formats milliseconds into a human-readable time string
 * @param ms - Time in milliseconds
 * @param options - Formatting options
 * @returns Formatted time string (e.g., "01:23:45" or "23:45")
 *
 *  * @example
 * // Basic usage
 * formatTime(3661000) // "01:01:01"
 *
 * // Hide hours
 * formatTime(61000, { showHours: false }) // "01:01"
 *
 * // Show milliseconds
 * formatTime(61001, { showMilliseconds: true }) // "00:01:01.001"
 *
 * // Without zero padding
 * formatTime(61000, { padZeros: false }) // "1:1:1"
 */
export function formatTime(
  ms: number,
  options: TimeFormatOptions = {}
): string {
  const {
    showHours = true,
    showMilliseconds = false,
    padZeros = true,
  } = options;

  if (!Number.isFinite(ms) || ms < 0) return "00:00";

  const milliseconds = Math.floor(ms % 1000);
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  const pad = (num: number) =>
    padZeros ? num.toString().padStart(2, "0") : num.toString();

  let timeString = `${pad(minutes)}:${pad(seconds)}`;

  if (showHours || hours > 0) timeString = `${pad(hours)}:${timeString}`;
  if (showMilliseconds)
    timeString = `${timeString}.${milliseconds.toString().padStart(3, "0")}`;

  return timeString;
}
