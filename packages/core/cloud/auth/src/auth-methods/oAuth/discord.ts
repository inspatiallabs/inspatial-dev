import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";

export function DiscordAuth(config: Oauth2WrappedConfig) {
  return Oauth2Adapter({
    type: "discord",
    ...config,
    endpoint: {
      authorization: "https://discord.com/oauth2/authorize",
      token: "https://discord.com/api/oauth2/token",
    },
  });
}
