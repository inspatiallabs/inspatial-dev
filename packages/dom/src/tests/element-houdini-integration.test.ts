/**
 * Integration test for CSS Houdini with Element
 *
 * This test verifies that the CSS Houdini implementation correctly
 * integrates with the Element class.
 */

// @ts-ignore - Ignoring TS extension import error
import { test, expect } from "@inspatial/test";

// @ts-ignore - Ignoring TS extension import error
import { Element } from "../interface/element.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  applyHoudiniToElement,
  HoudiniElement,
} from "../interface/element-css-houdini.ts";

// @ts-ignore - Ignoring TS extension import error
import { CSSOM, CSSUnitValue, CSSColorValue } from "../../../theme/src/iss/houdini/css-typed-om.ts";

/**
 * Create a test document with an element
 */
function createTestElement(): Element & HoudiniElement {
  // Create minimal document requirements
  const doc = {};

  // Create element
  const element = new Element(doc, "div");

  return element as Element & HoudiniElement;
}

test({
  name: "Element integrates with CSS Houdini",
  fn: () => {
    // Setup: Apply Houdini to Element class
    applyHoudiniToElement(Element);

    // Create test element
    const element = createTestElement();

    // Test 1: Standard style API still works
    element.style.color = "red";
    element.style.fontSize = "16px";
    element.style.marginTop = "10px";

    // Verify style properties are set
    expect(element.style.color).toBe("rgb(255, 0, 0)");
    expect(element.style.fontSize).toBe("16px");
    expect(element.style.marginTop).toBe("10px");

    // Test 2: attributeStyleMap is available
    expect(element.attributeStyleMap).toBeDefined();

    // Test 3: Can set and get typed values
    element.attributeStyleMap.set("width", CSSOM.px(100));
    const width = element.attributeStyleMap.get("width");
    expect(width).toBeInstanceOf(CSSUnitValue);
    expect(width.value).toBe(100);
    expect(width.unit).toBe("px");

    // Test 4: StylePropertyMap and style are synchronized
    element.attributeStyleMap.set("height", CSSOM.px(200));
    expect(element.style.height).toBe("200px");

    element.style.padding = "20px";
    expect(element.attributeStyleMap.get("padding")).toBeDefined();

    // Test 5: CSS math operations work
    const currentWidth = element.attributeStyleMap.get("width");
    const doubledWidth = currentWidth.multiply(2);
    element.attributeStyleMap.set("width", doubledWidth);
    expect(element.style.width).toBe("200px");

    // Test 6: Priority flags work
    element.style.setProperty("color", "blue", "important");
    expect(element.style.getPropertyPriority("color")).toBe("important");
    expect(element.attributeStyleMap.getPriority("color")).toBe("important");

    // Test 7: cssText updates all properties
    element.style.cssText = "margin: 5px; color: green;";
    expect(element.style.margin).toBe("5px");
    expect(element.style.color).toBe("rgb(0, 128, 0)");
    expect(element.attributeStyleMap.get("color")).toBeInstanceOf(
      CSSColorValue
    );

    // Clean-up - not necessary since this is a test, but good practice
    element.style.cssText = "";
  },
});
