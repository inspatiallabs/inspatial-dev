/**
 * Creates a proxy configuration for fetch based on environment variables
 * Returns undefined if no proxy is configured
 */
export function proxyAgent(
  denoInstance?: typeof Deno
): RequestInit | undefined {
  const deno = denoInstance ?? globalThis.Deno;

  const httpsProxy =
    deno?.env.get("https_proxy") || deno?.env.get("HTTPS_PROXY");
  const httpProxy = deno?.env.get("http_proxy") || deno?.env.get("HTTP_PROXY");

  if (!httpsProxy && !httpProxy) {
    return undefined;
  }

  const proxyUrl = httpsProxy || httpProxy;
  if (!proxyUrl) {
    return undefined;
  }

  // Parse the proxy URL
  const proxy = new URL(proxyUrl);

  return {
    client: "proxy",
    proxy: {
      url: proxy.toString(),
      basicAuth:
        proxy.username && proxy.password
          ? {
              username: proxy.username,
              password: proxy.password,
            }
          : undefined,
    },
  } as RequestInit;
}
