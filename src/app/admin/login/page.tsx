import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/admin/login?error=1");
      }
      throw err;
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-900/8 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
          Rodeo Catering
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink-900">Admin Sign In</h1>

        {error && (
          <p className="mt-4 rounded-lg bg-rodeo-50 px-3 py-2 text-sm font-medium text-rodeo-700">
            Invalid email or password.
          </p>
        )}

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-600" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input mt-1.5"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input mt-1.5"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-rodeo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rodeo-600"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
