"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Award, Plus, Package, CheckCircle2 } from "lucide-react";

const categories = ["Sealed Product", "Single Hits", "Accessories", "Slabs", "Comics", "Diecast"] as const;
const conditions = ["Mint", "Near Mint", "Lightly Played", "Played"] as const;

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, listings, addListing, addEvent, addGiveaway, confirmPurchase } = useStore();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!currentUser) router.push("/auth");
  }, [currentUser, router]);

  if (!currentUser) return null;

  const myListings = listings.filter((l) => l.sellerId === currentUser.id);
  const myPurchases = listings.filter((l) => l.buyerId === currentUser.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="secondary" className="capitalize">{currentUser.role}</Badge>
          <h1 className="display text-5xl mt-2">Hey, {currentUser.name.split(" ")[0]}.</h1>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-sun px-5 py-3 text-maple shadow-card">
          <Award className="h-6 w-6" />
          <div>
            <div className="display text-3xl leading-none">{currentUser.points}</div>
            <div className="text-xs font-medium">points</div>
          </div>
        </div>
      </div>

      {/* Purchases (buyer) */}
      {myPurchases.length > 0 && (
        <section className="mt-12">
          <h2 className="display text-2xl mb-4">Your purchases</h2>
          <div className="space-y-3">
            {myPurchases.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <img src={l.image} className="h-16 w-16 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <Link href={`/listing/${l.id}`} className="font-semibold hover:text-primary">{l.title}</Link>
                  <p className="text-xs text-muted-foreground">{formatPrice(l.price)}</p>
                </div>
                <Button size="sm" onClick={() => { confirmPurchase(l.id); toast.success("+10 points added!"); }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & earn points
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seller/admin — creation */}
      {(currentUser.role === "seller" || currentUser.role === "admin") && (
        <>
          <section className="mt-12 grid gap-6 md:grid-cols-3">
            <NewListingCard onAdd={addListing} />
            <NewEventCard onAdd={addEvent} />
            <NewGiveawayCard onAdd={addGiveaway} />
          </section>

          <section className="mt-12">
            <h2 className="display text-2xl mb-4">Your listings ({myListings.length})</h2>
            <div className="space-y-3">
              {myListings.length === 0 && <p className="text-muted-foreground">No listings yet — post your first card above.</p>}
              {myListings.map((l) => (
                <Link href={`/listing/${l.id}`} key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors">
                  <img src={l.image} className="h-16 w-16 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-semibold">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(l.price)} · {l.condition}</p>
                  </div>
                  {l.sold ? <Badge className="bg-destructive text-destructive-foreground">Sold</Badge> : <Package className="h-5 w-5 text-muted-foreground" />}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function NewListingCard({ onAdd }: { onAdd: ReturnType<typeof useStore>["addListing"] }) {
  const { currentUser } = useStore();
  const [title, setTitle] = useState("");
  const [set, setSet] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<typeof categories[number]>("Single Hits");
  const [cond, setCond] = useState<typeof conditions[number]>("Near Mint");

  return (
    <Card className="bg-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> New listing</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Card title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Set / year" value={set} onChange={(e) => setSet(e.target.value)} />
        <Input placeholder="Price ($)" type="number" value={price || ""} onChange={(e) => setPrice(+e.target.value)} />
        <Input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
        <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <select value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={cond} onChange={(e) => setCond(e.target.value as typeof cond)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            {conditions.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Button
          className="w-full bg-primary"
          onClick={() => {
            if (!currentUser || !title || !price) { toast.error("Title and price required."); return; }
            onAdd({ sellerId: currentUser.id, title, set, price, image: image || "https://images.unsplash.com/photo-1613771404784-3a5686aa7b8f?auto=format&fit=crop&w=800&q=80", description: desc, category: cat, condition: cond });
            setTitle(""); setSet(""); setPrice(0); setImage(""); setDesc("");
            toast.success("Listing published!");
          }}
        >Publish</Button>
      </CardContent>
    </Card>
  );
}

function NewEventCard({ onAdd }: { onAdd: ReturnType<typeof useStore>["addEvent"] }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [loc, setLoc] = useState("");
  const [cover, setCover] = useState("");
  return (
    <Card className="bg-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> New event</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Input placeholder="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input placeholder="Location" value={loc} onChange={(e) => setLoc(e.target.value)} />
        <Input placeholder="Cover image URL (optional)" value={cover} onChange={(e) => setCover(e.target.value)} />
        <Button className="w-full bg-primary" onClick={() => {
          if (!title || !date) { toast.error("Title and date required."); return; }
          onAdd({ title, description: desc, date, location: loc, cover: cover || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80" });
          setTitle(""); setDesc(""); setDate(""); setLoc(""); setCover("");
          toast.success("Event posted.");
        }}>Post event</Button>
      </CardContent>
    </Card>
  );
}

function NewGiveawayCard({ onAdd }: { onAdd: ReturnType<typeof useStore>["addGiveaway"] }) {
  const [prize, setPrize] = useState("");
  const [desc, setDesc] = useState("");
  const [ends, setEnds] = useState("");
  const [cover, setCover] = useState("");
  return (
    <Card className="bg-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> New giveaway</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Prize" value={prize} onChange={(e) => setPrize(e.target.value)} />
        <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Input placeholder="Ends on" type="date" value={ends} onChange={(e) => setEnds(e.target.value)} />
        <Input placeholder="Cover image URL (optional)" value={cover} onChange={(e) => setCover(e.target.value)} />
        <Button className="w-full bg-primary" onClick={() => {
          if (!prize || !ends) { toast.error("Prize and end date required."); return; }
          onAdd({ prize, description: desc, endsAt: ends, cover: cover || "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=800&q=80" });
          setPrize(""); setDesc(""); setEnds(""); setCover("");
          toast.success("Giveaway live!");
        }}>Launch</Button>
      </CardContent>
    </Card>
  );
}
