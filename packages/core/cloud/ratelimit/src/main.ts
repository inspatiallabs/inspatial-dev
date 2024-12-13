import { type Duration, milliseconds } from "../../../dev/util/src/index.ts";
import { InSpatialKV } from "@inspatial/kv";

export type Limit = {
  /**
   * How many requests may pass in the given duration
   */
  limit: number;
  /**
   * Either a type string literal or milliseconds
   */
  duration: Duration | number;
};

export type RatelimitResponse = {
  /**
   * Whether the request may pass(true) or exceeded the limit(false)
   */
  success: boolean;
  /**
   * Maximum number of requests allowed within a window.
   */
  limit: number;
  /**
   * How many requests the user has left within the current window.
   */
  remaining: number;
  /**
   * Unix timestamp in milliseconds when the limits are reset.
   */
  reset: number;
};

export type LimitOptions = {
  /**
   * Expensive requests may use up more resources. You can specify a cost to the request and
   * we'll deduct this many tokens in the current window. If there are not enough tokens left,
   * the request is denied.
   *
   * @example
   *
   * 1. You have a limit of 10 requests per second you already used 4 of them in the current
   * window.
   *
   * 2. Now a new request comes in with a higher cost:
   * ```ts
   * const res = await rl.limit("identifier", { cost: 4 })
   * ```
   *
   * 3. The request passes and the current limit is now at `8`
   *
   * 4. The same request happens again, but would not be rejected, because it would exceed the
   * limit in the current window: `8 + 4 > 10`
   *
   * @default 1
   */
  cost?: number;
  /**
   * Do not wait for a response from the origin. Faster but less accurate.
   */
  async?: boolean;
  /**
   * Record arbitrary data about this request. This does not affect the limit itself but can help
   * you debug later.
   */
  meta?: Record<string, string | number | boolean | null>;
  /**
   * Specify which resources this request would access and we'll create a papertrail for you.
   */
  resources?: {
    type: string;
    id: string;
    name?: string;
    meta?: Record<string, string | number | boolean | null>;
  }[];
};

export type RatelimitConfig = Limit & {
  /**
   * Namespaces allow you to separate different areas of your app and have isolated limits.
   *
   * @example tRPC-routes
   */
  namespace: string;

  /**
   * Configure a timeout to prevent network issues from blocking your function for too long.
   *
   * Disable it by setting `timeout: false`
   *
   * @default
   * ```ts
   * {
   *   // 5 seconds
   *   milliseconds: 5000,
   *   fallback: { success: false, limit: 0, remaining: 0, reset: Date.now()}
   * }
   * ```
   */
  timeout?:
    | {
        /**
         * Time in milliseconds until the response is returned
         */
        milliseconds: number | Duration;

        /**
         * A custom response to return when the timeout is reached.
         *
         * The important bit is the `success` value, choose whether you want to let requests pass or not.
         *
         * @example With a static response
         * ```ts
         * {
         *   // 5 seconds
         *   milliseconds: 5000
         *   fallback: () => ({ success: true, limit: 0, remaining: 0, reset: 0 })
         * }
         * ```
         * @example With a dynamic response
         * ```ts
         * {
         *  // 5 seconds
         *  milliseconds: 5000
         *  fallback: (identifier: string) => {
         *  if (someCheck(identifier)) {
         *    return { success: false, limit: 0, remaining: 0, reset: 0 }
         *  }
         *  return { success: true, limit: 0, remaining: 0, reset: 0 }
         *  }
         * }
         * ```
         */
        fallback:
          | RatelimitResponse
          | ((
              identifier: string
            ) => RatelimitResponse | Promise<RatelimitResponse>);
      }
    | false;

  /**
   * Configure what happens for unforeseen errors
   *
   * @example Letting requests pass
   * ```ts
   *   onError: () => ({ success: true, limit: 0, remaining: 0, reset: 0 })
   * ```
   *
   * @example Rejecting the request
   * ```ts
   *   onError: () => ({ success: false, limit: 0, remaining: 0, reset: 0 })
   * ```
   *
   * @example Dynamic response
   * ```ts
   *   onError: (error, identifier) => {
   *     if (someCheck(error, identifier)) {
   *       return { success: false, limit: 0, remaining: 0, reset: 0 }
   *     }
   *     return { success: true, limit: 0, remaining: 0, reset: 0 }
   *   }
   * ```
   */
  onError?: (
    err: Error,
    identifier: string
  ) => RatelimitResponse | Promise<RatelimitResponse>;

  /**
   * Do not wait for a response from the origin. Faster but less accurate.
   */
  async?: boolean;
};

export interface Ratelimiter {
  limit: (
    identifier: string,
    opts?: LimitOptions
  ) => Promise<RatelimitResponse>;
}

/**
 * Schema for rate limit entries in KV store
 */
