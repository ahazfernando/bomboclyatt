"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore, avgRating } from "@/lib/store";
import { fetchChatToken } from "@/lib/chat/client-auth";
import { startConversation } from "@/hooks/use-conversations";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { MessageCircle, Package, Minus, Plus, Filter, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ListingCard } from "@/components/listing-card";

type Tab = "details" | "reviews" | "faq";

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { listings, users, currentUser, markSold, reviewListing, rateUser, trackListingView, trackListingClick } = useStore();
  const { formatPrice } = useCurrency();
  const listing = listings.find((l) => l.id === id);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("reviews");
  const [condition, setCondition] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);

  // Derive multi-image gallery — supports 1..N images once uploads land.
  const images = useMemo(() => {
    const base = listing?.image;
    if (!base) return [] as string[];
    const sep = base.includes("?") ? "&" : "?";
    return [base, `${base}${sep}sat=-40`, `${base}${sep}hue=25`, `${base}${sep}flip=h`];
  }, [listing?.image]);

  useEffect(() => {
    if (!listing) return;
    const key = `viewed-${listing.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    trackListingView(listing.id);
  }, [listing, trackListingView]);

  if (!listing) return <div className="p-16 text-center">Listing not found.</div>;

  const seller = users.find((u) => u.id === listing.sellerId);
  const buyer = listing.buyerId ? users.find((u) => u.id === listing.buyerId) : null;
  const rating = avgRating(listing.reviews) || 4.5;
  const alsoLike = listings.filter((l) => l.id !== listing.id && !l.sold).slice(0, 4);

  const conditions = ["Mint", "Near Mint", "Lightly Played", "Played"] as const;
  const activeCondition = condition ?? listing.condition;

  const buy = () => {
    if (!seller?.whatsapp) { toast.error("Seller has no WhatsApp on file."); return; }
    trackListingClick(listing.id);
    const msg = encodeURIComponent(`Hi ${seller.name}! I'd like to buy ${qty}× "${listing.title}" (${formatPrice(listing.price * qty)}) on BomboClyatt.`);
    window.open(`https://wa.me/${seller.whatsapp}?text=${msg}`, "_blank");
    toast.success("Opening WhatsApp — the seller can mark this sold once you confirm.");
  };

  const isSeller = currentUser?.id === listing.sellerId;

  const messageSeller = async () => {
    if (!currentUser) {
      router.push("/auth?mode=login");
      return;
    }
    if (!seller) {
      toast.error("Seller not found.");
      return;
    }
    setMessaging(true);
    await fetchChatToken(currentUser.id);
    const conversation = await startConversation(listing.id, seller.id);
    setMessaging(false);
    if (!conversation) {
      toast.error("Could not start conversation.");
      return;
    }
    router.push(`/dashboard/messages?conversation=${conversation.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/browse" className="hover:text-primary">Buy</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{listing.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{listing.set}</span>
      </nav>

      {/* Gallery + Details */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Gallery */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3 w-24 shrink-0">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`overflow-hidden rounded-2xl aspect-square border-2 transition-colors ${
                  i === activeImage ? "border-primary shadow-card" : "border-transparent hover:border-border"
                }`}
              >
                <img src={src} alt={`${listing.title} view ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden rounded-3xl bg-secondary/40 shadow-card">
            <img src={images[activeImage]} alt={listing.title} className="aspect-[4/5] w-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="display text-5xl md:text-6xl leading-[0.95]">{listing.title}</h1>

          <div className="mt-5 flex items-center gap-2">
            <StarRating value={rating} size={18} />
            <span className="text-sm text-muted-foreground">{rating.toFixed(1)}/5</span>
            <span className="text-sm text-muted-foreground">· {listing.reviews.length} reviews</span>
          </div>

          <div className="mt-5 display text-5xl text-foreground">{formatPrice(listing.price)}</div>

          <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
            {listing.description}
          </p>

          <div className="mt-6 h-px bg-border" />

          {/* Set / Category chip pickers (visual only) */}
          <div className="mt-6">
            <p className="text-sm font-semibold">Set</p>
            <div className="mt-3 flex items-center gap-3">
              <button className="h-7 w-7 rounded-full bg-maple ring-2 ring-offset-2 ring-offset-background ring-maple" aria-label={listing.set} />
              <button className="h-7 w-7 rounded-full bg-crusta grid place-items-center text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button className="h-7 w-7 rounded-full bg-foreground/90" />
            </div>
          </div>

          {/* Condition pills */}
          <div className="mt-6">
            <p className="text-sm font-semibold">Condition</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {conditions.map((c) => {
                const active = c === activeCondition;
                return (
                  <button
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`px-5 py-2 rounded-full text-sm border transition-colors ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-foreground/70 border-border hover:border-foreground/40"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + CTA */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-4 rounded-full border border-border px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-7 w-7 grid place-items-center rounded-full hover:bg-secondary"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-7 w-7 grid place-items-center rounded-full hover:bg-secondary"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {listing.sold ? (
              <div className="flex-1 rounded-full bg-secondary px-6 py-3 text-center text-sm font-semibold">
                Sold {buyer ? `to ${buyer.name}` : ""}
              </div>
            ) : (
              <div className="flex flex-1 gap-2">
                <Button
                  onClick={buy}
                  className="flex-1 h-12 rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Buy on WhatsApp
                </Button>
                {!isSeller && (
                  <Button
                    variant="outline"
                    onClick={() => void messageSeller()}
                    disabled={messaging}
                    className="h-12 rounded-full px-6"
                  >
                    Message seller
                  </Button>
                )}
              </div>
            )}
          </div>

          {isSeller && !listing.sold && currentUser && (
            <div className="mt-6 rounded-2xl border border-border p-4 bg-card">
              <p className="text-sm font-medium mb-2">Confirm this card was purchased</p>
              <p className="text-xs text-muted-foreground mb-3">Select the buyer — they'll earn 10 points once you confirm.</p>
              <div className="flex flex-wrap gap-2">
                {users.filter((u) => u.id !== currentUser.id).map((u) => (
                  <Button key={u.id} size="sm" variant="outline" onClick={() => { markSold(listing.id, u.id); toast.success(`Marked sold to ${u.name}.`); }}>
                    {u.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {seller && (
            <Link
              href={`/sellers/${seller.id}`}
              className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary transition-colors"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-sun text-primary-foreground font-bold">
                {seller.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{seller.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <StarRating value={avgRating(seller.ratings)} size={12} />
                  <span>{seller.ratings.length} seller reviews</span>
                </div>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-20 border-b border-border">
        <div className="grid grid-cols-3">
          {([
            { id: "details", label: "Product Details" },
            { id: "reviews", label: "Rating & Reviews" },
            { id: "faq", label: "FAQs" },
          ] as { id: Tab; label: string }[]).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {active && <span className="absolute inset-x-8 -bottom-px h-0.5 bg-foreground" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-10">
        {tab === "details" && (
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl">
            <div>
              <h3 className="font-semibold">About this card</h3>
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{listing.description}</p>
            </div>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Set</dt><dd className="font-medium">{listing.set}</dd>
              <dt className="text-muted-foreground">Category</dt><dd className="font-medium">{listing.category}</dd>
              <dt className="text-muted-foreground">Condition</dt><dd className="font-medium">{activeCondition}</dd>
              <dt className="text-muted-foreground">Listed</dt><dd className="font-medium">{listing.createdAt}</dd>
            </dl>
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">All Reviews <span className="text-muted-foreground font-normal">({listing.reviews.length})</span></h3>
              <div className="flex items-center gap-3">
                <button className="h-9 w-9 grid place-items-center rounded-full border border-border hover:bg-secondary" aria-label="Filter">
                  <Filter className="h-4 w-4" />
                </button>
                <button className="h-9 px-4 rounded-full border border-border text-sm inline-flex items-center gap-1.5 hover:bg-secondary">
                  Latest <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <Button className="h-9 rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 text-sm">
                  Write a Review
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {listing.reviews.length === 0 && (
                <p className="text-muted-foreground text-sm md:col-span-3">No reviews yet — be the first once you pick this card up.</p>
              )}
              {listing.reviews.map((r, i) => {
                const from = users.find((u) => u.id === r.from);
                return (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5">
                    <StarRating value={r.stars} size={14} />
                    <p className="mt-3 font-semibold">{from?.name ?? "User"}</p>
                    <p className="mt-2 text-sm text-foreground/80 leading-relaxed">"{r.comment}"</p>
                    <p className="mt-3 text-xs text-muted-foreground">{r.date}</p>
                  </div>
                );
              })}
            </div>

            {listing.reviews.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button className="px-6 py-2.5 rounded-full border border-border text-sm hover:bg-secondary">
                  Load more Reviews
                </button>
              </div>
            )}

            {currentUser && listing.sold && listing.buyerId === currentUser.id && (
              <div className="mt-8 max-w-xl rounded-2xl border border-border bg-card p-5">
                <p className="font-semibold mb-3">Review this product & seller</p>
                <StarRating value={stars} size={20} onChange={setStars} />
                <Textarea className="mt-3" placeholder="Share how it went…" value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button
                  className="mt-3 bg-primary"
                  onClick={() => {
                    reviewListing(listing.id, stars, comment);
                    if (seller) rateUser(seller.id, stars, comment);
                    setComment("");
                    toast.success("Review posted. Thanks!");
                  }}
                >
                  Post review
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === "faq" && (
          <div className="max-w-3xl space-y-4">
            {[
              { q: "How do I complete the purchase?", a: "Tap Buy on WhatsApp — it opens a chat with the seller pre-filled with the listing details. Arrange pickup or shipping directly." },
              { q: "Do I earn points for this order?", a: "Yes — you earn 10 points once the seller confirms you picked up the card." },
              { q: "What if the card doesn't match the description?", a: "Leave a review reflecting your experience. Sellers rely on reputation, and admins review low ratings." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="flex items-center justify-between cursor-pointer font-medium">
                  {f.q}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* You might also like */}
      <section className="mt-24">
        <h2 className="display text-4xl text-center">You might also like</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {alsoLike.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      <div className="mt-16">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-primary">
          ← Back
        </button>
      </div>
    </div>
  );
}
