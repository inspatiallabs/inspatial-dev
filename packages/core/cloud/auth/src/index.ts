export { createSubjects } from "./session.ts";
export { inspatialAuth } from "./auth.ts";
export { createClient } from "./client.ts";

/*##########################(OAUTH)##########################*/
export { AppleAuth, AppleOidcAuth } from "./auth-methods/oAuth/apple.ts";
export { DiscordAuth } from "./auth-methods/oAuth/discord.ts";
export { GoogleAuth, GoogleOidcAuth } from "./auth-methods/oAuth/google.ts";
export { GithubAuth } from "./auth-methods/oAuth/github.ts";
export {
  FacebookAuth,
  FacebookOidcAuth,
} from "./auth-methods/oAuth/facebook.ts";
export { XAuth } from "./auth-methods/oAuth/x.ts";
export { TwitchAuth } from "./auth-methods/oAuth/twitch.ts";
export { YahooAuth } from "./auth-methods/oAuth/yahoo.ts";

/*##########################(OTP)##########################*/
// export { CodeAuth  } from "./auth-methods/otp/code.ts";
// export { EmailAuth  } from "./auth-methods/otp/email.ts";
// export { PhoneAuth  } from "./auth-methods/otp/phone.ts";
