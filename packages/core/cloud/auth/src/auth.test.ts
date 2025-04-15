import { test, expect } from "@inspatial/test";
import { inSpatialAuth } from "./auth.ts";
import { OTPAuth } from "./auth-methods/otp/main.ts";
import {
  GoogleAuth,
  GithubAuth,
  DiscordAuth,
  FacebookAuth,
  AppleAuth,
  MicrosoftAuth,
  SlackAuth,
  SpotifyAuth,
  TwitchAuth,
  XAuth,
  YahooAuth,
} from "./auth-methods/social-auth/index.ts";
import { MemoryStorage } from "./storage/memory.ts";
import { createSubjectSchema, string, email } from "./schema.ts";
import { mockSession, restoreTest } from "../../../dev/test/src/mock/mock.ts";
// import { FakeTime } from "@inspatial/test/time";
import { setEnv } from "./helpers.ts";

/*#########################################(Mock Tests)#########################################*/

test("mock environment variable", () => {
  const sessionId = mockSession();
  setEnv("INSPATIALAUTH_STORAGE", "mock_storage_value");
  restoreTest(sessionId);
});

/*#########################################(Core Auth Tests)#########################################*/

test({
  name: "inSpatialAuth initializes with basic configuration",
  fn: async () => {
    const auth = inSpatialAuth({
      storage: MemoryStorage(),
      authMethod: {
        otp: OTPAuth({
          sendCode: async () => {},
          request: async () => new Response(),
        }),
      },
      subjects: {
        user: createSubjectSchema({
          name: string("Invalid name"),
          email: email("Invalid email format"),
        }),
      },
      onSuccess: async ({ subject }) => {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
          },
        });
      },
    });

    // Wait for the auth initialization and key generation to complete
    const instance = await auth;
    await new Promise((resolve) => setTimeout(resolve, 100)); // Give time for key generation

    expect(instance).toBeDefined();
    expect(typeof instance.fetch).toBe("function");
  },
});

/*#########################################(Schema Tests)#########################################*/
test({
  name: "Auth validates user data correctly",
  fn: async () => {
    const userSchema = createSubjectSchema({
      name: string("Invalid name"),
      email: email("Invalid email format"),
    });

    const validData = {
      name: "Ben Emma",
      email: "ben@inspatiallabs.com",
    };

    const invalidData = {
      name: 123,
      email: "invalid-email",
    };

    const validResult = await userSchema["~standard"].validate(validData);
    expect("value" in validResult).toBe(true);
    if ("value" in validResult) {
      expect(validResult.value).toEqual(validData);
    }

    const invalidResult = await userSchema["~standard"].validate(invalidData);
    expect("issues" in invalidResult).toBe(true);
    if ("issues" in invalidResult) {
      expect(invalidResult.issues.length).toBeGreaterThan(0);
    }
  },
});

/*#########################################(Storage Tests)#########################################*/

test({
  name: "MemoryStorage implements required methods",
  fn: async () => {
    const storage = MemoryStorage();

    expect(storage.get).toBeDefined();
    expect(storage.set).toBeDefined();
    expect(storage.delete).toBeDefined();
    expect(storage.scan).toBeDefined();
  },
});

test({
  name: "Storage operations work correctly",
  fn: async () => {
    const storage = MemoryStorage();
    const testKey = ["test"];
    const testValue = { data: "test" };

    await storage.set(testKey, testValue);
    const retrieved = await storage.get(testKey);

    expect(retrieved).toEqual(testValue);

    await storage.delete(testKey);
    const deleted = await storage.get(testKey);

    expect(deleted).toBeUndefined();
  },
});

/*#########################################(OAuth Provider Tests)#########################################*/

