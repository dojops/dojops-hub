import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The verifyAccessToken function is tested here at the boundary level.
// Full signature verification requires a real Ed25519 key pair; those paths
// are covered in integration tests. These unit tests focus on the structural
// checks (prefix, part count, expiry, iss, aud) that run before or after the
// signature step using a stubbed public-key verify so we can control outcomes.

// Stub node:crypto before importing the module under test
vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return {
    ...actual,
    // createPublicKey — return a dummy object so getPublicKey() succeeds
    createPublicKey: vi.fn(() => ({ type: "public" })),
    // verify — default stub returns true (valid signature); tests override as needed
    verify: vi.fn(() => true),
  };
});

import { verifyAccessToken } from "../jwt-verify";
import { verify } from "node:crypto";

const mockVerify = vi.mocked(verify);
function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = Buffer.from("fakesig").toString("base64url");
  return `dojops_auth_${header}.${body}.${sig}`;
}

const futureExp = Math.floor(Date.now() / 1000) + 3600;
const pastExp = Math.floor(Date.now() / 1000) - 1;

const basePayload = {
  sub: "user-1",
  email: "user@example.com",
  name: "Test User",
  username: "testuser",
  avatarUrl: null,
  role: "USER",
  iss: "http://localhost:3000",
  aud: ["hub"],
  iat: Math.floor(Date.now() / 1000),
  exp: futureExp,
};

afterEach(() => {
  vi.clearAllMocks();
  // Reset process.env side-effects between tests
  delete process.env.AUTH_ISSUER_URL;
  delete process.env.ED25519_PUBLIC_KEY;
});

describe("verifyAccessToken — structural guards", () => {
  it("returns null for tokens without the dojops_auth_ prefix", () => {
    expect(verifyAccessToken("Bearer eyJhbGciOiJFZERTQSJ9.payload.sig")).toBeNull();
  });

  it("returns null for tokens with fewer than 3 parts", () => {
    expect(verifyAccessToken("dojops_auth_header.payload")).toBeNull();
  });

  it("returns null when the public key env var is missing", () => {
    // ED25519_PUBLIC_KEY is not set so getPublicKey() returns null
    // before ever calling createPublicKey.
    expect(verifyAccessToken(makeToken(basePayload))).toBeNull();
  });
});

describe("verifyAccessToken — signature rejection", () => {
  // Provide a dummy PEM so getPublicKey() reaches createPublicKey (mocked)
  // and these tests actually exercise the signature verification path.
  beforeEach(() => {
    process.env.ED25519_PUBLIC_KEY =
      "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA\n-----END PUBLIC KEY-----";
  });

  it("returns null when the signature is invalid", () => {
    mockVerify.mockReturnValueOnce(false);
    expect(verifyAccessToken(makeToken(basePayload))).toBeNull();
  });

  it("returns null when verify throws", () => {
    mockVerify.mockImplementationOnce(() => {
      throw new Error("invalid key");
    });
    expect(verifyAccessToken(makeToken(basePayload))).toBeNull();
  });
});

describe("verifyAccessToken — expiry check", () => {
  beforeEach(() => {
    process.env.ED25519_PUBLIC_KEY =
      "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA\n-----END PUBLIC KEY-----";
  });

  it("returns null for expired tokens", () => {
    const token = makeToken({ ...basePayload, exp: pastExp });
    expect(verifyAccessToken(token)).toBeNull();
  });

  it("accepts tokens with a future exp", () => {
    const token = makeToken(basePayload);
    expect(verifyAccessToken(token)).not.toBeNull();
  });
});

describe("verifyAccessToken — iss claim", () => {
  beforeEach(() => {
    process.env.ED25519_PUBLIC_KEY =
      "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA\n-----END PUBLIC KEY-----";
  });

  it("returns null when iss does not match AUTH_ISSUER_URL", () => {
    const token = makeToken({ ...basePayload, iss: "https://evil.example.com" });
    expect(verifyAccessToken(token)).toBeNull();
  });

  it("accepts a token whose iss matches the default issuer", () => {
    // Default is http://localhost:3000 when AUTH_ISSUER_URL is not set
    const token = makeToken(basePayload);
    expect(verifyAccessToken(token)).not.toBeNull();
  });
});

describe("verifyAccessToken — aud claim", () => {
  beforeEach(() => {
    process.env.ED25519_PUBLIC_KEY =
      "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA\n-----END PUBLIC KEY-----";
  });

  it("returns null when aud is not an array", () => {
    const token = makeToken({ ...basePayload, aud: "hub" });
    expect(verifyAccessToken(token)).toBeNull();
  });

  it("returns null when aud array does not contain 'hub'", () => {
    const token = makeToken({ ...basePayload, aud: ["console"] });
    expect(verifyAccessToken(token)).toBeNull();
  });

  it("accepts a token whose aud includes 'hub'", () => {
    const token = makeToken({ ...basePayload, aud: ["hub", "console"] });
    expect(verifyAccessToken(token)).not.toBeNull();
  });
});
