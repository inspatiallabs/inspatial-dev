/*##############################################(TYPES)##############################################*/

type ClassValueProp =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
type ClassDictionary = Record<string, any>;
type ClassArray = ClassValueProp[];

type OmitUndefined<T> = T extends undefined ? never : T;
type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Extract props type from a variant function or object
 * Works with direct variant functions and variant objects
 */
type VariantProps<T> = T extends (props?: infer P) => string
  ? OmitUndefined<P>
  : T extends { applyVariant: (props?: infer P) => string }
  ? OmitUndefined<P>
  : never;

/*##############################################(UTILITIES)##############################################*/

// Tailwind-style class merging
const TW_PROPERTIES: Record<string, boolean> = {
  // Layout
  float: true,
  clear: true,
  position: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
  z: true,
  order: true,

  // Display & Box Behavior
  grid: true,
  flex: true,
  basis: true,
  grow: true,
  shrink: true,

  // Spacing (Margin/Padding)
  m: true,
  mx: true,
  my: true,
  mt: true,
  mr: true,
  mb: true,
  ml: true,
  p: true,
  px: true,
  py: true,
  pt: true,
  pr: true,
  pb: true,
  pl: true,

  // Sizing
  w: true,
  "min-w": true,
  "max-w": true,
  h: true,
  "min-h": true,
  "max-h": true,

  // Typography
  text: true,
  font: true,
  tracking: true,
  leading: true,
  list: true,
  decoration: true,
  underline: true,
  "line-through": true,
  "no-underline": true,

  // Backgrounds
  bg: true,
  from: true,
  via: true,
  to: true,

  // Borders
  border: true,
  "border-t": true,
  "border-r": true,
  "border-b": true,
  "border-l": true,
  rounded: true,
  "rounded-t": true,
  "rounded-r": true,
  "rounded-b": true,
  "rounded-l": true,
  "rounded-tl": true,
  "rounded-tr": true,
  "rounded-br": true,
  "rounded-bl": true,
  divide: true,

  // Effects
  shadow: true,
  opacity: true,
  "mix-blend": true,
  blur: true,

  // Transitions & Animation
  transition: true,
  duration: true,
  ease: true,
  delay: true,

  // Transforms
  scale: true,
  rotate: true,
  translate: true,
  skew: true,
  origin: true,

  // Interactivity
  cursor: true,
  select: true,
  resize: true,

  // SVG
  fill: true,
  stroke: true,

  // Accessibility
  sr: true,

  // Tables
  table: true,

  // Effects
  filter: true,
  backdrop: true,

  // Color utilities
  color: true,
  accent: true,

  // Display
  display: true,
  visibility: true,

  // Flexbox & Grid
  items: true,
  justify: true,
  content: true,
  place: true,
  self: true,

  // Columns & Gaps
  gap: true,
  "gap-x": true,
  "gap-y": true,
  col: true,
  row: true,

  // Overflow
  overflow: true,
  "overflow-x": true,
  "overflow-y": true,

  // Overscroll
  overscroll: true,
  "overscroll-x": true,
  "overscroll-y": true,
};

/*##############################################(SPLIT-TAILWIND-CLASS)##############################################*/

function splitTailwindClass(className: string): [string, string, string] {
  // Handle pseudo-classes and breakpoints
  const [variants, ...rest] = className.split(":").reverse();
  const base = rest.length ? rest.reverse().join(":") : "";

  // Extract property and value
  // Tailwind class structure is either 'property' or 'property-value'
  const matches = variants.match(/^([a-zA-Z0-9-]+)(?:-(.+))?$/);
  if (!matches) return ["", "", variants];

  const [, property, value = ""] = matches;
  return [base, property, value];
}

/*##############################################(MERGE-CLASSES)##############################################*/

function mergeClasses(classes: string[]): string {
  // Flatten the input classes and filter out falsy values
  const allClassNames: string[] = [];
  classes.forEach((cls) => {
    if (!cls) return;
    allClassNames.push(...cls.split(/\s+/).filter(Boolean));
  });

  // Keep track of Tailwind utilities we've seen
  const utilityMap: Record<string, string> = {};
  const finalClasses: string[] = [];

  // Process class names in reverse order so later ones win
  for (let i = allClassNames.length - 1; i >= 0; i--) {
    const className = allClassNames[i];
    if (!className) continue;

    // For Tailwind utility classes, check for conflicts
    if (isTailwindClass(className)) {
      const { variant, utility, fullClass } = parseTailwindClass(className);

      // Special handling for specific utility types that need more granular keys
      // For classes like text-sm, text-base, text-lg we want to keep all of them
      // and not treat them as conflicts
      let key;

      // For text utilities, use the full class as the key if it's a size value
      if (
        utility === "text" &&
        /text-(xs|sm|base|lg|xl|[0-9]+xl)/.test(fullClass)
      ) {
        key = variant ? `${variant}:${fullClass}` : fullClass;
      }
      // For padding and margin, p-1, p-2, etc. should conflict
      else {
        key = variant ? `${variant}:${utility}` : utility;
      }

      // If we haven't seen this utility type before, add it
      if (!utilityMap[key]) {
        utilityMap[key] = className;
        finalClasses.unshift(className); // Add to beginning since we're going in reverse
      }
    } else {
      // For non-Tailwind classes, just add them if we haven't seen them
      if (!finalClasses.includes(className)) {
        finalClasses.unshift(className);
      }
    }
  }

  return finalClasses.join(" ");
}

