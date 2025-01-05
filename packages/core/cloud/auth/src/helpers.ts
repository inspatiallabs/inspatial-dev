import { Context } from "@hono/hono";

export function getRelativeUrl(ctx: Context, path: string) {
  const result = new URL(path, ctx.req.url);
  result.host = ctx.req.header("x-forwarded-host") || result.host;
  return result.toString();
}

/**
 * Returns the environment variable with the given key after ensuring that it's
 * been set in the current process. This can be used when defining a custom
 * OAuth configuration.
 *
 * @example Usage
 * ```ts ignore
 *
 * getEnv("HOME"); // Returns "/home/alice"
 * ```
 */
export function getEnv(
  key: string,
  required: boolean = false
): string | undefined {
  const value = Deno.env.get(key);
  if (required && value === undefined) {
    throw new Error(`"${key}" environment variable must be set`);
  }
  return value;
}

export function setEnv(key: string, value: string) {
  Deno.env.set(key, value);
}
