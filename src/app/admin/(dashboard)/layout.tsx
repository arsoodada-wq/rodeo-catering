import Link from "next/link";
import {
  LayoutDashboard,
  Users2,
  FileText,
  UtensilsCrossed,
  Package,
  HelpCircle,
  Star,
  Trophy,
  MapPin,
  LogOut,
} from "lucide-react";
import { auth, signOut } from "@/lib/auth";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users2 },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/menu", label: "Menu & Pricing", icon: UtensilsCrossed },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/service-areas", label: "Service Areas", icon: MapPin },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/awards", label: "Awards", icon: Trophy },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-900/8 bg-white p-6 md:flex">
        <div>
          <p className="text-lg font-extrabold tracking-tight text-ink-900">RODEO</p>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-rodeo-600">ADMIN</p>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-cream-100 hover:text-ink-900"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-ink-900/8 pt-4">
          <p className="truncate text-sm font-medium text-ink-900">{session?.user?.name}</p>
          <p className="truncate text-xs text-ink-400">{session?.user?.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
