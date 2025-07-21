/**
 * Debug test for stack overflow in case-insensitive attribute access
 */

// @ts-ignore - Ignoring TS extension import error
import { test, expect } from "@inspatial/test";
// @ts-ignore - Ignoring TS extension import error
import { createIsolatedDOM } from "../test-helpers.ts";

test({
  name: "debug: case-insensitive attribute access should not cause stack overflow",
  fn: () => {
    console.log("Creating isolated DOM...");
    const dom = createIsolatedDOM();
    
    console.log("Creating div element...");
    const element = dom.document.createElement("div");
    
    console.log("Setting 'id' attribute...");
    element.setAttribute("id", "test-element");
    
    console.log("Getting 'id' attribute (lowercase)...");
    const id1 = element.getAttribute("id");
    console.log("Result:", id1);
    
    console.log("Getting 'ID' attribute (uppercase)...");
    const id2 = element.getAttribute("ID");
    console.log("Result:", id2);
    
    // Test assertions
    expect(id1).toBe("test-element");
    expect(id2).toBe("test-element");
    
    console.log("✅ Test completed successfully");
  }
}); 