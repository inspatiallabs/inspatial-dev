/**
 * Document Fragment Tests
 *
 * These tests verify the behavior of the DocumentFragment implementation
 * following the DOM standard specifications.
 */

import { createVirtualDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("DocumentFragment", () => {
  // Setup
  const { document } = createVirtualDOM("");

  describe("Node manipulation", () => {
    it("should throw when trying to append a node to itself", () => {
      const fragment = document.createDocumentFragment();

      expect(() => {
        fragment.appendChild(fragment);
      }).toThrow();
    });

    it("should throw when trying to remove a node from itself", () => {
      const fragment = document.createDocumentFragment();

      expect(() => {
        fragment.removeChild(fragment);
      }).toThrow();
    });
  });

  describe("Node properties", () => {
    it("should have no children initially", () => {
      const fragment = document.createDocumentFragment();

      expect(fragment.firstChild).toBeNull();
      expect(fragment.lastChild).toBeNull();
      expect(fragment.getElementById("any")).toBeNull();
      expect(fragment.querySelector('div[id="any"]')).toBeNull();
      expect(fragment.querySelectorAll('div[id="any"]').item(0)).toBeNull();
      expect(fragment.children.length).toBe(0);
      expect(fragment.childElementCount).toBe(0);
    });

    it("should track children correctly after modifications", () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement("div");
      div.id = "any";

      fragment.appendChild(div);

      expect(fragment.isEqualNode(fragment.cloneNode(true))).toBe(true);
      expect(fragment.isEqualNode({} as any)).toBe(false);
      expect(fragment.querySelector('div[id="any"]')).toBe(
        fragment.firstElementChild
      );
      expect(fragment.querySelectorAll('div[id="any"]').length).toBe(1);
      expect(fragment.querySelectorAll('div[id="any"]').item(0)).toBe(
        fragment.firstElementChild
      );
      expect(fragment.getElementById("any")).toBe(fragment.firstElementChild);
      expect(fragment.childElementCount).toBe(1);
      expect(fragment.children.length).toBe(1);
      expect(fragment.firstElementChild).toBe(fragment.lastElementChild);
    });
  });

  describe("DOM manipulation methods", () => {
    it("should correctly implement prepend and append", () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement("div");
      div.id = "any";

      fragment.appendChild(div);
      fragment.prepend("a");
      fragment.append("b");

      expect(fragment.toString()).toBe(
        '<#document-fragment>a<div id="any"></div>b</#document-fragment>'
      );
    });

    it("should correctly implement replaceChildren", () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement("div");
      div.id = "any";

      fragment.appendChild(div);
      fragment.replaceChildren("c", "d");

      expect(fragment.toString()).toBe(
        "<#document-fragment>cd</#document-fragment>"
      );
    });

    it("should correctly implement normalize", () => {
      const fragment = document.createDocumentFragment();

      fragment.replaceChildren("c", "d");
      fragment.normalize();

      expect(fragment.childNodes.length).toBe(1);
    });

    it("should correctly implement replaceChild", () => {
      const fragment = document.createDocumentFragment();

      fragment.replaceChildren("c", "d");
      fragment.normalize();
      fragment.replaceChild(
        document.createElement("input"),
        fragment.firstChild
      );

      expect(fragment.toString()).toBe(
        "<#document-fragment><input></#document-fragment>"
      );
    });
  });
});
