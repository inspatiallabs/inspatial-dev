/**
 * InSpatial Container System - Container File System Manager Tests
 * 
 * Simplified tests for the container file system manager.
 */
import { test, assertEquals } from "@inspatial/test";
import { SimpleMemoryFs } from "./simple-memory-fs.ts";

// Basic container manager test
test("ContainerFsManager basic operations", async () => {
  const fs = new SimpleMemoryFs();
  
  try {
    // Write a test file
    const content = "Hello from Container FS!";
    await fs.writeFile("/test.txt", new TextEncoder().encode(content));
    
    // Read the file
    const data = await fs.readFile("/test.txt");
    const text = new TextDecoder().decode(data);
    
    // Verify content
    assertEquals(text, content);
    
    // Create a directory
    await fs.mkdir("/testdir", { recursive: true });
    
    // Write a file in the directory
    const nestedContent = "Nested file content";
    await fs.writeFile("/testdir/nested.txt", new TextEncoder().encode(nestedContent));
    
    // Read the nested file
    const nestedData = await fs.readFile("/testdir/nested.txt");
    const nestedText = new TextDecoder().decode(nestedData);
    
    // Verify nested content
    assertEquals(nestedText, nestedContent);
    
    // List directory contents
    const entries = await fs.readdir("/");
    console.log("Root directory entries:", entries);
    
    // Verify directory contents
    assertEquals(entries.includes("test.txt"), true);
    assertEquals(entries.includes("testdir"), true);
  } finally {
    // No cleanup needed for SimpleMemoryFs
  }
}); 