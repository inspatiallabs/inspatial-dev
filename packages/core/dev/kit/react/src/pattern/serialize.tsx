// import { tv, type VariantProps } from "tailwind-variants";
// import { PatternFormatMap, PatternVariant } from "./variant";

// //##############################################(TYPE GUARD)##############################################//
// export const isValidFormat = <T extends PatternVariant>(
//   variant: T,
//   format: unknown
// ): format is PatternFormatMap[T] => {
//   switch (variant) {
//     case "grid":
//       return ["orthographic", "perspective"].includes(format as string);
//     case "tile":
//       return ["base"].includes(format as string);
//     default:
//       return ["base"].includes(format as string);
//   }
// };

// //##############################################(FORMAT VALIDATOR)##############################################//
// export function getPatternConfig<T extends PatternVariant>(
//   variant: T,
//   format?: PatternFormatMap[T]
// ): {
//   format: PatternFormatMap[T];
//   isValid: boolean;
// } {
//   // Get default format for variant
//   const defaultFormat: PatternFormatMap[T] = "base" as PatternFormatMap[T];

//   // Validate format
//   const validFormat =
//     format && isValidFormat(variant, format) ? format : defaultFormat;

//   return {
//     format: validFormat,
//     isValid: isValidFormat(variant, validFormat),
//   };
// }

// //##############################################(PATTERN REGISTRY)##############################################//
// // Registry of implemented patterns
// export const patternRegistry = {
//   grid: {
//     component: "Grid",
//     formats: ["orthographic", "perspective", "base", "animated", "static"],
//     implemented: true,
//   },
//   tile: {
//     component: "Tile",
//     formats: ["base", "animated", "static"],
//     implemented: false,
//   },
//   // Add other patterns as they're implemented
// } as const;

// // Type helper for accessing pattern registry
// export type PatternRegistry = typeof patternRegistry;

// //##############################################(TYPE GENERATION)##############################################//
// type PatternFormats = {
//   [K in keyof typeof patternRegistry]: (typeof patternRegistry)[K]["formats"][number];
// };
