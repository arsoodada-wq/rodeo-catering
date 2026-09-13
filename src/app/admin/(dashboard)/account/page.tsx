import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function AdminAccountPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">My Account</h1>
      <p className="mt-1 text-sm text-ink-400">
        Signed in as {session?.user?.name} ({session?.user?.email}).
      </p>

      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
