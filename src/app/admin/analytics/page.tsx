"use client";

import { useMemo } from "react";
import { useStore, avgRating } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { TrendingUp, Users, Package, DollarSign } from "lucide-react";

export default function Analytics() {
  const { users, listings, events, giveaways } = useStore();

  const stats = useMemo(() => {
    const sold = listings.filter((l) => l.sold);
    const gmv = sold.reduce((a, l) => a + l.price, 0);
    const sellers = users.filter((u) => u.role === "seller");
    const buyers = users.filter((u) => u.role === "buyer");
    const avgSellerRating =
      sellers.reduce((a, s) => a + avgRating(s.ratings), 0) / (sellers.length || 1);
    return { gmv, sold: sold.length, live: listings.length - sold.length, sellers: sellers.length, buyers: buyers.length, avgSellerRating };
  }, [listings, users]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const l of listings) {
      const c = map.get(l.category) ?? { count: 0, value: 0 };
      c.count += 1;
      c.value += l.price;
      map.set(l.category, c);
    }
    const arr = Array.from(map, ([category, v]) => ({ category, ...v }));
    const max = Math.max(...arr.map((a) => a.value), 1);
    return arr.map((a) => ({ ...a, pct: (a.value / max) * 100 }));
  }, [listings]);

  const cards = [
    { icon: DollarSign, label: "GMV", value: `$${stats.gmv.toLocaleString()}` },
    { icon: Package, label: "Live listings", value: stats.live },
    { icon: Users, label: "Sellers", value: stats.sellers },
    { icon: TrendingUp, label: "Avg seller rating", value: stats.avgSellerRating.toFixed(2) },
  ];

  return (
    <div>
      <AdminPageHeader title="Analytics" subtitle="Marketplace performance at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl bg-background p-5 shadow-card">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
              <c.icon className="h-4 w-4" />
            </div>
            <div className="display mt-3 text-3xl">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl bg-background p-5 shadow-card">
          <div className="font-semibold">Listings value by category</div>
          <div className="mt-4 space-y-3">
            {byCategory.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="text-muted-foreground">${c.value.toLocaleString()} · {c.count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-background p-5 shadow-card">
          <div className="font-semibold">Community</div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <Stat label="Buyers" value={stats.buyers} />
            <Stat label="Sellers" value={stats.sellers} />
            <Stat label="Events" value={events.length} />
            <Stat label="Giveaways" value={giveaways.length} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <div className="display text-3xl">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
