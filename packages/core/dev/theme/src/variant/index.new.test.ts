import { test, expect } from "@inspatial/test";
import { 
  createVariant, 
  kit, 
  variant, 
  composeVariant, 
  type VariantProps 
} from "./index.ts";

/**
 * Test suite for the streamlined InSpatial Variant System API
 */

/*##############################################(API-CONSISTENCY)##############################################*/

test({
  name: "createVariant() with options returns a consistent API shape",
  fn: () => {
    // When creating a variant system with options
    const system = createVariant({
      hooks: {
        onComplete: (className) => className
      }
    });
    
    // Then it should have a consistent API shape
    expect(typeof system.applyVariant).toBe("function");
    expect(typeof system.variant).toBe("function");
    expect(typeof system.composeVariant).toBe("function");
    expect(typeof system.kit).toBe("function");
  }
});

test({
  name: "createVariant() with direct config returns a consistent API shape",
  fn: () => {
    // When creating a variant with direct config
    const buttonVariant = createVariant({
      base: "rounded",
      settings: {
        intent: {
          primary: "bg-blue-500",
          secondary: "bg-gray-200"
        }
      }
    });
    
    // Then it should have a consistent API shape
    expect(typeof buttonVariant.applyVariant).toBe("function");
    expect(typeof buttonVariant.variant).toBe("function");
    expect(typeof buttonVariant.composeVariant).toBe("function");
    expect(typeof buttonVariant.kit).toBe("function");
    
    // And should have the config
    expect(buttonVariant.config).toBeDefined();
    expect(buttonVariant.config?.base).toBe("rounded");
  }
});

/*##############################################(API-FUNCTIONALITY)##############################################*/

test({
  name: "applyVariant() handles all variant features",
  fn: () => {
    // Given a complex variant
    const buttonVariant = createVariant({
      base: "rounded",
      settings: {
        size: {
          sm: "text-sm py-1 px-2",
          md: "text-base py-2 px-4",
          lg: "text-lg py-3 px-6"
        },
        intent: {
          primary: "bg-blue-500 text-white",
          secondary: "bg-gray-200 text-gray-800"
        },
        disabled: {
          true: "opacity-50 cursor-not-allowed",
          false: "cursor-pointer"
        }
      },
      defaultSettings: {
        size: "md",
        intent: "primary",
        disabled: false
      },
      composition: [
        {
          intent: "primary",
          size: "sm",
          class: "font-bold"
        }
      ]
    });
    
    // When applying with different props
    const defaultButton = buttonVariant.applyVariant();
    const primarySmall = buttonVariant.applyVariant({ intent: "primary", size: "sm" });
    const secondaryDisabled = buttonVariant.applyVariant({
      intent: "secondary", 
      disabled: true,
      className: "custom-class"
    });
    
    // Then it should correctly apply all variant features
    
    // Default settings
    expect(defaultButton).toContain("rounded");
    expect(defaultButton).toContain("bg-blue-500");
    expect(defaultButton).toContain("text-base");
    expect(defaultButton).toContain("cursor-pointer");
    
    // Explicit settings with compound variant
    expect(primarySmall).toContain("text-sm");
    expect(primarySmall).toContain("bg-blue-500");
    expect(primarySmall).toContain("font-bold"); // From composition
    
    // Mixed settings with className
    expect(secondaryDisabled).toContain("bg-gray-200");
    expect(secondaryDisabled).toContain("opacity-50");
    expect(secondaryDisabled).toContain("custom-class");
  }
});

/*##############################################(TYPE-EXTRACTION)##############################################*/

test({
  name: "VariantProps works with applyVariant",
  fn: () => {
    // Given a button variant
    const buttonVariant = createVariant({
      settings: {
        size: {
          sm: "text-sm",
          lg: "text-lg"
        },
        intent: {
          primary: "bg-blue-500",
          danger: "bg-red-500"
        }
      }
    });
    
    // TypeScript type extraction (compile-time check)
    // type ButtonProps = VariantProps<typeof buttonVariant.applyVariant>;
    
    // Runtime verification with record
    const props: Record<string, unknown> = {
      size: "sm",
      intent: "primary"
    };
    
    // Method should work with the props
    const result = buttonVariant.applyVariant(props as any);
    
    expect(result).toContain("text-sm");
    expect(result).toContain("bg-blue-500");
  }
});

test({
  name: "VariantProps works with direct variant functions",
  fn: () => {
    // Given a direct variant function
    const button = variant({
      settings: {
        size: {
          sm: "text-sm",
          lg: "text-lg"
        }
      }
    });
    
    // TypeScript type extraction (compile-time check)
    // type ButtonProps = VariantProps<typeof button>;
    
    // Runtime verification
    const props = { size: "lg" as const };
    const result = button(props);
    
    expect(result).toContain("text-lg");
  }
});

/*##############################################(FACTORY-PATTERN)##############################################*/

test({
  name: "createVariant() can be used as a factory for creating consistent variants",
  fn: () => {
    // Given a custom variant system
    const mySystem = createVariant({
      hooks: {
        onComplete: (className) => `prefix-${className}`
      }
    });
    
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
    
    // Then the variants should work with the hooks applied
    const blueButton = button({ color: "blue" });
    expect(blueButton).toBe("rounded prefix-bg-blue-500");
  }
});

/*##############################################(GLOBAL-EXPORTS)##############################################*/

test({
  name: "Global exports (kit, variant, composeVariant) work as expected",
  fn: () => {
    // Given direct usage of kit
    const kitResult = kit("text-red-500", "bg-blue-200");
    
    // Then it should work as expected
    expect(kitResult).toContain("text-red-500");
    expect(kitResult).toContain("bg-blue-200");
    
    // Given direct usage of variant
    const button = variant({
      base: "rounded",
      settings: {
        intent: {
          primary: "bg-blue-500",
          secondary: "bg-gray-200"
        }
      }
    });
    
    // Then it should work as expected
    const primaryButton = button({ intent: "primary" });
    expect(primaryButton).toContain("rounded");
    expect(primaryButton).toContain("bg-blue-500");
    
    // Given direct usage of composeVariant
    const sizeVariant = variant({
      settings: {
        size: {
          sm: "text-sm",
          lg: "text-lg"
        }
      }
    });
    
    const colorVariant = variant({
      settings: {
        color: {
          blue: "bg-blue-500",
          red: "bg-red-500"
        }
      }
    });
    
    const composed = composeVariant(sizeVariant, colorVariant);
    
    // Then it should work as expected
    const result = composed({ size: "lg" as const, color: "red" as const });
    expect(result).toContain("text-lg");
    expect(result).toContain("bg-red-500");
  }
}); 