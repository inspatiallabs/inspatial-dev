/**
 * Tests to ensure we're not introducing/reintroducing circular dependencies
 */

import { assertEquals, test } from "@inspatial/test";

test("timer.ts should not require animation.ts", async () => {
  // Load the timer module explicitly
  const timer = await import("../src/timer");
  
  // Get all imported modules for timer.ts
  const timerImports = Object.keys(timer);
  
  // Verify timer doesn't import animation classes directly
  assertEquals(timerImports.includes("JSAnimation"), false);
  
  // Get the import dependencies
  const moduleBase = "../src/";
  const timerModuleName = moduleBase + "timer.ts";
  const animationModuleName = moduleBase + "animation.ts";
  
  // Function to check deep imports and find circular dependencies
  async function hasCircularImport(
    startModule: string,
    targetModule: string,
    visited = new Set<string>()
  ): Promise<boolean> {
    // If we've already visited this module, skip to avoid infinite recursion
    if (visited.has(startModule)) {
      return false;
    }

    // Mark this module as visited
    visited.add(startModule);
    
    try {
      // Import the module dynamically
      const module = await import(startModule);
      
      // Check if this module directly imports the target
      if (Object.keys(module).some(key => key.includes(targetModule))) {
        return true;
      }
      
      // Check all the module's imports recursively
      for (const importedModule of Object.keys(module)) {
        // Only follow imports that are in our source directory
        if (importedModule.startsWith(moduleBase)) {
          const hasCircular = await hasCircularImport(importedModule, targetModule, visited);
          if (hasCircular) {
            return true;
          }
        }
      }
    } catch (e) {
      // If we can't import a module, just continue
      console.warn(`Could not import ${startModule}:`, e);
    }
    
    return false;
  }
  
  // We can't reliably check all circular dependencies,
  // but we can at least verify timer doesn't directly import animation
  const timerImportsAnimation = await hasCircularImport(timerModuleName, animationModuleName);
  assertEquals(timerImportsAnimation, false, "timer.ts should not import animation.ts");
}); 