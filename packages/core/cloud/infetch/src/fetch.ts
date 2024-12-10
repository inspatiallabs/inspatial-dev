import { createFetchError } from "./error.ts";
import {
  isPayloadMethod,
  isJSONSerializable,
  detectResponseType,
  resolveFetchOptions,
  callHooks,
} from "./helpers.ts";

import type {
  CreateFetchOptions,
  FetchResponse,
  ResponseType,
  FetchContext,
  $Fetch,
  FetchRequest,
  FetchOptions,
} from "./types.ts";

/** Standard HTTP status codes that trigger automatic retry attempts */
const retryStatusCodes = new Set([
  408, // Request Timeout
  409, // Conflict
  425, // Too Early
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

/** Status codes that should have no response body according to HTTP spec */
const nullBodyResponses = new Set([101, 204, 205, 304]);

/**
 * Safely parse JSON with error handling
 * @param str - JSON string to parse
 * @returns Parsed JSON object or original string if parsing fails
 */
function safeJSONParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

/**
 * Join base URL with path
 * @param base - Base URL
 * @param path - Path to join
 * @returns Complete URL
 */
function joinURL(base: string, path: string): string {
  return new URL(path, base).toString();
}

/**
 * Append query parameters to URL
 * @param url - Base URL
 * @param params - Query parameters
 * @returns URL with appended query parameters
 */
function appendQueryParams(url: string, params: Record<string, any>): string {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, String(value));
  });
  return urlObj.toString();
}

/**
 * Create a customized fetch instance with global options
 * @param globalOptions - Global configuration options
 * @returns Configured fetch instance
 */
export function createFetch(globalOptions: CreateFetchOptions = {}): $Fetch {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController,
  } = globalOptions;

  /**
   * Handle fetch errors and implement retry logic
   * @param context - Fetch context
   * @returns Fetch response or throws error
   */
  async function onError(context: FetchContext): Promise<FetchResponse<any>> {
    const isAbort =
      (context.error?.name === "AbortError" && !context.options.timeout) ||
      false;

    if (context.options.retry !== false && !isAbort) {
      const retries =
        typeof context.options.retry === "number"
          ? context.options.retry
          : isPayloadMethod(context.options.method)
            ? 0
            : 1;

      const responseCode = context.response?.status || 500;
      if (
        retries > 0 &&
        (Array.isArray(context.options.retryStatusCodes)
          ? context.options.retryStatusCodes.includes(responseCode)
          : retryStatusCodes.has(responseCode))
      ) {
        const retryDelay =
          typeof context.options.retryDelay === "function"
            ? context.options.retryDelay(context)
            : context.options.retryDelay || 0;

        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }

        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1,
        });
      }
    }

    const error = createFetchError(context);
    throw error;
  }

  /**
   * Raw fetch implementation with full response
   * @param request - Fetch request
   * @param options - Fetch options
   * @returns Fetch response
   */
  const $fetchRaw: $Fetch["raw"] = async function $fetchRaw<
    T = any,
    R extends ResponseType = "json",
  >(request: FetchRequest, options: FetchOptions<R> = {}) {
    const context: FetchContext = {
      request,
      options: resolveFetchOptions<R, T>(
        request,
        options,
        globalOptions.defaults as FetchOptions<R, T>,
        Headers
      ),
      response: undefined,
      error: undefined,
    };

    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }

    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }

    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = joinURL(context.options.baseURL, context.request);
      }
      if (context.options.query) {
        context.request = appendQueryParams(
          context.request,
          context.options.query
        );
      }
    }

    // Clean up options
    delete context.options.query;
    delete context.options.params;

    // Handle body serialization
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body =
          typeof context.options.body === "string"
            ? context.options.body
            : JSON.stringify(context.options.body);

        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        context.options.body instanceof ReadableStream ||
        "pipe" in context.options.body
      ) {
        context.options.duplex = "half";
      }
    }

    // Handle timeout
    let abortTimeout: number | undefined;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }

    try {
      context.response = await fetch(
        context.request,
        context.options as RequestInit
      );
    } catch (error) {
      context.error = error as Error;
      if (context.options.onRequestError) {
        await callHooks(
          context as FetchContext & { error: Error },
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }

    // Handle response body
    const hasBody =
      context.response.body &&
      !nullBodyResponses.has(context.response.status) &&
      context.options.method !== "HEAD";

    if (hasBody) {
      const responseType =
        (context.options.parseResponse
          ? "json"
          : context.options.responseType) ||
        detectResponseType(context.response.headers.get("content-type") || "");

      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || safeJSONParse;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }

    if (context.options.onResponse) {
      await callHooks(
        context as FetchContext & { response: FetchResponse<any> },
        context.options.onResponse
      );
    }

    if (
      !context.options.ignoreResponseError &&
      context.response.status >= 400 &&
      context.response.status < 600
    ) {
      if (context.options.onResponseError) {
        await callHooks(
          context as FetchContext & { response: FetchResponse<any> },
          context.options.onResponseError
        );
      }
      return await onError(context);
    }

    return context.response;
  };

  /**
   * Main fetch implementation that returns response data
   * @param request - Fetch request
   * @param options - Fetch options
   * @returns Response data
   */
  const $fetch = async function $fetch(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  } as $Fetch;

  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);

  /**
   * Create a new fetch instance with custom defaults
   * @param defaultOptions - Default options for new instance
   * @param customGlobalOptions - Global options for new instance
   * @returns New fetch instance
   */
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) =>
    createFetch({
      ...globalOptions,
      ...customGlobalOptions,
      defaults: {
        ...globalOptions.defaults,
        ...customGlobalOptions.defaults,
        ...defaultOptions,
      },
    });

  return $fetch;
}

/**
 * Download a file using streaming
 * @param url - URL of file to download
 * @param filepath - Local path to save file
 * @returns Promise that resolves when download is complete
 */
export async function downloadFile(
  url: string,
  filepath: string,
  options: FetchOptions = {}
): Promise<void> {
  const response = await fetch(url, {
    ...options,
    headers: new Headers({
      ...options.headers,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download file: ${response.status} ${response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error("No response body available");
  }

  const file = await Deno.open(filepath, {
    write: true,
    create: true,
    truncate: true,
  });

  try {
    const reader = response.body.getReader();
    const writer = file.writable.getWriter();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
    }

    await writer.close();
  } finally {
    file.close();
  }
}

/**
 * Convert a Blob to an ArrayBuffer
 * @param blob - Blob to convert
 * @returns ArrayBuffer
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}
