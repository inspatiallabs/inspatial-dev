/**
 * Debug test for the ParentNode issue
 */

// @ts-ignore - Ignoring TS extension import error
import { test, expect } from "@inspatial/test";
// @ts-ignore - Ignoring TS extension import error
import { 
  Node, 
  Element, 
  Text, 
  Comment, 
  Document,
  DocumentFragment
} from "../cached.ts";
// @ts-ignore - Ignoring TS extension import error
import { mockDocumentFragmentForTests } from "../mixin/parent-node.ts";

// Call the mock function to patch DocumentFragment
mockDocumentFragmentForTests();

test({
  name: "Debug Parent Node Implementation with Mock",
  fn: () => {
    // Create a test document
    const doc = new Document("html");
    
    // Create a document fragment with specific children
    const parent = new DocumentFragment(doc);
    
    // Add some elements
    const el1 = new Element(doc, "element-1");
    const el2 = new Element(doc, "element-2");
    const el3 = new Element(doc, "element-3");
    
    // Add elements and other node types
    parent.appendChild(el1);
    parent.appendChild(el2);
    parent.appendChild(el3);
    
    // Debug output
    console.log("=== Debug Information (Mocked) ===");
    console.log("Child Nodes Length:", parent.childNodes.length);
    console.log("Children Length:", parent.children.length);
    
    // Print child nodes detail
    console.log("\nChild Nodes:");
    for (let i = 0; i < parent.childNodes.length; i++) {
      const node = parent.childNodes[i];
      console.log(`  [${i}] Type: ${node.nodeType} Name: ${node.localName}`);
    }
    
    // Print children detail
    console.log("\nChildren:");
    for (let i = 0; i < parent.children.length; i++) {
      const node = parent.children[i];
      console.log(`  [${i}] Type: ${node.nodeType} Name: ${node.localName}`);
    }
    
    // Test basic assertions
    expect(parent.childNodes.length).toBe(3);
    expect(parent.children.length).toBe(3);
  }
}); 