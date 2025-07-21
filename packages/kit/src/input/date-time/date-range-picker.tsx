// /* eslint-disable max-lines */
// "use client";

// import { type FC, useState, useEffect, useRef } from "react";
// import { kit } from "@inspatial/util";
// import { Button } from "../button";
// import { Popover, PopoverContent, PopoverTrigger } from "../popover";
// import { DateTime } from "./date-time";
// import { Label } from "../label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../select";
// import { ChevronUpIcon, ChevronDownIcon, CheckIcon } from "lucide-react";
// import { DateInput } from "./date-input";
// import { Switch } from "../Switch";
// import { 
//   type DateRange, 
//   type DatePreset, 
//   DATE_PRESETS,
//   dateUtils
// } from "./date-utils";
// import { useDateRange } from "./date-hooks";

// export interface DateRangePickerProps {
//   /** Click handler for applying the updates from DateRangePicker. */
//   onUpdate?: (values: { range: DateRange; rangeCompare?: DateRange }) => void;
//   /** Initial value for start date */
//   initialDateFrom?: Date | string;
//   /** Initial value for end date */
//   initialDateTo?: Date | string;
//   /** Initial value for start date for compare */
//   initialCompareFrom?: Date | string;
//   /** Initial value for end date for compare */
//   initialCompareTo?: Date | string;
//   /** Alignment of popover */
//   align?: "start" | "center" | "end";
//   /** Option for locale */
//   locale?: string;
//   /** Option for showing compare feature */
//   showCompare?: boolean;
//   /** Minimum selectable date */
//   minDate?: Date;
//   /** Maximum selectable date */
//   maxDate?: Date;
// }

// /** The DateRangePicker component allows a user to select a range of dates */
// export const DateRangePicker: FC<DateRangePickerProps> = ({
//   initialDateFrom = new Date(),
//   initialDateTo,
//   initialCompareFrom,
//   initialCompareTo,
//   onUpdate,
//   align = "end",
//   locale = "en-US",
//   showCompare = true,
//   minDate,
//   maxDate,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const { range, updateRange, isRangeValid } = useDateRange({
//     initialRange: {
//       from: dateUtils.getDateAdjustedForTimezone(initialDateFrom),
//       to: initialDateTo
//         ? dateUtils.getDateAdjustedForTimezone(initialDateTo)
//         : undefined,
//     },
//     onChange: (newRange: DateRange) => {
//       if (onUpdate) {
//         onUpdate({
//           range: newRange,
//           rangeCompare: compareEnabled ? rangeCompare : undefined,
//         });
//       }
//     },
//     min: minDate,
//     max: maxDate,
//   });

//   const { range: rangeCompare, updateRange: updateRangeCompare } = useDateRange({
//     initialRange: initialCompareFrom
//       ? {
//           from: dateUtils.getDateAdjustedForTimezone(initialCompareFrom),
//           to: initialCompareTo
//             ? dateUtils.getDateAdjustedForTimezone(initialCompareTo)
//             : undefined,
//         }
//       : undefined,
//     min: minDate,
//     max: maxDate,
//   });

//   const handleDateSelect = (selected: DateRange | Date | undefined) => {
//     if (selected && typeof selected !== "string" && "from" in selected) {
//       updateRange(selected);
//     }
//   };

//   const handleCompareSelect = (selected: DateRange | Date | undefined) => {
//     if (selected && typeof selected !== "string" && "from" in selected) {
//       updateRangeCompare(selected);
//     }
//   };

//   const [selectedPreset, setSelectedPreset] = useState<DatePreset | undefined>(
//     undefined
//   );
//   const [compareEnabled, setCompareEnabled] = useState(Boolean(initialCompareFrom));

//   const [isSmallScreen, setIsSmallScreen] = useState(
//     typeof window !== "undefined" ? window.innerWidth < 960 : false
//   );

//   useEffect(() => {
//     const handleResize = () => {
//       setIsSmallScreen(window.innerWidth < 960);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const getPresetRange = (presetName: DatePreset): DateRange => {
//     const from = new Date();
//     const to = new Date();
//     const first = from.getDate() - from.getDay();

