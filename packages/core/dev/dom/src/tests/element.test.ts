/**
 * Unit tests for the Element class
 * 
 * These tests verify that the Element class correctly implements
 * DOM's Element interface, covering attributes, properties, and methods.
 */

import { test, expect, assertEquals } from "@inspatial/test";
import { 
  Node, 
  Element, 
  Text, 
  Document,
  Attr
} from "../cached.ts";
import { MIME } from "../shared/symbols.ts";

// Test document to use for creating elements
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

// Test element creation helper
const createElement = (tagName = "div", attributes: Record<string, string> = {}) => {
  const doc = createTestDocument();
  const element = new Element(doc, tagName);
  
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  
  return element;
};

// Create a series of test nodes (elements and text)
const createTestNodes = () => {
  const doc = createTestDocument();
  const container = new Element(doc, "div");
  const el1 = new Element(doc, "p");
  const el2 = new Element(doc, "span");
  const text = new Text(doc, "text content");
  
  container.appendChild(el1);
  container.appendChild(text);
  container.appendChild(el2);
  
  return { container, el1, el2, text, doc };
};

/**
 * Test suite for basic element properties
 */
test({
  name: "Element.tagName returns capitalized tag name",
  fn: () => {
    const element = createElement("div");
    assertEquals(element.tagName, "DIV");
  }
});

/**
 * Test suite for Element properties
 */
test({
  name: "Element.tagName returns the tag name in uppercase",
  fn: () => {
    const element = createElement("div");
    expect(element.tagName).toBe("DIV");
    
    const customElement = createElement("custom-element");
    expect(customElement.tagName).toBe("CUSTOM-ELEMENT");
  }
});

test({
  name: "Element.id gets and sets element ID",
  fn: () => {
    const element = createElement();
    
    // Default ID should be empty
    assertEquals(element.id, "");
    
    // Set ID
    element.id = "test-id";
    assertEquals(element.id, "test-id");
    assertEquals(element.getAttribute("id"), "test-id");
    
    // Change ID via attribute
    element.setAttribute("id", "new-id");
    assertEquals(element.id, "new-id");
  }
});

test({
  name: "Element.className gets and sets class attribute",
  fn: () => {
    const element = createElement();
    
    // Default className should be empty
    assertEquals(element.className, "");
    
    // Set className
    element.className = "test-class";
    assertEquals(element.className, "test-class");
    assertEquals(element.getAttribute("class"), "test-class");
    
    // Change class via attribute
    element.setAttribute("class", "new-class");
    assertEquals(element.className, "new-class");
  }
});

/**
 * Test suite for classList functionality
 */
test({
  name: "Element.classList provides DOMTokenList functionality",
  fn: () => {
    const element = createElement();
    
    // Add classes
    element.classList.add("test-class");
    assertEquals(element.className, "test-class");
    
    element.classList.add("another-class");
    assertEquals(element.className, "test-class another-class");
    
    // Contains
    expect(element.classList.contains("test-class")).toBe(true);
    expect(element.classList.contains("non-existent")).toBe(false);
    
    // Remove
    element.classList.remove("test-class");
    assertEquals(element.className, "another-class");
    
    // Toggle
    element.classList.toggle("new-class");
    expect(element.classList.contains("new-class")).toBe(true);
    
    element.classList.toggle("new-class");
    expect(element.classList.contains("new-class")).toBe(false);
    
    // Replace
    element.classList.add("old-class");
    element.classList.replace("old-class", "new-class");
    expect(element.classList.contains("old-class")).toBe(false);
    expect(element.classList.contains("new-class")).toBe(true);
  }
});

/**
 * Test suite for attribute manipulation
 */
test({
  name: "Element.getAttribute gets attributes",
  fn: () => {
    const element = createElement("div", {
      "id": "test-id",
      "class": "test-class",
      "data-test": "test-data"
    });
    
    assertEquals(element.getAttribute("id"), "test-id");
    assertEquals(element.getAttribute("class"), "test-class");
    assertEquals(element.getAttribute("data-test"), "test-data");
    assertEquals(element.getAttribute("non-existent"), null);
  }
});

test({
  name: "Element.setAttribute sets attributes",
  fn: () => {
    const element = createElement();
    
    element.setAttribute("id", "test-id");
    assertEquals(element.getAttribute("id"), "test-id");
    
    // Update existing attribute
    element.setAttribute("id", "new-id");
    assertEquals(element.getAttribute("id"), "new-id");
    
    // Boolean attribute
    element.setAttribute("hidden", "");
    assertEquals(element.getAttribute("hidden"), "");
  }
});

test({
  name: "Element.removeAttribute removes attributes",
  fn: () => {
    const element = createElement("div", {
      "id": "test-id",
      "class": "test-class"
    });
    
    element.removeAttribute("id");
    assertEquals(element.getAttribute("id"), null);
    
    // Non-existent attribute - should not throw
    element.removeAttribute("non-existent");
  }
});

