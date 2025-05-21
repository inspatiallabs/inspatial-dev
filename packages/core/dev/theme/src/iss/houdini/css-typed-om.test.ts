/**
 * Tests for CSS Typed OM implementation
 *
 * These tests verify that our CSS Houdini implementation correctly handles:
 * 1. Typed CSS values (numbers, units, colors)
 * 2. Transforms and mathematical operations
 * 3. StylePropertyMap functionality
 * 4. Custom property registration
 */

// @ts-ignore - Ignoring TS extension import error
import { test, expect } from "@inspatial/test";

// @ts-ignore - Ignoring TS extension import error
import {
  CSSStyleValue,
  CSSUnitValue,
  CSSKeywordValue,
  CSSColorValue,
  CSSTransformValue,
  CSSTranslate,
  CSSRotate,
  CSSScale,
  StylePropertyMap,
  CSSHoudiniStyleDeclaration,
  CSSOM,
  registerProperty,
  CSS_CUSTOM_PROPERTY_REGISTRY,
} from "./css-typed-om.ts";

/**
 * Test CSS numeric values with units
 */
test({
  name: "CSSUnitValue handles numeric values with units",
  fn: () => {
    // Create unit values
    const pixels = new CSSUnitValue(10, "px");
    const percent = new CSSUnitValue(50, "%");
    const ems = new CSSUnitValue(1.5, "em");

    // Test value access
    expect(pixels.value).toBe(10);
    expect(pixels.unit).toBe("px");

    expect(percent.value).toBe(50);
    expect(percent.unit).toBe("%");

    // Test string representation
    expect(pixels.toString()).toBe("10px");
    expect(percent.toString()).toBe("50%");
    expect(ems.toString()).toBe("1.5em");

    // Test mathematical operations
    const sum = pixels.add(new CSSUnitValue(5, "px"));
    expect(sum.value).toBe(15);
    expect(sum.unit).toBe("px");

    const doubled = pixels.multiply(2);
    expect(doubled.value).toBe(20);
    expect(doubled.unit).toBe("px");

    // Test parsing from string
    const parsedPixels = CSSUnitValue.parse("42px");
    expect(parsedPixels.value).toBe(42);
    expect(parsedPixels.unit).toBe("px");

    const parsedPercent = CSSUnitValue.parse("75%");
    expect(parsedPercent.value).toBe(75);
    expect(parsedPercent.unit).toBe("%");
  },
});

/**
 * Test CSS keyword values
 */
test({
  name: "CSSKeywordValue handles CSS keywords",
  fn: () => {
    // Create keyword values
    const auto = new CSSKeywordValue("auto");
    const inherit = new CSSKeywordValue("inherit");
    const none = new CSSKeywordValue("none");

    // Verify value access
    expect(auto.value).toBe("auto");
    expect(inherit.value).toBe("inherit");

    // Test string representation
    expect(auto.toString()).toBe("auto");
    expect(none.toString()).toBe("none");
  },
});

/**
 * Test CSS color values
 */
test({
  name: "CSSColorValue handles color values",
  fn: () => {
    // Create color values
    const red = new CSSColorValue(255, 0, 0);
    const blue = new CSSColorValue(0, 0, 255);
    const semiTransparent = new CSSColorValue(0, 128, 0, 0.5);

    // Verify component access
    expect(red.r).toBe(255);
    expect(red.g).toBe(0);
    expect(red.b).toBe(0);
    expect(red.a).toBe(1); // Default alpha

    expect(semiTransparent.a).toBe(0.5);

    // Test string representation
    expect(red.toString()).toBe("rgb(255, 0, 0)");
    expect(semiTransparent.toString()).toBe("rgba(0, 128, 0, 0.5)");

    // Test hex conversion
    expect(red.toHexString()).toBe("#ff0000");
    expect(blue.toHexString()).toBe("#0000ff");

    // Test parsing from string
    const parsedHex = CSSColorValue.parse("#00ff00");
    expect(parsedHex.r).toBe(0);
    expect(parsedHex.g).toBe(255);
    expect(parsedHex.b).toBe(0);

    const parsedRgb = CSSColorValue.parse("rgb(128, 128, 128)");
    expect(parsedRgb.r).toBe(128);
    expect(parsedRgb.g).toBe(128);
    expect(parsedRgb.b).toBe(128);

    const parsedRgba = CSSColorValue.parse("rgba(255, 0, 0, 0.8)");
    expect(parsedRgba.r).toBe(255);
    expect(parsedRgba.a).toBe(0.8);

    // Test parsing color names
    const parsedRed = CSSColorValue.parse("red");
    expect(parsedRed.r).toBe(255);
    expect(parsedRed.g).toBe(0);
    expect(parsedRed.b).toBe(0);
  },
});

/**
 * Test CSS transform values
 */
test({
  name: "CSSTransformValue handles transform components",
  fn: () => {
    // Create transform components
    const translate = new CSSTranslate(
      new CSSUnitValue(10, "px"),
      new CSSUnitValue(20, "px")
    );

    const rotate = new CSSRotate(new CSSUnitValue(45, "deg"));
    const scale = new CSSScale(2, 3);

    // Verify component values
    expect(translate.x.value).toBe(10);
    expect(translate.y.value).toBe(20);
    expect(rotate.angle.value).toBe(45);
    expect(scale.x).toBe(2);
    expect(scale.y).toBe(3);

    // Test string representation
    expect(translate.toString()).toBe("translate(10px, 20px)");
    expect(rotate.toString()).toBe("rotate(45deg)");
    expect(scale.toString()).toBe("scale(2, 3)");

    // Combine transforms
    const transformList = new CSSTransformValue([translate, rotate, scale]);
    expect(transformList.toString()).toBe(
      "translate(10px, 20px) rotate(45deg) scale(2, 3)"
    );
  },
});

