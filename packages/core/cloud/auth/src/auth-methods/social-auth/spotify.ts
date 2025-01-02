import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";

export function SpotifyAuth(
  config: Oauth2WrappedConfig
): ReturnType<typeof Oauth2Adapter> {
  return Oauth2Adapter({
    ...config,
    type: "spotify",
    endpoint: {
      authorization: "https://accounts.spotify.com/authorize",
      token: "https://accounts.spotify.com/api/token",
    },
  });
}
