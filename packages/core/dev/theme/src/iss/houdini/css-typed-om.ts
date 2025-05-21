/**
 * CSS Typed OM implementation
 *
 * This file implements CSS Houdini's Typed OM for InSpatial DOM,
 * providing strongly-typed CSS values and improved performance.
 */

// --- CSS Value Types ---

/**
 * Base class for all CSS typed values
 */
export class CSSStyleValue {
  /**
   * Create a CSS value from a string
   */
  static parse(property: string, cssText: string): CSSStyleValue {
    // Parse the CSS value based on the property type
    if (property.includes("color")) {
      return CSSColorValue.parse(cssText);
    }

    if (
      cssText.includes("px") ||
      cssText.includes("em") ||
      cssText.includes("%")
    ) {
      return CSSUnitValue.parse(cssText);
    }

    // Default to keyword value
    return new CSSKeywordValue(cssText);
  }

  /**
   * Convert value to a string representation
   */
  toString(): string {
    // Override in subclasses
    return "";
  }
}

/**
 * CSS numeric values with units
 */
export class CSSUnitValue extends CSSStyleValue {
  value: number;
  unit: string;

  /**
   * Create a new unit value
   */
  constructor(value: number, unit: string) {
    super();
    this.value = value;
    this.unit = unit;
  }

  /**
   * Parse a CSS dimension value
   */
  static override parse(cssText: string): CSSUnitValue {
    // Match number and unit (e.g. "10px", "2em", "50%")
    const match = cssText.trim().match(/^([-+]?[0-9]*\.?[0-9]+)([a-z%]*)$/i);

    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] || "";
      return new CSSUnitValue(value, unit);
    }

    // Default to pixels for numbers without units
    if (!isNaN(parseFloat(cssText))) {
      return new CSSUnitValue(parseFloat(cssText), "px");
    }

    return new CSSUnitValue(0, "px");
  }

  /**
   * Convert to string representation
   */
  override toString(): string {
    return `${this.value}${this.unit}`;
  }

  /**
   * Add another unit value (with automatic unit conversion)
   */
  add(other: CSSUnitValue): CSSUnitValue {
    if (this.unit === other.unit) {
      return new CSSUnitValue(this.value + other.value, this.unit);
    }

    // Unit conversion would go here for compatible units
    // For now, just return with the current unit
    return new CSSUnitValue(this.value + other.value, this.unit);
  }

  /**
   * Multiply by a number
   */
  multiply(factor: number): CSSUnitValue {
    return new CSSUnitValue(this.value * factor, this.unit);
  }
}

/**
 * CSS keyword values
 */
export class CSSKeywordValue extends CSSStyleValue {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  override toString(): string {
    return this.value;
  }
}

/**
 * CSS color values
 */
