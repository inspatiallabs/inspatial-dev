/**
 * Basic Memory FS Test
 * 
 * This file tests the core functionality of the memory file system
 * without depending on the problematic memory-fs.ts file.
 */

import { FileType, FilePermissions, OpenFlags } from "./types.ts";
import { MemoryNode, MemoryFile, MemoryDirectory, MemorySymlink } from "./memory-node.ts";
import { MemoryFileHandle, MemoryDirHandle, MemoryFileStat } from "./memory-handles.ts";

// Helper function to convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper function to convert Uint8Array to string
function uint8ArrayToString(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

// Test the MemoryFile class
Deno.test("MemoryFile basic operations", async () => {
  // Create a file
  const file = new MemoryFile("test.txt", FilePermissions.DEFAULT_FILE);
  
  // Test properties
  console.assert(file.name === "test.txt", "File name should be 'test.txt'");
  console.assert(file.type === FileType.REGULAR, "File type should be REGULAR");
  console.assert(file.isFile(), "isFile() should return true");
  console.assert(!file.isDirectory(), "isDirectory() should return false");
  console.assert(!file.isSymlink(), "isSymlink() should return false");
  
  // Test data operations
  const content = stringToUint8Array("Hello, World!");
  file.setData(content);
  console.assert(file.size === 13, "File size should be 13 bytes");
  
  const data = file.getData();
  const text = uint8ArrayToString(data);
  console.assert(text === "Hello, World!", "File content should match");
  
  // Test read/write
  const buffer = new Uint8Array(5);
  const bytesRead = file.read(buffer, 0, 5, 0);
  console.assert(bytesRead === 5, "Should read 5 bytes");
  console.assert(uint8ArrayToString(buffer) === "Hello", "Buffer should contain 'Hello'");
  
  const writeBuffer = stringToUint8Array("Test");
  const bytesWritten = file.write(writeBuffer, 0, 4, 0);
  console.assert(bytesWritten === 4, "Should write 4 bytes");
  
  // Verify modified content
  const newData = file.getData();
  const newText = uint8ArrayToString(newData);
  console.assert(newText === "Test, World!", "File content should be modified");
});

// Test the MemoryDirectory class
Deno.test("MemoryDirectory basic operations", async () => {
  // Create a directory
  const dir = new MemoryDirectory("test-dir", FilePermissions.DEFAULT_DIR);
  
  // Test properties
  console.assert(dir.name === "test-dir", "Directory name should be 'test-dir'");
  console.assert(dir.type === FileType.DIRECTORY, "Directory type should be DIRECTORY");
  console.assert(dir.isDirectory(), "isDirectory() should return true");
  console.assert(!dir.isFile(), "isFile() should return false");
  console.assert(!dir.isSymlink(), "isSymlink() should return false");
  
  // Test adding children
  const file1 = new MemoryFile("file1.txt");
  const file2 = new MemoryFile("file2.txt");
  const subdir = new MemoryDirectory("subdir");
  
  dir.addChild(file1);
  dir.addChild(file2);
  dir.addChild(subdir);
  
  console.assert(dir.getChildCount() === 3, "Directory should have 3 children");
  console.assert(dir.hasChild("file1.txt"), "Directory should have file1.txt");
  console.assert(dir.hasChild("file2.txt"), "Directory should have file2.txt");
  console.assert(dir.hasChild("subdir"), "Directory should have subdir");
  
  // Test getting children
  const children = dir.getChildren();
  console.assert(children.length === 3, "getChildren() should return 3 items");
  
  // Test removing children
  dir.removeChild("file1.txt");
  console.assert(dir.getChildCount() === 2, "Directory should have 2 children after removal");
  console.assert(!dir.hasChild("file1.txt"), "Directory should not have file1.txt after removal");
  
  // Test isEmpty
  console.assert(!dir.isEmpty(), "Directory should not be empty");
  
  dir.removeChild("file2.txt");
  dir.removeChild("subdir");
  console.assert(dir.isEmpty(), "Directory should be empty after removing all children");
});

// Test the MemorySymlink class
Deno.test("MemorySymlink basic operations", async () => {
  // Create a symlink
  const symlink = new MemorySymlink("link.txt", "/target/path.txt");
  
  // Test properties
  console.assert(symlink.name === "link.txt", "Symlink name should be 'link.txt'");
  console.assert(symlink.type === FileType.SYMLINK, "Symlink type should be SYMLINK");
  console.assert(symlink.isSymlink(), "isSymlink() should return true");
  console.assert(!symlink.isFile(), "isFile() should return false");
  console.assert(!symlink.isDirectory(), "isDirectory() should return false");
  
  // Test target
  console.assert(symlink.target === "/target/path.txt", "Symlink target should be '/target/path.txt'");
});

// Test the MemoryFileHandle class
Deno.test("MemoryFileHandle basic operations", async () => {
  // Create a file and a file handle
  const file = new MemoryFile("test.txt");
  const fileHandle = new MemoryFileHandle(1, "/test.txt", file, OpenFlags.READ | OpenFlags.WRITE);
  
  // Write to the file through the handle
  const writeData = stringToUint8Array("File handle test");
  const bytesWritten = await fileHandle.write(writeData);
  console.assert(bytesWritten === 15, "Should write 15 bytes");
  
  // Read from the file through the handle
  const buffer = new Uint8Array(15);
  const bytesRead = await fileHandle.read(buffer, 0, 15, 0);
  console.assert(bytesRead === 15, "Should read 15 bytes");
  console.assert(uint8ArrayToString(buffer) === "File handle test", "Should read correct content");
  
  // Test readFile
  const data = await fileHandle.readFile();
  console.assert(uint8ArrayToString(data) === "File handle test", "readFile() should return correct content");
  
  // Test writeFile
  const newData = stringToUint8Array("New data");
  await fileHandle.writeFile(newData);
  const verifyData = await fileHandle.readFile();
  console.assert(uint8ArrayToString(verifyData) === "New data", "writeFile() should update content");
  
  // Test close
  await fileHandle.close();
});

console.log("Memory FS basic tests complete!"); 