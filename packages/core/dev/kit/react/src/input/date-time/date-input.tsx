// "use client";

// import * as React from "react";
// import { kit } from "@/inspatial/util";
// import { useDateState } from "./date-hooks";
// import { type DateParts } from "./date-utils";

// interface DateInputProps {
//   value?: Date;
//   onChange: (date: Date) => void;
//   min?: Date;
//   max?: Date;
//   className?: string;
// }

// export const DateInput: React.FC<DateInputProps> = ({
//   value,
//   onChange,
//   min,
//   max,
//   className
// }) => {
//   const { date, updateDate, isDateValid } = useDateState({
//     initialDate: value,
//     onChange,
//     min,
//     max
//   });

//   const monthRef = React.useRef<HTMLInputElement | null>(null);
//   const dayRef = React.useRef<HTMLInputElement | null>(null);
//   const yearRef = React.useRef<HTMLInputElement | null>(null);

//   const handleInputChange = (field: keyof DateParts) => (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const newValue = e.target.value ? Number(e.target.value) : "";
//     if (typeof newValue !== "number") return;

//     const newDate = { ...date, [field]: newValue };
//     updateDate(newDate);
//   };

//   const handleBlur = (field: keyof DateParts) => (
//     e: React.FocusEvent<HTMLInputElement>
//   ) => {
//     if (!e.target.value) {
//       updateDate(date);
//       return;
//     }

//     const newValue = Number(e.target.value);
//     const newDate = { ...date, [field]: newValue };
    
//     if (!isDateValid(newDate)) {
//       updateDate(date);
//     }
//   };

//   const handleKeyDown = (field: keyof DateParts) => (
//     e: React.KeyboardEvent<HTMLInputElement>
//   ) => {
//     // Allow command (or control) combinations
//     if (e.metaKey || e.ctrlKey) return;

//     // Prevent non-numeric characters, excluding allowed keys
//     if (
//       !/^[0-9]$/.test(e.key) &&
//       ![
//         "ArrowUp",
//         "ArrowDown",
//         "ArrowLeft",
//         "ArrowRight",
//         "Delete",
//         "Tab",
//         "Backspace",
//         "Enter"
//       ].includes(e.key)
//     ) {
//       e.preventDefault();
//       return;
//     }

//     const handleArrowNavigation = (increment: number) => {
//       e.preventDefault();
//       const newDate = { ...date };

//       if (field === "day") {
//         newDate.day += increment;
//         if (newDate.day < 1) {
//           newDate.month -= 1;
//           if (newDate.month < 1) {
//             newDate.month = 12;
//             newDate.year -= 1;
//           }
//           const daysInMonth = new Date(newDate.year, newDate.month, 0).getDate();
//           newDate.day = daysInMonth;
//         } else if (newDate.day > new Date(newDate.year, newDate.month, 0).getDate()) {
//           newDate.day = 1;
//           newDate.month += 1;
//           if (newDate.month > 12) {
//             newDate.month = 1;
//             newDate.year += 1;
//           }
//         }
//       }

//       if (field === "month") {
//         newDate.month += increment;
//         if (newDate.month < 1) {
//           newDate.month = 12;
//           newDate.year -= 1;
//         } else if (newDate.month > 12) {
//           newDate.month = 1;
//           newDate.year += 1;
//         }
//       }

//       if (field === "year") {
//         newDate.year += increment;
//       }

//       updateDate(newDate);
//     };

//     if (e.key === "ArrowUp") {
//       handleArrowNavigation(1);
//     } else if (e.key === "ArrowDown") {
//       handleArrowNavigation(-1);
//     }

//     const handleFieldNavigation = (direction: "left" | "right") => {
//       if (
//         direction === "right" &&
//         (e.currentTarget.selectionStart === e.currentTarget.value.length ||
//           (e.currentTarget.selectionStart === 0 &&
//             e.currentTarget.selectionEnd === e.currentTarget.value.length))
//       ) {
//         e.preventDefault();
//         if (field === "month") dayRef.current?.focus();
//         if (field === "day") yearRef.current?.focus();
//       } else if (
//         direction === "left" &&
//         (e.currentTarget.selectionStart === 0 ||
//           (e.currentTarget.selectionStart === 0 &&
//             e.currentTarget.selectionEnd === e.currentTarget.value.length))
//       ) {
//         e.preventDefault();
//         if (field === "day") monthRef.current?.focus();
//         if (field === "year") dayRef.current?.focus();
//       }
//     };

//     if (e.key === "ArrowRight") {
//       handleFieldNavigation("right");
//     } else if (e.key === "ArrowLeft") {
//       handleFieldNavigation("left");
//     }
//   };

//   return (
//     <div className={kit("flex border rounded-lg items-center text-sm px-1", className)}>
//       <input
//         type="text"
//         ref={monthRef}
//         max={12}
//         maxLength={2}
//         value={date.month.toString()}
//         onChange={handleInputChange("month")}
//         onKeyDown={handleKeyDown("month")}
//         onFocus={(e) => {
//           if (window.innerWidth > 1024) {
//             e.target.select();
//           }
//         }}
//         onBlur={handleBlur("month")}
//         className="p-0 outline-none w-6 border-none text-center"
//         placeholder="M"
//       />
//       <span className="opacity-20 -mx-px">/</span>
//       <input
//         type="text"
//         ref={dayRef}
//         max={31}
//         maxLength={2}
//         value={date.day.toString()}
//         onChange={handleInputChange("day")}
//         onKeyDown={handleKeyDown("day")}
//         onFocus={(e) => {
//           if (window.innerWidth > 1024) {
//             e.target.select();
//           }
//         }}
//         onBlur={handleBlur("day")}
//         className="p-0 outline-none w-7 border-none text-center"
//         placeholder="D"
//       />
//       <span className="opacity-20 -mx-px">/</span>
//       <input
//         type="text"
//         ref={yearRef}
//         max={9999}
//         maxLength={4}
//         value={date.year.toString()}
//         onChange={handleInputChange("year")}
//         onKeyDown={handleKeyDown("year")}
//         onFocus={(e) => {
//           if (window.innerWidth > 1024) {
//             e.target.select();
//           }
//         }}
//         onBlur={handleBlur("year")}
//         className="p-0 outline-none w-12 border-none text-center"
//         placeholder="YYYY"
//       />
//     </div>
//   );
// };

// DateInput.displayName = "DateInput";