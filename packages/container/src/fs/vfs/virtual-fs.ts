/**
 * InSpatial Container System - Virtual File System
 * 
 * This file implements a virtual file system that maps virtual paths to real paths,
 * providing security and isolation for container file operations.
 */

import { BaseFileSystem } from "./base-fs.ts";
import { MemoryFileSystem } from "./memory-fs.ts";
import { VfsPath } from "./path.ts";
import {
  DirEntry,
  DirHandle,
  FileChangeEvent,
  FileChangeType,
  FileHandle,
  FileStat,
  FileWatcher,
  MountOptions,
  SecurityContext,
  VirtualFileSystem,
  VirtualPathMappingOptions
} from "./types.ts";

/**
 * Path mapping entry
 */
interface PathMapping {
  virtualPath: string;
  realPath: string;
  options: VirtualPathMappingOptions;
}

/**
 * Implementation of FileWatcher for the virtual file system
 */
class VirtualFsWatcher implements FileWatcher {
  private path: string;
  private recursive: boolean;
  private fs: VirtualFsImpl;
  private intervalId: any = null;
  private closed: boolean = false;
  private lastSnapshot: Map<string, { mtime: Date, size: number }> = new Map();
  private listeners: ((event: FileChangeEvent) => void)[] = [];
  
  /**
   * Creates a new file watcher
   * 
   * @param fs Virtual file system instance
   * @param path Path to watch
   * @param recursive Whether to watch recursively
   */
  constructor(fs: VirtualFsImpl, path: string, recursive: boolean = false) {
    this.fs = fs;
    this.path = path;
    this.recursive = recursive;
  }
  
  /**
   * Starts watching for changes
   */
  async start(): Promise<void> {
    // Take initial snapshot
    await this.takeSnapshot();
    
    // Set up polling interval (500ms)
    this.intervalId = setInterval(() => {
      this.checkForChanges();
    }, 500);
  }
  
  /**
   * Takes a snapshot of the current state of the watched directory
   */
  private async takeSnapshot(): Promise<void> {
    if (this.closed) return;
    
    const snapshot = new Map<string, { mtime: Date, size: number }>();
    
    // Helper function to scan directory
    const scanDir = async (dirPath: string) => {
      try {
        const entries = await this.fs.readdirWithFileTypes(dirPath);
        
        for (const entry of entries) {
          const fullPath = VfsPath.join(dirPath, entry.name);
          
          if (entry.isDirectory() && this.recursive) {
            await scanDir(fullPath);
          } else if (entry.isFile()) {
            try {
              const stat = await this.fs.stat(fullPath);
              snapshot.set(fullPath, {
                mtime: stat.mtime,
                size: stat.size
              });
            } catch (error: any) {
              // Skip files that can't be stat'd
            }
          }
        }
      } catch (error: any) {
        // Skip directories that can't be read
      }
    };
    
    try {
      const stat = await this.fs.stat(this.path);
      
      if (stat.isDirectory()) {
        await scanDir(this.path);
      } else if (stat.isFile()) {
        snapshot.set(this.path, {
          mtime: stat.mtime,
          size: stat.size
        });
      }
    } catch (error: any) {
      // Path doesn't exist yet, empty snapshot
    }
    
    this.lastSnapshot = snapshot;
  }
  
