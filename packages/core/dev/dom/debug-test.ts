import { createDOM } from "./src/index.ts";
import { PREV, NEXT, END } from "./src/shared/symbols.ts";
import { previousSibling, nextSibling } from "./src/shared/node.ts";
import { getEnd } from "./src/shared/util/utils.ts";
import { ELEMENT_NODE, NODE_END } from "./src/shared/constants.ts";

// Simple test to debug the DOM structure
const { document } = createDOM("<html></html>");

console.log("=== Initial document ===");
console.log("documentElement:", document.documentElement?.localName);

// Set innerHTML
document.documentElement!.innerHTML = "<div></div><input><p />";

console.log("\n=== After setting innerHTML ===");
console.log("documentElement children:", document.documentElement?.childNodes.length);

// Get the elements
const div = document.getElementsByTagName("div")[0];
const input = document.querySelector("input");
const allInputs = document.getElementsByTagName("input");

console.log("\n=== Elements ===");
console.log("div:", div?.localName);
console.log("input:", input?.localName);
console.log("allInputs.length:", allInputs?.length);
console.log("allInputs[0]:", allInputs?.[0]?.localName);

// Use the first input from getElementsByTagName if querySelector fails
const inputElement = input || allInputs?.[0];

console.log("\n=== Debug DOM structure ===");
console.log("div[PREV]:", (div as any)?.[PREV]?.localName || (div as any)?.[PREV]?.nodeType);
console.log("div[NEXT]:", (div as any)?.[NEXT]?.localName || (div as any)?.[NEXT]?.nodeType);
console.log("div[END]:", (div as any)?.[END]?.localName || (div as any)?.[END]?.nodeType);
if (inputElement) {
  console.log("input[PREV]:", (inputElement as any)?.[PREV]?.localName || (inputElement as any)?.[PREV]?.nodeType);
  console.log("input[NEXT]:", (inputElement as any)?.[NEXT]?.localName || (inputElement as any)?.[NEXT]?.nodeType);
  console.log("input[END]:", (inputElement as any)?.[END]?.localName || (inputElement as any)?.[END]?.nodeType);
}

console.log("\n=== Test direct NEXT vs getEnd approach ===");
console.log("div[NEXT] directly:", (div as any)?.[NEXT]?.localName || (div as any)?.[NEXT]?.nodeType);
const divEnd = getEnd(div as any);
console.log("getEnd(div)[NEXT]:", (divEnd as any)?.[NEXT]?.localName || (divEnd as any)?.[NEXT]?.nodeType);

console.log("\n=== Test nextSibling logic manually ===");
const directNext = (div as any)?.[NEXT];
console.log("directNext:", directNext?.localName || directNext?.nodeType);
console.log("directNext.nodeType === NODE_END:", directNext?.nodeType === NODE_END);

const endNext = getEnd(div as any)[NEXT];
console.log("endNext:", endNext?.localName || endNext?.nodeType);
console.log("endNext.nodeType === NODE_END:", endNext?.nodeType === NODE_END);

console.log("\n=== Navigation ===");
if (inputElement) {
  console.log("input.previousElementSibling:", inputElement?.previousElementSibling?.localName);
}
console.log("div.nextElementSibling:", div?.nextElementSibling?.localName);

console.log("\n=== Parent relationships ===");
console.log("div.parentNode:", div?.parentNode?.localName);
if (inputElement) {
  console.log("input.parentNode:", inputElement?.parentNode?.localName);
}

console.log("\n=== Debug getEnd and nextSibling ===");
console.log("getEnd(div):", divEnd?.localName || divEnd?.nodeType);
console.log("divEnd === div[END]:", divEnd === (div as any)?.[END]);
console.log("divEnd[NEXT]:", (divEnd as any)?.[NEXT]?.localName || (divEnd as any)?.[NEXT]?.nodeType);
const divNextSibling = nextSibling(div as any);
console.log("nextSibling(div):", divNextSibling?.localName || divNextSibling?.nodeType);

console.log("\n=== Direct previousSibling test ===");
if (inputElement) {
  const inputPrevSibling = previousSibling(inputElement);
  console.log("previousSibling(input):", inputPrevSibling?.localName || inputPrevSibling?.nodeType);
  console.log("input[PREV] nodeType:", (inputElement as any)?.[PREV]?.nodeType);
}

console.log("\n=== All children ===");
const children = document.documentElement?.childNodes;
if (children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    console.log(`Child ${i}:`, child.localName || `#${child.nodeType}`, child.textContent?.trim() || '');
  }
} 