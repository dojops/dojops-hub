import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/mailer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT = { maxRequests: 5, windowMs: 3_600_000 }; // 5/hour per IP

const subscribeSchema = z.object({
  email: z.string().email().max(254),
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "https://dojops.ai",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders();

  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(`newsletter:${ip}`, RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers },
    );
  }

  // Validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400, headers },
    );
  }

  const { email } = parsed.data;

  // Upsert subscriber (idempotent — re-subscribing is a no-op)
  const existing = await prisma.subscriber.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ message: "You're already subscribed!" }, { status: 200, headers });
  }

  await prisma.subscriber.create({ data: { email } });

  // Send welcome email (best-effort — don't fail the request)
  try {
    await sendWelcomeEmail(email);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  return NextResponse.json({ message: "Successfully subscribed!" }, { status: 201, headers });
}
