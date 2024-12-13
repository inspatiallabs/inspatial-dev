import { encodeBase64 } from "@inspatial/util";

function toBase64URL(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generateVerifier(length: number): string {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return toBase64URL(encodeBase64(buffer));
}

async function generateChallenge(verifier: string, method: "S256" | "plain") {
  if (method === "plain") return verifier;
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toBase64URL(encodeBase64(new Uint8Array(hash)));
}

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
    method: "S256",
  };
}

export async function validatePKCE(
  verifier: string,
  challenge: string,
  method: "S256" | "plain" = "S256"
) {
  const generatedChallenge = await generateChallenge(verifier, method);
  // timing safe equals?
  return generatedChallenge === challenge;
}
