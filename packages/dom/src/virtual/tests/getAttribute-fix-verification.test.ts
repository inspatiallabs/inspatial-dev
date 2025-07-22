/**
 * Verification test for the getAttribute fix
 * 
 * This test demonstrates that our fix to the Element.getAttributeNode function
 * has resolved the critical bug where getAttribute() returned null even when
 * attributes were properly stored.
 */

// @ts-ignore - Ignoring TS extension import error
import { describe, it, expect } from "@inspatial/test";
// @ts-ignore - Ignoring TS extension import error
import { createIsolatedDOM } from "../test-helpers.ts";

describe("getAttribute Fix Verification", () => {
  it("should correctly retrieve attributes after our getAttributeNode fix", () => {
    // GIVEN an isolated DOM environment
    const dom = createIsolatedDOM();
    
    // WHEN we create an anchor element and set an href attribute
    const anchor = dom.document.createElement("a");
    anchor.setAttribute("href", "https://xr.new");
    
    // THEN getAttribute should return the correct value (not null)
    expect(anchor.getAttribute("href")).toBe("https://xr.new");
    
    // AND hasAttribute should return true (not false)
    expect(anchor.hasAttribute("href")).toBe(true);
    
    // AND the attribute should be visible in the attributes collection
    expect(anchor.attributes.length).toBe(1);
    expect(anchor.attributes[0].name).toBe("href");
    expect(anchor.attributes[0].value).toBe("https://xr.new");
  });

  it("should handle case-insensitive attribute access correctly", () => {
    // GIVEN an isolated DOM environment
    const dom = createIsolatedDOM();
    
    // WHEN we create an element and set attributes
    const element = dom.document.createElement("div");
    element.setAttribute("id", "test-element");
    element.setAttribute("class", "test-class");
    
    // THEN case-insensitive access should work (HTML is case-insensitive)
    expect(element.getAttribute("ID")).toBe("test-element");
    expect(element.getAttribute("CLASS")).toBe("test-class");
    expect(element.hasAttribute("ID")).toBe(true);
    expect(element.hasAttribute("CLASS")).toBe(true);
  });

  it("should return null for non-existent attributes", () => {
    // GIVEN an isolated DOM environment
    const dom = createIsolatedDOM();
    
    // WHEN we create an element without setting any attributes
    const element = dom.document.createElement("div");
    
    // THEN getAttribute should return null for non-existent attributes
    expect(element.getAttribute("nonexistent")).toBe(null);
    expect(element.hasAttribute("nonexistent")).toBe(false);
    expect(element.attributes.length).toBe(0);
  });

  it("should handle multiple attributes correctly", () => {
    // GIVEN an isolated DOM environment  
    const dom = createIsolatedDOM();
    
    // WHEN we create an element and set multiple attributes
    const element = dom.document.createElement("input");
    element.setAttribute("type", "text");
    element.setAttribute("name", "username");
    element.setAttribute("required", "");
    element.setAttribute("placeholder", "Enter username");
    
    // THEN all attributes should be retrievable
    expect(element.getAttribute("type")).toBe("text");
    expect(element.getAttribute("name")).toBe("username");
    expect(element.getAttribute("required")).toBe("");
    expect(element.getAttribute("placeholder")).toBe("Enter username");
    
    // AND all attributes should be detected
    expect(element.hasAttribute("type")).toBe(true);
    expect(element.hasAttribute("name")).toBe(true);
    expect(element.hasAttribute("required")).toBe(true);
    expect(element.hasAttribute("placeholder")).toBe(true);
    
    // AND attributes collection should contain all attributes
    expect(element.attributes.length).toBe(4);
  });

  it("should handle attribute modification correctly", () => {
    // GIVEN an isolated DOM environment
    const dom = createIsolatedDOM();
    
    // WHEN we create an element and modify attributes
    const element = dom.document.createElement("div");
    
    // Initially set an attribute
    element.setAttribute("data-value", "initial");
    expect(element.getAttribute("data-value")).toBe("initial");
    
    // Update the attribute value
    element.setAttribute("data-value", "updated");
    expect(element.getAttribute("data-value")).toBe("updated");
    
    // Remove the attribute
    element.removeAttribute("data-value");
    expect(element.getAttribute("data-value")).toBe(null);
    expect(element.hasAttribute("data-value")).toBe(false);
  });
}); 