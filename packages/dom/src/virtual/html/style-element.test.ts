import { createVirtualDOM } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for StyleElement

describe("StyleElement", () => {
  it("should handle empty style element", () => {
    // GIVEN an empty style element
    let { document } = createVirtualDOM("<style></style>");
    let style = document.firstElementChild;

    if (style) {
      // THEN the style element should be represented correctly
      assert(style.toString() === "<style></style>");
      assert(style.sheet != null, true, "style.sheet");
      assert(style.innerHTML === "", "style.innerHTML");
      assert(style.innerText === "", "style.innerText");
      assert(style.textContent === "", "style.textContent");
    }
  });

  it("should handle style element with CSS content", () => {
    // GIVEN a style element
    let { document } = createVirtualDOM("<style></style>");
    let style = document.firstElementChild;

    if (style) {
      // WHEN setting innerHTML with CSS content
      style.innerHTML = ".test { color: white; font-size: 12px; }";

      // THEN the style element should be represented correctly
      assert(
        style.innerHTML === ".test { color: white; font-size: 12px; }",
        "style.innerHTML"
      );
      assert(
        style.innerText === ".test { color: white; font-size: 12px; }",
        "style.innerText"
      );
      assert(
        style.textContent === ".test { color: white; font-size: 12px; }",
        "style.textContent"
      );
      assert(
        style.toString() ===
          "<style>.test { color: white; font-size: 12px; }</style>"
      );
      assert(
        style.sheet.cssRules.length === 1,
        true,
        "style.sheet.cssRules.length"
      );
      assert(style.sheet.cssRules[0].selectorText === ".test");
      assert(style.sheet.cssRules[0].style.color === "white");
      assert(style.sheet.cssRules[0].style["font-size"] === "12px");
    }
  });
});
