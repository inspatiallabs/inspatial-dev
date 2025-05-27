import { createDOM } from "./src/index.ts";
import { Element } from "./src/interface/element.ts";

// Create test document
const dom = createDOM('<html><body></body></html>');
const doc = dom.document;

console.log("=== Test 1: Create elements ===");
const original = new Element(doc, "div");
const child = new Element(doc, "span");

console.log("original.childNodes.length:", original.childNodes.length);
console.log("child.childNodes.length:", child.childNodes.length);

console.log("\n=== Test 2: Set textContent on child ===");
child.textContent = "Child content";
console.log("After setting textContent:");
console.log("child.childNodes.length:", child.childNodes.length);
console.log("child.textContent:", child.textContent);

console.log("\n=== Test 3: Append child to original ===");
original.appendChild(child);
console.log("After appendChild:");
console.log("original.childNodes.length:", original.childNodes.length);
console.log("child.parentNode === original:", child.parentNode === original);

console.log("\n=== Test 4: Inspect original's children ===");
for (let i = 0; i < original.childNodes.length; i++) {
  const node = original.childNodes[i];
  console.log(`original.childNodes[${i}]:`, {
    nodeType: node.nodeType,
    nodeName: node.nodeName,
    textContent: node.textContent,
    localName: (node as any).localName
  });
}

console.log("\n=== Test 5: Inspect child's children ===");
for (let i = 0; i < child.childNodes.length; i++) {
  const node = child.childNodes[i];
  console.log(`child.childNodes[${i}]:`, {
    nodeType: node.nodeType,
    nodeName: node.nodeName,
    textContent: node.textContent,
    localName: (node as any).localName
  });
} 