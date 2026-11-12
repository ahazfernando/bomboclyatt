"use client";

import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/currency";
import { useLocation } from "@/lib/location";
import {
  distanceBetweenLocationsKm,
  formatDistanceKm,
  formatShoppingNear,
  locationLabel,
  matchesDistanceFilter,
  type DistanceFilter,
} from "@/lib/locations";
import { ListingCard } from "@/components/listing-card";
import { ListingRow } from "@/components/listing-row";
import { LocationTrigger } from "@/components/location-picker";
import { Input } from "@/components/ui/input";
import { Suspense, useEffect, useMemo, useState } from "react";
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
type Sort = "nearest" | "newest" | "price-asc" | "price-desc";
type Category = (typeof categories)[number];

function parseCategory(value: string | null): Category {
  if (value && (categories as readonly string[]).includes(value)) return value as Category;
  return "All";
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const { listings } = useStore();
  const { formatPrice } = useCurrency();
  const { locationId, location } = useLocation();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>(() => parseCategory(searchParams.get("category")));
  const [cond, setCond] = useState<Set<string>>(new Set());
  const [hideSold, setHideSold] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");
  const [sort, setSort] = useState<Sort>(locationId ? "nearest" : "newest");
  const [distance, setDistance] = useState<DistanceFilter>("any");
  const [cityFilter, setCityFilter] = useState<string[]>(() =>
    locationId ? [locationId] : [],
  );

  useEffect(() => {
    if (locationId && sort === "newest") setSort("nearest");
  }, [locationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxPrice = useMemo(
    () => Math.max(100, ...listings.map((l) => l.price)),
    [listings],
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
    const out = listings.filter(
      (l) =>
        isListingApproved(l) &&
        (cat === "All" || l.category === cat) &&
        (cond.size === 0 || cond.has(l.condition)) &&
        (!hideSold || !l.sold) &&
        l.price >= price[0] &&
        l.price <= price[1] &&
        matchesDistanceFilter(locationId, l.location, distance) &&
        (cityFilter.length === 0 ||
          (l.location != null && cityFilter.includes(l.location))) &&
        (q === "" ||
          l.title.toLowerCase().includes(q.toLowerCase()) ||
          l.set.toLowerCase().includes(q.toLowerCase()) ||
          locationLabel(l.location).toLowerCase().includes(q.toLowerCase())),
    );
    const secondarySort = (a: (typeof out)[0], b: (typeof out)[0]) => {
      if (sort === "nearest" && locationId) {
        const da = distanceBetweenLocationsKm(locationId, a.location);
        const db = distanceBetweenLocationsKm(locationId, b.location);
        const na = da ?? Number.POSITIVE_INFINITY;
        const nb = db ?? Number.POSITIVE_INFINITY;
        if (na !== nb) return na - nb;
      }
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.createdAt.localeCompare(a.createdAt);
    };
    return sortListingsWithBoost(out, secondarySort);
  }, [listings, cat, cond, hideSold, price, q, sort, locationId, distance, cityFilter]);

  const resetFilters = () => {
    setCat("All");
    setCond(new Set());
    setHideSold(false);
    setPrice([0, maxPrice]);
    setQ("");
    setDistance("any");
  };

  return (
    <div>
      <section className="px-3 pt-3 md:px-4 md:pt-4">
        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.75rem] lg:rounded-[3.25rem]">
          <img
            src="/home/36cb6ebe2baff9c2f37bba545639b030.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
          <div className="page-shell relative flex min-h-[32vh] items-end py-8 md:min-h-[36vh] md:py-10 lg:py-11">
            <div className="max-w-xl text-primary-foreground">
              <h1 className="display text-4xl leading-[0.95] md:text-6xl">
                Browse collectibles
              </h1>
              <p className="mt-4 max-w-md text-base text-primary-foreground/90 md:text-lg">
                {filtered.length} listing{filtered.length === 1 ? "" : "s"}
                {location ? ` · ${formatShoppingNear(location, distance)}` : " available from trusted sellers"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <LocationTrigger
            compact
            className="h-12 w-full max-w-none shrink-0 md:w-[15rem]"
            showDistance
            distance={distance}
            selectedIds={cityFilter}
            onApply={({ locationIds, distance: next }) => {
              setCityFilter(locationIds);
              setDistance(next);
              if (locationIds.length > 0) setSort("nearest");
            }}
          />
          <Input
            placeholder="Search items, sets, locations…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-12 w-full flex-1 bg-card text-base md:text-sm"
          />
          <div className="flex items-center gap-2 md:ml-auto">
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="h-12 w-[180px] bg-card">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest">Sort: Nearest</SelectItem>
                <SelectItem value="newest">Sort: Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex h-12 overflow-hidden rounded-md border border-border">
              <button
                onClick={() => setView("list")}
                aria-label="List view"
                className={`grid h-full place-items-center px-3 ${view === "list" ? "bg-primary text-primary-foreground" : "bg-card"}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`grid h-full place-items-center px-3 ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-card"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Filters
              </h2>
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
                    <Label htmlFor={`cond-${c}`} className="cursor-pointer text-sm font-normal">
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
                <Label htmlFor="hide-sold" className="cursor-pointer text-sm font-normal">
                  Hide sold items
                </Label>
              </div>
            </div>
          </aside>

          <div>
            {filtered.length === 0 ? (
              <p className="mt-16 text-center text-muted-foreground">No items match your filters.</p>
            ) : view === "grid" ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filtered.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    distanceLabel={formatDistanceKm(
                      distanceBetweenLocationsKm(locationId, l.location),
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((l) => (
                  <ListingRow
                    key={l.id}
                    listing={l}
                    distanceLabel={formatDistanceKm(
                      distanceBetweenLocationsKm(locationId, l.location),
                    )}
                  />
                ))}
              </div>
            )}
          </div>
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
