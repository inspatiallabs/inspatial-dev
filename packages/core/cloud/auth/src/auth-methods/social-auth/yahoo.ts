import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";

export function YahooAuth(
  config: Oauth2WrappedConfig
): ReturnType<typeof Oauth2Adapter> {
  return Oauth2Adapter({
    ...config,
    type: "yahoo",
    endpoint: {
      authorization: "https://api.login.yahoo.com/oauth2/request_auth",
      token: "https://api.login.yahoo.com/oauth2/get_token",
    },
  });
}
