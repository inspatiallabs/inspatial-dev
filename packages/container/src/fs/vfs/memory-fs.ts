/**
 * InSpatial Container System - In-Memory File System
 * 
 * This file implements a fully in-memory file system for use in containers.
 * It provides a secure, isolated environment for file operations without
 * direct host file system access.
 */

import { BaseFileSystem } from "./base-fs.ts";
import { MemoryDirEntry, MemoryDirHandle, MemoryFileStat, MemoryFileHandle } from "./memory-handles.ts";
import { MemoryDirectory, MemoryFile, MemoryNode, MemorySymlink } from "./memory-node.ts";
import { VfsPath } from "./path.ts";
import {
  DirEntry,
  DirHandle,
  FileHandle,
  FileStat,
  FilePermissions,
  FileSystem,
  FileType,
  MountOptions,
  OpenFlags
} from "./types.ts";

/**
 * In-memory file system implementation
 */
export class MemoryFileSystem extends BaseFileSystem {
  private root: MemoryDirectory;
  private inodes: Map<number, MemoryNode>;
  private nextInode: number;
  private nextFd: number;
  private currentUid: number;
  private currentGid: number;
  private mounts: Map<string, { source: string, options: MountOptions }>;

  /**
   * Initializes standard directories in the file system
   */
  private async initializeStandardDirectories(): Promise<void> {
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
   * Creates a new in-memory file system
   * 
   * @param name File system name/identifier
   */
  constructor(name: string = "memory") {
    super(name);
    
    // Initialize file system state
    this.root = new MemoryDirectory("");
    this.inodes = new Map();
    this.nextInode = 1;
    this.nextFd = 3; // Start at 3 (0, 1, 2 are stdin, stdout, stderr)
    this.currentUid = 0;
    this.currentGid = 0;
    this.mounts = new Map();
    
    // Assign inode to root directory
    this.inodes.set(this.nextInode++, this.root as unknown as MemoryNode);
    
    // Initialize standard directories
    this.initializeStandardDirectories().catch(() => {
      // Ignore errors during initialization
    });
  }

  /**
   * Gets the next available file descriptor
   */
  private getNextFd(): number {
    return this.nextFd++;
  }

  /**
   * Resolves a path to a node
   * 
   * @param path Path to resolve
   * @param followSymlinks Whether to follow symbolic links
   * @returns The node at the path and its parent directory
   * @throws If the path doesn't exist
   */
  private async resolveMemoryPath(
    path: string,
    followSymlinks: boolean = true
  ): Promise<{ node: MemoryNode, parent: MemoryDirectory | null, resolvedPath: string }> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Handle root directory
    if (normalizedPath === "/" || normalizedPath === "") {
      return {
        node: this.root as unknown as MemoryNode,
        parent: null,
        resolvedPath: "/"
      };
    }
    
    // Split the path into components
    const components = normalizedPath.split("/").filter(c => c.length > 0);
    let current: MemoryNode = this.root as unknown as MemoryNode;
    let parent: MemoryDirectory | null = null;
    let resolvedPath = "/";
    
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      
      // Ensure current node is a directory
      if (!current.isDirectory()) {
        throw new Error(`Not a directory: ${resolvedPath}`);
      }
      
      // Set parent to current directory
      parent = current as unknown as MemoryDirectory;
      
      // Get child node
      const child = (current as unknown as MemoryDirectory).getChild(component);
      if (!child) {
        throw new Error(`No such file or directory: ${normalizedPath}`);
      }
      
      // Update current and resolvedPath
      current = child;
      resolvedPath = resolvedPath === "/" 
        ? `/${component}` 
        : `${resolvedPath}/${component}`;
      
      // Handle symbolic links
      if (followSymlinks && current.isSymlink() && i < components.length - 1) {
        const link = current as unknown as MemorySymlink;
        const target = this.normalizePath(link.target);
        
        // Resolve the target
        const targetResolution = await this.resolveMemoryPath(target, true);
        
        // Update current and parent
        current = targetResolution.node;
        parent = targetResolution.node.isDirectory() 
          ? targetResolution.node as unknown as MemoryDirectory 
          : targetResolution.parent;
        resolvedPath = targetResolution.resolvedPath;
      }
    }
    
