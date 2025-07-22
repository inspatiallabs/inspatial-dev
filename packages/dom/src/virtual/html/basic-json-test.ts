console.log("Starting basic JSON test...");

async function runTest() {
  try {
    console.log("Importing createIsolatedDOM...");
    const { createIsolatedDOM } = await import("../test-helpers.ts");
    
    console.log("Creating DOM...");
    const dom = createIsolatedDOM();
    
    console.log("Creating button...");
    const button = dom.document.createElement("button");
    
    console.log("Setting attribute...");
    button.setAttribute("disabled", "");
    
    console.log("Setting text content...");
    button.textContent = "click me";
    
    console.log("Testing toJSON...");
    const toJsonResult = (button as any).toJSON();
    console.log("toJSON result:", toJsonResult);
    
    console.log("Converting toJSON to string...");
    const toJsonString = JSON.stringify(toJsonResult);
    console.log("toJSON string:", toJsonString);
    
    console.log("Testing JSON.stringify directly...");
    try {
      const directJson = JSON.stringify(button);
      console.log("Direct JSON.stringify result length:", directJson.length);
      console.log("Direct JSON.stringify preview:", directJson.substring(0, 100));
    } catch (jsonError) {
      console.error("Direct JSON.stringify failed:", jsonError);
    }
    
  } catch (error) {
    console.error("Error in basic JSON test:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
  }
}

runTest(); 