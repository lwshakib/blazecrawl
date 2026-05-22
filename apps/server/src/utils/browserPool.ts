import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright"
import logger from "../logger/winston.logger.js"

class BrowserPool {
  private browser: Browser | null = null
  private initializing: Promise<Browser> | null = null

  /**
   * Returns the running Chromium browser instance or initializes it.
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser) return this.browser
    if (this.initializing) return this.initializing

    logger.info(
      "[BrowserPool] Initializing shared Chromium browser instance..."
    )
    this.initializing = chromium
      .launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      })
      .then((b) => {
        this.browser = b
        this.initializing = null
        logger.info(
          "[BrowserPool] Shared browser instance started successfully."
        )
        return b
      })
      .catch((err) => {
        this.initializing = null
        logger.error(
          "[BrowserPool] Failed to launch Chromium browser: " + err.message
        )
        throw err
      })

    return this.initializing
  }

  /**
   * Spawns an isolated browser context and page.
   */
  public async getPage(): Promise<{ context: BrowserContext; page: Page }> {
    const browser = await this.getBrowser()

    // Create an isolated context with realistic device properties
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "America/New_York",
      bypassCSP: true,
    })

    const page = await context.newPage()

    // Apply basic stealth fingerprinting
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false })
    })

    return { context, page }
  }

  /**
   * Gracefully closes the browser instance.
   */
  public async shutdown(): Promise<void> {
    if (this.browser) {
      logger.info("[BrowserPool] Shutting down shared browser instance...")
      await this.browser.close()
      this.browser = null
    }
  }
}

export const browserPool = new BrowserPool()
