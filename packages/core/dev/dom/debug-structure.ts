import { createDOM } from "./src/index.ts";
import { Element } from "./src/interface/element.ts";
import { NEXT, PREV, END } from "./src/shared/symbols.ts";

// Create test document
const dom = createDOM('<html><body></body></html>');
const doc = dom.document;

console.log("=== Creating elements ===");
const parent = new Element(doc, "div");
const child = new Element(doc, "span");

console.log("=== Setting textContent ===");
child.textContent = "Child content";

console.log("=== Examining child structure before appendChild ===");
console.log("child[NEXT]:", (child as any)[NEXT]?.localName || (child as any)[NEXT]?.nodeType);
console.log("child[END]:", (child as any)[END]?.localName || (child as any)[END]?.nodeType);
console.log("child[END][NEXT]:", (child as any)[END]?.[NEXT]?.localName || (child as any)[END]?.[NEXT]?.nodeType);

// Walk through child's internal structure
let current = (child as any)[NEXT];
let count = 0;
console.log("=== Walking child's internal structure ===");
while (current && count < 10) {
  console.log(`Step ${count}:`, {
    nodeType: current.nodeType,
    localName: current.localName,
    textContent: current.textContent,
    isEnd: current === (child as any)[END]
  });
  current = current[NEXT];
  count++;
  if (current === (child as any)[END]) {
    console.log("Reached child's END marker");
    break;
  }
}

console.log("=== Calling appendChild ===");
parent.appendChild(child);

console.log("=== Examining parent structure after appendChild ===");
console.log("parent[NEXT]:", (parent as any)[NEXT]?.localName || (parent as any)[NEXT]?.nodeType);
console.log("parent[END]:", (parent as any)[END]?.localName || (parent as any)[END]?.nodeType);

// Walk through parent's internal structure
current = (parent as any)[NEXT];
count = 0;
console.log("=== Walking parent's internal structure ===");
while (current && count < 20) {
  console.log(`Step ${count}:`, {
    nodeType: current.nodeType,
    localName: current.localName,
    textContent: current.textContent,
    isEnd: current === (parent as any)[END],
    isChildElement: current === child
  });
  current = current[NEXT];
  count++;
  if (current === (parent as any)[END]) {
    console.log("Reached parent's END marker");
    break;
  }
}

console.log("=== Final childNodes check ===");
console.log("parent.childNodes.length:", parent.childNodes.length);
for (let i = 0; i < parent.childNodes.length; i++) {
  const node = parent.childNodes[i];
  console.log(`childNodes[${i}]:`, {
    nodeType: node.nodeType,
    localName: (node as any).localName,
    textContent: node.textContent,
    isChildElement: node === child
  });
} 