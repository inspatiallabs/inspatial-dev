/**
 * # Trigger Tests Runner
 * @file run-tests.ts
 * @description Script to run all trigger-related tests
 */

// Define __DEV__ for all tests
// @ts-ignore: Define global development flag
globalThis.__DEV__ = true;

const testFiles = [
  "../tests/trigger/trigger-registry.test.ts",
  "../tests/trigger/trigger-creation.test.ts",
  "../tests/trigger/trigger-connection.test.ts",
  "../tests/trigger/trigger-bridge.test.ts",
  "../tests/trigger/trigger-state.test.ts", // Added our new test file
];

// Simple banner output
console.log("╔════════════════════════════════════════════════════╗");
console.log("║               INSPATIAL TRIGGER TESTS              ║");
console.log("╚════════════════════════════════════════════════════╝");

// Using Deno.test() API to run the tests
for (const file of testFiles) {
  console.log(`\n🧪 Running tests from: ${file}`);
  
  // Import and run
  import(file)
    .then(() => {
      console.log(`✅ Successfully imported ${file}`);
    })
    .catch((err) => {
      console.error(`❌ Error importing ${file}:`);
      console.error(err);
      Deno.exit(1);
    });
}

// Check for test coverage
console.log("\n📊 Generating test coverage report...");
console.log("Note: To run with coverage, use: deno test --coverage=coverage"); 