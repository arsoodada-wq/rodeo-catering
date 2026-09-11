import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { UserRow } from "@/components/admin/UserRow";
import { NewUserForm } from "@/components/admin/NewUserForm";

async function getUsers() {
  try {
    const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
    return { ok: true as const, users };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminUsersPage() {
  const session = await auth();
  const currentRole = (session?.user as { role?: string } | undefined)?.role;
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  if (currentRole !== "SUPER_ADMIN") {
    return (
      <div className="rounded-2xl border border-ink-900/10 bg-cream-100 p-6">
        <h1 className="text-lg font-bold text-ink-900">Access restricted</h1>
        <p className="mt-2 text-sm text-ink-500">Only a Super Admin can manage admin accounts.</p>
      </div>
    );
  }

  const data = await getUsers();
  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage accounts here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Admin Accounts</h1>
      <p className="mt-1 text-sm text-ink-400">
        What each role can actually do is controlled at{" "}
        <a href="/admin/permissions" className="font-semibold text-rodeo-600 hover:underline">
          /admin/permissions
        </a>
        . You can&apos;t deactivate your own account or change your own role here — get another
        Super Admin to do that, or use Prisma Studio.
      </p>

      <div className="mt-6 space-y-4">
        {data.users.map((user) => (
          <UserRow
            key={user.id}
            id={user.id}
            name={user.name}
            email={user.email}
            role={user.role}
            active={user.active}
            isCurrentUser={user.id === currentUserId}
          />
        ))}
        <NewUserForm />
      </div>
    </div>
  );
}