/**
 * Checks if a class name is a Tailwind utility class
 */
function isTailwindClass(className: string): boolean {
  // Get the base class without variants
  const baseName = className.split(":").pop() || "";
  // Extract the utility prefix
  const utilityPrefix = baseName.split("-")[0];

  return Boolean(utilityPrefix && TW_PROPERTIES[utilityPrefix]);
}

/**
 * Parses a Tailwind class into its variant and utility parts
 */
function parseTailwindClass(className: string): {
  variant: string;
  utility: string;
  fullClass: string;
} {
  const parts = className.split(":");
  let variant = "";
  let baseClass = className;

  // Handle variant prefixes
  if (parts.length > 1) {
    variant = parts.slice(0, -1).join(":");
    baseClass = parts[parts.length - 1];
  }

  // Extract the utility prefix from the base class
  const utilityPrefix = baseClass.split("-")[0];

  return {
    variant,
    utility: utilityPrefix,
    fullClass: baseClass,
  };
}

/*##############################################(TO-VAL)##############################################*/
function toVal(mix: ClassValueProp): string {
  let str = "";

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix;
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      for (let k = 0; k < mix.length; k++) {
        if (mix[k]) {
          const y = toVal(mix[k]);
          if (y) {
            str && (str += " ");
            str += y;
          }
        }
      }
    } else {
      for (const key in mix) {
        if (mix && typeof mix === "object" && mix[key]) {
          str && (str += " ");
          str += key;
        }
      }
    }
  }
  return str;
}

/*##############################################(KIT-UTIL)##############################################*/
function kitUtil(...inputs: ClassValueProp[]): string {
  let str = "";
  for (let i = 0; i < inputs.length; i++) {
    const tmp = inputs[i];
    if (tmp) {
      const x = toVal(tmp);
      if (x) {
        str && (str += " ");
        str += x;
      }
    }
  }
  return str;
}

/*##############################################(FALSY-TO-STRING)##############################################*/
const falsyToString = <T extends unknown>(value: T) =>
  typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;

/*##############################################(VARIANT-SYSTEM)##############################################*/

type VariantShapeProp = Record<string, Record<string, ClassValueProp>>;
type VariantSchemaProp<V extends VariantShapeProp> = {
  [Variant in keyof V]?: StringToBoolean<keyof V[Variant]> | undefined;
};

/**
 * Type definition for variant configuration objects
 * For type inference and IDE autocompletion
 */
export interface InSpatialVariantConfig<V extends VariantShapeProp> {
  /** Base classes applied to all instances */
  base?: ClassValueProp;

  /** Variant settings mapping variant names to their possible values */
  settings?: V;

  /** Compound variants for complex combinations */
  composition?: Array<
    VariantSchemaProp<V> & {
      class?: ClassValueProp;
      className?: ClassValueProp;
      css?: ClassValueProp;
    }
  >;

  /** Default values for variants */
  defaultSettings?: VariantSchemaProp<V>;

  /** Hooks for customizing the output class names */
  hooks?: {
    /** Function called after generating the final className */
    onComplete?: (className: string) => string;
  };
}

type VariantConfigProp = InSpatialVariantConfig<any>;

interface ComposeVariantProp {
  <T extends ReturnType<VariantProp>[]>(...components: [...T]): (
    props?: (
      | UnionToIntersection<
          {
            [K in keyof T]: VariantProps<T[K]>;
          }[number]
        >
      | undefined
    ) & {
      class?: ClassValueProp;
      className?: ClassValueProp;
      css?: ClassValueProp;
    }
  ) => string;
}

interface VariantProp {
  <V extends VariantShapeProp>(config: InSpatialVariantConfig<V>): (
    props?: VariantSchemaProp<V> & {
      class?: ClassValueProp;
      className?: ClassValueProp;
      css?: ClassValueProp;
    }
  ) => string;
}

/**
 * Standard interface for all variant system returns
 * Ensures consistency across different creation methods
 */
interface VariantSystemReturn<V extends VariantShapeProp = any> {
  /** Core function to apply variants */
  applyVariant: (
    props?: VariantSchemaProp<V> & {
      class?: ClassValueProp;
      className?: ClassValueProp;
      css?: ClassValueProp;
    }
  ) => string;

