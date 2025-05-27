import { createDOM } from "./src/index.ts";
import { Element } from "./src/interface/element.ts";

// Create test document
const dom = createDOM('<html><body></body></html>');
const doc = dom.document;

console.log("=== Step 1: Create parent and child ===");
const parent = new Element(doc, "div");
const child = new Element(doc, "span");

console.log("parent.childNodes.length:", parent.childNodes.length);
console.log("child.childNodes.length:", child.childNodes.length);

console.log("\n=== Step 2: Set textContent on child ===");
child.textContent = "Child content";

console.log("After setting textContent:");
console.log("child.childNodes.length:", child.childNodes.length);
console.log("child.textContent:", child.textContent);

// Inspect the child's structure
for (let i = 0; i < child.childNodes.length; i++) {
  const node = child.childNodes[i];
  console.log(`child.childNodes[${i}]:`, {
    nodeType: node.nodeType,
    nodeName: node.nodeName,
    textContent: node.textContent,
    localName: (node as any).localName
  });
}

console.log("\n=== Step 3: Before appendChild ===");
console.log("parent.childNodes.length:", parent.childNodes.length);

console.log("\n=== Step 4: Call appendChild ===");
parent.appendChild(child);

console.log("\n=== Step 5: After appendChild ===");
console.log("parent.childNodes.length:", parent.childNodes.length);
console.log("child.parentNode === parent:", child.parentNode === parent);

// Inspect the parent's children
for (let i = 0; i < parent.childNodes.length; i++) {
  const node = parent.childNodes[i];
  console.log(`parent.childNodes[${i}]:`, {
    nodeType: node.nodeType,
    nodeName: node.nodeName,
    textContent: node.textContent,
    localName: (node as any).localName,
    isChildElement: node === child
  });
}

console.log("\n=== Step 6: Check child's children after appendChild ===");
console.log("child.childNodes.length:", child.childNodes.length);
for (let i = 0; i < child.childNodes.length; i++) {
  const node = child.childNodes[i];
  console.log(`child.childNodes[${i}]:`, {
    nodeType: node.nodeType,
    nodeName: node.nodeName,
    textContent: node.textContent,
    localName: (node as any).localName
  });
} 