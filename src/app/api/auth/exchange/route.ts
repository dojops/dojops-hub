import { NextResponse } from "next/server";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:3000";

// Validate API_INTERNAL_URL at startup so a misconfigured env var cannot be used
// as an SSRF vector. Only http://localhost and https://*.dojops.ai are allowed.
function validateIssuerUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`API_INTERNAL_URL is not a valid URL: ${raw}`);
  }
  const isLocalhost =
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
  const isDojopsApi = parsed.protocol === "https:" && parsed.hostname.endsWith(".dojops.ai");
  // Allow Docker Compose internal service name (http://api:3000)
  const isDockerInternal = parsed.protocol === "http:" && parsed.hostname === "api";
  if (!isLocalhost && !isDojopsApi && !isDockerInternal) {
    throw new Error(
      `API_INTERNAL_URL "${raw}" is not an allowed issuer. Must be http://localhost or https://*.dojops.ai`,
    );
  }
  // Strip any trailing slash for consistent path joining
  return parsed;
}

const ISSUER_URL = validateIssuerUrl(API_INTERNAL_URL);

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing authorization code." }, { status: 400 });
    }

    // Guard: reject suspiciously large codes before forwarding server-to-server
    if (code.length > 2048) {
      return NextResponse.json({ error: "Invalid authorization code." }, { status: 400 });
    }

    // Exchange auth code with the central API (server-to-server).
    // ISSUER_URL is validated at module load — not interpolated from user input.
    const exchangeUrl = new URL("/auth/exchange", ISSUER_URL).toString();
    const res = await fetch(exchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Authentication failed." },
        { status: res.status },
      );
    }

    return NextResponse.json({
      accessToken: data.accessToken,
      user: data.user,
    });
  } catch {
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
