import express, { type Express } from "express"
import cors from "cors"
import helmet from "helmet"
import { rateLimiter } from "./middlewares/rateLimit.middleware.js"
import { CORS_ORIGIN } from "./envs.js"
import morganMiddleware from "./logger/morgan.logger.js"
import { errorHandler } from "./middlewares/error.middlewares.js"
import { ApiResponse } from "./utils/ApiResponse.js"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"

const app: Express = express()

// Global Middlewares
app.use(helmet()) // Security headers
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
)
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(morganMiddleware) // HTTP request logging

// Rate Limiting (Applied to all API routes)
app.use("/api", rateLimiter(100, 900)) // 100 requests per 15 minutes

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json(new ApiResponse(200, null, "Server is healthy"))
})

// Auth Routes
app.use("/api/auth", authRoutes)

// Error Handling Middleware (must be last)
app.use(errorHandler)

export { app }
