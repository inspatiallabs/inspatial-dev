import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";

export function TwitchAuth(
  config: Oauth2WrappedConfig
): ReturnType<typeof Oauth2Adapter> {
  return Oauth2Adapter({
    type: "twitch",
    ...config,
    endpoint: {
      authorization: "https://id.twitch.tv/oauth2/authorize",
      token: "https://id.twitch.tv/oauth2/token",
    },
  });
}
