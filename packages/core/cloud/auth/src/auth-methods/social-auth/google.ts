import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";
import { OidcAdapter, OidcWrappedConfig } from "./config/oidc.ts";

export function GoogleAuth(config: Oauth2WrappedConfig): Oauth2Adapter {
  return Oauth2Adapter({
    ...config,
    type: "google",
    endpoint: {
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
    },
  });
}

export function GoogleOidcAuth(config: OidcWrappedConfig): OidcAdapter {
  return OidcAdapter({
    ...config,
    type: "google",
    issuer: "https://accounts.google.com",
  });
}
