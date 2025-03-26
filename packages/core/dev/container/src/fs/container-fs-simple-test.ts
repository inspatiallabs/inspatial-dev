/**
 * Simple test for the container file system manager
 */

import { test, assertEquals } from "@inspatial/test";
import { ContainerFsManager } from "./container-fs.ts";

// Create a simple test
test("ContainerFsManager basic operations", async () => {
  // Create a new ContainerFsManager
  const manager = new ContainerFsManager();
  
  try {
    // Initialize a file system for a test container
    const containerId = "test-container";
    const fs = await manager.initializeFilesystem(containerId);
    
    // Verify that the file system exists
    const exists = manager.hasFilesystem(containerId);
    assertEquals(exists, true);
    
    // Write a test file
    const testContent = "Hello from container FS!";
    await fs.writeFile("/test.txt", new TextEncoder().encode(testContent));
    
    // Read the file back
    const data = await fs.readFile("/test.txt");
    const content = new TextDecoder().decode(data);
    
    // Verify content
    assertEquals(content, testContent);
    
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
    
    // Get directory listing
    const entries = await fs.readdir("/");
    console.log("Root directory entries:", entries);
    
    // Verify root directory contains our test files
    assertEquals(entries.includes("test.txt"), true);
    assertEquals(entries.includes("testdir"), true);
    
    // Get nested directory listing
    const nestedEntries = await fs.readdir("/testdir");
    console.log("Nested directory entries:", nestedEntries);
    
    // Verify nested directory contains our file
    assertEquals(nestedEntries.includes("nested.txt"), true);
    
    console.log("Container FS test passed!");
  } finally {
    // Clean up
    await manager.cleanupAll();
  }
}); 