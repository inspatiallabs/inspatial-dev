import { twMerge } from "npm:tailwind-merge@^1.14.0";

/*##############################################(TYPES)##############################################*/

type ClassValue = string | number | Record<string, boolean> | ClassValue[];

/*##############################################(GENERAL-KIT-UTILITY)##############################################*/

/*************************************(Functions)*************************************/

function toVal(mix: ClassValue): string {
  let str = "";
  let k: number;
  let y: string | number;
  let len: number;

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix;
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      len = mix.length;
      for (k = 0; k < len; k++) {
        if (mix[k]) {
          y = toVal(mix[k]);
          if (y) {
            str && (str += " ");
            str += y;
          }
        }
      }
    } else {
      for (y in mix) {
        if (mix && typeof mix === "object" && mix[y]) {
          str && (str += " ");
          str += y;
        }
      }
    }
  }

  return str;
}

/*************************************(Return)*************************************/
/**
 * Combines classes in a smart way.
 * @example cKit("bg-surface", { "text-primary": true, "text-secondary": false })
 */
function kitClassUtil(...inputs: ClassValue[]): string {
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

/*##############################################(KIT-UTILITY)##############################################*/

/*************************************(Return)*************************************/

/**
 * # Kit
 * #### Combines CSS classes with intelligent conflict resolution
 *
 * This function works like a smart style manager that knows how to combine css
 * classes without conflicts. Imagine it as a fashion expert who knows which styles
 * can work together and which ones would clash.
 *
 * @example
 * ### Basic Usage
 * ```typescript
 * import { kit } from '@inspatial/util/kit';
 *
 * // Combining simple classes
 * const className = kit('bg-blue-500 text-white', 'hover:bg-blue-600');
 *
 * // With conditional classes
 * const buttonClass = kit(
 *   'px-4 py-2 rounded',
 *   isActive ? 'bg-blue-500' : 'bg-gray-200'
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
 * @param {...ClassValue[]} inputs - Accepts any number of class values to be combined
 * @returns {string} A merged string of CSS classes with conflicts resolved
 */
export default function kit(...inputs: ClassValue[]): string {
  return twMerge(kitClassUtil(inputs));
}
