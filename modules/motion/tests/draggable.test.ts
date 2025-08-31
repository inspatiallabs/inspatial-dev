import { describe, it, expect } from "@inspatial/test";
import { inMotion } from "../src/index.ts";
import { createMotionDraggable } from "../src/draggable.ts";

describe("InMotion Draggables", () => {
  it("Should trigger a reset in the onSettle callback should correctly set the values", async (resolve) => {
    const draggable = createMotionDraggable("#target-id", {
      container: "#css-tests",
      onSettle: (self) => {
        self.reset();
        expect(inMotion.get("#target-id", "x")).toEqual(0);
        expect(inMotion.get("#target-id", "y")).toEqual(0);
        resolve();
      },
    });

    draggable.animate.translateX(100, 10);
    draggable.animate.translateY(100, 10);
  });
});