  /** Utility for combining classes with intelligent conflict resolution */
  kit: (...inputs: ClassValueProp[]) => string;

  /** Creates variant functions with configurable styles */
  variant: VariantProp;

  /** Utility for combining multiple variant components */
  composeVariant: ComposeVariantProp;

  /** Configuration used to create this variant (only if direct config was provided) */
  config?: InSpatialVariantConfig<V>;
}

/**
 * Core implementation of the variant system
 * This is used internally by both the global exports and createVariant
 */
function createVariantCore<V extends VariantShapeProp>(
  options?: VariantConfigProp
): VariantSystemReturn<V> {
  const kit = (...inputs: ClassValueProp[]): string => {
    const className = kitUtil(inputs);
    return (
      options?.hooks?.onComplete?.(className) ??
      mergeClasses(className.split(" "))
    );
  };

  const variant: VariantProp = (config) => (props) => {
    if (!config.settings) {
      return kit(config.base, props?.class, props?.className, props?.css);
    }

    const { settings, defaultSettings } = config;

    // Process variant classes
    const variantClasses = Object.keys(settings).map((variant) => {
      const prop = props?.[variant as keyof typeof props];
      const defaultProp = defaultSettings?.[variant];
      const value = falsyToString(prop ?? defaultProp);
      const variantObj = settings[variant];
      return variantObj[value as keyof typeof variantObj];
    });

    // Process compound variants
    const compoundClasses = config.composition?.reduce((acc, cv) => {
      const {
        class: cvClass,
        className: cvClassName,
        css: cvCss,
        ...conditions
      } = cv;
      const matches = Object.entries(conditions).every(([key, value]) => {
        const propValue =
          props?.[key as keyof typeof props] ??
          defaultSettings?.[key as keyof typeof defaultSettings];
        return Array.isArray(value)
          ? value.includes(propValue)
          : propValue === value;
      });

      return matches ? [...acc, cvClass, cvClassName, cvCss] : acc;
    }, [] as ClassValueProp[]);

    // Handle base classes first to ensure they appear in expected order
    const baseClasses = config.base ? `${config.base}` : "";
    const additionalClasses = kit(
      variantClasses,
      compoundClasses,
      props?.class,
      props?.className,
      props?.css
    );

    // Combine base with additional classes
    return baseClasses
      ? `${baseClasses} ${additionalClasses}`.trim()
      : additionalClasses;
  };

  const composeVariant: ComposeVariantProp =
    (...components) =>
    (props) => {
      const { class: cls, className, css, ...variantProps } = props || {};

      // Get the raw classes from each component
      const componentResults = components.map((component) =>
        component(variantProps as any)
      );

      // Combine with other provided classes
      const allClasses = [...componentResults, cls, className, css];

      // Use kit to apply intelligent conflict resolution
      return kit(...allClasses);
    };

  // Define the placeholder applyVariant function
  const applyVariant = ((props?: any) => "") as (
    props?: VariantSchemaProp<V> & {
      class?: ClassValueProp;
      className?: ClassValueProp;
      css?: ClassValueProp;
    }
  ) => string;

  // Return a minimal system with the properly typed methods
  return {
    applyVariant,
    kit,
    variant,
    composeVariant,
  };
}

/*##############################################(KIT)##############################################*/
/**
 * # Kit
 * #### A utility for intelligent class name composition and conflict resolution
 *
 * Kit combines CSS classes with intelligent conflict resolution, working like a smart
 * style manager that knows how to combine css classes without conflicts.
 *
 * @since 0.1.1
 * @category InSpatial Theme
 * @module Kit
 * @kind utility
 * @access public
 *
 * @example
 * ### Basic Usage
 * ```typescript
 * import { kit } from '@inspatial/theme/variant';
 *
 * // Combining simple classes
 * const className = kit('bg-pop-500 text-white', 'hover:bg-pop-600');
 *
 * // With conditional classes
 * const buttonClass = kit(
 *   'px-4 py-2 rounded',
 *   isActive ? 'bg-pop-500' : 'bg-damp-200'
 * );
 * ```
 *
 * @example
 * ### Handling Class Conflicts
 * ```typescript
 * // Kit automatically resolves Tailwind conflicts
 * const element = kit(
 *   'p-4',           // Base padding
 *   'p-6',           // This will override the previous padding
 *   'dark:p-8'       // Dark mode padding remains separate
 * );
 * // Result: 'p-6 dark:p-8'
 * ```
 *
 * @param {...ClassValueProp[]} inputs - Accepts any number of class values to be combined
 * @returns {string} A merged string of CSS classes with conflicts resolved
 */

// Create the base system for global exports
const baseSystem = createVariantCore();

