// "use client";

// import React from "react";
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   isSameMonth,
//   isSameDay,
//   isToday,
//   addMonths,
//   subMonths,
//   parseISO,
//   startOfWeek,
//   endOfWeek,
//   addWeeks,
//   subWeeks,
//   addDays,
//   subDays,
//   addYears,
//   subYears,
//   startOfYear,
//   endOfYear,
// } from "@inspatial/util/date";
// import { Button, Badge } from "@inspatial/kit/ornament";
// import ScrollView from "@inspatial/kit/structure";
// import { CaretLeftIcon, CaretRightIcon } from "@inspatial/kit/icon";

// export type CalendarViewType = "day" | "week" | "month" | "year";

// export interface CalendarEvent {
//   id: string;
//   title: string;
//   date: Date;
//   itemCount?: number;
//   data?: any;
// }

// export interface CalendarWidgetProps<T extends CalendarEvent> {
//   /**
//    * Array of events to display in the calendar
//    */
//   events: T[];

//   /**
//    * Initial view type (day, week, month, year)
//    */
//   initialViewType?: CalendarViewType;

//   /**
//    * Initial date to display
//    */
//   initialDate?: Date;

//   /**
//    * Callback when an event is clicked
//    */
//   onEventClick?: (event: T) => void;

//   /**
//    * Callback when a date is clicked (for adding a new event)
//    */
//   onDateClick?: (date: Date) => void;

//   /**
//    * Custom renderer for event items
//    */
//   renderEvent?: (event: T) => React.ReactNode;

//   /**
//    * Class name for the container
//    */
//   className?: string;
// }

// /**
//  * A primitive calendar view component that can be used to display events
//  */
// export function CalendarWidget<T extends CalendarEvent>({
//   events,
//   initialViewType = "month",
//   initialDate = new Date(),
//   onEventClick,
//   onDateClick,
//   renderEvent,
//   className,
// }: CalendarWidgetProps<T>) {
//   const [currentDate, setCurrentDate] = React.useState(initialDate);
//   const [viewType, setViewType] =
//     React.useState<CalendarViewType>(initialViewType);

//   // Navigation functions based on current view type
//   const handlePrevious = () => {
//     switch (viewType) {
//       case "day":
//         setCurrentDate(subDays(currentDate, 1));
//         break;
//       case "week":
//         setCurrentDate(subWeeks(currentDate, 1));
//         break;
//       case "month":
//         setCurrentDate(subMonths(currentDate, 1));
//         break;
//       case "year":
//         setCurrentDate(subYears(currentDate, 1));
//         break;
//     }
//   };

//   const handleNext = () => {
//     switch (viewType) {
//       case "day":
//         setCurrentDate(addDays(currentDate, 1));
//         break;
//       case "week":
//         setCurrentDate(addWeeks(currentDate, 1));
//         break;
//       case "month":
//         setCurrentDate(addMonths(currentDate, 1));
//         break;
//       case "year":
//         setCurrentDate(addYears(currentDate, 1));
//         break;
//     }
//   };

//   // Generate days based on the current view type
//   const days = React.useMemo(() => {
//     switch (viewType) {
//       case "day":
//         return [currentDate];
//       case "week":
//         const weekStart = startOfWeek(currentDate);
//         const weekEnd = endOfWeek(currentDate);
//         return eachDayOfInterval({ start: weekStart, end: weekEnd });
//       case "month":
//         const monthStart = startOfMonth(currentDate);
//         const monthEnd = endOfMonth(currentDate);
//         return eachDayOfInterval({ start: monthStart, end: monthEnd });
//       case "year":
//         const yearStart = startOfYear(currentDate);
//         const yearEnd = endOfYear(currentDate);
//         return eachDayOfInterval({ start: yearStart, end: yearEnd });
//       default:
//         return [];
//     }
//   }, [currentDate, viewType]);

//   // Group days by month for year view
//   interface MonthGroup {
//     month: number;
//     name: string;
//     days: Date[];
//   }

//   const monthsInYear = React.useMemo<MonthGroup[]>(() => {
//     if (viewType !== "year") return [];

//     const months: { [key: number]: { name: string; days: Date[] } } = {};

//     days.forEach((day) => {
//       const month = day.getMonth();
//       if (!months[month]) {
//         months[month] = {
//           name: format(day, "MMMM"),
//           days: [],
//         };
//       }
//       months[month].days.push(day);
//     });

