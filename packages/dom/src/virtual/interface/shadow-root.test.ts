/**
 * Shadow Root Tests
 *
 * These tests verify the behavior of the ShadowRoot implementation
 * including attachment, hosting, and content management.
 */

// @ts-ignore - Ignoring TS extension import error
import { createVirtualDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("ShadowRoot", () => {
  // Setup
  const getTestEnvironment = () => {
    const { document } = createVirtualDOM("<!doctype html><html />");
    const { documentElement } = document;

    // Ensure documentElement exists
    if (!documentElement) {
      throw new Error("documentElement is null");
    }

    return { document, documentElement };
  };

  describe("Shadow Root Attachment", () => {
    it("should initially have no shadow root", () => {
      // GIVEN a document element
      const { documentElement } = getTestEnvironment();

      // THEN it should not have a shadow root
      expect(documentElement.shadowRoot).toBeNull();
    });

    it("should allow attaching a shadow root", () => {
      // GIVEN a document element
      const { documentElement } = getTestEnvironment();

      // WHEN attaching a shadow root
      const shadowRoot = documentElement.attachShadow({ mode: "open" });

      // THEN the shadow root should be accessible
      expect(documentElement.shadowRoot).toBe(shadowRoot);

      // AND the shadow root should reference its host
      // The shadowRoot is guaranteed to exist here because we just attached it
      expect(shadowRoot.host).toBe(documentElement);
    });

    it("should not allow attaching multiple shadow roots", () => {
      // GIVEN a document element with a shadow root
      const { documentElement } = getTestEnvironment();
      documentElement.attachShadow({ mode: "open" });

      // WHEN trying to attach another shadow root
      // THEN it should throw an error
      expect(() => {
        documentElement.attachShadow({ mode: "open" });
      }).toThrow();
    });
  });

  describe("Shadow Content Management", () => {
    it("should allow setting shadow root content via innerHTML", () => {
      // GIVEN a document element with a shadow root
      const { documentElement } = getTestEnvironment();
      const shadowRoot = documentElement.attachShadow({ mode: "open" });

      // WHEN setting innerHTML
      shadowRoot.innerHTML = '<div class="js-shadowChild">content</div>';

      // THEN the content should be set correctly
      expect(shadowRoot.innerHTML).toBe(
        '<div class="js-shadowChild">content</div>'
      );
    });
  });
});
