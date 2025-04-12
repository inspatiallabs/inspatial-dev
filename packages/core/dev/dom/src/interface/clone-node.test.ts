import { InSpatialDOM } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for node cloning
// Using TDD principles to ensure comprehensive test coverage

describe("Node Cloning", () => {
  it("should correctly clone a node with attributes", () => {
    const { document } = InSpatialDOM("<html><body></body></html>");

    const div = document.createElement("div");
    div.setAttribute("class", "active");

    const clone = div.cloneNode(true);
    clone.setAttribute("id", "active");

    assert(clone.toString() === '<div id="active" class="active"></div>');
    assert(clone.attributes[0].ownerElement === clone);
    assert(clone.attributes[1].ownerElement === clone);
  });

  it("should maintain attribute ownership after cloning", () => {
    const { document } = InSpatialDOM("<html><body></body></html>");

    const span = document.createElement("span");
    span.setAttribute("data-role", "button");

    const clone = span.cloneNode(true);
    clone.setAttribute("aria-label", "button");

    assert(
      clone.toString() ===
        '<span data-role="button" aria-label="button"></span>'
    );
    assert(clone.attributes[0].ownerElement === clone);
    assert(clone.attributes[1].ownerElement === clone);
  });
});