test({
  name: "Element.hasAttribute checks attribute existence",
  fn: () => {
    const element = createElement("div", {
      "id": "test-id",
      "hidden": ""
    });
    
    expect(element.hasAttribute("id")).toBe(true);
    expect(element.hasAttribute("hidden")).toBe(true);
    expect(element.hasAttribute("non-existent")).toBe(false);
  }
});

test({
  name: "Element.toggleAttribute toggles attributes",
  fn: () => {
    const element = createElement();
    
    // Add attribute
    const result1 = element.toggleAttribute("hidden");
    expect(element.hasAttribute("hidden")).toBe(true);
    expect(result1).toBe(true);
    
    // Remove attribute
    const result2 = element.toggleAttribute("hidden");
    expect(element.hasAttribute("hidden")).toBe(false);
    expect(result2).toBe(false);
    
    // Force add attribute
    const result3 = element.toggleAttribute("hidden", true);
    expect(element.hasAttribute("hidden")).toBe(true);
    expect(result3).toBe(true);
    
    // Force add when already present
    const result4 = element.toggleAttribute("hidden", true);
    expect(element.hasAttribute("hidden")).toBe(true);
    expect(result4).toBe(true);
    
    // Force remove attribute
    const result5 = element.toggleAttribute("hidden", false);
    expect(element.hasAttribute("hidden")).toBe(false);
    expect(result5).toBe(false);
  }
});

/**
 * Test suite for content manipulation
 */
test({
  name: "Element.textContent gets and sets text content",
  fn: () => {
    const element = createElement();
    
    // Default textContent should be empty
    assertEquals(element.textContent, "");
    
    // Set textContent
    element.textContent = "Test content";
    assertEquals(element.textContent, "Test content");
    
    // Set to null should convert to empty string
    element.textContent = null;
    assertEquals(element.textContent, "");
    
    // Add child node and then check textContent
    const child = createElement();
    child.textContent = "Child content";
    element.appendChild(child);
    
    assertEquals(element.textContent, "Child content");
  }
});

test({
  name: "Element.innerHTML gets and sets HTML content",
  fn: () => {
    const element = createElement();
    
    // Default innerHTML should be empty
    assertEquals(element.innerHTML, "");
    
    // Set innerHTML
    element.innerHTML = "<span>Test content</span>";
    
    // Should have created a child node
    assertEquals(element.childNodes.length, 1);
    assertEquals(element.firstChild.nodeName, "SPAN");
  }
});

/**
 * Test suite for element traversal
 */
test({
  name: "Element traversal properties (parentElement, children, firstElementChild, etc.)",
  fn: () => {
    const parent = createElement();
    const child1 = createElement();
    const child2 = createElement();
    const textNode = new Text("Text node");
    
    // Add children
    parent.appendChild(child1);
    parent.appendChild(textNode);
    parent.appendChild(child2);
    
    // Test parent-child relationships
    assertEquals(child1.parentElement, parent);
    assertEquals(child2.parentElement, parent);
    
    // Test children collection
    assertEquals(parent.children.length, 2);
    assertEquals(parent.children[0], child1);
    assertEquals(parent.children[1], child2);
    
    // Test element child properties
    assertEquals(parent.firstElementChild, child1);
    assertEquals(parent.lastElementChild, child2);
    assertEquals(child1.nextElementSibling, child2);
    assertEquals(child2.previousElementSibling, child1);
  }
});

/**
 * Test suite for element methods
 */
test({
  name: "Element.matches matches CSS selectors",
  fn: () => {
    const element = createElement("div", {
      "id": "test-id",
      "class": "test-class",
      "data-test": "test-data"
    });
    
    expect(element.matches("div")).toBe(true);
    expect(element.matches("#test-id")).toBe(true);
    expect(element.matches(".test-class")).toBe(true);
    expect(element.matches("[data-test]")).toBe(true);
    expect(element.matches("[data-test='test-data']")).toBe(true);
    expect(element.matches("span")).toBe(false);
  }
});

test({
  name: "Element.closest finds nearest ancestor matching selector",
  fn: () => {
    const doc = createTestDocument();
    const parent = doc.createElement("div");
    parent.id = "parent";
    parent.classList.add("parent-class");
    
    const child = doc.createElement("span");
    child.id = "child";
    child.classList.add("child-class");
    
    parent.appendChild(child);
    
    // Find closest div from child
    const closestDiv = child.closest("div");
    assertEquals(closestDiv, parent);
    
    // Find closest with class
    const closestWithClass = child.closest(".parent-class");
    assertEquals(closestWithClass, parent);
    
    // Element should match itself
    const closestSpan = child.closest("span");
    assertEquals(closestSpan, child);
    
    // No match should return null
    const closestNonExistent = child.closest(".non-existent");
    assertEquals(closestNonExistent, null);
  }
});

/**
 * Test suite for dataset property
 */
