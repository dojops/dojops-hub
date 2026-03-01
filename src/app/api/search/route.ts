import { NextRequest, NextResponse } from "next/server";
import { searchPackages } from "@/lib/search";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`search:${ip}`, RATE_LIMITS.search);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ packages: [], total: 0 });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 20));

  const result = await searchPackages(query, { page, pageSize: limit });
  return NextResponse.json({
    packages: result.packages,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: Math.ceil(result.total / result.pageSize),
  });
}
