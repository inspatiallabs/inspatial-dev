/**
 * Test configuration for the InSpatial Container Security System
 * 
 * This file provides configuration and utilities for running the security system tests.
 * Run the tests with: deno test --allow-all src/security/tests.config.ts
 */

import { test } from "@inspatial/test";

console.log("🛡️  InSpatial Container Security System Tests");
console.log("=============================================");

// Test configuration settings that will be used by all test modules
export const TEST_CONFIG = {
  // Verbose output for tests
  verbose: true,
  
  // Timeout settings
  timeouts: {
    default: 5000,   // Default test timeout in ms
    long: 10000      // Longer timeout for complex tests
  },
  
  // Mock settings
  mocks: {
    useRealEventEmitter: false,
    useRealFileSystem: false
  }
};

// Helper functions for tests

/**
 * Creates a temporary directory for tests
 */
export function createTempTestDir(): string {
  const tempDir = `/tmp/inspatial-security-tests-${Date.now()}`;
  console.log(`Created temp test directory: ${tempDir}`);
  return tempDir;
}

/**
 * Cleans up temporary test resources
 */
export function cleanupTestResources(): void {
  console.log("Cleaning up test resources...");
  // In a real implementation, this would delete temp files, etc.
}

// Print configuration information
console.log(`Test configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`);
console.log("Running security system tests...\n");

// Dynamically import the test modules to avoid circular dependencies
// and ensure they run in the correct order
const runTests = async () => {
  try {
    // Import in order from most basic to most integrated components
    await import("./behavior-analyzer.test.ts");
    await import("./fs-monitor.test.ts");
    await import("./security-manager.test.ts");
    await import("../fs/directfs.test.ts");
    await import("./integration.test.ts");
    
    console.log("\n✅ Security System Tests Completed");
  } catch (error) {
    console.error("❌ Error running security tests:", error);
    throw error;
  } finally {
    cleanupTestResources();
  }
};

// Run all tests when this module is executed directly
if (import.meta.url === Deno.mainModule) {
  runTests();
} 