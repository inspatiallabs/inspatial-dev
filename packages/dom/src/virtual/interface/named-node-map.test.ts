/**
 * NamedNodeMap Tests
 *
 * These tests verify the behavior of the NamedNodeMap interface that
 * provides attribute access to DOM elements.
 */

// @ts-ignore - Ignoring TS extension import error
import { createVirtualDOM } from "../index.ts";
// @ts-ignore - Ignoring TS extension import error
import { NamedNodeMap } from "../interface/named-node-map.ts";
import { describe, it, expect } from "@inspatial/test";

describe("NamedNodeMap", () => {
  // Common setup for all tests
  const setupTest = () => {
    const { document } = createVirtualDOM("<html><div tmp>abc</div></html>");

    if (!document.documentElement) {
      throw new Error("documentElement is null");
    }

    const node = document.documentElement.firstElementChild;
    if (!node) {
      throw new Error("firstElementChild is null");
    }

    return { document, node };
  };

  describe("Attribute handling", () => {
    it("should be exported and available", () => {
      // GIVEN the DOM API
      const { node } = setupTest();

      // THEN NamedNodeMap should be defined and available
      expect(typeof NamedNodeMap).not.toBe("undefined");
      expect(node.attributes).toBeInstanceOf(NamedNodeMap);
    });

    it("should handle standard attributes correctly", () => {
      // GIVEN an element
      const { node } = setupTest();

      // WHEN setting an id attribute
      node.id = "test";

      // THEN the attribute should be accessible as a property and via attributes collection
      expect(node.hasAttribute("id")).toBe(true);
      expect(node.id).toBe("test");
      expect(node.attributes.id.value).toBe("test");
    });

    it("should handle className attribute properly", () => {
      // GIVEN an element
      const { node } = setupTest();

      // WHEN setting the className property
      node.className = " a b ";

      // THEN the className should be normalized and accessible
      expect(node.className).toBe("a b");
      expect(node.attributes.class.value).toBe("a b");

      // WHEN setting className to null or non-string values
      node.className = null;
      expect(node.className).toBe("null");

      node.className = undefined;
      expect(node.className).toBe("undefined");

      node.className = 123;
      expect(node.className).toBe("123");

      // Reset for later tests
      node.className = " a b ";
    });

    it("should provide attribute collection access methods", () => {
      // GIVEN an element with attributes
      const { node } = setupTest();
      node.id = "test";
      node.className = "a b";

      // THEN the attributes should be accessible through the attributes collection
      expect(node.attributes.length).toBe(3); // id, class, tmp

      // WHEN removing an attribute
      node.removeAttribute("tmp");

      // THEN the attributes collection should be updated
      expect(node.attributes.length).toBe(2); // id, class

      // THEN attribute nodes should be accessible by name
      expect(node.getAttributeNode("id")).toBe(node.attributes.id);
      expect(node.getAttributeNode("nope")).toBeNull();
      expect(node.attributes.nope).toBeUndefined();
    });
  });

  describe("Attribute nodes", () => {
    it("should provide attribute node manipulation methods", () => {
      // GIVEN an element with attributes
      const { node } = setupTest();
      node.className = "a b";
      node.id = "test";

      // THEN attribute nodes should be accessible from attributes collection
      const { class: klass } = node.attributes;

      // THEN attributes collection properties should work
      expect(node.hasAttributes()).toBe(true);
      expect(node.getAttributeNames().sort().join(",")).toBe("class,id,tmp");

      // WHEN removing all attributes
      node.removeAttribute("id");
      node.removeAttribute("tmp");
      node.removeAttribute("class");

      // THEN the element should not have attributes
      expect(node.hasAttributes()).toBe(false);
      expect(node.hasAttribute("class")).toBe(false);
      expect(node.className).toBe("");

      // WHEN setting an attribute node
      node.setAttributeNode(klass);

      // THEN the attribute should be accessible
      expect(node.className).toBe("a b");

      // WHEN replacing the attribute node
      const newClass = node.ownerDocument.createAttribute("class");
      newClass.value = "b c";
      node.setAttributeNode(newClass);

      // THEN the attribute value should be updated
      expect(node.className).toBe("b c");
    });

    it("should provide attribute node properties", () => {
      // GIVEN an element with a class attribute
      const { node } = setupTest();
      node.className = "a b";
      const { class: klass } = node.attributes;

      // THEN the attribute node should behave like a proper node
      expect(klass.isEqualNode(klass.cloneNode(true))).toBe(true);
      expect(klass.firstChild).toBeNull();
      expect(klass.lastChild).toBeNull();
      expect(klass.previousSibling).toBeNull();
      expect(klass.nextSibling).toBeNull();
      expect(klass.previousElementSibling).toBeNull();
      expect(klass.nextElementSibling).toBeNull();
    });
  });

  describe("Element attribute operations", () => {
    it("should support toggling attributes", () => {
      // GIVEN an element
      const { node } = setupTest();
      node.className = "b c";

      // WHEN toggling a non-existent attribute
      node.toggleAttribute("disabled");

      // THEN the attribute should be added
      expect(node.toString()).toBe('<div disabled class="b c">abc</div>');

      // WHEN toggling an attribute with force=true
      node.toggleAttribute("disabled", true);

      // THEN the attribute should remain
      expect(node.toString()).toBe('<div disabled class="b c">abc</div>');

      // WHEN toggling an attribute with force=false
      node.toggleAttribute("disabled", false);

      // THEN the attribute should be removed
      expect(node.toString()).toBe('<div class="b c">abc</div>');

      // Double-check the toggling behavior
      node.toggleAttribute("disabled", false); // Should remain off
      node.toggleAttribute("disabled", true); // Should turn on
      expect(node.toString()).toBe('<div disabled class="b c">abc</div>');
    });

    it("should support attribute selectors", () => {
      // GIVEN an element with attributes
      const { node } = setupTest();
      node.className = "b c";
      node.toggleAttribute("disabled", true);

      // THEN element.matches should work with attribute selectors
      expect(node.matches("[disabled]")).toBe(true);
      expect(node.matches(":scope[disabled]")).toBe(true);
      expect(node.matches("[nonexistent]")).toBe(false);
    });
  });

  describe("DOM operations related to attributes", () => {
    it("should support getElementsByClassName", () => {
      // GIVEN an element with a class attribute
      const { document, node } = setupTest();
      node.className = "b c";

      // THEN getElementsByClassName should find the element
      expect(document.getElementsByClassName("b")[0]).toBe(node);
    });

    it("should handle attributes with outerHTML replacement", () => {
      // GIVEN an element in the DOM
      const { document, node } = setupTest();
      node.className = "b c";

      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      // Record the position of the element
      const index = document.documentElement.childNodes.indexOf(node);

      // WHEN replacing the element with outerHTML
      node.outerHTML = '<p id="outer-html"></p>';

      // THEN the node should be removed from the DOM
      expect(document.documentElement.childNodes.indexOf(node)).toBe(-1);

      // AND a new node should be in its place
      const newNode = document.getElementById("outer-html");
      expect(newNode).toBe(document.documentElement.childNodes[index]);
    });

    it("should support moving attribute nodes between elements", () => {
      // GIVEN an element with a class attribute
      const { document, node } = setupTest();
      node.className = "b c";
      const klass = node.getAttributeNode("class");

      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      // WHEN moving the attribute to another element
      document.documentElement.setAttributeNode(klass);

      // THEN the attribute should be moved
      expect(document.documentElement.className).toBe("b c");
    });
  });
});
