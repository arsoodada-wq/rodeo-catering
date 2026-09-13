import { describe, expect, it, vi, beforeEach } from "vitest";

const requirePermission = vi.fn();
vi.mock("@/lib/permissions", () => ({
  PERMISSIONS: { CONTENT_MANAGE: "content.manage" },
  requirePermission: (...args: unknown[]) => requirePermission(...args),
}));

const create = vi.fn();
vi.mock("@/lib/db", () => ({ db: { media: { create: (...args: unknown[]) => create(...args) } } }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { uploadMedia } from "./media";

function fileOf(bytes: number, type = "image/png", name = "test.png") {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("uploadMedia", () => {
  beforeEach(() => {
    requirePermission.mockReset();
    requirePermission.mockResolvedValue({ ok: true });
    create.mockReset();
    create.mockResolvedValue({ id: "media-1" });
  });

  it("rejects without CONTENT_MANAGE permission, before touching the database", async () => {
    requirePermission.mockResolvedValue({ ok: false, error: "You don't have permission to do this." });
    const formData = new FormData();
    formData.set("file", fileOf(100));
    const res = await uploadMedia(formData);
    expect(res.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a disallowed file type", async () => {
    const formData = new FormData();
    formData.set("file", fileOf(100, "application/pdf", "test.pdf"));
    const res = await uploadMedia(formData);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/JPEG, PNG, WebP, GIF, or SVG/);
  });

  it("rejects a file over the 4MB limit", async () => {
    const formData = new FormData();
    formData.set("file", fileOf(4 * 1024 * 1024 + 1));
    const res = await uploadMedia(formData);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/4MB/);
  });

  it("rejects when no file is provided", async () => {
    const res = await uploadMedia(new FormData());
    expect(res.ok).toBe(false);
  });

  it("encodes a valid image as a data: URI and creates the Media row", async () => {
    const formData = new FormData();
    formData.set("file", fileOf(100, "image/png", "photo.png"));
    formData.set("altText", "A photo");

    const res = await uploadMedia(formData);

    expect(res.ok).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
    const data = create.mock.calls[0][0].data;
    expect(data.filename).toBe("photo.png");
    expect(data.altText).toBe("A photo");
    expect(data.url).toMatch(/^data:image\/png;base64,/);
    expect(data.sizeBytes).toBe(100);
  });
});
