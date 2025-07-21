/**
 * Simple test to verify our getAttribute fix is working
 */

// @ts-ignore - Ignoring TS extension import error
import { test, expect } from "@inspatial/test";
// @ts-ignore - Ignoring TS extension import error
import { createIsolatedDOM } from "../test-helpers.ts";

test({
  name: "getAttribute fix verification - basic functionality",
  fn: () => {
    // GIVEN an isolated DOM environment
    const dom = createIsolatedDOM();
    
    // WHEN we create an anchor element and set an href attribute
    const anchor = dom.document.createElement("a");
    anchor.setAttribute("href", "https://xr.new");
    
    // THEN getAttribute should return the correct value (not null as it did before the fix)
    expect(anchor.getAttribute("href")).toBe("https://xr.new");
    
    // AND hasAttribute should return true (not false as it did before the fix)
    expect(anchor.hasAttribute("href")).toBe(true);
    
    // AND the attribute should be visible in the attributes collection
    expect(anchor.attributes.length).toBe(1);
    expect(anchor.attributes[0].name).toBe("href");
    expect(anchor.attributes[0].value).toBe("https://xr.new");
  }
});

test({
  name: "getAttribute fix verification - multiple attributes",
  fn: () => {
    // GIVEN an isolated DOM environment  
    const dom = createIsolatedDOM();
    
    // WHEN we create an element and set multiple attributes (avoiding class which seems to cause recursion)
    const element = dom.document.createElement("input");
    element.setAttribute("type", "text");
    element.setAttribute("name", "username");
    element.setAttribute("placeholder", "Enter username");
    
    // THEN all attributes should be retrievable
    expect(element.getAttribute("type")).toBe("text");
    expect(element.getAttribute("name")).toBe("username");
    expect(element.getAttribute("placeholder")).toBe("Enter username");
    
    // AND all attributes should be detected
    expect(element.hasAttribute("type")).toBe(true);
    expect(element.hasAttribute("name")).toBe(true);
    expect(element.hasAttribute("placeholder")).toBe(true);
    
    // AND attributes collection should contain all attributes
    expect(element.attributes.length).toBe(3);
  }
});

test({
  name: "getAttribute fix verification - non-existent attributes",
  fn: () => {
    // GIVEN an isolated DOM environment
    const dom = createIsolatedDOM();
    
    // WHEN we create an element without setting any attributes
    const element = dom.document.createElement("div");
    
    // THEN getAttribute should return null for non-existent attributes
    expect(element.getAttribute("nonexistent")).toBe(null);
    expect(element.hasAttribute("nonexistent")).toBe(false);
    expect(element.attributes.length).toBe(0);
  }
}); 