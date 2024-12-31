export { createSubjects } from "./session.ts";
export { inspatialAuth } from "./auth.ts";
export { createClient } from "./client.ts";

/*##########################(OAUTH)##########################*/
export { AppleAuth, AppleOidcAuth } from "./auth-methods/social-auth/apple.ts";
export { DiscordAuth } from "./auth-methods/social-auth/discord.ts";
export { GoogleAuth, GoogleOidcAuth } from "./auth-methods/social-auth/google.ts";
export { GithubAuth } from "./auth-methods/social-auth/github.ts";
export {
  FacebookAuth,
  FacebookOidcAuth,
} from "./auth-methods/social-auth/facebook.ts";
export { XAuth } from "./auth-methods/social-auth/x.ts";
export { TwitchAuth } from "./auth-methods/social-auth/twitch.ts";
export { YahooAuth } from "./auth-methods/social-auth/yahoo.ts";

/*##########################(OTP)##########################*/
// export { CodeAuth  } from "./auth-methods/otp/code.ts";
// export { EmailAuth  } from "./auth-methods/otp/email.ts";
// export { PhoneAuth  } from "./auth-methods/otp/phone.ts";

/*##########################(BIOMETRICS)##########################*/
// export { BiometricsAuth } from "./auth-methods/biometrics/biometrics.ts";
