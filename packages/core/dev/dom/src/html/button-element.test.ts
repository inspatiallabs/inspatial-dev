/**
 * # ButtonElement Testing
 * @summary Tests for the button element's attributes and properties
 *
 * These tests verify that the button element correctly handles
 * its attributes, properties, and serialization.
 */
import { describe, it, assert } from "@inspatial/test";
import { createDOM } from "../index.ts";

describe("ButtonElement", () => {
  it("should correctly toggle the disabled attribute", () => {
    // GIVEN a button element
    const { document } = createDOM("<button>click me</button>");
    const { lastElementChild: button } = document;

    // WHEN setting the disabled property to true
    button.disabled = true;

    // THEN it should reflect in the element's string representation and properties
    assert(
      button.toString().includes("disabled"),
      "Button should have disabled attribute in string representation"
    );
    assert(button.disabled === true, "disabled property should be true");

    // WHEN setting the disabled property to false
    button.disabled = false;

    // THEN the disabled attribute should be removed
    assert(
      !button.toString().includes("disabled"),
      "Button should not have disabled attribute in string representation"
    );
    assert(button.disabled === false, "disabled property should be false");
  });

  it("should be correctly serialized to JSON", () => {
    // GIVEN a button element
    const { document } = createDOM("<button>click me</button>");
    const { lastElementChild: button } = document;

    // WHEN setting attributes and serializing to JSON
    button.disabled = true;
    const json = JSON.stringify(button);

    // THEN it should include the correct structure
    assert(
      json.includes('"button"') &&
        json.includes('"disabled"') &&
        json.includes('"click me"'),
      "JSON representation should include tag name, attributes, and content"
    );
  });

  it("should report correct tag and node names", () => {
    // GIVEN a button element
    const { document } = createDOM("<button>click me</button>");
    const { lastElementChild: button } = document;

    // THEN it should have the correct tag and node names
    assert(button.tagName === "BUTTON", "tagName should be BUTTON");
    assert(button.nodeName === "BUTTON", "nodeName should be BUTTON");
  });

  it("should report null for child elements when it has none", () => {
    // GIVEN a button element with only text content
    const { document } = createDOM("<button>click me</button>");
    const { lastElementChild: button } = document;

    // THEN it should report null for child element properties
    assert(button.lastElementChild === null, "lastElementChild should be null");
    assert(
      button.firstElementChild === null,
      "firstElementChild should be null"
    );
  });

  it("should report child elements when they exist", () => {
    // GIVEN a button element with a child element
    const { document } = createDOM("<button><span>click me</span></button>");
    const { lastElementChild: button } = document;

    // THEN it should report the correct child elements
    assert(
      button.firstElementChild !== null &&
        button.firstElementChild.tagName === "SPAN",
      "firstElementChild should be a SPAN element"
    );
    assert(
      button.lastElementChild !== null &&
        button.lastElementChild.tagName === "SPAN",
      "lastElementChild should be a SPAN element"
    );
  });
});
