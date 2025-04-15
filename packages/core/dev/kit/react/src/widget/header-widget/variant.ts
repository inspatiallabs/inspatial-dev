import { createVariant, type VariantProps } from "@inspatial/theme/variant";

export const headerWidgetVariants = createVariant({
  base: "inline-flex cursor-auto ",

  settings: {
    //##############################################(COMPONENT VARIANT PROP)##############################################//

    variant: {
      full: "absolute top-[80px] left-0 w-full bg-(--background) z-10 md:hidden overflow-hidden shadow-base",
      // segmented: "",
    },

    //##############################################(FORMAT PROP)##############################################//
    format: {
      base: ``,
    },

    //##############################################(SIZE PROP)##############################################//

    size: {
      base: "h-auto w-full", // default
      // sm: "h-[36px] w-[36px] text-base",
      // md: "h-[40px] w-auto text-base",
      // lg: "h-[48px] w-auto text-base",
      // xl: "h-[52px] w-auto text-base",
    },

    //##############################################(RADIUS PROP)##############################################//

    radius: {
      base: "rounded-md",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },

    //##############################################(THEME PROP)##############################################//

    theme: {
      neutral: "",
      flat: "",
      brutal: "",
      soft: "",
    },

    //##############################################(AXIS PROP)##############################################//

    axis: {
      x: "flex flex-row",
      y: "flex flex-col",
      z: "flex flex-row-reverse",
    },

    //##############################################(DISABLED PROP)##############################################//

    disabled: {
      true: "opacity-disabled pointer-events-none cursor-disabled",
    },
  },

  defaultSettings: {
    variant: "full",
    format: "base",
    size: "base",
    radius: "base",
    theme: "flat",
    axis: "x",
    disabled: false,
  },

  composition: [
    {
      variant: "full",
      theme: "flat",
    },
  ],
});

//##############################################(TYPES)##############################################//

export type HeaderWidgetVariant = VariantProps<
  typeof headerWidgetVariants.variant
>;
