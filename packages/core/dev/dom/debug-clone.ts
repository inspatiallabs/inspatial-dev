import { createDOM } from "./src/index.ts";
import { Element } from "./src/interface/element.ts";

// Create test document
const dom = createDOM('<html><body></body></html>');
const doc = dom.document;

// Create original element
const original = new Element(doc, "div");
original.setAttribute("id", "original");
original.setAttribute("class", "test-class");

console.log("Original element created:");
console.log("- tagName:", original.tagName);
console.log("- id:", original.id);
console.log("- className:", original.className);
console.log("- childNodes.length:", original.childNodes.length);

// Add child
const child = new Element(doc, "span");
child.textContent = "Child content";
original.appendChild(child);

console.log("\nAfter adding child:");
console.log("- original.childNodes.length:", original.childNodes.length);
console.log("- child.textContent:", child.textContent);
console.log("- child.tagName:", child.tagName);

// Deep clone
const deepClone = original.cloneNode(true);

console.log("\nAfter deep clone:");
console.log("- deepClone.tagName:", deepClone.tagName);
console.log("- deepClone.id:", deepClone.id);
console.log("- deepClone.className:", deepClone.className);
console.log("- deepClone.childNodes.length:", deepClone.childNodes.length);

// Inspect each child
for (let i = 0; i < deepClone.childNodes.length; i++) {
  const childNode = deepClone.childNodes[i];
  console.log(`- child[${i}]:`, {
    nodeType: childNode.nodeType,
    nodeName: childNode.nodeName,
    textContent: childNode.textContent,
    localName: (childNode as any).localName
  });
} 