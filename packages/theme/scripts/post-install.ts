#!/usr/bin/env deno

/**
 * Post-install script for @inspatial/theme
 *
 * This script runs after the package is installed and ensures the Google Font stubs are generated.
 * It keeps the package lightweight by default, while still offering the ability to use all Google Fonts.
 */

// @ts-ignore: Allow importing from JSR in TypeScript
import { resolve, dirname, fromFileUrl } from "@std/path";
import { exists } from "jsr:@std/fs";

// Function to run the stub generator script
async function ensureGoogleFontStubs() {
  try {
    console.log("📚 InSpatial Theme: Post-install setup");
    console.log("=====================================");

    // Get the project root directory
    const currentDir = dirname(fromFileUrl(import.meta.url));
    const projectRoot = resolve(currentDir, "..");

    // Path to the stub generator
    const stubGeneratorPath = resolve(
      projectRoot,
      "src/font/google/stub-generator.ts"
    );
    const stubPath = resolve(projectRoot, "src/font/google/stub.ts");

    // Check if generator exists
    if (await exists(stubGeneratorPath)) {
      // Only generate stubs if they don't exist yet or are outdated
      const stubExists = await exists(stubPath);

      if (!stubExists) {
        console.log("🔍 Generating Google Font stubs...");

        // Run the stub generator script using Deno subprocess
        const cmd = [
          "deno",
          "run",
          "--allow-read",
          "--allow-write",
          stubGeneratorPath,
        ];

        const p = new Deno.Command(cmd[0], {
          args: cmd.slice(1),
        });

        const { code } = await p.output();

        if (code === 0) {
          console.log("✅ Google Font stubs generated successfully!");
        } else {
          console.error("❌ Failed to generate Google Font stubs");
        }
      } else {
        console.log("✅ Google Font stubs already exist.");
      }
    } else {
      console.warn("⚠️ Stub generator not found at:", stubGeneratorPath);
    }

    console.log("");
    console.log("🎉 InSpatial Theme is ready to use!");
    console.log("");
    console.log("To use actual Google Fonts instead of stubs, run:");
    console.log("  deno task fonts:google:install -- --popular");
    console.log("");
  } catch (error) {
    console.error("❌ Error during post-install setup:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
}

// Run the function
await ensureGoogleFontStubs();
