/**
 * # Trigger Tests Setup
 * @file test-setup.ts
 * @description Common setup for all trigger test files
 */

/**
 * Define __DEV__ global variable for tests
 */
// @ts-ignore: Define __DEV__ for tests
globalThis.__DEV__ = true;

/**
 * Export test utilities 
 */
// @ts-ignore - Ignoring TS extension import error
import { describe, it, expect, beforeEach, afterEach } from "../../../test/src/index.ts";

/**
 * Array to track test trigger names for cleanup
 */
export const testTriggerNames: string[] = [];

/**
 * Creates a registry of test triggers with unique names
 * @returns Array of test trigger names
 */
export function createTestTriggerRegistry(): string[] {
  const names: string[] = [];
  
  // Generate unique test trigger names
  for (let i = 0; i < 5; i++) {
    const name = `test:trigger${i}`;
    names.push(name);
    testTriggerNames.push(name);
  }
  
  return names;
}

/**
 * Cleans up registered test triggers
 * Useful in afterEach blocks to ensure a clean state between tests
 * @param triggerNames Array of trigger names to clean up
 */
export function cleanupTestTriggers(triggerNames: string[]): void {
  // Clean up any triggers that were registered during tests
  for (const name of triggerNames) {
    // @ts-ignore: Accessing private registry for test cleanup
    delete globalThis.__TRIGGER_STATE_ACTIONS__?.[name];
  }
}

// Export the testing utilities
export { describe, it, expect, beforeEach, afterEach }; 