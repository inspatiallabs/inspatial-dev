// import { type Locale, format, isValid, isBefore, isAfter, startOfDay } from "date-fns";

// //##############################################(TYPES)##############################################//

// export interface DateRange {
//   from: Date;
//   to?: Date;
// }

// export interface DateParts {
//   day: number;
//   month: number;
//   year: number;
// }

// export type CalendarMode = "single" | "range";
// export type Matcher = (date: Date) => boolean;

// //##############################################(VALIDATION)##############################################//

// export const dateUtils = {
//   /**
//    * Validates a date parts object
//    */
//   validateDateParts: (date: DateParts): boolean => {
//     const d = new Date(date.year, date.month - 1, date.day);
//     return (
//       isValid(d) &&
//       d.getFullYear() === date.year &&
//       d.getMonth() + 1 === date.month &&
//       d.getDate() === date.day
//     );
//   },

//   /**
//    * Converts DateParts to Date object
//    */
//   partsToDate: (parts: DateParts): Date => {
//     return new Date(parts.year, parts.month - 1, parts.day);
//   },

//   /**
//    * Converts Date to DateParts
//    */
//   dateToParts: (date: Date): DateParts => {
//     return {
//       day: date.getDate(),
//       month: date.getMonth() + 1,
//       year: date.getFullYear()
//     };
//   },

//   /**
//    * Formats a date with consistent formatting
//    */
//   formatDate: (date: Date, locale: string = "en-us"): string => {
//     return date.toLocaleDateString(locale, {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   },

//   /**
//    * Adjusts a date for timezone
//    */
//   getDateAdjustedForTimezone: (dateInput: Date | string): Date => {
//     if (typeof dateInput === "string") {
//       const parts = dateInput.split("-").map(part => parseInt(part, 10));
//       return new Date(parts[0]!, parts[1]! - 1, parts[2]);
//     }
//     return startOfDay(dateInput);
//   },

//   /**
//    * Validates a date range
//    */
//   validateDateRange: (range: DateRange): boolean => {
//     if (!range.from || !isValid(range.from)) return false;
//     if (range.to && (!isValid(range.to) || isBefore(range.to, range.from))) return false;
//     return true;
//   }
// };

// //##############################################(CONSTANTS)##############################################//

// export const DATE_PRESETS = [
//   { name: "today", label: "Today" },
//   { name: "yesterday", label: "Yesterday" },
//   { name: "last7", label: "Last 7 days" },
//   { name: "last14", label: "Last 14 days" },
//   { name: "last30", label: "Last 30 days" },
//   { name: "thisWeek", label: "This Week" },
//   { name: "lastWeek", label: "Last Week" },
//   { name: "thisMonth", label: "This Month" },
//   { name: "lastMonth", label: "Last Month" }
// ] as const;

// export type DatePreset = typeof DATE_PRESETS[number]["name"];

// //##############################################(HOOKS)##############################################//

// export interface UseDateStateConfig {
//   initialDate?: Date;
//   onChange?: (date: Date) => void;
//   min?: Date;
//   max?: Date;
// }

// export interface UseDateRangeConfig {
//   initialRange?: DateRange;
//   onChange?: (range: DateRange) => void;
//   min?: Date;
//   max?: Date;
// } 