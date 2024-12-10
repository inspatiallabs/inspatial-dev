import type {
  FetchContext,
  FetchHook,
  FetchOptions,
  FetchRequest,
  ResolvedFetchOptions,
  ResponseType,
} from "./types.ts";

// ----------------------------------------
// Constants
// ----------------------------------------

const preferedPayloadSyntaxMethods = Object.freeze({
  CREATE: "POST",
  READ: "GET",
  UPDATE: {
    FULL: "PUT",
    PARTIAL: "PATCH",
  },
  DELETE: "DELETE",
} as const);

const payloadMethods = new Set<string>([
  preferedPayloadSyntaxMethods.CREATE,
  preferedPayloadSyntaxMethods.UPDATE.FULL,
  preferedPayloadSyntaxMethods.UPDATE.PARTIAL,
  preferedPayloadSyntaxMethods.DELETE,
]);

const textTypes = new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html",
]);

const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;

// ----------------------------------------
// Helper Functions
// ----------------------------------------

/**
 * Checks if the HTTP method supports payload
 */
export function isPayloadMethod(method = "GET"): boolean {
  return payloadMethods.has(method.toUpperCase());
}

/**
 * Determines if a value can be serialized to JSON
 */
export function isJSONSerializable(value: unknown): boolean {
  if (value === undefined) return false;

  const type = typeof value;

  if (
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    value === null
  ) {
    return true;
  }

  if (type !== "object") {
    return false; // bigint, function, symbol, undefined
  }

  if (Array.isArray(value)) return true;
  if ("buffer" in value) return false;

  return (
    (value.constructor && value.constructor.name === "Object") ||
    "toJSON" in value
  );
}

/**
 * Detects appropriate response type based on Content-Type header
 */
export function detectResponseType(contentType = ""): ResponseType {
  if (!contentType) return "json";

  const baseContentType = contentType.split(";")[0];

  if (JSON_RE.test(baseContentType)) return "json";
  if (textTypes.has(baseContentType) || baseContentType.startsWith("text/"))
    return "text";

  return "blob";
}

/**
 * Merges headers from input and defaults
 */
function mergeHeaders(
  input: HeadersInit | undefined,
  defaults: HeadersInit | undefined,
  Headers: typeof Headers
): Headers {
  if (!defaults) return new Headers(input);

  const headers = new Headers(defaults);

  if (!input) return headers;

  const inputHeaders =
    Symbol.iterator in input || Array.isArray(input)
      ? input
      : new Headers(input);

  for (const [key, value] of inputHeaders) {
    headers.set(key, value);
  }

  return headers;
}

/**
 * Resolves fetch options by merging defaults with input
 */
export function resolveFetchOptions<
  R extends ResponseType = ResponseType,
  T = unknown,
>(
  request: FetchRequest,
  input?: FetchOptions<R, T>,
  defaults?: FetchOptions<R, T>,
  Headers: typeof globalThis.Headers
): ResolvedFetchOptions<R, T> {
  const headers = mergeHeaders(
    input?.headers ?? (request as Request)?.headers,
    defaults?.headers,
    Headers
  );

  const query = {
    ...defaults?.params,
    ...defaults?.query,
    ...input?.params,
    ...input?.query,
  };

  return {
    ...defaults,
    ...input,
    query: Object.keys(query).length ? query : undefined,
    params: Object.keys(query).length ? query : undefined,
    headers,
  };
}

/**
 * Executes fetch hooks sequentially
 */
export async function callHooks<C extends FetchContext = FetchContext>(
  context: C,
  hooks?: FetchHook<C> | FetchHook<C>[]
): Promise<void> {
  if (!hooks) return;

  if (Array.isArray(hooks)) {
    for (const hook of hooks) {
      await hook(context);
    }
    return;
  }

  await hooks(context);
}

/**
 * Extended Response type with guaranteed ReadableStream body
 */
export interface StreamResponse extends Response {
  body: ReadableStream<Uint8Array>;
}

/**
 * Type guard to check if a value is a ReadableStream
 * @param value - Value to check
 * @returns True if value is a ReadableStream
 */
export function isReadableStream(value: unknown): value is ReadableStream {
  return (
    value instanceof ReadableStream ||
    (typeof value === "object" && value !== null && "getReader" in value)
  );
}

/**
 * Creates a new Headers object with proper type handling
 * @param init - Initial headers data
 * @returns New Headers object
 */
export function createHeaders(init?: HeadersInit): Headers {
  const headers = new Headers();

  if (!init) return headers;

  if (init instanceof Headers) {
    init.forEach((value, key) => headers.set(key, value));
    return headers;
  }

  if (Array.isArray(init)) {
    init.forEach(([key, value]) => headers.set(key, value));
    return headers;
  }

  Object.entries(init).forEach(([key, value]) => headers.set(key, value));
  return headers;
}

/**
 * Resolves a URL with optional base URL
 * @param input - URL or URL string to resolve
 * @param base - Optional base URL
 * @returns Resolved URL object
 * @throws TypeError if URL is invalid
 */
export function resolveURL(input: string | URL, base?: string | URL): URL {
  try {
    if (base) {
      return new URL(input, base);
    }
    return new URL(input);
  } catch (error) {
    throw new TypeError(`Invalid URL: ${error.message}`);
  }
}
