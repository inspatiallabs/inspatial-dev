import { Context } from "hono";

export function getRelativeUrl(ctx: Context, path: string) {
  const result = new URL(path, ctx.req.url);
  result.host = ctx.req.header("x-forwarded-host") || result.host;
  return result.toString();
}
