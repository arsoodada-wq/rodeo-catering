import { Container } from "@/components/ui/Container";

export function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-16 md:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
          {title}
        </h1>
        <div className="mt-4 rounded-xl border border-rodeo-200 bg-rodeo-50 px-4 py-3 text-sm text-rodeo-700">
          <strong>Draft placeholder — requires business/legal review.</strong>{" "}
          This page has not been reviewed by an attorney and should not be
          treated as final until the business confirms its policies.
        </div>
        <div className="mt-8 text-ink-600 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink-900 [&_p]:mt-3 [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </Container>
  );
}
