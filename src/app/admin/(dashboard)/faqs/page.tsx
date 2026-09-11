import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { FaqRow } from "@/components/admin/FaqRow";
import { NewFaqForm } from "@/components/admin/NewFaqForm";

async function getFaqs() {
  try {
    const faqs = await db.fAQ.findMany({ orderBy: { sortOrder: "asc" } });
    return { ok: true as const, faqs };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminFaqsPage() {
  const data = await getFaqs();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage FAQs here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">FAQs</h1>
      <p className="mt-1 text-sm text-ink-400">
        Only FAQs marked &quot;Visible on site&quot; appear on the homepage and catering page.
      </p>

      <div className="mt-6 space-y-4">
        {data.faqs.map((faq) => (
          <FaqRow
            key={faq.id}
            id={faq.id}
            question={faq.question}
            answer={faq.answer}
            active={faq.active}
          />
        ))}
        <NewFaqForm />
      </div>
    </div>
  );
}
