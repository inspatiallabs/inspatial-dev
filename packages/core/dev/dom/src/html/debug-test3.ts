import { createDOM } from "../index.ts";

console.log("=== DOMParser test ===");
const { DOMParser } = createDOM("<html></html>");
const parser = new DOMParser();
const result = parser.parseFromString("<html><head></head><body></body></html>", "text/html");

console.log("Parser result type:", typeof result);
console.log("Parser result keys:", Object.keys(result));
console.log("Has defaultView?", !!result.defaultView);

if (result.defaultView) {
  console.log("DefaultView type:", typeof result.defaultView);
  console.log("DefaultView keys:", Object.keys(result.defaultView));
  console.log("DefaultView has document?", !!result.defaultView.document);
  console.log("DefaultView has window?", !!result.defaultView.window);
  
  // Check if defaultView IS the document
  console.log("DefaultView === result?", result.defaultView === result);
  console.log("DefaultView.document === result?", result.defaultView.document === result);
} 