// /*##############################################(IMPORTS)##############################################*/


// import {
//   eachDayOfInterval,
//   eachHourOfInterval,
//   eachMonthOfInterval,
//   eachWeekOfInterval,
//   endOfDay,
//   endOfMonth,
//   endOfYear,
//   format,
//   differenceInDays,
//   getWeekOfMonth,
//   isSameDay,
//   isSameMonth,
//   isSameWeek,
//   isWithinInterval,
//   startOfDay,
//   startOfMonth,
//   startOfYear,
// } from "npm:date-fns@^4.1.0";

// /*##############################################(CALENDER-UTILITY)##############################################*/
// // A flexible and reusable calender and appointment utility function that can be used
// // across different calendar implementations. You can define your own appointment structure and provide
// // a way to extract dates in a composable manner.
// // @Status: (Preview) - Not tested

// /***********************************(Types)***********************************/
// export type DateRange = {
//   from: Date | undefined;
//   to?: Date | undefined;
// };

// export interface GenericCalendarAppointment {
//   start: Date | string;
//   [key: string]: string | number | boolean; 
// }

// /***********************************(Calculate New Dates)***********************************/
// /**
//  * Calculate new start and end dates based on view mode and index change
//  */
// export const calculateNewDates = (
//   viewMode: string,
//   index: number,
//   currentIndex: number,
//   dateRange: DateRange
// ) => {
//   let start = new Date(dateRange.from as Date);
//   let end = new Date(dateRange.to as Date);
//   const delta = (currentIndex - index) * -1;

//   switch (viewMode) {
//     case "day":
//       // Adjust hours for day view
//       start.setHours(start.getHours() + delta);
//       end.setHours(end.getHours() + delta);
//       break;
//     case "week":
//     case "month":
//       // Adjust days for week and month views
//       start.setDate(start.getDate() + delta);
//       end.setDate(end.getDate() + delta);
//       break;
//     case "year":
//       // Set to specific month for year view
//       start = new Date(dateRange.from as Date);
//       start.setMonth(index);
//       end = new Date(start);
//       end.setMonth(start.getMonth() + 1);
//       break;
//   }
//   return { start, end };
// };

// /***********************************(Filter Appointments)***********************************/
// /**
//  * Filter appointments based on date range and view mode
//  */
// export const filterAppointments = <T extends GenericCalendarAppointment>(
//   appt: T,
//   index: number,
//   dateRange: DateRange,
//   viewMode: string,
//   getAppointmentDate: (appointment: T) => Date
// ): boolean => {
//   const apptDate = getAppointmentDate(appt);
//   // Check if appointment is within the date range
//   if (
//     !dateRange.from ||
//     !dateRange.to ||
//     !isWithinInterval(apptDate, { start: dateRange.from, end: dateRange.to })
//   ) {
//     return false;
//   }
//   return isAppointmentInSlot(apptDate, index, viewMode, dateRange);
// };

// /*##############################################(APPOINTMENT)##############################################*/

// /***********************************(Is Appointment In Slot)***********************************/
// /**
//  * Check if an appointment should be displayed in a specific slot
//  */
// const isAppointmentInSlot = (
//   apptDate: Date,
//   index: number,
//   viewMode: string,
//   dateRange: DateRange
// ): boolean => {
//   if (!dateRange.from) return false;

//   switch (viewMode) {
//     case "day":
//       // Check if appointment is in the correct hour and day
//       return (
//         apptDate.getHours() === index && isSameDay(apptDate, dateRange.from)
//       );
//     case "week":
//       // Check if appointment is on the correct day of the week
//       return (
//         apptDate.getDay() -
//           (6 -
//             differenceInDays(
//               new Date(dateRange.to!),
//               new Date(dateRange.from)
//             )) ===
//           index && isSameWeek(apptDate, dateRange.from)
//       );
//     case "month":
//       // Check if appointment is in the correct week of the month
//       return (
//         getWeekOfMonth(apptDate) === index &&
//         isSameMonth(apptDate, dateRange.from)
//       );
//     case "year":
//       // Check if appointment is in the correct month
//       return apptDate.getMonth() === index;
//     default:
//       return false;
//   }
// };

// // Generate labels for different view modes
// export const getLabelsForView = (
//   viewMode: "day" | "week" | "month" | "year",
//   dateRange: { start: Date; end: Date }
// ): string[] => {
//   switch (viewMode) {
//     case "day":
//       // Hourly labels (e.g., "14:00")
//       return eachHourOfInterval({
//         start: startOfDay(dateRange.start),
//         end: endOfDay(dateRange.end),
//       }).map((hour: string | number | Date) => format(hour, "HH:mm"));
//     case "week":
//       // Daily labels (e.g., "Mon the 1st")
//       return eachDayOfInterval({
//         start: dateRange.start,
//         end: dateRange.end,
//       }).map(
//         (day: string | number | Date) =>
//           `${format(day, "ccc ")} the ${format(day, "do")}`
//       );
//     case "month":
//       // Weekly labels (e.g., "1st week of Jan")
//       return eachWeekOfInterval({
//         start: startOfMonth(dateRange.start),
//         end: endOfMonth(dateRange.end),
//       }).map(
//         (week: string | number | Date) =>
//           `${format(week, "wo")} week of ${format(week, "MMM")}`
//       );
//     case "year":
//       // Monthly labels (e.g., "Jan")
//       return eachMonthOfInterval({
//         start: startOfYear(dateRange.start),
//         end: endOfYear(dateRange.end),
//       }).map((month: string | number | Date) => format(month, "MMM"));
//     default:
//       return [];
//   }
// };
