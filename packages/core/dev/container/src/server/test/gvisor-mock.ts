/**
 * Mock implementation of gVisor for testing
 * 
 * This file provides mocks for the gVisor functionality so tests can run
 * without an actual gVisor installation.
 */

// Mock container storage
export const mockContainers = new Map<string, {
  id: string;
  state: "running" | "paused" | "stopped";
  config: Record<string, any>;
  created: number;
  stats: {
    cpu: { usage: { total: number } };
    memory: { usage: { usage: number } };
  };
}>();

/**
 * Mock command responses for different gVisor operations
 */
export const mockCommandResponses = {
  // runsc run response
  run: (id: string) => ({
    code: 0, 
    stdout: new TextEncoder().encode(id),
    stderr: new Uint8Array(0)
  }),
  
  // runsc pause response
  pause: () => ({
    code: 0,
    stdout: new Uint8Array(0),
    stderr: new Uint8Array(0)
  }),
  
  // runsc resume response
  resume: () => ({
    code: 0,
    stdout: new Uint8Array(0),
    stderr: new Uint8Array(0)
  }),
  
  // runsc delete response
  delete: () => ({
    code: 0,
    stdout: new Uint8Array(0),
    stderr: new Uint8Array(0)
  }),
  
  // runsc exec response
  exec: (output: string = "Command executed successfully") => ({
    code: 0,
    stdout: new TextEncoder().encode(output),
    stderr: new Uint8Array(0)
  }),
  
  // runsc events --stats response
  events: (id: string) => {
    const container = mockContainers.get(id);
    if (!container) {
      return {
        code: 1,
        stdout: new Uint8Array(0),
        stderr: new TextEncoder().encode(`Container ${id} not found`)
      };
    }
    
    return {
      code: 0,
      stdout: new TextEncoder().encode(JSON.stringify(container.stats)),
      stderr: new Uint8Array(0)
    };
  },
  
  // runsc --version response
  version: () => ({
    code: 0, 
    stdout: new TextEncoder().encode("runsc version v20230609.0"), 
    stderr: new Uint8Array(0)
  }),
  
  // deno --version response
  denoVersion: () => ({
    code: 0,
    stdout: new TextEncoder().encode("deno 1.38.3"),
    stderr: new Uint8Array(0)
  }),
  
  // Error response
  error: (message: string) => ({
    code: 1,
    stdout: new Uint8Array(0),
    stderr: new TextEncoder().encode(message)
  })
};

/**
 * Create a mock implementation of Deno.Command
 * 
 * This replaces the real Deno.Command with a mock for testing.
 */
