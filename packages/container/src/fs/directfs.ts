/**
 * InSpatial Container System - DirectFS
 * 
 * This module implements a DirectFS feature similar to gVisor's DirectFS,
 * which allows direct access to host file system while maintaining strong
 * security isolation. This provides better performance for I/O-intensive
 * operations while keeping security guarantees.
 */

import { MemoryFileSystem } from "./vfs/memory-fs.ts";
import { FileHandle, DirHandle, MountOptions, OpenFlags } from "./vfs/types.ts";
import { VfsPath } from "./vfs/path.ts";
import { SecurityManager } from "../security/security-manager.ts";

/**
 * Configuration for DirectFS
 */
export interface DirectFSConfig {
  enabled: boolean;                 // Whether DirectFS is enabled
  containerName: string;            // Name of the container
  securityManager?: SecurityManager; // Optional security manager for advanced checks
  allowedMountPoints: string[];     // Allowed host directories to mount
  readOnlyByDefault: boolean;       // Whether mounts are read-only by default
  maxOpenFiles?: number;            // Maximum number of open file descriptors
}

/**
 * DirectFS enhances file system performance by allowing direct access to 
 * host file system while maintaining security isolation
 */
export class DirectFS {
  private config: DirectFSConfig;
  private fs: MemoryFileSystem;
  private hostFds: Map<string, number> = new Map();
  private mountPoints: Map<string, { 
    hostPath: string, 
    readonly: boolean,
    hostFd?: number
  }> = new Map();
  private nextFd: number = 1000; // Start at a high number to avoid conflicts
  
  /**
   * Creates a new DirectFS instance
   * 
   * @param fs The memory file system to enhance
   * @param config Configuration for DirectFS
   */
  constructor(fs: MemoryFileSystem, config: DirectFSConfig) {
    this.fs = fs;
    this.config = {
      ...config,
      readOnlyByDefault: config.readOnlyByDefault ?? true,
      maxOpenFiles: config.maxOpenFiles ?? 100
    };
    
    // If enabled, initialize DirectFS
    if (this.config.enabled) {
      this.initialize();
    }
  }
  
