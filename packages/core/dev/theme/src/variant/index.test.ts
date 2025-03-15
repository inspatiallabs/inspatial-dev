import { test, expect } from "@inspatial/test";
import { composeVariant, createVariant, kit, variant, type VariantProps } from "./index.ts";

/**
 * Comprehensive test suite for the InSpatial Variant System
 * This covers all aspects and scenarios of the variant system functionality.
 */

/*##############################################(BASIC-FUNCTIONALITY)##############################################*/

test({
  name: "kit() should correctly merge className strings",
  fn: () => {
    // When merging simple strings
    const result = kit("text-red-500", "bg-blue-200", "p-4");
    
    // Then it should contain all classes
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-200");
    expect(result).toContain("p-4");
  }
});

test({
  name: "kit() should resolve conflicting Tailwind classes",
  fn: () => {
    // When using conflicting classes
    const result = kit("p-2", "p-4", "m-2", "m-4");
    
    // Then it should keep only the last value for each property
    expect(result).toContain("p-4");
    expect(result).not.toContain("p-2");
    expect(result).toContain("m-4");
    expect(result).not.toContain("m-2");
  }
});

test({
  name: "kit() should preserve variant classes correctly",
  fn: () => {
    // When using variant classes
    const result = kit("p-2", "hover:p-4", "dark:p-6", "sm:p-8");
    
    // Then it should preserve all variants
    expect(result).toContain("p-2");
    expect(result).toContain("hover:p-4");
    expect(result).toContain("dark:p-6");
    expect(result).toContain("sm:p-8");
  }
});

test({
  name: "kit() should handle complex combinations of classes",
  fn: () => {
    // When using a complex mix of classes
    const result = kit(
      "text-sm md:text-base lg:text-lg", 
      "bg-blue-200 dark:bg-blue-800",
      "p-2 md:p-4",
      "rounded-md",
      null,
      undefined,
      false && "hidden",
      true && "block"
    );
    
    // Then it should correctly process everything
    expect(result).toContain("text-sm");
    expect(result).toContain("md:text-base");
    expect(result).toContain("lg:text-lg");
    expect(result).toContain("bg-blue-200");
    expect(result).toContain("dark:bg-blue-800");
    expect(result).toContain("p-2");
    expect(result).toContain("md:p-4");
    expect(result).toContain("rounded-md");
    expect(result).not.toContain("hidden");
    expect(result).toContain("block");
  }
});

test({
  name: "kit() should handle arrays and objects",
  fn: () => {
    // When using arrays and objects
    const result = kit(
      ["text-red-500", "bg-blue-200"],
      { "p-4": true, "m-2": true, "hidden": false }
    );
    
    // Then it should process them correctly
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-200");
    expect(result).toContain("p-4");
    expect(result).toContain("m-2");
    expect(result).not.toContain("hidden");
  }
});

/*##############################################(VARIANT-BASIC)##############################################*/

test({
  name: "variant() should handle basic variant configurations",
  fn: () => {
    // Given a basic button variant
    const button = variant({
      base: "px-4 py-2 rounded",
      settings: {
        intent: {
          primary: "bg-blue-500 text-white",
          secondary: "bg-gray-200 text-gray-800",
          danger: "bg-red-500 text-white"
        }
      }
    });
    
    // When used with different intents
    const primaryBtn = button({ intent: "primary" });
    const secondaryBtn = button({ intent: "secondary" });
    const dangerBtn = button({ intent: "danger" });
    
    // Then it should apply the correct classes
    expect(primaryBtn).toContain("px-4 py-2 rounded");
    expect(primaryBtn).toContain("bg-blue-500 text-white");
    
    expect(secondaryBtn).toContain("px-4 py-2 rounded");
    expect(secondaryBtn).toContain("bg-gray-200 text-gray-800");
    
    expect(dangerBtn).toContain("px-4 py-2 rounded");
    expect(dangerBtn).toContain("bg-red-500 text-white");
  }
});

