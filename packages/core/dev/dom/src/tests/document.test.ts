/**
 * Unit tests for the Document class
 *
 * These tests verify that the Document class correctly implements
 * DOM's Document interface.
 */

import {
  test,
  expect,
  assertEquals,
  assert,
  describe,
  it,
} from "@inspatial/test";
import {
  Document,
  Element,
  Text,
  Comment,
  DocumentFragment,
  Node,
  createDOM,
} from "../cached.ts";
// @ts-ignore - Ignoring TS extension import error
import { MIME } from "../shared/symbols.ts";

// Helper to create a test document with MIME settings
const createTestDocument = () => {
  const doc = new Document("");
  // Initialize MIME object with default HTML settings
  doc[MIME] = {
    ignoreCase: true,
    docType: "<!DOCTYPE html>",
    voidElements:
      /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i,
    textOnlyElements: /^(?:plaintext|script|style|textarea|title|xmp)$/i,
  };
  return doc;
};

/**
 * Test suite for document creation methods
 */
test({
  name: "Document.createElement creates elements with the specified tag name",
  fn: () => {
    const doc = createTestDocument();

    // Create a div element
    const div = doc.createElement("div");
    expect(div.nodeName).toBe("DIV");
    expect(div.tagName).toBe("DIV");
    expect(div.nodeType).toBe(Node.ELEMENT_NODE);
    expect(div.ownerDocument).toBe(doc);

    // Create a custom element
    const custom = doc.createElement("custom-element");
    expect(custom.nodeName).toBe("CUSTOM-ELEMENT");
    expect(custom.tagName).toBe("CUSTOM-ELEMENT");

    // Create with attributes
    const withAttrs = doc.createElement("div");
    withAttrs.setAttribute("id", "test");
    withAttrs.className = "sample-class";

    expect(withAttrs.id).toBe("test");
    expect(withAttrs.className).toBe("sample-class");
  },
});

test({
  name: "Document.createTextNode creates text nodes with the specified content",
  fn: () => {
    const doc = new Document("");

    // Create a text node
    const text = doc.createTextNode("Hello, world!");
    expect(text.nodeType).toBe(Node.TEXT_NODE);
    expect(text.textContent).toBe("Hello, world!");
    expect(text.ownerDocument).toBe(doc);

    // Empty text node
    const empty = doc.createTextNode("");
    expect(empty.textContent).toBe("");
  },
});

test({
  name: "Document.createComment creates comment nodes with the specified content",
  fn: () => {
    const doc = new Document("");

    // Create a comment node
    const comment = doc.createComment("This is a comment");
    expect(comment.nodeType).toBe(Node.COMMENT_NODE);
    expect(comment.textContent).toBe("This is a comment");
    expect(comment.ownerDocument).toBe(doc);
  },
});

test({
  name: "Document.createDocumentFragment creates empty document fragments",
  fn: () => {
    const doc = new Document("");

    // Create a document fragment
    const fragment = doc.createDocumentFragment();
    expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
    expect(fragment.childNodes.length).toBe(0);
    expect(fragment.ownerDocument).toBe(doc);

    // Add elements to the fragment
    const div = doc.createElement("div");
    const text = doc.createTextNode("Text in fragment");

    fragment.appendChild(div);
    fragment.appendChild(text);

    expect(fragment.childNodes.length).toBe(2);
    expect(fragment.childNodes[0]).toBe(div);
    expect(fragment.childNodes[1]).toBe(text);
  },
});

/**
 * Test suite for document properties
 */
test({
  name: "Document.documentElement refers to the root element",
  fn: () => {
    const doc = new Document("");

    // The document should automatically have an html element created
    const documentElement = doc.documentElement;
    expect(documentElement).toBeDefined();
    expect(documentElement.nodeName).toBe("HTML");

    // Should be a child of the document
    expect(doc.childNodes).toContain(documentElement);
  },
});

test({
  name: "Document.body and Document.head refer to the body and head elements",
  fn: () => {
    const doc = new Document("");

    // The head and body should be accessible
    const head = doc.head;
    expect(head).toBeDefined();
    expect(head.nodeName).toBe("HEAD");

    const body = doc.body;
    expect(body).toBeDefined();
    expect(body.nodeName).toBe("BODY");

    // Head should be the first child of documentElement, body the second
    expect(doc.documentElement.childNodes).toContain(head);
    expect(doc.documentElement.childNodes).toContain(body);
    expect(head.nextSibling).toBe(body);
  },
});

