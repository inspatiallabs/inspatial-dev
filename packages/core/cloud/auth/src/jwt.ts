import { JWTPayload, jwtVerify, KeyLike, SignJWT } from "jose";

export function createJWT(
  payload: JWTPayload,
  algorithm: string,
  privateKey: KeyLike
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm, typ: "JWT", kid: "inspatial-auth" })
    .sign(privateKey);
}

export function verifyJWT<T>(token: string, publicKey: KeyLike) {
  return jwtVerify<T>(token, publicKey);
}
