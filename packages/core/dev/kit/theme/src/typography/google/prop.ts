// prop.ts
import { InSpatialFontProp } from "../primitive/types.ts";
import fontMap from "./font-map.json" with { type: "json" };
import * as GeneratedFonts from "./fonts.ts";

/**
 * Represents the properties of a Google Font
 * @interface GoogleFontProp
 */
export interface GoogleFontProp extends InSpatialFontProp {
  name: string;
  font: InSpatialFontProp & {
    weights: string[];
    styles: string[];
    subsets: string[];
    axes?: Array<{
      tag: string;
      min: number;
      max: number;
      defaultValue: number;
    }>;
  };
}

// Get all generated font functions
type FontFunctions = {
  [K: string]: (options: {
    weight: string;
    style: string;
    subsets: string[];
    variable?: string;
  }) => InSpatialFontProp;
};

interface FontMapEntry {
  weights: string[];
  styles: string[] | string;
  subsets: string[];
  axes?: Array<{
    tag: string;
    min: number;
    max: number;
    defaultValue: number;
  }>;
}

/**
 * Array of all available Google Fonts with their properties
 * Uses the generated font functions instead of direct mapping
 * @constant {readonly GoogleFontProp[]}
 */
export const GoogleFontProps = Object.entries(
  fontMap as Record<string, FontMapEntry>
).map(([key, font]) => {
  const fontName = key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_");

  // Get the generated font function
  const fontFunction = (GeneratedFonts as FontFunctions)[
    fontName as keyof FontFunctions
  ] as
    | ((options: {
        weight: string;
        style: string;
        subsets: string[];
        variable?: string;
      }) => InSpatialFontProp)
    | undefined;

  if (!fontFunction) {
    return undefined;
  }

  // Create font instance with default options
  const fontInstance = fontFunction({
    weight: font.weights[0],
    style: Array.isArray(font.styles) ? font.styles[0] : font.styles,
    subsets: font.subsets,
  });

  return {
    name: fontName.replace(/_/g, " "),
    font: {
      ...fontInstance,
      weights: font.weights,
      subsets: font.subsets,
      ...(font.axes ? { axes: font.axes } : {}),
    },
  };
}) as unknown as readonly GoogleFontProp[];

/**
 * Retrieves the properties of a specific Google Font by name
 * @param {string} fontName - The name of the font in Title Case
 * @returns {GoogleFontProp | undefined} The font properties if found, undefined otherwise
 * @example
 * getGoogleFontProp("Roboto") // Returns { name: "Roboto", font: { weights: ["400", "700"], ... } }
 * getGoogleFontProp("Invalid Font") // Returns undefined
 */
export function getGoogleFontProp(
  fontName: string
): GoogleFontProp | undefined {
  return GoogleFontProps.find((prop) => prop.name === fontName);
}

// Helper function to initialize a specific Google Font
export function initializeGoogleFont(
  fontName: string,
  options: {
    weight?: string;
    style?: string;
    subsets?: string[];
    variable?: string;
  } = {}
): InSpatialFontProp | undefined {
  const normalizedName = fontName.replace(/\s+/g, "_");
  const fontFunction = (GeneratedFonts as FontFunctions)[normalizedName];

  if (!fontFunction) {
    return undefined;
  }

  const fontProps = getGoogleFontProp(fontName);
  if (!fontProps) {
    return undefined;
  }

  return fontFunction({
    weight: options.weight || fontProps.font.weights[0],
    style:
      options.style ||
      (Array.isArray(fontProps.font.styles)
        ? fontProps.font.styles[0]
        : fontProps.font.styles),
    subsets: options.subsets || fontProps.font.subsets,
    variable: options.variable,
  });
}
