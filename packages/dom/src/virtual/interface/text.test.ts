/**
 * Text Node Tests
 *
 * These tests verify the behavior of the Text node implementation
 * including node properties, manipulation, and DOM relationships.
 */

// @ts-ignore - Ignoring TS extension import error
import { createVirtualDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("Text Node", () => {
  // Setup common test environment
  const setupTest = () => {
    const { document } = createVirtualDOM("<html><div></div></html>");
    const node = document.querySelector("div");
    if (!node) throw new Error("Test setup failed: div not found");

    const text = document.createTextNode("text");
    return { document, node, text };
  };

  describe("Text node manipulation", () => {
    it("should handle before() and after() methods properly", () => {
      const { document, node, text } = setupTest();

      // Setup test environment
      node.innerHTML = "<p></p>";
      if (!document.documentElement) throw new Error("documentElement is null");
      document.documentElement.appendChild(node);

      const firstChild = node.firstChild;
      if (!firstChild) throw new Error("firstChild is null");

      text.before(firstChild);
      text.after(firstChild);

      // Verify before/after don't affect unconnected nodes
      expect(node.toString()).toBe("<div><p></p></div>");
    });

    it("should handle textContent with special characters", () => {
      const { node } = setupTest();

      node.innerHTML = "<p></p>";
      if (!node.firstChild)
        throw new Error("Test setup failed: firstChild is null");

      // Set text with HTML characters
      node.firstChild.textContent = "<test>";
      expect(node.toString()).toBe("<div><p>&lt;test&gt;</p></div>");
    });

    it("should clear node content when textContent is set to empty string", () => {
      const { node } = setupTest();

      node.innerHTML = "<p>content</p>";
      if (!node.firstChild)
        throw new Error("Test setup failed: firstChild is null");

      // Clear content
      node.firstChild.textContent = "";

      expect(node.firstChild.childNodes.length).toBe(0);
      expect(node.firstChild.firstChild).toBeNull();
      expect(node.firstChild.textContent).toBe("");
      expect(node.toString()).toBe("<div><p></p></div>");
    });

    it("should handle numeric textContent correctly", () => {
      const { node } = setupTest();

      node.innerHTML = "<p></p>";
      if (!node.firstChild)
        throw new Error("Test setup failed: firstChild is null");

      // Set text to number
      node.firstChild.textContent = "0";

      expect(node.firstChild.firstChild?.nodeValue).toBe("0");
      expect(node.toString()).toBe("<div><p>0</p></div>");
    });

    it("should clear node content when textContent is set to null or undefined", () => {
      const { node } = setupTest();

      node.innerHTML = "<p>content</p>";
      if (!node.firstChild)
        throw new Error("Test setup failed: firstChild is null");

      // Test null
      node.firstChild.textContent = null;
      expect(node.firstChild.firstChild).toBeNull();
      expect(node.toString()).toBe("<div><p></p></div>");

      // Test empty string
      node.firstChild.textContent = "";
      expect(node.firstChild.childNodes.length).toBe(0);
      expect(node.firstChild.firstChild).toBeNull();
      expect(node.firstChild.textContent).toBe("");

      // Test undefined
      node.firstChild.textContent = undefined;
      expect(node.firstChild.firstChild).toBeNull();
      expect(node.toString()).toBe("<div><p></p></div>");
    });
  });

  describe("Text node relationships", () => {
    it("should report correct connection status", () => {
      const { document, node, text } = setupTest();

      // Initially text node is not connected
      expect(text.isConnected).toBe(false);
      expect(text.parentElement).toBeNull();
      expect(node.contains(text)).toBe(false);

      // When appended to a node
      node.innerHTML = "<p></p>";
      const firstChild = node.firstChild;
      if (!firstChild)
        throw new Error("firstChild is null after setting innerHTML");

      firstChild.appendChild(text);

      expect(text.getRootNode()).toBe(document);
      expect(node.contains(text)).toBe(true);
      expect(text.isConnected).toBe(true);
      expect(text.parentElement).toBe(firstChild);
      expect(node.toString()).toBe("<div><p>text</p></div>");
    });

    it("should handle replaceWith() correctly", () => {
      const { document, node, text } = setupTest();

      // Setup
      node.innerHTML = "<p></p>";
      const firstChild = node.firstChild;
      if (!firstChild)
        throw new Error("firstChild is null after setting innerHTML");

      firstChild.appendChild(text);

      // Replace with comment
      text.replaceWith(document.createComment("comment"));

      expect(text.isConnected).toBe(false);
      expect(node.toString()).toBe("<div><p><!--comment--></p></div>");
    });
  });

  describe("Node properties and methods", () => {
    it("should support closest() method", () => {
      const { node } = setupTest();

      node.innerHTML = "<p>content</p>";
      if (!node.firstChild)
        throw new Error("Test setup failed: firstChild is null");

      expect(node.firstChild.closest("p")).toBe(node.firstChild);
      expect(node.firstChild.closest(":scope")).toBe(node.firstChild);
      expect(node.firstChild.closest("nope")).toBeNull();
    });

    it("should support node equality methods", () => {
      const { node, text } = setupTest();

      node.innerHTML = "<p><!--comment--></p>";
      if (!node.firstChild) throw new Error("firstChild is null");
      if (!node.firstChild.firstChild) throw new Error("comment node is null");

      // Test isEqualNode
      expect(node.firstChild.firstChild.isEqualNode(text)).toBe(false);
      expect(
        node.firstChild.firstChild.isEqualNode(
          node.firstChild.firstChild.cloneNode(true)
        )
      ).toBe(true);

      // Remove child and test node equality
      node.firstChild.removeChild(node.firstChild.firstChild);
      expect(node.isEqualNode(node.cloneNode(true))).toBe(true);
      expect(node.toString()).toBe("<div><p></p></div>");

      // Test text node equality
      expect(text.isEqualNode(text.cloneNode(true))).toBe(true);
      expect(text.isSameNode(text)).toBe(true);
    });

    it("should have correct node value and data properties", () => {
      const { text } = setupTest();

      expect(text.nodeValue).toBe(text.textContent);
      expect(text.data).toBe(text.textContent);
    });

    it("should report correct sibling relationships", () => {
      const { text } = setupTest();

      expect(text.firstChild).toBeNull();
      expect(text.lastChild).toBeNull();
      expect(text.nextSibling).toBeNull();
      expect(text.previousSibling).toBeNull();
      expect(text.nextElementSibling).toBeNull();
      expect(text.previousElementSibling).toBeNull();
    });

    it("should report correct child relationships", () => {
      const { node, text } = setupTest();

      text.normalize();
      expect(node.hasChildNodes()).toBe(true);
      expect(text.hasChildNodes()).toBe(false);
      expect(text.getRootNode()).toBe(text);
    });
  });

  describe("DocumentElement operations", () => {
    it("should handle insertBefore correctly", () => {
      const { document, text } = setupTest();

      if (!document.documentElement) throw new Error("documentElement is null");
      expect(document.documentElement.parentElement).toBeNull();

      document.documentElement.insertBefore(text, null);
      expect(document.documentElement.lastChild).toBe(text);
    });

    it("should handle DocumentFragment operations", () => {
      const { document, text } = setupTest();

      if (!document.documentElement) throw new Error("documentElement is null");

      const fragment = document.createDocumentFragment();

      // Use text nodes directly rather than creating from strings
      const textA = document.createTextNode("a");
      const textB = document.createTextNode("b");
      const textC = document.createTextNode("c");

      fragment.appendChild(textA);
      fragment.appendChild(textB);
      fragment.appendChild(textC);

      // Add a type assertion to handle the typing issue
      expect(fragment.firstChild?.nextElementSibling).toBeNull();

      // Use a different approach to test insertBefore
      if (document.documentElement.firstChild) {
        // Insert before an existing child
        const result = document.documentElement.insertBefore(
          fragment,
          document.documentElement.firstChild
        );
        expect(result).toBe(fragment);
      } else {
        // Just append if no children
        const result = document.documentElement.appendChild(fragment);
        expect(result).toBe(fragment);
      }

      // Create new text nodes for appending
      const textD = document.createTextNode("a");
      const textE = document.createTextNode("");

      fragment.appendChild(textD);
      fragment.appendChild(textE);
      fragment.normalize();

      expect(fragment.childNodes.length).toBe(1);
    });
  });

  describe("Text node value", () => {
    it("should handle nodeValue updates", () => {
      const { text } = setupTest();

      expect(text.nodeValue).toBe("text");

      text.nodeValue = "";
      expect(text.nodeValue).toBe("");

      text.nodeValue = "0";
      expect(text.nodeValue).toBe("0");

      text.nodeValue = "";
      expect(text.nodeValue).toBe("");
    });
  });
});
