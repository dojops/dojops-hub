import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { sendReleaseNotification } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT = { maxRequests: 1, windowMs: 86_400_000 }; // 1/day
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000; // 1s between batches to avoid SMTP overload

const broadcastSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(50_000),
  version: z.string().optional(),
});

/** Verify HMAC-SHA256 webhook signature with constant-time comparison. */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const received = signature.slice(7); // strip "sha256=" prefix
  if (expected.length !== received.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  // ── Authentication: admin session/token OR HMAC webhook ──────────

  const rawBody = await req.text();
  let authenticated = false;

  // Path 1: HMAC webhook signature (from release workflow)
  const webhookSecret = process.env.BROADCAST_WEBHOOK_SECRET;
  const signature = req.headers.get("x-broadcast-signature");

  if (webhookSecret && signature) {
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
    authenticated = true;
  }

  // Path 2: Admin session or API token
  if (!authenticated) {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
  }

  // ── Rate limit (keyed globally, not per-user) ────────────────────

  const rl = checkRateLimit("broadcast:global", RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Broadcast limit reached. Max 1 per 24 hours." },
      { status: 429 },
    );
  }

  // ── Validate payload ─────────────────────────────────────────────

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { subject, body: emailBody } = parsed.data;

  // ── Send to verified + active subscribers ────────────────────────

  const subscribers = await prisma.subscriber.findMany({
    where: { status: "ACTIVE", verified: true },
    select: { email: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, message: "No active subscribers." });
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((sub) =>
        sendReleaseNotification(sub.email, subject, emailBody, sub.unsubscribeToken),
      ),
    );

    for (const r of results) {
      if (r.status === "fulfilled") sent++;
      else {
        failed++;
        console.error("Broadcast email failed:", r.reason);
      }
    }

    // Delay between batches (except the last one)
    if (i + BATCH_SIZE < subscribers.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`[broadcast] sent=${sent} failed=${failed} subject="${subject}"`);

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
