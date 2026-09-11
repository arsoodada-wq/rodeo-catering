import { ShieldAlert } from "lucide-react";

export function AccessRestricted({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-ink-900/10 bg-cream-100 p-6">
      <div className="flex items-center gap-2 text-ink-700">
        <ShieldAlert className="h-5 w-5" />
        <h1 className="text-lg font-bold">Access restricted</h1>
      </div>
      <p className="mt-2 text-sm text-ink-500">
        Your account doesn&apos;t have permission to manage {label}. A Super Admin can grant it at{" "}
        <code className="rounded bg-white px-1 py-0.5">/admin/permissions</code>.
      </p>
    </div>
  );
}
