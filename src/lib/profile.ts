export const VERIFICATION_BADGE_PRICE = 19.99;

export const MAX_BUSINESS_DOCUMENTS = 5;

export function normalizeUsername(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 24);
}

export function isValidUsername(value: string): boolean {
  const u = normalizeUsername(value);
  return u.length >= 3 && /^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/.test(u);
}
