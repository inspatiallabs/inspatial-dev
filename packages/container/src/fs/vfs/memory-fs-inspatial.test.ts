/**
 * InSpatial Container System - In-Memory File System Tests
 * 
 * Tests for the in-memory file system implementation using InSpatial Test.
 */

import { test, expect } from "@inspatial/test";
import { MemoryFileSystem } from "./memory-fs.ts";
import { FilePermissions } from "./types.ts";

// Basic file operations test
test("MemoryFileSystem can create and read files", async () => {
  const fs = new MemoryFileSystem("test");
  
  // Create a test file
  const content = new TextEncoder().encode("Hello, World!");
  await fs.writeFile("/test.txt", content);
  
  // Read the file
  const data = await fs.readFile("/test.txt");
  const text = new TextDecoder().decode(data);
  
  // Verify content
  expect(text).toBe("Hello, World!");
});

// Directory and nested file operations test
test("MemoryFileSystem can create and navigate directories", async () => {
  const fs = new MemoryFileSystem("test");
  
  // Create test directories
  await fs.mkdir("/dir1", { recursive: true });
  await fs.mkdir("/dir1/dir2", { recursive: true });
  
  // Write a file in a subdirectory
  const content = new TextEncoder().encode("Nested file");
  await fs.writeFile("/dir1/file1.txt", content);
  await fs.writeFile("/dir1/dir2/file2.txt", new TextEncoder().encode("Deeply nested"));
  
  // Read directory contents
  const entries = await fs.readdir("/dir1");
  expect(entries).toContain("file1.txt");
  expect(entries).toContain("dir2");
  
  // Read file in subdirectory
  const data = await fs.readFile("/dir1/file1.txt");
  const text = new TextDecoder().decode(data);
  expect(text).toBe("Nested file");
  
  // Read deeply nested file
  const nestedData = await fs.readFile("/dir1/dir2/file2.txt");
  const nestedText = new TextDecoder().decode(nestedData);
  expect(nestedText).toBe("Deeply nested");
});

// File modification test
test("MemoryFileSystem can modify files", async () => {
  const fs = new MemoryFileSystem("test");
  
  // Create a test file
  const content = new TextEncoder().encode("Initial content");
  await fs.writeFile("/test.txt", content);
  
  // Read the file
  let data = await fs.readFile("/test.txt");
  let text = new TextDecoder().decode(data);
  expect(text).toBe("Initial content");
  
  // Modify the file
  const newContent = new TextEncoder().encode("Modified content");
  await fs.writeFile("/test.txt", newContent);
  
  // Read the file again
  data = await fs.readFile("/test.txt");
  text = new TextDecoder().decode(data);
  expect(text).toBe("Modified content");
});

// Symlink test
test("MemoryFileSystem can create and follow symbolic links", async () => {
  const fs = new MemoryFileSystem("test");
  
  // Create a target file
  const content = new TextEncoder().encode("Target content");
  await fs.writeFile("/target.txt", content);
  
  // Create a symbolic link
  await fs.symlink("/target.txt", "/link.txt");
  
  // Read the target through the link
  const data = await fs.readFile("/link.txt");
  const text = new TextDecoder().decode(data);
  expect(text).toBe("Target content");
  
  // Verify the link target
  const target = await fs.readlink("/link.txt");
  expect(target).toBe("/target.txt");
});

// Permissions test
test("MemoryFileSystem respects file permissions", async () => {
  const fs = new MemoryFileSystem("test");
  
  // Create a read-only file
  const content = new TextEncoder().encode("Read-only content");
  await fs.writeFile("/readonly.txt", content, { mode: FilePermissions.READ_ONLY });
  
  // Set current user to non-root
  fs.setUserId(1000);
  fs.setGroupId(1000);
  
  // Verify the file can be read
  const canRead = await fs.access("/readonly.txt", 4); // READ
  expect(canRead).toBe(true);
  
  // Verify the file can't be written
  const canWrite = await fs.access("/readonly.txt", 2); // WRITE
  expect(canWrite).toBe(false);
}); 