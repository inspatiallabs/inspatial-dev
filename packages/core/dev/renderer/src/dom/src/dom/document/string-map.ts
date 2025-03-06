// @ts-ignore - Ignoring TS extension import error
import { setPrototypeOf } from "../shared/object.ts";
// @ts-ignore - Ignoring TS extension import error
import hyphenize from "../../../../../../util/src/hyphenize.ts";
// @ts-ignore - Ignoring TS extension import error
import { Element } from "../interface/element.ts";

const refs = new WeakMap<DOMStringMap, Element>();

const key = (name: string): string => `data-${hyphenize(name)}`;
const prop = (name: string): string =>
  name.slice(5).replace(/-([a-z])/g, (_, $1) => $1.toUpperCase());

/**
 * Interface for DOMStringMap to support indexing with any string key
 */
export interface DOMStringMap {
  [key: string]: string;
}

/**
 * @implements globalThis.DOMStringMap
 */
export class DOMStringMap {
  /**
   * @param {Element} ref
   */
  constructor(ref: Element) {
    for (const { name, value } of ref.attributes) {
      if (/^data-/.test(name)) this[prop(name)] = value;
    }
    refs.set(this, ref);
    return new Proxy(this, handler);
  }
}

const handler: ProxyHandler<DOMStringMap> = {
  get(dataset: DOMStringMap, name: string): string | undefined {
    if (name in dataset) {
      const ref = refs.get(dataset);
      if (ref) {
        return ref.getAttribute(key(name));
      }
    }
    return undefined;
  },
  
  set(dataset: DOMStringMap, name: string, value: string): boolean {
    /** Ensure the name is a valid property of the dataset */
    if (Object.prototype.hasOwnProperty.call(dataset, name)) {
      dataset[name] = value; // Set the value in the dataset
      const ref = refs.get(dataset);
      if (ref) {
        ref.setAttribute(key(name), value); // Update the corresponding attribute
      }
      return true; // Indicate success
    }
    return false; // Indicate failure if name is invalid
  },

  deleteProperty(dataset: DOMStringMap, name: string): boolean {
    /** Check if the name exists in the dataset */
    if (Object.prototype.hasOwnProperty.call(dataset, name)) {
      const ref = refs.get(dataset);
      if (ref) {
        ref.removeAttribute(key(name));
      }
    }
    return delete dataset[name];
  },
};

setPrototypeOf(DOMStringMap.prototype, null);
