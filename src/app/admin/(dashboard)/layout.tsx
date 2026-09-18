import { Link } from "next-view-transitions";
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
  ShieldCheck,
  UserCog,
  LogOut,
  CalendarDays,
  Handshake,
  Newspaper,
  KeyRound,
  Search,
  ImageIcon,
  FileStack,
  Bell,
} from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { PERMISSIONS, roleHasPermission, type PermissionKey } from "@/lib/permissions";

const navLinks: { href: string; label: string; icon: typeof LayoutDashboard; permission?: PermissionKey }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users2, permission: PERMISSIONS.LEADS_MANAGE },
  { href: "/admin/quotes", label: "Quotes", icon: FileText, permission: PERMISSIONS.QUOTES_MANAGE },
  { href: "/admin/menu", label: "Menu & Pricing", icon: UtensilsCrossed, permission: PERMISSIONS.PRICING_MANAGE },
  { href: "/admin/packages", label: "Packages", icon: Package, permission: PERMISSIONS.PRICING_MANAGE },
  { href: "/admin/service-areas", label: "Service Areas", icon: MapPin, permission: PERMISSIONS.SERVICE_AREAS_MANAGE },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, permission: PERMISSIONS.CONTENT_MANAGE },
  { href: "/admin/reviews", label: "Reviews", icon: Star, permission: PERMISSIONS.CONTENT_MANAGE },
  { href: "/admin/awards", label: "Awards", icon: Trophy, permission: PERMISSIONS.CONTENT_MANAGE },
  { href: "/admin/blog", label: "Blog", icon: Newspaper, permission: PERMISSIONS.CONTENT_MANAGE },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon, permission: PERMISSIONS.CONTENT_MANAGE },
  { href: "/admin/pages", label: "Pages", icon: FileStack, permission: PERMISSIONS.CONTENT_MANAGE },
  { href: "/admin/seo", label: "Page SEO", icon: Search, permission: PERMISSIONS.CONTENT_MANAGE },
  { href: "/admin/social", label: "Social Calendar", icon: CalendarDays, permission: PERMISSIONS.MARKETING_MANAGE },
  { href: "/admin/outreach", label: "Outreach", icon: Handshake, permission: PERMISSIONS.MARKETING_MANAGE },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "STAFF";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const visibleLinks = [];
  for (const link of navLinks) {
    if (!link.permission || (await roleHasPermission(role, link.permission))) {
      visibleLinks.push(link);
    }
  }
  if (isSuperAdmin) {
    visibleLinks.push({ href: "/admin/notifications", label: "Notifications", icon: Bell });
    visibleLinks.push({ href: "/admin/users", label: "Admin Accounts", icon: UserCog });
    visibleLinks.push({ href: "/admin/permissions", label: "Permissions", icon: ShieldCheck });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-900/8 bg-white p-6 md:flex">
        <div>
          <p className="text-lg font-extrabold tracking-tight text-ink-900">RODEO</p>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-rodeo-600">ADMIN</p>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {visibleLinks.map((link) => (
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
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/admin/account"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
            >
              <KeyRound className="h-3.5 w-3.5" /> My Account
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