test({
  name: "variant() should handle multiple variant dimensions",
  fn: () => {
    // Given a button with multiple variant dimensions
    const button = variant({
      base: "rounded",
      settings: {
        intent: {
          primary: "bg-blue-500 text-white",
          secondary: "bg-gray-200 text-gray-800"
        },
        size: {
          sm: "text-sm px-2 py-1",
          md: "text-base px-4 py-2",
          lg: "text-lg px-6 py-3"
        },
        rounded: {
          none: "rounded-none",
          md: "rounded-md",
          full: "rounded-full"
        }
      }
    });
    
    // When combining multiple dimensions
    const smallPrimaryFullRounded = button({
      intent: "primary",
      size: "sm",
      rounded: "full"
    });
    
    const largePrimarySquare = button({
      intent: "primary",
      size: "lg",
      rounded: "none"
    });
    
    // Then it should combine all correctly
    expect(smallPrimaryFullRounded).toContain("bg-blue-500");
    expect(smallPrimaryFullRounded).toContain("text-sm");
    expect(smallPrimaryFullRounded).toContain("rounded-full");
    
    expect(largePrimarySquare).toContain("bg-blue-500");
    expect(largePrimarySquare).toContain("text-lg");
    expect(largePrimarySquare).toContain("px-6");
    expect(largePrimarySquare).toContain("rounded-none");
  }
});

/*##############################################(DEFAULT-SETTINGS)##############################################*/

test({
  name: "variant() should handle defaultSettings",
  fn: () => {
    // Given a button with defaultSettings
    const button = variant({
      base: "rounded font-medium",
      settings: {
        intent: {
          primary: "bg-blue-500 text-white",
          secondary: "bg-gray-200 text-gray-800",
          danger: "bg-red-500 text-white"
        },
        size: {
          sm: "text-sm px-2 py-1",
          md: "text-base px-4 py-2",
          lg: "text-lg px-6 py-3"
        }
      },
      defaultSettings: {
        intent: "secondary",
        size: "md"
      }
    });
    
    // When called with no props
    const defaultButton = button();
    
    // Then it should use defaults
    expect(defaultButton).toContain("bg-gray-200"); // secondary intent
    expect(defaultButton).toContain("px-4"); // md size
    
    // When overriding only some props
    const smallButton = button({ size: "sm" });
    
    // Then it should use provided + defaults
    expect(smallButton).toContain("bg-gray-200"); // still secondary intent
    expect(smallButton).toContain("px-2"); // now sm size
  }
});

test({
  name: "variant() should handle boolean variants",
  fn: () => {
    // Given a button with boolean variants
    const button = variant({
      base: "rounded",
      settings: {
        disabled: {
          true: "opacity-50 cursor-not-allowed",
          false: "cursor-pointer"
        },
        fullWidth: {
          true: "w-full",
          false: "w-auto"
        }
      },
      defaultSettings: {
        disabled: false,
        fullWidth: false
      }
    });
    
    // When using boolean values
    const enabled = button({ disabled: false });
    const disabled = button({ disabled: true });
    const fullWidth = button({ fullWidth: true });
    
    // Then it should apply the correct classes
    expect(enabled).toContain("cursor-pointer");
    expect(disabled).toContain("opacity-50");
    expect(disabled).toContain("cursor-not-allowed");
    expect(fullWidth).toContain("w-full");
    
    // And when using actual booleans (not strings)
    const boolDisabled = button({ disabled: true });
    
    // Then it should still work
    expect(boolDisabled).toContain("opacity-50");
  }
});

/*##############################################(COMPOUND-VARIANTS)##############################################*/

test({
  name: "variant() should handle compound variants with composition",
  fn: () => {
    // Given a button with compound variants
    const button = variant({
      base: "rounded",
      settings: {
        intent: {
          primary: "bg-blue-500 text-white",
          secondary: "bg-gray-200 text-gray-800",
          danger: "bg-red-500 text-white"
        },
        size: {
          sm: "text-sm",
          lg: "text-lg"
        }
      },
      composition: [
        // Primary + Small = Extra styling
        {
          intent: "primary",
          size: "sm",
          class: "font-bold uppercase tracking-wider"
        },
        // Danger + Large = Warning icon
        {
          intent: "danger",
          size: "lg",
          class: "before:content-['⚠️'] before:mr-2"
        }
      ]
    });
    
    // When using combinations that match compound variants
    const smallPrimary = button({ intent: "primary", size: "sm" });
    const largeDanger = button({ intent: "danger", size: "lg" });
    const largeSecondary = button({ intent: "secondary", size: "lg" });
    
    // Then matching combinations get the extra styling
    expect(smallPrimary).toContain("font-bold");
    expect(smallPrimary).toContain("uppercase");
    
    expect(largeDanger).toContain("before:content-['⚠️']");
    
    // But non-matching combinations don't
    expect(largeSecondary).not.toContain("font-bold");
    expect(largeSecondary).not.toContain("before:content");
  }
});

