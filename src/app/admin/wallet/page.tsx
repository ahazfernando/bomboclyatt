"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function WalletPage() {
  const { listings, users } = useStore();

  const tx = useMemo(() => {
    return listings
      .filter((l) => l.sold)
      .map((l) => ({
        id: l.id,
        title: l.title,
        seller: users.find((u) => u.id === l.sellerId)?.name ?? "—",
        amount: l.price,
        date: l.createdAt,
        kind: "in" as const,
      }));
  }, [listings, users]);

  const balance = tx.reduce((a, t) => a + t.amount, 0);
  const fees = Math.round(balance * 0.05);
  const payouts = Math.round(balance * 0.7);

  return (
    <div>
      <AdminPageHeader title="Wallet" subtitle="Platform treasury and payouts" />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-glow lg:col-span-2">
          <div className="text-sm opacity-80">Available balance</div>
          <div className="display mt-2 text-6xl">${balance.toLocaleString()}</div>
          <div className="mt-6 flex gap-3">
            <button className="rounded-full bg-primary-foreground/15 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/25">
              Withdraw
            </button>
            <button className="rounded-full bg-primary-foreground/15 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-primary-foreground/25">
              Add funds
            </button>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="text-sm text-muted-foreground">Platform fees</div>
            <div className="display mt-2 text-3xl">${fees.toLocaleString()}</div>
          </div>
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="text-sm text-muted-foreground">Seller payouts</div>
            <div className="display mt-2 text-3xl">${payouts.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-background p-5 shadow-card">
        <div className="font-semibold">Recent transactions</div>
        <div className="mt-4 divide-y divide-border/60">
          {tx.length === 0 && <div className="py-6 text-sm text-muted-foreground">No transactions yet.</div>}
          {tx.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.seller} · {t.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                +${t.amount.toLocaleString()}
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
