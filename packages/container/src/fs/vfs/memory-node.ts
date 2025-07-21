/**
 * InSpatial Container System - In-Memory File System Nodes
 * 
 * This file defines the node types used by the in-memory file system implementation.
 */

import { FilePermissions, FileType } from "./types.ts";

/**
 * Base class for in-memory file system nodes
 */
export abstract class MemoryNode {
  name: string;
  type: FileType;
  mode: number;
  uid: number;
  gid: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
  size: number;
  
  /**
   * Creates a new file system node
   * 
   * @param name Node name (filename or directory name)
   * @param type Node type (regular file, directory, etc.)
   * @param mode Access mode (permissions)
   */
  constructor(name: string, type: FileType, mode?: number) {
    this.name = name;
    this.type = type;
    this.mode = mode ?? this.getDefaultMode();
    this.uid = 0;
    this.gid = 0;
    
    const now = new Date();
    this.atime = now;
    this.mtime = now;
    this.ctime = now;
    this.birthtime = now;
    this.size = 0;
  }
  
  /**
   * Gets the default mode based on node type
   */
  protected getDefaultMode(): number {
    switch (this.type) {
      case FileType.DIRECTORY:
        return FilePermissions.DEFAULT_DIR;
      case FileType.SYMLINK:
        return 0o777;
      default:
        return FilePermissions.DEFAULT_FILE;
    }
  }
  
  /**
   * Updates the access time
   */
  updateAtime(): void {
    this.atime = new Date();
  }
  
  /**
   * Updates the modification time
   */
  updateMtime(): void {
    const now = new Date();
    this.mtime = now;
    this.ctime = now;
  }
  
  /**
   * Updates all times
   */
  updateTimes(): void {
    const now = new Date();
    this.atime = now;
    this.mtime = now;
    this.ctime = now;
  }
  
  /**
   * Checks if this node is a regular file
   */
  isFile(): boolean {
    return this.type === FileType.REGULAR;
  }
  
  /**
   * Checks if this node is a directory
   */
  isDirectory(): boolean {
    return this.type === FileType.DIRECTORY;
  }
  
  /**
   * Checks if this node is a symbolic link
   */
  isSymlink(): boolean {
    return this.type === FileType.SYMLINK;
  }
  
  /**
   * Checks if the process has permission to access this node
   * 
   * @param mode Access mode to check (read, write, execute)
   * @param uid User ID
   * @param gid Group ID
   * @returns True if access is allowed, false otherwise
   */
  checkAccess(mode: number, uid: number, gid: number): boolean {
    // Root user has full access
    if (uid === 0) {
      return true;
    }
    
    let mask = 0;
    
    // Check read permission
    if (mode & 4) {
      if (uid === this.uid) {
        mask |= FilePermissions.READ_OWNER;
      } else if (gid === this.gid) {
        mask |= FilePermissions.READ_GROUP;
      } else {
        mask |= FilePermissions.READ_OTHER;
      }
    }
    
    // Check write permission
    if (mode & 2) {
      if (uid === this.uid) {
        mask |= FilePermissions.WRITE_OWNER;
      } else if (gid === this.gid) {
        mask |= FilePermissions.WRITE_GROUP;
      } else {
        mask |= FilePermissions.WRITE_OTHER;
      }
    }
    
    // Check execute permission
    if (mode & 1) {
      if (uid === this.uid) {
        mask |= FilePermissions.EXECUTE_OWNER;
      } else if (gid === this.gid) {
        mask |= FilePermissions.EXECUTE_GROUP;
      } else {
        mask |= FilePermissions.EXECUTE_OTHER;
      }
    }
    
    return (this.mode & mask) === mask;
  }
  
  /**
   * Create a clone of this node
   */
  abstract clone(): MemoryNode;
}

/**
 * In-memory file node
 */
export class MemoryFile extends MemoryNode {
  private data: Uint8Array;
  
  /**
   * Creates a new file node
   * 
   * @param name File name
   * @param mode Access mode (permissions)
   * @param data Initial file content
   */
  constructor(name: string, mode?: number, data?: Uint8Array) {
    super(name, FileType.REGULAR, mode);
    this.data = data ?? new Uint8Array(0);
    this.size = this.data.length;
  }
  
  /**
   * Gets the file data
   * 
   * @returns File data
   */
  getData(): Uint8Array {
    return this.data;
  }
  
  /**
   * Sets the file data
   * 
   * @param data New file data
   */
  setData(data: Uint8Array): void {
    this.data = data;
    this.size = data.length;
    this.updateTimes();
  }
  
  /**
   * Reads data from the file
   * 
   * @param buffer Buffer to read into
   * @param offset Offset in the buffer to start writing at
   * @param length Number of bytes to read
   * @param position Position in the file to start reading from
   * @returns Number of bytes read
   */
  read(
    buffer: Uint8Array, 
    offset: number = 0, 
    length: number = buffer.length, 
    position: number = 0
  ): number {
    if (position >= this.data.length) {
      return 0; // EOF
    }
    
    const maxLength = Math.min(length, this.data.length - position);
    const maxOffset = Math.min(offset, buffer.length - 1);
    
    for (let i = 0; i < maxLength; i++) {
      if (maxOffset + i < buffer.length && position + i < this.data.length) {
        buffer[maxOffset + i] = this.data[position + i];
      }
    }
    
    this.updateAtime();
    
    return maxLength;
  }
  
