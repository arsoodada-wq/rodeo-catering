"use client";

import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {description && <p className="text-sm text-ink-500">{description}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={pending}
          className="rounded-full px-4 py-2 text-sm font-semibold text-ink-500 hover:text-ink-800 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={pending}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50",
            danger ? "bg-rodeo-500 hover:bg-rodeo-600" : "bg-ink-900 hover:bg-ink-800"
          )}
        >
          {pending ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
