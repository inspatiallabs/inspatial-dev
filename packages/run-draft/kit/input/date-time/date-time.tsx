// "use client";

// import * as React from "react";
// import { kit } from "@inspatial/theme/variant";
// import {
//   addDays,
//   addMonths,
//   addYears,
//   format,
//   getDaysInMonth,
//   isAfter,
//   isBefore,
//   isSameDay,
//   isSameMonth,
//   isToday,
//   isWithinInterval,
//   startOfMonth,
//   startOfWeek,
//   subMonths,
//   subYears,
//   type Locale,
// } from "date-fns";
// import { Button } from "../button";
// import { type CalendarMode, type DateRange, type Matcher } from "./date-utils";

// //##############################################(TYPES)##############################################//

// /**
//  * Base calendar props
//  */
// interface BaseCalendarProps {
//   /** Mode of the calendar */
//   mode?: CalendarMode;
//   /** Selected date(s) */
//   selected?: Date | DateRange;
//   /** Callback on date selection */
//   onSelect?: (selected: Date | DateRange | undefined) => void;
//   /** Function to determine if a date should be disabled */
//   disabled?: Matcher;
//   /** Day of the week to start (0 = Sunday, 1 = Monday, etc.) */
//   weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
//   /** Number of months to display */
//   numberOfMonths?: number;
//   /** Enable year navigation */
//   enableYearNavigation?: boolean;
//   /** Disable navigation */
//   disableNavigation?: boolean;
//   /** Locale for date formatting */
//   locale?: Locale;
//   /** Class name for the root element */
//   className?: string;
//   /** Class names for various elements */
//   classNames?: {
//     [key: string]: string;
//   };
//   /** Minimum date that can be selected */
//   fromDate?: Date;
//   /** Maximum date that can be selected */
//   toDate?: Date;
// }

// /**
//  * Props for the navigation button component
//  */
// interface NavigationButtonProps
//   extends React.HTMLAttributes<HTMLButtonElement> {
//   onClick: () => void;
//   icon: React.ReactNode;
//   disabled?: boolean;
// }

// //##############################################(NAVIGATION BUTTON)##############################################//

// /**
//  * NavigationButton component for month/year navigation
//  */
// const NavigationButton = React.forwardRef<
//   HTMLButtonElement,
//   NavigationButtonProps
// >(
//   (
//     { onClick, icon, disabled, ...props }: NavigationButtonProps,
//     forwardedRef
//   ) => {
//     return (
//       <Button
//         ref={forwardedRef}
//         type="button"
//         disabled={disabled}
//         variant="ghost"
//         className={kit(
//           "flex cursor-pointer size-8 shrink-0 select-none items-center justify-center rounded border p-1 outline-none transition sm:size-[30px]",
//           // text color
//           "text-muted hover:text-primary",
//           // border color
//           "border-muted hover:border-primary",
//           // background color
//           "hover:bg-surface active:bg-muted",
//           // disabled
//           "disabled:pointer-events-none",
//           "disabled:border-muted disabled:text-muted disabled:opacity-50"
//         )}
//         onClick={onClick}
//         {...props}
//       >
//         {icon}
//       </Button>
//     );
//   }
// );

// NavigationButton.displayName = "NavigationButton";

// //##############################################(CALENDAR COMPONENT)##############################################//

// /**
//  * A dependency-free calendar component that supports single date and date range selection
//  */
// const DateTime = ({
//   mode = "single",
//   selected,
//   onSelect,
//   disabled,
//   weekStartsOn = 1,
//   numberOfMonths = 1,
//   enableYearNavigation = false,
//   disableNavigation,
//   locale,
//   className,
//   classNames,
//   fromDate,
//   toDate,
// }: BaseCalendarProps) => {
//   // Current view states
//   const [currentMonth, setCurrentMonth] = React.useState<Date>(
//     selected
//       ? mode === "single"
//         ? (selected as Date)
//         : (selected as DateRange).from
//       : new Date()
//   );

//   // Helper functions
//   const isDateDisabled = (date: Date): boolean => {
//     if (disabled && disabled(date)) return true;
//     if (fromDate && isBefore(date, fromDate)) return true;
//     if (toDate && isAfter(date, toDate)) return true;
//     return false;
//   };

//   // Navigation functions
//   const goToPreviousMonth = () => {
//     if (disableNavigation) return;
//     setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
//   };

//   const goToNextMonth = () => {
//     if (disableNavigation) return;
//     setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
//   };

