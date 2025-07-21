/**
 * Tests for server-side container implementation with gVisor
 */

import { test, expect } from "@inspatial/test";
import { spy } from "../../../../test/src/mock/mock.ts";
import { ServerContainerManager } from "../gvisor/server-container.ts";
import type { ContainerConfig, SecurityContext } from "../../shared/types.ts";

// Define types for Deno Command
interface CommandOutput {
  code: number;
  stdout: Uint8Array;
  stderr: Uint8Array;
}

// Define mock functions using the correct spy API
function setupMocks() {
  // Original Deno object
  const originalDeno = globalThis.Deno;
  
  // Create Command spy
  const commandSpy = spy((command: string, options: { args: string[] }) => {
    return {
      output: async (): Promise<CommandOutput> => {
        // Add debug logging to see what commands are being called
        console.log(`Mock command called: ${command}, args:`, options.args);
        
        if (command === "runsc" && options.args[0] === "--version") {
          return {
            code: 0,
            stdout: new TextEncoder().encode("runsc version v20230609.0"),
            stderr: new Uint8Array(0)
          };
        }
        if (command === "deno" && options.args[0] === "--version") {
          return {
            code: 0,
            stdout: new TextEncoder().encode("deno 1.38.3"),
            stderr: new Uint8Array(0)
          };
        }
        if (command === "runsc" && options.args[0] === "run") {
          return {
            code: 0,
            stdout: new TextEncoder().encode("container-id-123"),
            stderr: new Uint8Array(0)
          };
        }
        if (command === "runsc" && options.args[0] === "pause") {
          return {
            code: 0,
            stdout: new Uint8Array(0),
            stderr: new Uint8Array(0)
          };
        }
        if (command === "runsc" && options.args[0] === "resume") {
          return {
            code: 0,
            stdout: new Uint8Array(0),
            stderr: new Uint8Array(0)
          };
        }
        if (command === "runsc" && options.args[0] === "delete") {
          return {
            code: 0,
            stdout: new Uint8Array(0),
            stderr: new Uint8Array(0)
          };
        }
        if (command === "runsc" && options.args[0] === "exec") {
          return {
            code: 0,
            stdout: new TextEncoder().encode("Command output"),
            stderr: new Uint8Array(0)
          };
        }
        if (command === "runsc" && options.args[0] === "events") {
          return {
            code: 0,
            stdout: new TextEncoder().encode(JSON.stringify({
              cpu: { usage: { total: 1000000000 } },
              memory: { usage: { usage: 52428800 } }
            })),
            stderr: new Uint8Array(0)
          };
        }
        
        // Default success response for any other command
        console.log(`Unhandled command: ${command}, returning generic success`);
        return {
          code: 0,
          stdout: new TextEncoder().encode("Success"),
          stderr: new Uint8Array(0)
        };
      }
    };
  });
  
  // Create file system operation spies
  const statSpy = spy((path: string): Promise<{ isDirectory: boolean; isFile: boolean; isSymlink: boolean; size: number; mtime: Date }> => 
    Promise.resolve({ 
      isDirectory: true,
      isFile: false,
      isSymlink: false,
      size: 0,
      mtime: new Date()
    })
  );
  const mkdirSpy = spy((path: string, options?: { recursive?: boolean }): Promise<void> => Promise.resolve());
  const writeTextFileSpy = spy((path: string, content: string): Promise<void> => Promise.resolve());
  const removeSpy = spy((path: string, options?: { recursive?: boolean }): Promise<void> => Promise.resolve());
  
  // Define a mock Command constructor
  const CommandConstructor = function(this: any, command: string, options?: { args: string[] }) {
    return {
      output: () => commandSpy(command, options || { args: [] }).output()
    };
  } as unknown as typeof Deno.Command;
  
  // Replace Deno global with our spies
  Object.defineProperty(globalThis, "Deno", {
    value: {
      ...originalDeno,
      Command: CommandConstructor,
      stat: statSpy,
      mkdir: mkdirSpy,
      writeTextFile: writeTextFileSpy,
      remove: removeSpy
    },
    writable: true,
    configurable: true
  });
  
  // Return the cleanup function and spies
  return {
    restore: () => {
      Object.defineProperty(globalThis, "Deno", {
        value: originalDeno,
        writable: true,
        configurable: true
      });
    },
    spies: {
      command: commandSpy,
      stat: statSpy,
      mkdir: mkdirSpy,
      writeTextFile: writeTextFileSpy,
      remove: removeSpy
    }
  };
}

