/**
 * InSpatial Container System - Virtual File System Types
 * 
 * This file defines the core interfaces and types for the virtual file system (VFS)
 * implementation. The VFS provides a secure abstraction over the underlying file system
 * operations, ensuring proper isolation between containers and the host system.
 */

/**
 * Open flags for file operations
 */
export enum OpenFlags {
  READ = 1 << 0,          // Open for reading
  WRITE = 1 << 1,         // Open for writing
  CREATE = 1 << 2,        // Create file if it doesn't exist
  TRUNCATE = 1 << 3,      // Truncate file to zero length if it exists
  APPEND = 1 << 4,        // Append to file
  EXCLUSIVE = 1 << 5,     // Fail if CREATE and file exists
  DIRECTORY = 1 << 6,     // Open directory
  SYNC = 1 << 7,          // Synchronous writes
  NONBLOCK = 1 << 8,      // Non-blocking mode
  SYMLINK = 1 << 9,       // Open symlink itself, not target
}

/**
 * File types
 */
export enum FileType {
  UNKNOWN = 0,            // Unknown file type
  REGULAR = 1,            // Regular file
  DIRECTORY = 2,          // Directory
  SYMLINK = 3,            // Symbolic link
  BLOCK = 4,              // Block device
  CHARACTER = 5,          // Character device
  FIFO = 6,               // FIFO/pipe
  SOCKET = 7,             // Socket
}

/**
 * File permissions using Unix-style octal notation
 */
export enum FilePermissions {
  NONE = 0o000,
  EXECUTE_OTHER = 0o001,
  WRITE_OTHER = 0o002,
  READ_OTHER = 0o004,
  EXECUTE_GROUP = 0o010,
  WRITE_GROUP = 0o020,
  READ_GROUP = 0o040,
  EXECUTE_OWNER = 0o100,
  WRITE_OWNER = 0o200,
  READ_OWNER = 0o400,
  
  // Common permission combinations
  READ_ONLY = 0o444,      // r--r--r--
  READ_WRITE = 0o666,     // rw-rw-rw-
  READ_EXECUTE = 0o555,   // r-xr-xr-x
  READ_WRITE_EXECUTE = 0o777, // rwxrwxrwx
  DEFAULT_FILE = 0o644,   // rw-r--r--
  DEFAULT_DIR = 0o755,    // rwxr-xr-x
}

/**
 * File stat information
 */
export interface FileStat {
  dev: number;            // Device ID containing the file
  ino: number;            // Inode number
  mode: number;           // File type and permissions
  nlink: number;          // Number of hard links
  uid: number;            // User ID of owner
  gid: number;            // Group ID of owner
  rdev: number;           // Device ID (if special file)
  size: number;           // Total size in bytes
  blksize: number;        // Block size for filesystem I/O
  blocks: number;         // Number of blocks allocated
  atime: Date;            // Last access time
  mtime: Date;            // Last modification time
  ctime: Date;            // Last status change time
  birthtime: Date;        // Creation time
  
  // Helper methods
  isFile(): boolean;      // Returns true if this is a regular file
  isDirectory(): boolean; // Returns true if this is a directory
  isSymlink(): boolean;   // Returns true if this is a symbolic link
  isBlockDevice(): boolean; // Returns true if this is a block device
  isCharacterDevice(): boolean; // Returns true if this is a character device
  isFIFO(): boolean;      // Returns true if this is a FIFO/pipe
  isSocket(): boolean;    // Returns true if this is a socket
}

/**
 * Directory entry
 */
export interface DirEntry {
  name: string;           // File name
  path: string;           // Full path
  type: FileType;         // File type
  isFile(): boolean;      // Returns true if this is a regular file
  isDirectory(): boolean; // Returns true if this is a directory
  isSymlink(): boolean;   // Returns true if this is a symbolic link
}

/**
 * File handle for I/O operations
 */
export interface FileHandle {
  fd: number;             // File descriptor (internal)
  path: string;           // File path
  flags: number;          // Open flags
  
  // I/O operations
  read(buffer: Uint8Array, offset?: number, length?: number, position?: number): Promise<number>;
  write(buffer: Uint8Array, offset?: number, length?: number, position?: number): Promise<number>;
  readFile(): Promise<Uint8Array>;
  writeFile(data: Uint8Array): Promise<void>;
  
  // File operations
  stat(): Promise<FileStat>;
  truncate(len?: number): Promise<void>;
  sync(): Promise<void>;
  datasync(): Promise<void>;
  
  // Handle management
  close(): Promise<void>;
}

/**
 * Directory handle for directory operations
 */
export interface DirHandle {
  fd: number;             // File descriptor (internal)
  path: string;           // Directory path
  
