export { createSubjects } from "./session.ts";
export { inSpatialAuth } from "./auth.ts";
export { createClient } from "./client.ts";
export { MemoryStorage } from "./storage/memory.ts"

/*##########################(SOCIAL AUTH/OAUTH2)##########################*/

export * from "./auth-methods/social-auth/index.ts";

/*##########################(OTP AUTH)##########################*/
// export { CodeAuth  } from "./auth-methods/otp/code.ts";
// export { EmailAuth  } from "./auth-methods/otp/email.ts";
// export { PhoneAuth  } from "./auth-methods/otp/phone.ts";

/*##########################(BIOMETRICS AUTH)##########################*/
// export { BiometricsAuth } from "./auth-methods/biometrics/index.ts";

/*##########################(WALLET AUTH)##########################*/
// export { WalletAuth } from "./auth-methods/wallet/index.ts";

/*##########################(ANONYMOUS AUTH)##########################*/
// export { AnonymousAuth } from "./auth-methods/anonymous/index.ts";
