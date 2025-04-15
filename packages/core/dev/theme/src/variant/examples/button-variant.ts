/**
 * # Button Variant Example
 * 
 * This example demonstrates how to create and use button variants
 * with the InSpatial variant system.
 */

import { createVariant, type VariantProps } from "../index";

// Create a button variant system with multiple options
export const buttonVariant = createVariant({
  // Base styles applied to all buttons
  base: "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none",
  
  // Various variant settings
  settings: {
    // Size variants
    size: {
      xs: "h-6 px-2 text-xs",
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg"
    },
    
    // Intent/color variants
    intent: {
      primary: "bg-pop-600 text-white hover:bg-pop-700 active:bg-pop-800",
      secondary: "bg-damp-200 text-damp-700 hover:bg-damp-300 active:bg-damp-400",
      danger: "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800",
      ghost: "bg-transparent text-damp-700 hover:bg-damp-100 active:bg-damp-200"
    },
    
    // Boolean variants
    disabled: {
      true: "opacity-50 cursor-not-allowed pointer-events-none",
      false: ""
    },
    
    // Width variants
    width: {
      full: "w-full",
      auto: "w-auto"
    }
  },
  
  // Default settings for the button
  defaultSettings: {
    size: "md",
    intent: "primary",
    disabled: false,
    width: "auto"
  },
  
  // Compound variants for special combinations
  composition: [
    {
      // Special styles for ghost + small button
      intent: "ghost",
      size: "sm",
      class: "font-semibold"
    }
  ]
});

// Export the button props type using the useVariant API
export type ButtonVariantProps = VariantProps<typeof buttonVariant.useVariant>;

// Example usage:
export function buttonExamples() {
  // A primary button (using default intent)
  const primaryButton = buttonVariant.useVariant({
    size: "lg"
  });
  
  // A secondary button
  const secondaryButton = buttonVariant.useVariant({
    intent: "secondary",
    width: "full"
  });
  
  // A disabled danger button
  const dangerButton = buttonVariant.useVariant({
    intent: "danger",
    disabled: true
  });
  
  // A ghost button (with compound variant applied)
  const ghostButton = buttonVariant.useVariant({
    intent: "ghost",
    size: "sm"
  });
  
  return {
    primaryButton,
    secondaryButton, 
    dangerButton,
    ghostButton
  };
} 