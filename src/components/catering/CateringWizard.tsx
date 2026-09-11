"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, PartyPopper } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { eventTypes, menuHighlights, business, cateringPolicy } from "@/lib/site-content";
import { submitCateringLead, type CateringLeadInput } from "@/app/actions/submit-catering-lead";

type EventTypeValue = CateringLeadInput["eventType"];
type CateringStyleValue = CateringLeadInput["cateringStyle"];

const eventTypeEnumMap: Record<string, EventTypeValue> = {
  corporate: "CORPORATE",
  birthday: "BIRTHDAY",
  graduation: "GRADUATION",
  wedding: "WEDDING",
  school: "SCHOOL",
  sports: "SPORTS_TEAM",
  family: "FAMILY_GATHERING",
  community: "COMMUNITY",
};

const guestBands = [
  { label: "10–20", value: 15 },
  { label: "21–50", value: 35 },
  { label: "51–100", value: 75 },
  { label: "101–200", value: 150 },
  { label: "200+", value: 250 },
];

const cateringStyles: { value: CateringStyleValue; label: string; description: string }[] = [
  { value: "PICKUP", label: "Pickup", description: "You pick up, we have it ready." },
  { value: "DROP_OFF", label: "Drop-Off", description: "We deliver, you handle set-up and serving." },
  { value: "FULL_SERVICE", label: "Full Service", description: "Our team sets up, serves, and cleans up." },
  { value: "LIVE_COOKOUT", label: "Live Cookout", description: "We cook fresh, on-site, as part of the event." },
  { value: "CORPORATE_LUNCH", label: "Corporate Lunch", description: "Office-ready, delivered on schedule." },
  { value: "LARGE_EVENT", label: "Large Event", description: "200+ guests — full event catering." },
];

const STEPS = ["Event", "Guests", "Date", "Location", "Style", "Food", "Contact", "Review"] as const;

