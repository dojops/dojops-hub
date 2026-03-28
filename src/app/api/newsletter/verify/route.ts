import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function htmlPage(title: string, message: string, success: boolean): string {
  const color = success ? "#34d399" : "#f87171";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — DojOps</title></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;max-width:420px;padding:40px">
    <img src="/dojops-new-logo.png" width="64" height="64" alt="DojOps" style="border-radius:12px;margin-bottom:24px">
    <h1 style="font-size:24px;color:${color};margin:0 0 12px">${title}</h1>
    <p style="font-size:15px;color:#7b8ba3;line-height:1.6;margin:0 0 24px">${message}</p>
    <a href="https://dojops.ai" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">
      Visit DojOps
    </a>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (token?.length !== 64) {
    return new NextResponse(htmlPage("Invalid Link", "This verification link is invalid.", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { verifyToken: token },
  });

  if (!subscriber) {
    return new NextResponse(
      htmlPage("Invalid Link", "This verification link is invalid or has expired.", false),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (subscriber.verified) {
    return new NextResponse(
      htmlPage("Already Verified", "Your email is already verified. You're all set!", true),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { verified: true, status: "ACTIVE", verifiedAt: new Date() },
  });

  return new NextResponse(
    htmlPage(
      "Email Verified!",
      "Your subscription is confirmed. You'll receive updates on new DojOps releases.",
      true,
    ),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
