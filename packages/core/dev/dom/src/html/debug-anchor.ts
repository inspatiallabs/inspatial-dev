import { createIsolatedDOM } from "../test-helpers.ts";

const dom = createIsolatedDOM();
console.log("=== Anchor element test ===");

// Create an anchor element
const anchor = dom.document.createElement("a");
console.log("Anchor created:", !!anchor);
console.log("Anchor type:", typeof anchor);
console.log("Anchor constructor:", anchor.constructor.name);

// Test setAttribute
console.log("\n=== Setting href attribute ===");
anchor.setAttribute("href", "https://xr.new");
console.log("Attribute set successfully");

// Test getAttribute  
console.log("\n=== Getting href attribute ===");
const href = anchor.getAttribute("href");
console.log("getAttribute result:", href);
console.log("getAttribute type:", typeof href);

// Test hasAttribute
console.log("\n=== Check hasAttribute ===");
const hasHref = anchor.hasAttribute("href");
console.log("hasAttribute('href'):", hasHref);

// Check all attributes
console.log("\n=== All attributes ===");
console.log("Anchor attributes:", anchor.attributes);
if (anchor.attributes) {
  console.log("Attributes length:", anchor.attributes.length);
  for (let i = 0; i < anchor.attributes.length; i++) {
    const attr = anchor.attributes[i];
    console.log(`Attribute ${i}:`, attr.name, "=", attr.value);
  }
} 