  /**
   * Checks for changes between current state and last snapshot
   */
  private async checkForChanges(): Promise<void> {
    if (this.closed) return;
    
    // Current snapshot
    const currentSnapshot = new Map<string, { mtime: Date, size: number }>();
    
    // Helper function to scan directory
    const scanDir = async (dirPath: string) => {
      try {
        const entries = await this.fs.readdirWithFileTypes(dirPath);
        
        for (const entry of entries) {
          const fullPath = VfsPath.join(dirPath, entry.name);
          
          if (entry.isDirectory() && this.recursive) {
            await scanDir(fullPath);
          } else if (entry.isFile()) {
            try {
              const stat = await this.fs.stat(fullPath);
              currentSnapshot.set(fullPath, {
                mtime: stat.mtime,
                size: stat.size
              });
            } catch (error: any) {
              // Skip files that can't be stat'd
            }
          }
        }
      } catch (error: any) {
        // Skip directories that can't be read
      }
    };
    
    try {
      const stat = await this.fs.stat(this.path);
      
      if (stat.isDirectory()) {
        await scanDir(this.path);
      } else if (stat.isFile()) {
        currentSnapshot.set(this.path, {
          mtime: stat.mtime,
          size: stat.size
        });
      }
    } catch (error: any) {
      // Path doesn't exist or can't be accessed
    }
    
    // Check for created and modified files
    for (const entry of Array.from(currentSnapshot.entries())) {
      const path = entry[0];
      const current = entry[1];
      const previous = this.lastSnapshot.get(path);
      
      if (!previous) {
        // File was created
        this.emitChange({
          type: FileChangeType.CREATED,
          path,
          timestamp: new Date()
        });
      } else if (current.mtime.getTime() !== previous.mtime.getTime() || 
                 current.size !== previous.size) {
        // File was modified
        this.emitChange({
          type: FileChangeType.MODIFIED,
          path,
          timestamp: new Date()
        });
      }
    }
    
    // Check for deleted files
    for (const entry of Array.from(this.lastSnapshot.entries())) {
      const path = entry[0];
      if (!currentSnapshot.has(path)) {
        // File was deleted
        this.emitChange({
          type: FileChangeType.DELETED,
          path,
          timestamp: new Date()
        });
      }
    }
    
    // Update snapshot
    this.lastSnapshot = currentSnapshot;
  }
  
  /**
   * Adds an event listener
   * 
   * @param listener Function to call when a change is detected
   */
  on(event: 'change', listener: (event: FileChangeEvent) => void): void {
    if (event === 'change') {
      this.listeners.push(listener);
    }
  }
  
  /**
   * Emits a change event
   * 
   * @param event Change event to emit
   */
  private emitChange(event: FileChangeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error: any) {
        // Ignore listener errors
      }
    }
  }
  
  /**
   * Closes the watcher
   */
  async close(): Promise<void> {
    if (this.closed) return;
    
    this.closed = true;
    
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.listeners = [];
    this.lastSnapshot.clear();
  }
}

/**
 * Virtual file system implementation
 * 
 * This file system maps virtual paths to real paths,
 * providing security and isolation for container file operations.
 */
export class VirtualFsImpl implements VirtualFileSystem {
  private baseName: string;
  private rootFs: BaseFileSystem;
  private memoryFs: MemoryFileSystem;
  private pathMappings: PathMapping[] = [];
  private securityContext: SecurityContext;
  private containerId: string | null = null;
  private allowRootFs: boolean;

  /**
   * Creates a new virtual file system
   * 
   * @param name File system name/identifier
   * @param options Options for the virtual file system
   */
  constructor(
    name: string = "vfs",
    options: {
      rootFs?: BaseFileSystem;
      memoryFs?: MemoryFileSystem;
      allowRootFs?: boolean;
      securityContext?: SecurityContext;
    } = {}
  ) {
    this.baseName = name;
    this.rootFs = options.rootFs || new MemoryFileSystem(name + "-root");
    this.memoryFs = options.memoryFs || new MemoryFileSystem(name + "-memory");
    this.allowRootFs = options.allowRootFs || false;
    
    // Set default security context
    this.securityContext = options.securityContext || {
      userId: 1000,
      groupId: 1000,
      permissions: ["fs.read", "fs.write"],
      securityTokens: new Map()
    };
  }

  /**
   * Sets the security context for file operations
   * 
   * @param context Security context
   */
  setSecurityContext(context: SecurityContext): void {
    this.securityContext = context;
  }

