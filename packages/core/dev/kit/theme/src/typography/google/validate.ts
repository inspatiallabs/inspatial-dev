import { formatAvailableValues } from "../../helpers.ts";
import { googleFontsMetadata } from "./metadata.ts";
import { inSpatialFontError } from "../error.ts";

export const allowedDisplayValues = [
  "auto",
  "block",
  "swap",
  "fallback",
  "optional",
];

type FontOptions = {
  fontFamily: string;
  weights: string[];
  styles: string[];
  display: string;
  preload: boolean;
  selectedVariableAxes?: string[];
  fallback?: string[];
  adjustFontFallback: boolean;
  variable?: string;
  subsets: string[];
};
/**
 * Validate the data recieved from next-swc next-transform-font on next/font/google calls
 */
export function validateGoogleFont(
  functionName: string,
  fontFunctionArgument: any
): FontOptions {
  let {
    weight,
    style,
    preload = true,
    display = "swap",
    axes,
    fallback,
    adjustFontFallback = true,
    variable,
    subsets,
  } = fontFunctionArgument || ({} as any);
  if (functionName === "") {
    inSpatialFontError(`@inspatial/theme has no default export`);
  }

  const fontFamily = functionName.replace(/_/g, " ");
  // Get the Google font metadata, we'll use this to validate the font arguments and to print better error messages
  const fontFamilyData = googleFontsMetadata[fontFamily];
  if (!fontFamilyData) {
    inSpatialFontError(`Unknown font \`${fontFamily}\``);
  }

  const availableSubsets = fontFamilyData.subsets;
  if (availableSubsets.length === 0) {
    // If the font doesn't have any preloadeable subsets, disable preload
    preload = false;
  } else if (preload) {
    if (!subsets) {
      inSpatialFontError(
        `Preload is enabled but no subsets were specified for font \`${fontFamily}\`. Please specify subsets or disable preloading if your intended subset can't be preloaded.\nAvailable subsets: ${formatAvailableValues(
          availableSubsets
        )}\n\nRead more: https://inspatial.dev/kit/theme/typography`
      );
    }
    subsets.forEach((subset: string) => {
      if (!availableSubsets.includes(subset)) {
        inSpatialFontError(
          `Unknown subset \`${subset}\` for font \`${fontFamily}\`.\nAvailable subsets: ${formatAvailableValues(
            availableSubsets
          )}`
        );
      }
    });
  }

  const fontWeights = fontFamilyData.weights;
  const fontStyles = fontFamilyData.styles;

  // Get the unique weights and styles from the function call
  const weights = !weight
    ? []
    : [...new Set(Array.isArray(weight) ? weight : [weight])];
  const styles = !style
    ? []
    : [...new Set(Array.isArray(style) ? style : [style])];

  if (weights.length === 0) {
    // Set variable as default, throw if not available
    if (fontWeights.includes("variable")) {
      weights.push("variable");
    } else {
      inSpatialFontError(
        `Missing weight for font \`${fontFamily}\`.\nAvailable weights: ${formatAvailableValues(
          fontWeights
        )}`
      );
    }
  }

  if (weights.length > 1 && weights.includes("variable")) {
    inSpatialFontError(
      `Unexpected \`variable\` in weight array for font \`${fontFamily}\`. You only need \`variable\`, it includes all available weights.`
    );
  }

  weights.forEach((selectedWeight) => {
    if (!fontWeights.includes(selectedWeight)) {
      inSpatialFontError(
        `Unknown weight \`${selectedWeight}\` for font \`${fontFamily}\`.\nAvailable weights: ${formatAvailableValues(
          fontWeights
        )}`
      );
    }
  });

  if (styles.length === 0) {
    if (fontStyles.length === 1) {
      // Handle default style for fonts that only have italic
      styles.push(fontStyles[0]);
    } else {
      // Otherwise set default style to normal
      styles.push("normal");
    }
  }

  styles.forEach((selectedStyle) => {
    if (!fontStyles.includes(selectedStyle)) {
      inSpatialFontError(
        `Unknown style \`${selectedStyle}\` for font \`${fontFamily}\`.\nAvailable styles: ${formatAvailableValues(
          fontStyles
        )}`
      );
    }
  });

  if (!allowedDisplayValues.includes(display)) {
    inSpatialFontError(
      `Invalid display value \`${display}\` for font \`${fontFamily}\`.\nAvailable display values: ${formatAvailableValues(
        allowedDisplayValues
      )}`
    );
  }

  if (axes) {
    if (!fontWeights.includes("variable")) {
      inSpatialFontError("Axes can only be defined for variable fonts.");
    }

    if (weights[0] !== "variable") {
      inSpatialFontError(
        "Axes can only be defined for variable fonts when the weight property is nonexistent or set to `variable`."
      );
    }
  }

  return {
    fontFamily,
    weights,
    styles,
    display,
    preload,
    selectedVariableAxes: axes,
    fallback,
    adjustFontFallback,
    variable,
    subsets,
  };
}
