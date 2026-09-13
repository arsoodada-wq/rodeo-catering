"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { BLOCK_TYPE_LABELS, emptyBlockOf, type PageBlock } from "@/lib/page-blocks";

const BLOCK_TYPES = Object.keys(BLOCK_TYPE_LABELS) as PageBlock["type"][];

export function PageBlockEditor({
  blocks,
  onChange,
}: {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}) {
  function updateBlock(index: number, block: PageBlock) {
    const next = [...blocks];
    next[index] = block;
    onChange(next);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addBlock(type: PageBlock["type"]) {
    onChange([...blocks, emptyBlockOf(type)]);
  }

  return (
    <div>
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div key={index} className="rounded-xl border border-ink-900/8 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                {BLOCK_TYPE_LABELS[block.type]}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-ink-400 hover:text-ink-700 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="rounded p-1 text-ink-400 hover:text-ink-700 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="rounded p-1 text-ink-400 hover:text-rodeo-600"
                  aria-label="Delete block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2">
              {block.type === "heading" && (
                <div className="flex gap-2">
                  <select
                    value={block.level}
                    onChange={(e) => updateBlock(index, { ...block, level: e.target.value as "h2" | "h3" })}
                    className="input w-24"
                  >
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>
                  <input
                    value={block.text}
                    onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                    placeholder="Heading text"
                    className="input flex-1"
                  />
                </div>
              )}

              {block.type === "paragraph" && (
                <textarea
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                  placeholder="Paragraph text"
                  rows={3}
                  className="input resize-none"
                />
              )}

              {block.type === "image" && (
                <MediaPicker
                  selectedId={block.mediaId || null}
                  onSelect={(id) => updateBlock(index, { ...block, mediaId: id ?? "" })}
                />
              )}

              {block.type === "button" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={block.label}
                    onChange={(e) => updateBlock(index, { ...block, label: e.target.value })}
                    placeholder="Button label"
                    className="input"
                  />
                  <input
                    value={block.href}
                    onChange={(e) => updateBlock(index, { ...block, href: e.target.value })}
                    placeholder="Link (e.g. /catering#builder)"
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {BLOCK_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="flex items-center gap-1 rounded-full border border-dashed border-ink-900/20 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:border-rodeo-300 hover:text-rodeo-600"
          >
            <Plus className="h-3.5 w-3.5" /> {BLOCK_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
