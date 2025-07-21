/**
 * InSpatial Container System - In-Memory File System Handles
 * 
 * This file implements file and directory handles for the in-memory file system.
 */

import { DirEntry, DirHandle, FileHandle, FileStat, FileType } from "./types.ts";
import { MemoryDirectory, MemoryFile, MemoryNode, MemorySymlink } from "./memory-node.ts";

/**
 * File statistics implementation for memory nodes
 */
export class MemoryFileStat implements FileStat {
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  size: number;
  blksize: number;
  blocks: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
  private type: FileType;
  
  /**
   * Creates file statistics for a memory node
   * 
   * @param node Memory node
   * @param ino Inode number
   */
  constructor(node: MemoryNode, ino: number) {
    this.dev = 1;  // Memory file system device ID
    this.ino = ino;
    this.mode = node.mode;
    this.type = node.type;
    this.nlink = node.isDirectory() ? 2 : 1; // Directories have at least 2 links (. and ..)
    this.uid = node.uid;
    this.gid = node.gid;
    this.rdev = 0;
    this.size = node.size;
    this.blksize = 4096;
    this.blocks = Math.ceil(node.size / 512); // 512-byte blocks
    this.atime = new Date(node.atime.getTime());
    this.mtime = new Date(node.mtime.getTime());
    this.ctime = new Date(node.ctime.getTime());
    this.birthtime = new Date(node.birthtime.getTime());
  }
  
  /**
   * Checks if this is a regular file
   */
  isFile(): boolean {
    return this.type === FileType.REGULAR;
  }
  
  /**
   * Checks if this is a directory
   */
  isDirectory(): boolean {
    return this.type === FileType.DIRECTORY;
  }
  
  /**
   * Checks if this is a symbolic link
   */
  isSymlink(): boolean {
    return this.type === FileType.SYMLINK;
  }
  
  /**
   * Checks if this is a block device
   */
  isBlockDevice(): boolean {
    return this.type === FileType.BLOCK;
  }
  
  /**
   * Checks if this is a character device
   */
  isCharacterDevice(): boolean {
    return this.type === FileType.CHARACTER;
  }
  
  /**
   * Checks if this is a FIFO/pipe
   */
  isFIFO(): boolean {
    return this.type === FileType.FIFO;
  }
  
  /**
   * Checks if this is a socket
   */
  isSocket(): boolean {
    return this.type === FileType.SOCKET;
  }
}

/**
 * Directory entry implementation for memory nodes
 */
export class MemoryDirEntry implements DirEntry {
  name: string;
  path: string;
  type: FileType;
  
  /**
   * Creates a directory entry for a memory node
   * 
   * @param node Memory node
   * @param path Full path
   */
  constructor(node: MemoryNode, path: string) {
    this.name = node.name;
    this.path = path;
    this.type = node.type;
  }
  
  /**
   * Checks if this is a regular file
   */
  isFile(): boolean {
    return this.type === FileType.REGULAR;
  }
  
  /**
   * Checks if this is a directory
   */
  isDirectory(): boolean {
    return this.type === FileType.DIRECTORY;
  }
  
  /**
   * Checks if this is a symbolic link
   */
  isSymlink(): boolean {
    return this.type === FileType.SYMLINK;
  }
}

/**
 * Handle for in-memory files
 */
export class MemoryFileHandle implements FileHandle {
  readonly fd: number;
  readonly path: string;
  readonly flags: number;
  private file: MemoryFile;
  private position: number;
  private closed: boolean;
  
  /**
   * Creates a new file handle
   * 
   * @param fd File descriptor
   * @param path File path
   * @param file Memory file node
   * @param flags Open flags
   */
  constructor(fd: number, path: string, file: MemoryFile, flags: number) {
    this.fd = fd;
    this.path = path;
    this.file = file;
    this.flags = flags;
    this.position = 0;
    this.closed = false;
  }
  
  /**
   * Reads data from the file
   * 
   * @param buffer Buffer to read into
   * @param offset Offset in the buffer to start writing at
   * @param length Number of bytes to read
   * @param position Position in the file to start reading from, or null to use the current position
   * @returns Number of bytes read
   */
  async read(
    buffer: Uint8Array, 
    offset: number = 0, 
    length: number = buffer.length, 
    position?: number
  ): Promise<number> {
    this.ensureOpen();
    
    const readPosition = position !== undefined ? position : this.position;
    const bytesRead = this.file.read(buffer, offset, length, readPosition);
    
    // Update current position if we're not using an explicit position
    if (position === undefined) {
      this.position += bytesRead;
    }
    
    return bytesRead;
  }
  
