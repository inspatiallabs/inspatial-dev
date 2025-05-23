import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END, VALUE } from "../shared/symbols.ts";

console.log("=== setAttribute Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

console.log("1. Initial state:");
console.log("   button[NEXT]:", (button as any)[NEXT]);
console.log("   button[END]:", (button as any)[END]);
console.log("   button[NEXT] === button[END]:", (button as any)[NEXT] === (button as any)[END]);

console.log("\n2. About to call setAttribute('disabled', '')...");

// Set up a temporary override to trace the setAttribute call
const originalSetAttribute = button.setAttribute;
button.setAttribute = function(name: string, value: string) {
  console.log("   setAttribute called with:", name, "=", value);
  console.log("   Before setAttribute - button[NEXT]:", (this as any)[NEXT]);
  console.log("   Before setAttribute - button[END]:", (this as any)[END]);
  
  const result = originalSetAttribute.call(this, name, value);
  
  console.log("   After setAttribute - button[NEXT]:", (this as any)[NEXT]);
  console.log("   After setAttribute - button[END]:", (this as any)[END]);
  console.log("   After setAttribute - button[NEXT] === button[END]:", (this as any)[NEXT] === (this as any)[END]);
  
  return result;
};

button.setAttribute("disabled", "");

console.log("\n3. Final state after setAttribute:");
console.log("   button[NEXT]:", (button as any)[NEXT]);
console.log("   button[END]:", (button as any)[END]);
console.log("   hasAttribute('disabled'):", button.hasAttribute("disabled"));

// Check the attribute in the attributes collection
console.log("\n4. Checking attributes collection:");
console.log("   button.attributes.length:", button.attributes.length);
if (button.attributes.length > 0) {
  const attr = button.attributes[0];
  console.log("   attr.name:", attr.name);
  console.log("   attr.value:", attr.value);
  console.log("   attr[VALUE]:", (attr as any)[VALUE]);
  console.log("   attr[NEXT]:", (attr as any)[NEXT]);
  console.log("   attr[PREV]:", (attr as any)[Symbol.for("prev")]);
}

console.log("\n5. Manual NEXT chain walk:");
let current = (button as any)[NEXT];
let count = 0;
while (current && count < 5) {
  console.log(`   [${count}] nodeType: ${current.nodeType}, name: ${current.name || current.localName || 'unknown'}`);
  if (current === (button as any)[END]) {
    console.log("   -> Reached END marker");
    break;
  }
  current = current[NEXT];
  count++;
} 