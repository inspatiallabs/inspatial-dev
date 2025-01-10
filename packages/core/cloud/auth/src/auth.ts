import { Adapter, AdapterOptions } from "./adapter.ts";
import { SubjectPayload, SubjectSchema } from "./session.ts";
import { Hono } from "@hono/hono";
import { Context } from "@hono/hono";
import { deleteCookie, getCookie, setCookie } from "@hono/hono/cookie";
import {
  MissingParameterError,
  OauthError,
  UnauthorizedClientError,
  UnknownStateError,
} from "./error.ts";
import { compactDecrypt, CompactEncrypt, SignJWT } from "jose";
import {
  getStorage,
  scanStorage,
  removeStorage,
  setStorage,
  StorageAdapter,
} from "./storage/storage.ts";
import { keys } from "./keys.ts";
import { validatePKCE } from "./pkce.ts";
import { MemoryStorage } from "./storage/memory.ts";
import { cors } from "@hono/hono/cors";
import { Prettify, isDomainMatch } from "@inspatial/util";
import { getEnv } from "./helpers.ts";

export interface OnSuccessResponder<T> {
  subject(type: string, properties: any): Promise<Response>;
}

interface AuthorizationState {
  redirectURI: string;
  responseType: string;
  state: string;
  clientID: string;
  audience?: string;
  pkce?: {
    challenge: string;
    method: "S256";
  };
}

export type Scope = "identify" | "openid" | "email" | "profile";

export function inSpatialAuth<
  AuthenticationMethods extends Record<string, Adapter<any>>,
  Subjects extends SubjectSchema,
  Result = {
    [key in keyof AuthenticationMethods]: Prettify<
      {
        provider: key;
      } & (AuthenticationMethods[key] extends Adapter<infer T>
        ? T
        : Record<string, never>)
    >;
  }[keyof AuthenticationMethods],
