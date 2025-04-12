import { InSpatialDOM, DOMParser } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for attribute manipulation
// Using TDD principles to ensure comprehensive test coverage

describe("Attribute Manipulation", () => {
  it("should clone attribute node correctly", () => {
    const { document } = InSpatialDOM("<html test />");
    const attr = document.documentElement?.getAttributeNode("test");
    assert(attr !== null);
    if (attr) {
      assert(JSON.stringify(attr.cloneNode()) === '[2,"test"]');
    }
  });

  it("should update attribute value correctly", () => {
    const { document } = InSpatialDOM("<html test />");
    const attr = document.documentElement?.getAttributeNode("test");
    if (attr) {
      attr.value = "456";
      assert(JSON.stringify(attr.cloneNode()), '[2,"test","456"]');
    }
  });

  it("should handle attributes collection correctly", () => {
    const { document } = InSpatialDOM("<html test />");
    const { attributes } = document.documentElement || {};
    assert(attributes?.length === 1);
    const attr = document.documentElement?.getAttributeNode("test");
    assert(attributes?.item(0) === attr);
    assert(attributes?.getNamedItem("test") === attr);
    attributes?.removeNamedItem("test");
    assert(attributes?.item(0) === null);
    if (attr) {
      attributes?.setNamedItem(attr);
      assert(attributes?.item(0) === attr);
    }
  });

  it("should parse XML correctly", () => {
    /** @type {(str: string) => Document} */
    const parseXML = (xmlStr: string) =>
      new DOMParser().parseFromString(xmlStr, "text/xml");
    const xmlDoc = parseXML('<element attr="a&quot;b&quot;c"></element>');
    assert(
      xmlDoc.toString() ===
        '<?xml version="1.0" encoding="utf-8"?><element attr="a&quot;b&quot;c" />'
    );
    assert(
      xmlDoc.firstElementChild?.toString() ===
        '<element attr="a&quot;b&quot;c" />'
    );
    assert(
      xmlDoc.firstElementChild?.outerHTML ===
        '<element attr="a&quot;b&quot;c" />'
    );
    assert(
      xmlDoc.firstElementChild?.attributes.getNamedItem("attr")?.value ===
        'a"b"c'
    );
  });
});
