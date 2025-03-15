import { test, expect } from "@inspatial/test";
import { composeVariant, createVariant, kit, variant } from "./index.ts";

/**
 * Tests for the variant system using the new property names:
 * - settings (instead of variants)
 * - composition (instead of compoundVariants)
 * - defaultSettings (instead of defaultVariants)
 */

test({
  name: "Variant system should use new settings property name",
  fn: () => {
    // Given a button variant with settings property
    const button = variant({
      base: "btn",
      settings: {
        variant: {
          primary: "bg-blue-500",
          secondary: "bg-gray-500",
        },
        size: {
          sm: "text-sm",
          lg: "text-lg",
        },
      },
      defaultSettings: {
        variant: "primary",
        size: "sm",
      },
    });

    // When we use it with default values
    const defaultClassName = button();

    // Then it should include base and default variant values
    expect(defaultClassName).toContain("btn");
    expect(defaultClassName).toContain("bg-blue-500");
    expect(defaultClassName).toContain("text-sm");

    // When we use it with custom values
    const customClassName = button({
      variant: "secondary",
      size: "lg",
    });

    // Then it should include the custom variant values
    expect(customClassName).toContain("btn");
    expect(customClassName).toContain("bg-gray-500");
    expect(customClassName).toContain("text-lg");
  },
});

test({
  name: "Variant system should use new composition property name",
  fn: () => {
    // Given a button with composition rules
    const button = variant({
      base: "btn",
      settings: {
        variant: {
          primary: "bg-blue-500",
          secondary: "bg-gray-500",
        },
        size: {
          sm: "text-sm",
          lg: "text-lg",
        },
      },
      composition: [
        {
          variant: "primary",
          size: "lg",
          class: "font-bold",
        },
      ],
    });

    // When we use a combination that matches a composition rule
    const composedClassName = button({
      variant: "primary",
      size: "lg",
    });

    // Then it should include the composed classes
    expect(composedClassName).toContain("btn");
    expect(composedClassName).toContain("bg-blue-500");
    expect(composedClassName).toContain("text-lg");
    expect(composedClassName).toContain("font-bold");
  },
});

test({
  name: "Variant system should use new defaultSettings property name",
  fn: () => {
    // Given a button with defaultSettings
    const button = variant({
      base: "btn",
      settings: {
        variant: {
          primary: "bg-blue-500",
          secondary: "bg-gray-500",
        },
        size: {
          sm: "text-sm",
          lg: "text-lg",
        },
      },
      defaultSettings: {
        variant: "secondary",
        size: "lg",
      },
    });

    // When we call it without any props
    const className = button();

    // Then it should use the default settings
    expect(className).toContain("btn");
    expect(className).toContain("bg-gray-500");
    expect(className).toContain("text-lg");
  },
});

test({
  name: "composeVariant should combine multiple variant components",
  fn: () => {
    // Given a variant system
    const { variant, composeVariant } = createVariant();

    // And some variant components
    const sizeVariant = variant({
      settings: {
        size: {
          sm: "text-sm",
          lg: "text-lg",
        },
      },
      defaultSettings: {
        size: "sm",
      },
    });

    const colorVariant = variant({
      settings: {
        color: {
          red: "text-red-500",
          blue: "text-blue-500",
        },
      },
      defaultSettings: {
        color: "blue",
      },
    });

    // When we compose them
    const composedVariant = composeVariant(sizeVariant, colorVariant);

    // And use the composed variant
    const className = composedVariant({
      size: "lg",
      color: "red",
    });

    // Then it should include both variant classes
    expect(className).toContain("text-lg");
    expect(className).toContain("text-red-500");
  },
});
