// @ts-ignore - Ignoring TS extension import error
import { setPrototypeOf } from "../shared/object.ts";
// @ts-ignore - Ignoring TS extension import error
import hyphenize from "@inspatial/util/hyphenize";
// @ts-ignore - Ignoring TS extension import error
import type { Element } from "../interface/element.ts";

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
    // Skip internal properties and symbols
    if (typeof name === 'symbol' || name === 'constructor' || name === 'toString') {
      return (dataset as any)[name];
    }
    
    const ref = refs.get(dataset);
    if (ref) {
      const attrValue = ref.getAttribute(key(name));
      return attrValue === null ? undefined : attrValue;
    }
    return undefined;
  },

  set(dataset: DOMStringMap, name: string, value: string): boolean {
    // Skip internal properties and symbols
    if (typeof name === 'symbol' || name === 'constructor' || name === 'toString') {
      (dataset as any)[name] = value;
      return true;
    }
    
    const ref = refs.get(dataset);
    if (ref) {
      // Set the data attribute on the element
      ref.setAttribute(key(name), value);
      
      // Also set it on the dataset object
      (dataset as any)[name] = value;
      return true;
    }
    return false;
  },

  deleteProperty(dataset: DOMStringMap, name: string): boolean {
    const ref = refs.get(dataset);
    if (ref) {
      ref.removeAttribute(key(name));
    }
    return delete (dataset as any)[name];
  },
  
  // Add has to support 'in' operator
  has(dataset: DOMStringMap, name: string): boolean {
    if (typeof name === 'symbol' || name === 'constructor' || name === 'toString') {
      return name in dataset;
    }
    
    const ref = refs.get(dataset);
    return ref ? ref.hasAttribute(key(name)) : false;
  }
};

setPrototypeOf(DOMStringMap.prototype, null);
