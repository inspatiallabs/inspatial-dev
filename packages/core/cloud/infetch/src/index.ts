/*#########################################################
# imports
#########################################################*/

import { createFetch } from "./fetch.ts";

/*#########################################################
# exports
#########################################################*/

export * from "./fetch.ts";
export * from "./error.ts";
export * from "./helpers.ts";
export type * from "./types.ts";

// Export global APIss
export const fetch = globalThis.fetch;
export const Headers = globalThis.Headers;
export const AbortController = globalThis.AbortController;

/*#########################################################
# Main fetch instance
#########################################################*/

/**
 * @description A modern fetch wrapper for Deno with streaming support, retries, and error handling
 * inFetch is experimental and may change in the future
 */
export const inFetch = createFetch({
  fetch,
  Headers,
  AbortController,
});

// Default export
export default inFetch;
