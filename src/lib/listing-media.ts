import type { Listing, ListingApprovalStatus } from "@/lib/types";

export const MAX_LISTING_IMAGES = 3;

export const DEFAULT_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1613771404784-3a5686aa7b8f?auto=format&fit=crop&w=800&q=80";

export function listingImages(listing: Pick<Listing, "image" | "images">): string[] {
  const fromArray = Array.isArray(listing.images)
    ? listing.images.filter(Boolean).slice(0, MAX_LISTING_IMAGES)
    : [];
  if (fromArray.length) return fromArray;
  return listing.image ? [listing.image] : [];
}

export function listingPrimaryImage(listing: Pick<Listing, "image" | "images">): string {
  return listingImages(listing)[0] || DEFAULT_LISTING_IMAGE;
}

export function isListingApproved(listing: Pick<Listing, "approvalStatus">): boolean {
  return (listing.approvalStatus ?? "approved") === "approved";
}

export function isListingPublic(listing: Pick<Listing, "sold" | "approvalStatus">): boolean {
  return !listing.sold && isListingApproved(listing);
}

export function normalizeListingImages(images: string[] | undefined, fallback?: string): string[] {
  const cleaned = (images ?? []).filter(Boolean).slice(0, MAX_LISTING_IMAGES);
  if (cleaned.length) return cleaned;
  return [fallback || DEFAULT_LISTING_IMAGE];
}

export async function fileToCompressedDataUrl(
  file: File,
  maxSide = 1200,
  quality = 0.72,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not process image.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

export function approvalLabel(status: ListingApprovalStatus | undefined): string {
  switch (status) {
    case "pending":
      return "Pending approval";
    case "rejected":
      return "Rejected";
    case "approved":
    default:
      return "Approved";
  }
}
