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
import { useStore } from "@/lib/store";
import { isListingApproved } from "@/lib/listing-media";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronRight, MapPin, Search } from "lucide-react";

function formatAds(n: number) {
  return `${n.toLocaleString()} ad${n === 1 ? "" : "s"}`;
}

export function locationSelectionLabel(ids: string[]) {
  if (ids.length === 0) return "All of Sri Lanka";
  if (ids.length === 1) {
    return MARKET_LOCATIONS.find((l) => l.id === ids[0])?.name ?? "1 location";
  }
  return `${ids.length} locations`;
}

type LocationPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Empty = All of Sri Lanka. Defaults to the saved locationId. */
  selectedIds?: string[];
  showDistance?: boolean;
  distance?: DistanceFilter;
  onApply?: (next: { locationIds: string[]; distance: DistanceFilter }) => void;
};

export function LocationPicker({
  open,
  onOpenChange,
  selectedIds,
  showDistance = false,
  distance = "any",
  onApply,
}: LocationPickerProps) {
  const { locationId, setLocationId } = useLocation();
  const { listings } = useStore();
  const initialIds = selectedIds ?? (locationId ? [locationId] : []);

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Set<string>>(() => new Set(initialIds));
  const [draftDistance, setDraftDistance] = useState<DistanceFilter>(distance);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setDraft(new Set(selectedIds ?? (locationId ? [locationId] : [])));
    setDraftDistance(distance);
    setActiveRegion(null);
  }, [open, selectedIds, locationId, distance]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const loc of MARKET_LOCATIONS) map[loc.id] = 0;
    for (const l of listings) {
      if (!isListingApproved(l) || !l.location) continue;
      if (map[l.location] != null) map[l.location] += 1;
    }
    return map;
  }, [listings]);

  const totalCount = useMemo(
    () => Object.values(counts).reduce((sum, n) => sum + n, 0),
    [counts],
  );

  const regions = useMemo(() => locationsByRegion(), []);

  const citiesInRegion = useMemo(() => {
    if (!activeRegion) return [];
    return MARKET_LOCATIONS.filter((l) => l.region === activeRegion);
  }, [activeRegion]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MARKET_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q),
    );
  }, [query]);

  const regionCount = (region: string) =>
    MARKET_LOCATIONS.filter((l) => l.region === region).reduce(
      (sum, l) => sum + (counts[l.id] ?? 0),
      0,
    );

  const regionCityIds = (region: string) =>
    MARKET_LOCATIONS.filter((l) => l.region === region).map((l) => l.id);

  const regionCheckState = (region: string): boolean | "indeterminate" => {
    const ids = regionCityIds(region);
    const selected = ids.filter((id) => draft.has(id)).length;
    if (selected === 0) return false;
    if (selected === ids.length) return true;
    return "indeterminate";
  };

  const toggleCity = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRegion = (region: string) => {
    const ids = regionCityIds(region);
    setDraft((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const selectAll = () => {
    setDraft(new Set());
    setDraftDistance("any");
  };

  const reset = () => {
    setDraft(new Set());
    setDraftDistance("any");
    setQuery("");
    setActiveRegion(null);
  };

  const apply = () => {
    const locationIds = Array.from(draft);
    const nextDistance = locationIds.length === 0 ? "any" : draftDistance;
    setLocationId(locationIds[0] ?? null);
    onApply?.({ locationIds, distance: nextDistance });
    onOpenChange(false);
  };

  const isAll = draft.size === 0;
  const searching = query.trim().length > 0;
  const draftLocation = getLocationById(Array.from(draft)[0]) ?? null;

  const renderCityRow = (loc: (typeof MARKET_LOCATIONS)[number]) => {
    const checked = draft.has(loc.id);
    return (
      <div
        key={loc.id}
        className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0"
      >
        <Checkbox
          checked={checked}
          onCheckedChange={() => toggleCity(loc.id)}
          aria-label={`Select ${loc.name}`}
        />
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
          onClick={() => toggleCity(loc.id)}
        >
          <span className="truncate text-[15px] font-medium text-foreground">{loc.name}</span>
          <span className="shrink-0 text-sm text-muted-foreground">
            {formatAds(counts[loc.id] ?? 0)}
          </span>
        </button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(640px,85vh)] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl",
        )}
      >
        <DialogTitle className="sr-only">Choose locations</DialogTitle>
        <DialogDescription className="sr-only">
          Search and select locations to filter marketplace listings.
        </DialogDescription>

        <div className="border-b border-border px-4 pb-3 pt-4 pr-12">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setActiveRegion(null);
              }}
              placeholder="Search for locations"
              className="h-11 rounded-xl border-border bg-muted/40 pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {searching ? (
            <div>
              <div className="px-4 pb-1 pt-4 text-base font-semibold">Locations</div>
              {searchResults.length === 0 ? (
                <p className="px-4 py-8 text-sm text-muted-foreground">
                  No locations match your search.
                </p>
              ) : (
                searchResults.map(renderCityRow)
              )}
            </div>
          ) : activeRegion ? (
            <div>
              <button
                type="button"
                onClick={() => setActiveRegion(null)}
                className="flex w-full items-center gap-2 border-b border-border px-4 py-3.5 text-left text-[15px] font-semibold hover:bg-muted/40"
              >
                <ArrowLeft className="h-4 w-4 text-primary" />
                {activeRegion}
              </button>
              {citiesInRegion.map(renderCityRow)}
            </div>
          ) : (
            <div>
              <div className="px-4 pb-1 pt-4 text-base font-semibold">Locations</div>

              <button
                type="button"
                onClick={selectAll}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors",
                  isAll ? "bg-primary/10" : "hover:bg-muted/40",
                )}
              >
                <span className={cn("text-[15px] font-medium", isAll && "text-primary")}>
                  All of Sri Lanka
                </span>
                <span className="text-sm text-muted-foreground">{formatAds(totalCount)}</span>
              </button>

              {regions.map(({ region }) => {
                const state = regionCheckState(region);
                return (
                  <div
                    key={region}
                    className="flex items-center gap-2 border-t border-border px-4 py-3.5"
                  >
                    <Checkbox
                      checked={state}
                      onCheckedChange={() => toggleRegion(region)}
                      aria-label={`Select ${region}`}
                    />
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                      onClick={() => setActiveRegion(region)}
                    >
                      <span className="truncate text-[15px] font-medium text-foreground">
                        {region}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                        {formatAds(regionCount(region))}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showDistance && draft.size > 0 && (
          <div className="border-t border-border bg-muted/25 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Travel radius
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              How far from {draftLocation?.name ?? "your selection"} are you willing to go?
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

        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            className="min-w-[7.5rem] border-primary text-primary hover:bg-primary/10 hover:text-primary"
          >
            Reset
          </Button>
          <Button type="button" onClick={apply} className="min-w-[7.5rem]">
            Show
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
  selectedIds?: string[];
  onApply?: (next: { locationIds: string[]; distance: DistanceFilter }) => void;
  /** Compact control for the site nav. */
  compact?: boolean;
};

export function LocationTrigger({
  className,
  showDistance = false,
  distance = "any",
  selectedIds,
  onApply,
  compact = false,
}: LocationTriggerProps) {
  const { location, locationId } = useLocation();
  const [open, setOpen] = useState(false);
  const ids = selectedIds ?? (locationId ? [locationId] : []);
  const label = selectedIds
    ? locationSelectionLabel(selectedIds)
    : formatShoppingNear(location, showDistance ? distance : "any");

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
            : "w-full rounded-2xl border border-border/80 bg-card/80 px-4 py-3 hover:border-primary/35 hover:bg-card",
          className,
        )}
      >
        <MapPin
          className={cn(
            "shrink-0 text-primary",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            ids.length > 0 && "fill-primary/15",
          )}
        />
        <span className="min-w-0 flex-1 truncate">
          {compact ? (
            <span className="font-medium">{locationSelectionLabel(ids)}</span>
          ) : (
            <>
              <span className="block text-sm font-semibold leading-tight">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {ids.length > 0
                  ? "Tap to change cities or radius"
                  : "Choose locations to filter listings"}
              </span>
            </>
          )}
        </span>
        <ChevronRight
          className={cn(
            "shrink-0 text-muted-foreground transition-colors group-hover:text-foreground",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
        />
      </button>
      <LocationPicker
        open={open}
        onOpenChange={setOpen}
        selectedIds={ids}
        showDistance={showDistance}
        distance={distance}
        onApply={onApply}
      />
    </>
  );
}
