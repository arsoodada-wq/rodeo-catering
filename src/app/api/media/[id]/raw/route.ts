import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Deliberately public and unauthenticated, unlike /api/media/[id] — a
 * social-media crawler fetching an og:image has no admin session to send.
 * Media.url stores an uploaded image as a `data:` URI (see uploadMedia in
 * src/app/actions/media.ts), which a <meta property="og:image"> tag can't
 * point at directly since crawlers require a real fetchable URL — this
 * route decodes that URI back into raw bytes on request. Every image here
 * was uploaded through the admin's own Media Library for eventual public
 * use on the site, so serving it without auth doesn't loosen anything —
 * it's the same content already rendered directly into public page HTML.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let media: { url: string } | null = null;
  try {
    media = await db.media.findUnique({ where: { id }, select: { url: true } });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
  if (!media) return new NextResponse(null, { status: 404 });

  const match = /^data:([^;]+);base64,(.+)$/.exec(media.url);
  if (!match) return new NextResponse(null, { status: 404 });

  const [, contentType, base64] = match;
  const bytes = Buffer.from(base64, "base64");

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
