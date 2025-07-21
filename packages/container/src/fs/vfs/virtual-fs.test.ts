/**
 * InSpatial Container System - Virtual File System Tests
 * 
 * Simplified tests for the virtual file system implementation.
 */

// Import directly from native Deno
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { SimpleMemoryFs } from "../simple-memory-fs.ts";

// Basic test to verify file operations
Deno.test("VirtualFileSystem can handle file operations", async () => {
  const fs = new SimpleMemoryFs();
  
  // Create a test file
  const content = "Hello from Virtual FS";
  await fs.writeFile("/test.txt", new TextEncoder().encode(content));
  
  // Read the file
  const data = await fs.readFile("/test.txt");
  const text = new TextDecoder().decode(data);
  
  // Verify content
  assertEquals(text, content);
  
  // List files in root directory
  const entries = await fs.readdir("/");
  console.log("Root directory entries:", entries);
  
  // Verify our test file is present
  assertEquals(entries.includes("test.txt"), true);
});

// Nested directory operations test
Deno.test("VirtualFileSystem can handle nested directories", async () => {
  const fs = new SimpleMemoryFs();
  
  // Create nested directories
  await fs.mkdir("/nested/dir", { recursive: true });
  
  // Write a file in the nested directory
  const content = "Nested file content";
  await fs.writeFile("/nested/dir/file.txt", new TextEncoder().encode(content));
  
  // Read the nested file
  const data = await fs.readFile("/nested/dir/file.txt");
  const text = new TextDecoder().decode(data);
  
  // Verify content
  assertEquals(text, content);
  
  // List files in the nested directory
  const entries = await fs.readdir("/nested/dir");
  console.log("Nested directory entries:", entries);
  
  // Verify our test file is present
  assertEquals(entries.includes("file.txt"), true);
}); 