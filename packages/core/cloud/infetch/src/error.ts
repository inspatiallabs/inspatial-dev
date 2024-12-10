/**
 * @description Error handling for fetch operations
 */

import type {
  FetchContext,
  FetchOptions,
  FetchRequest,
  FetchResponse,
  IFetchError,
} from "./types.ts";

/**
 * Custom error class for fetch operations
 */
export class FetchError<T = unknown> extends Error implements IFetchError<T> {
  public readonly request?: FetchRequest;
  public readonly response?: FetchResponse<T>;
  public readonly options?: FetchOptions;
  public readonly statusCode?: number;
  public readonly statusMessage?: string;

  constructor(
    message: string,
    init?: {
      request?: FetchRequest;
      response?: FetchResponse<T>;
      options?: FetchOptions;
      cause?: Error;
    }
  ) {
    super(message, { cause: init?.cause });
    this.name = "FetchError";

    // Initialize properties
    this.request = init?.request;
    this.response = init?.response;
    this.options = init?.options;

    // Ensure prototype chain is properly set up
    Object.setPrototypeOf(this, FetchError.prototype);
  }

  /**
   * HTTP status code of the response
   */
  get status(): number | undefined {
    return this.response?.status;
  }

  /**
   * HTTP status text of the response
   */
  get statusText(): string | undefined {
    return this.response?.statusText;
  }

  /**
   * Response data if available
   */
  get data(): T | undefined {
    return this.response?._data;
  }

  /**
   * Creates a string representation of the error
   */
  toString(): string {
    const parts: string[] = [this.message];

    if (this.status) {
      parts.push(`Status: ${this.status}`);
    }

    if (this.statusText) {
      parts.push(`Status Text: ${this.statusText}`);
    }

    if (this.cause) {
      parts.push(`Cause: ${this.cause.message}`);
    }

    return parts.join(" | ");
  }

  /**
   * Creates a plain object representation of the error
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      data: this.data,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
    };
  }
}

/**
 * Creates a FetchError from a context object
 */
export function createFetchError<T = unknown>(
  ctx: FetchContext<T>
): FetchError<T> {
  // Build error message
  const method =
    (ctx.request instanceof Request
      ? ctx.request.method
      : ctx.options?.method) || "GET";
  const url =
    ctx.request instanceof Request ? ctx.request.url : String(ctx.request);
  const requestStr = `[${method}] ${url}`;

  const statusStr = ctx.response
    ? `${ctx.response.status} ${ctx.response.statusText}`
    : "<no response>";

  const errorMsg =
    ctx.error instanceof Error
      ? ctx.error.message
      : ctx.error?.toString() || "";

  const message = `${requestStr}: ${statusStr}${errorMsg ? ` (${errorMsg})` : ""}`;

  // Create error instance with all context
  return new FetchError(message, {
    request: ctx.request,
    response: ctx.response,
    options: ctx.options,
    cause: ctx.error instanceof Error ? ctx.error : undefined,
  });
}

// Type guard to check if an error is a FetchError
export function isFetchError<T = unknown>(
  error: unknown
): error is FetchError<T> {
  return error instanceof FetchError;
}

// Helper to create a typed fetch error
export function createTypedFetchError<T>(
  message: string,
  init?: ConstructorParameters<typeof FetchError>[1]
): FetchError<T> {
  return new FetchError<T>(message, init);
}
