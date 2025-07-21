import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END, VALUE } from "../shared/symbols.ts";

console.log("=== appendChild Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

console.log("1. Setting up button...");
button.textContent = "click me";
button.setAttribute("disabled", "");

console.log("2. Before appendChild:");
console.log("   JSON.stringify(button):", JSON.stringify(button));
console.log("   button.toJSON():", JSON.stringify((button as any).toJSON()));

console.log("3. Appending to body...");
dom.document.body!.appendChild(button);

console.log("4. After appendChild:");
console.log("   JSON.stringify(button):", JSON.stringify(button));
console.log("   button.toJSON():", JSON.stringify((button as any).toJSON()));

console.log("5. Checking button structure after appendChild:");
console.log("   button.parentNode:", (button.parentNode as any)?.localName);
console.log("   button.childNodes.length:", button.childNodes.length);
console.log("   button.textContent:", button.textContent);
console.log("   hasAttribute('disabled'):", button.hasAttribute("disabled"));

console.log("6. Walking NEXT chain after appendChild:");
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