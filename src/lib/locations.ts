export type MarketLocation = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
};

/** Pickup cities for marketplace proximity matching (Sri Lanka). */
export const MARKET_LOCATIONS: MarketLocation[] = [
  { id: "colombo", name: "Colombo", region: "Western", lat: 6.9271, lng: 79.8612 },
  { id: "dehiwala", name: "Dehiwala-Mount Lavinia", region: "Western", lat: 6.84, lng: 79.88 },
  { id: "nugegoda", name: "Nugegoda", region: "Western", lat: 6.8649, lng: 79.8997 },
  { id: "kotte", name: "Sri Jayawardenepura Kotte", region: "Western", lat: 6.9022, lng: 79.8612 },
  { id: "negombo", name: "Negombo", region: "Western", lat: 7.2083, lng: 79.8358 },
  { id: "gampaha", name: "Gampaha", region: "Western", lat: 7.0917, lng: 79.9942 },
  { id: "kalutara", name: "Kalutara", region: "Western", lat: 6.5854, lng: 79.9607 },
  { id: "kandy", name: "Kandy", region: "Central", lat: 7.2906, lng: 80.6337 },
  { id: "matale", name: "Matale", region: "Central", lat: 7.4675, lng: 80.6234 },
  { id: "nuwara-eliya", name: "Nuwara Eliya", region: "Central", lat: 6.9497, lng: 80.7891 },
  { id: "galle", name: "Galle", region: "Southern", lat: 6.0535, lng: 80.221 },
  { id: "matara", name: "Matara", region: "Southern", lat: 5.9549, lng: 80.555 },
  { id: "hambantota", name: "Hambantota", region: "Southern", lat: 6.1244, lng: 81.1185 },
  { id: "jaffna", name: "Jaffna", region: "Northern", lat: 9.6615, lng: 80.0255 },
  { id: "vavuniya", name: "Vavuniya", region: "Northern", lat: 8.7514, lng: 80.4971 },
  { id: "trincomalee", name: "Trincomalee", region: "Eastern", lat: 8.5874, lng: 81.2152 },
  { id: "batticaloa", name: "Batticaloa", region: "Eastern", lat: 7.7102, lng: 81.6924 },
  { id: "anuradhapura", name: "Anuradhapura", region: "North Central", lat: 8.3114, lng: 80.4037 },
  { id: "polonnaruwa", name: "Polonnaruwa", region: "North Central", lat: 7.9403, lng: 81.0188 },
  { id: "kurunegala", name: "Kurunegala", region: "North Western", lat: 7.4863, lng: 80.3623 },
  { id: "puttalam", name: "Puttalam", region: "North Western", lat: 8.0362, lng: 79.8283 },
  { id: "ratnapura", name: "Ratnapura", region: "Sabaragamuwa", lat: 6.7056, lng: 80.3847 },
  { id: "kegalle", name: "Kegalle", region: "Sabaragamuwa", lat: 7.2513, lng: 80.3464 },
  { id: "badulla", name: "Badulla", region: "Uva", lat: 6.9934, lng: 81.055 },
  { id: "monaragala", name: "Monaragala", region: "Uva", lat: 6.8728, lng: 81.3507 },
];

export type DistanceFilter = "any" | "same-city" | "25" | "50" | "100";

export const DISTANCE_OPTIONS: { value: DistanceFilter; label: string }[] = [
  { value: "any", label: "Anywhere" },
  { value: "same-city", label: "Same city" },
  { value: "25", label: "Within 25 km" },
  { value: "50", label: "Within 50 km" },
  { value: "100", label: "Within 100 km" },
];

export function getLocationById(id: string | undefined | null): MarketLocation | undefined {
  if (!id) return undefined;
  return MARKET_LOCATIONS.find((l) => l.id === id);
}

export function locationLabel(id: string | undefined | null): string {
  return getLocationById(id)?.name ?? "Location TBD";
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in km between two coordinates. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function distanceBetweenLocationsKm(
  fromId: string | undefined | null,
  toId: string | undefined | null,
): number | null {
  const from = getLocationById(fromId);
  const to = getLocationById(toId);
  if (!from || !to) return null;
  return haversineKm(from, to);
}

export function formatDistanceKm(km: number | null): string | null {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) return "Same area";
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export function matchesDistanceFilter(
  userLocationId: string | undefined | null,
  listingLocationId: string | undefined | null,
  filter: DistanceFilter,
): boolean {
  if (filter === "any") return true;
  if (!userLocationId) return true;
  if (!listingLocationId) return false;
  if (filter === "same-city") return userLocationId === listingLocationId;
  const km = distanceBetweenLocationsKm(userLocationId, listingLocationId);
  if (km == null) return false;
  const max = Number(filter);
  return km <= max;
}
