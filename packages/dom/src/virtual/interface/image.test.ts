/**
 * Image Element Tests
 *
 * These tests verify the behavior of the Image element implementation,
 * including construction with dimensions and attribute handling.
 */

import { createVirtualDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("Image", () => {
  // Set up a fresh environment for each test
  const getTestEnvironment = () => {
    const { Image } = createVirtualDOM("");
    return { Image };
  };

  describe("Constructor", () => {
    it("should create a basic img element when called with no arguments", () => {
      // GIVEN the Image constructor
      const { Image } = getTestEnvironment();

      // WHEN creating an Image with no arguments
      const img = new Image();

      // THEN it should create a basic img element
      expect(img.toString()).toBe("<img>");
    });

    it("should set width and height when called with one argument", () => {
      // GIVEN the Image constructor
      const { Image } = getTestEnvironment();

      // WHEN creating an Image with one dimension
      const img = new Image(1);

      // THEN it should set both width and height to that value
      expect(img.toString()).toBe('<img width="1" height="1">');
      expect(img.width).toBe(1);
      expect(img.height).toBe(1);
    });

    it("should set width and height when called with two arguments", () => {
      // GIVEN the Image constructor
      const { Image } = getTestEnvironment();

      // WHEN creating an Image with two dimensions
      const img = new Image(2, 3);

      // THEN it should set width to the first value and height to the second
      expect(img.toString()).toBe('<img width="2" height="3">');
      expect(img.width).toBe(2);
      expect(img.height).toBe(3);
    });
  });

  describe("Attributes", () => {
    it("should handle alt attribute correctly", () => {
      // GIVEN an Image element
      const { Image } = getTestEnvironment();
      const img = new Image(2, 3);

      // WHEN setting the alt attribute
      img.alt = "test";

      // THEN the alt attribute should be reflected in the HTML
      expect(img.toString()).toBe('<img alt="test" width="2" height="3">');
      expect(img.alt).toBe("test");
    });

    it("should handle src attribute correctly", () => {
      // GIVEN an Image element
      const { Image } = getTestEnvironment();
      const img = new Image();

      // WHEN setting the src attribute
      img.src = "image.jpg";

      // THEN the src attribute should be reflected in the HTML
      expect(img.getAttribute("src")).toBe("image.jpg");
      expect(img.src).toBe("image.jpg");
    });
  });

  describe("Properties", () => {
    it("should provide access to standard img properties", () => {
      // GIVEN an Image element
      const { Image } = getTestEnvironment();
      const img = new Image();

      // WHEN setting various properties
      img.width = 100;
      img.height = 200;
      img.alt = "Alternative text";
      img.title = "Image title";

      // THEN those properties should be accessible
      expect(img.width).toBe(100);
      expect(img.height).toBe(200);
      expect(img.alt).toBe("Alternative text");
      expect(img.title).toBe("Image title");
    });
  });
});
