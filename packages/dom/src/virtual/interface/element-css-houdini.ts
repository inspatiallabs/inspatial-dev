/**
 * Element CSS Houdini Integration
 *
 * This file provides the integration between the Element interface
 * and the CSS Houdini implementation, enabling enhanced styling capabilities.
 */

// @ts-ignore - Ignoring TS extension import error
import { STYLE } from "../shared/symbols.ts";

// @ts-ignore - Ignoring TS extension import error
import { CSSHoudiniStyleDeclaration } from "@inspatial/theme/iss";

// Create a separate interface for Houdini-enhanced elements
export interface HoudiniElement {
  attributeStyleMap: any;
}

/**
 * Enhances an Element with Houdini CSS capabilities
 *
 * @param ElementClass - The Element class to enhance
 * @returns Enhanced Element class with Houdini styling
 */
export function enhanceElementWithHoudini(ElementClass: any): any {
  // Store the original style getter (for future potential use)
  const _originalStyleGetter = Object.getOwnPropertyDescriptor(
    ElementClass.prototype,
    "style"
  )?.get;

  // Replace with enhanced style getter that uses CSS Houdini
  Object.defineProperty(ElementClass.prototype, "style", {
    get: function () {
      if (!this[STYLE]) {
        const style = new CSSHoudiniStyleDeclaration(this);

        // Initialize with any existing style attribute
        const styleAttr = this.getAttribute("style");
        if (styleAttr) {
          style.cssText = styleAttr;
        }

        this[STYLE] = style;
      }

      return this[STYLE];
    },
    configurable: true,
  });

  // Add Houdini-specific element properties
  Object.defineProperty(ElementClass.prototype, "attributeStyleMap", {
    get: function () {
      return this.style?.attributeStyleMap;
    },
    configurable: true,
  });

  // Return the enhanced element class
  return ElementClass;
}

/**
 * Applies CSS Houdini enhancements to specified Element class
 *
 * @param ElementClass - The Element class to enhance with Houdini features
 */
export function applyHoudiniToElement(ElementClass: any): void {
  enhanceElementWithHoudini(ElementClass);
}

/**
 * Usage example:
 *
 * // Apply Houdini enhancements to Element
 * import { Element } from "./element.ts";
 * import { applyHoudiniToElement } from "./element-css-houdini.ts";
 *
 * applyHoudiniToElement(Element);
 *
 * // Then use enhanced features:
 * element.attributeStyleMap.set('--theme-color', CSSOM.rgb(255, 0, 0));
 * element.style.setProperty('transform', 'rotate(45deg) scale(1.5)');
 */
