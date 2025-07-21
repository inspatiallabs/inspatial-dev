/**
 * Debug test for class attribute stack overflow issue
 */

// @ts-ignore - Ignoring TS extension import error
import { test, expect } from "@inspatial/test";
// @ts-ignore - Ignoring TS extension import error
import { createIsolatedDOM } from "../test-helpers.ts";

test({
  name: "debug: class attribute should not cause stack overflow",
  fn: () => {
    console.log("Creating isolated DOM...");
    const dom = createIsolatedDOM();
    
    console.log("Creating div element...");
    const element = dom.document.createElement("div");
    
    console.log("Setting 'class' attribute...");
    element.setAttribute("class", "test-class");
    
    console.log("Getting 'class' attribute (lowercase)...");
    const class1 = element.getAttribute("class");
    console.log("Result:", class1);
    
    console.log("Getting 'CLASS' attribute (uppercase)...");
    const class2 = element.getAttribute("CLASS");
    console.log("Result:", class2);
    
    console.log("Checking hasAttribute...");
    const hasClass1 = element.hasAttribute("class");
    const hasClass2 = element.hasAttribute("CLASS");
    console.log("hasAttribute('class'):", hasClass1);
    console.log("hasAttribute('CLASS'):", hasClass2);
    
    // Test assertions
    expect(class1).toBe("test-class");
    expect(class2).toBe("test-class");
    expect(hasClass1).toBe(true);
    expect(hasClass2).toBe(true);
    
    console.log("✅ Test completed successfully");
  }
}); 