  /**
   * Maps a virtual path to a real path
   * 
   * @param virtualPath The path within the virtual file system
   * @param realPath The real file system path to map to
   * @param options Options for the mapping
   */
  async mapPath(
    virtualPath: string,
    realPath: string,
    options: VirtualPathMappingOptions = {}
  ): Promise<void> {
    // Normalize paths
    const normalizedVirtualPath = VfsPath.normalize(virtualPath);
    const normalizedRealPath = VfsPath.normalize(realPath);
    
    // Validate paths
    if (!VfsPath.validate(normalizedVirtualPath) || !VfsPath.validate(normalizedRealPath)) {
      throw new Error(`Invalid path mapping: ${virtualPath} -> ${realPath}`);
    }

    // Check if virtual path is already mapped
    for (const mapping of this.pathMappings) {
      if (mapping.virtualPath === normalizedVirtualPath) {
        throw new Error(`Virtual path already mapped: ${virtualPath}`);
      }
    }
    
    // Add the mapping
    this.pathMappings.push({
      virtualPath: normalizedVirtualPath,
      realPath: normalizedRealPath,
      options
    });
    
    // Sort mappings by length (longest first) to ensure correct resolution
    this.pathMappings.sort((a, b) => b.virtualPath.length - a.virtualPath.length);
  }

  /**
   * Unmaps a virtual path
   * 
   * @param virtualPath The virtual path to unmap
   */
  async unmapPath(virtualPath: string): Promise<void> {
    // Normalize the path
    const normalizedVirtualPath = VfsPath.normalize(virtualPath);
    
    // Find and remove the mapping
    const index = this.pathMappings.findIndex(m => m.virtualPath === normalizedVirtualPath);
    
    if (index !== -1) {
      this.pathMappings.splice(index, 1);
    } else {
      throw new Error(`Virtual path not mapped: ${virtualPath}`);
    }
  }

  /**
   * Resolves a virtual path to a real path
   * 
   * @param virtualPath The virtual path to resolve
   * @returns The real path that the virtual path maps to
   */
  async resolveVirtualPath(virtualPath: string): Promise<string> {
    // Normalize the path
    const normalizedVirtualPath = VfsPath.normalize(virtualPath);
    
    // Check path mappings
    for (const mapping of this.pathMappings) {
      if (normalizedVirtualPath === mapping.virtualPath ||
          normalizedVirtualPath.startsWith(mapping.virtualPath + "/")) {
        
        // Check if root only and not at root level
        if (mapping.options.rootOnly && 
            normalizedVirtualPath !== mapping.virtualPath &&
            normalizedVirtualPath.replace(mapping.virtualPath, "").includes("/")) {
          continue;
        }
        
        // Get the relative path from the virtual path
        const relativePath = VfsPath.relative(mapping.virtualPath, normalizedVirtualPath);
        
        // Map to the real path
        return VfsPath.join(mapping.realPath, relativePath);
      }
    }
    
    // If no mapping found, use the in-memory file system path
    return normalizedVirtualPath;
  }

  /**
   * Gets the file system to use for the given path
   * 
   * @param virtualPath The virtual path
   * @returns The file system to use and the resolved path
   */
  private async getFileSystemForPath(
    virtualPath: string
  ): Promise<{ fs: BaseFileSystem | MemoryFileSystem, path: string }> {
    // Normalize the path
    const normalizedVirtualPath = VfsPath.normalize(virtualPath);
    
    // Check path mappings
    for (const mapping of this.pathMappings) {
      if (normalizedVirtualPath === mapping.virtualPath ||
          normalizedVirtualPath.startsWith(mapping.virtualPath + "/")) {
        
        // Check if root only and not at root level
        if (mapping.options.rootOnly && 
            normalizedVirtualPath !== mapping.virtualPath &&
            normalizedVirtualPath.replace(mapping.virtualPath, "").includes("/")) {
          continue;
        }
        
        // Check file extension restrictions
        if (mapping.options.allowedExtensions && mapping.options.allowedExtensions.length > 0) {
          const ext = VfsPath.extname(normalizedVirtualPath).toLowerCase();
          if (!mapping.options.allowedExtensions.includes(ext)) {
            throw new Error(`File extension not allowed: ${ext}`);
          }
        }
        
        if (mapping.options.deniedExtensions && mapping.options.deniedExtensions.length > 0) {
          const ext = VfsPath.extname(normalizedVirtualPath).toLowerCase();
          if (mapping.options.deniedExtensions.includes(ext)) {
            throw new Error(`File extension denied: ${ext}`);
          }
        }
        
        // Use the root file system with the real path
        if (this.allowRootFs) {
          const realPath = await this.resolveVirtualPath(normalizedVirtualPath);
          return { fs: this.rootFs, path: realPath };
        }
      }
    }
    
    // Use the in-memory file system with the virtual path
    return { fs: this.memoryFs, path: normalizedVirtualPath };
  }

