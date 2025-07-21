# InSpatial Container System: Virtual File System

This directory contains the implementation of the Virtual File System (VFS) for the InSpatial Container System. The VFS provides a secure, isolated environment for file operations without direct host file system access.

## Design

The VFS is designed around these core components:

1. **Base Classes**:
   - `MemoryNode`: Abstract base class for all file system nodes
   - `MemoryFile`: Implementation for regular files
   - `MemoryDirectory`: Implementation for directories
   - `MemorySymlink`: Implementation for symbolic links

2. **File Handles**:
   - `MemoryFileHandle`: Handle for file operations
   - `MemoryDirHandle`: Handle for directory operations

3. **File System Implementation**:
   - `MemoryFileSystem`: In-memory implementation of the file system

## Features

- Full POSIX-like file system structure
- Comprehensive permission model
- Support for symbolic links
- Thread-safe operations
- Complete isolation from the host file system

## Usage

Here's an example of using the in-memory file system:

```typescript
import { MemoryFileSystem } from "./memory-fs.ts";
import { OpenFlags } from "./types.ts";

// Create a new file system
const fs = new MemoryFileSystem("container1");

// Create a directory
await fs.mkdir("/home/user", { recursive: true });

// Write a file
const content = new TextEncoder().encode("Hello, World!");
await fs.writeFile("/home/user/hello.txt", content);

// Read a file
const data = await fs.readFile("/home/user/hello.txt");
console.log(new TextDecoder().decode(data)); // "Hello, World!"

// Open a file with a handle for more control
const handle = await fs.open("/home/user/hello.txt", OpenFlags.READ | OpenFlags.WRITE);
try {
  // Read a portion of the file
  const buffer = new Uint8Array(5);
  await handle.read(buffer, 0, 5, 0);
  console.log(new TextDecoder().decode(buffer)); // "Hello"
  
  // Write to the file
  const newData = new TextEncoder().encode("Updated");
  await handle.write(newData, 0, newData.length, 0);
} finally {
  // Always close handles
  await handle.close();
}

// Create a symbolic link
await fs.symlink("/home/user/hello.txt", "/home/user/link.txt");

// Read through the symlink
const linkData = await fs.readFile("/home/user/link.txt");
console.log(new TextDecoder().decode(linkData)); // "Updated, World!"
```

## Testing

Run the tests to verify the implementation:

```sh
deno run --allow-all memory-fs-test.ts
```

## Implementation Notes

- The file system is entirely in-memory, so data is lost when the container is destroyed
- For persistent storage, use the mount system to bind host directories
- File descriptors start at 3 (0, 1, 2 are reserved for stdin, stdout, stderr)
- Root user (uid 0) has unrestricted access to all files 