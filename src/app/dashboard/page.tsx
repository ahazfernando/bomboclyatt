"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, ChevronDown, CreditCard, Calendar, Eye, MousePointerClick } from "lucide-react";
import { SellerIncomingOffers } from "@/components/seller-incoming-offers";

export default function DashboardOverview() {
  const { currentUser, listings, listingOffers } = useStore();
  const { formatPrice } = useCurrency();
  const [range, setRange] = useState<"Monthly" | "Annually">("Annually");

  const myListings = useMemo(
    () => listings.filter((l) => l.sellerId === currentUser?.id),
    [listings, currentUser?.id]
  );
  const myPurchases = useMemo(
    () => listings.filter((l) => l.buyerId === currentUser?.id),
    [listings, currentUser?.id]
  );

  const metrics = useMemo(() => {
    const sold = myListings.filter((l) => l.sold);
    const gmv = sold.reduce((a, l) => a + l.price, 0);
    const views = myListings.reduce((a, l) => a + (l.views ?? 0), 0);
    const clicks = myListings.reduce((a, l) => a + (l.clicks ?? 0), 0);
    return {
      gmv: gmv || 0,
      sold: sold.length,
      live: myListings.filter((l) => !l.sold && l.approvalStatus === "approved").length,
      views,
      clicks,
      points: currentUser?.points ?? 0,
      purchases: myPurchases.length,
    };
  }, [myListings, myPurchases, currentUser?.points]);

  const isSeller = currentUser?.role === "seller";

  const pendingOfferCount = useMemo(() => {
    if (!isSeller || !currentUser) return 0;
    const myIds = new Set(myListings.map((l) => l.id));
    return listingOffers.filter((o) => o.status === "pending" && myIds.has(o.listingId)).length;
  }, [isSeller, currentUser, myListings, listingOffers]);

  if (!currentUser) return null;

  const bars = [
    { m: "JAN", v: 1.2 },
    { m: "FEB", v: 1.6 },
    { m: "MAR", v: 2.2 },
    { m: "APR", v: Math.min(4.8, (metrics.views / 80) || 2.4), peak: true },
    { m: "MAY", v: 3.4 },
    { m: "JUN", v: 3.9 },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-5xl sm:text-6xl">
          Welcome Back,{" "}
          <span className="text-muted-foreground/70">{currentUser.name.split(" ")[0]}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-full bg-background px-4 py-3 text-sm shadow-card">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">29 Jun, 2026 – 29 August, 2026</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <Link href="/dashboard/listings">
            <Button className="h-11 rounded-full px-5 bg-maple text-tuft hover:bg-maple/90">
              <Plus className="h-4 w-4" /> Add New Listing
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="grid gap-5">
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{isSeller ? "Sales Goal" : "Points Balance"}</div>
                <div className="text-sm text-muted-foreground">
                  {isSeller ? "Total amount sold" : "Earned from confirmed pickups"}
                </div>
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-full bg-secondary">
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
              <div className="display text-2xl italic tracking-wider">BOMBOCLYATT</div>
              <div className="mt-1 text-xs opacity-80 capitalize">{currentUser.role} vault</div>
              <div className="mt-8 display text-3xl">
                {isSeller
                  ? formatPrice(metrics.gmv)
                  : `${metrics.points} pts`}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="text-sm text-muted-foreground">
              {isSeller ? "Live listings" : "Your purchases"}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="display text-4xl">
                {isSeller ? metrics.live : metrics.purchases}
              </div>
              <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                {isSeller ? `${metrics.sold} sold` : `${metrics.points} pts`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="font-semibold">Engagement Rate</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-secondary p-1 text-xs">
                {(["Monthly", "Annually"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`rounded-full px-3 py-1.5 ${range === r ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex h-48 items-end gap-2">
              {bars.map((b) => (
                <div key={b.m} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg ${b.peak ? "bg-maple" : "bg-maple/20"}`}
                    style={{ height: `${(b.v / 5) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{b.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="text-sm text-muted-foreground">Listing performance</div>
            <div className="mt-2 display text-4xl">{metrics.views + metrics.clicks}</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-secondary/50 p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" /> Views
                </div>
                <div className="mt-1 text-xl font-semibold">{metrics.views}</div>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MousePointerClick className="h-3.5 w-3.5" /> Clicks
                </div>
                <div className="mt-1 text-xl font-semibold">{metrics.clicks}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="font-semibold">Quick links</div>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/dashboard/listings" className="block rounded-xl bg-secondary/50 px-3 py-2 hover:bg-secondary">
                Manage listings →
              </Link>
              <Link href="/browse" className="block rounded-xl bg-secondary/50 px-3 py-2 hover:bg-secondary">
                Browse marketplace →
              </Link>
              {!isSeller && (
                <Link href="/dashboard/purchases" className="block rounded-xl bg-secondary/50 px-3 py-2 hover:bg-secondary">
                  View purchases →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSeller && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-2xl">Buyer offers</h2>
            {pendingOfferCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {pendingOfferCount} pending review{pendingOfferCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <SellerIncomingOffers />
        </section>
      )}
    </div>
  );
}