  /**
   * Initializes the file system for a container
   * 
   * @param containerId Container ID
   */
  async initialize(containerId: string): Promise<void> {
    this.containerId = containerId;
    
    // Initialize standard directories
    const directories = [
      "/bin",
      "/dev",
      "/etc",
      "/home",
      "/lib",
      "/proc",
      "/root",
      "/sys",
      "/tmp",
      "/usr",
      "/var"
    ];
    
    for (const dir of directories) {
      try {
        await this.mkdir(dir, { recursive: true });
      } catch (error) {
        // Ignore errors during initialization
      }
    }
  }

  /**
   * Cleans up the file system for a container
   * 
   * @param containerId Container ID
   */
  async cleanup(containerId: string): Promise<void> {
    if (this.containerId !== containerId) {
      throw new Error(`Container ID mismatch: ${containerId} != ${this.containerId}`);
    }
    
    // Clear path mappings
    this.pathMappings = [];
    
    this.containerId = null;
  }

  /**
   * Creates a snapshot of the container's file system
   * 
   * @param containerId Container ID
   * @param targetPath Target path for the snapshot
   */
  async snapshot(containerId: string, targetPath: string): Promise<void> {
    if (this.containerId !== containerId) {
      throw new Error(`Container ID mismatch: ${containerId} != ${this.containerId}`);
    }
    
    // Create snapshot directory if it doesn't exist
    const targetDir = VfsPath.dirname(targetPath);
    try {
      await this.mkdir(targetDir, { recursive: true });
    } catch (error: any) {
      // Ignore if directory already exists
    }
    
    // Create a JSON representation of the file system structure
    const snapshot: any = {
      version: 1,
      containerId,
      timestamp: new Date().toISOString(),
      files: [],
      directories: [],
      symlinks: []
    };
    
    // Helper function to recursively walk the filesystem
    const walkFs = async (path: string) => {
      const entries = await this.readdirWithFileTypes(path);
      
      for (const entry of entries) {
        const fullPath = VfsPath.join(path, entry.name);
        
        // Skip special directories
        if (entry.name === "." || entry.name === "..") {
          continue;
        }
        
        if (entry.isDirectory()) {
          // Add directory to snapshot
          const stat = await this.stat(fullPath);
          snapshot.directories.push({
            path: fullPath,
            mode: stat.mode,
            uid: stat.uid,
            gid: stat.gid
          });
          
          // Recursively walk subdirectory
          await walkFs(fullPath);
        } else if (entry.isFile()) {
          // Add file to snapshot
          const stat = await this.stat(fullPath);
          const content = await this.readFile(fullPath);
          
          snapshot.files.push({
            path: fullPath,
            mode: stat.mode,
            uid: stat.uid,
            gid: stat.gid,
            size: content.length,
            content: Array.from(content) // Convert Uint8Array to regular array for JSON serialization
          });
        } else if (entry.isSymlink()) {
          // Add symlink to snapshot
          const target = await this.readlink(fullPath);
          const stat = await this.stat(fullPath, false);
          
          snapshot.symlinks.push({
            path: fullPath,
            target,
            mode: stat.mode,
            uid: stat.uid,
            gid: stat.gid
          });
        }
      }
    };
    
    // Walk the filesystem starting from root
    await walkFs("/");
    
    // Write the snapshot to the target path
    const snapshotJson = JSON.stringify(snapshot, null, 2);
    await this.writeFile(targetPath, new TextEncoder().encode(snapshotJson));
  }

