/**
 * Unit tests for the Document class
 * 
 * These tests verify that the Document class correctly implements
 * DOM's Document interface.
 */

import { test, expect, assertEquals } from "@inspatial/test";
import { 
  Document,
  Element,
  Text,
  Comment,
  DocumentFragment,
  Node
} from "../src/cached.ts";
// @ts-ignore - Ignoring TS extension import error
import { MIME } from "../src/shared/symbols.ts";

// Helper to create a test document with MIME settings
const createTestDocument = () => {
  const doc = new Document("");
  // Initialize MIME object with default HTML settings
  doc[MIME] = {
    ignoreCase: true,
    docType: "<!DOCTYPE html>",
    voidElements: /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i,
    textOnlyElements: /^(?:plaintext|script|style|textarea|title|xmp)$/i
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
    const importedNode = doc2.importNode(element, true);
    
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
  }
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
  }
}); 