//   const goToPreviousYear = () => {
//     if (disableNavigation) return;
//     setCurrentMonth((prevMonth) => subYears(prevMonth, 1));
//   };

//   const goToNextYear = () => {
//     if (disableNavigation) return;
//     setCurrentMonth((prevMonth) => addYears(prevMonth, 1));
//   };

//   // Check if a date is selected
//   const isDateSelected = (date: Date): boolean => {
//     if (!selected) return false;

//     if (mode === "single") {
//       return isSameDay(date, selected as Date);
//     } else {
//       const { from, to } = selected as DateRange;
//       if (!to) return isSameDay(date, from);

//       return isWithinInterval(date, {
//         start: from,
//         end: to,
//       });
//     }
//   };

//   // Check if a date is in the middle of a range
//   const isDateInRange = (date: Date): boolean => {
//     if (mode !== "range" || !selected) return false;

//     const { from, to } = selected as DateRange;
//     if (!from || !to) return false;

//     return (
//       isWithinInterval(date, { start: from, end: to }) &&
//       !isSameDay(date, from) &&
//       !isSameDay(date, to)
//     );
//   };

//   // Check if a date is the start of range
//   const isDateRangeStart = (date: Date): boolean => {
//     if (mode !== "range" || !selected) return false;

//     const { from } = selected as DateRange;
//     return from ? isSameDay(date, from) : false;
//   };

//   // Check if a date is the end of range
//   const isDateRangeEnd = (date: Date): boolean => {
//     if (mode !== "range" || !selected) return false;

//     const { from, to } = selected as DateRange;
//     return from && to ? isSameDay(date, to) : false;
//   };

//   // Handle date selection
//   const handleDateSelect = (date: Date) => {
//     if (isDateDisabled(date)) return;

//     if (mode === "single") {
//       onSelect?.(date);
//     } else {
//       if (!selected || !(selected as DateRange).from) {
//         onSelect?.({ from: date });
//       } else {
//         const { from } = selected as DateRange;

//         if (isBefore(date, from)) {
//           onSelect?.({ from: date, to: from });
//         } else {
//           onSelect?.({ from, to: date });
//         }
//       }
//     }
//   };

//   // Render functions
//   const renderMonthHeader = (monthDate: Date) => {
//     const canGoToPrevious =
//       !fromDate || !isBefore(subMonths(monthDate, 1), fromDate);
//     const canGoToNext = !toDate || !isAfter(addMonths(monthDate, 1), toDate);

//     return (
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1">
//           {enableYearNavigation && (
//             <NavigationButton
//               disabled={disableNavigation}
//               aria-label="Go to previous year"
//               onClick={goToPreviousYear}
//               icon={
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="24"
//                   height="24"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   className="size-4"
//                 >
//                   <path d="m11 17-5-5 5-5" />
//                   <path d="m18 17-5-5 5-5" />
//                 </svg>
//               }
//             />
//           )}
//           <NavigationButton
//             disabled={disableNavigation || !canGoToPrevious}
//             aria-label="Go to previous month"
//             onClick={goToPreviousMonth}
//             icon={
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="size-4"
//               >
//                 <path d="m15 18-6-6 6-6" />
//               </svg>
//             }
//           />
//         </div>

//         <div
//           role="presentation"
//           aria-live="polite"
//           className="text-sm font-medium capitalize tabular-nums text-gray-900 dark:text-gray-50"
//         >
//           {format(monthDate, "LLLL yyyy")}
//         </div>

//         <div className="flex items-center gap-1">
//           <NavigationButton
//             disabled={disableNavigation || !canGoToNext}
//             aria-label="Go to next month"
//             onClick={goToNextMonth}
//             icon={
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="size-4"
//               >
//                 <path d="m9 18 6-6-6-6" />
//               </svg>
//             }
//           />
//           {enableYearNavigation && (
//             <NavigationButton
//               disabled={disableNavigation}
//               aria-label="Go to next year"
//               onClick={goToNextYear}
//               icon={
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="24"
//                   height="24"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   className="size-4"
//                 >
//                   <path d="m13 17 5-5-5-5" />
//                   <path d="m6 17 5-5-5-5" />
//                 </svg>
//               }
//             />
//           )}
//         </div>
//       </div>
//     );
//   };

//   const renderWeekdays = () => {
//     const weekdays = [];
//     const weekStart = startOfWeek(new Date(), { weekStartsOn });

