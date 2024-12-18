import { retry } from "./retry.ts";

/**
 * Fetch the url and return a buffer with the font file.
 */
export async function fetchFont(url: string, isDev: boolean) {
  // Check if we're using mocked data
  if (Deno.env.get("INSPATIAL_FONT_GOOGLE_MOCKED_RESPONSES")) {
    // If it's an absolute path, read the file from the filesystem
    if (url.startsWith("/")) {
      return await Deno.readFile(url);
    }
    // Otherwise just return a unique buffer
    return new Uint8Array(new TextEncoder().encode(url));
  }

  return await retry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const arrayBuffer = await fetch(url, {
      signal: isDev ? controller.signal : undefined,
    })
      .then((r: any) => r.arrayBuffer())
      .finally(() => {
        clearTimeout(timeoutId);
      });
    return new Uint8Array(arrayBuffer);
  }, 3);
}
