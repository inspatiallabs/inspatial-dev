import { describe, it, assert } from "@inspatial/test";
import { parseHTML } from "../index.ts";

// Test suite for InputElement

describe("InputElement", () => {
  it("should set the type attribute correctly", () => {
    // GIVEN an input element
    let { document } = parseHTML("<input />");
    let input = document.firstElementChild;

    // WHEN setting the type attribute
    if (input) {
      input.type = "password";

      // THEN the type attribute should be set correctly
      assert(input.toString() === '<input type="password">');
    }
  });

  it("should handle input element without attributes", () => {
    // GIVEN an input element without attributes
    let { document } = parseHTML("<input>");
    let input = document.firstElementChild;

    // THEN the input element should be represented correctly
    if (input) {
      assert(input.toString() === "<input>");
    }
  });
});