  /**
   * Writes data to the file
   * 
   * @param buffer Buffer to write from
   * @param offset Offset in the buffer to start reading from
   * @param length Number of bytes to write
   * @param position Position in the file to start writing at, or null to use the current position
   * @returns Number of bytes written
   */
  async write(
    buffer: Uint8Array, 
    offset: number = 0, 
    length: number = buffer.length - offset, 
    position?: number
  ): Promise<number> {
    this.ensureOpen();
    
    const writePosition = position !== undefined ? position : this.position;
    const bytesWritten = this.file.write(buffer, offset, length, writePosition);
    
    // Update current position if we're not using an explicit position
    if (position === undefined) {
      this.position += bytesWritten;
    }
    
    return bytesWritten;
  }
  
  /**
   * Reads the entire file
   * 
   * @returns File contents
   */
  async readFile(): Promise<Uint8Array> {
    this.ensureOpen();
    
    // Create a copy of the file data
    const data = this.file.getData();
    this.file.updateAtime();
    
    return data;
  }
  
  /**
   * Writes data to the file, replacing its contents
   * 
   * @param data Data to write
   */
  async writeFile(data: Uint8Array): Promise<void> {
    this.ensureOpen();
    
    this.file.truncate(0);
    this.file.write(data, 0, data.length, 0);
    this.position = data.length;
  }
  
  /**
   * Gets file statistics
   * 
   * @returns File statistics
   */
  async stat(): Promise<FileStat> {
    this.ensureOpen();
    return new MemoryFileStat(this.file, this.fd);
  }
  
  /**
   * Truncates the file to the specified length
   * 
   * @param len New file length
   */
  async truncate(len: number = 0): Promise<void> {
    this.ensureOpen();
    this.file.truncate(len);
    
    // Reset position if it's now beyond the end of the file
    if (this.position > len) {
      this.position = len;
    }
  }
  
  /**
   * Syncs the file to the underlying storage
   * (no-op for memory file system)
   */
  async sync(): Promise<void> {
    this.ensureOpen();
    // No-op for memory file system
  }
  
  /**
   * Syncs only data to the underlying storage
   * (no-op for memory file system)
   */
  async datasync(): Promise<void> {
    this.ensureOpen();
    // No-op for memory file system
  }
  
  /**
   * Closes the file handle
   */
  async close(): Promise<void> {
    if (this.closed) {
      return;
    }
    
    this.closed = true;
    // Any cleanup needed can go here
  }
  
  /**
   * Ensures the file handle is open
   * 
   * @throws If the file handle is closed
   */
  private ensureOpen(): void {
    if (this.closed) {
      throw new Error(`File handle is closed (fd: ${this.fd}, path: ${this.path})`);
    }
  }
}

/**
 * Handle for in-memory directories
 */
export class MemoryDirHandle implements DirHandle {
  readonly fd: number;
  readonly path: string;
  private dir: MemoryDirectory;
  private entries: string[];
  private position: number;
  private closed: boolean;
  
  /**
   * Creates a new directory handle
   * 
   * @param fd File descriptor
   * @param path Directory path
   * @param dir Memory directory node
   */
  constructor(fd: number, path: string, dir: MemoryDirectory) {
    this.fd = fd;
    this.path = path;
    this.dir = dir;
    this.entries = Array.from(dir.getChildren().map(node => node.name));
    this.position = 0;
    this.closed = false;
  }
  
  /**
   * Reads the next directory entry
   * 
   * @returns Next directory entry, or null if there are no more entries
   */
  async read(): Promise<DirEntry | null> {
    this.ensureOpen();
    
    if (this.position >= this.entries.length) {
      return null; // No more entries
    }
    
    const name = this.entries[this.position++];
    const child = this.dir.getChild(name);
    
    if (!child) {
      // This should never happen, but handle it anyway
      return this.read();
    }
    
    // Construct path for the entry
    let entryPath = this.path;
    if (!entryPath.endsWith('/')) {
      entryPath += '/';
    }
    entryPath += name;
    
    return new MemoryDirEntry(child, entryPath);
  }
  
  /**
   * Creates an async iterator for directory entries
   * 
   * @returns Async iterator for directory entries
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<DirEntry> {
    let entry: DirEntry | null;
    while ((entry = await this.read()) !== null) {
      yield entry;
    }
  }
  
  /**
   * Closes the directory handle
   */
  async close(): Promise<void> {
    if (this.closed) {
      return;
    }
    
    this.closed = true;
    // Any cleanup needed can go here
  }
  
  /**
   * Ensures the directory handle is  UI implmrr d
   * 
   * @throws If the directory handle is closed
   */
  private ensureOpen(): void {
    if (this.closed) {
      throw new Error(`Directory handle is closed (fd: ${this.fd}, path: ${this.path})`);
    }
  }
} 