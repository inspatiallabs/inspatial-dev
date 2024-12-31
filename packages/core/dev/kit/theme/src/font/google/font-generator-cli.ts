import { generateGoogleFontTypes } from "./font-generator.ts";
import { resolve } from "jsr:@std/path";

async function main() {
  try {
    const fontMap = JSON.parse(
      await Deno.readTextFile(resolve("./font-map.json"))
    );
    const outputPath = resolve("./src/typography/google/fonts.ts");

    console.log("Generating Google Font declarations...");
    await generateGoogleFontTypes(fontMap, outputPath);
    console.log(`Successfully generated declarations at ${outputPath}`);
  } catch (error) {
    console.error("Error generating font declarations:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
