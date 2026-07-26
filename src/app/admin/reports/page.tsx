"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Download, Package, Users } from "lucide-react";

export default function Reports() {
  const { users, listings } = useStore();

  const stats = useMemo(() => {
    const sellers = users.filter((u) => u.role === "seller").length;
    const live = listings.filter((l) => !l.sold).length;
    const sold = listings.filter((l) => l.sold).length;
    const gmv = listings.filter((l) => l.sold).reduce((a, l) => a + l.price, 0);
    return { sellers, live, sold, gmv };
  }, [users, listings]);

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        subtitle="Platform summaries and exports"
        action={
          <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total users", value: users.length },
          { label: "Sellers", value: stats.sellers },
          { label: "Live listings", value: stats.live },
          { label: "Sold listings", value: stats.sold },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-background p-5 shadow-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="display mt-2 text-3xl text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Link
          href="/admin/users"
          className="group flex items-center justify-between rounded-3xl bg-background p-6 shadow-card transition hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/60">
                <Users className="h-5 w-5 text-maple" />
              </div>
              <div>
                <h2 className="display text-2xl">Users</h2>
                <p className="text-sm text-muted-foreground">Manage accounts, roles, and profiles</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{users.length} accounts on platform</p>
          </div>
          <Button variant="outline" className="rounded-full">Open</Button>
        </Link>

        <Link
          href="/admin/listings"
          className="group flex items-center justify-between rounded-3xl bg-background p-6 shadow-card transition hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/60">
                <Package className="h-5 w-5 text-maple" />
              </div>
              <div>
                <h2 className="display text-2xl">Listings</h2>
                <p className="text-sm text-muted-foreground">Browse, edit, and remove marketplace items</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {stats.live} live · {stats.sold} sold · ${stats.gmv.toLocaleString()} GMV
            </p>
          </div>
          <Button variant="outline" className="rounded-full">Open</Button>
        </Link>
      </div>
    </div>
  );
}
