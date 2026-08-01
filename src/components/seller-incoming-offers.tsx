"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { HandCoins } from "lucide-react";

type Props = {
  /** When set, only offers for this listing are shown. */
  listingId?: string;
  compact?: boolean;
};

export function SellerIncomingOffers({ listingId, compact }: Props) {
  const { currentUser, listings, users, listingOffers, respondToOffer } = useStore();
  const { formatPrice } = useCurrency();

  const myListingIds = useMemo(
    () => new Set(listings.filter((l) => l.sellerId === currentUser?.id).map((l) => l.id)),
    [listings, currentUser?.id]
  );

  const incoming = useMemo(() => {
    return listingOffers
      .filter((o) => {
        if (o.status !== "pending") return false;
        if (listingId) return o.listingId === listingId;
        return myListingIds.has(o.listingId);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [listingOffers, listingId, myListingIds]);

  if (!currentUser || currentUser.role !== "seller") return null;
  if (incoming.length === 0) {
    if (compact) return null;
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
        <HandCoins className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-medium">No pending offers</p>
        <p className="mt-1 text-sm text-muted-foreground">
          When buyers make offers on your listings, they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <HandCoins className="h-5 w-5 text-maple" />
          <h2 className="font-semibold">Incoming offers</h2>
          <Badge className="bg-maple text-tuft">{incoming.length}</Badge>
        </div>
        {!listingId && (
          <Link href="/dashboard/listings" className="text-sm text-primary hover:underline">
            View all listings
          </Link>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Listing</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>List price</TableHead>
            <TableHead className="hidden sm:table-cell">Note</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incoming.map((o) => {
            const listing = listings.find((l) => l.id === o.listingId);
            const buyer = users.find((u) => u.id === o.buyerId);
            const savings = listing ? listing.price - o.amount : 0;
            return (
              <TableRow key={o.id}>
                <TableCell>
                  {listing ? (
                    <Link
                      href={`/listing/${listing.id}`}
                      className="font-medium hover:text-primary line-clamp-1 max-w-[160px]"
                    >
                      {listing.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-sm">{buyer?.name ?? "Buyer"}</TableCell>
                <TableCell className="font-semibold text-primary">{formatPrice(o.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {listing ? formatPrice(listing.price) : "—"}
                  {savings > 0 && (
                    <span className="ml-1 text-xs text-maple">(-{formatPrice(savings)})</span>
                  )}
                </TableCell>
                <TableCell className="hidden max-w-[200px] truncate text-sm text-muted-foreground sm:table-cell">
                  {o.message ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      className="bg-primary"
                      onClick={() => {
                        respondToOffer(o.id, "accepted");
                        toast.success(`Accepted offer from ${buyer?.name ?? "buyer"}.`);
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        respondToOffer(o.id, "declined");
                        toast.success("Offer declined.");
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