// Simple test to verify the server container manager
test("ServerContainerManager implements the container manager interface", () => {
  // Set up mocks
  const { restore, spies } = setupMocks();
  
  try {
    // Create container manager
    const containerManager = new ServerContainerManager({
      configDir: "/tmp/test-containers",
      runtimePath: "/usr/local/bin/runsc",
      denoPath: "/usr/local/bin/deno"
    });
    
    // Verify interface implementation
    expect(containerManager).toBeDefined();
    expect(typeof containerManager.createContainer).toBe("function");
    expect(typeof containerManager.startContainer).toBe("function");
    expect(typeof containerManager.suspendContainer).toBe("function");
    expect(typeof containerManager.resumeContainer).toBe("function");
    expect(typeof containerManager.terminateContainer).toBe("function");
    expect(typeof containerManager.executeCommand).toBe("function");
    expect(typeof containerManager.getContainerInfo).toBe("function");
    expect(typeof containerManager.listContainers).toBe("function");
    expect(typeof containerManager.addEventListener).toBe("function");
  } finally {
    // Restore original Deno object
    restore();
  }
});

test("ServerContainerManager can create and manage containers", async () => {
  // Set up mocks
  const { restore, spies } = setupMocks();
  
  try {
    console.log("Creating ServerContainerManager instance");
    // Create container manager
    const containerManager = new ServerContainerManager({
      configDir: "/tmp/test-containers",
      runtimePath: "/usr/local/bin/runsc",
      denoPath: "/usr/local/bin/deno"
    });
    
    // Create a test container
    const config: ContainerConfig = {
      name: "test-container",
      environment: { type: "server" }
    };
    
    const securityContext: SecurityContext = {
      userId: "test-user",
      permissions: ["create", "execute"]
    };
    
    console.log("Creating container");
    // Create container
    const containerId = await containerManager.createContainer(config, securityContext);
    console.log("Container created with ID:", containerId);
    expect(containerId).toBeDefined();
    expect(containerId.includes("server-")).toBe(true);
    
    // Access the internal container map
    const containerMap = (containerManager as any).containers;
    expect(containerMap.has(containerId)).toBe(true);
    
    console.log("Starting container");
    // Start container and verify Command was called
    await containerManager.startContainer(containerId);
    console.log("Container started");
    expect(spies.command.calls.length).toBeGreaterThan(0);
    
    console.log("Getting container info");
    // Get container info
    const info = await containerManager.getContainerInfo(containerId);
    console.log("Container state:", info.state.state);
    expect(info.state.state).toBe("running");
    
    console.log("Executing command");
    // Execute a command
    const result = await containerManager.executeCommand(containerId, "echo", ["Hello World"]);
    console.log("Command execution result:", result);
    expect(result.success).toBe(true);
    
    console.log("Suspending container");
    // Suspend and resume container
    await containerManager.suspendContainer(containerId);
    console.log("Container suspended");
    
    console.log("Resuming container");
    await containerManager.resumeContainer(containerId);
    console.log("Container resumed");
    
    console.log("Terminating container");
    // Terminate container
    await containerManager.terminateContainer(containerId);
    console.log("Container terminated");
    
    // Verify container was removed
    expect(containerMap.has(containerId)).toBe(false);
  } finally {
    // Restore original Deno object
    restore();
  }
});

test("gVisor version check", async () => {
  // Set up mocks
  const { restore, spies } = setupMocks();
  
  try {
    // Call the version check command
    const command = new (globalThis.Deno.Command as any)("runsc", {
      args: ["--version"],
    });
    
    const output = await command.output();
    const version = new TextDecoder().decode(output.stdout);
    
    expect(output.code).toBe(0);
    expect(version.includes("runsc version")).toBe(true);
    
    // Verify the command spy was called correctly
    expect(spies.command.calls.length).toBe(1);
    expect(spies.command.calls[0].args[0]).toBe("runsc");
    expect(spies.command.calls[0].args[1]).toBeDefined();
    expect(spies.command.calls[0].args[1].args[0]).toBe("--version");
  } finally {
    restore();
  }
});

test("Deno runtime check", async () => {
  // Set up mocks
  const { restore, spies } = setupMocks();
  
  try {
    // Call the version check command
    const command = new (globalThis.Deno.Command as any)("deno", {
      args: ["--version"],
    });
    
    const output = await command.output();
    const version = new TextDecoder().decode(output.stdout);
    
    expect(output.code).toBe(0);
    expect(version.includes("deno")).toBe(true);
    
    // Verify the command spy was called correctly
    expect(spies.command.calls.length).toBe(1);
    expect(spies.command.calls[0].args[0]).toBe("deno");
    expect(spies.command.calls[0].args[1]).toBeDefined();
    expect(spies.command.calls[0].args[1].args[0]).toBe("--version");
  } finally {
    restore();
  }
}); 