import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

/**
 * Check if KV credentials are available
 */
function hasKVCredentials(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

/**
 * Rate limiter: 5 requests per 60 seconds per IP
 * Only active when KV credentials are available
 */
export const ratelimit = hasKVCredentials()
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : null;

/**
 * Mock rate limiter for local development without KV
 */
const mockRateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(identifier: string) {
  // Use real rate limiter if available
  if (ratelimit) {
    return await ratelimit.limit(identifier);
  }

  // Mock rate limiter for local dev
  const now = Date.now();
  const windowMs = 60 * 1000; // 60 seconds
  const limit = 5;

  const existing = mockRateLimitMap.get(identifier);

  if (!existing || now > existing.resetTime) {
    // Create new window
    const resetTime = now + windowMs;
    mockRateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    };
  }

  // Within existing window
  if (existing.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: existing.resetTime,
    };
  }

  // Increment count
  existing.count++;
  mockRateLimitMap.set(identifier, existing);

  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    reset: existing.resetTime,
  };
}
