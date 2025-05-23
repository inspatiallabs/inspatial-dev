import { createIsolatedDOM } from "../test-helpers.ts";

console.log("=== JSON.stringify vs toJSON Debug ===");

const dom = createIsolatedDOM();
console.log("DOM created");

// Create button element
const button = dom.document.createElement("button");
button.setAttribute("disabled", "");
button.textContent = "click me";

console.log("\n1. Testing toJSON() method:");
try {
  const toJsonResult = (button as any).toJSON();
  console.log("   toJSON() result:", JSON.stringify(toJsonResult));
  console.log("   Contains 'button':", JSON.stringify(toJsonResult).includes('"button"'));
  console.log("   Contains 'disabled':", JSON.stringify(toJsonResult).includes('"disabled"'));
  console.log("   Contains 'click me':", JSON.stringify(toJsonResult).includes('"click me"'));
} catch (error) {
  console.error("   toJSON() error:", error);
}

console.log("\n2. Testing JSON.stringify() directly:");
try {
  const jsonResult = JSON.stringify(button);
  console.log("   JSON.stringify() result length:", jsonResult.length);
  console.log("   JSON.stringify() first 200 chars:", jsonResult.substring(0, 200));
  console.log("   Contains 'button':", jsonResult.includes('"button"'));
  console.log("   Contains 'disabled':", jsonResult.includes('"disabled"'));
  console.log("   Contains 'click me':", jsonResult.includes('"click me"'));
} catch (error) {
  console.error("   JSON.stringify() error:", error);
}

console.log("\n3. Testing JSON.stringify() with toJSON method:");
try {
  const jsonWithToJson = JSON.stringify((button as any).toJSON());
  console.log("   JSON.stringify(toJSON()) result:", jsonWithToJson);
  console.log("   Contains 'button':", jsonWithToJson.includes('"button"'));
  console.log("   Contains 'disabled':", jsonWithToJson.includes('"disabled"'));
  console.log("   Contains 'click me':", jsonWithToJson.includes('"click me"'));
} catch (error) {
  console.error("   JSON.stringify(toJSON()) error:", error);
} 