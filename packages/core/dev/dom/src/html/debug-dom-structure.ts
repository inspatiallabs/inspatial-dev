import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END } from "../shared/symbols.ts";

console.log("=== DOM Structure Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

console.log("1. After creating button:");
console.log("   button[NEXT]:", (button as any)[NEXT]);
console.log("   button[END]:", (button as any)[END]);
console.log("   button[NEXT] === button[END]:", (button as any)[NEXT] === (button as any)[END]);

console.log("\n2. Setting attribute...");
button.setAttribute("disabled", "");

console.log("   After setAttribute:");
console.log("   button[NEXT]:", (button as any)[NEXT]);
console.log("   button[END]:", (button as any)[END]);
console.log("   button[NEXT] === button[END]:", (button as any)[NEXT] === (button as any)[END]);

// Check what's in the NEXT chain manually
console.log("\n3. Manual NEXT chain walk:");
let current = button as any;
let count = 0;
console.log(`   button -> NEXT: ${current[NEXT]?.nodeType} (should point to first child)`);
console.log(`   button -> END: ${current[END]?.nodeType} (should be end marker)`);

// Walk from button[NEXT]
let next = current[NEXT];
while (next && count < 5) {
  console.log(`   [${count}] nodeType: ${next.nodeType}, name: ${next.name || next.localName || 'unknown'}`);
  if (next === current[END]) {
    console.log("   -> Reached END marker");
    break;
  }
  next = next[NEXT];
  count++;
}

console.log("\n4. Setting text content...");
button.textContent = "click me";

console.log("   After textContent:");
console.log("   button[NEXT]:", (button as any)[NEXT]);
console.log("   button[END]:", (button as any)[END]);
console.log("   button[NEXT] === button[END]:", (button as any)[NEXT] === (button as any)[END]);

// Final check
console.log("\n5. Final NEXT chain walk:");
current = button as any;
next = current[NEXT];
count = 0;
while (next && count < 5) {
  console.log(`   [${count}] nodeType: ${next.nodeType}, name: ${next.name || next.localName || 'unknown'}`);
  if (next === current[END]) {
    console.log("   -> Reached END marker");
    break;
  }
  next = next[NEXT];
  count++;
}

console.log("\n6. Expected structure:");
console.log("   button[NEXT] should point to -> first child (attribute)");
console.log("   attribute[NEXT] should point to -> text node");  
console.log("   text[NEXT] should point to -> button[END]");
console.log("   button[END] should be the end marker"); 