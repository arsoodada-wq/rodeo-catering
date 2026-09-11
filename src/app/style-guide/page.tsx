import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Container } from "@/components/ui/Container";
import { ModalDemo, ToastDemo } from "@/components/style-guide/StyleGuideDemos";
import { LEAD_STATUS_LABELS, LEAD_STATUS_TONES } from "@/lib/status";

export const metadata: Metadata = {
  title: "Style Guide",
  robots: { index: false, follow: false },
};

// Tailwind's scanner needs complete, literal class names to generate CSS for
// them — a template-built string like `bg-${shade}` is invisible to it, so
// every swatch class is spelled out here instead of assembled at runtime.
const colorGroups: { name: string; shades: [string, string][] }[] = [
  {
    name: "Rodeo (brand red)",
    shades: [
      ["50", "bg-rodeo-50"],
      ["100", "bg-rodeo-100"],
      ["200", "bg-rodeo-200"],
      ["300", "bg-rodeo-300"],
      ["400", "bg-rodeo-400"],
      ["500", "bg-rodeo-500"],
      ["600", "bg-rodeo-600"],
      ["700", "bg-rodeo-700"],
      ["800", "bg-rodeo-800"],
      ["900", "bg-rodeo-900"],
    ],
  },
  {
    name: "Ink (text)",
    shades: [
      ["50", "bg-ink-50"],
      ["100", "bg-ink-100"],
      ["400", "bg-ink-400"],
      ["600", "bg-ink-600"],
      ["800", "bg-ink-800"],
      ["900", "bg-ink-900"],
    ],
  },
  {
    name: "Cream (backgrounds)",
    shades: [
      ["50", "bg-cream-50"],
      ["100", "bg-cream-100"],
    ],
  },
];

const badgeTones: BadgeTone[] = ["neutral", "info", "success", "warning", "danger"];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink-900/8 py-10 first:border-0 first:pt-0">
      <h2 className="text-xl font-extrabold tracking-tight text-ink-900">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-sm text-ink-500">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <Container className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
          Rodeo Catering — Internal
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">Style Guide</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          The design tokens and reusable components this site is built from. Not linked from
          anywhere public, and excluded from search indexing — this page is a reference for
          whoever is writing code here next, not a customer-facing page.
        </p>

        <Section
          title="Colors"
          description="Defined once as CSS variables in globals.css and mapped into Tailwind's theme — change a value there and it updates everywhere the corresponding class is used."
        >
          <div className="space-y-6">
            {colorGroups.map((group) => (
              <div key={group.name}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-3">
                  {group.shades.map(([label, bgClass]) => (
                    <div key={bgClass} className="text-center">
                      <div className={`h-14 w-14 rounded-xl border border-ink-900/8 ${bgClass}`} />
                      <p className="mt-1 text-[11px] text-ink-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography" description="Poppins, loaded via next/font — no layout shift, no external request.">
          <div className="space-y-3">
            <p className="text-4xl font-extrabold tracking-tight text-ink-900">Heading 1 — text-4xl font-extrabold</p>
            <p className="text-2xl font-extrabold tracking-tight text-ink-900">Heading 2 — text-2xl font-extrabold</p>
            <p className="text-lg font-bold text-ink-900">Heading 3 — text-lg font-bold</p>
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
              Eyebrow — text-sm font-semibold uppercase tracking-wide text-rodeo-600
            </p>
            <p className="text-base text-ink-600">
              Body text — text-base text-ink-600. Used for paragraphs across the public site.
            </p>
            <p className="text-sm text-ink-400">
              Muted / secondary text — text-sm text-ink-400. Used for hints, timestamps, captions.
            </p>
          </div>
        </Section>

        <Section title="Buttons" description="components/ui/Button.tsx — renders a <Link> when given href, a <button> otherwise.">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md">
                Medium
              </Button>
              <Button variant="primary" size="lg">
                Large
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Badges"
          description="components/ui/Badge.tsx — used for lead and quote statuses via the tone map in lib/status.ts."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {badgeTones.map((tone) => (
                <Badge key={tone} tone={tone}>
                  {tone}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <Badge key={key} tone={LEAD_STATUS_TONES[key]}>
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Cards" description="components/ui/Card.tsx — the base container used throughout the admin dashboard.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="font-bold text-ink-900">Default card</p>
              <p className="mt-1 text-sm text-ink-500">padding=&quot;md&quot; (the default)</p>
            </Card>
            <Card padding="lg">
              <p className="font-bold text-ink-900">Large padding</p>
              <p className="mt-1 text-sm text-ink-500">padding=&quot;lg&quot;</p>
            </Card>
          </div>
        </Section>

        <Section
          title="Form inputs"
          description="components/ui/Input.tsx, Textarea.tsx, Select.tsx, Checkbox.tsx — thin wrappers around the shared .input style with optional label/hint/error."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Text input" placeholder="e.g. Jane Doe" />
            <Input label="With an error" defaultValue="not-an-email" error="Enter a valid email" />
            <Select label="Select" defaultValue="a">
              <option value="a">Option A</option>
              <option value="b">Option B</option>
            </Select>
            <Input label="With a hint" hint="This won't be shown publicly" />
            <div className="sm:col-span-2">
              <Textarea label="Textarea" placeholder="Longer freeform text..." />
            </div>
            <Checkbox label="A checkbox with a label" />
          </div>
        </Section>

        <Section
          title="Modal"
          description="components/ui/Modal.tsx and ConfirmDialog.tsx — replaces the browser's built-in confirm() for delete actions across the admin dashboard."
        >
          <ModalDemo />
        </Section>

        <Section
          title="Toast"
          description="components/ui/ToastProvider.tsx — mounted once in the root layout via useToast(), available anywhere in the app without prop drilling."
        >
          <ToastDemo />
        </Section>
      </Container>
    </div>
  );
}