  /**
   * Restores a container's file system from a snapshot
   * 
   * @param containerId Container ID
   * @param sourcePath Source path for the snapshot
   */
  async restore(containerId: string, sourcePath: string): Promise<void> {
    if (this.containerId) {
      throw new Error(`Container already initialized: ${this.containerId}`);
    }
    
    // Read the snapshot file
    let snapshotData: Uint8Array;
    try {
      snapshotData = await this.readFile(sourcePath);
    } catch (error: any) {
      throw new Error(`Failed to read snapshot file: ${error?.message || String(error)}`);
    }
    
    // Parse the snapshot
    let snapshot: any;
    try {
      const snapshotJson = new TextDecoder().decode(snapshotData);
      snapshot = JSON.parse(snapshotJson);
    } catch (error: any) {
      throw new Error(`Failed to parse snapshot: ${error?.message || String(error)}`);
    }
    
    // Verify snapshot version and container ID
    if (snapshot.version !== 1) {
      throw new Error(`Unsupported snapshot version: ${snapshot.version}`);
    }
    
    // Initialize the file system
    this.containerId = containerId;
    
    // Create all directories first
    for (const dir of snapshot.directories) {
      try {
        await this.mkdir(dir.path, { recursive: true });
        await this.chmod(dir.path, dir.mode);
        await this.chown(dir.path, dir.uid, dir.gid);
      } catch (error: any) {
        console.error(`Failed to restore directory ${dir.path}: ${error?.message || String(error)}`);
      }
    }
    
    // Create all files
    for (const file of snapshot.files) {
      try {
        const content = new Uint8Array(file.content);
        await this.writeFile(file.path, content, { mode: file.mode });
        await this.chown(file.path, file.uid, file.gid);
      } catch (error: any) {
        console.error(`Failed to restore file ${file.path}: ${error?.message || String(error)}`);
      }
    }
    
    // Create all symlinks
    for (const link of snapshot.symlinks) {
      try {
        await this.symlink(link.target, link.path);
        await this.chmod(link.path, link.mode);
        await this.chown(link.path, link.uid, link.gid);
      } catch (error: any) {
        console.error(`Failed to restore symlink ${link.path}: ${error?.message || String(error)}`);
      }
    }
  }

  /**
   * Mounts a file system at the specified target
   */
  async mount(source: string, target: string, options?: MountOptions): Promise<void> {
    const { fs, path } = await this.getFileSystemForPath(target);
    return fs.mount(source, path, options);
  }

  /**
   * Unmounts a file system from the specified target
   */
  async unmount(target: string, force?: boolean): Promise<void> {
    const { fs, path } = await this.getFileSystemForPath(target);
    return fs.unmount(path, force);
  }

