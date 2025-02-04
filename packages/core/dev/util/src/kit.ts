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

type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  "class" | "className" | "css"
>;

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
  const matches = variants.match(/^([a-zA-Z0-9-]+)(?:-(.+))?$/);
  if (!matches) return ["", "", variants];

  const [, property, value = ""] = matches;
  return [base, property, value];
}

/*##############################################(MERGE-CLASSES)##############################################*/

function mergeClasses(classes: string[]): string {
  const classMap: Record<string, Record<string, string>> = {};

  classes.forEach((cls) => {
    if (!cls) return;
    const classNames = cls.split(" ");

    classNames.forEach((className) => {
      const [variant, prop, value] = splitTailwindClass(className);
      const key = `${variant}:${prop}`;

      // Only merge if it's a Tailwind property we know about
      if (prop in TW_PROPERTIES) {
        if (!classMap[key]) classMap[key] = {};
        classMap[key][value] = className;
      } else {
        // For unknown properties, keep all values
        if (!classMap["arbitrary"]) classMap["arbitrary"] = {};
        classMap["arbitrary"][className] = className;
      }
    });
  });

  // Combine all unique classes
  return Object.values(classMap)
    .map((group) => Object.values(group))
    .flat()
    .join(" ");
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

interface VariantConfigProp {
  hooks?: {
    onComplete?: (className: string) => string;
  };
}

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

type VariantShapeProp = Record<string, Record<string, ClassValueProp>>;
type VariantSchemaProp<V extends VariantShapeProp> = {
  [Variant in keyof V]?: StringToBoolean<keyof V[Variant]> | undefined;
};

interface VariantProp {
  <V extends VariantShapeProp>(config: {
    base?: ClassValueProp;
    variants?: V;
    compoundVariants?: (VariantSchemaProp<V> & {
      class?: ClassValueProp;
      className?: ClassValueProp;
      css?: ClassValueProp;
    })[];
    defaultVariants?: VariantSchemaProp<V>;
  }): (
    props?: VariantSchemaProp<V> & {
      class?: ClassValueProp;
      className?: ClassValueProp;
      css?: ClassValueProp;
    }
  ) => string;
}

interface VariantSystemReturn {
  kit: (...inputs: ClassValueProp[]) => string;
  variant: VariantProp;
  composeVariant: ComposeVariantProp;
}

function createVariantSystem(options?: VariantConfigProp): VariantSystemReturn {
  const kit = (...inputs: ClassValueProp[]): string => {
    const className = kitUtil(inputs);
    return (
      options?.hooks?.onComplete?.(className) ??
      mergeClasses(className.split(" "))
    );
  };

  const variant: VariantProp = (config) => (props) => {
    if (!config.variants) {
      return kit(config.base, props?.class, props?.className, props?.css);
    }

    const { variants, defaultVariants } = config;

    // Process variant classes
    const variantClasses = Object.keys(variants).map((variant) => {
      const prop = props?.[variant as keyof typeof props];
      const defaultProp = defaultVariants?.[variant];
      const value = falsyToString(prop ?? defaultProp);
      const variantObj = variants[variant];
      return variantObj[value as keyof typeof variantObj];
    });

    // Process compound variants
    const compoundClasses = config.compoundVariants?.reduce((acc, cv) => {
      const {
        class: cvClass,
        className: cvClassName,
        css: cvCss,
        ...conditions
      } = cv;
      const matches = Object.entries(conditions).every(([key, value]) => {
        const propValue =
          props?.[key as keyof typeof props] ??
          defaultVariants?.[key as keyof typeof defaultVariants];
        return Array.isArray(value)
          ? value.includes(propValue)
          : propValue === value;
      });

      return matches ? [...acc, cvClass, cvClassName, cvCss] : acc;
    }, [] as ClassValueProp[]);

    return kit(
      config.base,
      variantClasses,
      compoundClasses,
      props?.class,
      props?.className,
      props?.css
    );
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

  return {
    kit,
    variant,
    composeVariant,
  };
}

// Add explicit type annotation for variantSystem
const variantSystem: VariantSystemReturn = createVariantSystem();

/*##############################################(KIT)##############################################*/
/**
 * # Kit
 * #### A utility for intelligent class name composition and conflict resolution
 *
 * Kit combines CSS classes with intelligent conflict resolution, working like a smart
 * style manager that knows how to combine css classes without conflicts.
 *
 * @since 0.1.1
 * @category InSpatial Util
 * @module Kit
 * @kind utility
 * @access public
 *
 * @example
 * ### Basic Usage
 * ```typescript
 * import { kit } from '@inspatial/util/kit';
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

export const kit = variantSystem.kit;

/*##############################################(VARIANT)##############################################*/
/**
     * # InSpatial Variant System

     * #### A powerful utility for managing component variants
     *
     * The Variant System is like a smart wardrobe organizer for your UI components,
     * helping you combine and manage different styles and variants.
     *
     * @since 0.0.1
     * @category InSpatial Util
     * @module Variant
     * @kind utility
     * @access public
     *
     * ### 💡 Core Concepts

     * - Variant-based styling
     * - Compound variants for complex style combinations
     * - Default variant support
     *
     * @example
     * ### Basic Usage
     * ```typescript
     * const button = variant({
     *   base: "px-4 py-2 rounded",
     *   variants: {
     *     size: {
     *       sm: "text-sm",
     *       lg: "text-lg"
     *     },
     *     color: {
     *       blue: "bg-blue-500 hover:bg-blue-600",
     *       red: "bg-red-500 hover:bg-red-600"
     *     }
     *   },
     *   defaultVariants: {
     *     size: "sm",
     *     color: "blue"
     *   }
     * });
     * ```
     *
     * ### ⚡ Performance Tips
     * - Use compound variants sparingly
     * - Prefer static variants over dynamic ones
     * - Cache variant results for frequently used combinations
     */

export const variant = variantSystem.variant;

/*##############################################(COMPOSE-VARIANT)##############################################*/
/**
     * # ComposeVariant

     * #### A utility for combining multiple variant components
     *
     * ComposeVariant allows you to merge multiple variant components into a single
     * component while maintaining proper type safety and style composition.
     *
     * @since 0.1.1
     * @category InSpatial Util
     * @module ComposeVariant
     * @kind utility
     * @access public
     *
     * ### 💡 Core Concepts

     * - Combine multiple variant components
     * - Maintain type safety across compositions
     * - Intelligent style merging
     *
     * @example
     * ### Basic Usage
     * ```typescript
     * const baseButton = variant({
     *   base: "px-4 py-2 rounded",
     *   variants: {
     *     size: { sm: "text-sm", lg: "text-lg" }
     *   }
     * });
     *
     * const colorButton = variant({
     *   variants: {
     *     color: { blue: "bg-blue-500", red: "bg-red-500" }
     *   }
     * });
     *
     * const composedButton = composeVariant(baseButton, colorButton);
     *
     * // Use with combined props
     * const className = composedButton({ size: "sm", color: "blue" });
     * ```
     *
     * ### ⚡ Performance Tips
     * - Compose variants at component definition time, not render time
     * - Limit the number of composed variants for better performance
     * - Consider memoizing frequently used compositions
     */
export const composeVariant = variantSystem.composeVariant;

/*##############################################(CREATE-VARIANT)##############################################*/
/**
 * # CreateVariant
 * #### A factory function that creates a customizable variant styling system
 *
 * The `createVariant` function is like a style system factory. Think of it as a custom
 * clothing designer that lets you create your own styling rules and combinations.

 *
 * @since 0.1.1
 * @category InSpatial Util
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
 *
 * @example
 * ### Basic Custom System
 * ```typescript
 * import { createVariant } from '@inspatial/util/kit';
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
 *   variants: {
 *     size: {
 *       sm: "text-sm px-2",
 *       lg: "text-lg px-4"
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * ### Advanced Configuration
 * ```typescript
 * // Create a system with custom class processing
 * const customSystem = createVariant({
 *   hooks: {
 *     onComplete: (className) => {
 *       // Add RTL support
 *       const isRTL = document.dir === 'rtl';
 *       return isRTL
 *         ? className.replace('left', 'right').replace('right', 'left')
 *         : className;
 *     }
 *   }
 * });
 *
 * // Use the custom system
 * const { variant } = customSystem;
 * const card = variant({
 *   base: "p-4 shadow-md",
 *   variants: {
 *     align: {
 *       start: "ml-4",  // Will be converted to mr-4 in RTL
 *       end: "mr-4"     // Will be converted to ml-4 in RTL
 *     }
 *   }
 * });
 * ```
 *
 * ### ⚡ Performance Tips
 * - Create variant systems at module level, not within components
 * - Reuse the same variant system across related components
 * - Memoize frequently used variant combinations
 *
 * @param {VariantConfigProp} [options] - Configuration options for the variant system
 * @returns {{ kit: Function, variant: VariantProp, composeVariant: ComposeVariantProp }}
 * Returns an object containing the core styling utilities
 */
export const createVariant = createVariantSystem;

export type {
  ClassValueProp,
  VariantProps,
  VariantShapeProp,
  VariantSchemaProp,
  VariantConfigProp,
};
