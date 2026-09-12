"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2 } from "lucide-react";
import { updateOutreachContact, deleteOutreachContact } from "@/app/actions/outreach";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { OUTREACH_STATUS_LABELS } from "@/lib/status";
import { cn } from "@/lib/cn";

const STATUSES = [
  "PROSPECT",
  "CONTACTED",
  "RESPONDED",
  "INTERESTED",
  "LINK_ACQUIRED",
  "NOT_INTERESTED",
  "FOLLOW_UP",
] as const;

type Props = {
  id: string;
  organization: string;
  website: string | null;
  category: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  backlinkUrl: string | null;
  notes: string | null;
};

export function OutreachContactEditor(contact: Props) {
  const [organization, setOrganization] = useState(contact.organization);
  const [website, setWebsite] = useState(contact.website ?? "");
  const [category, setCategory] = useState(contact.category ?? "");
  const [contactName, setContactName] = useState(contact.contactName ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [status, setStatus] = useState(contact.status);
  const [backlinkUrl, setBacklinkUrl] = useState(contact.backlinkUrl ?? "");
  const [notes, setNotes] = useState(contact.notes ?? "");

  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateOutreachContact({
        id: contact.id,
        organization,
        website,
        category,
        contactName,
        email,
        phone,
        status: status as (typeof STATUSES)[number],
        backlinkUrl,
        notes,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteOutreachContact({ id: contact.id });
      if (res.ok) {
        showToast("Contact deleted.", "success");
        router.push("/admin/outreach");
      } else {
        setError(res.error);
        showToast(res.error, "error");
        setConfirmOpen(false);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Organization
          </label>
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Category (optional)
          </label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Website (optional)
          </label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input mt-1">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {OUTREACH_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Contact name (optional)
          </label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Email (optional)
          </label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Phone (optional)
          </label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input mt-1" />
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Backlink URL (optional)
      </label>
      <input
        value={backlinkUrl}
        onChange={(e) => setBacklinkUrl(e.target.value)}
        placeholder="Once they've linked back to the site"
        className="input mt-1"
      />

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Notes (optional)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="input mt-1 resize-none"
      />

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete contact
        </button>
        <button
          onClick={save}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
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
      {error && <p className="mt-2 text-right text-xs text-rodeo-600">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this contact?"
        description="This also deletes its logged activity history. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
