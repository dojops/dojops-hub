import { NextRequest, NextResponse } from "next/server";
import { searchPackages } from "@/lib/search";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit(`search:${ip}`, RATE_LIMITS.search);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const raw = req.nextUrl.searchParams.get("q")?.trim();
  // Reject queries that are empty or longer than 200 characters to avoid
  // wasting resources on oversized inputs before they even reach the sanitizer.
  if (!raw) {
    return NextResponse.json({ packages: [], total: 0 });
  }
  const query = raw.slice(0, 200);

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 20));

  try {
    const result = await searchPackages(query, { page, pageSize: limit });
    return NextResponse.json({
      packages: result.packages,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize),
    });
  } catch {
    return NextResponse.json({ packages: [], total: 0, page, pageSize: limit, totalPages: 0 });
  }
}
