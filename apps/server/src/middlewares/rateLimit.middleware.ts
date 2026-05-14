import type { Request, Response, NextFunction, RequestHandler } from "express"
import redis from "../db/redis.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

/**
 * Redis-based Rate Limiter Middleware.
 * Uses a Fixed Window algorithm with a Lua script for atomicity.
 * 
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSeconds - Duration of the window in seconds
 */
export const rateLimiter = (limit: number = 100, windowSeconds: number = 900): RequestHandler => 
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Generate a unique key based on the user's IP (or user ID if available)
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress
    const key = `rate_limit:${ip}`

    /**
     * Lua script for atomic increment and expire.
     * KEYS[1] - The rate limit key
     * ARGV[1] - Window duration in seconds
     */
    const luaScript = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end
      return current
    `

    // Execute the Lua script atomically
    const count = await redis.eval(luaScript, 1, key, windowSeconds) as number

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", limit)
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count))

    if (count > limit) {
      throw new ApiError(429, "Too many requests, please try again later")
    }

    next()
  })
