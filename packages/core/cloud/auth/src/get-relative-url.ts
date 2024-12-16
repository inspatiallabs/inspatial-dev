/*##############################################(IMPORTS)##############################################*/

import type { Context } from "@hono/hono";

/*##############################################(TYPES)##############################################*/

interface RelativeUrlParams {
  /** Hono context object */
  ctx: Context;
  /** Path to be converted to a relative URL */
  path: string;
}

/*##############################################(GET-RELATIVE-URL-UTILITY)##############################################*/

/**
 * Takes a path (e.g "/posts") and turns it into a complete URL using the current webpage's address
 * 
 * @description
 * If you're on "https://myapp.com/posts"
 * and you pass in "/users"
 * you'll get "https://myapp.com/users"
 * 
 * @param {RelativeUrlParams} params - The parameters for generating the relative URL
 * @param {Context} params.ctx - The Hono context object
 * @param {string} params.path - The path to be converted to a relative URL
 * @returns {string} The generated relative URL as a string
 * 
 * @example
 * ```ts
 * const relativeUrl = getRelativeUrl({
 *   ctx: honoContext,
 *   path: "/api/users"
 * });
 * ```
 */
export function getRelativeUrl({ ctx, path }: RelativeUrlParams): string {
  const baseUrl = new URL(path, ctx.req.url);
  const forwardedHost = ctx.req.header("x-forwarded-host");
  
  if (forwardedHost) {
    baseUrl.host = forwardedHost;
  }
  
  return baseUrl.toString();
}