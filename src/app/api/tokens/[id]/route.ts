import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/tokens/:id — revoke a token
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify token belongs to the current user
  const token = await prisma.apiToken.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  if (token.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.apiToken.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
