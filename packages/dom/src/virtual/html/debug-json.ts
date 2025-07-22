import { createIsolatedDOM } from "../test-helpers.ts";

console.log("=== JSON Serialization Debug ===");

const dom = createIsolatedDOM();
console.log("DOM created");

// Create button element
const button = dom.document.createElement("button");
console.log("Button created:", button.localName);

// Set disabled attribute  
button.setAttribute("disabled", "");
console.log("Disabled attribute set");

// Check that attribute was set
console.log("hasAttribute('disabled'):", button.hasAttribute("disabled"));
console.log("getAttribute('disabled'):", button.getAttribute("disabled"));

// Set text content
button.textContent = "click me";
console.log("Text content set");
console.log("textContent:", button.textContent);

// Check JSON serialization
console.log("Calling toJSON...");
try {
  const jsonResult = (button as any).toJSON();
  console.log("JSON result:", jsonResult);
  console.log("JSON stringified:", JSON.stringify(jsonResult));
} catch (error) {
  console.error("JSON error:", error);
}

// Check JSON.stringify directly on button
console.log("Calling JSON.stringify on button...");
try {
  const jsonString = JSON.stringify(button);
  console.log("JSON.stringify result:", jsonString.substring(0, 200) + "...");
} catch (error) {
  console.error("JSON.stringify error:", error);
}

// Check DOM structure  
console.log("button.childNodes.length:", button.childNodes.length);
console.log("button.attributes.length:", button.attributes.length);

// Check NEXT chain
console.log("button[NEXT]:", (button as any)[Symbol.for("next")]);
console.log("button[END]:", (button as any)[Symbol.for("end")]); 