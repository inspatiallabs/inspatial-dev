// import { createIsolatedDOM } from "../test-helpers.ts";

// console.log("=== Testing appendChild and insertBefore Fixes ===");

// const dom = createIsolatedDOM();

// // Test appendChild
// console.log("\n1. Testing appendChild:");
// const button1 = dom.document.createElement("button");
// button1.setAttribute("disabled", "");
// button1.textContent = "click me";

// console.log("   Before appendChild:", JSON.stringify((button1 as any).toJSON()));
// dom.document.body!.appendChild(button1);
// console.log("   After appendChild:", JSON.stringify((button1 as any).toJSON()));

// // Test insertBefore
// console.log("\n2. Testing insertBefore:");
// const button2 = dom.document.createElement("button");
// button2.setAttribute("type", "submit");
// button2.textContent = "submit";

// console.log("   Before insertBefore:", JSON.stringify((button2 as any).toJSON()));
// dom.document.body!.insertBefore(button2, null);
// console.log("   After insertBefore:", JSON.stringify((button2 as any).toJSON()));

// console.log("\n3. Final DOM structure:");
// console.log("   Body children count:", dom.document.body!.children.length);
// console.log("   First button JSON:", JSON.stringify((dom.document.body!.children[0] as any).toJSON()));
// console.log("   Second button JSON:", JSON.stringify((dom.document.body!.children[1] as any).toJSON()));

// console.log("\n✅ Both fixes are working!"); 