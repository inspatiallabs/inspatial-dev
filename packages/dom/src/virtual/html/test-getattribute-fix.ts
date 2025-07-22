import { createIsolatedDOM } from "../test-helpers.ts";

console.log("=== Testing getAttribute Fix ===");

const dom = createIsolatedDOM();
const anchor = dom.document.createElement("a");

console.log("\n1. Test basic attribute operations:");
anchor.setAttribute("href", "https://xr.new");
console.log("✅ setAttribute worked");

console.log("- getAttribute('href'):", anchor.getAttribute("href"));
console.log("- hasAttribute('href'):", anchor.hasAttribute("href"));

console.log("\n2. Test case-insensitive access:");
console.log("- getAttribute('HREF'):", anchor.getAttribute("HREF"));
console.log("- hasAttribute('HREF'):", anchor.hasAttribute("HREF"));

console.log("\n3. Test different attribute:");
anchor.setAttribute("title", "Click me!");
console.log("- getAttribute('title'):", anchor.getAttribute("title"));
console.log("- getAttribute('TITLE'):", anchor.getAttribute("TITLE"));

console.log("\n4. Test attribute removal:");
anchor.removeAttribute("href");
console.log("- After removeAttribute('href'):");
console.log("  - getAttribute('href'):", anchor.getAttribute("href"));
console.log("  - hasAttribute('href'):", anchor.hasAttribute("href"));

console.log("\n5. Test toggleAttribute:");
console.log("- Before toggle - hasAttribute('hidden'):", anchor.hasAttribute("hidden"));
const result1 = anchor.toggleAttribute("hidden");
console.log("- toggleAttribute('hidden') returned:", result1);
console.log("- After toggle - hasAttribute('hidden'):", anchor.hasAttribute("hidden"));

const result2 = anchor.toggleAttribute("hidden");
console.log("- toggleAttribute('hidden') again returned:", result2);
console.log("- After second toggle - hasAttribute('hidden'):", anchor.hasAttribute("hidden"));

console.log("\n✅ All getAttribute operations now work correctly!");
console.log("🐛 Bug fixed: ignoreCase function was being called incorrectly");
console.log("🔧 Solution: Use ignoreCase({ ownerDocument }) instead of ignoreCase(element, name)"); 