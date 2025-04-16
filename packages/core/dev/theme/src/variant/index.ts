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
  float: true,
  clear: true,
  position: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
  z: true,
  order: true,
  grid: true,
  flex: true,
  basis: true,
  grow: true,
  shrink: true,
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
  w: true,
  "min-w": true,
  "max-w": true,
  h: true,
  "min-h": true,
  "max-h": true,
  text: true,
  font: true,
  tracking: true,
  leading: true,
  list: true,
  decoration: true,
  underline: true,
  "line-through": true,
  "no-underline": true,
  bg: true,
  from: true,
  via: true,
  to: true,
  border: true,
  rounded: true,
  divide: true,
  shadow: true,
  opacity: true,
  "mix-blend": true,
  blur: true,
  transition: true,
  duration: true,
  ease: true,
  delay: true,
  scale: true,
  rotate: true,
  translate: true,
  skew: true,
  origin: true,
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
  const result: Record<string, string> = {};
  
  // First flatten all classes into a single array of individual class names
  const allClasses: string[] = [];
  classes.forEach(cls => {
    if (!cls) return;
    allClasses.push(...cls.split(/\s+/).filter(Boolean));
  });
  
  // Process all classes in reverse order (so later ones override earlier ones)
  for (let i = allClasses.length - 1; i >= 0; i--) {
    const className = allClasses[i];
    
    // Special handling for p-* and m-* classes
    if (className.startsWith('p-')) {
      if (!result['p']) {
        result['p'] = className;
      }
    } else if (className.startsWith('m-')) {
      if (!result['m']) {
        result['m'] = className;
      }
    } else {
      // For all other classes, use the full class name as key
      result[className] = className;
    }
  }
  
  return Object.values(result).join(' ');
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
  <T extends ReturnType<VariantProp>[]>(
    ...components: [...T]
  ): (
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
  <V extends VariantShapeProp>(
    config: InSpatialVariantConfig<V>
  ): (
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

      return kit(
        components.map(
          (component) => component(variantProps as any) // Type assertion needed for component props intersection
        ),
        cls,
        className,
        css
      );
    };

  // Create a variant function handler
  const variantFn = (config: InSpatialVariantConfig<V>): any => {
    return variant(config as InSpatialVariantConfig<V>);
  };

  // Return a minimal system with placeholder functions that will be overridden if needed
  return {
    applyVariant: (props) => "",  // Placeholder
    kit,
    variant,
    composeVariant
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
export const kit = baseSystem.kit;
export const variant = baseSystem.variant;
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
  if (configOrOptions && ("settings" in configOrOptions || "base" in configOrOptions)) {
    const variantFn = system.variant(configOrOptions as InSpatialVariantConfig<V>);
    
    return {
      ...system,
      applyVariant: variantFn,
      config: configOrOptions as InSpatialVariantConfig<V>
    };
  }
  
  // Otherwise return the base system (for factory usage)
  return {
    ...system,
    applyVariant: (props) => "", // Empty implementation for factory pattern
  };
}

/**
 * Return type for createVariant when used with a configuration
 * Used for documentation purposes
 */
export type VariantReturnType<V extends VariantShapeProp> = VariantSystemReturn<V>;

export type {
  /** Type for CSS class values that can be used in the variant system */
  ClassValueProp,

  /** Utility type for extracting props from a variant component */
  VariantProps,

  /** Type for defining the shape of variants in a component */
  VariantShapeProp,

  /** Type for the schema of variant props based on a variant shape */
  VariantSchemaProp,

  /** Configuration options for the variant system */
  VariantConfigProp,
};
