(async () => {
  console.log("=== Direct test starting ===");

  try {
    console.log("Testing direct import...");
    
    // Try importing DOMParser directly
    const { DOMParser } = await import("./src/document/parser.ts");
    console.log("DOMParser imported successfully");
    
    // Try creating a parser
    const parser = new DOMParser();
    console.log("DOMParser created successfully");
    
    // Try parsing simple HTML
    const doc = parser.parseFromString("<html></html>", "text/html");
    console.log("Parsing completed, doc type:", typeof doc);
    
  } catch (error) {
    console.error("Error in direct test:", error);
  }

  console.log("=== Direct test complete ===");
})(); 