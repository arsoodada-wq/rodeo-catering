type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window in-memory rate limiter, keyed by an arbitrary string (an
 * email, an IP address, etc). Deliberately simple: good enough for this
 * app's actual deployment shape (a single long-running Next.js server), but
 * each process has its own independent counters — a multi-instance
 * serverless deployment would need a shared store (e.g. Upstash Redis)
 * instead, since a limit could be bypassed by hitting a different instance.
 */
const buckets = new Map<string, Bucket>();

// Reclaim memory from keys that stopped being used, so an attacker cycling
// through many distinct emails/IPs can't grow this map forever. Swept
// opportunistically rather than on a timer, so it costs nothing when the
// app is idle.
function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): { allowed: boolean; retryAfterMs: number } {
  if (buckets.size > 5000) sweepExpired(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count < limit) {
    existing.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  return { allowed: false, retryAfterMs: existing.resetAt - now };
}

/** Test-only: clears all buckets so tests don't leak state into each other. */
export function _resetRateLimitsForTests() {
  buckets.clear();
}
