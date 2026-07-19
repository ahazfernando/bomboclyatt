"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Plus,
  ChevronDown,
  CreditCard,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function AdminOverview() {
  const { currentUser, users, listings } = useStore();
  const [range, setRange] = useState<"Monthly" | "Annually">("Annually");

  const metrics = useMemo(() => {
    const sold = listings.filter((l) => l.sold);
    const gmv = sold.reduce((a, l) => a + l.price, 0);
    const inventory = listings.reduce((a, l) => a + l.price, 0);
    const refunds = Math.round(gmv * 0.11);
    const weekly = Math.round(gmv / 12) + 3945;
    return { gmv: gmv || 78989.09, sold: sold.length, inventory: inventory || 32678.9, refunds: refunds || 8945.89, weekly };
  }, [listings]);

  const recent = useMemo(
    () => [...listings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 3),
    [listings]
  );

  if (!currentUser) return null;

  const bars = [
    { m: "JAN", v: 2.4 },
    { m: "FEB", v: 1.6 },
    { m: "MAR", v: 2.2 },
    { m: "APR", v: 4.8, peak: true },
    { m: "MAY", v: 3.4 },
    { m: "JUN", v: 3.9 },
  ];
  const yTicks = ["5k", "4k", "3k", "2k", "1k", "0"];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-5xl sm:text-6xl">
          Welcome Back, <span className="text-muted-foreground/70">{currentUser.name.split(" ")[0]}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-full bg-background px-4 py-3 text-sm shadow-card">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">29 Jun, 2026 – 29 August, 2026</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <Link href="/dashboard">
            <Button className="rounded-full h-11 px-5">
              <Plus className="h-4 w-4" /> Add New Listing
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="grid gap-5">
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">Sales Goal</div>
                <div className="text-sm text-muted-foreground">Total amount sold</div>
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-full bg-secondary">
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-glow">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-koromiko/25 blur-2xl" />
              <div className="flex items-start justify-between">
                <div className="display text-2xl italic tracking-wider">VAULT</div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Wireless</div>
              </div>
              <div className="mt-1 text-xs opacity-80">Marketplace</div>
              <div className="mt-8 display text-3xl">
                $ {metrics.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-6 flex items-center justify-between text-xs opacity-90">
                <span className="tracking-widest">•••• 909090</span>
                <span className="tracking-widest">EXP 09/26</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="text-sm text-muted-foreground">Weekly Revenue</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="display text-4xl">+{metrics.weekly.toLocaleString()} <span className="text-lg font-sans">USD</span></div>
              <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">+12.8%</span>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="grid gap-5">
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="font-semibold">Engagement Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-secondary p-1 text-xs">
                  {(["Monthly", "Annually"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`rounded-full px-3 py-1.5 font-medium transition ${
                        range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <button className="grid h-8 w-8 place-items-center rounded-full bg-secondary">
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="flex h-56 flex-col justify-between py-1 text-[11px] text-muted-foreground">
                {yTicks.map((t) => <div key={t}>{t}</div>)}
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {yTicks.map((_, i) => (
                    <div key={i} className="border-t border-dashed border-border/70" />
                  ))}
                </div>
                <div className="relative flex h-56 items-end gap-3">
                  {bars.map((b) => (
                    <div key={b.m} className="relative flex flex-1 flex-col items-center justify-end">
                      {b.peak && (
                        <>
                          <div className="mb-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-glow">
                            +17.8%
                          </div>
                          <div className="mb-0.5 h-2 w-2 rounded-full bg-primary" />
                        </>
                      )}
                      <div
                        className="w-full max-w-[36px] rounded-t-full rounded-b-md self-center"
                        style={{
                          height: `${(b.v / 5) * 100}%`,
                          background: b.peak
                            ? "repeating-linear-gradient(45deg, var(--tia), var(--tia) 4px, var(--maple) 4px, var(--maple) 8px)"
                            : "repeating-linear-gradient(45deg, var(--koromiko), var(--koromiko) 4px, var(--tuft) 4px, var(--tuft) 8px)",
                          boxShadow: b.peak ? "var(--shadow-glow)" : "none",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2 flex gap-3 pl-8 text-[11px] uppercase tracking-wider text-muted-foreground">
              {bars.map((b) => (
                <div key={b.m} className="flex-1 text-center">{b.m}</div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">Sales History</div>
                <div className="text-sm text-muted-foreground">Recent marketplace sales</div>
              </div>
              <Link href="/browse" className="grid h-8 w-8 place-items-center rounded-full bg-secondary">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 text-left font-normal">Name</th>
                    <th className="pb-2 text-left font-normal">Date</th>
                    <th className="pb-2 text-left font-normal">Time</th>
                    <th className="pb-2 text-left font-normal">Status</th>
                    <th className="pb-2 text-right font-normal">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((l, i) => {
                    const seller = users.find((u) => u.id === l.sellerId);
                    const t = ["10:30 PM", "11:45 PM", "10:15 PM"][i] ?? "09:00 AM";
                    return (
                      <tr key={l.id} className="border-t border-border/60">
                        <td className="py-3">
                          <Link href={`/listing/${l.id}`} className="flex items-center gap-3">
                            <img src={l.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                            <div>
                              <div className="font-medium leading-tight">{l.title.slice(0, 22)}</div>
                              <div className="text-xs text-primary">+{seller?.name.split(" ")[0] ?? "Seller"}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 text-muted-foreground">{l.createdAt}</td>
                        <td className="py-3 text-muted-foreground">{t}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Successful
                          </span>
                        </td>
                        <td className="py-3 text-right font-semibold">
                          {l.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="grid gap-5">
          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">Inventory Goal</div>
                <div className="text-sm text-muted-foreground">Total inventory value</div>
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-full bg-secondary">
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Total Balance</div>
              <div className="display mt-1 text-4xl">
                ${Math.floor(metrics.inventory).toLocaleString()}
                <span className="text-2xl text-muted-foreground">
                  .{String(Math.round((metrics.inventory % 1) * 100) || 90).padStart(2, "0")}
                </span>
              </div>
            </div>

            <Sparkline />

            <div className="mt-4 flex gap-2">
              <Link href="/browse" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                Send <ArrowUp className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary py-2.5 text-sm font-semibold">
                Receive <ArrowDown className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold">Amount of refunds</div>
                  <div className="text-xs text-muted-foreground">Total refund amount with fee</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <div className="display text-4xl">
                ${Math.floor(metrics.refunds).toLocaleString()}
                <span className="text-xl text-muted-foreground">
                  .{String(Math.round((metrics.refunds % 1) * 100) || 89).padStart(2, "0")}
                </span>
              </div>
              <span className="mb-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">+12.8%</span>
            </div>
          </div>

          <div className="rounded-3xl bg-background p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">Top Sellers</div>
                <div className="text-xs text-muted-foreground">Highest rated this month</div>
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-full bg-secondary">
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center">
              <div className="flex -space-x-3">
                {users
                  .filter((u) => u.role === "seller")
                  .slice(0, 4)
                  .map((u, i) => {
                    const grads = ["bg-koromiko", "bg-crusta", "bg-tia", "bg-maple"];
                    return (
                      <Link
                        key={u.id}
                        href={`/sellers/${u.id}`}
                        title={u.name}
                        className={`grid h-11 w-11 place-items-center rounded-full border-2 border-background text-xs font-bold text-primary-foreground ${grads[i % grads.length]}`}
                        style={{ zIndex: 10 - i }}
                      >
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </Link>
                    );
                  })}
                <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground">
                  +{Math.max(0, users.filter((u) => u.role === "seller").length - 4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline() {
  const pts = [18, 22, 14, 28, 20, 34, 24, 40, 30, 38, 28, 46, 34, 52];
  const max = Math.max(...pts);
  const w = 280;
  const h = 80;
  const step = w / (pts.length - 1);
  const path = pts
    .map((p, i) => {
      const x = i * step;
      const y = h - (p / max) * (h - 10) - 5;
      if (i === 0) return `M ${x} ${y}`;
      const prevX = (i - 1) * step;
      const prevY = h - (pts[i - 1] / max) * (h - 10) - 5;
      const cx = (prevX + x) / 2;
      return `C ${cx} ${prevY} ${cx} ${y} ${x} ${y}`;
    })
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-20 w-full">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--tia)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--tia)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path d={path} fill="none" stroke="var(--tia)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
