/**
 * # Element Testing (Generic DOM)
 * @summary Tests for basic DOM element functionality using anchor elements
 *
 * These tests verify that elements can be created, manipulated, and handle
 * basic DOM operations correctly.
 */
import { describe, it, expect, beforeEach } from "@inspatial/test";
import { createIsolatedDOM } from "../test-helpers.ts";

describe("Generic Element (using anchor)", () => {
  let dom: ReturnType<typeof createIsolatedDOM>;
  
  beforeEach(() => {
    dom = createIsolatedDOM();
  });

  it("should create elements with correct tag names", () => {
    // GIVEN we create various elements
    const anchor = dom.document.createElement("a");
    const div = dom.document.createElement("div");
    const span = dom.document.createElement("span");
    
    // THEN they should have correct tag names
    expect(anchor.tagName).toBe("A");
    expect(div.tagName).toBe("DIV"); 
    expect(span.tagName).toBe("SPAN");
  });

  it("should support basic attribute operations", () => {
    // GIVEN an anchor element  
    const anchor = dom.document.createElement("a");
    
    // WHEN setting attributes
    anchor.setAttribute("id", "test-link");
    anchor.setAttribute("data-test", "value");
    
    // THEN attributes should be retrievable  
    expect(anchor.getAttribute("id")).toBe("test-link");
    expect(anchor.getAttribute("data-test")).toBe("value");
    
    // AND hasAttribute should work
    expect(anchor.hasAttribute("id")).toBe(true);
    expect(anchor.hasAttribute("nonexistent")).toBe(false);
  });

  it("should support textContent manipulation", () => {
    // GIVEN an anchor element
    const anchor = dom.document.createElement("a");
    dom.document.body!.appendChild(anchor);
    
    // WHEN setting text content
    anchor.textContent = "Click me";
    
    // THEN textContent should be retrievable
    expect(anchor.textContent).toBe("Click me");
    
    // WHEN adding child text nodes
    anchor.textContent = ""; // clear first
    anchor.appendChild(dom.document.createTextNode("Hello "));
    anchor.appendChild(dom.document.createTextNode("World"));
    
    // THEN textContent should aggregate
    expect(anchor.textContent).toBe("Hello World");
  });

  it("should support DOM tree operations", () => {
    // GIVEN parent and child elements
    const anchor = dom.document.createElement("a");
    const span = dom.document.createElement("span");
    const text = dom.document.createTextNode("Link text");
    
    // WHEN building a tree
    span.appendChild(text);
    anchor.appendChild(span);
    dom.document.body!.appendChild(anchor);
    
    // THEN tree relationships should be correct
    expect(anchor.parentNode).toBe(dom.document.body);
    expect(anchor.firstChild).toBe(span);
    expect(span.parentNode).toBe(anchor);
    expect(span.firstChild).toBe(text);
    expect(text.parentNode).toBe(span);
  });
});
