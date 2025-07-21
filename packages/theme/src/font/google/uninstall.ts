// @ts-ignore: Allow importing from JSR in TypeScript
import { resolve, dirname, fromFileUrl } from "@std/path";
import { exists } from "jsr:@std/fs";
// @ts-ignore: Allow importing from the generator
import { generateGoogleFontStubs } from "./stub-generator.ts";

/**
 * Uninstall Google Fonts and restore the stub implementation
 */
async function uninstallGoogleFonts(options: { force?: boolean } = {}) {
  try {
    // Get the directory of this script
    const currentDir = dirname(fromFileUrl(import.meta.url));
    const fontsPath = resolve(currentDir, "./fonts.ts");
    const stubPath = resolve(currentDir, "./stub.ts");
    const stubBackupPath = resolve(currentDir, "./stub.backup.ts");

    console.log("📚 InSpatial Google Fonts Uninstaller");
    console.log("====================================");

    // Check if fonts are installed
    const fontsExist = await exists(fontsPath);
    if (!fontsExist && !options.force) {
      console.log("ℹ️ Google Fonts are not installed.");
      return;
    }

    // Check if stub backup exists
    const stubBackupExists = await exists(stubBackupPath);

    if (stubBackupExists) {
      console.log("🔄 Restoring stub implementation from backup...");
      await Deno.copyFile(stubBackupPath, fontsPath);

      // Clean up backup file
      await Deno.remove(stubBackupPath);
    } else {
      // If no backup exists, generate a fresh stub using our generator
      console.log("🔄 Generating fresh stub implementation...");
      await generateGoogleFontStubs();

      // Copy the generated stub to fonts.ts
      await Deno.copyFile(stubPath, fontsPath);
    }

    console.log("✅ Successfully uninstalled Google Fonts!");
    console.log(
      "Google Font imports will now return placeholder implementations."
    );
    console.log("To reinstall: deno task fonts:google:install");
  } catch (error) {
    console.error("🔴 Error uninstalling Google Fonts:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
}

// Run when script is executed directly
if (import.meta.main) {
  const args = Deno.args;
  const options: { force?: boolean } = {};

  // Simple argument parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--force") {
      options.force = true;
    } else if (arg === "--help") {
      console.log("Google Fonts Uninstaller for InSpatial Theme");
      console.log("");
      console.log("Usage:");
      console.log("  deno task fonts:google:uninstall [options]");
      console.log("");
      console.log("Options:");
      console.log(
        "  --force    Force uninstallation even if fonts are not detected"
      );
      console.log("  --help     Show this help message");
      Deno.exit(0);
    }
  }

  await uninstallGoogleFonts(options);
}

export { uninstallGoogleFonts };
