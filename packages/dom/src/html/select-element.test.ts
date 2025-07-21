import { createDOM } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for SelectElement

describe("SelectElement", () => {
  it("should handle options and selected value", () => {
    // GIVEN a select element with options
    let { document } = createDOM("<select></select>");
    let select = document.firstElementChild;

    if (select) {
      // WHEN setting innerHTML with options
      select.innerHTML =
        '<option></option><option selected value="OK"></option>';

      // THEN the select element should be represented correctly
      assert(
        select.toString() ===
          '<select><option></option><option selected value="OK"></option></select>'
      );
      assert(select.value === "OK");
      assert(select.options[1].selected === true);

      // WHEN changing the selected option
      select.options[0].selected = true;

      // THEN the select element should update the selected option
      assert(
        select.toString() ===
          '<select><option selected></option><option value="OK"></option></select>'
      );
    }
  });

  it("should handle options within optgroup", () => {
    // GIVEN a select element with options and optgroup
    let { document } = createDOM(
      "<select><option></option><optgroup><option></option></optgroup></select>"
    );
    let select = document.firstElementChild;

    if (select) {
      // THEN the select element should have the correct options
      assert(
        select.options.toString() === "<option></option>,<option></option>"
      );
      assert(select.options.length === 2);
    }
  });
});
