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
    const fontMap = JSON.parse(fontMapText);
    
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
