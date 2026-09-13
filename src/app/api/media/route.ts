import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

/**
 * Backs MediaPicker's client-side fetch — an admin-only JSON listing, not a
 * public endpoint. Returns every field the picker's thumbnail grid needs to
 * render, including the data: URI `url` itself — fine at this app's actual
 * media scale (a few dozen images at most), not something to over-optimize
 * for a volume this business doesn't have.
 */
export async function GET() {
  if (!(await hasPageAccess(PERMISSIONS.CONTENT_MANAGE))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const media = await db.media.findMany({
      orderBy: { uploadedAt: "desc" },
      select: { id: true, filename: true, url: true, altText: true },
    });
    return NextResponse.json({ media });
  } catch {
    return NextResponse.json({ error: "Database not connected." }, { status: 503 });
  }
}
