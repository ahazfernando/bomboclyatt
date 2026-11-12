"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { MARKET_LOCATIONS, type MarketLocation } from "@/lib/locations";
import { isListingApproved } from "@/lib/listing-media";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Empty array = All of Sri Lanka */
  selectedIds: string[];
  onApply: (ids: string[]) => void;
};

function regionOrder(locations: MarketLocation[]) {
  const seen: string[] = [];
  for (const loc of locations) {
    if (!seen.includes(loc.region)) seen.push(loc.region);
  }
  return seen;
}

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

export function LocationPickerDialog({ open, onOpenChange, selectedIds, onApply }: Props) {
  const { listings } = useStore();
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selectedIds));
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(new Set(selectedIds));
    setQuery("");
    setActiveRegion(null);
  }, [open, selectedIds]);

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

  const regions = useMemo(() => regionOrder(MARKET_LOCATIONS), []);

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

  const selectAll = () => setDraft(new Set());

  const reset = () => {
    setDraft(new Set());
    setQuery("");
    setActiveRegion(null);
  };

  const show = () => {
    onApply(Array.from(draft));
    onOpenChange(false);
  };

  const isAll = draft.size === 0;
  const searching = query.trim().length > 0;

  const renderCityRow = (loc: MarketLocation) => {
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
                <p className="px-4 py-8 text-sm text-muted-foreground">No locations match your search.</p>
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

              {regions.map((region) => {
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

        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            className="min-w-[7.5rem] border-primary text-primary hover:bg-primary/10 hover:text-primary"
          >
            Reset
          </Button>
          <Button type="button" onClick={show} className="min-w-[7.5rem]">
            Show
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
