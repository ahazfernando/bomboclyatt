"use client";

import Link from "next/link";
import type { Listing } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { isListingBoosted } from "@/lib/boost";
import { listingPrimaryImage } from "@/lib/listing-media";
import { locationLabel } from "@/lib/locations";
import { MapPin, Rocket, Star } from "lucide-react";
import { ListingShareButton } from "@/components/listing-share";

export function ListingRow({
  listing,
  distanceLabel,
}: {
  listing: Listing;
  distanceLabel?: string | null;
}) {
  const { formatPrice } = useCurrency();
  const { trackListingClick } = useStore();

  return (
    <Link
      href={`/listing/${listing.id}`}
      onClick={() => trackListingClick(listing.id)}
      className="group relative flex gap-5 rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/50 hover:shadow-card"
    >
      <div className="h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={listingPrimaryImage(listing)}
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
            {listing.featured && (
              <Badge className="bg-maple text-tuft">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {isListingBoosted(listing) && (
              <Badge className="bg-maple text-tuft">
                <Rocket className="mr-1 h-3 w-3" />
                Boosted
              </Badge>
            )}
            {listing.sold && <Badge className="bg-destructive text-destructive-foreground">SOLD</Badge>}
            <div className="ml-auto">
              <ListingShareButton compact listingId={listing.id} title={listing.title} />
            </div>
          </div>
          <h3 className="mt-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground">{listing.set}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {locationLabel(listing.location)}
            {distanceLabel ? ` · ${distanceLabel}` : ""}
          </p>
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
