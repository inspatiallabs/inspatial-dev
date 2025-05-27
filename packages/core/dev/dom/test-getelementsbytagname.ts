(async () => {
  console.log("=== Testing getElementsByTagName fix ===");

  try {
    // Import DOMParser directly since createDOM is hanging
    const { DOMParser } = await import("./src/document/parser.ts");
    
    // Create a simple document
    const parser = new DOMParser();
    const doc = parser.parseFromString("<html><body><div>Test</div><span>Another</span></body></html>", "text/html");
    
    console.log("Document created successfully");
    console.log("Document type:", typeof doc);
    console.log("Document localName:", doc.localName);
    
    // Test getElementsByTagName
    console.log("\n=== Testing getElementsByTagName ===");
    
    const divs = doc.getElementsByTagName("div");
    console.log("getElementsByTagName('div') result:", divs);
    console.log("Number of divs found:", divs.length);
    
    const spans = doc.getElementsByTagName("span");
    console.log("getElementsByTagName('span') result:", spans);
    console.log("Number of spans found:", spans.length);
    
    const all = doc.getElementsByTagName("*");
    console.log("getElementsByTagName('*') result:", all);
    console.log("Number of all elements found:", all.length);
    
    // Test if we can access the elements
    if (divs.length > 0) {
      console.log("First div localName:", divs[0]?.localName);
      console.log("First div textContent:", divs[0]?.textContent);
    }
    
  } catch (error) {
    console.error("Error in getElementsByTagName test:", error);
  }

  console.log("=== Test complete ===");
})(); 