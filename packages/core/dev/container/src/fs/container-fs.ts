/**
 * InSpatial Container System - Container File System Integration
 * 
 * This file provides integration between the virtual file system and the container system.
 */

import { createVirtualFileSystem } from "./vfs/index.ts";
import { SecurityContext, VirtualFileSystem } from "./vfs/types.ts";

/**
 * Container File System Manager
 * 
 * Manages virtual file systems for containers, providing isolation and security.
 */
export class ContainerFsManager {
  private fileSystems: Map<string, VirtualFileSystem> = new Map();
  
  /**
   * Creates a new container file system manager
   */
  constructor() {}
  
  /**
   * Initializes a file system for a container
   * 
   * @param containerId Container ID
   * @param securityContext Security context for file operations
   * @returns The virtual file system for the container
   */
  async initializeFilesystem(
    containerId: string,
    securityContext?: SecurityContext
  ): Promise<VirtualFileSystem> {
    // Check if a file system already exists for this container
    if (this.fileSystems.has(containerId)) {
      return this.fileSystems.get(containerId)!;
    }
    
    // Create a new virtual file system
    const vfs = await createVirtualFileSystem(containerId, securityContext);
    
    // Store the file system
    this.fileSystems.set(containerId, vfs);
    
    return vfs;
  }
  
  /**
   * Gets a file system for a container
   * 
   * @param containerId Container ID
   * @returns The virtual file system for the container, or undefined if not found
   */
  getFilesystem(containerId: string): VirtualFileSystem | undefined {
    return this.fileSystems.get(containerId);
  }
  
  /**
   * Checks if a file system exists for a container
   * 
   * @param containerId Container ID
   * @returns True if a file system exists for the container
   */
  hasFilesystem(containerId: string): boolean {
    return this.fileSystems.has(containerId);
  }
  
  /**
   * Cleans up a container's file system
   * 
   * @param containerId Container ID
   */
  async cleanup(containerId: string): Promise<void> {
    // Check if a file system exists for this container
    if (!this.fileSystems.has(containerId)) {
      return;
    }
    
    // Get the file system
    const vfs = this.fileSystems.get(containerId)!;
    
    // Clean up the file system
    await vfs.cleanup(containerId);
    
    // Remove the file system
    this.fileSystems.delete(containerId);
  }
  
  /**
   * Creates a snapshot of a container's file system
   * 
   * @param containerId Container ID
   * @param targetPath Target path for the snapshot
   */
  async createSnapshot(containerId: string, targetPath: string): Promise<void> {
    // Check if a file system exists for this container
    if (!this.fileSystems.has(containerId)) {
      throw new Error(`No file system found for container: ${containerId}`);
    }
    
    // Get the file system
    const vfs = this.fileSystems.get(containerId)!;
    
    // Create a snapshot
    await vfs.snapshot(containerId, targetPath);
  }
  
  /**
   * Restores a container's file system from a snapshot
   * 
   * @param containerId Container ID
   * @param sourcePath Source path for the snapshot
   */
  async restoreSnapshot(containerId: string, sourcePath: string): Promise<VirtualFileSystem> {
    // Check if a file system already exists for this container
    if (this.fileSystems.has(containerId)) {
      throw new Error(`File system already exists for container: ${containerId}`);
    }
    
    // Create a new virtual file system
    const vfs = await createVirtualFileSystem(containerId);
    
    // Restore from snapshot
    await vfs.restore(containerId, sourcePath);
    
    // Store the file system
    this.fileSystems.set(containerId, vfs);
    
    return vfs;
  }
  
  /**
   * Cleans up all container file systems
   */
  async cleanupAll(): Promise<void> {
    // Clean up each file system
    for (const [containerId, vfs] of Array.from(this.fileSystems.entries())) {
      await vfs.cleanup(containerId);
    }
    
    // Clear the map
    this.fileSystems.clear();
  }
} 