/**
 * Test StylePropertyMap functionality
 */
test({
  name: "StylePropertyMap provides typed property access",
  fn: () => {
    const styleMap = new StylePropertyMap();

    // Set properties with different value types
    styleMap.set("width", new CSSUnitValue(100, "px"));
    styleMap.set("height", new CSSUnitValue(50, "%"));
    styleMap.set("color", new CSSColorValue(255, 0, 0));
    styleMap.set("display", new CSSKeywordValue("flex"));

    // Verify property access
    expect(styleMap.get("width")?.toString()).toBe("100px");
    expect(styleMap.get("color")?.toString()).toBe("rgb(255, 0, 0)");

    // Verify has/delete
    expect(styleMap.has("display")).toBe(true);
    expect(styleMap.has("margin")).toBe(false);

    styleMap.delete("height");
    expect(styleMap.has("height")).toBe(false);

    // Test size and clear
    expect(styleMap.size).toBe(3);
    styleMap.clear();
    expect(styleMap.size).toBe(0);

    // Test setting from strings
    styleMap.set("padding", "20px");
    styleMap.set("background-color", "blue");

    // Verify proper parsing of strings to typed values
    const padding = styleMap.get("padding");
    expect(padding instanceof CSSUnitValue).toBe(true);

    const backgroundColor = styleMap.get("background-color");
    expect(backgroundColor instanceof CSSColorValue).toBe(true);

    // Test cssText handling
    styleMap.setCssText("margin: 10px; color: red !important");
    expect(styleMap.has("margin")).toBe(true);
    expect(styleMap.has("color")).toBe(true);

    // Test toString
    const cssText = styleMap.toString();
    expect(cssText.includes("margin: 10px")).toBe(true);
    expect(cssText.includes("color: rgb(255, 0, 0) !important")).toBe(true);
  },
});

/**
 * Test enhanced CSSStyleDeclaration implementation
 */
test({
  name: "CSSHoudiniStyleDeclaration provides enhanced style features",
  fn: () => {
    const style = new CSSHoudiniStyleDeclaration();

    // Test direct property access
    style.color = "red";
    style.width = "200px";
    style.marginTop = "10px";

    // Verify property values
    expect(style.color).toBe("rgb(255, 0, 0)");
    expect(style.width).toBe("200px");
    expect(style.marginTop).toBe("10px");

    // Test getPropertyValue and setProperty
    style.setProperty("font-size", "16px");
    expect(style.getPropertyValue("font-size")).toBe("16px");

    // Test priority handling
    style.setProperty("border", "1px solid black", "important");
    expect(style.getPropertyPriority("border")).toBe("important");

    // Test cssText setter
    style.cssText = "padding: 5px; color: blue";

    // Verify properties updated correctly
    expect(style.padding).toBe("5px");
    expect(style.color).toBe("rgb(0, 0, 255)");

    // Old properties should be cleared
    expect(style.width).toBe("");
    expect(style.attributeStyleMap.has("width")).toBe(false);

    // Test removeProperty
    const removed = style.removeProperty("color");
    expect(removed).toBe("rgb(0, 0, 255)");
    expect(style.color).toBe("");

    // Test item access by index
    style.setProperty("background-color", "green");
    style.setProperty("font-family", "Arial");

    // Get properties by index (order may vary)
    const properties = [style.item(0), style.item(1), style.item(2)].sort();

    expect(properties.includes("padding")).toBe(true);
    expect(properties.includes("background-color")).toBe(true);
    expect(properties.includes("font-family")).toBe(true);

    // Verify length
    expect(style.length).toBe(3);
  },
});

/**
 * Test CSS global namespace and factory methods
 */
test({
  name: "CSSOM namespace provides factory methods for typed values",
  fn: () => {
    // Create values using factory methods
    const pixels = CSSOM.px(10);
    const percent = CSSOM.percent(50);
    const angle = CSSOM.deg(90);
    const red = CSSOM.rgb(255, 0, 0);
    const transparent = CSSOM.rgba(0, 0, 0, 0.5);

    // Verify correct value creation
    expect(pixels instanceof CSSUnitValue).toBe(true);
    expect(pixels.value).toBe(10);
    expect(pixels.unit).toBe("px");

    expect(percent.unit).toBe("%");
    expect(angle.unit).toBe("deg");

    expect(red instanceof CSSColorValue).toBe(true);
    expect(red.r).toBe(255);
    expect(transparent.a).toBe(0.5);
  },
});

/**
 * Test custom property registration
 */
test({
  name: "CSSOM.registerProperty registers custom properties",
  fn: () => {
    // Register a custom property
    CSSOM.registerProperty({
      name: "--theme-color",
      syntax: "<color>",
      inherits: true,
      initialValue: "#c0ffee",
    });

    // Register another custom property
    CSSOM.registerProperty({
      name: "--spacing-unit",
      syntax: "<length>",
      inherits: false,
      initialValue: "8px",
    });

    // Verify registrations
    const themeColorReg = CSS_CUSTOM_PROPERTY_REGISTRY.get("--theme-color");
    const spacingUnitReg = CSS_CUSTOM_PROPERTY_REGISTRY.get("--spacing-unit");

    expect(themeColorReg).toBeDefined();
    expect(themeColorReg?.syntax).toBe("<color>");
    expect(themeColorReg?.inherits).toBe(true);
    expect(themeColorReg?.initialValue).toBe("#c0ffee");

    expect(spacingUnitReg).toBeDefined();
    expect(spacingUnitReg?.syntax).toBe("<length>");
    expect(spacingUnitReg?.inherits).toBe(false);
  },
});