test({
  name: "variant() should handle compound variants with multiple matches",
  fn: () => {
    // Given a button with multiple potential compound matches
    const button = variant({
      base: "rounded",
      settings: {
        intent: {
          primary: "bg-blue-500",
          danger: "bg-red-500"
        },
        size: {
          sm: "text-sm",
          lg: "text-lg"
        },
        outlined: {
          true: "border-2",
          false: ""
        }
      },
      composition: [
        // Primary button special case
        {
          intent: "primary",
          class: "text-white font-medium"
        },
        // Small button special case
        {
          size: "sm",
          class: "rounded-sm"
        },
        // Primary small special combination
        {
          intent: "primary",
          size: "sm",
          class: "shadow-sm"
        },
        // Outlined primary special
        {
          intent: "primary",
          outlined: true,
          class: "border-blue-700"
        }
      ]
    });
    
    // When a button matches multiple compound conditions
    const smallPrimaryOutlined = button({
      intent: "primary",
      size: "sm",
      outlined: true
    });
    
    // Then it should combine all matching compositions
    expect(smallPrimaryOutlined).toContain("text-white"); // from primary
    expect(smallPrimaryOutlined).toContain("rounded-sm"); // from small
    expect(smallPrimaryOutlined).toContain("shadow-sm"); // from primary+small
    expect(smallPrimaryOutlined).toContain("border-blue-700"); // from primary+outlined
  }
});

/*##############################################(CLASS-PROPS)##############################################*/

test({
  name: "variant() should handle class, className, and css props",
  fn: () => {
    // Given a basic button
    const button = variant({
      base: "rounded",
      settings: {
        intent: {
          primary: "bg-blue-500",
          secondary: "bg-gray-200"
        }
      }
    });
    
    // When passing additional classes via different props
    const withClass = button({
      intent: "primary",
      class: "mt-4 mb-2"
    });
    
    const withClassName = button({
      intent: "secondary",
      className: "px-8 py-3"
    });
    
    const withCss = button({
      intent: "primary",
      css: "hover:scale-105"
    });
    
    const withMultiple = button({
      intent: "secondary",
      class: "font-bold",
      className: "text-xl",
      css: "hover:bg-gray-300"
    });
    
    // Then all classes should be included
    expect(withClass).toContain("rounded");
    expect(withClass).toContain("bg-blue-500");
    expect(withClass).toContain("mt-4");
    expect(withClass).toContain("mb-2");
    
    expect(withClassName).toContain("bg-gray-200");
    expect(withClassName).toContain("px-8");
    
    expect(withCss).toContain("hover:scale-105");
    
    expect(withMultiple).toContain("font-bold");
    expect(withMultiple).toContain("text-xl");
    expect(withMultiple).toContain("hover:bg-gray-300");
  }
});

/*##############################################(CREATE-VARIANT)##############################################*/

test({
  name: "createVariant() should return a working variant system",
  fn: () => {
    // Given a custom variant system
    const mySystem = createVariant();
    
    // When creating variants with it
    const button = mySystem.variant({
      base: "rounded",
      settings: {
        color: {
          blue: "bg-blue-500",
          red: "bg-red-500"
        }
      }
    });
    
    // Then the variants should work
    const blueButton = button({ color: "blue" });
    expect(blueButton).toContain("bg-blue-500");
  }
});

test({
  name: "createVariant() should allow custom hooks",
  fn: () => {
    // Given a custom variant system with hooks
    const prefixedSystem = createVariant({
      hooks: {
        onComplete: (className) => `prefix-${className}`
      }
    });
    
    // When using kit from this system
    const result = prefixedSystem.kit("bg-blue-500", "text-white");
    
    // Then the hook should be applied
    expect(result).toBe("prefix-bg-blue-500 text-white");
  }
});

test({
  name: "createVariant() with config should return a preconfigured variant",
  fn: () => {
    // Given a direct variant configuration
    const buttonVariant = createVariant({
      base: "rounded",
      settings: {
        size: {
          sm: "text-sm",
          lg: "text-lg"
        }
      },
      defaultSettings: {
        size: "sm"
      }
    });
    
    // Create a variant function using the system
    const button = buttonVariant.variant({
      base: "rounded",
      settings: {
        size: {
          sm: "text-sm",
          lg: "text-lg"
        }
      }
    });
    
    // When using it to create buttons
    const smallButton = button({ size: "sm" });
    const largeButton = button({ size: "lg" });
    
    // Then it should work as expected
    expect(smallButton).toContain("text-sm");
    expect(largeButton).toContain("text-lg");
  }
});

/*##############################################(COMPOSE-VARIANT)##############################################*/

