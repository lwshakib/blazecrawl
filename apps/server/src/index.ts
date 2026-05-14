import { app } from "./app.js"
import { PORT } from "./envs.js"
import logger from "./logger/winston.logger.js"

/**
 * Starts the Express server.
 */
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`⚙️  Server is running at http://localhost:${PORT}`)
    })

    // Handle graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`)
      server.close(() => {
        logger.info("Closed out remaining connections.")
        process.exit(0)
      })
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"))
    process.on("SIGINT", () => shutdown("SIGINT"))
  } catch (error) {
    logger.error("Failed to start the server:", error)
    process.exit(1)
  }
}

// Global error handlers for uncaught exceptions and rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception thrown:", error)
  process.exit(1)
})

startServer()
