/**
 * # Google Font Stub Generator
 * @summary #### Generates TypeScript stubs for Google Fonts
 *
 * This utility generates TypeScript stubs for all Google Fonts, allowing the
 * system to work without having to install full font definitions.
 *
 * @since 0.1.2
 * @category InSpatial Theme
 * @module @inspatial/theme/font
 * @kind utility
 * @access public
 */

// @ts-ignore: Allow importing .ts files in Deno
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

/**
 * List of popular Google Fonts that are commonly used
 */
export const POPULAR_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Inter",
  "Raleway",
  "Nunito",
  "Ubuntu",
  "Rubik",
  "Roboto Mono",
  "Roboto Condensed",
  "Oswald",
  "Source Sans Pro",
  "Dosis",
  "DM Sans",
  "PT Sans",
  "Noto Sans",
  "Mukta",
  "Work Sans",
];

/**
 * Interface for dependencies
 */
interface Dependencies {
  readTextFile?: typeof Deno.readTextFile;
  writeTextFile?: typeof Deno.writeTextFile;
  exit?: typeof Deno.exit;
  dirname?: typeof dirname;
  resolve?: typeof resolve;
  fromFileUrl?: typeof fromFileUrl;
}

/**
 * Generates Google Font stubs for all fonts in the font map
 */
export async function generateGoogleFontStubs(deps: Dependencies = {}) {
  try {
    // Get or use injected dependencies (for testing)
    const readTextFile = deps.readTextFile || Deno.readTextFile;
    const writeTextFile = deps.writeTextFile || Deno.writeTextFile;
    const exit = deps.exit || Deno.exit;
    const resolveFunc = deps.resolve || resolve;
    const dirnameFunc = deps.dirname || dirname;
    const fromFileUrlFunc = deps.fromFileUrl || fromFileUrl;

    // Get the directory of this script
    const currentFileUrl = import.meta.url;
    const currentDir = dirnameFunc(fromFileUrlFunc(currentFileUrl));

    // Resolve paths relative to the script location
    const fontMapPath = resolveFunc(currentDir, "./font-map.json");
    const outputPath = resolveFunc(currentDir, "./stub.ts");

    console.log("Generating Google Font stubs...");
    console.log(`Loading font map from ${fontMapPath}`);

    // Read and parse the font map
    const fontMapText = await readTextFile(fontMapPath);
    const fontMap = JSON.parse(fontMapText);

    // Generate the stub content
    const stubContent = generateStubContent(fontMap);

    // Write the stubs
    await writeTextFile(outputPath, stubContent);

    console.log(`Successfully generated stubs at ${outputPath}`);
  } catch (error) {
    console.error("Error generating Google Font stubs:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
}

/**
 * Formats a font name for use as a valid JavaScript variable name
 * by replacing spaces with underscores and handling invalid characters
 */
function formatFontNameForVariable(fontName: string): string {
  // Replace spaces with underscores
  let formattedName = fontName.replace(/\s+/g, "_");

  // Replace characters that can't be used in variable names
  formattedName = formattedName.replace(/[^a-zA-Z0-9_$]/g, "_");

  // Ensure the name doesn't start with a number
  if (/^[0-9]/.test(formattedName)) {
    formattedName = "_" + formattedName;
  }

  return formattedName;
}

/**
 * Generates the content for the stub.ts file
 */
function generateStubContent(fontMap: Record<string, any>): string {
  // Generate font placeholder declarations
  const fontDeclarations = Object.entries(fontMap)
    .map(([key, font]) => {
      if (!font) return "";

      // Use the family name from the font data
      const fontFamily = (font.family || key).replace(/_/g, " ");

      // Format the name for use as a variable
      const formattedName = formatFontNameForVariable(fontFamily);

      return `export const ${formattedName} = createGoogleFontPlaceholder("${fontFamily}");`;
    })
    .join("\n");

  const stubContent = `// @ts-ignore: Allow importing .ts files in Deno
import type { InSpatialFontProp } from "../types.ts";
// @ts-ignore: Allow importing .ts files in Deno
import type { PrimitiveFontTypes } from "../primitive/types.ts";

/**
 * All available Google Font families
 * This is a placeholder type - install Google Fonts for complete type definitions
 */
export type GoogleFontTypes = string;

/**
 * Combined type of all available fonts (Google Fonts and Primitive Fonts)
 */
export type AllFontVariants = GoogleFontTypes | PrimitiveFontTypes;

/**
 * Popular Google Fonts based on usage data
 * This can be used to filter fonts for installation
 */
export const POPULAR_FONTS = ${JSON.stringify(POPULAR_FONTS, null, 2)};

/**
 * Google Fonts are not installed by default.
 * This is a placeholder function that will warn developers they need to install Google Fonts.
 */
function createGoogleFontPlaceholder(fontName: string): (options: any) => InSpatialFontProp {
  return (options: any) => {
    console.warn(
      \`Google Font "\${fontName}" is not installed. Run 'deno task fonts:google:install' to use Google Fonts.\`
    );
    
    // Return a basic fallback font object
    return {
      className: "",
      style: {
        fontFamily: \`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif\`
      }
    };
  };
}

// Export placeholder functions for all Google Fonts from font-map.json
${fontDeclarations}

/**
 * Function to generate font-face CSS for a Google Font
 * This is a placeholder that returns an empty string
 */
export function fontFace(family: string): string {
  console.warn(\`Font face CSS for "\${family}" is not available. Install Google Fonts first.\`);
  return "";
}

/**
 * Returns an empty font map object
 * This is a placeholder for when Google Fonts are not installed
 */
export function getFontMap(): Record<string, any> {
  return {};
}

/**
 * A stub implementation indicating that Google Fonts are not installed
 */
export default {
  fontFace,
  getFontMap,
  isStub: true
}; 
`;

  return stubContent;
}

// Only run if this is the main module (when executed directly)
if (import.meta.main) {
  generateGoogleFontStubs();
}
