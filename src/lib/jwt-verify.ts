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
  const raw = process.env.ED25519_PUBLIC_KEY;
  if (!raw) return null;
  // .env files store PEM keys with literal \n — restore real newlines
  const pem = raw.replace(/\\n/g, "\n");
  _publicKey = createPublicKey({ key: pem, format: "pem", type: "spki" });
  return _publicKey;
}

function base64urlDecode(encoded: string): Buffer {
  let padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4 !== 0) padded += "=";
  return Buffer.from(padded, "base64");
}

// Expected issuer and audience for Hub tokens.
// The issuer is the public API URL (what the API signs into JWTs via API_PUBLIC_URL).
// API_INTERNAL_URL is the Docker internal URL for server-to-server calls, not for JWT validation.
const EXPECTED_ISSUER = process.env.API_PUBLIC_URL || "https://api.dojops.ai";
const EXPECTED_AUDIENCE = ["hub.dojops.ai", "console.dojops.ai", "api.dojops.ai"];

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

  // Reject expired tokens
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

  // Validate issuer — prevents tokens from other deployments being replayed here
  if (payload.iss !== EXPECTED_ISSUER) return null;

  // Validate audience — token must include at least one expected audience
  if (!Array.isArray(payload.aud) || !payload.aud.some((a) => EXPECTED_AUDIENCE.includes(a)))
    return null;

  return payload;
}
