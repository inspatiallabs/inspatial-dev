import { createIsolatedDOM } from "../test-helpers.ts";

console.log("=== Button JSON Debug ===");

const dom = createIsolatedDOM();
console.log("DOM created");

// Create button element
const button = dom.document.createElement("button") as any;
console.log("1. Button created:", button.localName);
console.log("   nodeType:", button.nodeType);
console.log("   NEXT:", !!(button as any)[Symbol.for("next")]);
console.log("   END:", !!(button as any)[Symbol.for("end")]);

// Set disabled attribute  
console.log("\n2. Setting disabled attribute...");
button.setAttribute("disabled", "");
console.log("   hasAttribute('disabled'):", button.hasAttribute("disabled"));
console.log("   getAttribute('disabled'):", button.getAttribute("disabled"));

// Debug the NEXT chain after setAttribute
console.log("\n3. NEXT chain after setAttribute:");
let next = (button as any)[Symbol.for("next")];
let count = 0;
while (next && count < 10) {
  console.log(`   [${count}] nodeType: ${next.nodeType}, name: ${next.name || next.localName}, value: ${next[Symbol.for("value")] || 'none'}`);
  next = next[Symbol.for("next")];
  count++;
  if (next === (button as any)[Symbol.for("end")]) {
    console.log(`   [${count}] END marker`);
    break;
  }
}

// Set text content
console.log("\n4. Setting text content...");
button.textContent = "click me";
console.log("   textContent:", button.textContent);
console.log("   childNodes.length:", button.childNodes.length);

// Debug the NEXT chain after setting text content
console.log("\n5. NEXT chain after textContent:");
next = (button as any)[Symbol.for("next")];
count = 0;
while (next && count < 10) {
  console.log(`   [${count}] nodeType: ${next.nodeType}, name: ${next.name || next.localName}, value: ${next[Symbol.for("value")] || 'none'}`);
  next = next[Symbol.for("next")];
  count++;
  if (next === (button as any)[Symbol.for("end")]) {
    console.log(`   [${count}] END marker`);
    break;
  }
}

// Check JSON serialization
console.log("\n6. JSON serialization:");
try {
  const jsonResult = (button as any).toJSON();
  console.log("   toJSON() result:", JSON.stringify(jsonResult));
  console.log("   Expected: contains 1, 'button', and attributes/text");
} catch (error) {
  console.error("   JSON error:", error);
}

console.log("\n7. Manual inspection:");
console.log("   button attributes.length:", button.attributes.length);
console.log("   button.children.length:", button.children.length);
console.log("   button.childNodes.length:", button.childNodes.length); 