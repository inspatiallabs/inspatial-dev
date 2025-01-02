import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";
import { OidcAdapter, OidcWrappedConfig } from "./config/oidc.ts";

export function FacebookAuth(
  config: Oauth2WrappedConfig
): ReturnType<typeof Oauth2Adapter> {
  return Oauth2Adapter({
    ...config,
    type: "facebook",
    endpoint: {
      authorization: "https://www.facebook.com/v12.0/dialog/oauth",
      token: "https://graph.facebook.com/v12.0/oauth/access_token",
    },
  });
}

export function FacebookOidcAuth(
  config: OidcWrappedConfig
): ReturnType<typeof OidcAdapter> {
  return OidcAdapter({
    ...config,
    type: "facebook",
    issuer: "https://graph.facebook.com",
  });
}
