import { Oauth2Adapter, Oauth2WrappedConfig } from "./config/oauth2.ts";
import { OidcAdapter, OidcWrappedConfig } from "./config/oidc.ts";

export interface MicrosoftConfig extends Oauth2WrappedConfig {
  tenant: string;
}

export function MicrosoftAuth(
  config: MicrosoftConfig
): ReturnType<typeof Oauth2Adapter> {
  return Oauth2Adapter({
    ...config,
    type: "microsoft",
    endpoint: {
      authorization: `https://login.microsoftonline.com/${config?.tenant}/oauth2/v2.0/authorize`,
      token: `https://login.microsoftonline.com/${config?.tenant}/oauth2/v2.0/token`,
    },
  });
}

export function MicrosoftOidcAuth(
  config: OidcWrappedConfig
): ReturnType<typeof OidcAdapter> {
  return OidcAdapter({
    ...config,
    type: "microsoft",
    issuer: "https://graph.microsoft.com/oidc/userinfo",
  });
}
