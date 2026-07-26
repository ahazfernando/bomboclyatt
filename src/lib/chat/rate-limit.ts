const RATE_WINDOW_MS = 60_000;
const RATE_MAX_MESSAGES = 30;

const socketBuckets = new Map<string, number[]>();

export function checkSocketRateLimit(userId: string, maxPer10s = 10): boolean {
  const now = Date.now();
  const windowStart = now - 10_000;
  const timestamps = (socketBuckets.get(userId) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= maxPer10s) return false;
  timestamps.push(now);
  socketBuckets.set(userId, timestamps);
  return true;
}

export async function checkDbRateLimit(
  senderId: string,
  countRecent: (senderId: string, windowMs: number) => Promise<number>
): Promise<boolean> {
  const recent = await countRecent(senderId, RATE_WINDOW_MS);
  return recent < RATE_MAX_MESSAGES;
}

export const RATE_LIMITS = {
  socketMaxPer10s: 10,
  dbMaxPerMinute: RATE_MAX_MESSAGES,
  dbWindowMs: RATE_WINDOW_MS,
};
