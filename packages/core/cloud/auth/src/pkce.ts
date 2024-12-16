import { encodeBase64 } from "@inspatial/util";

/**
 * @module PKCE
 * @description Implementation of Proof Key for Code Exchange (PKCE) for OAuth 2.0
 * PKCE (Proof Key for Code Exchange) is a security extension for OAuth 2.0 that prevents authorization code interception attacks. This implementation provides utilities for generating and validating PKCE challenges.
 */

/**
 * Converts a standard Base64 string to a URL-safe Base64 string.
 * Replaces '+' with '-', '/' with '_', and removes padding '=' characters.
 *
 * @param {string} str - The Base64 string to convert
 * @returns {string} URL-safe Base64 string
 *
 * @example
 * const safe = toBase64URL('abc+/=');
 * console.log(safe); // 'abc-_'
 */
function toBase64URL(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generates a cryptographically secure random verifier string.
 *
 * @param {number} length - The desired length of the verifier
 * @returns {string} Base64URL-encoded random string
 * @throws {Error} If crypto.getRandomValues is not available
 *
 * @example
 * const verifier = generateVerifier(64);
 * // Returns random string like: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
 */
function generateVerifier(length: number): string {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return toBase64URL(encodeBase64(buffer));
}

/**
 * Generates a challenge from a verifier using the specified method.
 *
 * @param {string} verifier - The PKCE verifier string
 * @param {"S256" | "plain"} method - The challenge method to use
 * @returns {Promise<string>} The generated challenge
 *
 * @example
 * const challenge = await generateChallenge(verifier, "S256");
 */
async function generateChallenge(
  verifier: string,
  method: "S256" | "plain"
): Promise<string> {
  if (method === "plain") return verifier;

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toBase64URL(encodeBase64(new Uint8Array(hash)));
}

/**
 * Generates a PKCE verifier and challenge pair.
 *
 * @param {number} [length=64] - Length of the verifier (must be between 43 and 128)
 * @returns {Promise<PKCEPair>} Object containing verifier, challenge, and method
 * @throws {Error} If length is not between 43 and 128
 *
 * @example
 * // Generate PKCE pair with default length
 * const { verifier, challenge, method } = await generatePKCE();
 *
 * @example
 * // Generate PKCE pair with custom length
 * const pkce = await generatePKCE(96);
 * console.log(pkce);
 * // {
 * //   verifier: "random-string...",
 * //   challenge: "base64url-encoded-hash...",
 * //   method: "S256"
 * // }
 *
 * @example
 * // Using in OAuth flow
 * async function initiateOAuth() {
 *   const pkce = await generatePKCE();
 *   sessionStorage.setItem('pkce_verifier', pkce.verifier);
 *
 *   const authUrl = new URL('https://auth-server.com/authorize');
 *   authUrl.searchParams.set('code_challenge', pkce.challenge);
 *   authUrl.searchParams.set('code_challenge_method', pkce.method);
 *   // Add other OAuth parameters...
 *
 *   window.location.href = authUrl.toString();
 * }
 */
export async function generatePKCE(length: number = 64) {
  if (length < 43 || length > 128) {
    throw new Error(
      "Code verifier length must be between 43 and 128 characters"
    );
  }

  const verifier = generateVerifier(length);
  const challenge = await generateChallenge(verifier, "S256");

  return {
    verifier,
    challenge,
    method: "S256" as const,
  };
}

/**
 * Validates that a PKCE verifier matches its challenge.
 *
 * @param {string} verifier - The PKCE verifier to validate
 * @param {string} challenge - The challenge to validate against
 * @param {"S256" | "plain"} [method="S256"] - The challenge method used
 * @returns {Promise<boolean>} True if verifier matches challenge
 *
 * @example
 * // Validate during token exchange
 * async function exchangeCode(authCode) {
 *   const verifier = sessionStorage.getItem('pkce_verifier');
 *   const isValid = await validatePKCE(verifier, originalChallenge);
 *
 *   if (isValid) {
 *     // Exchange code for token...
 *   }
 * }
 *
 * @example
 * // Basic validation
 * const pkce = await generatePKCE();
 * const isValid = await validatePKCE(pkce.verifier, pkce.challenge);
 * console.log(isValid); // true
 */
export async function validatePKCE(
  verifier: string,
  challenge: string,
  method: "S256" | "plain" = "S256"
): Promise<boolean> {
  const generatedChallenge = await generateChallenge(verifier, method);
  return generatedChallenge === challenge;
}

/**
 * @typedef {Object} PKCEPair
 * @property {string} verifier - The random verifier string
 * @property {string} challenge - The generated challenge
 * @property {"S256"} method - The challenge method used
 */
