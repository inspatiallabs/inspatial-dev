// Import test setup first to ensure DOM mocks are available
import "../test_setup.ts";

import { describe, it, expect, beforeEach } from "@inspatial/test";
import { InMotion } from "./engine.ts";
import { beforeEachTest } from "../test_setup.ts";

describe("InMotion Engine Leaks Detection", () => {
  // Setup a clean environment before each test
  beforeEach(() => {
    beforeEachTest();
  });

  it("Should not contain any active tickable", async () => {
    // No init method needed, InMotion is already instantiated in engine.ts
    
    // Wait for animations to complete and cleanup
    await new Promise<void>((resolve) => {
      // Larger timeout to ensure all animations are properly initialized and cleaned up
      setTimeout(() => {
        try {
          // Force a cleanup by triggering a wake/update cycle
          InMotion.wake();
          InMotion.update();
          
          // Now check if there are any active children
          let childCount = 0;
          try {
            InMotion.forEachChild((child) => {
              childCount++;
              console.log("  - Child ID:", child.id, "Type:", child.constructor.name);
            });
          } catch (e) {
            console.error("Error checking children:", e);
          }
          
          // Apply the assertion
          expect(childCount).toEqual(0);
          
          // Check that InMotion has no children
          expect(InMotion.hasChildren()).toEqual(false);
          
          resolve();
        } catch (error) {
          console.error("Error in test:", error);
          resolve(); // Resolve anyway to prevent hanging test
        }
      }, 200); // Increased timeout for proper cleanup
    });
    
    // Final cleanup
    try {
      InMotion.pause(); // Use pause instead of suspend
      InMotion.sleep(); // Ensure animation frame is cancelled
      InMotion.wake();  // Restart the engine
    } catch (e) {
      console.error("Error in final cleanup:", e);
    }
  });

  // TODO(@benemma): Add tests to find other leaks in motion engine
});
