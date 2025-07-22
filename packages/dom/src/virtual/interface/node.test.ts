/**
 * Node Interface Tests
 *
 * These tests verify the behavior of the Node interface
 * including node type constants and document position comparison.
 */

// @ts-ignore - Ignoring TS extension import error
import { createVirtualDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("Node", () => {
  // Common setup for all tests
  const { NodeFilter } = createVirtualDOM("");
  const { document } = createVirtualDOM("<html><head /><body><div /></body></html>");
  const [head, body, div] = document.querySelectorAll("head,body,div");

  describe("Node comparison", () => {
    it("should correctly compare document positions", () => {
      // Same node comparison
      expect(body.compareDocumentPosition(body)).toBe(0);

      // Parent/child comparisons
      expect(body.compareDocumentPosition(div)).toBe(20); // Contains + Following
      expect(div.compareDocumentPosition(body)).toBe(10); // Contains + Preceding

      // Sibling comparisons
      expect(body.compareDocumentPosition(head)).toBe(2); // Preceding
      expect(head.compareDocumentPosition(body)).toBe(4); // Following

      // Cross-tree comparisons
      expect(div.compareDocumentPosition(head)).toBe(2); // Preceding
      expect(head.compareDocumentPosition(div)).toBe(4); // Following

      // Disconnected node comparisons
      expect(head.compareDocumentPosition(document.createElement("nope"))).toBe(
        35
      ); // Disconnected + Implementation specific
      expect(document.createElement("nope").compareDocumentPosition(head)).toBe(
        37
      ); // Disconnected + Implementation specific
    });
  });

  describe("Node type constants", () => {
    it("should define correct node type constants as properties", () => {
      expect(body.ELEMENT_NODE).toBe(1);
      expect(body.ATTRIBUTE_NODE).toBe(2);
      expect(body.TEXT_NODE).toBe(3);
      expect(body.CDATA_SECTION_NODE).toBe(4);
      expect(body.COMMENT_NODE).toBe(8);
      expect(body.DOCUMENT_NODE).toBe(9);
      expect(body.DOCUMENT_TYPE_NODE).toBe(10);
      expect(body.DOCUMENT_FRAGMENT_NODE).toBe(11);
    });

    it("should define the same constants on the constructor", () => {
      expect(body.ELEMENT_NODE).toBe(body.constructor.ELEMENT_NODE);
      expect(body.ATTRIBUTE_NODE).toBe(body.constructor.ATTRIBUTE_NODE);
      expect(body.TEXT_NODE).toBe(body.constructor.TEXT_NODE);
      expect(body.CDATA_SECTION_NODE).toBe(body.constructor.CDATA_SECTION_NODE);
      expect(body.COMMENT_NODE).toBe(body.constructor.COMMENT_NODE);
      expect(body.DOCUMENT_NODE).toBe(body.constructor.DOCUMENT_NODE);
      expect(body.DOCUMENT_TYPE_NODE).toBe(body.constructor.DOCUMENT_TYPE_NODE);
      expect(body.DOCUMENT_FRAGMENT_NODE).toBe(
        body.constructor.DOCUMENT_FRAGMENT_NODE
      );
    });
  });

  describe("NodeFilter constants", () => {
    it("should define correct filter constants", () => {
      expect(NodeFilter.SHOW_ALL).toBe(-1);
      expect(NodeFilter.SHOW_ELEMENT).toBe(1);
      expect(NodeFilter.SHOW_TEXT).toBe(4);
      expect(NodeFilter.SHOW_CDATA_SECTION).toBe(8);
      expect(NodeFilter.SHOW_COMMENT).toBe(128);
    });
  });
});
