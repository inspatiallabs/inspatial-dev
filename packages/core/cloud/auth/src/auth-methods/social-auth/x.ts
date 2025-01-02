import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";

export function XAuth(
  config: Oauth2WrappedConfig
): ReturnType<typeof Oauth2Adapter> {
  return Oauth2Adapter({
    ...config,
    type: "x",
    endpoint: {
      authorization: "https://twitter.com/i/oauth2/authorize",
      token: "https://api.x.com/2/oauth2/token",
    },
  });
}
