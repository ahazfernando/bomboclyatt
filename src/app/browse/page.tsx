"use client";

import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { ListingCard } from "@/components/listing-card";
import { ListingRow } from "@/components/listing-row";
import { Input } from "@/components/ui/input";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";
import { sortListingsWithBoost } from "@/lib/boost";
import { isListingApproved } from "@/lib/listing-media";

const categories = ["All", "Electronics", "Games", "TCG", "Comics", "Diecast"] as const;
const conditions = ["Mint", "Near Mint", "Lightly Played", "Played"] as const;
type Sort = "newest" | "price-asc" | "price-desc";
type Category = (typeof categories)[number];

function parseCategory(value: string | null): Category {
  if (value && (categories as readonly string[]).includes(value)) return value as Category;
  return "All";
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const { listings } = useStore();
  const { formatPrice } = useCurrency();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>(() => parseCategory(searchParams.get("category")));
  const [cond, setCond] = useState<Set<string>>(new Set());
  const [hideSold, setHideSold] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");
  const [sort, setSort] = useState<Sort>("newest");

  const maxPrice = useMemo(
    () => Math.max(100, ...listings.map((l) => l.price)),
    [listings]
  );
  const [price, setPrice] = useState<[number, number]>([0, maxPrice]);

  const toggleCond = (c: string) => {
    setCond((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const out = listings.filter((l) =>
      isListingApproved(l) &&
      (cat === "All" || l.category === cat) &&
      (cond.size === 0 || cond.has(l.condition)) &&
      (!hideSold || !l.sold) &&
      l.price >= price[0] && l.price <= price[1] &&
      (q === "" ||
        l.title.toLowerCase().includes(q.toLowerCase()) ||
        l.set.toLowerCase().includes(q.toLowerCase()))
    );
    const secondarySort = (a: typeof out[0], b: typeof out[0]) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.createdAt.localeCompare(a.createdAt);
    };
    return sortListingsWithBoost(out, secondarySort);
  }, [listings, cat, cond, hideSold, price, q, sort]);

  const resetFilters = () => {
    setCat("All");
    setCond(new Set());
    setHideSold(false);
    setPrice([0, maxPrice]);
    setQ("");
  };

  return (
    <div className="page-shell py-10">
      <h1 className="display text-5xl">Browse collectibles</h1>
      <p className="text-muted-foreground mt-2">{filtered.length} listings available</p>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Search items, sets, categories…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full flex-1 bg-card"
        />
        <div className="flex items-center gap-2 md:ml-auto">
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort: Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`p-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-card"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
              Reset
            </Button>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Category</h3>
            <div className="flex flex-col gap-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded px-2 py-1 text-left text-sm transition-colors ${
                    cat === c ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Condition</h3>
            <div className="space-y-2">
              {conditions.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <Checkbox
                    id={`cond-${c}`}
                    checked={cond.has(c)}
                    onCheckedChange={() => toggleCond(c)}
                  />
                  <Label htmlFor={`cond-${c}`} className="text-sm font-normal cursor-pointer">
                    {c}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Price range</h3>
            <Slider
              min={0}
              max={maxPrice}
              step={10}
              value={price}
              onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
              className="mt-3"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatPrice(price[0])}</span>
              <span>{formatPrice(price[1])}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Availability</h3>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hide-sold"
                checked={hideSold}
                onCheckedChange={(v) => setHideSold(Boolean(v))}
              />
              <Label htmlFor="hide-sold" className="text-sm font-normal cursor-pointer">
                Hide sold items
              </Label>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          {filtered.length === 0 ? (
            <p className="mt-16 text-center text-muted-foreground">No items match your filters.</p>
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((l) => <ListingRow key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={null}>
      <BrowseContent />
    </Suspense>
  );
}
