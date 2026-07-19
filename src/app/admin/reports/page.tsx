"use client";

import Link from "next/link";
import { useStore, avgRating } from "@/lib/store";
import { AdminPageHeader } from "@/components/admin-shell";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

export default function Reports() {
  const { users, listings } = useStore();

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        subtitle="Users, listings, and moderation queues"
        action={
          <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <section className="rounded-3xl bg-background p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-2xl">All users</h2>
          <Badge variant="secondary">{users.length}</Badge>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Role</th>
                <th className="p-3 text-left font-medium">Points</th>
                <th className="p-3 text-left font-medium">Rating</th>
                <th className="p-3 text-left font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3">
                    <Link href={`/sellers/${u.id}`} className="font-medium hover:text-primary">
                      {u.name}
                    </Link>
                  </td>
                  <td className="p-3 capitalize text-muted-foreground">{u.role}</td>
                  <td className="p-3">{u.points}</td>
                  <td className="p-3"><StarRating value={avgRating(u.ratings)} size={12} /></td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-background p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-2xl">All listings</h2>
          <Badge variant="secondary">{listings.length}</Badge>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left font-medium">Title</th>
                <th className="p-3 text-left font-medium">Seller</th>
                <th className="p-3 text-left font-medium">Price</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => {
                const seller = users.find((u) => u.id === l.sellerId);
                return (
                  <tr key={l.id} className="border-t border-border">
                    <td className="p-3">
                      <Link href={`/listing/${l.id}`} className="font-medium hover:text-primary">
                        {l.title}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{seller?.name ?? "—"}</td>
                    <td className="p-3">${l.price}</td>
                    <td className="p-3">
                      {l.sold ? (
                        <Badge className="bg-destructive text-destructive-foreground">Sold</Badge>
                      ) : (
                        <Badge variant="outline">Live</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