//     return Object.entries(months).map(([monthNumber, data]) => ({
//       month: parseInt(monthNumber, 10),
//       name: data.name,
//       days: data.days,
//     }));
//   }, [days, viewType]);

//   // Group events by date for efficient lookup
//   const eventsByDate = React.useMemo(() => {
//     const eventMap: Record<string, T[]> = {};

//     events.forEach((event) => {
//       const dateKey = format(new Date(event.date), "yyyy-MM-dd");
//       if (!eventMap[dateKey]) {
//         eventMap[dateKey] = [];
//       }
//       eventMap[dateKey].push(event);
//     });

//     return eventMap;
//   }, [events]);

//   // Get the appropriate title for the current view
//   const getViewTitle = () => {
//     switch (viewType) {
//       case "day":
//         return format(currentDate, "EEEE, MMMM d, yyyy");
//       case "week":
//         const weekStart = startOfWeek(currentDate);
//         const weekEnd = endOfWeek(currentDate);
//         return `${format(weekStart, "MMM d")} - ${format(
//           weekEnd,
//           "MMM d, yyyy"
//         )}`;
//       case "month":
//         return format(currentDate, "MMMM yyyy");
//       case "year":
//         return format(currentDate, "yyyy");
//       default:
//         return "";
//     }
//   };

//   // Default event renderer if none provided
//   const defaultEventRenderer = (event: T) => (
//     <div
//       key={event.id}
//       className="text-sm bg-brand text-surface rounded p-3 cursor-pointer truncate"
//       onClick={(e) => {
//         e.stopPropagation();
//         onEventClick?.(event);
//       }}
//     >
//       {event.title}
//       {event.itemCount !== undefined && event.itemCount > 0 && (
//         <span className="ml-1 text-xs font-medium">({event.itemCount})</span>
//       )}
//     </div>
//   );

//   // Use the provided renderer or the default
//   const eventRenderer = renderEvent || defaultEventRenderer;

//   return (
//     <ScrollView
//       className={`bg-surface rounded-md shadow-effect overflow-hidden ${
//         className || ""
//       }`}
//     >
//       {/* Calendar Header with Navigation */}
//       <div className="p-4 flex items-center justify-between bg-muted/20">
//         <h2 className="text-md font-bold">{getViewTitle()}</h2>

//         <div className="flex items-center">
//           {/* Navigation Buttons */}
//           <div className="flex items-center gap-[2px]">
//             <Button
//               variant="outline"
//               size="sm"
//               className="cursor-pointer rounded-r-none hover:shadow-line hover:bg-surface hover:text-primary"
//               onClick={handlePrevious}
//             >
//               <CaretLeftIcon className="size-4 cursor-pointer" />
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               className="cursor-pointer rounded-l-none hover:shadow-line hover:bg-surface hover:text-primary"
//               onClick={handleNext}
//             >
//               <CaretRightIcon className="size-4 cursor-pointer" />
//             </Button>
//           </div>

//           {/* Today Button */}
//           <Button
//             variant="default"
//             size="sm"
//             onClick={() => setCurrentDate(new Date())}
//             className={`ml-2 h-10 rounded-r-none border-2 border-muted ${
//               isToday(currentDate)
//                 ? "bg-muted shadow-hollow text-primary"
//                 : "bg-surface text-primary"
//             }`}
//           >
//             Today
//           </Button>

//           {/* View Type Buttons */}
//           <div className="flex border rounded-md rounded-l-none mr-4">
//             <Button
//               variant={viewType === "day" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => setViewType("day")}
//               className={`rounded-none shadow-effect hover:shadow-subtle hover:bg-surface hover:text-primary ${
//                 viewType === "day" ? "bg-brand text-surface" : "text-primary"
//               }`}
//             >
//               Day
//             </Button>
//             <Button
//               variant={viewType === "week" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => setViewType("week")}
//               className={`rounded-none hover:shadow-subtle hover:bg-surface hover:text-primary border-l ${
//                 viewType === "week" ? "bg-brand text-surface" : "text-primary"
//               }`}
//             >
//               Week
//             </Button>
//             <Button
//               variant={viewType === "month" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => setViewType("month")}
//               className={`rounded-none hover:shadow-subtle hover:bg-surface hover:text-primary border-l ${
//                 viewType === "month" ? "bg-brand text-surface" : "text-primary"
//               }`}
//             >
//               Month
//             </Button>
//             <Button
//               variant={viewType === "year" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => setViewType("year")}
//               className={`rounded-none hover:shadow-subtle hover:bg-surface hover:text-primary rounded-r-md border-l ${
//                 viewType === "year" ? "bg-brand text-surface" : "text-primary"
//               }`}
//             >
//               Year
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Days of Week Header */}
//       {viewType !== "day" && (
//         <div className="grid grid-cols-7 border-b border-t bg-background">
//           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//             <div
//               key={day}
//               className="py-2 text-center text-sm uppercase font-bold border-r last:border-r-0"
//             >
//               {day}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Calendar Grid */}
//       {viewType === "day" ? (
//         <div className="grid grid-cols-1 auto-rows-fr h-[calc(100vh-250px)]">
//           {days.map((day) => {
//             const dateKey = format(day, "yyyy-MM-dd");
//             const dayEvents = eventsByDate[dateKey] || [];