  // Iterator for entries
  read(): Promise<DirEntry | null>;
  [Symbol.asyncIterator](): AsyncIterableIterator<DirEntry>;
  
  // Directory management
  close(): Promise<void>;
}

/**
 * Mount options for file systems
 */
export interface MountOptions {
  readonly?: boolean;     // Mount read-only
  noexec?: boolean;       // Disallow execution of binaries
  nosuid?: boolean;       // Ignore setuid/setgid bits
  nodev?: boolean;        // Disallow access to device files
  remount?: boolean;      // Remount existing mount
  sync?: boolean;         // Synchronous I/O
}

/**
 * File system interface
 */
export interface FileSystem {
  // Mount/unmount operations
  mount(source: string, target: string, options?: MountOptions): Promise<void>;
  unmount(target: string, force?: boolean): Promise<void>;
  
  // Path-based operations
  open(path: string, flags: number, mode?: number): Promise<FileHandle>;
  opendir(path: string): Promise<DirHandle>;
  stat(path: string, followSymlinks?: boolean): Promise<FileStat>;
  access(path: string, mode?: number): Promise<boolean>;
  
  // File operations
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array, options?: { mode?: number, flag?: number }): Promise<void>;
  truncate(path: string, len?: number): Promise<void>;
  unlink(path: string): Promise<void>;
  
  // Directory operations
  mkdir(path: string, options?: { recursive?: boolean, mode?: number }): Promise<void>;
  rmdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  readdir(path: string): Promise<string[]>;
  readdirWithFileTypes(path: string): Promise<DirEntry[]>;
  
  // Link operations
  link(existingPath: string, newPath: string): Promise<void>;
  symlink(target: string, path: string): Promise<void>;
  readlink(path: string): Promise<string>;
  
  // Path operations
  rename(oldPath: string, newPath: string): Promise<void>;
  realpath(path: string): Promise<string>;
  
  // Special operations
  chmod(path: string, mode: number): Promise<void>;
  chown(path: string, uid: number, gid: number): Promise<void>;
  utimes(path: string, atime: Date | number, mtime: Date | number): Promise<void>;
  
  // Space information
  df(): Promise<{ free: number, available: number, total: number }>;
}

/**
 * Virtual path mapping options
 */
export interface VirtualPathMappingOptions {
  readonly?: boolean;     // Read-only access
  noexec?: boolean;       // Disallow execution
  allowedExtensions?: string[]; // List of allowed file extensions
  deniedExtensions?: string[]; // List of denied file extensions
  rootOnly?: boolean;     // Only allow access at root level (no subdirectories)
  preserveOwnership?: boolean; // Preserve file ownership
  isolate?: boolean;      // Full isolation (copy on access)
}

/**
 * File change event types
 */
export enum FileChangeType {
  CREATED = 1,     // File was created
  MODIFIED = 2,    // File was modified
  DELETED = 3      // File was deleted
}

/**
 * File change event
 */
export interface FileChangeEvent {
  type: FileChangeType;  // Type of change
  path: string;          // Path of the changed file
  timestamp: Date;       // When the change occurred
}

/**
 * File watcher interface
 */
export interface FileWatcher {
  /**
   * Adds an event listener for file changes
   * 
   * @param event Event type ('change')
   * @param listener Function to call when a change is detected
   */
  on(event: 'change', listener: (event: FileChangeEvent) => void): void;
  
  /**
   * Closes the watcher and stops receiving events
   */
  close(): Promise<void>;
}

/**
 * Virtual file system interface
 * 
 * Extends the base file system with virtual path mapping
 * and container-specific functionality
 */
export interface VirtualFileSystem extends FileSystem {
  // Virtual path management
  mapPath(virtualPath: string, realPath: string, options?: VirtualPathMappingOptions): Promise<void>;
  unmapPath(virtualPath: string): Promise<void>;
  resolveVirtualPath(virtualPath: string): Promise<string>;
  
  // Container-specific operations
  initialize(containerId: string): Promise<void>;
  cleanup(containerId: string): Promise<void>;
  snapshot(containerId: string, targetPath: string): Promise<void>;
  restore(containerId: string, sourcePath: string): Promise<void>;
  
  // Access control
  setSecurityContext(context: SecurityContext): void;
  
  // File watching
  watch(path: string, recursive?: boolean): Promise<FileWatcher>;
}

/**
 * Security context for file operations
 */
export interface SecurityContext {
  userId: number;        // User ID for file operations
  groupId: number;       // Group ID for file operations
  permissions: string[]; // Permission strings (e.g., "fs.read", "fs.write")
  securityTokens: Map<string, string>; // Security tokens
} 