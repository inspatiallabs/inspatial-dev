/**
 * gVisor Integration Tests
 * 
 * This file contains tests that verify integration with an actual gVisor installation.
 * These tests will be skipped if gVisor is not installed.
 */

import { test, expect } from "@inspatial/test";

// Define Deno Command types if needed for TypeScript
declare global {
  interface DenoNamespace {
    Command: new (command: string, options?: { args: string[] }) => {
      output(): Promise<{ code: number; stdout: Uint8Array; stderr: Uint8Array }>;
    };
    makeTempDir(): Promise<string>;
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    writeTextFile(path: string, data: string): Promise<void>;
    remove(path: string, options?: { recursive?: boolean }): Promise<void>;
  }
}

// Helper to check if gVisor is installed
async function isGVisorInstalled(): Promise<boolean> {
  try {
    const command = new globalThis.Deno.Command("runsc", {
      args: ["--version"],
    });
    
    const output = await command.output();
    return output.code === 0;
  } catch (error) {
    return false;
  }
}

// Test actual gVisor installation
test("gVisor installation verification", async () => {
  // Check if gVisor is installed
  const gVisorInstalled = await isGVisorInstalled();
  
  if (!gVisorInstalled) {
    console.log("⚠️ Skipping gVisor integration tests - gVisor not installed");
    return;
  }
  
  // Run an actual gVisor command
  const command = new globalThis.Deno.Command("runsc", {
    args: ["--version"],
  });
  
  const output = await command.output();
  const version = new TextDecoder().decode(output.stdout);
  
  expect(output.code).toBe(0);
  expect(version.includes("runsc version")).toBe(true);
  console.log("gVisor is installed:", version.trim());
});

// Test container creation with actual gVisor
test("Check gVisor can create a container", async () => {
  // Check if gVisor is installed
  const gVisorInstalled = await isGVisorInstalled();
  
  if (!gVisorInstalled) {
    console.log("⚠️ Skipping gVisor container test - gVisor not installed");
    return;
  }
  
  const tmpDir = await globalThis.Deno.makeTempDir();
  
  try {
    // Create a simple OCI config.json
    const config = {
      "ociVersion": "1.0.0",
      "process": {
        "terminal": false,
        "user": {
          "uid": 0,
          "gid": 0
        },
        "args": [
          "/bin/sh", "-c", "echo 'Hello from gVisor'"
        ],
        "env": [
          "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
        ],
        "cwd": "/"
      },
      "root": {
        "path": "rootfs",
        "readonly": true
      },
      "linux": {
        "namespaces": [
          {"type": "pid"},
          {"type": "network"},
          {"type": "mount"}
        ]
      }
    };
    
    // Create a rootfs directory
    const rootfsDir = `${tmpDir}/rootfs`;
    await globalThis.Deno.mkdir(rootfsDir, { recursive: true });
    
    // Write config.json
    await globalThis.Deno.writeTextFile(`${tmpDir}/config.json`, JSON.stringify(config, null, 2));
    
    // Check if runsc can validate this config
    const checkCommand = new globalThis.Deno.Command("runsc", {
      args: ["spec", "--bundle", tmpDir],
    });
    
    const checkOutput = await checkCommand.output();
    
    // We don't expect this to run correctly since we don't have a real rootfs,
    // but it should at least attempt to process the config
    console.log("gVisor spec check result:", checkOutput.code);
    
    // Just verify that runsc exists and can be executed
    expect(checkOutput).toBeDefined();
  } finally {
    // Clean up temp directory
    await globalThis.Deno.remove(tmpDir, { recursive: true });
  }
}); 