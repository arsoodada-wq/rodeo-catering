import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Users } from "lucide-react";
import { db } from "@/lib/db";
import { formatEventDate } from "@/lib/format";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { QuoteBuilder } from "@/components/admin/QuoteBuilder";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { QUOTE_STATUS_TONES } from "@/lib/status";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await hasPageAccess(PERMISSIONS.LEADS_MANAGE))) {
    return <AccessRestricted label="leads" />;
  }
  const canManageQuotes = await hasPageAccess(PERMISSIONS.QUOTES_MANAGE);

  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: { quotes: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) notFound();

  const foodSelections = Array.isArray(lead.foodSelections)
    ? (lead.foodSelections as unknown[]).filter((f): f is string => typeof f === "string")
    : [];

  return (
    <div>
      <Link
        href="/admin/leads"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-ink-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{lead.name}</h1>
          {lead.company && <p className="text-ink-400">{lead.company}</p>}
        </div>
        <LeadStatusSelect leadId={lead.id} status={lead.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Contact
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              {lead.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-ink-400" />
                  <a href={`mailto:${lead.email}`} className="hover:text-rodeo-600">
                    {lead.email}
                  </a>
                </li>
              )}
              {lead.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-ink-400" />
                  <a href={`tel:${lead.phone}`} className="hover:text-rodeo-600">
                    {lead.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Event Details
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-ink-400" />
                {lead.eventDate ? formatEventDate(lead.eventDate) : "No date set"}
                {lead.eventTime && ` at ${lead.eventTime}`}
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-ink-400" />
                {lead.guestCount} guests · {lead.eventType}
              </li>
              {(lead.street || lead.city) && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>
                    {[lead.street, lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}
                  </span>
                </li>
              )}
              {lead.cateringStyle && (
                <li className="text-ink-400">Style: {lead.cateringStyle}</li>
              )}
            </ul>
          </div>

          {foodSelections.length > 0 && (
            <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                Requested Food
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {foodSelections.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-600"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lead.notes && (
            <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                Notes from Customer
              </h2>
              <p className="mt-2 text-sm text-ink-600">{lead.notes}</p>
            </div>
          )}

          {lead.quotes.length > 0 && (
            <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                Quotes
              </h2>
              <ul className="mt-3 space-y-2">
                {lead.quotes.map((quote) => (
                  <li key={quote.id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/quote/${quote.secureToken}`}
                      target="_blank"
                      className="font-semibold text-rodeo-600 hover:text-rodeo-700"
                    >
                      {quote.quoteNumber}
                    </Link>
                    <span className="flex items-center gap-2 text-ink-400">
                      ${quote.total.toString()}
                      <Badge tone={QUOTE_STATUS_TONES[quote.status] ?? "neutral"}>{quote.status}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {canManageQuotes ? (
          <QuoteBuilder
            leadId={lead.id}
            defaultItems={foodSelections.map((item) => ({
              description: item,
              quantity: lead.guestCount,
              unitPrice: 0,
            }))}
          />
        ) : (
          <AccessRestricted label="quotes" />
        )}
      </div>
    </div>
  );
}
