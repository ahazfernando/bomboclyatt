"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Eye, MousePointerClick } from "lucide-react";

export default function DashboardAnalyticsPage() {
  const router = useRouter();
  const { currentUser, listings } = useStore();

  useEffect(() => {
    if (currentUser && currentUser.role !== "seller") router.push("/dashboard");
  }, [currentUser, router]);

  const myListings = useMemo(
    () => listings.filter((l) => l.sellerId === currentUser?.id),
    [listings, currentUser?.id]
  );

  const totals = useMemo(
    () => ({
      views: myListings.reduce((a, l) => a + (l.views ?? 0), 0),
      clicks: myListings.reduce((a, l) => a + (l.clicks ?? 0), 0),
    }),
    [myListings]
  );

  if (!currentUser || currentUser.role !== "seller") return null;

  return (
    <div>
      <h1 className="display text-4xl sm:text-5xl">Listing analytics</h1>
      <p className="mt-2 text-muted-foreground">Views and clicks across all your listings.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-background p-6 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-5 w-5" /> Total views
          </div>
          <div className="display mt-3 text-5xl text-primary">{totals.views}</div>
        </div>
        <div className="rounded-3xl bg-background p-6 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MousePointerClick className="h-5 w-5" /> Total clicks
          </div>
          <div className="display mt-3 text-5xl text-primary">{totals.clicks}</div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl bg-background shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr>
              <th className="p-4 text-left font-medium">Listing</th>
              <th className="p-4 text-center font-medium">Views</th>
              <th className="p-4 text-center font-medium">Clicks</th>
              <th className="p-4 text-center font-medium">CTR</th>
            </tr>
          </thead>
          <tbody>
            {myListings.map((l) => {
              const ctr = l.views ? (((l.clicks ?? 0) / l.views) * 100).toFixed(1) : "0.0";
              return (
                <tr key={l.id} className="border-b border-border/60 last:border-0">
                  <td className="p-4 font-medium">{l.title}</td>
                  <td className="p-4 text-center">{l.views ?? 0}</td>
                  <td className="p-4 text-center">{l.clicks ?? 0}</td>
                  <td className="p-4 text-center">{ctr}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
