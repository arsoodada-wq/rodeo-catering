import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { MenuItemRow } from "@/components/admin/MenuItemRow";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

async function getMenu() {
  try {
    const categories = await db.category.findMany({
      where: { kind: "MENU" },
      orderBy: { sortOrder: "asc" },
      include: { menuItems: { orderBy: { sortOrder: "asc" } } },
    });
    return { ok: true as const, categories };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminMenuPage() {
  if (!(await hasPageAccess(PERMISSIONS.PRICING_MANAGE))) {
    return <AccessRestricted label="menu pricing" />;
  }

  const data = await getMenu();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage the menu here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Menu &amp; Pricing</h1>
      <p className="mt-1 text-sm text-ink-400">
        Set a price to make an item show pricing on the catering site. Items with no price still
        appear, marked as available on request.
      </p>

      <div className="mt-6 space-y-8">
        {data.categories.map((category) => (
          <div key={category.id} className="overflow-x-auto rounded-2xl border border-ink-900/8 bg-white">
            <div className="border-b border-ink-900/8 p-4">
              <h2 className="font-bold text-ink-900">{category.name}</h2>
            </div>
            {category.menuItems.length === 0 ? (
              <p className="p-4 text-sm text-ink-400">No items in this category yet.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Pricing Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {category.menuItems.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price?.toString() ?? null}
                      pricingType={item.pricingType}
                      available={item.available}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
