import { Button } from "@/components/ui/Button";
import type { PageBlock } from "@/lib/page-blocks";

type MediaLookup = Record<string, { url: string; altText: string | null } | undefined>;

export function PageBlocks({ blocks, media }: { blocks: PageBlock[]; media: MediaLookup }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return block.level === "h2" ? (
              <h2 key={i} className="text-2xl font-extrabold tracking-tight text-ink-900">
                {block.text}
              </h2>
            ) : (
              <h3 key={i} className="text-xl font-extrabold tracking-tight text-ink-900">
                {block.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={i} className="text-ink-600">
                {block.text}
              </p>
            );
          case "image": {
            const item = media[block.mediaId];
            if (!item) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element -- data: URI, not an optimizable asset
              <img
                key={i}
                src={item.url}
                alt={item.altText ?? ""}
                className="w-full rounded-2xl object-cover"
              />
            );
          }
          case "button":
            return (
              <Button key={i} href={block.href} size="lg">
                {block.label}
              </Button>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
