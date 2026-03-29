import { NextRequest, NextResponse } from "next/server";

// 301 redirect to dojops-api — kept for 90 days to support existing email links
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  return NextResponse.redirect(
    `https://api.dojops.ai/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
    301,
  );
}
