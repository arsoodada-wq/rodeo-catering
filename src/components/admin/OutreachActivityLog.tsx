"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { addOutreachActivity, deleteOutreachActivity } from "@/app/actions/outreach";
import { useToast } from "@/components/ui/ToastProvider";

type Activity = {
  id: string;
  type: string;
  date: Date | string;
  notes: string | null;
  response: string | null;
  followUpDate: Date | string | null;
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function OutreachActivityLog({
  outreachContactId,
  activities,
}: {
  outreachContactId: string;
  activities: Activity[];
}) {
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [response, setResponse] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await addOutreachActivity({ outreachContactId, type, notes, response, followUpDate });
      if (res.ok) {
        setType("");
        setNotes("");
        setResponse("");
        setFollowUpDate("");
        showToast("Activity logged.", "success");
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteOutreachActivity({ id, outreachContactId });
      if (!res.ok) showToast(res.error, "error");
    });
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">Activity Log</h2>

      <div className="mt-3 space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="rounded-xl border border-ink-900/8 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {activity.type} <span className="font-normal text-ink-400">· {formatDate(activity.date)}</span>
                </p>
                {activity.notes && <p className="mt-1 text-sm text-ink-600">{activity.notes}</p>}
                {activity.response && (
                  <p className="mt-1 text-sm text-ink-500">
                    <span className="font-semibold">Response:</span> {activity.response}
                  </p>
                )}
                {activity.followUpDate && (
                  <p className="mt-1 text-xs font-semibold text-rodeo-600">
                    Follow up by {formatDate(activity.followUpDate)}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(activity.id)}
                disabled={pending}
                className="shrink-0 text-ink-300 hover:text-rodeo-600"
                aria-label="Delete activity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-ink-400">No activity logged yet.</p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-rodeo-200 bg-rodeo-50 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Log an activity</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Type</label>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="email, call, meeting..."
              className="input mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Follow-up date (optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="input mt-1"
            />
          </div>
        </div>
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="input mt-1 resize-none"
        />
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          Their response (optional)
        </label>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={2}
          className="input mt-1 resize-none"
        />
        <button
          onClick={submit}
          disabled={pending || !type.trim()}
          className="mt-3 flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Log Activity
        </button>
        {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
      </div>
    </div>
  );
}
