import { Redis } from "ioredis"
import { REDIS_URL } from "../envs.js"
import logger from "../logger/winston.logger.js"

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
})

redis.on("connect", () => {
  logger.info("Connected to Redis successfully")
})

redis.on("error", (err) => {
  logger.error("Redis connection error:", err)
})

export default redis