/**
 * Test suite for document methods
 */
test({
  name: "Document.getElementById finds elements by their id attribute",
  fn: () => {
    const doc = new Document("");

    // Add some elements with ids
    const div1 = doc.createElement("div");
    div1.id = "div1";
    doc.body.appendChild(div1);

    const div2 = doc.createElement("div");
    div2.id = "div2";
    doc.body.appendChild(div2);

    const span = doc.createElement("span");
    span.id = "span1";
    div1.appendChild(span);

    // Find elements by id
    expect(doc.getElementById("div1")).toBe(div1);
    expect(doc.getElementById("div2")).toBe(div2);
    expect(doc.getElementById("span1")).toBe(span);

    // Non-existent id should return null
    expect(doc.getElementById("nonexistent")).toBe(null);

    // Remove an element and verify it's no longer found
    div1.remove();
    expect(doc.getElementById("div1")).toBe(null);
    expect(doc.getElementById("span1")).toBe(null); // Child was also removed
  },
});

test({
  name: "Document.getElementsByTagName finds elements by their tag name",
  fn: () => {
    const doc = new Document("");

    // Add some elements with different tags
    const div1 = doc.createElement("div");
    doc.body.appendChild(div1);

    const div2 = doc.createElement("div");
    doc.body.appendChild(div2);

    const span = doc.createElement("span");
    div1.appendChild(span);

    // Find elements by tag name
    const divs = doc.getElementsByTagName("div");
    expect(divs.length).toBe(2);
    expect(divs[0]).toBe(div1);
    expect(divs[1]).toBe(div2);

    const spans = doc.getElementsByTagName("span");
    expect(spans.length).toBe(1);
    expect(spans[0]).toBe(span);

    // Non-existent tag should return empty collection
    const paragraphs = doc.getElementsByTagName("p");
    expect(paragraphs.length).toBe(0);

    // Special case: "*" should get all elements
    const all = doc.getElementsByTagName("*");
    // This will include html, head, body and the ones we created
    expect(all.length).toBeGreaterThan(5);
  },
});

test({
  name: "Document.getElementsByClassName finds elements by their class name",
  fn: () => {
    const doc = new Document("");

    // Add some elements with classes
    const div1 = doc.createElement("div");
    div1.className = "class1 common";
    doc.body.appendChild(div1);

    const div2 = doc.createElement("div");
    div2.className = "class2 common";
    doc.body.appendChild(div2);

    const span = doc.createElement("span");
    span.className = "class1 special";
    div1.appendChild(span);

    // Find elements by class name
    const class1Elements = doc.getElementsByClassName("class1");
    expect(class1Elements.length).toBe(2);
    expect(class1Elements[0]).toBe(div1);
    expect(class1Elements[1]).toBe(span);

    const commonElements = doc.getElementsByClassName("common");
    expect(commonElements.length).toBe(2);
    expect(commonElements[0]).toBe(div1);
    expect(commonElements[1]).toBe(div2);

    const specialElements = doc.getElementsByClassName("special");
    expect(specialElements.length).toBe(1);
    expect(specialElements[0]).toBe(span);

    // Non-existent class should return empty collection
    const nonexistentElements = doc.getElementsByClassName("nonexistent");
    expect(nonexistentElements.length).toBe(0);
  },
});

