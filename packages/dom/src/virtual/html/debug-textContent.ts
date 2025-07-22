import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END, VALUE } from "../shared/symbols.ts";

console.log("=== textContent Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

console.log("1. Initial button state:");
console.log("   button[NEXT] === button[END]:", (button as any)[NEXT] === (button as any)[END]);

console.log("\n2. Setting disabled attribute...");
button.setAttribute("disabled", "");

console.log("   After setAttribute:");
console.log("   button[NEXT] points to:", (button as any)[NEXT]?.nodeType, (button as any)[NEXT]?.name);
console.log("   attr[NEXT] points to:", (button as any)[NEXT]?.[NEXT]?.nodeType);

console.log("\n3. Setting textContent...");
button.textContent = "click me";

console.log("   After textContent:");
console.log("   button.textContent:", button.textContent);
console.log("   button.childNodes.length:", button.childNodes.length);

if (button.childNodes.length > 0) {
  const textNode = button.childNodes[0];
  console.log("   textNode.nodeType:", textNode.nodeType);
  console.log("   textNode.data:", (textNode as any).data);
  console.log("   textNode[VALUE]:", (textNode as any)[VALUE]);
  console.log("   textNode[NEXT]:", (textNode as any)[NEXT]?.nodeType);
}

console.log("\n4. Final NEXT chain walk:");
let current = (button as any)[NEXT];
let count = 0;
while (current && count < 10) {
  console.log(`   [${count}] nodeType: ${current.nodeType}, name: ${current.name || current.localName || '#text'}`);
  
  if (current.nodeType === 2) { // Attribute
    console.log(`      -> value: "${current[VALUE]}"`);
  } else if (current.nodeType === 3) { // Text
    console.log(`      -> text: "${current[VALUE] || current.data}"`);
  }
  
  if (current === (button as any)[END]) {
    console.log("      -> Reached END marker");
    break;
  }
  current = current[NEXT];
  count++;
}

console.log("\n5. Testing JSON serialization:");
try {
  const json = (button as any).toJSON();
  console.log("   JSON result:", JSON.stringify(json));
} catch (error) {
  console.error("   JSON error:", error);
} 