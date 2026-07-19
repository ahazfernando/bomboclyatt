"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function AdminListings() {
  const { listings, users } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "live" | "sold">("all");

  const filtered = listings.filter((l) => {
    if (status === "live" && l.sold) return false;
    if (status === "sold" && !l.sold) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <AdminPageHeader
        title="Listings"
        subtitle={`${filtered.length} of ${listings.length} cards`}
        action={
          <Link href="/dashboard">
            <Button className="rounded-full">New listing</Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-background px-4 py-2.5 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search listings…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-background p-1 text-xs shadow-card">
          {(["all", "live", "sold"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-4 py-2 font-medium capitalize transition ${
                status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => {
          const seller = users.find((u) => u.id === l.sellerId);
          return (
            <Link
              key={l.id}
              href={`/listing/${l.id}`}
              className="group overflow-hidden rounded-3xl bg-background shadow-card transition hover:-translate-y-0.5"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={l.image} alt={l.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                <div className="absolute right-3 top-3">
                  {l.sold ? (
                    <Badge className="bg-destructive text-destructive-foreground">Sold</Badge>
                  ) : (
                    <Badge className="bg-primary text-primary-foreground">Live</Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{l.title}</div>
                  <div className="font-semibold text-primary">${l.price}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{seller?.name} · {l.condition}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
