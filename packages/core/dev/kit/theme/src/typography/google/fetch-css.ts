import { proxyAgent } from "./proxy-agent.ts";
import { retry } from "./retry.ts";

/**
 * Fetches the CSS containing the @font-face declarations from Google Fonts.
 * The fetch has a user agent header with a modern browser to ensure we'll get .woff2 files.
 *
 * The env variable INSPATIAL_FONT_GOOGLE_MOCKED_RESPONSES may be set containing a path to mocked data.
 * It's used to define mocked data to avoid hitting the Google Fonts API during tests.
 */

export async function fetchStylesheet(
  url: string,
  fontFamily: string,
  isDev: boolean,
  customDeno?: typeof Deno
): Promise<string> {
  // Use provided Deno instance or fall back to global
  const deno = customDeno ?? globalThis.Deno;

  // Check if mocked responses are defined
  let mockedResponse: string | undefined;
  const mockedResponsePath = deno?.env.get(
    "INSPATIAL_FONT_GOOGLE_MOCKED_RESPONSES"
  );
  if (mockedResponsePath) {
    const mockFile = await import(mockedResponsePath);
    mockedResponse = mockFile[url];
    if (!mockedResponse) {
      throw new Error("Missing mocked response for URL: " + url);
    }
  }

  let cssResponse: string;
  if (mockedResponse) {
    cssResponse = mockedResponse;
  } else {
    // Retry logic for network issues
    cssResponse = await retry(async () => {
      const controller = isDev ? new AbortController() : undefined;
      const signal = controller?.signal;
      const timeoutId = controller
        ? setTimeout(() => controller.abort(), 3000)
        : undefined;

      try {
        const fetchOptions: RequestInit = {
          signal,
          headers: {
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
          },
          ...proxyAgent(customDeno),
        };

        const res = await fetch(url, fetchOptions);

        if (!res.ok) {
          throw new Error(
            `Failed to fetch font \`${fontFamily}\`.\nURL: ${url}\n\nPlease check if the network is available.`
          );
        }

        return await res.text();
      } finally {
        timeoutId && clearTimeout(timeoutId);
      }
    }, 3);
  }

  return cssResponse;
}
