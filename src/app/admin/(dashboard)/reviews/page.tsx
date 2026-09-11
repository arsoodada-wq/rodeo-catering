import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { ReviewRow } from "@/components/admin/ReviewRow";
import { NewReviewForm } from "@/components/admin/NewReviewForm";

async function getReviews() {
  try {
    const reviews = await db.review.findMany({ orderBy: { createdAt: "desc" } });
    return { ok: true as const, reviews };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminReviewsPage() {
  const data = await getReviews();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage reviews here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Reviews</h1>
      <p className="mt-1 text-sm text-ink-400">
        Only reviews marked &quot;Visible on site&quot; appear on the homepage. Only add real
        customer reviews — never a fabricated example.
      </p>

      <div className="mt-6 space-y-4">
        {data.reviews.map((review) => (
          <ReviewRow
            key={review.id}
            id={review.id}
            customerName={review.customerName}
            rating={review.rating}
            reviewText={review.reviewText}
            source={review.source}
            active={review.active}
          />
        ))}
        <NewReviewForm />
      </div>
    </div>
  );
}
