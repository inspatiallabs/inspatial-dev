/**
 * CSS Houdini Demo - Standalone Educational Version
 *
 * This file demonstrates the CSS Typed OM implementation (part of CSS Houdini)
 * with practical examples and explanations of use cases.
 */

// @ts-ignore
import {
  CSSOM,
  CSSStyleValue,
  CSSUnitValue,
  CSSColorValue,
  CSSTranslate,
  CSSRotate,
  CSSScale,
  CSSTransformValue,
  StylePropertyMap,
  CSSHoudiniStyleDeclaration,
  CSSKeywordValue,
} from "../../houdini/css-typed-om.ts";

/**
 * Run a comprehensive CSS Houdini Typed OM demo
 */
function runCSSHoudiniDemo() {
  console.log("CSS Houdini Typed OM Educational Demo");
  console.log("====================================");
  console.log(
    "This demo shows how the CSS Typed OM provides strong typing and"
  );
  console.log(
    "programmatic manipulation of CSS values with improved performance.\n"
  );

  // Create a standalone style property map to demonstrate the core APIs
  const styleMap = new StylePropertyMap();

  // SECTION 1: Basic CSS property manipulation
  console.log("\n🔹 SECTION 1: Basic CSS Property Manipulation");
  console.log("-------------------------------------------");
  console.log(
    "The StylePropertyMap provides strongly-typed access to CSS properties"
  );

  // Set basic properties both as strings and as parsed values
  styleMap.set("color", "red"); // String value - automatically parsed
  styleMap.set("background-color", "#f0f0f0"); // Hex color - automatically parsed
  styleMap.set("padding", "20px"); // Dimension - automatically parsed
  styleMap.set("margin", CSSOM.px(10)); // Pre-created typed value

  console.log("\nProperty access:");
  console.log(`- Color: ${styleMap.get("color")?.toString()}`);
  console.log(`- Background: ${styleMap.get("background-color")?.toString()}`);
  console.log(`- Conversion to CSS: ${styleMap.toString()}`);

  // SECTION 2: CSS unit values and typed manipulation
  console.log("\n🔹 SECTION 2: CSS Unit Values and Typed Manipulation");
  console.log("--------------------------------------------------");
  console.log(
    "CSSUnitValue represents dimensions with numeric values and units"
  );
  console.log("allowing for mathematical operations and unit conversion");

  // Create and manipulate typed values
  const width = CSSOM.px(200);
  const height = CSSOM.px(100);
  const borderRadius = CSSOM.px(5);

  styleMap.set("width", width);
  styleMap.set("height", height);
  styleMap.set("border-radius", borderRadius);

  console.log("\nTyped numeric values:");
  console.log(
    `- Width: ${width.toString()} (value: ${width.value}, unit: ${width.unit})`
  );

  // Perform mathematical operations
  const doubledWidth = width.multiply(2);
  const halfHeight = CSSOM.px(height.value / 2);
  const paddingCalc = CSSOM.px(width.value * 0.05); // 5% of width as padding

  styleMap.set("width", doubledWidth);
  styleMap.set("height", halfHeight);
  styleMap.set("padding", paddingCalc);

  console.log("\nMathematical operations:");
  console.log(`- Original width: ${width.toString()}`);
  console.log(`- Doubled width: ${doubledWidth.toString()}`);
  console.log(`- Half height: ${halfHeight.toString()}`);
  console.log(`- Calculated padding (5% of width): ${paddingCalc.toString()}`);

  // SECTION 3: CSS Color manipulation
  console.log("\n🔹 SECTION 3: CSS Color Manipulation");
  console.log("----------------------------------");
  console.log("CSSColorValue provides type-safe color manipulation");

  // Create and manipulate colors
  const red = new CSSColorValue(255, 0, 0);
  const blue = CSSOM.rgb(0, 0, 255);
  const semiTransparent = CSSOM.rgba(0, 128, 0, 0.5); // Semi-transparent green

  styleMap.set("color", red);
  styleMap.set("border-color", blue);
  styleMap.set("background-color", semiTransparent);

  console.log("\nColor values:");
  console.log(`- Red: ${red.toString()}`);
  console.log(`- Blue: ${blue.toString()}`);
  console.log(`- Semi-transparent green: ${semiTransparent.toString()}`);
  console.log(`- Red as hex: ${red.toHexString()}`);

  // SECTION 4: CSS Transforms
  console.log("\n🔹 SECTION 4: Complex CSS Transforms");
  console.log("----------------------------------");
  console.log(
    "CSS Transforms can be built programmatically with typed components"
  );

  // Create transform components
  const translateX = CSSOM.px(10);
  const translateY = CSSOM.px(20);
  const angle = CSSOM.deg(45);

  // Build a complex transform
  const transformList = new CSSTransformValue([
    new CSSTranslate(translateX, translateY),
    new CSSRotate(angle),
    new CSSScale(1.5, 1.5),
  ]);

  styleMap.set("transform", transformList);

  console.log("\nComplex transform:");
  console.log(`- Transform string: ${transformList.toString()}`);
  console.log(`- Individual components:`);
  transformList.transforms.forEach((transform, index) => {
    console.log(`  ${index + 1}. ${transform.toString()}`);
  });

  // SECTION 5: Animation setup with keyframes
  console.log("\n🔹 SECTION 5: Building Animations with Keyframes");
  console.log("---------------------------------------------");
  console.log(
    "The CSS Typed OM makes it easier to programmatically create animations"
  );

  // Create keyframe maps for an animation
  const startKeyframe = new StylePropertyMap();
  const midKeyframe = new StylePropertyMap();
  const endKeyframe = new StylePropertyMap();

  // Start keyframe (0%)
  startKeyframe.set("opacity", CSSOM.number(0));
  startKeyframe.set(
    "transform",
    new CSSTransformValue([
      new CSSTranslate(CSSOM.px(0), CSSOM.px(0)),
      new CSSScale(0.5, 0.5),
    ])
  );

  // Middle keyframe (50%)
  midKeyframe.set("opacity", CSSOM.number(0.7));
  midKeyframe.set(
    "transform",
    new CSSTransformValue([
      new CSSTranslate(CSSOM.px(20), CSSOM.px(20)),
      new CSSRotate(CSSOM.deg(180)),
      new CSSScale(1.2, 1.2),
    ])
  );

  // End keyframe (100%)
  endKeyframe.set("opacity", CSSOM.number(1));
  endKeyframe.set(
    "transform",
    new CSSTransformValue([
      new CSSTranslate(CSSOM.px(0), CSSOM.px(0)),
      new CSSRotate(CSSOM.deg(360)),
      new CSSScale(1, 1),
    ])
  );

  console.log("\nKeyframe animation definition:");
  console.log("- Start keyframe (0%):");
  console.log(`  ${startKeyframe.toString()}`);
  console.log("- Middle keyframe (50%):");
  console.log(`  ${midKeyframe.toString()}`);
  console.log("- End keyframe (100%):");
  console.log(`  ${endKeyframe.toString()}`);

  // SECTION 6: Custom properties and theming
  console.log("\n🔹 SECTION 6: Custom Properties and Theming");
  console.log("----------------------------------------");
  console.log("CSS Custom Properties can be registered with type information");

  // Register custom properties with type information
  CSSOM.registerProperty({
    name: "--theme-primary",
    syntax: "<color>",
    inherits: true,
    initialValue: "#1a73e8",
  });

  CSSOM.registerProperty({
    name: "--theme-spacing-unit",
    syntax: "<length>",
    inherits: true,
    initialValue: "8px",
  });

  // Use the custom properties
  styleMap.set("--theme-primary", "rgb(255, 0, 0)");
  styleMap.set("--theme-spacing-unit", CSSOM.px(12));
  styleMap.set("padding", "var(--theme-spacing-unit)");
  styleMap.set("color", "var(--theme-primary)");

  console.log("\nCustom property registration and usage:");
  console.log(`- Registered properties: --theme-primary, --theme-spacing-unit`);
  console.log(
    `- Theme primary value: ${styleMap.get("--theme-primary")?.toString()}`
  );
  console.log(
    `- Theme spacing unit: ${styleMap.get("--theme-spacing-unit")?.toString()}`
  );

  // SECTION 7: CSSHoudiniStyleDeclaration - The style interface
  console.log("\n🔹 SECTION 7: CSSHoudiniStyleDeclaration Interface");
  console.log("----------------------------------------------");
  console.log(
    "CSSHoudiniStyleDeclaration provides the familiar element.style interface"
  );
  console.log(
    "with camelCase property access and cssText parsing/serialization"
  );

  // Create a standalone style declaration
  const styleDecl = new CSSHoudiniStyleDeclaration();

  // Set properties with cssText
  styleDecl.cssText = "color: blue; font-size: 16px; margin: 10px";

  console.log("\nStyle declaration with cssText:");
  console.log(`- Color: ${styleDecl.color}`);
  console.log(`- Font size: ${styleDecl.fontSize}`);
  console.log(`- Margin: ${styleDecl.margin}`);

  // Add properties with direct property access and setProperty
  styleDecl.backgroundColor = "#eee";
  styleDecl.setProperty("padding", "20px", "important");
  styleDecl.borderRadius = "5px";

  console.log("\nUpdated style declaration:");
  console.log(`- CSS text output: ${styleDecl.cssText}`);
  console.log(
    `- Priority of padding: ${styleDecl.getPropertyPriority("padding")}`
  );
  console.log(
    `- CamelCase property access (borderRadius): ${styleDecl.borderRadius}`
  );

  // SECTION 8: Practical application
  console.log("\n🔹 SECTION 8: Practical Applications");
  console.log("----------------------------------");
  console.log(
    "The CSS Typed OM enables efficient and type-safe CSS manipulation"
  );
  console.log(
    "for complex UI interactions, animations, and visualization tools"
  );

  console.log("\nSome key benefits:");
  console.log("1. Type safety - prevents invalid CSS values");
  console.log("2. Performance - avoids constant string parsing/serialization");
  console.log(
    "3. Programmatic manipulation - mathematical operations on values"
  );
  console.log(
    "4. Complex transforms - easier creation of complex transformations"
  );
  console.log(
    "5. Animation generation - build keyframe animations programmatically"
  );

  return {
    styleMap,
    styleDecl,
    keyframes: {
      start: startKeyframe,
      mid: midKeyframe,
      end: endKeyframe,
    },
  };
}

// Run the demo
if (typeof globalThis !== "undefined") {
  try {
    runCSSHoudiniDemo();
    console.log("\n✅ CSS Houdini demo completed successfully!");
  } catch (error) {
    console.error("❌ Error running CSS Houdini demo:", error);
  }
}
