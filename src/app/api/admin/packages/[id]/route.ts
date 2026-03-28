import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

// PATCH /api/admin/packages/:id — moderate package
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(req);
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!["ACTIVE", "FLAGGED", "REMOVED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const pkg = await prisma.package.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, slug: true, status: true, updatedAt: true },
    });
    return NextResponse.json(pkg);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    throw err;
  }
}
