/**
 * The one place that turns a Media id into an og:image URL — every
 * generateMetadata that needs one calls this instead of building the path
 * inline, so the /api/media/[id]/raw route only has one caller to keep in
 * sync with. Returns a site-relative path; Next.js resolves it against the
 * root layout's `metadataBase` into an absolute URL for the meta tag.
 */
export function ogImagePath(mediaId: string | null | undefined): string | undefined {
  return mediaId ? `/api/media/${mediaId}/raw` : undefined;
}