    // Handle symbolic links for the final component
    if (followSymlinks && current.isSymlink()) {
      const link = current as unknown as MemorySymlink;
      const target = this.normalizePath(link.target);
      
      // Resolve the target
      const targetResolution = await this.resolveMemoryPath(target, true);
      
      // Update current and parent
      current = targetResolution.node;
      parent = targetResolution.parent;
      resolvedPath = targetResolution.resolvedPath;
    }
    
    return { node: current, parent, resolvedPath };
  }

  /**
   * Creates a file node in the file system
   * 
   * @param path Path to create the file at
   * @param mode File mode
   * @param data Initial file data
   * @returns The created file node
   * @throws If the file already exists or the path is invalid
   */
  private async createFile(
    path: string,
    mode?: number,
    data?: Uint8Array
  ): Promise<MemoryFile> {
    // Ensure path is valid
    if (!this.validatePath(path)) {
      throw new Error(`Invalid path: ${path}`);
    }
    
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Get the parent directory
    const parentPath = VfsPath.dirname(normalizedPath);
    const { node: parent } = await this.resolveMemoryPath(parentPath);
    
    // Ensure parent is a directory
    if (!parent.isDirectory()) {
      throw new Error(`Not a directory: ${parentPath}`);
    }
    
    // Get the file name
    const fileName = VfsPath.basename(normalizedPath);
    
    // Check if file already exists
    if ((parent as unknown as MemoryDirectory).hasChild(fileName)) {
      throw new Error(`File already exists: ${normalizedPath}`);
    }
    
    // Create the file
    const file = new MemoryFile(fileName, mode);
    file.uid = this.currentUid;
    file.gid = this.currentGid;
    
    // Set initial data if provided
    if (data) {
      file.setData(data);
    }
    
    // Add the file to the parent directory
    (parent as unknown as MemoryDirectory).addChild(file);
    
    // Assign inode
    this.inodes.set(this.nextInode++, file as unknown as MemoryNode);
    
    return file;
  }

  /**
   * Creates a directory at the specified path
   */
  async mkdir(
    path: string,
    options: { recursive?: boolean, mode?: number } = {}
  ): Promise<void> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // For root directory, just ignore - it always exists
    if (normalizedPath === "/") {
      return;
    }
    
    try {
      // Try to resolve the path
      await this.resolveMemoryPath(normalizedPath);
      
      // If we get here, the path exists
      // If recursive is true, ignore existing directory
      if (options.recursive) {
        return;
      }
      
      throw new Error(`File already exists: ${normalizedPath}`);
    } catch (error: any) {
      // If the error is not "No such file or directory", rethrow
      if (!(error as Error).message.includes("No such file or directory")) {
        throw error;
      }
      
      // Get the parent directory path and the directory name
      const parentPath = VfsPath.dirname(normalizedPath);
      const dirName = VfsPath.basename(normalizedPath);
      
      // If recursive option is set, ensure parent directory exists
      if (options.recursive && parentPath !== "/" && parentPath !== "") {
        try {
          await this.mkdir(parentPath, { recursive: true, mode: options.mode });
        } catch (recursiveError: any) {
          // If parent can't be created, rethrow the error
          throw recursiveError;
        }
      }
      
      // Resolve the parent path
      try {
        const { node: parentNode } = await this.resolveMemoryPath(parentPath);
        
        // Ensure the parent is a directory
        if (!parentNode.isDirectory()) {
          throw new Error(`Not a directory: ${parentPath}`);
        }
        
        // Create the directory node
        const dirNode = new MemoryDirectory(dirName, options.mode || 0o755);
        dirNode.uid = this.currentUid;
        dirNode.gid = this.currentGid;
        
        // Add to parent directory
        (parentNode as unknown as MemoryDirectory).addChild(dirNode);
        
        // Add to inodes
        this.inodes.set(this.nextInode++, dirNode as unknown as MemoryNode);
      } catch (parentError: any) {
        // If parent doesn't exist and recursive is false, throw an error
        throw new Error(`No such file or directory: ${parentPath}`);
      }
    }
  }

  /**
   * Mounts a file system at the specified target
   */
  async mount(source: string, target: string, options: MountOptions = {}): Promise<void> {
    // Normalize the target path
    const normalizedTarget = this.normalizePath(target);
    
    // Ensure the target exists and is a directory
    try {
      const stat = await this.stat(normalizedTarget);
      if (!stat.isDirectory()) {
        throw new Error(`Mount point is not a directory: ${normalizedTarget}`);
      }
    } catch (error) {
      // If the target doesn't exist, create it
      if ((error as Error).message.includes("No such file or directory")) {
        await this.mkdir(normalizedTarget);
      } else {
        throw error;
      }
    }
    
    // Register the mount
    this.mounts.set(normalizedTarget, { source, options });
  }

  /**
   * Unmounts a file system from the specified target
   */
  async unmount(target: string, force: boolean = false): Promise<void> {
    // Normalize the target path
    const normalizedTarget = this.normalizePath(target);
    
    // Check if the target is mounted
    if (!this.mounts.has(normalizedTarget)) {
      throw new Error(`No file system mounted at: ${normalizedTarget}`);
    }
    
    // Remove the mount
    this.mounts.delete(normalizedTarget);
  }

  /**
   * Opens a file at the specified path
   */
  async open(
    path: string,
    flags: number = OpenFlags.READ,
    mode: number = 0o666
  ): Promise<FileHandle> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    try {
      // Try to resolve the path
      const { node, resolvedPath } = await this.resolveMemoryPath(
        normalizedPath,
        !(flags & OpenFlags.SYMLINK) // Don't follow symlinks if SYMLINK flag is set
      );
      
      // Check if this is a directory open
      if (node.isDirectory()) {
        if (!(flags & OpenFlags.DIRECTORY)) {
          throw new Error(`Is a directory: ${resolvedPath}`);
        }
      } else if (flags & OpenFlags.DIRECTORY) {
        throw new Error(`Not a directory: ${resolvedPath}`);
      }
      
      // Check access permissions
      const accessMode = ((flags & OpenFlags.READ) ? 4 : 0) | 
                         ((flags & OpenFlags.WRITE) ? 2 : 0);
      
      if (!node.checkAccess(accessMode, this.currentUid, this.currentGid)) {
        throw new Error(`Permission denied: ${resolvedPath}`);
      }
      
      // If TRUNCATE flag is set, truncate the file
      if ((flags & OpenFlags.TRUNCATE) && (flags & OpenFlags.WRITE)) {
        if (node.isFile()) {
          (node as unknown as MemoryFile).truncate(0);
        }
      }
      
      // Create a file handle
      const fd = this.getNextFd();
      
      // Ensure we have a file, not a directory or symlink
      if (!node.isFile()) {
        throw new Error(`Not a regular file: ${resolvedPath}`);
      }
      
      return new MemoryFileHandle(
        fd,
        resolvedPath,
        node as unknown as MemoryFile,
        flags
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // If file doesn't exist and CREATE flag is set, create it
      if (
        errorMessage.includes("No such file or directory") &&
        (flags & OpenFlags.CREATE)
      ) {
        // Check if EXCLUSIVE flag is set (fail if file exists)
        if (flags & OpenFlags.EXCLUSIVE) {
          try {
            // Check if file exists
            await this.resolveMemoryPath(normalizedPath, true);
            throw new Error(`File already exists: ${normalizedPath}`);
          } catch (innerError: unknown) {
            const innerErrorMessage = innerError instanceof Error ? innerError.message : String(innerError);
            // If the error is not "no such file", rethrow it
            if (!innerErrorMessage.includes("No such file or directory")) {
              throw innerError;
            }
            // Otherwise, proceed with creating the file
          }
        }
        
        // Create the file
        const file = await this.createFile(normalizedPath, mode);
        
        // Create a file handle
        const fd = this.getNextFd();
        return new MemoryFileHandle(
          fd,
          normalizedPath,
          file,
          flags
        );
      }
      
      // Otherwise, rethrow the error
      throw error;
    }
  }

  /**
   * Opens a directory at the specified path
   */
  async opendir(path: string): Promise<DirHandle> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node } = await this.resolveMemoryPath(normalizedPath);
    
    // Ensure it's a directory
    if (!node.isDirectory()) {
      throw new Error(`Not a directory: ${normalizedPath}`);
    }
    
    // Create a directory handle
    const fd = this.getNextFd();
    return new MemoryDirHandle(fd, normalizedPath, node as unknown as MemoryDirectory);
  }

  /**
   * Gets file statistics for the specified path
   */
  async stat(path: string, followSymlinks: boolean = true): Promise<FileStat> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node } = await this.resolveMemoryPath(normalizedPath, followSymlinks);
    
    // Get inode number
    let inodeNum = -1;
    for (const [ino, inode] of Array.from(this.inodes.entries())) {
      if (inode === node) {
        inodeNum = ino;
        break;
      }
    }
    
    // Create file statistics
    return new MemoryFileStat(node, inodeNum);
  }

  /**
   * Checks if the process has the specified access to the file
   */
  async access(path: string, mode: number = 0): Promise<boolean> {
    try {
      // Resolve the path
      const { node } = await this.resolveMemoryPath(path);
      
      // Check access permissions
      return node.checkAccess(mode, this.currentUid, this.currentGid);
    } catch (error) {
      return false;
    }
  }

  /**
   * Deletes a file from the file system
   */
  async unlink(path: string): Promise<void> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node, parent } = await this.resolveMemoryPath(normalizedPath, false);
    
    // Ensure it's not a directory
    if (node.isDirectory()) {
      throw new Error(`Is a directory: ${normalizedPath}`);
    }
    
    // Ensure we have a parent
    if (!parent) {
      throw new Error(`Cannot unlink root directory`);
    }
    
    // Remove from parent directory
    parent.removeChild(node.name);
    
    // Remove from inodes
    for (const [num, n] of Array.from(this.inodes.entries())) {
      if (n === node) {
        this.inodes.delete(num);
        break;
      }
    }
  }

  /**
   * Removes a directory from the file system
   */
  async rmdir(
    path: string,
    options: { recursive?: boolean } = {}
  ): Promise<void> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node, parent } = await this.resolveMemoryPath(normalizedPath);
    
    // Ensure it's a directory
    if (!node.isDirectory()) {
      throw new Error(`Not a directory: ${normalizedPath}`);
    }
    
    // Ensure we have a parent
    if (!parent) {
      throw new Error(`Cannot remove root directory`);
    }
    
    const dir = node as unknown as MemoryDirectory;
    
    // Check if the directory is empty or recursive is true
    if (!dir.isEmpty() && !options.recursive) {
      throw new Error(`Directory not empty: ${normalizedPath}`);
    }
    
    // Remove all children if recursive is true
    if (options.recursive) {
      for (const child of dir.getChildren()) {
        const childPath = `${normalizedPath}/${child.name}`;
        
        if (child.isDirectory()) {
          await this.rmdir(childPath, { recursive: true });
        } else {
          await this.unlink(childPath);
        }
      }
    }
    
    // Remove from parent directory
    parent.removeChild(node.name);
    
    // Remove from inodes
    for (const [num, n] of Array.from(this.inodes.entries())) {
      if (n === node) {
        this.inodes.delete(num);
        break;
      }
    }
  }

  /**
   * Reads the contents of a directory
   */
  async readdirWithFileTypes(path: string): Promise<DirEntry[]> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node } = await this.resolveMemoryPath(normalizedPath);
    
    // Ensure it's a directory
    if (!node.isDirectory()) {
      throw new Error(`Not a directory: ${normalizedPath}`);
    }
    
    const dir = node as unknown as MemoryDirectory;
    
    // Create directory entries
    const entries: DirEntry[] = [];
    
    for (const child of dir.getChildren()) {
      const childPath = normalizedPath === "/" 
        ? `/${child.name}` 
        : `${normalizedPath}/${child.name}`;
      
      entries.push(new MemoryDirEntry(child as unknown as MemoryNode, childPath));
    }
    
    return entries;
  }

  /**
   * Creates a hard link from existingPath to newPath
   */
  async link(existingPath: string, newPath: string): Promise<void> {
    // Normalize the paths
    const normalizedExistingPath = this.normalizePath(existingPath);
    const normalizedNewPath = this.normalizePath(newPath);
    
    // Resolve the existing path
    const { node: existingNode } = await this.resolveMemoryPath(normalizedExistingPath, false);
    
    // Ensure it's not a directory
    if (existingNode.isDirectory()) {
      throw new Error(`Is a directory: ${normalizedExistingPath}`);
    }
    
    // Get the parent directory of the new path
    const newParentPath = VfsPath.dirname(normalizedNewPath);
    const { node: newParent } = await this.resolveMemoryPath(newParentPath);
    
    // Ensure parent is a directory
    if (!newParent.isDirectory()) {
      throw new Error(`Not a directory: ${newParentPath}`);
    }
    
    // Get the new file name
    const newFileName = VfsPath.basename(normalizedNewPath);
    
    // Check if the new path already exists
    if ((newParent as unknown as MemoryDirectory).hasChild(newFileName)) {
      throw new Error(`File already exists: ${normalizedNewPath}`);
    }
    
    // Add the existing node to the new parent directory
    (newParent as unknown as MemoryDirectory).addChild(existingNode as unknown as MemoryFile);
  }

  /**
   * Creates a symbolic link at path pointing to target
   */
  async symlink(target: string, path: string): Promise<void> {
    // Normalize the paths
    const normalizedPath = this.normalizePath(path);
    
    // Get the parent directory
    const parentPath = VfsPath.dirname(normalizedPath);
    const { node: parent } = await this.resolveMemoryPath(parentPath);
    
    // Ensure parent is a directory
    if (!parent.isDirectory()) {
      throw new Error(`Not a directory: ${parentPath}`);
    }
    
    // Get the link name
    const linkName = VfsPath.basename(normalizedPath);
    
    // Check if the path already exists
    if ((parent as unknown as MemoryDirectory).hasChild(linkName)) {
      throw new Error(`File already exists: ${normalizedPath}`);
    }
    
    // Create the symbolic link
    const symlink = new MemorySymlink(linkName, target);
    symlink.uid = this.currentUid;
    symlink.gid = this.currentGid;
    
    // Add the symlink to the parent directory
    (parent as unknown as MemoryDirectory).addChild(symlink);
    
    // Assign inode
    this.inodes.set(this.nextInode++, symlink as unknown as MemoryNode);
  }

  /**
   * Reads the target of a symbolic link
   */
  async readlink(path: string): Promise<string> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path without following symlinks
    const { node } = await this.resolveMemoryPath(normalizedPath, false);
    
    // Ensure it's a symbolic link
    if (!node.isSymlink()) {
      throw new Error(`Not a symbolic link: ${normalizedPath}`);
    }
    
    return (node as unknown as MemorySymlink).target;
  }

  /**
   * Renames a file or directory from oldPath to newPath
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    // Normalize the paths
    const normalizedOldPath = this.normalizePath(oldPath);
    const normalizedNewPath = this.normalizePath(newPath);
    
    // Resolve the old path
    const { node: oldNode, parent: oldParent } = await this.resolveMemoryPath(normalizedOldPath);
    
    // Ensure we have a parent for the old path
    if (!oldParent) {
      throw new Error(`Cannot rename root directory`);
    }
    
    // Get the parent directory of the new path
    const newParentPath = VfsPath.dirname(normalizedNewPath);
    const { node: newParentNode } = await this.resolveMemoryPath(newParentPath);
    
    // Ensure parent is a directory
    if (!newParentNode.isDirectory()) {
      throw new Error(`Not a directory: ${newParentPath}`);
    }
    
    const newParent = newParentNode as unknown as MemoryDirectory;
    
    // Get the new file name
    const newName = VfsPath.basename(normalizedNewPath);
    
    // Remove the node from the old parent
    oldParent.removeChild(oldNode.name);
    
    // Update the node's name
    oldNode.name = newName;
    
    // Add the node to the new parent
    newParent.addChild(oldNode as unknown as MemoryFile);
  }

  /**
   * Returns the canonicalized absolute pathname
   */
  async realpath(path: string): Promise<string> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { resolvedPath } = await this.resolveMemoryPath(normalizedPath);
    
    return resolvedPath;
  }

  /**
   * Changes the permissions of a file
   */
  async chmod(path: string, mode: number): Promise<void> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node } = await this.resolveMemoryPath(normalizedPath);
    
    // Update the mode
    node.mode = mode;
    node.updateMtime();
  }

  /**
   * Changes the owner and group of a file
   */
  async chown(path: string, uid: number, gid: number): Promise<void> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node } = await this.resolveMemoryPath(normalizedPath);
    
    // Update the owner and group
    node.uid = uid;
    node.gid = gid;
    node.updateMtime();
  }

  /**
   * Changes the file system timestamps of a file
   */
  async utimes(
    path: string,
    atime: Date | number,
    mtime: Date | number
  ): Promise<void> {
    // Normalize the path
    const normalizedPath = this.normalizePath(path);
    
    // Resolve the path
    const { node } = await this.resolveMemoryPath(normalizedPath);
    
    // Update the timestamps
    node.atime = atime instanceof Date ? atime : new Date(atime);
    node.mtime = mtime instanceof Date ? mtime : new Date(mtime);
    node.ctime = new Date();
  }

  /**
   * Gets disk space information
   */
  async df(): Promise<{ free: number, available: number, total: number }> {
    // In-memory file system has unlimited space
    const space = Number.MAX_SAFE_INTEGER;
    return {
      free: space,
      available: space,
      total: space
    };
  }

  /**
   * Sets the current user ID
   */
  setUserId(uid: number): void {
    this.currentUid = uid;
  }

  /**
   * Sets the current group ID
   */
  setGroupId(gid: number): void {
    this.currentGid = gid;
  }

  /**
   * Reads a file at the specified path
   * 
   * @param path Path to the file to read
   * @returns File contents
   */
  override async readFile(path: string): Promise<Uint8Array> {
    // Open the file for reading
    const handle = await this.open(path, OpenFlags.READ);
    
    try {
      // Read the file
      return await handle.readFile();
    } finally {
      // Always close the handle
      await handle.close();
    }
  }

  /**
   * Writes data to a file, creating it if it doesn't exist
   * 
   * @param path Path to the file to write
   * @param data Data to write
   * @param options Write options
   */
  override async writeFile(
    path: string,
    data: Uint8Array,
    options?: { mode?: number, flag?: number }
  ): Promise<void> {
    // Set up flags for opening/creating the file
    const flags = options?.flag ?? (OpenFlags.WRITE | OpenFlags.CREATE | OpenFlags.TRUNCATE);
    const mode = options?.mode ?? 0o666;
    
    // Open the file for writing
    const handle = await this.open(path, flags, mode);
    
    try {
      // Write to the file
      await handle.writeFile(data);
    } finally {
      // Always close the handle
      await handle.close();
    }
  }
} 