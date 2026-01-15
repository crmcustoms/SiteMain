import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

let ratelimit: Ratelimit | null = null

function getRatelimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!ratelimit) {
    const redis = new Redis({ url, token })
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
    })
  }
  return ratelimit
}

export async function checkRateLimit(key: string) {
  const limiter = getRatelimit()
  if (!limiter) {
    return { ok: true, remaining: null, reset: null, limited: false }
  }
  const result = await limiter.limit(key)
  return {
    ok: result.success,
    remaining: result.remaining,
    reset: result.reset,
    limited: !result.success,
  }
}
