// prop.ts
import { InSpatialFontProp } from "../primitive/types.ts";
import fontMap from "./font-map.json" with { type: "json" };
import type * as GeneratedFonts from "./fonts.ts";

/**
 * Represents the properties of a Google Font
 * @interface GoogleFontProp
 */
export interface GoogleFontProp extends InSpatialFontProp {
  name: string;
  font: InSpatialFontProp & {
    weights: string[];
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
type FontFunctions = typeof GeneratedFonts;

/**
 * Array of all available Google Fonts with their properties
 * Uses the generated font functions instead of direct mapping
 * @constant {readonly GoogleFontProp[]}
 */
export const GoogleFontProps = Object.entries(fontMap).map(([key, font]) => {
  const fontName = key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_");

  // Get the generated font function
  const fontFunction = (GeneratedFonts as FontFunctions)[
    fontName as keyof FontFunctions
  ];

  if (!fontFunction) {
    throw new Error(`Font function not found for ${fontName}`);
  }

  // Create font instance with default options
  const fontInstance = fontFunction({
    weight: font.weights[0],
    style: Array.isArray(font.style) ? font.style[0] : font.style,
    subsets: font.subsets,
  });

  return {
    name: fontName.replace(/_/g, " "),
    font: {
      ...fontInstance,
      weights: font.weights,
      subsets: font.subsets,
      axes: font.axes,
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
  const fontFunction = (GeneratedFonts as FontFunctions)[
    normalizedName as keyof FontFunctions
  ];

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
      (Array.isArray(fontProps.font.style)
        ? fontProps.font.style[0]
        : fontProps.font.style),
    subsets: options.subsets || fontProps.font.subsets,
    variable: options.variable,
  });
}
