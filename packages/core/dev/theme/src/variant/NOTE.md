# Variant Composition: Common Gotchas

## 🚨 Key Things to Know

Variant composition can be tricky when working with deeply nested and complex variant settings. Here's what you need to watch out for:

## API Methods

### Using the `applyVariant` Method

<details>
<summary>💡 <strong>Terminology:</strong> Variant API</summary>

The variant system provides the `applyVariant` method for applying variant styles. This method takes your variant props and returns the generated class names.

</details>

#### Example Usage

```typescript
import { createVariant, type VariantProps } from "@inspatial/theme/variant";

// Create a button variant
const ButtonVariant = createVariant({
  base: "inline-flex items-center justify-center rounded transition-colors",
  settings: {
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    },
    format: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    },
  },
  defaultSettings: {
    size: "md",
    format: "primary",
  },
});

// Extract the props type
export type ButtonVariantType = VariantProps<typeof ButtonVariant>;

// Use the variant
const primaryButton = ButtonVariant.applyVariant({
  size: "lg",
});

// With className prop
const customButton = ButtonVariant.applyVariant({
  format: "secondary",
  className: "font-bold",
});
```

## Type Errors

### Missing Properties in `createVariant` Settings

<details>
<summary>💡 <strong>Terminology:</strong> Empty Variant Properties</summary>

When creating variants using `createVariant`, each property in the settings object must have at least one value defined, even if it's an empty string. Otherwise, TypeScript will raise type errors when using the variant methods.

</details>

#### ❌ Problem Example

```typescript
// This will cause a type error
export const HeaderWidgetVariant = createVariant({
  base: "inline-flex cursor-auto",
  settings: {
    format: {
      // Empty object with no properties
    },
    // other variants
  },
  defaultSettings: {
    format: "full",
    // other defaults
  },
});

// Later usage will generate error:
// Property 'applyVariant' does not exist on type 'VariantSystemReturn'
const variantClass = HeaderWidgetVariant.applyVariant({
  format: "full",
  ...settings,
});
```

#### ✅ Correct Implementation

```typescript
import { createVariant, type VariantProps } from "@inspatial/theme/variant";

export const HeaderWidgetVariant = createVariant({
  base: "inline-flex cursor-auto",
  settings: {
    variant: {
      // Must have properties defined
      full: "absolute top-[80px] left-0 z-10 md:hidden overflow-hidden",
      segmented: "", // Even empty strings are acceptable
    },
    // other variants
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
});

// Usage
const variantClass = HeaderWidgetVariant.applyVariant({
  variant: "full",
  ...settings,
});
```

## Best Practices

1. **Always define at least one property** for each variant category
2. **Use empty strings** (`""`) when no classes are needed
3. **Export typed props** using `VariantProps<typeof yourVariant.applyVariant>`
4. **Include all possible options** in your `defaultSettings`

> [!NOTE]
> Adding more variants later is easy, just ensure you update both the `settings` and `defaultSettings` objects.

# More Things to Know About the Variant System

### 1. Core API (Create Variant)

```typescript
// Consistent API shape regardless of how it's called:
const system = createVariant(); // Returns {applyVariant, kit, variant, composeVariant}
const buttonVariant = createVariant({ ...config }); // Returns {applyVariant, kit, variant, composeVariant, config}
```

### 2. Type Extraction

```typescript
// Consistent type extraction from any variant pattern:
type ButtonVariantType = VariantProps<typeof ButtonVariant>;
```

## Using Factory Functions

If you're using the factory pattern (creating your own variant system):

```typescript
// Create a custom variant system
const myVariantSystem = createVariant({
  hooks: {
    onComplete: (className) => `my-prefix-${className}`,
  },
});

// Use the system to create variants
const button = myVariantSystem.variant({
  base: "rounded",
  settings: {
    size: {
      sm: "text-sm",
      lg: "text-lg",
    },
  },
});

// Apply the variant
const className = button({ size: "sm" });
```