export function mockGVisor() {
  const originalDeno = globalThis.Deno;
  
  // Create mock Command implementation
  class MockCommand {
    private command: string;
    private args: string[];
    
    constructor(command: string, options: { args: string[] }) {
      this.command = command;
      this.args = options.args || [];
    }
    
    async output() {
      // Generate a container ID if this is a run command
      if (this.command === "runsc" && this.args[0] === "run") {
        const containerId = this.args[this.args.length - 1];
        
        // Create a mock container if it doesn't exist
        if (!mockContainers.has(containerId)) {
          mockContainers.set(containerId, {
            id: containerId,
            state: "running",
            config: {},
            created: Date.now(),
            stats: {
              cpu: { usage: { total: 1000000000 } }, // 1 second in nanoseconds
              memory: { usage: { usage: 52428800 } }  // 50 MB in bytes
            }
          });
        }
        
        return mockCommandResponses.run(containerId);
      }
      
      // Handle pause command
      if (this.command === "runsc" && this.args[0] === "pause") {
        const containerId = this.args[1];
        const container = mockContainers.get(containerId);
        
        if (container) {
          container.state = "paused";
        }
        
        return mockCommandResponses.pause();
      }
      
      // Handle resume command
      if (this.command === "runsc" && this.args[0] === "resume") {
        const containerId = this.args[1];
        const container = mockContainers.get(containerId);
        
        if (container) {
          container.state = "running";
        }
        
        return mockCommandResponses.resume();
      }
      
      // Handle delete command
      if (this.command === "runsc" && this.args[0] === "delete") {
        const containerId = this.args[this.args.length - 1];
        mockContainers.delete(containerId);
        return mockCommandResponses.delete();
      }
      
      // Handle exec command
      if (this.command === "runsc" && this.args[0] === "exec") {
        let output = "Command executed successfully";
        
        // Support for different command outputs
        if (this.args.includes("--version")) {
          if (this.args.includes("deno")) {
            output = "deno 1.38.3";
          } else {
            output = "v1.0.0";
          }
        }
        
        return mockCommandResponses.exec(output);
      }
      
      // Handle events command
      if (this.command === "runsc" && this.args[0] === "events") {
        const containerId = this.args[this.args.length - 1];
        return mockCommandResponses.events(containerId);
      }
      
      // Handle version command
      if ((this.command === "runsc" && this.args[0] === "--version") || 
          (this.args.includes("--version"))) {
        return mockCommandResponses.version();
      }
      
      // Handle deno version command
      if (this.command === "deno" && this.args.includes("--version")) {
        return mockCommandResponses.denoVersion();
      }
      
      // Default error response for unknown commands
      return mockCommandResponses.error(`Unknown command: ${this.command} ${this.args.join(" ")}`);
    }
  }
  
  // Mock file system operations
  const mockFS = {
    dirs: new Set<string>(),
    files: new Map<string, string>(),
    
    // Mock stat
    stat: async (path: string) => {
      const isDir = mockFS.dirs.has(path);
      const isFile = mockFS.files.has(path);
      
      if (!isDir && !isFile) {
        throw new Error(`File not found: ${path}`);
      }
      
      return {
        isDirectory: isDir,
        isFile: isFile,
        size: isFile ? mockFS.files.get(path)?.length || 0 : 0,
        mtime: new Date(),
        atime: new Date(),
        birthtime: new Date()
      };
    },
    
    // Mock mkdir
    mkdir: async (path: string, options?: { recursive: boolean }) => {
      mockFS.dirs.add(path);
      
      // Handle recursive option
      if (options?.recursive) {
        const parts = path.split("/");
        let currentPath = "";
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            currentPath += "/" + parts[i];
            mockFS.dirs.add(currentPath);
          }
        }
      }
    },
    
    // Mock writeTextFile
    writeTextFile: async (path: string, content: string) => {
      mockFS.files.set(path, content);
      
      // Ensure parent directory exists
      const lastSlash = path.lastIndexOf("/");
      if (lastSlash > 0) {
        const dir = path.substring(0, lastSlash);
        mockFS.dirs.add(dir);
      }
    },
    
    // Mock readTextFile
    readTextFile: async (path: string) => {
      if (!mockFS.files.has(path)) {
        throw new Error(`File not found: ${path}`);
      }
      
      return mockFS.files.get(path) || "";
    },
    
    // Mock remove
    remove: async (path: string, options?: { recursive: boolean }) => {
      // Remove directory
      if (mockFS.dirs.has(path)) {
        mockFS.dirs.delete(path);
        
        // Handle recursive option
        if (options?.recursive) {
          // Remove all files and directories that start with this path
          for (const dir of Array.from(mockFS.dirs)) {
            if (dir.startsWith(path + "/")) {
              mockFS.dirs.delete(dir);
            }
          }
          
          for (const file of Array.from(mockFS.files.keys())) {
            if (file.startsWith(path + "/")) {
              mockFS.files.delete(file);
            }
          }
        }
      }
      
      // Remove file
      if (mockFS.files.has(path)) {
        mockFS.files.delete(path);
      }
    }
  };
  
  // Replace Deno global with our mock
  globalThis.Deno = {
    ...originalDeno,
    Command: MockCommand as any,
    stat: mockFS.stat as any,
    mkdir: mockFS.mkdir as any,
    writeTextFile: mockFS.writeTextFile as any,
    readTextFile: mockFS.readTextFile as any,
    remove: mockFS.remove as any
  };
  
  // Return a function to restore the original Deno
  return () => {
    globalThis.Deno = originalDeno;
  };
}

// Export a helper to reset mock state
export function resetMockState() {
  mockContainers.clear();
} 