// Rounds up to whole calendar days in the visitor's own local time, so
// "48 hours" reliably means at least 2 full days out rather than
// sometimes landing mid-afternoon-tomorrow depending on time of day.
function getMinSelectableDate(): string {
  const leadDays = Math.ceil(cateringPolicy.minLeadTimeHours / 24);
  const d = new Date();
  d.setDate(d.getDate() + leadDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type FormState = {
  eventType: EventTypeValue | null;
  guestCount: number | null;
  eventDate: string;
  eventTime: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  cateringStyle: CateringStyleValue | null;
  foodSelections: string[];
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
};

const initialState: FormState = {
  eventType: null,
  guestCount: null,
  eventDate: "",
  eventTime: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  cateringStyle: null,
  foodSelections: [],
  name: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
};

export function CateringWizard({ confirmedServiceAreas }: { confirmedServiceAreas: string[] }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return form.eventType !== null;
      case 1:
        return form.guestCount !== null && form.guestCount > 0;
      case 2:
        return form.eventDate !== "" && form.eventDate >= getMinSelectableDate();
      case 3:
        return form.city.trim() !== "";
      case 4:
        return form.cateringStyle !== null;
      case 5:
        return true; // food selection optional
      case 6:
        return form.name.trim() !== "" && (form.email.trim() !== "" || form.phone.trim() !== "");
      default:
        return true;
    }
  }

  async function handleSubmit() {
    if (!form.eventType || !form.cateringStyle || !form.guestCount) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitCateringLead({
        eventType: form.eventType,
        guestCount: form.guestCount,
        eventDate: form.eventDate || undefined,
        eventTime: form.eventTime || undefined,
        cateringStyle: form.cateringStyle,
        foodSelections: form.foodSelections,
        street: form.street || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip: form.zip || undefined,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        notes: form.notes || undefined,
      });
      setResult(
        res.ok
          ? { ok: true, message: "Request received!" }
          : { ok: false, message: res.error }
      );
    } catch {
      setResult({
        ok: false,
        message:
          "Something went wrong submitting your request. Please call us directly and we'll take it from there.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="rounded-3xl border border-rodeo-200 bg-rodeo-50 p-10 text-center">
        <PartyPopper className="mx-auto h-10 w-10 text-rodeo-600" />
        <h3 className="mt-4 text-2xl font-extrabold text-ink-900">Request received!</h3>
        <p className="mx-auto mt-2 max-w-md text-ink-600">
          Our catering team will follow up soon to confirm details and pricing
          for your event. If it&apos;s urgent, call us directly at{" "}
          <a href={business.phoneHref} className="font-semibold text-rodeo-600">
            {business.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink-900/8 bg-white p-6 shadow-sm md:p-10">
      <StepIndicator step={step} />

      <div className="mt-8 min-h-[280px]">
        {step === 0 && (
          <StepShell title="What type of event are you planning?">
            <div className="grid gap-3 sm:grid-cols-2">
              {eventTypes.map((et) => (
                <OptionCard
                  key={et.key}
                  label={et.label}
                  description={et.description}
                  selected={form.eventType === eventTypeEnumMap[et.key]}
                  onClick={() => update("eventType", eventTypeEnumMap[et.key] ?? "OTHER")}
                />
              ))}
              <OptionCard
                label="Other"
                description="Something else? Tell us in the notes."
                selected={form.eventType === "OTHER"}
                onClick={() => update("eventType", "OTHER")}
              />
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="How many guests are you feeding?">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {guestBands.map((band) => (
                <OptionCard
                  key={band.label}
                  label={band.label}
                  selected={form.guestCount === band.value}
                  onClick={() => update("guestCount", band.value)}
                />
              ))}
            </div>
            <div className="mt-5">
              <label className="text-sm font-medium text-ink-600">
                Or enter an exact guest count
              </label>
              <input
                type="number"
                min={1}
                value={form.guestCount ?? ""}
                onChange={(e) => update("guestCount", e.target.value ? Number(e.target.value) : null)}
                className="mt-1.5 w-full max-w-xs rounded-xl border border-ink-900/15 px-4 py-2.5 text-sm focus:border-rodeo-500 focus:outline-none"
                placeholder="e.g. 65"
              />
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="When is your event?">
            <div className="grid gap-4 sm:grid-cols-2 max-w-md">
              <Field label="Date" required>
                <input
                  type="date"
                  min={getMinSelectableDate()}
                  value={form.eventDate}
                  onChange={(e) => update("eventDate", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Preferred time">
                <input
                  type="time"
                  value={form.eventTime}
                  onChange={(e) => update("eventTime", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
            {form.eventDate && form.eventDate < getMinSelectableDate() ? (
              <p className="mt-3 text-xs font-medium text-rodeo-600">
                We need at least {cateringPolicy.minLeadTimeHours} hours notice — please choose a
                later date.
              </p>
            ) : (
              <p className="mt-3 text-xs text-ink-400">
                We require at least {cateringPolicy.minLeadTimeHours} hours notice for catering
                orders, so dates sooner than that aren&apos;t selectable.
              </p>
            )}
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Where is your event?">
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <Field label="Street address" className="sm:col-span-2">
                <input
                  value={form.street}
                  onChange={(e) => update("street", e.target.value)}
                  className="input"
                  placeholder="123 Main St"
                />
              </Field>
              <Field label="City" required>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="input"
                  placeholder="Worth"
                />
              </Field>
              <Field label="State">
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="input"
                  placeholder="IL"
                />
              </Field>
              <Field label="ZIP code">
                <input
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className="input"
                  placeholder="60482"
                />
              </Field>
            </div>
            <p className="mt-4 text-sm text-ink-400">
              We currently confirm catering for {confirmedServiceAreas.join(", ")}.
              Outside that area? Submit your request anyway — we&apos;re
              actively expanding and will let you know if we can make it work.
            </p>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="What kind of catering experience do you want?">
            <div className="grid gap-3 sm:grid-cols-2">
              {cateringStyles.map((cs) => (
                <OptionCard
                  key={cs.value}
                  label={cs.label}
                  description={cs.description}
                  selected={form.cateringStyle === cs.value}
                  onClick={() => update("cateringStyle", cs.value)}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="What would you like to serve?" subtitle="Optional — pick a few to help us plan, or skip and we'll recommend options.">
            <div className="space-y-5">
              {menuHighlights.map((group) => (
                <div key={group.category}>
                  <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
                    {group.category}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const selected = form.foodSelections.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            update(
                              "foodSelections",
                              selected
                                ? form.foodSelections.filter((i) => i !== item)
                                : [...form.foodSelections, item]
                            )
                          }
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                            selected
                              ? "border-rodeo-500 bg-rodeo-500 text-white"
                              : "border-ink-900/15 text-ink-600 hover:border-rodeo-300"
                          )}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title="How can we reach you?">
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <Field label="Name" required>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
              </Field>
              <Field label="Company (optional)">
                <input value={form.company} onChange={(e) => update("company", e.target.value)} className="input" />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Anything else we should know?" className="sm:col-span-2">
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder="Dietary restrictions, allergies, special requests..."
                />
              </Field>
            </div>
            <p className="mt-3 text-xs text-ink-400">Provide at least an email or phone number.</p>
          </StepShell>
        )}

        {step === 7 && (
          <StepShell title="Review your request">
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <SummaryRow label="Event type" value={form.eventType ?? "—"} />
              <SummaryRow label="Guests" value={form.guestCount ? String(form.guestCount) : "—"} />
              <SummaryRow label="Date" value={form.eventDate || "—"} />
              <SummaryRow label="Style" value={form.cateringStyle ?? "—"} />
              <SummaryRow
                label="Location"
                value={[form.street, form.city, form.state, form.zip].filter(Boolean).join(", ") || "—"}
              />
              <SummaryRow
                label="Food selections"
                value={form.foodSelections.length ? form.foodSelections.join(", ") : "We'll recommend options"}
              />
              <SummaryRow label="Contact" value={`${form.name} — ${form.email || form.phone}`} />
            </dl>
            <div className="mt-6 rounded-2xl bg-cream-100 p-4 text-sm text-ink-600">
              We don&apos;t show pricing here yet — our catering team will
              confirm a detailed quote based on your selections and get back
              to you soon.
            </div>
            {result && !result.ok && (
              <p className="mt-4 text-sm font-medium text-rodeo-600">{result.message}</p>
            )}
          </StepShell>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-ink-900/8 pt-6">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              "Submit Catering Request"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-1.5">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
              i < step
                ? "bg-rodeo-500 text-white"
                : i === step
                  ? "bg-ink-900 text-white"
                  : "bg-ink-900/8 text-ink-400"
            )}
          >
            {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("h-0.5 flex-1", i < step ? "bg-rodeo-500" : "bg-ink-900/8")} />
          )}
        </div>
      ))}
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function OptionCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition-all",
        selected
          ? "border-rodeo-500 bg-rodeo-50 ring-1 ring-rodeo-500"
          : "border-ink-900/10 hover:border-rodeo-300"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-ink-900">{label}</span>
        {selected && <Check className="h-4 w-4 text-rodeo-600" />}
      </div>
      {description && <p className="mt-1 text-xs text-ink-400">{description}</p>}
    </button>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-ink-600">
        {label} {required && <span className="text-rodeo-600">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink-900">{value}</dd>
    </div>
  );
}
