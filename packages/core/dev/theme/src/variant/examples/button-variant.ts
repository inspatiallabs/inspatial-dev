/**
 * # Button Variant Example
 *
 * This example demonstrates how to create and use button variants
 * with the streamlined InSpatial variant system API.
 */

import {
  kit,
  createVariant,
  type VariantProps,
} from "@inspatial/theme/variant";

// Create a button variant system with multiple options
export const ButtonVariant = createVariant({
  // Base styles applied to all buttons
  base: "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none",

  // Various variant settings
  settings: {
    // Size variants
    size: {
      xs: "h-6 px-2 text-xs",
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    },

    // Intent/color variants
    format: {
      primary: "bg-pop-600 text-white hover:bg-pop-700 active:bg-pop-800",
      secondary:
        "bg-damp-200 text-damp-700 hover:bg-damp-300 active:bg-damp-400",
      danger:
        "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800",
      ghost:
        "bg-transparent text-damp-700 hover:bg-damp-100 active:bg-damp-200",
    },

    // Boolean variants
    disabled: {
      true: "opacity-50 cursor-not-allowed pointer-events-none",
      false: "",
    },

    // Width variants
    width: {
      full: "w-full",
      auto: "w-auto",
    },
  },

  // Default settings for the button
  defaultSettings: {
    size: "md",
    format: "primary",
    disabled: false,
    width: "auto",
  },

  // Compound variants for special combinations
  composition: [
    {
      // Special styles for ghost + small button
      format: "ghost",
      size: "sm",
      class: "font-semibold",
    },
  ],
});

// Export the button props type using the applyVariant API
export type ButtonVariantType = VariantProps<typeof ButtonVariant.applyVariant>;

/*---------------------------------(VARIANT CLASS EXTRACTION)---------------------------------*/

// Extract the variant class
const variantClass = ButtonVariant.applyVariant({
  size: "lg",
  format: "primary",
  disabled: false,
  width: "full",
});

/*---------------------------------(RENDER)---------------------------------*/
// Render the variant class in an enviroment e.g React DOM
function RenderComponent({ className }: { className?: string }) {
  return <button className={kit(`${variantClass}`, className)}>Click me</button>
}

/*---------------------------------(COMPOSITION EXAMPLES)---------------------------------*/
// export function ButtonComposition() {
//   // A primary button (using default format)
//   const primaryButtonClass = ButtonVariant.applyVariant({
//     size: "lg",
//   });

//   // A secondary button
//   const secondaryButtonClass = ButtonVariant.applyVariant({
//     format: "secondary",
//     width: "full",
//   });

//   // A disabled danger button
//   const dangerButtonClass = ButtonVariant.applyVariant({
//     format: "danger",
//     disabled: true,
//   });

//   // A ghost button (with compound variant applied)
//   const ghostButtonClass = ButtonVariant.applyVariant({
//     format: "ghost",
//     size: "sm",
//   });

//   // Using with custom classes
//   const customButtonClass = ButtonVariant.applyVariant({
//     format: "primary",
//     size: "md",
//     className: "shadow-md hover:shadow-lg",
//   });

//   const examples = {
//     primaryButtonClass,
//     secondaryButtonClass,
//     dangerButtonClass,
//     ghostButtonClass,
//     customButtonClass,
//   };

//   // Print the results
//   console.log("Button Examples:");
//   for (const [name, classes] of Object.entries(examples)) {
//     console.log(`${name}: ${classes}`);
//   }

//   return examples;
// }

// // Run the example
// ButtonComposition();