  /**
   * Writes data to the file
   * 
   * @param buffer Buffer to write from
   * @param offset Offset in the buffer to start reading from
   * @param length Number of bytes to write
   * @param position Position in the file to start writing at
   * @returns Number of bytes written
   */
  write(
    buffer: Uint8Array, 
    offset: number = 0, 
    length: number = buffer.length - offset, 
    position: number = 0
  ): number {
    const maxLength = Math.min(length, buffer.length - offset);
    
    // Resize the file if needed
    if (position + maxLength > this.data.length) {
      const newData = new Uint8Array(position + maxLength);
      newData.set(this.data.subarray(0, this.data.length));
      this.data = newData;
    }
    
    // Copy the data
    if (maxLength > 0) {
      this.data.set(buffer.subarray(offset, offset + maxLength), position);
    }
    
    this.size = this.data.length;
    this.updateTimes();
    
    return maxLength;
  }
  
  /**
   * Truncates the file to the specified length
   * 
   * @param length New file length
   */
  truncate(length: number = 0): void {
    if (length === this.data.length) {
      return;
    }
    
    const newData = new Uint8Array(length);
    const copyLength = Math.min(length, this.data.length);
    
    if (copyLength > 0) {
      newData.set(this.data.subarray(0, copyLength));
    }
    
    this.data = newData;
    this.size = length;
    this.updateTimes();
  }
  
  /**
   * Creates a clone of this file
   * 
   * @returns A new MemoryFile with the same properties
   */
  override clone(): MemoryFile {
    const clone = new MemoryFile(this.name, this.mode);
    clone.uid = this.uid;
    clone.gid = this.gid;
    clone.atime = new Date(this.atime.getTime());
    clone.mtime = new Date(this.mtime.getTime());
    clone.ctime = new Date(this.ctime.getTime());
    clone.birthtime = new Date(this.birthtime.getTime());
    
    // Copy the data
    if (this.data.length > 0) {
      const newData = new Uint8Array(this.data.length);
      newData.set(this.data);
      clone.setData(newData);
    }
    
    return clone;
  }
}

/**
 * In-memory directory node
 */
export class MemoryDirectory extends MemoryNode {
  private children: Map<string, MemoryNode>;
  
  /**
   * Creates a new directory node
   * 
   * @param name Directory name
   * @param mode Access mode (permissions)
   */
  constructor(name: string, mode?: number) {
    super(name, FileType.DIRECTORY, mode);
    this.children = new Map();
  }
  
  /**
   * Adds a child node to the directory
   * 
   * @param node Child node to add
   */
  addChild(node: MemoryNode): void {
    this.children.set(node.name, node);
    this.updateMtime();
  }
  
  /**
   * Removes a child node from the directory
   * 
   * @param name Name of the child node to remove
   * @returns True if the child was removed, false if it didn't exist
   */
  removeChild(name: string): boolean {
    const result = this.children.delete(name);
    if (result) {
      this.updateMtime();
    }
    return result;
  }
  
  /**
   * Gets a child node by name
   * 
   * @param name Name of the child node to get
   * @returns The child node or undefined if not found
   */
  getChild(name: string): MemoryNode | undefined {
    return this.children.get(name);
  }
  
  /**
   * Checks if the directory has a child with the given name
   * 
   * @param name Name to check
   * @returns True if the directory has a child with the given name
   */
  hasChild(name: string): boolean {
    return this.children.has(name);
  }
  
  /**
   * Gets all children
   * 
   * @returns Array of child nodes
   */
  getChildren(): MemoryNode[] {
    return Array.from(this.children.values());
  }
  
  /**
   * Gets the number of children
   * 
   * @returns Number of children
   */
  getChildCount(): number {
    return this.children.size;
  }
  
  /**
   * Checks if the directory is empty
   * 
   * @returns True if the directory is empty
   */
  isEmpty(): boolean {
    return this.children.size === 0;
  }
  
  /**
   * Creates a clone of this directory
   * 
   * @returns A new MemoryDirectory with the same properties
   */
  override clone(): MemoryDirectory {
    const clone = new MemoryDirectory(this.name, this.mode);
    clone.uid = this.uid;
    clone.gid = this.gid;
    clone.atime = new Date(this.atime.getTime());
    clone.mtime = new Date(this.mtime.getTime());
    clone.ctime = new Date(this.ctime.getTime());
    clone.birthtime = new Date(this.birthtime.getTime());
    
    // Clone all children
    Array.from(this.children.entries()).forEach(([_, child]) => {
      clone.addChild(child.clone());
    });
    
    return clone;
  }
}

/**
 * In-memory symbolic link node
 */
export class MemorySymlink extends MemoryNode {
  target: string;
  
  /**
   * Creates a new symbolic link node
   * 
   * @param name Link name
   * @param target Target path
   * @param mode Access mode (permissions)
   */
  constructor(name: string, target: string, mode?: number) {
    super(name, FileType.SYMLINK, mode);
    this.target = target;
  }
  
  /**
   * Creates a clone of this symbolic link
   * 
   * @returns A new MemorySymlink with the same properties
   */
  override clone(): MemorySymlink {
    const clone = new MemorySymlink(this.name, this.target, this.mode);
    clone.uid = this.uid;
    clone.gid = this.gid;
    clone.atime = new Date(this.atime.getTime());
    clone.mtime = new Date(this.mtime.getTime());
    clone.ctime = new Date(this.ctime.getTime());
    clone.birthtime = new Date(this.birthtime.getTime());
    return clone;
  }
} 