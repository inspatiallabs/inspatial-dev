# Variant Composition: Common Gotchas

## 🚨 Key Things to Know

Variant composition can be tricky when working with deeply nested and complex variant settings. Here's what you need to watch out for:

## API Methods

### Using the `useVariant` Method

<details>
<summary>💡 <strong>Terminology:</strong> Variant API</summary>

The variant system provides the `useVariant` method for applying variant styles. This method takes your variant props and returns the generated class names.
</details>

#### Example Usage

```typescript
import { createVariant } from "@inspatial/theme/variant";

const buttonVariant = createVariant({
  base: "px-4 py-2 rounded",
  settings: {
    intent: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-800"
    }
  }
});

// Apply variant styles
const button = buttonVariant.useVariant({ intent: "primary" });
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
export const headerWidgetVariants = createVariant({
  base: "inline-flex cursor-auto",
  settings: {
    variant: {
      // Empty object with no properties
    },
    // other variants
  },
  defaultSettings: {
    variant: "full",
    // other defaults
  },
});

// Later usage will generate error:
// Property 'useVariant' does not exist on type 'VariantSystemReturn'
const variantClass = headerWidgetVariants.useVariant({
  variant: "full",
  ...settings,
});
```

#### ✅ Correct Implementation

```typescript
import { createVariant, type VariantProps } from "@inspatial/theme/variant";

export const headerWidgetVariants = createVariant({
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

export type HeaderWidgetVariant = VariantProps<
  typeof headerWidgetVariants.useVariant
>;
```

## Best Practices

1. **Always define at least one property** for each variant category
2. **Use empty strings** (`""`) when no classes are needed
3. **Export typed props** using `VariantProps<typeof yourVariant.useVariant>`
4. **Include all possible options** in your `defaultSettings`

> [!NOTE]
> Adding more variants later is easy, just ensure you update both the `settings` and `defaultSettings` objects.

## Other Common Issues

<!-- More sections can be added here later -->
