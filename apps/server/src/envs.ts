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

// AWS S3 / Cloudflare R2 Configuration
export const AWS_REGION = process.env.AWS_REGION || "auto"
export const AWS_ENDPOINT = process.env.AWS_ENDPOINT || ""
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ""
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ""
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ""
