"use client";

import Link from "next/link";
import type { Listing } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function ListingRow({ listing }: { listing: Listing }) {
  const { formatPrice } = useCurrency();
  const { trackListingClick } = useStore();

  return (
    <Link
      href={`/listing/${listing.id}`}
      onClick={() => trackListingClick(listing.id)}
      className="group flex gap-5 rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/50 hover:shadow-card"
    >
      <div className="h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 py-1">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5">
              {listing.condition}
            </Badge>
            <Badge variant="outline" className="border-border">{listing.category}</Badge>
            {listing.sold && <Badge className="bg-destructive text-destructive-foreground">SOLD</Badge>}
          </div>
          <h3 className="mt-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground">{listing.set}</p>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        </div>
        <div className="flex items-end justify-between">
          <span className="display text-3xl text-primary">{formatPrice(listing.price)}</span>
          <span className="text-xs text-muted-foreground">Listed {listing.createdAt} · View →</span>
        </div>
      </div>
    </Link>
  );
}
