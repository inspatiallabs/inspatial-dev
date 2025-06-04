import { createIsolatedDOM } from "../test-helpers.ts";
import { NEXT, END } from "../shared/symbols.ts";

console.log("=== insertBefore Debug ===");

const dom = createIsolatedDOM();
const button = dom.document.createElement("button");

// Set up button with attribute and text
button.setAttribute("disabled", "");
button.textContent = "click me";

console.log("1. Before insertBefore:");
console.log("   JSON:", JSON.stringify((button as any).toJSON()));

// Show what button[NEXT] points to before insertBefore
console.log("   button[NEXT] type:", (button as any)[NEXT]?.nodeType);
console.log("   button[NEXT] name:", (button as any)[NEXT]?.name || 'none');

// Use insertBefore instead of appendChild
dom.document.body!.insertBefore(button, null);

console.log("\n2. After insertBefore:");
console.log("   JSON:", JSON.stringify((button as any).toJSON()));

// Show what button[NEXT] points to after insertBefore  
console.log("   button[NEXT] type:", (button as any)[NEXT]?.nodeType);
console.log("   button[NEXT] name:", (button as any)[NEXT]?.name || 'none');

// Check if button[NEXT] is pointing to the body's end marker instead of its own internal structure
const bodyEnd = (dom.document.body as any)[END];
console.log("   button[NEXT] === body[END]:", (button as any)[NEXT] === bodyEnd); 