  /**
   * Initializes DirectFS
   */
  private initialize(): void {
    console.log(`[DirectFS] Initializing for container ${this.config.containerName}`);
    
    // Override the mount method to handle direct file system access
    const originalMount = this.fs.mount.bind(this.fs);
    
    this.fs.mount = async (source: string, target: string, options: MountOptions = {}): Promise<void> => {
      // Check if this is a host-to-container mount
      if (this.isAllowedMountPoint(source)) {
        // Register the mount point
        this.mountPoints.set(target, {
          hostPath: source,
          readonly: options.readonly ?? this.config.readOnlyByDefault
        });
        
        console.log(`[DirectFS] Mounted ${source} -> ${target} (readonly: ${
          options.readonly ?? this.config.readOnlyByDefault ? "yes" : "no"
        })`);
        
        // Call the original method to maintain the VFS view
        return originalMount(source, target, options);
      }
      
      // For non-DirectFS mounts, pass through to the original method
      return originalMount(source, target, options);
    };
    
    // Override open to use direct access for mounted paths when possible
    const originalOpen = this.fs.open.bind(this.fs);
    
    this.fs.open = async (path: string, flags: number = OpenFlags.READ, mode?: number): Promise<FileHandle> => {
      // Check if the path is under a mount point
      const mountPoint = this.findMountPoint(path);
      
      if (mountPoint) {
        const { hostPath, readonly } = this.mountPoints.get(mountPoint)!;
        
        // If attempting to write to a read-only mount, fail early
        if (readonly && (flags & OpenFlags.WRITE)) {
          throw new Error(`Cannot write to read-only mount: ${path}`);
        }
        
        // Convert the container path to host path
        const relativePath = path.substring(mountPoint.length);
        const hostFilePath = VfsPath.join(hostPath, relativePath);
        
        try {
          // In a real implementation, we would use seccomp to ensure O_NOFOLLOW
          // and other security measures. For this example, we'll simulate a host open.
          
          // Simulate opening a host file descriptor
          const hostFd = this.simulateHostOpen(hostFilePath, flags, mode);
          
          // Store the relationship between container fd and host fd
          const containerFd = this.nextFd++;
          this.hostFds.set(containerFd.toString(), hostFd);
          
          console.log(`[DirectFS] Opened ${path} -> ${hostFilePath} (fd: ${containerFd}, hostFd: ${hostFd})`);
          
          // Create a DirectFS file handle that will use the host fd
          return this.createFileHandle(containerFd, hostFd, path, hostFilePath);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[DirectFS] Failed to open ${hostFilePath}: ${errorMessage}`);
          
          // Fall back to the regular VFS implementation
          return originalOpen(path, flags, mode);
        }
      }
      
      // For non-DirectFS paths, pass through to the original method
      return originalOpen(path, flags, mode);
    };
    
    // We would need to override other methods as well, like unlink, readdir, etc.
    // For brevity, we'll focus on the core file operations in this example
  }
  
  /**
   * Checks if a host path is allowed for mounting
   * 
   * @param hostPath Host path to check
   * @returns True if the path is allowed, false otherwise
   */
  private isAllowedMountPoint(hostPath: string): boolean {
    // Check if the path is in the allowed list
    return this.config.allowedMountPoints.some(allowed => {
      return hostPath === allowed || hostPath.startsWith(`${allowed}/`);
    });
  }
  
  /**
   * Finds the mount point for a given path
   * 
   * @param path Path to check
   * @returns The mount point or undefined if not found
   */
  private findMountPoint(path: string): string | undefined {
    // Start with the longest mount points to avoid substring matches
    const mountPoints = Array.from(this.mountPoints.keys()).sort((a, b) => b.length - a.length);
    
    for (const mountPoint of mountPoints) {
      if (path === mountPoint || path.startsWith(`${mountPoint}/`)) {
        return mountPoint;
      }
    }
    
    return undefined;
  }
  
  /**
   * Simulates opening a host file descriptor
   * 
   * @param hostPath Host path to open
   * @param flags Open flags
   * @param mode File mode
   * @returns Simulated host file descriptor
   */
  private simulateHostOpen(hostPath: string, flags: number, mode?: number): number {
    // In a real implementation, this would use platform-specific file APIs
    // to open the host file. For this simulation, we'll just return a fake fd.
    return Math.floor(Math.random() * 100000) + 10000;
  }
  
  /**
   * Creates a DirectFS file handle that uses the host fd
   * 
   * @param fd Container file descriptor
   * @param hostFd Host file descriptor
   * @param path File path
   * @param hostFilePath Host file path
   * @returns DirectFS file handle
   */
  private createFileHandle(fd: number, hostFd: number, path: string, hostFilePath: string): FileHandle {
    // In a real implementation, this would create a handle that uses native file operations
    // For this example, we'll create a simulated handle with the same interface
    
    return {
      fd,
      path,
      flags: OpenFlags.READ,
      
      async read(buffer: Uint8Array, offset?: number, length?: number, position?: number): Promise<number> {
        // Simulate reading from the host file
        console.log(`[DirectFS] Reading from ${path} (fd: ${fd})`);
        
        // Fill the buffer with random data for simulation
        const bytesToRead = Math.min(length ?? buffer.length, buffer.length - (offset ?? 0));
        for (let i = 0; i < bytesToRead; i++) {
          buffer[(offset ?? 0) + i] = Math.floor(Math.random() * 256);
        }
        
        return bytesToRead;
      },
      
      async write(buffer: Uint8Array, offset?: number, length?: number, position?: number): Promise<number> {
        // Simulate writing to the host file
        console.log(`[DirectFS] Writing to ${path} (fd: ${fd})`);
        
        const bytesToWrite = Math.min(length ?? buffer.length, buffer.length - (offset ?? 0));
        return bytesToWrite;
      },
      
      async readFile(): Promise<Uint8Array> {
        // Simulate reading the entire file
        console.log(`[DirectFS] Reading entire file ${path} (fd: ${fd})`);
        
        // Create a buffer with random data for simulation
        const buffer = new Uint8Array(1024);
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = Math.floor(Math.random() * 256);
        }
        
        return buffer;
      },
      
      async writeFile(data: Uint8Array): Promise<void> {
        // Simulate writing the entire file
        console.log(`[DirectFS] Writing entire file ${path} (fd: ${fd})`);
      },
      
      async stat(): Promise<any> {
        // Simulate getting file stats
        console.log(`[DirectFS] Getting stats for ${path} (fd: ${fd})`);
        
        return {
          dev: 1,
          ino: fd,
          mode: 0o644,
          nlink: 1,
          uid: 0,
          gid: 0,
          rdev: 0,
          size: 1024,
          blksize: 4096,
          blocks: 2,
          atime: new Date(),
          mtime: new Date(),
          ctime: new Date(),
          birthtime: new Date(),
          isFile: () => true,
          isDirectory: () => false,
          isSymlink: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isFIFO: () => false,
          isSocket: () => false
        };
      },
      
      async truncate(len?: number): Promise<void> {
        // Simulate truncating the file
        console.log(`[DirectFS] Truncating ${path} to ${len ?? 0} bytes (fd: ${fd})`);
      },
      
      async sync(): Promise<void> {
        // Simulate syncing the file
        console.log(`[DirectFS] Syncing ${path} (fd: ${fd})`);
      },
      
      async datasync(): Promise<void> {
        // Simulate syncing only data
        console.log(`[DirectFS] Datasyncing ${path} (fd: ${fd})`);
      },
      
      async close(): Promise<void> {
        // Close the host file descriptor
        console.log(`[DirectFS] Closing ${path} (fd: ${fd})`);
      }
    };
  }
  
  /**
   * Checks if DirectFS is enabled
   * 
   * @returns True if DirectFS is enabled, false otherwise
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
  
  /**
   * Gets the list of mount points
   * 
   * @returns Array of mount points
   */
  getMountPoints(): string[] {
    return Array.from(this.mountPoints.keys());
  }
  
  /**
   * Gets statistics about DirectFS usage
   * 
   * @returns DirectFS statistics
   */
  getStats(): { mountPoints: number, openFiles: number } {
    return {
      mountPoints: this.mountPoints.size,
      openFiles: this.hostFds.size
    };
  }
} 