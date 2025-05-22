/**
 * # ButtonElement Testing
 * @summary Tests for the button element's attributes and properties
 *
 * These tests verify that the button element correctly handles
 * its attributes, properties, and serialization.
 */
import { describe, it, expect, beforeEach } from "@inspatial/test";
import { createIsolatedDOM } from "../test-helpers.ts";

describe("ButtonElement", () => {
  let dom: ReturnType<typeof createIsolatedDOM>;
  
  beforeEach(() => {
    dom = createIsolatedDOM();
  });

  it("should correctly toggle the disabled attribute", () => {
    // GIVEN a button element
    const button = dom.document.createElement("button") as unknown as HTMLButtonElement;
    button.textContent = "click me";
    dom.document.body!.appendChild(button);

    // WHEN setting the disabled property to true
    button.setAttribute("disabled", "");

    // THEN it should reflect in the element's string representation and properties
    expect(button.toString()).toContain("disabled");
    expect(button.hasAttribute("disabled")).toBe(true);

    // WHEN removing the disabled attribute
    button.removeAttribute("disabled");

    // THEN the disabled attribute should be removed
    expect(button.toString()).not.toContain("disabled");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should be correctly serialized to JSON", () => {
    // GIVEN a button element
    const button = dom.document.createElement("button") as unknown as HTMLButtonElement;
    button.textContent = "click me";
    button.setAttribute("disabled", "");
    dom.document.body!.appendChild(button);

    // WHEN serializing to JSON
    const json = JSON.stringify(button);

    // THEN it should include the correct structure
    expect(json).toContain('"button"');
    expect(json).toContain('"disabled"');
    expect(json).toContain('"click me"');
  });

  it("should report correct tag and node names", () => {
    // GIVEN a button element
    const button = dom.document.createElement("button") as unknown as HTMLButtonElement;
    button.textContent = "click me";
    dom.document.body!.appendChild(button);

    // THEN it should have the correct tag and node names
    expect(button.tagName).toBe("BUTTON");
    expect(button.nodeName).toBe("BUTTON");
  });

  it("should report null for child elements when it has none", () => {
    // GIVEN a button element with only text content
    const button = dom.document.createElement("button") as unknown as HTMLButtonElement;
    button.textContent = "click me";
    dom.document.body!.appendChild(button);

    // THEN it should report null for child element properties
    expect(button.lastElementChild).toBe(null);
    expect(button.firstElementChild).toBe(null);
  });

  it("should report child elements when they exist", () => {
    // GIVEN a button element with a child element
    const button = dom.document.createElement("button") as unknown as HTMLButtonElement;
    const span = dom.document.createElement("span") as unknown as HTMLSpanElement;
    span.textContent = "click me";
    button.appendChild(span as unknown as Node);
    dom.document.body!.appendChild(button);

    // THEN it should report the correct child elements
    expect(button.firstElementChild).not.toBe(null);
    expect(button.firstElementChild!.tagName).toBe("SPAN");
    expect(button.lastElementChild).not.toBe(null);
    expect(button.lastElementChild!.tagName).toBe("SPAN");
  });
});
