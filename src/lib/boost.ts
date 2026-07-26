import type { Listing } from "@/lib/types";

export const BOOST_PLANS = [
  { id: "7d", label: "7 days", days: 7, pricePerListing: 4.99 },
  { id: "14d", label: "14 days", days: 14, pricePerListing: 8.99 },
  { id: "30d", label: "30 days", days: 30, pricePerListing: 14.99 },
] as const;

export type BoostPlanId = (typeof BOOST_PLANS)[number]["id"];

export function getBoostPlan(planId: BoostPlanId) {
  return BOOST_PLANS.find((p) => p.id === planId)!;
}

export function isListingBoosted(listing: Listing): boolean {
  if (!listing.boostedUntil) return false;
  return new Date(listing.boostedUntil) > new Date();
}

export function getBoostTimeRemaining(listing: Listing): string | null {
  if (!isListingBoosted(listing) || !listing.boostedUntil) return null;
  const ms = new Date(listing.boostedUntil).getTime() - Date.now();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(ms / (1000 * 60));
  return `${mins}m left`;
}

export function calculateBoostTotal(listingCount: number, planId: BoostPlanId): number {
  const plan = getBoostPlan(planId);
  return Math.round(plan.pricePerListing * listingCount * 100) / 100;
}

export function computeBoostedUntil(planId: BoostPlanId, existingUntil?: string): string {
  const plan = getBoostPlan(planId);
  const now = Date.now();
  const base =
    existingUntil && new Date(existingUntil) > new Date(now)
      ? new Date(existingUntil).getTime()
      : now;
  return new Date(base + plan.days * 24 * 60 * 60 * 1000).toISOString();
}

/** Sort boosted (active) listings first, then apply secondary sort within each group. */
export function sortListingsWithBoost<T extends Listing>(
  listings: T[],
  secondarySort: (a: T, b: T) => number
): T[] {
  const boosted: T[] = [];
  const regular: T[] = [];
  for (const l of listings) {
    if (isListingBoosted(l)) boosted.push(l);
    else regular.push(l);
  }
  boosted.sort((a, b) => secondarySort(a, b));
  regular.sort(secondarySort);
  return [...boosted, ...regular];
}
