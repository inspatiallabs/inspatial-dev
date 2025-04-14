import { GoogleFontProps, PrimitiveFontProps } from "@inspatial/theme/font";
import { createVariant } from "@inspatial/theme/variant";
import type { VariantProps } from "@inspatial/theme/variant";

//##############################################(FONT)##############################################//

const FontVariants = {
  ...Object.fromEntries(GoogleFontProps.map((font) => [font.name, ""])),
  ...Object.fromEntries(PrimitiveFontProps.map((font) => [font.name, ""])),
  // Add any additional custom fonts here if needed
};

// add more when you get the types e.g. GoogleFontsStartingWithB etc...
export type AllFontVariants = typeof FontVariants;

//##############################################(VARIANTS)##############################################//

export const TypographyVariant = createVariant({
  base: ["inline-flex"],
  settings: {
    variant: {
      text: "",
      quote: "",
      code: "",
    },
    format: {
      base: "",
    },
  },
  defaultSettings: {
    variant: "text",
    format: "base",
  },
});

//##############################################(TYPES)##############################################//

export type TypographyProps = VariantProps<typeof TypographyVariant.variant>;
