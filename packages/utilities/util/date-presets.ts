/*##############################################(DATE-PRESETS-UTILITY)##############################################*/

/***********************************(Get Relative Date)***********************************/
/**
 * Generates a date relative to the current date.
 * @param {number} days - Number of days to add (can be negative for past dates).
 * @param {number} months - Number of months to add (can be negative for past dates).
 * @param {number} years - Number of years to add (can be negative for past dates).
 * @returns {Date} The calculated date.
 */
function getRelativeDate(days = 0, months = 0, years = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setMonth(date.getMonth() + months);
  date.setFullYear(date.getFullYear() + years);
  return date;
}

/***********************************(Date Presets)***********************************/
/**
 * A collection of date presets for calendar components.
 */
export const datePresets = [
  { label: "Today", date: () => new Date() },
  { label: "Tomorrow", date: () => getRelativeDate(1) },
  { label: "A week from now", date: () => getRelativeDate(7) },
  { label: "A month from now", date: () => getRelativeDate(0, 1) },
  { label: "6 months from now", date: () => getRelativeDate(0, 6) },
  { label: "A year from now", date: () => getRelativeDate(0, 0, 1) },
  { label: "Yesterday", date: () => getRelativeDate(-1) },
  { label: "A week ago", date: () => getRelativeDate(-7) },
  { label: "A month ago", date: () => getRelativeDate(0, -1) },
];

/***********************************(Types)***********************************/
/**
 * Type definition for a date preset.
 */
export interface DatePreset {
  label: string;
  date: () => Date;
}

/***********************************(Get Date Preset By Label)***********************************/
/**
 * Retrieves a specific date preset by its label.
 * @param {string} label - The label of the desired preset.
 * @returns {DatePreset | undefined} The matching date preset or undefined if not found.
 * @example getDatePresetByLabel("Today")
 */
export function getDatePresetByLabel(label: string): DatePreset | undefined {
  return datePresets.find((preset) => preset.label === label);
}

/***********************************(Add Custom Date Preset)***********************************/
/**
 * Adds a custom date preset to the collection.
 * @param {string} label - The label for the new preset.
 * @param {() => Date} dateFunction - A function that returns the desired Date.
 * @example addCustomDatePreset("Next week", () => getRelativeDate(7))
 */
export function addCustomDatePreset(
  label: string,
  dateFunction: () => Date
): void {
  datePresets.push({ label, date: dateFunction });
}
