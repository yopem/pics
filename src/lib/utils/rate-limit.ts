import "server-only"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  // Clean up expired entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetAt < now) {
        rateLimitMap.delete(k)
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    const resetAt = now + config.windowMs
    rateLimitMap.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    }
  }

  if (entry.count < config.maxRequests) {
    // Increment counter
    entry.count++
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    }
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
  }
}

/**
 * Rate limit configurations for different operations
 */
export const RATE_LIMITS = {
  BACKGROUND_REMOVAL: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  EXPORT: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  PROJECT_SAVE: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  },
} as const
