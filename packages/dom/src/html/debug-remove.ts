import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END, VALUE } from "../shared/symbols.ts";

console.log("=== node.remove() Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

console.log("1. Setting up button...");
button.textContent = "click me";
button.setAttribute("disabled", "");

console.log("2. Before node.remove():");
console.log("   JSON.stringify(button):", JSON.stringify(button));

console.log("3. Walking NEXT chain before remove:");
let current = (button as any)[NEXT];
let count = 0;
while (current && count < 5) {
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

console.log("4. Calling node.remove()...");
button.remove();

console.log("5. After node.remove():");
console.log("   JSON.stringify(button):", JSON.stringify(button));

console.log("6. Walking NEXT chain after remove:");
current = (button as any)[NEXT];
count = 0;
while (current && count < 5) {
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