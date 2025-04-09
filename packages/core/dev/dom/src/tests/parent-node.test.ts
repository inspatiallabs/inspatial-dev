/**
 * Unit tests for the ParentNode class
 * 
 * These tests verify that the ParentNode class correctly implements
 * DOM's ParentNode interface, particularly focusing on the children getter.
 */

// @ts-ignore - Ignoring TS extension import error
import { test, expect, assertEquals } from "@inspatial/test";
// @ts-ignore - Ignoring TS extension import error
import { 
  Node, 
  Element, 
  Text, 
  Comment, 
  Document,
  DocumentFragment
} from "../cached.ts";

// Test document to use for creating nodes
const createTestDocument = () => {
  // Create Document with correct number of arguments
  return new Document("");
};

/**
 * Create a test parent node with the specified children
 */
const createParentWithChildren = (doc: Document, childElements = 0, childTextNodes = 0, childComments = 0) => {
  // Create a document fragment to hold children
  const parent = new DocumentFragment(doc);

  // Add element nodes
  for (let i = 0; i < childElements; i++) {
    const el = new Element(doc, `element-${i}`);
    parent.appendChild(el);
  }

  // Add text nodes
  for (let i = 0; i < childTextNodes; i++) {
    const text = new Text(doc, `text-${i}`);
    parent.appendChild(text);
  }

  // Add comment nodes
  for (let i = 0; i < childComments; i++) {
    const comment = new Comment(doc, `comment-${i}`);
    parent.appendChild(comment);
  }

  return parent;
};

/**
 * Test suite for the ParentNode class
 */
test({
  name: "ParentNode.children returns only Element nodes",
  fn: () => {
    const doc = createTestDocument();
    const parent = createParentWithChildren(doc, 3, 2, 1);
    
    // Children should only include element nodes
    const children = parent.children;
    
    // Verify children is a NodeList
    expect(children).toBeDefined();
    expect(children.length).toBe(3);
    
    // Verify all children are elements
    for (let i = 0; i < children.length; i++) {
      expect(children[i].nodeType).toBe(Node.ELEMENT_NODE);
    }
    
    // Check item method of NodeList works
    expect(children.item(0)).toBe(children[0]);
    expect(children.item(999)).toBeNull();
  }
});

test({
  name: "ParentNode.children returns empty NodeList when no element children exist",
  fn: () => {
    const doc = createTestDocument();
    
    // Create parent with only text and comment nodes
    const parent = createParentWithChildren(doc, 0, 2, 2);
    
    // Children NodeList should be empty
    expect(parent.children.length).toBe(0);
  }
});

test({
  name: "ParentNode.children updates when elements are added or removed",
  fn: () => {
    const doc = createTestDocument();
    const parent = createParentWithChildren(doc, 2, 0, 0);
    
    // Initially has 2 element children
    expect(parent.children.length).toBe(2);
    
    // Add a new element
    const newElement = new Element(doc, "new-element");
    parent.appendChild(newElement);
    
    // Should now have 3 element children
    expect(parent.children.length).toBe(3);
    expect(parent.children.item(2)).toBe(newElement);
    
    // Remove an element
    parent.removeChild(newElement);
    
    // Should be back to 2 element children
    expect(parent.children.length).toBe(2);
  }
});

test({
  name: "ParentNode.children ignores text nodes added between elements",
  fn: () => {
    const doc = createTestDocument();
    const parent = createParentWithChildren(doc, 2, 0, 0);
    
    // Add a text node between elements
    const textNode = new Text(doc, "text between elements");
    parent.insertBefore(textNode, parent.lastChild);
    
    // Should still have only 2 element children
    expect(parent.children.length).toBe(2);
    expect(parent.childNodes.length).toBe(3);
  }
});

test({
  name: "ParentNode.childElementCount matches children.length",
  fn: () => {
    const doc = createTestDocument();
    
    // Test with various combinations of children
    const testCases = [
      { elements: 0, texts: 0, comments: 0 },
      { elements: 1, texts: 0, comments: 0 },
      { elements: 3, texts: 2, comments: 1 },
      { elements: 0, texts: 5, comments: 2 }
    ];
    
    for (const testCase of testCases) {
      const parent = createParentWithChildren(
        doc, 
        testCase.elements, 
        testCase.texts, 
        testCase.comments
      );
      
      // Verify childElementCount matches children.length
      assertEquals(parent.childElementCount, parent.children.length);
      assertEquals(parent.childElementCount, testCase.elements);
    }
  }
}); 