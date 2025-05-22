import { createIsolatedDOM } from "../test-helpers.ts";
import { createDOM } from "../index.ts";

// Test the createDOM function directly
console.log("=== createDOM direct test ===");
const directResult = createDOM("<html><head></head><body></body></html>");
console.log("Direct result keys:", Object.keys(directResult));
console.log("Direct result has document?", !!directResult.document);
console.log("Direct result has window?", !!directResult.window);

// Test the createIsolatedDOM function
console.log("\n=== createIsolatedDOM test ===");
const dom = createIsolatedDOM();
console.log("DOM keys:", Object.keys(dom));
console.log("Has document?", !!dom.document);
console.log("Has window?", !!dom.window);

if (dom.document) {
  console.log("Document type:", typeof dom.document);
  console.log("Document createElement?", typeof dom.document.createElement);
} else {
  console.log("Document is undefined/null");
}

if (dom.window) {
  console.log("Window type:", typeof dom.window);
  console.log("Window.document?", !!dom.window.document);
  if (dom.window.document) {
    console.log("Window.document createElement?", typeof dom.window.document.createElement);
  }
} 