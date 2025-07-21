import { createDOM } from "../index.ts";

// Simple debug test
const dom = createDOM("<html><head></head><body></body></html>");
console.log("DOM object:", dom);
console.log("DOM keys:", Object.keys(dom));
console.log("Has document?", !!dom.document);
console.log("Has window?", !!dom.window);

if (dom.document) {
  console.log("Document type:", typeof dom.document);
  console.log("Document constructor:", dom.document.constructor.name);
  console.log("Document createElement?", typeof dom.document.createElement);
} else {
  console.log("Document is undefined/null");
} 