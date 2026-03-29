import { verify, createPublicKey, type KeyObject } from "node:crypto";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  iss: string;
  aud: string[];
  iat: number;
  exp: number;
}

let _publicKey: KeyObject | null = null;

function getPublicKey(): KeyObject | null {
  if (_publicKey) return _publicKey;
  const pem = process.env.ED25519_PUBLIC_KEY;
  if (!pem) return null;
  _publicKey = createPublicKey({ key: pem, format: "pem", type: "spki" });
  return _publicKey;
}

function base64urlDecode(encoded: string): Buffer {
  let padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4 !== 0) padded += "=";
  return Buffer.from(padded, "base64");
}

/** Verify a dojops_auth_ JWT using the Ed25519 public key. */
export function verifyAccessToken(token: string): JwtPayload | null {
  const prefix = "dojops_auth_";
  if (!token.startsWith(prefix)) return null;

  const body = token.slice(prefix.length);
  const parts = body.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  const pubKey = getPublicKey();
  if (!pubKey) return null;

  const signingInput = `${headerB64}.${payloadB64}`;

  let isValid: boolean;
  try {
    isValid = verify(
      null,
      Buffer.from(signingInput, "utf-8"),
      pubKey,
      base64urlDecode(signatureB64),
    );
  } catch {
    return null;
  }

  if (!isValid) return null;

  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString("utf-8")) as JwtPayload;
  } catch {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

  return payload;
}
