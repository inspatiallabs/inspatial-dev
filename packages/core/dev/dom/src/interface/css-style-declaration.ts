// @ts-ignore - Ignoring TS extension import error and relative import path
import hyphenize from "@inspatial/util/hyphenize";

// @ts-ignore - Ignoring TS extension import error
import { CHANGED, PRIVATE, VALUE } from "../shared/symbols.ts";

// Type definitions
interface AttributeWithValue {
  [CHANGED]?: boolean;
  [VALUE]: string;
}

interface ElementWithStyle {
  ownerDocument: {
    createAttribute: (name: string) => AttributeWithValue;
  };
  getAttributeNode: (name: string) => AttributeWithValue | null;
  setAttributeNode: (attr: AttributeWithValue) => void;
  setAttribute: (name: string, value: string) => void;
}

// Define a type for our style maps and elements
type StyleMap = Map<string | symbol, any>;

// WeakMap to store references to elements
// @ts-ignore - WeakMap type issues
const refs = new WeakMap<any, ElementWithStyle>();

// Helper functions
// @ts-ignore - Iterator type issues
const getKeys = (style: StyleMap): string[] =>
  // @ts-ignore - Map iteration requires downlevelIteration or ES2015+ target
  [...style.keys()].filter(
    (key): key is string => typeof key === "string" && key !== String(PRIVATE)
  );

// @ts-ignore - Function type issues
const updateKeys = (style: StyleMap): AttributeWithValue | null => {
  const element = refs.get(style);
  const attr = element?.getAttributeNode("style") || null;

  if (!attr || attr[CHANGED] || style.get(PRIVATE) !== attr) {
    style.clear();
    if (attr) {
      style.set(PRIVATE, attr);
      for (const rule of attr[VALUE].split(/\s*;\s*/)) {
        let [key, ...rest] = rule.split(":");
        if (rest.length > 0) {
          key = key.trim();
          const value = rest.join(":").trim();
          if (key && value) style.set(key, value);
        }
      }
    }
  }
  return attr;
};

// @ts-ignore - Function type issues
function push(this: string[], value: any, key: any): void {
  if (key !== PRIVATE) this.push(`${key}:${value}`);
}

/**
 * @implements globalThis.CSSStyleDeclaration
 */
// @ts-ignore - Class type issues
export class CSSStyleDeclaration extends Map {
  /**
   * Create a new CSSStyleDeclaration for an element
   * @param element - The element to create a style declaration for
   */
  constructor(element: ElementWithStyle) {
    super();
    refs.set(this, element);
    /* c8 ignore start */
    // @ts-ignore - Proxy type issues
    return new Proxy(this, handler);
    /* c8 ignore stop */
  }

  /**
   * Get the CSS text representation of the style
   */
  get cssText(): string {
    return this.toString();
  }

  /**
   * Set the CSS text representation of the style
   * @param value - The CSS text to set
   */
  set cssText(value: string) {
    const element = refs.get(this);
    if (element) {
      element.setAttribute("style", value);
    }
  }

  /**
   * Get the value of a CSS property
   * @param name - The name of the property to get
   * @returns The value of the property
   */
  getPropertyValue(name: string): string {
    // Always return a string (empty string if property doesn't exist)
    const value = handler.get(this, name);
    return value === undefined || value === null ? "" : value;
  }

  /**
   * Set a CSS property
   * @param name - The name of the property to set
   * @param value - The value to set
   */
  setProperty(name: string, value: string): void {
    // @ts-ignore - Handler type issues
    handler.set(this, name, value);
  }

  /**
   * Remove a CSS property
   * @param name - The name of the property to remove
   */
  removeProperty(name: string): void {
    // @ts-ignore - Handler type issues
    handler.set(this, name, null);
  }

  /**
   * Iterator for style properties
   * @returns An iterator for the style properties
   */
  // @ts-ignore - Iterator type issues
  override [Symbol.iterator]() {
    updateKeys(this as unknown as StyleMap);
    const keys = getKeys(this as unknown as StyleMap);
    const { length } = keys;
    let i = 0;

    return {
      next() {
        const done = i === length;
        return {
          done,
          value: done ? null : keys[i++],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  /**
   * Get the private reference to this instance
   */
  get [PRIVATE]() {
    return this;
  }

  /**
   * Convert the style to a CSS string
   * @returns CSS string representation
   */
  override toString(): string {
    updateKeys(this as unknown as StyleMap);
    const cssText: string[] = [];
    this.forEach(push, cssText);
    return cssText.join(";");
  }
}

// Define the prototype for use in handler
const { prototype } = CSSStyleDeclaration;

// Proxy handler
// @ts-ignore - Handler type issues
const handler = {
  /**
   * Get a style property value
   * @param style - The style map
   * @param name - The property name
   * @returns The property value
   */
  get(style: StyleMap, name: string | symbol): any {
    if (name in prototype) return (style as any)[name];
    updateKeys(style);
    if (name === "length") return getKeys(style).length;
    if (typeof name === "string" && /^\d+$/.test(name))
      return getKeys(style)[parseInt(name, 10)];
    if (typeof name === "string") return style.get(hyphenize(name));
    return undefined;
  },

  /**
   * Set a style property value
   * @param style - The style map
   * @param name - The property name
   * @param value - The value to set
   * @returns true to indicate success
   */
  set(style: StyleMap, name: string | symbol, value: any): boolean {
    if (name === "cssText") {
      (style as any).cssText = value;
    } else if (typeof name === "string") {
      let attr = updateKeys(style);
      if (value == null) style.delete(hyphenize(name));
      else style.set(hyphenize(name), value);
      if (!attr) {
        const element = refs.get(style);
        if (element) {
          attr = element.ownerDocument.createAttribute("style");
          element.setAttributeNode(attr);
          style.set(PRIVATE, attr);
        }
      }
      if (attr) {
        attr[CHANGED] = false;
        attr[VALUE] = style.toString();
      }
    }
    return true;
  },
};