  /**
   * Opens a file at the specified path
   */
  async open(path: string, flags: number, mode?: number): Promise<FileHandle> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.open(resolvedPath, flags, mode);
  }

  /**
   * Opens a directory at the specified path
   */
  async opendir(path: string): Promise<DirHandle> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.opendir(resolvedPath);
  }

  /**
   * Gets file statistics for the specified path
   */
  async stat(path: string, followSymlinks?: boolean): Promise<FileStat> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.stat(resolvedPath, followSymlinks);
  }

  /**
   * Checks if the process has the specified access to the file
   */
  async access(path: string, mode?: number): Promise<boolean> {
    try {
      const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
      return await fs.access(resolvedPath, mode);
    } catch (error) {
      return false;
    }
  }

  /**
   * Reads the entire contents of a file
   */
  async readFile(path: string): Promise<Uint8Array> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.readFile(resolvedPath);
  }

  /**
   * Writes data to a file, creating it if it doesn't exist
   */
  async writeFile(
    path: string,
    data: Uint8Array,
    options?: { mode?: number, flag?: number }
  ): Promise<void> {
    // Normalize path for security
    const normalizedPath = VfsPath.normalize(path);
    
    // Force creation of parent directory
    const parentDir = VfsPath.dirname(normalizedPath);
    if (parentDir !== "/" && parentDir !== "") {
      try {
        // Always use recursive: true to create all parent directories
        await this.mkdir(parentDir, { recursive: true });
      } catch (error: any) {
        // Only ignore errors if directory already exists
        if (!(error.message && error.message.includes("File already exists"))) {
          throw error;
        }
      }
    }

    // Get the appropriate file system for this path
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(normalizedPath);
    
    // Write to the file system
    await fs.writeFile(resolvedPath, data, options);
  }

  /**
   * Truncates a file to the specified length
   */
  async truncate(path: string, len?: number): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.truncate(resolvedPath, len);
  }

  /**
   * Deletes a file from the file system
   */
  async unlink(path: string): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.unlink(resolvedPath);
  }

  /**
   * Creates a directory at the specified path
   */
  async mkdir(
    path: string,
    options?: { recursive?: boolean, mode?: number }
  ): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.mkdir(resolvedPath, options);
  }

  /**
   * Removes a directory from the file system
   */
  async rmdir(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.rmdir(resolvedPath, options);
  }

  /**
   * Reads the contents of a directory, returning file names
   */
  async readdir(path: string): Promise<string[]> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.readdir(resolvedPath);
  }

  /**
   * Reads the contents of a directory, returning file entries with type information
   */
  async readdirWithFileTypes(path: string): Promise<DirEntry[]> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.readdirWithFileTypes(resolvedPath);
  }

  /**
   * Creates a hard link from existingPath to newPath
   */
  async link(existingPath: string, newPath: string): Promise<void> {
    const { fs: existingFs, path: resolvedExistingPath } = await this.getFileSystemForPath(existingPath);
    const { fs: newFs, path: resolvedNewPath } = await this.getFileSystemForPath(newPath);
    
    // Ensure both paths are on the same file system
    if (existingFs !== newFs) {
      throw new Error("Cannot link across different file systems");
    }
    
    return existingFs.link(resolvedExistingPath, resolvedNewPath);
  }

  /**
   * Creates a symbolic link at path pointing to target
   */
  async symlink(target: string, path: string): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.symlink(target, resolvedPath);
  }

  /**
   * Reads the target of a symbolic link
   */
  async readlink(path: string): Promise<string> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.readlink(resolvedPath);
  }

  /**
   * Renames a file or directory from oldPath to newPath
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const { fs: oldFs, path: resolvedOldPath } = await this.getFileSystemForPath(oldPath);
    const { fs: newFs, path: resolvedNewPath } = await this.getFileSystemForPath(newPath);
    
    // Ensure both paths are on the same file system
    if (oldFs !== newFs) {
      throw new Error("Cannot rename across different file systems");
    }
    
    return oldFs.rename(resolvedOldPath, resolvedNewPath);
  }

  /**
   * Returns the canonicalized absolute pathname
   */
  async realpath(path: string): Promise<string> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    const realPath = await fs.realpath(resolvedPath);
    
    // If using root file system, map back to virtual path
    if (fs === this.rootFs && this.allowRootFs) {
      for (const mapping of this.pathMappings) {
        if (realPath === mapping.realPath || realPath.startsWith(mapping.realPath + "/")) {
          const relativePath = VfsPath.relative(mapping.realPath, realPath);
          return VfsPath.join(mapping.virtualPath, relativePath);
        }
      }
    }
    
    return realPath;
  }

  /**
   * Changes the permissions of a file
   */
  async chmod(path: string, mode: number): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.chmod(resolvedPath, mode);
  }

  /**
   * Changes the owner and group of a file
   */
  async chown(path: string, uid: number, gid: number): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.chown(resolvedPath, uid, gid);
  }

  /**
   * Changes the file system timestamps of a file
   */
  async utimes(
    path: string,
    atime: Date | number,
    mtime: Date | number
  ): Promise<void> {
    const { fs, path: resolvedPath } = await this.getFileSystemForPath(path);
    return fs.utimes(resolvedPath, atime, mtime);
  }

  /**
   * Gets disk space information
   */
  async df(): Promise<{ free: number, available: number, total: number }> {
    // Use memory file system for df
    return this.memoryFs.df();
  }

  /**
   * Watches a file or directory for changes
   * 
   * @param path Path to watch
   * @param recursive Whether to watch recursively
   * @returns A file watcher
   */
  async watch(path: string, recursive: boolean = false): Promise<FileWatcher> {
    // Normalize the path
    const normalizedPath = VfsPath.normalize(path);
    
    // Validate the path
    if (!VfsPath.validate(normalizedPath)) {
      throw new Error(`Invalid path: ${path}`);
    }
    
    // Create a watcher
    const watcher = new VirtualFsWatcher(this, normalizedPath, recursive);
    
    // Start watching
    await watcher.start();
    
    return watcher;
  }
} 