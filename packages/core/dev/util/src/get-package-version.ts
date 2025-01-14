/** Internal Version checker utility
 *
 * @access private
 */
export async function getPackageVersion(): Promise<string> {
  try {
    // Try deno.json first
    const denoConfig = await Deno.readTextFile("deno.json");
    const denoJson = JSON.parse(denoConfig);
    if (denoJson.version) return denoJson.version;

    // Fallback to package.json
    const packageConfig = await Deno.readTextFile("package.json");
    const packageJson = JSON.parse(packageConfig);
    if (packageJson.version) return packageJson.version;
  } catch (error) {
    console.warn("Error reading version files:", error);
  }

  // Default version if none found
  return "unknown";
}

// Must be allowed as Deno protects the file system from being read by default