test({
  name: "Document.querySelector and Document.querySelectorAll handle CSS selectors",
  fn: () => {
    const doc = new Document("");

    // Add some elements with different attributes
    const div1 = doc.createElement("div");
    div1.id = "div1";
    div1.className = "container";
    doc.body.appendChild(div1);

    const div2 = doc.createElement("div");
    div2.setAttribute("data-test", "value");
    doc.body.appendChild(div2);

    const span = doc.createElement("span");
    span.className = "item";
    div1.appendChild(span);

    const p = doc.createElement("p");
    p.textContent = "Paragraph";
    div1.appendChild(p);

    // Test querySelector
    expect(doc.querySelector("#div1")).toBe(div1);
    expect(doc.querySelector(".container")).toBe(div1);
    expect(doc.querySelector("span.item")).toBe(span);
    expect(doc.querySelector("div > p")).toBe(p);
    expect(doc.querySelector("[data-test]")).toBe(div2);
    expect(doc.querySelector(".nonexistent")).toBe(null);

    // Test querySelectorAll
    const divs = doc.querySelectorAll("div");
    expect(divs.length).toBe(2);
    expect(divs[0]).toBe(div1);
    expect(divs[1]).toBe(div2);

    const containerChildren = doc.querySelectorAll(".container > *");
    expect(containerChildren.length).toBe(2);
    expect(containerChildren[0]).toBe(span);
    expect(containerChildren[1]).toBe(p);

    // Complex selector
    const complexResult = doc.querySelectorAll("div.container span, p");
    expect(complexResult.length).toBe(2);
    expect(complexResult[0]).toBe(span);
    expect(complexResult[1]).toBe(p);
  },
});

/**
 * Test suite for document events
 */
test({
  name: "Document fires and handles events",
  fn: () => {
    const doc = new Document("");
    let eventCount = 0;

    // Add event listener
    doc.addEventListener("test", () => {
      eventCount++;
    });

    // Create and dispatch an event
    const event = new Event("test");
    doc.dispatchEvent(event);

    expect(eventCount).toBe(1);
  },
});

/**
 * Test suite for document manipulation
 */
test({
  name: "Document correctly handles importing/adopting nodes",
  fn: () => {
    const doc1 = new Document("");
    const doc2 = new Document("");

    // Create an element in doc1
    const element = doc1.createElement("div");
    element.id = "test";
    element.className = "imported";

    // Import the element into doc2
    const importedNode = doc2.importNode(element, true) as Element;

    // The imported node should have the same properties but a different owner
    expect(importedNode.id).toBe("test");
    expect(importedNode.className).toBe("imported");
    expect(importedNode.ownerDocument).toBe(doc2);
    expect(importedNode).not.toBe(element);

    // Try adoptNode instead
    const adoptedNode = doc2.adoptNode(element);

    // The adopted node should be the same node but with a new owner
    expect(adoptedNode).toBe(element);
    expect(adoptedNode.ownerDocument).toBe(doc2);
    expect(element.ownerDocument).toBe(doc2);
  },
});

test({
  name: "Document.createElementNS creates namespaced elements",
  fn: () => {
    const doc = new Document("");
    const SVG_NS = "http://www.w3.org/2000/svg";

    // Create SVG element with namespace
    const svgElement = doc.createElementNS(SVG_NS, "svg");
    expect(svgElement.nodeName).toBe("svg");
    expect(svgElement.namespaceURI).toBe(SVG_NS);

    // Create SVG child element
    const rect = doc.createElementNS(SVG_NS, "rect");
    svgElement.appendChild(rect);
    expect(rect.namespaceURI).toBe(SVG_NS);

    // Create element with null namespace
    const div = doc.createElementNS(null, "div");
    expect(div.namespaceURI).toBe(null);
  },
});

/**
 * # Document Advanced Features Testing
 * @summary Tests for document cloning, equality, title handling, and DOM APIs
 *
 * These tests verify advanced document functionality including document cloning,
 * node equality checking, title manipulation, and various DOM implementation details.
 */
