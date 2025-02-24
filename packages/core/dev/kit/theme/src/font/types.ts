import { type PrimitiveFontTypes } from "./primitive/types.ts";
//@ts-expect-error
import { type GoogleFontTypes } from "./google/fonts.ts";

export type AllFontVariants = GoogleFontTypes | PrimitiveFontTypes;

//##############################################(TYPES)##############################################//

export type TypographyFamilyProps = PrimitiveFontTypes;

export type TypographySizeProps =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "base"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export type TypographyLineHeightProps =
  | "auto"
  | "2px"
  | "12px"
  | "16px"
  | "20px"
  | "24px"
  | "28px"
  | "32px"
  | "36px"
  | "40px"
  | "44px"
  | "48px"
  | "52px"
  | "56px"
  | "60px"
  | "64px"
  | "68px"
  | "72px"
  | "80px"
  | "96px"
  | "118px"
  | "128px";

export type TypographyLetterSpacingProps =
  | "xs" // -0.05em
  | "sm" // -0.03em
  | "base" // 0em
  | "md" // 0.03em
  | "lg" // 0.05em
  | "xl"; // 0.1em

export type TypographyTransformProps =
  | "none"
  | "uppercase"
  | "lowercase"
  | "capitalize"
  | "full-width";

export type TypographyWeightProps =
  | "thin"
  | "light"
  | "regular"
  | "medium"
  | "bold"
  | "black";
