// import {  } from "@inspatial/types/util";
// import { createVariant } from "@inspatial/theme/variant";
// import { Effect } from "@inspatial/theme/effect";


// //##############################################(BASE TYPES)##############################################//
// export type BaseFormat = "base";

// //##############################################(FORMAT TYPES)##############################################//
// // Only define types for formats we've implemented
// export type GridFormat = "orthographic" | "perspective";
// export type TileFormat = BaseFormat;

// // Map patterns to their formats
// export type PatternFormatMap = {
//   none: BaseFormat;
//   grid: GridFormat | BaseFormat;
//   dot: BaseFormat;
//   gradial: BaseFormat; // TODO: implement
//   tile: TileFormat;
//   // Temporarily set other patterns to BaseFormat until implemented
//   ripple: BaseFormat;
//   flicker: BaseFormat;
//   beam: BaseFormat;
//   rain: BaseFormat;
//   aurora: BaseFormat;
//   "confetti-trail": BaseFormat;
//   meteor: BaseFormat;
//   sparkle: BaseFormat;
//   ribbon: BaseFormat;
//   vortex: BaseFormat;
//   snow: BaseFormat;
//   galactic: BaseFormat;
//   spotlight: BaseFormat;
//   flame: BaseFormat;
//   fireworks: BaseFormat;
// };

// //##############################################(PATTERN VARIANT)##############################################//
// export type PatternVariant = keyof PatternFormatMap;
// export type PatternFormat = PatternFormatMap[PatternVariant];

// //##############################################(VARIANTS CONFIG)##############################################//
// export const PatternVariants = createVariant({
//   base: ["inline-flex"],
//   settings: {
//     theme: {
//       light: "",
//       dark: "",
//       device: "",
//     },
//     variant: {
//       // grid: "", // TODO: implement
//       // dot: "", // TODO: implement
//       // gradial: "", // TODO: implement - moving gradient https://ui.aceternity.com/components/background-gradient-animation
//       none: "",
//       tile: "",
//       ripple: "",
//       flicker: "",
//       beam: "",
//       rain: "",
//       aurora: "",
//       "confetti-trail": "",
//       meteor: "",
//       sparkle: "",
//       ribbon: "",
//       vortex: "",
//       snow: "",
//       galactic: "",
//       spotlight: "",
//       flame: "",
//       fireworks: "",
//     },
//     format: {
//       // Base formats
//       base: "",
//       animated: "",
//       static: "",
//       // Grid formats
//       orthographic: "",
//       perspective: "",
//     },
//   },
//   defaultSettings: {
//     theme: "device",
//     variant: "tile",
//     format: "base",
//   },
// });

// //##############################################(PROPS)##############################################//
// export interface PatternProps extends SharedProps {
//   variant?: PatternVariant;
//   format?: PatternFormat;
//   intensity?: number;
//   speed?: number;
//   color?: string;
//   blur?: number;
//   animate?: Effect;

//   randomize?: boolean;
//   randomInterval?: number; // Time in milliseconds between pattern changes

//   // TODO: This use inspatial user agent to determine the state of various conditions i.e device, allso integrate weather knoledge e.g use rain pattern when it is raining etc...
//   // soul?: {
//   //   userAgent?: boolean;
//   //   weather?: boolean;
//   // };
// }
