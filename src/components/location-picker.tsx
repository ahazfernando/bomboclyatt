"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DISTANCE_OPTIONS,
  MARKET_LOCATIONS,
  type DistanceFilter,
  formatShoppingNear,
  getLocationById,
  locationsByRegion,
} from "@/lib/locations";
import { useLocation } from "@/lib/location";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";

type LocationPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true, draft includes a travel-radius control (browse). */
  showDistance?: boolean;
  distance?: DistanceFilter;
  onApply?: (next: { locationId: string | null; distance: DistanceFilter }) => void;
  listingCounts?: Record<string, number>;
};

export function LocationPicker({
  open,
  onOpenChange,
  showDistance = false,
  distance = "any",
  onApply,
  listingCounts,
}: LocationPickerProps) {
  const { locationId, setLocationId } = useLocation();
  const [query, setQuery] = useState("");
  const [draftId, setDraftId] = useState<string | null>(locationId);
  const [draftDistance, setDraftDistance] = useState<DistanceFilter>(distance);
  const [openRegions, setOpenRegions] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setDraftId(locationId);
    setDraftDistance(distance);
    const region = getLocationById(locationId)?.region;
    setOpenRegions(region ? new Set([region]) : new Set(["Western"]));
  }, [open, locationId, distance]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MARKET_LOCATIONS;
    return MARKET_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q),
    );
  }, [query]);

  const groups = useMemo(() => locationsByRegion(filtered), [filtered]);
  const isSearching = query.trim().length > 0;
  const draftLocation = getLocationById(draftId) ?? null;

  const toggleRegion = (region: string) => {
    setOpenRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const apply = () => {
    setLocationId(draftId);
    onApply?.({ locationId: draftId, distance: draftId ? draftDistance : "any" });
    onOpenChange(false);
  };

  const reset = () => {
    setDraftId(null);
    setDraftDistance("any");
    setQuery("");
  };

  const countFor = (id: string) => listingCounts?.[id];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(40rem,90vh)] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl",
        )}
      >
        <DialogHeader className="space-y-3 border-b border-border/70 px-5 pb-4 pt-5 pr-12 text-left">
          <DialogTitle className="text-xl">Where are you shopping?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Pick a city so we can sort by pickup distance. No filter chips — just set your base and how far you’ll go.
          </DialogDescription>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities or regions"
              className="h-11 rounded-xl border-border/80 bg-muted/40 pl-9 pr-9"
              autoFocus
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              setDraftId(null);
              setDraftDistance("any");
            }}
            className={cn(
              "flex w-full items-center gap-3 border-b border-border/60 px-5 py-3.5 text-left transition-colors",
              draftId == null
                ? "bg-primary/10 text-foreground"
                : "hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                draftId == null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {draftId == null ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Anywhere in Sri Lanka</span>
              <span className="block text-xs text-muted-foreground">
                See every listing, unsorted by distance
              </span>
            </span>
          </button>

          {groups.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No cities match “{query.trim()}”.
            </p>
          ) : (
            groups.map(({ region, cities }) => {
              const expanded = isSearching || openRegions.has(region);
              const regionSelected = cities.some((c) => c.id === draftId);
              return (
                <div key={region} className="border-b border-border/50 last:border-b-0">
                  {!isSearching && (
                    <button
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-muted/40"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {region}
                        {regionSelected ? (
                          <span className="ml-2 normal-case tracking-normal text-primary">
                            · {getLocationById(draftId)?.name}
                          </span>
                        ) : null}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                  {expanded &&
                    cities.map((city) => {
                      const selected = draftId === city.id;
                      const count = countFor(city.id);
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => setDraftId(city.id)}
                          className={cn(
                            "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                            isSearching ? "" : "pl-7",
                            selected ? "bg-primary/10" : "hover:bg-muted/50",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border",
                            )}
                          >
                            {selected ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{city.name}</span>
                            {isSearching && (
                              <span className="block text-xs text-muted-foreground">
                                {city.region}
                              </span>
                            )}
                          </span>
                          {typeof count === "number" && (
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {count.toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              );
            })
          )}
        </div>

        {showDistance && draftId && (
          <div className="border-t border-border/70 bg-muted/25 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Travel radius
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              How far from {draftLocation?.name} are you willing to go?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraftDistance(opt.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    draftDistance === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-border/70 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="min-w-[5.5rem]"
            onClick={reset}
          >
            Reset
          </Button>
          <Button type="button" className="min-w-0 flex-1" onClick={apply}>
            {draftId
              ? showDistance
                ? `Show · ${formatShoppingNear(draftLocation, draftDistance)}`
                : `Shop near ${draftLocation?.name}`
              : "Show all of Sri Lanka"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type LocationTriggerProps = {
  className?: string;
  showDistance?: boolean;
  distance?: DistanceFilter;
  onApply?: (next: { locationId: string | null; distance: DistanceFilter }) => void;
  listingCounts?: Record<string, number>;
  /** Compact control for the site nav. */
  compact?: boolean;
};

export function LocationTrigger({
  className,
  showDistance = false,
  distance = "any",
  onApply,
  listingCounts,
  compact = false,
}: LocationTriggerProps) {
  const { location } = useLocation();
  const [open, setOpen] = useState(false);
  const label = formatShoppingNear(location, showDistance ? distance : "any");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Location: ${label}. Change location`}
        className={cn(
          "group inline-flex items-center gap-2 text-left transition-colors",
          compact
            ? "h-9 max-w-[11.5rem] rounded-md border border-input bg-card px-3 text-sm hover:bg-accent/10"
            : "rounded-2xl border border-border/80 bg-card/80 px-4 py-3 hover:border-primary/35 hover:bg-card",
          className,
        )}
      >
        <MapPin
          className={cn(
            "shrink-0 text-primary",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            location && "fill-primary/15",
          )}
        />
        <span className="min-w-0 flex-1 truncate">
          {compact ? (
            <span className="font-medium">{location?.name ?? "Set location"}</span>
          ) : (
            <>
              <span className="block text-sm font-semibold leading-tight">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {location ? "Tap to change city or radius" : "Set a city for nearer pickups"}
              </span>
            </>
          )}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 text-muted-foreground transition-transform group-hover:text-foreground",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
        />
      </button>
      <LocationPicker
        open={open}
        onOpenChange={setOpen}
        showDistance={showDistance}
        distance={distance}
        onApply={onApply}
        listingCounts={listingCounts}
      />
    </>
  );
}
