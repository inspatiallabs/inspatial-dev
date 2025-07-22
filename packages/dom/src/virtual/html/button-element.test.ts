/**
 * # ButtonElement Testing
 * @summary Tests for the button element's attributes and properties
 *
 * These tests verify that the button element correctly handles
 * its attributes, properties, and serialization.
 */
import { describe, it, expect, beforeEach } from "@inspatial/test";
import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END, VALUE } from "../shared/symbols.ts";

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
    console.log("1. Button created, localName:", button.localName);
    
    button.textContent = "click me";
    console.log("2. After setting textContent:", button.textContent);
    
    button.setAttribute("disabled", "");
    console.log("3. After setting disabled attribute");
    console.log("   hasAttribute('disabled'):", button.hasAttribute("disabled"));
    console.log("   getAttribute('disabled'):", button.getAttribute("disabled"));
    
    // Walk the NEXT chain and check actual [VALUE] contents
    console.log("4. Walking NEXT chain with [VALUE] inspection:");
    let next = (button as any)[NEXT];
    let count = 0;
    while (next && count < 10) {
      const nodeTypeStr = next.nodeType === 2 ? "ATTR" : next.nodeType === 3 ? "TEXT" : `TYPE_${next.nodeType}`;
      console.log(`   [${count}] ${nodeTypeStr}: ${next.name || next.localName || '#text'}`);
      
      if (next.nodeType === 2) { // Attribute
        console.log(`      -> name: "${next.name}"`);
        console.log(`      -> value property: "${next.value}"`);
        console.log(`      -> [VALUE] symbol: "${next[VALUE]}"`);
        console.log(`      -> Direct access: value="${next.value}", [VALUE]="${next[VALUE]}"`);
      } else if (next.nodeType === 3) { // Text
        console.log(`      -> textContent: "${next.textContent}"`);
        console.log(`      -> data: "${next.data}"`);
        console.log(`      -> [VALUE] symbol: "${next[VALUE]}"`);
        console.log(`      -> Direct access: textContent="${next.textContent}", data="${next.data}", [VALUE]="${next[VALUE]}"`);
      }
      
      next = next[NEXT];
      count++;
      if (next === (button as any)[END]) {
        console.log(`   [${count}] END marker`);
        break;
      }
    }
    
    dom.document.body!.appendChild(button);

    // WHEN serializing to JSON
    console.log("5. About to call toJSON...");
    const toJsonResult = (button as any).toJSON();
    console.log("   button.toJSON():", toJsonResult);
    
    console.log("6. About to call JSON.stringify...");
    const json = JSON.stringify(button);
    console.log("   JSON.stringify result:", json);

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
