(async () => {
  console.log("=== Starting minimal debug ===");

  try {
    console.log("About to import createDOM...");
    const { createDOM } = await import("./src/index.ts");
    console.log("Successfully imported createDOM");
    
    console.log("About to call createDOM...");
    const result = createDOM("<html></html>");
    console.log("createDOM returned:", typeof result);
    
  } catch (error) {
    console.error("Error in minimal debug:", error);
  }

  console.log("=== End minimal debug ===");
})(); 