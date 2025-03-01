import { ITypographyProps } from "../font/types.ts";

/**********************************(Theme Props)**********************************/


export interface ThemeProps {
  variant: ThemeVariantProps;
  format: ThemeFormatProps;
  mode: ThemeModeProps;
  // spacing: ThemeSpacingProps;
  cursor: ThemeCursorProps;
  radius: ThemeRadiusProps;
  typography?: ITypographyProps; 
}

export type ThemeSizeScaleProps =
  | "base"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full";

export type ThemeRadiusProps = ThemeSizeScaleProps;

export type ThemeSpacingProps = ThemeSizeScaleProps;

export type ThemeCursorProps =
  | "auto"
  | "base"
  | "select"
  | "Orbit"
  | "pointer"
  | "pan"
  | "panning"
  | "loading"
  | "Help"
  | "disabled"
  | "text-x"
  | "text-y"
  | "cross"
  | "Zoom-In"
  | "zoom-out"
  | "copy"
  | "move"
  | "resize-y"
  | "resize-x"
  | "resize-t"
  | "resize-r"
  | "resize-b"
  | "resize-l"
  | "resize-tlbr"
  | "resize-trbl"
  | "resize-tl"
  | "resize-tr"
  | "resize-bl"
  | "resize-br";

export type ThemeVariantProps = "flat" | "neutral" | "brutal" | "soft";

export type ThemeModeProps = "light" | "dark" | "auto";

// theme formats defines the theme color accent
export type ThemeFormatNameProps =
  | "default" // will use the your apps brand color
  | "lavender"
  | "blossom"
  | "sky"
  | "sunset"
  | "forest"
  | "ocean"
  | "midnight"
  | "autumn"
  | "polar"
  | "mocha"
  | "neon"
  | "pastel"
  | "monochrome"
  | "metropolis"
  | "cyberpunk"
  | "earth"
  | "retro"
  | "noire"
  | "tropical"
  | "nordic"
  | "steampunk"
  | "breeze"
  | "emerald"
  | "dusk"
  | "amethyst"
  | "cherry"
  | "rustic"
  | "arctic"
  | "expresso"
  | "sherbet"
  | "mamal"
  | "cyberpunk"
  | "terra"
  | "vintage"
  | "noir"
  | "island"
  | "fjord"
  | "brass"
  | "unoclub"
  | "duoclub"
  | "tresclub"
  | "zinc";

export interface ThemeFormatProps {
  name: ThemeFormatNameProps;
  light?: {
    brand?: string;
    background?: string;
    surface?: string;
    primary?: string;
    secondary?: string;
    muted?: string;
    window?: string;
  };
  dark?: {
    brand?: string;
    background?: string;
    surface?: string;
    primary?: string;
    secondary?: string;
    muted?: string;
    window?: string;
  };
}
