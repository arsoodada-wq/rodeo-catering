"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { updateFaq, deleteFaq } from "@/app/actions/update-faq";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  question: string;
  answer: string;
  active: boolean;
};

export function FaqRow({ id, question, answer, active }: Props) {
  const [questionValue, setQuestionValue] = useState(question);
  const [answerValue, setAnswerValue] = useState(answer);
  const [activeValue, setActiveValue] = useState(active);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateFaq({
        id,
        question: questionValue,
        answer: answerValue,
        active: activeValue,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await deleteFaq({ id });
      if (res.ok) {
        setDeleted(true);
        showToast("FAQ deleted.", "success");
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
      setConfirmOpen(false);
    });
  }

  if (deleted) return null;

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        Question
      </label>
      <input
        value={questionValue}
        onChange={(e) => setQuestionValue(e.target.value)}
        className="input mt-1"
      />

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Answer
      </label>
      <textarea
        value={answerValue}
        onChange={(e) => setAnswerValue(e.target.value)}
        rows={3}
        className="input mt-1 resize-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={activeValue}
            onChange={(e) => setActiveValue(e.target.checked)}
          />
          Visible on site
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button
            onClick={save}
            disabled={pending}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              saved ? "bg-green-100 text-green-700" : "bg-rodeo-500 text-white hover:bg-rodeo-600",
              pending && "opacity-60"
            )}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this FAQ?"
        description="This removes it from the homepage and catering page. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
