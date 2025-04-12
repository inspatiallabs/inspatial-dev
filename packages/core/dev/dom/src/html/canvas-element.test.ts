/**
 * # CanvasElement Testing
 * @summary Tests for the canvas element's dimensions and rendering capabilities
 *
 * These tests verify that the canvas element correctly handles dimensions,
 * context creation, and data URL generation.
 */
import { describe, it, assert } from "@inspatial/test";
import { InSpatialDOM } from "../index.ts";

describe("CanvasElement", () => {
  it("should have correct default dimensions", () => {
    // GIVEN a canvas element
    const { document } = InSpatialDOM("<canvas></canvas>");
    const canvas = document.querySelector("canvas")!;

    // THEN it should have the standard default dimensions
    assert(
      (canvas as any).height === 150,
      "Default canvas height should be 150px"
    );
    assert(
      (canvas as any).width === 300,
      "Default canvas width should be 300px"
    );
  });

  it("should update its attributes when dimensions are changed", () => {
    // GIVEN a canvas element
    const { document } = InSpatialDOM("<canvas></canvas>");
    const canvas = document.querySelector("canvas")!;

    // WHEN changing its dimensions
    (canvas as any).height = 200;
    (canvas as any).width = 320;

    // THEN the string representation should include the updated dimensions
    const stringRepresentation = canvas.toString();
    assert(
      stringRepresentation.includes('width="320"') &&
        stringRepresentation.includes('height="200"'),
      "Canvas string representation should include the updated dimensions"
    );
  });

  it("should provide a 2D rendering context", () => {
    // GIVEN a canvas element
    const { document } = InSpatialDOM("<canvas></canvas>");
    const canvas = document.querySelector("canvas")!;

    // WHEN requesting a 2D context
    const context = (canvas as any).getContext("2d");

    // THEN it should return a valid context
    assert(
      context !== undefined && context !== null,
      "Canvas should provide a rendering context for the Window (2D)"
    );
  });

  it("should generate data URLs in the correct format", () => {
    // GIVEN a canvas element
    const { document } = InSpatialDOM("<canvas></canvas>");
    const canvas = document.querySelector("canvas")!;

    // WHEN generating a data URL
    const dataUrl = (canvas as any).toDataURL("image/png");

    // THEN it should return a string
    assert(
      typeof dataUrl === "string",
      "Canvas toDataURL should return a string"
    );

    // Additional reporting for test environment capabilities
    if (dataUrl.length) {
      // This is just logging information, not part of the test assertions
      console.log(" └ Canvas module is available for image generation");
    }
  });
});
