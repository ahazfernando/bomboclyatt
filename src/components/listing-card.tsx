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

export function ListingCard({
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
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={listingPrimaryImage(listing)}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5">{listing.condition}</Badge>
          <div className="flex items-center gap-1">
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
          </div>
        </div>
        <h3 className="mt-3 line-clamp-1 font-semibold text-foreground">{listing.title}</h3>
        <p className="text-xs text-muted-foreground">{listing.set}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {locationLabel(listing.location)}
          {distanceLabel ? ` · ${distanceLabel}` : ""}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <span className="display text-2xl text-primary">{formatPrice(listing.price)}</span>
          <span className="text-xs text-muted-foreground">View →</span>
        </div>
      </div>
    </Link>
  );
}
