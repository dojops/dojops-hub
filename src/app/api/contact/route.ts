import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/mailer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT_IP = { maxRequests: 3, windowMs: 3_600_000 }; // 3/hour per IP
const RATE_LIMIT_EMAIL = { maxRequests: 5, windowMs: 86_400_000 }; // 5/day per email

const contactSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .transform((s) => s.replaceAll(/[\r\n]+/g, " ")),
  email: z.string().email().max(254),
  company: z.string().max(100).optional().default(""),
  subject: z
    .string()
    .min(1)
    .max(200)
    .transform((s) => s.replaceAll(/[\r\n]+/g, " ")),
  message: z.string().min(1).max(5000),
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

  // In-memory rate limit (per IP)
  const ip = getClientIp(req);
  const rl = checkRateLimit(`contact:${ip}`, RATE_LIMIT_IP);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your input and try again." },
      { status: 400, headers },
    );
  }

  const { name, email, company, subject, message } = parsed.data;

  // In-memory rate limit (per email)
  const emailRl = checkRateLimit(`contact:email:${email}`, RATE_LIMIT_EMAIL);
  if (!emailRl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers },
    );
  }

  // DB-backed rate limit (survives restarts, per IP)
  const recentCount = await prisma.contactMessage.count({
    where: {
      ip,
      createdAt: { gte: new Date(Date.now() - 3_600_000) },
    },
  });
  if (recentCount >= 3) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers },
    );
  }

  // Persist to database
  await prisma.contactMessage.create({
    data: { name, email, company: company || null, subject, message, ip },
  });

  // Send notification email (best-effort)
  try {
    await sendContactNotification({ name, email, company, subject, message });
  } catch (err) {
    console.error("Failed to send contact notification:", err);
  }

  return NextResponse.json(
    { message: "Message sent. We'll get back to you within 48 hours." },
    { status: 200, headers },
  );
}
