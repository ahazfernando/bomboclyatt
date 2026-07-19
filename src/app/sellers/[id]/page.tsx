"use client";

import { useParams } from "next/navigation";
import { useStore, avgRating } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { StarRating } from "@/components/star-rating";
import { ListingCard } from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Award } from "lucide-react";

export default function SellerProfile() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { users, listings, currentUser, rateUser, confirmPurchase } = useStore();
  const { formatPrice } = useCurrency();
  const user = users.find((u) => u.id === id);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  if (!user) return <div className="p-16 text-center">User not found.</div>;

  const userListings = listings.filter((l) => l.sellerId === user.id);
  const purchases = listings.filter((l) => l.buyerId === user.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-card">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-background/20 text-4xl font-bold backdrop-blur">
              {user.name[0]}
            </div>
            <div>
              <Badge className="bg-background/20 text-primary-foreground border-0 capitalize">{user.role}</Badge>
              <h1 className="display text-4xl mt-1">{user.name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <StarRating value={avgRating(user.ratings)} size={16} />
                <span className="text-sm text-primary-foreground/80">{user.ratings.length} reviews</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-background/15 px-5 py-3 backdrop-blur">
            <Award className="h-5 w-5" />
            <div>
              <div className="display text-3xl leading-none">{user.points}</div>
              <div className="text-xs text-primary-foreground/80">points earned</div>
            </div>
          </div>
        </div>
        {user.bio && <p className="mt-6 max-w-2xl text-primary-foreground/90">{user.bio}</p>}
      </div>

      {userListings.length > 0 && (
        <section className="mt-12">
          <h2 className="display text-3xl mb-6">Listings</h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {userListings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {purchases.length > 0 && (
        <section className="mt-12">
          <h2 className="display text-3xl mb-6">Recent purchases</h2>
          <div className="space-y-3">
            {purchases.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <img src={l.image} className="h-16 w-16 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(l.price)}</p>
                </div>
                {currentUser?.id === user.id && (
                  <Button size="sm" variant="outline" onClick={() => { confirmPurchase(l.id); toast.success("+10 points!"); }}>
                    Confirm delivery
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="display text-3xl mb-6">Reviews</h2>
        <div className="space-y-3">
          {user.ratings.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
          {user.ratings.map((r, i) => {
            const from = users.find((u) => u.id === r.from);
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{from?.name ?? "User"}</div>
                  <StarRating value={r.stars} size={14} />
                </div>
                <p className="mt-2 text-sm text-foreground/80">{r.comment}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
              </div>
            );
          })}
        </div>

        {currentUser && currentUser.id !== user.id && (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="font-semibold mb-3">Leave a review</p>
            <StarRating value={stars} size={22} onChange={setStars} />
            <Textarea className="mt-3" placeholder="Was the deal smooth?" value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button
              className="mt-3 bg-primary"
              onClick={() => {
                rateUser(user.id, stars, comment);
                setComment("");
                toast.success("Review posted.");
              }}
            >
              Submit
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