test({
  name: "Social auth providers initialize correctly",
  fn: () => {
    const providers = {
      google: GoogleAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["email"],
      }),
      github: GithubAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["user"],
      }),
      discord: DiscordAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["email"],
      }),
      facebook: FacebookAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["email"],
      }),
      apple: AppleAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["email"],
      }),
      microsoft: MicrosoftAuth({
        clientID: "test",
        clientSecret: "test",
        tenant: "common",
        scopes: ["user.read"],
      }),
      slack: SlackAuth({
        clientID: "test",
        clientSecret: "test",
        team: "test",
        scopes: ["openid"],
      }),
      spotify: SpotifyAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["user-read-email"],
      }),
      twitch: TwitchAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["user:read:email"],
      }),
      x: XAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["users.read"],
      }),
      yahoo: YahooAuth({
        clientID: "test",
        clientSecret: "test",
        scopes: ["openid"],
      }),
    };

    for (const [name, provider] of Object.entries(providers)) {
      expect(provider).toBeDefined();
      expect(provider.type).toBe(name);
      expect(typeof provider.init).toBe("function");
    }
  },
});

/*#########################################(OTP Auth Tests)#########################################*/

test({
  name: "OTP authentication flow works correctly",
  fn: async () => {
    let sentCode: string | null = null;
    let sentClaims: Record<string, string> | null = null;

    const otpAuth = OTPAuth({
      length: 6,
      sendCode: async (claims, code) => {
        sentCode = code;
        sentClaims = claims;
      },
      request: async () => new Response(),
    });

    expect(otpAuth.type).toBe("code");
    expect(typeof otpAuth.init).toBe("function");
  },
});

/*#########################################(Integration Tests)#########################################*/
test({
  name: "Full authentication flow with OTP",
  fn: async () => {
    const auth = await inSpatialAuth({
      storage: MemoryStorage(),
      authMethod: {
        otp: OTPAuth({
          sendCode: async () => {},
          request: async () => new Response(null, { status: 200 }),
        }),
      },
      subjects: {
        user: {
          "~standard": {
            version: 1,
            vendor: "test",
            validate: async () => ({ value: {} }),
          },
          properties: {},
        },
      },
      onSuccess: async ({ subject }) => {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
          },
        });
      },
    });

    // Send proper form data in the request
    const response = await auth.fetch(
      new Request("http://localhost/otp/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "request",
          email: "test@example.com",
        }).toString(),
      })
    );

    expect(response.status).toBe(200);
  },
});

/*#########################################(Error Handling Tests)#########################################*/

test({
  name: "Auth properly handles validation errors",
  fn: async () => {
    const userSchema = createSubjectSchema({
      email: email("Invalid email format"),
    });

    const result = await userSchema["~standard"].validate({
      email: "invalid-email",
    });

    expect("issues" in result).toBe(true);
    if ("issues" in result) {
      expect(result.issues[0].message).toBe("Invalid email format");
    }
  },
});

/*#########################################(Security Tests)#########################################*/

// test({
//   name: "Auth enforces CORS policies",
//   fn: async () => {
//     // Create a FakeTime controller
//     using time = new FakeTime();

//     const auth = await inSpatialAuth({
//       storage: MemoryStorage(),
//       authMethod: {
//         otp: OTPAuth({
//           sendCode: async () => {},
//           request: async () => new Response(),
//         }),
//       },
//       subjects: {
//         user: createSubjectSchema({
//           email: email("Invalid email format"),
//           name: string("Invalid name"),
//         }),
//       },
//       onSuccess: async ({ subject }) => {
//         return new Response(null, {
//           status: 302,
//           headers: {
//             Location: "/",
//           },
//         });
//       },
//     });

//     // Give time for any async operations including key generation to complete
//     // Using FakeTime instead of real setTimeout
//     time.tick(500);

//     const response = await auth.fetch(
//       new Request("http://localhost/otp/authorize", {
//         method: "OPTIONS",
//       })
//     );

//     expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
//     expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
//       "GET,POST,PUT,DELETE,OPTIONS"
//     );
//     expect(response.headers.get("Access-Control-Allow-Headers")).toBe("*");
//   },
// });
