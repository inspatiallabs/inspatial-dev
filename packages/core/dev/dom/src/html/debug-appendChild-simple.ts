import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END, VALUE } from "../shared/symbols.ts";

console.log("=== appendChild Simple Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

// Set up button with attribute and text
button.setAttribute("disabled", "");
button.textContent = "click me";

console.log("1. Before appendChild:");
console.log("   JSON:", JSON.stringify((button as any).toJSON()));

// Show what button[NEXT] points to before appendChild
console.log("   button[NEXT] type:", (button as any)[NEXT]?.nodeType);
console.log("   button[NEXT] name:", (button as any)[NEXT]?.name || 'none');

// Append to body
dom.document.body!.appendChild(button);

console.log("\n2. After appendChild:");
console.log("   JSON:", JSON.stringify((button as any).toJSON()));

// Show what button[NEXT] points to after appendChild  
console.log("   button[NEXT] type:", (button as any)[NEXT]?.nodeType);
console.log("   button[NEXT] name:", (button as any)[NEXT]?.name || 'none');

// Check if button[NEXT] is pointing to the body's end marker instead of its own internal structure
const bodyEnd = (dom.document.body as any)[END];
console.log("   button[NEXT] === body[END]:", (button as any)[NEXT] === bodyEnd); 