//     for (let i = 0; i < 7; i++) {
//       const day = addDays(weekStart, i);
//       weekdays.push(
//         <th
//           key={i}
//           scope="col"
//           className="w-9 font-medium text-sm sm:text-xs text-center text-gray-400 dark:text-gray-600 pb-2"
//         >
//           {format(day, "EEEEEE")}
//         </th>
//       );
//     }

//     return <tr>{weekdays}</tr>;
//   };

//   const renderDays = (monthDate: Date) => {
//     const monthStart = startOfMonth(monthDate);
//     const startDate = startOfWeek(monthStart, { weekStartsOn });

//     const weeks = [];
//     let days = [];
//     let day = startDate;

//     for (let i = 0; i < 42; i++) {
//       const currentDay = new Date(day); // Create new date instance for each day
//       const isCurrentMonth = isSameMonth(currentDay, monthDate);
//       const isSelected = isDateSelected(currentDay);
//       const isDisabled = isDateDisabled(currentDay);
//       const isRangeStart = isDateRangeStart(currentDay);
//       const isRangeEnd = isDateRangeEnd(currentDay);
//       const isRangeMiddle = isDateInRange(currentDay);

//       days.push(
//         <td
//           key={i}
//           className={kit(
//             "relative p-0 text-center focus-within:relative",
//             "text-gray-900 dark:text-gray-50"
//           )}
//         >
//           <button
//             type="button"
//             onClick={() => handleDateSelect(currentDay)}
//             disabled={isDisabled}
//             className={kit(
//               "size-9 rounded text-sm",
//               "text-gray-900 dark:text-gray-50",
//               "hover:bg-gray-200 hover:dark:bg-gray-700",
//               {
//                 "font-semibold": isToday(currentDay),
//                 "text-gray-400 dark:text-gray-600": !isCurrentMonth,
//                 "bg-gray-900 text-gray-50 dark:bg-gray-50 dark:text-gray-900":
//                   isSelected && !isRangeMiddle,
//                 "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50":
//                   isRangeMiddle,
//                 "rounded-r-none": isRangeStart,
//                 "rounded-l-none": isRangeEnd,
//                 "text-gray-300 dark:text-gray-700 line-through disabled:hover:bg-transparent":
//                   isDisabled,
//               }
//             )}
//           >
//             {currentDay.getDate()}
//             {isToday(currentDay) && (
//               <span
//                 className={kit(
//                   "absolute inset-x-1/2 bottom-1.5 h-0.5 w-4 -translate-x-1/2 rounded-[2px]",
//                   {
//                     "bg-blue-500 dark:bg-blue-500": !isSelected,
//                     "!bg-white dark:!bg-gray-950": isSelected && !isRangeMiddle,
//                     "!bg-gray-400 dark:!bg-gray-600":
//                       isSelected && isRangeMiddle,
//                     "bg-gray-400 text-gray-400 dark:bg-gray-400 dark:text-gray-600":
//                       isDisabled,
//                   }
//                 )}
//               />
//             )}
//           </button>
//         </td>
//       );

//       if ((i + 1) % 7 === 0) {
//         weeks.push(<tr key={currentDay.toISOString()}>{days}</tr>);
//         days = [];
//       }

//       day = addDays(day, 1);
//     }

//     return weeks;
//   };

//   const renderCalendarGrid = (monthDate: Date) => {
//     return (
//       <div className="space-y-4 p-3 min-w-full">
//         {renderMonthHeader(monthDate)}
//         <table className="min-w-full border-collapse space-y-1">
//           <thead>{renderWeekdays()}</thead>
//           <tbody>{renderDays(monthDate)}</tbody>
//         </table>
//       </div>
//     );
//   };

//   // Render months
//   const renderMonths = () => {
//     const months = [];

//     for (let i = 0; i < numberOfMonths; i++) {
//       const monthDate = addMonths(currentMonth, i);
//       months.push(
//         <div key={i} className="space-y-4 min-w-fulsl">
//           {renderCalendarGrid(monthDate)}
//         </div>
//       );
//     }

//     return (
//       <div
//         className={kit(
//           "flex space-y-0",
//           numberOfMonths > 1 ? "flex-wrap gap-2" : ""
//         )}
//       >
//         {months}
//       </div>
//     );
//   };

//   return <div className={kit("p-3", className)}>{renderMonths()}</div>;
// };

// DateTime.displayName = "DateTime";

// export { DateTime };