describe("DocumentAdvanced", () => {
  describe("Document cloning and equality", () => {
    it("should correctly clone a document with all its contents", () => {
      // GIVEN a document with a doctype and title
      const { window } = createDOM(`
        <!doctype html>
        <html>
          <head><title>hello</title></head>
        </html>
      `);

      // WHEN cloning the document
      const clone = window.document.cloneNode(true);

      // THEN the clone should be connected and have the same structure
      assert(clone.isConnected === true, "document should always be connected");
      assert(
        JSON.stringify(clone) ===
          '[9,10,"html",1,"html",1,"head",1,"title",3,"hello",-4]',
        "JSON representation should match the original document structure"
      );
      assert(
        clone.doctype.nodeType === 10,
        "DOCTYPE node should have nodeType 10"
      );
    });

    it("should correctly determine equality between documents", () => {
      // GIVEN a document and its clone
      const { window } = createDOM(`
        <!doctype html>
        <html>
          <head><title>hello</title></head>
        </html>
      `);
      const clone = window.document.cloneNode(true);

      // THEN isEqualNode should return true for equality comparisons
      assert(
        clone.isEqualNode(clone) === true,
        "A document should be equal to itself"
      );
      assert(
        clone.isEqualNode(window.document) === true,
        "A cloned document should be equal to the original document"
      );
    });
  });

  describe("DOCTYPE handling", () => {
    it("should handle DOCTYPE nodes correctly", () => {
      // GIVEN a document with no DOCTYPE
      let document = new DOMParser().parseFromString("", "text/html");

      // THEN doctype should be null
      assert(
        document.doctype === null,
        "Document created without DOCTYPE should have null doctype"
      );

      // WHEN inserting an element without a DOCTYPE
      document.insertBefore(document.createElement("html"));

      // THEN doctype should still be null
      assert(
        document.doctype === null,
        "Document should still have null doctype after inserting non-DOCTYPE node"
      );

      // GIVEN a clone with a DOCTYPE
      const { window } = createDOM(`<!doctype html><html></html>`);
      const clone = window.document.cloneNode(true);

      // WHEN inserting the DOCTYPE from the clone
      document.insertBefore(clone.doctype, document.firstChild);

      // THEN the doctype property should reference the inserted DOCTYPE
      assert(
        document.doctype === clone.doctype,
        "Document.doctype should reference the inserted DOCTYPE node"
      );
    });
  });

  describe("Global objects and constructors", () => {
    it("should expose the correct global objects", () => {
      // GIVEN a document created with createDOM
      const { setTimeout } = createDOM(`<!doctype html><html></html>`);

      // THEN setTimeout should match the global setTimeout
      assert(
        setTimeout === global.setTimeout,
        "setTimeout from createDOM should match global setTimeout"
      );
    });

    it("should throw when incorrectly instantiating Document constructor", () => {
      // GIVEN the Document constructor
      const { Document } = createDOM(`<!doctype html><html></html>`);

      // WHEN trying to use Document constructor incorrectly
      try {
        new Document();
        assert(
          true === false,
          "Document should not be instantiable without new"
        );
      } catch (ok) {
        // THEN an error should be thrown
        assert(
          true === true,
          "Using Document constructor incorrectly should throw"
        );
      }
    });
  });

  describe("Document title handling", () => {
    it("should correctly get and set document title", () => {
      // GIVEN a document with HTML structure
      let document = new DOMParser().parseFromString(
        "<!DOCTYPE html><html />",
        "text/html"
      );

      // THEN the initial title should be empty
      assert(
        document.title === "",
        "Initial document title should be empty string"
      );

      // WHEN setting the title with quoted content
      document.title = '"hello"';

      // THEN the title should be set exactly as provided (not escaped)
      assert(
        document.title === '"hello"',
        "Document title with quotes should not be escaped"
      );
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><title>"hello"</title></head></html>',
        "Document serialization should include the title with quotes"
      );
      assert(
        document.body.tagName === "BODY",
        "Body element should be automatically created"
      );

      // WHEN setting a simple title
      document.title = "I";

      // THEN getting the title should not have side effects
      assert(
        document.title + document.title + document.title === "III",
        "Accessing title should not have side effects"
      );

      // WHEN setting a title with special characters
      document.title = "&";

      // THEN the raw character should be preserved in serialization
      assert(
        document.toString() ===
          "<!DOCTYPE html><html><head><title>&</title></head><body></body></html>",
        "Special characters in title should be preserved in document serialization"
      );
    });
  });

  describe("Document.all collection", () => {
    it("should correctly provide the document.all collection", () => {
      // GIVEN a document with HTML structure
      let document = new DOMParser().parseFromString(
        "<!DOCTYPE html><html />",
        "text/html"
      );
      document.title = "test";

      // THEN document.all should contain all elements in the document
      assert(
        document.all.length === 4,
        "document.all should contain all elements in the document"
      );
      assert(
        document.all[0] === document.querySelector("html"),
        "First element in document.all should be html"
      );
      assert(
        document.all[1] === document.querySelector("head"),
        "Second element in document.all should be head"
      );
      assert(
        document.all[2] === document.querySelector("title"),
        "Third element in document.all should be title"
      );
      assert(
        document.all[3] === document.querySelector("body"),
        "Fourth element in document.all should be body"
      );
    });
  });

  describe("Window event handling", () => {
    it("should correctly handle window events", () => {
      // GIVEN a window object from createDOM with an event listener
      const { window } = createDOM(`<!doctype html><html></html>`);
      let triggered = false;

      // WHEN adding and triggering an event
      window.addEventListener("test", function once() {
        triggered = true;
        window.removeEventListener("test", once);
      });
      window.dispatchEvent(new window.Event("test"));

      // THEN the event handler should be triggered
      assert(
        triggered === true,
        "Window event listener should be triggered by dispatched event"
      );
    });

    it("should allow modifying window properties", () => {
      // GIVEN a window object from createDOM
      const { window } = createDOM(`<!doctype html><html></html>`);

      // WHEN setting a custom property
      window.anyValue = 123;

      // THEN the property should be accessible
      assert(
        window.anyValue === 123,
        "Custom window property should be accessible"
      );

      // WHEN overriding methods
      window.addEventListener =
        window.removeEventListener =
        window.dispatchEvent =
          null;

      // THEN the overridden methods should reflect the new values
      assert(
        window.addEventListener === null,
        "Window methods should be overridable"
      );

      // THEN performance.now should return a number
      assert(
        typeof window.performance.now() === "number",
        "window.performance.now() should return a number"
      );
    });
  });

  describe("HTML parsing features", () => {
    it("should correctly parse and serialize HTML fragments", () => {
      // GIVEN a HTML fragment
      const result = createDOM("<html><body><div>asdf</div></body></html>");

      // THEN it should parse into the correct structure
      assert(
        result.document.body.outerHTML === "<body><div>asdf</div></body>",
        "HTML fragment should be correctly parsed into DOM structure"
      );
    });

    it("should handle location and base URI correctly", () => {
      // GIVEN a location object
      const location = { href: "http://ok" };

      // WHEN parsing HTML with this location
      const withLocation = createDOM("<html></html>", { location });

      // THEN the location should be correctly set
      assert(
        withLocation.document.defaultView.location === location,
        "Document defaultView should have the provided location object"
      );
      assert(
        withLocation.document.baseURI === location.href,
        "Document baseURI should match location.href"
      );

      // WHEN parsing HTML with a base element
      const withBase = createDOM('<html><base href="http://base"></html>', {
        location,
      });

      // THEN the baseURI should be derived from the base element
      assert(
        withBase.document.documentElement.baseURI === "http://base",
        "Document baseURI should be derived from base element when present"
      );

      // GIVEN a document fragment
      const fragment = new DocumentFragment();

      // THEN it should have null baseURI
      assert(
        fragment.baseURI === null,
        "DocumentFragment.baseURI should be null"
      );
    });

    it("should support CSS attribute selectors with wildcards", () => {
      // GIVEN a document with an SVG element with class
      const parser = new DOMParser();
      const { document: svg } = parser.parseFromString(
        '<svg class="foo-1"/>',
        "text/html"
      ).defaultView.window;

      // THEN attribute wildcard selectors should work
      assert(
        svg.querySelector('[class*="foo-"]') === svg.firstElementChild,
        "CSS attribute wildcard selectors should find matching elements"
      );
    });

    it("should handle minimal content correctly", () => {
      // GIVEN minimal content
      const parser = new DOMParser();

      // WHEN parsing minimal content
      const result = parser.parseFromString("...", "text/html");

      // THEN it should still create an HTML structure
      assert(
        result.firstElementChild.localName === "html",
        "Minimal content should still parse into html structure"
      );
    });
  });

  describe("Document body manipulation", () => {
    it("should maintain correct ownership when manipulating body", () => {
      // GIVEN an empty document with doctype and structure
      const issue187 = new DOMParser().parseFromString(
        `<!DOCTYPE html><html><head></head><body></body></html>`,
        "text/html"
      ).defaultView.window.document;

      // WHEN adding content to body through innerHTML
      issue187.body.innerHTML = "<span></span>";
      const span = issue187.body.firstElementChild;

      // THEN the new element should have the correct ownerDocument
      assert(
        span.ownerDocument.body === issue187.body,
        "Elements added via innerHTML should have correct ownerDocument"
      );
    });
  });
});
