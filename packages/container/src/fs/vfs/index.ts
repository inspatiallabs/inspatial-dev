/**
 * InSpatial Container System - Virtual File System
 * 
 * This module provides a secure virtual file system implementation
 * for container isolation.
 */

// Re-export all VFS components
export * from "./types.ts";
export * from "./path.ts";
export { MemoryFileSystem } from "./memory-fs.ts";
export { VirtualFsImpl } from "./virtual-fs.ts";

// Export a factory function for creating a new virtual file system
import { MemoryFileSystem } from "./memory-fs.ts";
import { VirtualFsImpl } from "./virtual-fs.ts";
import { SecurityContext, VirtualFileSystem } from "./types.ts";

/**
 * Creates a new virtual file system
 * 
 * @param containerId Container ID
 * @param securityContext Security context for file operations
 * @returns A new virtual file system
 */
export async function createVirtualFileSystem(
  containerId: string,
  securityContext?: SecurityContext
): Promise<VirtualFsImpl> {
  // Create memory file systems
  const rootFs = new MemoryFileSystem(containerId + "-root");
  const memoryFs = new MemoryFileSystem(containerId + "-memory");
  
  // Create the virtual file system
  const vfs = new VirtualFsImpl(containerId + "-vfs", {
    rootFs,
    memoryFs,
    securityContext
  });
  
  // Initialize the file system
  await vfs.initialize(containerId);
  
  // Create standard directories to ensure they exist
  const standardDirs = [
    "/home",
    "/tmp",
    "/etc",
    "/usr",
    "/var"
  ];
  
  // Create each directory if it doesn't exist
  for (const dir of standardDirs) {
    try {
      await vfs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Ignore errors for directories that already exist
    }
  }
  
  return vfs;
} 