type RatelimitSchema = [
  {
    key: ["ratelimit", string]; // [namespace:identifier, string]
    schema: {
      requests: number;
      resetTime: number;
    };
  },
];

/**
 * No-operation rate limiter that always allows requests.
 * Useful for testing or when rate limiting is disabled.
 */
export class NoopRatelimit implements Ratelimiter {
  public limit(
    _identifier: string,
    _opts?: LimitOptions
  ): Promise<RatelimitResponse> {
    return Promise.resolve({
      limit: 0,
      remaining: 0,
      reset: 0,
      success: true,
    });
  }
}

/**
 * InSpatial Rate Limiter using InSpatialKV for storage
 *
 * @example
 * ```ts
 * const kv = new InSpatialKV<RatelimitSchema>();
 * const limiter = new Ratelimit({
 *   kv,
 *   limit: 10,
 *   duration: "1m",
 *   namespace: "api",
 * });
 *
 * // Use in your API
 * const result = await limiter.limit("user-123");
 * if (!result.success) {
 *   throw new Error("Rate limit exceeded");
 * }
 * ```
 */
export class Ratelimit implements Ratelimiter {
  private readonly config: RatelimitConfig;
  private readonly kv: InSpatialKV<RatelimitSchema>;

  constructor(kv: InSpatialKV<RatelimitSchema>, config: RatelimitConfig) {
    this.config = config;
    this.kv = kv;
  }

  /**
   * Limit a specific identifier, you can override a lot of things about this specific request using
   * the 2nd argument.
   *
   * @example
   * ```ts
   * const identifier = getIpAddress() // or userId or anything else
   * const res = await limiter.limit(identifier)
   *
   * if (!res.success){
   *   // reject request
   * }
   * // handle request
   * ```
   */
  public async limit(
    identifier: string,
    opts?: LimitOptions
  ): Promise<RatelimitResponse> {
    try {
      return this._limit(identifier, opts);
    } catch (e) {
      if (!this.config.onError) {
        throw e;
      }
      const err = e instanceof Error ? e : new Error(String(e));
      return await this.config.onError(err, identifier);
    }
  }

  private async _limit(
    identifier: string,
    opts?: LimitOptions
  ): Promise<RatelimitResponse> {
    const timeout =
      this.config.timeout === false
        ? null
        : (this.config.timeout ?? {
            milliseconds: 5000,
            fallback: () => ({
              success: false,
              limit: 0,
              remaining: 0,
              reset: Date.now(),
            }),
          });

    let timeoutId: any = null;
    try {
      const ps: Promise<RatelimitResponse>[] = [
        this.processRateLimit(identifier, opts?.cost ?? 1, opts),
      ];

      if (timeout) {
        ps.push(
          new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
              const resolvedValue =
                typeof timeout.fallback === "function"
                  ? await timeout.fallback(identifier)
                  : timeout.fallback;
              resolve(resolvedValue);
            }, milliseconds(timeout.milliseconds));
          })
        );
      }

      return await Promise.race(ps);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private async processRateLimit(
    identifier: string,
    cost: number,
    opts?: LimitOptions
  ): Promise<RatelimitResponse> {
    const key = `${this.config.namespace}:${identifier}`;
    const now = Date.now();

    // Use atomic operation for consistency
    const atomic = this.kv.atomic();
    const entry = await this.kv.get(["ratelimit", key]);
    const current = entry.value;

    if (!current || current.resetTime <= now) {
      const resetTime = now + milliseconds(this.config.duration);
      const newValue = {
        requests: cost,
        resetTime,
      };

      if (!opts?.async) {
        await this.kv.set(["ratelimit", key], newValue, {
          expireIn: milliseconds(this.config.duration),
        });
      } else {
        // Fire and forget for async mode
        this.kv
          .set(["ratelimit", key], newValue, {
            expireIn: milliseconds(this.config.duration),
          })
          .catch(() => {});
      }

      return {
        success: true,
        limit: this.config.limit,
        remaining: this.config.limit - cost,
        reset: resetTime,
      };
    }

    // Check if would exceed limit
    if (current.requests + cost > this.config.limit) {
      return {
        success: false,
        limit: this.config.limit,
        remaining: Math.max(0, this.config.limit - current.requests),
        reset: current.resetTime,
      };
    }

    // Update existing record
    const updated = {
      requests: current.requests + cost,
      resetTime: current.resetTime,
    };

    if (!opts?.async) {
      await atomic
        .check(entry)
        .set(["ratelimit", key], updated, {
          expireIn: milliseconds(this.config.duration),
        })
        .commit();
    } else {
      // Fire and forget for async mode
      atomic
        .check(entry)
        .set(["ratelimit", key], updated, {
          expireIn: milliseconds(this.config.duration),
        })
        .commit()
        .catch(() => {});
    }

    return {
      success: true,
      limit: this.config.limit,
      remaining: Math.max(0, this.config.limit - updated.requests),
      reset: current.resetTime,
    };
  }
}
