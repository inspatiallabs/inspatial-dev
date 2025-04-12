/**
 * Document Type Tests
 *
 * These tests verify the behavior of the DocumentType implementation
 * following the DOM standard specifications.
 */

import { parseHTML } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("DocumentType", () => {
  describe("Basic properties", () => {
    it("should have the correct nodeType", () => {
      const { document } = parseHTML("<!doctype html>");
      const doctype = document.childNodes[0];

      expect(doctype.nodeType).toBe(10); // DOCUMENT_TYPE_NODE value is 10
    });

    it("should serialize to JSON correctly", () => {
      const { document } = parseHTML("<!doctype html>");
      const doctype = document.childNodes[0];

      expect(JSON.stringify(doctype.cloneNode())).toBe('[10,"html"]');
    });
  });

  describe("Document type variations", () => {
    it("should parse a simple doctype", () => {
      const { document } = parseHTML("<!DOCTYPE html>");
      const doctype = document.childNodes[0];

      expect(doctype.name).toBe("html");
      expect(doctype.publicId).toBe("");
      expect(doctype.systemId).toBe("");
      expect(doctype.toString()).toBe("<!DOCTYPE html>");
    });

    it("should parse a doctype with public identifier", () => {
      const { document } = parseHTML(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">'
      );
      const doctype = document.childNodes[0];

      expect(doctype.name).toBe("html");
      expect(doctype.publicId).toBe("-//W3C//DTD HTML 4.01//EN");
      expect(doctype.systemId).toBe("");
      expect(doctype.toString()).toBe(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">'
      );
    });

    it("should parse a doctype with public and system identifiers", () => {
      const { document } = parseHTML(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
      );
      const doctype = document.childNodes[0];

      expect(doctype.name).toBe("html");
      expect(doctype.publicId).toBe("-//W3C//DTD HTML 4.01//EN");
      expect(doctype.systemId).toBe("http://www.w3.org/TR/html4/strict.dtd");
      expect(doctype.toString()).toBe(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
      );
    });

    it("should parse a doctype with only system identifier", () => {
      const { document } = parseHTML(
        '<!DOCTYPE html SYSTEM "http://www.w3.org/TR/html4/strict.dtd">'
      );
      const doctype = document.childNodes[0];

      expect(doctype.name).toBe("html");
      expect(doctype.publicId).toBe("");
      expect(doctype.systemId).toBe("http://www.w3.org/TR/html4/strict.dtd");
      expect(doctype.toString()).toBe(
        '<!DOCTYPE html SYSTEM "http://www.w3.org/TR/html4/strict.dtd">'
      );
    });
  });

  describe("DocumentType Node operations", () => {
    it("should clone correctly", () => {
      const { document } = parseHTML(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
      );
      const original = document.childNodes[0];
      const clone = original.cloneNode();

      expect(clone.nodeType).toBe(original.nodeType);
      expect(clone.name).toBe(original.name);
      expect(clone.publicId).toBe(original.publicId);
      expect(clone.systemId).toBe(original.systemId);
      expect(clone.toString()).toBe(original.toString());
    });

    it("should have the correct ownership", () => {
      const { document } = parseHTML("<!DOCTYPE html>");
      const doctype = document.childNodes[0];

      expect(doctype.ownerDocument).toBe(document);
    });
  });
});
