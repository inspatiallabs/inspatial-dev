import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END, VALUE, PREV } from "../shared/symbols.ts";
import { knownBoundaries } from "../shared/util/utils.ts";

console.log("=== knownBoundaries Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

console.log("1. Setting up button...");
button.textContent = "click me";
button.setAttribute("disabled", "");

console.log("2. Before knownBoundaries:");
console.log("   JSON.stringify(button):", JSON.stringify(button));

console.log("3. Simulating appendChild knownBoundaries call...");
const body = dom.document.body;
const end = (body as any)[END];
const prev = end[PREV];

console.log("4. Body structure:");
console.log("   body[END]:", (body as any)[END]);
console.log("   body[END][PREV]:", end[PREV]);

console.log("5. About to call knownBoundaries(prev, button, end)...");
knownBoundaries(prev, button as any, end);

console.log("6. After knownBoundaries:");
console.log("   JSON.stringify(button):", JSON.stringify(button));

console.log("7. Walking button's NEXT chain after knownBoundaries:");
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