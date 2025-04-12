import { describe, it, assert } from "@inspatial/test";
import { InSpatialDOM } from "../index.ts";

// Test suite for ImageElement

describe("ImageElement", () => {
  it("should set the src attribute correctly", () => {
    // GIVEN an image element
    const { document } = InSpatialDOM("<html><img></html>");
    const img = document.documentElement?.firstElementChild;

    // WHEN setting the src attribute
    if (img) {
      img.src = "inspatiallabs.com";

      // THEN the src attribute should be set correctly
      assert(img.src === "inspatiallabs.com", "Issue #10 - <img>.src");
      assert(
        img.toString() === '<img src="inspatiallabs.com">',
        "Issue #10 - <img>.src"
      );
    }
  });

  it("should set the width attribute correctly", () => {
    // GIVEN an image element with a src attribute
    const { document } = InSpatialDOM('<html><img src="inspatiallabs.com"></html>');
    const img = document.documentElement?.firstElementChild;

    // WHEN setting the width attribute
    if (img) {
      img.width = 99;

      // THEN the width attribute should be set correctly
      assert(
        img.toString() === '<img width="99" src="inspatiallabs.com">',
        "<img>.width"
      );
      assert(img.width === 99);
      assert(img.height === 0);
      assert(img.lastChild === null, "lastChild");
    }
  });
});
