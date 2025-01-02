// import { test, expect } from "@inspatial/test";
// import { inSpatialAuth } from "./auth.ts";
// import { OTPAuth } from "./auth-methods/otp/main.ts";
// import {
//   GoogleAuth,
//   GithubAuth,
//   DiscordAuth,
//   FacebookAuth,
//   AppleAuth,
//   MicrosoftAuth,
//   SlackAuth,
//   SpotifyAuth,
//   TwitchAuth,
//   XAuth,
//   YahooAuth,
// } from "./auth-methods/social-auth/index.ts";
// import { MemoryStorage } from "./storage/memory.ts";

// /*#########################################(Core Auth Tests)#########################################*/

// test({
//   name: "inSpatialAuth initializes with basic configuration",
//   fn: async () => {
//     const auth = inSpatialAuth({
//       storage: MemoryStorage(),
//       authMethod: {
//         otp: OTPAuth({
//           sendCode: async () => {},
//           request: async () => new Response(),
//         }),
//       },
//       subjects: {
//         user: {
//           id: "string",
//           email: "string",
//         },
//       },
//     });

//     expect(auth).toBeDefined();
//     expect(typeof auth.fetch).toBe("function");
//   },
// });

// /*#########################################(Storage Tests)#########################################*/

// test({
//   name: "MemoryStorage implements required methods",
//   fn: async () => {
//     const storage = MemoryStorage();

//     expect(storage.get).toBeDefined();
//     expect(storage.set).toBeDefined();
//     expect(storage.delete).toBeDefined();
//     expect(storage.scan).toBeDefined();
//   },
// });

// test({
//   name: "Storage operations work correctly",
//   fn: async () => {
//     const storage = MemoryStorage();
//     const testKey = "test-key";
//     const testValue = { data: "test" };

//     await storage.set(testKey, testValue);
//     const retrieved = await storage.get(testKey);

//     expect(retrieved).toEqual(testValue);

//     await storage.delete(testKey);
//     const deleted = await storage.get(testKey);

//     expect(deleted).toBeUndefined();
//   },
// });

// /*#########################################(OAuth Provider Tests)#########################################*/

// test({
//   name: "Social auth providers initialize correctly",
//   fn: () => {
//     const providers = {
//       google: GoogleAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["email"],
//       }),
//       github: GithubAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["user"],
//       }),
//       discord: DiscordAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["identify"],
//       }),
//       facebook: FacebookAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["email"],
//       }),
//       apple: AppleAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["email"],
//       }),
//       microsoft: MicrosoftAuth({
//         clientID: "test",
//         clientSecret: "test",
//         tenant: "common",
//         scopes: ["user.read"],
//       }),
//       slack: SlackAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["identity.email"],
//       }),
//       spotify: SpotifyAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["user-read-email"],
//       }),
//       twitch: TwitchAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["user:read:email"],
//       }),
//       x: XAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["users.read"],
//       }),
//       yahoo: YahooAuth({
//         clientID: "test",
//         clientSecret: "test",
//         scopes: ["openid"],
//       }),
//     };

//     for (const [name, provider] of Object.entries(providers)) {
//       expect(provider).toBeDefined();
//       expect(provider.type).toBe(name);
//       expect(typeof provider.init).toBe("function");
//     }
//   },
// });

// /*#########################################(OTP Auth Tests)#########################################*/

// test({
//   name: "OTP authentication flow works correctly",
//   fn: async () => {
//     let sentCode: string | null = null;
//     let sentClaims: Record<string, string> | null = null;

//     const otpAuth = OTPAuth({
//       length: 6,
//       sendCode: async (claims, code) => {
//         sentCode = code;
//         sentClaims = claims;
//       },
//       request: async () => new Response(),
//     });

//     expect(otpAuth.type).toBe("code");
//     expect(typeof otpAuth.init).toBe("function");
//   },
// });

// /*#########################################(Integration Tests)#########################################*/

// test({
//   name: "Full authentication flow with OTP",
//   fn: async () => {
//     const auth = inSpatialAuth({
//       storage: MemoryStorage(),
//       authMethod: {
//         otp: OTPAuth({
//           sendCode: async () => {},
//           request: async () => new Response(),
//         }),
//       },
//       subjects: {
//         user: {
//           id: "string",
//           email: "string",
//         },
//       },
//     });

//     const response = await auth.fetch(
//       new Request("http://localhost/auth/otp/start", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: "test@example.com",
//         }),
//       })
//     );

//     expect(response.status).toBe(200);
//   },
// });

// /*#########################################(Error Handling Tests)#########################################*/

// test({
//   name: "Auth handles invalid configuration",
//   fn: () => {
//     expect(() => {
//       inSpatialAuth({
//         storage: null as any,
//         authMethod: {},
//         subjects: {
//           user: {
//             id: "string",
//           },
//         },
//       });
//     }).toThrow();
//   },
// });

// test({
//   name: "Auth handles invalid requests",
//   fn: async () => {
//     const auth = inSpatialAuth({
//       storage: MemoryStorage(),
//       authMethod: {
//         otp: OTPAuth({
//           sendCode: async () => {},
//           request: async () => new Response(),
//         }),
//       },
//       subjects: {
//         user: {
//           id: "string",
//           email: "string",
//         },
//       },
//     });

//     const response = await auth.fetch(
//       new Request("http://localhost/auth/invalid", {
//         method: "POST",
//       })
//     );

//     expect(response.status).toBe(404);
//   },
// });

// /*#########################################(Security Tests)#########################################*/

// test({
//   name: "Auth enforces CORS policies",
//   fn: async () => {
//     const auth = inSpatialAuth({
//       storage: MemoryStorage(),
//       authMethod: {
//         otp: OTPAuth({
//           sendCode: async () => {},
//           request: async () => new Response(),
//         }),
//       },
//       subjects: {
//         user: {
//           id: "string",
//           email: "string",
//         },
//       },
//     });

//     const response = await auth.fetch(
//       new Request("http://localhost/auth/otp/start", {
//         method: "OPTIONS",
//       })
//     );

//     expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
//     expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST");
//   },
// });
