import { createIsolatedDOM } from "../test-helpers.ts";

try {
  console.log("Step 1: Creating DOM...");
  const dom = createIsolatedDOM();
  console.log("✓ DOM created");

  console.log("Step 2: Creating button...");
  const button = dom.document.createElement("button");
  console.log("✓ Button created:", button.localName);

  console.log("Step 3: Setting attribute...");
  button.setAttribute("disabled", "");
  console.log("✓ Attribute set");
  console.log("  hasAttribute:", button.hasAttribute("disabled"));

  console.log("Step 4: Setting text content...");
  button.textContent = "click me";
  console.log("✓ Text content set");
  console.log("  textContent:", button.textContent);

  console.log("Step 5: Testing JSON...");
  const json = (button as any).toJSON();
  console.log("✓ JSON result:", JSON.stringify(json));

} catch (error) {
  console.error("Error occurred:", error);
  if (error instanceof Error) {
    console.error("Stack:", error.stack);
  }
} 