"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Gavel, HandCoins } from "lucide-react";
import type { Listing } from "@/lib/types";

type Props = {
  listing: Listing;
  listPrice: number;
};

export function ListingOffersBids({ listing, listPrice }: Props) {
  const router = useRouter();
  const { currentUser, users, listingOffers, listingBids, placeOffer, placeBid, respondToOffer } =
    useStore();
  const { formatPrice } = useCurrency();

  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  const isSeller = currentUser?.id === listing.sellerId;
  const acceptsOffers = listing.acceptsOffers !== false;
  const acceptsBids = listing.acceptsBids !== false;

  const offers = useMemo(
    () =>
      listingOffers
        .filter((o) => o.listingId === listing.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [listingOffers, listing.id]
  );

  const bids = useMemo(
    () =>
      listingBids
        .filter((b) => b.listingId === listing.id)
        .sort((a, b) => b.amount - a.amount),
    [listingBids, listing.id]
  );

  const myOffer = offers.find((o) => o.buyerId === currentUser?.id && o.status === "pending");
  const pendingOffers = offers.filter((o) => o.status === "pending");
  const topBid = bids[0];

  const requireLogin = () => {
    router.push("/auth?mode=login");
    return false;
  };

  const submitOffer = () => {
    if (!currentUser && !requireLogin()) return;
    if (isSeller) {
      toast.error("You can't offer on your own listing.");
      return;
    }
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid offer amount.");
      return;
    }
    if (amount >= listPrice) {
      toast.error(`Offer must be below ${formatPrice(listPrice)}.`);
      return;
    }
    const result = placeOffer(listing.id, amount, offerNote.trim() || undefined);
    if (!result.ok) {
      toast.error(result.reason);
      return;
    }
    toast.success("Offer sent to the seller!");
    setOfferAmount("");
    setOfferNote("");
  };

  const submitBid = () => {
    if (!currentUser && !requireLogin()) return;
    if (isSeller) {
      toast.error("You can't bid on your own listing.");
      return;
    }
    const amount = Number(bidAmount);
    const minBid = topBid ? topBid.amount + 1 : Math.max(1, Math.floor(listPrice * 0.5));
    if (!amount || amount < minBid) {
      toast.error(`Bid must be at least ${formatPrice(minBid)}.`);
      return;
    }
    const result = placeBid(listing.id, amount);
    if (!result.ok) {
      toast.error(result.reason);
      return;
    }
    toast.success("Bid placed!");
    setBidAmount("");
  };

  if (listing.sold) return null;

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Offers & bids</h2>
        <div className="flex gap-2">
          {acceptsOffers && (
            <Badge variant="outline" className="border-primary/30 text-primary">
              Offers open
            </Badge>
          )}
          {acceptsBids && (
            <Badge variant="outline" className="border-maple/40 text-maple">
              Bids open
            </Badge>
          )}
        </div>
      </div>

      {topBid && acceptsBids && (
        <p className="mt-2 text-sm text-muted-foreground">
          Current high bid:{" "}
          <span className="font-semibold text-foreground">{formatPrice(topBid.amount)}</span>
          {users.find((u) => u.id === topBid.buyerId) && (
            <span className="text-muted-foreground">
              {" "}
              · {users.find((u) => u.id === topBid.buyerId)!.name.split(" ")[0]}
            </span>
          )}
        </p>
      )}

      {isSeller && pendingOffers.length > 0 && (
        <div className="mt-4 space-y-2 rounded-xl bg-secondary/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pending offers
          </p>
          {pendingOffers.map((o) => {
            const buyer = users.find((u) => u.id === o.buyerId);
            return (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-primary">{formatPrice(o.amount)}</p>
                  <p className="text-xs text-muted-foreground">{buyer?.name ?? "Buyer"}</p>
                  {o.message && <p className="mt-1 text-xs text-foreground/80">&ldquo;{o.message}&rdquo;</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-primary"
                    onClick={() => {
                      respondToOffer(o.id, "accepted");
                      toast.success("Offer accepted.");
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
              </div>
            );
          })}
        </div>
      )}

      {!isSeller && (acceptsOffers || acceptsBids) && (
        <Tabs defaultValue={acceptsOffers ? "offer" : "bid"} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            {acceptsOffers && (
              <TabsTrigger value="offer" className="gap-1.5">
                <HandCoins className="h-3.5 w-3.5" /> Make offer
              </TabsTrigger>
            )}
            {acceptsBids && (
              <TabsTrigger value="bid" className="gap-1.5">
                <Gavel className="h-3.5 w-3.5" /> Place bid
              </TabsTrigger>
            )}
          </TabsList>

          {acceptsOffers && (
            <TabsContent value="offer" className="mt-4 space-y-3">
              {myOffer ? (
                <p className="text-sm text-muted-foreground">
                  Your pending offer:{" "}
                  <span className="font-semibold text-foreground">{formatPrice(myOffer.amount)}</span>
                </p>
              ) : (
                <>
                  <div>
                    <Label htmlFor="offer-amount">Your offer (USD)</Label>
                    <Input
                      id="offer-amount"
                      type="number"
                      min={1}
                      max={listPrice - 1}
                      placeholder={`Below ${formatPrice(listPrice)}`}
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offer-note">Message (optional)</Label>
                    <Textarea
                      id="offer-note"
                      placeholder="Why this price works for you…"
                      value={offerNote}
                      onChange={(e) => setOfferNote(e.target.value)}
                      className="mt-1 min-h-[72px]"
                    />
                  </div>
                  <Button className="w-full rounded-full" onClick={submitOffer}>
                    Send offer to seller
                  </Button>
                </>
              )}
            </TabsContent>
          )}

          {acceptsBids && (
            <TabsContent value="bid" className="mt-4 space-y-3">
              <div>
                <Label htmlFor="bid-amount">Your bid (USD)</Label>
                <Input
                  id="bid-amount"
                  type="number"
                  min={topBid ? topBid.amount + 1 : 1}
                  placeholder={
                    topBid
                      ? `Min ${formatPrice(topBid.amount + 1)}`
                      : `Start at ${formatPrice(Math.max(1, Math.floor(listPrice * 0.5)))}`
                  }
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button className="w-full rounded-full bg-maple text-tuft hover:bg-maple/90" onClick={submitBid}>
                Place bid
              </Button>
              {bids.length > 0 && (
                <ul className="space-y-1 border-t border-border pt-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recent bids
                  </p>
                  {bids.slice(0, 5).map((b, i) => (
                    <li key={b.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {i === 0 && "High · "}
                        {users.find((u) => u.id === b.buyerId)?.name?.split(" ")[0] ?? "Buyer"}
                      </span>
                      <span className="font-medium text-foreground">{formatPrice(b.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
