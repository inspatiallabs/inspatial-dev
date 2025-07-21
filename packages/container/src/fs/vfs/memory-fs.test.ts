/**
 * InSpatial Container System - In-Memory File System Tests
 * 
 * Simplified tests for the in-memory file system implementation.
 */

// Import directly from native Deno
import { test, assertEquals } from "@inspatial/test";
import { SimpleMemoryFs } from "../simple-memory-fs.ts";

// Basic file operations test
test("MemoryFileSystem can create and read files", async () => {
  const fs = new SimpleMemoryFs();
  
  // Create a test file
  const content = "Hello, World!";
  await fs.writeFile("/test.txt", new TextEncoder().encode(content));
  
  // Read the file
  const data = await fs.readFile("/test.txt");
  const text = new TextDecoder().decode(data);
  
  // Verify content
  assertEquals(text, content);
});

// Directory and nested file operations test
test("MemoryFileSystem can create and navigate directories", async () => {
  const fs = new SimpleMemoryFs();
  
  // Create test directories
  await fs.mkdir("/dir1", { recursive: true });
  await fs.mkdir("/dir1/dir2", { recursive: true });
  
  // Write a file in a subdirectory
  const content = "Nested file";
  await fs.writeFile("/dir1/file1.txt", new TextEncoder().encode(content));
  await fs.writeFile("/dir1/dir2/file2.txt", new TextEncoder().encode("Deeply nested"));
  
  // Read directory contents
  const entries = await fs.readdir("/dir1");
  assertEquals(entries.includes("file1.txt"), true);
  assertEquals(entries.includes("dir2"), true);
  
  // Read file in subdirectory
  const data = await fs.readFile("/dir1/file1.txt");
  const text = new TextDecoder().decode(data);
  assertEquals(text, content);
  
  // Read deeply nested file
  const nestedData = await fs.readFile("/dir1/dir2/file2.txt");
  const nestedText = new TextDecoder().decode(nestedData);
  assertEquals(nestedText, "Deeply nested");
}); 