/**
 * TreeWalker Tests
 *
 * These tests verify the behavior of the TreeWalker and NodeIterator implementations
 * for traversing DOM trees according to specific filtering options.
 */

// @ts-ignore - Ignoring TS extension import error
import { InSpatialDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("TreeWalker", () => {
  // Setup for tests
  const setupTestEnvironment = () => {
    const { document } = InSpatialDOM("<html><p>b</p><p>c</p><p>d</p></html>");

    // Ensure documentElement exists before proceeding
    if (!document.documentElement) {
      throw new Error("Document element is null");
    }

    const node = document.createDocumentFragment();
    node.append(...document.documentElement.childNodes);
    return { document, node };
  };

  describe("Basic traversal", () => {
    it("should traverse all nodes in correct order", () => {
      // GIVEN a document fragment with several paragraph nodes
      const { document, node } = setupTestEnvironment();

      // WHEN creating a tree walker and navigating through nodes
      const treeWalker = document.createTreeWalker(node);

      // THEN it should visit nodes in the expected order
      expect(treeWalker.nextNode()).toBe(node.childNodes[0]);
      expect(treeWalker.nextNode()).toBe(node.childNodes[0].childNodes[0]);
      expect(treeWalker.nextNode()).toBe(node.childNodes[1]);
      expect(treeWalker.nextNode()).toBe(node.childNodes[1].childNodes[0]);
      expect(treeWalker.nextNode()).toBe(node.childNodes[2]);
      expect(treeWalker.nextNode()).toBe(node.childNodes[2].childNodes[0]);
      expect(treeWalker.nextNode()).toBeNull();
    });

    it("should not traverse CDATA sections when not requested", () => {
      // GIVEN a document fragment
      const { document, node } = setupTestEnvironment();

      // WHEN creating a tree walker that only looks for CDATA sections
      const treeWalker = document.createTreeWalker(node, 8); // NodeFilter.SHOW_CDATA_SECTION = 8

      // THEN it should not find any nodes initially
      expect(treeWalker.nextNode()).toBeNull();
    });

    it("should not traverse comment nodes when not requested", () => {
      // GIVEN a document fragment
      const { document, node } = setupTestEnvironment();

      // WHEN creating a tree walker that only looks for comment nodes
      const treeWalker = document.createTreeWalker(node, 128); // NodeFilter.SHOW_COMMENT = 128

      // THEN it should not find any nodes initially
      expect(treeWalker.nextNode()).toBeNull();
    });
  });

  describe("NodeIterator", () => {
    it("should traverse only element nodes when configured", () => {
      // GIVEN a document fragment with several paragraph nodes
      const { document, node } = setupTestEnvironment();

      // WHEN creating a node iterator for element nodes only
      const nodeIterator = document.createNodeIterator(node, 1); // NodeFilter.SHOW_ELEMENT = 1

      // THEN it should only visit element nodes
      expect(nodeIterator.nextNode()).toBe(node.childNodes[0]);
      expect(nodeIterator.nextNode()).toBe(node.childNodes[1]);
      expect(nodeIterator.nextNode()).toBe(node.childNodes[2]);
      expect(nodeIterator.nextNode()).toBeNull();
    });
  });

  describe("Specific node type traversal", () => {
    it("should traverse comment nodes when requested", () => {
      // GIVEN a document fragment with a comment node
      const { document, node } = setupTestEnvironment();
      node.appendChild(document.createComment("ok"));

      // WHEN creating a tree walker that looks for comment nodes
      const treeWalker = document.createTreeWalker(node, 128); // NodeFilter.SHOW_COMMENT = 128

      // THEN it should find the comment node
      expect(treeWalker.nextNode()).toBe(node.lastChild);
      expect(treeWalker.nextNode()).toBeNull();
    });

    it("should traverse CDATA sections when requested", () => {
      // GIVEN a document fragment with a CDATA section
      const { document, node } = setupTestEnvironment();
      node.appendChild(document.createCDATASection("ok"));

      // WHEN creating a tree walker that looks for CDATA sections
      const treeWalker = document.createTreeWalker(node, 8); // NodeFilter.SHOW_CDATA_SECTION = 8

      // THEN it should find the CDATA section
      expect(treeWalker.nextNode()).toBe(node.lastChild);
      expect(treeWalker.nextNode()).toBeNull();
    });
  });

  describe("Document traversal", () => {
    it("should traverse from document root", () => {
      // GIVEN a document
      const { document } = setupTestEnvironment();

      // WHEN creating a tree walker for the document
      const treeWalker = document.createTreeWalker(document);

      // THEN it should start at the document element
      if (!document.documentElement) {
        throw new Error("Document element is null");
      }
      expect(treeWalker.nextNode()).toBe(document.documentElement);
    });
  });

  describe("Node relationships", () => {
    it("should correctly report sibling relationships", () => {
      // GIVEN a document fragment with multiple nodes
      const { document, node } = setupTestEnvironment();

      // THEN sibling relationships should be correctly reported
      expect(node.childNodes[1].previousSibling).toBe(node.childNodes[0]);
      expect(node.childNodes[0].previousSibling).toBeNull();
    });
  });

  describe("Dynamic DOM changes", () => {
    it("should handle changes to the DOM during traversal", () => {
      // GIVEN a document fragment with a paragraph
      const { document, node } = setupTestEnvironment();
      node.replaceChildren();
      const p = node.appendChild(document.createElement("p"));
      p.setAttribute("ghost", "");
      p.textContent = "ok";

      // WHEN creating a tree walker starting from a text node
      const textNode = p.firstChild;
      if (!textNode) {
        throw new Error("Text node is null");
      }
      const textTreeWalker = document.createTreeWalker(textNode);

      // THEN it should not find any next nodes
      expect(textTreeWalker.nextNode()).toBeNull();

      // WHEN creating a tree walker for the fragment
      const fragmentTreeWalker = document.createTreeWalker(node);

      // THEN it should find the paragraph
      expect(fragmentTreeWalker.nextNode()).toBe(p);

      // WHEN modifying the DOM during traversal
      p.removeAttribute("ghost");

      // THEN it should continue traversal with the updated DOM
      expect(fragmentTreeWalker.nextNode()).toBe(p.firstChild);
      expect(fragmentTreeWalker.nextNode()).toBeNull();
    });
  });
});
