import { createIsolatedDOM } from "../test-helpers.ts";
import { ignoreCase, localCase } from "../shared/util/utils.ts";

const dom = createIsolatedDOM();
console.log("=== ignoreCase function test ===");

const anchor = dom.document.createElement("a");
console.log("Anchor ownerDocument:", !!anchor.ownerDocument);

// Test incorrect usage (current buggy code)
console.log("\n=== Testing incorrect ignoreCase usage ===");
try {
  // @ts-ignore - Testing incorrect usage
  const result = ignoreCase(anchor, "href");
  console.log("ignoreCase(anchor, 'href'):", result);
} catch (error) {
  console.log("Error with ignoreCase(anchor, 'href'):", (error as Error).message);
}

// Test correct usage
console.log("\n=== Testing correct ignoreCase usage ===");
try {
  const result = ignoreCase({ ownerDocument: anchor.ownerDocument as any });
  console.log("ignoreCase({ ownerDocument }):", result);
} catch (error) {
  console.log("Error with correct ignoreCase:", (error as Error).message);
}

// Test localCase function
console.log("\n=== Testing localCase function ===");
try {
  const result = localCase({ 
    localName: "href", 
    ownerDocument: anchor.ownerDocument as any
  });
  console.log("localCase({ localName: 'href', ownerDocument }):", result);
} catch (error) {
  console.log("Error with localCase:", (error as Error).message);
} 