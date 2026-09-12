import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { checkRateLimit } from "@/lib/rate-limit";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        // Keyed by the submitted email (not IP) so a brute-force attempt
        // against one account is throttled no matter how many different
        // source IPs it comes from. Same generic "invalid credentials"
        // response either way, so a lockout can't be distinguished from a
        // wrong password by an attacker probing for valid emails.
        const normalizedEmail = email.trim().toLowerCase();
        const { allowed } = checkRateLimit(
          `login:${normalizedEmail}`,
          LOGIN_ATTEMPT_LIMIT,
          LOGIN_ATTEMPT_WINDOW_MS
        );
        if (!allowed) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || !user.active) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        const user = session.user as typeof session.user & { role: string; id: string };
        user.role = token.role as string;
        user.id = token.id as string;
      }
      return session;
    },
  },
});
