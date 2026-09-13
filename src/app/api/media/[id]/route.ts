import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasPageAccess(PERMISSIONS.CONTENT_MANAGE))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const media = await db.media.findUnique({
      where: { id },
      select: { id: true, filename: true, url: true, altText: true },
    });
    if (!media) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }
}