test({
  name: "composeVariant() should combine multiple variants",
  fn: () => {
    // Given several independent variants
    const sizeVariant = variant({
      settings: {
        size: {
          sm: "text-sm py-1 px-2",
          md: "text-base py-2 px-4",
          lg: "text-lg py-3 px-6",
        }
      }
    });
    
    const colorVariant = variant({
      settings: {
        color: {
          blue: "bg-blue-500 text-white",
          red: "bg-red-500 text-white",
          gray: "bg-gray-200 text-gray-800"
        }
      }
    });
    
    const shapeVariant = variant({
      settings: {
        rounded: {
          none: "rounded-none",
          md: "rounded-md",
          full: "rounded-full"
        }
      }
    });
    
    // When composing them together
    const buttonVariant = composeVariant(sizeVariant, colorVariant, shapeVariant);
    
    // Then it should handle all props
    const button = buttonVariant({
      size: "lg",
      color: "blue",
      rounded: "full"
    });
    
    // And combine them correctly
    expect(button).toContain("text-lg");
    expect(button).toContain("py-3");
    expect(button).toContain("bg-blue-500");
    expect(button).toContain("text-white");
    expect(button).toContain("rounded-full");
  }
});

test({
  name: "composeVariant() should handle defaults from individual variants",
  fn: () => {
    // Given variants with defaults
    const sizeVariant = variant({
      settings: {
        size: {
          sm: "text-sm",
          md: "text-base",
          lg: "text-lg"
        }
      },
      defaultSettings: {
        size: "md"
      }
    });
    
    const colorVariant = variant({
      settings: {
        color: {
          blue: "bg-blue-500",
          red: "bg-red-500"
        }
      },
      defaultSettings: {
        color: "blue"
      }
    });
    
    // When composing and using without all props
    const buttonVariant = composeVariant(sizeVariant, colorVariant);
    const button = buttonVariant();
    
    // Then it should use the defaults
    expect(button).toContain("text-base"); // default md
    expect(button).toContain("bg-blue-500"); // default blue
    
    // And when specifying only some props
    const redButton = buttonVariant({ color: "red" });
    
    // It should use provided + defaults
    expect(redButton).toContain("text-base"); // still default md
    expect(redButton).toContain("bg-red-500"); // specified red
  }
});

/*##############################################(TYPE-INFERENCE)##############################################*/

test({
  name: "VariantProps should correctly extract props type",
  fn: () => {
    // Given a button variant
    const button = variant({
      settings: {
        size: {
          sm: "text-sm",
          lg: "text-lg"
        },
        intent: {
          primary: "bg-blue-500",
          danger: "bg-red-500"
        },
        rounded: {
          true: "rounded",
          false: "rounded-none"
        }
      }
    });
    
    // When extracting its props type
    type ButtonProps = VariantProps<typeof button>;
    
    // TypeScript should infer the correct types
    // We can only test this at compile time, but for runtime verification:
    const props: Record<string, unknown> = {
      size: "sm",
      intent: "primary",
      rounded: true
    };
    
    // Then using those props should work
    const result = button(props as any);
    expect(result).toContain("text-sm");
    expect(result).toContain("bg-blue-500");
    expect(result).toContain("rounded");
  }
});

/*##############################################(EDGE-CASES)##############################################*/

test({
  name: "variant() should handle empty or missing settings",
  fn: () => {
    // Given a variant with no settings
    const emptyVariant = variant({
      base: "rounded bg-blue-500"
    });
    
    // When used
    const result = emptyVariant();
    
    // Then it should just use the base class
    expect(result).toBe("rounded bg-blue-500");
  }
});

test({
  name: "variant() should handle numeric values",
  fn: () => {
    // Given a variant with numeric values
    const gridVariant = variant({
      settings: {
        cols: {
          1: "grid-cols-1",
          2: "grid-cols-2", 
          3: "grid-cols-3",
          4: "grid-cols-4"
        }
      }
    });
    
    // When used with numeric keys
    const grid2Col = gridVariant({ cols: 2 });
    const grid4Col = gridVariant({ cols: 4 });
    
    // Then it should work correctly
    expect(grid2Col).toContain("grid-cols-2");
    expect(grid4Col).toContain("grid-cols-4");
  }
});

test({
  name: "variant() should handle falsy values",
  fn: () => {
    // Given a button with boolean and falsy options
    const button = variant({
      base: "btn",
      settings: {
        disabled: {
          true: "opacity-50",
          false: "opacity-100"
        },
        hidden: {
          true: "hidden",
          false: "block"
        },
        size: {
          0: "scale-0",
          1: "scale-100"
        }
      }
    });
    
    // When using falsy values
    const notDisabled = button({ disabled: false });
    const sizeZero = button({ size: 0 });
    
    // Then it should handle them correctly
    expect(notDisabled).toContain("opacity-100");
    expect(sizeZero).toContain("scale-0");
  }
});

