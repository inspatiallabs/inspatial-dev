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
    const { ensureTestEnvironment, beforeEachTest } = await import(
      "./test_setup.ts"
    );

    // Ensure DOM environment is properly set up
    if (!ensureTestEnvironment()) {
      console.error("❌ Failed to set up DOM environment");
      Deno.exit(1);
    }

    console.log("✅ DOM mocks loaded successfully");

    // Install global beforeEach hook to ensure clean environment for each test
    const { beforeEach } = await import("@inspatial/test");
    
    // Use beforeEach with async function support
    beforeEach(async () => {
      // We need to ensure the beforeEachTest function completes before each test
      await beforeEachTest();
    });

    // Determine test files to run
    const bootstrapFile = "./tests/test_setup.ts";
    const cliArgsRaw = Deno?.args || [];
    const cliArgs = cliArgsRaw.filter((a) => a !== "--");

    const defaultTestPatterns = [bootstrapFile, "./src/**/*.test.ts", "./tests/**/*.test.ts"];

    const testFilesToRun = cliArgs.length > 0 ? [bootstrapFile, ...cliArgs] : defaultTestPatterns;

    console.log(`🧪 Running tests: ${testFilesToRun.join(", ")}`);

    // Use current directory path - assuming script runs from motion package
    const motionPackageDir = Deno.cwd();

    // Run tests with specified flags
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "test",
        "--allow-all", // Broad permissions for simplicity, consider refining
        "--no-check",
        ...testFilesToRun,
      ],
      stdout: "inherit",
      stderr: "inherit",
      cwd: motionPackageDir, // Set Current Working Directory for the Deno.Command
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