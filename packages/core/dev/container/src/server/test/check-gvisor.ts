/**
 * gVisor Installation Check Script
 * 
 * This script checks for an actual gVisor installation on the system.
 * It can be run separately from the unit tests to verify gVisor is properly installed.
 */

// Run with: deno run --allow-run check-gvisor.ts

// Define Deno types for TypeScript
// deno-lint-ignore-file no-explicit-any
declare global {
  interface DenoNamespace {
    Command: new (command: string, options?: { args: string[] }) => {
      output(): Promise<{ code: number; stdout: Uint8Array; stderr: Uint8Array }>;
    };
  }
  
  // For ESM modules
  interface ImportMeta {
    main: boolean;
  }
}

/**
 * Check for gVisor installation
 */
async function checkGVisorInstallation() {
  console.log("Checking gVisor installation...");
  
  try {
    // Check for runsc command
    const runscCommand = new globalThis.Deno.Command("runsc", {
      args: ["--version"],
    });
    
    const runscOutput = await runscCommand.output();
    
    if (runscOutput.code === 0) {
      const version = new TextDecoder().decode(runscOutput.stdout);
      console.log("✅ gVisor is installed:");
      console.log(`   ${version.trim()}`);
    } else {
      console.log("❌ gVisor command exists but returned an error:");
      console.log(`   ${new TextDecoder().decode(runscOutput.stderr)}`);
    }
  } catch (error: unknown) {
    console.log("❌ gVisor (runsc) is not installed or not in PATH");
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Check for Deno
  try {
    const denoCommand = new globalThis.Deno.Command("deno", {
      args: ["--version"],
    });
    
    const denoOutput = await denoCommand.output();
    
    if (denoOutput.code === 0) {
      const version = new TextDecoder().decode(denoOutput.stdout);
      console.log("✅ Deno is installed:");
      console.log(`   ${version.trim()}`);
    } else {
      console.log("❌ Deno command exists but returned an error:");
      console.log(`   ${new TextDecoder().decode(denoOutput.stderr)}`);
    }
  } catch (error: unknown) {
    // This shouldn't happen as we're running in Deno
    console.log("❌ Deno is not accessible via CLI");
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Print integration instructions
  console.log("\nTo use actual gVisor with the tests:");
  console.log("1. Install gVisor from https://gvisor.dev/docs/user_guide/install/");
  console.log("2. Make sure 'runsc' is in your PATH");
  console.log("3. Run tests with: deno test --allow-run");
  
  console.log("\nThe tests will continue to run with mocks if gVisor is not installed.");
}

// Self-executing function to allow top-level await
// @ts-ignore: Allow import.meta usage
if (import.meta.main) {
  checkGVisorInstallation();
} 