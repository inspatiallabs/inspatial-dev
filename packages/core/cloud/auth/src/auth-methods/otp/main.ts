import { Context } from "@hono/hono";
import { Adapter } from "../../adapter.ts";

export type OTPState =
  | {
      type: "start";
    }
  | {
      type: "code";
      resend?: boolean;
      code: string;
      claims: Record<string, string>;
    };

export type OTPError =
  | {
      type: "invalid_code";
    }
  | {
      type: "invalid_claim";
      key: string;
      value: string;
    };

export function OTPAuth<
  Claims extends Record<string, string> = Record<string, string>,
>(config: {
  length?: number;
  request: (
    req: Request,
    state: OTPState,
    form?: FormData,
    error?: OTPError
  ) => Promise<Response>;
  sendCode: (claims: Claims, code: string) => Promise<void | OTPError>;
}) {
  const length = config.length || 6;
  function generate() {
    const buffer = crypto.getRandomValues(new Uint8Array(length));
    const otp = Array.from(buffer)
      .map((byte) => byte % 10)
      .join("");
    return otp;
  }

  return {
    type: "code",
    init(routes, ctx) {
      async function transition(
        c: Context,
        next: OTPState,
        fd?: FormData,
        err?: OTPError
      ) {
        await ctx.set<OTPState>(c, "adapter", 60 * 60 * 24, next);
        const resp = ctx.forward(
          c,
          await config.request(c.req.raw, next, fd, err)
        );
        return resp;
      }
      routes.get("/authorize", async (c) => {
        const resp = await transition(c, {
          type: "start",
        });
        return resp;
      });

      routes.post("/authorize", async (c) => {
        const code = generate();
        const fd = await c.req.formData();
        const state = await ctx.get<OTPState>(c, "adapter");
        const action = fd.get("action")?.toString();

        if (action === "request" || action === "resend") {
          const claims = Object.fromEntries(fd) as Claims;
          delete claims.action;
          const err = await config.sendCode(claims, code);
          if (err) return transition(c, { type: "start" }, fd, err);
          return transition(
            c,
            {
              type: "code",
              resend: action === "resend",
              claims,
              code,
            },
            fd
          );
        }

        if (
          fd.get("action")?.toString() === "verify" &&
          state.type === "code"
        ) {
          const compare = fd.get("code")?.toString();
          if (!state.code || !compare || state.code !== compare) {
            return transition(
              c,
              {
                ...state,
                resend: false,
              },
              fd,
              { type: "invalid_code" }
            );
          }
          await ctx.unset(c, "adapter");
          return ctx.forward(
            c,
            await ctx.success(c, { claims: state.claims as Claims })
          );
        }
      });
    },
  } satisfies Adapter<{ claims: Claims }>;
}

export type OTPOptions = Parameters<typeof OTPAuth>[0];
