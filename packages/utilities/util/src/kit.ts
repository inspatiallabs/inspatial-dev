import { clsx } from "clsx";
import type * as Clsx from "clsx";
import { twMerge } from "tailwind-merge";

//#region input
/*##############################################(TW-KIT-UTILITY)##############################################*/

/*************************************(Return)*************************************/

/**
 * Combines Tailwind CSS classes, handling conflicts and merging them smartly.
 * Use for tailwind classes.
 * @example  className={kit(`bg-surface text-primary`, className)}
 */
export function kit(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*##############################################(GENERAL-KIT-UTILITY)##############################################*/

/*************************************(Types)*************************************/

type ClassValue = Clsx.ClassValue;

/*************************************(Functions)*************************************/
function toVal(mix: ClassValue): string {
  let str = "";

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix;
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      for (const item of mix) {
        if (item) {
          const val = toVal(item);
          if (val) {
            str && (str += " ");
            str += val;
          }
        }
      }
    } else {
      for (const k in mix) {
        if (mix[k]) {
          str && (str += " ");
          str += k;
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

export function cKit(...args: ClassValue[]): string {
  let i = 0,
    tmp,
    x,
    str = "";
  while (i < args.length) {
    if ((tmp = args[i++])) {
      if ((x = toVal(tmp))) {
        str && (str += " ");
        str += x;
      }
    }
  }
  return str;
}

//#endregion
