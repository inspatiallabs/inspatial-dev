import { createDOM } from "./src/index.ts";

console.log("=== Testing basic DOM creation ===");

try {
  const result = createDOM("<html><body></body></html>");
  console.log("DOM creation result:", typeof result);
  console.log("Has document:", !!result.document);
  console.log("Document type:", typeof result.document);
  
  if (result.document) {
    console.log("Document documentElement:", !!result.document.documentElement);
    console.log("DocumentElement type:", typeof result.document.documentElement);
    console.log("DocumentElement localName:", result.document.documentElement?.localName);
  }
} catch (error) {
  console.error("Error creating DOM:", error);
} 