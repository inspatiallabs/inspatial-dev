/**
 * InSpatial Container System - Virtual File System Tests
 * 
 * Tests for the virtual file system implementation using InSpatial Test.
 */

import { test, expect } from "@inspatial/test";
import { MemoryFileSystem } from "./memory-fs.ts";
import { VfsPath } from "./path.ts";
import { createVirtualFileSystem, VirtualFsImpl } from "./index.ts";

/**
 * Helper function to get file system structure for snapshots
 */
async function getFsStructure(vfs: VirtualFsImpl, dir: string = "/"): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  
  try {
    const entries = await vfs.readdirWithFileTypes(dir);
    
    for (const entry of entries) {
      const path = dir === "/" ? `/${entry.name}` : `${dir}/${entry.name}`;
      
      if (entry.isDirectory()) {
        result[path] = await getFsStructure(vfs, path);
      } else if (entry.isFile()) {
        try {
          const content = await vfs.readFile(path);
          result[path] = new TextDecoder().decode(content);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result[path] = `ERROR: ${errorMessage}`;
        }
      } else if (entry.isSymlink()) {
        try {
          const target = await vfs.readlink(path);
          result[path] = `SYMLINK -> ${target}`;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result[path] = `ERROR: ${errorMessage}`;
        }
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: errorMessage };
  }
  
  return result;
}

test("VirtualFileSystem can initialize with containerId", async () => {
  const vfs = await createVirtualFileSystem("test-container");
  
  // Verify standard directories are created
  const entries = await vfs.readdir("/");
  expect(entries).toContain("bin");
  expect(entries).toContain("home");
  expect(entries).toContain("tmp");
  expect(entries).toContain("etc");
  expect(entries).toContain("usr");
  expect(entries).toContain("var");
  
  // Test writing and reading a file
  const content = new TextEncoder().encode("Hello from Virtual FS");
  await vfs.writeFile("/test.txt", content);
  
  const data = await vfs.readFile("/test.txt");
  const text = new TextDecoder().decode(data);
  
  expect(text).toBe("Hello from Virtual FS");
  
  // Cleanup
  await vfs.cleanup("test-container");
});

test("VirtualFileSystem can create and read files", async () => {
  const vfs = await createVirtualFileSystem("test-container");
  
  // Make sure home directory exists
  await vfs.mkdir("/home", { recursive: true });
  
  // Create a test file
  const content = new TextEncoder().encode("Hello, Virtual World!");
  await vfs.writeFile("/home/test.txt", content);
  
  // Read the file
  const data = await vfs.readFile("/home/test.txt");
  const text = new TextDecoder().decode(data);
  
  // Verify content matches
  expect(text).toBe("Hello, Virtual World!");
  
  // Cleanup
  await vfs.cleanup("test-container");
});

test("VirtualFileSystem can map virtual paths", async () => {
  const vfs = await createVirtualFileSystem("test-container");
  
  // Create home directory first
  await vfs.mkdir("/home", { recursive: true });
  
  // Create a file in the home directory
  const content = new TextEncoder().encode("Real content");
  await vfs.writeFile("/home/real-location.txt", content);
  
  // Verify we can read the real file
  const data = await vfs.readFile("/home/real-location.txt");
  const text = new TextDecoder().decode(data);
  expect(text).toBe("Real content");
  
  // Cleanup
  await vfs.cleanup("test-container");
}); 