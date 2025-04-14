// import { useState, useCallback, useEffect } from "react";
// import { isBefore, isAfter, startOfDay } from "date-fns";
// import {
//   type DateParts,
//   type DateRange,
//   type UseDateStateConfig,
//   type UseDateRangeConfig,
//   dateUtils
// } from "./date-utils";

// //##############################################(SINGLE DATE HOOK)##############################################//

// export function useDateState({
//   initialDate,
//   onChange,
//   min,
//   max
// }: UseDateStateConfig = {}) {
//   const [date, setDate] = useState<DateParts>(() => {
//     const d = initialDate ? dateUtils.getDateAdjustedForTimezone(initialDate) : new Date();
//     return dateUtils.dateToParts(d);
//   });

//   const isDateValid = useCallback((parts: DateParts): boolean => {
//     if (!dateUtils.validateDateParts(parts)) return false;
//     const d = dateUtils.partsToDate(parts);
//     if (min && isBefore(d, min)) return false;
//     if (max && isAfter(d, max)) return false;
//     return true;
//   }, [min, max]);

//   const updateDate = useCallback((newDate: DateParts) => {
//     if (isDateValid(newDate)) {
//       setDate(newDate);
//       onChange?.(dateUtils.partsToDate(newDate));
//     }
//   }, [isDateValid, onChange]);

//   useEffect(() => {
//     if (initialDate) {
//       const parts = dateUtils.dateToParts(dateUtils.getDateAdjustedForTimezone(initialDate));
//       setDate(parts);
//     }
//   }, [initialDate]);

//   return {
//     date,
//     updateDate,
//     isDateValid
//   };
// }

// //##############################################(DATE RANGE HOOK)##############################################//

// export function useDateRange({
//   initialRange,
//   onChange,
//   min,
//   max
// }: UseDateRangeConfig = {}) {
//   const [range, setRange] = useState<DateRange>(() => ({
//     from: initialRange?.from ? dateUtils.getDateAdjustedForTimezone(initialRange.from) : new Date(),
//     to: initialRange?.to ? dateUtils.getDateAdjustedForTimezone(initialRange.to) : undefined
//   }));

//   const isRangeValid = useCallback((newRange: DateRange): boolean => {
//     if (!dateUtils.validateDateRange(newRange)) return false;
//     if (min && isBefore(newRange.from, min)) return false;
//     if (max && newRange.to && isAfter(newRange.to, max)) return false;
//     return true;
//   }, [min, max]);

//   const updateRange = useCallback((newRange: DateRange) => {
//     if (isRangeValid(newRange)) {
//       setRange(newRange);
//       onChange?.(newRange);
//     }
//   }, [isRangeValid, onChange]);

//   useEffect(() => {
//     if (initialRange) {
//       const adjustedRange = {
//         from: dateUtils.getDateAdjustedForTimezone(initialRange.from),
//         to: initialRange.to ? dateUtils.getDateAdjustedForTimezone(initialRange.to) : undefined
//       };
//       if (isRangeValid(adjustedRange)) {
//         setRange(adjustedRange);
//       }
//     }
//   }, [initialRange, isRangeValid]);

//   return {
//     range,
//     updateRange,
//     isRangeValid
//   };
// } 