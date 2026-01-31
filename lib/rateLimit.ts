type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

const requests = new Map<string, number>();
const WINDOW_MS = 1000;

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const last = requests.get(identifier) ?? 0;
  const elapsed = now - last;
  if (elapsed < WINDOW_MS) {
    return { allowed: false, retryAfterMs: WINDOW_MS - elapsed };
  }
  requests.set(identifier, now);
  return { allowed: true, retryAfterMs: 0 };
}
