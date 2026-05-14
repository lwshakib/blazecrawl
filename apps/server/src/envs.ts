import dotenv from "dotenv"

// Load .env file if it exists
dotenv.config()

/**
 * Application environment configuration.
 */
export const NODE_ENV = process.env.NODE_ENV || "development"
export const PORT = Number(process.env.PORT) || 8000
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*"

// Database and Redis Configuration
export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/blazecrawl"
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
