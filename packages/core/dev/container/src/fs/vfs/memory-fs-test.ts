/**
 * InSpatial Container System - In-Memory File System Tests
 * 
 * Tests for the fixed in-memory file system implementation.
 */

import { MemoryFileSystem } from "./memory-fs.ts";
import { FilePermissions, OpenFlags } from "./types.ts";

/**
 * Helper function to convert string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Helper function to convert Uint8Array to string
 */
function uint8ArrayToString(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

/**
 * Run tests for the memory file system
 */
async function runTests() {
  console.log("Running memory file system tests...");
  
  // Create a new file system instance
  const fs = new MemoryFileSystem("test");
  
  try {
    // Test 1: Create and read files
    console.log("Test 1: Create and read files");
    const content = stringToUint8Array("Hello, World!");
    await fs.writeFile("/test.txt", content);
    
    const data = await fs.readFile("/test.txt");
    const text = uint8ArrayToString(data);
    
    if (text !== "Hello, World!") {
      throw new Error(`File content mismatch: ${text}`);
    }
    console.log("✓ File created and read successfully");
    
    // Test 2: Directory operations
    console.log("Test 2: Directory operations");
    await fs.mkdir("/dir1", { recursive: true });
    await fs.mkdir("/dir1/dir2", { recursive: true });
    
    const nestedContent = stringToUint8Array("Nested file");
    await fs.writeFile("/dir1/file1.txt", nestedContent);
    
    const deeplyNestedContent = stringToUint8Array("Deeply nested");
    await fs.writeFile("/dir1/dir2/file2.txt", deeplyNestedContent);
    
    const entries = await fs.readdir("/dir1");
    if (!entries.includes("file1.txt") || !entries.includes("dir2")) {
      throw new Error(`Directory entries mismatch: ${entries.join(", ")}`);
    }
    
    const nestedData = await fs.readFile("/dir1/file1.txt");
    const nestedText = uint8ArrayToString(nestedData);
    if (nestedText !== "Nested file") {
      throw new Error(`Nested file content mismatch: ${nestedText}`);
    }
    
    const deeplyNestedData = await fs.readFile("/dir1/dir2/file2.txt");
    const deeplyNestedText = uint8ArrayToString(deeplyNestedData);
    if (deeplyNestedText !== "Deeply nested") {
      throw new Error(`Deeply nested file content mismatch: ${deeplyNestedText}`);
    }
    console.log("✓ Directory operations successful");
    
    // Test 3: File modification
    console.log("Test 3: File modification");
    const initialContent = stringToUint8Array("Initial content");
    await fs.writeFile("/modify.txt", initialContent);
    
    let modifyData = await fs.readFile("/modify.txt");
    let modifyText = uint8ArrayToString(modifyData);
    if (modifyText !== "Initial content") {
      throw new Error(`Initial content mismatch: ${modifyText}`);
    }
    
    const modifiedContent = stringToUint8Array("Modified content");
    await fs.writeFile("/modify.txt", modifiedContent);
    
    modifyData = await fs.readFile("/modify.txt");
    modifyText = uint8ArrayToString(modifyData);
    if (modifyText !== "Modified content") {
      throw new Error(`Modified content mismatch: ${modifyText}`);
    }
    console.log("✓ File modification successful");
    
    // Test 4: Symlinks
    console.log("Test 4: Symlinks");
    const targetContent = stringToUint8Array("Target content");
    await fs.writeFile("/target.txt", targetContent);
    
    await fs.symlink("/target.txt", "/link.txt");
    
    const linkData = await fs.readFile("/link.txt");
    const linkText = uint8ArrayToString(linkData);
    if (linkText !== "Target content") {
      throw new Error(`Symlink content mismatch: ${linkText}`);
    }
    
    const target = await fs.readlink("/link.txt");
    if (target !== "/target.txt") {
      throw new Error(`Symlink target mismatch: ${target}`);
    }
    console.log("✓ Symlinks working correctly");
    
    // Test 5: Permissions
    console.log("Test 5: Permissions");
    const readOnlyContent = stringToUint8Array("Read-only content");
    await fs.writeFile("/readonly.txt", readOnlyContent, { mode: FilePermissions.READ_ONLY });
    
    fs.setUserId(1000); // Non-root user
    fs.setGroupId(1000);
    
    const canRead = await fs.access("/readonly.txt", 4); // READ
    if (!canRead) {
      throw new Error("Should be able to read file");
    }
    
    const canWrite = await fs.access("/readonly.txt", 2); // WRITE
    if (canWrite) {
      throw new Error("Should not be able to write to read-only file");
    }
    
    // Reset to root
    fs.setUserId(0);
    fs.setGroupId(0);
    console.log("✓ Permissions working correctly");
    
    // Test 6: File deletion
    console.log("Test 6: File deletion");
    const deleteContent = stringToUint8Array("Delete me");
    await fs.writeFile("/delete.txt", deleteContent);
    
    const existsBeforeDelete = await fs.access("/delete.txt");
    if (!existsBeforeDelete) {
      throw new Error("File should exist before deletion");
    }
    
    await fs.unlink("/delete.txt");
    
    const existsAfterDelete = await fs.access("/delete.txt");
    if (existsAfterDelete) {
      throw new Error("File should not exist after deletion");
    }
    console.log("✓ File deletion successful");
    
    // Test 7: Directory removal
    console.log("Test 7: Directory removal");
    await fs.mkdir("/emptydir", { recursive: true });
    await fs.mkdir("/nonemptydir", { recursive: true });
    await fs.writeFile("/nonemptydir/file.txt", stringToUint8Array("File in directory"));
    
    // Remove empty directory
    await fs.rmdir("/emptydir");
    const emptyDirExists = await fs.access("/emptydir");
    if (emptyDirExists) {
      throw new Error("Empty directory should be removed");
    }
    
    // Try to remove non-empty directory without recursive flag
    let errorThrown = false;
    try {
      await fs.rmdir("/nonemptydir");
    } catch (error) {
      errorThrown = true;
    }
    if (!errorThrown) {
      throw new Error("Should not be able to remove non-empty directory without recursive flag");
    }
    
    // Remove non-empty directory with recursive flag
    await fs.rmdir("/nonemptydir", { recursive: true });
    const nonEmptyDirExists = await fs.access("/nonemptydir");
    if (nonEmptyDirExists) {
      throw new Error("Non-empty directory should be removed with recursive flag");
    }
    console.log("✓ Directory removal successful");
    
    // Test 8: File handles
    console.log("Test 8: File handles");
    const handleContent = stringToUint8Array("File handle test");
    await fs.writeFile("/handle.txt", handleContent);
    
    const handle = await fs.open("/handle.txt", OpenFlags.READ | OpenFlags.WRITE);
    
    // Read from handle
    const readBuffer = new Uint8Array(15);
    const bytesRead = await handle.read(readBuffer, 0, 15, 0);
    if (bytesRead !== 15) {
      throw new Error(`Expected to read 15 bytes, got ${bytesRead}`);
    }
    
    const handleText = uint8ArrayToString(readBuffer);
    if (handleText !== "File handle test") {
      throw new Error(`Handle read content mismatch: ${handleText}`);
    }
    
    // Write to handle
    const writeBuffer = stringToUint8Array("Updated");
    await handle.write(writeBuffer, 0, 7, 0);
    
    // Read again to verify
    await handle.close();
    
    const updatedData = await fs.readFile("/handle.txt");
    const updatedText = uint8ArrayToString(updatedData);
    if (updatedText !== "Updatedhandle test") {
      throw new Error(`Handle write content mismatch: ${updatedText}`);
    }
    console.log("✓ File handles working correctly");
    
    console.log("All tests passed!");
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

// Run the tests
runTests().catch(console.error); 