// Export the global utilities
/** Utility for intelligent class name composition and conflict resolution */
export const kit = baseSystem.kit;

/** Creates variant functions with configurable styles */
export const variant = baseSystem.variant;

/** Utility for combining multiple variant components */
export const composeVariant = baseSystem.composeVariant;

/*##############################################(CREATE-VARIANT)##############################################*/
/**
 * # CreateVariant
 * #### A factory function that creates a customizable variant styling system
 *
 * The `createVariant` function is like a style system factory. Think of it as a custom
 * clothing designer that lets you create your own styling rules and combinations.
 *
 * @since 0.1.1
 * @category InSpatial Theme
 * @module Kit
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts

 * - Custom variant system creation
 * - Configurable style hooks
 * - Tailwind-compatible class merging
 *
 * ### 📚 Terminology
 * > **Variant System**: A structured way to manage different style variations of a component
 * > **Style Hooks**: Functions that can modify the final output of class names
 * > **applyVariant**: Method to apply variant styles to components
 *
 * @example 
 * ### Basic Configuration
 * 
 * import { createVariant } from "@inspatial/theme/variant";
 * import type { VariantProps } from "@inspatial/theme/variant";
 * 
 * ```typescript
 * const ComponentVariant = createVariant({
 *   settings: {
 *     size: { sm: "text-sm px-2", lg: "text-lg px-4" },
 *     theme: { light: "bg-white text-black", dark: "bg-black text-white" }
 *   }
 * });
 * 
 * // type inference with applyVariant
 * type ComponentVariantProps = VariantProps<typeof ComponentVariant.applyVariant> & {
 *   // Add any additional props here that are not part of the variant system (optional)
 * }
 *
 * // Apply styles with the variant
 * const className = ComponentVariant.applyVariant({ size: "sm", theme: "dark" });
 * ```
 * 
 * ### Custom System
 * ```typescript
 * import { createVariant } from '@inspatial/theme/variant';
 *
 * // Create a custom variant system with a class name transformer
 * const { variant, kit } = createVariant({
 *   hooks: {
 *     onComplete: (className) => `my-prefix-${className}`
 *   }
 * });
 *
 * // Use the custom variant system
 * const button = variant({
 *   base: "rounded-md",
 *   settings: {
 *     size: {
 *       sm: "text-sm px-2",
 *       lg: "text-lg px-4"
 *     }
 *   }
 * });
 * ```
 *
 * @param {VariantConfigProp | InSpatialVariantConfig<V>} [configOrOptions] - 
 * Configuration options for the variant system, or a direct variant configuration
 * @returns {VariantSystemReturn<V>} Returns an object containing the core styling utilities 
 * and variant functions with a consistent API shape
 */

/**
 * Unified implementation of createVariant that handles both usage patterns
 */
export function createVariant<V extends VariantShapeProp>(
  configOrOptions?: VariantConfigProp | InSpatialVariantConfig<V>
): VariantSystemReturn<V> {
  // Create the base system
  const system = createVariantCore<V>(
    configOrOptions && "hooks" in configOrOptions ? configOrOptions : undefined
  );

  // If direct config was provided (with settings or base), create specific variant function
  if (
    configOrOptions &&
    ("settings" in configOrOptions || "base" in configOrOptions)
  ) {
    const variantFn = system.variant(
      configOrOptions as InSpatialVariantConfig<V>
    );

    // Return with strongly typed applyVariant
    return {
      ...system,
      applyVariant: variantFn as (
        props?: VariantSchemaProp<V> & {
          class?: ClassValueProp;
          className?: ClassValueProp;
          css?: ClassValueProp;
        }
      ) => string,
      config: configOrOptions as InSpatialVariantConfig<V>,
    };
  }

  // Otherwise return the base system (for factory usage)
  return system;
}

/**
 * Return type for createVariant when used with a configuration
 * Used for documentation purposes
 */
export type VariantReturnType<V extends VariantShapeProp> =
  VariantSystemReturn<V>;

export type {
  /** Type for CSS class values that can be used in the variant system */
  ClassValueProp,

  /**
   * Utility type for extracting props from a variant function or object
   * Works with direct variant functions and objects with applyVariant method
   *
   * @example
   * ```typescript
   * // With direct variant function
   * const button = variant({ ... });
   * type ButtonProps = VariantProps<typeof button>;
   *
   * // With createVariant result
   * const ButtonVariant = createVariant({ ... });
   * type ButtonProps = VariantProps<typeof ButtonVariant.applyVariant>;
   * ```
   */
  VariantProps,

  /** Type for defining the shape of variants in a component */
  VariantShapeProp,

  /** Type for the schema of variant props based on a variant shape */
  VariantSchemaProp,

  /** Configuration options for the variant system */
  VariantConfigProp,
};
