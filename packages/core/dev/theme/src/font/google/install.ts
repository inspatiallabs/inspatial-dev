// @ts-ignore: Allow importing .ts files in Deno
import { generateGoogleFontTypes } from "./font-generator.ts";
// @ts-ignore: Allow importing from JSR in TypeScript
import { resolve, dirname, fromFileUrl, join } from "@std/path";
import { exists } from "jsr:@std/fs";
// @ts-ignore: Allow importing from the generator
import { POPULAR_FONTS, generateGoogleFontStubs } from "./stub-generator.ts";

// Define types for the installation options
interface InstallOptions {
  families?: string[]; // Specific font families to install
  popular?: boolean; // Install only popular fonts
  all?: boolean; // Install all fonts (default)
  force?: boolean; // Force reinstallation if fonts are already installed
}

// List of popular Google Fonts is now imported from stub-generator.ts
// This ensures consistency between stubs and installation

/**
 * A utility to help install Google Fonts for InSpatial Theme
 */
async function installGoogleFonts(options: InstallOptions = { all: true }) {
  try {
    // Get the directory of this script
    const currentDir = dirname(fromFileUrl(import.meta.url));
    const fontMapPath = resolve(currentDir, "./font-map.json");
    const outputPath = resolve(currentDir, "./fonts.ts");
    const stubPath = resolve(currentDir, "./stub.ts");

    console.log("📚 InSpatial Google Fonts Installer");
    console.log("==================================");

    // Always ensure we have the latest stub definitions
    // This step ensures the stub file is always up-to-date with font-map.json
    console.log("🔄 Generating stub implementations...");
    await generateGoogleFontStubs();

    // Check if fonts are already installed
    const fontsExist = await exists(outputPath);
    if (fontsExist && !options.force) {
      console.log("ℹ️ Google Fonts are already installed.");
      console.log(
        "To reinstall, run: deno task fonts:google:install -- --force"
      );
      return;
    }

    console.log("🔍 Loading font map data...");
    const fontMapText = await Deno.readTextFile(fontMapPath);
    let rawFontMap = JSON.parse(fontMapText);

    // Filter font map based on options
    if (options.families && options.families.length > 0) {
      const filteredMap: Record<string, any> = {};
      const familyList = options.families.map((f) => f.replace(/\+/g, " "));

      console.log(
        `🔍 Filtering for specific font families: ${familyList.join(", ")}`
      );

      for (const [key, value] of Object.entries(rawFontMap)) {
        const fontName = key.replace(/_/g, " ");
        if (
          familyList.some((f) => fontName.toLowerCase() === f.toLowerCase())
        ) {
          filteredMap[key] = value;
        }
      }

      if (Object.keys(filteredMap).length === 0) {
        console.log(
          "⚠️ No matching font families found. Check your spelling or try without filters."
        );
        return;
      }

      rawFontMap = filteredMap;
    } else if (options.popular) {
      const filteredMap: Record<string, any> = {};

      console.log("🔍 Filtering for popular font families...");

      for (const [key, value] of Object.entries(rawFontMap)) {
        const fontName = key.replace(/_/g, " ");
        if (
          POPULAR_FONTS.some((f) => fontName.toLowerCase() === f.toLowerCase())
        ) {
          filteredMap[key] = value;
        }
      }

      rawFontMap = filteredMap;
    }

    // Transform the font map to include the family property that the generator expects
    const fontMap = Object.entries(rawFontMap).reduce(
      (acc, [key, value]: [string, any]) => {
        // Use the key as the family name, replacing underscores with spaces
        const family = key.replace(/_/g, " ");

        // Create a new object with all properties from value and add the family property
        const fontEntry: Record<string, any> = {};

        // Copy all properties from value
        if (value && typeof value === "object") {
          Object.keys(value).forEach((propKey) => {
            fontEntry[propKey] = value[propKey];
          });
        }

        // Add the family property - the actual font family name
        fontEntry.family = family;

        // For styles, ensure it's always an array
        if (fontEntry.styles && !Array.isArray(fontEntry.styles)) {
          fontEntry.styles = [fontEntry.styles];
        }

        // Handle case where styles is missing
        if (!fontEntry.styles || fontEntry.styles.length === 0) {
          fontEntry.styles = ["normal"];
        }

        acc[key] = fontEntry;
        return acc;
      },
      {} as Record<string, any>
    );

    const fontCount = Object.keys(fontMap).length;
    console.log(`📊 Processing ${fontCount} font families...`);

    // Generate the content
    console.log("🔧 Generating Google Font declarations...");
    const output = generateGoogleFontTypes(fontMap, outputPath);

    // Write output
    await Deno.writeTextFile(outputPath, output);

    // Backup the stub if needed for future uninstallation
    if (!(await exists(resolve(currentDir, "./stub.backup.ts")))) {
      await Deno.copyFile(stubPath, resolve(currentDir, "./stub.backup.ts"));
    }

    console.log(`✅ Successfully installed ${fontCount} Google Font families!`);
    console.log("You can now use Google Fonts in your application:");
    console.log("");
    console.log("import { Roboto, Open_Sans } from '@inspatial/theme/font';");
    console.log("");
    console.log("const robotoFont = Roboto({");
    console.log("  weight: ['400', '700'],");
    console.log("  display: 'swap',");
    console.log("  subsets: ['latin']");
    console.log("});");
    console.log("");
    console.log("// To uninstall: deno task fonts:google:uninstall");
  } catch (error) {
    console.error("🔴 Error installing Google Font declarations:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
}

// Parse command line arguments when run directly
if (import.meta.main) {
  const args = Deno.args;
  const options: InstallOptions = { all: true };

  // Simple argument parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--popular") {
      options.popular = true;
      options.all = false;
    } else if (arg === "--families" && i + 1 < args.length) {
      const families = args[++i].split(",");
      options.families = families;
      options.all = false;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--help") {
      console.log("Google Fonts Installer for InSpatial Theme");
      console.log("");
      console.log("Usage:");
      console.log("  deno task fonts:google:install [options]");
      console.log("");
      console.log("Options:");
      console.log(
        "  --popular              Install only popular fonts (~30 fonts)"
      );
      console.log(
        "  --families=<list>      Install specific font families (comma-separated)"
      );
      console.log(
        "  --force                Force reinstallation even if fonts exist"
      );
      console.log("  --help                 Show this help message");
      console.log("");
      console.log("Examples:");
      console.log("  deno task fonts:google:install");
      console.log("  deno task fonts:google:install --popular");
      console.log(
        "  deno task fonts:google:install --families=Roboto,Open+Sans,Lato"
      );
      Deno.exit(0);
    }
  }

  await installGoogleFonts(options);
}

export { installGoogleFonts };
