/**
 * Simple In-Memory File System
 * 
 * A reduced version of the memory file system for testing purposes.
 */

import { FilePermissions, FileType } from "./vfs/types.ts";

/**
 * Simple memory file node
 */
class MemoryNode {
  name: string;
  mode: number;
  uid: number = 0;
  gid: number = 0;
  atime: Date = new Date();
  mtime: Date = new Date();
  ctime: Date = new Date();
  size: number = 0;
  
  constructor(name: string, mode: number = FileType.REGULAR) {
    this.name = name;
    this.mode = mode;
  }
  
  isFile(): boolean {
    return (this.mode & FileType.REGULAR) === FileType.REGULAR;
  }
  
  isDirectory(): boolean {
    return (this.mode & FileType.DIRECTORY) === FileType.DIRECTORY;
  }
  
  isSymlink(): boolean {
    return (this.mode & FileType.SYMLINK) === FileType.SYMLINK;
  }
  
  updateTimes(): void {
    this.atime = new Date();
    this.mtime = new Date();
    this.ctime = new Date();
  }
  
  checkAccess(mode: number, uid: number, gid: number): boolean {
    // Root can do anything
    if (uid === 0) return true;
    
    // Owner access
    if (uid === this.uid) {
      const ownerMode = (this.mode & 0o700) >> 6;
      if ((ownerMode & mode) === mode) return true;
    }
    
    // Group access
    if (gid === this.gid) {
      const groupMode = (this.mode & 0o070) >> 3;
      if ((groupMode & mode) === mode) return true;
    }
    
    // Other access
    const otherMode = this.mode & 0o007;
    return (otherMode & mode) === mode;
  }
}

/**
 * Simple memory file
 */
class MemoryFile extends MemoryNode {
  private data: Uint8Array = new Uint8Array(0);
  
  constructor(name: string, mode: number = FileType.REGULAR) {
    super(name, mode);
  }
  
  setData(data: Uint8Array): void {
    this.data = data;
    this.size = data.length;
    this.updateTimes();
  }
  
  getData(): Uint8Array {
    return this.data;
  }
  
  clone(): MemoryFile {
    const clone = new MemoryFile(this.name, this.mode);
    clone.uid = this.uid;
    clone.gid = this.gid;
    clone.atime = new Date(this.atime.getTime());
    clone.mtime = new Date(this.mtime.getTime());
    clone.ctime = new Date(this.ctime.getTime());
    clone.setData(this.data);
    return clone;
  }
}

/**
 * Simple memory directory
 */
class MemoryDirectory extends MemoryNode {
  private children: Map<string, MemoryNode> = new Map();
  
  constructor(name: string, mode: number = FileType.DIRECTORY) {
    super(name, mode);
  }
  
  addChild(node: MemoryNode): void {
    this.children.set(node.name, node);
    this.updateTimes();
  }
  
  removeChild(name: string): void {
    this.children.delete(name);
    this.updateTimes();
  }
  
  getChild(name: string): MemoryNode | null {
    return this.children.get(name) || null;
  }
  
  hasChild(name: string): boolean {
    return this.children.has(name);
  }
  
  getChildren(): MemoryNode[] {
    return Array.from(this.children.values());
  }
  
  isEmpty(): boolean {
    return this.children.size === 0;
  }
}

/**
 * Simple memory file system test implementation
 */
export class SimpleMemoryFs {
  private root: MemoryDirectory;
  private currentUid: number = 0;
  private currentGid: number = 0;
  
  constructor() {
    this.root = new MemoryDirectory("", FileType.DIRECTORY);
    this.initializeStandardDirectories();
  }
  
  /**
   * Initializes standard directories
   */
  private initializeStandardDirectories(): void {
    const standardDirs = [
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
    
    for (const dir of standardDirs) {
      this.mkdirSync(dir);
    }
  }
  
  /**
   * Creates a directory synchronously
   */
  private mkdirSync(path: string): void {
    if (path === "/") return;
    
    const parts = path.split("/").filter(p => p.length > 0);
    let current = this.root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let node = current.getChild(part);
      
      if (!node) {
        node = new MemoryDirectory(part, FileType.DIRECTORY);
        node.uid = this.currentUid;
        node.gid = this.currentGid;
        current.addChild(node);
      } else if (!node.isDirectory()) {
        throw new Error(`Not a directory: ${part}`);
      }
      
      current = node as MemoryDirectory;
    }
  }
  
  /**
   * Resolves a path to a node
   */
  private resolvePath(path: string): { node: MemoryNode, parent: MemoryDirectory | null } {
    if (path === "/" || path === "") {
      return { node: this.root, parent: null };
    }
    
    const parts = path.split("/").filter(p => p.length > 0);
    let current = this.root;
    let parent: MemoryDirectory | null = null;
    
    for (let i = 0; i < parts.length; i++) {
      parent = current;
      const node = current.getChild(parts[i]);
      
      if (!node) {
        throw new Error(`No such file or directory: ${path}`);
      }
      
      current = node as MemoryDirectory;
      
      if (i < parts.length - 1 && !current.isDirectory()) {
        throw new Error(`Not a directory: ${parts.slice(0, i + 1).join("/")}`);
      }
    }
    
    return { node: current, parent };
  }
  
  /**
   * Creates a directory
   */
  async mkdir(path: string, options: { recursive?: boolean } = {}): Promise<void> {
    try {
      this.mkdirSync(path);
    } catch (error) {
      if (options.recursive) {
        // For recursive, create parent dirs first
        const parts = path.split("/").filter(p => p.length > 0);
        for (let i = 1; i <= parts.length; i++) {
          const subPath = "/" + parts.slice(0, i).join("/");
          try {
            this.mkdirSync(subPath);
          } catch (error) {
            // Ignore if directory exists
          }
        }
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Reads directory contents
   */
  async readdir(path: string): Promise<string[]> {
    const { node } = this.resolvePath(path);
    
    if (!node.isDirectory()) {
      throw new Error(`Not a directory: ${path}`);
    }
    
    return (node as MemoryDirectory).getChildren().map(child => child.name);
  }
  
  /**
   * Writes file data
   */
  async writeFile(path: string, data: Uint8Array): Promise<void> {
    try {
      const { node } = this.resolvePath(path);
      
      if (node.isDirectory()) {
        throw new Error(`Is a directory: ${path}`);
      }
      
      if (node instanceof MemoryFile) {
        node.setData(data);
      } else {
        throw new Error(`Not a regular file: ${path}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("No such file or directory")) {
        // Create the file if it doesn't exist
        const dirPath = path.substring(0, path.lastIndexOf("/")) || "/";
        const fileName = path.substring(path.lastIndexOf("/") + 1);
        
        // Ensure the parent directory exists
        try {
          await this.mkdir(dirPath, { recursive: true });
        } catch (error) {
          // Ignore if directory already exists
        }
        
        // Create the file
        const { node } = this.resolvePath(dirPath);
        
        if (!node.isDirectory()) {
          throw new Error(`Not a directory: ${dirPath}`);
        }
        
        const file = new MemoryFile(fileName);
        file.uid = this.currentUid;
        file.gid = this.currentGid;
        file.setData(data);
        
        (node as MemoryDirectory).addChild(file);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Reads file data
   */
  async readFile(path: string): Promise<Uint8Array> {
    const { node } = this.resolvePath(path);
    
    if (node.isDirectory()) {
      throw new Error(`Is a directory: ${path}`);
    }
    
    if (node instanceof MemoryFile) {
      return node.getData();
    } else {
      throw new Error(`Not a regular file: ${path}`);
    }
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
} 