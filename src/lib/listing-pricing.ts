export function listingDiscountPercent(price: number, compareAtPrice?: number): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function effectiveListingPrice(price: number, compareAtPrice?: number): number {
  return price;
}