//     switch (presetName) {
//       case "today":
//         from.setHours(0, 0, 0, 0);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "yesterday":
//         from.setDate(from.getDate() - 1);
//         from.setHours(0, 0, 0, 0);
//         to.setDate(to.getDate() - 1);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "last7":
//         from.setDate(from.getDate() - 6);
//         from.setHours(0, 0, 0, 0);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "last14":
//         from.setDate(from.getDate() - 13);
//         from.setHours(0, 0, 0, 0);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "last30":
//         from.setDate(from.getDate() - 29);
//         from.setHours(0, 0, 0, 0);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "thisWeek":
//         from.setDate(first);
//         from.setHours(0, 0, 0, 0);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "lastWeek":
//         from.setDate(from.getDate() - 7 - from.getDay());
//         to.setDate(to.getDate() - to.getDay() - 1);
//         from.setHours(0, 0, 0, 0);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "thisMonth":
//         from.setDate(1);
//         from.setHours(0, 0, 0, 0);
//         to.setHours(23, 59, 59, 999);
//         break;
//       case "lastMonth":
//         from.setMonth(from.getMonth() - 1);
//         from.setDate(1);
//         from.setHours(0, 0, 0, 0);
//         to.setDate(0);
//         to.setHours(23, 59, 59, 999);
//         break;
//     }

//     return { from, to };
//   };

//   const setPreset = (preset: DatePreset) => {
//     const newRange = getPresetRange(preset);
//     updateRange(newRange);
    
//     if (compareEnabled) {
//       const compareRange = {
//         from: new Date(
//           newRange.from.getFullYear() - 1,
//           newRange.from.getMonth(),
//           newRange.from.getDate()
//         ),
//         to: newRange.to
//           ? new Date(
//               newRange.to.getFullYear() - 1,
//               newRange.to.getMonth(),
//               newRange.to.getDate()
//             )
//           : undefined,
//       };
//       updateRangeCompare(compareRange);
//     }
    
//     setSelectedPreset(preset);
//   };

//   const checkPreset = () => {
//     for (const preset of DATE_PRESETS) {
//       const presetRange = getPresetRange(preset.name);

//       const normalizedRangeFrom = new Date(range.from);
//       normalizedRangeFrom.setHours(0, 0, 0, 0);
//       const normalizedPresetFrom = new Date(presetRange.from);
//       normalizedPresetFrom.setHours(0, 0, 0, 0);

//       const normalizedRangeTo = new Date(range.to ?? 0);
//       normalizedRangeTo.setHours(0, 0, 0, 0);
//       const normalizedPresetTo = new Date(presetRange.to?.setHours(0, 0, 0, 0) ?? 0);

//       if (
//         normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
//         normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
//       ) {
//         setSelectedPreset(preset.name);
//         return;
//       }
//     }

//     setSelectedPreset(undefined);
//   };

//   useEffect(() => {
//     checkPreset();
//   }, [range]);

//   return (
//     <Popover open={isOpen} onOpenChange={setIsOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           className={kit(
//             "justify-start text-left font-normal",
//             !range.from && "text-muted-foreground"
//           )}
//         >
//           <div className="flex items-center gap-2">
//             {range.from ? (
//               range.to ? (
//                 <>
//                   {dateUtils.formatDate(range.from, locale)} -{" "}
//                   {dateUtils.formatDate(range.to, locale)}
//                 </>
//               ) : (
//                 dateUtils.formatDate(range.from, locale)
//               )
//             ) : (
//               <span>Pick a date</span>
//             )}
//           </div>
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent
//         className="w-auto p-0"
//         align={align}
//       >
//         <div className={kit(
//           "space-y-4 p-4",
//           isSmallScreen ? "w-screen max-w-screen-sm" : "min-w-[560px]"
//         )}>
//           <div className="flex items-center gap-2">
//             {showCompare && (
//               <>
//                 <Switch
//                   checked={compareEnabled}
//                   onCheckedChange={setCompareEnabled}
//                 />
//                 <Label>Compare</Label>
//               </>
//             )}
//           </div>

//           <div className="flex gap-2">
//             <Select
//               value={selectedPreset}
//               onValueChange={(value) => setPreset(value as DatePreset)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a preset" />
//               </SelectTrigger>
//               <SelectContent>
//                 {DATE_PRESETS.map((preset) => (
//                   <SelectItem key={preset.name} value={preset.name}>
//                     {preset.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex gap-2">
//             <div className="flex-1">
//               <DateTime
//                 mode="range"
//                 selected={range}
//                 onSelect={handleDateSelect}
//                 numberOfMonths={isSmallScreen ? 1 : 2}
//                 disabled={date => {
//                   if (minDate && date < minDate) return true;
//                   if (maxDate && date > maxDate) return true;
//                   return false;
//                 }}
//               />
//             </div>
//             {compareEnabled && (
//               <div className="flex-1">
//                 <DateTime
//                   mode="range"
//                   selected={rangeCompare}
//                   onSelect={handleCompareSelect}
//                   numberOfMonths={isSmallScreen ? 1 : 2}
//                   disabled={date => {
//                     if (minDate && date < minDate) return true;
//                     if (maxDate && date > maxDate) return true;
//                     return false;
//                   }}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// };

// DateRangePicker.displayName = "DateRangePicker";