export class CSSColorValue extends CSSStyleValue {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a: number = 1) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * Parse a CSS color string
   */
  static override parse(cssText: string): CSSColorValue {
    // Simple hex color parsing (e.g. "#ff0000")
    if (cssText.startsWith("#")) {
      let hex = cssText.slice(1);

      // Convert shorthand hex to full form
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }

      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      return new CSSColorValue(r, g, b);
    }

    // RGB/RGBA parsing (e.g. "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)")
    const rgbMatch = cssText.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/
    );
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;

      return new CSSColorValue(r, g, b, a);
    }

    // Named colors (very basic support)
    if (cssText === "red") return new CSSColorValue(255, 0, 0);
    if (cssText === "green") return new CSSColorValue(0, 128, 0);
    if (cssText === "blue") return new CSSColorValue(0, 0, 255);
    if (cssText === "black") return new CSSColorValue(0, 0, 0);
    if (cssText === "white") return new CSSColorValue(255, 255, 255);

    // Default
    return new CSSColorValue(0, 0, 0);
  }

  /**
   * Convert to string representation (rgba format)
   */
  override toString(): string {
    if (this.a === 1) {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    } else {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
  }

  /**
   * Convert to hex format
   */
  toHexString(): string {
    const componentToHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${componentToHex(this.r)}${componentToHex(this.g)}${componentToHex(
      this.b
    )}`;
  }
}

/**
 * CSS transform values
 */
export class CSSTransformValue extends CSSStyleValue {
  transforms: CSSTransformComponent[];

  constructor(transforms: CSSTransformComponent[]) {
    super();
    this.transforms = transforms;
  }

  override toString(): string {
    return this.transforms.map((t) => t.toString()).join(" ");
  }
}

/**
 * Base class for transform components
 */
export abstract class CSSTransformComponent extends CSSStyleValue {
  abstract override toString(): string;
}

/**
 * CSS translate transform
 */
export class CSSTranslate extends CSSTransformComponent {
  x: CSSUnitValue;
  y: CSSUnitValue;
  z?: CSSUnitValue;

  constructor(x: CSSUnitValue, y: CSSUnitValue, z?: CSSUnitValue) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  override toString(): string {
    if (this.z) {
      return `translate3d(${this.x}, ${this.y}, ${this.z})`;
    }
    return `translate(${this.x}, ${this.y})`;
  }
}

/**
 * CSS rotate transform
 */
export class CSSRotate extends CSSTransformComponent {
  angle: CSSUnitValue;

  constructor(angle: CSSUnitValue) {
    super();
    this.angle = angle;
  }

  override toString(): string {
    return `rotate(${this.angle})`;
  }
}

/**
 * CSS scale transform
 */
export class CSSScale extends CSSTransformComponent {
  x: number;
  y: number;
  z?: number;

  constructor(x: number, y: number, z?: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  override toString(): string {
    if (this.z !== undefined) {
      return `scale3d(${this.x}, ${this.y}, ${this.z})`;
    }
    return `scale(${this.x}, ${this.y})`;
  }
}

// --- Attribute Style Map ---

/**
 * Represents a map of CSS properties to typed values
 */
export class StylePropertyMap {
  properties: Map<string, { value: CSSStyleValue; priority: string }> =
    new Map();
  private _ownerElement: any = null;
  private _updating: boolean = false;

  /**
   * Set the owner element for synchronization
   */
  set ownerElement(element: any) {
    this._ownerElement = element;
  }

  /**
   * Get a typed CSS value
   */
  get(property: string): CSSStyleValue | undefined {
    const entry = this.properties.get(property);
    return entry ? entry.value : undefined;
  }

  /**
   * Get property priority
   */
  getPriority(property: string): string {
    return this.properties.get(property)?.priority || "";
  }

  /**
   * Set a typed CSS value
   */
  set(
    property: string,
    value: CSSStyleValue | string,
    priority: string = ""
  ): void {
    if (typeof value === "string") {
      value = CSSStyleValue.parse(property, value);
    }

    this.properties.set(property, { value, priority });
    this._updateStyleAttribute();
  }

  /**
   * Check if the map has a property
   */
  has(property: string): boolean {
    return this.properties.has(property);
  }

  /**
   * Delete a property
   */
  delete(property: string): boolean {
    const result = this.properties.delete(property);
    if (result) {
      this._updateStyleAttribute();
    }
    return result;
  }

  /**
   * Clear all properties
   */
  clear(): void {
    this.properties.clear();
    this._updateStyleAttribute();
  }

  /**
   * Get all property names
   */
  getProperties(): string[] {
    return Array.from(this.properties.keys());
  }

  /**
   * Get the size of the map
   */
  get size(): number {
    return this.properties.size;
  }

  /**
   * Set properties from cssText
   */
  setCssText(cssText: string): void {
    // Clear existing properties
    this.properties.clear();

    if (!cssText) {
      this._updateStyleAttribute();
      return;
    }

    // Parse the CSS text
    const rules = cssText.split(";");
    for (const rule of rules) {
      const trimmed = rule.trim();
      if (!trimmed) continue;

      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) continue;

      const property = trimmed.substring(0, colonIndex).trim();
      let valueText = trimmed.substring(colonIndex + 1).trim();

      // Parse !important
      let priority = "";
      const importantIndex = valueText.toLowerCase().indexOf("!important");
      if (importantIndex !== -1) {
        priority = "important";
        valueText = valueText.substring(0, importantIndex).trim();
      }

      if (property && valueText) {
        const value = CSSStyleValue.parse(property, valueText);
        this.properties.set(property, { value, priority });
      }
    }

    this._updateStyleAttribute();
  }

  /**
   * Get properties as cssText
   */
  toString(): string {
    const parts: string[] = [];
    this.properties.forEach((entry, name) => {
      parts.push(
        `${name}: ${entry.value.toString()}${
          entry.priority ? " !" + entry.priority : ""
        }`
      );
    });
    return parts.join("; ");
  }

  /**
   * Update the style attribute of the owner element
   */
  private _updateStyleAttribute(): void {
    if (!this._ownerElement || this._updating) {
      return;
    }

    this._updating = true;

    if (this._ownerElement.setAttribute) {
      this._ownerElement.setAttribute("style", this.toString());
    }

    this._updating = false;
  }
}

/**
 * Enhanced version of CSSStyleDeclaration using CSS Typed OM
 */
export class CSSHoudiniStyleDeclaration {
  attributeStyleMap: StylePropertyMap = new StylePropertyMap();
  private _parentRule: any = null;
  private _readOnly: boolean = false;
  private _computed: boolean = false;
  __starts?: number;
  __ends?: number;

  // Index signature for property access
  [key: string]: any;

  /**
   * Create a new Houdini style declaration
   */
  constructor(ownerElement?: any) {
    if (ownerElement) {
      this.attributeStyleMap.ownerElement = ownerElement;
    }

    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === "string") {
          if (prop === "cssText") {
            return target.cssText;
          }

          if (prop === "parentRule") {
            return target._parentRule;
          }

          if (prop === "attributeStyleMap") {
            return target.attributeStyleMap;
          }

          if (
            prop === "setProperty" ||
            prop === "getPropertyValue" ||
            prop === "getPropertyPriority" ||
            prop === "removeProperty" ||
            prop === "item" ||
            prop === "length"
          ) {
            return target[prop];
          }

          // Convert camelCase to kebab-case for CSS property access
          const cssProperty = camelToKebabCase(prop);
          return target.getPropertyValue(cssProperty);
        }

        return Reflect.get(target, prop);
      },

      set: (target, prop, value) => {
        if (target._readOnly) {
          return true; // Silently fail if readonly
        }

        if (typeof prop === "string") {
          if (prop === "cssText") {
            target.cssText = value;
            return true;
          }

          if (prop === "_parentRule") {
            target._parentRule = value;
            return true;
          }

          if (prop === "_readOnly") {
            target._readOnly = value;
            return true;
          }

          // Convert camelCase to kebab-case for CSS property names
          if (!/^_/.test(prop)) {
            const cssProperty = camelToKebabCase(prop);
            target.setProperty(cssProperty, value);
          } else {
            target[prop] = value;
          }
          return true;
        } else {
          Reflect.set(target, prop, value);
        }
        return true;
      },
    });
  }

  /**
   * Set a CSS property
   */
  setProperty(name: string, value: string, priority: string = ""): void {
    if (this._readOnly) {
      return;
    }

    if (value === null || value === "") {
      this.removeProperty(name);
      return;
    }

    this.attributeStyleMap.set(name, value, priority);
  }

  /**
   * Get a CSS property value
   */
  getPropertyValue(name: string): string {
    if (this._computed) {
      return "";
    }

    // Convert to lowercase unless it's a custom property
    if (!name.startsWith("--")) {
      name = name.toLowerCase();
    }

    const value = this.attributeStyleMap.get(name);
    return value ? value.toString() : "";
  }

  /**
   * Get a CSS property priority
   */
  getPropertyPriority(name: string): string {
    if (!name.startsWith("--")) {
      name = name.toLowerCase();
    }

    return this.attributeStyleMap.getPriority(name);
  }

  /**
   * Remove a CSS property
   */
  removeProperty(name: string): string {
    if (this._readOnly) {
      return "";
    }

    // Convert to lowercase unless it's a custom property
    if (!name.startsWith("--")) {
      name = name.toLowerCase();
    }

    const value = this.getPropertyValue(name);
    this.attributeStyleMap.delete(name);

    return value;
  }

  /**
   * Get the number of properties
   */
  get length(): number {
    return this.attributeStyleMap.size;
  }

  /**
   * Get a property name by index
   */
  item(index: number): string {
    return this.attributeStyleMap.getProperties()[index] || "";
  }

  /**
   * Set all properties through CSS text
   */
  set cssText(value: string) {
    if (this._readOnly) {
      return;
    }

    this.attributeStyleMap.setCssText(value);
  }

  /**
   * Get all properties as CSS text
   */
  get cssText(): string {
    if (this._computed) {
      return "";
    }

    return this.attributeStyleMap.toString();
  }
}

/**
 * Convert camelCase to kebab-case (e.g., fontSize -> font-size)
 */
function camelToKebabCase(str: string): string {
  if (!str || typeof str !== "string") return "";

  // Handle vendor prefixes like webkit, moz, ms
  const vendorPrefixed = str.match(/^(webkit|moz|ms|o)([A-Z])(.*)/);
  if (vendorPrefixed) {
    return `-${vendorPrefixed[1]}-${vendorPrefixed[2].toLowerCase()}${
      vendorPrefixed[3]
    }`
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase();
  }

  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/**
 * Convert kebab-case to camelCase (e.g., font-size -> fontSize)
 */
function kebabToCamelCase(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/-([a-z])/g, (_, group) => group.toUpperCase());
}

// Registry for custom CSS properties
export const CSS_CUSTOM_PROPERTY_REGISTRY = new Map<
  string,
  {
    name: string;
    syntax: string;
    inherits: boolean;
    initialValue?: string;
  }
>();

/**
 * Register a custom CSS property with type information
 */
export function registerProperty(options: {
  name: string;
  syntax: string;
  inherits: boolean;
  initialValue?: string;
}): void {
  // In a real implementation, this would register with the browser
  // For now, we'll just store the registration in our registry
  CSS_CUSTOM_PROPERTY_REGISTRY.set(options.name, options);
}

// CSS global namespace for typed values
export const CSSOM = {
  registerProperty,
  number(value: number): CSSUnitValue {
    return new CSSUnitValue(value, "number");
  },
  percent(value: number): CSSUnitValue {
    return new CSSUnitValue(value, "%");
  },
  px(value: number): CSSUnitValue {
    return new CSSUnitValue(value, "px");
  },
  em(value: number): CSSUnitValue {
    return new CSSUnitValue(value, "em");
  },
  rem(value: number): CSSUnitValue {
    return new CSSUnitValue(value, "rem");
  },
  deg(value: number): CSSUnitValue {
    return new CSSUnitValue(value, "deg");
  },
  rgb(r: number, g: number, b: number): CSSColorValue {
    return new CSSColorValue(r, g, b);
  },
  rgba(r: number, g: number, b: number, a: number): CSSColorValue {
    return new CSSColorValue(r, g, b, a);
  },
};
