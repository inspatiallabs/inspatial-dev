import { InSpatialDOM } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for CSS style declaration manipulation

describe("CSS Style Declaration Manipulation", () => {
  it("should handle setting and getting CSS properties", () => {
    const { document } = InSpatialDOM("");

    let node = document.createElement("div");
    assert(node.style.cssText === "", "empty style");
    node.style.cssText =
      'background-color: blue; background-image: url("https://t.co/i.png");';
    assert(node.style.backgroundColor === "blue", "style getter");
    assert(
      node.style.backgroundImage === 'url("https://t.co/i.png")',
      "style value with colon"
    );
    assert(
      node.style.toString() ===
        'background-color:blue;background-image:url("https://t.co/i.png")',
      "cssText setter"
    );
    assert(
      Array.from(node.style).join(",") === "background-color,background-image",
      "iterable"
    );
    assert(node.style.length === 2, "style.length");
    assert(node.style[0] === "background-color", "style[0]");
  });

  it("should handle indirect CSS text setting and cleanup", () => {
    const { document } = InSpatialDOM("");

    let node = document.createElement("div");
    const styleAttr = node.getAttributeNode("style");
    if (styleAttr) {
      styleAttr.value = "color: red";
      assert(node.style.toString() === "color:red", "cssText indirect setter");
    }
    let style = document.createAttribute("style");
    node.setAttributeNode(style as any);
    assert(node.toString() === "<div></div>", "cssText cleanup");
    node.style.backgroundColor = "green";
    assert(
      node.toString() === '<div style="background-color:green"></div>',
      "cssText indirect property"
    );
    node.removeAttributeNode(style as any);
    node.style.color = "green";
    assert(
      node.toString() === '<div style="color:green"></div>',
      "cssText indirect setter again"
    );

    node.style.color = null;
    assert(node.toString() === "<div></div>", "setter as null");
    node.id = "";
    node.className = "";
    assert(node.toString() === "<div></div>", "setter as null");
  });

  it("should handle CSS property manipulation using setProperty and removeProperty", () => {
    const { document } = InSpatialDOM("");

    let node = document.createElement("div");
    node.style.setProperty("background-color", "purple");
    assert(
      node.toString() === '<div style="background-color:purple"></div>',
      "setProperty"
    );
    assert(
      node.style.getPropertyValue("background-color") === "purple",
      "getPropertyValue"
    );
    node.style.removeProperty("background-color");
    assert(node.toString() === "<div></div>", "removeProperty");
  });

  it("should handle style attribute manipulation and iteration", () => {
    const { document } = InSpatialDOM("");

    /** @type {HTMLDivElement} */
    const divWithStyle = document.createElement("div");
    divWithStyle.setAttribute("style", " display:  flex ;");
    assert(divWithStyle.hasAttribute("style") === true, "hasAttribute");
    assert(
      divWithStyle.getAttribute("style") === " display:  flex ;",
      "getAttribute"
    );
    assert(Array.from(divWithStyle.style).join(",") === "display", "iterable");
    assert(
      Array.from(divWithStyle.style).join(",") === "display",
      "Array.from"
    );
    divWithStyle.style.setProperty("display", "block");
    assert(
      Array.from(divWithStyle.style).join(",") === "display",
      "iterable after change"
    );
    assert(
      Array.from(divWithStyle.style).join(",") === "display",
      "Array.from after change"
    );
    divWithStyle.style.setProperty("color", "green");
    assert(
      Array.from(divWithStyle.style).join(",") === "display,color",
      "iterable after adding property"
    );
    assert(
      Array.from(divWithStyle.style).join(",") === "display,color",
      "Array.from after adding property"
    );
  });
});
