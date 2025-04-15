// @ts-ignore: Allow importing .ts files in Deno
import { generateGoogleFontTypes } from "./font-generator.ts";
// @ts-ignore: Allow importing from JSR in TypeScript
import { resolve, dirname, fromFileUrl } from "@std/path";

// Type definition for Deno to help TypeScript
declare global {
  interface ImportMeta {
    main: boolean;
    url: string;
  }

  namespace Deno {
    function readTextFile(path: string): Promise<string>;
    function writeTextFile(path: string, data: string): Promise<void>;
    function exit(code: number): never;
  }
}

async function main() {
  try {
    // Get the directory of this script
    // @ts-ignore: Deno supports import.meta.url
    const currentDir = dirname(fromFileUrl(import.meta.url));

    // Resolve paths relative to the script location
    const fontMapPath = resolve(currentDir, "./font-map.json");

    // Use a path in the current directory as fallback
    const outputPath = resolve(currentDir, "./fonts.ts");

    console.log("Generating Google Font declarations...");
    console.log(`Loading font map from ${fontMapPath}`);

    const fontMapText = await Deno.readTextFile(fontMapPath);
    const rawFontMap = JSON.parse(fontMapText);

    // Transform the font map to include the family property that the generator expects
    const fontMap = Object.entries(rawFontMap).reduce(
      (acc, [key, value]: [string, any]) => {
        // Use the key as the family name, replacing underscores with spaces
        const family = key.replace(/_/g, " ");

        // Create a new object with all properties from value and add the family property
        // This avoids using the spread operator
        const fontEntry: Record<string, any> = {};

        // Copy all properties from value
        if (value && typeof value === "object") {
          Object.keys(value).forEach((propKey) => {
            fontEntry[propKey] = value[propKey];
          });
        }

        // Add the family property - the actual font family name
        // Keep spaces in the family name since this is the display name
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

    console.log(`Processed ${Object.keys(fontMap).length} font entries`);

    // Generate the content
    const output = generateGoogleFontTypes(fontMap, outputPath);

    // Write output using Deno API
    await Deno.writeTextFile(outputPath, output);

    console.log(`Successfully generated declarations at ${outputPath}`);
  } catch (error) {
    console.error("Error generating font declarations:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
}

// Only run if this is the main module (when executed directly)
// @ts-ignore: Deno supports import.meta.main
if (import.meta.main) {
  main();
}
