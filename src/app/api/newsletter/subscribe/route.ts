import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailer";
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

function generateToken(): string {
  return randomBytes(32).toString("hex");
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

  // Uniform response to prevent email enumeration.
  // Regardless of email state, return the same message.
  const uniformResponse = NextResponse.json(
    { message: "Check your inbox to verify your subscription." },
    { status: 200, headers },
  );

  const existing = await prisma.subscriber.findUnique({ where: { email } });

  if (existing) {
    if (existing.status === "PENDING") {
      // Resend verification email (best-effort)
      try {
        await sendVerificationEmail(email, existing.verifyToken, existing.unsubscribeToken);
      } catch (err) {
        console.error("Failed to resend verification email:", err);
      }
    }
    if (existing.status === "UNSUBSCRIBED") {
      // Re-subscribe: reset to PENDING with fresh tokens
      const verifyToken = generateToken();
      const unsubscribeToken = generateToken();
      await prisma.subscriber.update({
        where: { email },
        data: {
          status: "PENDING",
          verified: false,
          verifyToken,
          unsubscribeToken,
          verifiedAt: null,
        },
      });
      try {
        await sendVerificationEmail(email, verifyToken, unsubscribeToken);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    }
    // ACTIVE or BOUNCED: silently return — no information leak
    return uniformResponse;
  }

  // New subscriber
  const verifyToken = generateToken();
  const unsubscribeToken = generateToken();

  await prisma.subscriber.create({
    data: { email, verifyToken, unsubscribeToken },
  });

  try {
    await sendVerificationEmail(email, verifyToken, unsubscribeToken);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return uniformResponse;
}
