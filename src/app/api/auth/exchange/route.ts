import { NextResponse } from "next/server";

const AUTH_ISSUER_URL = process.env.AUTH_ISSUER_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing authorization code." }, { status: 400 });
    }

    // Exchange auth code with the central API (server-to-server)
    const res = await fetch(`${AUTH_ISSUER_URL}/auth/exchange`, {
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
