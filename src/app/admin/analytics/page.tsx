"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useStore, avgRating } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { DateRangePicker, DateRangePresetFilters, getPresetRange, isWithinDateRange } from "@/components/date-range-picker";
import { TrendingUp, Users, Package, DollarSign } from "lucide-react";

export default function Analytics() {
  const { users, listings, events, giveaways } = useStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getPresetRange(30));

  const filteredListings = useMemo(
    () => listings.filter((l) => isWithinDateRange(l.createdAt, dateRange)),
    [listings, dateRange]
  );

  const filteredEvents = useMemo(
    () => events.filter((e) => isWithinDateRange(e.date, dateRange)),
    [events, dateRange]
  );

  const filteredGiveaways = useMemo(
    () => giveaways.filter((g) => isWithinDateRange(g.endsAt, dateRange)),
    [giveaways, dateRange]
  );

  const stats = useMemo(() => {
    const sold = filteredListings.filter((l) => l.sold);
    const gmv = sold.reduce((a, l) => a + l.price, 0);
    const sellerIds = new Set(filteredListings.map((l) => l.sellerId));
    const sellersInRange = users.filter((u) => u.role === "seller" && sellerIds.has(u.id));
    const avgSellerRating =
      sellersInRange.reduce((a, s) => a + avgRating(s.ratings), 0) / (sellersInRange.length || 1);

    return {
      gmv,
      sold: sold.length,
      live: filteredListings.length - sold.length,
      sellers: sellersInRange.length,
      buyers: users.filter((u) => u.role === "buyer").length,
      avgSellerRating,
      totalListings: filteredListings.length,
    };
  }, [filteredListings, users]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const l of filteredListings) {
      const c = map.get(l.category) ?? { count: 0, value: 0 };
      c.count += 1;
      c.value += l.price;
      map.set(l.category, c);
    }
    const arr = Array.from(map, ([category, v]) => ({ category, ...v }));
    const max = Math.max(...arr.map((a) => a.value), 1);
    return arr.map((a) => ({ ...a, pct: (a.value / max) * 100 }));
  }, [filteredListings]);

  const cards = [
    { icon: DollarSign, label: "GMV", value: `$${stats.gmv.toLocaleString()}` },
    { icon: Package, label: "Live listings", value: stats.live },
    { icon: Users, label: "Active sellers", value: stats.sellers },
    { icon: TrendingUp, label: "Avg seller rating", value: stats.avgSellerRating.toFixed(2) },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        subtitle={
          dateRange?.from && dateRange?.to
            ? `${stats.totalListings} listings in selected range`
            : "Marketplace performance at a glance"
        }
        action={<DateRangePicker value={dateRange} onChange={setDateRange} />}
      />

      <DateRangePresetFilters
        value={dateRange}
        onChange={setDateRange}
        className="mb-6"
      />

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
          {byCategory.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No listings in this date range.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {byCategory.map((c) => (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{c.category}</span>
                    <span className="text-muted-foreground">
                      ${c.value.toLocaleString()} · {c.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-background p-5 shadow-card">
          <div className="font-semibold">Community</div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <Stat label="Buyers" value={stats.buyers} />
            <Stat label="Sellers" value={stats.sellers} />
            <Stat label="Events" value={filteredEvents.length} />
            <Stat label="Giveaways" value={filteredGiveaways.length} />
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