test({
  name: "Element.dataset provides access to data attributes",
  fn: () => {
    const element = createElement("div", {
      "data-test": "test-value",
      "data-camel-case": "camel-value"
    });
    
    // Get data attributes
    assertEquals(element.dataset.test, "test-value");
    assertEquals(element.dataset.camelCase, "camel-value");
    
    // Set data attribute
    element.dataset.newData = "new-value";
    assertEquals(element.getAttribute("data-new-data"), "new-value");
    
    // Delete data attribute
    delete element.dataset.test;
    assertEquals(element.hasAttribute("data-test"), false);
  }
});

/**
 * Test suite for Shadow DOM
 */
test({
  name: "Element.attachShadow creates a shadow root",
  fn: () => {
    const element = createElement();
    
    // Attach shadow root
    const shadowRoot = element.attachShadow({ mode: "open" });
    expect(shadowRoot).toBeDefined();
    
    // Verify shadowRoot is accessible
    expect(element.shadowRoot).toBe(shadowRoot);
    
    // Add content to shadow root
    const shadowChild = new Element(shadowRoot.ownerDocument, "div");
    shadowChild.textContent = "Shadow content";
    shadowRoot.appendChild(shadowChild);
    
    // Verify shadow content
    expect(shadowRoot.childNodes.length).toBe(1);
    expect(shadowRoot.childNodes[0].textContent).toBeDefined();
    expect(shadowRoot.childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    
    // Create a closed shadow root
    const element2 = createElement();
    element2.attachShadow({ mode: "closed" });
    
    // Closed shadow root should not be accessible
    expect(element2.shadowRoot).toBe(null);
  }
});

/**
 * Test suite for style property
 */
test({
  name: "Element.style provides access to style declaration",
  fn() {
    // Use the existing createElement helper
    const element = createElement();
    
    // Initial state - style exists but is empty
    expect(element.style).not.toBe(null);
    
    // Clear any existing style
    element.removeAttribute("style");
    expect(element.style.cssText).toBe("");
    
    // Set inline properties
    element.style.color = "red";
    element.style.fontSize = "16px";
    
    // Check that properties are set
    expect(element.style.color).toBe("red");
    expect(element.style.fontSize).toBe("16px");
    
    // Update via style attribute
    element.setAttribute("style", "color: blue; margin: 10px");
    
    // Check that style object is updated
    expect(element.style.color).toBe("blue");
    expect(element.style.margin).toBe("10px");
    expect(element.style.fontSize).toBe(""); // Property should be gone
  }
});

test({
  name: "Element manipulation methods work correctly",
  fn: () => {
    const doc = createTestDocument();
    const container = new Element(doc, "div");
    
    const target = new Element(doc, "p");
    target.textContent = "Target";
    container.appendChild(target);
    
    // insertAdjacentElement - beforebegin
    const beforeElement = new Element(doc, "span");
    beforeElement.textContent = "Before";
    target.insertAdjacentElement("beforebegin", beforeElement);
    
    expect(container.childNodes[0]).toBe(beforeElement);
    expect(container.childNodes[1]).toBe(target);
    
    // insertAdjacentElement - afterbegin
    const afterBeginElement = new Element(doc, "strong");
    afterBeginElement.textContent = "Inside Start";
    target.insertAdjacentElement("afterbegin", afterBeginElement);
    
    expect(target.childNodes[0]).toBe(afterBeginElement);
    
    // insertAdjacentElement - beforeend
    const beforeEndElement = new Element(doc, "em");
    beforeEndElement.textContent = "Inside End";
    target.insertAdjacentElement("beforeend", beforeEndElement);
    
    expect(target.childNodes[1]).toBe(beforeEndElement);
    
    // insertAdjacentElement - afterend
    const afterElement = new Element(doc, "div");
    afterElement.textContent = "After";
    target.insertAdjacentElement("afterend", afterElement);
    
    expect(container.childNodes[2]).toBe(afterElement);
    
    // insertAdjacentText
    target.insertAdjacentText("afterbegin", "Text Start ");
    expect(target.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(target.childNodes[0].textContent).toBe("Text Start ");
    
    // verify final structure
    expect(container.childNodes.length).toBe(3);
    expect(target.childNodes.length).toBe(3);
  }
});

/**
 * Test suite for cloning
 */
test({
  name: "Element.cloneNode creates a copy of the element",
  fn: () => {
    const original = createElement("div", {
      "id": "original",
      "class": "test-class"
    });
    
    // Add child
    const child = createElement("span");
    child.textContent = "Child content";
    original.appendChild(child);
    
    // Shallow clone
    const shallowClone = original.cloneNode();
    assertEquals(shallowClone.nodeName, "DIV");
    assertEquals(shallowClone.id, "original");
    assertEquals(shallowClone.className, "test-class");
    assertEquals(shallowClone.childNodes.length, 0);
    
    // Deep clone
    const deepClone = original.cloneNode(true);
    assertEquals(deepClone.nodeName, "DIV");
    assertEquals(deepClone.id, "original");
    assertEquals(deepClone.className, "test-class");
    assertEquals(deepClone.childNodes.length, 1);
    assertEquals(deepClone.firstChild.nodeName, "SPAN");
    assertEquals(deepClone.firstChild.textContent, "Child content");
  }
}); 