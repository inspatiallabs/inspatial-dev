/**
 * InSpatial Container System - Base File System
 * 
 * Abstract base class for file system implementations that provides
 * common functionality and defines the structure for concrete implementations.
 */

import { VfsPath } from "./path.ts";
import {
  DirEntry,
  DirHandle,
  FileHandle,
  FileStat,
  FileSystem,
  MountOptions
} from "./types.ts";

/**
 * Abstract base class for file system implementations
 */
export abstract class BaseFileSystem implements FileSystem {
  /**
   * File system name/identifier
   */
  readonly name: string;

  /**
   * Constructor
   * 
   * @param name Name/identifier for this file system
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Mount a file system at the specified target path
   */
  abstract mount(source: string, target: string, options?: MountOptions): Promise<void>;

  /**
   * Unmount a file system from the specified target path
   */
  abstract unmount(target: string, force?: boolean): Promise<void>;

  /**
   * Open a file at the specified path with the given flags and mode
   */
  abstract open(path: string, flags: number, mode?: number): Promise<FileHandle>;

  /**
   * Open a directory at the specified path
   */
  abstract opendir(path: string): Promise<DirHandle>;

  /**
   * Get file statistics for the specified path
   */
  abstract stat(path: string, followSymlinks?: boolean): Promise<FileStat>;

  /**
   * Check if the process has the specified access to the file
   */
  abstract access(path: string, mode?: number): Promise<boolean>;

  /**
   * Read the entire contents of a file
   */
  async readFile(path: string): Promise<Uint8Array> {
    const handle = await this.open(path, 1); // Open for reading
    try {
      return await handle.readFile();
    } finally {
      await handle.close();
    }
  }

  /**
   * Writes data to a file, creating it if it doesn't exist
   * 
   * @param path File path 
   * @param data Data to write
   * @param options Options for writing
   */
  async writeFile(
    path: string,
    data: Uint8Array,
    options?: { mode?: number, flag?: number }
  ): Promise<void> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Get the parent directory
    const parentDir = VfsPath.dirname(normalizedPath);
    
    // Create parent directory if it doesn't exist
    if (parentDir !== "/" && parentDir !== "") {
      try {
        await this.mkdir(parentDir, { recursive: true });
      } catch (error: any) {
        // Only ignore if directory already exists
        if (!(error.message && error.message.includes("already exists"))) {
          throw error;
        }
      }
    }
    
    // Use flag to indicate whether to create the file if it doesn't exist
    const flag = options?.flag || 0x1a; // O_WRONLY | O_CREAT | O_TRUNC by default
    
    // Open the file for writing
    const file = await this.open(normalizedPath, flag, options?.mode);
    
    try {
      // Write the data
      await file.writeFile(data);
    } finally {
      // Close the file
      await file.close();
    }
  }

  /**
   * Truncate a file to the specified length
   */
  async truncate(path: string, len?: number): Promise<void> {
    const handle = await this.open(path, 0x2); // Open for writing
    try {
      await handle.truncate(len);
    } finally {
      await handle.close();
    }
  }

  /**
   * Delete a file from the file system
   */
  abstract unlink(path: string): Promise<void>;

  /**
   * Creates a directory at the specified path
   */
  abstract mkdir(
    path: string, 
    options?: { recursive?: boolean, mode?: number }
  ): Promise<void>;

  /**
   * Remove a directory from the file system
   */
  abstract rmdir(
    path: string, 
    options?: { recursive?: boolean }
  ): Promise<void>;

  /**
   * Read the contents of a directory, returning file names
   */
  async readdir(path: string): Promise<string[]> {
    const entries = await this.readdirWithFileTypes(path);
    return entries.map(entry => entry.name);
  }

  /**
   * Read the contents of a directory, returning file entries with type information
   */
  abstract readdirWithFileTypes(path: string): Promise<DirEntry[]>;

  /**
   * Create a hard link from existingPath to newPath
   */
  abstract link(existingPath: string, newPath: string): Promise<void>;

  /**
   * Create a symbolic link at path pointing to target
   */
  abstract symlink(target: string, path: string): Promise<void>;

  /**
   * Read the target of a symbolic link
   */
  abstract readlink(path: string): Promise<string>;

  /**
   * Rename a file or directory from oldPath to newPath
   */
  abstract rename(oldPath: string, newPath: string): Promise<void>;

  /**
   * Return the canonicalized absolute pathname
   */
  abstract realpath(path: string): Promise<string>;

  /**
   * Change the permissions of a file
   */
  abstract chmod(path: string, mode: number): Promise<void>;

  /**
   * Change the owner and group of a file
   */
  abstract chown(path: string, uid: number, gid: number): Promise<void>;

  /**
   * Change the file system timestamps of a file
   */
  abstract utimes(
    path: string, 
    atime: Date | number, 
    mtime: Date | number
  ): Promise<void>;

  /**
   * Get disk space information
   */
  abstract df(): Promise<{ free: number, available: number, total: number }>;

  /**
   * Normalize a path for the file system
   */
  protected normalizePath(path: string): string {
    return VfsPath.normalize(path);
  }

  /**
   * Resolve a relative path to an absolute path
   */
  protected resolvePath(path: string): string {
    return VfsPath.resolve(path);
  }

  /**
   * Join path segments
   */
  protected joinPaths(...paths: string[]): string {
    return VfsPath.join(...paths);
  }

  /**
   * Validate a path for security issues
   */
  protected validatePath(path: string): boolean {
    return VfsPath.validate(path);
  }
} 