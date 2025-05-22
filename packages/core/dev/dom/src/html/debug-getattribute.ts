import { createIsolatedDOM } from "../test-helpers.ts";
import { ignoreCase } from "../shared/util/utils.ts";

const dom = createIsolatedDOM();
console.log("=== Debug getAttributeNode ===");

const anchor = dom.document.createElement("a");
anchor.setAttribute("href", "https://xr.new");

console.log("\n1. After setAttribute:");
console.log("- anchor.attributes.length:", anchor.attributes.length);
console.log("- First attribute name:", anchor.attributes[0]?.name);
console.log("- First attribute value:", anchor.attributes[0]?.value);

console.log("\n2. Testing ignoreCase function:");
const originalName = "href";

// Test what ignoreCase returns
try {
  // @ts-ignore - Testing incorrect usage
  const ignoreCaseResult = ignoreCase(anchor, originalName);
  console.log("- ignoreCase(anchor, 'href'):", ignoreCaseResult);
  console.log("- typeof result:", typeof ignoreCaseResult);
} catch (error) {
  console.log("- ignoreCase error:", (error as Error).message);
}

// Test correct ignoreCase usage
try {
  const correctIgnoreCase = ignoreCase({ ownerDocument: anchor.ownerDocument as any });
  console.log("- ignoreCase({ ownerDocument }):", correctIgnoreCase);
  
  // What should the name be?
  const shouldBeLowercase = correctIgnoreCase;
  const processedName = shouldBeLowercase ? originalName.toLowerCase() : originalName;
  console.log("- processed name should be:", processedName);
} catch (error) {
  console.log("- correct ignoreCase error:", (error as Error).message);
}

console.log("\n3. Manual attribute search:");
const map = anchor.attributes;
console.log("- map.length:", map.length);
for (let i = 0; i < map.length; i++) {
  const attr = map[i];
  console.log(`- attr[${i}].name:`, attr.name);
  console.log(`- attr[${i}].value:`, attr.value);
  console.log(`- Compare 'href' === '${attr.name}':`, "href" === attr.name);
  console.log(`- Compare 'HREF' === '${attr.name}':`, "HREF" === attr.name);
}

console.log("\n4. Test getAttribute result:");
const result = anchor.getAttribute("href");
console.log("- getAttribute('href'):", result);
console.log("- getAttribute('HREF'):", anchor.getAttribute("HREF")); 