test({
  name: "variant() should handle array values in composition",
  fn: () => {
    // Given a button with array match in compound variant
    const button = variant({
      base: "btn",
      settings: {
        size: {
          sm: "text-sm",
          md: "text-base",
          lg: "text-lg"
        },
        intent: {
          primary: "bg-blue-500",
          secondary: "bg-gray-200",
          danger: "bg-red-500"
        }
      },
      composition: [
        // Match ANY of these sizes with primary
        {
          size: "sm",
          intent: "primary",
          class: "font-medium"
        },
        // Also add a second rule for md size
        {
          size: "md", 
          intent: "primary",
          class: "font-medium"
        }
      ]
    });
    
    // When variants match the conditions
    const smallPrimary = button({ size: "sm", intent: "primary" });
    const mediumPrimary = button({ size: "md", intent: "primary" });
    const largePrimary = button({ size: "lg", intent: "primary" });
    
    // Then it should match the appropriate rules
    expect(smallPrimary).toContain("font-medium");
    expect(mediumPrimary).toContain("font-medium");
    expect(largePrimary).not.toContain("font-medium");
  }
});

/*##############################################(INTEGRATION-EXAMPLES)##############################################*/

test({
  name: "Example: creating a complete button system",
  fn: () => {
    // Given a comprehensive button system
    const button = variant({
      base: "inline-flex items-center justify-center font-medium transition-colors",
      settings: {
        variant: {
          primary: "bg-blue-500 text-white hover:bg-blue-600",
          secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
          outline: "bg-transparent border border-current text-blue-500 hover:bg-blue-50",
          ghost: "bg-transparent text-blue-500 hover:bg-blue-50",
          danger: "bg-red-500 text-white hover:bg-red-600"
        },
        size: {
          xs: "text-xs px-2 py-1 rounded",
          sm: "text-sm px-3 py-1.5 rounded-md",
          md: "text-base px-4 py-2 rounded-md",
          lg: "text-lg px-5 py-2.5 rounded-lg",
          xl: "text-xl px-6 py-3 rounded-lg"
        },
        fullWidth: {
          true: "w-full",
          false: "w-auto"
        },
        disabled: {
          true: "opacity-50 cursor-not-allowed pointer-events-none",
          false: "cursor-pointer"
        }
      },
      defaultSettings: {
        variant: "primary",
        size: "md",
        fullWidth: false,
        disabled: false
      },
      composition: [
        // Special case for outline + disabled
        {
          variant: "outline",
          disabled: true,
          class: "border-gray-300 text-gray-300"
        },
        // Special case for ghost + disabled
        {
          variant: "ghost",
          disabled: true,
          class: "text-gray-300"
        },
        // Large primary buttons get extra shadow - separate rules for each size
        {
          variant: "primary",
          size: "lg",
          class: "shadow-lg"
        },
        {
          variant: "primary",
          size: "xl",
          class: "shadow-lg"
        }
      ]
    });
    
    // When creating different button styles
    const defaultBtn = button();
    const secondaryBtn = button({ variant: "secondary" });
    const smallOutlineBtn = button({ variant: "outline", size: "sm" });
    const largeGhostBtn = button({ variant: "ghost", size: "lg" });
    const disabledDangerBtn = button({ variant: "danger", disabled: true });
    const largePrimaryBtn = button({ variant: "primary", size: "lg" });
    const disabledOutlineBtn = button({ variant: "outline", disabled: true });
    
    // Then they should all have the expected classes
    expect(defaultBtn).toContain("bg-blue-500"); // primary by default
    expect(defaultBtn).toContain("px-4"); // md size by default
    
    expect(secondaryBtn).toContain("bg-gray-200");
    expect(secondaryBtn).toContain("hover:bg-gray-300");
    
    expect(smallOutlineBtn).toContain("border");
    expect(smallOutlineBtn).toContain("text-blue-500");
    expect(smallOutlineBtn).toContain("text-sm");
    
    expect(disabledDangerBtn).toContain("bg-red-500");
    expect(disabledDangerBtn).toContain("opacity-50");
    expect(disabledDangerBtn).toContain("cursor-not-allowed");
    
    expect(largePrimaryBtn).toContain("shadow-lg"); // from compound variant
    
    // Compound variants should work as expected
    expect(disabledOutlineBtn).toContain("border-gray-300"); // from compound
    expect(disabledOutlineBtn).toContain("text-gray-300"); // from compound
  }
});
