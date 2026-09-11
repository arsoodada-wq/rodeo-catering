"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open a Modal
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Example Modal">
        <p className="text-sm text-ink-600">
          This is a generic modal — any content can go here. It closes on Escape, on clicking
          outside, or via the close button.
        </p>
      </Modal>

      <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
        Open a Confirm Dialog
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this item?"
        description="This is the pattern admin screens use for delete confirmations, replacing the browser's built-in confirm() popup."
        confirmLabel="Delete"
        pending={confirmPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmPending(true);
          setTimeout(() => {
            setConfirmPending(false);
            setConfirmOpen(false);
            showToast("Item deleted.", "success");
          }, 700);
        }}
      />
    </div>
  );
}

export function ToastDemo() {
  const { showToast } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary" onClick={() => showToast("Saved successfully.", "success")}>
        Trigger success toast
      </Button>
      <Button variant="ghost" onClick={() => showToast("Something went wrong.", "error")}>
        Trigger error toast
      </Button>
      <Button variant="ghost" onClick={() => showToast("Here's some information.", "info")}>
        Trigger info toast
      </Button>
    </div>
  );
}
