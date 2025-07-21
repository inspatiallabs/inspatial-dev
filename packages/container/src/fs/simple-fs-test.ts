/**
 * Test for the simplified file system
 */

import { test, assertEquals } from "@inspatial/test";
import { SimpleMemoryFs } from "./simple-memory-fs.ts";

test("SimpleMemoryFs basic operations", async () => {
  // Create a new file system
  const fs = new SimpleMemoryFs();
  
  // Write a test file
  const testContent = "Hello, World!";
  await fs.writeFile("/test.txt", new TextEncoder().encode(testContent));
  
  // Read the file
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
  
  // List directory contents
  const rootEntries = await fs.readdir("/");
  console.log("Root entries:", rootEntries);
  
  // Verify root directory contains our files
  assertEquals(rootEntries.includes("test.txt"), true);
  assertEquals(rootEntries.includes("testdir"), true);
  
  // List subdirectory contents
  const testdirEntries = await fs.readdir("/testdir");
  console.log("Testdir entries:", testdirEntries);
  
  // Verify subdirectory contents
  assertEquals(testdirEntries.includes("nested.txt"), true);
}); 