//             return (
//               <div
//                 key={day.toString()}
//                 className={`
//                   border-r border-b p-1 relative min-h-[120px]
//                   ${isToday(day) ? "bg-background" : ""}
//                 `}
//                 onClick={() => onDateClick?.(day)}
//               >
//                 <div className="flex justify-between">
//                   <span
//                     className={`
//                     text-sm bg-secondary font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center
//                     ${isToday(day) ? "bg-primary text-primary-foreground" : ""}
//                   `}
//                   >
//                     {format(day, "d")}
//                   </span>
//                   {dayEvents.length > 0 && (
//                     <Badge
//                       variant="public"
//                       className="bg-primary text-surface font-bold size-12 items-center justify-center"
//                     >
//                       {dayEvents.length}
//                     </Badge>
//                   )}
//                 </div>

//                 {dayEvents.length > 0 && (
//                   <ScrollView className="h-[calc(100%-30px)] mt-1">
//                     <div className="space-y-1">
//                       {dayEvents.map(eventRenderer)}
//                     </div>
//                   </ScrollView>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       ) : viewType === "year" ? (
//         <div className="grid grid-cols-4 gap-4 p-4 auto-rows-fr h-[calc(100vh-250px)] overflow-auto">
//           {monthsInYear.map((month) => (
//             <div key={month.name} className="border rounded-md overflow-hidden">
//               <div className="text-sm font-bold p-2 bg-muted/20 border-b">
//                 {month.name}
//               </div>
//               <div className="grid grid-cols-7 gap-0.5 p-1">
//                 {month.days.map((day) => {
//                   const dateKey = format(day, "yyyy-MM-dd");
//                   const dayEvents = eventsByDate[dateKey] || [];

//                   return (
//                     <div
//                       key={day.toString()}
//                       className={`
//                         p-0.5 text-center relative
//                         ${isToday(day) ? "bg-background font-bold" : ""}
//                       `}
//                       onClick={() => onDateClick?.(day)}
//                     >
//                       <div className="text-xs">{format(day, "d")}</div>
//                       {dayEvents.length > 0 && (
//                         <div className="mt-0.5 w-2 h-2 rounded-full bg-primary mx-auto"></div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-7 auto-rows-fr h-[calc(100vh-250px)]">
//           {days.map((day) => {
//             const dateKey = format(day, "yyyy-MM-dd");
//             const dayEvents = eventsByDate[dateKey] || [];
//             const isCurrentMonth = isSameMonth(day, currentDate);

//             return (
//               <div
//                 key={day.toString()}
//                 className={`
//                   border-r border-b p-1 relative min-h-[120px]
//                   ${
//                     !isCurrentMonth && viewType === "month" ? "bg-muted/10" : ""
//                   }
//                   ${isToday(day) ? "bg-background" : ""}
//                 `}
//                 onClick={() => onDateClick?.(day)}
//               >
//                 <div className="flex justify-between">
//                   <span
//                     className={`
//                     text-sm bg-secondary font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center
//                     ${isToday(day) ? "bg-primary text-primary-foreground" : ""}
//                   `}
//                   >
//                     {format(day, "d")}
//                   </span>
//                   {dayEvents.length > 0 && (
//                     <Badge
//                       variant="public"
//                       className="bg-primary text-surface font-bold size-12 items-center justify-center"
//                     >
//                       {dayEvents.length}
//                     </Badge>
//                   )}
//                 </div>

//                 {dayEvents.length > 0 && (
//                   <ScrollView className="h-[calc(100%-30px)] mt-1">
//                     <div className="space-y-1">
//                       {dayEvents.map(eventRenderer)}
//                     </div>
//                   </ScrollView>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </ScrollView>
//   );
// }