>(input: {
  subjects: Subjects;
  storage?: StorageAdapter;
  authMethod: AuthenticationMethods;
  ttl?: {
    access?: number;
    refresh?: number;
  };
  select?: (
    authMethod: Record<string, string>,
    req: Request
  ) => Promise<Response>;
  start?(req: Request): Promise<void>;
  onSuccess: (
    response: OnSuccessResponder<SubjectPayload<Subjects>>,
    input: Result,
    req: Request
  ) => Promise<Response>;
  error?(error: UnknownStateError, req: Request): Promise<Response>;
  allow?(
    input: {
      clientID: string;
      redirectURI: string;
      audience?: string;
    },
    req: Request
  ): Promise<boolean>;
}): Hono<{
  Variables: {
    authorization: AuthorizationState;
  };
}> {
  const error =
    input.error ??
    function (err) {
      return new Response(err.message, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    };
  const ttlAccess = input.ttl?.access ?? 60 * 60 * 24 * 30;
  const ttlRefresh = input.ttl?.refresh ?? 60 * 60 * 24 * 365;

  const allow =
    input.allow ??
    ((input, req) => {
      const redir = new URL(input.redirectURI).hostname;
      if (redir === "localhost" || redir === "127.0.0.1") {
        return true;
      }
      const forwarded = req.headers.get("x-forwarded-host");
      const host = forwarded
        ? new URL(`https://` + forwarded).hostname
        : new URL(req.url).hostname;

      return isDomainMatch(redir, host);
    });

  let storage = input.storage;
  if (!storage) {
    const envStorage = getEnv("INSPATIALAUTH_STORAGE", false); // Make it optional
    if (envStorage) {
      try {
        const parsed = JSON.parse(envStorage);
        if (parsed.type === "memory") {
          storage = MemoryStorage();
        }
        // ...Add other storage type handlers here later e.g InSpatial KV
      } catch (e) {
        console.warn("Failed to parse INSPATIALAUTH_STORAGE:", e);
      }
    }
    // Default to memory storage if nothing else is configured
    if (!storage) {
      storage = MemoryStorage();
    }
  }
  const allKeys = keys(storage);
  const primaryKey = allKeys.then((all) => all[0]);

  const auth: Omit<AdapterOptions<any>, "name"> = {
    async success(ctx: Context, properties: any, opts) {
      return await input.onSuccess(
        {
          async subject(type, properties) {
            const authorization = await getAuthorization(ctx);
            await opts?.invalidate?.(await resolveSubject(type, properties));
            if (authorization.responseType === "token") {
              const location = new URL(authorization.redirectURI);
              const tokens = await generateTokens(ctx, {
                type: type as string,
                properties,
                clientID: authorization.clientID,
              });
              location.hash = new URLSearchParams({
                accessToken: tokens.access,
                refreshToken: tokens.refresh,
                state: authorization.state || "",
              }).toString();
              await auth.unset(ctx, "authorization");
              return ctx.redirect(location.toString(), 302);
            }
            if (authorization.responseType === "code") {
              const code = crypto.randomUUID();
              await setStorage(
                storage,
                ["oauth:code", code],
                {
                  type,
                  properties,
                  redirectURI: authorization.redirectURI,
                  clientID: authorization.clientID,
                  pkce: authorization.pkce,
                },
                60
              );
              const location = new URL(authorization.redirectURI);
              location.searchParams.set("code", code);
              location.searchParams.set("state", authorization.state || "");
              await auth.unset(ctx, "authorization");
              return ctx.redirect(location.toString(), 302);
            }
            throw new OauthError(
              "invalid_request",
              `Unsupported responseType: ${authorization.responseType}`
            );
          },
        },
        {
          provider: ctx.get("provider"),
          ...properties,
        },
        ctx.req.raw
      );
    },
    forward(ctx: Context, request: Request | Response) {
      if (request instanceof Request) {
        return ctx.newResponse(request.body, {
          status: 200,
          headers: request.headers,
        });
      }
      return ctx.newResponse(
        request.body,
        request.status as 100 | 200 | 300 | 400 | 500,
        Object.fromEntries(
          Array.from(request.headers.entries()) as Iterable<[string, string]>
        )
      );
    },
    async set(ctx, key, maxAge, value) {
      setCookie(ctx, key, await encrypt(value), {
        maxAge,
        httpOnly: true,
        ...(ctx.req.url.startsWith("https://")
          ? { secure: true, sameSite: "None" }
          : {}),
      });
    },
    async get(ctx: Context, key: string) {
      const raw = getCookie(ctx, key);
      if (!raw) return;
      return await decrypt(raw).catch((ex) => {
        console.error("failed to decrypt", key, ex);
      });
    },
    unset(ctx: Context, key: string) {
      deleteCookie(ctx, key);
      return Promise.resolve();
    },
    async invalidate(subject: string) {
      for await (const [key] of scanStorage(this.storage, [
        "oauth:refresh",
        subject,
      ])) {
        await removeStorage(this.storage, key);
      }
    },
    storage,
  };

  async function getAuthorization(ctx: Context) {
    const match =
      (await auth.get(ctx, "authorization")) || ctx.get("authorization");
    if (!match) throw new UnknownStateError();
    return match as AuthorizationState;
  }

  async function encrypt(value: any) {
    return await new CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(value))
    )
      .setProtectedHeader({ alg: "RSA-OAEP-512", enc: "A256GCM" })
      .encrypt(await primaryKey.then((k) => k.encryption.public));
  }

  async function resolveSubject(type: string | any, properties: any) {
    const jsonString = JSON.stringify(properties);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${String(type)}:${hashHex.slice(0, 16)}`;
  }

  async function generateTokens(
    ctx: Context,
    value: {
      type: string;
      properties: any;
      clientID: string;
    }
  ) {
    const subject = await resolveSubject(value.type, value.properties);
    const refreshToken = crypto.randomUUID();
    await setStorage(
      storage!,
      ["oauth:refresh", subject, refreshToken],
      {
        ...value,
      },
      ttlRefresh
    );
    return {
      access: await new SignJWT({
        mode: "access",
        type: value.type,
        properties: value.properties,
        aud: value.clientID,
        iss: issuer(ctx),
        sub: subject,
      })
        .setExpirationTime(Date.now() / 1000 + ttlAccess)
        .setProtectedHeader(
          await primaryKey.then((k) => ({
            alg: k.alg,
            kid: k.id,
            typ: "JWT",
          }))
        )
        .sign(await primaryKey.then((v) => v.signing.private)),
      refresh: [subject, refreshToken].join(":"),
    };
  }

  async function decrypt(value: string) {
    return JSON.parse(
      new TextDecoder().decode(
        await compactDecrypt(
          value,
          await primaryKey.then((v) => v.encryption.private)
        ).then((value) => value.plaintext)
      )
    );
  }

  function issuer(ctx: Context) {
    const url = new URL(ctx.req.url);
    const host = ctx.req.header("x-forwarded-host") ?? url.host;
    return url.protocol + "//" + host;
  }

  const hono = new Hono<{
    Variables: {
      authorization: AuthorizationState;
    };
  }>();

  for (const [name, value] of Object.entries(input.authMethod)) {
    const route = new Hono<any>();
    route.use(async (c, next) => {
      c.set("provider", name);
      await next();
    });
    value.init(route, {
      name,
      ...auth,
    });
    hono.route(`/${name}`, route);
  }

  hono.get("/.well-known/jwks.json", async (c) => {
    const all = await allKeys;
    return c.json({
      keys: all.map((item) => item.jwk),
    });
  });

  hono.get("/.well-known/oauth-authorization-server", (c) => {
    const iss = issuer(c);
    return c.json({
      issuer: iss,
      authorizationEndpoint: `${iss}/authorize`,
      tokenEndpoint: `${iss}/token`,
      jwksUri: `${iss}/.well-known/jwks.json`,
      responseTypesSupported: ["code", "token"],
    });
  });

  hono.use(
    "*",
    cors({
      origin: "*",
      allowHeaders: ["*"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: false,
    })
  );

  hono.post("/token", async (c) => {
    const form = await c.req.formData();
    const grantType = form.get("grant_type");

    if (grantType === "authorization_code") {
      const code = form.get("code");
      if (!code)
        return c.json(
          {
            error: "invalid_request",
            error_description: "Missing code",
          },
          400
        );
      const key = ["oauth:code", code.toString()];
      const payload = await getStorage<{
        type: string;
        properties: any;
        clientID: string;
        redirectURI: string;
        pkce?: AuthorizationState["pkce"];
      }>(storage, key);
      if (!payload) {
        return c.json(
          {
            error: "invalid_grant",
            error_description: "Authorization code has been used or expired",
          },
          400
        );
      }
      await removeStorage(storage, key);
      if (payload.redirectURI !== form.get("redirect_uri")) {
        return c.json(
          {
            error: "invalid_redirect_uri",
            error_description: "Redirect URI mismatch",
          },
          400
        );
      }
      if (payload.clientID !== form.get("client_id")) {
        return c.json(
          {
            error: "unauthorized_client",
            error_description:
              "Client is not authorized to use this authorization code",
          },
          403
        );
      }

      if (payload.pkce) {
        const codeVerifier = form.get("code_verifier")?.toString();
        if (!codeVerifier)
          return c.json(
            {
              error: "invalid_grant",
              error_description: "Missing code_verifier",
            },
            400
          );

        if (
          !(await validatePKCE(
            codeVerifier,
            payload.pkce.challenge,
            payload.pkce.method
          ))
        ) {
          return c.json(
            {
              error: "invalid_grant",
              error_description: "Code verifier does not match",
            },
            400
          );
        }
      }
      const tokens = await generateTokens(c, payload);
      return c.json({
        access_token: tokens.access,
        refresh_token: tokens.refresh,
      });
    }

    if (grantType === "refresh_token") {
      const refreshToken = form.get("refresh_token");
      if (!refreshToken)
        return c.json(
          {
            error: "invalid_request",
            error_description: "Missing refresh_token",
          },
          400
        );
      const splits = refreshToken.toString().split(":");
      const token = splits.pop()!;
      const subject = splits.join(":");
      const key = ["oauth:refresh", subject, token];
      const payload = await getStorage<{
        type: string;
        properties: any;
        clientID: string;
      }>(storage, key);
      if (!payload) {
        return c.json(
          {
            error: "invalid_grant",
            error_description: "Refresh token has been used or expired",
          },
          400
        );
      }
      await removeStorage(storage, key);
      const tokens = await generateTokens(c, payload);
      return c.json({
        access_token: tokens.access,
        refresh_token: tokens.refresh,
      });
    }

    if (grantType === "client_credentials") {
      const provider = form.get("provider");
      if (!provider)
        return c.json({ error: "missing `provider` form value" }, 400);
      const match = input.authMethod[provider.toString()];
      if (!match)
        return c.json({ error: "invalid `provider` query parameter" }, 400);
      if (!match.client)
        return c.json(
          { error: "this provider does not support client_credentials" },
          400
        );
      const clientID = form.get("client_id");
      const clientSecret = form.get("client_secret");
      if (!clientID)
        return c.json({ error: "missing `client_id` form value" }, 400);
      if (!clientSecret)
        return c.json({ error: "missing `client_secret` form value" }, 400);
      const response = await match.client({
        clientID: clientID.toString(),
        clientSecret: clientSecret.toString(),
        params: Object.fromEntries(form) as Record<string, string>,
      });
      return input.onSuccess(
        {
          async subject(type, properties) {
            const tokens = await generateTokens(c, {
              type: type as string,
              properties,
              clientID: response.clientID,
            });
            return c.json({
              access_token: tokens.access,
              refresh_token: tokens.refresh,
            });
          },
        },
        {
          provider: provider.toString(),
          ...response,
        },
        c.req.raw
      );
    }

    throw new Error("Invalid grant_type");
  });

  hono.get("/authorize", async (c) => {
    const provider = c.req.query("provider");
    const responseType = c.req.query("responseType");
    const redirectURI = c.req.query("redirectURI");
    const state = c.req.query("state");
    const clientID = c.req.query("clientID");
    const audience = c.req.query("audience");
    const codeChallenge = c.req.query("codeChallenge");
    const codeChallengeMethod = c.req.query("codeChallengeMethod");
    const authorization: AuthorizationState = {
      responseType,
      redirectURI,
      state,
      clientID,
      audience,
      pkce:
        codeChallenge && codeChallengeMethod
          ? {
              challenge: codeChallenge,
              method: codeChallengeMethod,
            }
          : undefined,
    } as AuthorizationState;
    c.set("authorization", authorization);

    if (!redirectURI) {
      return c.text("Missing redirect_uri", { status: 400 });
    }

    if (!responseType) {
      throw new MissingParameterError("responseType");
    }

    if (!clientID) {
      throw new MissingParameterError("clientID");
    }

    if (input.start) {
      await input.start(c.req.raw);
    }

    if (
      !(await allow(
        {
          clientID: clientID,
          redirectURI: redirectURI,
          audience,
        },
        c.req.raw
      ))
    )
      throw new UnauthorizedClientError(clientID, redirectURI);
    await auth.set(c, "authorization", 60 * 60 * 24, authorization);
    if (provider) return c.redirect(`/${provider}/authorize`);
    const authMethod = Object.keys(input.authMethod);
    if (authMethod.length === 1)
      return c.redirect(`/${authMethod[0]}/authorize`);
    return auth.forward(
      c,
      new Response(c.req.raw.body, {
        headers: c.req.raw.headers,
        status: 200,
      })
    );
  });

  hono.all("/*", (c) => {
    return c.notFound();
  });

  hono.onError(async (err, c) => {
    console.error(err);
    if (err instanceof UnknownStateError) {
      return auth.forward(c, await error(err, c.req.raw));
    }
    try {
      const authorization = await getAuthorization(c);
      const url = new URL(authorization.redirectURI);
      const oauth =
        err instanceof OauthError
          ? err
          : new OauthError("server_error", err.message);
      url.searchParams.set("error", oauth.error);
      url.searchParams.set("error_description", oauth.description);
      return c.redirect(url.toString());
    } catch (_e) {
      // If we can't get authorization, return a JSON error
      return c.json(
        {
          error: "server_error",
          error_description: err.message,
        },
        400
      );
    }
  });

  return hono;
}
