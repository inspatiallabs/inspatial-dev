/// <reference lib="deno.ns" />

/**
 * # Test Runner
 * @summary #### Custom test runner that sets up DOM mocks before running tests
 * 
 * This module loads the test-setup.ts file first to ensure all DOM mocks are
 * available before any tests are executed.
 * 
 * @since 0.1.0
 * @category InSpatial Motion Testing
 */

// Function to run the tests
async function runTests() {
  try {
    // First, import the test setup to create DOM mocks
    const { ensureTestEnvironment, beforeEachTest } = await import("./test_setup.ts");
    
    // Ensure DOM environment is properly set up
    if (!ensureTestEnvironment()) {
      console.error("❌ Failed to set up DOM environment");
      Deno.exit(1);
    }
    
    console.log("✅ DOM mocks loaded successfully");
    
    // Install global beforeEach hook to ensure clean environment for each test
    const { beforeEach } = await import("@inspatial/test");
    beforeEach(beforeEachTest);
    
    // Determine test files to run
    const args = Deno?.args || [];
    // Default to glob patterns relative to the motion package root if no args are passed.
    // These paths will be used by Deno.Command with cwd set to 'packages/core/dev/motion'.
    const defaultTestPatterns = ["./src/**/*.test.ts", "./tests/**/*.test.ts"];
    const testFilesToRun = args.length > 0 ? args : defaultTestPatterns;
    
    console.log(`🧪 Running tests: ${testFilesToRun.join(", ")}`);
    
    const motionPackageDir = "packages/core/dev/motion";

    // Run tests with specified flags
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "test",
        "--allow-all", // Broad permissions for simplicity, consider refining
        "--no-check",
        "--unstable-sloppy-imports",
        ...testFilesToRun
      ],
      stdout: "inherit",
      stderr: "inherit",
      cwd: motionPackageDir // Set Current Working Directory for the Deno.Command
    });
    
    const { code } = await command.output();
    
    if (code === 0) {
      console.log("✅ All tests passed successfully");
    } else {
      console.error(`❌ Tests failed with exit code ${code}`);
      Deno.exit(code);
    }
  } catch (error) {
    console.error("❌ Error running tests:", error);
    Deno.exit(1);
  }
}

// Run the tests
runTests(); 